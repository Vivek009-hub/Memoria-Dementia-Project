/**
 * adminUser.routes.js — Admin User Management Express Routes
 *
 * All routes require authentication (requireAuth) and ADMIN role (requireRole('ADMIN')).
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/authorization.middleware.js';
import * as usersService from './users.service.js';

const router = Router();

// Enforce authentication & ADMIN role restriction
router.use(requireAuth, requireRole('ADMIN'));

// GET /api/v1/admin/users — List & Search users
router.get('/', async (req, res, next) => {
  try {
    const { q, search, role, status, page, limit } = req.query;
    const result = await usersService.getUsersPaginated({
      search: q || search || '',
      role,
      status,
      page,
      limit,
    });
    res.status(200).json({ success: true, data: result.users, pagination: result.pagination });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/admin/users/:userId/role — Update user role (with last-admin protection)
router.patch('/:userId/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await usersService.updateUserRoleByAdmin(req.params.userId, role, req.user);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/admin/users/:userId/status — Update account active/suspended status (with last-admin protection)
router.patch('/:userId/status', async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await usersService.updateUserStatusByAdmin(req.params.userId, isActive, req.user);
    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

export default router;
