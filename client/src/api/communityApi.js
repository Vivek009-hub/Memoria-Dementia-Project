/**
 * communityApi.js — Community Sessions & Proposals API endpoints (B7)
 */

import { request } from './client.js';

export async function fetchProposals() {
  return await request('/community/proposals');
}

export async function voteForProposal(proposalId) {
  return await request(`/community/proposals/${proposalId}/vote`, {
    method: 'POST',
  });
}

export async function fetchCommunitySessions() {
  return await request('/community/sessions');
}

export async function registerForSession(sessionId) {
  return await request(`/community/sessions/${sessionId}/register`, {
    method: 'POST',
  });
}

export async function cancelSessionRegistration(sessionId) {
  return await request(`/community/sessions/${sessionId}/register`, {
    method: 'DELETE',
  });
}
