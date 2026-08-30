/**
 * meeting.routes.js — Express router for Meeting Circle module
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import * as meetingController from './meeting.controller.js';

const router = Router();

// Public webhook endpoint
router.post('/webhooks/:provider', meetingController.handleWebhook);

// Protected routes (require authentication)
router.use(requireAuth);

// Patient personal history endpoint
router.get('/history', meetingController.getPatientHistory);

// Session-specific meeting endpoints
router.post('/sessions/:sessionId/meeting', meetingController.createMeeting);
router.get('/sessions/:sessionId/meeting', meetingController.getMeeting);
router.post('/sessions/:sessionId/meeting/join', meetingController.joinMeeting);
router.post('/sessions/:sessionId/meeting/leave', meetingController.leaveMeeting);
router.post('/sessions/:sessionId/meeting/start', meetingController.startMeeting);
router.post('/sessions/:sessionId/meeting/end', meetingController.endMeeting);
router.post(
  '/sessions/:sessionId/meeting/participants/:participantId/remove',
  meetingController.removeParticipant
);
router.get('/sessions/:sessionId/meeting/attendance', meetingController.getAttendance);

export default router;
