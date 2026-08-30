/**
 * ai.routes.js — Express router for AI Cognitive & Memory Assistance module
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import * as aiController from './ai.controller.js';

const router = Router();

// Require authentication for all AI endpoints
router.use(requireAuth);

router.post('/memory-assistant', aiController.askMemoryAssistant);
router.post('/memory-search', aiController.searchMemoriesNL);
router.post('/chat', aiController.chat);
router.get('/recommendations', aiController.getRecommendations);
router.get('/usage', aiController.getUsage);

export default router;
