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
import CaregiverInvitation from './caregiverInvitation.model.js';
import User from '../users/user.model.js';
import { AppError } from '../../utils/AppError.js';
import crypto from 'node:crypto';

/**
 * List all relationships for the authenticated caregiver.
 * @param {string} caregiverId
 * @returns {Promise<object[]>}
 */
export async function listRelationships(caregiverId) {
  const relationships = await CaregiverRelationship.find({ caregiverId })
    .populate('patientId', 'name email role profileImageUrl preferredLanguage')
    .sort({ createdAt: -1 });
  return relationships.map(formatRelationship);
}

/**
 * List all relationships for a specific patient.
 * @param {string} patientId
 * @returns {Promise<object[]>}
 */
export async function listPatientRelationships(patientId) {
  const relationships = await CaregiverRelationship.find({ patientId })
    .populate('caregiverId', 'name email role profileImageUrl preferredLanguage')
    .sort({ createdAt: -1 });
  return relationships.map(formatRelationship);
}

/**
 * Patient generates an invitation / pairing code for a caregiver.
 * @param {string} patientId
 * @param {{ caregiverEmail?: string, relationshipType?: string }} options
 * @returns {Promise<object>}
 */
export async function generateInvitation(patientId, options = {}) {
  const { caregiverEmail = null, relationshipType = 'FAMILY' } = options;

  // Generate 6-char alphanumeric pairing code
  const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const invitation = await CaregiverInvitation.create({
    patientId,
    inviteCode,
    caregiverEmail: caregiverEmail ? caregiverEmail.toLowerCase().trim() : null,
    relationshipType,
    status: 'PENDING',
    expiresAt,
    createdBy: patientId,
  });

  return {
    id: invitation._id.toString(),
    patientId: invitation.patientId.toString(),
    inviteCode: invitation.inviteCode,
    caregiverEmail: invitation.caregiverEmail,
    relationshipType: invitation.relationshipType,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    createdAt: invitation.createdAt,
  };
}

/**
 * Caregiver redeems a pairing code to establish connection.
 * @param {string} caregiverId
 * @param {string} inviteCode
 * @returns {Promise<object>}
 */
export async function pairWithCode(caregiverId, inviteCode) {
  if (!inviteCode || typeof inviteCode !== 'string') {
    throw new AppError('Pairing code is required', 400, 'INVALID_REQUEST');
  }

  const code = inviteCode.trim().toUpperCase();
  const invitation = await CaregiverInvitation.findOne({ inviteCode: code, status: 'PENDING' });

  if (!invitation) {
    throw new AppError('Invalid or expired pairing code', 404, 'NOT_FOUND');
  }

  if (new Date() > invitation.expiresAt) {
    invitation.status = 'EXPIRED';
    await invitation.save();
    throw new AppError('Pairing code has expired', 400, 'CODE_EXPIRED');
  }

  if (invitation.patientId.toString() === caregiverId) {
    throw new AppError('You cannot pair with your own account', 400, 'INVALID_REQUEST');
  }

  // Create or activate relationship
  let relationship = await CaregiverRelationship.findOne({
    caregiverId,
    patientId: invitation.patientId,
  });

  if (relationship) {
    relationship.status = 'ACTIVE';
    relationship.relationshipType = invitation.relationshipType || relationship.relationshipType;
    await relationship.save();
  } else {
    relationship = await CaregiverRelationship.create({
      caregiverId,
      patientId: invitation.patientId,
      relationshipType: invitation.relationshipType || 'FAMILY',
      status: 'ACTIVE',
      createdBy: caregiverId,
    });
  }

  invitation.status = 'ACCEPTED';
  await invitation.save();

  return formatRelationship(relationship);
}

/**
 * Patient accepts a pending relationship request from a caregiver.
 * @param {string} patientId
 * @param {string} relationshipId
 * @returns {Promise<object>}
 */
export async function acceptRelationship(patientId, relationshipId) {
  const relationship = await CaregiverRelationship.findOneAndUpdate(
    { _id: relationshipId, patientId, status: 'PENDING' },
    { $set: { status: 'ACTIVE' } },
    { returnDocument: 'after' }
  );

  if (!relationship) {
    throw new AppError('Pending relationship not found', 404, 'NOT_FOUND');
  }

  return formatRelationship(relationship);
}

/**
 * Patient updates permissions for a caregiver relationship.
 * @param {string} patientId
 * @param {string} relationshipId
 * @param {object} permissions
 * @returns {Promise<object>}
 */
export async function updatePatientPermissions(patientId, relationshipId, permissions) {
  const updateData = {};
  for (const [key, val] of Object.entries(permissions)) {
    updateData[`permissions.${key}`] = val;
  }

  const relationship = await CaregiverRelationship.findOneAndUpdate(
    { _id: relationshipId, patientId },
    { $set: updateData },
    { returnDocument: 'after', runValidators: true }
  );

  if (!relationship) {
    throw new AppError('Relationship not found', 404, 'NOT_FOUND');
  }

  return formatRelationship(relationship);
}

/**
 * Revoke a relationship (patient or caregiver initiated).
 * @param {string} relationshipId
 * @param {string} actorId - User ID revoking
 * @returns {Promise<void>}
 */
export async function revokeRelationship(relationshipId, actorId) {
  const relationship = await CaregiverRelationship.findOneAndUpdate(
    {
      _id: relationshipId,
      $or: [{ caregiverId: actorId }, { patientId: actorId }],
    },
    { $set: { status: 'REVOKED' } },
    { returnDocument: 'after' }
  );

  if (!relationship) {
    throw new AppError('Relationship not found', 404, 'NOT_FOUND');
  }
}

/**
 * Create a new PENDING caregiver relationship.
 * @param {string} caregiverId
 * @param {{ patientId: string, relationshipType: string }} data
 * @returns {Promise<object>}
 */
export async function createRelationship(caregiverId, data) {
  const { patientId, relationshipType } = data;

  if (caregiverId === patientId) {
    throw new AppError(
      'A caregiver cannot create a relationship with themselves',
      400,
      'INVALID_REQUEST'
    );
  }

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
 * @param {string} relationshipId
 * @param {string} caregiverId
 * @param {object} data
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
 * Format a CaregiverRelationship document into a plain object.
 */
function formatRelationship(doc) {
  const caregiver = doc.caregiverId && typeof doc.caregiverId === 'object' && doc.caregiverId.name
    ? {
        id: doc.caregiverId._id.toString(),
        name: doc.caregiverId.name,
        email: doc.caregiverId.email,
        profileImageUrl: doc.caregiverId.profileImageUrl,
      }
    : null;

  const patient = doc.patientId && typeof doc.patientId === 'object' && doc.patientId.name
    ? {
        id: doc.patientId._id.toString(),
        name: doc.patientId.name,
        email: doc.patientId.email,
        profileImageUrl: doc.patientId.profileImageUrl,
      }
    : null;

  return {
    id: doc._id.toString(),
    caregiverId: caregiver ? caregiver.id : doc.caregiverId?.toString() ?? null,
    caregiver,
    patientId: patient ? patient.id : doc.patientId?.toString() ?? null,
    patient,
    relationshipType: doc.relationshipType,
    status: doc.status,
    permissions: doc.permissions.toObject ? doc.permissions.toObject() : doc.permissions,
    createdBy: doc.createdBy?.toString() ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

