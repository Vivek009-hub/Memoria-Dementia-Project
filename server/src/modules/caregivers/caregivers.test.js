/**
 * caregivers.test.js — B3 Caregiver Relationship Tests
 *
 * Tests the full relationship lifecycle and security matrix.
 * All registered users get CAREGIVER role (auth default in B2).
 * Patient-role users are simulated by creating CAREGIVER users and then
 * manually creating relationships (since relationship creation requires a valid
 * patient = user with PATIENT role — tested with proper error handling).
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
    sessionSecret: 'test-secret-for-caregivers-test',
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

// ── Helpers ──────────────────────────────────────────────────────────────────

let _n = 0;
const uniq = (p = 'cg') => `${p}${++_n}@test.com`;

async function registerAndLogin(roleHint = 'CAREGIVER') {
  const email = uniq(roleHint.toLowerCase());
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: `CG User ${_n}`, email, password: 'Password1!' });
  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'Password1!' });
  const h = loginRes.headers['set-cookie'];
  const arr = h ? (Array.isArray(h) ? h : [h]) : [];
  const c = arr.find((x) => x && x.startsWith('memora_session=')) ?? null;
  return { cookie: c, id: regRes.body.data?.user?.id, email };
}

/** Manually set a user's role to PATIENT via the model (for testing purposes) */
async function makePatient(userId) {
  const User = (await import('../users/user.model.js')).default;
  await User.findByIdAndUpdate(userId, { role: 'PATIENT' });
}

// ── Validation unit tests ────────────────────────────────────────────────────

describe('Caregiver relationship validation', () => {
  it('rejects missing patientId', async () => {
    const { validateRelationshipCreate } = await import('./caregivers.validation.js');
    expect(() => validateRelationshipCreate({ relationshipType: 'FAMILY' })).toThrow();
  });

  it('rejects invalid patientId', async () => {
    const { validateRelationshipCreate } = await import('./caregivers.validation.js');
    expect(() =>
      validateRelationshipCreate({ patientId: 'bad-id', relationshipType: 'FAMILY' })
    ).toThrow();
  });

  it('rejects invalid relationshipType', async () => {
    const { validateRelationshipCreate } = await import('./caregivers.validation.js');
    expect(() =>
      validateRelationshipCreate({
        patientId: '507f1f77bcf86cd799439011',
        relationshipType: 'INVALID',
      })
    ).toThrow();
  });

  it('accepts valid create input', async () => {
    const { validateRelationshipCreate } = await import('./caregivers.validation.js');
    const result = validateRelationshipCreate({
      patientId: '507f1f77bcf86cd799439011',
      relationshipType: 'FAMILY',
    });
    expect(result.relationshipType).toBe('FAMILY');
  });

  it('rejects invalid status on update', async () => {
    const { validateRelationshipUpdate } = await import('./caregivers.validation.js');
    expect(() => validateRelationshipUpdate({ status: 'BANNED' })).toThrow();
  });

  it('rejects unknown permission keys', async () => {
    const { validateRelationshipUpdate } = await import('./caregivers.validation.js');
    expect(() => validateRelationshipUpdate({ permissions: { hackPermission: true } })).toThrow();
  });

  it('accepts valid update', async () => {
    const { validateRelationshipUpdate } = await import('./caregivers.validation.js');
    const result = validateRelationshipUpdate({ status: 'ACTIVE' });
    expect(result.status).toBe('ACTIVE');
  });
});

// ── HTTP route tests ─────────────────────────────────────────────────────────

describe('GET /api/v1/caregivers/relationships', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app).get('/api/v1/caregivers/relationships');
    expect(res.status).toBe(401);
  });

  it('returns empty list for a new caregiver', async () => {
    const { cookie } = await registerAndLogin();
    const res = await request(app).get('/api/v1/caregivers/relationships').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.relationships).toEqual([]);
  });
});

describe('POST /api/v1/caregivers/relationships', () => {
  it('rejects unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/v1/caregivers/relationships')
      .send({ patientId: '507f1f77bcf86cd799439011', relationshipType: 'FAMILY' });
    expect(res.status).toBe(401);
  });

  it('rejects creating a relationship to a non-existent patient', async () => {
    const { cookie } = await registerAndLogin();
    const res = await request(app)
      .post('/api/v1/caregivers/relationships')
      .set('Cookie', cookie)
      .send({ patientId: '507f1f77bcf86cd799439011', relationshipType: 'FAMILY' });
    expect(res.status).toBe(404);
  });

  it('rejects creating a relationship to a CAREGIVER (not a PATIENT)', async () => {
    const caregiver = await registerAndLogin();
    const another = await registerAndLogin();
    // both have CAREGIVER role — try to link them
    const res = await request(app)
      .post('/api/v1/caregivers/relationships')
      .set('Cookie', caregiver.cookie)
      .send({ patientId: another.id, relationshipType: 'FAMILY' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_REQUEST');
  });

  it('creates a PENDING relationship to a valid patient', async () => {
    const caregiver = await registerAndLogin();
    const patientUser = await registerAndLogin('PATIENT');
    // Promote to PATIENT role
    await makePatient(patientUser.id);

    const res = await request(app)
      .post('/api/v1/caregivers/relationships')
      .set('Cookie', caregiver.cookie)
      .send({ patientId: patientUser.id, relationshipType: 'FAMILY' });
    expect(res.status).toBe(201);
    expect(res.body.data.relationship.status).toBe('PENDING');
    expect(res.body.data.relationship.relationshipType).toBe('FAMILY');
  });

  it('rejects a duplicate PENDING relationship', async () => {
    const caregiver = await registerAndLogin();
    const patientUser = await registerAndLogin('PATIENT');
    await makePatient(patientUser.id);

    await request(app)
      .post('/api/v1/caregivers/relationships')
      .set('Cookie', caregiver.cookie)
      .send({ patientId: patientUser.id, relationshipType: 'FAMILY' });

    // Second attempt — should be rejected
    const res = await request(app)
      .post('/api/v1/caregivers/relationships')
      .set('Cookie', caregiver.cookie)
      .send({ patientId: patientUser.id, relationshipType: 'PROFESSIONAL' });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_RELATIONSHIP');
  });

  it('rejects self-assignment', async () => {
    const caregiver = await registerAndLogin();
    const res = await request(app)
      .post('/api/v1/caregivers/relationships')
      .set('Cookie', caregiver.cookie)
      .send({ patientId: caregiver.id, relationshipType: 'FAMILY' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/v1/caregivers/relationships/:id', () => {
  it('can activate a PENDING relationship', async () => {
    const caregiver = await registerAndLogin();
    const patientUser = await registerAndLogin('PATIENT');
    await makePatient(patientUser.id);

    const createRes = await request(app)
      .post('/api/v1/caregivers/relationships')
      .set('Cookie', caregiver.cookie)
      .send({ patientId: patientUser.id, relationshipType: 'GUARDIAN' });
    const relId = createRes.body.data.relationship.id;

    const patchRes = await request(app)
      .patch(`/api/v1/caregivers/relationships/${relId}`)
      .set('Cookie', caregiver.cookie)
      .send({ status: 'ACTIVE' });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.relationship.status).toBe('ACTIVE');
  });

  it("cannot update another caregiver's relationship", async () => {
    const cg1 = await registerAndLogin();
    const cg2 = await registerAndLogin();
    const patientUser = await registerAndLogin('PATIENT');
    await makePatient(patientUser.id);

    const createRes = await request(app)
      .post('/api/v1/caregivers/relationships')
      .set('Cookie', cg1.cookie)
      .send({ patientId: patientUser.id, relationshipType: 'FAMILY' });
    const relId = createRes.body.data.relationship.id;

    // cg2 tries to update cg1's relationship
    const patchRes = await request(app)
      .patch(`/api/v1/caregivers/relationships/${relId}`)
      .set('Cookie', cg2.cookie)
      .send({ status: 'ACTIVE' });
    expect(patchRes.status).toBe(404); // Not found for this caregiver
  });

  it('rejects invalid relationshipId', async () => {
    const caregiver = await registerAndLogin();
    const res = await request(app)
      .patch('/api/v1/caregivers/relationships/not-an-id')
      .set('Cookie', caregiver.cookie)
      .send({ status: 'ACTIVE' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/v1/caregivers/relationships/:id (revoke)', () => {
  it('revokes a relationship', async () => {
    const caregiver = await registerAndLogin();
    const patientUser = await registerAndLogin('PATIENT');
    await makePatient(patientUser.id);

    const createRes = await request(app)
      .post('/api/v1/caregivers/relationships')
      .set('Cookie', caregiver.cookie)
      .send({ patientId: patientUser.id, relationshipType: 'PROFESSIONAL' });
    const relId = createRes.body.data.relationship.id;

    const delRes = await request(app)
      .delete(`/api/v1/caregivers/relationships/${relId}`)
      .set('Cookie', caregiver.cookie);
    expect(delRes.status).toBe(200);
  });

  it('revoked relationship cannot grant patient access', async () => {
    const caregiver = await registerAndLogin();
    const patientUser = await registerAndLogin('PATIENT');
    await makePatient(patientUser.id);

    // Create + activate + revoke
    const createRes = await request(app)
      .post('/api/v1/caregivers/relationships')
      .set('Cookie', caregiver.cookie)
      .send({ patientId: patientUser.id, relationshipType: 'FAMILY' });
    const relId = createRes.body.data.relationship.id;

    await request(app)
      .patch(`/api/v1/caregivers/relationships/${relId}`)
      .set('Cookie', caregiver.cookie)
      .send({ status: 'ACTIVE' });

    await request(app)
      .delete(`/api/v1/caregivers/relationships/${relId}`)
      .set('Cookie', caregiver.cookie);

    // Now try to access the patient — should be denied
    const accessRes = await request(app)
      .get(`/api/v1/patients/${patientUser.id}`)
      .set('Cookie', caregiver.cookie);
    expect(accessRes.status).toBe(403);
  });
});

// ── Full authorized caregiver flow ────────────────────────────────────────────

describe('Authorized caregiver access flow', () => {
  it('ACTIVE relationship + viewProfile → can access patient profile', async () => {
    const caregiver = await registerAndLogin();
    const patientUser = await registerAndLogin('PATIENT');
    await makePatient(patientUser.id);

    // Create relationship
    const createRes = await request(app)
      .post('/api/v1/caregivers/relationships')
      .set('Cookie', caregiver.cookie)
      .send({ patientId: patientUser.id, relationshipType: 'FAMILY' });
    const relId = createRes.body.data.relationship.id;

    // Activate it (viewProfile is true by default)
    await request(app)
      .patch(`/api/v1/caregivers/relationships/${relId}`)
      .set('Cookie', caregiver.cookie)
      .send({ status: 'ACTIVE' });

    // Access patient profile
    const accessRes = await request(app)
      .get(`/api/v1/patients/${patientUser.id}`)
      .set('Cookie', caregiver.cookie);
    expect(accessRes.status).toBe(200);
    expect(accessRes.body.data.patient.userId).toBe(patientUser.id);
  });

  it('ACTIVE relationship WITHOUT viewProfile → 403', async () => {
    const caregiver = await registerAndLogin();
    const patientUser = await registerAndLogin('PATIENT');
    await makePatient(patientUser.id);

    // Create relationship
    const createRes = await request(app)
      .post('/api/v1/caregivers/relationships')
      .set('Cookie', caregiver.cookie)
      .send({ patientId: patientUser.id, relationshipType: 'OTHER' });
    const relId = createRes.body.data.relationship.id;

    // Activate + revoke viewProfile
    await request(app)
      .patch(`/api/v1/caregivers/relationships/${relId}`)
      .set('Cookie', caregiver.cookie)
      .send({ status: 'ACTIVE', permissions: { viewProfile: false } });

    // Access patient profile — should be denied
    const accessRes = await request(app)
      .get(`/api/v1/patients/${patientUser.id}`)
      .set('Cookie', caregiver.cookie);
    expect(accessRes.status).toBe(403);
  });

  it('PENDING relationship → cannot access patient profile', async () => {
    const caregiver = await registerAndLogin();
    const patientUser = await registerAndLogin('PATIENT');
    await makePatient(patientUser.id);

    await request(app)
      .post('/api/v1/caregivers/relationships')
      .set('Cookie', caregiver.cookie)
      .send({ patientId: patientUser.id, relationshipType: 'FAMILY' });
    // Left as PENDING — no activation

    const accessRes = await request(app)
      .get(`/api/v1/patients/${patientUser.id}`)
      .set('Cookie', caregiver.cookie);
    expect(accessRes.status).toBe(403);
  });
});
