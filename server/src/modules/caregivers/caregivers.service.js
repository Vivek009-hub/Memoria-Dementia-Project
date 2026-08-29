/**
 * caregivers.service.js — Caregiver relationship business logic
 *
 * Relationship Creation Policy (B3 Assumption):
 *   A CAREGIVER user may create a PENDING relationship to any patient.
 *   The CAREGIVER may then activate it themselves (PATCH status=ACTIVE).
 *   This is the safest minimal workflow given no Admin API exists in B3.
 *   A proper invitation/approval workflow will be designed in B4+.
 *   See PHASE_B3 prompt §13 and implementation_plan.md for context.
 */

import CaregiverRelationship from './caregiverRelationship.model.js';
import User from '../users/user.model.js';
import { AppError } from '../../utils/AppError.js';

/**
 * List all relationships for the authenticated caregiver.
 * @param {string} caregiverId
 * @returns {Promise<object[]>}
 */
export async function listRelationships(caregiverId) {
  const relationships = await CaregiverRelationship.find({ caregiverId }).sort({
    createdAt: -1,
  });
  return relationships.map(formatRelationship);
}

/**
 * Create a new PENDING caregiver relationship.
 *
 * Validates:
 *  - The target patient exists and has the PATIENT role
 *  - A caregiver cannot self-assign (caregiverId !== patientId)
 *  - No existing PENDING or ACTIVE relationship for this pair
 *    (enforced by the DB unique partial index, surfaced as a 409 here)
 *
 * @param {string} caregiverId
 * @param {{ patientId: string, relationshipType: string }} data
 * @returns {Promise<object>}
 */
export async function createRelationship(caregiverId, data) {
  const { patientId, relationshipType } = data;

  // Prevent self-assignment
  if (caregiverId === patientId) {
    throw new AppError(
      'A caregiver cannot create a relationship with themselves',
      400,
      'INVALID_REQUEST'
    );
  }

  // Verify the patient exists and has the right role
  const patient = await User.findById(patientId).select('role isActive');
  if (!patient) {
    throw new AppError('Patient not found', 404, 'NOT_FOUND');
  }
  if (patient.role !== 'PATIENT') {
    throw new AppError('The specified user is not a patient', 400, 'INVALID_REQUEST');
  }
  if (!patient.isActive) {
    throw new AppError('The specified patient account is inactive', 400, 'INVALID_REQUEST');
  }

  try {
    const relationship = await CaregiverRelationship.create({
      caregiverId,
      patientId,
      relationshipType,
      status: 'PENDING',
      createdBy: caregiverId,
    });
    return formatRelationship(relationship);
  } catch (err) {
    // MongoDB duplicate key error — partial index on (caregiverId, patientId, PENDING/ACTIVE)
    if (err.code === 11000) {
      throw new AppError(
        'A pending or active relationship already exists for this caregiver-patient pair',
        409,
        'DUPLICATE_RELATIONSHIP'
      );
    }
    throw err;
  }
}

/**
 * Update an existing relationship (status, permissions, relationshipType).
 * Only the caregiver who owns the relationship may update it.
 *
 * @param {string} relationshipId
 * @param {string} caregiverId
 * @param {object} data - Validated update data (may contain dot-notation permission keys)
 * @returns {Promise<object>}
 */
export async function updateRelationship(relationshipId, caregiverId, data) {
  const relationship = await CaregiverRelationship.findOneAndUpdate(
    { _id: relationshipId, caregiverId },
    { $set: data },
    { returnDocument: 'after', runValidators: true }
  );

  if (!relationship) {
    throw new AppError('Relationship not found', 404, 'NOT_FOUND');
  }

  return formatRelationship(relationship);
}

/**
 * Revoke a relationship (soft delete — sets status to REVOKED).
 * Only the caregiver who owns the relationship may revoke it.
 *
 * @param {string} relationshipId
 * @param {string} caregiverId
 */
export async function revokeRelationship(relationshipId, caregiverId) {
  const relationship = await CaregiverRelationship.findOneAndUpdate(
    { _id: relationshipId, caregiverId },
    { $set: { status: 'REVOKED' } },
    { returnDocument: 'after' }
  );

  if (!relationship) {
    throw new AppError('Relationship not found', 404, 'NOT_FOUND');
  }
}

/**
 * Format a CaregiverRelationship document into a plain object.
 */
function formatRelationship(doc) {
  return {
    id: doc._id.toString(),
    caregiverId: doc.caregiverId.toString(),
    patientId: doc.patientId.toString(),
    relationshipType: doc.relationshipType,
    status: doc.status,
    permissions: doc.permissions.toObject ? doc.permissions.toObject() : doc.permissions,
    createdBy: doc.createdBy?.toString() ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
