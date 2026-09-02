/**
 * authorization.js — Core authorization utilities for B3+
 *
 * Provides the central `canAccessPatient(user, patientId, permission?)` helper
 * that evaluates:
 *   1. Role
 *   2. Patient self-ownership
 *   3. Caregiver relationship (status === 'ACTIVE')
 *   4. Required permission flag on the relationship
 *
 * This is intentionally NOT an Express middleware — it is a plain async function
 * so it can be called from services, controllers, or other middleware without
 * depending on the req/res cycle. Authorization middleware in
 * `authorization.middleware.js` wraps this function for route-level use.
 *
 * Future phases (B4–B12) MUST call this helper rather than re-implementing
 * caregiver-access queries.
 */

import mongoose from 'mongoose';
import CaregiverRelationship from '../modules/caregivers/caregiverRelationship.model.js';
import { AppError } from './AppError.js';

/**
 * Determine whether `user` may access `patientId` with an optional `permission`.
 *
 * @param {object}  user        - req.user (safe projection from auth middleware)
 * @param {string}  patientId   - MongoDB ObjectId string of the target patient
 * @param {string}  [permission]- Optional permission key (e.g. 'viewProfile')
 *
 * @throws {AppError} 400 if `patientId` is not a valid ObjectId
 * @throws {AppError} 403 if access is denied
 * @returns {Promise<{ relationship?: object }>} Resolves with context on success
 */
export async function canAccessPatient(user, patientId, permission) {
  // Validate patientId format before any DB query
  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    throw new AppError('Invalid patient ID', 400, 'INVALID_ID');
  }

  const patientObjectId = new mongoose.Types.ObjectId(patientId);
  const userObjectId = new mongoose.Types.ObjectId(user.id);

  // ── PATIENT: can only access their own data ──────────────────────────────
  if (user.role === 'PATIENT') {
    if (userObjectId.equals(patientObjectId)) {
      return {}; // Granted — own data
    }
    throw new AppError('You do not have permission to access this resource', 403, 'FORBIDDEN');
  }

  // ── CAREGIVER: needs an ACTIVE relationship ± required permission ─────────
  if (user.role === 'CAREGIVER') {
    const relationship = await CaregiverRelationship.findOne({
      caregiverId: userObjectId,
      patientId: patientObjectId,
      status: 'ACTIVE',
    });

    if (!relationship) {
      throw new AppError('You do not have permission to access this resource', 403, 'FORBIDDEN');
    }

    if (permission && relationship.permissions && relationship.permissions[permission] === false) {
      throw new AppError(
        'You do not have the required permission to perform this action',
        403,
        'FORBIDDEN'
      );
    }

    return { relationship };
  }

  // ── All other roles (ADMIN, HOST) — not authorised in B3 scope ───────────
  // ADMIN access policy will be defined when the admin module is built in B4+.
  throw new AppError('You do not have permission to access this resource', 403, 'FORBIDDEN');
}
