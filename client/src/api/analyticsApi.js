/**
 * analyticsApi.js — Cognitive Progress & Analytics API endpoints (B10)
 */

import { request } from './client.js';

export async function fetchPatientOverviewAnalytics(patientId = null) {
  const endpoint = patientId ? `/analytics/patient/${patientId}/overview` : '/analytics/me/overview';
  return await request(endpoint);
}

export async function fetchGameSummaryAnalytics() {
  return await request('/analytics/games/summary');
}

export async function fetchGameTrendsAnalytics(timeframe = '30d') {
  return await request(`/analytics/games/trends?timeframe=${timeframe}`);
}

export async function fetchReminderSummaryAnalytics() {
  return await request('/analytics/reminders/summary');
}

export async function fetchAdminOverviewAnalytics() {
  return await request('/admin/analytics/overview');
}
