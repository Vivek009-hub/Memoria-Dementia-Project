/**
 * patient.tools.js — Controlled tools for retrieving patient profile data
 *
 * Security:
 *   - patientId is ALWAYS derived from the authenticated userId passed in by the
 *     agent service — never accepted from the LLM.
 *   - Only non-sensitive profile fields are returned to the agent.
 */

import User from '../../users/user.model.js';
import PatientProfile from '../../patients/patientProfile.model.js';

/**
 * Retrieve a safe subset of the authenticated patient's profile.
 *
 * @param {string} userId - The authenticated user's ID (from req.user.id)
 * @returns {Object} Patient name, language, phone (no passwords/hashes)
 */
export async function getPatientProfile(userId) {
  const user = await User.findById(userId)
    .select('name email preferredLanguage profileImageUrl phone role')
    .lean();

  if (!user) return null;

  const profile = await PatientProfile.findOne({ userId })
    .select('dateOfBirth preferredLanguage accessibilitySettings companionSettings')
    .lean();

  return {
    name: user.name,
    preferredLanguage: profile?.preferredLanguage || user.preferredLanguage || 'en',
    phone: user.phone || null,
    accessibilitySettings: profile?.accessibilitySettings || {},
    companionSettings: profile?.companionSettings || {
      quietHours: { enabled: true, start: '22:00', end: '07:00' },
      interactionFrequency: 'MEDIUM',
    },
    dateOfBirth: profile?.dateOfBirth || null,
  };
}

/**
 * Retrieve the patient's stored preferences (interests, topics, settings).
 *
 * @param {string} userId - The authenticated user's ID
 * @returns {Object} preferences object or empty object
 */
export async function getPatientPreferences(userId) {
  const profile = await PatientProfile.findOne({ userId })
    .select('preferences accessibilitySettings')
    .lean();

  return {
    preferences: profile?.preferences || {},
    accessibilitySettings: profile?.accessibilitySettings || {},
  };
}
