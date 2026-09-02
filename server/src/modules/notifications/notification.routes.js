/**
 * notification.routes.js — Express router for notification endpoints (B9)
 *
 * All routes require authentication (requireAuth middleware).
 * No role restriction beyond authentication — any authenticated user can
 * access their own notifications.
 *
 * IMPORTANT: Route order matters.
 *   Static segments (/read-all, /unread-count, /preferences) must be
 *   registered BEFORE the dynamic /:notificationId segment, or Express
 *   will treat "read-all" as a notificationId parameter.
 *
 * Rate limiting:
 *   Using express-rate-limit (already in package.json) on mutating endpoints
 *   to prevent abuse.
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../../middleware/auth.middleware.js';
import * as controller from './notification.controller.js';

const router = Router();

// ── Rate limiters ─────────────────────────────────────────────────────────────

// Mutating endpoints (mark-read, preferences) — 60 requests per minute per user
const mutateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  // All routes using this limiter are behind requireAuth, so req.user.id is
  // always defined here. We do NOT fall back to req.ip to avoid the
  // express-rate-limit IPv6 validation warning.
  keyGenerator: (req) => req.user.id,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.',
    },
  },
});

// ── Routes (static segments first) ───────────────────────────────────────────

// GET /api/v1/notifications/unread-count
router.get('/unread-count', requireAuth, controller.getUnreadCount);

// POST /api/v1/notifications/read-all & /mark-all-read
router.post('/read-all', requireAuth, mutateLimiter, controller.markAllAsRead);
router.post('/mark-all-read', requireAuth, mutateLimiter, controller.markAllAsRead);

// GET  /api/v1/notifications/preferences
router.get('/preferences', requireAuth, controller.getPreferences);

// PATCH /api/v1/notifications/preferences
router.patch('/preferences', requireAuth, mutateLimiter, controller.updatePreferences);

// GET /api/v1/notifications
router.get('/', requireAuth, controller.listNotifications);

// ── Dynamic segment routes (after static) ─────────────────────────────────────

// GET /api/v1/notifications/:notificationId
router.get('/:notificationId', requireAuth, controller.getNotification);

// POST / PATCH /api/v1/notifications/:notificationId/read
router.post('/:notificationId/read', requireAuth, mutateLimiter, controller.markAsRead);
router.patch('/:notificationId/read', requireAuth, mutateLimiter, controller.markAsRead);

export default router;
