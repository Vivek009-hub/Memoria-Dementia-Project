/**
 * patients.service.js — Patient profile business logic
 */

import PatientProfile from './patientProfile.model.js';
import { canAccessPatient } from '../../utils/authorization.js';

/**
 * Return the patient's own profile. Creates it if it doesn't exist yet
 * (a PATIENT user registered via auth but hasn't been profiled yet).
 *
 * @param {string} userId - req.user.id (must be PATIENT role, enforced in route)
 * @returns {Promise<object>}
 */
export async function getMyProfile(userId) {
  let profile = await PatientProfile.findOne({ userId });

  if (!profile) {
    // Auto-create an empty profile on first access
    profile = await PatientProfile.create({ userId });
  }

  return formatProfile(profile);
}

/**
 * Update the patient's own profile.
 *
 * @param {string} userId
 * @param {object} data - Validated update data (may contain dot-notation keys)
 * @returns {Promise<object>}
 */
export async function updateMyProfile(userId, data) {
  const profile = await PatientProfile.findOneAndUpdate(
    { userId },
    { $set: data },
    { returnDocument: 'after', upsert: true, runValidators: true }
  );

  return formatProfile(profile);
}

/**
 * Get a patient profile by patientId, enforcing authorization.
 * Called from GET /api/v1/patients/:patientId — used by caregivers.
 *
 * @param {object} requestingUser - req.user
 * @param {string} patientId
 * @returns {Promise<object>}
 */
export async function getPatientById(requestingUser, patientId) {
  // This will throw AppError(403) if access is denied
  await canAccessPatient(requestingUser, patientId, 'viewProfile');

  // Auto-create an empty profile if the patient hasn't set one up yet
  // (registered via auth but never accessed /patients/me)
  let profile = await PatientProfile.findOne({ userId: patientId });
  if (!profile) {
    profile = await PatientProfile.create({ userId: patientId });
  }

  return formatProfile(profile);
}

/**
 * Format a PatientProfile Mongoose document into a plain object.
 * @param {object} doc
 */
function formatProfile(doc) {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    dateOfBirth: doc.dateOfBirth ?? null,
    preferredLanguage: doc.preferredLanguage,
    accessibilitySettings: doc.accessibilitySettings.toObject
      ? doc.accessibilitySettings.toObject()
      : doc.accessibilitySettings,
    preferences: doc.preferences ?? {},
    safetySettings: doc.safetySettings.toObject
      ? doc.safetySettings.toObject()
      : doc.safetySettings,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}
