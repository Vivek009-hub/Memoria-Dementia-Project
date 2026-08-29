/**
 * emergencyContacts.controller.js — HTTP handlers for emergency contact endpoints
 *
 * The patientId is determined from:
 *  - req.user.id when accessed via /patients/me/emergency-contacts
 *  - req.params.patientId when accessed via /patients/:patientId/emergency-contacts
 *    (authorization already verified by requirePatientAccess middleware)
 */

import * as ecService from './emergencyContacts.service.js';
import { validateContactCreate, validateContactUpdate } from './emergencyContacts.validation.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Resolve the effective patientId from the request.
 * Routes mounted under /patients/me/... set req.patientId = req.user.id in middleware.
 * Routes mounted under /patients/:patientId/... use req.params.patientId.
 */
function resolvePatientId(req) {
  const patientId = req.patientId ?? req.params.patientId;
  if (!patientId) {
    throw new AppError('patientId could not be resolved', 500, 'INTERNAL_SERVER_ERROR');
  }
  return patientId;
}

/**
 * GET /api/v1/patients/me/emergency-contacts
 * GET /api/v1/patients/:patientId/emergency-contacts
 */
export async function listContacts(req, res, next) {
  try {
    const patientId = resolvePatientId(req);
    const contacts = await ecService.listContacts(patientId);
    res.status(200).json({ success: true, data: { contacts } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/patients/me/emergency-contacts
 */
export async function createContact(req, res, next) {
  try {
    const patientId = resolvePatientId(req);
    const validatedData = validateContactCreate(req.body);
    const contact = await ecService.createContact(patientId, req.user.id, validatedData);
    res.status(201).json({ success: true, data: { contact } });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/patients/me/emergency-contacts/:contactId
 */
export async function updateContact(req, res, next) {
  try {
    const patientId = resolvePatientId(req);
    const validatedData = validateContactUpdate(req.body);
    const contact = await ecService.updateContact(req.params.contactId, patientId, validatedData);
    res.status(200).json({ success: true, data: { contact } });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/patients/me/emergency-contacts/:contactId
 */
export async function deleteContact(req, res, next) {
  try {
    const patientId = resolvePatientId(req);
    await ecService.deleteContact(req.params.contactId, patientId);
    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}
