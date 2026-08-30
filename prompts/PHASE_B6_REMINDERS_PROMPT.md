# Memora - Phase B6 Prompt: Reminders

**Phase:** B6  
**Name:** Reminder & Daily Routine System  
**Prerequisites:** B0-B5 completed  
**Status:** Ready for implementation

## Objective

Implement Memora's backend reminder and daily-routine system.

B6 allows patients and appropriately authorized caregivers to create, manage, schedule, complete, skip, and track reminders.

The system should support:

```text
Medication reminders
Appointment reminders
Daily activity reminders
Custom reminders
One-time reminders
Recurring reminders
Reminder completion
Reminder history
Caregiver-managed reminders
Reminder status
```

Target architecture:

```text
Patient / Caregiver
        ↓
Reminder API
        ↓
Authentication
        ↓
Authorization
        ↓
Reminder Service
        ↓
Scheduler / Due-Time Logic
        ↓
MongoDB
        ↓
B9 Notification System
```

B6 owns reminder data and scheduling logic.

B9 will later own centralized notification/delivery infrastructure.

---

# 1. READ FIRST

Before changing anything, read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
```

Then inspect the completed:

```text
B0 Backend Foundation
B1 Database Foundation
B2 Authentication
B3 Users / Patients / Caregivers
B4 Cognitive Games
B5 Memory Assistance
```

Inspect:

```text
server/src/modules/
server/src/middleware/
server/src/routes/
server/src/config/
```

Do NOT rebuild previous phases.

---

# 2. B6 SCOPE

Implement:

- Reminder model
- Reminder categories/types
- One-time reminders
- Recurring reminders
- Reminder scheduling data
- Reminder CRUD
- Reminder completion
- Reminder skip/dismiss where specified
- Reminder history
- Due/overdue/missed state
- Caregiver-managed reminders
- Authorization
- Patient ownership
- Recurrence validation
- Timezone-aware scheduling
- Pagination/filtering
- Tests
- Security tests

Do NOT implement:

```text
Push notification delivery
SMS delivery
Email delivery
Notification center
AI reminders
AI-generated reminder schedules
Voice assistant
Voice reminders
Community Sessions
Meeting Circle
Location
Geofencing
SOS
Fall Detection
Mobile App
```

Notification delivery belongs to B9.

---

# 3. CORE ARCHITECTURAL PRINCIPLE

Separate:

```text
Reminder Definition
```

from:

```text
Reminder Occurrence
```

A Reminder defines what should happen.

An Occurrence represents a specific scheduled instance.

```text
Reminder
 ├── title
 ├── type
 ├── schedule
 ├── recurrence
 ├── timezone
 └── active status

       ↓

Occurrence
 ├── reminderId
 ├── scheduledAt
 ├── status
 ├── completedAt
 └── metadata
```

If DATABASE.md already defines an occurrence model, use it.

If it does not, do not create a separate occurrence collection unless the implementation genuinely requires it.

---

# 4. REMINDER TYPES

Use controlled values.

If DATABASE.md defines them, follow it exactly.

If not, use a compact set such as:

```text
MEDICATION
APPOINTMENT
ACTIVITY
MEAL
HYDRATION
CUSTOM
```

Do not create unnecessary categories.

Reminder type is an organizational attribute, not a medical diagnosis or medical recommendation.

---

# 5. REMINDER MODEL

Implement according to DATABASE.md.

Potential fields:

```text
patientId
title
description
reminderType
schedule
timezone
recurrence
isActive
startDate
endDate
createdBy
updatedBy
createdAt
updatedAt
```

Use only fields defined or clearly justified by DATABASE.md.

Do not silently create a conflicting schema.

---

# 6. REMINDER OWNERSHIP

The reminder belongs to a patient.

```text
Patient A
   ↓
Reminder A
   ↓
✓ Patient A can access
```

Another patient:

```text
Patient B
   ↓
Reminder A
   ↓
✗ Forbidden
```

Caregivers may manage a patient's reminders only when:

```text
ACTIVE caregiver relationship
+
manageReminders permission
```

Reuse B3 authorization.

Do not create another permission system.

---

# 7. CREATE REMINDER

Implement:

```http
POST /api/v1/reminders
```

A patient can create a reminder for themselves.

Example:

```json
{
  "title": "Take morning medicine",
  "description": "Take the prescribed morning medication",
  "reminderType": "MEDICATION",
  "schedule": {
    "time": "08:00"
  },
  "timezone": "Asia/Kolkata"
}
```

Follow DATABASE.md if it defines another request shape.

The backend must determine ownership from authenticated context.

Do NOT trust a client-provided patientId to grant ownership.

---

# 8. CAREGIVER-CREATED REMINDERS

If the product specification permits caregivers to create reminders:

```text
Caregiver
   ↓
ACTIVE relationship
   ↓
manageReminders
   ↓
Create reminder for patient
```

Without the required permission:

```text
403 FORBIDDEN
```

Do not allow arbitrary caregiver access.

---

# 9. ONE-TIME REMINDERS

Support one-time reminders.

Example:

```text
Appointment
15 September 2026
5:00 PM
```

Store the correct scheduled time and timezone.

A completed one-time reminder must not generate unexpected future occurrences.

---

# 10. RECURRING REMINDERS

Support recurring reminders where specified.

Potential patterns:

```text
Daily
Weekly
Selected weekdays
Monthly
```

Follow DATABASE.md.

Do not build an unnecessarily complex scheduling language.

If RRULE or another recurrence representation is already specified, use it.

---

# 11. RECURRENCE VALIDATION

Validate recurrence rules server-side.

Reject:

```text
Invalid frequency
Invalid weekday
Invalid interval
Invalid start/end range
Malformed recurrence
Impossible schedule
```

Do not allow arbitrary executable scheduling expressions.

---

# 12. TIMEZONE HANDLING

Timezone correctness is critical.

Store timestamps consistently according to the project architecture.

For patient-local schedules:

```text
Patient timezone
       ↓
Schedule
       ↓
UTC persistence / normalized timestamp
```

Use IANA identifiers such as:

```text
Asia/Kolkata
America/New_York
Europe/London
```

Do not use ambiguous abbreviations such as:

```text
IST
EST
PST
```

for persistent timezone configuration.

The patient's timezone should come from the appropriate profile/configuration where possible.

Do not silently assume UTC.

---

# 13. DAYLIGHT SAVING TIME

Do not manually add/subtract fixed UTC offsets.

Use a timezone-aware date library or existing project date/time utilities.

For example:

```text
America/New_York
```

must correctly handle daylight-saving transitions.

---

# 14. REMINDER SCHEDULE

The schedule must be structured and validated.

Potential components:

```text
startAt
time
timezone
frequency
weekdays
endAt
```

Follow DATABASE.md.

Do not store a free-form string as the only scheduling representation if the application needs to calculate occurrences.

---

# 15. GET REMINDERS

Implement:

```http
GET /api/v1/reminders
```

Return only reminders the requester is authorized to access.

Support sensible filters:

```text
reminderType
isActive
date
status
```

Use pagination.

Do not return every reminder in one unbounded response.

---

# 16. GET REMINDER

Implement:

```http
GET /api/v1/reminders/:reminderId
```

Authorization must happen before returning the reminder.

Allowed:

```text
Patient owner
Authorized caregiver
Explicitly authorized admin policy
```

Denied:

```text
Unrelated user
Unauthorized caregiver
Revoked caregiver
```

---

# 17. UPDATE REMINDER

Implement:

```http
PATCH /api/v1/reminders/:reminderId
```

Verify:

```text
Reminder exists
+
Requester is authorized
+
Requester has required modification permission
```

Do not allow normal updates to change:

```text
patient ownership
createdBy
```

unless explicitly required by the product specification.

---

# 18. DELETE / DEACTIVATE

Implement:

```http
DELETE /api/v1/reminders/:reminderId
```

Prefer deactivation/soft deletion where historical activity must remain available.

For example:

```text
isActive = false
```

A deactivated recurring reminder must not produce new occurrences.

Do not destroy historical completion data unnecessarily.

---

# 19. REMINDER COMPLETION

Implement:

```http
POST /api/v1/reminders/:reminderId/complete
```

or an occurrence-based endpoint if DATABASE.md defines occurrences.

Record as appropriate:

```text
completedAt
status
completedBy
```

The backend must verify authorization.

Do not allow a random user to mark another patient's reminder completed.

---

# 20. SKIP / DISMISS

If the product specification requires it, support:

```http
POST /api/v1/reminders/:reminderId/skip
```

or an occurrence-based equivalent.

Possible statuses:

```text
PENDING
COMPLETED
SKIPPED
MISSED
CANCELLED
```

Follow DATABASE.md if it defines exact statuses.

Do not invent multiple competing status systems.

---

# 21. REMINDER HISTORY

Implement:

```http
GET /api/v1/reminders/history
```

Allow authorized users to inspect past reminder activity.

Potential data:

```text
Reminder
Scheduled time
Actual completion time
Status
Completed by
```

Do not expose another patient's history.

---

# 22. DUE / OVERDUE LOGIC

The backend should determine whether a reminder occurrence is:

```text
UPCOMING
DUE
COMPLETED
SKIPPED
MISSED
CANCELLED
```

Do not confuse:

```text
Reminder Definition
```

with:

```text
Current Occurrence Status
```

For recurring reminders, each occurrence must have a predictable scheduled time.

---

# 23. MISSED REMINDERS

If an occurrence passes its scheduled time without completion, it may become:

```text
MISSED
```

according to the project's defined grace period.

If no grace period is specified:

1. Choose a reasonable implementation.
2. Document the assumption.
3. Keep it configurable where practical.

Do not hardcode unexplained behavior.

---

# 24. SCHEDULER DESIGN

B6 establishes scheduling logic, but does NOT implement notification delivery.

Conceptually:

```text
Reminder
   ↓
Schedule Resolver
   ↓
Due Occurrence
   ↓
B9 Notification Service
```

If a background job is required:

- Reuse existing job infrastructure if available.
- Avoid duplicate worker systems.
- Make jobs idempotent.
- Prevent duplicate occurrence creation.

---

# 25. IDEMPOTENCY

Scheduler operations must be safe if executed twice.

Example:

```text
Scheduler run A
Scheduler run B
```

must not create two identical occurrences.

Use a uniqueness strategy or deterministic occurrence identifier where appropriate.

Do not rely only on in-memory state.

---

# 26. CONCURRENCY

Reminder completion must handle duplicate requests.

Example:

```text
Request A → complete occurrence
Request B → complete same occurrence
```

The system must not produce inconsistent duplicate completion records.

Use database-level/state validation where appropriate.

---

# 27. CAREGIVER ACCESS

Reuse B3.

Relevant permission:

```text
manageReminders
```

Access matrix:

```text
Patient → own reminders
✓

Caregiver → patient + manageReminders
✓

Caregiver → patient without manageReminders
✗

Revoked caregiver → patient
✗

Unrelated user → patient reminders
✗
```

Do not duplicate relationship queries throughout the reminder module.

---

# 28. REMINDER SAFETY

Memora should not automatically provide medical advice.

A medication reminder is a reminder, for example:

```text
"Take your prescribed medication at 8:00 AM"
```

B6 must NOT generate:

```text
"This medication is right for you"
"This is the correct dose"
"You should change your medication"
```

Do not create medical recommendations.

AI must not make medical decisions in B6.

---

# 29. VALIDATION

Validate:

```text
title
description
reminderType
schedule
timezone
startDate
endDate
recurrence
reminderId
```

Reject:

```text
Invalid ObjectId
Invalid enum
Invalid timezone
Malformed recurrence
Invalid dates
End date before start date
Invalid time
Oversized input
Unauthorized patientId
```

Do not trust frontend validation.

---

# 30. PAGINATION

List/history APIs must support pagination.

Use the existing project pagination format.

Enforce a reasonable maximum limit.

Do not allow:

```text
?limit=1000000
```

to create expensive queries.

---

# 31. FILTERING

Support practical filters such as:

```text
reminderType
isActive
status
date range
```

All filters must still respect authorization.

Do not create a complicated query language.

---

# 32. INDEXING

Follow DATABASE.md.

Likely useful indexes may include:

```text
Reminder:
patientId + isActive
patientId + reminderType
patientId + createdAt

ReminderOccurrence:
reminderId + scheduledAt
patientId + scheduledAt
patientId + status
```

Only add indexes that correspond to actual query patterns.

---

# 33. API RESPONSE FORMAT

Continue using the established API format.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Paginated:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

Errors:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource"
  }
}
```

Use existing B0/B2 error infrastructure.

Do not expose raw MongoDB errors.

---

# 34. TESTING

Create comprehensive tests.

## Reminder Model

```text
✓ valid reminder creation
✓ required fields enforced
✓ invalid type rejected
✓ invalid timezone rejected
✓ invalid recurrence rejected
✓ invalid date range rejected
```

## Reminder API

```text
✓ patient creates reminder
✓ patient lists own reminders
✓ patient retrieves reminder
✓ patient updates reminder
✓ patient deactivates/deletes reminder
```

## Completion

```text
✓ valid reminder can be completed
✓ completion timestamp recorded
✓ unauthorized completion rejected
✓ duplicate completion handled
✓ inactive/cancelled reminder cannot be completed incorrectly
```

## Caregiver

```text
✓ authorized caregiver can manage reminder
✓ caregiver without manageReminders rejected
✓ revoked caregiver rejected
✓ unrelated caregiver rejected
```

## Ownership

```text
✓ patient cannot access another patient's reminder
✓ patient cannot change ownership
✓ arbitrary patientId cannot be used to create reminder
```

---

# 35. SCHEDULING TESTS

Test:

```text
✓ one-time reminder occurrence
✓ daily recurrence
✓ weekly recurrence
✓ selected weekday recurrence if supported
✓ monthly recurrence if supported
✓ start date
✓ end date
✓ timezone conversion
✓ daylight-saving behavior where relevant
✓ no occurrence after deactivation
✓ duplicate scheduler execution does not duplicate occurrences
```

---

# 36. TIMEZONE TESTS

At minimum test:

```text
Asia/Kolkata
America/New_York
Europe/London
```

Verify that:

```text
08:00 local time
```

remains:

```text
08:00
```

in the configured local timezone even when UTC offsets differ.

Do not compare local times by manually adding offsets.

---

# 37. API INTEGRATION FLOW

Create an end-to-end flow:

```text
Authenticate patient
        ↓
POST /reminders
        ↓
Create reminder
        ↓
GET /reminders
        ↓
GET /reminders/:id
        ↓
Complete due reminder/occurrence
        ↓
GET /reminders/history
        ↓
Verify completion
```

Also test:

```text
Patient A
   ↓
Patient B reminder
   ↓
403 / 404 according to security convention
```

---

# 38. NO NOTIFICATION DELIVERY

Do NOT implement:

```text
Push notifications
Firebase notifications
SMS
Email
Notification center
Notification preferences
```

B9 handles centralized notifications.

B6 should expose reminder state/data needed by B9.

---

# 39. NO AI

Do NOT implement:

```text
AI reminder generation
AI scheduling
LLM integration
AI medication recommendations
AI-generated medical advice
Voice assistant
```

B11 handles AI.

---

# 40. NO FRONTEND

Do not implement:

```text
React reminder UI
Mobile reminder UI
Voice UI
Push notification UI
```

B6 is backend only.

Design APIs for later frontend consumption.

---

# 41. NO SAFETY FEATURES

Do NOT implement:

```text
GPS
Geofencing
SOS
Fall detection
Safety alerts
```

Those belong to B12/B13.

---

# 42. DOCUMENTATION

If B6 changes:

```text
Reminder schema
Occurrence schema
Schedule format
Recurrence format
Reminder API
Permission requirements
Indexes
```

update the relevant documentation.

Do not silently modify DATABASE.md.

If DATABASE.md conflicts with implementation:

STOP and report the conflict.

---

# 43. DO NOT REWRITE B0-B5

Do not rewrite:

```text
Express setup
MongoDB configuration
Authentication
Session management
User model
PatientProfile
CaregiverRelationship
EmergencyContact
Authorization
Game models
Memory models
Media infrastructure
```

unless a genuine defect blocks B6.

If a defect is discovered:

1. Explain it.
2. Make the smallest safe fix.
3. Add a regression test.
4. Mention it in the final report.

---

# 44. NO UNRELATED FEATURES

Do NOT implement:

```text
Cognitive Games changes
Memory Assistance changes
Community Sessions
Meeting Circle
Notifications
Analytics
AI
Location
Geofencing
SOS
Fall Detection
Mobile App
```

Only implement reminder functionality.

---

# 45. CODE ORGANIZATION

Follow the existing modular architecture.

Recommended if consistent with the repository:

```text
server/src/modules/reminders/
├── reminder.model.js
├── reminderOccurrence.model.js
├── reminder.controller.js
├── reminder.service.js
├── reminder.scheduler.js
├── reminder.routes.js
├── reminder.validation.js
└── reminder.test.js
```

If an occurrence model is not required by DATABASE.md, do not create it merely because this example contains one.

Follow repository conventions.

---

# 46. FINAL VERIFICATION

Run:

```bash
npm test
npm run lint
npm run format:check
```

If a build command exists, run it.

Verify:

```text
Patient can create reminder
Patient can list reminders
Patient can retrieve reminder
Patient can update reminder
Patient can complete reminder
Patient can view history

Authorized caregiver can manage reminders

Unauthorized caregiver cannot manage reminders

Revoked caregiver cannot access reminders

Recurring schedule behaves correctly

Timezone behavior is correct

Duplicate scheduler execution does not duplicate occurrences
```

---

# 47. FINAL REPORT

Return:

```text
B6 REMINDERS REPORT

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

Reminder types:
-

Schedule representation:
-

Recurrence strategy:
-

Timezone strategy:
-

Occurrence strategy:
-

Completion strategy:
-

Missed reminder strategy:
-

Scheduler:
-

Idempotency:
-

Concurrency protection:
-

Authorization:
-

Caregiver permissions:
-

Validation:
-

Indexes:
-

Tests:
-

Security tests:
-

Timezone tests:
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

Do NOT proceed to B7.

---

# 48. B6 DEFINITION OF DONE

B6 is complete only when:

[ ] Reminder model implemented according to DATABASE.md
[ ] Reminder CRUD implemented
[ ] Patient ownership enforced
[ ] Caregiver access uses B3 authorization
[ ] manageReminders permission enforced
[ ] Reminder types validated
[ ] One-time reminders supported
[ ] Recurring reminders supported where specified
[ ] Schedule validation implemented
[ ] Timezone-aware scheduling implemented
[ ] IANA timezones supported
[ ] DST-safe date handling implemented
[ ] Reminder completion implemented
[ ] Skip/dismiss implemented if specified
[ ] Reminder history implemented
[ ] Due/overdue/missed logic implemented as specified
[ ] Deactivated reminders do not create future occurrences
[ ] Scheduler is idempotent if used
[ ] Duplicate occurrences prevented
[ ] Duplicate completion handled
[ ] Pagination implemented
[ ] Filtering implemented
[ ] Required indexes implemented
[ ] Input validation implemented
[ ] Sensitive patient data protected
[ ] No notification delivery implemented
[ ] No AI implemented
[ ] No frontend/mobile implementation
[ ] Tests cover CRUD
[ ] Tests cover authorization
[ ] Tests cover ownership
[ ] Tests cover recurrence
[ ] Tests cover timezone behavior
[ ] Tests cover concurrency/idempotency
[ ] All tests pass
[ ] Lint passes
[ ] Formatting passes
[ ] Documentation remains consistent
[ ] No unrelated features implemented

Only after all applicable items pass should B6 be considered complete.

---

# 49. STOP CONDITION

After B6 is complete:

**STOP.**

Do not begin B7.

The next phase will be:

```text
B7 - Community Sessions
```

B7 will implement Memora's community-session voting, approval, scheduling, featured guests, participant capacity, and pre-registration system.
