/**
 * community.api.js — Community Sessions & Proposals API Integration (Phase F7 / B7)
 *
 * Calls Memora B7 REST API endpoints for voting proposals, scheduled sessions, and pre-registration.
 */

import { defaultApiClient } from './client.js';

/**
 * Fetch voting proposals open for community vote.
 * @param {Object} params - { category, page, limit }
 * @param {Object} [client=defaultApiClient]
 */
export async function getVotingProposals(params = {}, client = defaultApiClient) {
  const query = new URLSearchParams();
  if (params.category) query.append('category', params.category);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const queryString = query.toString();
  return await client.get(`/community/sessions/voting${queryString ? `?${queryString}` : ''}`);
}

/**
 * Vote for a community session proposal.
 * @param {string} ideaId
 * @param {Object} [client=defaultApiClient]
 */
export async function voteForProposal(ideaId, client = defaultApiClient) {
  return await client.post(`/community/sessions/ideas/${ideaId}/vote`);
}

/**
 * Remove/cancel vote for a proposal.
 * @param {string} ideaId
 * @param {Object} [client=defaultApiClient]
 */
export async function removeVote(ideaId, client = defaultApiClient) {
  return await client.delete(`/community/sessions/ideas/${ideaId}/vote`);
}

/**
 * Fetch officially approved scheduled sessions.
 * @param {Object} params - { status, category, page, limit }
 * @param {Object} [client=defaultApiClient]
 */
export async function getSchedule(params = {}, client = defaultApiClient) {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.category) query.append('category', params.category);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const queryString = query.toString();
  return await client.get(`/community/sessions/schedule${queryString ? `?${queryString}` : ''}`);
}

/**
 * Get details for a single scheduled session.
 * @param {string} sessionId
 * @param {Object} [client=defaultApiClient]
 */
export async function getSessionById(sessionId, client = defaultApiClient) {
  return await client.get(`/community/sessions/${sessionId}`);
}

/**
 * Pre-register for a scheduled session.
 * @param {string} sessionId
 * @param {Object} [client=defaultApiClient]
 */
export async function registerForSession(sessionId, client = defaultApiClient) {
  return await client.post(`/community/sessions/${sessionId}/register`);
}

/**
 * Cancel pre-registration for a scheduled session.
 * @param {string} sessionId
 * @param {Object} [client=defaultApiClient]
 */
export async function cancelRegistration(sessionId, client = defaultApiClient) {
  return await client.delete(`/community/sessions/${sessionId}/register`);
}

/**
 * Fetch patient's active session registrations.
 * @param {Object} params - { page, limit }
 * @param {Object} [client=defaultApiClient]
 */
export async function getMyRegistrations(params = {}, client = defaultApiClient) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const queryString = query.toString();
  return await client.get(`/community/sessions/registrations/me${queryString ? `?${queryString}` : ''}`);
}
