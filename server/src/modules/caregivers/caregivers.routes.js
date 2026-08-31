/**
 * caregivers.routes.js — Routes for /api/v1/caregivers
 *
 * All routes require:
 *   1. Authentication (requireAuth)
 *   2. CAREGIVER role (requireRole)
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/authorization.middleware.js';
import * as caregiversController from './caregivers.controller.js';

const router = Router();

// All caregiver routes require authentication + CAREGIVER role
router.use(requireAuth);
router.use(requireRole('CAREGIVER'));

// GET    /api/v1/caregivers/relationships
router.get('/relationships', caregiversController.listRelationships);

// POST   /api/v1/caregivers/relationships
router.post('/relationships', caregiversController.createRelationship);

// PATCH  /api/v1/caregivers/relationships/:relationshipId
router.patch('/relationships/:relationshipId', caregiversController.updateRelationship);

// POST   /api/v1/caregivers/pair
router.post('/pair', caregiversController.pairWithCode);

// DELETE /api/v1/caregivers/relationships/:relationshipId  (revoke — soft delete)
router.delete('/relationships/:relationshipId', caregiversController.revokeRelationship);

export default router;
