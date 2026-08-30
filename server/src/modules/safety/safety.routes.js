/**
 * safety.routes.js — Express router for /api/v1/safety (B12)
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/authorization.middleware.js';
import { canAccessPatient } from '../../utils/authorization.js';
import { AppError } from '../../utils/AppError.js';
import * as controller from './safety.controller.js';

const router = Router();

router.use(requireAuth);

/**
 * Caregiver safety scope middleware:
 * If CAREGIVER role and patientId is passed via query/body, verifies ACTIVE relationship.
 */
async function caregiverSafetyScope(req, _res, next) {
  try {
    if (req.user.role === 'PATIENT') {
      return next();
    }
    if (req.user.role === 'CAREGIVER') {
      const patientId = req.query?.patientId || req.body?.patientId || req.params.patientId;
      if (patientId) {
        await canAccessPatient(req.user, patientId, 'receiveSafetyAlerts');
      }
      return next();
    }
    if (req.user.role === 'ADMIN') {
      return next();
    }
    next(new AppError('Forbidden', 403, 'FORBIDDEN'));
  } catch (err) {
    next(err);
  }
}

// SOS Trigger (Patient role only)
router.post('/sos', requireRole('PATIENT'), controller.triggerSOS);

// Location ingestion (Patient role only)
router.post('/location', requireRole('PATIENT'), controller.ingestLocation);

// Fall event ingestion (Patient role only)
router.post('/fall-events', requireRole('PATIENT'), controller.ingestFallEvent);

// Fall confirm-safe (Patient role only)
router.post(
  '/fall-events/:eventId/confirm-safe',
  requireRole('PATIENT'),
  controller.confirmFallSafe
);

// Safety event list & details
router.get('/events', caregiverSafetyScope, controller.getSafetyEvents);
router.get('/events/:eventId', caregiverSafetyScope, controller.getSafetyEventById);

// Safety event status actions (Caregiver / Admin / Authorized patient)
router.post(
  '/events/:eventId/acknowledge',
  caregiverSafetyScope,
  controller.acknowledgeSafetyEvent
);
router.post('/events/:eventId/resolve', caregiverSafetyScope, controller.resolveSafetyEvent);
router.post('/events/:eventId/cancel', caregiverSafetyScope, controller.cancelSafetyEvent);

// Current location endpoint
router.get('/location/current', caregiverSafetyScope, controller.getCurrentLocation);

// Geofence management
router.get('/geofences', caregiverSafetyScope, controller.getGeofences);
router.post('/geofences', caregiverSafetyScope, controller.createGeofence);
router.patch('/geofences/:geofenceId', caregiverSafetyScope, controller.updateGeofence);
router.delete('/geofences/:geofenceId', caregiverSafetyScope, controller.deleteGeofence);

export default router;
