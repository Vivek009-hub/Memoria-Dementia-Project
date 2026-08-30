/**
 * notification.events.js — In-process notification event bus (B9)
 *
 * Purpose:
 *   Provides a clean, decoupled interface for other modules to emit domain
 *   events without knowing anything about the notification infrastructure.
 *
 * Architecture:
 *   - Uses Node.js EventEmitter under the hood.
 *   - Events are dispatched asynchronously via setImmediate() in the service,
 *     so emitting is non-blocking for the calling module.
 *   - Other modules import and call emitNotificationEvent() — they do NOT
 *     import notification.service.js directly.
 *
 * Design rationale (no Kafka/RabbitMQ):
 *   The current architecture is a modular monolith. Adding a message broker
 *   (Kafka, RabbitMQ, BullMQ) would be premature optimization per CLAUDE.md §31.
 *   When a production queue is needed, replace the internal EventEmitter
 *   dispatch with a job enqueue call — the emitNotificationEvent() API
 *   remains unchanged for callers.
 *
 * Event contract:
 *   Each event has a well-defined payload structure. B6/B7 must provide
 *   the correct fields. See notification.service.js handleEvent() for details.
 *
 * Example (B6 reminder service):
 *   import { emitNotificationEvent } from '../notifications/notification.events.js';
 *   emitNotificationEvent('ReminderDue', {
 *     patientUserId: reminder.patientId.toString(),
 *     reminderId: reminder._id.toString(),
 *     reminderTitle: reminder.title,
 *   });
 *
 * Supported events (see notification.service.js handleEvent for payload schemas):
 *   ReminderDue           — B6: reminder becomes due
 *   ReminderMissed        — B6: reminder passed without acknowledgment
 *   CommunitySessionApproved   — B7: admin approves a proposal → session created
 *   CommunitySessionScheduled  — B7: session created/scheduled
 *   CommunitySessionCancelled  — B7: session cancelled
 *   MeetingStarted        — B8 (future): meeting starts
 *   MeetingCancelled      — B8 (future): meeting cancelled
 *   MeetingEnded          — B8 (future): meeting ended
 */

import EventEmitter from 'events';
import { logger } from '../../utils/logger.js';

// ── Internal event emitter ────────────────────────────────────────────────────

const _bus = new EventEmitter();

// Increase the default max listener limit to avoid Node.js warnings when
// multiple tests or modules attach handlers.
_bus.setMaxListeners(20);

// ── Event registration (lazy import to avoid circular dependencies) ───────────

let _handlerRegistered = false;

/**
 * Register the notification service handler on the event bus.
 * Called once during app startup (or on first use in tests).
 *
 * We use a dynamic import to avoid a circular dependency:
 *   notification.events.js → notification.service.js
 *   notification.service.js → notification.worker.js (no circular back)
 */
async function _registerHandler() {
  if (_handlerRegistered) return;
  _handlerRegistered = true;

  // Dynamic import to break potential circular dependency
  const { handleEvent } = await import('./notification.service.js');

  _bus.on('notification:event', async ({ eventType, payload }) => {
    try {
      await handleEvent(eventType, payload);
    } catch (err) {
      // This catch is a safety net — handleEvent already isolates errors internally
      logger.error(
        { eventType, err: err.message },
        '[notification.events] Unhandled error from event handler'
      );
    }
  });

  logger.info('[notification.events] Notification event handler registered');
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Emit a domain notification event.
 *
 * This function is non-blocking: the event is handled asynchronously.
 * The calling service does NOT need to await this — it should not wait
 * for notification delivery before returning its own response.
 *
 * @param {string} eventType  - Domain event name (e.g. 'ReminderDue')
 * @param {object} payload    - Event-specific payload
 */
export function emitNotificationEvent(eventType, payload) {
  // Ensure handler is registered (idempotent)
  _registerHandler().catch((err) => {
    logger.error({ err: err.message }, '[notification.events] Handler registration failed');
  });

  // Emit asynchronously — setImmediate ensures we don't block the current tick
  setImmediate(() => {
    _bus.emit('notification:event', { eventType, payload });
  });

  logger.debug({ eventType }, '[notification.events] Event emitted');
}

/**
 * Initialize the notification event system.
 * Call this once during app startup to pre-register the handler.
 * Optional — the handler auto-registers on first emit if not called.
 *
 * @returns {Promise<void>}
 */
export async function initNotificationEvents() {
  await _registerHandler();
}

/**
 * Expose the internal bus for testing purposes only.
 * Tests can use this to listen for events synchronously.
 *
 * @internal Do NOT use in production code.
 */
export { _bus as _testBus };
