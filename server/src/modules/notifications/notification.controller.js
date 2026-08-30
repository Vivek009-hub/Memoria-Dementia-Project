/**
 * notification.controller.js — HTTP layer for notification endpoints (B9)
 *
 * Thin controller: reads request data → calls service → returns standard response.
 * No business logic here. All errors propagate to error.middleware.js via next(err).
 */

import * as notificationService from './notification.service.js';
import {
  validateNotificationId,
  validateListQuery,
  validatePreferenceUpdate,
} from './notification.validation.js';

// ── List notifications ─────────────────────────────────────────────────────────

/**
 * GET /api/v1/notifications
 * Returns the authenticated user's notifications (paginated, filterable).
 */
export async function listNotifications(req, res, next) {
  try {
    const filters = validateListQuery(req.query);
    const result = await notificationService.listNotifications(req.user.id, filters);

    res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

// ── Unread count ───────────────────────────────────────────────────────────────

/**
 * GET /api/v1/notifications/unread-count
 * Returns the count of unread notifications for the authenticated user.
 */
export async function getUnreadCount(req, res, next) {
  try {
    const result = await notificationService.getUnreadCount(req.user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// ── Get single notification ────────────────────────────────────────────────────

/**
 * GET /api/v1/notifications/:notificationId
 * Returns a single notification. 404 if not owned by authenticated user.
 */
export async function getNotification(req, res, next) {
  try {
    validateNotificationId(req.params.notificationId);
    const notification = await notificationService.getNotification(
      req.user.id,
      req.params.notificationId
    );

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
}

// ── Mark as read ───────────────────────────────────────────────────────────────

/**
 * POST /api/v1/notifications/:notificationId/read
 * Marks the specified notification as read. 404 if not owned by user.
 */
export async function markAsRead(req, res, next) {
  try {
    validateNotificationId(req.params.notificationId);
    const notification = await notificationService.markAsRead(
      req.user.id,
      req.params.notificationId
    );

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
}

// ── Mark all as read ───────────────────────────────────────────────────────────

/**
 * POST /api/v1/notifications/read-all
 * Marks all unread notifications as read for the authenticated user.
 */
export async function markAllAsRead(req, res, next) {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// ── Preferences ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/notifications/preferences
 * Returns the authenticated user's notification preferences.
 * Creates default preferences if none exist.
 */
export async function getPreferences(req, res, next) {
  try {
    const prefs = await notificationService.getOrCreatePreferences(req.user.id);

    res.status(200).json({
      success: true,
      data: prefs,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/notifications/preferences
 * Updates the authenticated user's notification preferences.
 */
export async function updatePreferences(req, res, next) {
  try {
    const updates = validatePreferenceUpdate(req.body);
    const prefs = await notificationService.updatePreferences(req.user.id, updates);

    res.status(200).json({
      success: true,
      data: prefs,
    });
  } catch (err) {
    next(err);
  }
}
