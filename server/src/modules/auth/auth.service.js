import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

import User from '../users/user.model.js';
import Session from './session.model.js';
import { AppError } from '../../utils/AppError.js';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

// bcrypt cost factor — high enough for security, fast enough for development
const BCRYPT_ROUNDS = 12;

/**
 * Return a SHA-256 hex digest of the given raw token string.
 * This is what we store in MongoDB — never the raw token itself.
 *
 * @param {string} rawToken
 * @returns {string}
 */
function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Project a User document to a safe representation for API responses.
 * Intentionally excludes: passwordHash, __v, and any session data.
 *
 * @param {import('mongoose').Document} user
 * @returns {object}
 */
function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    preferredLanguage: user.preferredLanguage,
    profileImageUrl: user.profileImageUrl ?? null,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Register a new user.
 *
 * - Normalizes email to lowercase.
 * - Rejects duplicate emails.
 * - Hashes password with bcrypt.
 * - Assigns default role CAREGIVER (clients cannot self-assign privileged roles).
 *
 * @param {{ name: string, email: string, password: string }} params
 * @returns {Promise<{ user: object }>}
 */
export async function register({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  // Duplicate email check
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new AppError('An account with that email already exists', 409, 'EMAIL_ALREADY_EXISTS');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Create user — role is always CAREGIVER for self-registration.
  // Privileged role assignment (ADMIN, HOST) is an admin-only operation in a later phase.
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: 'CAREGIVER',
    preferredLanguage: 'en',
    isActive: true,
  });

  logger.info({ userId: user._id }, 'auth: user registered');

  return { user: safeUser(user) };
}

/**
 * Authenticate a user with email + password and create a server-side session.
 *
 * Security notes:
 *  - Uses a generic error for invalid credentials to prevent user enumeration.
 *  - Generates a cryptographically random 32-byte token.
 *  - Stores only the SHA-256 hash in MongoDB; returns the raw token for the cookie.
 *
 * @param {{ email: string, password: string, deviceInfo?: string, ip?: string }} params
 * @returns {Promise<{ user: object, rawToken: string }>}
 */
export async function login({ email, password, deviceInfo, ip }) {
  const normalizedEmail = email.trim().toLowerCase();

  // We select passwordHash explicitly because the field has select:false
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  // Generic error — do NOT reveal whether email or password is wrong
  const INVALID = new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

  if (!user) throw INVALID;

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    logger.info({ email: normalizedEmail }, 'auth: login failed — bad password');
    throw INVALID;
  }

  if (!user.isActive) {
    throw new AppError('This account has been deactivated', 403, 'ACCOUNT_INACTIVE');
  }

  // Generate a cryptographically secure random session token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);

  const expiresAt = new Date(Date.now() + env.sessionTtlMs);

  await Session.create({
    userId: user._id,
    sessionTokenHash: tokenHash,
    expiresAt,
    lastUsedAt: new Date(),
    deviceInfo: deviceInfo ?? null,
    ipMetadata: ip ?? null,
  });

  // Update lastLoginAt without triggering full document save overhead
  await User.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

  logger.info({ userId: user._id }, 'auth: login success');

  return { user: safeUser(user), rawToken };
}

/**
 * Revoke a session (logout).
 *
 * Finds the session by its token hash and sets revokedAt.
 * Safe to call even if the session is already invalid.
 *
 * @param {string} rawToken  The raw token from the cookie.
 * @returns {Promise<void>}
 */
export async function logout(rawToken) {
  if (!rawToken) return;

  const tokenHash = hashToken(rawToken);

  // Update without throwing — logout is always safe even if session not found
  await Session.updateOne(
    { sessionTokenHash: tokenHash, revokedAt: null },
    { revokedAt: new Date() }
  );

  logger.info('auth: session revoked');
}

/**
 * Validate a raw session token from a cookie.
 *
 * Returns the authenticated user and session on success.
 * Throws an AppError for any invalid, expired, or revoked token.
 *
 * @param {string} rawToken
 * @returns {Promise<{ user: object, session: import('mongoose').Document }>}
 */
export async function validateSession(rawToken) {
  const tokenHash = hashToken(rawToken);

  // Select sessionTokenHash explicitly (select:false)
  const session = await Session.findOne({ sessionTokenHash: tokenHash }).select(
    '+sessionTokenHash'
  );

  if (!session) {
    throw new AppError('Session not found', 401, 'UNAUTHORIZED');
  }

  if (session.revokedAt !== null) {
    throw new AppError('Session has been revoked', 401, 'SESSION_REVOKED');
  }

  if (session.expiresAt < new Date()) {
    throw new AppError('Session has expired', 401, 'SESSION_EXPIRED');
  }

  // Load associated user (exclude passwordHash)
  const user = await User.findById(session.userId);

  if (!user) {
    throw new AppError('User not found', 401, 'UNAUTHORIZED');
  }

  if (!user.isActive) {
    throw new AppError('This account has been deactivated', 403, 'ACCOUNT_INACTIVE');
  }

  // Update lastUsedAt asynchronously — do not await to keep auth fast
  Session.updateOne({ _id: session._id }, { lastUsedAt: new Date() }).catch((err) => {
    logger.warn({ err }, 'auth: failed to update session lastUsedAt');
  });

  return { user: safeUser(user), session };
}
