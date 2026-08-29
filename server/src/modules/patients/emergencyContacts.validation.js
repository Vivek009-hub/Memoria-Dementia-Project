/**
 * emergencyContacts.validation.js — Input validation for emergency contact endpoints
 */

import { AppError } from '../../utils/AppError.js';

/**
 * Validate the body for POST /emergency-contacts (create).
 * @param {object} body
 * @returns {object} sanitized contact data
 */
export function validateContactCreate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    throw new AppError('name is required', 422, 'VALIDATION_ERROR');
  }
  if (body.name.trim().length > 200) {
    throw new AppError('name cannot exceed 200 characters', 422, 'VALIDATION_ERROR');
  }

  const data = { name: body.name.trim() };

  if (body.relationship !== undefined) {
    if (typeof body.relationship !== 'string') {
      throw new AppError('relationship must be a string', 422, 'VALIDATION_ERROR');
    }
    data.relationship = body.relationship.trim();
  }

  if (body.phoneNumber !== undefined) {
    if (typeof body.phoneNumber !== 'string') {
      throw new AppError('phoneNumber must be a string', 422, 'VALIDATION_ERROR');
    }
    // Basic phone validation — digits, spaces, dashes, plus, parens
    if (!/^[+\d\s\-().]{7,20}$/.test(body.phoneNumber.trim())) {
      throw new AppError('phoneNumber format is invalid', 422, 'VALIDATION_ERROR');
    }
    data.phoneNumber = body.phoneNumber.trim();
  }

  if (body.email !== undefined) {
    if (typeof body.email !== 'string') {
      throw new AppError('email must be a string', 422, 'VALIDATION_ERROR');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      throw new AppError('email format is invalid', 422, 'VALIDATION_ERROR');
    }
    data.email = body.email.toLowerCase().trim();
  }

  if (body.priority !== undefined) {
    const p = Number(body.priority);
    if (!Number.isInteger(p) || p < 1 || p > 10) {
      throw new AppError('priority must be an integer between 1 and 10', 422, 'VALIDATION_ERROR');
    }
    data.priority = p;
  }

  return data;
}

/**
 * Validate the body for PATCH /emergency-contacts/:contactId (update).
 * Same rules as create but all fields are optional; requires at least one.
 * @param {object} body
 * @returns {object} sanitized update data
 */
export function validateContactUpdate(body) {
  if (!body || typeof body !== 'object') {
    throw new AppError('Request body must be a JSON object', 422, 'VALIDATION_ERROR');
  }

  // Re-use create validation but make name optional
  const tempBody = { name: body.name ?? '_placeholder_', ...body };
  const created = validateContactCreate(tempBody);
  if (body.name === undefined) delete created.name;

  if (Object.keys(created).length === 0) {
    throw new AppError('No valid fields provided for update', 422, 'VALIDATION_ERROR');
  }

  return created;
}
