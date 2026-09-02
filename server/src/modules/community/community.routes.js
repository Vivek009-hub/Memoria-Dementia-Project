/**
 * community.routes.js — Express routes for Community Sessions & Proposals
 *
 * Patient/Public routes under /api/v1/community
 * Admin routes under /api/v1/admin/community
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/authorization.middleware.js';
import * as controller from './community.controller.js';

export const communityRouter = Router();
export const adminCommunityRouter = Router();

// ── PATIENT / PUBLIC ROUTES (/api/v1/community) ──────────────────────────────
communityRouter.use(requireAuth);

// Voting endpoints
communityRouter.get('/sessions/voting', controller.getVotingProposals);
communityRouter.post(
  '/sessions/ideas/:ideaId/vote',
  requireRole('PATIENT'),
  controller.voteForProposal
);
communityRouter.delete(
  '/sessions/ideas/:ideaId/vote',
  requireRole('PATIENT'),
  controller.removeVote
);

// Schedule endpoints
communityRouter.get('/sessions/schedule', controller.getSchedule);
communityRouter.get('/sessions/scheduled', controller.getSchedule);
communityRouter.get('/sessions', controller.getSchedule);
communityRouter.get('/sessions/registrations/me', controller.getMyRegistrations);
communityRouter.get('/sessions/scheduled/:sessionId', controller.getSessionById);
communityRouter.get('/sessions/:sessionId', controller.getSessionById);

// Pre-registration endpoints
communityRouter.post(
  '/sessions/:sessionId/register',
  requireRole('PATIENT'),
  controller.registerForSession
);
communityRouter.post(
  '/sessions/scheduled/:sessionId/register',
  requireRole('PATIENT'),
  controller.registerForSession
);
communityRouter.delete(
  '/sessions/:sessionId/register',
  requireRole('PATIENT'),
  controller.cancelRegistration
);
communityRouter.delete(
  '/sessions/scheduled/:sessionId/register',
  requireRole('PATIENT'),
  controller.cancelRegistration
);

// ── ADMIN ROUTES (/api/v1/admin/community) ──────────────────────────────────
adminCommunityRouter.use(requireAuth, requireRole('ADMIN'));

// Admin proposal management
adminCommunityRouter.post('/sessions/ideas', controller.createProposal);
adminCommunityRouter.patch('/sessions/ideas/:ideaId', controller.updateProposal);
adminCommunityRouter.patch('/sessions/ideas/:ideaId/toggle-voting', controller.toggleVotingStatus);
adminCommunityRouter.get('/sessions/voting/results', controller.getVotingResults);
adminCommunityRouter.post('/sessions/ideas/:ideaId/approve', controller.approveProposal);

// Admin scheduling management
adminCommunityRouter.post('/sessions/ideas/:ideaId/schedule', controller.scheduleSession);
adminCommunityRouter.post('/sessions/schedule', controller.scheduleSession);
adminCommunityRouter.patch('/sessions/:sessionId', controller.adminUpdateSession);
adminCommunityRouter.post('/sessions/:sessionId/cancel', controller.adminCancelSession);
adminCommunityRouter.post(
  '/sessions/:sessionId/registration/close',
  controller.adminCloseRegistration
);
adminCommunityRouter.get('/sessions/:sessionId/registrations', controller.adminGetRegistrations);

export default {
  communityRouter,
  adminCommunityRouter,
};
