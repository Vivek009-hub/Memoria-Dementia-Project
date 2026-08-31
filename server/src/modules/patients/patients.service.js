/**
 * patients.service.js — Patient profile business logic
 */

import PatientProfile from './patientProfile.model.js';
import User from '../users/user.model.js';
import { canAccessPatient } from '../../utils/authorization.js';

/**
 * Return the patient's own profile combined with user details.
 * @param {string} userId
 * @returns {Promise<object>}
 */
export async function getMyProfile(userId) {
  let profile = await PatientProfile.findOne({ userId });
  if (!profile) {
    profile = await PatientProfile.create({ userId });
  }

  const user = await User.findById(userId).select('name email profileImageUrl preferredLanguage');
  return formatProfile(profile, user);
}

/**
 * Update the patient's own profile and user info.
 * @param {string} userId
 * @param {object} data
 * @returns {Promise<object>}
 */
export async function updateMyProfile(userId, data) {
  const userUpdates = {};
  if (data.name !== undefined) {
    userUpdates.name = data.name;
    delete data.name;
  }
  if (data.phone !== undefined) {
    userUpdates.phone = data.phone;
    delete data.phone;
  }

  let user = null;
  if (Object.keys(userUpdates).length > 0) {
    user = await User.findByIdAndUpdate(userId, { $set: userUpdates }, { returnDocument: 'after' });
  } else {
    user = await User.findById(userId).select('name email profileImageUrl preferredLanguage');
  }

  let profile = await PatientProfile.findOne({ userId });
  if (Object.keys(data).length > 0) {
    profile = await PatientProfile.findOneAndUpdate(
      { userId },
      { $set: data },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );
  }

  return formatProfile(profile, user);
}

/**
 * Get a patient profile by patientId, enforcing authorization.
 * @param {object} requestingUser
 * @param {string} patientId
 * @returns {Promise<object>}
 */
export async function getPatientById(requestingUser, patientId) {
  await canAccessPatient(requestingUser, patientId, 'viewProfile');

  let profile = await PatientProfile.findOne({ userId: patientId });
  if (!profile) {
    profile = await PatientProfile.create({ userId: patientId });
  }

  const user = await User.findById(patientId).select('name email profileImageUrl preferredLanguage');
  return formatProfile(profile, user);
}

/**
 * Format PatientProfile document combined with User document into plain object.
 */
function formatProfile(doc, userDoc = null) {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    name: userDoc?.name ?? '',
    email: userDoc?.email ?? '',
    phone: userDoc?.phone ?? '',
    profileImageUrl: userDoc?.profileImageUrl ?? null,
    dateOfBirth: doc.dateOfBirth ?? null,
    preferredLanguage: doc.preferredLanguage ?? userDoc?.preferredLanguage ?? 'en',
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

