/**
 * safety.api.js — Safety REST API Client (Phase F9 / B12-B13)
 */
import { defaultApiClient } from './client.js';

export async function triggerSOS(reason = 'MANUAL_SOS', location = null, client = defaultApiClient) {
  return await client.post('/safety/sos', { reason, location });
}

export async function cancelSOS(eventId, client = defaultApiClient) {
  return await client.post(`/safety/events/${eventId}/cancel`);
}

export async function sendLocation(latitude, longitude, accuracy = null, client = defaultApiClient) {
  return await client.post('/safety/location', { latitude, longitude, accuracy });
}

export async function getCurrentLocation(patientId, client = defaultApiClient) {
  return await client.get(`/safety/location/current${patientId ? `?patientId=${patientId}` : ''}`);
}

export async function getGeofenceStatus(patientId, client = defaultApiClient) {
  return await client.get(`/safety/geofence/status${patientId ? `?patientId=${patientId}` : ''}`);
}

export async function reportFallEvent(fallData, client = defaultApiClient) {
  return await client.post('/safety/fall-events', fallData);
}

export async function confirmFallSafe(eventId, client = defaultApiClient) {
  return await client.post(`/safety/fall-events/${eventId}/safe`);
}

export async function getActiveSafetyEvents(patientId, client = defaultApiClient) {
  return await client.get(`/safety/events/active${patientId ? `?patientId=${patientId}` : ''}`);
}

export async function resolveSafetyEvent(eventId, notes = '', client = defaultApiClient) {
  return await client.post(`/safety/events/${eventId}/resolve`, { notes });
}

export async function getCompanionStatus(patientId, client = defaultApiClient) {
  return await client.get(`/safety/companion/status${patientId ? `?patientId=${patientId}` : ''}`);
}
