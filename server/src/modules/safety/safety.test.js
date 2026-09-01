/**
 * safety.test.js — Comprehensive test suite for B12 Safety & Emergency Backend
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
    sessionSecret: 'test-secret-for-safety-test',
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
function uniqueEmail(prefix = 'safety') {
  return `${prefix}${++_counter}@safetytest.com`;
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

describe('Safety, Emergency & Location Backend (B12)', () => {
  it('allows patient to trigger SOS alert and deduplicates rapid triggers', async () => {
    const patient = await registerAndLogin('patient1', 'PATIENT');

    const sosRes1 = await request(app)
      .post('/api/v1/safety/sos')
      .set('Cookie', patient.cookie)
      .send({
        location: { latitude: 28.6139, longitude: 77.209, accuracy: 10 },
      });

    expect(sosRes1.status).toBe(201);
    expect(sosRes1.body.success).toBe(true);
    expect(sosRes1.body.data.type).toBe('SOS');
    expect(sosRes1.body.data.status).toBe('TRIGGERED');
    expect(sosRes1.body.data.severity).toBe('CRITICAL');

    const firstEventId = sosRes1.body.data._id;

    // Rapid second SOS trigger returns deduplicated event
    const sosRes2 = await request(app)
      .post('/api/v1/safety/sos')
      .set('Cookie', patient.cookie)
      .send({
        location: { latitude: 28.6139, longitude: 77.209, accuracy: 10 },
      });

    expect(sosRes2.status).toBe(201);
    expect(sosRes2.body.data._id).toBe(firstEventId);
  });

  it('allows patient to trigger SOS when location is unavailable (location: null)', async () => {
    const patient = await registerAndLogin('patient_nolocation', 'PATIENT');

    const sosRes = await request(app)
      .post('/api/v1/safety/sos')
      .set('Cookie', patient.cookie)
      .send({ location: null });

    expect(sosRes.status).toBe(201);
    expect(sosRes.body.success).toBe(true);
    expect(sosRes.body.data.type).toBe('SOS');
    expect(sosRes.body.data.location).toBeNull();
  });

  it('validates location coordinates during ingestion', async () => {
    const patient = await registerAndLogin('patient2', 'PATIENT');

    // Invalid latitude (> 90)
    const invalidLat = await request(app)
      .post('/api/v1/safety/location')
      .set('Cookie', patient.cookie)
      .send({ latitude: 120, longitude: 77.209 });
    expect(invalidLat.status).toBe(422);

    // Valid location
    const validLoc = await request(app)
      .post('/api/v1/safety/location')
      .set('Cookie', patient.cookie)
      .send({ latitude: 28.6139, longitude: 77.209, accuracy: 15 });
    expect(validLoc.status).toBe(200);
    expect(validLoc.body.success).toBe(true);
  });

  it('handles geofence creation and detects breach when patient moves outside boundary', async () => {
    const patient = await registerAndLogin('patient3', 'PATIENT');

    // Create a 100m geofence around (28.6139, 77.2090)
    const gfRes = await request(app)
      .post('/api/v1/safety/geofences')
      .set('Cookie', patient.cookie)
      .send({
        name: 'Home Safe Zone',
        centerLatitude: 28.6139,
        centerLongitude: 77.209,
        radiusMeters: 100,
      });

    expect(gfRes.status).toBe(201);
    const geofenceId = gfRes.body.data._id;

    // 1. Initial location inside safe zone -> state becomes INSIDE
    const locInside = await request(app)
      .post('/api/v1/safety/location')
      .set('Cookie', patient.cookie)
      .send({ latitude: 28.6139, longitude: 77.209, accuracy: 5 });
    expect(locInside.status).toBe(200);
    expect(locInside.body.data.breachesDetected).toBe(0);

    // 2. Location moves 2km away -> triggers GEOFENCE_EXIT breach event
    const locOutside = await request(app)
      .post('/api/v1/safety/location')
      .set('Cookie', patient.cookie)
      .send({ latitude: 28.63, longitude: 77.22, accuracy: 5 });
    expect(locOutside.status).toBe(200);
    expect(locOutside.body.data.breachesDetected).toBe(1);

    // Check patient safety events list contains GEOFENCE_EXIT
    const eventsRes = await request(app).get('/api/v1/safety/events').set('Cookie', patient.cookie);
    expect(eventsRes.status).toBe(200);
    const breachEvent = eventsRes.body.data.find((e) => e.type === 'GEOFENCE_EXIT');
    expect(breachEvent).toBeDefined();
    expect(breachEvent.metadata.geofenceId).toBe(geofenceId);

    // 3. Location moves back inside safe zone -> triggers GEOFENCE_REENTRY event
    const locReentry = await request(app)
      .post('/api/v1/safety/location')
      .set('Cookie', patient.cookie)
      .send({ latitude: 28.6139, longitude: 77.209, accuracy: 5 });
    expect(locReentry.status).toBe(200);
    expect(locReentry.body.data.breachesDetected).toBe(1);

    const reentryEventsRes = await request(app).get('/api/v1/safety/events').set('Cookie', patient.cookie);
    const reentryEvent = reentryEventsRes.body.data.find((e) => e.type === 'GEOFENCE_REENTRY');
    expect(reentryEvent).toBeDefined();

    // 4. Test deterministic safety status endpoint
    const statusRes = await request(app).get('/api/v1/safety/status').set('Cookie', patient.cookie);
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.status).toBe('SAFE');

    // 5. Test invalid geofence radius validation
    const invalidGfRes = await request(app)
      .post('/api/v1/safety/geofences')
      .set('Cookie', patient.cookie)
      .send({
        name: 'Invalid Radius Zone',
        centerLatitude: 28.6139,
        centerLongitude: 77.209,
        radiusMeters: 10, // < 50m
      });
    expect(invalidGfRes.status).toBe(422);
  });

  it('allows patient to ingest fall event and confirm safe to cancel it', async () => {
    const patient = await registerAndLogin('patient4', 'PATIENT');

    const fallRes = await request(app)
      .post('/api/v1/safety/fall-events')
      .set('Cookie', patient.cookie)
      .send({
        confidence: 0.95,
        location: { latitude: 28.6139, longitude: 77.209 },
      });

    expect(fallRes.status).toBe(201);
    const eventId = fallRes.body.data._id;
    expect(fallRes.body.data.type).toBe('POSSIBLE_FALL');

    // Confirm safe
    const confirmRes = await request(app)
      .post(`/api/v1/safety/fall-events/${eventId}/confirm-safe`)
      .set('Cookie', patient.cookie);

    expect(confirmRes.status).toBe(200);
    expect(confirmRes.body.data.status).toBe('CANCELLED');
  });

  it('supports full event lifecycle: TRIGGERED -> ACKNOWLEDGED -> RESOLVED', async () => {
    const patient = await registerAndLogin('patient5_P', 'PATIENT');
    const caregiver = await registerAndLogin('caregiver5_C', 'CAREGIVER');

    const CaregiverRelationship = (await import('../caregivers/caregiverRelationship.model.js'))
      .default;
    await CaregiverRelationship.create({
      caregiverId: caregiver.id,
      patientId: patient.id,
      relationshipType: 'FAMILY',
      status: 'ACTIVE',
      permissions: { receiveSafetyAlerts: true, viewLocation: true },
    });

    // Patient triggers SOS
    const sos = await request(app)
      .post('/api/v1/safety/sos')
      .set('Cookie', patient.cookie)
      .send({});
    const eventId = sos.body.data._id;

    // Caregiver acknowledges event
    const ackRes = await request(app)
      .post(`/api/v1/safety/events/${eventId}/acknowledge`)
      .set('Cookie', caregiver.cookie);
    expect(ackRes.status).toBe(200);
    expect(ackRes.body.data.status).toBe('ACKNOWLEDGED');

    // Caregiver resolves event
    const resolveRes = await request(app)
      .post(`/api/v1/safety/events/${eventId}/resolve`)
      .set('Cookie', caregiver.cookie)
      .send({ reason: 'Spoke to patient on phone, false alarm.' });
    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.data.status).toBe('RESOLVED');
    expect(resolveRes.body.data.resolutionReason).toBe('Spoke to patient on phone, false alarm.');
  });

  it('enforces caregiver safety authorization and blocks unauthorized access', async () => {
    const patient = await registerAndLogin('patient6', 'PATIENT');
    const caregiverWithAccess = await registerAndLogin('caregiver6_1', 'CAREGIVER');
    const caregiverNoAccess = await registerAndLogin('caregiver6_2', 'CAREGIVER');

    const CaregiverRelationship = (await import('../caregivers/caregiverRelationship.model.js'))
      .default;
    await CaregiverRelationship.create({
      caregiverId: caregiverWithAccess.id,
      patientId: patient.id,
      relationshipType: 'FAMILY',
      status: 'ACTIVE',
      permissions: { receiveSafetyAlerts: true, viewLocation: true },
    });

    // Ingest location for patient
    await request(app)
      .post('/api/v1/safety/location')
      .set('Cookie', patient.cookie)
      .send({ latitude: 28.6139, longitude: 77.209 });

    // Authorized caregiver gets current location
    const accessLoc = await request(app)
      .get(`/api/v1/safety/location/current?patientId=${patient.id}`)
      .set('Cookie', caregiverWithAccess.cookie);
    expect(accessLoc.status).toBe(200);

    // Unauthorized caregiver receives 403
    const noAccessLoc = await request(app)
      .get(`/api/v1/safety/location/current?patientId=${patient.id}`)
      .set('Cookie', caregiverNoAccess.cookie);
    expect(noAccessLoc.status).toBe(403);
  });

  it('rejects unauthenticated requests to safety endpoints', async () => {
    const res = await request(app).post('/api/v1/safety/sos');
    expect(res.status).toBe(401);
  });
});
