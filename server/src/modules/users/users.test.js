/**
 * users.test.js — B3 User Profile Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

vi.mock('../../config/env.js', () => ({
  env: {
    nodeEnv: 'test',
    port: 5000,
    mongoUri: 'mongodb://localhost/test',
    clientUrl: 'http://localhost:5173',
    logLevel: 'silent',
    sessionSecret: 'test-secret-for-users-test',
    sessionTtlMs: 604800000,
    cookieName: 'memora_session',
  },
}));

import '../../../tests/setup.js';

let app;
beforeEach(async () => {
  if (!app) {
    const m = await import('../../app.js');
    app = m.default;
  }
});

// ── Helpers ─────────────────────────────────────────────────────────────────

async function register(overrides = {}) {
  return request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Alice', email: 'alice@example.com', password: 'Password1!', ...overrides });
}

async function login(email = 'alice@example.com', password = 'Password1!') {
  return request(app).post('/api/v1/auth/login').send({ email, password });
}

function cookie(res) {
  const h = res.headers['set-cookie'];
  if (!h) return null;
  const arr = Array.isArray(h) ? h : [h];
  return arr.find((c) => c.startsWith('memora_session=')) ?? null;
}

async function authCookie(overrides = {}) {
  await register(overrides);
  const res = await login(overrides.email ?? 'alice@example.com');
  return cookie(res);
}

// ── GET /api/v1/users/me ─────────────────────────────────────────────────────

describe('GET /api/v1/users/me', () => {
  it('returns the authenticated user profile', async () => {
    const c = await authCookie();
    const res = await request(app).get('/api/v1/users/me').set('Cookie', c);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('alice@example.com');
  });

  it('returns expected safe fields', async () => {
    const c = await authCookie();
    const res = await request(app).get('/api/v1/users/me').set('Cookie', c);
    const { user } = res.body.data;
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('preferredLanguage');
    expect(user).toHaveProperty('isActive');
  });

  it('never returns passwordHash', async () => {
    const c = await authCookie();
    const res = await request(app).get('/api/v1/users/me').set('Cookie', c);
    expect(res.body.data.user).not.toHaveProperty('passwordHash');
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
  });
});

// ── PATCH /api/v1/users/me ───────────────────────────────────────────────────

describe('PATCH /api/v1/users/me', () => {
  it('updates allowed fields (name, preferredLanguage)', async () => {
    const c = await authCookie();
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Cookie', c)
      .send({ name: 'Alice Updated', preferredLanguage: 'fr' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe('Alice Updated');
    expect(res.body.data.user.preferredLanguage).toBe('fr');
  });

  it('updates profileImageUrl', async () => {
    const c = await authCookie();
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Cookie', c)
      .send({ profileImageUrl: 'https://example.com/photo.jpg' });
    expect(res.status).toBe(200);
    expect(res.body.data.user.profileImageUrl).toBe('https://example.com/photo.jpg');
  });

  it('rejects attempts to change role', async () => {
    const c = await authCookie();
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Cookie', c)
      .send({ role: 'ADMIN' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects attempts to change isActive', async () => {
    const c = await authCookie();
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Cookie', c)
      .send({ isActive: false });
    expect(res.status).toBe(422);
  });

  it('rejects attempts to change passwordHash', async () => {
    const c = await authCookie();
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Cookie', c)
      .send({ passwordHash: 'hacked' });
    expect(res.status).toBe(422);
  });

  it('rejects an empty update body', async () => {
    const c = await authCookie();
    const res = await request(app).patch('/api/v1/users/me').set('Cookie', c).send({});
    expect(res.status).toBe(422);
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).patch('/api/v1/users/me').send({ name: 'Hacker' });
    expect(res.status).toBe(401);
  });
});
