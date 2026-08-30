/**
 * reminder.service.js — Reminder & Daily Routine business logic (B6)
 *
 * No Express imports. All functions throw AppError on failure.
 *
 * Key design decisions:
 * - Reminder definition (reminders) is separate from occurrences (reminderLogs).
 * - Authorization is verified inside service functions using canAccessPatient
 *   from utils/authorization.js (B3 reuse) when called from controllers that
 *   haven't already applied the middleware. For reminder-specific endpoints,
 *   middleware handles auth and the service trusts the resolved patientId.
 * - Concurrency: completeLog/skipLog use atomic findOneAndUpdate with a status
 *   guard, preventing duplicate completion from concurrent requests.
 * - Idempotency: computeNextOccurrenceDate + the unique index on
 *   (reminderId, scheduledAt) for active statuses prevents duplicate logs.
 */

import mongoose from 'mongoose';
import Reminder from './reminder.model.js';
import ReminderLog, { LOG_STATUSES } from './reminderLog.model.js';
import { AppError } from '../../utils/AppError.js';
import { emitNotificationEvent } from '../notifications/notification.events.js';

// ── Constants ─────────────────────────────────────────────────────────────────

// Grace period in minutes — after this many minutes past scheduledAt the
// occurrence is considered MISSED if still SCHEDULED.
// Assumption: 60-minute grace period. This is kept configurable here.
const MISSED_GRACE_PERIOD_MINUTES = 60;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convert a "HH:MM" time string and an IANA timezone to a UTC Date for a given
 * reference date. Uses native Intl.DateTimeFormat to correctly handle DST.
 *
 * Strategy:
 *   1. Parse the reference date's year/month/day in the patient's timezone.
 *   2. Combine that local date with the HH:MM time.
 *   3. Interpret the resulting local datetime in the IANA timezone and return UTC.
 *
 * @param {string} time       - "HH:MM"
 * @param {string} timezone   - IANA timezone identifier
 * @param {Date}   refDate    - the UTC date to use as the reference calendar day
 * @returns {Date}            UTC Date representing that local time on that day
 */
function localTimeToUtc(time, timezone, refDate) {
  const [hours, minutes] = time.split(':').map(Number);

  // Get the year/month/day in the patient's timezone for the reference date
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(refDate);

  const year = parseInt(parts.find((p) => p.type === 'year').value, 10);
  const month = parseInt(parts.find((p) => p.type === 'month').value, 10) - 1; // 0-indexed
  const day = parseInt(parts.find((p) => p.type === 'day').value, 10);

  // Build an ISO string in the patient's local timezone and parse to UTC.
  // We use a trick: create an ISO string without timezone suffix to be parsed
  // as if it were UTC, then adjust using the actual UTC offset for that timezone
  // at that moment.

  // Get the UTC offset for the timezone at the given reference date (handles DST)
  const testDate = new Date(Date.UTC(year, month, day, hours, minutes, 0));
  const utcOffset = getUtcOffsetMinutes(timezone, testDate);

  // Apply offset: local = UTC + offset → UTC = local - offset
  return new Date(testDate.getTime() - utcOffset * 60 * 1000);
}

/**
 * Get the UTC offset in minutes for a given IANA timezone at a given Date.
 * Positive means ahead of UTC (e.g. Asia/Kolkata = +330).
 *
 * Uses the Intl API to determine the actual offset, including DST.
 *
 * @param {string} timezone
 * @param {Date}   date
 * @returns {number} offset in minutes
 */
function getUtcOffsetMinutes(timezone, date) {
  // Format the date in the target timezone to get all time parts
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type) => parseInt(parts.find((p) => p.type === type).value, 10);

  let h = get('hour');
  // Intl hour12:false returns 24 for midnight in some locales — normalise
  if (h === 24) h = 0;

  const localMs = Date.UTC(get('year'), get('month') - 1, get('day'), h, get('minute'), get('second'));

  return Math.round((localMs - date.getTime()) / 60000);
}

/**
 * Compute the next occurrence UTC date for a reminder after a given reference date.
 * Returns null if the reminder has expired (endDate passed or one-time already done).
 *
 * @param {object} reminder - lean Reminder document
 * @param {Date}   after    - compute the next occurrence strictly after this UTC date
 * @returns {Date|null}
 */
export function computeNextOccurrence(reminder, after) {
  const { schedule, recurrence, timezone, endDate, isActive } = reminder;

  if (!isActive) return null;

  const now = after ?? new Date();

  // ── One-time reminder ──────────────────────────────────────────────────────
  if (!recurrence) {
    const scheduledAt = schedule.startAt ? new Date(schedule.startAt) : null;
    if (!scheduledAt) return null;
    // Only return if it is in the future relative to `after`
    return scheduledAt > now ? scheduledAt : null;
  }

  // ── Recurring reminder ─────────────────────────────────────────────────────
  const { frequency, interval, weekdays } = recurrence;
  const recurEndDate = recurrence.endDate ? new Date(recurrence.endDate) : null;
  const globalEndDate = endDate ? new Date(endDate) : null;

  // Earliest valid date to search from
  const searchFrom = schedule.startAt && new Date(schedule.startAt) > now
    ? new Date(schedule.startAt)
    : now;

  // Start iterating from searchFrom, advancing by frequency unit
  let candidate = new Date(searchFrom);

  // We iterate up to 2 years into the future to avoid infinite loops
  const limit = new Date(now);
  limit.setFullYear(limit.getFullYear() + 2);

  while (candidate <= limit) {
    let nextDate = null;

    switch (frequency) {
      case 'DAILY': {
        // Next occurrence is today (candidate day) or the next day(s) by interval
        const occUtc = localTimeToUtc(schedule.time, timezone, candidate);
        if (occUtc > now) {
          nextDate = occUtc;
        } else {
          // advance by interval days and try again
          candidate.setUTCDate(candidate.getUTCDate() + interval);
          continue;
        }
        break;
      }

      case 'WEEKLY': {
        // Find the next weekday in the list from candidate
        if (!weekdays || weekdays.length === 0) return null;

        // Get candidate's weekday in the patient's timezone
        const dayInTz = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          weekday: 'short',
        }).format(candidate);
        const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        const candidateWeekday = dayMap[dayInTz.slice(0, 3)];

        // Find the nearest weekday on or after candidate
        let daysUntilNext = 7; // max look-ahead
        for (const wd of weekdays) {
          const diff = (wd - candidateWeekday + 7) % 7;
          if (diff < daysUntilNext) daysUntilNext = diff;
        }

        const targetDate = new Date(candidate);
        targetDate.setUTCDate(targetDate.getUTCDate() + daysUntilNext);
        const occUtc = localTimeToUtc(schedule.time, timezone, targetDate);

        if (occUtc > now) {
          nextDate = occUtc;
        } else {
          candidate.setUTCDate(candidate.getUTCDate() + 1);
          continue;
        }
        break;
      }

      case 'MONTHLY': {
        const occUtc = localTimeToUtc(schedule.time, timezone, candidate);
        if (occUtc > now) {
          nextDate = occUtc;
        } else {
          candidate.setUTCMonth(candidate.getUTCMonth() + interval);
          continue;
        }
        break;
      }

      default:
        return null;
    }

    if (!nextDate) break;

    // Check against end dates
    if (recurEndDate && nextDate > recurEndDate) return null;
    if (globalEndDate && nextDate > globalEndDate) return null;

    return nextDate;
  }

  return null;
}

/**
 * Format a Reminder document for API responses.
 * @param {object} doc - lean Reminder document
 * @returns {object}
 */
function formatReminder(doc) {
  return {
    id: doc._id.toString(),
    patientId: doc.patientId.toString(),
    createdBy: doc.createdBy.toString(),
    title: doc.title,
    description: doc.description ?? null,
    type: doc.type,
    schedule: doc.schedule,
    timezone: doc.timezone,
    recurrence: doc.recurrence ?? null,
    isActive: doc.isActive,
    voiceEnabled: doc.voiceEnabled,
    startDate: doc.startDate ?? null,
    endDate: doc.endDate ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Format a ReminderLog document for API responses.
 * @param {object} doc - lean ReminderLog document (reminderId may be populated)
 * @returns {object}
 */
function formatLog(doc) {
  const reminderInfo =
    doc.reminderId && typeof doc.reminderId === 'object' && doc.reminderId.title
      ? {
          id: doc.reminderId._id.toString(),
          title: doc.reminderId.title,
          type: doc.reminderId.type,
        }
      : { id: doc.reminderId?.toString() ?? null };

  return {
    id: doc._id.toString(),
    reminder: reminderInfo,
    patientId: doc.patientId.toString(),
    scheduledAt: doc.scheduledAt,
    deliveredAt: doc.deliveredAt ?? null,
    acknowledgedAt: doc.acknowledgedAt ?? null,
    completedAt: doc.completedAt ?? null,
    completedBy: doc.completedBy?.toString() ?? null,
    status: doc.status,
    note: doc.note ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * Determine the current "live" status of a ReminderLog based on its scheduled
 * time and the grace period. Returns the effective status string.
 *
 * @param {object} log - lean ReminderLog document
 * @returns {string} effective status
 */
function resolveLogStatus(log) {
  if (log.status !== 'SCHEDULED') return log.status;

  const now = new Date();
  const scheduled = new Date(log.scheduledAt);
  const gracePeriodMs = MISSED_GRACE_PERIOD_MINUTES * 60 * 1000;

  if (now > new Date(scheduled.getTime() + gracePeriodMs)) {
    return 'MISSED';
  }

  if (now >= scheduled) {
    return 'DUE';
  }

  return 'UPCOMING';
}

// ── Reminder CRUD ─────────────────────────────────────────────────────────────

/**
 * Create a new reminder for a patient.
 *
 * patientId comes from the authenticated context (req.user for PATIENT role,
 * or a validated param for CAREGIVER). createdById is always req.user.id.
 *
 * @param {string} patientId    - The patient this reminder belongs to
 * @param {string} createdById  - The user creating it (patient or caregiver)
 * @param {object} data         - Validated reminder data
 * @returns {Promise<object>}
 */
export async function createReminder(patientId, createdById, data) {
  const reminder = await Reminder.create({
    ...data,
    patientId: new mongoose.Types.ObjectId(patientId),
    createdBy: new mongoose.Types.ObjectId(createdById),
    isActive: true,
  });

  // Schedule the first occurrence if applicable
  const nextOcc = computeNextOccurrence(reminder.toObject(), new Date());
  if (nextOcc) {
    try {
      await ReminderLog.create({
        reminderId: reminder._id,
        patientId: reminder.patientId,
        scheduledAt: nextOcc,
        status: 'SCHEDULED',
      });
    } catch (err) {
      // Duplicate key: occurrence already exists (idempotent scheduler)
      if (err.code !== 11000) throw err;
    }
  }

  return formatReminder(reminder.toObject());
}

/**
 * List reminders for a patient with optional filtering and pagination.
 *
 * @param {string} patientId
 * @param {{ type?: string, isActive?: boolean, page: number, limit: number }} filters
 * @returns {Promise<{ reminders: object[], pagination: object }>}
 */
export async function listReminders(patientId, filters) {
  const query = { patientId: new mongoose.Types.ObjectId(patientId) };

  if (filters.type !== undefined) query.type = filters.type;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;

  const { page, limit } = filters;
  const skip = (page - 1) * limit;

  const [reminders, total] = await Promise.all([
    Reminder.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Reminder.countDocuments(query),
  ]);

  return {
    reminders: reminders.map(formatReminder),
    pagination: { page, limit, total },
  };
}

/**
 * Get a single reminder by ID.
 * The caller must have already verified authorization.
 *
 * @param {string} reminderId
 * @param {string} patientId - used to double-check ownership at DB level
 * @returns {Promise<object>}
 */
export async function getReminder(reminderId, patientId) {
  const reminder = await Reminder.findOne({
    _id: new mongoose.Types.ObjectId(reminderId),
    patientId: new mongoose.Types.ObjectId(patientId),
  }).lean();

  if (!reminder) {
    throw new AppError('Reminder not found', 404, 'NOT_FOUND');
  }

  return formatReminder(reminder);
}

/**
 * Update a reminder (PATCH semantics).
 * patientId guard prevents updating another patient's reminder.
 *
 * @param {string} reminderId
 * @param {string} patientId
 * @param {object} data - validated update fields
 * @returns {Promise<object>}
 */
export async function updateReminder(reminderId, patientId, data) {
  // Prevent changing patientId or createdBy
  delete data.patientId;
  delete data.createdBy;

  const reminder = await Reminder.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(reminderId),
      patientId: new mongoose.Types.ObjectId(patientId),
    },
    { $set: data },
    { returnDocument: 'after', runValidators: true }
  ).lean();

  if (!reminder) {
    throw new AppError('Reminder not found', 404, 'NOT_FOUND');
  }

  return formatReminder(reminder);
}

/**
 * Deactivate (soft-delete) a reminder.
 * Future occurrences will no longer be generated.
 * Existing SCHEDULED logs are cancelled.
 *
 * @param {string} reminderId
 * @param {string} patientId
 * @returns {Promise<void>}
 */
export async function deleteReminder(reminderId, patientId) {
  const reminder = await Reminder.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(reminderId),
      patientId: new mongoose.Types.ObjectId(patientId),
    },
    { $set: { isActive: false } },
    { returnDocument: 'after' }
  ).lean();

  if (!reminder) {
    throw new AppError('Reminder not found', 404, 'NOT_FOUND');
  }

  // Cancel any remaining SCHEDULED occurrences
  await ReminderLog.updateMany(
    {
      reminderId: new mongoose.Types.ObjectId(reminderId),
      status: 'SCHEDULED',
    },
    { $set: { status: 'CANCELLED' } }
  );
}

// ── Occurrence Actions ────────────────────────────────────────────────────────

/**
 * Complete a reminder occurrence.
 *
 * If a logId is provided, completes that specific occurrence.
 * If no logId, completes the most recent SCHEDULED/DUE occurrence.
 *
 * Concurrency-safe: uses atomic findOneAndUpdate with status guard.
 *
 * @param {string} reminderId
 * @param {string} patientId
 * @param {string} completedById - req.user.id
 * @param {{ logId?: string, note?: string }} options
 * @returns {Promise<object>} updated ReminderLog
 */
export async function completeReminder(reminderId, patientId, completedById, options = {}) {
  // Verify the reminder belongs to this patient
  const reminder = await Reminder.findOne({
    _id: new mongoose.Types.ObjectId(reminderId),
    patientId: new mongoose.Types.ObjectId(patientId),
  }).lean();

  if (!reminder) {
    throw new AppError('Reminder not found', 404, 'NOT_FOUND');
  }

  // Build the query for the log to complete
  const logQuery = {
    reminderId: new mongoose.Types.ObjectId(reminderId),
    status: { $in: ['SCHEDULED', 'DELIVERED', 'ACKNOWLEDGED'] },
  };

  if (options.logId) {
    logQuery._id = new mongoose.Types.ObjectId(options.logId);
  }

  // Atomic update — prevents two concurrent requests from both completing
  const log = await ReminderLog.findOneAndUpdate(
    logQuery,
    {
      $set: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: new mongoose.Types.ObjectId(completedById),
        ...(options.note !== undefined ? { note: options.note } : {}),
      },
    },
    { returnDocument: 'after', sort: { scheduledAt: 1 } }
  ).lean();

  if (!log) {
    // Check if reminder is inactive or already completed
    const existingLog = options.logId
      ? await ReminderLog.findById(options.logId).lean()
      : await ReminderLog.findOne({
          reminderId: new mongoose.Types.ObjectId(reminderId),
        })
          .sort({ scheduledAt: -1 })
          .lean();

    if (!existingLog) {
      throw new AppError('No pending reminder occurrence found', 404, 'NOT_FOUND');
    }
    if (existingLog.status === 'COMPLETED') {
      throw new AppError(
        'This reminder occurrence has already been completed',
        409,
        'ALREADY_COMPLETED'
      );
    }
    if (existingLog.status === 'CANCELLED') {
      throw new AppError(
        'This reminder occurrence was cancelled and cannot be completed',
        409,
        'INVALID_STATE'
      );
    }
    throw new AppError(
      `Reminder occurrence cannot be completed — current status is ${existingLog.status}`,
      409,
      'INVALID_STATE'
    );
  }

  // Schedule the next occurrence for recurring reminders
  if (reminder.recurrence && reminder.isActive) {
    const nextOcc = computeNextOccurrence(reminder, log.scheduledAt);
    if (nextOcc) {
      try {
        await ReminderLog.create({
          reminderId: reminder._id,
          patientId: reminder.patientId,
          scheduledAt: nextOcc,
          status: 'SCHEDULED',
        });
      } catch (err) {
        if (err.code !== 11000) throw err; // Ignore duplicate key — idempotent
      }
    }
  }

  return formatLog(log);
}

/**
 * Skip (dismiss) a reminder occurrence.
 * Records as CANCELLED with an optional note.
 *
 * Concurrency-safe: uses atomic findOneAndUpdate with status guard.
 *
 * @param {string} reminderId
 * @param {string} patientId
 * @param {string} skippedById - req.user.id
 * @param {{ logId?: string, note?: string }} options
 * @returns {Promise<object>} updated ReminderLog
 */
export async function skipReminder(reminderId, patientId, skippedById, options = {}) {
  const reminder = await Reminder.findOne({
    _id: new mongoose.Types.ObjectId(reminderId),
    patientId: new mongoose.Types.ObjectId(patientId),
  }).lean();

  if (!reminder) {
    throw new AppError('Reminder not found', 404, 'NOT_FOUND');
  }

  const logQuery = {
    reminderId: new mongoose.Types.ObjectId(reminderId),
    status: { $in: ['SCHEDULED', 'DELIVERED', 'ACKNOWLEDGED'] },
  };

  if (options.logId) {
    logQuery._id = new mongoose.Types.ObjectId(options.logId);
  }

  const log = await ReminderLog.findOneAndUpdate(
    logQuery,
    {
      $set: {
        status: 'CANCELLED',
        completedAt: new Date(),
        completedBy: new mongoose.Types.ObjectId(skippedById),
        ...(options.note !== undefined ? { note: options.note } : {}),
      },
    },
    { returnDocument: 'after', sort: { scheduledAt: 1 } }
  ).lean();

  if (!log) {
    throw new AppError('No pending reminder occurrence found to skip', 404, 'NOT_FOUND');
  }

  // Schedule the next occurrence for recurring reminders after a skip
  if (reminder.recurrence && reminder.isActive) {
    const nextOcc = computeNextOccurrence(reminder, log.scheduledAt);
    if (nextOcc) {
      try {
        await ReminderLog.create({
          reminderId: reminder._id,
          patientId: reminder.patientId,
          scheduledAt: nextOcc,
          status: 'SCHEDULED',
        });
      } catch (err) {
        if (err.code !== 11000) throw err;
      }
    }
  }

  return formatLog(log);
}

// ── History ───────────────────────────────────────────────────────────────────

/**
 * Get reminder occurrence history for a patient.
 *
 * @param {string} patientId
 * @param {{ reminderId?: string, status?: string, from?: Date, to?: Date, page: number, limit: number }} filters
 * @returns {Promise<{ logs: object[], pagination: object }>}
 */
export async function getReminderHistory(patientId, filters) {
  const query = { patientId: new mongoose.Types.ObjectId(patientId) };

  if (filters.reminderId) {
    query.reminderId = new mongoose.Types.ObjectId(filters.reminderId);
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.from || filters.to) {
    query.scheduledAt = {};
    if (filters.from) query.scheduledAt.$gte = filters.from;
    if (filters.to) query.scheduledAt.$lte = filters.to;
  }

  const { page, limit } = filters;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    ReminderLog.find(query)
      .populate('reminderId', 'title type')
      .sort({ scheduledAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ReminderLog.countDocuments(query),
  ]);

  // Enrich SCHEDULED logs with computed status (UPCOMING / DUE / MISSED)
  const enrichedLogs = logs.map((log) => {
    const formatted = formatLog(log);
    if (log.status === 'SCHEDULED') {
      formatted.effectiveStatus = resolveLogStatus(log);
    }
    return formatted;
  });

  return {
    logs: enrichedLogs,
    pagination: { page, limit, total },
  };
}

// ── Scheduler (B6 scope: generate next occurrence) ───────────────────────────

/**
 * Generate pending ReminderLog occurrences for all active reminders.
 *
 * This function is idempotent: the unique index on (reminderId, scheduledAt)
 * for SCHEDULED/DELIVERED/ACKNOWLEDGED statuses ensures that running this
 * function multiple times will not create duplicate occurrences.
 *
 * In B6 this is called on-demand. B9 will integrate this into a proper job
 * scheduler (cron/queue). The function is exported so it can be called from
 * a route or a lightweight cron in the future.
 *
 * @returns {Promise<{ created: number, skipped: number }>}
 */
export async function generatePendingOccurrences() {
  const activeReminders = await Reminder.find({ isActive: true }).lean();

  let created = 0;
  let skipped = 0;

  const now = new Date();

  for (const reminder of activeReminders) {
    // Find the latest existing occurrence for this reminder
    const latestLog = await ReminderLog.findOne({
      reminderId: reminder._id,
      status: { $in: ['SCHEDULED', 'DELIVERED', 'ACKNOWLEDGED'] },
    })
      .sort({ scheduledAt: -1 })
      .lean();

    const after = latestLog ? new Date(latestLog.scheduledAt) : new Date(now.getTime() - 1);

    const nextOcc = computeNextOccurrence(reminder, after);

    if (!nextOcc) {
      skipped++;
      continue;
    }

    try {
      await ReminderLog.create({
        reminderId: reminder._id,
        patientId: reminder.patientId,
        scheduledAt: nextOcc,
        status: 'SCHEDULED',
      });
      created++;

      // B9 — Emit ReminderDue event if the occurrence is due now or in the past
      // (i.e. the scheduled time is within the next minute or already passed).
      // This handles cases where the scheduler runs frequently and the
      // occurrence is imminent.
      if (nextOcc <= new Date(now.getTime() + 60 * 1000)) {
        emitNotificationEvent('ReminderDue', {
          patientUserId: reminder.patientId.toString(),
          reminderId: reminder._id.toString(),
          reminderTitle: reminder.title,
        });
      }
    } catch (err) {
      if (err.code === 11000) {
        skipped++; // Already exists — idempotent
      } else {
        throw err;
      }
    }
  }

  return { created, skipped };
}

/**
 * Mark SCHEDULED ReminderLogs as MISSED if their scheduledAt + grace period
 * has passed. This can be called by a periodic job.
 *
 * @returns {Promise<number>} count of records updated to MISSED
 */
export async function markMissedOccurrences() {
  const cutoff = new Date(Date.now() - MISSED_GRACE_PERIOD_MINUTES * 60 * 1000);

  // Fetch the logs that will be marked MISSED so we can emit events per patient
  const logsToMiss = await ReminderLog.find({
    status: 'SCHEDULED',
    scheduledAt: { $lt: cutoff },
  })
    .populate('reminderId', 'title')
    .lean();

  const result = await ReminderLog.updateMany(
    {
      status: 'SCHEDULED',
      scheduledAt: { $lt: cutoff },
    },
    { $set: { status: 'MISSED' } }
  );

  // B9 — Emit ReminderMissed event for each affected patient
  for (const log of logsToMiss) {
    emitNotificationEvent('ReminderMissed', {
      patientUserId: log.patientId.toString(),
      reminderId: log.reminderId?._id?.toString() ?? log.reminderId?.toString(),
      reminderTitle: log.reminderId?.title ?? 'Reminder',
    });
  }

  return result.modifiedCount;
}
