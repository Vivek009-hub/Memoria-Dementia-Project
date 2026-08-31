/**
 * meetings.api.js — Meeting Circle API Integration (Phase F7 / B8)
 *
 * Calls Memora B8 REST API endpoints for meeting credentials, room status, join/leave actions.
 */

import { defaultApiClient } from './client.js';

/**
 * Get meeting room details for a session.
 * @param {string} sessionId
 * @param {Object} [client=defaultApiClient]
 */
export async function getMeeting(sessionId, client = defaultApiClient) {
  return await client.get(`/meetings/sessions/${sessionId}/meeting`);
}

/**
 * Join meeting circle & receive token credentials.
 * @param {string} sessionId
 * @param {Object} [client=defaultApiClient]
 */
export async function joinMeeting(sessionId, client = defaultApiClient) {
  return await client.post(`/meetings/sessions/${sessionId}/meeting/join`);
}

/**
 * Leave an active meeting circle.
 * @param {string} sessionId
 * @param {Object} [client=defaultApiClient]
 */
export async function leaveMeeting(sessionId, client = defaultApiClient) {
  return await client.post(`/meetings/sessions/${sessionId}/meeting/leave`);
}

/**
 * Get patient's meeting attendance history.
 * @param {Object} [client=defaultApiClient]
 */
export async function getPatientMeetingHistory(client = defaultApiClient) {
  return await client.get('/meetings/history');
}
