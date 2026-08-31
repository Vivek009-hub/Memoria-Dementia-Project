import * as authService from './auth.service.js';
import { env } from '../../config/env.js';

/**
 * Build the session cookie options.
 *
 * secure: true in production — requires HTTPS.
 * httpOnly: true — cookie is inaccessible to JavaScript (XSS mitigation).
 * sameSite: 'strict' — primary CSRF mitigation for browser clients.
 *   See docs/ARCHITECTURE.md §Authentication Security for CSRF strategy.
 */
function cookieOptions(expiresAt) {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'strict',
    expires: expiresAt,
    path: '/',
  };
}

/**
 * POST /api/v1/auth/register
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const { user } = await authService.register({ name, email, password, role });

    res.status(201).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const deviceInfo = req.headers['user-agent'] ?? null;
    const ip = req.ip ?? null;

    const { user, rawToken } = await authService.login({ email, password, deviceInfo, ip });

    // Set the raw token in an HTTP-only cookie.
    // The raw token is NEVER included in the response body.
    const expiresAt = new Date(Date.now() + env.sessionTtlMs);
    res.cookie(env.cookieName, rawToken, cookieOptions(expiresAt));

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/v1/auth/logout
 * Requires: auth.middleware (req.user and req.session are attached)
 */
export async function logout(req, res, next) {
  try {
    const rawToken = req.cookies?.[env.cookieName];
    await authService.logout(rawToken);

    // Clear the session cookie
    res.clearCookie(env.cookieName, {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/auth/me
 * Requires: auth.middleware (req.user is attached)
 */
export async function me(req, res, next) {
  try {
    // req.user is already the safe user projection attached by auth.middleware
    res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  } catch (err) {
    next(err);
  }
}
