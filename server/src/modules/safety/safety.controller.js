/**
 * safety.controller.js — Request handlers for Safety, Emergency & Location endpoints
 */

import * as safetyService from './safety.service.js';
import * as geofenceService from './geofence.service.js';
import {
  validateObjectId,
  validateLocationInput,
  validateSOSTrigger,
  validateGeofenceCreate,
  validateGeofenceUpdate,
  validateFallEvent,
  validatePaginationParams,
} from './safety.validation.js';

// ── PATIENT & EMERGENCY HANDLERS ──────────────────────────────────────────────

export async function triggerSOS(req, res, next) {
  try {
    validateSOSTrigger(req.body);
    const event = await safetyService.triggerSOS(
      req.user.id,
      req.body?.location || null,
      req.body?.clientEventId || null
    );
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function ingestLocation(req, res, next) {
  try {
    validateLocationInput(req.body);
    const result = await safetyService.ingestLocation(req.user.id, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function ingestFallEvent(req, res, next) {
  try {
    validateFallEvent(req.body);
    const event = await safetyService.ingestFallEvent(req.user.id, req.body);
    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function confirmFallSafe(req, res, next) {
  try {
    const { eventId } = req.params;
    validateObjectId(eventId, 'eventId');
    const event = await safetyService.confirmFallSafe(eventId, req.user.id);
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function getSafetyEvents(req, res, next) {
  try {
    const patientId = req.query?.patientId || req.user.id;
    const pagination = validatePaginationParams(req.query);
    const result = await safetyService.getSafetyEvents(patientId, req.query, pagination);
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSafetyEventById(req, res, next) {
  try {
    const { eventId } = req.params;
    validateObjectId(eventId, 'eventId');
    const event = await safetyService.getSafetyEventById(
      eventId,
      req.user.role === 'PATIENT' ? req.user.id : null
    );
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function acknowledgeSafetyEvent(req, res, next) {
  try {
    const { eventId } = req.params;
    validateObjectId(eventId, 'eventId');
    const event = await safetyService.acknowledgeSafetyEvent(eventId, req.user.id);
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function resolveSafetyEvent(req, res, next) {
  try {
    const { eventId } = req.params;
    validateObjectId(eventId, 'eventId');
    const reason = req.body?.reason || req.body?.notes || req.body?.note || null;
    const event = await safetyService.resolveSafetyEvent(eventId, req.user.id, reason);
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function cancelSafetyEvent(req, res, next) {
  try {
    const { eventId } = req.params;
    validateObjectId(eventId, 'eventId');
    const event = await safetyService.cancelSafetyEvent(eventId, req.user.id);
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentLocation(req, res, next) {
  try {
    const patientId = req.query?.patientId || req.user.id;
    const location = await safetyService.getCurrentLocation(patientId, req.user);
    res.status(200).json({ success: true, data: location });
  } catch (err) {
    next(err);
  }
}

export async function getDeterministicSafetyStatus(req, res, next) {
  try {
    const patientId = req.query?.patientId || req.user.id;
    const result = await safetyService.getDeterministicSafetyStatus(patientId, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// ── GEOFENCE HANDLERS ─────────────────────────────────────────────────────────

export async function createGeofence(req, res, next) {
  try {
    validateGeofenceCreate(req.body);
    const patientId = req.user.role === 'PATIENT' ? req.user.id : req.body.patientId || req.user.id;
    const geofence = await geofenceService.createGeofence(patientId, req.user.id, req.body);
    res.status(201).json({ success: true, data: geofence });
  } catch (err) {
    next(err);
  }
}

export async function getGeofences(req, res, next) {
  try {
    const patientId = req.query?.patientId || req.user.id;
    const geofences = await geofenceService.getGeofences(patientId);
    res.status(200).json({ success: true, data: geofences });
  } catch (err) {
    next(err);
  }
}

export async function updateGeofence(req, res, next) {
  try {
    const { geofenceId } = req.params;
    validateObjectId(geofenceId, 'geofenceId');
    validateGeofenceUpdate(req.body);
    const geofence = await geofenceService.updateGeofence(geofenceId, req.body);
    res.status(200).json({ success: true, data: geofence });
  } catch (err) {
    next(err);
  }
}

export async function deleteGeofence(req, res, next) {
  try {
    const { geofenceId } = req.params;
    validateObjectId(geofenceId, 'geofenceId');
    const result = await geofenceService.deleteGeofence(geofenceId);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
