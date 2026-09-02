/**
 * safety.api.js — B12 Safety & Emergency API Integration
 */

import { defaultApiClient } from './client.js';

export async function sendSOS(payload = {}, client = defaultApiClient) {
  const hasCoordinates =
    payload.latitude !== undefined &&
    payload.latitude !== null &&
    payload.longitude !== undefined &&
    payload.longitude !== null;

  const body = {
    location: hasCoordinates
      ? {
          latitude: Number(payload.latitude),
          longitude: Number(payload.longitude),
          accuracy: payload.accuracy !== undefined && payload.accuracy !== null ? Number(payload.accuracy) : 0,
        }
      : null,
    clientEventId: payload.idempotencyKey || payload.clientEventId || null,
    ...(payload.idempotencyKey ? { idempotencyKey: payload.idempotencyKey } : {}),
    ...(hasCoordinates ? { latitude: Number(payload.latitude), longitude: Number(payload.longitude), accuracy: Number(payload.accuracy) } : {}),
  };
  return await client.post('/safety/sos', body);
}

export async function postLocationUpdate(locationData, client = defaultApiClient) {
  const body = {
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    accuracy: locationData.accuracy ?? null,
    batteryLevel: locationData.batteryLevel ?? null,
    timestamp: locationData.timestamp || new Date().toISOString(),
  };
  return await client.post('/safety/location', body);
}

export async function reportFallEvent(fallData, client = defaultApiClient) {
  const body = {
    detectedAt: fallData.detectedAt || new Date().toISOString(),
    confidence: fallData.confidence ?? 1.0,
    userConfirmed: fallData.userConfirmed ?? false,
    timedOut: fallData.timedOut ?? false,
    latitude: fallData.latitude ?? null,
    longitude: fallData.longitude ?? null,
    idempotencyKey: fallData.idempotencyKey || null,
  };
  return await client.post('/safety/fall-detection', body);
}

export async function getSafetyStatus(client = defaultApiClient) {
  return await client.get('/safety/status');
}

export async function getSafetyHistory(params = {}, client = defaultApiClient) {
  const query = new URLSearchParams(params).toString();
  const endpoint = `/safety/history${query ? `?${query}` : ''}`;
  return await client.get(endpoint);
}

export async function resolveSafetyEvent(eventId, note, client = defaultApiClient) {
  return await client.post(`/safety/events/${eventId}/resolve`, { note });
}
