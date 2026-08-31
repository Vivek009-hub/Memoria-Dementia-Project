/**
 * reminder.validation.js — Input validation for /api/v1/reminders endpoints
 *
 * Plain functions — no Express dependency.
 * All functions throw AppError on invalid input.
 *
 * Timezone validation uses the native Intl.DateTimeFormat API which accepts
 * IANA identifiers and throws a RangeError for unrecognised values.
 */

import mongoose from 'mongoose';
import { AppError } from '../../utils/AppError.js';
import { REMINDER_TYPES, RECURRENCE_FREQUENCIES } from './reminder.model.js';
import { LOG_STATUSES } from './reminderLog.model.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Validate a MongoDB ObjectId string.
 *
 * @param {string} id
 * @param {string} [fieldName]
 */
export function validateObjectId(id, fieldName = 'id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400, 'INVALID_ID');
  }
}

/**
 * Validate an IANA timezone identifier using the native Intl API.
 * Throws 422 for unrecognised values.
 *
 * @param {string} tz
 */
function validateTimezone(tz) {
  if (typeof tz !== 'string' || tz.trim() === '') {
    throw new AppError('timezone is required', 422, 'VALIDATION_ERROR');
  }
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
  } catch {
    throw new AppError(
      `timezone "${tz}" is not a valid IANA timezone identifier`,
      422,
      'VALIDATION_ERROR'
    );
  }
}

/**
 * Validate a "HH:MM" 24-hour time string.
 *
 * @param {string} time
 * @param {string} fieldPath
 */
function validateTimeString(time, fieldPath = 'schedule.time') {
  if (typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time)) {
    throw new AppError(`${fieldPath} must be in HH:MM 24-hour format`, 422, 'VALIDATION_ERROR');
  }
  const [h, m] = time.split(':').map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    throw new AppError(`${fieldPath} has an invalid hour or minute value`, 422, 'VALIDATION_ERROR');
  }
}

/**
 * Validate and parse the schedule subdocument.
 *
 * @param {object} schedule
 * @param {boolean} isOneTime - true if no recurrence
 * @returns {object} validated schedule
 */
function validateSchedule(schedule, isOneTime) {
  if (!schedule || typeof schedule !== 'object' || Array.isArray(schedule)) {
    throw new AppError('schedule must be a plain object', 422, 'VALIDATION_ERROR');
  }

  validateTimeString(schedule.time, 'schedule.time');

  const result = { time: schedule.time };

  if (isOneTime) {
    // One-time reminders need a specific startAt datetime
    if (!schedule.startAt) {
      throw new AppError(
        'schedule.startAt is required for one-time reminders',
        422,
        'VALIDATION_ERROR'
      );
    }
    const startAt = new Date(schedule.startAt);
    if (isNaN(startAt.getTime())) {
      throw new AppError('schedule.startAt must be a valid date', 422, 'VALIDATION_ERROR');
    }
    if (startAt < new Date()) {
      throw new AppError('schedule.startAt must be in the future', 422, 'VALIDATION_ERROR');
    }
    result.startAt = startAt;
  } else {
    // Recurring reminders — startAt is optional
    if (schedule.startAt !== undefined && schedule.startAt !== null) {
      const startAt = new Date(schedule.startAt);
      if (isNaN(startAt.getTime())) {
        throw new AppError('schedule.startAt must be a valid date', 422, 'VALIDATION_ERROR');
      }
      result.startAt = startAt;
    }
  }

  return result;
}

/**
 * Validate the recurrence subdocument.
 *
 * @param {object} recurrence
 * @returns {object} validated recurrence
 */
function validateRecurrence(recurrence) {
  if (!recurrence || typeof recurrence !== 'object' || Array.isArray(recurrence)) {
    throw new AppError('recurrence must be a plain object', 422, 'VALIDATION_ERROR');
  }

  if (!recurrence.frequency || !RECURRENCE_FREQUENCIES.includes(recurrence.frequency)) {
    throw new AppError(
      `recurrence.frequency must be one of: ${RECURRENCE_FREQUENCIES.join(', ')}`,
      422,
      'VALIDATION_ERROR'
    );
  }

  const result = { frequency: recurrence.frequency };

  if (recurrence.interval !== undefined) {
    const interval = Number(recurrence.interval);
    if (!Number.isInteger(interval) || interval < 1) {
      throw new AppError('recurrence.interval must be a positive integer', 422, 'VALIDATION_ERROR');
    }
    result.interval = interval;
  } else {
    result.interval = 1;
  }

  if (recurrence.frequency === 'WEEKLY') {
    if (!Array.isArray(recurrence.weekdays) || recurrence.weekdays.length === 0) {
      throw new AppError(
        'recurrence.weekdays is required for WEEKLY frequency and must not be empty',
        422,
        'VALIDATION_ERROR'
      );
    }
    for (const d of recurrence.weekdays) {
      if (!Number.isInteger(d) || d < 0 || d > 6) {
        throw new AppError(
          'recurrence.weekdays must contain integers 0–6 (0 = Sunday)',
          422,
          'VALIDATION_ERROR'
        );
      }
    }
    result.weekdays = [...new Set(recurrence.weekdays)].sort();
  } else {
    result.weekdays = [];
  }

  if (recurrence.endDate !== undefined && recurrence.endDate !== null) {
    const endDate = new Date(recurrence.endDate);
    if (isNaN(endDate.getTime())) {
      throw new AppError('recurrence.endDate must be a valid date', 422, 'VALIDATION_ERROR');
    }
    result.endDate = endDate;
  } else {
    result.endDate = null;
  }

  return result;
}

// ── Public Validators ─────────────────────────────────────────────────────────

/**
 * Validate POST /reminders (create reminder).
 *
 * @param {object} body
 * @returns {object} validated data
 */
export function validateReminderCreate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
    throw new AppError('title is required and must be a non-empty string', 422, 'VALIDATION_ERROR');
  }
  if (body.title.trim().length > 200) {
    throw new AppError('title cannot exceed 200 characters', 422, 'VALIDATION_ERROR');
  }

  if (!body.type || !REMINDER_TYPES.includes(body.type)) {
    throw new AppError(
      `type must be one of: ${REMINDER_TYPES.join(', ')}`,
      422,
      'VALIDATION_ERROR'
    );
  }

  validateTimezone(body.timezone);

  const isOneTime = !body.recurrence;
  const schedule = validateSchedule(body.schedule, isOneTime);
  const recurrence = body.recurrence ? validateRecurrence(body.recurrence) : null;

  const data = {
    title: body.title.trim(),
    type: body.type,
    timezone: body.timezone.trim(),
    schedule,
    recurrence,
  };

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      throw new AppError('description must be a string', 422, 'VALIDATION_ERROR');
    }
    if (body.description.trim().length > 1000) {
      throw new AppError('description cannot exceed 1000 characters', 422, 'VALIDATION_ERROR');
    }
    data.description = body.description.trim();
  }

  if (body.voiceEnabled !== undefined) {
    if (typeof body.voiceEnabled !== 'boolean') {
      throw new AppError('voiceEnabled must be a boolean', 422, 'VALIDATION_ERROR');
    }
    data.voiceEnabled = body.voiceEnabled;
  }

  if (body.startDate !== undefined && body.startDate !== null) {
    const startDate = new Date(body.startDate);
    if (isNaN(startDate.getTime())) {
      throw new AppError('startDate must be a valid date', 422, 'VALIDATION_ERROR');
    }
    data.startDate = startDate;
  }

  if (body.endDate !== undefined && body.endDate !== null) {
    const endDate = new Date(body.endDate);
    if (isNaN(endDate.getTime())) {
      throw new AppError('endDate must be a valid date', 422, 'VALIDATION_ERROR');
    }
    // Validate end >= start when both provided
    const compareStart =
      data.startDate ?? (schedule.startAt ? new Date(schedule.startAt) : new Date());
    if (endDate <= compareStart) {
      throw new AppError('endDate must be after startDate', 422, 'VALIDATION_ERROR');
    }
    data.endDate = endDate;
  }

  return data;
}

/**
 * Validate PATCH /reminders/:reminderId (update reminder).
 *
 * @param {object} body
 * @returns {object} validated update data
 */
export function validateReminderUpdate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  const data = {};

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      throw new AppError('title must be a non-empty string', 422, 'VALIDATION_ERROR');
    }
    if (body.title.trim().length > 200) {
      throw new AppError('title cannot exceed 200 characters', 422, 'VALIDATION_ERROR');
    }
    data.title = body.title.trim();
  }

  if (body.description !== undefined) {
    if (typeof body.description !== 'string') {
      throw new AppError('description must be a string', 422, 'VALIDATION_ERROR');
    }
    if (body.description.trim().length > 1000) {
      throw new AppError('description cannot exceed 1000 characters', 422, 'VALIDATION_ERROR');
    }
    data.description = body.description.trim();
  }

  if (body.type !== undefined) {
    if (!REMINDER_TYPES.includes(body.type)) {
      throw new AppError(
        `type must be one of: ${REMINDER_TYPES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    data.type = body.type;
  }

  if (body.timezone !== undefined) {
    validateTimezone(body.timezone);
    data.timezone = body.timezone.trim();
  }

  if (body.schedule !== undefined) {
    // For updates we cannot know if it is one-time without checking recurrence on DB
    // so we validate permissively — startAt is optional
    const schedule = validateSchedule(body.schedule, false);
    data.schedule = schedule;
  }

  if (body.recurrence !== undefined) {
    if (body.recurrence === null) {
      data.recurrence = null; // Changing to one-time
    } else {
      data.recurrence = validateRecurrence(body.recurrence);
    }
  }

  if (body.isActive !== undefined) {
    if (typeof body.isActive !== 'boolean') {
      throw new AppError('isActive must be a boolean', 422, 'VALIDATION_ERROR');
    }
    data.isActive = body.isActive;
  }

  if (body.voiceEnabled !== undefined) {
    if (typeof body.voiceEnabled !== 'boolean') {
      throw new AppError('voiceEnabled must be a boolean', 422, 'VALIDATION_ERROR');
    }
    data.voiceEnabled = body.voiceEnabled;
  }

  if (body.startDate !== undefined) {
    if (body.startDate === null) {
      data.startDate = null;
    } else {
      const startDate = new Date(body.startDate);
      if (isNaN(startDate.getTime())) {
        throw new AppError('startDate must be a valid date', 422, 'VALIDATION_ERROR');
      }
      data.startDate = startDate;
    }
  }

  if (body.endDate !== undefined) {
    if (body.endDate === null) {
      data.endDate = null;
    } else {
      const endDate = new Date(body.endDate);
      if (isNaN(endDate.getTime())) {
        throw new AppError('endDate must be a valid date', 422, 'VALIDATION_ERROR');
      }
      data.endDate = endDate;
    }
  }

  if (Object.keys(data).length === 0) {
    throw new AppError('No valid fields provided for update', 422, 'VALIDATION_ERROR');
  }

  return data;
}

/**
 * Validate POST /reminders/:reminderId/complete
 * POST /reminders/:reminderId/skip
 *
 * @param {object} body
 * @returns {{ note?: string }}
 */
export function validateReminderAction(body) {
  const data = {};

  if (body && body.note !== undefined) {
    if (typeof body.note !== 'string') {
      throw new AppError('note must be a string', 422, 'VALIDATION_ERROR');
    }
    if (body.note.trim().length > 500) {
      throw new AppError('note cannot exceed 500 characters', 422, 'VALIDATION_ERROR');
    }
    data.note = body.note.trim();
  }

  if (body && body.logId !== undefined) {
    validateObjectId(body.logId, 'logId');
    data.logId = body.logId;
  }

  return data;
}

/**
 * Validate query parameters for GET /reminders.
 *
 * @param {object} query - req.query
 * @returns {object} validated filter options
 */
export function validateReminderListQuery(query) {
  const filters = {};

  if (query.type !== undefined && query.type !== '' && query.type !== 'undefined') {
    if (!REMINDER_TYPES.includes(query.type)) {
      throw new AppError(
        `type must be one of: ${REMINDER_TYPES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    filters.type = query.type;
  }

  if (query.isActive !== undefined) {
    if (query.isActive !== 'true' && query.isActive !== 'false') {
      throw new AppError('isActive must be "true" or "false"', 422, 'VALIDATION_ERROR');
    }
    filters.isActive = query.isActive === 'true';
  }

  const page = query.page ? parseInt(query.page, 10) : 1;
  const limit = query.limit ? parseInt(query.limit, 10) : 20;

  if (isNaN(page) || page < 1) {
    throw new AppError('page must be a positive integer', 422, 'VALIDATION_ERROR');
  }
  if (isNaN(limit) || limit < 1) {
    throw new AppError('limit must be a positive integer', 422, 'VALIDATION_ERROR');
  }
  if (limit > 100) {
    throw new AppError('limit cannot exceed 100', 422, 'VALIDATION_ERROR');
  }

  filters.page = page;
  filters.limit = limit;

  return filters;
}

/**
 * Validate query parameters for GET /reminders/history.
 *
 * @param {object} query - req.query
 * @returns {object} validated filter options
 */
export function validateHistoryQuery(query) {
  const filters = {};

  if (query.reminderId !== undefined) {
    validateObjectId(query.reminderId, 'reminderId');
    filters.reminderId = query.reminderId;
  }

  if (query.status !== undefined) {
    if (!LOG_STATUSES.includes(query.status)) {
      throw new AppError(
        `status must be one of: ${LOG_STATUSES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    filters.status = query.status;
  }

  if (query.from !== undefined) {
    const from = new Date(query.from);
    if (isNaN(from.getTime())) {
      throw new AppError('from must be a valid date', 422, 'VALIDATION_ERROR');
    }
    filters.from = from;
  }

  if (query.to !== undefined) {
    const to = new Date(query.to);
    if (isNaN(to.getTime())) {
      throw new AppError('to must be a valid date', 422, 'VALIDATION_ERROR');
    }
    filters.to = to;
  }

  const page = query.page ? parseInt(query.page, 10) : 1;
  const limit = query.limit ? parseInt(query.limit, 10) : 20;

  if (isNaN(page) || page < 1) {
    throw new AppError('page must be a positive integer', 422, 'VALIDATION_ERROR');
  }
  if (isNaN(limit) || limit < 1) {
    throw new AppError('limit must be a positive integer', 422, 'VALIDATION_ERROR');
  }
  if (limit > 100) {
    throw new AppError('limit cannot exceed 100', 422, 'VALIDATION_ERROR');
  }

  filters.page = page;
  filters.limit = limit;

  return filters;
}
