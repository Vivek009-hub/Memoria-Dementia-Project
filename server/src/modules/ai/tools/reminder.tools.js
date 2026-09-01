/**
 * reminder.tools.js — Controlled tools for reminder retrieval and creation
 *
 * All operations are scoped to the authenticated patient's userId.
 * Reminder creation goes through server validation and natural time parsing.
 *
 * Security:
 *   - userId always from auth session — LLM cannot supply a different patientId.
 *   - Tool arguments are parsed and validated server-side before DB write.
 */

import Reminder from '../../reminders/reminder.model.js';
import { parseNaturalTime } from '../utils/timeParser.js';
import { AppError } from '../../../utils/AppError.js';

// Default IANA timezone used when patient profile has none
const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Get the patient's currently active reminders.
 *
 * @param {string} userId - Authenticated patient ID
 * @returns {Array<Object>}
 */
export async function getActiveReminders(userId) {
  const reminders = await Reminder.find({ patientId: userId, isActive: true })
    .select('title description type schedule timezone recurrence')
    .sort({ 'schedule.time': 1 })
    .limit(20)
    .lean();

  return reminders.map((r) => ({
    id: r._id,
    title: r.title,
    description: r.description || null,
    type: r.type,
    time: r.schedule?.time || null,
    timezone: r.timezone,
    isRecurring: !!r.recurrence,
  }));
}

/**
 * Create a one-time reminder for the patient using natural time expression or delay.
 *
 * @param {string} userId - Authenticated patient ID
 * @param {Object} params
 * @param {string} params.title           - Reminder title (max 200 chars)
 * @param {string} [params.timeExpression]- Natural time e.g. "in 15 minutes", "at 6 PM", "tomorrow morning"
 * @param {number} [params.delayMinutes]  - Minutes from now (1–43200)
 * @param {string} [params.scheduledAtISO]- ISO date string
 * @param {string} [params.type]          - Reminder type (default: OTHER)
 * @param {string} [params.timezone]      - IANA timezone (default: Asia/Kolkata)
 * @returns {Object} Created reminder summary
 */
export async function createReminder(
  userId,
  {
    title,
    timeExpression,
    delayMinutes,
    scheduledAtISO,
    type = 'OTHER',
    timezone = DEFAULT_TIMEZONE,
  }
) {
  // Validate title
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw new AppError('Reminder title is required', 400, 'VALIDATION_ERROR');
  }
  if (title.length > 200) {
    throw new AppError('Reminder title too long (max 200 chars)', 400, 'VALIDATION_ERROR');
  }

  const VALID_TYPES = [
    'MEDICATION',
    'MEAL',
    'APPOINTMENT',
    'ACTIVITY',
    'BIRTHDAY',
    'IMPORTANT_EVENT',
    'COMMUNITY_SESSION',
    'MEETING_CIRCLE',
    'OTHER',
  ];
  const safeType = VALID_TYPES.includes(type) ? type : 'OTHER';

  // Parse natural time / delay / ISO
  const { scheduledAt, timeStr, timezone: canonicalTz } = parseNaturalTime({
    timeExpression,
    delayMinutes: delayMinutes ? Number(delayMinutes) : undefined,
    scheduledAtISO,
    timezone,
  });

  const reminder = await Reminder.create({
    patientId: userId,
    createdBy: userId,
    title: title.trim(),
    type: safeType,
    timezone: canonicalTz,
    schedule: {
      time: timeStr,
      startAt: scheduledAt,
    },
    recurrence: null, // one-time
    isActive: true,
    voiceEnabled: true, // Enable voice alert for companion reminders
  });

  return {
    id: reminder._id,
    title: reminder.title,
    type: reminder.type,
    scheduledAt,
    time: timeStr,
    timezone: canonicalTz,
    voiceEnabled: true,
    confirmation: `Reminder "${reminder.title}" set for ${timeStr}.`,
  };
}

/**
 * Cancel (soft-delete) an existing reminder.
 * Only allows cancelling reminders that belong to the patient.
 *
 * @param {string} userId     - Authenticated patient ID
 * @param {string} reminderId - Reminder document ID
 * @returns {Object} Cancellation confirmation
 */
export async function cancelReminder(userId, reminderId) {
  const reminder = await Reminder.findOne({ _id: reminderId, patientId: userId });

  if (!reminder) {
    throw new AppError('Reminder not found or does not belong to you', 404, 'RESOURCE_NOT_FOUND');
  }

  reminder.isActive = false;
  await reminder.save();

  return { id: reminder._id, cancelled: true, title: reminder.title };
}
