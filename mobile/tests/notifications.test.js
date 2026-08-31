/**
 * notifications.test.js — Integration & Unit Tests for Notifications & Activity Center (Phase F8 / B9)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../src/api/client.js';
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../src/api/notifications.api.js';

describe('Notifications & Activity Center API Integration (Phase F8)', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = new ApiClient({ baseUrl: 'http://test-server/api/v1' });
  });

  it('fetches list of notifications from GET /notifications', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: [{ _id: 'notif_1', title: 'Community Session Alert', type: 'COMMUNITY_SESSION', isRead: false }],
    });

    const res = await listNotifications({ isRead: 'false', limit: 20 }, mockClient);

    expect(mockGet).toHaveBeenCalledWith('/notifications?isRead=false&limit=20');
    expect(res.success).toBe(true);
    expect(res.data[0].title).toBe('Community Session Alert');
  });

  it('fetches unread count from GET /notifications/unread-count', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: { unreadCount: 3 },
    });

    const res = await getUnreadCount(mockClient);

    expect(mockGet).toHaveBeenCalledWith('/notifications/unread-count');
    expect(res.success).toBe(true);
    expect(res.data.unreadCount).toBe(3);
  });

  it('marks a single notification as read via POST /notifications/:id/read', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { _id: 'notif_1', isRead: true },
    });

    const res = await markAsRead('notif_1', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/notifications/notif_1/read');
    expect(res.success).toBe(true);
    expect(res.data.isRead).toBe(true);
  });

  it('marks all notifications as read via POST /notifications/read-all', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { modifiedCount: 4 },
    });

    const res = await markAllAsRead(mockClient);

    expect(mockPost).toHaveBeenCalledWith('/notifications/read-all');
    expect(res.success).toBe(true);
    expect(res.data.modifiedCount).toBe(4);
  });

  it('fetches and updates notification preferences', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: { channels: { inApp: true, push: true, email: false, sms: false } },
    });
    const mockPatch = vi.spyOn(mockClient, 'patch').mockResolvedValue({
      success: true,
      data: { channels: { inApp: true, push: true, email: true, sms: false } },
    });

    const getRes = await getNotificationPreferences(mockClient);
    expect(mockGet).toHaveBeenCalledWith('/notifications/preferences');
    expect(getRes.success).toBe(true);

    const updateRes = await updateNotificationPreferences(
      { channels: { email: true } },
      mockClient
    );
    expect(mockPatch).toHaveBeenCalledWith('/notifications/preferences', {
      channels: { email: true },
    });
    expect(updateRes.success).toBe(true);
  });
});
