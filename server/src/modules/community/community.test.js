/**
 * community.test.js — Integration test suite for B7 Community Sessions
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
    sessionSecret: 'test-secret-for-community-test',
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
function uniqueEmail(prefix = 'community') {
  return `${prefix}${++_counter}@commtest.com`;
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

  const setCookie = loginRes.headers['set-cookie'];
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
  const cookie = arr.find((c) => c.startsWith('memora_session=')) ?? null;

  return {
    id: userId,
    email,
    role: role ?? regRes.body.data.user.role,
    cookie,
  };
}

describe('Community Sessions & Proposals (B7)', () => {
  it('allows admin to create a session proposal, but denies patients', async () => {
    const admin = await registerAndLogin('admin1', 'ADMIN');
    const patient = await registerAndLogin('patient1', 'PATIENT');

    // Patient attempt
    const patientRes = await request(app)
      .post('/api/v1/admin/community/sessions/ideas')
      .set('Cookie', patient.cookie)
      .send({
        title: 'Music & Memories',
        description: 'Sharing classic tunes',
        sessionType: 'MUSIC',
      });
    expect(patientRes.status).toBe(403);

    // Admin attempt
    const adminRes = await request(app)
      .post('/api/v1/admin/community/sessions/ideas')
      .set('Cookie', admin.cookie)
      .send({
        title: 'Music & Memories',
        description: 'Sharing classic tunes',
        sessionType: 'MUSIC',
      });
    expect(adminRes.status).toBe(201);
    expect(adminRes.body.success).toBe(true);
    expect(adminRes.body.data.title).toBe('Music & Memories');
    expect(adminRes.body.data.status).toBe('VOTING');
  });

  it('allows patients to list voting proposals and vote once', async () => {
    const admin = await registerAndLogin('admin2', 'ADMIN');
    const patient1 = await registerAndLogin('patient2_1', 'PATIENT');
    const patient2 = await registerAndLogin('patient2_2', 'PATIENT');

    // Admin creates proposal
    const propRes = await request(app)
      .post('/api/v1/admin/community/sessions/ideas')
      .set('Cookie', admin.cookie)
      .send({
        title: 'Art & Expression',
        description: 'Watercolor painting session',
        sessionType: 'ART',
      });
    const ideaId = propRes.body.data._id;

    // Patient 1 lists proposals
    const listRes1 = await request(app)
      .get('/api/v1/community/sessions/voting')
      .set('Cookie', patient1.cookie);
    expect(listRes1.status).toBe(200);
    expect(listRes1.body.data.length).toBeGreaterThan(0);

    // Patient 1 votes
    const voteRes1 = await request(app)
      .post(`/api/v1/community/sessions/ideas/${ideaId}/vote`)
      .set('Cookie', patient1.cookie);
    expect(voteRes1.status).toBe(200);
    expect(voteRes1.body.data.voteCount).toBe(1);

    // Patient 1 duplicate vote attempt fails
    const dupVoteRes = await request(app)
      .post(`/api/v1/community/sessions/ideas/${ideaId}/vote`)
      .set('Cookie', patient1.cookie);
    expect(dupVoteRes.status).toBe(409);
    expect(dupVoteRes.body.error.code).toBe('DUPLICATE_VOTE');

    // Patient 2 votes
    const voteRes2 = await request(app)
      .post(`/api/v1/community/sessions/ideas/${ideaId}/vote`)
      .set('Cookie', patient2.cookie);
    expect(voteRes2.status).toBe(200);
    expect(voteRes2.body.data.voteCount).toBe(2);

    // Patient 1 removes vote
    const removeRes = await request(app)
      .delete(`/api/v1/community/sessions/ideas/${ideaId}/vote`)
      .set('Cookie', patient1.cookie);
    expect(removeRes.status).toBe(200);
    expect(removeRes.body.data.voteCount).toBe(1);
  });

  it('enforces voting deadlines when timestamps are provided', async () => {
    const admin = await registerAndLogin('admin3', 'ADMIN');
    const patient = await registerAndLogin('patient3', 'PATIENT');

    const pastDate = new Date(Date.now() - 3600000).toISOString();
    const farPastDate = new Date(Date.now() - 7200000).toISOString();

    const expiredPropRes = await request(app)
      .post('/api/v1/admin/community/sessions/ideas')
      .set('Cookie', admin.cookie)
      .send({
        title: 'Expired Idea',
        sessionType: 'OTHER',
        votingStartsAt: farPastDate,
        votingEndsAt: pastDate,
      });
    const expiredId = expiredPropRes.body.data._id;

    const voteRes = await request(app)
      .post(`/api/v1/community/sessions/ideas/${expiredId}/vote`)
      .set('Cookie', patient.cookie);
    expect(voteRes.status).toBe(409);
    expect(voteRes.body.error.code).toBe('VOTING_EXPIRED');
  });

  it('supports full workflow: Proposal -> Approve -> Schedule -> Pre-Register -> Capacity -> Cancel', async () => {
    const admin = await registerAndLogin('admin4', 'ADMIN');
    const patientA = await registerAndLogin('patient4_A', 'PATIENT');
    const patientB = await registerAndLogin('patient4_B', 'PATIENT');
    const patientC = await registerAndLogin('patient4_C', 'PATIENT');

    // 1. Create Proposal
    const propRes = await request(app)
      .post('/api/v1/admin/community/sessions/ideas')
      .set('Cookie', admin.cookie)
      .send({
        title: 'Storytelling Circle',
        description: 'Sharing memory stories',
        sessionType: 'STORY_SHARING',
      });
    const ideaId = propRes.body.data._id;

    // 2. Patient A & B vote
    await request(app).post(`/api/v1/community/sessions/ideas/${ideaId}/vote`).set('Cookie', patientA.cookie);
    await request(app).post(`/api/v1/community/sessions/ideas/${ideaId}/vote`).set('Cookie', patientB.cookie);

    // 3. Admin approves proposal
    const approveRes = await request(app)
      .post(`/api/v1/admin/community/sessions/ideas/${ideaId}/approve`)
      .set('Cookie', admin.cookie);
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe('APPROVED');

    // 4. Admin schedules event (with max capacity = 2)
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const scheduleRes = await request(app)
      .post(`/api/v1/admin/community/sessions/ideas/${ideaId}/schedule`)
      .set('Cookie', admin.cookie)
      .send({
        title: 'Storytelling Circle Scheduled',
        description: 'Official storytelling session',
        date: tomorrow,
        startTime: '17:00',
        durationMinutes: 60,
        timezone: 'Asia/Kolkata',
        maximumParticipants: 2,
        meetingType: 'VIDEO',
        featuredPerson: {
          name: 'Dr. Ananya',
          designation: 'Memory Care Specialist',
        },
      });
    expect(scheduleRes.status).toBe(201);
    const sessionId = scheduleRes.body.data._id;

    // Verify converted proposal is removed from active voting list
    const votingList = await request(app)
      .get('/api/v1/community/sessions/voting')
      .set('Cookie', patientA.cookie);
    const inVoting = votingList.body.data.some((item) => item._id === ideaId);
    expect(inVoting).toBe(false);

    // 5. Patient A pre-registers
    const regA = await request(app)
      .post(`/api/v1/community/sessions/${sessionId}/register`)
      .set('Cookie', patientA.cookie);
    expect(regA.status).toBe(200);
    expect(regA.body.data.registeredCount).toBe(1);

    // Patient A duplicate registration attempt fails
    const dupRegA = await request(app)
      .post(`/api/v1/community/sessions/${sessionId}/register`)
      .set('Cookie', patientA.cookie);
    expect(dupRegA.status).toBe(409);
    expect(dupRegA.body.error.code).toBe('DUPLICATE_REGISTRATION');

    // 6. Patient B pre-registers (Reaches capacity = 2)
    const regB = await request(app)
      .post(`/api/v1/community/sessions/${sessionId}/register`)
      .set('Cookie', patientB.cookie);
    expect(regB.status).toBe(200);
    expect(regB.body.data.registeredCount).toBe(2);
    expect(regB.body.data.registrationStatus).toBe('FULL');

    // 7. Patient C attempts to pre-register -> Session is FULL
    const regC = await request(app)
      .post(`/api/v1/community/sessions/${sessionId}/register`)
      .set('Cookie', patientC.cookie);
    expect(regC.status).toBe(409);
    expect(regC.body.error.code).toBe('SESSION_FULL');

    // 8. Patient A cancels registration -> capacity re-opens to OPEN
    const cancelA = await request(app)
      .delete(`/api/v1/community/sessions/${sessionId}/register`)
      .set('Cookie', patientA.cookie);
    expect(cancelA.status).toBe(200);

    // Patient C can now pre-register successfully
    const regC2 = await request(app)
      .post(`/api/v1/community/sessions/${sessionId}/register`)
      .set('Cookie', patientC.cookie);
    expect(regC2.status).toBe(200);

    // 9. Patient C checks my registrations list
    const myRegs = await request(app)
      .get('/api/v1/community/sessions/registrations/me')
      .set('Cookie', patientC.cookie);
    expect(myRegs.status).toBe(200);
    expect(myRegs.body.data.length).toBe(1);

    // 10. Admin checks session registrations
    const adminRegs = await request(app)
      .get(`/api/v1/admin/community/sessions/${sessionId}/registrations`)
      .set('Cookie', admin.cookie);
    expect(adminRegs.status).toBe(200);
    expect(adminRegs.body.data.length).toBeGreaterThanOrEqual(2);
  });

  it('rejects unauthenticated requests to community endpoints', async () => {
    const res = await request(app).get('/api/v1/community/sessions/voting');
    expect(res.status).toBe(401);
  });
});
