/**
 * analytics.routes.js — Express routes for Analytics & Progress Tracking
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole, requirePatientAccess } from '../../middleware/authorization.middleware.js';
import * as controller from './analytics.controller.js';

export const analyticsRouter = Router();
export const adminAnalyticsRouter = Router();

// ── PATIENT & CAREGIVER ROUTES (/api/v1/analytics) ───────────────────────────
analyticsRouter.use(requireAuth);

// Patient self overview
analyticsRouter.get('/me/overview', controller.getMeOverview);

// Caregiver authorized patient overview
analyticsRouter.get(
  '/patient/:patientId/overview',
  requirePatientAccess('viewCognitiveActivity'),
  controller.getPatientOverview
);

// Cognitive Game analytics
analyticsRouter.get('/games/summary', controller.getGameSummary);
analyticsRouter.get('/games/history', controller.getGameHistory);
analyticsRouter.get('/games/trends', controller.getGameTrends);

// Reminder adherence analytics
analyticsRouter.get('/reminders/summary', controller.getReminderSummary);
analyticsRouter.get('/reminders/trends', controller.getReminderTrends);

// Memory usage analytics
analyticsRouter.get('/memories/summary', controller.getMemorySummary);

// Community participation analytics
analyticsRouter.get('/community/summary', controller.getCommunitySummary);

// General engagement trends
analyticsRouter.get('/engagement', controller.getEngagementTrends);

// ── ADMIN ROUTES (/api/v1/admin/analytics) ──────────────────────────────────
adminAnalyticsRouter.use(requireAuth, requireRole('ADMIN'));

adminAnalyticsRouter.get('/overview', controller.getAdminOverview);
adminAnalyticsRouter.get('/games', controller.getAdminGames);
adminAnalyticsRouter.get('/community', controller.getAdminCommunity);

export default {
  analyticsRouter,
  adminAnalyticsRouter,
};
