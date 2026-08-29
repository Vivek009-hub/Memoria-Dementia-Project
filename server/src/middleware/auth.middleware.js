import { validateSession } from '../modules/auth/auth.service.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

/**
 * requireAuth middleware
 *
 * Validates the session cookie and attaches req.user and req.session to the
 * request object. Passes a 401 AppError to next() if authentication fails.
 *
 * Flow:
 *  1. Read the session cookie by name from env.cookieName.
 *  2. Reject if missing.
 *  3. Call authService.validateSession() — which hashes the token, looks up
 *     the session, checks expiry + revocation, loads the user, checks isActive.
 *  4. Attach req.user (safe projection) and req.session.
 *  5. Call next().
 *
 * Authorization (role checks, resource ownership) belongs to a later phase.
 */
export async function requireAuth(req, _res, next) {
  try {
    const rawToken = req.cookies?.[env.cookieName];

    if (!rawToken) {
      throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
    }

    const { user, session } = await validateSession(rawToken);

    // Attach to request — downstream handlers use req.user
    req.user = user;
    req.session = session;

    next();
  } catch (err) {
    next(err);
  }
}
