/**
 * safetyApi.js — Safety, Location & Emergency API endpoints (B12)
 */

import { request } from './client.js';

export async function triggerSOS(location = null, clientEventId = null) {
  return await request('/safety/sos', {
    method: 'POST',
    body: { location, clientEventId },
  });
}

export async function sendLocationUpdate(latitude, longitude, accuracy = 0) {
  return await request('/safety/location', {
    method: 'POST',
    body: { latitude, longitude, accuracy },
  });
}

export async function fetchSafetyEvents(patientId = null) {
  const query = patientId ? `?patientId=${patientId}` : '';
  return await request(`/safety/events${query}`);
}

export async function acknowledgeSafetyEvent(eventId) {
  return await request(`/safety/events/${eventId}/acknowledge`, {
    method: 'POST',
  });
}

export async function resolveSafetyEvent(eventId, reason = null) {
  return await request(`/safety/events/${eventId}/resolve`, {
    method: 'POST',
    body: { reason },
  });
}

export async function fetchCurrentLocation(patientId = null) {
  const query = patientId ? `?patientId=${patientId}` : '';
  return await request(`/safety/location/current${query}`);
}

export async function fetchGeofences(patientId = null) {
  const query = patientId ? `?patientId=${patientId}` : '';
  return await request(`/safety/geofences${query}`);
}
