/**
 * authorization.middleware.js — Express middleware factories for B3+
 *
 * Wraps the core authorization utilities in `src/utils/authorization.js`
 * into Express middleware suitable for use in route definitions.
 *
 * Exported middleware factories:
 *   requireRole(...roles)          — 403 if req.user.role not in the list
 *   requirePatientAccess(permission?) — reads :patientId from params,
 *                                       calls canAccessPatient, attaches
 *                                       result to req.authContext
 *
 * All middleware in this file REQUIRE that `requireAuth` has already run
 * (i.e. `req.user` is populated). They are purely authorization, not
 * authentication.
 */

import { canAccessPatient } from '../utils/authorization.js';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware factory: require the authenticated user to have one of the
 * specified roles. Call as:
 *
 *   router.get('/admin/thing', requireAuth, requireRole('ADMIN'), handler)
 *
 * @param {...string} roles - Allowed role strings (e.g. 'PATIENT', 'CAREGIVER')
 * @returns {import('express').RequestHandler}
 */
export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, 'UNAUTHORIZED'));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to access this resource', 403, 'FORBIDDEN')
      );
    }
    next();
  };
}

/**
 * Middleware factory: verify that the authenticated user may access the
 * patient identified by `req.params.patientId`.
 *
 * On success, attaches `req.authContext` with any relationship context
 * returned by `canAccessPatient`.
 *
 * Call as:
 *   router.get('/patients/:patientId', requireAuth, requirePatientAccess('viewProfile'), handler)
 *
 * @param {string} [permission] - Optional permission key to check
 * @returns {import('express').RequestHandler}
 */
export function requirePatientAccess(permission) {
  return async (req, _res, next) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const { patientId } = req.params;
      if (!patientId) {
        throw new AppError('patientId parameter is required', 400, 'INVALID_REQUEST');
      }

      const context = await canAccessPatient(req.user, patientId, permission);
      req.authContext = context;
      next();
    } catch (err) {
      next(err);
    }
  };
}
