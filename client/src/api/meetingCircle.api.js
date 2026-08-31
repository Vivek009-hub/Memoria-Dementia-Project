/**
 * meetingCircle.api.js — Meeting Circle REST API Client (Phase F7 / B8)
 */

import { defaultApiClient } from './client.js';

export async function getDiscoverableCircles(client = defaultApiClient) {
  return await client.get('/meeting-circles/discover');
}

export async function getMyCircles(client = defaultApiClient) {
  return await client.get('/meeting-circles/mine');
}

export async function createCircle(circleData, client = defaultApiClient) {
  return await client.post('/meeting-circles', circleData);
}

export async function getCircleById(circleId, client = defaultApiClient) {
  return await client.get(`/meeting-circles/${circleId}`);
}

export async function joinCircle(circleId, client = defaultApiClient) {
  return await client.post(`/meeting-circles/${circleId}/join`);
}

export async function leaveCircle(circleId, client = defaultApiClient) {
  return await client.post(`/meeting-circles/${circleId}/leave`);
}

export async function deleteCircle(circleId, client = defaultApiClient) {
  return await client.delete(`/meeting-circles/${circleId}`);
}

export async function reportParticipant(circleId, reportData, client = defaultApiClient) {
  return await client.post(`/meeting-circles/${circleId}/report`, reportData);
}

export async function getActiveParticipants(circleId, client = defaultApiClient) {
  return await client.get(`/meeting-circles/${circleId}/participants`);
}
