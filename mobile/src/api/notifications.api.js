/**
 * notifications.api.js — B9 Notification API Integration
 */

import { defaultApiClient } from './client.js';

export async function registerDeviceToken(pushToken, platform, client = defaultApiClient) {
  return await client.post('/notifications/device-token', { pushToken, platform });
}

export async function getNotifications(params = {}, client = defaultApiClient) {
  const query = new URLSearchParams(params).toString();
  const endpoint = `/notifications${query ? `?${query}` : ''}`;
  return await client.get(endpoint);
}

export async function markNotificationRead(notificationId, client = defaultApiClient) {
  return await client.post(`/notifications/${notificationId}/read`);
}

export async function getUnreadCount(client = defaultApiClient) {
  return await client.get('/notifications/unread-count');
}
