/**
 * reminder.controller.js — Request handlers for /api/v1/reminders
 *
 * Thin layer: reads req.*, calls service, returns standardized JSON.
 * Business logic belongs in reminder.service.js.
 *
 * Authorization model:
 *   PATIENT role → can only access their own reminders (patientId = req.user.id)
 *   CAREGIVER role → requirePatientAccess('manageReminders') middleware must have
 *                    already run, and patientId comes from req.params.patientId
 *
 * For simplicity, POST /reminders accepts an optional patientId in the body
 * only for CAREGIVER role; for PATIENT role patientId is always req.user.id.
 */

import * as reminderService from './reminder.service.js';
import {
  validateObjectId,
  validateReminderCreate,
  validateReminderUpdate,
  validateReminderAction,
  validateReminderListQuery,
  validateHistoryQuery,
} from './reminder.validation.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolve the patientId for the request.
 * - PATIENT: always their own ID (req.user.id)
 * - CAREGIVER: patientId from query string or body (validated + authorized by caregiverPatientScope)
 *
 * Reading from req.query directly is the most reliable approach because
 * Express can reset req.params when re-routing through sub-routers, but
 * req.query is always preserved on the original request object.
 *
 * @param {object} req
 * @returns {string}
 */
function resolvePatientId(req) {
  if (req.user.role === 'PATIENT') {
    return req.user.id;
  }
  // CAREGIVER — patientId comes from query or body (already authorized by caregiverPatientScope)
  return req.query?.patientId ?? req.body?.patientId ?? req.params.patientId;
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/reminders
 * Create a reminder. PATIENT creates for themselves; CAREGIVER creates for a patient.
 */
export async function createReminder(req, res, next) {
  try {
    const data = validateReminderCreate(req.body);
    const patientId = resolvePatientId(req);
    const reminder = await reminderService.createReminder(patientId, req.user.id, data);
    res.status(201).json({ success: true, data: reminder });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/reminders
 * List reminders. PATIENT sees their own; CAREGIVER sees patient's.
 */
export async function listReminders(req, res, next) {
  try {
    const filters = validateReminderListQuery(req.query);
    const patientId = resolvePatientId(req);
    const result = await reminderService.listReminders(patientId, filters);
    res.status(200).json({
      success: true,
      data: result.reminders,
      occurrences: result.occurrences,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/reminders/history
 * Reminder occurrence history. Must come BEFORE /:reminderId route to avoid conflict.
 */
export async function getReminderHistory(req, res, next) {
  try {
    const filters = validateHistoryQuery(req.query);
    const patientId = resolvePatientId(req);
    const result = await reminderService.getReminderHistory(patientId, filters);
    res.status(200).json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/reminders/:reminderId
 * Get a single reminder.
 */
export async function getReminder(req, res, next) {
  try {
    validateObjectId(req.params.reminderId, 'reminderId');
    const patientId = resolvePatientId(req);
    const reminder = await reminderService.getReminder(req.params.reminderId, patientId);
    res.status(200).json({ success: true, data: reminder });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/reminders/:reminderId
 * Update a reminder.
 */
export async function updateReminder(req, res, next) {
  try {
    validateObjectId(req.params.reminderId, 'reminderId');
    const data = validateReminderUpdate(req.body);
    const patientId = resolvePatientId(req);
    const reminder = await reminderService.updateReminder(req.params.reminderId, patientId, data);
    res.status(200).json({ success: true, data: reminder });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/reminders/:reminderId
 * Soft-delete (deactivate) a reminder. Cancels pending occurrences.
 */
export async function deleteReminder(req, res, next) {
  try {
    validateObjectId(req.params.reminderId, 'reminderId');
    const patientId = resolvePatientId(req);
    await reminderService.deleteReminder(req.params.reminderId, patientId);
    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

// ── Occurrence Actions ────────────────────────────────────────────────────────

/**
 * POST /api/v1/reminders/:reminderId/complete
 * Mark a reminder occurrence as completed.
 */
export async function completeReminder(req, res, next) {
  try {
    validateObjectId(req.params.reminderId, 'reminderId');
    const options = validateReminderAction(req.body);
    const patientId = resolvePatientId(req);
    const log = await reminderService.completeReminder(
      req.params.reminderId,
      patientId,
      req.user.id,
      options
    );
    res.status(200).json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/reminders/:reminderId/skip
 * Skip (dismiss) a reminder occurrence.
 */
export async function skipReminder(req, res, next) {
  try {
    validateObjectId(req.params.reminderId, 'reminderId');
    const options = validateReminderAction(req.body);
    const patientId = resolvePatientId(req);
    const log = await reminderService.skipReminder(
      req.params.reminderId,
      patientId,
      req.user.id,
      options
    );
    res.status(200).json({ success: true, data: log });
  } catch (err) {
    next(err);
  }
}
