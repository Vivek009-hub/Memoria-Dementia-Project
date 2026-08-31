/**
 * patientCaregiverSync.test.js — End-to-End Integration Tests for Patient Profile, Safety & Caregiver Sync
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import User from '../src/modules/users/user.model.js';
import CaregiverRelationship from '../src/modules/caregivers/caregiverRelationship.model.js';
import PatientProfile from '../src/modules/patients/patientProfile.model.js';

vi.mock('../src/config/env.js', () => ({
  env: {
    nodeEnv: 'test',
    port: 5000,
    mongoUri: 'mongodb://localhost/test',
    clientUrl: 'http://localhost:5173',
    logLevel: 'silent',
    sessionSecret: 'test-secret-for-patient-sync-test',
    sessionTtlMs: 604800000,
    cookieName: 'memora_session',
  },
}));

import './setup.js';

let app;
beforeEach(async () => {
  if (!app) {
    const m = await import('../src/app.js');
    app = m.default;
  }
});

let counter = 0;
function uniqueEmail(prefix = 'user') {
  return `${prefix}_${++counter}_${Date.now()}@test.com`;
}

async function createTestUser(role = 'PATIENT') {
  const email = uniqueEmail(role.toLowerCase());
  const res = await request(app)
    .post('/api/v1/auth/register')
    .send({ name: `Test ${role}`, email, password: 'Password1!' });

  if (res.status !== 201) {
    throw new Error(`Register failed: ${JSON.stringify(res.body)}`);
  }

  const userId = res.body.data.user.id;
  // Update role directly in DB if role !== 'CAREGIVER' (auth register defaults to CAREGIVER)
  if (role !== 'CAREGIVER') {
    await User.findByIdAndUpdate(userId, { role });
  }

  // Fetch cookie
  const loginRes = await request(app).post('/api/v1/auth/login').send({ email, password: 'Password1!' });
  const setCookie = loginRes.headers['set-cookie'];
  const cookieArr = Array.isArray(setCookie) ? setCookie : [setCookie];
  const cookie = cookieArr.find((c) => c.startsWith('memora_session=')) ?? null;

  return { id: userId, email, password: 'Password1!', role, cookie };
}

describe('Patient Profile & Caregiver Sync End-to-End Workflow', () => {
  it('allows Patient to view & update own profile and safety settings', async () => {
    const patient = await createTestUser('PATIENT');

    // 1. GET /patients/me
    const getRes = await request(app).get('/api/v1/patients/me').set('Cookie', patient.cookie);
    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data.patient.userId).toBe(patient.id);

    // 2. PATCH /patients/me (update profile & enable location sharing)
    const patchRes = await request(app)
      .patch('/api/v1/patients/me')
      .set('Cookie', patient.cookie)
      .send({
        name: 'Jane Patient Updated',
        phone: '+15551234567',
        preferredLanguage: 'es',
        safetySettings: {
          locationSharingEnabled: true,
        },
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.patient.name).toBe('Jane Patient Updated');
    expect(patchRes.body.data.patient.phone).toBe('+15551234567');
    expect(patchRes.body.data.patient.preferredLanguage).toBe('es');
    expect(patchRes.body.data.patient.safetySettings.locationSharingEnabled).toBe(true);
  });

  it('allows Emergency Contacts CRUD with strict ownership enforcement', async () => {
    const patient = await createTestUser('PATIENT');

    // Add Emergency Contact
    const addRes = await request(app)
      .post('/api/v1/patients/me/emergency-contacts')
      .set('Cookie', patient.cookie)
      .send({
        name: 'Doctor Smith',
        relationship: 'Primary Physician',
        phoneNumber: '+15559998888',
        priority: 1,
      });

    expect(addRes.status).toBe(201);
    expect(addRes.body.success).toBe(true);
    const contactId = addRes.body.data.contact.id;

    // List Contacts
    const listRes = await request(app)
      .get('/api/v1/patients/me/emergency-contacts')
      .set('Cookie', patient.cookie);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.contacts.length).toBeGreaterThanOrEqual(1);

    // Update Contact
    const updateRes = await request(app)
      .patch(`/api/v1/patients/me/emergency-contacts/${contactId}`)
      .set('Cookie', patient.cookie)
      .send({ name: 'Dr. John Smith' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.contact.name).toBe('Dr. John Smith');

    // IDOR check: another patient cannot edit/delete Doctor Smith
    const stranger = await createTestUser('PATIENT');
    const idorRes = await request(app)
      .delete(`/api/v1/patients/me/emergency-contacts/${contactId}`)
      .set('Cookie', stranger.cookie);
    expect(idorRes.status).toBe(404);

    // Delete Contact by owner
    const delRes = await request(app)
      .delete(`/api/v1/patients/me/emergency-contacts/${contactId}`)
      .set('Cookie', patient.cookie);
    expect(delRes.status).toBe(200);
  });

  it('handles complete Pairing Invitation -> Caregiver Code Redemption -> Permission Sync -> Revocation workflow', async () => {
    const patient = await createTestUser('PATIENT');
    const caregiver = await createTestUser('CAREGIVER');

    // Enable location sharing for patient
    await request(app)
      .patch('/api/v1/patients/me')
      .set('Cookie', patient.cookie)
      .send({ safetySettings: { locationSharingEnabled: true } });

    // 1. Patient generates pairing code
    const inviteRes = await request(app)
      .post('/api/v1/patients/me/caregivers/invite')
      .set('Cookie', patient.cookie)
      .send({ relationshipType: 'FAMILY' });

    expect(inviteRes.status).toBe(201);
    const code = inviteRes.body.data.invitation.inviteCode;
    expect(code).toBeDefined();
    expect(code.length).toBe(6);

    // 2. Caregiver redeems pairing code
    const pairRes = await request(app)
      .post('/api/v1/caregivers/pair')
      .set('Cookie', caregiver.cookie)
      .send({ inviteCode: code });

    expect(pairRes.status).toBe(200);
    expect(pairRes.body.data.relationship.status).toBe('ACTIVE');
    const relationshipId = pairRes.body.data.relationship.id;

    // 3. Patient updates permissions to grant viewLocation
    const permRes = await request(app)
      .patch(`/api/v1/patients/me/caregivers/${relationshipId}/permissions`)
      .set('Cookie', patient.cookie)
      .send({
        permissions: {
          viewProfile: true,
          viewLocation: true,
          manageReminders: true,
          receiveSafetyAlerts: true,
        },
      });

    expect(permRes.status).toBe(200);
    expect(permRes.body.data.relationship.permissions.viewLocation).toBe(true);

    // 4. Caregiver fetches patient profile
    const profileAccessRes = await request(app)
      .get(`/api/v1/patients/${patient.id}`)
      .set('Cookie', caregiver.cookie);
    expect(profileAccessRes.status).toBe(200);

    // 5. Caregiver fetches patient current location when locationSharingEnabled=true & viewLocation=true
    const locAccessRes = await request(app)
      .get(`/api/v1/safety/location/current?patientId=${patient.id}`)
      .set('Cookie', caregiver.cookie);
    expect(locAccessRes.status).toBe(200);

    // 6. Patient disables location sharing -> Caregiver location request should now be rejected (403)
    await request(app)
      .patch('/api/v1/patients/me')
      .set('Cookie', patient.cookie)
      .send({ safetySettings: { locationSharingEnabled: false } });

    const locBlockedRes = await request(app)
      .get(`/api/v1/safety/location/current?patientId=${patient.id}`)
      .set('Cookie', caregiver.cookie);
    expect(locBlockedRes.status).toBe(403);
    expect(locBlockedRes.body.error.code).toBe('LOCATION_SHARING_DISABLED');

    // 7. Patient revokes caregiver relationship
    const revokeRes = await request(app)
      .post(`/api/v1/patients/me/caregivers/${relationshipId}/revoke`)
      .set('Cookie', patient.cookie);
    expect(revokeRes.status).toBe(200);

    // 8. Access after revocation -> MUST be denied with 403
    const revokedAccessRes = await request(app)
      .get(`/api/v1/patients/${patient.id}`)
      .set('Cookie', caregiver.cookie);
    expect(revokedAccessRes.status).toBe(403);
  });

  it('rejects cross-user caregiver access (Caregiver A accessing Patient B without relationship)', async () => {
    const patientA = await createTestUser('PATIENT');
    const patientB = await createTestUser('PATIENT');
    const caregiverA = await createTestUser('CAREGIVER');

    // Pair Caregiver A with Patient A only
    const inviteRes = await request(app)
      .post('/api/v1/patients/me/caregivers/invite')
      .set('Cookie', patientA.cookie)
      .send({});
    await request(app)
      .post('/api/v1/caregivers/pair')
      .set('Cookie', caregiverA.cookie)
      .send({ inviteCode: inviteRes.body.data.invitation.inviteCode });

    // Caregiver A tries to access Patient B -> 403 FORBIDDEN
    const crossAccessRes = await request(app)
      .get(`/api/v1/patients/${patientB.id}`)
      .set('Cookie', caregiverA.cookie);
    expect(crossAccessRes.status).toBe(403);
  });
});
