/**
 * users.routes.js — Routes for /api/v1/users
 *
 * All routes require authentication (requireAuth).
 * No additional role restriction — any authenticated user can manage
 * their own profile.
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import * as usersController from './users.controller.js';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

// GET  /api/v1/users/me
router.get('/me', usersController.getMe);

// PATCH /api/v1/users/me
router.patch('/me', usersController.updateMe);

export default router;
