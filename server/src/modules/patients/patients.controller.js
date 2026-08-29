/**
 * patients.controller.js — HTTP handlers for patient profile endpoints
 */

import * as patientsService from './patients.service.js';
import { validatePatientUpdate } from './patients.validation.js';

/**
 * GET /api/v1/patients/me
 */
export async function getMe(req, res, next) {
  try {
    const patient = await patientsService.getMyProfile(req.user.id);
    res.status(200).json({ success: true, data: { patient } });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/patients/me
 */
export async function updateMe(req, res, next) {
  try {
    const validatedData = validatePatientUpdate(req.body);
    const patient = await patientsService.updateMyProfile(req.user.id, validatedData);
    res.status(200).json({ success: true, data: { patient } });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/patients/:patientId
 * Used by caregivers to access a specific patient profile.
 * Authorization is handled by requirePatientAccess('viewProfile') middleware.
 */
export async function getById(req, res, next) {
  try {
    const patient = await patientsService.getPatientById(req.user, req.params.patientId);
    res.status(200).json({ success: true, data: { patient } });
  } catch (err) {
    next(err);
  }
}
