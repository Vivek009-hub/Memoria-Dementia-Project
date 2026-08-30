/**
 * notification.worker.js — Async notification delivery worker (B9)
 *
 * Architecture:
 *   After a notification is created in the DB, the service calls
 *   dispatchDelivery(notification, userId). This function:
 *
 *     1. Loads the user's notification preferences (or defaults).
 *     2. Routes the notification to each enabled channel's provider.
 *     3. Isolates provider failures — one channel failing does NOT
 *        prevent other channels from delivering.
 *
 * Queue strategy:
 *   Delivery is dispatched via setImmediate() so it runs after the
 *   current event-loop tick without blocking the HTTP response.
 *
 *   This is intentionally NOT a real message queue. When production
 *   requirements justify it, replace the setImmediate() dispatch with
 *   a BullMQ/Redis job and implement this file as the job processor.
 *   The notification.service.js interface does not need to change.
 *
 * Failure isolation:
 *   A failed push/email/SMS delivery does NOT affect in-app delivery
 *   or the core business operation. Errors are logged, not rethrown.
 *
 * Retry strategy:
 *   For B9 with mock providers, no retry is needed. When real providers
 *   are integrated, each provider adapter should implement its own
 *   bounded retry with exponential backoff. Document the strategy when
 *   implementing a real provider.
 */

import { logger } from '../../utils/logger.js';
import NotificationPreference from './notificationPreference.model.js';
import { deliverInApp } from './providers/inApp.provider.js';
import { deliverPush } from './providers/push.provider.js';
import { deliverEmail } from './providers/email.provider.js';
import { deliverSms } from './providers/sms.provider.js';

// ── Default preferences (used when no preference document exists) ─────────────

const DEFAULT_PREFERENCES = {
  channels: { inApp: true, push: false, email: false, sms: false },
};

// ── Worker ────────────────────────────────────────────────────────────────────

/**
 * Dispatch notification delivery asynchronously.
 *
 * This function schedules the actual work via setImmediate so it does not
 * block the HTTP response. The notification is already persisted in MongoDB
 * before this is called.
 *
 * @param {object} notification - Saved Mongoose Notification document
 * @param {string} userId       - String representation of the recipient's userId
 */
export function dispatchDelivery(notification, userId) {
  setImmediate(() => {
    _runDelivery(notification, userId).catch((err) => {
      // Top-level catch — prevents unhandled promise rejection
      logger.error(
        { notificationId: notification._id, userId, err: err.message },
        '[notification.worker] Unexpected error in delivery dispatch'
      );
    });
  });
}

/**
 * Internal delivery execution. Loads preferences, routes to providers.
 *
 * @param {object} notification
 * @param {string} userId
 */
async function _runDelivery(notification, userId) {
  // Load preferences — fall back to defaults if not found
  let prefs;
  try {
    prefs = await NotificationPreference.findOne({ userId }).lean();
  } catch (err) {
    logger.warn(
      { userId, err: err.message },
      '[notification.worker] Could not load preferences — using defaults'
    );
    prefs = null;
  }

  const channels = prefs?.channels ?? DEFAULT_PREFERENCES.channels;

  // ── In-app delivery ───────────────────────────────────────────────────────
  if (channels.inApp !== false) {
    // In-app is always attempted regardless of preference (DB record = delivery)
    await _safeDeliver('inApp', () => deliverInApp(notification), notification._id);
  }

  // ── Push delivery ─────────────────────────────────────────────────────────
  if (channels.push) {
    // In B9 there is no device token management yet, so push is not delivered.
    // When DeviceToken model is added, look up tokens here and call deliverPush.
    logger.debug(
      { notificationId: notification._id },
      '[notification.worker] Push channel enabled but no device tokens to deliver to yet'
    );
  }

  // ── Email delivery ────────────────────────────────────────────────────────
  if (channels.email) {
    // No email provider configured — mock only
    await _safeDeliver('email', () => deliverEmail(notification, null), notification._id);
  }

  // ── SMS delivery ──────────────────────────────────────────────────────────
  if (channels.sms) {
    // No SMS provider configured — mock only
    await _safeDeliver('sms', () => deliverSms(notification, null), notification._id);
  }
}

/**
 * Run a delivery function safely, catching and logging any provider errors.
 * Provider failures do NOT propagate — failure isolation is the contract here.
 *
 * @param {string}   channel       - Channel name for logging
 * @param {Function} deliverFn     - Async delivery function
 * @param {*}        notificationId - For logging
 */
async function _safeDeliver(channel, deliverFn, notificationId) {
  try {
    const result = await deliverFn();
    logger.info(
      { channel, notificationId, status: result?.status },
      '[notification.worker] Channel delivery complete'
    );
  } catch (err) {
    // Log the failure but do NOT rethrow — failure isolation
    logger.error(
      { channel, notificationId, err: err.message },
      '[notification.worker] Provider delivery failed — isolated, not rethrowing'
    );
  }
}
