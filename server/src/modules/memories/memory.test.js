/**
 * memory.test.js — Integration tests for B5 Memory Assistance
 *
 * Follows the project's established test pattern:
 *  - vi.mock for env config
 *  - Global setup: MongoMemoryServer via globalSetup + setup.js
 *  - Dynamic imports for models
 *  - supertest for HTTP
 *  - afterEach clears all collections (setup.js)
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';

// ── Mock env before any module loads ─────────────────────────────────────────
vi.mock('../../config/env.js', () => ({
  env: {
    nodeEnv: 'test',
    port: 5001,
    mongoUri: process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/memora_test',
    clientUrl: 'http://localhost:5173',
    logLevel: 'silent',
    sessionSecret: 'test-secret-b5',
    sessionTtlMs: 7 * 24 * 60 * 60 * 1000,
    cookieName: 'memora_session',
  },
}));

import '../../../tests/setup.js';
import request from 'supertest';
import mongoose from 'mongoose';

let app;
beforeEach(async () => {
  if (!app) {
    const mod = await import('../../app.js');
    app = mod.default;
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

let _counter = 0;
function uniqueEmail(prefix = 'user') {
  return `${prefix}${++_counter}@memtest5.com`;
}

async function setUserRole(userId, role) {
  const User = (await import('../users/user.model.js')).default;
  await User.findByIdAndUpdate(userId, { role });
}

/**
 * Register, optionally set role, log in, return { id, email, role, cookie }.
 */
async function registerAndLogin(prefix = 'user', role = undefined) {
  const email = uniqueEmail(prefix);
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: `Test ${prefix}`, email, password: 'Password1!' });

  if (regRes.status !== 201) {
    throw new Error(`Register failed: ${JSON.stringify(regRes.body)}`);
  }

  const userId = regRes.body.data.user.id;
  if (role) await setUserRole(userId, role);

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'Password1!' });

  const arr = Array.isArray(loginRes.headers['set-cookie'])
    ? loginRes.headers['set-cookie']
    : [loginRes.headers['set-cookie']];
  const cookie = arr.find((c) => c.startsWith('memora_session=')) ?? null;

  return { id: userId, email, role: role ?? regRes.body.data.user.role, cookie };
}

/**
 * Create an ACTIVE caregiver relationship with given permissions.
 */
async function createActiveRelationship(caregiverId, patientId, permissions = {}) {
  const CaregiverRelationship = (await import('../caregivers/caregiverRelationship.model.js'))
    .default;
  return CaregiverRelationship.create({
    caregiverId: new mongoose.Types.ObjectId(caregiverId),
    patientId: new mongoose.Types.ObjectId(patientId),
    relationshipType: 'FAMILY',
    status: 'ACTIVE',
    permissions: {
      viewProfile: true,
      manageMemories: permissions.manageMemories ?? false,
      ...permissions,
    },
    createdBy: new mongoose.Types.ObjectId(caregiverId),
  });
}

/**
 * Build a valid memory body.
 */
function buildMemoryBody(overrides = {}) {
  return {
    title: 'My Wedding Day',
    type: 'EVENT',
    description: 'A beautiful day in Pune',
    importantDate: '1995-06-15',
    datePrecision: 'exact',
    tags: ['wedding', 'family'],
    ...overrides,
  };
}

/**
 * Create a memory via API and return the response body data.
 */
async function createMemoryViaApi(cookie, body = {}, query = {}) {
  const req = request(app)
    .post('/api/v1/memories')
    .set('Cookie', cookie)
    .send(buildMemoryBody(body));
  if (Object.keys(query).length) req.query(query);
  const res = await req;
  return res;
}

// ── Memory Model ──────────────────────────────────────────────────────────────

describe('Memory model', () => {
  it('creates a valid memory', async () => {
    const Memory = (await import('./memory.model.js')).default;
    const mem = await Memory.create({
      patientId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      title: 'Test Memory',
      type: 'STORY',
    });
    expect(mem._id).toBeDefined();
    expect(mem.isActive).toBe(true);
    expect(mem.type).toBe('STORY');
  });

  it('rejects invalid type', async () => {
    const Memory = (await import('./memory.model.js')).default;
    await expect(
      Memory.create({
        patientId: new mongoose.Types.ObjectId(),
        createdBy: new mongoose.Types.ObjectId(),
        title: 'Test',
        type: 'INVALID_TYPE',
      })
    ).rejects.toThrow();
  });

  it('requires title', async () => {
    const Memory = (await import('./memory.model.js')).default;
    await expect(
      Memory.create({
        patientId: new mongoose.Types.ObjectId(),
        createdBy: new mongoose.Types.ObjectId(),
        type: 'PHOTO',
      })
    ).rejects.toThrow();
  });

  it('defaults isActive to true and tags to empty array', async () => {
    const Memory = (await import('./memory.model.js')).default;
    const mem = await Memory.create({
      patientId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      title: 'Defaults test',
      type: 'PLACE',
    });
    expect(mem.isActive).toBe(true);
    expect(mem.tags).toEqual([]);
  });
});

// ── FamilyMember Model ────────────────────────────────────────────────────────

describe('FamilyMember model', () => {
  it('creates a valid family member', async () => {
    const FamilyMember = (await import('./familyMember.model.js')).default;
    const fm = await FamilyMember.create({
      patientId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      name: 'Rahul',
      relationship: 'Grandson',
    });
    expect(fm._id).toBeDefined();
    expect(fm.name).toBe('Rahul');
    expect(fm.isActive).toBe(true);
  });

  it('requires name', async () => {
    const FamilyMember = (await import('./familyMember.model.js')).default;
    await expect(
      FamilyMember.create({
        patientId: new mongoose.Types.ObjectId(),
        createdBy: new mongoose.Types.ObjectId(),
      })
    ).rejects.toThrow();
  });
});

// ── POST /api/v1/memories ─────────────────────────────────────────────────────

describe('POST /api/v1/memories', () => {
  it('patient can create a memory (201)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await createMemoryViaApi(patient.cookie);
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('My Wedding Day');
    expect(res.body.data.patientId).toBe(patient.id);
  });

  it('rejects unauthenticated request (401)', async () => {
    const res = await request(app).post('/api/v1/memories').send(buildMemoryBody());
    expect(res.status).toBe(401);
  });

  it('CAREGIVER without patientId (400)', async () => {
    const caregiver = await registerAndLogin('caregiver');
    const res = await createMemoryViaApi(caregiver.cookie);
    expect(res.status).toBe(400);
  });

  it('rejects invalid type (422)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await createMemoryViaApi(patient.cookie, { type: 'INVALID' });
    expect(res.status).toBe(422);
  });

  it('rejects missing title (422)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await request(app)
      .post('/api/v1/memories')
      .set('Cookie', patient.cookie)
      .send({ type: 'EVENT' });
    expect(res.status).toBe(422);
  });

  it('rejects invalid mediaUrl (422)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await createMemoryViaApi(patient.cookie, { mediaUrl: 'not-a-url' });
    expect(res.status).toBe(422);
  });

  it('patient patientId is always their own - injected value ignored', async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');
    const res = await request(app)
      .post('/api/v1/memories')
      .set('Cookie', patientA.cookie)
      .query({ patientId: patientB.id })
      .send(buildMemoryBody());
    expect(res.status).toBe(201);
    expect(res.body.data.patientId).toBe(patientA.id);
  });

  it('authorized caregiver (manageMemories) can create memory for patient (201)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const caregiver = await registerAndLogin('caregiver');
    await createActiveRelationship(caregiver.id, patient.id, { manageMemories: true });

    const res = await request(app)
      .post('/api/v1/memories')
      .set('Cookie', caregiver.cookie)
      .query({ patientId: patient.id })
      .send(buildMemoryBody());

    expect(res.status).toBe(201);
    expect(res.body.data.patientId).toBe(patient.id);
  });

  it('caregiver WITHOUT manageMemories (403)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const caregiver = await registerAndLogin('caregiver');
    await createActiveRelationship(caregiver.id, patient.id, { manageMemories: false });

    const res = await request(app)
      .post('/api/v1/memories')
      .set('Cookie', caregiver.cookie)
      .query({ patientId: patient.id })
      .send(buildMemoryBody());

    expect(res.status).toBe(403);
  });

  it('REVOKED caregiver (403)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const caregiver = await registerAndLogin('caregiver');
    const CaregiverRelationship = (await import('../caregivers/caregiverRelationship.model.js'))
      .default;
    await CaregiverRelationship.create({
      caregiverId: new mongoose.Types.ObjectId(caregiver.id),
      patientId: new mongoose.Types.ObjectId(patient.id),
      relationshipType: 'FAMILY',
      status: 'REVOKED',
      permissions: { viewProfile: true, manageMemories: true },
      createdBy: new mongoose.Types.ObjectId(caregiver.id),
    });
    const res = await request(app)
      .post('/api/v1/memories')
      .set('Cookie', caregiver.cookie)
      .query({ patientId: patient.id })
      .send(buildMemoryBody());
    expect(res.status).toBe(403);
  });
});

// ── GET /api/v1/memories ──────────────────────────────────────────────────────

describe('GET /api/v1/memories', () => {
  it('patient lists only their own memories', async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');

    await createMemoryViaApi(patientA.cookie);
    await createMemoryViaApi(patientA.cookie, { title: 'Second' });
    await createMemoryViaApi(patientB.cookie, { title: 'PatientB Memory' });

    const res = await request(app).get('/api/v1/memories').set('Cookie', patientA.cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    res.body.data.forEach((m) => expect(m.patientId).toBe(patientA.id));
  });

  it('filters by type', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    await createMemoryViaApi(patient.cookie, { type: 'PHOTO', title: 'Photo 1' });
    await createMemoryViaApi(patient.cookie, { type: 'STORY', title: 'Story 1' });

    const res = await request(app)
      .get('/api/v1/memories')
      .set('Cookie', patient.cookie)
      .query({ type: 'PHOTO' });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].type).toBe('PHOTO');
  });

  it('filters by isActive', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res1 = await createMemoryViaApi(patient.cookie, { title: 'Active' });
    const memId = res1.body.data._id;

    // Deactivate
    await request(app).delete(`/api/v1/memories/${memId}`).set('Cookie', patient.cookie);

    const res = await request(app)
      .get('/api/v1/memories')
      .set('Cookie', patient.cookie)
      .query({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].isActive).toBe(false);
  });

  it('rejects limit greater than 100 (422)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await request(app)
      .get('/api/v1/memories')
      .set('Cookie', patient.cookie)
      .query({ limit: 200 });
    expect(res.status).toBe(422);
  });

  it('returns pagination metadata', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    await createMemoryViaApi(patient.cookie);

    const res = await request(app).get('/api/v1/memories').set('Cookie', patient.cookie);
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it('authorized caregiver can list patient memories', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const caregiver = await registerAndLogin('caregiver');
    await createActiveRelationship(caregiver.id, patient.id, { manageMemories: true });
    await createMemoryViaApi(patient.cookie);

    const res = await request(app)
      .get('/api/v1/memories')
      .set('Cookie', caregiver.cookie)
      .query({ patientId: patient.id });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});

// ── GET /api/v1/memories/:memoryId ───────────────────────────────────────────

describe('GET /api/v1/memories/:memoryId', () => {
  it('patient can get their own memory', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await createMemoryViaApi(patient.cookie);
    const memId = createRes.body.data._id;

    const res = await request(app).get(`/api/v1/memories/${memId}`).set('Cookie', patient.cookie);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(memId);
  });

  it('patient cannot access another patient memory (404)', async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');
    const createRes = await createMemoryViaApi(patientA.cookie);
    const memId = createRes.body.data._id;

    const res = await request(app).get(`/api/v1/memories/${memId}`).set('Cookie', patientB.cookie);
    expect(res.status).toBe(404);
  });

  it('rejects invalid ObjectId (400)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await request(app).get('/api/v1/memories/not-an-id').set('Cookie', patient.cookie);
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent memory', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/v1/memories/${fakeId}`).set('Cookie', patient.cookie);
    expect(res.status).toBe(404);
  });
});

// ── PATCH /api/v1/memories/:memoryId ─────────────────────────────────────────

describe('PATCH /api/v1/memories/:memoryId', () => {
  it('patient can update title', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await createMemoryViaApi(patient.cookie);
    const memId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/v1/memories/${memId}`)
      .set('Cookie', patient.cookie)
      .send({ title: 'Updated Title' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
  });

  it('patient cannot update another patient memory (404)', async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');
    const createRes = await createMemoryViaApi(patientA.cookie);
    const memId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/v1/memories/${memId}`)
      .set('Cookie', patientB.cookie)
      .send({ title: 'Hijacked' });
    expect(res.status).toBe(404);
  });

  it('rejects empty update body (422)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await createMemoryViaApi(patient.cookie);
    const memId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/v1/memories/${memId}`)
      .set('Cookie', patient.cookie)
      .send({});
    expect(res.status).toBe(422);
  });

  it('patient cannot change patientId via update (field stripped)', async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');
    const createRes = await createMemoryViaApi(patientA.cookie);
    const memId = createRes.body.data._id;

    // Attempt to change ownership
    const res = await request(app)
      .patch(`/api/v1/memories/${memId}`)
      .set('Cookie', patientA.cookie)
      .send({ title: 'New title', patientId: patientB.id });
    expect(res.status).toBe(200);
    expect(res.body.data.patientId).toBe(patientA.id);
  });

  it('updates tags array', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await createMemoryViaApi(patient.cookie);
    const memId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/v1/memories/${memId}`)
      .set('Cookie', patient.cookie)
      .send({ tags: ['updated', 'tags'] });
    expect(res.status).toBe(200);
    expect(res.body.data.tags).toEqual(['updated', 'tags']);
  });

  it('can deactivate memory via isActive false', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await createMemoryViaApi(patient.cookie);
    const memId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/v1/memories/${memId}`)
      .set('Cookie', patient.cookie)
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });
});

// ── DELETE /api/v1/memories/:memoryId ────────────────────────────────────────

describe('DELETE /api/v1/memories/:memoryId', () => {
  it('patient can soft-delete their memory', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await createMemoryViaApi(patient.cookie);
    const memId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/v1/memories/${memId}`)
      .set('Cookie', patient.cookie);
    expect(res.status).toBe(200);

    const Memory = (await import('./memory.model.js')).default;
    const mem = await Memory.findById(memId);
    expect(mem.isActive).toBe(false);
  });

  it('patient cannot delete another patient memory (404)', async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');
    const createRes = await createMemoryViaApi(patientA.cookie);
    const memId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/v1/memories/${memId}`)
      .set('Cookie', patientB.cookie);
    expect(res.status).toBe(404);
  });

  it('deactivated memory does not appear in active list', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await createMemoryViaApi(patient.cookie);
    const memId = createRes.body.data._id;
    await request(app).delete(`/api/v1/memories/${memId}`).set('Cookie', patient.cookie);

    const listRes = await request(app)
      .get('/api/v1/memories')
      .set('Cookie', patient.cookie)
      .query({ isActive: true });
    expect(listRes.body.data.length).toBe(0);
  });
});

// ── POST /api/v1/memories/family-members ─────────────────────────────────────

describe('POST /api/v1/memories/family-members', () => {
  it('patient can create a family member (201)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patient.cookie)
      .send({ name: 'Rahul', relationship: 'Grandson' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Rahul');
    expect(res.body.data.patientId).toBe(patient.id);
  });

  it('rejects missing name (422)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patient.cookie)
      .send({ relationship: 'Grandson' });
    expect(res.status).toBe(422);
  });

  it('rejects invalid photoUrl (422)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patient.cookie)
      .send({ name: 'Rahul', photoUrl: 'not-a-url' });
    expect(res.status).toBe(422);
  });

  it('CAREGIVER without manageMemories (403)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const caregiver = await registerAndLogin('caregiver');
    await createActiveRelationship(caregiver.id, patient.id, { manageMemories: false });

    const res = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', caregiver.cookie)
      .query({ patientId: patient.id })
      .send({ name: 'Test Person' });
    expect(res.status).toBe(403);
  });

  it('authorized caregiver can create family member', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const caregiver = await registerAndLogin('caregiver');
    await createActiveRelationship(caregiver.id, patient.id, { manageMemories: true });

    const res = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', caregiver.cookie)
      .query({ patientId: patient.id })
      .send({ name: 'Doctor Singh', relationship: 'Doctor' });
    expect(res.status).toBe(201);
    expect(res.body.data.patientId).toBe(patient.id);
  });
});

// ── GET /api/v1/memories/family-members ──────────────────────────────────────

describe('GET /api/v1/memories/family-members', () => {
  it('patient lists only their own family members', async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');

    await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patientA.cookie)
      .send({ name: 'Member A1' });
    await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patientB.cookie)
      .send({ name: 'Member B1' });

    const res = await request(app)
      .get('/api/v1/memories/family-members')
      .set('Cookie', patientA.cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Member A1');
  });

  it('filters by isActive', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patient.cookie)
      .send({ name: 'To Delete' });
    const memberId = createRes.body.data._id;

    await request(app)
      .delete(`/api/v1/memories/family-members/${memberId}`)
      .set('Cookie', patient.cookie);

    const res = await request(app)
      .get('/api/v1/memories/family-members')
      .set('Cookie', patient.cookie)
      .query({ isActive: true });
    expect(res.body.data.length).toBe(0);
  });

  it('returns pagination metadata', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patient.cookie)
      .send({ name: 'Test Member' });

    const res = await request(app)
      .get('/api/v1/memories/family-members')
      .set('Cookie', patient.cookie);
    expect(res.body.pagination.total).toBe(1);
  });
});

// ── GET /api/v1/memories/family-members/:memberId ────────────────────────────

describe('GET /api/v1/memories/family-members/:memberId', () => {
  it('patient can get their own family member', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patient.cookie)
      .send({ name: 'Grandma' });
    const memberId = createRes.body.data._id;

    const res = await request(app)
      .get(`/api/v1/memories/family-members/${memberId}`)
      .set('Cookie', patient.cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Grandma');
  });

  it('patient cannot access another patient family member (404)', async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patientA.cookie)
      .send({ name: 'Secret Person' });
    const memberId = createRes.body.data._id;

    const res = await request(app)
      .get(`/api/v1/memories/family-members/${memberId}`)
      .set('Cookie', patientB.cookie);
    expect(res.status).toBe(404);
  });

  it('rejects invalid ObjectId (400)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await request(app)
      .get('/api/v1/memories/family-members/bad-id')
      .set('Cookie', patient.cookie);
    expect(res.status).toBe(400);
  });
});

// ── PATCH /api/v1/memories/family-members/:memberId ──────────────────────────

describe('PATCH /api/v1/memories/family-members/:memberId', () => {
  it('patient can update family member name', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patient.cookie)
      .send({ name: 'Old Name' });
    const memberId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/v1/memories/family-members/${memberId}`)
      .set('Cookie', patient.cookie)
      .send({ name: 'New Name' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('New Name');
  });

  it('rejects empty update body (422)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patient.cookie)
      .send({ name: 'Test' });
    const memberId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/v1/memories/family-members/${memberId}`)
      .set('Cookie', patient.cookie)
      .send({});
    expect(res.status).toBe(422);
  });

  it('patient cannot update another patient member (404)', async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patientA.cookie)
      .send({ name: 'A Person' });
    const memberId = createRes.body.data._id;

    const res = await request(app)
      .patch(`/api/v1/memories/family-members/${memberId}`)
      .set('Cookie', patientB.cookie)
      .send({ name: 'Hijacked' });
    expect(res.status).toBe(404);
  });
});

// ── DELETE /api/v1/memories/family-members/:memberId ─────────────────────────

describe('DELETE /api/v1/memories/family-members/:memberId', () => {
  it('patient can soft-delete a family member', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patient.cookie)
      .send({ name: 'To Remove' });
    const memberId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/v1/memories/family-members/${memberId}`)
      .set('Cookie', patient.cookie);
    expect(res.status).toBe(200);

    const FamilyMember = (await import('./familyMember.model.js')).default;
    const fm = await FamilyMember.findById(memberId);
    expect(fm.isActive).toBe(false);
  });

  it('patient cannot delete another patient family member (404)', async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patientA.cookie)
      .send({ name: 'A Person' });
    const memberId = createRes.body.data._id;

    const res = await request(app)
      .delete(`/api/v1/memories/family-members/${memberId}`)
      .set('Cookie', patientB.cookie);
    expect(res.status).toBe(404);
  });
});

// ── Memory ↔ FamilyMember link ────────────────────────────────────────────────

describe('Memory FamilyMember association', () => {
  it('can link a memory to a family member via relatedPersonId', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');

    // Create family member
    const fmRes = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patient.cookie)
      .send({ name: 'Grandma' });
    const memberId = fmRes.body.data._id;

    // Create memory referencing family member
    const memRes = await createMemoryViaApi(patient.cookie, {
      relatedPersonId: memberId,
      title: 'Memory with Grandma',
    });
    expect(memRes.status).toBe(201);
    expect(memRes.body.data.relatedPersonId).toBe(memberId);
  });

  it('can filter memories by relatedPersonId', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');

    const fmRes = await request(app)
      .post('/api/v1/memories/family-members')
      .set('Cookie', patient.cookie)
      .send({ name: 'Grandpa' });
    const memberId = fmRes.body.data._id;

    await createMemoryViaApi(patient.cookie, { relatedPersonId: memberId, title: 'With Grandpa' });
    await createMemoryViaApi(patient.cookie, { title: 'Other memory' });

    const res = await request(app)
      .get('/api/v1/memories')
      .set('Cookie', patient.cookie)
      .query({ relatedPersonId: memberId });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('With Grandpa');
  });
});

// ── End-to-end lifecycle ──────────────────────────────────────────────────────

describe('Memory full lifecycle', () => {
  it('patient creates, reads, updates, deactivates memory', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');

    // Create
    const createRes = await createMemoryViaApi(patient.cookie, {
      title: 'Trip to Goa',
      type: 'PLACE',
      description: 'Best vacation ever',
      tags: ['goa', 'travel'],
    });
    expect(createRes.status).toBe(201);
    const memId = createRes.body.data._id;

    // Read
    const getRes = await request(app)
      .get(`/api/v1/memories/${memId}`)
      .set('Cookie', patient.cookie);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.title).toBe('Trip to Goa');

    // Update
    const patchRes = await request(app)
      .patch(`/api/v1/memories/${memId}`)
      .set('Cookie', patient.cookie)
      .send({ description: 'Amazing trip with family' });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.description).toBe('Amazing trip with family');

    // Deactivate
    const deleteRes = await request(app)
      .delete(`/api/v1/memories/${memId}`)
      .set('Cookie', patient.cookie);
    expect(deleteRes.status).toBe(200);

    // Should no longer appear in active list
    const listRes = await request(app)
      .get('/api/v1/memories')
      .set('Cookie', patient.cookie)
      .query({ isActive: true });
    expect(listRes.body.data.length).toBe(0);

    // Appears in inactive list
    const inactiveRes = await request(app)
      .get('/api/v1/memories')
      .set('Cookie', patient.cookie)
      .query({ isActive: false });
    expect(inactiveRes.body.data.length).toBe(1);
  });
});

// ── Local Memory Photo Upload ──────────────────────────────────────────────────

describe('POST /api/v1/memories (Local Photo Upload)', () => {
  it('allows Patient to upload a local photo file via multipart/form-data', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');

    // Create a mock image buffer
    const mockImageBuffer = Buffer.from('fake-image-content-jpeg-bytes');

    const res = await request(app)
      .post('/api/v1/memories')
      .set('Cookie', patient.cookie)
      .field('title', 'Local Photo Upload Test')
      .field('type', 'PHOTO')
      .attach('photo', mockImageBuffer, { filename: 'test-pic.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Local Photo Upload Test');
    expect(res.body.data.mediaUrl).toMatch(/^\/uploads\/memories\//);

    // Verify static image serving endpoint
    const staticRes = await request(app).get(res.body.data.mediaUrl);
    expect(staticRes.status).toBe(200);
  });

  it('rejects unsupported file types (422)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const mockFile = Buffer.from('console.log("bad")');

    const res = await request(app)
      .post('/api/v1/memories')
      .set('Cookie', patient.cookie)
      .field('title', 'Invalid Executable')
      .field('type', 'PHOTO')
      .attach('photo', mockFile, { filename: 'script.exe', contentType: 'application/x-msdownload' });

    expect(res.status).toBe(422);
  });
});
