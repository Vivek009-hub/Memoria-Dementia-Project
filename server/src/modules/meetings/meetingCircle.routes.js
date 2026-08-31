/**
 * meetingCircle.routes.js — Express router for Meeting Circles
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import * as circleController from './meetingCircle.controller.js';

const router = Router();

// Protect all meeting circle routes with authentication
router.use(requireAuth);

// Circle Discovery & Listing
router.get('/discover', circleController.getDiscoverableCircles);
router.get('/mine', circleController.getMyCircles);

// Circle CRUD
router.post('/', circleController.createCircle);
router.get('/:circleId', circleController.getCircleById);
router.delete('/:circleId', circleController.deleteCircle);

// Circle Join / Leave & Participants
router.post('/:circleId/join', circleController.joinCircle);
router.post('/:circleId/leave', circleController.leaveCircle);
router.get('/:circleId/participants', circleController.getActiveParticipants);

// Safety / Participant Reporting
router.post('/:circleId/report', circleController.reportParticipant);

export default router;
