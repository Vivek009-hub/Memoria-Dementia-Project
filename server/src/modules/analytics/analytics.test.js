/**
 * analytics.test.js — Comprehensive test suite for B10 Analytics & Progress Tracking
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
    sessionSecret: 'test-secret-for-analytics-test',
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
function uniqueEmail(prefix = 'analytics') {
  return `${prefix}${++_counter}@analyticstest.com`;
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

describe('Analytics & Progress Tracking (B10)', () => {
  it('allows patients to view their own overview dashboard analytics', async () => {
    const patient = await registerAndLogin('patient1', 'PATIENT');

    // Create a game session for patient
    const Game = (await import('../games/game.model.js')).default;
    const GameSession = (await import('../games/gameSession.model.js')).default;
    const game = await Game.create({ title: 'Memory Match', category: 'MEMORY_MATCHING', difficulty: 'MEDIUM', createdBy: new mongoose.Types.ObjectId() });
    await GameSession.create({
      patientId: patient.id,
      gameId: game._id,
      difficulty: 'MEDIUM',
      score: 850,
      accuracy: 0.90,
      durationSeconds: 120,
      status: 'COMPLETED',
      completedAt: new Date(),
    });

    const res = await request(app)
      .get('/api/v1/analytics/me/overview')
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.games.played).toBe(1);
    expect(res.body.data.games.completed).toBe(1);
    expect(res.body.data.games.avgAccuracy).toBe(0.9);
  });

  it('allows patient to view game summary, history, and trend data', async () => {
    const patient = await registerAndLogin('patient2', 'PATIENT');

    const summaryRes = await request(app)
      .get('/api/v1/analytics/games/summary')
      .set('Cookie', patient.cookie);
    expect(summaryRes.status).toBe(200);

    const historyRes = await request(app)
      .get('/api/v1/analytics/games/history')
      .set('Cookie', patient.cookie);
    expect(historyRes.status).toBe(200);
    expect(Array.isArray(historyRes.body.data)).toBe(true);

    const trendRes = await request(app)
      .get('/api/v1/analytics/games/trends')
      .set('Cookie', patient.cookie);
    expect(trendRes.status).toBe(200);
  });

  it('allows patient to view reminder adherence analytics and trends', async () => {
    const patient = await registerAndLogin('patient3', 'PATIENT');

    const ReminderLog = (await import('../reminders/reminderLog.model.js')).default;
    await ReminderLog.create({
      reminderId: new mongoose.Types.ObjectId(),
      patientId: patient.id,
      scheduledAt: new Date(),
      status: 'COMPLETED',
    });

    const summaryRes = await request(app)
      .get('/api/v1/analytics/reminders/summary')
      .set('Cookie', patient.cookie);
    expect(summaryRes.status).toBe(200);
    expect(summaryRes.body.data.completed).toBe(1);

    const trendRes = await request(app)
      .get('/api/v1/analytics/reminders/trends')
      .set('Cookie', patient.cookie);
    expect(trendRes.status).toBe(200);
  });

  it('enforces caregiver authorization when accessing patient analytics', async () => {
    const patient = await registerAndLogin('patient4', 'PATIENT');
    const caregiverWithAccess = await registerAndLogin('caregiver4_1', 'CAREGIVER');
    const caregiverNoAccess = await registerAndLogin('caregiver4_2', 'CAREGIVER');

    const CaregiverRelationship = (await import('../caregivers/caregiverRelationship.model.js')).default;

    // Grant ACTIVE relationship + viewCognitiveActivity to caregiverWithAccess
    await CaregiverRelationship.create({
      caregiverId: caregiverWithAccess.id,
      patientId: patient.id,
      relationshipType: 'FAMILY',
      status: 'ACTIVE',
      permissions: { viewCognitiveActivity: true },
    });

    // Caregiver with access succeeds
    const accessRes = await request(app)
      .get(`/api/v1/analytics/patient/${patient.id}/overview`)
      .set('Cookie', caregiverWithAccess.cookie);
    expect(accessRes.status).toBe(200);
    expect(accessRes.body.data.patientId).toBe(patient.id);

    // Caregiver without relationship fails with 403
    const noAccessRes = await request(app)
      .get(`/api/v1/analytics/patient/${patient.id}/overview`)
      .set('Cookie', caregiverNoAccess.cookie);
    expect(noAccessRes.status).toBe(403);
  });

  it('allows admin to view aggregate platform analytics, but denies patients', async () => {
    const admin = await registerAndLogin('admin1', 'ADMIN');
    const patient = await registerAndLogin('patient5', 'PATIENT');

    // Patient receives 403
    const patientRes = await request(app)
      .get('/api/v1/admin/analytics/overview')
      .set('Cookie', patient.cookie);
    expect(patientRes.status).toBe(403);

    // Admin receives 200 with platform aggregate statistics
    const adminRes = await request(app)
      .get('/api/v1/admin/analytics/overview')
      .set('Cookie', admin.cookie);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);
    expect(adminRes.body.data.totalPatients).toBeDefined();
  });

  it('rejects unauthenticated requests to analytics endpoints', async () => {
    const res = await request(app).get('/api/v1/analytics/me/overview');
    expect(res.status).toBe(401);
  });
});
