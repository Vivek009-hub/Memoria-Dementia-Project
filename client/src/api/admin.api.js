/**
 * admin.api.js — Admin Control Center REST API Client (Phase F13 / B7, B4, B13)
 */
import { defaultApiClient } from './client.js';

export async function createProposalIdea(ideaData, client = defaultApiClient) {
  return await client.post('/admin/community/sessions/ideas', ideaData);
}

export async function createProposal(ideaData, client = defaultApiClient) {
  return await client.post('/admin/community/sessions/ideas', ideaData);
}

export async function getVotingResults(client = defaultApiClient) {
  return await client.get('/admin/community/sessions/voting/results');
}

export async function getAdminProposals(client = defaultApiClient) {
  return await client.get('/community/sessions/voting');
}

export async function toggleProposalVoting(ideaId, isOpen, client = defaultApiClient) {
  return await client.patch(`/admin/community/sessions/ideas/${ideaId}/toggle-voting`, { isOpen });
}

export async function approveProposalIdea(ideaId, client = defaultApiClient) {
  return await client.post(`/admin/community/sessions/ideas/${ideaId}/approve`);
}

export async function scheduleSession(sessionData, client = defaultApiClient) {
  return await client.post('/admin/community/sessions/schedule', sessionData);
}

export async function publishScheduledSession(sessionData, client = defaultApiClient) {
  return await client.post('/admin/community/sessions/schedule', sessionData);
}

export async function getAdminScheduledSessions(client = defaultApiClient) {
  return await client.get('/community/sessions/schedule');
}

export async function getAdminOverview(client = defaultApiClient) {
  return await client.get('/admin/analytics/overview');
}

export async function getAdminSystemAnalytics(client = defaultApiClient) {
  return await client.get('/admin/analytics/overview');
}

export async function cancelSession(sessionId, reason = '', client = defaultApiClient) {
  return await client.post(`/admin/community/sessions/${sessionId}/cancel`, { reason });
}

// User Management API
export async function getAdminUsers(params = {}, client = defaultApiClient) {
  return await client.get('/admin/users', { params });
}

export async function updateUserRole(userId, role, client = defaultApiClient) {
  return await client.patch(`/admin/users/${userId}/role`, { role });
}

export async function updateUserStatus(userId, isActive, client = defaultApiClient) {
  return await client.patch(`/admin/users/${userId}/status`, { isActive });
}

// Activity Audit Log API
export async function getAdminActivity(params = {}, client = defaultApiClient) {
  return await client.get('/admin/analytics/activity', { params });
}

// Traffic Monitoring API
export async function getAdminTraffic(params = {}, client = defaultApiClient) {
  return await client.get('/admin/analytics/traffic', { params });
}

export async function createGameDefinition(gameData, client = defaultApiClient) {
  return await client.post('/games', gameData);
}

export async function updateGameDefinition(gameId, gameData, client = defaultApiClient) {
  return await client.patch(`/games/${gameId}`, gameData);
}
