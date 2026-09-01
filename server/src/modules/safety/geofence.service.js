/**
 * geofence.service.js — Geofence evaluation engine and service
 */

import Geofence from './geofence.model.js';
import { AppError } from '../../utils/AppError.js';

/**
 * Calculate distance in meters between two lat/lng coordinates (Haversine formula).
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function createGeofence(patientId, creatorId, data) {
  const { name, centerLatitude, centerLongitude, radiusMeters } = data;

  if (radiusMeters !== undefined && (radiusMeters < 50 || radiusMeters > 10000)) {
    throw new AppError('Safe zone radius must be between 50m and 10,000m', 422, 'VALIDATION_ERROR');
  }

  if (centerLatitude < -90 || centerLatitude > 90 || centerLongitude < -180 || centerLongitude > 180) {
    throw new AppError('Invalid coordinates supplied for safe zone', 422, 'VALIDATION_ERROR');
  }

  const geofence = await Geofence.create({
    patientId,
    name: name.trim(),
    centerLatitude,
    centerLongitude,
    radiusMeters: radiusMeters || 100,
    center: {
      type: 'Point',
      coordinates: [centerLongitude, centerLatitude],
    },
    currentState: 'UNKNOWN',
    isActive: true,
    createdBy: creatorId,
  });

  return geofence;
}

export async function getGeofences(patientId) {
  return await Geofence.find({ patientId, isActive: true }).sort({ createdAt: -1 }).lean();
}

export async function updateGeofence(geofenceId, data) {
  const geofence = await Geofence.findById(geofenceId);
  if (!geofence || !geofence.isActive) {
    throw new AppError('Geofence not found', 404, 'NOT_FOUND');
  }

  if (data.radiusMeters !== undefined && (data.radiusMeters < 50 || data.radiusMeters > 10000)) {
    throw new AppError('Safe zone radius must be between 50m and 10,000m', 422, 'VALIDATION_ERROR');
  }

  if (data.centerLatitude !== undefined && (data.centerLatitude < -90 || data.centerLatitude > 90)) {
    throw new AppError('Invalid latitude coordinate', 422, 'VALIDATION_ERROR');
  }

  if (data.centerLongitude !== undefined && (data.centerLongitude < -180 || data.centerLongitude > 180)) {
    throw new AppError('Invalid longitude coordinate', 422, 'VALIDATION_ERROR');
  }

  if (data.name !== undefined) geofence.name = data.name.trim();
  if (data.radiusMeters !== undefined) geofence.radiusMeters = data.radiusMeters;
  if (data.centerLatitude !== undefined) geofence.centerLatitude = data.centerLatitude;
  if (data.centerLongitude !== undefined) geofence.centerLongitude = data.centerLongitude;

  if (data.centerLatitude !== undefined || data.centerLongitude !== undefined) {
    geofence.center = {
      type: 'Point',
      coordinates: [geofence.centerLongitude, geofence.centerLatitude],
    };
  }

  if (data.isActive !== undefined) geofence.isActive = data.isActive;

  await geofence.save();
  return geofence;
}

export async function deleteGeofence(geofenceId) {
  const geofence = await Geofence.findById(geofenceId);
  if (!geofence || !geofence.isActive) {
    throw new AppError('Geofence not found', 404, 'NOT_FOUND');
  }

  geofence.isActive = false;
  await geofence.save();
  return { id: geofenceId, deleted: true };
}

/**
 * Evaluate patient location against all active geofences.
 * Returns any detected breach events (`INSIDE` -> `OUTSIDE` exit transitions or `OUTSIDE` -> `INSIDE` re-entry transitions).
 */
export async function evaluatePatientGeofences(patientId, latitude, longitude, accuracy = 0) {
  const geofences = await Geofence.find({ patientId, isActive: true });
  const breaches = [];

  for (const gf of geofences) {
    const distance = calculateHaversineDistance(
      latitude,
      longitude,
      gf.centerLatitude,
      gf.centerLongitude
    );

    let newState = gf.currentState;

    // Account for poor GPS accuracy
    if (accuracy > 0 && accuracy > gf.radiusMeters * 2) {
      newState = 'UNKNOWN';
    } else if (distance <= gf.radiusMeters) {
      newState = 'INSIDE';
    } else if (distance > gf.radiusMeters + 10) {
      // 10m hysteresis buffer to prevent GPS jitter alerts
      newState = 'OUTSIDE';
    }

    const previousState = gf.currentState;

    if (previousState !== newState) {
      gf.currentState = newState;
      await gf.save();

      // Trigger transition event for INSIDE -> OUTSIDE (GEOFENCE_EXIT) or OUTSIDE -> INSIDE (GEOFENCE_REENTRY)
      if (previousState === 'INSIDE' && newState === 'OUTSIDE') {
        breaches.push({
          type: 'GEOFENCE_EXIT',
          geofenceId: gf._id,
          name: gf.name,
          distance: Math.round(distance),
          radiusMeters: gf.radiusMeters,
        });
      } else if (previousState === 'OUTSIDE' && newState === 'INSIDE') {
        breaches.push({
          type: 'GEOFENCE_REENTRY',
          geofenceId: gf._id,
          name: gf.name,
          distance: Math.round(distance),
          radiusMeters: gf.radiusMeters,
        });
      }
    }
  }

  return breaches;
}
