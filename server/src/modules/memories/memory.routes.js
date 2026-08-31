/**
 * memory.routes.js — Express router for /api/v1/memories (B5)
 *
 * Authorization model:
 *   - PATIENT: always accesses their own data (patientId = req.user.id)
 *   - CAREGIVER: accesses a patient's data via ?patientId=<id> query param,
 *     subject to ACTIVE relationship + manageMemories permission.
 *   - All routes require authentication (requireAuth).
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/authorization.middleware.js';
import { canAccessPatient } from '../../utils/authorization.js';
import { AppError } from '../../utils/AppError.js';
import { uploadMemoryPhoto } from '../../middleware/upload.middleware.js';
import * as controller from './memory.controller.js';

const router = Router();

/**
 * Middleware handling optional photo upload fields ('photo', 'image', 'file')
 */
function photoUploadMiddleware(req, res, next) {
  uploadMemoryPhoto.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ])(req, res, (err) => {
    if (err) return next(err);
    if (req.files) {
      const file = req.files.photo?.[0] || req.files.image?.[0] || req.files.file?.[0];
      if (file) req.file = file;
    }
    next();
  });
}

// ── Caregiver scope middleware ─────────────────────────────────────────────────

/**
 * Middleware that enforces caregiver access to a patient's memories.
 *
 * For PATIENT role: passes through (patientId is always req.user.id in controller).
 * For CAREGIVER role: reads ?patientId, verifies ACTIVE relationship + manageMemories.
 * For any other role: 403.
 */
async function caregiverMemoryScope(req, _res, next) {
  try {
    if (req.user.role === 'PATIENT') {
      return next();
    }

    if (req.user.role === 'CAREGIVER') {
      const patientId = req.query?.patientId ?? req.body?.patientId;
      if (!patientId) {
        throw new AppError(
          'patientId query parameter is required for caregiver access',
          400,
          'INVALID_REQUEST'
        );
      }
      await canAccessPatient(req.user, patientId, 'manageMemories');
      return next();
    }

    throw new AppError('You do not have permission to access this resource', 403, 'FORBIDDEN');
  } catch (err) {
    next(err);
  }
}

// All routes require authentication + role guard
router.use(requireAuth);
router.use(requireRole('PATIENT', 'CAREGIVER'));
router.use(caregiverMemoryScope);

// ── Memory routes ─────────────────────────────────────────────────────────────

// IMPORTANT: /family-members must be declared before /:memoryId to avoid
// Express interpreting 'family-members' as a dynamic segment.

// POST   /api/v1/memories
router.post('/', photoUploadMiddleware, controller.createMemory);

// GET    /api/v1/memories
router.get('/', controller.listMemories);

// ── Family Member routes (nested under /memories) ─────────────────────────────

// POST   /api/v1/memories/family-members
router.post('/family-members', controller.createFamilyMember);

// GET    /api/v1/memories/family-members
router.get('/family-members', controller.listFamilyMembers);

// GET    /api/v1/memories/family-members/:memberId
router.get('/family-members/:memberId', controller.getFamilyMember);

// PATCH  /api/v1/memories/family-members/:memberId
router.patch('/family-members/:memberId', controller.updateFamilyMember);

// DELETE /api/v1/memories/family-members/:memberId
router.delete('/family-members/:memberId', controller.deleteFamilyMember);

// ── Memory routes (parameterized — must come after static paths) ───────────────

// GET    /api/v1/memories/:memoryId
router.get('/:memoryId', controller.getMemory);

// PATCH  /api/v1/memories/:memoryId
router.patch('/:memoryId', photoUploadMiddleware, controller.updateMemory);

// DELETE /api/v1/memories/:memoryId
router.delete('/:memoryId', controller.deleteMemory);

export default router;
