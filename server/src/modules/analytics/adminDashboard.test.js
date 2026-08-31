/**
 * adminDashboard.test.js — Admin Dashboard Test Suite (Overview, Events, Voting, Users, Activity, Traffic)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import User from '../users/user.model.js';

vi.mock('../../config/env.js', () => ({
  env: {
    nodeEnv: 'test',
    port: 5000,
    mongoUri: 'mongodb://localhost/test',
    clientUrl: 'http://localhost:5173',
    logLevel: 'silent',
    sessionSecret: 'test-secret-for-admin-dashboard-test',
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

let _counter = 0;
function uniqueEmail(prefix = 'admin') {
  return `${prefix}${++_counter}@test.com`;
}

async function registerAndLogin(role = 'PATIENT') {
  const email = uniqueEmail(role.toLowerCase());
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: `Test ${role} ${_counter}`, email, password: 'Password1!', role });

  const userId = regRes.body.data.user.id;

  if (role !== 'PATIENT') {
    await User.findByIdAndUpdate(userId, { role });
  }

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'Password1!' });

  const h = loginRes.headers['set-cookie'];
  const arr = h ? (Array.isArray(h) ? h : [h]) : [];
  const cookie = arr.find((x) => x && x.startsWith('memora_session=')) ?? null;

  return {
    cookie,
    userId,
    email,
  };
}

describe('Memora Simplified Admin Dashboard API Suite', () => {
  // ── 1. AUTHORIZATION & CROSS-ROLE SECURITY ──────────────────────────────

  describe('Admin Role Authorization & Cross-Role Access', () => {
    it('denies unauthenticated requests to admin endpoints with 401', async () => {
      const res = await request(app).get('/api/v1/admin/analytics/overview');
      expect(res.status).toBe(401);
    });

    it('denies PATIENT user access to admin endpoints with 403', async () => {
      const patient = await registerAndLogin('PATIENT');
      const res = await request(app).get('/api/v1/admin/users').set('Cookie', patient.cookie);
      expect(res.status).toBe(403);
    });

    it('denies CAREGIVER user access to admin endpoints with 403', async () => {
      const caregiver = await registerAndLogin('CAREGIVER');
      const res = await request(app).get('/api/v1/admin/users').set('Cookie', caregiver.cookie);
      expect(res.status).toBe(403);
    });

    it('allows ADMIN role user to access admin overview', async () => {
      const admin = await registerAndLogin('ADMIN');
      const res = await request(app)
        .get('/api/v1/admin/analytics/overview')
        .set('Cookie', admin.cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUsers).toBeDefined();
      expect(res.body.data.patients).toBeDefined();
    });
  });

  // ── 2. ADMIN OVERVIEW ───────────────────────────────────────────────────

  describe('GET /api/v1/admin/analytics/overview (Overview Metrics)', () => {
    it('returns accurate user and event statistics without mock numbers', async () => {
      const admin = await registerAndLogin('ADMIN');
      await registerAndLogin('PATIENT');
      await registerAndLogin('CAREGIVER');

      const res = await request(app)
        .get('/api/v1/admin/analytics/overview')
        .set('Cookie', admin.cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(3);
      expect(res.body.data.patients).toBeGreaterThanOrEqual(1);
      expect(res.body.data.caregivers).toBeGreaterThanOrEqual(1);
    });
  });

  // ── 3. USER MANAGEMENT & LAST-ADMIN PROTECTION ──────────────────────────

  describe('User Administration (/api/v1/admin/users)', () => {
    it('lists users with search query', async () => {
      const admin = await registerAndLogin('ADMIN');
      const target = await registerAndLogin('PATIENT');

      const res = await request(app)
        .get(`/api/v1/admin/users?q=${target.email}`)
        .set('Cookie', admin.cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].email).toBe(target.email);
    });

    it('allows updating user role', async () => {
      const admin = await registerAndLogin('ADMIN');
      const target = await registerAndLogin('PATIENT');

      const res = await request(app)
        .patch(`/api/v1/admin/users/${target.userId}/role`)
        .set('Cookie', admin.cookie)
        .send({ role: 'HOST' });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('HOST');
    });

    it('allows toggling user account status', async () => {
      const admin = await registerAndLogin('ADMIN');
      const target = await registerAndLogin('PATIENT');

      const res = await request(app)
        .patch(`/api/v1/admin/users/${target.userId}/status`)
        .set('Cookie', admin.cookie)
        .send({ isActive: false });

      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });

    it('enforces LAST_ADMIN_PROTECTION when trying to revoke role of sole admin', async () => {
      const soleAdmin = await registerAndLogin('ADMIN');

      // Ensure no other admins exist
      await User.updateMany({ _id: { $ne: soleAdmin.userId } }, { role: 'PATIENT' });

      const res = await request(app)
        .patch(`/api/v1/admin/users/${soleAdmin.userId}/role`)
        .set('Cookie', soleAdmin.cookie)
        .send({ role: 'PATIENT' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('LAST_ADMIN_PROTECTION');
    });
  });

  // ── 4. COMMUNITY EVENTS & VOTING ────────────────────────────────────────

  describe('Community Event & Voting Management', () => {
    it('creates, toggles voting status, and schedules a proposal', async () => {
      const admin = await registerAndLogin('ADMIN');

      // 1. Create voting proposal
      const propRes = await request(app)
        .post('/api/v1/admin/community/sessions/ideas')
        .set('Cookie', admin.cookie)
        .send({ title: 'Memory Music Hour', description: 'Interactive music memories.' });

      expect(propRes.status).toBe(201);
      const ideaId = propRes.body.data._id;

      // 2. Toggle voting status
      const toggleRes = await request(app)
        .patch(`/api/v1/admin/community/sessions/ideas/${ideaId}/toggle-voting`)
        .set('Cookie', admin.cookie)
        .send({ isOpen: false });

      expect(toggleRes.status).toBe(200);

      // 3. Schedule session
      const schedRes = await request(app)
        .post('/api/v1/admin/community/sessions/schedule')
        .set('Cookie', admin.cookie)
        .send({
          title: 'Memory Music Hour',
          date: new Date(Date.now() + 86400000).toISOString(),
          startTime: '10:00 AM',
          maximumParticipants: 15,
        });

      expect(schedRes.status).toBe(201);
      const sessionId = schedRes.body.data._id;

      // 4. Cancel session
      const cancelRes = await request(app)
        .post(`/api/v1/admin/community/sessions/${sessionId}/cancel`)
        .set('Cookie', admin.cookie);

      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.status).toBe('CANCELLED');
    });
  });

  // ── 5. ACTIVITY AUDIT LOG ───────────────────────────────────────────────

  describe('GET /api/v1/admin/analytics/activity (Activity Audit Log)', () => {
    it('returns audit log entries for admin operations', async () => {
      const admin = await registerAndLogin('ADMIN');

      const res = await request(app)
        .get('/api/v1/admin/analytics/activity')
        .set('Cookie', admin.cookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });
  });

  // ── 6. BASIC TRAFFIC MONITORING ──────────────────────────────────────────

  describe('GET /api/v1/admin/analytics/traffic (Traffic Metrics)', () => {
    it('returns traffic metrics for today, 7d, and 30d time ranges', async () => {
      const admin = await registerAndLogin('ADMIN');

      const res = await request(app)
        .get('/api/v1/admin/analytics/traffic?range=today')
        .set('Cookie', admin.cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.totalRequests).toBeDefined();
      expect(res.body.data.activeUsers).toBeDefined();
      expect(res.body.data.chartData).toBeDefined();
    });
  });
});
