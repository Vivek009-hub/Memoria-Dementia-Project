/**
 * game.test.js — B4 Cognitive Games Tests
 *
 * Covers:
 *   - Game model validation
 *   - GameSession model validation
 *   - Game catalog API (list, detail)
 *   - Session lifecycle (start, get, complete)
 *   - Game history (patient own, caregiver authorized/unauthorized)
 *   - Admin game management
 *   - Authorization matrix (patient, caregiver, admin, unauthenticated)
 *   - Validation rejections
 *   - Concurrency: duplicate completion
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';

vi.mock('../../config/env.js', () => ({
  env: {
    nodeEnv: 'test',
    port: 5000,
    mongoUri: 'mongodb://localhost/test',
    clientUrl: 'http://localhost:5173',
    logLevel: 'silent',
    sessionSecret: 'test-secret-for-games-test',
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

let _counter = 0;
function uniqueEmail(prefix = 'user') {
  return `${prefix}${++_counter}@test.com`;
}

/**
 * Register a user. Note: auth/register creates CAREGIVER role by default.
 */
async function registerUser(prefix = 'user') {
  const email = uniqueEmail(prefix);
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: `Test ${prefix}`, email, password: 'Password1!' });
  if (res.status !== 201) throw new Error(`Register failed: ${JSON.stringify(res.body)}`);
  return {
    id: res.body.data.user.id,
    email,
    password: 'Password1!',
    role: res.body.data.user.role,
  };
}

async function loginAs(email, password = 'Password1!') {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  const h = res.headers['set-cookie'];
  if (!h) return null;
  const arr = Array.isArray(h) ? h : [h];
  return arr.find((c) => c.startsWith('memora_session=')) ?? null;
}

/**
 * Create a user and return { user, cookie }.
 */
async function createAndLogin(prefix = 'user') {
  const user = await registerUser(prefix);
  const cookie = await loginAs(user.email, user.password);
  return { user, cookie };
}

/**
 * Set a user's role directly via Mongoose (since there is no admin endpoint).
 */
async function setUserRole(userId, role) {
  const User = (await import('../users/user.model.js')).default;
  await User.findByIdAndUpdate(userId, { role });
}

/**
 * Create a Game directly via Mongoose (admin endpoint also tested separately).
 */
async function createGame(overrides = {}) {
  const Game = (await import('./game.model.js')).default;
  const game = await Game.create({
    title: overrides.title ?? 'Memory Match Test',
    category: overrides.category ?? 'MEMORY_MATCHING',
    difficulty: overrides.difficulty ?? 'EASY',
    description: overrides.description ?? 'A test game',
    isActive: overrides.isActive ?? true,
    ...overrides,
  });
  return game;
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
      viewCognitiveActivity: permissions.viewCognitiveActivity ?? false,
      ...permissions,
    },
    createdBy: new mongoose.Types.ObjectId(caregiverId),
  });
}

// ── Model: Game ──────────────────────────────────────────────────────────────

describe('Game model', () => {
  it('creates a valid game', async () => {
    const game = await createGame();
    expect(game._id).toBeDefined();
    expect(game.isActive).toBe(true);
    expect(game.category).toBe('MEMORY_MATCHING');
    expect(game.difficulty).toBe('EASY');
  });

  it('rejects an invalid category', async () => {
    const Game = (await import('./game.model.js')).default;
    await expect(
      Game.create({ title: 'Bad', category: 'INVALID_CAT', difficulty: 'EASY' })
    ).rejects.toThrow();
  });

  it('rejects an invalid difficulty', async () => {
    const Game = (await import('./game.model.js')).default;
    await expect(
      Game.create({ title: 'Bad', category: 'MEMORY_MATCHING', difficulty: 'EXTREME' })
    ).rejects.toThrow();
  });

  it('requires title', async () => {
    const Game = (await import('./game.model.js')).default;
    await expect(
      Game.create({ category: 'MEMORY_MATCHING', difficulty: 'EASY' })
    ).rejects.toThrow();
  });

  it('defaults isActive to true', async () => {
    const Game = (await import('./game.model.js')).default;
    const game = await Game.create({
      title: 'Active Default',
      category: 'PATTERN',
      difficulty: 'MEDIUM',
    });
    expect(game.isActive).toBe(true);
  });

  it('can be set to isActive: false', async () => {
    const game = await createGame({ isActive: false });
    expect(game.isActive).toBe(false);
  });
});

// ── Model: GameSession ───────────────────────────────────────────────────────

describe('GameSession model', () => {
  it('creates a valid session', async () => {
    const GameSession = (await import('./gameSession.model.js')).default;
    const game = await createGame();
    const session = await GameSession.create({
      patientId: new mongoose.Types.ObjectId(),
      gameId: game._id,
      difficulty: 'EASY',
    });
    expect(session._id).toBeDefined();
    expect(session.status).toBe('STARTED');
    expect(session.hintsUsed).toBe(0);
    expect(session.mistakes).toBe(0);
  });

  it('rejects an invalid status', async () => {
    const GameSession = (await import('./gameSession.model.js')).default;
    const game = await createGame();
    await expect(
      GameSession.create({
        patientId: new mongoose.Types.ObjectId(),
        gameId: game._id,
        difficulty: 'EASY',
        status: 'INVALID',
      })
    ).rejects.toThrow();
  });

  it('requires patientId', async () => {
    const GameSession = (await import('./gameSession.model.js')).default;
    const game = await createGame();
    await expect(GameSession.create({ gameId: game._id, difficulty: 'EASY' })).rejects.toThrow();
  });

  it('requires gameId', async () => {
    const GameSession = (await import('./gameSession.model.js')).default;
    await expect(
      GameSession.create({ patientId: new mongoose.Types.ObjectId(), difficulty: 'EASY' })
    ).rejects.toThrow();
  });

  it('rejects negative score', async () => {
    const GameSession = (await import('./gameSession.model.js')).default;
    const game = await createGame();
    await expect(
      GameSession.create({
        patientId: new mongoose.Types.ObjectId(),
        gameId: game._id,
        difficulty: 'EASY',
        score: -1,
      })
    ).rejects.toThrow();
  });
});

// ── Validation: game.validation.js ───────────────────────────────────────────

describe('game validation functions', () => {
  it('validateSessionStart — rejects missing difficulty', async () => {
    const { validateSessionStart } = await import('./game.validation.js');
    expect(() => validateSessionStart({})).toThrow('difficulty');
  });

  it('validateSessionStart — rejects invalid difficulty', async () => {
    const { validateSessionStart } = await import('./game.validation.js');
    expect(() => validateSessionStart({ difficulty: 'EXTREME' })).toThrow();
  });

  it('validateSessionComplete — rejects negative score', async () => {
    const { validateSessionComplete } = await import('./game.validation.js');
    expect(() => validateSessionComplete({ score: -5 })).toThrow();
  });

  it('validateSessionComplete — rejects accuracy > 100', async () => {
    const { validateSessionComplete } = await import('./game.validation.js');
    expect(() => validateSessionComplete({ accuracy: 105 })).toThrow();
  });

  it('validateGameCreate — rejects invalid category', async () => {
    const { validateGameCreate } = await import('./game.validation.js');
    expect(() =>
      validateGameCreate({ title: 'Test', category: 'BAD', difficulty: 'EASY' })
    ).toThrow();
  });

  it('validateObjectId — rejects invalid id', async () => {
    const { validateObjectId } = await import('./game.validation.js');
    expect(() => validateObjectId('not-an-id', 'gameId')).toThrow();
  });
});

// ── API: Game Catalog ────────────────────────────────────────────────────────

describe('GET /api/v1/games', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/games');
    expect(res.status).toBe(401);
  });

  it('authenticated user can list active games', async () => {
    await createGame({ title: 'Active Game' });
    const { cookie } = await createAndLogin('catalog_user1');
    const res = await request(app).get('/api/v1/games').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('inactive games are hidden from non-admin users', async () => {
    await createGame({ title: 'Hidden Game', isActive: false });
    const { cookie } = await createAndLogin('catalog_user2');
    const res = await request(app).get('/api/v1/games').set('Cookie', cookie);
    expect(res.status).toBe(200);
    const titles = res.body.data.map((g) => g.title);
    expect(titles).not.toContain('Hidden Game');
  });

  it('admin can see inactive games with includeInactive=true', async () => {
    const { user } = await createAndLogin('admin_catalog');
    await setUserRole(user.id, 'ADMIN');
    const adminCookie = await loginAs(user.email);
    await createGame({ title: 'Inactive For Admin', isActive: false });
    const res = await request(app)
      .get('/api/v1/games?includeInactive=true')
      .set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    const titles = res.body.data.map((g) => g.title);
    expect(titles).toContain('Inactive For Admin');
  });

  it('filters by category', async () => {
    await createGame({ title: 'Pattern Game', category: 'PATTERN' });
    const { cookie } = await createAndLogin('catalog_user3');
    const res = await request(app).get('/api/v1/games?category=PATTERN').set('Cookie', cookie);
    expect(res.status).toBe(200);
    res.body.data.forEach((g) => {
      expect(g.category).toBe('PATTERN');
    });
  });

  it('rejects invalid category filter with 422', async () => {
    const { cookie } = await createAndLogin('catalog_user4');
    const res = await request(app).get('/api/v1/games?category=INVALID').set('Cookie', cookie);
    expect(res.status).toBe(422);
  });
});

// ── API: Game Detail ─────────────────────────────────────────────────────────

describe('GET /api/v1/games/:gameId', () => {
  it('authenticated user can get an active game', async () => {
    const game = await createGame({ title: 'Detail Game' });
    const { cookie } = await createAndLogin('detail_user1');
    const res = await request(app).get(`/api/v1/games/${game._id}`).set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(game._id.toString());
    expect(res.body.data.title).toBe('Detail Game');
  });

  it('returns 404 for inactive game (non-admin)', async () => {
    const game = await createGame({ title: 'Inactive Detail', isActive: false });
    const { cookie } = await createAndLogin('detail_user2');
    const res = await request(app).get(`/api/v1/games/${game._id}`).set('Cookie', cookie);
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid gameId format', async () => {
    const { cookie } = await createAndLogin('detail_user3');
    const res = await request(app).get('/api/v1/games/not-a-valid-id').set('Cookie', cookie);
    expect(res.status).toBe(400);
  });

  it('rejects unauthenticated requests with 401', async () => {
    const game = await createGame();
    const res = await request(app).get(`/api/v1/games/${game._id}`);
    expect(res.status).toBe(401);
  });
});

// ── API: Start Session ───────────────────────────────────────────────────────

describe('POST /api/v1/games/:gameId/sessions', () => {
  it('unauthenticated → 401', async () => {
    const game = await createGame();
    const res = await request(app)
      .post(`/api/v1/games/${game._id}/sessions`)
      .send({ difficulty: 'EASY' });
    expect(res.status).toBe(401);
  });

  it('CAREGIVER cannot start a session → 403', async () => {
    const game = await createGame();
    const { cookie } = await createAndLogin('cg_start');
    // default role is CAREGIVER
    const res = await request(app)
      .post(`/api/v1/games/${game._id}/sessions`)
      .set('Cookie', cookie)
      .send({ difficulty: 'EASY' });
    expect(res.status).toBe(403);
  });

  it('PATIENT can start a session → 201', async () => {
    const game = await createGame();
    const { user } = await createAndLogin('patient_start');
    await setUserRole(user.id, 'PATIENT');
    const patientCookie = await loginAs(user.email);
    const res = await request(app)
      .post(`/api/v1/games/${game._id}/sessions`)
      .set('Cookie', patientCookie)
      .send({ difficulty: 'EASY' });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('STARTED');
    expect(res.body.data.difficulty).toBe('EASY');
  });

  it('inactive game → 404', async () => {
    const game = await createGame({ isActive: false });
    const { user } = await createAndLogin('patient_inactive');
    await setUserRole(user.id, 'PATIENT');
    const patientCookie = await loginAs(user.email);
    const res = await request(app)
      .post(`/api/v1/games/${game._id}/sessions`)
      .set('Cookie', patientCookie)
      .send({ difficulty: 'EASY' });
    expect(res.status).toBe(404);
  });

  it('missing difficulty → 422', async () => {
    const game = await createGame();
    const { user } = await createAndLogin('patient_nodiff');
    await setUserRole(user.id, 'PATIENT');
    const patientCookie = await loginAs(user.email);
    const res = await request(app)
      .post(`/api/v1/games/${game._id}/sessions`)
      .set('Cookie', patientCookie)
      .send({});
    expect(res.status).toBe(422);
  });

  it('invalid gameId → 400', async () => {
    const { user } = await createAndLogin('patient_badid');
    await setUserRole(user.id, 'PATIENT');
    const patientCookie = await loginAs(user.email);
    const res = await request(app)
      .post('/api/v1/games/not-an-id/sessions')
      .set('Cookie', patientCookie)
      .send({ difficulty: 'EASY' });
    expect(res.status).toBe(400);
  });
});

// ── API: Complete Session ────────────────────────────────────────────────────

describe('POST /api/v1/games/sessions/:sessionId/complete', () => {
  async function setupPatientAndSession() {
    const { user } = await createAndLogin('patient_complete');
    await setUserRole(user.id, 'PATIENT');
    const cookie = await loginAs(user.email);
    const game = await createGame();
    const startRes = await request(app)
      .post(`/api/v1/games/${game._id}/sessions`)
      .set('Cookie', cookie)
      .send({ difficulty: 'MEDIUM' });
    expect(startRes.status).toBe(201);
    return { user, cookie, sessionId: startRes.body.data.id };
  }

  it('patient can complete their session → 200', async () => {
    const { cookie, sessionId } = await setupPatientAndSession();
    const res = await request(app)
      .post(`/api/v1/games/sessions/${sessionId}/complete`)
      .set('Cookie', cookie)
      .send({ score: 80, accuracy: 80 });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.score).toBe(80);
    expect(res.body.data.accuracy).toBe(80);
    expect(res.body.data.completedAt).not.toBeNull();
  });

  it('completing same session twice → 409', async () => {
    const { cookie, sessionId } = await setupPatientAndSession();
    const first = await request(app)
      .post(`/api/v1/games/sessions/${sessionId}/complete`)
      .set('Cookie', cookie)
      .send({ score: 50 });
    expect(first.status).toBe(200);

    const second = await request(app)
      .post(`/api/v1/games/sessions/${sessionId}/complete`)
      .set('Cookie', cookie)
      .send({ score: 60 });
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('INVALID_STATE');
  });

  it('different patient cannot complete the session → 403', async () => {
    const { sessionId } = await setupPatientAndSession();
    // Another patient tries to complete it
    const { user: other } = await createAndLogin('patient_other');
    await setUserRole(other.id, 'PATIENT');
    const otherCookie = await loginAs(other.email);
    const res = await request(app)
      .post(`/api/v1/games/sessions/${sessionId}/complete`)
      .set('Cookie', otherCookie)
      .send({ score: 50 });
    expect(res.status).toBe(403);
  });

  it('unauthenticated → 401', async () => {
    const res = await request(app)
      .post('/api/v1/games/sessions/507f1f77bcf86cd799439011/complete')
      .send({ score: 50 });
    expect(res.status).toBe(401);
  });

  it('CAREGIVER cannot complete session → 403', async () => {
    const { cookie: cgCookie } = await createAndLogin('cg_complete');
    const res = await request(app)
      .post('/api/v1/games/sessions/507f1f77bcf86cd799439011/complete')
      .set('Cookie', cgCookie)
      .send({ score: 50 });
    expect(res.status).toBe(403);
  });

  it('negative score → 422', async () => {
    const { cookie, sessionId } = await setupPatientAndSession();
    const res = await request(app)
      .post(`/api/v1/games/sessions/${sessionId}/complete`)
      .set('Cookie', cookie)
      .send({ score: -10 });
    expect(res.status).toBe(422);
  });

  it('invalid sessionId → 400', async () => {
    const { user } = await createAndLogin('patient_badsession');
    await setUserRole(user.id, 'PATIENT');
    const cookie = await loginAs(user.email);
    const res = await request(app)
      .post('/api/v1/games/sessions/not-an-id/complete')
      .set('Cookie', cookie)
      .send({ score: 50 });
    expect(res.status).toBe(400);
  });
});

// ── API: Patient Game History ────────────────────────────────────────────────

describe('GET /api/v1/games/history', () => {
  it('unauthenticated → 401', async () => {
    const res = await request(app).get('/api/v1/games/history');
    expect(res.status).toBe(401);
  });

  it('CAREGIVER cannot access /history → 403', async () => {
    const { cookie } = await createAndLogin('cg_history');
    const res = await request(app).get('/api/v1/games/history').set('Cookie', cookie);
    expect(res.status).toBe(403);
  });

  it('PATIENT can view their own history', async () => {
    const { user } = await createAndLogin('patient_history');
    await setUserRole(user.id, 'PATIENT');
    const cookie = await loginAs(user.email);
    // Create + complete a session
    const game = await createGame();
    const startRes = await request(app)
      .post(`/api/v1/games/${game._id}/sessions`)
      .set('Cookie', cookie)
      .send({ difficulty: 'EASY' });
    const sessionId = startRes.body.data.id;
    await request(app)
      .post(`/api/v1/games/sessions/${sessionId}/complete`)
      .set('Cookie', cookie)
      .send({ score: 75 });

    const historyRes = await request(app).get('/api/v1/games/history').set('Cookie', cookie);
    expect(historyRes.status).toBe(200);
    expect(Array.isArray(historyRes.body.data)).toBe(true);
    const found = historyRes.body.data.find((s) => s.id === sessionId);
    expect(found).toBeDefined();
    expect(found.status).toBe('COMPLETED');
  });

  it('orders history with newest completed session first', async () => {
    const { user } = await createAndLogin('patient_order');
    await setUserRole(user.id, 'PATIENT');
    const cookie = await loginAs(user.email);
    const game = await createGame();

    // Session 1
    const s1 = await request(app)
      .post(`/api/v1/games/${game._id}/sessions`)
      .set('Cookie', cookie)
      .send({ difficulty: 'EASY' });
    await request(app)
      .post(`/api/v1/games/sessions/${s1.body.data.id}/complete`)
      .set('Cookie', cookie)
      .send({ score: 50 });

    // Session 2
    const s2 = await request(app)
      .post(`/api/v1/games/${game._id}/sessions`)
      .set('Cookie', cookie)
      .send({ difficulty: 'MEDIUM' });
    await request(app)
      .post(`/api/v1/games/sessions/${s2.body.data.id}/complete`)
      .set('Cookie', cookie)
      .send({ score: 90 });

    const historyRes = await request(app).get('/api/v1/games/history').set('Cookie', cookie);
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.data.length).toBeGreaterThanOrEqual(2);
    expect(historyRes.body.data[0].id).toBe(s2.body.data.id);
  });

  it('enforces patient isolation for /history (Patient B cannot see Patient A records)', async () => {
    const { user: pA } = await createAndLogin('patient_iso_A');
    await setUserRole(pA.id, 'PATIENT');
    const cookieA = await loginAs(pA.email);

    const { user: pB } = await createAndLogin('patient_iso_B');
    await setUserRole(pB.id, 'PATIENT');
    const cookieB = await loginAs(pB.email);

    const game = await createGame();
    const sA = await request(app)
      .post(`/api/v1/games/${game._id}/sessions`)
      .set('Cookie', cookieA)
      .send({ difficulty: 'HARD' });
    await request(app)
      .post(`/api/v1/games/sessions/${sA.body.data.id}/complete`)
      .set('Cookie', cookieA)
      .send({ score: 100 });

    const resB = await request(app).get('/api/v1/games/history').set('Cookie', cookieB);
    expect(resB.status).toBe(200);
    const foundAInB = resB.body.data.find((s) => s.id === sA.body.data.id);
    expect(foundAInB).toBeUndefined();
  });
});

// ── API: Caregiver Access to Patient History ─────────────────────────────────

describe('GET /api/v1/games/patients/:patientId/history', () => {
  it('unauthenticated → 401', async () => {
    const res = await request(app).get('/api/v1/games/patients/507f1f77bcf86cd799439011/history');
    expect(res.status).toBe(401);
  });

  it('caregiver without relationship → 403', async () => {
    const { user: patient } = await createAndLogin('hpatient_no_rel');
    await setUserRole(patient.id, 'PATIENT');

    const { cookie: cgCookie } = await createAndLogin('hcg_no_rel');
    const res = await request(app)
      .get(`/api/v1/games/patients/${patient.id}/history`)
      .set('Cookie', cgCookie);
    expect(res.status).toBe(403);
  });

  it('caregiver with ACTIVE relationship but no viewCognitiveActivity → 403', async () => {
    const { user: patient } = await createAndLogin('hpatient_no_perm');
    await setUserRole(patient.id, 'PATIENT');
    const { user: caregiver, cookie: cgCookie } = await createAndLogin('hcg_no_perm');
    // ACTIVE relationship, viewCognitiveActivity: false (default)
    await createActiveRelationship(caregiver.id, patient.id, { viewCognitiveActivity: false });

    const res = await request(app)
      .get(`/api/v1/games/patients/${patient.id}/history`)
      .set('Cookie', cgCookie);
    expect(res.status).toBe(403);
  });

  it('caregiver with viewCognitiveActivity → 200', async () => {
    const { user: patient } = await createAndLogin('hpatient_with_perm');
    await setUserRole(patient.id, 'PATIENT');
    const { user: caregiver, cookie: cgCookie } = await createAndLogin('hcg_with_perm');
    await createActiveRelationship(caregiver.id, patient.id, { viewCognitiveActivity: true });

    const res = await request(app)
      .get(`/api/v1/games/patients/${patient.id}/history`)
      .set('Cookie', cgCookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('patient cannot view another patient history via caregiver route → 403', async () => {
    const { user: patient1 } = await createAndLogin('hpatient_p1');
    await setUserRole(patient1.id, 'PATIENT');
    const { user: patient2 } = await createAndLogin('hpatient_p2');
    await setUserRole(patient2.id, 'PATIENT');
    const p2Cookie = await loginAs(patient2.email);

    // PATIENT role: requirePatientAccess will allow own patientId only
    // but patient2 is not patient1
    const res = await request(app)
      .get(`/api/v1/games/patients/${patient1.id}/history`)
      .set('Cookie', p2Cookie);
    expect(res.status).toBe(403);
  });
});

// ── API: Admin Game Management ───────────────────────────────────────────────

describe('POST /api/v1/games (admin create)', () => {
  it('PATIENT cannot create game → 403', async () => {
    const { user } = await createAndLogin('patient_create');
    await setUserRole(user.id, 'PATIENT');
    const patientCookie = await loginAs(user.email);
    const res = await request(app)
      .post('/api/v1/games')
      .set('Cookie', patientCookie)
      .send({ title: 'Hack', category: 'PATTERN', difficulty: 'EASY' });
    expect(res.status).toBe(403);
  });

  it('CAREGIVER cannot create game → 403', async () => {
    const { cookie } = await createAndLogin('cg_create');
    const res = await request(app)
      .post('/api/v1/games')
      .set('Cookie', cookie)
      .send({ title: 'Hack', category: 'PATTERN', difficulty: 'EASY' });
    expect(res.status).toBe(403);
  });

  it('ADMIN can create a game → 201', async () => {
    const { user } = await createAndLogin('admin_create');
    await setUserRole(user.id, 'ADMIN');
    const adminCookie = await loginAs(user.email);
    const res = await request(app).post('/api/v1/games').set('Cookie', adminCookie).send({
      title: 'Admin Created Game',
      category: 'PUZZLE',
      difficulty: 'HARD',
      description: 'Test admin create',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Admin Created Game');
    expect(res.body.data.isActive).toBe(true);
  });

  it('ADMIN: invalid category → 422', async () => {
    const { user } = await createAndLogin('admin_bad_cat');
    await setUserRole(user.id, 'ADMIN');
    const adminCookie = await loginAs(user.email);
    const res = await request(app)
      .post('/api/v1/games')
      .set('Cookie', adminCookie)
      .send({ title: 'Bad', category: 'WRONG', difficulty: 'EASY' });
    expect(res.status).toBe(422);
  });

  it('unauthenticated → 401', async () => {
    const res = await request(app)
      .post('/api/v1/games')
      .send({ title: 'Bad', category: 'PATTERN', difficulty: 'EASY' });
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/v1/games/:gameId (admin update)', () => {
  it('ADMIN can update a game → 200', async () => {
    const { user } = await createAndLogin('admin_upd');
    await setUserRole(user.id, 'ADMIN');
    const adminCookie = await loginAs(user.email);
    const game = await createGame({ title: 'Before Update' });

    const res = await request(app)
      .patch(`/api/v1/games/${game._id}`)
      .set('Cookie', adminCookie)
      .send({ title: 'After Update' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('After Update');
  });

  it('ADMIN can deactivate game (isActive: false) → 200', async () => {
    const { user } = await createAndLogin('admin_deactivate');
    await setUserRole(user.id, 'ADMIN');
    const adminCookie = await loginAs(user.email);
    const game = await createGame();

    const res = await request(app)
      .patch(`/api/v1/games/${game._id}`)
      .set('Cookie', adminCookie)
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(false);
  });

  it('PATIENT cannot update game → 403', async () => {
    const { user } = await createAndLogin('patient_upd');
    await setUserRole(user.id, 'PATIENT');
    const patientCookie = await loginAs(user.email);
    const game = await createGame();
    const res = await request(app)
      .patch(`/api/v1/games/${game._id}`)
      .set('Cookie', patientCookie)
      .send({ title: 'Hack' });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/v1/games/:gameId (admin soft-delete)', () => {
  it('ADMIN can soft-delete game → 200', async () => {
    const { user } = await createAndLogin('admin_del');
    await setUserRole(user.id, 'ADMIN');
    const adminCookie = await loginAs(user.email);
    const game = await createGame();

    const res = await request(app).delete(`/api/v1/games/${game._id}`).set('Cookie', adminCookie);
    expect(res.status).toBe(200);

    // Verify game is now inactive
    const detailRes = await request(app)
      .get(`/api/v1/games/${game._id}`)
      .set('Cookie', adminCookie);
    // Admin sees inactive games
    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data.isActive).toBe(false);
  });

  it('CAREGIVER cannot delete game → 403', async () => {
    const { cookie } = await createAndLogin('cg_del');
    const game = await createGame();
    const res = await request(app).delete(`/api/v1/games/${game._id}`).set('Cookie', cookie);
    expect(res.status).toBe(403);
  });
});

// ── End-to-End Game Flow ─────────────────────────────────────────────────────

describe('E2E: full game lifecycle', () => {
  it('patient browses → starts → completes → history reflects result', async () => {
    // 1. Set up patient
    const { user } = await createAndLogin('e2e_patient');
    await setUserRole(user.id, 'PATIENT');
    const cookie = await loginAs(user.email);

    // 2. Create an active game
    const game = await createGame({
      title: 'E2E Game',
      category: 'SEQUENCE',
      difficulty: 'MEDIUM',
    });

    // 3. Browse games
    const browseRes = await request(app).get('/api/v1/games').set('Cookie', cookie);
    expect(browseRes.status).toBe(200);
    const found = browseRes.body.data.find((g) => g.id === game._id.toString());
    expect(found).toBeDefined();

    // 4. Start session
    const startRes = await request(app)
      .post(`/api/v1/games/${game._id}/sessions`)
      .set('Cookie', cookie)
      .send({ difficulty: 'MEDIUM' });
    expect(startRes.status).toBe(201);
    const sessionId = startRes.body.data.id;
    expect(startRes.body.data.status).toBe('STARTED');

    // 5. Complete session
    const completeRes = await request(app)
      .post(`/api/v1/games/sessions/${sessionId}/complete`)
      .set('Cookie', cookie)
      .send({ score: 90, accuracy: 90, hintsUsed: 1, mistakes: 2 });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.status).toBe('COMPLETED');
    expect(completeRes.body.data.score).toBe(90);

    // 6. Attempt to complete again → must fail
    const dupRes = await request(app)
      .post(`/api/v1/games/sessions/${sessionId}/complete`)
      .set('Cookie', cookie)
      .send({ score: 100 });
    expect(dupRes.status).toBe(409);

    // 7. Check history
    const historyRes = await request(app).get('/api/v1/games/history').set('Cookie', cookie);
    expect(historyRes.status).toBe(200);
    const histItem = historyRes.body.data.find((s) => s.id === sessionId);
    expect(histItem).toBeDefined();
    expect(histItem.status).toBe('COMPLETED');
    expect(histItem.score).toBe(90);
  });
});
