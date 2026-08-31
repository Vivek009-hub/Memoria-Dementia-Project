/**
 * notification.validation.js — Input validation for notification endpoints (B9)
 *
 * Follows the project convention: manual validation using AppError
 * (no external validation library). This matches the pattern in B6/B7.
 */

import mongoose from 'mongoose';
import { AppError } from '../../utils/AppError.js';
import { NOTIFICATION_TYPES } from './notification.model.js';

// ── Route parameter validation ────────────────────────────────────────────────

/**
 * Validate that :notificationId is a valid MongoDB ObjectId.
 *
 * @param {string} notificationId
 * @throws {AppError} 400 if invalid
 */
export function validateNotificationId(notificationId) {
  if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new AppError('Invalid notification ID', 400, 'INVALID_ID');
  }
}

// ── List query validation ─────────────────────────────────────────────────────

/**
 * Validate and sanitize query parameters for GET /notifications.
 *
 * @param {object} query - Express req.query
 * @returns {object} Sanitized query params
 * @throws {AppError} 400 on invalid values
 */
export function validateListQuery(query) {
  const sanitized = {};

  // page
  if (query.page !== undefined) {
    const page = parseInt(query.page, 10);
    if (isNaN(page) || page < 1) {
      throw new AppError('page must be a positive integer', 400, 'INVALID_INPUT');
    }
    sanitized.page = page;
  }

  // limit
  if (query.limit !== undefined) {
    const limit = parseInt(query.limit, 10);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new AppError('limit must be between 1 and 100', 400, 'INVALID_INPUT');
    }
    sanitized.limit = limit;
  }

  // isRead
  if (query.isRead !== undefined) {
    if (query.isRead !== 'true' && query.isRead !== 'false') {
      throw new AppError('isRead must be "true" or "false"', 400, 'INVALID_INPUT');
    }
    sanitized.isRead = query.isRead;
  }

  // type
  if (query.type !== undefined) {
    if (!Object.values(NOTIFICATION_TYPES).includes(query.type)) {
      throw new AppError(
        `type must be one of: ${Object.values(NOTIFICATION_TYPES).join(', ')}`,
        400,
        'INVALID_INPUT'
      );
    }
    sanitized.type = query.type;
  }

  // from (date range)
  if (query.from !== undefined) {
    const d = new Date(query.from);
    if (isNaN(d.getTime())) {
      throw new AppError('from must be a valid ISO date string', 400, 'INVALID_INPUT');
    }
    sanitized.from = query.from;
  }

  // to (date range)
  if (query.to !== undefined) {
    const d = new Date(query.to);
    if (isNaN(d.getTime())) {
      throw new AppError('to must be a valid ISO date string', 400, 'INVALID_INPUT');
    }
    sanitized.to = query.to;
  }

  return sanitized;
}

// ── Preference update validation ──────────────────────────────────────────────

const ALLOWED_CHANNELS = ['inApp', 'push', 'email', 'sms'];
const ALLOWED_CATEGORIES = ['reminders', 'communitySessions', 'meetings', 'safetyAlerts', 'system'];

/**
 * Validate the body for PATCH /notifications/preferences.
 *
 * @param {object} body - Express req.body
 * @returns {object} Validated body (channels and/or categories)
 * @throws {AppError} 400 on invalid input
 */
export function validatePreferenceUpdate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body must be an object', 400, 'INVALID_INPUT');
  }

  if (!body.channels && !body.categories) {
    throw new AppError(
      'Request body must contain at least one of: channels, categories',
      400,
      'INVALID_INPUT'
    );
  }

  const validated = {};

  if (body.channels !== undefined) {
    if (typeof body.channels !== 'object' || Array.isArray(body.channels)) {
      throw new AppError('channels must be an object', 400, 'INVALID_INPUT');
    }

    validated.channels = {};
    for (const [key, value] of Object.entries(body.channels)) {
      if (!ALLOWED_CHANNELS.includes(key)) {
        throw new AppError(
          `Invalid channel key: "${key}". Allowed: ${ALLOWED_CHANNELS.join(', ')}`,
          400,
          'INVALID_INPUT'
        );
      }
      if (typeof value !== 'boolean') {
        throw new AppError(`Channel "${key}" must be a boolean`, 400, 'INVALID_INPUT');
      }
      validated.channels[key] = value;
    }
  }

  if (body.categories !== undefined) {
    if (typeof body.categories !== 'object' || Array.isArray(body.categories)) {
      throw new AppError('categories must be an object', 400, 'INVALID_INPUT');
    }

    validated.categories = {};
    for (const [key, value] of Object.entries(body.categories)) {
      if (!ALLOWED_CATEGORIES.includes(key)) {
        throw new AppError(
          `Invalid category key: "${key}". Allowed: ${ALLOWED_CATEGORIES.join(', ')}`,
          400,
          'INVALID_INPUT'
        );
      }
      if (typeof value !== 'boolean') {
        throw new AppError(`Category "${key}" must be a boolean`, 400, 'INVALID_INPUT');
      }
      validated.categories[key] = value;
    }
  }

  return validated;
}
