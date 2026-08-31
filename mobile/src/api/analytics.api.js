/**
 * analytics.api.js — Analytics & Progress API Integration (Phase F14)
 *
 * Calls Memora REST API endpoints for patient, caregiver, and admin analytics.
 */

import { defaultApiClient } from './client.js';

/**
 * Fetch patient self overview progress analytics.
 * @param {Object} [client=defaultApiClient]
 */
export async function getMeOverview(client = defaultApiClient) {
  return await client.get('/analytics/me/overview');
}

/**
 * Fetch authorized patient progress analytics for caregivers.
 * @param {string} patientId
 * @param {Object} [client=defaultApiClient]
 */
export async function getPatientOverview(patientId, client = defaultApiClient) {
  return await client.get(`/analytics/patient/${patientId}/overview`);
}

/**
 * Fetch cognitive game performance summary.
 * @param {Object} [client=defaultApiClient]
 */
export async function getGameSummary(client = defaultApiClient) {
  return await client.get('/analytics/games/summary');
}

/**
 * Fetch cognitive game history log.
 * @param {Object} [client=defaultApiClient]
 */
export async function getGameHistory(client = defaultApiClient) {
  return await client.get('/analytics/games/history');
}

/**
 * Fetch cognitive game performance trends.
 * @param {Object} [client=defaultApiClient]
 */
export async function getGameTrends(client = defaultApiClient) {
  return await client.get('/analytics/games/trends');
}

/**
 * Fetch routine reminder completion summary.
 * @param {Object} [client=defaultApiClient]
 */
export async function getReminderSummary(client = defaultApiClient) {
  return await client.get('/analytics/reminders/summary');
}

/**
 * Fetch routine reminder adherence trends.
 * @param {Object} [client=defaultApiClient]
 */
export async function getReminderTrends(client = defaultApiClient) {
  return await client.get('/analytics/reminders/trends');
}

/**
 * Fetch memory vault activity count.
 * @param {Object} [client=defaultApiClient]
 */
export async function getMemorySummary(client = defaultApiClient) {
  return await client.get('/analytics/memories/summary');
}

/**
 * Fetch community session participation.
 * @param {Object} [client=defaultApiClient]
 */
export async function getCommunitySummary(client = defaultApiClient) {
  return await client.get('/analytics/community/summary');
}

/**
 * Fetch overall activity engagement trends.
 * @param {Object} [client=defaultApiClient]
 */
export async function getEngagementTrends(client = defaultApiClient) {
  return await client.get('/analytics/engagement');
}

/**
 * Fetch admin platform overview analytics.
 * @param {Object} [client=defaultApiClient]
 */
export async function getAdminOverviewAnalytics(client = defaultApiClient) {
  return await client.get('/admin/analytics/overview');
}
