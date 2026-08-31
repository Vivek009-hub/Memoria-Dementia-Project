/**
 * reminder.test.js â€” Comprehensive tests for B6 Reminder & Daily Routine System
 *
 * Covers:
 *   - Reminder model validation
 *   - ReminderLog model validation
 *   - computeNextOccurrence unit tests (one-time, daily, weekly, monthly, timezone)
 *   - CRUD API (create, list, get, update, delete/deactivate)
 *   - Completion and skip
 *   - History with effectiveStatus
 *   - Authorization: patient ownership, caregiver (manageReminders), revoked/unrelated
 *   - Security: cross-patient access denied
 *   - Idempotency: duplicate occurrence unique index
 *   - Timezone: Asia/Kolkata, America/New_York, Europe/London
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
    sessionSecret: 'test-secret-for-reminders-test',
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

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

let _counter = 0;
function uniqueEmail(prefix = 'user') {
  return `${prefix}${++_counter}@remtest.com`;
}

/**
 * Set a user's role directly via Mongoose (register always creates CAREGIVER).
 */
async function setUserRole(userId, role) {
  const User = (await import('../users/user.model.js')).default;
  await User.findByIdAndUpdate(userId, { role });
}

/**
 * Register a user, optionally override their role, and log in.
 * Returns { id, email, role, cookie }.
 *
 * @param {string} prefix - email prefix
 * @param {'PATIENT'|'CAREGIVER'|'ADMIN'} [role] - if provided, force this role
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

  // Override role if requested (register defaults to CAREGIVER)
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

/**
 * Build a valid one-time reminder request body (tomorrow at 08:00 Asia/Kolkata).
 */
function buildReminderBody(overrides = {}) {
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
  return {
    title: 'Take morning medicine',
    description: 'Prescribed medication',
    type: 'MEDICATION',
    timezone: 'Asia/Kolkata',
    schedule: {
      time: '08:00',
      startAt: tomorrow.toISOString(),
    },
    ...overrides,
  };
}

/**
 * Build a valid recurring (DAILY) reminder request body.
 */
function buildRecurringBody(overrides = {}) {
  return {
    title: 'Daily hydration reminder',
    type: 'ACTIVITY',
    timezone: 'Asia/Kolkata',
    schedule: { time: '09:00' },
    recurrence: {
      frequency: 'DAILY',
      interval: 1,
    },
    ...overrides,
  };
}

// â”€â”€ Model tests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Reminder model â€” validation', () => {
  let Reminder;
  let ReminderLog;

  beforeEach(async () => {
    if (!Reminder) {
      Reminder = (await import('./reminder.model.js')).default;
      ReminderLog = (await import('./reminderLog.model.js')).default;
    }
  });

  it('requires patientId', async () => {
    const doc = new Reminder({
      title: 'Test',
      type: 'MEDICATION',
      timezone: 'Asia/Kolkata',
      schedule: { time: '08:00' },
      createdBy: new mongoose.Types.ObjectId(),
    });
    await expect(doc.validate()).rejects.toThrow(/patientId/);
  });

  it('requires title', async () => {
    const doc = new Reminder({
      patientId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      type: 'MEDICATION',
      timezone: 'Asia/Kolkata',
      schedule: { time: '08:00' },
    });
    await expect(doc.validate()).rejects.toThrow(/title/);
  });

  it('requires schedule.time', async () => {
    const doc = new Reminder({
      patientId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      title: 'Test',
      type: 'MEDICATION',
      timezone: 'Asia/Kolkata',
      schedule: {},
    });
    await expect(doc.validate()).rejects.toThrow(/schedule.time/);
  });

  it('rejects invalid reminder type', async () => {
    const doc = new Reminder({
      patientId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      title: 'Test',
      type: 'INVALID_TYPE',
      timezone: 'Asia/Kolkata',
      schedule: { time: '08:00' },
    });
    await expect(doc.validate()).rejects.toThrow(/not a valid reminder type/);
  });

  it('rejects malformed time format', async () => {
    const doc = new Reminder({
      patientId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      title: 'Test',
      type: 'MEDICATION',
      timezone: 'Asia/Kolkata',
      schedule: { time: '8:00 AM' },
    });
    await expect(doc.validate()).rejects.toThrow(/HH:MM/);
  });

  it('rejects invalid recurrence frequency', async () => {
    const doc = new Reminder({
      patientId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      title: 'Test',
      type: 'ACTIVITY',
      timezone: 'Asia/Kolkata',
      schedule: { time: '08:00' },
      recurrence: { frequency: 'HOURLY', interval: 1 },
    });
    await expect(doc.validate()).rejects.toThrow(/not a valid recurrence frequency/);
  });

  it('rejects invalid weekday values', async () => {
    const doc = new Reminder({
      patientId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      title: 'Test',
      type: 'ACTIVITY',
      timezone: 'Asia/Kolkata',
      schedule: { time: '08:00' },
      recurrence: { frequency: 'WEEKLY', interval: 1, weekdays: [8] }, // 8 is invalid
    });
    await expect(doc.validate()).rejects.toThrow(/weekdays/);
  });

  it('accepts valid MEDICATION type', async () => {
    const doc = new Reminder({
      patientId: new mongoose.Types.ObjectId(),
      createdBy: new mongoose.Types.ObjectId(),
      title: 'Test',
      type: 'MEDICATION',
      timezone: 'Asia/Kolkata',
      schedule: { time: '08:00' },
    });
    await expect(doc.validate()).resolves.toBeUndefined();
  });

  it('ReminderLog requires reminderId and patientId', async () => {
    const doc = new ReminderLog({ scheduledAt: new Date(), status: 'SCHEDULED' });
    await expect(doc.validate()).rejects.toThrow();
  });

  it('ReminderLog rejects invalid status', async () => {
    const doc = new ReminderLog({
      reminderId: new mongoose.Types.ObjectId(),
      patientId: new mongoose.Types.ObjectId(),
      scheduledAt: new Date(),
      status: 'PENDING', // not in enum
    });
    await expect(doc.validate()).rejects.toThrow(/not a valid log status/);
  });
});

// â”€â”€ computeNextOccurrence unit tests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('computeNextOccurrence â€” scheduling logic', () => {
  let computeNextOccurrence;

  beforeEach(async () => {
    if (!computeNextOccurrence) {
      const svc = await import('./reminder.service.js');
      computeNextOccurrence = svc.computeNextOccurrence;
    }
  });

  it('returns null for inactive reminder', () => {
    const reminder = {
      isActive: false,
      schedule: { time: '08:00', startAt: new Date(Date.now() + 86400000) },
      recurrence: null,
      timezone: 'Asia/Kolkata',
      endDate: null,
    };
    expect(computeNextOccurrence(reminder, new Date())).toBeNull();
  });

  it('returns null for one-time reminder with startAt in the past', () => {
    const past = new Date(Date.now() - 3600 * 1000);
    const reminder = {
      isActive: true,
      schedule: { time: '08:00', startAt: past },
      recurrence: null,
      timezone: 'Asia/Kolkata',
      endDate: null,
    };
    expect(computeNextOccurrence(reminder, new Date())).toBeNull();
  });

  it('returns scheduledAt for one-time reminder in the future', () => {
    const future = new Date(Date.now() + 86400 * 1000);
    const reminder = {
      isActive: true,
      schedule: { time: '08:00', startAt: future },
      recurrence: null,
      timezone: 'Asia/Kolkata',
      endDate: null,
    };
    const result = computeNextOccurrence(reminder, new Date());
    expect(result).not.toBeNull();
    expect(result.getTime()).toBe(future.getTime());
  });

  it('computes daily occurrence at 08:00 UTC', () => {
    // Reference: 2026-09-01T00:00:00Z â€” next 08:00 UTC is same day
    const now = new Date('2026-09-01T00:00:00Z');
    const reminder = {
      isActive: true,
      schedule: { time: '08:00', startAt: null },
      recurrence: { frequency: 'DAILY', interval: 1, weekdays: [], endDate: null },
      timezone: 'UTC',
      endDate: null,
    };
    const next = computeNextOccurrence(reminder, now);
    expect(next).not.toBeNull();
    expect(next.toISOString()).toBe('2026-09-01T08:00:00.000Z');
  });

  it("advances to next day when today's time has passed", () => {
    // Reference: 2026-09-01T10:00:00Z â€” 08:00 UTC already passed, next is 09-02
    const now = new Date('2026-09-01T10:00:00Z');
    const reminder = {
      isActive: true,
      schedule: { time: '08:00', startAt: null },
      recurrence: { frequency: 'DAILY', interval: 1, weekdays: [], endDate: null },
      timezone: 'UTC',
      endDate: null,
    };
    const next = computeNextOccurrence(reminder, now);
    expect(next).not.toBeNull();
    expect(next.toISOString()).toBe('2026-09-02T08:00:00.000Z');
  });

  it('computes weekly occurrence on the correct weekday (Friday)', () => {
    // 2026-09-01 is Tuesday â€” next Friday is 2026-09-04
    const now = new Date('2026-09-01T00:00:00Z');
    const reminder = {
      isActive: true,
      schedule: { time: '10:00', startAt: null },
      recurrence: { frequency: 'WEEKLY', interval: 1, weekdays: [5], endDate: null }, // 5 = Friday
      timezone: 'UTC',
      endDate: null,
    };
    const next = computeNextOccurrence(reminder, now);
    expect(next).not.toBeNull();
    expect(next.toISOString()).toBe('2026-09-04T10:00:00.000Z');
  });

  it('returns null when recurrence endDate has passed', () => {
    const now = new Date('2026-09-10T00:00:00Z');
    const reminder = {
      isActive: true,
      schedule: { time: '08:00', startAt: null },
      recurrence: {
        frequency: 'DAILY',
        interval: 1,
        weekdays: [],
        endDate: new Date('2026-09-05T00:00:00Z'), // past
      },
      timezone: 'UTC',
      endDate: null,
    };
    expect(computeNextOccurrence(reminder, now)).toBeNull();
  });

  it('returns null when global endDate has passed', () => {
    const now = new Date('2026-09-10T00:00:00Z');
    const reminder = {
      isActive: true,
      schedule: { time: '08:00', startAt: null },
      recurrence: { frequency: 'DAILY', interval: 1, weekdays: [], endDate: null },
      timezone: 'UTC',
      endDate: new Date('2026-09-05T00:00:00Z'), // past
    };
    expect(computeNextOccurrence(reminder, now)).toBeNull();
  });
});

// â”€â”€ Timezone tests â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Timezone behaviour', () => {
  let computeNextOccurrence;

  beforeEach(async () => {
    if (!computeNextOccurrence) {
      const svc = await import('./reminder.service.js');
      computeNextOccurrence = svc.computeNextOccurrence;
    }
  });

  it('08:00 Asia/Kolkata (UTC+5:30) = 02:30 UTC', () => {
    const now = new Date('2026-09-01T00:00:00Z');
    const reminder = {
      isActive: true,
      schedule: { time: '08:00', startAt: null },
      recurrence: { frequency: 'DAILY', interval: 1, weekdays: [], endDate: null },
      timezone: 'Asia/Kolkata',
      endDate: null,
    };
    const next = computeNextOccurrence(reminder, now);
    expect(next).not.toBeNull();
    expect(next.toISOString()).toBe('2026-09-01T02:30:00.000Z');
  });

  it('08:00 America/New_York (EDT, UTC-4 in Sep) = 12:00 UTC', () => {
    const now = new Date('2026-09-01T00:00:00Z');
    const reminder = {
      isActive: true,
      schedule: { time: '08:00', startAt: null },
      recurrence: { frequency: 'DAILY', interval: 1, weekdays: [], endDate: null },
      timezone: 'America/New_York',
      endDate: null,
    };
    const next = computeNextOccurrence(reminder, now);
    expect(next).not.toBeNull();
    expect(next.toISOString()).toBe('2026-09-01T12:00:00.000Z');
  });

  it('08:00 Europe/London (BST, UTC+1 in Sep) = 07:00 UTC', () => {
    const now = new Date('2026-09-01T00:00:00Z');
    const reminder = {
      isActive: true,
      schedule: { time: '08:00', startAt: null },
      recurrence: { frequency: 'DAILY', interval: 1, weekdays: [], endDate: null },
      timezone: 'Europe/London',
      endDate: null,
    };
    const next = computeNextOccurrence(reminder, now);
    expect(next).not.toBeNull();
    expect(next.toISOString()).toBe('2026-09-01T07:00:00.000Z');
  });
});

// â”€â”€ POST /api/v1/reminders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('POST /api/v1/reminders', () => {
  it('patient can create a one-time reminder', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Take morning medicine');
    expect(res.body.data.type).toBe('MEDICATION');
    expect(res.body.data.timezone).toBe('Asia/Kolkata');
    expect(res.body.data.patientId).toBe(patient.id);
  });

  it('patient can create a recurring (DAILY) reminder', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildRecurringBody());

    expect(res.status).toBe(201);
    expect(res.body.data.recurrence.frequency).toBe('DAILY');
    expect(res.body.data.recurrence.interval).toBe(1);
  });

  it('rejects invalid reminder type', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody({ type: 'INVALID' }));

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('rejects invalid IANA timezone string', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody({ timezone: 'NotAValidTimezone_XYZ' }));

    expect(res.status).toBe(422);
  });

  it('rejects malformed time string', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const res = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody({ schedule: { time: '8am', startAt: tomorrow } }));

    expect(res.status).toBe(422);
  });

  it('rejects endDate before startDate', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    const res = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody({ startDate: tomorrow, endDate: yesterday }));

    expect(res.status).toBe(422);
  });

  it('rejects unauthenticated request with 401', async () => {
    const res = await request(app).post('/api/v1/reminders').send(buildReminderBody());

    expect(res.status).toBe(401);
  });

  it('patient patientId is always their own â€” cannot inject another patientId', async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');

    const res = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patientA.cookie)
      .send({ ...buildReminderBody(), patientId: patientB.id });

    // Should succeed but ownership must be patientA â€” not patientB
    expect(res.status).toBe(201);
    expect(res.body.data.patientId).toBe(patientA.id);
  });

  it('authorized caregiver (manageReminders) can create reminder for patient', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const caregiver = await registerAndLogin('caregiver');

    // The register endpoint creates CAREGIVER role by default
    // Create an ACTIVE relationship with manageReminders
    const CaregiverRelationship = (await import('../caregivers/caregiverRelationship.model.js'))
      .default;
    await CaregiverRelationship.create({
      caregiverId: new mongoose.Types.ObjectId(caregiver.id),
      patientId: new mongoose.Types.ObjectId(patient.id),
      relationshipType: 'FAMILY',
      status: 'ACTIVE',
      permissions: { manageReminders: true },
    });

    const res = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', caregiver.cookie)
      .query({ patientId: patient.id })
      .send(buildReminderBody());

    expect(res.status).toBe(201);
    expect(res.body.data.patientId).toBe(patient.id);
  });

  it('caregiver WITHOUT manageReminders is rejected (403)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const caregiver = await registerAndLogin('caregiver');

    const CaregiverRelationship = (await import('../caregivers/caregiverRelationship.model.js'))
      .default;
    await CaregiverRelationship.create({
      caregiverId: new mongoose.Types.ObjectId(caregiver.id),
      patientId: new mongoose.Types.ObjectId(patient.id),
      relationshipType: 'FAMILY',
      status: 'ACTIVE',
      permissions: { manageReminders: false },
    });

    const res = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', caregiver.cookie)
      .query({ patientId: patient.id })
      .send(buildReminderBody());

    expect(res.status).toBe(403);
  });

  it('REVOKED caregiver is rejected (403)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const caregiver = await registerAndLogin('caregiver');

    const CaregiverRelationship = (await import('../caregivers/caregiverRelationship.model.js'))
      .default;
    await CaregiverRelationship.create({
      caregiverId: new mongoose.Types.ObjectId(caregiver.id),
      patientId: new mongoose.Types.ObjectId(patient.id),
      relationshipType: 'FAMILY',
      status: 'REVOKED',
      permissions: { manageReminders: true },
    });

    const res = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', caregiver.cookie)
      .query({ patientId: patient.id })
      .send(buildReminderBody());

    expect(res.status).toBe(403);
  });

  it('caregiver without patientId query param is rejected (400)', async () => {
    const caregiver = await registerAndLogin('caregiver');

    const res = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', caregiver.cookie)
      .send(buildReminderBody());

    expect(res.status).toBe(400);
  });
});

// â”€â”€ GET /api/v1/reminders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('GET /api/v1/reminders', () => {
  it('patient lists only their own reminders', async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');

    // Create one reminder for each patient
    await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patientA.cookie)
      .send(buildReminderBody({ title: 'A reminder' }));
    await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patientB.cookie)
      .send(buildReminderBody({ title: 'B reminder' }));

    const res = await request(app).get('/api/v1/reminders').set('Cookie', patientA.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('A reminder');
    expect(res.body.pagination.total).toBe(1);
  });

  it('filters by type', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody({ type: 'MEDICATION' }));
    await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody({ title: 'Meal', type: 'MEAL' }));

    const res = await request(app)
      .get('/api/v1/reminders')
      .query({ type: 'MEDICATION' })
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.every((r) => r.type === 'MEDICATION')).toBe(true);
  });

  it('filters by isActive', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    // Create and deactivate one, leave another active
    const create1 = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody({ title: 'Active' }));
    const create2 = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody({ title: 'Inactive' }));

    await request(app)
      .delete(`/api/v1/reminders/${create2.body.data.id}`)
      .set('Cookie', patient.cookie);

    const res = await request(app)
      .get('/api/v1/reminders')
      .query({ isActive: 'true' })
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.every((r) => r.isActive === true)).toBe(true);
  });

  it('rejects limit > 100', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await request(app)
      .get('/api/v1/reminders')
      .query({ limit: 999 })
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(422);
  });

  it('authorized caregiver can list patient reminders', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const caregiver = await registerAndLogin('caregiver');

    await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody({ title: 'Patient reminder' }));

    const CaregiverRelationship = (await import('../caregivers/caregiverRelationship.model.js'))
      .default;
    await CaregiverRelationship.create({
      caregiverId: new mongoose.Types.ObjectId(caregiver.id),
      patientId: new mongoose.Types.ObjectId(patient.id),
      relationshipType: 'FAMILY',
      status: 'ACTIVE',
      permissions: { manageReminders: true },
    });

    const res = await request(app)
      .get('/api/v1/reminders')
      .query({ patientId: patient.id })
      .set('Cookie', caregiver.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});

// â”€â”€ GET /api/v1/reminders/:reminderId â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('GET /api/v1/reminders/:reminderId', () => {
  it('patient can get their own reminder', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/v1/reminders/${reminderId}`)
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(reminderId);
  });

  it("patient cannot access another patient's reminder (404)", async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');

    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patientB.cookie)
      .send(buildReminderBody({ title: 'B reminder' }));

    const reminderId = createRes.body.data.id;

    const res = await request(app)
      .get(`/api/v1/reminders/${reminderId}`)
      .set('Cookie', patientA.cookie);

    expect(res.status).toBe(404);
  });

  it('rejects invalid ObjectId with 400', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const res = await request(app)
      .get('/api/v1/reminders/not-a-valid-id')
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(400);
  });
});

// â”€â”€ PATCH /api/v1/reminders/:reminderId â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('PATCH /api/v1/reminders/:reminderId', () => {
  it('patient can update their reminder title', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody({ title: 'Old title' }));

    const reminderId = createRes.body.data.id;

    const res = await request(app)
      .patch(`/api/v1/reminders/${reminderId}`)
      .set('Cookie', patient.cookie)
      .send({ title: 'New title' });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('New title');
  });

  it('patient cannot change ownership (patientId silently dropped)', async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');

    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patientA.cookie)
      .send(buildReminderBody({ title: 'A reminder' }));

    const reminderId = createRes.body.data.id;

    const res = await request(app)
      .patch(`/api/v1/reminders/${reminderId}`)
      .set('Cookie', patientA.cookie)
      .send({ patientId: patientB.id, title: 'Updated' });

    expect(res.status).toBe(200);
    // patientId must remain unchanged
    expect(res.body.data.patientId).toBe(patientA.id);
  });

  it('rejects empty update body', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    const res = await request(app)
      .patch(`/api/v1/reminders/${reminderId}`)
      .set('Cookie', patient.cookie)
      .send({});

    expect(res.status).toBe(422);
  });

  it("patient cannot update another patient's reminder (404)", async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');

    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patientB.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    const res = await request(app)
      .patch(`/api/v1/reminders/${reminderId}`)
      .set('Cookie', patientA.cookie)
      .send({ title: 'Hacked title' });

    expect(res.status).toBe(404);
  });
});

// â”€â”€ DELETE /api/v1/reminders/:reminderId â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('DELETE /api/v1/reminders/:reminderId', () => {
  it('deactivates reminder (isActive = false)', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/v1/reminders/${reminderId}`)
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);

    // Confirm isActive = false in DB
    const Reminder = (await import('./reminder.model.js')).default;
    const updated = await Reminder.findById(reminderId).lean();
    expect(updated.isActive).toBe(false);
  });

  it('cancels SCHEDULED logs when reminder is deactivated', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    // Manually insert a SCHEDULED log
    const Reminder = (await import('./reminder.model.js')).default;
    const ReminderLog = (await import('./reminderLog.model.js')).default;
    const reminder = await Reminder.findById(reminderId).lean();
    await ReminderLog.create({
      reminderId: reminder._id,
      patientId: reminder.patientId,
      scheduledAt: new Date(Date.now() + 3600 * 1000),
      status: 'SCHEDULED',
    });

    await request(app).delete(`/api/v1/reminders/${reminderId}`).set('Cookie', patient.cookie);

    const logs = await ReminderLog.find({ reminderId: reminder._id }).lean();
    expect(logs.every((l) => l.status === 'CANCELLED')).toBe(true);
  });

  it("patient cannot delete another patient's reminder (404)", async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');

    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patientB.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/v1/reminders/${reminderId}`)
      .set('Cookie', patientA.cookie);

    expect(res.status).toBe(404);
  });
});

// â”€â”€ POST /api/v1/reminders/:reminderId/complete â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('POST /api/v1/reminders/:reminderId/complete', () => {
  it('patient can complete a SCHEDULED occurrence', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    // Inject a SCHEDULED log that is due (past scheduledAt)
    const Reminder = (await import('./reminder.model.js')).default;
    const ReminderLog = (await import('./reminderLog.model.js')).default;
    const reminder = await Reminder.findById(reminderId).lean();
    await ReminderLog.create({
      reminderId: reminder._id,
      patientId: reminder.patientId,
      scheduledAt: new Date(Date.now() - 1000), // 1 second ago = DUE
      status: 'SCHEDULED',
    });

    const res = await request(app)
      .post(`/api/v1/reminders/${reminderId}/complete`)
      .set('Cookie', patient.cookie)
      .send({ note: 'Taken with water' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.completedAt).not.toBeNull();
    expect(res.body.data.note).toBe('Taken with water');
  });

  it('completing an already-completed occurrence returns 409', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    const Reminder = (await import('./reminder.model.js')).default;
    const ReminderLog = (await import('./reminderLog.model.js')).default;
    const reminder = await Reminder.findById(reminderId).lean();
    const log = await ReminderLog.create({
      reminderId: reminder._id,
      patientId: reminder.patientId,
      scheduledAt: new Date(Date.now() - 1000),
      status: 'COMPLETED',
      completedAt: new Date(),
    });

    const res = await request(app)
      .post(`/api/v1/reminders/${reminderId}/complete`)
      .set('Cookie', patient.cookie)
      .send({ logId: log._id.toString() });

    expect(res.status).toBe(409);
  });

  it('returns 404 when no pending occurrence exists', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    // Remove the auto-scheduled log so there's nothing to complete
    const reminderId = createRes.body.data.id;
    const ReminderLog = (await import('./reminderLog.model.js')).default;
    await ReminderLog.deleteMany({ reminderId: new mongoose.Types.ObjectId(reminderId) });

    const res = await request(app)
      .post(`/api/v1/reminders/${reminderId}/complete`)
      .set('Cookie', patient.cookie)
      .send();

    expect(res.status).toBe(404);
  });

  it("patient cannot complete another patient's reminder (404)", async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');

    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patientB.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    const res = await request(app)
      .post(`/api/v1/reminders/${reminderId}/complete`)
      .set('Cookie', patientA.cookie)
      .send();

    expect(res.status).toBe(404);
  });

  it("authorized caregiver can complete patient's reminder", async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const caregiver = await registerAndLogin('caregiver');

    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    const Reminder = (await import('./reminder.model.js')).default;
    const ReminderLog = (await import('./reminderLog.model.js')).default;
    const CaregiverRelationship = (await import('../caregivers/caregiverRelationship.model.js'))
      .default;

    const reminder = await Reminder.findById(reminderId).lean();
    await ReminderLog.create({
      reminderId: reminder._id,
      patientId: reminder.patientId,
      scheduledAt: new Date(Date.now() - 1000),
      status: 'SCHEDULED',
    });

    await CaregiverRelationship.create({
      caregiverId: new mongoose.Types.ObjectId(caregiver.id),
      patientId: new mongoose.Types.ObjectId(patient.id),
      relationshipType: 'FAMILY',
      status: 'ACTIVE',
      permissions: { manageReminders: true },
    });

    const res = await request(app)
      .post(`/api/v1/reminders/${reminderId}/complete`)
      .set('Cookie', caregiver.cookie)
      .query({ patientId: patient.id })
      .send();

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });
});

// â”€â”€ POST /api/v1/reminders/:reminderId/skip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('POST /api/v1/reminders/:reminderId/skip', () => {
  it('patient can skip a SCHEDULED occurrence', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    const Reminder = (await import('./reminder.model.js')).default;
    const ReminderLog = (await import('./reminderLog.model.js')).default;
    const reminder = await Reminder.findById(reminderId).lean();
    await ReminderLog.deleteMany({ reminderId: reminder._id }); // clear auto-scheduled
    await ReminderLog.create({
      reminderId: reminder._id,
      patientId: reminder.patientId,
      scheduledAt: new Date(Date.now() - 1000),
      status: 'SCHEDULED',
    });

    const res = await request(app)
      .post(`/api/v1/reminders/${reminderId}/skip`)
      .set('Cookie', patient.cookie)
      .send({ note: 'Was not feeling well' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
    expect(res.body.data.note).toBe('Was not feeling well');
  });

  it('returns 404 when no pending occurrence exists', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;
    const ReminderLog = (await import('./reminderLog.model.js')).default;
    await ReminderLog.deleteMany({ reminderId: new mongoose.Types.ObjectId(reminderId) });

    const res = await request(app)
      .post(`/api/v1/reminders/${reminderId}/skip`)
      .set('Cookie', patient.cookie)
      .send();

    expect(res.status).toBe(404);
  });
});

// â”€â”€ GET /api/v1/reminders/history â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('GET /api/v1/reminders/history', () => {
  it('patient can view completed occurrence history', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    const Reminder = (await import('./reminder.model.js')).default;
    const ReminderLog = (await import('./reminderLog.model.js')).default;
    const reminder = await Reminder.findById(reminderId).lean();
    await ReminderLog.deleteMany({ reminderId: reminder._id });
    await ReminderLog.create({
      reminderId: reminder._id,
      patientId: reminder.patientId,
      scheduledAt: new Date(Date.now() - 3600 * 1000),
      status: 'COMPLETED',
      completedAt: new Date(),
    });

    const res = await request(app).get('/api/v1/reminders/history').set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].status).toBe('COMPLETED');
    expect(res.body.pagination).toBeDefined();
  });

  it("patient does not see another patient's history", async () => {
    const patientA = await registerAndLogin('patientA', 'PATIENT');
    const patientB = await registerAndLogin('patientB', 'PATIENT');

    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patientB.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    const Reminder = (await import('./reminder.model.js')).default;
    const ReminderLog = (await import('./reminderLog.model.js')).default;
    const reminder = await Reminder.findById(reminderId).lean();
    await ReminderLog.create({
      reminderId: reminder._id,
      patientId: reminder.patientId,
      scheduledAt: new Date(Date.now() - 3600 * 1000),
      status: 'COMPLETED',
      completedAt: new Date(),
    });

    const res = await request(app).get('/api/v1/reminders/history').set('Cookie', patientA.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });

  it('SCHEDULED logs include effectiveStatus: UPCOMING for future occurrences', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    const Reminder = (await import('./reminder.model.js')).default;
    const ReminderLog = (await import('./reminderLog.model.js')).default;
    const reminder = await Reminder.findById(reminderId).lean();
    await ReminderLog.deleteMany({ reminderId: reminder._id });
    await ReminderLog.create({
      reminderId: reminder._id,
      patientId: reminder.patientId,
      scheduledAt: new Date(Date.now() + 24 * 3600 * 1000), // far future
      status: 'SCHEDULED',
    });

    const res = await request(app).get('/api/v1/reminders/history').set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data[0].effectiveStatus).toBe('UPCOMING');
  });

  it('filters history by status', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    const Reminder = (await import('./reminder.model.js')).default;
    const ReminderLog = (await import('./reminderLog.model.js')).default;
    const reminder = await Reminder.findById(reminderId).lean();
    await ReminderLog.deleteMany({ reminderId: reminder._id });
    await ReminderLog.create([
      {
        reminderId: reminder._id,
        patientId: reminder.patientId,
        scheduledAt: new Date(Date.now() - 7200 * 1000),
        status: 'COMPLETED',
        completedAt: new Date(),
      },
      {
        reminderId: reminder._id,
        patientId: reminder.patientId,
        scheduledAt: new Date(Date.now() - 3600 * 1000),
        status: 'MISSED',
      },
    ]);

    const res = await request(app)
      .get('/api/v1/reminders/history')
      .query({ status: 'COMPLETED' })
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.every((l) => l.status === 'COMPLETED')).toBe(true);
  });
});

// â”€â”€ Idempotency â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('Idempotency â€” unique index on (reminderId, scheduledAt)', () => {
  it('prevents duplicate SCHEDULED occurrence for same reminder+scheduledAt', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody());

    const reminderId = createRes.body.data.id;

    const Reminder = (await import('./reminder.model.js')).default;
    const ReminderLog = (await import('./reminderLog.model.js')).default;
    const reminder = await Reminder.findById(reminderId).lean();
    await ReminderLog.deleteMany({ reminderId: reminder._id });

    const scheduledAt = new Date(Date.now() + 3600 * 1000);

    await ReminderLog.create({
      reminderId: reminder._id,
      patientId: reminder.patientId,
      scheduledAt,
      status: 'SCHEDULED',
    });

    // Second insert with same reminderId + scheduledAt must throw duplicate key error
    await expect(
      ReminderLog.create({
        reminderId: reminder._id,
        patientId: reminder.patientId,
        scheduledAt,
        status: 'SCHEDULED',
      })
    ).rejects.toMatchObject({ code: 11000 });
  });
});

// â”€â”€ Full end-to-end flow â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('End-to-end flow: patient creates â†’ lists â†’ gets â†’ completes â†’ views history', () => {
  it('completes the full reminder lifecycle', async () => {
    const patient = await registerAndLogin('patient', 'PATIENT');

    // 1. Create
    const createRes = await request(app)
      .post('/api/v1/reminders')
      .set('Cookie', patient.cookie)
      .send(buildReminderBody({ title: 'E2E Reminder' }));
    expect(createRes.status).toBe(201);
    const reminderId = createRes.body.data.id;

    // 2. List
    const listRes = await request(app).get('/api/v1/reminders').set('Cookie', patient.cookie);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((r) => r.id === reminderId)).toBe(true);

    // 3. Get single
    const getRes = await request(app)
      .get(`/api/v1/reminders/${reminderId}`)
      .set('Cookie', patient.cookie);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.title).toBe('E2E Reminder');

    // 4. Inject a DUE occurrence
    const Reminder = (await import('./reminder.model.js')).default;
    const ReminderLog = (await import('./reminderLog.model.js')).default;
    const reminder = await Reminder.findById(reminderId).lean();
    await ReminderLog.deleteMany({ reminderId: reminder._id });
    await ReminderLog.create({
      reminderId: reminder._id,
      patientId: reminder.patientId,
      scheduledAt: new Date(Date.now() - 500),
      status: 'SCHEDULED',
    });

    // 5. Complete
    const completeRes = await request(app)
      .post(`/api/v1/reminders/${reminderId}/complete`)
      .set('Cookie', patient.cookie)
      .send({ note: 'Done' });
    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.status).toBe('COMPLETED');

    // 6. Verify history
    const historyRes = await request(app)
      .get('/api/v1/reminders/history')
      .set('Cookie', patient.cookie);
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.data.some((l) => l.status === 'COMPLETED')).toBe(true);

    // 7. Cross-patient check: patientB cannot access patientA's reminder
    const patientB = await registerAndLogin('patientB', 'PATIENT');
    const crossRes = await request(app)
      .get(`/api/v1/reminders/${reminderId}`)
      .set('Cookie', patientB.cookie);
    expect(crossRes.status).toBe(404);
  });
});
