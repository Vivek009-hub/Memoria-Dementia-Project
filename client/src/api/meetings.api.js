/**
 * meetings.api.js — Meeting Circle REST API Client (Phase F7 / B8)
 */
import { defaultApiClient } from './client.js';

export async function joinMeetingRoom(sessionId, client = defaultApiClient) {
  return await client.post(`/meetings/sessions/${sessionId}/meeting/join`);
}

export async function getMeetingCredentials(sessionId, client = defaultApiClient) {
  return await client.get(`/meetings/sessions/${sessionId}/meeting/credentials`);
}

export async function getMeetingStatus(sessionId, client = defaultApiClient) {
  return await client.get(`/meetings/sessions/${sessionId}/meeting/status`);
}

export async function leaveMeetingRoom(sessionId, client = defaultApiClient) {
  return await client.post(`/meetings/sessions/${sessionId}/meeting/leave`);
}
