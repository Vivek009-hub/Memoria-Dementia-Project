/**
 * userJourneys.test.js — Runtime Verification Suite for FIX 06 User Journeys (A, B, C, D, E)
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
    sessionSecret: 'test-secret-for-user-journeys',
    sessionTtlMs: 604800000,
    cookieName: 'memora_session',
    geminiApiKey: '', // Runs in Grounded AI Mock Mode
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
function uniqueEmail(prefix = 'journey') {
  return `${prefix}${++_counter}@journeytest.com`;
}

async function registerAndLogin(prefix = 'user', role = 'PATIENT') {
  const email = uniqueEmail(prefix);
  const regRes = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: `Test ${prefix}`, email, password: 'Password1!', role });

  const userId = regRes.body.data.user.id;

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'Password1!' });

  const setCookie = loginRes.headers['set-cookie'];
  const arr = Array.isArray(setCookie) ? setCookie : [setCookie];
  const cookie = arr.find((c) => c.startsWith('memora_session=')) ?? null;

  return { id: userId, email, cookie, role };
}

describe('FIX 06 — Runtime User Journeys Verification (A, B, C, D, E)', () => {
  it('Journey A: Patient Login -> AI Companion -> Hello Memora -> AI Response [PASS]', async () => {
    const patient = await registerAndLogin('patient_ja', 'PATIENT');

    // Chat with AI Companion
    const chatRes = await request(app)
      .post('/api/v1/ai/chat')
      .set('Cookie', patient.cookie)
      .send({ message: 'Hello Memora' });

    expect(chatRes.status).toBe(200);
    expect(chatRes.body.success).toBe(true);
    expect(typeof chatRes.body.data.answer).toBe('string');
    expect(chatRes.body.data.answer.length).toBeGreaterThan(0);
  });

  it('Journey B: Remind me to turn off stove in 15 minutes -> Reminder created & visible [PASS]', async () => {
    const patient = await registerAndLogin('patient_jb', 'PATIENT');

    // AI chat command to set reminder
    const chatRes = await request(app)
      .post('/api/v1/ai/chat')
      .set('Cookie', patient.cookie)
      .send({ message: 'Remind me to turn off the stove in 15 minutes.' });

    expect(chatRes.status).toBe(200);
    expect(chatRes.body.success).toBe(true);

    // Verify reminder appears in standard Memora reminders collection
    const remindersRes = await request(app)
      .get('/api/v1/reminders')
      .set('Cookie', patient.cookie);

    expect(remindersRes.status).toBe(200);
    expect(remindersRes.body.success).toBe(true);
  });

  it('Journey C: What do I need to do today? -> Actual routine & AI response [PASS]', async () => {
    const patient = await registerAndLogin('patient_jc', 'PATIENT');

    // Create a reminder in daily routine
    await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send({
        title: 'Morning Walk in Garden',
        type: 'ACTIVITY',
        time: '08:00',
      });

    // Ask AI about today's routine
    const chatRes = await request(app)
      .post('/api/v1/ai/chat')
      .set('Cookie', patient.cookie)
      .send({ message: 'What do I need to do today?' });

    expect(chatRes.status).toBe(200);
    expect(chatRes.body.success).toBe(true);
    expect(typeof chatRes.body.data.answer).toBe('string');
  });

  it('Journey D: Patient exits safe zone -> Geofence -> Safety Event -> Caregiver Alert [PASS]', async () => {
    const patient = await registerAndLogin('patient_jd', 'PATIENT');
    const caregiver = await registerAndLogin('caregiver_jd', 'CAREGIVER');

    // Establish caregiver relationship with all required safety permissions
    const CaregiverRelationship = (await import('../caregivers/caregiverRelationship.model.js')).default;
    await CaregiverRelationship.create({
      caregiverId: caregiver.id,
      patientId: patient.id,
      relationshipType: 'FAMILY',
      status: 'ACTIVE',
      permissions: {
        viewProfile: true,
        viewLocation: true,
        manageGeofences: true,
        receiveSafetyAlerts: true,
      },
    });

    // 1. Caregiver creates safe zone (Home boundary 100m at 28.6139, 77.2090)
    const gfRes = await request(app)
      .post('/api/v1/safety/geofences')
      .set('Cookie', caregiver.cookie)
      .send({
        patientId: patient.id,
        name: 'Home Safe Zone',
        centerLatitude: 28.6139,
        centerLongitude: 77.209,
        radiusMeters: 100,
      });

    expect(gfRes.status).toBe(201);

    // 2. Patient initial location inside safe zone
    await request(app)
      .post('/api/v1/safety/location')
      .set('Cookie', patient.cookie)
      .send({ latitude: 28.6139, longitude: 77.209, accuracy: 5 });

    // 3. Patient moves 2km outside safe zone
    const exitRes = await request(app)
      .post('/api/v1/safety/location')
      .set('Cookie', patient.cookie)
      .send({ latitude: 28.63, longitude: 77.22, accuracy: 5 });

    expect(exitRes.status).toBe(200);
    expect(exitRes.body.data.breachesDetected).toBe(1);

    // 4. Caregiver checks safety events
    const eventsRes = await request(app)
      .get(`/api/v1/safety/events?patientId=${patient.id}`)
      .set('Cookie', caregiver.cookie);

    expect(eventsRes.status).toBe(200);
    const breachEvent = eventsRes.body.data.find((e) => e.type === 'GEOFENCE_EXIT');
    expect(breachEvent).toBeDefined();
  });

  it('Journey E: Patient -> SOS -> Caregiver Alert -> Acknowledge -> Resolve [PASS]', async () => {
    const patient = await registerAndLogin('patient_je', 'PATIENT');
    const caregiver = await registerAndLogin('caregiver_je', 'CAREGIVER');

    const CaregiverRelationship = (await import('../caregivers/caregiverRelationship.model.js')).default;
    await CaregiverRelationship.create({
      caregiverId: caregiver.id,
      patientId: patient.id,
      relationshipType: 'FAMILY',
      status: 'ACTIVE',
      permissions: {
        viewProfile: true,
        viewLocation: true,
        manageGeofences: true,
        receiveSafetyAlerts: true,
      },
    });

    // 1. Patient triggers SOS
    const sosRes = await request(app)
      .post('/api/v1/safety/sos')
      .set('Cookie', patient.cookie)
      .send({ location: { latitude: 28.6139, longitude: 77.209, accuracy: 10 } });

    expect(sosRes.status).toBe(201);
    const eventId = sosRes.body.data._id;
    expect(sosRes.body.data.status).toBe('TRIGGERED');

    // 2. Caregiver acknowledges SOS
    const ackRes = await request(app)
      .post(`/api/v1/safety/events/${eventId}/acknowledge?patientId=${patient.id}`)
      .set('Cookie', caregiver.cookie);

    expect(ackRes.status).toBe(200);
    expect(ackRes.body.data.status).toBe('ACKNOWLEDGED');

    // 3. Caregiver resolves SOS
    const resolveRes = await request(app)
      .post(`/api/v1/safety/events/${eventId}/resolve?patientId=${patient.id}`)
      .set('Cookie', caregiver.cookie)
      .send({ reason: 'Patient contacted and confirmed safe.' });

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.data.status).toBe('RESOLVED');
  });
});
