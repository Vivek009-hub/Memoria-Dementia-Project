/**
 * notification.service.js — B9 Push Notification & Deep-Link Route Dispatcher
 */

import { registerDeviceToken } from '../api/notifications.api.js';

class MobileNotificationService {
  constructor() {
    this.pushToken = null;
    this.navigationHandler = null;
  }

  setNavigationHandler(handler) {
    this.navigationHandler = handler;
  }

  async registerPushToken(token, platform = 'android') {
    this.pushToken = token;
    try {
      await registerDeviceToken(token, platform);
    } catch (err) {
      console.error('Failed to register push token with B9 backend', err);
    }
  }

  handleIncomingNotification(notificationData) {
    const { type, relatedResourceType, relatedResourceId } = notificationData;

    if (!this.navigationHandler) return;

    switch (type) {
      case 'SOS':
      case 'POSSIBLE_FALL':
      case 'GEOFENCE':
        this.navigationHandler('SafetyEvent', { eventId: relatedResourceId });
        break;

      case 'REMINDER':
        this.navigationHandler('Reminders', { reminderId: relatedResourceId });
        break;

      case 'COMMUNITY_SESSION':
        this.navigationHandler('Community', { sessionId: relatedResourceId });
        break;

      case 'MEETING':
        this.navigationHandler('Meetings', { meetingId: relatedResourceId });
        break;

      default:
        this.navigationHandler('Home');
        break;
    }
  }
}

export const mobileNotificationService = new MobileNotificationService();
