/**
 * providers/push.provider.js — Push notification delivery abstraction (B9)
 *
 * This is a provider abstraction + mock implementation.
 * No push provider (FCM, APNs, etc.) has been selected for this project yet.
 *
 * When a provider is selected:
 *   1. Read the PUSH_PROVIDER env variable.
 *   2. Import the appropriate adapter (e.g. fcm.adapter.js).
 *   3. Replace the mock below with the adapter call.
 *
 * This file must NOT contain hardcoded FCM or APNs calls.
 *
 * Environment variables (add to .env when configuring a real provider):
 *   PUSH_PROVIDER=         (e.g. FCM)
 *   PUSH_PROVIDER_API_KEY= (never commit the real value)
 */

import logger from '../../../utils/logger.js';

/**
 * Deliver a push notification to a device token.
 *
 * @param {object} notification  - The saved Mongoose Notification document
 * @param {string} deviceToken   - The target device push token
 * @returns {Promise<{ channel: string, status: string }>}
 */
export async function deliverPush(notification, deviceToken) {
  // Mock implementation — log and return success.
  // Replace with real provider adapter when a push provider is selected.
  logger.info(
    {
      notificationId: notification._id,
      type: notification.type,
      // Do NOT log the full device token — log only a prefix for debugging
      deviceTokenPrefix: deviceToken ? deviceToken.substring(0, 8) + '...' : null,
    },
    '[push.provider] Mock push delivery — no provider configured'
  );

  return {
    channel: 'PUSH',
    status: 'MOCK_SENT',
    notificationId: notification._id,
  };
}
