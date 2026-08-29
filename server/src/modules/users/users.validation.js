/**
 * users.validation.js — Input validation for user profile endpoints
 */

import { AppError } from '../../utils/AppError.js';

// Fields that may never be updated through the self-service profile endpoint
const PROTECTED_FIELDS = ['role', 'isActive', 'passwordHash', 'email', '_id', 'id'];

// Fields allowed in PATCH /users/me
const ALLOWED_UPDATE_FIELDS = ['name', 'profileImageUrl', 'preferredLanguage'];

/**
 * Validate the body of PATCH /api/v1/users/me.
 * Rejects any attempt to change protected fields.
 * Returns the sanitized, allowed-field-only object.
 *
 * @param {object} body - req.body
 * @returns {{ name?, profileImageUrl?, preferredLanguage? }}
 */
export function validateUserUpdate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  // Reject any protected field explicitly provided
  const attempted = PROTECTED_FIELDS.filter((f) => Object.prototype.hasOwnProperty.call(body, f));
  if (attempted.length > 0) {
    throw new AppError(
      `The following fields cannot be updated: ${attempted.join(', ')}`,
      422,
      'VALIDATION_ERROR'
    );
  }

  const update = {};

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      throw new AppError('name must be a non-empty string', 422, 'VALIDATION_ERROR');
    }
    if (body.name.trim().length > 200) {
      throw new AppError('name cannot exceed 200 characters', 422, 'VALIDATION_ERROR');
    }
    update.name = body.name.trim();
  }

  if (body.profileImageUrl !== undefined) {
    if (body.profileImageUrl !== null && typeof body.profileImageUrl !== 'string') {
      throw new AppError('profileImageUrl must be a string or null', 422, 'VALIDATION_ERROR');
    }
    update.profileImageUrl = body.profileImageUrl;
  }

  if (body.preferredLanguage !== undefined) {
    if (typeof body.preferredLanguage !== 'string' || body.preferredLanguage.trim().length === 0) {
      throw new AppError('preferredLanguage must be a non-empty string', 422, 'VALIDATION_ERROR');
    }
    update.preferredLanguage = body.preferredLanguage.trim();
  }

  // Reject any completely unknown fields not in ALLOWED_UPDATE_FIELDS
  const unknownFields = Object.keys(body).filter(
    (k) => !ALLOWED_UPDATE_FIELDS.includes(k) && !PROTECTED_FIELDS.includes(k)
  );
  if (unknownFields.length > 0) {
    throw new AppError(`Unknown fields: ${unknownFields.join(', ')}`, 422, 'VALIDATION_ERROR');
  }

  if (Object.keys(update).length === 0) {
    throw new AppError('No valid fields provided for update', 422, 'VALIDATION_ERROR');
  }

  return update;
}
