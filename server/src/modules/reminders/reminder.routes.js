/**
 * reminder.routes.js — Express routes for /api/v1/reminders
 *
 * Authorization model:
 *
 * PATIENT role:
 *   - All routes resolve patientId = req.user.id
 *   - requireRole('PATIENT', 'CAREGIVER') lets both through
 *
 * CAREGIVER role:
 *   - Must include ?patientId=<id> in query or patientId in body
 *   - requirePatientAccess('manageReminders') middleware validates the
 *     ACTIVE relationship and the manageReminders permission via B3 utils
 *   - The :patientId param is injected via middleware from query/body
 *
 * Design note:
 *   Rather than duplicating every route for caregivers (/patients/:patientId/reminders),
 *   we use a single route set. The controller's resolvePatientId() reads patientId from:
 *     - req.user.id for PATIENT role
 *     - req.params.patientId (set by caregiverPatientScope middleware) for CAREGIVER role
 *
 * History route must come BEFORE /:reminderId to avoid Express treating
 * "history" as a reminderId param.
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/authorization.middleware.js';
import { canAccessPatient } from '../../utils/authorization.js';
import { AppError } from '../../utils/AppError.js';
import mongoose from 'mongoose';
import * as controller from './reminder.controller.js';

const router = Router();

// ── Caregiver-scope middleware ────────────────────────────────────────────────

/**
 * For CAREGIVER requests, validates that the caregiver has manageReminders
 * permission for the target patient. Reads patientId from:
 *   1. req.query.patientId
 *   2. req.body.patientId
 * Attaches req.params.patientId for downstream controllers.
 *
 * For PATIENT requests, skips validation (patient accesses own data).
 */
async function caregiverPatientScope(req, _res, next) {
  try {
    if (req.user.role === 'PATIENT') {
      // Patients access their own data — no further check needed here
      return next();
    }

    if (req.user.role === 'CAREGIVER') {
      let patientId = req.query?.patientId ?? req.body?.patientId;

      if (!patientId && req.params?.reminderId) {
        const Reminder = (await import('./reminder.model.js')).default;
        const reminder = await Reminder.findById(req.params.reminderId).lean();
        if (reminder) {
          patientId = reminder.patientId?.toString();
        }
      }

      if (!patientId) {
        throw new AppError(
          'patientId is required for caregiver access (provide as query param)',
          400,
          'INVALID_REQUEST'
        );
      }

      if (!mongoose.Types.ObjectId.isValid(patientId)) {
        throw new AppError('Invalid patientId', 400, 'INVALID_ID');
      }

      // Verify ACTIVE relationship + manageReminders permission via B3 utils
      await canAccessPatient(req.user, patientId, 'manageReminders');

      // Attach for controllers to read
      req.params.patientId = patientId;
      req.targetPatientId = patientId;
      return next();
    }

    throw new AppError('You do not have permission to access this resource', 403, 'FORBIDDEN');
  } catch (err) {
    next(err);
  }
}

// ── Routes ────────────────────────────────────────────────────────────────────

// All reminder routes require authentication
router.use(requireAuth);

// Only PATIENT and CAREGIVER roles may access reminders
router.use(requireRole('PATIENT', 'CAREGIVER'));

// Apply caregiver-scope validation to all reminder routes
router.use(caregiverPatientScope);

// POST /api/v1/reminders — create a reminder
router.post('/', controller.createReminder);

// GET /api/v1/reminders/history — must be BEFORE /:reminderId
router.get('/history', controller.getReminderHistory);

// GET /api/v1/reminders — list reminders
router.get('/', controller.listReminders);

// GET /api/v1/reminders/:reminderId — get single reminder
router.get('/:reminderId', controller.getReminder);

// PATCH /api/v1/reminders/:reminderId — update reminder
router.patch('/:reminderId', controller.updateReminder);

// DELETE /api/v1/reminders/:reminderId — soft-delete reminder
router.delete('/:reminderId', controller.deleteReminder);

// POST /api/v1/reminders/:reminderId/complete — complete an occurrence
router.post('/:reminderId/complete', controller.completeReminder);

// POST /api/v1/reminders/:reminderId/skip — skip/dismiss an occurrence
router.post('/:reminderId/skip', controller.skipReminder);

export default router;
