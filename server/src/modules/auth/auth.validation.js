/**
 * auth.validation.js
 *
 * Input validation for authentication endpoints.
 * Validation runs BEFORE any business logic or database access.
 *
 * Uses plain JavaScript — no extra validation library.
 * Mongoose-level validation is a secondary safety net, not the primary gate.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate a registration request body.
 *
 * @param {{ name?: unknown, email?: unknown, password?: unknown }} body
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateRegister(body) {
  const errors = [];

  // name
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    errors.push('name is required');
  } else if (body.name.trim().length > 200) {
    errors.push('name cannot exceed 200 characters');
  }

  // email
  if (!body.email || typeof body.email !== 'string' || body.email.trim().length === 0) {
    errors.push('email is required');
  } else if (!EMAIL_RE.test(body.email.trim())) {
    errors.push('email must be a valid email address');
  }

  // password
  if (!body.password || typeof body.password !== 'string') {
    errors.push('password is required');
  } else if (body.password.length < 8) {
    errors.push('password must be at least 8 characters');
  } else if (body.password.length > 128) {
    errors.push('password cannot exceed 128 characters');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a login request body.
 *
 * @param {{ email?: unknown, password?: unknown }} body
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateLogin(body) {
  const errors = [];

  if (!body.email || typeof body.email !== 'string' || body.email.trim().length === 0) {
    errors.push('email is required');
  } else if (!EMAIL_RE.test(body.email.trim())) {
    errors.push('email must be a valid email address');
  }

  if (!body.password || typeof body.password !== 'string' || body.password.length === 0) {
    errors.push('password is required');
  }

  return { valid: errors.length === 0, errors };
}
