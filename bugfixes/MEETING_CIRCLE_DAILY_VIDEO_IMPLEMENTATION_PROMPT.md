# Memora - Meeting Circle Video Calling Implementation Prompt

**Feature:** Meeting Circle  
**Video infrastructure:** Daily (managed video)  
**Maximum participants:** 6  
**Goal:** Replace any Meeting Circle scaffold with a real patient-created and discoverable small-group video calling system.

---

## 1. EXECUTIVE INSTRUCTION

Implement Meeting Circle end-to-end.

The finished feature must allow an authenticated patient to:

1. Create a Meeting Circle.
2. Set name and description.
3. Choose `DISCOVERABLE` or `INVITE_ONLY`.
4. Have a hard backend-enforced maximum of 6 participants.
5. View their own circles.
6. Discover available public circles.
7. Join authorized circles.
8. Enter a real Daily video call.
9. See actual participants.
10. Control microphone and camera.
11. Leave the call.
12. See accurate participant availability.
13. Prevent a seventh participant from joining.
14. Report participants where supported.
15. Manage their own circle according to backend authorization.

**Do NOT build a fake video-call UI.**

Do not use mock participants, fake participant counts, fake room URLs, or local `<video>` elements as a substitute for real calling.

---

## 2. READ THE REPOSITORY FIRST

Read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/FRONTEND_ARCHITECTURE.md
docs/FRONTEND_API_CONTRACT.md
docs/F15_V2_FULL_INTEGRATION_REPORT.md
docs/F16_ACCESSIBILITY_LOCALIZATION_REPORT.md
```

Then inspect the actual repository for:

```text
MeetingCircle
Meeting Circle
meeting
video
WebRTC
Daily
daily-js
daily-react
room
participant
community
session
notification
realtime
```

Also inspect existing:

```text
User model
Authentication
Authorization middleware
Community/session models
Participant models
Notification system
Realtime system
Frontend routing
API client
State management
```

**Existing repository code is authoritative.**

Do not create duplicate models or services if equivalent infrastructure already exists.

---

## 3. PRODUCT MODEL

Meeting Circle has two types of experience:

### A. My Circles

Patient-created circles.

Example:

```text
My Friends Circle
3 / 6 participants
[Join]
[Manage]
```

### B. Discover Circles

Discoverable circles that patients can browse and join.

Example:

```text
Morning Talk
4 / 6
OPEN
[Join Circle]
```

This must coexist with the existing scheduled community-session/voting system. Do not delete or replace that system.

---

## 4. REMOVE THE CURRENT SCAFFOLD

If Meeting Circle currently contains text such as:

```text
Module Scaffold Foundation
foundational layout scaffold
Coming Soon
Placeholder
TODO
Mock
Dummy
```

treat the feature as incomplete.

Replace the scaffold with the real feature.

Do not merely hide the text or replace it with decorative cards.

---

## 5. MEETING CIRCLE PAGE

Create the real page:

```text
Meeting Circle

Connect with people through small group video conversations.

[ + Create Meeting Circle ]

MY CIRCLES
-----------------------------
[Circle cards]

DISCOVER CIRCLES
-----------------------------
[Discoverable circle cards]
```

Each card should use actual backend data.

---

## 6. CREATE CIRCLE

Create a real form:

```text
Circle Name
Description

Visibility:
○ Discoverable
○ Invite only

Maximum participants:
6
```

The user must NOT be able to change the maximum.

Backend must always enforce:

```text
maxParticipants = 6
```

---

## 7. CREATE FLOW

Implement:

```text
Patient
 ↓
Create form
 ↓
Frontend validation
 ↓
Backend API
 ↓
Authentication
 ↓
Authorization
 ↓
Input validation
 ↓
Create circle
 ↓
Set authenticated user as creator
 ↓
Set maxParticipants = 6
 ↓
Create/associate Daily room as appropriate
 ↓
Return circle
 ↓
Update frontend
```

Do not trust `creatorId` sent by the frontend. Derive ownership from the authenticated session.

---

## 8. DAILY ARCHITECTURE

Use Daily for actual managed video infrastructure.

Responsibilities:

### Memora backend

```text
Authentication
Authorization
Circle ownership
Visibility
Membership
Participant policy
6-person capacity
Daily access authorization
```

### Daily

```text
Video/audio transport
WebRTC
Camera
Microphone
Participant media
Connection handling
```

Architecture:

```text
Patient
 ↓
Memora Frontend
 ↓
Memora Backend
 ↓
Authorization + capacity check
 ↓
Daily room/access
 ↓
Real video call
```

Do not build your own WebRTC signaling/TURN infrastructure for this feature.

---

## 9. DAILY SECURITY

Daily API credentials must remain server-side.

Never expose privileged Daily credentials in:

```text
React source
Vite client environment
localStorage
sessionStorage
URLs
Git
browser bundles
```

Use backend-generated room access/tokens according to the current Daily documentation.

Do not guess Daily API fields or endpoints. Inspect the current Daily documentation or installed SDK/API version before implementation.

---

## 10. ENVIRONMENT

Use the repository's existing environment-variable conventions.

Conceptually:

```text
DAILY_API_KEY=
DAILY_DOMAIN=
```

Add placeholders to:

```text
.env.example
```

Never commit real values.

---

## 11. ROOM LIFECYCLE

Inspect the existing architecture and choose the cleanest approach:

```text
Create Daily room when circle is created
```

or:

```text
Create room lazily on first join
```

The Memora Meeting Circle remains the source of truth.

Store the provider room identifier using the existing database architecture.

Do not create duplicate room models if one already exists.

---

## 12. DATABASE

Inspect existing schemas first.

Conceptually the circle requires:

```text
_id
name
description
creator
visibility
maxParticipants = 6
status
provider
providerRoomId
createdAt
updatedAt
```

If participant membership requires a separate model, reuse an existing participant model where possible.

Potential fields:

```text
circleId
userId
role
status
joinedAt
leftAt
```

Do not blindly add these fields if equivalent fields already exist.

---

## 13. DISCOVERY

Create/reuse an API that returns active discoverable circles.

Conceptually:

```text
GET /meeting-circles/discover
```

Do not assume this exact path if the project has an existing API convention.

Discovery cards should show:

```text
Name
Description
Participant count
Maximum capacity
Availability
Status
```

Do not expose private member information.

---

## 14. MY CIRCLES

Create/reuse an API for circles owned by or associated with the authenticated patient.

Conceptually:

```text
GET /meeting-circles/mine
```

Only return circles the current user is authorized to see.

---

## 15. HARD 6-PERSON LIMIT

This is a critical backend requirement.

Join flow:

```text
Join request
 ↓
Authenticate
 ↓
Authorize
 ↓
Check circle exists
 ↓
Check membership/invitation
 ↓
Check capacity
 ↓
If >= 6 → reject
 ↓
Else → authorize Daily access
```

The frontend must never be the only capacity enforcement layer.

---

## 16. CONCURRENT JOIN PROTECTION

Explicitly test:

```text
Current = 5 / 6

User A attempts join
User B attempts join
```

Only one additional slot may be accepted.

Final participant capacity must never become 7.

Use the appropriate atomic/transaction-safe mechanism for the project's database.

---

## 17. JOIN FLOW

Implement:

```text
Patient clicks Join
 ↓
Frontend requests join authorization
 ↓
Backend authenticates
 ↓
Backend checks visibility/membership
 ↓
Backend checks six-person capacity
 ↓
Backend generates/returns authorized Daily access
 ↓
Frontend joins Daily
 ↓
Actual video call opens
```

Do not let arbitrary users directly join a Daily room URL without Memora authorization.

---

## 18. INVITE-ONLY CIRCLES

For invite-only circles:

```text
Not invited
 ↓
Reject
```

Do not rely on simply hiding the circle from discovery.

The backend must enforce membership.

---

## 19. VIDEO CALL UI

Implement an actual call page.

Conceptually:

```text
┌───────────────────────────────────────┐
│ Morning Talk                    4 / 6│
│                                       │
│ ┌────────┐ ┌────────┐ ┌────────┐    │
│ │ Person │ │ Person │ │ Person │    │
│ │ VIDEO  │ │ VIDEO  │ │ VIDEO  │    │
│ └────────┘ └────────┘ └────────┘    │
│                                       │
│ ┌────────┐ ┌────────┐ ┌────────┐    │
│ │ Person │ │  YOU   │ │ Person │    │
│ │ VIDEO  │ │ VIDEO  │ │ VIDEO  │    │
│ └────────┘ └────────┘ └────────┘    │
│                                       │
│       🎤       📹       📞            │
│      Mute     Camera    Leave         │
└───────────────────────────────────────┘
```

Use Daily's supported React SDK/components or SDK approach appropriate for the project's current stack.

Do not manually implement WebRTC.

---

## 20. VIDEO CONTROLS

At minimum:

```text
Microphone
Camera
Leave
```

Where reliably supported:

```text
Fullscreen
Screen sharing
Audio/device controls
```

Do not add controls that are not supported by the selected Daily integration.

---

## 21. PARTICIPANT GRID

Support:

```text
1 participant
2 participants
3 participants
4 participants
5 participants
6 participants
```

Responsive layouts:

```text
Desktop
Tablet
Mobile
```

Participant names should use appropriate public/display information only.

---

## 22. CAMERA/MICROPHONE PERMISSIONS

Handle:

```text
Permission granted
Permission denied
Device unavailable
Browser unsupported
```

Show clear recovery instructions.

---

## 23. LEAVE CALL

Leaving the video call must:

```text
Exit Daily room
 ↓
Update/reconcile participant state
 ↓
Return to Meeting Circle
```

Leaving the call must NOT delete the circle.

---

## 24. CIRCLE MANAGEMENT

The creator may manage their own circle where required:

```text
Edit
Invite
Remove participant
Close
Delete
```

Only implement actions supported by the product architecture.

Backend must enforce ownership.

---

## 25. DELETE / CLOSE

Only an authorized owner/admin can delete or close a circle.

A deleted/closed circle must not be joinable.

Handle associated Daily room cleanup according to provider behavior and project architecture.

Do not leave permanently accessible orphaned rooms.

---

## 26. PARTICIPANT REMOVAL

If implemented:

```text
Creator
 ↓
Remove participant
 ↓
Backend authorization
 ↓
Participant access revoked/ended where supported
```

Do not assume frontend removal is sufficient.

---

## 27. INVITATIONS

Reuse the existing notification/invitation infrastructure if present.

Conceptually:

```text
Creator
 ↓
Invite patient
 ↓
Backend invitation
 ↓
Notification
 ↓
Patient accepts
 ↓
Patient can join
```

Do not create a second notification system.

---

## 28. NOTIFICATIONS

Where supported by existing architecture, useful events may include:

```text
Invitation received
Someone joined your circle
Someone left your circle
```

Avoid notification spam.

---

## 29. SAFETY / REPORTING

Because this is a social video feature, provide appropriate safety controls.

At minimum where supported:

```text
Leave
Report participant
```

Reuse existing moderation/reporting infrastructure.

Do not build a giant moderation platform as part of this task.

---

## 30. REPORT PARTICIPANT

Where the existing backend supports reporting, provide:

```text
Report Participant

Reason:
- Inappropriate behavior
- Harassment
- Spam
- Other
```

Send the report to the existing admin/moderation system.

---

## 31. AUTHORIZATION MATRIX

Verify actual project role rules.

At minimum test:

| Action | Patient | Caregiver | Admin |
|---|---|---|---|
| Discover | According to product policy | According to policy | Yes |
| Create | Yes if allowed | According to policy | Yes |
| Join discoverable | Yes if allowed | According to policy | Yes |
| Join invite-only | Only if invited | According to policy | Yes |
| Edit own circle | Yes | According to policy | Yes |
| Delete own circle | Yes | According to policy | Yes |
| Manage another user's circle | No unless explicitly authorized | No unless explicitly authorized | According to admin policy |

Do not blindly override existing B0-B14 authorization rules.

---

## 32. IDOR / SECURITY TESTING

Test attempts to manipulate:

```text
circleId
creatorId
userId
participantId
providerRoomId
```

in:

```text
URL
Query
Body
```

A user must not gain access by changing IDs.

---

## 33. PROVIDER ACCESS SECURITY

Verify:

```text
Daily API key never reaches browser
Privileged credentials never reach frontend
Unauthorized user cannot obtain valid room access
Access is scoped to the intended room
Closed/deleted circles cannot issue access
```

---

## 34. PROVIDER FAILURE

Handle:

```text
Daily unavailable
Room creation failure
Access-token failure
Join failure
Connection failure
```

Show a useful user-facing error.

Do not leave the UI stuck indefinitely.

---

## 35. NETWORK FAILURE

Test:

```text
Call active
 ↓
Network lost
 ↓
Reconnect
```

Use Daily's supported connection behavior.

Do not build a competing custom WebRTC reconnection system.

---

## 36. REALTIME PARTICIPANT COUNT

If the project already has realtime infrastructure, reuse it.

Otherwise use a safe refresh/reconciliation strategy.

The Meeting Circle discovery page must not open six video connections just to display counts.

---

## 37. PERFORMANCE

Do not initialize Daily video on discovery cards.

Only connect to the video room after the user actually joins.

Avoid:

```text
Discover page
 ↓
Connect to every room
```

---

## 38. RESPONSIVENESS

Test:

```text
Desktop
Tablet
Mobile
```

The video grid and controls must remain usable.

---

## 39. ACCESSIBILITY

Follow F16 architecture.

Verify:

```text
Keyboard access
Visible focus
Accessible labels
Clear room status
Accessible Leave button
Accessible camera/microphone controls
Readable participant names
```

Use accessible provider controls where available.

---

## 40. LOCALIZATION

Use the existing localization system for all Memora-generated strings:

```text
Create Meeting Circle
Join Circle
Full
Leave Call
Camera
Microphone
Report Participant
```

Do not hardcode new UI strings if localization is already established.

---

## 41. NO MOCK DATA

Search Meeting Circle implementation for:

```text
mock
dummy
fake
hardcoded participant
hardcoded count
fake room
placeholder
```

Remove these from production flow.

---

## 42. TESTING

Test at minimum:

```text
Create circle
Invalid creation
Discover
Invite-only visibility
Authorized join
Unauthorized join
Full room
7th participant
Concurrent join
Leave
Edit
Delete
Participant removal
Daily access
Camera
Microphone
Provider failure
Network failure
IDOR
Token security
Mobile layout
Accessibility
Localization
```

---

## 43. CRITICAL CAPACITY TEST

Test:

```text
Participant 1 → allowed
Participant 2 → allowed
Participant 3 → allowed
Participant 4 → allowed
Participant 5 → allowed
Participant 6 → allowed
Participant 7 → rejected
```

Backend must enforce this.

---

## 44. CONCURRENT CAPACITY TEST

At:

```text
5 / 6
```

make two users attempt to join simultaneously.

Expected:

```text
One succeeds.
One is rejected.
Final capacity = 6.
```

---

## 45. DOCUMENTATION

Create/update:

```text
docs/MEETING_CIRCLE_VIDEO_ARCHITECTURE.md
docs/MEETING_CIRCLE_API.md
docs/MEETING_CIRCLE_TEST_REPORT.md
```

Document:

```text
Architecture
Database changes
API
Authorization
Daily integration
Room lifecycle
Access-token flow
Six-person limit
Concurrency protection
Failure handling
Security
Testing
Environment variables
```

Never put real secrets in documentation.

---

## 46. ENVIRONMENT DOCUMENTATION

Update:

```text
.env.example
```

with placeholders for the Daily configuration required by the implementation.

Never commit actual credentials.

---

## 47. FINAL TEST MATRIX

Create and complete:

| Test | Expected | Result |
|---|---|---|
| Create circle | Circle created | |
| Invalid creation | Validation error | |
| Discover circle | Visible | |
| Invite-only discovery | Hidden | |
| Authorized join | Allowed | |
| Unauthorized private join | Rejected | |
| 1st participant | Allowed | |
| 2nd participant | Allowed | |
| 3rd participant | Allowed | |
| 4th participant | Allowed | |
| 5th participant | Allowed | |
| 6th participant | Allowed | |
| 7th participant | Rejected | |
| Concurrent join | Maximum 6 | |
| Leave | State reconciles | |
| Delete own circle | Allowed | |
| Delete other's circle | Rejected | |
| Edit own circle | Allowed | |
| Edit other's circle | Rejected | |
| Daily access | Securely granted | |
| Daily API key exposure | None | |
| Real video | Works | |
| Camera | Works/handled | |
| Microphone | Works/handled | |
| Network recovery | Works/handled | |
| Provider failure | Graceful | |
| Mobile | Works | |
| Accessibility | Pass | |
| Localization | Pass | |

---

## 48. DEFINITION OF DONE

The feature is complete only when:

[ ] Existing Meeting Circle implementation audited  
[ ] Scaffold removed  
[ ] Patient can create a real circle  
[ ] Circle persists in database  
[ ] Creator ownership enforced  
[ ] Discoverable circles work  
[ ] Invite-only circles work  
[ ] Join authorization works  
[ ] Hard 6-person limit works  
[ ] Concurrent capacity protection works  
[ ] Actual Daily video works  
[ ] Camera works/permission failure handled  
[ ] Microphone works/permission failure handled  
[ ] Participant grid works  
[ ] Leave works  
[ ] Participant state is accurate  
[ ] Creator management works where required  
[ ] Invitations work where required  
[ ] Reporting works where required  
[ ] Existing notifications reused  
[ ] Daily secret never reaches frontend  
[ ] IDOR tests pass  
[ ] Authorization tests pass  
[ ] Provider failure handled  
[ ] Network failure handled  
[ ] Responsive UI works  
[ ] Accessibility verified  
[ ] Localization verified  
[ ] No production mock data  
[ ] No placeholder implementation remains  
[ ] Frontend tests pass  
[ ] Backend tests pass  
[ ] Integration tests pass  
[ ] Build passes  
[ ] Lint passes  
[ ] Documentation updated  
[ ] .env.example updated  
[ ] No real secrets committed  

---

## 49. FINAL REPORT

Return:

```text
MEETING CIRCLE VIDEO IMPLEMENTATION: COMPLETE / BLOCKED

Circle creation: PASS/FAIL
Circle discovery: PASS/FAIL
Invite-only: PASS/FAIL
Joining: PASS/FAIL
Six-person limit: PASS/FAIL
Concurrent capacity: PASS/FAIL
Daily integration: PASS/FAIL
Camera: PASS/FAIL
Microphone: PASS/FAIL
Participant grid: PASS/FAIL
Leave: PASS/FAIL
Participant state: PASS/FAIL
Creator management: PASS/FAIL/NOT IMPLEMENTED
Invitations: PASS/FAIL/NOT IMPLEMENTED
Reporting: PASS/FAIL/NOT IMPLEMENTED
Notifications: PASS/FAIL/NOT IMPLEMENTED
Authorization: PASS/FAIL
IDOR: PASS/FAIL
Token security: PASS/FAIL
Network recovery: PASS/FAIL
Provider failure: PASS/FAIL
Responsive: PASS/FAIL
Accessibility: PASS/FAIL
Localization: PASS/FAIL
Frontend tests: PASS/FAIL
Backend tests: PASS/FAIL
Integration tests: PASS/FAIL
Build: PASS/FAIL
Lint: PASS/FAIL

P0 issues: X
P1 issues: X
P2 issues: X
P3 issues: X

Production blocker: YES/NO
```

Do not claim PASS without actual testing.

---

## 50. FINAL PRINCIPLE

The finished feature must represent:

```text
PATIENT
  ↓
CREATE / DISCOVER CIRCLE
  ↓
MEMORA BACKEND
  ↓
AUTHENTICATION
  ↓
AUTHORIZATION
  ↓
6-PERSON CAPACITY CHECK
  ↓
DAILY ACCESS
  ↓
REAL VIDEO CALL
  ↓
UP TO 6 PARTICIPANTS
  ↓
LEAVE
  ↓
STATE RECONCILIATION
```

The standard is:

```text
❌ Video-looking UI
❌ Fake participants
❌ Fake room
❌ Hardcoded 4/6
❌ Frontend-only six-person limit
❌ Daily API key in browser

VS

✅ Real database
✅ Real authentication
✅ Real authorization
✅ Real six-person backend limit
✅ Real Daily room
✅ Real video/audio
✅ Real participant state
✅ Real error handling
```

**Do not declare Meeting Circle complete until two or more authenticated test users can enter the same real video room, the backend enforces a maximum of six participants, and the complete workflow passes authorization, capacity, security, failure, accessibility, and regression tests.**
