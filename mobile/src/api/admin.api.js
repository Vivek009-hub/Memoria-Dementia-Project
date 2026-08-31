/**
 * admin.api.js — Admin Module API Integration (Phase F13)
 *
 * Calls Memora REST API endpoints for platform administration.
 */

import { defaultApiClient } from './client.js';

/**
 * Create a new community session proposal idea (Admin).
 * @param {Object} data - { title, description, category, targetAudience }
 * @param {Object} [client=defaultApiClient]
 */
export async function createProposal(data, client = defaultApiClient) {
  return await client.post('/admin/community/sessions/ideas', data);
}

/**
 * Update an existing proposal idea (Admin).
 * @param {string} ideaId
 * @param {Object} data
 * @param {Object} [client=defaultApiClient]
 */
export async function updateProposal(ideaId, data, client = defaultApiClient) {
  return await client.patch(`/admin/community/sessions/ideas/${ideaId}`, data);
}

/**
 * Get voting results and vote count tallies (Admin).
 * @param {Object} [client=defaultApiClient]
 */
export async function getVotingResults(client = defaultApiClient) {
  return await client.get('/admin/community/sessions/voting/results');
}

/**
 * Approve a voting proposal idea (Admin).
 * @param {string} ideaId
 * @param {Object} [client=defaultApiClient]
 */
export async function approveProposal(ideaId, client = defaultApiClient) {
  return await client.post(`/admin/community/sessions/ideas/${ideaId}/approve`);
}

/**
 * Schedule an approved session (Admin).
 * @param {Object} data - { ideaId, title, scheduledAt, hostName, hostRole, maxCapacity, meetingType }
 * @param {Object} [client=defaultApiClient]
 */
export async function scheduleSession(data, client = defaultApiClient) {
  return await client.post('/admin/community/sessions/schedule', data);
}

/**
 * Update scheduled session details (Admin).
 * @param {string} sessionId
 * @param {Object} data
 * @param {Object} [client=defaultApiClient]
 */
export async function updateSession(sessionId, data, client = defaultApiClient) {
  return await client.patch(`/admin/community/sessions/${sessionId}`, data);
}

/**
 * Cancel a scheduled session (Admin).
 * @param {string} sessionId
 * @param {Object} [client=defaultApiClient]
 */
export async function cancelSession(sessionId, client = defaultApiClient) {
  return await client.post(`/admin/community/sessions/${sessionId}/cancel`);
}

/**
 * Get session registrations list (Admin).
 * @param {string} sessionId
 * @param {Object} [client=defaultApiClient]
 */
export async function getSessionRegistrations(sessionId, client = defaultApiClient) {
  return await client.get(`/admin/community/sessions/${sessionId}/registrations`);
}

/**
 * Create a new cognitive game definition (Admin).
 * @param {Object} data - { title, description, category, difficulty }
 * @param {Object} [client=defaultApiClient]
 */
export async function createGame(data, client = defaultApiClient) {
  return await client.post('/games', data);
}

/**
 * Update a cognitive game definition (Admin).
 * @param {string} gameId
 * @param {Object} data
 * @param {Object} [client=defaultApiClient]
 */
export async function updateGame(gameId, data, client = defaultApiClient) {
  return await client.patch(`/games/${gameId}`, data);
}
