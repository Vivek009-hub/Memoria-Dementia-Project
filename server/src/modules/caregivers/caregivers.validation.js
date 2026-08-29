/**
 * caregivers.validation.js — Input validation for caregiver relationship endpoints
 */

import mongoose from 'mongoose';
import { AppError } from '../../utils/AppError.js';

const VALID_RELATIONSHIP_TYPES = ['FAMILY', 'PROFESSIONAL', 'GUARDIAN', 'OTHER'];
const VALID_STATUSES = ['PENDING', 'ACTIVE', 'REVOKED'];
const VALID_PERMISSIONS = [
  'viewProfile',
  'manageMemories',
  'manageReminders',
  'viewCognitiveActivity',
  'viewLocation',
  'manageGeofences',
  'receiveSafetyAlerts',
  'manageCommunityRegistration',
];

/**
 * Validate a MongoDB ObjectId param.
 */
export function validateObjectId(id, fieldName = 'id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400, 'INVALID_ID');
  }
}

/**
 * Validate POST /caregivers/relationships body.
 * @param {object} body
 * @returns {{ patientId: string, relationshipType: string }}
 */
export function validateRelationshipCreate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  if (!body.patientId || typeof body.patientId !== 'string') {
    throw new AppError('patientId is required', 422, 'VALIDATION_ERROR');
  }
  if (!mongoose.Types.ObjectId.isValid(body.patientId)) {
    throw new AppError('patientId must be a valid ID', 400, 'INVALID_ID');
  }

  if (!body.relationshipType || !VALID_RELATIONSHIP_TYPES.includes(body.relationshipType)) {
    throw new AppError(
      `relationshipType must be one of: ${VALID_RELATIONSHIP_TYPES.join(', ')}`,
      422,
      'VALIDATION_ERROR'
    );
  }

  return {
    patientId: body.patientId,
    relationshipType: body.relationshipType,
  };
}

/**
 * Validate PATCH /caregivers/relationships/:relationshipId body.
 * Allows updating status and/or permissions.
 * @param {object} body
 * @returns {object} validated update data
 */
export function validateRelationshipUpdate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  const update = {};

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      throw new AppError(
        `status must be one of: ${VALID_STATUSES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    update.status = body.status;
  }

  if (body.relationshipType !== undefined) {
    if (!VALID_RELATIONSHIP_TYPES.includes(body.relationshipType)) {
      throw new AppError(
        `relationshipType must be one of: ${VALID_RELATIONSHIP_TYPES.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    update.relationshipType = body.relationshipType;
  }

  if (body.permissions !== undefined) {
    if (typeof body.permissions !== 'object' || Array.isArray(body.permissions)) {
      throw new AppError('permissions must be an object', 422, 'VALIDATION_ERROR');
    }
    const invalidKeys = Object.keys(body.permissions).filter((k) => !VALID_PERMISSIONS.includes(k));
    if (invalidKeys.length > 0) {
      throw new AppError(
        `Unknown permission keys: ${invalidKeys.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    for (const [k, v] of Object.entries(body.permissions)) {
      if (typeof v !== 'boolean') {
        throw new AppError(`permissions.${k} must be a boolean`, 422, 'VALIDATION_ERROR');
      }
      update[`permissions.${k}`] = v;
    }
  }

  if (Object.keys(update).length === 0) {
    throw new AppError('No valid fields provided for update', 422, 'VALIDATION_ERROR');
  }

  return update;
}
