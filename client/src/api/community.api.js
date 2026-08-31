/**
 * community.api.js — Community REST API Client (Phase F7 / B7)
 */
import { defaultApiClient } from './client.js';

export async function getVotingProposals(client = defaultApiClient) {
  return await client.get('/community/sessions/voting');
}

export async function castVote(proposalId, client = defaultApiClient) {
  return await client.post(`/community/sessions/ideas/${proposalId}/vote`);
}

export async function getScheduledSessions(client = defaultApiClient) {
  return await client.get('/community/sessions/scheduled');
}

export async function registerForSession(sessionId, client = defaultApiClient) {
  return await client.post(`/community/sessions/scheduled/${sessionId}/register`);
}

export async function getSession(sessionId, client = defaultApiClient) {
  return await client.get(`/community/sessions/scheduled/${sessionId}`);
}

export async function submitProposalIdea(ideaData, client = defaultApiClient) {
  return await client.post('/admin/community/sessions/ideas', ideaData);
}
