# Memora - Phase B7 Prompt: Community Sessions

**Phase:** B7  
**Name:** Community Sessions - Voting, Approval, Scheduling & Pre-Registration  
**Prerequisites:** B0-B6 completed  
**Status:** Ready for implementation

---

# Objective

Implement Memora's backend Community Sessions system.

The Community Sessions feature allows administrators to propose upcoming session ideas, patients to vote on those ideas, administrators to review voting results and approve a session, and patients to pre-register for officially scheduled events.

The core workflow is:

```text
ADMIN
  ↓
Creates Session Ideas
  ↓
🗳️ VOTING SECTION
  ↓
Patients Vote
  ↓
Admin Reviews Results
  ↓
Admin Approves Session
  ↓
Adds Date + Time + Host + Guest + Capacity
  ↓
📅 SCHEDULE SECTION
  ↓
Patients Pre-Register
  ↓
EVENT DAY
  ↓
Voice / Video Session
```

B7 is backend only.

The frontend will consume these APIs later.

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

# 2. B7 SCOPE

Implement:

- Community session ideas
- Voting section
- Patient voting
- Vote uniqueness
- Vote totals
- Admin voting management
- Session approval
- Scheduled community events
- Date/time
- Duration
- Host
- Featured guest/person
- Guest image
- Session description
- Participant capacity
- Meeting type
- Registration status
- Patient pre-registration
- Registration cancellation where appropriate
- Participant count
- Registration capacity enforcement
- Session lifecycle
- Authorization
- Admin access control
- Patient access control
- Caregiver access where explicitly required
- Pagination/filtering
- Validation
- Concurrency protection
- Tests
- Security tests

Do NOT implement:

```text
Video calling infrastructure
Voice calling infrastructure
WebRTC
Meeting rooms
Meeting Circle
Push notifications
Email notifications
SMS
AI
AI-generated sessions
Geolocation
Geofencing
SOS
Fall Detection
Mobile App
```

Meeting infrastructure belongs to B8.

Notification delivery belongs to B9.

---

# 3. CORE PRODUCT RULE

There are TWO clearly different sections:

```text
🗳️ VOTING
```

and:

```text
📅 SCHEDULE
```

Voting contains:

```text
Upcoming session ideas
that have NOT been approved/scheduled yet
```

Schedule contains:

```text
Officially approved and scheduled events
```

Once an administrator approves an idea and schedules it:

```text
Voting
   ↓
removed from active voting
   ↓
Schedule
```

Do not display the same session as both an active voting option and a scheduled event.

---

# 4. SESSION LIFECYCLE

Use a clear lifecycle.

Conceptually:

```text
DRAFT
  ↓
VOTING
  ↓
APPROVED
  ↓
SCHEDULED
  ↓
REGISTRATION_OPEN
  ↓
REGISTRATION_CLOSED
  ↓
COMPLETED
```

Possible cancellation:

```text
VOTING → CANCELLED
APPROVED → CANCELLED
SCHEDULED → CANCELLED
REGISTRATION_OPEN → CANCELLED
```

Follow DATABASE.md if exact states are already defined.

Do not create multiple competing status fields.

---

# 5. SESSION TYPES

If DATABASE.md defines session types, follow it.

If not, keep the first implementation flexible enough to support:

```text
MUSIC
STORY_SHARING
ART
EXERCISE
MEMORY
EDUCATIONAL
SOCIAL
OTHER
```

Do not over-engineer categories.

---

# 6. SESSION IDEA MODEL

Implement the session idea/voting representation according to DATABASE.md.

Potential fields:

```text
title
description
sessionType
status
createdBy
voteCount
votingStartsAt
votingEndsAt
createdAt
updatedAt
```

If votes are stored in a separate collection, maintain a relationship such as:

```text
SessionIdea
   ↓
Votes
```

Do not store unbounded patient IDs directly inside a single session document if the voting design requires scalable vote records.

---

# 7. VOTING MODEL

If DATABASE.md defines a separate vote model, use it.

A vote should conceptually contain:

```text
sessionIdeaId
patientId
createdAt
updatedAt
```

The critical rule:

```text
One patient
+
one session idea
=
maximum one active vote
```

Enforce this at the database level where practical.

Do not rely only on frontend button state.

---

# 8. VOTING WORKFLOW

Admin:

```text
POST /api/v1/community/sessions/ideas
```

Patients:

```text
GET /api/v1/community/sessions/voting
```

Patient votes:

```text
POST /api/v1/community/sessions/ideas/:ideaId/vote
```

Patient may remove/change their vote only if the product specification allows it.

Possible:

```text
DELETE /api/v1/community/sessions/ideas/:ideaId/vote
```

or an equivalent endpoint.

Follow existing API conventions.

---

# 9. VOTE COUNTING

The backend must provide reliable vote totals.

Example:

```text
🎵 Music & Memory
Interested: 42 patients
```

The count must be derived from authoritative vote data.

Do not trust:

```json
{
  "voteCount": 42
}
```

sent by the client.

If a cached/denormalized counter is used:

- Keep it synchronized.
- Protect it against race conditions.
- Have a way to reconcile it with actual votes.

---

# 10. VOTING RESTRICTIONS

Patients may vote only when:

```text
Authenticated
+
Patient account
+
Session idea is active for voting
+
Voting period is open
```

Reject:

```text
Inactive idea
Scheduled idea
Completed idea
Cancelled idea
Expired voting period
```

with an appropriate error.

---

# 11. DUPLICATE VOTES

A patient must not be able to create multiple votes for the same idea.

Test:

```text
Patient A
   ↓
Vote for Music
   ↓
Vote again
   ↓
Must not create second vote
```

Use a database uniqueness constraint such as:

```text
unique(sessionIdeaId, patientId)
```

where appropriate.

---

# 12. CHANGING A VOTE

If vote changes are allowed by PROJECT_SPEC.md:

```text
Patient
   ↓
Current vote
   ↓
Change/remove vote
```

Implement safely.

If the specification does not require vote changes:

```text
One vote
+
No changes after submission
```

Document the chosen behavior.

Do not invent complicated vote-ranking systems.

---

# 13. VOTING DEADLINE

If voting has:

```text
votingStartsAt
votingEndsAt
```

the backend must enforce them.

Do not rely on frontend hiding the vote button.

Example:

```text
Current time > votingEndsAt
        ↓
403 / 409
```

according to existing error conventions.

Use timezone-aware timestamps.

---

# 14. ADMIN VOTING MANAGEMENT

Only authorized admins may:

```text
Create voting options
Edit voting options
Close voting
Cancel voting
Approve an option
View detailed voting results
```

Patients must NOT be able to:

```text
Create session ideas
Approve sessions
Modify vote totals
Schedule events
```

---

# 15. ADMIN VOTE RESULTS

Provide an admin endpoint such as:

```http
GET /api/v1/admin/community/sessions/voting/results
```

or follow the project's existing admin route convention.

Admin should be able to see:

```text
Session idea
Vote count
Voting status
Voting start/end
```

Avoid exposing unnecessary patient identity information.

A simple aggregate count is preferred unless individual voter information is explicitly required.

---

# 16. APPROVAL WORKFLOW

After voting:

```text
Admin reviews results
        ↓
Selects / approves session
        ↓
Session moves out of voting
        ↓
Admin schedules event
```

The approval operation must be protected.

Potential endpoint:

```http
POST /api/v1/admin/community/sessions/ideas/:ideaId/approve
```

Follow repository conventions.

---

# 17. APPROVAL RULES

Only an appropriate session idea can be approved.

Reject approval when:

```text
Already approved
Already scheduled
Completed
Cancelled
Invalid state
```

Do not allow:

```text
COMPLETED → APPROVED
```

or:

```text
CANCELLED → SCHEDULED
```

unless the product specification explicitly supports reopening.

---

# 18. SCHEDULED EVENT

Once approved, the admin must provide:

```text
Date
Time
Duration
Host
Featured person
Featured image
Description
Maximum participants
Meeting type
Registration status
```

Example:

```text
🎵 MUSIC & MEMORY

📅 15 September 2026
⏰ 5:00 PM - 6:00 PM

Featuring:
Dr. Priya Sharma

Dementia Therapist

"Exploring memories through music."

👥 12 / 20 Registered
```

---

# 19. HOST / FEATURED PERSON

Support the concept of:

```text
Host
```

and:

```text
Featured Guest / Person
```

They may be different people.

Examples:

```text
Doctor
Therapist
Psychologist
Caregiver expert
Researcher
Guest speaker
```

Follow DATABASE.md.

Do not automatically create application users for every featured guest.

A guest profile may simply be descriptive event information.

---

# 20. FEATURED PERSON IMAGE

If an image is supported:

```text
featuredPersonName
featuredPersonRole
featuredPersonImageUrl
```

Use the existing media-storage infrastructure if available.

Do not create a second media provider.

Protect private media where required.

---

# 21. MEETING TYPE

Store the intended meeting type.

Recommended controlled values:

```text
VIDEO
VOICE
```

Do NOT build the actual meeting technology in B7.

B8 will handle:

```text
Meeting Circle
Voice
Video
Rooms
Participants
```

B7 only stores the event's intended format.

---

# 22. PARTICIPANT CAPACITY

Each scheduled event may have:

```text
maxParticipants
```

Example:

```text
Maximum participants: 20
Registered: 12
```

The backend must enforce capacity.

Do not trust:

```text
registeredCount
```

from the client.

---

# 23. PRE-REGISTRATION

Implement:

```http
POST /api/v1/community/sessions/:sessionId/register
```

The authenticated patient can pre-register for an eligible scheduled event.

Flow:

```text
Authenticate
   ↓
Verify patient
   ↓
Verify event is scheduled
   ↓
Verify registration is open
   ↓
Verify capacity
   ↓
Create registration
```

---

# 24. REGISTRATION MODEL

If DATABASE.md defines a separate registration model, use it.

Potential fields:

```text
sessionId
patientId
status
registeredAt
cancelledAt
createdAt
updatedAt
```

Use controlled registration statuses if needed:

```text
REGISTERED
CANCELLED
ATTENDED
NO_SHOW
```

Follow DATABASE.md.

---

# 25. DUPLICATE REGISTRATION

A patient cannot register twice for the same event.

Enforce:

```text
unique(sessionId, patientId)
```

or an equivalent database strategy.

Test:

```text
Patient A
   ↓
Register
   ↓
Register again
   ↓
Must not create duplicate registration
```

---

# 26. CAPACITY RACE CONDITION

Protect against:

```text
19 / 20 registered

Request A → register
Request B → register
```

Both requests must not successfully exceed capacity.

Use an atomic/database-safe strategy.

Do NOT simply:

```text
if count < max:
    create registration
```

without considering concurrent requests.

---

# 27. REGISTRATION CANCELLATION

If supported:

```http
DELETE /api/v1/community/sessions/:sessionId/register
```

or an equivalent endpoint.

Cancellation should:

```text
Mark registration cancelled
```

rather than unnecessarily destroying historical participation data if history is needed.

A cancelled registration may free capacity according to the product rules.

---

# 28. REGISTRATION CLOSURE

Registration may close because:

```text
Capacity reached
Registration deadline passed
Event started
Event cancelled
Admin manually closed registration
```

The backend must enforce these states.

Do not depend on frontend controls.

---

# 29. SCHEDULE API

Patients should be able to retrieve official upcoming events.

Implement something such as:

```http
GET /api/v1/community/sessions/schedule
```

Return:

```text
title
description
date
time
duration
host
featured person
image
meeting type
registration status
participant count
capacity
```

Do not expose private admin metadata.

---

# 30. SESSION DETAILS

Implement:

```http
GET /api/v1/community/sessions/:sessionId
```

The endpoint must return only information appropriate for the authenticated requester.

Patient-facing information should be simple and useful.

---

# 31. PATIENT REGISTRATION STATUS

A patient should be able to determine:

```text
Registered
Not registered
Cancelled
```

without exposing the registrations of other patients.

For example:

```json
{
  "registered": true
}
```

or an equivalent field in the session response.

---

# 32. PARTICIPANT LIST

Do NOT expose the full participant list to every patient by default.

If a participant list is needed later, implement a restricted endpoint.

For B7:

```text
Participant count
```

is sufficient for normal patient-facing schedule responses.

Admin may access participant information according to the product specification.

---

# 33. CAREGIVER ACCESS

Caregiver access should only be implemented if PROJECT_SPEC.md requires it.

If caregivers need to register/manage participation for a patient:

```text
ACTIVE caregiver relationship
+
appropriate community permission
```

must be checked using B3 authorization.

Do not invent caregiver access rules that conflict with the project specification.

---

# 34. SESSION CAPACITY

Use an authoritative registration source.

Do not maintain multiple unrelated counters such as:

```text
registeredCount
participantsCount
activeRegistrations
```

unless each has a clearly different meaning.

Prefer:

```text
Registrations
   ↓
count / aggregation
```

or a carefully maintained denormalized count.

---

# 35. SESSION DATE/TIME

Store event timestamps consistently with the project's architecture.

Use timezone-aware scheduling.

If an event is:

```text
15 September 2026
5:00 PM
Asia/Kolkata
```

the backend must preserve that intended local time.

Do not manually calculate UTC offsets.

Use IANA timezone identifiers.

---

# 36. SESSION CONFLICTS

If the product specification requires prevention of overlapping events, implement it for the relevant host/resource.

Do not over-engineer global scheduling conflicts unless required.

If not required:

```text
Admin is responsible for selecting a valid schedule.
```

Document the assumption.

---

# 37. ADMIN EVENT MANAGEMENT

Admin should be able to:

```text
View voting options
View vote totals
Approve session
Schedule session
Update event details
Open/close registration
Cancel event
View registrations
```

Protect all admin endpoints.

Do not expose admin management endpoints to normal patients.

---

# 38. SESSION EDITING

Once patients have registered, changing critical fields requires care.

Potential critical fields:

```text
date
time
duration
host
meeting type
capacity
```

If editing a scheduled event:

- Validate the new values.
- Do not accidentally invalidate existing registrations.
- Do not reduce capacity below current registration count unless the project explicitly defines a process for handling that.
- Do not silently move a completed event.

---

# 39. CANCELLATION

Implement event cancellation if specified.

Cancellation should:

```text
Prevent new registrations
Prevent new voting if applicable
Preserve historical event information
Preserve registration history
```

Do not physically delete an event that already has registrations.

---

# 40. VALIDATION

Validate:

```text
title
description
sessionType
votingStartsAt
votingEndsAt
date
time
timezone
duration
host
featured person
image URL
maxParticipants
meetingType
registration state
```

Reject:

```text
Invalid ObjectId
Invalid enum
Invalid timezone
Negative duration
Zero/negative capacity
Voting end before voting start
Event date in an invalid state
Registration after closure
Invalid state transition
Oversized input
```

Do not rely on frontend validation.

---

# 41. PAGINATION

Paginate:

```text
Voting ideas
Schedule
Voting results
Registrations
```

Use the existing project pagination format.

Enforce a maximum page size.

Do not allow unbounded database reads.

---

# 42. FILTERING

Useful filters may include:

```text
sessionType
status
date range
meetingType
registration status
```

All filters must still respect authorization.

---

# 43. INDEXING

Follow DATABASE.md.

Likely useful indexes may include:

```text
SessionIdea:
status + votingEndsAt
createdAt

Vote:
sessionIdeaId + patientId
sessionIdeaId + createdAt

CommunitySession:
status + scheduledAt
scheduledAt
registrationStatus

Registration:
sessionId + patientId
sessionId + status
patientId + createdAt
```

Only add indexes based on actual query patterns and the final schema.

---

# 44. CONCURRENCY

Protect:

```text
Voting
Registration
Capacity
Approval
Cancellation
```

Most importantly:

```text
Duplicate votes
Duplicate registrations
Capacity overflow
Double approval
Invalid concurrent state transitions
```

Use atomic/database-level operations where appropriate.

---

# 45. AUTHORIZATION MATRIX

Test:

```text
PATIENT
  ↓
View voting ideas
✓

PATIENT
  ↓
Vote
✓

PATIENT
  ↓
Create session idea
✗

PATIENT
  ↓
Approve session
✗

PATIENT
  ↓
Schedule event
✗

PATIENT
  ↓
Pre-register
✓

ADMIN
  ↓
Create session idea
✓

ADMIN
  ↓
Approve
✓

ADMIN
  ↓
Schedule
✓

ADMIN
  ↓
Manage registrations
✓
```

Caregiver access must follow B3 relationship/permission rules if required.

---

# 46. SECURITY

Do not expose:

```text
Private patient information
Unnecessary voter identities
Authentication tokens
Passwords
Internal admin metadata
Database internals
```

Normal patients should see aggregate vote counts, not a list of who voted, unless explicitly required.

---

# 47. NOTIFICATIONS

Do NOT implement notification delivery in B7.

Do not add:

```text
Push notifications
Email
SMS
Firebase messaging
Notification center
```

B9 handles notifications.

B7 must expose enough event state for B9 to later notify:

```text
People who voted for an approved session
Registered participants
Session host
```

---

# 48. SPECIAL NOTIFICATION REQUIREMENT FOR FUTURE B9

When an event is approved/scheduled, the system should preserve enough information to later identify:

```text
Patients who voted for that session idea
```

This enables B9 to notify those interested patients.

Do not send the notifications in B7.

---

# 49. NO MEETING TECHNOLOGY

Do NOT implement:

```text
WebRTC
Video rooms
Audio rooms
Meeting tokens
Streaming
Participant media
```

B8 handles Meeting Circle.

B7 only stores:

```text
VIDEO
VOICE
```

as the event's meeting type.

---

# 50. NO AI

Do NOT implement:

```text
AI-generated session ideas
AI voting recommendations
AI summaries
LLM integration
AI speaker recommendations
```

B11 handles AI.

---

# 51. NO MOBILE

Do NOT implement:

```text
Mobile app
GPS
Geofencing
SOS
Fall detection
```

B12/B13 handle safety and mobile functionality.

---

# 52. TESTING

Create comprehensive tests.

## Session Idea

```text
✓ admin creates idea
✓ valid idea stored
✓ invalid type rejected
✓ unauthorized user cannot create
✓ idea enters correct voting state
```

## Voting

```text
✓ patient can view voting ideas
✓ patient can vote
✓ duplicate vote rejected/handled
✓ vote count correct
✓ inactive idea cannot receive vote
✓ expired voting cannot receive vote
✓ unauthorized voter rejected
```

## Approval

```text
✓ admin can approve
✓ patient cannot approve
✓ invalid state cannot be approved
✓ approved idea leaves active voting
```

## Scheduling

```text
✓ admin can schedule approved idea
✓ required fields validated
✓ invalid capacity rejected
✓ invalid timezone rejected
✓ invalid meeting type rejected
✓ patient cannot schedule
```

## Registration

```text
✓ patient can pre-register
✓ duplicate registration prevented
✓ capacity enforced
✓ registration closure enforced
✓ cancelled event rejects registration
✓ patient can cancel if supported
```

## Concurrency

```text
✓ concurrent registration cannot exceed capacity
✓ duplicate registration cannot occur
✓ duplicate vote cannot occur
✓ concurrent approval does not create invalid state
```

## Authorization

```text
✓ unrelated patient cannot access private admin operations
✓ caregiver rules enforced if applicable
✓ revoked caregiver rejected
✓ unauthenticated user rejected
```

---

# 53. END-TO-END TEST

Create a complete flow:

```text
Admin authenticates
       ↓
Creates:
"Music & Memory"
       ↓
Patients retrieve voting list
       ↓
Patient A votes
Patient B votes
Patient C votes
       ↓
Admin checks results
       ↓
Admin approves Music & Memory
       ↓
Admin schedules:
15 September 2026
5:00 PM
60 minutes
       ↓
Session appears in Schedule
       ↓
Patient A pre-registers
       ↓
Patient B pre-registers
       ↓
Capacity enforced
       ↓
Registration status available
```

Also test:

```text
Approved session
      ↓
Must no longer appear as active voting option
```

---

# 54. DATA INTEGRITY TEST

Verify:

```text
Vote count
=
authoritative votes
```

and:

```text
Registered count
=
active registrations
```

if counts are derived.

If counters are denormalized, verify synchronization.

---

# 55. DOCUMENTATION

If B7 changes:

```text
CommunitySession schema
SessionIdea schema
Vote schema
Registration schema
Status enums
API contracts
Permission requirements
Indexes
```

update the appropriate documentation.

Do not silently change DATABASE.md.

If DATABASE.md conflicts with implementation:

STOP and report the conflict.

---

# 56. DO NOT REWRITE B0-B6

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
Media infrastructure
```

unless a genuine defect blocks B7.

If a defect is found:

1. Explain it.
2. Make the smallest safe fix.
3. Add a regression test.
4. Mention it in the final report.

---

# 57. CODE ORGANIZATION

Follow the existing modular architecture.

Recommended if consistent with the repository:

```text
server/src/modules/community/
├── sessionIdea.model.js
├── vote.model.js
├── communitySession.model.js
├── registration.model.js
├── community.controller.js
├── community.service.js
├── community.validation.js
├── community.routes.js
└── community.test.js
```

If DATABASE.md uses a different structure, follow DATABASE.md.

Do not create duplicate models.

---

# 58. API SUMMARY

Potential patient endpoints:

```http
GET  /api/v1/community/sessions/voting
POST /api/v1/community/sessions/ideas/:ideaId/vote
DELETE /api/v1/community/sessions/ideas/:ideaId/vote
GET  /api/v1/community/sessions/schedule
GET  /api/v1/community/sessions/:sessionId
POST /api/v1/community/sessions/:sessionId/register
DELETE /api/v1/community/sessions/:sessionId/register
GET  /api/v1/community/sessions/registrations/me
```

Potential admin endpoints:

```http
POST  /api/v1/admin/community/sessions/ideas
PATCH /api/v1/admin/community/sessions/ideas/:ideaId
GET   /api/v1/admin/community/sessions/voting/results
POST  /api/v1/admin/community/sessions/ideas/:ideaId/approve

POST  /api/v1/admin/community/sessions/:sessionId/schedule
PATCH /api/v1/admin/community/sessions/:sessionId
POST  /api/v1/admin/community/sessions/:sessionId/cancel
POST  /api/v1/admin/community/sessions/:sessionId/registration/close
GET   /api/v1/admin/community/sessions/:sessionId/registrations
```

These are recommendations.

Follow the repository's route naming conventions and PROJECT_SPEC.md.

Do not create unnecessary duplicate endpoints.

---

# 59. API RESPONSE FORMAT

Continue using the existing format.

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
    "message": "You do not have permission to perform this action"
  }
}
```

Use the existing B0/B2 error infrastructure.

Do not expose raw MongoDB errors.

---

# 60. FINAL VERIFICATION

Run:

```bash
npm test
npm run lint
npm run format:check
```

If a build command exists, run it.

Verify:

```text
Admin can create voting ideas
Patients can see voting ideas
Patients can vote
Duplicate votes are prevented
Vote totals are correct

Admin can approve
Approved idea leaves voting
Admin can schedule
Scheduled event appears in schedule

Patient can pre-register
Duplicate registration prevented
Capacity enforced
Registration closure enforced

Unauthorized operations fail
Concurrent operations are safe
```

---

# 61. FINAL REPORT

Return:

```text
B7 COMMUNITY SESSIONS REPORT

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

Voting architecture:
-

Vote uniqueness:
-

Vote counting:
-

Approval workflow:
-

Session lifecycle:
-

Scheduling:
-

Featured guest:
-

Meeting type:
-

Registration:
-

Capacity enforcement:
-

Concurrency protection:
-

Authorization:
-

Caregiver access:
-

Validation:
-

Pagination:
-

Filtering:
-

Indexes:
-

Notification preparation:
-

Tests:
-

Security tests:
-

Concurrency tests:
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

Do NOT proceed to B8.

---

# 62. B7 DEFINITION OF DONE

B7 is complete only when:

[ ] Session idea model implemented according to DATABASE.md
[ ] Vote model implemented according to DATABASE.md
[ ] Community session/event model implemented according to DATABASE.md
[ ] Registration model implemented according to DATABASE.md
[ ] Voting section implemented
[ ] Patients can view active voting options
[ ] Patients can vote
[ ] Duplicate votes prevented
[ ] Vote totals are reliable
[ ] Voting deadlines enforced
[ ] Admin can create voting options
[ ] Admin can view voting results
[ ] Admin can approve session
[ ] Approved session leaves active voting
[ ] Scheduled event can be created
[ ] Date/time supported
[ ] Duration supported
[ ] Host supported
[ ] Featured person supported
[ ] Featured image supported where specified
[ ] Participant capacity supported
[ ] VIDEO/VOICE meeting type supported as data
[ ] Schedule endpoint implemented
[ ] Patient pre-registration implemented
[ ] Duplicate registration prevented
[ ] Capacity enforced atomically/safely
[ ] Registration closure enforced
[ ] Cancellation handled where specified
[ ] Patient registration status available
[ ] Participant count available
[ ] Admin registration access protected
[ ] Patient cannot perform admin operations
[ ] Caregiver access follows B3 if required
[ ] Pagination implemented
[ ] Filtering implemented
[ ] Required indexes implemented
[ ] Input validation implemented
[ ] Timezone-aware event scheduling implemented
[ ] Concurrent voting handled
[ ] Concurrent registration handled
[ ] Notification-relevant voter data preserved
[ ] No notification delivery implemented
[ ] No meeting technology implemented
[ ] No AI implemented
[ ] No mobile implementation
[ ] Tests cover voting
[ ] Tests cover approval
[ ] Tests cover scheduling
[ ] Tests cover registration
[ ] Tests cover authorization
[ ] Tests cover capacity/concurrency
[ ] All tests pass
[ ] Lint passes
[ ] Formatting passes
[ ] Documentation remains consistent
[ ] No unrelated features implemented

Only after all applicable items pass should B7 be considered complete.

---

# 63. STOP CONDITION

After B7 is complete:

**STOP.**

Do not begin B8.

The next phase will be:

```text
B8 - Memora Meeting Circle
```

B8 will implement the actual meeting/session infrastructure for approved Community Sessions, including meeting rooms, participants, host controls, voice/video integration, session lifecycle, and meeting access.
