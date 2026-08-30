/**
 * safetyApi.js — API Service for B12 Safety & Emergency Backend
 */

import { request } from './client.js';

export async function triggerSOS(location = null, clientEventId = null) {
  return await request('/safety/sos', {
    method: 'POST',
    body: { location, clientEventId },
  });
}

export async function sendLocation(latitude, longitude, accuracy = 0) {
  return await request('/safety/location', {
    method: 'POST',
    body: { latitude, longitude, accuracy, source: 'MOBILE_APP' },
  });
}

export async function sendFallEvent(confidence = 0.9, location = null) {
  return await request('/safety/fall-events', {
    method: 'POST',
    body: { confidence, location },
  });
}

export async function confirmFallSafe(eventId) {
  return await request(`/safety/fall-events/${eventId}/confirm-safe`, {
    method: 'POST',
  });
}

export async function fetchSafetyEvents() {
  return await request('/safety/events');
}

export async function fetchGeofences() {
  return await request('/safety/geofences');
}

export async function fetchCurrentLocation() {
  return await request('/safety/location/current');
}
