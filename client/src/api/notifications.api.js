/**
 * notifications.api.js — Notifications REST API Client (Phase F8 / B9)
 */
import { defaultApiClient } from './client.js';

export async function getNotifications(params = {}, client = defaultApiClient) {
  const query = new URLSearchParams(params).toString();
  return await client.get(`/notifications${query ? `?${query}` : ''}`);
}

export async function getUnreadCount(client = defaultApiClient) {
  return await client.get('/notifications/unread-count');
}

export async function markAsRead(id, client = defaultApiClient) {
  return await client.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead(client = defaultApiClient) {
  return await client.post('/notifications/mark-all-read');
}

export async function getNotificationPreferences(client = defaultApiClient) {
  return await client.get('/notifications/preferences');
}

export async function updateNotificationPreferences(preferences, client = defaultApiClient) {
  return await client.patch('/notifications/preferences', preferences);
}
