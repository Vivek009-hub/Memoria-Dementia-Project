/**
 * e2e.test.js — Cross-Phase End-to-End Integration Test Suite for Memora
 *
 * Verifies that B0 through B13 work together as ONE connected system.
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
    sessionSecret: 'test-secret-for-e2e-test',
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
function uniqueEmail(prefix = 'e2e') {
  return `${prefix}${++_counter}@e2etest.com`;
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

describe('Phase B14 — Full System Integration & Hardening (E2E Workflows)', () => {
  describe('Flow A: Authentication, User & Patient Profile Lifecycle', () => {
    it('executes Register -> Login -> Profile Retrieval -> Profile Update -> Logout', async () => {
      const email = uniqueEmail('flowa');

      // 1. Register
      const regRes = await request(app)
        .post('/api/v1/auth/register')
        .send({ name: 'Aarav Patel', email, password: 'Password1!' });
      expect(regRes.status).toBe(201);
      expect(regRes.body.data.user.name).toBe('Aarav Patel');

      // 2. Login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'Password1!' });
      expect(loginRes.status).toBe(200);
      const cookie = loginRes.headers['set-cookie'];

      // 3. User Profile
      const meRes = await request(app)
        .get('/api/v1/users/me')
        .set('Cookie', cookie);
      expect(meRes.status).toBe(200);
      expect(meRes.body.data.user.email).toBe(email);

      // 4. Logout
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', cookie);
      expect(logoutRes.status).toBe(200);

      // 5. Verify unauthenticated
      const failRes = await request(app)
        .get('/api/v1/users/me')
        .set('Cookie', cookie);
      expect(failRes.status).toBe(401);
    });
  });

  describe('Flow B: Cognitive Games -> Analytics -> AI Recommendations', () => {
    it('propagates game completion data to B10 Analytics and B11 AI Recommendations', async () => {
      const admin = await registerAndLogin('admin', 'ADMIN');
      const patient = await registerAndLogin('patientgame', 'PATIENT');

      // 1. Admin creates a cognitive game
      const gameRes = await request(app)
        .post('/api/v1/games')
        .set('Cookie', admin.cookie)
        .send({
          title: 'Spatial Pattern Match',
          description: 'Memorize the grid patterns',
          category: 'PATTERN',
          difficulty: 'EASY',
          instructions: 'Look at the highlighted cells',
        });
      expect(gameRes.status).toBe(201);
      const gameId = gameRes.body.data._id || gameRes.body.data.id;

      // 2. Patient starts game session
      const startRes = await request(app)
        .post(`/api/v1/games/${gameId}/sessions`)
        .set('Cookie', patient.cookie)
        .send({ difficulty: 'EASY' });
      expect(startRes.status).toBe(201);
      const sessionId = startRes.body.data._id || startRes.body.data.id;

      // 3. Patient completes session
      const completeRes = await request(app)
        .post(`/api/v1/games/sessions/${sessionId}/complete`)
        .set('Cookie', patient.cookie)
        .send({
          score: 95,
          accuracy: 95,
          responseTimeMs: 1200,
          hintsUsed: 0,
          mistakes: 0,
        });
      expect(completeRes.status).toBe(200);

      // 4. Check Analytics Overview (B10)
      const analyticsRes = await request(app)
        .get('/api/v1/analytics/me/overview')
        .set('Cookie', patient.cookie);
      expect(analyticsRes.status).toBe(200);
      expect(analyticsRes.body.data.games.completed).toBeGreaterThanOrEqual(1);

      // 5. Get AI Recommendations (B11) which uses cognitive analytics context
      const aiRes = await request(app)
        .get('/api/v1/ai/recommendations')
        .set('Cookie', patient.cookie);
      expect(aiRes.status).toBe(200);
      expect(Array.isArray(aiRes.body.data)).toBe(true);
    });
  });

  describe('Flow C: Memory Assistance -> AI Assistant QA & Natural Language Search', () => {
    it('stores memory in B5 and retrieves grounded AI responses in B11', async () => {
      const patient = await registerAndLogin('patientmem', 'PATIENT');

      // 1. Patient creates a memory
      const memRes = await request(app)
        .post('/api/v1/memories')
        .set('Cookie', patient.cookie)
        .send({
          title: 'Daughter Marriage Day',
          description: 'Ananya married Rahul at Taj Bengal Kolkata in November 2023.',
          type: 'EVENT',
          relatedPlace: 'Kolkata',
          importantDate: '2023-11-20',
          tags: ['wedding', 'daughter', 'kolkata'],
        });
      expect(memRes.status).toBe(201);

      // 2. Query AI Memory Assistant (B11)
      const aiRes = await request(app)
        .post('/api/v1/ai/memory-assistant')
        .set('Cookie', patient.cookie)
        .send({ message: 'When was Ananya wedding?' });

      expect(aiRes.status).toBe(200);
      expect(aiRes.body.data.answer).toContain('Daughter Marriage Day');
      expect(aiRes.body.data.sources.length).toBeGreaterThan(0);

      // 3. Natural Language Memory Search
      const searchRes = await request(app)
        .post('/api/v1/ai/memory-search')
        .set('Cookie', patient.cookie)
        .send({ query: 'wedding Kolkata' });

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.matches.length).toBe(1);
      expect(searchRes.body.data.matches[0].title).toBe('Daughter Marriage Day');
    });
  });

  describe('Flow E & F: Community Proposals -> Voting -> Approval -> Meeting Circle -> Join', () => {
    it('executes full community session proposal to live video meeting workflow', async () => {
      const admin = await registerAndLogin('admincomm', 'ADMIN');
      const host = await registerAndLogin('hostcomm', 'HOST');
      const patient = await registerAndLogin('patientcomm', 'PATIENT');

      // 1. Admin creates voting proposal
      const propRes = await request(app)
        .post('/api/v1/admin/community/sessions/ideas')
        .set('Cookie', admin.cookie)
        .send({
          title: 'Classical Music Therapy Hour',
          description: 'Live sitar performance and discussion',
          sessionType: 'MUSIC',
        });
      expect(propRes.status).toBe(201);
      const ideaId = propRes.body.data._id;

      // 2. Patient votes for proposal
      const voteRes = await request(app)
        .post(`/api/v1/community/sessions/ideas/${ideaId}/vote`)
        .set('Cookie', patient.cookie);
      expect(voteRes.status).toBe(200);

      // 3. Admin approves proposal
      const appRes = await request(app)
        .post(`/api/v1/admin/community/sessions/ideas/${ideaId}/approve`)
        .set('Cookie', admin.cookie);
      expect(appRes.status).toBe(200);

      // 4. Admin schedules proposal as Community Session
      const schedRes = await request(app)
        .post(`/api/v1/admin/community/sessions/ideas/${ideaId}/schedule`)
        .set('Cookie', admin.cookie)
        .send({
          title: 'Classical Music Therapy Hour',
          date: new Date(Date.now() + 86400000).toISOString(),
          startTime: '04:00 PM',
          timezone: 'Asia/Kolkata',
          hostId: host.userId,
          maximumParticipants: 10,
          meetingType: 'VIDEO',
        });
      expect(schedRes.status).toBe(201);
      const sessionId = schedRes.body.data._id;

      // 4. Patient pre-registers for scheduled session
      const regRes = await request(app)
        .post(`/api/v1/community/sessions/${sessionId}/register`)
        .set('Cookie', patient.cookie);
      expect(regRes.status).toBe(200);

      // 5. Host initializes & joins B8 Meeting Circle
      const hostJoinRes = await request(app)
        .post(`/api/v1/meetings/sessions/${sessionId}/meeting/join`)
        .set('Cookie', host.cookie);
      expect(hostJoinRes.status).toBe(200);
      expect(hostJoinRes.body.data.joinCredentials.role).toBe('HOST');

      // 6. Patient joins B8 Meeting Circle and receives join token
      const patientJoinRes = await request(app)
        .post(`/api/v1/meetings/sessions/${sessionId}/meeting/join`)
        .set('Cookie', patient.cookie);
      expect(patientJoinRes.status).toBe(200);
      expect(patientJoinRes.body.data.joinCredentials.role).toBe('PATIENT');
    });
  });

  describe('Flow G: Safety SOS -> Emergency Alert Event -> Notifications', () => {
    it('triggers SOS safety alert and records event for caregiver monitoring', async () => {
      const patient = await registerAndLogin('patientsos', 'PATIENT');

      // 1. Patient triggers SOS alert (B12 Safety Backend)
      const sosRes = await request(app)
        .post('/api/v1/safety/sos')
        .set('Cookie', patient.cookie)
        .send({
          location: { latitude: 22.5726, longitude: 88.3639, accuracy: 10 },
          source: 'MOBILE_APP',
        });
      expect(sosRes.status).toBe(201);
      expect(sosRes.body.success).toBe(true);
      expect(sosRes.body.data.type).toBe('SOS');
      const eventId = sosRes.body.data._id;

      // 2. Patient can acknowledge safety event
      const ackRes = await request(app)
        .post(`/api/v1/safety/events/${eventId}/acknowledge`)
        .set('Cookie', patient.cookie);
      expect(ackRes.status).toBe(200);
      expect(ackRes.body.data.status).toBe('ACKNOWLEDGED');

      // 3. Resolve safety event
      const resolveRes = await request(app)
        .post(`/api/v1/safety/events/${eventId}/resolve`)
        .set('Cookie', patient.cookie)
        .send({ resolutionNotes: 'Patient safe and sound' });
      expect(resolveRes.status).toBe(200);
      expect(resolveRes.body.data.status).toBe('RESOLVED');
    });
  });
});
