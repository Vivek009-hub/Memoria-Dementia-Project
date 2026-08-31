/**
 * patients.validation.js — Input validation for patient profile endpoints
 */

import mongoose from 'mongoose';
import { AppError } from '../../utils/AppError.js';

/**
 * Validate a MongoDB ObjectId param (e.g. :patientId).
 * @param {string} id
 * @param {string} [fieldName='id']
 */
export function validateObjectId(id, fieldName = 'id') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid ${fieldName}`, 400, 'INVALID_ID');
  }
}

/**
 * Validate the body of PATCH /api/v1/patients/me.
 * Returns only the allowed fields.
 *
 * @param {object} body
 * @returns {object} sanitized update data
 */
export function validatePatientUpdate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  const update = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      throw new AppError('name must be a non-empty string', 422, 'VALIDATION_ERROR');
    }
    update.name = body.name.trim();
  }

  if (body.phone !== undefined) {
    if (typeof body.phone !== 'string') {
      throw new AppError('phone must be a string', 422, 'VALIDATION_ERROR');
    }
    update.phone = body.phone.trim();
  }

  if (body.dateOfBirth !== undefined) {
    const d = new Date(body.dateOfBirth);
    if (isNaN(d.getTime())) {
      throw new AppError('dateOfBirth must be a valid date string', 422, 'VALIDATION_ERROR');
    }
    if (d > new Date()) {
      throw new AppError('dateOfBirth cannot be in the future', 422, 'VALIDATION_ERROR');
    }
    update.dateOfBirth = d;
  }

  if (body.preferredLanguage !== undefined) {
    if (typeof body.preferredLanguage !== 'string' || body.preferredLanguage.trim().length === 0) {
      throw new AppError('preferredLanguage must be a non-empty string', 422, 'VALIDATION_ERROR');
    }
    update.preferredLanguage = body.preferredLanguage.trim();
  }

  if (body.accessibilitySettings !== undefined) {
    if (
      typeof body.accessibilitySettings !== 'object' ||
      Array.isArray(body.accessibilitySettings)
    ) {
      throw new AppError('accessibilitySettings must be an object', 422, 'VALIDATION_ERROR');
    }
    const allowed = ['largeText', 'highContrast', 'voiceEnabled', 'reducedMotion'];
    const invalid = Object.keys(body.accessibilitySettings).filter((k) => !allowed.includes(k));
    if (invalid.length > 0) {
      throw new AppError(
        `Unknown accessibilitySettings keys: ${invalid.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    for (const key of allowed) {
      if (
        body.accessibilitySettings[key] !== undefined &&
        typeof body.accessibilitySettings[key] !== 'boolean'
      ) {
        throw new AppError(
          `accessibilitySettings.${key} must be a boolean`,
          422,
          'VALIDATION_ERROR'
        );
      }
    }
    // Use dot-notation keys for partial update
    for (const [k, v] of Object.entries(body.accessibilitySettings)) {
      update[`accessibilitySettings.${k}`] = v;
    }
  }

  if (body.safetySettings !== undefined) {
    if (typeof body.safetySettings !== 'object' || Array.isArray(body.safetySettings)) {
      throw new AppError('safetySettings must be an object', 422, 'VALIDATION_ERROR');
    }
    const allowed = ['locationSharingEnabled', 'fallDetectionEnabled', 'sosEnabled'];
    const invalid = Object.keys(body.safetySettings).filter((k) => !allowed.includes(k));
    if (invalid.length > 0) {
      throw new AppError(
        `Unknown safetySettings keys: ${invalid.join(', ')}`,
        422,
        'VALIDATION_ERROR'
      );
    }
    for (const key of allowed) {
      if (body.safetySettings[key] !== undefined && typeof body.safetySettings[key] !== 'boolean') {
        throw new AppError(`safetySettings.${key} must be a boolean`, 422, 'VALIDATION_ERROR');
      }
    }
    for (const [k, v] of Object.entries(body.safetySettings)) {
      update[`safetySettings.${k}`] = v;
    }
  }

  if (body.preferences !== undefined) {
    if (typeof body.preferences !== 'object' || Array.isArray(body.preferences)) {
      throw new AppError('preferences must be an object', 422, 'VALIDATION_ERROR');
    }
    update.preferences = body.preferences;
  }

  if (Object.keys(update).length === 0) {
    throw new AppError('No valid fields provided for update', 422, 'VALIDATION_ERROR');
  }

  return update;
}
