/**
 * safetyApi.js — API Service for B12 Safety & Emergency Backend (Phase F9)
 *
 * Calls Memora B12 REST API endpoints for SOS triggers, location ingestion,
 * fall detection events, geofences, and safety event resolution.
 */

import { defaultApiClient } from './client.js';

/**
 * Trigger Emergency SOS alert.
 * @param {Object} [location] - { latitude, longitude, accuracy }
 * @param {string} [clientEventId] - Idempotency key
 * @param {Object} [client=defaultApiClient]
 */
export async function triggerSOS(location = null, clientEventId = null, client = defaultApiClient) {
  return await client.post('/safety/sos', { location, clientEventId });
}

/**
 * Ingest GPS location update.
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} [accuracy=0]
 * @param {Object} [client=defaultApiClient]
 */
export async function sendLocation(latitude, longitude, accuracy = 0, client = defaultApiClient) {
  return await client.post('/safety/location', { latitude, longitude, accuracy, source: 'MOBILE_APP' });
}

/**
 * Ingest fall detection event.
 * @param {number} [confidence=0.9]
 * @param {Object} [location]
 * @param {Object} [client=defaultApiClient]
 */
export async function sendFallEvent(confidence = 0.9, location = null, client = defaultApiClient) {
  return await client.post('/safety/fall-events', { confidence, location });
}

/**
 * Confirm patient is safe after fall alert.
 * @param {string} eventId
 * @param {Object} [client=defaultApiClient]
 */
export async function confirmFallSafe(eventId, client = defaultApiClient) {
  return await client.post(`/safety/fall-events/${eventId}/confirm-safe`);
}

/**
 * Resolve active safety event.
 * @param {string} eventId
 * @param {string} [notes]
 * @param {Object} [client=defaultApiClient]
 */
export async function resolveSafetyEvent(eventId, notes = 'Resolved by patient', client = defaultApiClient) {
  return await client.post(`/safety/events/${eventId}/resolve`, { notes });
}

/**
 * Cancel safety event.
 * @param {string} eventId
 * @param {string} [reason]
 * @param {Object} [client=defaultApiClient]
 */
export async function cancelSafetyEvent(eventId, reason = 'Accidental trigger', client = defaultApiClient) {
  return await client.post(`/safety/events/${eventId}/cancel`, { reason });
}

/**
 * Fetch patient safety event history.
 * @param {Object} [client=defaultApiClient]
 */
export async function fetchSafetyEvents(client = defaultApiClient) {
  return await client.get('/safety/events');
}

/**
 * Fetch active geofence boundaries.
 * @param {Object} [client=defaultApiClient]
 */
export async function fetchGeofences(client = defaultApiClient) {
  return await client.get('/safety/geofences');
}

/**
 * Fetch patient's latest verified GPS location.
 * @param {Object} [client=defaultApiClient]
 */
export async function fetchCurrentLocation(client = defaultApiClient) {
  return await client.get('/safety/location/current');
}
