# Memora - Phase B8 Prompt: Memora Meeting Circle

**Phase:** B8  
**Name:** Memora Meeting Circle - Voice/Video Meeting Infrastructure  
**Prerequisites:** B0-B7 completed  
**Status:** Ready for implementation

## Objective

Implement the backend infrastructure for **Memora Meeting Circle**, the actual voice/video meeting experience used by approved and scheduled Community Sessions.

B7 created:

```text
Session Ideas
Voting
Approval
Scheduling
Pre-registration
Capacity
```

B8 now connects those scheduled events to an actual meeting experience.

Core flow:

```text
B7 Scheduled Session
        ↓
Meeting Circle
        ↓
Meeting Room Created
        ↓
Authorized Participants Join
        ↓
Host Controls Session
        ↓
Voice / Video Provider
        ↓
Session Ends
        ↓
Meeting Attendance / History
```

B8 is backend-focused. Web and mobile UI are NOT implemented in this phase.

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
B6 Reminders
B7 Community Sessions
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

# 2. B8 SCOPE

Implement:

- Meeting Circle domain
- Meeting room lifecycle
- Community Session ↔ Meeting relationship
- Meeting access authorization
- Participant access
- Host access
- Join/leave lifecycle
- Meeting status
- Participant status
- Meeting attendance
- Host controls foundation
- Meeting provider abstraction
- Provider token/session abstraction
- Voice/video mode handling
- Meeting history
- Participant limits
- Meeting security
- Cleanup/expiration logic
- Validation
- Concurrency protection
- Tests
- Security tests

Do NOT implement:

```text
React meeting UI
Mobile meeting UI
WebRTC directly unless explicitly required
Video streaming infrastructure
Audio streaming infrastructure
Push notifications
SMS
Email
AI
AI transcription
AI summaries
GPS
Geofencing
SOS
Fall Detection
Safety Mobile App
```

---

# 3. B7 VS B8 RESPONSIBILITY

B7 owns:

```text
Community Session
Voting
Approval
Schedule
Pre-registration
Capacity
```

B8 owns:

```text
Meeting Room
Join Access
Meeting Lifecycle
Participants
Host Controls
Attendance
Provider Integration
```

Do not duplicate B7 functionality.

---

# 4. PROVIDER ABSTRACTION

Do NOT tightly couple Memora to one video provider.

Use:

```text
Meeting Service
      ↓
Meeting Provider Interface
      ↓
Provider Adapter
      ↓
External Meeting Provider
```

Controllers must not contain provider-specific SDK calls.

If no production provider has been selected, implement a provider interface plus mock provider rather than randomly hardcoding a vendor.

---

# 5. MEETING MODEL

Implement according to DATABASE.md.

Potential fields:

```text
communitySessionId
provider
providerMeetingId
meetingType
status
scheduledAt
startedAt
endedAt
hostId
maxParticipants
createdAt
updatedAt
```

Use only fields defined or clearly justified by DATABASE.md.

---

# 6. MEETING TYPES

Reuse B7:

```text
VIDEO
VOICE
```

Do not create another conflicting enum.

B8 should respect the meeting type selected for the Community Session.

---

# 7. MEETING STATUS

Use controlled lifecycle states.

Recommended:

```text
SCHEDULED
READY
LIVE
ENDED
CANCELLED
EXPIRED
```

Follow DATABASE.md if it defines different states.

Valid example:

```text
SCHEDULED
   ↓
READY
   ↓
LIVE
   ↓
ENDED
```

Do not allow arbitrary state transitions.

Examples that must be rejected:

```text
ENDED → LIVE
CANCELLED → LIVE
```

unless explicitly supported by the specification.

---

# 8. PARTICIPANT STATUS

Use controlled states where required:

```text
REGISTERED
JOINED
LEFT
REMOVED
BANNED
```

Follow DATABASE.md if different.

Do not confuse participant status with B7 registration status.

---

# 9. MEETING ACCESS

Only eligible users can join.

At minimum:

```text
Authenticated patient
+
Registered for session
+
Session is valid
+
Meeting is joinable
=
Can join
```

Host:

```text
Authorized host
+
Correct session
=
Can join/control meeting
```

Admin access follows the existing project policy.

Unauthorized users must receive the project's appropriate `403 FORBIDDEN`/authorization error.

---

# 10. DO NOT TRUST PROVIDER MEETING IDS

Knowing a:

```text
providerMeetingId
```

must NOT be enough to join.

Before issuing provider credentials, verify:

```text
Authenticated user
+
Community Session
+
Registration / host status
+
Meeting state
```

---

# 11. MEETING CREATION

A meeting must be associated with an approved/scheduled Community Session.

Potential endpoint:

```http
POST /api/v1/community/sessions/:sessionId/meeting
```

or:

```http
POST /api/v1/meetings
```

Follow existing route conventions.

Creation must verify:

```text
Session exists
+
Session is approved/scheduled
+
Session is not cancelled
+
Requester is authorized
```

Patients must not create arbitrary meetings.

---

# 12. PROVIDER CREDENTIALS

Provider API credentials must remain server-side.

Never expose:

```text
API keys
provider secrets
service account credentials
private tokens
```

Use environment variables.

Never commit credentials.

---

# 13. PARTICIPANT TOKEN

If the provider uses participant tokens:

```text
Client
   ↓
Backend
   ↓
Authorization
   ↓
Provider token generation
   ↓
Temporary scoped participant token
```

Tokens should:

- Be short-lived where supported.
- Be scoped to the correct meeting.
- Be scoped to the correct participant.
- Never grant unrelated meeting access.
- Never be issued to unauthorized users.

Do not store provider access tokens unnecessarily.

---

# 14. JOIN ENDPOINT

Implement an endpoint such as:

```http
POST /api/v1/community/sessions/:sessionId/meeting/join
```

Flow:

```text
Authenticate
      ↓
Find session
      ↓
Find meeting
      ↓
Verify registration/host access
      ↓
Verify meeting state
      ↓
Verify capacity
      ↓
Create provider participant token
      ↓
Record participant JOINED
      ↓
Return join credentials
```

---

# 15. LEAVE ENDPOINT

Implement:

```http
POST /api/v1/community/sessions/:sessionId/meeting/leave
```

or an equivalent meeting-participant endpoint.

Record:

```text
leftAt
status
```

If the provider supports authoritative participant webhooks, use them where appropriate.

---

# 16. CAPACITY

B7 owns event registration capacity.

B8 must additionally protect the actual active meeting participant capacity.

Example:

```text
20 maximum
21 active participants
```

must not happen unless explicitly supported.

Protect concurrent joins.

---

# 17. JOIN RACE CONDITION

Test:

```text
19 / 20 active
     ↓
User A joins
User B joins
```

Both must not bypass capacity due to a race condition.

Use atomic/database-safe strategies.

---

# 18. HOST

The scheduled session may have a host.

Host capabilities may include:

```text
Start meeting
End meeting
Remove participant
Mute participant if provider supports it
```

Only implement provider-supported operations.

---

# 19. HOST AUTHORIZATION

Before host operations, verify:

```text
Authenticated user
+
Authorized host identity
+
Correct Community Session
```

A normal patient must not be able to call host endpoints simply by guessing URLs.

---

# 20. HOST CONTROL ENDPOINTS

Potential endpoints:

```http
POST /api/v1/community/sessions/:sessionId/meeting/start
POST /api/v1/community/sessions/:sessionId/meeting/end
POST /api/v1/community/sessions/:sessionId/meeting/participants/:participantId/remove
```

Follow existing route conventions.

Only implement supported controls.

---

# 21. START MEETING

Verify:

```text
Meeting exists
+
Not cancelled
+
Requester is host/admin
+
Within allowed time window
```

Transition:

```text
READY → LIVE
```

or the lifecycle defined by DATABASE.md.

Do not allow:

```text
ENDED → LIVE
```

---

# 22. END MEETING

Ending should:

```text
Verify host/admin
        ↓
End provider meeting where applicable
        ↓
Mark meeting ENDED
        ↓
Record endedAt
        ↓
Finalize attendance
```

Normal patients must not end the meeting.

---

# 23. MEETING TIME WINDOW

Joining should be restricted to a sensible event window.

For example:

```text
Scheduled start
       ↓
Join window
       ↓
Meeting
       ↓
End
```

Follow PROJECT_SPEC.md if it defines a window.

If not:

1. Choose a reasonable configurable value.
2. Document the assumption.
3. Test it.

Do not hardcode unexplained behavior.

---

# 24. ATTENDANCE

Track actual attendance separately from registration.

Important:

```text
REGISTERED ≠ ATTENDED
```

Potential attendance fields:

```text
meetingId
userId
joinedAt
leftAt
duration
status
```

---

# 25. ATTENDANCE HISTORY

Provide an appropriate endpoint for authorized users/admins.

Example:

```http
GET /api/v1/community/sessions/:sessionId/meeting/attendance
```

Normal patients should not receive a complete attendance list unless explicitly required.

---

# 26. PARTICIPANT LIST

For normal patients, return only information needed for the meeting experience.

Potentially:

```text
displayName
participant status
```

Do NOT expose:

```text
email
phone
private profile information
```

unless explicitly required.

---

# 27. WEBHOOKS

If the selected provider supports webhooks, consider using them for:

```text
Participant joined
Participant left
Meeting started
Meeting ended
```

Webhook handling must include:

```text
Signature verification
Event validation
Idempotency
Safe processing
```

Never accept unsigned provider events blindly.

---

# 28. WEBHOOK IDEMPOTENCY

Provider events can arrive multiple times.

Example:

```text
EVENT 123
EVENT 123 again
```

Do not create duplicate attendance records.

Use provider event IDs or equivalent idempotency keys.

---

# 29. MEETING HISTORY

Implement an endpoint such as:

```http
GET /api/v1/community/sessions/:sessionId/meeting
```

Return appropriate information:

```text
meeting type
status
scheduled time
started time
ended time
```

Do not expose private provider metadata.

---

# 30. PATIENT MEETING HISTORY

If required:

```http
GET /api/v1/community/meetings/history
```

Patients should see meetings they registered for or attended.

Caregiver access must follow B3/B7 authorization rules.

---

# 31. REVOKED REGISTRATION

If a patient cancels registration:

```text
Registration = CANCELLED
```

They must not receive a new meeting token.

If access is revoked during a live meeting, follow the product/provider policy and document the chosen behavior.

---

# 32. CANCELLED SESSION

If B7 marks a Community Session:

```text
CANCELLED
```

then:

```text
Meeting cannot start
New joins rejected
New registrations rejected
```

Preserve historical meeting data when applicable.

---

# 33. EXPIRED MEETINGS

Meetings that never start after their scheduled window may become:

```text
EXPIRED
```

if required.

Do not leave stale scheduled meetings indefinitely.

Use cleanup only if required by the architecture.

---

# 34. CLEANUP JOBS

If background jobs are needed:

- Reuse existing job infrastructure.
- Make jobs idempotent.
- Do not create duplicate worker systems.
- Do not delete historical attendance.
- Only transition eligible records.

---

# 35. PROVIDER FAILURE

Safely handle:

```text
Provider unavailable
Provider timeout
Invalid provider response
Token generation failure
Meeting creation failure
Meeting start failure
Meeting end failure
```

Do not expose provider internals to users.

Do not mark a meeting LIVE if provider start failed.

---

# 36. RETRY STRATEGY

Only retry provider operations when safe.

For example:

```text
createMeeting
endMeeting
```

should use idempotency where supported.

Do not blindly retry operations that could create duplicate provider meetings.

---

# 37. AUTHORIZATION MATRIX

Test:

```text
Registered patient
   ↓
Join scheduled meeting
✓

Unregistered patient
   ↓
Join
✗

Cancelled registration
   ↓
Join
✗

Unrelated patient
   ↓
Join
✗

Host
   ↓
Start
✓

Host
   ↓
End
✓

Normal patient
   ↓
End
✗

Admin
   ↓
Manage according to policy
✓

Revoked caregiver
   ↓
Meeting access
✗
```

---

# 38. VOICE / VIDEO

Support:

```text
VIDEO
VOICE
```

through the provider abstraction.

Do not create two unrelated meeting architectures.

The mode should come from the Community Session configuration.

---

# 39. ACCESSIBILITY PREPARATION

Expose clean meeting metadata so the future frontend can display:

```text
Meeting type
Host
Scheduled time
Join status
Meeting state
```

Do not build accessibility UI in B8.

Frontend will later handle:

```text
Large controls
Minimal text
Voice assistance
Regional languages
```

---

# 40. PRIVACY

Protect:

```text
Participant identity
Attendance
Meeting credentials
Provider IDs
Meeting history
```

Do not expose unnecessary participant information.

---

# 41. LOGGING

Do not log:

```text
Provider access tokens
API secrets
Meeting tokens
Private participant information
```

Safe operational logs may contain:

```text
internal meeting ID
event type
timestamp
success/failure
```

---

# 42. RATE LIMITING

Where the existing infrastructure supports it, protect:

```text
/join
/start
/end
/token
```

against abuse.

Do not allow repeated token generation to become an attack vector.

Reuse existing rate-limiting infrastructure.

---

# 43. VALIDATION

Validate:

```text
sessionId
meetingId
participantId
meetingType
provider
meeting status
```

Reject:

```text
Invalid ObjectId
Invalid meeting type
Invalid provider
Invalid state transition
Unauthorized participant
Invalid host
Expired meeting
Cancelled session
```

---

# 44. INDEXING

Follow DATABASE.md.

Potential indexes:

```text
Meeting:
communitySessionId
status + scheduledAt
providerMeetingId

MeetingParticipant:
meetingId + userId
meetingId + status
userId + joinedAt

MeetingAttendance:
meetingId + userId
userId + joinedAt

WebhookEvent:
providerEventId
```

Only create indexes appropriate to the final schema and actual queries.

---

# 45. API RESPONSE FORMAT

Continue using the existing response format.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to join this meeting"
  }
}
```

Never expose raw provider errors.

---

# 46. TESTING

Create comprehensive tests.

## Meeting Creation

```text
✓ approved session can create meeting
✓ unapproved session rejected
✓ cancelled session rejected
✓ duplicate meeting creation handled
✓ invalid meeting type rejected
```

## Joining

```text
✓ registered patient can join
✓ unregistered patient rejected
✓ cancelled registration rejected
✓ unrelated patient rejected
✓ valid token returned
✓ token scoped correctly
```

## Host

```text
✓ host can start
✓ host can end
✓ patient cannot start
✓ patient cannot end
✓ unauthorized host rejected
```

## Participant

```text
✓ participant join recorded
✓ participant leave recorded
✓ duplicate join handled
✓ duplicate leave handled
✓ participant removal protected
```

## Capacity

```text
✓ capacity enforced
✓ concurrent joins cannot exceed capacity
```

## Lifecycle

```text
✓ scheduled → ready
✓ ready → live
✓ live → ended
✓ cancelled meeting cannot start
✓ ended meeting cannot restart
```

## Webhooks

If implemented:

```text
✓ valid signature accepted
✓ invalid signature rejected
✓ duplicate event ignored
✓ malformed event rejected
```

---

# 47. END-TO-END TEST

Create:

```text
Admin
  ↓
B7 scheduled Community Session
  ↓
Meeting created
  ↓
Patient pre-registers
  ↓
Host starts meeting
  ↓
Patient joins
  ↓
Attendance recorded
  ↓
Patient leaves
  ↓
Host ends meeting
  ↓
Meeting becomes ENDED
  ↓
Attendance history available
```

Also test:

```text
Unregistered patient
       ↓
Attempts join
       ↓
Rejected
```

---

# 48. NO NOTIFICATIONS

Do NOT implement:

```text
Push notifications
Email
SMS
Notification center
```

B9 handles notifications.

B8 should expose lifecycle events/data that B9 can later consume.

Potential future events:

```text
MeetingScheduled
MeetingStarted
MeetingCancelled
MeetingEnded
ParticipantJoined
```

Do not implement notification delivery.

---

# 49. NO AI

Do NOT implement:

```text
AI transcription
AI summaries
AI moderation
AI conversation analysis
AI recommendations
LLM integration
```

AI belongs to B11.

---

# 50. NO FRONTEND

Do NOT implement:

```text
React meeting UI
Video UI
Voice UI
Mobile meeting UI
```

B8 is backend infrastructure.

---

# 51. NO SAFETY FEATURES

Do NOT implement:

```text
GPS
Geofencing
SOS
Fall Detection
Safety alerts
Mobile safety app
```

Those belong to B12/B13.

---

# 52. DOCUMENTATION

If B8 changes:

```text
Meeting schema
Participant schema
Attendance schema
Provider integration
Meeting lifecycle
API contracts
Permissions
Webhook architecture
```

update the appropriate documentation.

Do not silently change DATABASE.md.

If DATABASE.md conflicts with implementation:

STOP and report the conflict.

---

# 53. DO NOT REWRITE B0-B7

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
Reminder models
Community Session models
Voting
Registration
```

unless a genuine defect blocks B8.

If a defect is found:

1. Explain it.
2. Make the smallest safe fix.
3. Add a regression test.
4. Mention it in the final report.

---

# 54. CODE ORGANIZATION

Follow existing modular architecture.

Recommended if consistent with the repository:

```text
server/src/modules/meetings/
├── meeting.model.js
├── meetingParticipant.model.js
├── meetingAttendance.model.js
├── meeting.controller.js
├── meeting.service.js
├── meeting.provider.js
├── meetingProvider.adapter.js
├── meeting.validation.js
├── meeting.routes.js
├── meeting.webhook.js
└── meeting.test.js
```

If DATABASE.md or repository conventions use another structure, follow them.

Do not create duplicate models.

---

# 55. PROVIDER SELECTION

Before implementing a real provider:

1. Inspect PROJECT_SPEC.md.
2. Inspect environment configuration.
3. Determine whether a provider has already been selected.
4. Reuse an existing provider integration if present.

If no provider is selected:

- Implement provider abstraction.
- Implement a mock/fake provider for tests.
- Document the production provider decision as pending.

Do not randomly hardcode a provider.

---

# 56. MOCK PROVIDER

For tests, create a mock provider if needed.

It should support:

```text
createMeeting
createParticipantToken
startMeeting
endMeeting
removeParticipant
```

Tests must not require external network calls or production credentials.

---

# 57. ENVIRONMENT VARIABLES

If a provider is configured, document required variables using the project's actual names.

Example:

```text
MEETING_PROVIDER=
MEETING_PROVIDER_API_KEY=
MEETING_PROVIDER_SECRET=
```

Never hardcode credentials.

Never commit `.env` secrets.

---

# 58. FINAL VERIFICATION

Run:

```bash
npm test
npm run lint
npm run format:check
```

If a build command exists, run it.

Verify:

```text
B7 scheduled event
       ↓
Meeting creation
       ↓
Authorized join
       ↓
Host start
       ↓
Participant attendance
       ↓
Participant leave
       ↓
Host end
       ↓
Meeting history
```

Verify:

```text
Unauthorized users rejected
Unregistered patients rejected
Cancelled registrations rejected
Capacity protected
Provider credentials protected
Duplicate events handled
```

---

# 59. FINAL REPORT

Return:

```text
B8 MEMORA MEETING CIRCLE REPORT

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

Meeting lifecycle:
-

Meeting provider:
-

Provider abstraction:
-

Token strategy:
-

Join strategy:
-

Leave strategy:
-

Host controls:
-

Participant management:
-

Attendance:
-

Capacity:
-

Concurrency protection:
-

Webhook handling:
-

Authorization:
-

Privacy/security:
-

Validation:
-

Indexes:
-

Cleanup:
-

Tests:
-

Security tests:
-

Concurrency tests:
-

Provider tests:
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

Do NOT proceed to B9.

---

# 60. B8 DEFINITION OF DONE

B8 is complete only when:

[ ] Meeting model implemented according to DATABASE.md
[ ] Meeting participant model implemented if required
[ ] Attendance model implemented if required
[ ] Community Session ↔ Meeting relationship implemented
[ ] Meeting lifecycle implemented
[ ] VIDEO/VOICE support implemented
[ ] Provider abstraction implemented
[ ] Mock provider available for tests
[ ] Production provider integrated only if already selected/configured
[ ] Meeting creation protected
[ ] Patient join authorization implemented
[ ] Registration status verified before joining
[ ] Cancelled registration rejected
[ ] Host authorization implemented
[ ] Host start implemented
[ ] Host end implemented
[ ] Participant join recorded
[ ] Participant leave recorded
[ ] Attendance tracking implemented
[ ] Meeting history implemented
[ ] Participant capacity enforced
[ ] Concurrent joins handled safely
[ ] Duplicate joins handled
[ ] Duplicate webhook events handled if webhooks are used
[ ] Provider tokens are short-lived/scoped where supported
[ ] Provider credentials remain server-side
[ ] Meeting credentials never exposed to unauthorized users
[ ] Cancelled sessions cannot start
[ ] Ended meetings cannot restart
[ ] Cleanup/expiration handled where required
[ ] Provider failures handled safely
[ ] Validation implemented
[ ] Required indexes implemented
[ ] Privacy protections implemented
[ ] Rate limiting reused/implemented where appropriate
[ ] Tests cover meeting lifecycle
[ ] Tests cover authorization
[ ] Tests cover registration
[ ] Tests cover capacity
[ ] Tests cover concurrency
[ ] Tests cover provider abstraction
[ ] All tests pass
[ ] Lint passes
[ ] Formatting passes
[ ] Documentation remains consistent
[ ] No notification delivery implemented
[ ] No AI implemented
[ ] No frontend/mobile implementation
[ ] No safety features implemented
[ ] No unrelated features implemented

Only after all applicable items pass should B8 be considered complete.

---

# 61. STOP CONDITION

After B8 is complete:

**STOP.**

Do not begin B9.

The next phase will be:

```text
B9 - Notifications
```

B9 will build Memora's centralized notification system for reminders, Community Sessions, Meeting Circle events, caregiver notifications, and later safety alerts.
