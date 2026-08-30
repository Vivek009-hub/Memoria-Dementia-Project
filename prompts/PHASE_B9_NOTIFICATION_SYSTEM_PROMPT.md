# Memora - Phase B9 Prompt: Notification System

**Phase:** B9  
**Name:** Memora Centralized Notification System  
**Prerequisites:** B0-B8 completed  
**Status:** Ready for implementation

---

# Objective

Implement Memora's centralized backend notification system.

B9 becomes the single notification layer for the application.

It should consume events from existing modules such as:

```text
B6 Reminders
B7 Community Sessions
B8 Meeting Circle
```

and later support:

```text
B12 Safety Alerts
B13 Mobile Safety System
```

The architecture should prevent individual modules from implementing their own notification infrastructure.

Core architecture:

```text
B6 Reminders ───────┐
                    │
B7 Community ───────┤
                    ↓
B8 Meetings ───────→ Notification Service
                    ↓
              Notification Queue
                    ↓
             Delivery Providers
                    ↓
        ┌───────────┼───────────┐
        ↓           ↓           ↓
       In-App     Push        Email/SMS
```

B9 is backend only.

---

# 1. READ FIRST

Before changing anything, read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
```

Then inspect:

```text
B0 Backend Foundation
B1 Database Foundation
B2 Authentication
B3 Users / Patients / Caregivers
B4 Cognitive Games
B5 Memory Assistance
B6 Reminders
B7 Community Sessions
B8 Meeting Circle
```

Inspect existing:

```text
server/src/modules/
server/src/middleware/
server/src/routes/
server/src/config/
server/src/jobs/
server/src/services/
```

Do NOT rebuild previous phases.

---

# 2. B9 SCOPE

Implement:

- Notification domain
- Notification model
- Notification preferences
- Notification types
- In-app notifications
- Notification read/unread state
- Notification lifecycle
- Notification service
- Event-driven notification architecture
- Notification queue abstraction
- Delivery provider abstraction
- Retry strategy
- Idempotency
- Notification deduplication
- User targeting
- Patient notifications
- Caregiver notifications where specified
- Admin notifications where specified
- Notification APIs
- Notification cleanup/retention
- Authorization
- Rate limiting where appropriate
- Validation
- Tests
- Security tests

Do NOT implement:

```text
AI-generated notifications
AI summaries
GPS
Geofencing
SOS
Fall Detection
Mobile App
Mobile push SDK integration unless provider is already selected
Video calling
Voice calling
Meeting infrastructure
Community Session creation
Reminder creation
```

B9 is notification infrastructure, not the source functionality that generates the underlying events.

---

# 3. CORE ARCHITECTURAL PRINCIPLE

Other modules must NOT directly implement notification delivery.

Incorrect:

```text
Reminder Controller
      ↓
Firebase
```

Correct:

```text
Reminder Service
      ↓
Domain Event
      ↓
Notification Service
      ↓
Notification Queue
      ↓
Delivery Provider
```

Similarly:

```text
Community Session
      ↓
Event
      ↓
Notification Service
```

and:

```text
Meeting Circle
      ↓
Event
      ↓
Notification Service
```

---

# 4. NOTIFICATION VS DELIVERY

Separate:

```text
Notification
```

from:

```text
Delivery Attempt
```

A notification represents what the user should be told.

A delivery attempt represents an attempt to deliver it through a channel.

Conceptually:

```text
Notification
 ├── recipient
 ├── type
 ├── title
 ├── body
 ├── data
 └── read status

        ↓

Delivery Attempt
 ├── notificationId
 ├── channel
 ├── provider
 ├── status
 ├── attemptedAt
 └── error
```

Follow DATABASE.md.

Do not create duplicate representations if the database architecture already defines them.

---

# 5. NOTIFICATION TYPES

Use controlled notification types.

Suggested types:

```text
REMINDER_DUE
REMINDER_MISSED

COMMUNITY_SESSION_APPROVED
COMMUNITY_SESSION_SCHEDULED
COMMUNITY_SESSION_REMINDER

MEETING_STARTED
MEETING_CANCELLED
MEETING_REMINDER

CAREGIVER_UPDATE
ADMIN_ALERT

SAFETY_ALERT
```

If DATABASE.md or PROJECT_SPEC.md defines exact values, follow them.

Do not create unnecessary notification types.

---

# 6. CHANNELS

Support an extensible channel architecture.

Potential channels:

```text
IN_APP
PUSH
EMAIL
SMS
```

For the first implementation:

```text
IN_APP
```

must work.

Other channels should use provider abstractions and only be activated if the project has selected/configured providers.

Do not hardwire external providers into business logic.

---

# 7. IN-APP NOTIFICATIONS

Implement the core in-app notification system.

A patient should eventually be able to see:

```text
🔔 Notifications

Medication reminder
Community session scheduled
Meeting starting
Session cancelled
Caregiver update
```

Backend should support:

```text
Create notification
List notifications
Get notification
Mark as read
Mark as unread if supported
Mark all as read
Delete/archive if supported
Unread count
```

---

# 8. NOTIFICATION MODEL

Implement according to DATABASE.md.

Potential fields:

```text
recipientId
type
title
body
data
priority
isRead
readAt
expiresAt
createdAt
updatedAt
```

Do not store sensitive information unnecessarily.

Avoid embedding large payloads inside notifications.

---

# 9. RECIPIENT TARGETING

Notification recipients must be determined server-side.

Example:

```text
Community Session approved
        ↓
Find patients who voted
        ↓
Create notifications
```

Do NOT allow a client to send:

```json
{
  "recipientId": "some-user"
}
```

and thereby send arbitrary notifications.

System-generated notifications should be created by trusted backend services.

---

# 10. USER TYPES

Support recipients according to the existing authorization architecture:

```text
PATIENT
CAREGIVER
ADMIN
```

Do not invent new roles.

Notification visibility must respect user ownership.

---

# 11. PATIENT NOTIFICATIONS

Patients may receive:

```text
Reminder due
Reminder missed
Community session approved
Community session scheduled
Community session reminder
Meeting starting
Meeting cancelled
Safety alerts later
```

Only generate notifications that correspond to actual domain events.

Do not spam users.

---

# 12. CAREGIVER NOTIFICATIONS

Caregiver notifications must follow B3 relationships and permissions.

Potential examples:

```text
Patient reminder missed
Patient safety alert
Patient community session activity
```

Only implement specific caregiver notification events defined by PROJECT_SPEC.md.

Do not expose patient information to unrelated caregivers.

---

# 13. ADMIN NOTIFICATIONS

Admins may receive:

```text
Teacher/content updates if applicable to project specification
Community session activity
Safety alerts
System events
```

Follow existing project requirements.

Do not create arbitrary admin notifications.

---

# 14. NOTIFICATION PREFERENCES

Implement user notification preferences where required.

Potential structure:

```text
reminders
communitySessions
meetings
caregiverUpdates
safetyAlerts
```

Channels:

```text
inApp
push
email
sms
```

Critical safety alerts should not be silently disabled if PROJECT_SPEC.md defines them as mandatory.

Do not allow a normal preference setting to suppress mandatory safety behavior.

---

# 15. DEFAULT PREFERENCES

If preferences are not explicitly created:

Use safe defaults.

For example:

```text
IN_APP = enabled
```

Optional external channels should remain disabled until configured/consented according to the project's requirements.

Do not assume that a user has provided phone/email notification consent.

---

# 16. NOTIFICATION PREFERENCES API

Potential endpoints:

```http
GET   /api/v1/notifications/preferences
PATCH /api/v1/notifications/preferences
```

Only the authenticated user or an explicitly authorized caregiver may modify relevant preferences.

Do not allow arbitrary preference changes for unrelated users.

---

# 17. LIST NOTIFICATIONS

Implement:

```http
GET /api/v1/notifications
```

Support:

```text
page
limit
isRead
type
date range
```

Use pagination.

Do not return an unbounded notification history.

---

# 18. UNREAD COUNT

Implement:

```http
GET /api/v1/notifications/unread-count
```

Example:

```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

The count must be scoped to the authenticated user.

---

# 19. MARK AS READ

Implement:

```http
POST /api/v1/notifications/:notificationId/read
```

Only the recipient may mark their notification as read unless an explicit administrative policy exists.

Do not allow:

```text
Patient A → mark Patient B notification as read
```

---

# 20. MARK ALL AS READ

Implement:

```http
POST /api/v1/notifications/read-all
```

Only affect notifications belonging to the authenticated user.

---

# 21. NOTIFICATION DETAIL

Implement:

```http
GET /api/v1/notifications/:notificationId
```

Return only notifications the requester is authorized to access.

---

# 22. NOTIFICATION DATA

Notifications may contain structured navigation data.

Example:

```json
{
  "type": "COMMUNITY_SESSION_SCHEDULED",
  "data": {
    "sessionId": "..."
  }
}
```

Prefer IDs/references over duplicating large objects.

Do not put:

```text
passwords
tokens
private medical data
provider secrets
```

inside notification payloads.

---

# 23. DOMAIN EVENTS

Create a clean event interface.

Potential events:

```text
ReminderDue
ReminderMissed

CommunitySessionApproved
CommunitySessionScheduled
CommunitySessionCancelled
CommunitySessionRegistrationOpened

MeetingStarted
MeetingCancelled
MeetingEnded

ParticipantJoined
```

Only implement events that are actually emitted by completed modules.

Do not fake events just to satisfy tests.

---

# 24. EVENT PRODUCERS

B6 may produce:

```text
ReminderDue
ReminderMissed
```

B7 may produce:

```text
CommunitySessionApproved
CommunitySessionScheduled
CommunitySessionCancelled
```

B8 may produce:

```text
MeetingStarted
MeetingCancelled
MeetingEnded
```

Do not tightly couple these modules to notification controllers.

---

# 25. EVENT CONSUMER

The notification system should receive domain events through a service/event bus abstraction.

Conceptually:

```text
Domain Event
      ↓
Event Handler
      ↓
Notification Builder
      ↓
Notification Repository
      ↓
Delivery Queue
```

If the existing project does not have a message broker:

Start with an internal event abstraction.

Do not introduce Kafka/RabbitMQ unnecessarily.

---

# 26. QUEUE ARCHITECTURE

Notifications should be capable of asynchronous delivery.

Conceptually:

```text
Notification Created
       ↓
Queue
       ↓
Worker
       ↓
Delivery Provider
```

If the project already has Redis/BullMQ or another queue infrastructure:

Reuse it.

If not:

Implement a provider-neutral queue abstraction and document the production queue decision.

Do not add a large infrastructure dependency without need.

---

# 27. DELIVERY PROVIDER ABSTRACTION

Use:

```text
Notification Service
       ↓
Channel Provider
       ↓
External Provider
```

Potential interfaces:

```text
sendInApp()
sendPush()
sendEmail()
sendSMS()
```

In-app notifications are database-backed and should work without an external provider.

---

# 28. PUSH NOTIFICATION PROVIDER

If Firebase Cloud Messaging or another provider is already selected:

Implement it behind an adapter.

Example:

```text
PushProvider
      ↓
FCM Adapter
```

Do NOT put FCM SDK calls inside controllers.

If no push provider has been selected:

```text
Do not hardcode FCM.
```

Create the abstraction and mock provider.

---

# 29. EMAIL / SMS

Do not implement email/SMS unless explicitly required/configured.

If included:

Use provider interfaces:

```text
EmailProvider
SmsProvider
```

Never hardcode credentials.

Do not expose provider secrets.

---

# 30. DEVICE TOKEN MODEL

If push notifications are implemented, support device registration.

Potential model:

```text
userId
deviceToken
platform
provider
isActive
lastUsedAt
createdAt
updatedAt
```

Potential platforms:

```text
ANDROID
IOS
WEB
```

Follow the mobile architecture when it exists.

---

# 31. DEVICE TOKEN API

If push is enabled:

```http
POST   /api/v1/notifications/devices
DELETE /api/v1/notifications/devices/:deviceId
```

Verify ownership.

A user must not be able to register/remove another user's device.

---

# 32. INVALID DEVICE TOKENS

If a push provider reports:

```text
invalid token
unregistered device
```

the system should deactivate/remove the token safely.

Do not repeatedly retry permanently invalid tokens.

---

# 33. RETRY STRATEGY

Transient delivery errors may be retried.

Permanent errors should not be retried indefinitely.

Conceptually:

```text
Attempt 1
   ↓
Failure
   ↓
Retry
   ↓
Failure
   ↓
Retry
   ↓
Final failure
```

Use bounded retries.

Do not create infinite notification loops.

---

# 34. EXPONENTIAL BACKOFF

If a queue exists, use reasonable exponential backoff for transient failures.

Do not retry immediately in a tight loop.

---

# 35. IDEMPOTENCY

Notification generation must be idempotent.

Example:

```text
ReminderDue event
ReminderDue event again
```

must not create duplicate notifications for the same logical event.

Use a deterministic event ID/idempotency key where possible.

---

# 36. DEDUPLICATION

Potential duplicate:

```text
MeetingStarted
MeetingStarted
```

must not create multiple identical notifications unless explicitly intended.

Use:

```text
eventId
notification type
recipient
```

or another deterministic uniqueness strategy.

---

# 37. BULK NOTIFICATIONS

Community Session approval may notify many patients.

Example:

```text
Music & Memory approved
       ↓
500 patients voted
       ↓
500 notifications
```

Do not create a single giant MongoDB document containing all recipients.

Use separate notification records or an appropriate bulk job.

---

# 38. BULK PROCESSING

For large recipient sets:

```text
Find recipients
      ↓
Batch
      ↓
Create notifications
      ↓
Queue delivery
```

Use batching to avoid memory spikes.

Do not load millions of recipients into memory.

---

# 39. TRANSACTIONAL CONSISTENCY

Where practical:

```text
Domain action
+
Notification creation
```

should not leave the system in an inconsistent state.

If a transaction/outbox pattern is appropriate, document it.

For example:

```text
Community session approved
        ↓
Persist approval
        ↓
Persist event/outbox record
        ↓
Worker creates notification
```

Do not rely only on in-memory events for critical notifications.

---

# 40. OUTBOX PATTERN

If the project architecture can support it, prefer an outbox pattern for important events.

Conceptually:

```text
Business Transaction
       ↓
Database
 ├── Business Change
 └── Outbox Event
       ↓
Worker
       ↓
Notification
```

This prevents losing events if the application crashes after the business transaction but before notification processing.

Do not introduce a complicated distributed architecture if the project is not ready for it.

---

# 41. NOTIFICATION PRIORITY

Use controlled priority values if needed:

```text
LOW
NORMAL
HIGH
CRITICAL
```

Safety alerts may use:

```text
CRITICAL
```

Do not let normal users arbitrarily set:

```text
CRITICAL
```

priority.

---

# 42. SAFETY ALERT PREPARATION

B9 should be designed so B12/B13 can later generate:

```text
SOS_ALERT
FALL_DETECTED
GEOFENCE_BREACH
```

without creating another notification infrastructure.

Do NOT implement the safety features themselves.

---

# 43. NOTIFICATION EXPIRATION

Notifications may have:

```text
expiresAt
```

if appropriate.

Expired notifications should not necessarily remain in the active inbox forever.

Do not delete historical records blindly.

---

# 44. RETENTION / CLEANUP

If notification retention is implemented:

```text
Active notifications
      ↓
Retention period
      ↓
Archive/delete
```

Do not delete critical safety history.

Follow PROJECT_SPEC.md.

---

# 45. TIMEZONE

Notification timestamps should be stored consistently with the project architecture.

The backend should return enough information for clients to display local time.

Do not manually calculate timezone offsets.

Use timezone-aware date handling.

---

# 46. LOCALIZED NOTIFICATIONS

Memora supports regional languages.

B9 should prepare for localization.

Preferred model:

```text
notificationKey
templateData
```

instead of hardcoding every language's final sentence into business logic.

Example:

```text
REMINDER_DUE
{
  reminderTitle: "Morning medicine"
}
```

The frontend or notification template service can later render:

```text
English
Hindi
Regional language
```

Do not implement a massive translation system in B9 unless required.

---

# 47. SIMPLE LANGUAGE

Notification templates should be designed for elderly users.

Prefer:

```text
"Your music session starts at 5:00 PM."
```

over:

```text
"You have been scheduled to participate in a community engagement event."
```

Keep backend templates structured and concise.

---

# 48. ACCESSIBILITY PREPARATION

Notification payloads should contain:

```text
title
body
type
timestamp
navigation data
priority
```

so future clients can support:

```text
Large text
Voice reading
Regional language
Simple wording
```

Do not implement UI accessibility in B9.

---

# 49. SECURITY

Never put inside notification payloads:

```text
Passwords
JWTs
Refresh tokens
Provider credentials
Private API keys
Sensitive medical records
Unnecessary personal information
```

Use references/IDs where possible.

---

# 50. NOTIFICATION AUTHORIZATION

Every notification API must enforce:

```text
Authenticated user
+
Recipient ownership
```

For caregiver/admin operations, use existing authorization.

Do not create a separate permission framework.

---

# 51. RATE LIMITING

Protect:

```text
mark-read
read-all
device registration
notification preference updates
```

where appropriate.

System-generated notification creation should not be directly exposed as an unrestricted public API.

---

# 52. VALIDATION

Validate:

```text
notificationId
type
channel
priority
preference keys
device token
platform
```

Reject:

```text
Invalid ObjectId
Invalid enum
Oversized body
Malformed device token
Unauthorized recipient
Invalid preference key
```

---

# 53. API SUMMARY

Potential endpoints:

```http
GET  /api/v1/notifications
GET  /api/v1/notifications/unread-count
GET  /api/v1/notifications/:notificationId

POST /api/v1/notifications/:notificationId/read
POST /api/v1/notifications/read-all

GET   /api/v1/notifications/preferences
PATCH /api/v1/notifications/preferences
```

If push is implemented:

```http
POST   /api/v1/notifications/devices
DELETE /api/v1/notifications/devices/:deviceId
```

System/internal event processing should NOT necessarily be exposed as public HTTP endpoints.

---

# 54. ADMIN / INTERNAL NOTIFICATION CREATION

If an internal notification creation API is required:

```text
Admin/system only
```

Do not expose unrestricted:

```http
POST /api/v1/notifications
```

to normal users.

The normal architecture should create notifications through trusted services/events.

---

# 55. DATABASE INDEXES

Follow DATABASE.md.

Potential indexes:

```text
Notification:
recipientId + isRead + createdAt
recipientId + createdAt
recipientId + type
expiresAt

NotificationDelivery:
notificationId + channel
status + nextAttemptAt

DeviceToken:
userId + isActive
deviceToken

OutboxEvent:
eventId
status + createdAt
```

Only create indexes required by actual query patterns.

---

# 56. TESTING

Create comprehensive tests.

## Notification Model

```text
✓ valid notification creation
✓ required fields enforced
✓ invalid type rejected
✓ invalid priority rejected
✓ oversized body rejected
```

## Notification APIs

```text
✓ user can list own notifications
✓ user can retrieve own notification
✓ user can mark own notification read
✓ user can mark all own notifications read
✓ unread count correct
```

## Security

```text
✓ user cannot access another user's notification
✓ user cannot mark another user's notification read
✓ user cannot modify another user's preferences
✓ unauthenticated access rejected
```

## Preferences

```text
✓ default preferences work
✓ valid preference updates work
✓ invalid preference rejected
✓ mandatory safety behavior cannot be disabled if specification requires it
```

---

# 57. EVENT TESTS

Test:

```text
✓ ReminderDue creates notification
✓ ReminderMissed creates notification
✓ CommunitySessionApproved creates targeted notifications
✓ CommunitySessionScheduled creates notifications
✓ CommunitySessionCancelled creates notifications
✓ MeetingStarted creates notification
✓ MeetingCancelled creates notification
```

Only test events actually implemented by the corresponding modules.

---

# 58. IDEMPOTENCY TESTS

Test:

```text
Same event
+
same recipient
+
same notification type
=
one logical notification
```

Verify duplicate event processing does not create duplicate records.

---

# 59. BULK NOTIFICATION TESTS

Test:

```text
100 eligible patients
      ↓
Community session approved
      ↓
100 notifications
```

Verify:

```text
No missing recipients
No duplicate recipients
No giant single document
```

---

# 60. DELIVERY TESTS

For mock providers:

```text
✓ successful delivery
✓ transient failure retries
✓ permanent failure stops retry
✓ invalid push token deactivated
✓ provider timeout handled
✓ provider error does not crash worker
```

Do not require real external providers for normal automated tests.

---

# 61. QUEUE TESTS

If queue infrastructure exists:

```text
✓ job created
✓ worker processes job
✓ duplicate job handled
✓ retry works
✓ failed job recorded
```

---

# 62. OUTBOX TESTS

If outbox is implemented:

```text
✓ business event creates outbox event
✓ worker processes event
✓ processed event not processed again
✓ failed event can retry
```

---

# 63. END-TO-END TEST

Test:

```text
B6 Reminder
    ↓
Reminder becomes due
    ↓
Domain event
    ↓
Notification Service
    ↓
Notification created
    ↓
Patient sees unread notification
    ↓
Patient marks it read
    ↓
Unread count decreases
```

Community flow:

```text
B7 Session
    ↓
Admin approves
    ↓
Eligible voters identified
    ↓
Notifications created
    ↓
Patients see notification
```

Meeting flow:

```text
B8 Meeting
    ↓
Meeting starts
    ↓
Event emitted
    ↓
Notification created
    ↓
Registered patient notified
```

---

# 64. NO AI

Do NOT implement:

```text
LLM
AI-generated notification text
AI summaries
AI recommendations
AI personalization
```

B11 handles AI.

---

# 65. NO MOBILE APP

Do NOT implement:

```text
Android app
iOS app
React Native
Flutter
GPS
Fall detection
SOS
```

B13 will handle the mobile application.

B9 may provide device-token APIs for future mobile integration if the architecture requires them.

---

# 66. NO SAFETY LOGIC

Do NOT implement:

```text
SOS detection
Fall detection
Geofence detection
Emergency contact triggering
```

B12/B13 handle those systems.

B9 only provides notification infrastructure that those systems can later call.

---

# 67. NO MEETING LOGIC

Do NOT implement:

```text
Video rooms
Voice rooms
Meeting provider
WebRTC
Participant management
```

B8 owns meeting infrastructure.

B9 only reacts to meeting events.

---

# 68. DO NOT REWRITE B0-B8

Do not rewrite:

```text
Authentication
Authorization
Users
Patients
Caregivers
Games
Memories
Reminders
Community Sessions
Voting
Registration
Meeting Circle
```

unless a genuine defect blocks B9.

If a defect is found:

1. Explain it.
2. Make the smallest safe fix.
3. Add a regression test.
4. Mention it in the final report.

---

# 69. DOCUMENTATION

Update:

```text
docs/ARCHITECTURE.md
docs/DATABASE.md
```

if B9 introduces:

```text
Notification model
Delivery model
Preference model
Device token model
Outbox
Queue
Provider abstraction
New indexes
New API endpoints
```

Document:

```text
Event flow
Notification lifecycle
Retry strategy
Idempotency strategy
Provider abstraction
Security model
```

If documentation conflicts with implementation:

STOP and report the conflict.

---

# 70. CODE ORGANIZATION

Follow existing architecture.

Recommended:

```text
server/src/modules/notifications/
├── notification.model.js
├── notificationDelivery.model.js
├── notificationPreference.model.js
├── deviceToken.model.js
├── notification.controller.js
├── notification.service.js
├── notification.repository.js
├── notification.events.js
├── notification.templates.js
├── notification.validation.js
├── notification.routes.js
├── notification.worker.js
├── notification.providers/
│   ├── inApp.provider.js
│   ├── push.provider.js
│   ├── email.provider.js
│   └── sms.provider.js
└── notification.test.js
```

Only create files that are actually required.

Do not duplicate provider implementations.

---

# 71. PROVIDER SELECTION

Before integrating external providers:

1. Read PROJECT_SPEC.md.
2. Inspect environment configuration.
3. Check whether a provider is already selected.
4. Reuse an existing provider.

If none is selected:

```text
Implement abstraction + mock provider.
```

Do not randomly hardcode a production provider.

---

# 72. ENVIRONMENT VARIABLES

If external providers are configured, document variables.

Examples:

```text
PUSH_PROVIDER=
PUSH_PROVIDER_API_KEY=
EMAIL_PROVIDER=
EMAIL_PROVIDER_API_KEY=
SMS_PROVIDER=
SMS_PROVIDER_API_KEY=
```

Use actual project naming conventions.

Never commit credentials.

---

# 73. PERFORMANCE

The notification system should not slow down core requests unnecessarily.

Avoid:

```text
Community session approval
       ↓
Wait for 500 notifications to be delivered
```

Prefer:

```text
Community session approval
       ↓
Persist event
       ↓
Return success
       ↓
Worker processes notifications
```

Use asynchronous processing for large delivery tasks.

---

# 74. OBSERVABILITY

Log safe operational data:

```text
notification ID
event ID
channel
provider
status
attempt number
timestamp
```

Do not log:

```text
notification tokens
provider secrets
private user data
```

Track failures sufficiently to debug delivery problems.

---

# 75. FAILURE ISOLATION

A notification failure must not break the core business operation where asynchronous delivery is used.

Example:

```text
Community Session approved
        ↓
Push provider unavailable
        ↓
Approval still succeeds
        ↓
Notification delivery retries
```

Do not roll back the business action merely because an optional notification provider failed.

For critical events, use the outbox/event architecture so the notification is not silently lost.

---

# 76. FINAL VERIFICATION

Run:

```bash
npm test
npm run lint
npm run format:check
```

If a build command exists, run it.

Verify:

```text
In-app notification works
Unread count works
Read state works
Preferences work
Authorization works

B6 events can generate notifications
B7 events can generate notifications
B8 events can generate notifications

Duplicate events do not create duplicate notifications
Bulk notification processing works
Retries work
Provider failures are isolated
Sensitive data is protected
```

---

# 77. FINAL REPORT

Return:

```text
B9 NOTIFICATION SYSTEM REPORT

Implementation:
-

Models created/modified:
-

Files created:
-

Files modified:
-

Endpoints:
-

Notification types:
-

Channels:
-

Notification lifecycle:
-

Event architecture:
-

Queue:
-

Outbox:
-

Provider abstraction:
-

In-app delivery:
-

Push delivery:
-

Email delivery:
-

SMS delivery:
-

Device tokens:
-

Preferences:
-

Targeting:
-

Retry strategy:
-

Idempotency:
-

Deduplication:
-

Bulk processing:
-

Authorization:
-

Security:
-

Privacy:
-

Localization preparation:
-

Indexes:
-

Cleanup/retention:
-

Tests:
-

Security tests:
-

Concurrency tests:
-

Delivery tests:
-

Lint:
-

Formatting:
-

Database changes:
-

Documentation changes:
-

Known issues:
-

Assumptions:
-
```

Also provide:

```bash
git status
git diff --stat
```

Do NOT commit or push.

Do NOT proceed to B10.

---

# 78. B9 DEFINITION OF DONE

B9 is complete only when:

[ ] Notification model implemented
[ ] Notification ownership implemented
[ ] In-app notifications implemented
[ ] Read/unread state implemented
[ ] Unread count implemented
[ ] Mark-as-read implemented
[ ] Mark-all-as-read implemented
[ ] Notification detail implemented
[ ] Pagination implemented
[ ] Filtering implemented
[ ] Notification preferences implemented where required
[ ] Notification types controlled
[ ] Priority controlled
[ ] Event-driven notification architecture implemented
[ ] B6 reminder events supported
[ ] B7 community session events supported
[ ] B8 meeting events supported
[ ] Notification service centralized
[ ] Controllers do not directly call notification providers
[ ] Provider abstraction implemented
[ ] Mock provider implemented
[ ] Queue abstraction implemented where required
[ ] Asynchronous delivery supported where required
[ ] Retry strategy implemented
[ ] Exponential backoff used where appropriate
[ ] Idempotency implemented
[ ] Duplicate notifications prevented
[ ] Bulk notification processing implemented safely
[ ] Recipient targeting is server-side
[ ] Patient authorization enforced
[ ] Caregiver authorization follows B3
[ ] Admin authorization enforced
[ ] Device token management implemented if push is enabled
[ ] Invalid device tokens handled
[ ] Provider credentials protected
[ ] Notification payloads protected
[ ] Sensitive information excluded
[ ] Localization-ready notification structure implemented
[ ] Timezone handling is correct
[ ] Cleanup/retention handled where required
[ ] Rate limiting applied where appropriate
[ ] Provider failures isolated
[ ] Tests cover notification APIs
[ ] Tests cover authorization
[ ] Tests cover events
[ ] Tests cover idempotency
[ ] Tests cover bulk processing
[ ] Tests cover delivery failures
[ ] Tests cover retries
[ ] All tests pass
[ ] Lint passes
[ ] Formatting passes
[ ] Documentation updated
[ ] No AI implemented
[ ] No mobile app implemented
[ ] No safety logic implemented
[ ] No meeting logic implemented
[ ] No unrelated features implemented

Only after all applicable items pass should B9 be considered complete.

---

# 79. STOP CONDITION

After B9 is complete:

**STOP.**

Do not begin B10.

The next phase will be:

```text
B10 - Analytics & Progress Tracking
```

B10 will build the backend analytics layer for cognitive-game performance, memory-assistance usage, reminders, community participation, meeting attendance, and patient progress while respecting privacy and authorization.
