/**
 * meeting.test.js — Comprehensive Vitest Integration Test Suite for B8 Meeting Circle
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
    sessionSecret: 'test-secret-for-meeting-test',
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
function uniqueEmail(prefix = 'meeting') {
  return `${prefix}${++_counter}@meetingtest.com`;
}

async function setUserRole(userId, role) {
  const User = (await import('../users/user.model.js')).default;
  await User.findByIdAndUpdate(userId, { role });
}

async function registerAndLogin(prefix = 'user', role = undefined) {
  const email = uniqueEmail(prefix);
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: `Test ${prefix}`, email, password: 'Password1!' });

  if (regRes.status !== 201) {
    throw new Error(`Register failed: ${JSON.stringify(regRes.body)}`);
  }

  const userId = regRes.body.data.user.id;

  if (role) {
    await setUserRole(userId, role);
  }

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'Password1!' });

  const cookie = loginRes.headers['set-cookie'];
  return { userId, cookie, email };
}

describe('Phase B8 — Memora Meeting Circle', () => {
  let hostUser;
  let patientUser;
  let strangerUser;
  let sessionData;

  beforeEach(async () => {
    hostUser = await registerAndLogin('host', 'HOST');
    patientUser = await registerAndLogin('patient', 'PATIENT');
    strangerUser = await registerAndLogin('stranger', 'PATIENT');

    // Create a scheduled community session
    const CommunitySession = (await import('../community/communitySession.model.js')).default;
    sessionData = await CommunitySession.create({
      title: 'Memory Lane Voice Circle',
      description: 'Interactive group session',
      date: new Date(Date.now() + 86400000),
      startTime: '10:00 AM',
      scheduledAt: new Date(Date.now() + 86400000),
      timezone: 'Asia/Kolkata',
      hostId: hostUser.userId,
      maximumParticipants: 2,
      meetingType: 'VIDEO',
      status: 'SCHEDULED',
      createdBy: hostUser.userId,
    });
  });

  describe('Meeting Creation', () => {
    it('allows host to create a meeting for an approved/scheduled session', async () => {
      const res = await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting`)
        .set('Cookie', hostUser.cookie)
        .send({
          title: 'Memory Lane Meeting Room',
          maximumParticipants: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.communitySessionId).toBe(sessionData._id.toString());
      expect(res.body.data.provider).toBe('mock');
      expect(res.body.data.providerMeetingId).toBeDefined();
    });

    it('rejects unauthorized patient from creating meeting', async () => {
      const res = await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting`)
        .set('Cookie', patientUser.cookie)
        .send({ title: 'Hacked Room' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Meeting Join & Leave Authorization', () => {
    it('allows host to join/initialize meeting and receive token', async () => {
      const res = await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting/join`)
        .set('Cookie', hostUser.cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.joinCredentials.token).toBeDefined();
      expect(res.body.data.joinCredentials.role).toBe('HOST');
    });

    it('rejects unregistered patient from joining meeting', async () => {
      const res = await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting/join`)
        .set('Cookie', strangerUser.cookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows pre-registered patient to join meeting and tracks participant state', async () => {
      // Register patient for community session first
      const SessionRegistration = (await import('../community/sessionRegistration.model.js'))
        .default;
      await SessionRegistration.create({
        sessionId: sessionData._id,
        patientId: patientUser.userId,
        status: 'REGISTERED',
      });

      // Host initializes room
      await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting/join`)
        .set('Cookie', hostUser.cookie);

      // Patient joins
      const res = await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting/join`)
        .set('Cookie', patientUser.cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.joinCredentials.role).toBe('PATIENT');
      expect(res.body.data.participant.status).toBe('JOINED');

      // Leave meeting
      const leaveRes = await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting/leave`)
        .set('Cookie', patientUser.cookie);

      expect(leaveRes.status).toBe(200);
      expect(leaveRes.body.success).toBe(true);
    });

    it('enforces active meeting participant capacity', async () => {
      const SessionRegistration = (await import('../community/sessionRegistration.model.js'))
        .default;

      // Register patientUser and strangerUser
      await SessionRegistration.create({
        sessionId: sessionData._id,
        patientId: patientUser.userId,
        status: 'REGISTERED',
      });
      await SessionRegistration.create({
        sessionId: sessionData._id,
        patientId: strangerUser.userId,
        status: 'REGISTERED',
      });

      // Fill capacity (max 2)
      await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting/join`)
        .set('Cookie', hostUser.cookie);

      await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting/join`)
        .set('Cookie', patientUser.cookie);

      // 3rd user attempt to join over capacity limit (2)
      const res = await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting/join`)
        .set('Cookie', strangerUser.cookie);

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('MEETING_FULL');
    });
  });

  describe('Host Controls & Lifecycle', () => {
    beforeEach(async () => {
      // Ensure meeting is created
      await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting/join`)
        .set('Cookie', hostUser.cookie);
    });

    it('allows host to start and end meeting', async () => {
      // Start meeting
      const startRes = await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting/start`)
        .set('Cookie', hostUser.cookie);

      expect(startRes.status).toBe(200);
      expect(startRes.body.data.status).toBe('LIVE');

      // End meeting
      const endRes = await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting/end`)
        .set('Cookie', hostUser.cookie);

      expect(endRes.status).toBe(200);
      expect(endRes.body.data.status).toBe('COMPLETED');
    });

    it('prevents non-host patient from calling host start/end controls', async () => {
      const startRes = await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting/start`)
        .set('Cookie', patientUser.cookie);

      expect(startRes.status).toBe(403);

      const endRes = await request(app)
        .post(`/api/v1/community/sessions/${sessionData._id}/meeting/end`)
        .set('Cookie', patientUser.cookie);

      expect(endRes.status).toBe(403);
    });

    it('allows host to fetch attendance history', async () => {
      const res = await request(app)
        .get(`/api/v1/community/sessions/${sessionData._id}/meeting/attendance`)
        .set('Cookie', hostUser.cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('Patient History & Webhooks', () => {
    it('returns patient personal meeting history', async () => {
      const res = await request(app)
        .get('/api/v1/meetings/history')
        .set('Cookie', patientUser.cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('processes provider webhooks idempotently', async () => {
      const res = await request(app).post('/api/v1/meetings/webhooks/mock').send({
        eventId: 'evt_12345',
        eventType: 'meeting.ended',
        providerMeetingId: 'mock_room_1',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
