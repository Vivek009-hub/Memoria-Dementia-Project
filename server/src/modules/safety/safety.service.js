/**
 * safety.service.js — Core domain service for Safety, SOS, Location & Emergency
 */

import SafetyEvent from './safetyEvent.model.js';
import LocationEvent from './locationEvent.model.js';
import SafetyEventHistory from './safetyEventHistory.model.js';
import CaregiverRelationship from '../caregivers/caregiverRelationship.model.js';
import EmergencyContact from '../caregivers/emergencyContact.model.js';
import * as notificationService from '../notifications/notification.service.js';
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
} from '../notifications/notification.model.js';
import { evaluatePatientGeofences } from './geofence.service.js';
import { AppError } from '../../utils/AppError.js';
import { canAccessPatient } from '../../utils/authorization.js';

/**
 * Record a safety audit trail entry.
 */
async function recordHistory(eventId, action, actorId, previousStatus, newStatus, metadata = {}) {
  await SafetyEventHistory.create({
    eventId,
    action,
    actorId,
    previousStatus,
    newStatus,
    timestamp: new Date(),
    metadata,
  });
}

/**
 * Resolve caregiver and emergency contact user IDs for safety alert notifications.
 */
async function resolveSafetyRecipients(patientId) {
  const [relationships, contacts] = await Promise.all([
    CaregiverRelationship.find({ patientId, status: 'ACTIVE' }).lean(),
    EmergencyContact.find({ patientId, isActive: true }).lean(),
  ]);

  const recipientIds = new Set();
  relationships.forEach((rel) => {
    if (rel.caregiverId) recipientIds.add(rel.caregiverId.toString());
  });

  return { recipientIds: Array.from(recipientIds), contacts };
}

/**
 * Trigger an SOS emergency alert.
 */
export async function triggerSOS(patientId, location = null, clientEventId = null) {
  // Deduplicate rapid SOS presses (return open SOS created in last 60s)
  const existingActive = await SafetyEvent.findOne({
    patientId,
    type: 'SOS',
    status: { $in: ['TRIGGERED', 'OPEN', 'ESCALATED'] },
    createdAt: { $gte: new Date(Date.now() - 60000) },
  });

  if (existingActive) {
    return existingActive;
  }

  const sosEvent = await SafetyEvent.create({
    patientId,
    type: 'SOS',
    status: 'TRIGGERED',
    severity: 'CRITICAL',
    source: 'MOBILE_APP',
    location: location
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy || 0,
          address: location.address || null,
        }
      : null,
    metadata: clientEventId ? { clientEventId } : {},
    triggeredAt: new Date(),
  });

  await recordHistory(sosEvent._id, 'TRIGGERED', patientId, null, 'TRIGGERED', { type: 'SOS' });

  // Dispatch B9 Critical SOS Notification to caregivers
  try {
    const { recipientIds } = await resolveSafetyRecipients(patientId);
    for (const recipientId of recipientIds) {
      await notificationService.sendNotification({
        recipientUserId: recipientId,
        type: NOTIFICATION_TYPES.SOS,
        title: '🚨 CRITICAL SOS ALERT',
        message: 'A patient has triggered an Emergency SOS alert!',
        priority: NOTIFICATION_PRIORITIES.CRITICAL,
        relatedResourceType: 'SafetyEvent',
        relatedResourceId: sosEvent._id,
      });
    }
  } catch {
    // Notification failure must NOT fail safety event creation
  }

  return sosEvent;
}

/**
 * Ingest a location update and evaluate geofences.
 */
export async function ingestLocation(patientId, locationData) {
  const {
    latitude,
    longitude,
    accuracy = 0,
    source = 'MOBILE_APP',
    deviceId = null,
  } = locationData;

  const locEvent = await LocationEvent.create({
    patientId,
    latitude,
    longitude,
    accuracy,
    timestamp: new Date(),
    source,
    deviceId,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
  });

  // Evaluate patient geofences
  const breaches = await evaluatePatientGeofences(patientId, latitude, longitude, accuracy);

  for (const breach of breaches) {
    const breachEvent = await SafetyEvent.create({
      patientId,
      type: 'GEOFENCE_EXIT',
      status: 'TRIGGERED',
      severity: 'HIGH',
      source: 'SYSTEM',
      location: { latitude, longitude, accuracy },
      metadata: {
        geofenceId: breach.geofenceId,
        geofenceName: breach.name,
        distance: breach.distance,
      },
      triggeredAt: new Date(),
    });

    await recordHistory(breachEvent._id, 'TRIGGERED', patientId, null, 'TRIGGERED', {
      type: 'GEOFENCE_EXIT',
    });

    // Send B9 Geofence Alert
    try {
      const { recipientIds } = await resolveSafetyRecipients(patientId);
      for (const recipientId of recipientIds) {
        await notificationService.sendNotification({
          recipientUserId: recipientId,
          type: NOTIFICATION_TYPES.GEOFENCE,
          title: '⚠️ GEOFENCE BREACH ALERT',
          message: `Patient exited safe boundary: ${breach.name}`,
          priority: NOTIFICATION_PRIORITIES.HIGH,
          relatedResourceType: 'SafetyEvent',
          relatedResourceId: breachEvent._id,
        });
      }
    } catch {
      // Notification errors ignored
    }
  }

  return { location: locEvent, breachesDetected: breaches.length };
}

/**
 * Ingest a fall detection event.
 */
export async function ingestFallEvent(patientId, fallData) {
  const { confidence = 0.9, location = null } = fallData;

  const fallEvent = await SafetyEvent.create({
    patientId,
    type: 'POSSIBLE_FALL',
    status: 'TRIGGERED',
    severity: 'HIGH',
    source: 'MOBILE_APP',
    location: location
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy || 0,
        }
      : null,
    metadata: { confidence },
    triggeredAt: new Date(),
  });

  await recordHistory(fallEvent._id, 'TRIGGERED', patientId, null, 'TRIGGERED', {
    type: 'POSSIBLE_FALL',
  });

  // Send B9 Possible Fall Alert
  try {
    const { recipientIds } = await resolveSafetyRecipients(patientId);
    for (const recipientId of recipientIds) {
      await notificationService.sendNotification({
        recipientUserId: recipientId,
        type: NOTIFICATION_TYPES.POSSIBLE_FALL,
        title: '⚠️ POSSIBLE FALL DETECTED',
        message: 'A potential fall has been reported by patient device.',
        priority: NOTIFICATION_PRIORITIES.HIGH,
        relatedResourceType: 'SafetyEvent',
        relatedResourceId: fallEvent._id,
      });
    }
  } catch {
    // Notification error ignored
  }

  return fallEvent;
}

/**
 * Patient confirms they are safe after a fall event.
 */
export async function confirmFallSafe(eventId, patientId) {
  const event = await SafetyEvent.findById(eventId);
  if (!event || event.patientId.toString() !== patientId.toString()) {
    throw new AppError('Safety event not found', 404, 'NOT_FOUND');
  }

  if (['RESOLVED', 'CANCELLED'].includes(event.status)) {
    throw new AppError(`Event is already ${event.status.toLowerCase()}`, 409, 'INVALID_STATUS');
  }

  const prevStatus = event.status;
  event.status = 'CANCELLED';
  event.cancelledBy = patientId;
  event.cancelledAt = new Date();
  await event.save();

  await recordHistory(eventId, 'CANCELLED', patientId, prevStatus, 'CANCELLED', {
    reason: 'PATIENT_CONFIRMED_SAFE',
  });
  return event;
}

/**
 * Caregiver / Admin acknowledges a safety event.
 */
export async function acknowledgeSafetyEvent(eventId, actorId) {
  const event = await SafetyEvent.findById(eventId);
  if (!event) {
    throw new AppError('Safety event not found', 404, 'NOT_FOUND');
  }

  if (['RESOLVED', 'CANCELLED'].includes(event.status)) {
    throw new AppError(
      `Cannot acknowledge an event that is ${event.status.toLowerCase()}`,
      409,
      'INVALID_STATUS'
    );
  }

  const prevStatus = event.status;
  event.status = 'ACKNOWLEDGED';
  event.acknowledgedBy = actorId;
  event.acknowledgedAt = new Date();
  await event.save();

  await recordHistory(eventId, 'ACKNOWLEDGED', actorId, prevStatus, 'ACKNOWLEDGED');
  return event;
}

/**
 * Caregiver / Admin resolves a safety event.
 */
export async function resolveSafetyEvent(eventId, actorId, reason = null) {
  const event = await SafetyEvent.findById(eventId);
  if (!event) {
    throw new AppError('Safety event not found', 404, 'NOT_FOUND');
  }

  if (event.status === 'RESOLVED') {
    throw new AppError('Event is already resolved', 409, 'INVALID_STATUS');
  }

  const prevStatus = event.status;
  event.status = 'RESOLVED';
  event.resolvedBy = actorId;
  event.resolvedAt = new Date();
  event.resolutionReason = reason || 'Resolved by authorized responder';
  await event.save();

  await recordHistory(eventId, 'RESOLVED', actorId, prevStatus, 'RESOLVED', {
    reason: event.resolutionReason,
  });
  return event;
}

/**
 * Cancel a safety event.
 */
export async function cancelSafetyEvent(eventId, actorId) {
  const event = await SafetyEvent.findById(eventId);
  if (!event) {
    throw new AppError('Safety event not found', 404, 'NOT_FOUND');
  }

  const prevStatus = event.status;
  event.status = 'CANCELLED';
  event.cancelledBy = actorId;
  event.cancelledAt = new Date();
  await event.save();

  await recordHistory(eventId, 'CANCELLED', actorId, prevStatus, 'CANCELLED');
  return event;
}

import PatientProfile from '../patients/patientProfile.model.js';

/**
 * Get last known location for a patient with authorization & privacy check.
 */
export async function getCurrentLocation(patientId, requestingUser = null) {
  if (requestingUser && requestingUser.role === 'CAREGIVER') {
    // 1. Verify caregiver relationship has viewLocation permission
    await canAccessPatient(requestingUser, patientId, 'viewLocation');

    // 2. Verify patient location sharing is not explicitly disabled
    const profile = await PatientProfile.findOne({ userId: patientId });
    if (profile && profile.safetySettings && profile.safetySettings.locationSharingEnabled === false) {
      throw new AppError('Patient has disabled location sharing', 403, 'LOCATION_SHARING_DISABLED');
    }
  }

  const latest = await LocationEvent.findOne({ patientId }).sort({ timestamp: -1 }).lean();
  if (!latest) {
    return null;
  }

  const ageMs = Date.now() - new Date(latest.timestamp).getTime();
  const isStale = ageMs > 15 * 60 * 1000; // >15 mins old

  return {
    ...latest,
    isStale,
  };
}

/**
 * Get paginated safety events for a patient.
 */
export async function getSafetyEvents(
  patientId,
  queryParams = {},
  pagination = { page: 1, limit: 20 }
) {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const match = { patientId };
  if (queryParams.type) match.type = queryParams.type;
  if (queryParams.status) match.status = queryParams.status;

  const [events, total] = await Promise.all([
    SafetyEvent.find(match).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    SafetyEvent.countDocuments(match),
  ]);

  return {
    data: events,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get single safety event by ID.
 */
export async function getSafetyEventById(eventId, patientId = null) {
  const event = await SafetyEvent.findById(eventId).lean();
  if (!event) {
    throw new AppError('Safety event not found', 404, 'NOT_FOUND');
  }
  if (patientId && event.patientId.toString() !== patientId.toString()) {
    throw new AppError('Safety event not found', 404, 'NOT_FOUND');
  }
  return event;
}
