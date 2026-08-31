/**
 * meetingCircle.test.js — Meeting Circle Daily Video Calling Test Suite
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
    sessionSecret: 'test-secret-for-meeting-circles-test',
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
function uniqueEmail(prefix = 'circle') {
  return `${prefix}${++_counter}@test.com`;
}

async function registerAndLogin(role = 'PATIENT') {
  const email = uniqueEmail(role.toLowerCase());
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: `Test ${role} ${_counter}`, email, password: 'Password1!' });

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'Password1!' });

  const h = loginRes.headers['set-cookie'];
  const arr = h ? (Array.isArray(h) ? h : [h]) : [];
  const cookie = arr.find((x) => x && x.startsWith('memora_session=')) ?? null;

  return {
    cookie,
    userId: regRes.body.data.user.id,
    email,
  };
}

describe('Meeting Circle API (B8 & Daily Integration)', () => {
  // ── 1. CIRCLE CREATION ───────────────────────────────────────────────────

  describe('POST /api/v1/meeting-circles (Create Circle)', () => {
    it('creates a discoverable circle with maxParticipants fixed at 6', async () => {
      const user = await registerAndLogin();
      const res = await request(app)
        .post('/api/v1/meeting-circles')
        .set('Cookie', user.cookie)
        .send({
          name: 'Morning Talk Circle',
          description: 'A cozy morning discussion.',
          visibility: 'DISCOVERABLE',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.circle.name).toBe('Morning Talk Circle');
      expect(res.body.data.circle.maxParticipants).toBe(6);
      expect(res.body.data.circle.activeParticipantCount).toBe(1);
      expect(res.body.data.circle.creatorId).toBe(user.userId);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.roomUrl).toBeDefined();
    });

    it('rejects creation without a name', async () => {
      const user = await registerAndLogin();
      const res = await request(app)
        .post('/api/v1/meeting-circles')
        .set('Cookie', user.cookie)
        .send({ description: 'No name provided' });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects unauthenticated creation requests', async () => {
      const res = await request(app)
        .post('/api/v1/meeting-circles')
        .send({ name: 'Unauthenticated Circle' });

      expect(res.status).toBe(401);
    });

    it('ignores client attempt to set maxParticipants > 6', async () => {
      const user = await registerAndLogin();
      const res = await request(app)
        .post('/api/v1/meeting-circles')
        .set('Cookie', user.cookie)
        .send({
          name: 'Hacked Capacity Circle',
          maxParticipants: 100, // Client attempt to override
        });

      expect(res.status).toBe(201);
      expect(res.body.data.circle.maxParticipants).toBe(6); // Server hardlocked to 6
    });
  });

  // ── 2. DISCOVERY & MY CIRCLES ─────────────────────────────────────────────

  describe('GET /api/v1/meeting-circles/discover and /mine', () => {
    it('lists discoverable circles', async () => {
      const creator = await registerAndLogin();
      await request(app)
        .post('/api/v1/meeting-circles')
        .set('Cookie', creator.cookie)
        .send({ name: 'Public Circle 1', visibility: 'DISCOVERABLE' });

      const viewer = await registerAndLogin();
      const res = await request(app)
        .get('/api/v1/meeting-circles/discover')
        .set('Cookie', viewer.cookie);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].visibility).toBe('DISCOVERABLE');
    });

    it('does not expose invite-only circles in discovery list', async () => {
      const creator = await registerAndLogin();
      await request(app)
        .post('/api/v1/meeting-circles')
        .set('Cookie', creator.cookie)
        .send({ name: 'Secret Private Circle', visibility: 'INVITE_ONLY' });

      const viewer = await registerAndLogin();
      const res = await request(app)
        .get('/api/v1/meeting-circles/discover')
        .set('Cookie', viewer.cookie);

      expect(res.status).toBe(200);
      const secretCircle = res.body.data.find((c) => c.name === 'Secret Private Circle');
      expect(secretCircle).toBeUndefined();
    });

    it('returns creator circles in /mine', async () => {
      const creator = await registerAndLogin();
      await request(app)
        .post('/api/v1/meeting-circles')
        .set('Cookie', creator.cookie)
        .send({ name: 'My Own Circle', visibility: 'DISCOVERABLE' });

      const res = await request(app)
        .get('/api/v1/meeting-circles/mine')
        .set('Cookie', creator.cookie);

      expect(res.status).toBe(200);
      expect(res.body.data.some((c) => c.name === 'My Own Circle')).toBe(true);
    });
  });

  // ── 3. HARD 6-PERSON CAPACITY & 7th PARTICIPANT REJECTION ─────────────────

  describe('Capacity limits & 7th participant rejection', () => {
    it('enforces maximum capacity of 6 participants and rejects 7th participant with 409', async () => {
      const host = await registerAndLogin();
      const createRes = await request(app)
        .post('/api/v1/meeting-circles')
        .set('Cookie', host.cookie)
        .send({ name: 'Strict 6 Circle', visibility: 'DISCOVERABLE' });

      const circleId = createRes.body.data.circle.id;

      // Host is 1st participant. Join 5 more participants (total 6)
      for (let i = 2; i <= 6; i++) {
        const u = await registerAndLogin();
        const joinRes = await request(app)
          .post(`/api/v1/meeting-circles/${circleId}/join`)
          .set('Cookie', u.cookie);

        expect(joinRes.status).toBe(200);
        expect(joinRes.body.data.circle.activeParticipantCount).toBe(i);
      }

      // Attempt to join 7th participant -> must be rejected
      const p7 = await registerAndLogin();
      const p7Res = await request(app)
        .post(`/api/v1/meeting-circles/${circleId}/join`)
        .set('Cookie', p7.cookie);

      expect(p7Res.status).toBe(409);
      expect(p7Res.body.error.code).toBe('CAPACITY_REACHED');
    });
  });

  // ── 4. JOIN & LEAVE RECONCILIATION ────────────────────────────────────────

  describe('POST /api/v1/meeting-circles/:circleId/join and /leave', () => {
    it('allows patient to join and receive Daily room token', async () => {
      const creator = await registerAndLogin();
      const createRes = await request(app)
        .post('/api/v1/meeting-circles')
        .set('Cookie', creator.cookie)
        .send({ name: 'Joinable Circle' });

      const circleId = createRes.body.data.circle.id;
      const joiner = await registerAndLogin();

      const joinRes = await request(app)
        .post(`/api/v1/meeting-circles/${circleId}/join`)
        .set('Cookie', joiner.cookie);

      expect(joinRes.status).toBe(200);
      expect(joinRes.body.data.token).toBeDefined();
      expect(joinRes.body.data.roomUrl).toBeDefined();
      expect(joinRes.body.data.circle.activeParticipantCount).toBe(2);
    });

    it('reconciles participant count when patient leaves', async () => {
      const creator = await registerAndLogin();
      const createRes = await request(app)
        .post('/api/v1/meeting-circles')
        .set('Cookie', creator.cookie)
        .send({ name: 'Leavable Circle' });

      const circleId = createRes.body.data.circle.id;
      const joiner = await registerAndLogin();

      await request(app)
        .post(`/api/v1/meeting-circles/${circleId}/join`)
        .set('Cookie', joiner.cookie);

      // Leave call
      const leaveRes = await request(app)
        .post(`/api/v1/meeting-circles/${circleId}/leave`)
        .set('Cookie', joiner.cookie);

      expect(leaveRes.status).toBe(200);

      // Verify count decremented
      const checkRes = await request(app)
        .get(`/api/v1/meeting-circles/${circleId}`)
        .set('Cookie', creator.cookie);

      expect(checkRes.body.data.activeParticipantCount).toBe(1);
    });
  });

  // ── 5. AUTHORIZATION & IDOR SECURITY ──────────────────────────────────────

  describe('Authorization & Security', () => {
    it('prevents non-owner from deleting another user circle', async () => {
      const owner = await registerAndLogin();
      const createRes = await request(app)
        .post('/api/v1/meeting-circles')
        .set('Cookie', owner.cookie)
        .send({ name: 'Protected Circle' });

      const circleId = createRes.body.data.circle.id;
      const attacker = await registerAndLogin();

      const delRes = await request(app)
        .delete(`/api/v1/meeting-circles/${circleId}`)
        .set('Cookie', attacker.cookie);

      expect(delRes.status).toBe(403);
      expect(delRes.body.error.code).toBe('FORBIDDEN');
    });

    it('allows owner to delete their circle', async () => {
      const owner = await registerAndLogin();
      const createRes = await request(app)
        .post('/api/v1/meeting-circles')
        .set('Cookie', owner.cookie)
        .send({ name: 'Deletable Circle' });

      const circleId = createRes.body.data.circle.id;

      const delRes = await request(app)
        .delete(`/api/v1/meeting-circles/${circleId}`)
        .set('Cookie', owner.cookie);

      expect(delRes.status).toBe(200);
      expect(delRes.body.success).toBe(true);
    });

    it('rejects unauthorized join to invite-only circle', async () => {
      const owner = await registerAndLogin();
      const createRes = await request(app)
        .post('/api/v1/meeting-circles')
        .set('Cookie', owner.cookie)
        .send({ name: 'Strict Private Circle', visibility: 'INVITE_ONLY' });

      const circleId = createRes.body.data.circle.id;
      const stranger = await registerAndLogin();

      const joinRes = await request(app)
        .post(`/api/v1/meeting-circles/${circleId}/join`)
        .set('Cookie', stranger.cookie);

      expect(joinRes.status).toBe(403);
    });
  });

  // ── 6. PARTICIPANT REPORTING ──────────────────────────────────────────────

  describe('POST /api/v1/meeting-circles/:circleId/report', () => {
    it('allows reporting a participant for inappropriate behavior', async () => {
      const host = await registerAndLogin();
      const createRes = await request(app)
        .post('/api/v1/meeting-circles')
        .set('Cookie', host.cookie)
        .send({ name: 'Reportable Circle' });

      const circleId = createRes.body.data.circle.id;
      const peer = await registerAndLogin();

      const reportRes = await request(app)
        .post(`/api/v1/meeting-circles/${circleId}/report`)
        .set('Cookie', host.cookie)
        .send({
          participantId: peer.userId,
          reason: 'Inappropriate behavior',
          comments: 'Disrupted group discussion.',
        });

      expect(reportRes.status).toBe(200);
      expect(reportRes.body.data.status).toBe('SUBMITTED');
    });
  });
});
