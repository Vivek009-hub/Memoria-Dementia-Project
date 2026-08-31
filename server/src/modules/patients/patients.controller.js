/**
 * patients.controller.js — HTTP handlers for patient profile endpoints
 */

import * as patientsService from './patients.service.js';
import * as caregiversService from '../caregivers/caregivers.service.js';
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
 * GET /api/v1/patients/me/caregivers
 */
export async function getMyCaregivers(req, res, next) {
  try {
    const relationships = await caregiversService.listPatientRelationships(req.user.id);
    res.status(200).json({ success: true, data: { relationships } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/patients/me/caregivers/invite
 */
export async function generateCaregiverInvite(req, res, next) {
  try {
    const invitation = await caregiversService.generateInvitation(req.user.id, req.body);
    res.status(201).json({ success: true, data: { invitation } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/patients/me/caregivers/:relationshipId/accept
 */
export async function acceptCaregiverRequest(req, res, next) {
  try {
    const relationship = await caregiversService.acceptRelationship(req.user.id, req.params.relationshipId);
    res.status(200).json({ success: true, data: { relationship } });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/patients/me/caregivers/:relationshipId/permissions
 */
export async function updateCaregiverPermissions(req, res, next) {
  try {
    const relationship = await caregiversService.updatePatientPermissions(
      req.user.id,
      req.params.relationshipId,
      req.body.permissions || req.body
    );
    res.status(200).json({ success: true, data: { relationship } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/patients/me/caregivers/:relationshipId/revoke
 */
export async function revokeCaregiverConnection(req, res, next) {
  try {
    await caregiversService.revokeRelationship(req.params.relationshipId, req.user.id);
    res.status(200).json({ success: true, data: null });
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

