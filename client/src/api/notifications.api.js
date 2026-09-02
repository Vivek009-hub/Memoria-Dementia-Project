/**
 * notifications.api.js — Notifications REST API Client (Phase F8 / B9)
 */
import { defaultApiClient } from './client.js';

export async function getNotifications(params = {}, client = defaultApiClient) {
<<<<<<< HEAD
  const cleanParams = {};
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      cleanParams[key] = params[key];
    }
  });
  const query = new URLSearchParams(cleanParams).toString();
=======
  const cleanParams = new URLSearchParams();

  if (params.unreadOnly !== undefined && params.unreadOnly !== null) {
    if (params.unreadOnly === true || params.unreadOnly === 'true') {
      cleanParams.append('isRead', 'false');
    }
  } else if (
    params.isRead !== undefined &&
    params.isRead !== null &&
    params.isRead !== '' &&
    params.isRead !== 'undefined'
  ) {
    cleanParams.append('isRead', String(params.isRead));
  }

  if (params.type && params.type !== 'undefined' && params.type !== 'null') {
    cleanParams.append('type', params.type);
  }

  if (params.page) {
    cleanParams.append('page', String(params.page));
  }

  if (params.limit) {
    cleanParams.append('limit', String(params.limit));
  }

  const query = cleanParams.toString();
>>>>>>> 8f89331061b3870126831291985392f62d3f7d5f
  return await client.get(`/notifications${query ? `?${query}` : ''}`);
}

export async function getUnreadCount(client = defaultApiClient) {
  return await client.get('/notifications/unread-count');
}

export async function markAsRead(id, client = defaultApiClient) {
  return await client.post(`/notifications/${id}/read`);
}

export async function markAllAsRead(client = defaultApiClient) {
  return await client.post('/notifications/read-all');
}

export async function getNotificationPreferences(client = defaultApiClient) {
  return await client.get('/notifications/preferences');
}

export async function updateNotificationPreferences(preferences, client = defaultApiClient) {
  return await client.patch('/notifications/preferences', preferences);
}
