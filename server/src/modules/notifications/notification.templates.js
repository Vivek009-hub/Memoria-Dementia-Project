/**
 * notification.templates.js — Notification message builders (B9)
 *
 * Provides human-readable, elderly-friendly notification titles and messages
 * for each domain event type.
 *
 * Design:
 * - Templates use structured data from the event payload rather than
 *   hard-coding final sentences. This makes the system localization-ready:
 *   a future translation layer can use the event type + data to render
 *   the correct language.
 * - Language is simple and direct (per B9 prompt §47: "Your music session
 *   starts at 5:00 PM." not "You have been scheduled to participate in...").
 *
 * Each builder returns:
 *   { title: string, message: string }
 */

// ── Reminder Templates ────────────────────────────────────────────────────────

/**
 * @param {{ reminderTitle: string, scheduledAt?: Date }} data
 */
export function buildReminderDue(data) {
  const title = data.reminderTitle || 'Reminder';
  return {
    title: `⏰ Reminder: ${title}`,
    message: `It's time for your reminder: ${title}. Please don't forget!`,
  };
}

/**
 * @param {{ reminderTitle: string, scheduledAt?: Date }} data
 */
export function buildReminderMissed(data) {
  const title = data.reminderTitle || 'Reminder';
  return {
    title: `⚠️ Missed Reminder: ${title}`,
    message: `You missed your reminder: ${title}. Please check with your caregiver if needed.`,
  };
}

// ── Community Session Templates ───────────────────────────────────────────────

/**
 * @param {{ sessionTitle: string }} data
 */
export function buildCommunitySessionApproved(data) {
  const title = data.sessionTitle || 'Community Session';
  return {
    title: `✅ Session Approved: ${title}`,
    message: `Great news! The community session "${title}" that you voted for has been approved.`,
  };
}

/**
 * @param {{ sessionTitle: string, sessionDate?: string }} data
 */
export function buildCommunitySessionScheduled(data) {
  const title = data.sessionTitle || 'Community Session';
  const dateStr = data.sessionDate ? ` on ${data.sessionDate}` : '';
  return {
    title: `📅 Session Scheduled: ${title}`,
    message: `A new community session "${title}" has been scheduled${dateStr}. You can register now!`,
  };
}

/**
 * @param {{ sessionTitle: string }} data
 */
export function buildCommunitySessionCancelled(data) {
  const title = data.sessionTitle || 'Community Session';
  return {
    title: `❌ Session Cancelled: ${title}`,
    message: `Unfortunately, the community session "${title}" has been cancelled. We're sorry for the inconvenience.`,
  };
}

// ── Meeting Templates ─────────────────────────────────────────────────────────

/**
 * @param {{ meetingTitle: string }} data
 */
export function buildMeetingStarted(data) {
  const title = data.meetingTitle || 'Meeting';
  return {
    title: `📞 Meeting Starting: ${title}`,
    message: `Your meeting "${title}" is starting now. Tap to join!`,
  };
}

/**
 * @param {{ meetingTitle: string }} data
 */
export function buildMeetingCancelled(data) {
  const title = data.meetingTitle || 'Meeting';
  return {
    title: `❌ Meeting Cancelled: ${title}`,
    message: `The meeting "${title}" has been cancelled.`,
  };
}

/**
 * @param {{ meetingTitle: string }} data
 */
export function buildMeetingEnded(data) {
  const title = data.meetingTitle || 'Meeting';
  return {
    title: `✔️ Meeting Ended: ${title}`,
    message: `The meeting "${title}" has ended. Thank you for joining!`,
  };
}

// ── System Template ───────────────────────────────────────────────────────────

/**
 * @param {{ title: string, message: string }} data
 */
export function buildSystem(data) {
  return {
    title: data.title || 'System Notification',
    message: data.message || 'You have a new system notification.',
  };
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

/**
 * Maps a domain event name to a template builder function.
 *
 * @type {Record<string, (data: object) => { title: string, message: string }>}
 */
export const TEMPLATE_BUILDERS = {
  ReminderDue: buildReminderDue,
  ReminderMissed: buildReminderMissed,
  CommunitySessionApproved: buildCommunitySessionApproved,
  CommunitySessionScheduled: buildCommunitySessionScheduled,
  CommunitySessionCancelled: buildCommunitySessionCancelled,
  MeetingStarted: buildMeetingStarted,
  MeetingCancelled: buildMeetingCancelled,
  MeetingEnded: buildMeetingEnded,
  System: buildSystem,
};

/**
 * Build a notification title and message for a given event type and payload.
 *
 * @param {string} eventType  - Domain event name (e.g. 'ReminderDue')
 * @param {object} data       - Structured payload from the event
 * @returns {{ title: string, message: string }}
 */
export function buildTemplate(eventType, data = {}) {
  const builder = TEMPLATE_BUILDERS[eventType];
  if (!builder) {
    return {
      title: 'Notification',
      message: 'You have a new notification.',
    };
  }
  return builder(data);
}
