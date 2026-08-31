/**
 * patients.routes.js — Routes for /api/v1/patients
 *
 * Route structure:
 *   GET  /patients/me              — patient's own profile
 *   PATCH /patients/me             — update own profile
 *   GET  /patients/:patientId      — authorized caregiver access
 *
 * Emergency contact sub-routes are mounted separately in emergencyContacts.routes.js
 * and merged into this router before export.
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole, requirePatientAccess } from '../../middleware/authorization.middleware.js';
import * as patientsController from './patients.controller.js';
import emergencyContactsRouter from './emergencyContacts.routes.js';

const router = Router();

// All patient routes require authentication
router.use(requireAuth);

// ── /patients/me routes ──────────────────────────────────────────────────────
// Must be defined BEFORE /:patientId to avoid "me" being treated as an ObjectId

// GET  /api/v1/patients/me — PATIENT role only
router.get('/me', requireRole('PATIENT'), patientsController.getMe);

// PATCH /api/v1/patients/me — PATIENT role only
router.patch('/me', requireRole('PATIENT'), patientsController.updateMe);

// ── Caregiver Connections under /me ──────────────────────────────────────────
router.get('/me/caregivers', requireRole('PATIENT'), patientsController.getMyCaregivers);
router.post('/me/caregivers/invite', requireRole('PATIENT'), patientsController.generateCaregiverInvite);
router.post('/me/caregivers/:relationshipId/accept', requireRole('PATIENT'), patientsController.acceptCaregiverRequest);
router.patch('/me/caregivers/:relationshipId/permissions', requireRole('PATIENT'), patientsController.updateCaregiverPermissions);
router.post('/me/caregivers/:relationshipId/revoke', requireRole('PATIENT'), patientsController.revokeCaregiverConnection);

// ── Emergency contacts under /me ─────────────────────────────────────────────
// Mount the emergency contacts sub-router at /me/emergency-contacts
router.use('/me/emergency-contacts', requireRole('PATIENT'), emergencyContactsRouter);

// ── /patients/:patientId routes ──────────────────────────────────────────────
// GET /api/v1/patients/:patientId — authorized access (caregiver + viewProfile)
router.get('/:patientId', requirePatientAccess('viewProfile'), patientsController.getById);

// ── Emergency contacts under /:patientId (caregiver read access) ──────────────
// Mounted after /:patientId definition to avoid conflicts with /me routes
router.use(
  '/:patientId/emergency-contacts',
  requirePatientAccess('receiveSafetyAlerts'),
  emergencyContactsRouter
);

export default router;
