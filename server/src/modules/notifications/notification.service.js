/**
 * notification.service.js — Notification business logic (B9)
 *
 * This is the centralized notification layer.
 *
 * Key responsibilities:
 *   1. createNotification()     — persist, deduplicate, dispatch delivery
 *   2. listNotifications()      — paginated list for a user with filters
 *   3. getNotification()        — single notification with ownership check
 *   4. markAsRead()             — sets isRead=true, readAt=now
 *   5. markAllAsRead()          — bulk update for a user
 *   6. getUnreadCount()         — count of unread notifications for a user
 *   7. getOrCreatePreferences() — lazy preference initialization
 *   8. updatePreferences()      — patch preference document
 *   9. handleEvent()            — domain event → notification creation
 *
 * Authorization model:
 *   - All public API methods receive a `userId` that has been validated by
 *     auth middleware. No further auth checks are needed inside the service
 *     for user-scoped operations — the query always filters by userId.
 *   - Cross-user access is structurally prevented by always scoping queries
 *     to the authenticated user's ID.
 *
 * Idempotency:
 *   - The DB model has a unique sparse compound index on
 *     (relatedResourceType, relatedResourceId, type, recipientUserId).
 *   - createNotification() catches duplicate-key errors (code 11000) and
 *     returns the existing notification instead of throwing.
 *
 * Performance:
 *   - Delivery is dispatched via notification.worker.js (setImmediate) so
 *     createNotification() does NOT wait for delivery to complete.
 *   - Bulk notification creation for community sessions is done with
 *     insertMany() + ordered:false to allow partial success, not a loop
 *     that would block under large recipient sets.
 */

import mongoose from 'mongoose';
import Notification, { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from './notification.model.js';
import NotificationPreference from './notificationPreference.model.js';
import { dispatchDelivery } from './notification.worker.js';
import { buildTemplate } from './notification.templates.js';
import { AppError } from '../../utils/AppError.js';
import logger from '../../utils/logger.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Map from domain event name → notification type constant.
 */
const EVENT_TYPE_MAP = {
  ReminderDue: NOTIFICATION_TYPES.REMINDER,
  ReminderMissed: NOTIFICATION_TYPES.REMINDER,
  CommunitySessionApproved: NOTIFICATION_TYPES.COMMUNITY_SESSION,
  CommunitySessionScheduled: NOTIFICATION_TYPES.COMMUNITY_SESSION,
  CommunitySessionCancelled: NOTIFICATION_TYPES.COMMUNITY_SESSION,
  MeetingStarted: NOTIFICATION_TYPES.MEETING,
  MeetingCancelled: NOTIFICATION_TYPES.MEETING,
  MeetingEnded: NOTIFICATION_TYPES.MEETING,
  System: NOTIFICATION_TYPES.SYSTEM,
};

/**
 * Map from domain event name → category key in preferences.
 */
const EVENT_CATEGORY_MAP = {
  ReminderDue: 'reminders',
  ReminderMissed: 'reminders',
  CommunitySessionApproved: 'communitySessions',
  CommunitySessionScheduled: 'communitySessions',
  CommunitySessionCancelled: 'communitySessions',
  MeetingStarted: 'meetings',
  MeetingCancelled: 'meetings',
  MeetingEnded: 'meetings',
  System: 'system',
};

// Default page size
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// ── Core CRUD ─────────────────────────────────────────────────────────────────

/**
 * Create a single notification and dispatch delivery.
 *
 * Idempotent: if a notification already exists with the same
 * (relatedResourceType, relatedResourceId, type, recipientUserId),
 * the existing document is returned without creating a duplicate.
 *
 * @param {object} data
 * @param {string}  data.recipientUserId    - ObjectId string
 * @param {string}  data.type               - NOTIFICATION_TYPES value
 * @param {string}  data.title
 * @param {string}  data.message
 * @param {string}  [data.priority]         - NOTIFICATION_PRIORITIES value
 * @param {string}  [data.relatedResourceType]
 * @param {string}  [data.relatedResourceId]  - ObjectId string or null
 * @param {Date}    [data.expiresAt]
 * @returns {Promise<object>} The created or existing notification document
 */
export async function createNotification(data) {
  const {
    recipientUserId,
    type,
    title,
    message,
    priority = NOTIFICATION_PRIORITIES.NORMAL,
    relatedResourceType = null,
    relatedResourceId = null,
    expiresAt = null,
  } = data;

  try {
    const notification = await Notification.create({
      recipientUserId,
      type,
      title,
      message,
      priority,
      relatedResourceType,
      relatedResourceId: relatedResourceId
        ? new mongoose.Types.ObjectId(relatedResourceId)
        : null,
      expiresAt,
    });

    // Dispatch delivery asynchronously — does not block this call
    dispatchDelivery(notification, String(recipientUserId));

    logger.info(
      { notificationId: notification._id, type, recipientUserId },
      '[notification.service] Notification created'
    );

    return notification;
  } catch (err) {
    // Duplicate key error from the idempotency index — return existing
    if (err.code === 11000) {
      logger.info(
        { type, recipientUserId, relatedResourceType, relatedResourceId },
        '[notification.service] Duplicate notification suppressed (idempotency)'
      );

      const existing = await Notification.findOne({
        recipientUserId,
        type,
        relatedResourceType,
        relatedResourceId: relatedResourceId
          ? new mongoose.Types.ObjectId(relatedResourceId)
          : null,
      });

      return existing;
    }

    throw err;
  }
}

/**
 * Create multiple notifications for multiple recipients efficiently.
 * Used for bulk events (e.g. community session approved → notify all voters).
 *
 * Uses insertMany with ordered:false so one duplicate doesn't abort the rest.
 *
 * @param {Array<object>} notificationsData - Array of createNotification data objects
 * @returns {Promise<{ created: number, duplicates: number }>}
 */
export async function createBulkNotifications(notificationsData) {
  if (!notificationsData.length) return { created: 0, duplicates: 0 };

  const docs = notificationsData.map((data) => ({
    recipientUserId: data.recipientUserId,
    type: data.type,
    title: data.title,
    message: data.message,
    priority: data.priority ?? NOTIFICATION_PRIORITIES.NORMAL,
    relatedResourceType: data.relatedResourceType ?? null,
    relatedResourceId: data.relatedResourceId
      ? new mongoose.Types.ObjectId(data.relatedResourceId)
      : null,
    expiresAt: data.expiresAt ?? null,
  }));

  let created = 0;
  let duplicates = 0;

  try {
    const result = await Notification.insertMany(docs, {
      ordered: false, // continue even if some docs fail
    });
    created = result.length;

    // Dispatch delivery for each successfully created notification
    result.forEach((notification) => {
      dispatchDelivery(notification, String(notification.recipientUserId));
    });
  } catch (err) {
    // insertMany with ordered:false throws if ANY doc fails, but includes
    // the successfully inserted docs in err.insertedDocs (Mongoose v7+)
    if (err.name === 'MongoBulkWriteError') {
      // Count duplicates vs other errors
      (err.writeErrors || []).forEach((writeErr) => {
        if (writeErr.code === 11000) {
          duplicates++;
        } else {
          logger.error(
            { err: writeErr.errmsg },
            '[notification.service] Non-duplicate bulk write error'
          );
        }
      });
      // Successfully inserted
      created = (err.insertedDocs || []).length;

      // Dispatch delivery for successfully inserted
      (err.insertedDocs || []).forEach((notification) => {
        dispatchDelivery(notification, String(notification.recipientUserId));
      });
    } else {
      throw err;
    }
  }

  logger.info(
    { created, duplicates },
    '[notification.service] Bulk notification creation complete'
  );

  return { created, duplicates };
}

/**
 * List notifications for a user with pagination and optional filters.
 *
 * @param {string} userId      - Authenticated user's ID
 * @param {object} queryParams
 * @param {number} [queryParams.page]
 * @param {number} [queryParams.limit]
 * @param {boolean|string} [queryParams.isRead]  - 'true', 'false', or undefined
 * @param {string} [queryParams.type]            - NOTIFICATION_TYPES value
 * @param {string} [queryParams.from]            - ISO date string (createdAt >=)
 * @param {string} [queryParams.to]              - ISO date string (createdAt <=)
 * @returns {Promise<{ notifications: object[], pagination: object }>}
 */
export async function listNotifications(userId, queryParams = {}) {
  const page = Math.max(1, parseInt(queryParams.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(queryParams.limit, 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  const filter = { recipientUserId: new mongoose.Types.ObjectId(userId) };

  // Filter by read status
  if (queryParams.isRead !== undefined && queryParams.isRead !== '') {
    filter.isRead = queryParams.isRead === 'true' || queryParams.isRead === true;
  }

  // Filter by type
  if (queryParams.type) {
    if (!Object.values(NOTIFICATION_TYPES).includes(queryParams.type)) {
      throw new AppError(`Invalid notification type: ${queryParams.type}`, 400, 'INVALID_INPUT');
    }
    filter.type = queryParams.type;
  }

  // Date range filter on createdAt
  if (queryParams.from || queryParams.to) {
    filter.createdAt = {};
    if (queryParams.from) {
      const fromDate = new Date(queryParams.from);
      if (isNaN(fromDate.getTime())) {
        throw new AppError('Invalid "from" date', 400, 'INVALID_INPUT');
      }
      filter.createdAt.$gte = fromDate;
    }
    if (queryParams.to) {
      const toDate = new Date(queryParams.to);
      if (isNaN(toDate.getTime())) {
        throw new AppError('Invalid "to" date', 400, 'INVALID_INPUT');
      }
      filter.createdAt.$lte = toDate;
    }
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Get a single notification by ID.
 * Enforces ownership: the notification must belong to the requesting user.
 *
 * @param {string} userId         - Authenticated user's ID
 * @param {string} notificationId - Notification's ObjectId string
 * @returns {Promise<object>} The notification document
 * @throws {AppError} 404 if not found or not owned by user
 */
export async function getNotification(userId, notificationId) {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError('Invalid notification ID', 400, 'INVALID_ID');
  }

  const notification = await Notification.findOne({
    _id: new mongoose.Types.ObjectId(notificationId),
    recipientUserId: new mongoose.Types.ObjectId(userId),
  }).lean();

  if (!notification) {
    // Return 404 regardless of whether it exists but belongs to someone else
    // (avoids information leakage)
    throw new AppError('Notification not found', 404, 'NOT_FOUND');
  }

  return notification;
}

/**
 * Mark a single notification as read.
 * Only the recipient may mark their notification.
 *
 * @param {string} userId         - Authenticated user's ID
 * @param {string} notificationId - Notification's ObjectId string
 * @returns {Promise<object>} Updated notification
 */
export async function markAsRead(userId, notificationId) {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError('Invalid notification ID', 400, 'INVALID_ID');
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(notificationId),
      recipientUserId: new mongoose.Types.ObjectId(userId),
    },
    {
      $set: { isRead: true, readAt: new Date() },
    },
    { new: true }
  );

  if (!notification) {
    throw new AppError('Notification not found', 404, 'NOT_FOUND');
  }

  return notification;
}

/**
 * Mark all unread notifications as read for a user.
 *
 * @param {string} userId - Authenticated user's ID
 * @returns {Promise<{ modifiedCount: number }>}
 */
export async function markAllAsRead(userId) {
  const result = await Notification.updateMany(
    {
      recipientUserId: new mongoose.Types.ObjectId(userId),
      isRead: false,
    },
    {
      $set: { isRead: true, readAt: new Date() },
    }
  );

  return { modifiedCount: result.modifiedCount };
}

/**
 * Get the count of unread notifications for a user.
 *
 * @param {string} userId - Authenticated user's ID
 * @returns {Promise<{ count: number }>}
 */
export async function getUnreadCount(userId) {
  const count = await Notification.countDocuments({
    recipientUserId: new mongoose.Types.ObjectId(userId),
    isRead: false,
  });

  return { count };
}

// ── Preferences ───────────────────────────────────────────────────────────────

/**
 * Get a user's notification preferences, creating default preferences
 * if none exist (lazy initialization).
 *
 * @param {string} userId
 * @returns {Promise<object>} The preference document
 */
export async function getOrCreatePreferences(userId) {
  let prefs = await NotificationPreference.findOne({ userId }).lean();

  if (!prefs) {
    // Create defaults
    const created = await NotificationPreference.create({ userId });
    prefs = created.toObject();
  }

  return prefs;
}

/**
 * Update notification preferences for a user.
 *
 * Allowed update paths:
 *   channels.inApp, channels.push, channels.email, channels.sms
 *   categories.reminders, categories.communitySessions, categories.meetings
 *   categories.safetyAlerts, categories.system
 *
 * Safety rule: categories.safetyAlerts can be updated, but the service layer
 * enforces that CRITICAL-priority notifications bypass preference checks.
 *
 * @param {string} userId
 * @param {object} updates - Flat or nested preference updates
 * @returns {Promise<object>} Updated preference document
 */
export async function updatePreferences(userId, updates) {
  const allowedChannels = ['inApp', 'push', 'email', 'sms'];
  const allowedCategories = [
    'reminders',
    'communitySessions',
    'meetings',
    'safetyAlerts',
    'system',
  ];

  const setFields = {};

  if (updates.channels && typeof updates.channels === 'object') {
    for (const [key, value] of Object.entries(updates.channels)) {
      if (!allowedChannels.includes(key)) {
        throw new AppError(`Invalid preference channel: ${key}`, 400, 'INVALID_INPUT');
      }
      if (typeof value !== 'boolean') {
        throw new AppError(`Channel preference "${key}" must be a boolean`, 400, 'INVALID_INPUT');
      }
      setFields[`channels.${key}`] = value;
    }
  }

  if (updates.categories && typeof updates.categories === 'object') {
    for (const [key, value] of Object.entries(updates.categories)) {
      if (!allowedCategories.includes(key)) {
        throw new AppError(`Invalid preference category: ${key}`, 400, 'INVALID_INPUT');
      }
      if (typeof value !== 'boolean') {
        throw new AppError(
          `Category preference "${key}" must be a boolean`,
          400,
          'INVALID_INPUT'
        );
      }
      setFields[`categories.${key}`] = value;
    }
  }

  if (Object.keys(setFields).length === 0) {
    throw new AppError('No valid preference fields provided', 400, 'INVALID_INPUT');
  }

  const prefs = await NotificationPreference.findOneAndUpdate(
    { userId },
    { $set: setFields },
    { new: true, upsert: true }
  );

  return prefs;
}

// ── Event Handlers ────────────────────────────────────────────────────────────

/**
 * Handle a domain event and create the appropriate notification(s).
 *
 * This is the central dispatch point for event-driven notifications.
 * Other modules call emitNotificationEvent() in notification.events.js,
 * which in turn calls this function.
 *
 * @param {string} eventType  - Domain event name (e.g. 'ReminderDue')
 * @param {object} payload    - Event-specific data
 * @returns {Promise<void>}
 */
export async function handleEvent(eventType, payload) {
  try {
    switch (eventType) {
      case 'ReminderDue':
        await _handleReminderDue(payload);
        break;
      case 'ReminderMissed':
        await _handleReminderMissed(payload);
        break;
      case 'CommunitySessionApproved':
        await _handleCommunitySessionApproved(payload);
        break;
      case 'CommunitySessionScheduled':
        await _handleCommunitySessionScheduled(payload);
        break;
      case 'CommunitySessionCancelled':
        await _handleCommunitySessionCancelled(payload);
        break;
      case 'MeetingStarted':
        await _handleMeetingStarted(payload);
        break;
      case 'MeetingCancelled':
        await _handleMeetingCancelled(payload);
        break;
      case 'MeetingEnded':
        await _handleMeetingEnded(payload);
        break;
      default:
        logger.warn({ eventType }, '[notification.service] Unknown event type — skipping');
    }
  } catch (err) {
    // Event handling errors must NOT propagate to break the emitting service
    logger.error(
      { eventType, err: err.message, stack: err.stack },
      '[notification.service] Event handler error — isolated'
    );
  }
}

// ── Private event handler implementations ─────────────────────────────────────

/**
 * @param {{ patientUserId: string, reminderId: string, reminderTitle: string }} payload
 */
async function _handleReminderDue(payload) {
  const { patientUserId, reminderId, reminderTitle } = payload;
  if (!patientUserId) return;

  const { title, message } = buildTemplate('ReminderDue', { reminderTitle });

  await createNotification({
    recipientUserId: patientUserId,
    type: NOTIFICATION_TYPES.REMINDER,
    title,
    message,
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    relatedResourceType: 'Reminder',
    relatedResourceId: reminderId,
  });
}

/**
 * @param {{ patientUserId: string, reminderId: string, reminderTitle: string }} payload
 */
async function _handleReminderMissed(payload) {
  const { patientUserId, reminderId, reminderTitle } = payload;
  if (!patientUserId) return;

  const { title, message } = buildTemplate('ReminderMissed', { reminderTitle });

  await createNotification({
    recipientUserId: patientUserId,
    type: NOTIFICATION_TYPES.REMINDER,
    title,
    message,
    priority: NOTIFICATION_PRIORITIES.HIGH,
    relatedResourceType: 'ReminderMissed',
    relatedResourceId: reminderId,
  });
}

/**
 * Community session approved: notify all patients who voted for the proposal.
 *
 * @param {{
 *   sessionId: string,
 *   proposalId: string,
 *   sessionTitle: string,
 *   voterUserIds: string[]   — array of patientUserId strings who voted
 * }} payload
 */
async function _handleCommunitySessionApproved(payload) {
  const { sessionId, sessionTitle, voterUserIds } = payload;
  if (!voterUserIds?.length) return;

  const { title, message } = buildTemplate('CommunitySessionApproved', { sessionTitle });

  // Batch to avoid loading all recipients into memory at once
  const BATCH_SIZE = 100;
  for (let i = 0; i < voterUserIds.length; i += BATCH_SIZE) {
    const batch = voterUserIds.slice(i, i + BATCH_SIZE);
    const notificationsData = batch.map((userId) => ({
      recipientUserId: userId,
      type: NOTIFICATION_TYPES.COMMUNITY_SESSION,
      title,
      message,
      priority: NOTIFICATION_PRIORITIES.NORMAL,
      relatedResourceType: 'CommunitySession',
      relatedResourceId: sessionId,
    }));
    await createBulkNotifications(notificationsData);
  }
}

/**
 * Community session scheduled: notify all PATIENT users (broad announcement).
 *
 * For simplicity in B9, the payload should carry a targetUserIds array.
 * B7 determines which users to notify (registered patients, voters, etc.).
 *
 * @param {{
 *   sessionId: string,
 *   sessionTitle: string,
 *   sessionDate?: string,
 *   targetUserIds: string[]
 * }} payload
 */
async function _handleCommunitySessionScheduled(payload) {
  const { sessionId, sessionTitle, sessionDate, targetUserIds } = payload;
  if (!targetUserIds?.length) return;

  const { title, message } = buildTemplate('CommunitySessionScheduled', {
    sessionTitle,
    sessionDate,
  });

  const BATCH_SIZE = 100;
  for (let i = 0; i < targetUserIds.length; i += BATCH_SIZE) {
    const batch = targetUserIds.slice(i, i + BATCH_SIZE);
    const notificationsData = batch.map((userId) => ({
      recipientUserId: userId,
      type: NOTIFICATION_TYPES.COMMUNITY_SESSION,
      title,
      message,
      priority: NOTIFICATION_PRIORITIES.NORMAL,
      relatedResourceType: 'CommunitySessionScheduled',
      relatedResourceId: sessionId,
    }));
    await createBulkNotifications(notificationsData);
  }
}

/**
 * Community session cancelled: notify registered participants.
 *
 * @param {{
 *   sessionId: string,
 *   sessionTitle: string,
 *   targetUserIds: string[]
 * }} payload
 */
async function _handleCommunitySessionCancelled(payload) {
  const { sessionId, sessionTitle, targetUserIds } = payload;
  if (!targetUserIds?.length) return;

  const { title, message } = buildTemplate('CommunitySessionCancelled', { sessionTitle });

  const BATCH_SIZE = 100;
  for (let i = 0; i < targetUserIds.length; i += BATCH_SIZE) {
    const batch = targetUserIds.slice(i, i + BATCH_SIZE);
    const notificationsData = batch.map((userId) => ({
      recipientUserId: userId,
      type: NOTIFICATION_TYPES.COMMUNITY_SESSION,
      title,
      message,
      priority: NOTIFICATION_PRIORITIES.NORMAL,
      relatedResourceType: 'CommunitySessionCancelled',
      relatedResourceId: sessionId,
    }));
    await createBulkNotifications(notificationsData);
  }
}

/**
 * Meeting started: notify all registered participants.
 *
 * @param {{
 *   meetingId: string,
 *   meetingTitle: string,
 *   participantUserIds: string[]
 * }} payload
 */
async function _handleMeetingStarted(payload) {
  const { meetingId, meetingTitle, participantUserIds } = payload;
  if (!participantUserIds?.length) return;

  const { title, message } = buildTemplate('MeetingStarted', { meetingTitle });

  const notificationsData = participantUserIds.map((userId) => ({
    recipientUserId: userId,
    type: NOTIFICATION_TYPES.MEETING,
    title,
    message,
    priority: NOTIFICATION_PRIORITIES.HIGH,
    relatedResourceType: 'Meeting',
    relatedResourceId: meetingId,
  }));
  await createBulkNotifications(notificationsData);
}

/**
 * Meeting cancelled: notify all participants.
 *
 * @param {{
 *   meetingId: string,
 *   meetingTitle: string,
 *   participantUserIds: string[]
 * }} payload
 */
async function _handleMeetingCancelled(payload) {
  const { meetingId, meetingTitle, participantUserIds } = payload;
  if (!participantUserIds?.length) return;

  const { title, message } = buildTemplate('MeetingCancelled', { meetingTitle });

  const notificationsData = participantUserIds.map((userId) => ({
    recipientUserId: userId,
    type: NOTIFICATION_TYPES.MEETING,
    title,
    message,
    priority: NOTIFICATION_PRIORITIES.NORMAL,
    relatedResourceType: 'MeetingCancelled',
    relatedResourceId: meetingId,
  }));
  await createBulkNotifications(notificationsData);
}

/**
 * Meeting ended: notify all participants.
 *
 * @param {{
 *   meetingId: string,
 *   meetingTitle: string,
 *   participantUserIds: string[]
 * }} payload
 */
async function _handleMeetingEnded(payload) {
  const { meetingId, meetingTitle, participantUserIds } = payload;
  if (!participantUserIds?.length) return;

  const { title, message } = buildTemplate('MeetingEnded', { meetingTitle });

  const notificationsData = participantUserIds.map((userId) => ({
    recipientUserId: userId,
    type: NOTIFICATION_TYPES.MEETING,
    title,
    message,
    priority: NOTIFICATION_PRIORITIES.LOW,
    relatedResourceType: 'MeetingEnded',
    relatedResourceId: meetingId,
  }));
  await createBulkNotifications(notificationsData);
}
