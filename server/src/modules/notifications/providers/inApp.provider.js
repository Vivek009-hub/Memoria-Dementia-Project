/**
 * providers/inApp.provider.js — In-app notification delivery (B9)
 *
 * The in-app channel is database-backed: a Notification document IS the
 * delivery. No external network call needed.
 *
 * This provider is always active regardless of preference settings — the
 * NotificationPreference.channels.inApp flag controls whether the worker
 * should route here, but this provider itself does not enforce that.
 *
 * @param {object} notification - The saved Mongoose Notification document
 * @returns {Promise<{ channel: string, status: string }>}
 */
export async function deliverInApp(notification) {
  // The notification record itself is the in-app delivery.
  // Nothing to do — the DB write already happened in the service.
  return {
    channel: 'IN_APP',
    status: 'DELIVERED',
    notificationId: notification._id,
  };
}
