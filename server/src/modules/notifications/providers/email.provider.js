/**
 * providers/email.provider.js — Email notification delivery abstraction (B9)
 *
 * Mock implementation. No email provider (SendGrid, SES, etc.) has been
 * selected for this project.
 *
 * When a provider is selected:
 *   1. Set EMAIL_PROVIDER in environment.
 *   2. Implement the adapter and replace the mock below.
 *
 * Environment variables (add to .env when configuring a real provider):
 *   EMAIL_PROVIDER=        (e.g. SENDGRID, SES)
 *   EMAIL_PROVIDER_API_KEY= (never commit the real value)
 */

import { logger } from '../../../utils/logger.js';

/**
 * Deliver an email notification.
 *
 * @param {object} notification  - The saved Mongoose Notification document
 * @param {string} emailAddress  - Recipient email address
 * @returns {Promise<{ channel: string, status: string }>}
 */
export async function deliverEmail(notification, emailAddress) {
  logger.info(
    {
      notificationId: notification._id,
      type: notification.type,
      // Do NOT log the full email address in production logs
      emailDomain: emailAddress ? emailAddress.split('@')[1] : null,
    },
    '[email.provider] Mock email delivery — no provider configured'
  );

  return {
    channel: 'EMAIL',
    status: 'MOCK_SENT',
    notificationId: notification._id,
  };
}
