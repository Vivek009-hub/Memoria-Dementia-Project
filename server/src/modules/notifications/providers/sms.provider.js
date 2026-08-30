/**
 * providers/sms.provider.js — SMS notification delivery abstraction (B9)
 *
 * Mock implementation. No SMS provider (Twilio, AWS SNS, etc.) has been
 * selected for this project.
 *
 * When a provider is selected:
 *   1. Set SMS_PROVIDER in environment.
 *   2. Implement the adapter and replace the mock below.
 *
 * Environment variables (add to .env when configuring a real provider):
 *   SMS_PROVIDER=        (e.g. TWILIO, AWS_SNS)
 *   SMS_PROVIDER_API_KEY= (never commit the real value)
 */

import logger from '../../../utils/logger.js';

/**
 * Deliver an SMS notification.
 *
 * @param {object} notification  - The saved Mongoose Notification document
 * @param {string} phoneNumber   - Recipient phone number (E.164 format)
 * @returns {Promise<{ channel: string, status: string }>}
 */
export async function deliverSms(notification, phoneNumber) {
  logger.info(
    {
      notificationId: notification._id,
      type: notification.type,
      // Do NOT log the full phone number
      phonePrefix: phoneNumber ? phoneNumber.substring(0, 4) + '...' : null,
    },
    '[sms.provider] Mock SMS delivery — no provider configured'
  );

  return {
    channel: 'SMS',
    status: 'MOCK_SENT',
    notificationId: notification._id,
  };
}
