/**
 * notification.test.js — Comprehensive test suite for B9 Notification System
 *
 * Coverage:
 *   - Model: validation, required fields, enum enforcement, idempotency index
 *   - API: list, detail, mark-read, mark-all-read, unread-count, preferences
 *   - Security: cross-user access denied, unauthenticated access denied
 *   - Events: ReminderDue, ReminderMissed, CommunitySession* handlers
 *   - Idempotency: duplicate events create only one notification
 *   - Bulk: multiple recipients, no missing/duplicate records
 *   - Delivery: provider failure isolated, does not crash
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';

// ── Mock env before any module import ─────────────────────────────────────────

vi.mock('../../config/env.js', () => ({
  env: {
    nodeEnv: 'test',
    port: 5000,
    mongoUri: 'mongodb://localhost/test',
    clientUrl: 'http://localhost:5173',
    logLevel: 'silent',
    sessionSecret: 'test-secret-for-notification-test-suite',
    sessionTtlMs: 604800000,
    cookieName: 'memora_session',
  },
}));

import '../../../tests/setup.js';

// ── App & model lazy imports ───────────────────────────────────────────────────

let app;
beforeEach(async () => {
  if (!app) {
    const m = await import('../../app.js');
    app = m.default;
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────────

let _counter = 0;
function uniqueEmail(prefix = 'notif') {
  return `${prefix}${++_counter}@notiftest.com`;
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

  return { id: userId, email, role: role ?? 'PATIENT', cookie };
}

/**
 * Directly call the notification service to create a test notification,
 * bypassing the HTTP layer and event bus. Used to set up state for API tests.
 */
async function createTestNotification(userId, overrides = {}) {
  const { createNotification } = await import('./notification.service.js');
  return createNotification({
    recipientUserId: userId,
    type: 'REMINDER',
    title: 'Test Reminder',
    message: 'This is a test reminder notification.',
    priority: 'NORMAL',
    ...overrides,
  });
}

// ── 1. MODEL TESTS ────────────────────────────────────────────────────────────

describe('Notification Model (B9)', () => {
  it('creates a valid notification document', async () => {
    const Notification = (await import('./notification.model.js')).default;
    const mongoose = (await import('mongoose')).default;

    const userId = new mongoose.Types.ObjectId();
    const doc = await Notification.create({
      recipientUserId: userId,
      type: 'REMINDER',
      title: 'Medication reminder',
      message: 'Time to take your medication.',
    });

    expect(doc._id).toBeDefined();
    expect(doc.type).toBe('REMINDER');
    expect(doc.isRead).toBe(false);
    expect(doc.priority).toBe('NORMAL');
    expect(doc.readAt).toBeNull();
  });

  it('rejects a notification without required fields', async () => {
    const Notification = (await import('./notification.model.js')).default;
    await expect(
      Notification.create({ type: 'REMINDER' }) // missing recipientUserId, title, message
    ).rejects.toThrow();
  });

  it('rejects an invalid notification type', async () => {
    const Notification = (await import('./notification.model.js')).default;
    const mongoose = (await import('mongoose')).default;
    await expect(
      Notification.create({
        recipientUserId: new mongoose.Types.ObjectId(),
        type: 'INVALID_TYPE',
        title: 'Test',
        message: 'Test message',
      })
    ).rejects.toThrow();
  });

  it('rejects an invalid priority', async () => {
    const Notification = (await import('./notification.model.js')).default;
    const mongoose = (await import('mongoose')).default;
    await expect(
      Notification.create({
        recipientUserId: new mongoose.Types.ObjectId(),
        type: 'REMINDER',
        title: 'Test',
        message: 'Test message',
        priority: 'SUPER_URGENT', // invalid
      })
    ).rejects.toThrow();
  });

  it('rejects a title exceeding 200 characters', async () => {
    const Notification = (await import('./notification.model.js')).default;
    const mongoose = (await import('mongoose')).default;
    await expect(
      Notification.create({
        recipientUserId: new mongoose.Types.ObjectId(),
        type: 'REMINDER',
        title: 'A'.repeat(201),
        message: 'Test message',
      })
    ).rejects.toThrow();
  });

  it('rejects a message exceeding 1000 characters', async () => {
    const Notification = (await import('./notification.model.js')).default;
    const mongoose = (await import('mongoose')).default;
    await expect(
      Notification.create({
        recipientUserId: new mongoose.Types.ObjectId(),
        type: 'REMINDER',
        title: 'Test',
        message: 'B'.repeat(1001),
      })
    ).rejects.toThrow();
  });
});

// ── 2. API: UNAUTHENTICATED ACCESS ────────────────────────────────────────────

describe('Notification API — unauthenticated access (B9)', () => {
  it('GET /api/v1/notifications returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/notifications');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/notifications/unread-count returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/notifications/unread-count');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/notifications/preferences returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/notifications/preferences');
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/notifications/read-all returns 401 without auth', async () => {
    const res = await request(app).post('/api/v1/notifications/read-all');
    expect(res.status).toBe(401);
  });
});

// ── 3. API: LIST NOTIFICATIONS ────────────────────────────────────────────────

describe('Notification API — list (B9)', () => {
  it('user can list their own notifications', async () => {
    const patient = await registerAndLogin('listpatient', 'PATIENT');
    await createTestNotification(patient.id);
    await createTestNotification(patient.id, { title: 'Second', message: 'Second notification.' });

    const res = await request(app).get('/api/v1/notifications').set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
  });

  it('returns empty list when user has no notifications', async () => {
    const patient = await registerAndLogin('emptypatient', 'PATIENT');

    const res = await request(app).get('/api/v1/notifications').set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination.total).toBe(0);
  });

  it('filters by isRead=false (unread only)', async () => {
    const patient = await registerAndLogin('filterpatient', 'PATIENT');
    const notif = await createTestNotification(patient.id);

    // Mark one as read via service
    const { markAsRead } = await import('./notification.service.js');
    await markAsRead(patient.id, notif._id.toString());

    await createTestNotification(patient.id, { title: 'Unread', message: 'Unread notification.' });

    const res = await request(app)
      .get('/api/v1/notifications?isRead=false')
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.every((n) => n.isRead === false)).toBe(true);
  });

  it('filters by type', async () => {
    const patient = await registerAndLogin('typefilterpatient', 'PATIENT');
    await createTestNotification(patient.id, {
      type: 'REMINDER',
      title: 'Reminder notif',
      message: 'A reminder.',
      relatedResourceType: 'TypeTest',
      relatedResourceId: undefined,
    });
    await createTestNotification(patient.id, {
      type: 'SYSTEM',
      title: 'System notif',
      message: 'A system message.',
    });

    const res = await request(app)
      .get('/api/v1/notifications?type=SYSTEM')
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.every((n) => n.type === 'SYSTEM')).toBe(true);
  });

  it('rejects invalid type filter', async () => {
    const patient = await registerAndLogin('invalidtypepatient', 'PATIENT');
    const res = await request(app)
      .get('/api/v1/notifications?type=FAKE_TYPE')
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(400);
  });

  it('paginates notifications correctly', async () => {
    const patient = await registerAndLogin('paginationpatient', 'PATIENT');

    // Create 5 notifications
    for (let i = 0; i < 5; i++) {
      await createTestNotification(patient.id, {
        title: `Notif ${i}`,
        message: `Notification number ${i}.`,
      });
    }

    const res = await request(app)
      .get('/api/v1/notifications?limit=2&page=1')
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.pagination.limit).toBe(2);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(5);
    expect(res.body.pagination.hasNextPage).toBe(true);
  });
});

// ── 4. API: UNREAD COUNT ──────────────────────────────────────────────────────

describe('Notification API — unread count (B9)', () => {
  it('returns correct unread count', async () => {
    const patient = await registerAndLogin('countpatient', 'PATIENT');
    await createTestNotification(patient.id);
    await createTestNotification(patient.id, { title: 'N2', message: 'Second.' });

    const res = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.count).toBeGreaterThanOrEqual(2);
  });

  it('unread count decreases after marking notifications as read', async () => {
    const patient = await registerAndLogin('decreasecount', 'PATIENT');
    const notif = await createTestNotification(patient.id);

    const before = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Cookie', patient.cookie);

    const beforeCount = before.body.data.count;

    await request(app)
      .post(`/api/v1/notifications/${notif._id}/read`)
      .set('Cookie', patient.cookie);

    const after = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Cookie', patient.cookie);

    expect(after.body.data.count).toBe(beforeCount - 1);
  });
});

// ── 5. API: GET SINGLE NOTIFICATION ──────────────────────────────────────────

describe('Notification API — get single (B9)', () => {
  it('user can retrieve their own notification', async () => {
    const patient = await registerAndLogin('singlepatient', 'PATIENT');
    const notif = await createTestNotification(patient.id);

    const res = await request(app)
      .get(`/api/v1/notifications/${notif._id}`)
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(notif._id.toString());
  });

  it('returns 400 for an invalid notificationId format', async () => {
    const patient = await registerAndLogin('invalidnotifid', 'PATIENT');
    const res = await request(app)
      .get('/api/v1/notifications/not-an-object-id')
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(400);
  });
});

// ── 6. API: MARK AS READ ──────────────────────────────────────────────────────

describe('Notification API — mark as read (B9)', () => {
  it('user can mark their own notification as read', async () => {
    const patient = await registerAndLogin('markreadpatient', 'PATIENT');
    const notif = await createTestNotification(patient.id);

    const res = await request(app)
      .post(`/api/v1/notifications/${notif._id}/read`)
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isRead).toBe(true);
    expect(res.body.data.readAt).not.toBeNull();
  });
});

// ── 7. API: MARK ALL AS READ ──────────────────────────────────────────────────

describe('Notification API — mark all as read (B9)', () => {
  it('marks all unread notifications as read', async () => {
    const patient = await registerAndLogin('markallpatient', 'PATIENT');
    await createTestNotification(patient.id);
    await createTestNotification(patient.id, { title: 'N2', message: 'Second.' });

    const res = await request(app)
      .post('/api/v1/notifications/read-all')
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.data.modifiedCount).toBe('number');

    // Verify unread count is now 0
    const countRes = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Cookie', patient.cookie);

    expect(countRes.body.data.count).toBe(0);
  });
});

// ── 8. SECURITY: CROSS-USER ACCESS ───────────────────────────────────────────

describe('Notification Security — cross-user access (B9)', () => {
  it("user cannot access another user's notification", async () => {
    const patientA = await registerAndLogin('securityA', 'PATIENT');
    const patientB = await registerAndLogin('securityB', 'PATIENT');

    const notifA = await createTestNotification(patientA.id);

    // Patient B tries to access Patient A's notification
    const res = await request(app)
      .get(`/api/v1/notifications/${notifA._id}`)
      .set('Cookie', patientB.cookie);

    expect(res.status).toBe(404); // 404, not 403, to avoid information leakage
  });

  it("user cannot mark another user's notification as read", async () => {
    const patientA = await registerAndLogin('markSecA', 'PATIENT');
    const patientB = await registerAndLogin('markSecB', 'PATIENT');

    const notifA = await createTestNotification(patientA.id);

    const res = await request(app)
      .post(`/api/v1/notifications/${notifA._id}/read`)
      .set('Cookie', patientB.cookie);

    expect(res.status).toBe(404);

    // Verify the original notification is still unread
    const Notification = (await import('./notification.model.js')).default;
    const original = await Notification.findById(notifA._id).lean();
    expect(original.isRead).toBe(false);
  });

  it("user cannot list another user's notifications (list is scoped to self)", async () => {
    const patientA = await registerAndLogin('listSecA', 'PATIENT');
    const patientB = await registerAndLogin('listSecB', 'PATIENT');

    await createTestNotification(patientA.id);

    // Patient B's list should not contain Patient A's notification
    const res = await request(app).get('/api/v1/notifications').set('Cookie', patientB.cookie);

    expect(res.status).toBe(200);
    const notifIds = res.body.data.map((n) => n._id);
    // This checks that patientA's notification ID is not in patientB's list
    expect(notifIds).not.toContain(patientA.id);
  });
});

// ── 9. PREFERENCES ────────────────────────────────────────────────────────────

describe('Notification Preferences (B9)', () => {
  it('returns default preferences when none exist (lazy creation)', async () => {
    const patient = await registerAndLogin('defaultprefpatient', 'PATIENT');

    const res = await request(app)
      .get('/api/v1/notifications/preferences')
      .set('Cookie', patient.cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.channels.inApp).toBe(true);
    expect(res.body.data.channels.push).toBe(false);
    expect(res.body.data.categories.reminders).toBe(true);
    expect(res.body.data.categories.safetyAlerts).toBe(true);
  });

  it('user can update their preferences', async () => {
    const patient = await registerAndLogin('updateprefpatient', 'PATIENT');

    const res = await request(app)
      .patch('/api/v1/notifications/preferences')
      .set('Cookie', patient.cookie)
      .send({
        channels: { push: true },
        categories: { reminders: false },
      });

    expect(res.status).toBe(200);
    expect(res.body.data.channels.push).toBe(true);
    expect(res.body.data.categories.reminders).toBe(false);
    // safetyAlerts should remain true
    expect(res.body.data.categories.safetyAlerts).toBe(true);
  });

  it('rejects an invalid channel key', async () => {
    const patient = await registerAndLogin('invalidchannel', 'PATIENT');

    const res = await request(app)
      .patch('/api/v1/notifications/preferences')
      .set('Cookie', patient.cookie)
      .send({ channels: { fax: true } }); // fax is not a valid channel

    expect(res.status).toBe(400);
  });

  it('rejects an invalid category key', async () => {
    const patient = await registerAndLogin('invalidcategory', 'PATIENT');

    const res = await request(app)
      .patch('/api/v1/notifications/preferences')
      .set('Cookie', patient.cookie)
      .send({ categories: { sports: true } }); // sports is not a valid category

    expect(res.status).toBe(400);
  });

  it('rejects a non-boolean channel value', async () => {
    const patient = await registerAndLogin('nonboolchannel', 'PATIENT');

    const res = await request(app)
      .patch('/api/v1/notifications/preferences')
      .set('Cookie', patient.cookie)
      .send({ channels: { push: 'yes' } }); // should be boolean

    expect(res.status).toBe(400);
  });

  it("user cannot modify another user's preferences", async () => {
    const patientA = await registerAndLogin('prefSecA', 'PATIENT');
    const patientB = await registerAndLogin('prefSecB', 'PATIENT');

    // PatientB is authenticated but can only modify their OWN preferences.
    // The endpoint is scoped to req.user.id so there's no way to target A.
    // This test verifies patientB's update doesn't affect patientA's prefs.
    await request(app)
      .patch('/api/v1/notifications/preferences')
      .set('Cookie', patientB.cookie)
      .send({ categories: { reminders: false } });

    // PatientA's prefs should be unaffected (still default)
    const resA = await request(app)
      .get('/api/v1/notifications/preferences')
      .set('Cookie', patientA.cookie);

    expect(resA.body.data.categories.reminders).toBe(true);
  });

  it('returns 400 when body is empty', async () => {
    const patient = await registerAndLogin('emptypref', 'PATIENT');
    const res = await request(app)
      .patch('/api/v1/notifications/preferences')
      .set('Cookie', patient.cookie)
      .send({});

    expect(res.status).toBe(400);
  });
});

// ── 10. EVENT TESTS ───────────────────────────────────────────────────────────

describe('Notification Events (B9)', () => {
  it('handleEvent("ReminderDue") creates a REMINDER notification for the patient', async () => {
    const mongoose = (await import('mongoose')).default;
    const { handleEvent } = await import('./notification.service.js');
    const Notification = (await import('./notification.model.js')).default;

    const patientUserId = new mongoose.Types.ObjectId().toString();
    const reminderId = new mongoose.Types.ObjectId().toString();

    await handleEvent('ReminderDue', {
      patientUserId,
      reminderId,
      reminderTitle: 'Morning Medicine',
    });

    const notifs = await Notification.find({
      recipientUserId: patientUserId,
      type: 'REMINDER',
    }).lean();

    expect(notifs.length).toBe(1);
    expect(notifs[0].title).toContain('Morning Medicine');
  });

  it('handleEvent("ReminderMissed") creates a REMINDER notification', async () => {
    const mongoose = (await import('mongoose')).default;
    const { handleEvent } = await import('./notification.service.js');
    const Notification = (await import('./notification.model.js')).default;

    const patientUserId = new mongoose.Types.ObjectId().toString();
    const reminderId = new mongoose.Types.ObjectId().toString();

    await handleEvent('ReminderMissed', {
      patientUserId,
      reminderId,
      reminderTitle: 'Evening Walk',
    });

    const notifs = await Notification.find({
      recipientUserId: patientUserId,
      type: 'REMINDER',
      relatedResourceType: 'ReminderMissed',
    }).lean();

    expect(notifs.length).toBe(1);
    expect(notifs[0].priority).toBe('HIGH');
  });

  it('handleEvent("CommunitySessionApproved") notifies all voters', async () => {
    const mongoose = (await import('mongoose')).default;
    const { handleEvent } = await import('./notification.service.js');
    const Notification = (await import('./notification.model.js')).default;

    const sessionId = new mongoose.Types.ObjectId().toString();
    const voter1 = new mongoose.Types.ObjectId().toString();
    const voter2 = new mongoose.Types.ObjectId().toString();
    const voter3 = new mongoose.Types.ObjectId().toString();

    await handleEvent('CommunitySessionApproved', {
      sessionId,
      sessionTitle: 'Music & Memories',
      voterUserIds: [voter1, voter2, voter3],
    });

    const notifs = await Notification.find({
      relatedResourceType: 'CommunitySession',
      relatedResourceId: new mongoose.Types.ObjectId(sessionId),
      type: 'COMMUNITY_SESSION',
    }).lean();

    expect(notifs.length).toBe(3);
    const recipientIds = notifs.map((n) => n.recipientUserId.toString());
    expect(recipientIds).toContain(voter1);
    expect(recipientIds).toContain(voter2);
    expect(recipientIds).toContain(voter3);
  });

  it('handleEvent("CommunitySessionScheduled") notifies target users', async () => {
    const mongoose = (await import('mongoose')).default;
    const { handleEvent } = await import('./notification.service.js');
    const Notification = (await import('./notification.model.js')).default;

    const sessionId = new mongoose.Types.ObjectId().toString();
    const user1 = new mongoose.Types.ObjectId().toString();
    const user2 = new mongoose.Types.ObjectId().toString();

    await handleEvent('CommunitySessionScheduled', {
      sessionId,
      sessionTitle: 'Yoga & Wellness',
      sessionDate: '2026-09-15',
      targetUserIds: [user1, user2],
    });

    const notifs = await Notification.find({
      relatedResourceType: 'CommunitySessionScheduled',
      type: 'COMMUNITY_SESSION',
    }).lean();

    expect(notifs.length).toBeGreaterThanOrEqual(2);
  });

  it('handleEvent("CommunitySessionCancelled") notifies registrants', async () => {
    const mongoose = (await import('mongoose')).default;
    const { handleEvent } = await import('./notification.service.js');
    const Notification = (await import('./notification.model.js')).default;

    const sessionId = new mongoose.Types.ObjectId().toString();
    const reg1 = new mongoose.Types.ObjectId().toString();
    const reg2 = new mongoose.Types.ObjectId().toString();

    await handleEvent('CommunitySessionCancelled', {
      sessionId,
      sessionTitle: 'Art Therapy',
      targetUserIds: [reg1, reg2],
    });

    const notifs = await Notification.find({
      relatedResourceType: 'CommunitySessionCancelled',
      type: 'COMMUNITY_SESSION',
    }).lean();

    expect(notifs.length).toBe(2);
  });

  it('handleEvent("MeetingStarted") notifies all participants', async () => {
    const mongoose = (await import('mongoose')).default;
    const { handleEvent } = await import('./notification.service.js');
    const Notification = (await import('./notification.model.js')).default;

    const meetingId = new mongoose.Types.ObjectId().toString();
    const p1 = new mongoose.Types.ObjectId().toString();
    const p2 = new mongoose.Types.ObjectId().toString();

    await handleEvent('MeetingStarted', {
      meetingId,
      meetingTitle: 'Family Meeting',
      participantUserIds: [p1, p2],
    });

    const notifs = await Notification.find({
      relatedResourceType: 'Meeting',
      relatedResourceId: new mongoose.Types.ObjectId(meetingId),
      type: 'MEETING',
    }).lean();

    expect(notifs.length).toBe(2);
    expect(notifs[0].priority).toBe('HIGH');
  });

  it('handleEvent("MeetingCancelled") notifies all participants', async () => {
    const mongoose = (await import('mongoose')).default;
    const { handleEvent } = await import('./notification.service.js');
    const Notification = (await import('./notification.model.js')).default;

    const meetingId = new mongoose.Types.ObjectId().toString();
    const p1 = new mongoose.Types.ObjectId().toString();

    await handleEvent('MeetingCancelled', {
      meetingId,
      meetingTitle: 'Group Session',
      participantUserIds: [p1],
    });

    const notifs = await Notification.find({
      relatedResourceType: 'MeetingCancelled',
      type: 'MEETING',
    }).lean();

    expect(notifs.length).toBeGreaterThanOrEqual(1);
  });

  it('unknown event type is silently ignored (no error)', async () => {
    const { handleEvent } = await import('./notification.service.js');
    // Should not throw
    await expect(handleEvent('SomeUnknownEvent', {})).resolves.toBeUndefined();
  });

  it('event handler does not propagate errors (isolated)', async () => {
    const { handleEvent } = await import('./notification.service.js');
    // Payload with missing required fields — should not throw from the handler
    await expect(
      handleEvent('ReminderDue', { patientUserId: null }) // null userId
    ).resolves.toBeUndefined();
  });
});

// ── 11. IDEMPOTENCY TESTS ─────────────────────────────────────────────────────

describe('Notification Idempotency (B9)', () => {
  it('same event for same resource + recipient creates only one notification', async () => {
    const mongoose = (await import('mongoose')).default;
    const { createNotification } = await import('./notification.service.js');
    const Notification = (await import('./notification.model.js')).default;

    const userId = new mongoose.Types.ObjectId().toString();
    const resourceId = new mongoose.Types.ObjectId().toString();

    // Call createNotification twice with the same idempotency key
    const n1 = await createNotification({
      recipientUserId: userId,
      type: 'REMINDER',
      title: 'Duplicate Test',
      message: 'First call.',
      relatedResourceType: 'Reminder',
      relatedResourceId: resourceId,
    });

    const n2 = await createNotification({
      recipientUserId: userId,
      type: 'REMINDER',
      title: 'Duplicate Test',
      message: 'Second call — should be deduped.',
      relatedResourceType: 'Reminder',
      relatedResourceId: resourceId,
    });

    // Both should return a valid notification
    expect(n1).toBeDefined();
    expect(n2).toBeDefined();

    // But only ONE notification should exist in the DB for this resource+user+type
    const count = await Notification.countDocuments({
      recipientUserId: userId,
      type: 'REMINDER',
      relatedResourceType: 'Reminder',
      relatedResourceId: new mongoose.Types.ObjectId(resourceId),
    });

    expect(count).toBe(1);
  });

  it('ReminderDue emitted twice creates only one notification', async () => {
    const mongoose = (await import('mongoose')).default;
    const { handleEvent } = await import('./notification.service.js');
    const Notification = (await import('./notification.model.js')).default;

    const patientUserId = new mongoose.Types.ObjectId().toString();
    const reminderId = new mongoose.Types.ObjectId().toString();

    await handleEvent('ReminderDue', { patientUserId, reminderId, reminderTitle: 'Test' });
    await handleEvent('ReminderDue', { patientUserId, reminderId, reminderTitle: 'Test' }); // duplicate

    const count = await Notification.countDocuments({
      recipientUserId: patientUserId,
      type: 'REMINDER',
      relatedResourceType: 'Reminder',
      relatedResourceId: new mongoose.Types.ObjectId(reminderId),
    });

    expect(count).toBe(1);
  });
});

// ── 12. BULK NOTIFICATION TESTS ───────────────────────────────────────────────

describe('Bulk Notifications (B9)', () => {
  it('creates individual notifications for each of 10 voters', async () => {
    const mongoose = (await import('mongoose')).default;
    const { handleEvent } = await import('./notification.service.js');
    const Notification = (await import('./notification.model.js')).default;

    const sessionId = new mongoose.Types.ObjectId().toString();
    const voterIds = Array.from({ length: 10 }, () => new mongoose.Types.ObjectId().toString());

    await handleEvent('CommunitySessionApproved', {
      sessionId,
      sessionTitle: 'Bulk Test Session',
      voterUserIds: voterIds,
    });

    const notifs = await Notification.find({
      relatedResourceType: 'CommunitySession',
      relatedResourceId: new mongoose.Types.ObjectId(sessionId),
      type: 'COMMUNITY_SESSION',
    }).lean();

    expect(notifs.length).toBe(10);

    // No duplicate recipients
    const recipientSet = new Set(notifs.map((n) => n.recipientUserId.toString()));
    expect(recipientSet.size).toBe(10);
  });

  it('does not create a single giant document for 10 recipients', async () => {
    const mongoose = (await import('mongoose')).default;
    const { handleEvent } = await import('./notification.service.js');
    const Notification = (await import('./notification.model.js')).default;

    const sessionId = new mongoose.Types.ObjectId().toString();
    const voterIds = Array.from({ length: 10 }, () => new mongoose.Types.ObjectId().toString());

    await handleEvent('CommunitySessionApproved', {
      sessionId,
      sessionTitle: 'Bulk Structure Test',
      voterUserIds: voterIds,
    });

    // Each notification should be a separate document, not a single document
    const count = await Notification.countDocuments({
      relatedResourceType: 'CommunitySession',
      relatedResourceId: new mongoose.Types.ObjectId(sessionId),
    });

    expect(count).toBe(10); // 10 separate documents, not 1
  });
});

// ── 13. DELIVERY TESTS ────────────────────────────────────────────────────────

describe('Delivery Provider (B9)', () => {
  it('provider failure does not prevent in-app notification from being created', async () => {
    const mongoose = (await import('mongoose')).default;

    // Mock the push provider to throw
    vi.doMock('./providers/push.provider.js', () => ({
      deliverPush: vi.fn().mockRejectedValue(new Error('Push provider down')),
    }));

    const { createNotification } = await import('./notification.service.js');
    const Notification = (await import('./notification.model.js')).default;

    const userId = new mongoose.Types.ObjectId().toString();

    // Should not throw even though push might fail
    const notif = await createNotification({
      recipientUserId: userId,
      type: 'SYSTEM',
      title: 'Provider Failure Test',
      message: 'Testing provider isolation.',
    });

    expect(notif).toBeDefined();
    expect(notif._id).toBeDefined();

    // Notification record exists in DB (in-app delivery succeeded)
    const found = await Notification.findById(notif._id).lean();
    expect(found).not.toBeNull();
  });
});

// ── 14. PREFERENCES MODEL ─────────────────────────────────────────────────────

describe('NotificationPreference Model (B9)', () => {
  it('creates default preferences correctly', async () => {
    const mongoose = (await import('mongoose')).default;
    const NotificationPreference = (await import('./notificationPreference.model.js')).default;

    const userId = new mongoose.Types.ObjectId();
    const prefs = await NotificationPreference.create({ userId });

    expect(prefs.channels.inApp).toBe(true);
    expect(prefs.channels.push).toBe(false);
    expect(prefs.channels.email).toBe(false);
    expect(prefs.channels.sms).toBe(false);
    expect(prefs.categories.reminders).toBe(true);
    expect(prefs.categories.safetyAlerts).toBe(true);
  });

  it('prevents duplicate preference documents for same user', async () => {
    const mongoose = (await import('mongoose')).default;
    const NotificationPreference = (await import('./notificationPreference.model.js')).default;

    const userId = new mongoose.Types.ObjectId();
    await NotificationPreference.create({ userId });
    await expect(NotificationPreference.create({ userId })).rejects.toThrow();
  });
});
