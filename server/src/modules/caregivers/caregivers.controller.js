/**
 * caregivers.controller.js — HTTP handlers for caregiver relationship endpoints
 */

import * as caregiversService from './caregivers.service.js';
import {
  validateRelationshipCreate,
  validateRelationshipUpdate,
  validateObjectId,
} from './caregivers.validation.js';

/**
 * GET /api/v1/caregivers/relationships
 */
export async function listRelationships(req, res, next) {
  try {
    const relationships = await caregiversService.listRelationships(req.user.id);
    res.status(200).json({ success: true, data: { relationships } });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/caregivers/relationships
 */
export async function createRelationship(req, res, next) {
  try {
    const validatedData = validateRelationshipCreate(req.body);
    const relationship = await caregiversService.createRelationship(req.user.id, validatedData);
    res.status(201).json({ success: true, data: { relationship } });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/v1/caregivers/relationships/:relationshipId
 */
export async function updateRelationship(req, res, next) {
  try {
    validateObjectId(req.params.relationshipId, 'relationshipId');
    const validatedData = validateRelationshipUpdate(req.body);
    const relationship = await caregiversService.updateRelationship(
      req.params.relationshipId,
      req.user.id,
      validatedData
    );
    res.status(200).json({ success: true, data: { relationship } });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/v1/caregivers/relationships/:relationshipId
 * Revokes the relationship (soft delete).
 */
export async function revokeRelationship(req, res, next) {
  try {
    validateObjectId(req.params.relationshipId, 'relationshipId');
    await caregiversService.revokeRelationship(req.params.relationshipId, req.user.id);
    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}
