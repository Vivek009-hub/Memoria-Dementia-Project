import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes.js';
import usersRouter from '../modules/users/users.routes.js';
import patientsRouter from '../modules/patients/patients.routes.js';
import caregiversRouter from '../modules/caregivers/caregivers.routes.js';
import gamesRouter from '../modules/games/game.routes.js';
import memoriesRouter from '../modules/memories/memory.routes.js';
import remindersRouter from '../modules/reminders/reminder.routes.js';
import { communityRouter, adminCommunityRouter } from '../modules/community/community.routes.js';
import meetingsRouter from '../modules/meetings/meeting.routes.js';
import aiRouter from '../modules/ai/ai.routes.js';
import { analyticsRouter, adminAnalyticsRouter } from '../modules/analytics/analytics.routes.js';

const router = Router();

// GET /api/v1/health
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'memora-api',
    status: 'healthy',
  });
});

// B2 — Authentication
router.use('/auth', authRouter);

// B3 — Users / Patients / Caregivers
router.use('/users', usersRouter);
router.use('/patients', patientsRouter);
router.use('/caregivers', caregiversRouter);

// B4 — Cognitive Games
router.use('/games', gamesRouter);

// B5 — Memory Assistance
router.use('/memories', memoriesRouter);

// B6 — Reminders & Daily Routines
router.use('/reminders', remindersRouter);

// B7 — Community Sessions & Proposals
router.use('/community', communityRouter);
router.use('/admin/community', adminCommunityRouter);

// B8 — Memora Meeting Circle
router.use('/community', meetingsRouter);
router.use('/meetings', meetingsRouter);

// B11 — AI Cognitive & Memory Assistance
router.use('/ai', aiRouter);

// B10 — Analytics & Progress Tracking
router.use('/analytics', analyticsRouter);
router.use('/admin/analytics', adminAnalyticsRouter);
export default router;
