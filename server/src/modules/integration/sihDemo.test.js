/**
 * sihDemo.test.js — Test suite for SIH Demonstration & System Readiness Endpoint (Prompt 4)
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
    sessionSecret: 'test-secret-for-sih-demo-test',
    sessionTtlMs: 604800000,
    cookieName: 'memora_session',
    geminiApiKey: 'test-gemini-key',
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
function uniqueEmail(prefix = 'sihdemo') {
  return `${prefix}${++_counter}@sihdemotest.com`;
}

async function registerAndLogin(prefix = 'patient') {
  const email = uniqueEmail(prefix);
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: 'Rajesh Sharma', email, password: 'Password1!' });

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'Password1!' });

  const setCookie = loginRes.headers['set-cookie'];
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
  const cookie = arr.find((c) => c.startsWith('memora_session=')) ?? null;

  return {
    id: regRes.body.data.user.id,
    email,
    cookie,
  };
}

describe('SIH Demonstration & System Readiness Endpoint (Prompt 4)', () => {
  it('returns full SIH readiness payload for authenticated patient user', async () => {
    const patient = await registerAndLogin('patient_sih');

    const res = await request(app)
      .get('/api/v1/integration/sih-demo/status')
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.demoReady).toBe(true);
    expect(res.body.data.subsystems.aiCompanion.status).toBe('OPERATIONAL');
    expect(res.body.data.subsystems.voicePipeline.status).toBe('OPERATIONAL');
    expect(res.body.data.subsystems.geofenceSafety.deterministicEngine).toBe('HAVERSINE_GPS');
  });

  it('rejects unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/integration/sih-demo/status');
    expect(res.status).toBe(401);
  });
});
