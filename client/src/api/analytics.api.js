/**
 * analytics.api.js — Analytics & Progress REST API Client (Phase F14 / B14)
 */
import { defaultApiClient } from './client.js';

export async function getMeOverview(client = defaultApiClient) {
  return await client.get('/analytics/me/overview');
}

export async function getAnalyticsOverview({ days = 7, patientId } = {}, client = defaultApiClient) {
  if (patientId) {
    return await client.get(`/analytics/patient/${patientId}/overview?days=${days}`);
  }
  return await client.get(`/analytics/me/overview?days=${days}`);
}

export async function getPatientOverview(patientId, client = defaultApiClient) {
  return await client.get(`/analytics/patient/${patientId}/overview`);
}

export async function getGameSummary(client = defaultApiClient) {
  return await client.get('/analytics/games/summary');
}

export async function getGameHistory(client = defaultApiClient) {
  return await client.get('/analytics/games/history');
}

export async function getGameTrends(client = defaultApiClient) {
  return await client.get('/analytics/games/trends');
}

export async function getReminderSummary(client = defaultApiClient) {
  return await client.get('/analytics/reminders/summary');
}

export async function getReminderTrends(client = defaultApiClient) {
  return await client.get('/analytics/reminders/trends');
}

export async function getMemorySummary(client = defaultApiClient) {
  return await client.get('/analytics/memories/summary');
}

export async function getCommunitySummary(client = defaultApiClient) {
  return await client.get('/analytics/community/summary');
}

export async function getEngagementTrends(client = defaultApiClient) {
  return await client.get('/analytics/engagement');
}

export async function getAdminOverviewAnalytics(client = defaultApiClient) {
  return await client.get('/admin/analytics/overview');
}
