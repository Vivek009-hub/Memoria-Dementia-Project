/**
 * auth.test.js — Phase B2 Authentication Tests
 *
 * Tests the full authentication lifecycle using Supertest against a real
 * Express app backed by an in-memory MongoDB instance (via setup.js).
 *
 * Covers:
 *  - Registration
 *  - Login
 *  - Authentication middleware
 *  - GET /auth/me
 *  - Logout
 *  - Security invariants (no password/hash/token leakage)
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';

// ── Mock env BEFORE any module that imports it ──────────────────────────────
// Path from server/src/modules/auth/ → server/src/config/env.js
vi.mock('../../config/env.js', () => ({
  env: {
    nodeEnv: 'test',
    port: 5000,
    mongoUri: 'mongodb://localhost:27017/memora-test',
    clientUrl: 'http://localhost:5173',
    logLevel: 'silent',
    sessionSecret: 'test-secret-value-for-vitest-do-not-use-in-production',
    sessionTtlMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    cookieName: 'memora_session',
  },
}));

// ── Shared in-memory DB setup ────────────────────────────────────────────────
// Path from server/src/modules/auth/ → server/tests/setup.js
import '../../../tests/setup.js';

// ── App import (after mocks) ─────────────────────────────────────────────────
// Path from server/src/modules/auth/ → server/src/app.js
let app;
beforeAll(async () => {
  const module = await import('../../app.js');
  app = module.default;
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Register a test user and return the response. */
async function registerUser(overrides = {}) {
  return request(app)
    .post('/api/v1/auth/register')
    .send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      ...overrides,
    });
}

/** Login and return the response (includes Set-Cookie header). */
async function loginUser(overrides = {}) {
  return request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'test@example.com',
      password: 'Password123!',
      ...overrides,
    });
}

/** Extract the session cookie string from a response. */
function extractCookie(res) {
  const setCookieHeader = res.headers['set-cookie'];
  if (!setCookieHeader) return null;
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
  const sessionCookie = cookies.find((c) => c.startsWith('memora_session='));
  return sessionCookie ?? null;
}

// ── Registration ─────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/register', () => {
  it('registers a valid user and returns 201', async () => {
    const res = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('returns a safe user object', async () => {
    const res = await registerUser();
    const { user } = res.body.data;
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name', 'Test User');
    expect(user).toHaveProperty('email', 'test@example.com');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('isActive', true);
  });

  it('never returns password or passwordHash', async () => {
    const res = await registerUser();
    const { user } = res.body.data;
    expect(user).not.toHaveProperty('password');
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('normalizes email to lowercase', async () => {
    const res = await registerUser({ email: 'UPPER@EXAMPLE.COM' });
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe('upper@example.com');
  });

  it('rejects duplicate email with 409', async () => {
    await registerUser();
    const res = await registerUser();
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('rejects an invalid email format with 422', async () => {
    const res = await registerUser({ email: 'not-an-email' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects missing name with 422', async () => {
    const res = await registerUser({ name: '' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects a password shorter than 8 characters with 422', async () => {
    const res = await registerUser({ password: 'short' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('does NOT allow self-assignment of privileged role (ADMIN)', async () => {
    const res = await registerUser({ role: 'ADMIN' });
    // Registration should either succeed (ignoring role) with CAREGIVER, or reject
    if (res.status === 201) {
      expect(res.body.data.user.role).not.toBe('ADMIN');
    } else {
      // Any rejection is also acceptable — ADMIN was not granted
      expect(res.body.data?.user?.role).not.toBe('ADMIN');
    }
  });

  it('does NOT allow self-assignment of HOST role', async () => {
    const res = await registerUser({ role: 'HOST' });
    if (res.status === 201) {
      expect(res.body.data.user.role).not.toBe('HOST');
    }
  });

  it('assigns CAREGIVER as the default role', async () => {
    const res = await registerUser();
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('CAREGIVER');
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  // beforeEach (not beforeAll) so each test gets a fresh user.
  // afterEach in setup.js wipes the DB after every test, so
  // a beforeAll registration would be cleared before the 2nd test runs.
  beforeEach(async () => {
    await registerUser();
  });

  it('logs in with correct credentials and returns 200', async () => {
    const res = await loginUser();
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns a safe user object', async () => {
    const res = await loginUser();
    const { user } = res.body.data;
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('email', 'test@example.com');
  });

  it('sets an HTTP-only session cookie', async () => {
    const res = await loginUser();
    const cookie = extractCookie(res);
    expect(cookie).not.toBeNull();
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('memora_session=');
  });

  it('does NOT expose the session token in the response body', async () => {
    const res = await loginUser();
    const bodyStr = JSON.stringify(res.body);
    // The response body should not contain a 64-char hex token
    expect(bodyStr).not.toMatch(/[0-9a-f]{64}/);
    expect(res.body.data).not.toHaveProperty('token');
    expect(res.body.data).not.toHaveProperty('sessionToken');
    expect(res.body.data).not.toHaveProperty('rawToken');
  });

  it('does NOT return passwordHash', async () => {
    const res = await loginUser();
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('rejects incorrect password with 401 and generic error', async () => {
    const res = await loginUser({ password: 'wrongpassword' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    // Generic message — must NOT reveal "password is wrong"
    expect(res.body.error.message.toLowerCase()).not.toContain('password');
  });

  it('rejects unknown email with 401 and generic error', async () => {
    const res = await loginUser({ email: 'nobody@example.com' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('rejects missing password with 422', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'test@example.com' });
    expect(res.status).toBe(422);
  });
});

// ── Authentication Middleware ─────────────────────────────────────────────────

describe('Authentication middleware (requireAuth)', () => {
  let cookie;

  // beforeEach — fresh user + session for each test, because afterEach wipes DB.
  beforeEach(async () => {
    await registerUser();
    const loginRes = await loginUser();
    cookie = extractCookie(loginRes);
  });

  it('accepts a valid session cookie', async () => {
    const res = await request(app).get('/api/v1/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
  });

  it('rejects a request with no cookie', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('rejects a request with a tampered/invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', 'memora_session=invalidtoken123');
    expect(res.status).toBe(401);
  });

  it('rejects a revoked session', async () => {
    // Login, then logout, then try to use the cookie again
    await registerUser({ email: 'revoke@example.com' });
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'revoke@example.com', password: 'Password123!' });
    const revokedCookie = extractCookie(loginRes);

    // Logout to revoke
    await request(app).post('/api/v1/auth/logout').set('Cookie', revokedCookie);

    // Try to use the revoked cookie
    const meRes = await request(app).get('/api/v1/auth/me').set('Cookie', revokedCookie);
    expect(meRes.status).toBe(401);
  });

  it('attaches authenticated user context to the request', async () => {
    const res = await request(app).get('/api/v1/auth/me').set('Cookie', cookie);
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user).toHaveProperty('email');
    expect(res.body.data.user).toHaveProperty('role');
  });
});

// ── GET /auth/me ──────────────────────────────────────────────────────────────

describe('GET /api/v1/auth/me', () => {
  let cookie;

  // beforeEach — fresh user + session for each test.
  beforeEach(async () => {
    await registerUser();
    const loginRes = await loginUser();
    cookie = extractCookie(loginRes);
  });

  it('returns the current user when authenticated', async () => {
    const res = await request(app).get('/api/v1/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  it('returns 401 for an unauthenticated request', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('does NOT expose passwordHash in /me response', async () => {
    const res = await request(app).get('/api/v1/auth/me').set('Cookie', cookie);
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('does NOT expose sessionTokenHash in /me response', async () => {
    const res = await request(app).get('/api/v1/auth/me').set('Cookie', cookie);
    expect(res.body.data.user).not.toHaveProperty('sessionTokenHash');
  });

  it('returns expected user fields', async () => {
    const res = await request(app).get('/api/v1/auth/me').set('Cookie', cookie);
    const { user } = res.body.data;
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('preferredLanguage');
    expect(user).toHaveProperty('isActive');
  });
});

// ── Logout ────────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/logout', () => {
  it('revokes the session and clears the cookie', async () => {
    await registerUser();
    const loginRes = await loginUser();
    const cookie = extractCookie(loginRes);

    const logoutRes = await request(app).post('/api/v1/auth/logout').set('Cookie', cookie);

    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    // Cookie should be cleared (expired or empty)
    const responseCookies = logoutRes.headers['set-cookie'];
    if (responseCookies) {
      const sessionCookie = (
        Array.isArray(responseCookies) ? responseCookies : [responseCookies]
      ).find((c) => c.startsWith('memora_session='));
      if (sessionCookie) {
        // Should be cleared (empty value or max-age=0 or expires in the past)
        expect(
          sessionCookie.includes('memora_session=;') ||
            sessionCookie.includes('Max-Age=0') ||
            sessionCookie.includes('Expires=Thu, 01 Jan 1970')
        ).toBe(true);
      }
    }
  });

  it('invalidates future requests after logout', async () => {
    await registerUser({ email: 'logout2@example.com' });
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'logout2@example.com', password: 'Password123!' });
    const cookie = extractCookie(loginRes);

    // Verify authenticated before logout
    const meBeforeRes = await request(app).get('/api/v1/auth/me').set('Cookie', cookie);
    expect(meBeforeRes.status).toBe(200);

    // Logout
    await request(app).post('/api/v1/auth/logout').set('Cookie', cookie);

    // Should now be rejected
    const meAfterRes = await request(app).get('/api/v1/auth/me').set('Cookie', cookie);
    expect(meAfterRes.status).toBe(401);
  });

  it('handles logout without a valid session gracefully (idempotent)', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', 'memora_session=nonexistentsessiontoken');
    // Should not throw 500 — logout is always safe
    expect(res.status).not.toBe(500);
  });
});

// ── Full auth flow ─────────────────────────────────────────────────────────────

describe('Full authentication flow', () => {
  it('register → login → me → logout → me fails', async () => {
    // 1. Register
    const regRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Flow User',
      email: 'flow@example.com',
      password: 'FlowPassword1!',
    });
    expect(regRes.status).toBe(201);

    // 2. Login
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: 'flow@example.com',
      password: 'FlowPassword1!',
    });
    expect(loginRes.status).toBe(200);
    const cookie = extractCookie(loginRes);
    expect(cookie).not.toBeNull();

    // 3. Me — authenticated
    const meRes = await request(app).get('/api/v1/auth/me').set('Cookie', cookie);
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe('flow@example.com');

    // 4. Logout
    const logoutRes = await request(app).post('/api/v1/auth/logout').set('Cookie', cookie);
    expect(logoutRes.status).toBe(200);

    // 5. Me — should now fail
    const meAfterRes = await request(app).get('/api/v1/auth/me').set('Cookie', cookie);
    expect(meAfterRes.status).toBe(401);
  });
});
