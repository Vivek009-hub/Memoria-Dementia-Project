/**
 * users.controller.js — HTTP handlers for user profile endpoints
 */

import * as usersService from './users.service.js';
import { validateUserUpdate } from './users.validation.js';

/**
 * GET /api/v1/users/me
 */
export async function getMe(req, res, next) {
  try {
    const user = await usersService.getMe(req.user.id);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/users/me
 */
export async function updateMe(req, res, next) {
  try {
    const validatedData = validateUserUpdate(req.body);
    const user = await usersService.updateMe(req.user.id, validatedData);
    res.status(200).json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
}
