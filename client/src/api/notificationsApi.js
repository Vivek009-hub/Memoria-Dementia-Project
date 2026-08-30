/**
 * notificationsApi.js — Notifications & Preferences API endpoints (B9)
 */

import { request } from './client.js';

export async function fetchNotifications() {
  return await request('/notifications');
}

export async function fetchUnreadNotificationCount() {
  return await request('/notifications/unread-count');
}

export async function markNotificationAsRead(notificationId) {
  return await request(`/notifications/${notificationId}/read`, {
    method: 'POST',
  });
}

export async function markAllNotificationsAsRead() {
  return await request('/notifications/read-all', {
    method: 'POST',
  });
}

export async function fetchNotificationPreferences() {
  return await request('/notifications/preferences');
}

export async function updateNotificationPreferences(preferencesData) {
  return await request('/notifications/preferences', {
    method: 'PATCH',
    body: preferencesData,
  });
}
