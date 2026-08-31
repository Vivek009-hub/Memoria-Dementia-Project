/**
 * notifications.api.js — Notifications & Activity Center API Integration (Phase F8 / B9)
 *
 * Calls Memora B9 REST API endpoints for patient notifications, unread count,
 * mark-read operations, and preferences.
 */

import { defaultApiClient } from './client.js';

/**
 * List patient notifications with optional filtering and pagination.
 * @param {Object} params - { isRead, type, page, limit }
 * @param {Object} [client=defaultApiClient]
 */
export async function listNotifications(params = {}, client = defaultApiClient) {
  const query = new URLSearchParams();
  if (params.isRead !== undefined) query.append('isRead', params.isRead);
  if (params.type) query.append('type', params.type);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const queryString = query.toString();
  return await client.get(`/notifications${queryString ? `?${queryString}` : ''}`);
}

/**
 * Fetch total count of unread notifications for authenticated user.
 * @param {Object} [client=defaultApiClient]
 */
export async function getUnreadCount(client = defaultApiClient) {
  return await client.get('/notifications/unread-count');
}

/**
 * Mark a single notification as read.
 * @param {string} notificationId
 * @param {Object} [client=defaultApiClient]
 */
export async function markAsRead(notificationId, client = defaultApiClient) {
  return await client.post(`/notifications/${notificationId}/read`);
}

/**
 * Mark all unread notifications as read.
 * @param {Object} [client=defaultApiClient]
 */
export async function markAllAsRead(client = defaultApiClient) {
  return await client.post('/notifications/read-all');
}

/**
 * Fetch notification preferences for authenticated user.
 * @param {Object} [client=defaultApiClient]
 */
export async function getNotificationPreferences(client = defaultApiClient) {
  return await client.get('/notifications/preferences');
}

/**
 * Update notification preferences for authenticated user.
 * @param {Object} data - Partial preferences update
 * @param {Object} [client=defaultApiClient]
 */
export async function updateNotificationPreferences(data, client = defaultApiClient) {
  return await client.patch('/notifications/preferences', data);
}
