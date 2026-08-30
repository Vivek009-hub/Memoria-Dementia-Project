# Memora - Phase B4 Prompt: Cognitive Games

**Phase:** B4  
**Name:** Cognitive Games Engine  
**Prerequisites:** B0 Backend Foundation, B1 Database Foundation, B2 Authentication, B3 Users/Patients/Caregivers  
**Status:** Ready for implementation

## Objective

Implement the backend cognitive-game system for Memora.

B4 introduces the first major patient-facing feature. Build a reusable game engine supporting multiple game types, categories, difficulty levels, game sessions, scoring, completion, history, and data needed for later personalization and analytics.

Target architecture:

```text
Patient
   ↓
Games API
   ↓
Authentication + Authorization
   ↓
Game Service / Game Engine
   ↓
Game Definition
   ↓
Game Session / Attempts
   ↓
Results / Activity
   ↓
MongoDB
```

---

# 1. READ FIRST

Before changing anything, read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
```

Then inspect the completed B0-B3 implementation, especially:

```text
server/src/config/
server/src/middleware/
server/src/modules/
server/src/routes/
```

B0, B1, B2, and B3 are already completed.

**Do not rebuild them.**

---

# 2. B4 SCOPE

Implement:

- Game catalog
- Game definitions
- Game categories
- Difficulty levels
- Game configuration
- Patient game sessions
- Game attempts if defined by DATABASE.md
- Scores/results
- Completion status
- Basic cognitive activity records if defined by DATABASE.md
- Game history
- Patient game access
- Caregiver access to permitted cognitive activity
- Admin game-management foundation
- Validation
- Authorization
- Tests

Do NOT implement:

```text
AI-generated games
AI personalization
Voice interaction
Speech recognition
Text-to-speech
Memory Assistance
Reminders
Community Sessions
Meeting Circle
Notifications
Location
Geofencing
SOS
Fall Detection
Mobile App
```

---

# 3. IMPORTANT ARCHITECTURAL PRINCIPLE

Separate:

```text
Game Definition
```

from:

```text
Game Session
```

A Game Definition describes what a game is.

A Game Session represents one patient's actual playthrough.

```text
Game
 ├── name
 ├── category
 ├── difficulty
 ├── configuration
 └── active status

       ↓

Game Session
 ├── patient
 ├── game
 ├── startedAt
 ├── completedAt
 ├── score
 ├── result
 └── performance
```

Do not store all patient sessions inside the Game document.

---

# 4. GAME CATEGORIES

Use the categories defined in PROJECT_SPEC.md / DATABASE.md.

If they are not explicitly defined, use a small extensible set such as:

```text
MEMORY
ATTENTION
RECOGNITION
LANGUAGE
PATTERN
ORIENTATION
PROBLEM_SOLVING
```

Do not create unnecessary categories.

---

# 5. DIFFICULTY

Use controlled values.

Recommended:

```text
EASY
MEDIUM
HARD
```

If DATABASE.md specifies different values, follow it.

Never accept arbitrary difficulty strings.

---

# 6. GAME MODEL

Implement the Game model according to DATABASE.md.

Potential fields may include:

```text
name
description
category
difficulty
instructions
thumbnailUrl
gameType
configuration
isActive
createdBy
updatedBy
createdAt
updatedAt
```

Do not add fields without a clear purpose.

The model must support multiple game implementations.

---

# 7. GAME CONFIGURATION

Game-specific configuration should be structured and validated.

Example:

```json
{
  "rounds": 5,
  "timeLimitSeconds": 60,
  "itemCount": 10
}
```

Never store executable JavaScript or arbitrary code in MongoDB.

Never use `eval()` or equivalent execution of database content.

Game logic belongs in application code.

---

# 8. GAME SESSION MODEL

Implement GameSession according to DATABASE.md.

Potential fields:

```text
patientId
gameId
difficulty
startedAt
completedAt
status
score
maxScore
accuracy
durationSeconds
roundsCompleted
performance
createdAt
updatedAt
```

Use controlled status values such as:

```text
STARTED
COMPLETED
ABANDONED
```

Follow DATABASE.md if different.

Do not permit invalid state transitions.

For example:

```text
COMPLETED → STARTED
```

must not occur.

---

# 9. GAME ATTEMPTS

If DATABASE.md defines a separate GameAttempt model, implement it.

If it does not, do not invent a separate collection unnecessarily.

If attempts are needed, an attempt may contain:

```text
sessionId
roundNumber
item/question identifier
answer
correct
responseTime
points
createdAt
```

Store only data necessary for scoring, gameplay, or later analytics.

---

# 10. GAME LOGIC VS DATABASE

Database:

```text
Game Definition
```

Application:

```text
Game Execution Logic
```

Correct:

```text
MongoDB
   ↓
Game Definition

Backend
   ↓
Game Engine
```

Incorrect:

```text
MongoDB
   ↓
Executable code
   ↓
eval()
```

---

# 11. GAME APIs

Implement appropriate APIs.

Recommended:

```http
GET  /api/v1/games
GET  /api/v1/games/:gameId
POST /api/v1/games/:gameId/sessions
GET  /api/v1/games/sessions/:sessionId
POST /api/v1/games/sessions/:sessionId/complete
GET  /api/v1/games/history
```

Use existing project conventions if different.

Do not create unnecessary patient CRUD endpoints.

---

# 12. GAME CATALOG

`GET /api/v1/games`

Authenticated patients should receive active games available to them.

Potential filters:

```text
category
difficulty
```

Do not expose inactive games to normal patients.

---

# 13. GAME DETAILS

`GET /api/v1/games/:gameId`

Return safe game information such as:

```text
name
description
category
difficulty
instructions
thumbnailUrl
client-required configuration
```

Do not expose:

```text
private admin metadata
secrets
database internals
```

---

# 14. START GAME SESSION

Implement:

```http
POST /api/v1/games/:gameId/sessions
```

Flow:

```text
Authenticate
   ↓
Verify patient access
   ↓
Find active game
   ↓
Validate configuration/difficulty
   ↓
Create GameSession
   ↓
Return session
```

Do not allow a caregiver to impersonate a patient unless explicitly required by PROJECT_SPEC.md.

---

# 15. COMPLETE GAME SESSION

Implement:

```http
POST /api/v1/games/sessions/:sessionId/complete
```

The service must:

1. Verify session ownership/access.
2. Verify the session is still active.
3. Validate submitted results.
4. Calculate or verify score where practical.
5. Calculate accuracy where appropriate.
6. Calculate duration.
7. Mark session completed.
8. Persist the result.
9. Prevent duplicate completion.

Do not blindly trust client-provided scores when the backend can verify them.

---

# 16. GAME HISTORY

Implement:

```http
GET /api/v1/games/history
```

A patient may view their own history.

Potential fields:

```text
game
date
score
accuracy
duration
difficulty
completion status
```

Do not expose another patient's history.

---

# 17. CAREGIVER ACCESS

A caregiver may access patient cognitive activity only when:

```text
ACTIVE caregiver relationship
+
required permission
```

Reuse B3 authorization.

Example:

```text
Caregiver
   ↓
ACTIVE relationship
   ↓
viewCognitiveActivity
   ↓
Patient game history
```

Without permission:

```text
403 FORBIDDEN
```

Do not create a second authorization system.

---

# 18. ADMIN GAME MANAGEMENT

Create an admin-only foundation for managing game definitions.

Potential endpoints:

```http
POST   /api/v1/games
PATCH  /api/v1/games/:gameId
DELETE /api/v1/games/:gameId
```

Implement only if consistent with PROJECT_SPEC.md and the existing architecture.

Protect all admin operations server-side.

Do not build the admin frontend.

---

# 19. GAME DELETION

Do not physically delete games that have historical sessions merely to hide them from patients.

Prefer an inactive/archived state such as:

```text
isActive = false
```

Historical sessions must remain understandable.

---

# 20. PERSONALIZATION FOUNDATION

Do NOT implement AI personalization in B4.

Record clean data that later phases can use:

```text
Game
Difficulty
Score
Accuracy
Duration
Completion
Patient history
```

B10/B11 can later use this for analytics and AI recommendations.

---

# 21. COGNITIVE ACTIVITY

If DATABASE.md defines an activity/event collection, record appropriate game activity.

Avoid duplicate sources of truth.

The authoritative game result should remain the GameSession/result record.

---

# 22. VALIDATION

Validate:

```text
gameId
sessionId
category
difficulty
answers/results
score
duration
rounds
```

Reject:

```text
invalid ObjectId
invalid enum
negative score
negative duration
invalid session state
duplicate completion
malformed results
```

Never trust frontend validation alone.

---

# 23. AUTHORIZATION

Use:

```text
B2 Authentication
+
B3 Authorization
```

Required rules:

```text
Patient → own game sessions
✓

Patient → another patient's sessions
✗

Caregiver → authorized patient + permission
✓

Caregiver → unauthorized patient
✗

Admin → game management
✓

Patient → game management
✗
```

---

# 24. SECURITY

Never expose:

```text
passwordHash
sessionTokenHash
private admin metadata
database internals
```

Do not log:

```text
passwords
authentication tokens
sensitive patient information
```

Game activity is patient-related data and must be protected.

---

# 25. INDEXING

Follow DATABASE.md.

Likely useful indexes include:

```text
Game:
isActive
category
difficulty

GameSession:
patientId + createdAt
gameId + createdAt
patientId + status
```

Only create indexes that support actual query patterns.

---

# 26. CONCURRENCY

Game completion must be safe against duplicate requests.

Example:

```text
Request A → complete session
Request B → complete same session
```

Only one request should finalize the session.

The second should receive an appropriate conflict/state error.

Do not rely on frontend button disabling.

---

# 27. TESTING

Add comprehensive tests.

## Game Model

```text
✓ valid game creation
✓ invalid category rejected
✓ invalid difficulty rejected
✓ required fields enforced
✓ active/inactive state
```

## Game Session

```text
✓ valid session creation
✓ inactive game rejected
✓ patient recorded
✓ difficulty recorded
✓ correct initial state
✓ invalid state rejected
```

## Game APIs

```text
✓ authenticated patient can list games
✓ inactive games hidden from patient
✓ patient can view game
✓ patient can start session
✓ patient can complete session
✓ completed session cannot be completed again
✓ patient can view own history
```

## Authorization

```text
✓ patient cannot view another patient's history
✓ caregiver with permission can view patient activity
✓ caregiver without permission is rejected
✓ revoked caregiver is rejected
✓ non-admin cannot manage games
```

## Validation

```text
✓ invalid game ID rejected
✓ invalid session ID rejected
✓ invalid score rejected
✓ invalid duration rejected
✓ malformed results rejected
```

---

# 28. END-TO-END GAME TEST

Create a complete API flow:

```text
Authenticate patient
        ↓
GET /games
        ↓
Select active game
        ↓
POST /games/:gameId/sessions
        ↓
Receive session
        ↓
POST /games/sessions/:sessionId/complete
        ↓
Receive result
        ↓
GET /games/history
        ↓
Verify result
```

Also test:

```text
Complete same session twice
        ↓
Must fail
```

---

# 29. NO AI

Do NOT integrate:

```text
OpenAI
Claude
Gemini
LLM game generation
AI recommendations
AI personalization
```

B11 handles AI.

B4 must produce clean structured data for later AI use.

---

# 30. NO FRONTEND

Do not implement:

```text
React components
Frontend state management
Mobile UI
Voice UI
```

B4 is backend only.

The API must nevertheless be clean enough for the frontend team.

---

# 31. DOCUMENTATION

If B4 changes:

```text
Game schema
GameSession schema
GameAttempt schema
API contracts
Cognitive activity structure
```

update the relevant documentation.

Do not silently change DATABASE.md.

If implementation conflicts with DATABASE.md:

1. Stop.
2. Explain the conflict.
3. Make the minimum approved change.

---

# 32. DO NOT REWRITE B0-B3

Do not rewrite:

```text
Express setup
MongoDB configuration
Authentication
Session authentication
User model
PatientProfile
CaregiverRelationship
EmergencyContact
Authorization infrastructure
```

unless a real defect blocks B4.

If a defect is found:

1. Explain it.
2. Make the smallest safe fix.
3. Add a regression test.
4. Mention it in the final report.

---

# 33. NO UNRELATED FEATURES

Do NOT implement:

```text
Memory Assistance
Reminders
Community Sessions
Meeting Circle
Notifications
Analytics dashboards
AI
Location
Geofencing
SOS
Fall Detection
Mobile App
```

Only create the minimal cognitive-activity data required by DATABASE.md.

---

# 34. CODE ORGANIZATION

Follow the established modular structure.

Recommended if consistent with the existing repository:

```text
server/src/modules/games/
├── game.model.js
├── gameSession.model.js
├── game.controller.js
├── game.service.js
├── game.routes.js
├── game.validation.js
└── game.test.js
```

If B0-B3 established another convention, follow it.

Do not create duplicate models.

---

# 35. FINAL VERIFICATION

Run:

```bash
npm test
npm run lint
npm run format:check
```

If a build command exists, run it.

Verify:

```text
Patient can browse games
Patient can start game
Patient can complete game
Patient can view own history

Unauthorized patient access fails

Authorized caregiver access works

Unauthorized caregiver access fails

Admin game management is protected
```

Verify that no password, raw session token, or unnecessary sensitive data is returned.

---

# 36. FINAL REPORT

Return:

```text
B4 COGNITIVE GAMES REPORT

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

Game lifecycle:
-

Scoring strategy:
-

Authorization:
-

Caregiver access:
-

Admin access:
-

Validation:
-

Indexes:
-

Concurrency protection:
-

Tests:
-

Security tests:
-

Lint:
-

Formatting:
-

Database changes:
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

Do NOT proceed to B5.

---

# 37. B4 DEFINITION OF DONE

B4 is complete only when:

[ ] Game model implemented according to DATABASE.md
[ ] GameSession model implemented according to DATABASE.md
[ ] Game catalog API implemented
[ ] Game details API implemented
[ ] Patient can start game session
[ ] Patient can complete game session
[ ] Game history implemented
[ ] Game lifecycle/state rules implemented
[ ] Score/result validation implemented
[ ] Backend does not blindly trust client scores where verification is possible
[ ] Duplicate completion prevented
[ ] Patient ownership checks implemented
[ ] Caregiver cognitive-activity access uses B3 permissions
[ ] Admin game management protected
[ ] Inactive games handled correctly
[ ] Required indexes implemented
[ ] Input validation implemented
[ ] Tests cover success cases
[ ] Tests cover authorization failures
[ ] Tests cover invalid state transitions
[ ] Tests cover duplicate completion
[ ] All tests pass
[ ] Lint passes
[ ] Formatting passes
[ ] Documentation remains consistent
[ ] No AI integration implemented
[ ] No unrelated features implemented

Only after all applicable items pass should B4 be considered complete.

---

# 38. STOP CONDITION

After B4 is complete:

**STOP.**

Do not begin B5.

The next phase will be:

```text
B5 - Memory Assistance
```

B5 will build Memora's personal memory system, including memories, people, places, events, photos, stories, and caregiver-assisted memory management.
