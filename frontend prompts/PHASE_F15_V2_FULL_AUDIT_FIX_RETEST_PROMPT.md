# Memora - Phase F15 V2 Prompt
# Full Frontend ↔ Backend Integration, Audit, Automatic Fix & Retest

**Phase:** F15 V2  
**Name:** Complete Integration + Self-Correction + Retesting  
**Prerequisites:** F0-F14 completed  
**Purpose:** Turn the existing Memora frontend and B0-B14 backend into one verified, working, end-to-end system.

---

# 0. EXECUTIVE INSTRUCTION

This is a **full integration and repair phase**.

Do NOT assume that previous phases are correctly implemented.

Previous phase completion reports are evidence only.

The actual repository is authoritative.

Your job is to:

```text
AUDIT
  ↓
DISCOVER
  ↓
CLASSIFY
  ↓
FIX
  ↓
RETEST
  ↓
RE-AUDIT
  ↓
RETEST
  ↓
DOCUMENT
```

Do not stop after discovering bugs.

Do not merely report P0/P1 issues.

**Fix all safely fixable P0 and P1 issues, then retest them.**

Continue the audit until the integration is stable or until a genuine blocker cannot safely be fixed within the repository.

---

# 1. READ FIRST

Read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/B14_INTEGRATION_REPORT.md
docs/FRONTEND_ARCHITECTURE.md
docs/FRONTEND_API_CONTRACT.md
docs/F11_FULL_SYSTEM_INTEGRATION_REPORT.md
docs/F12_CAREGIVER_DASHBOARD_REPORT.md
docs/F13_ADMIN_DASHBOARD_REPORT.md
docs/F14_ANALYTICS_PROGRESS_REPORT.md
```

Then inspect the actual source tree.

Inspect:

```text
Backend
Frontend
Database models
Routes
Controllers
Services
Middleware
Authentication
Authorization
API clients
State management
Realtime
File uploads
AI integrations
Safety systems
Mobile integration
Environment configuration
Tests
```

---

# 2. ABSOLUTE SOURCE OF TRUTH

Use this priority:

```text
1. Actual running implementation
2. Backend route/controller/service behavior
3. Database schema/models
4. Existing frontend API contracts/types
5. Project specification
6. Phase reports
```

If documentation conflicts with implementation:

```text
Investigate.
Do not blindly follow the document.
Document the discrepancy.
```

---

# 3. DO NOT DESTROY EXISTING WORK

Before modifications:

```bash
git status
git branch
git log -5 --oneline
```

Never use:

```bash
git reset --hard
git clean -fd
```

Do not overwrite unrelated developer changes.

Do not perform massive rewrites when a targeted fix is sufficient.

---

# 4. CREATE AN INTEGRATION AUDIT

Create:

```text
docs/F15_V2_INTEGRATION_AUDIT.md
```

Track every major feature:

| Feature | Frontend | API | Backend | DB | Auth | Authorization | Realtime | E2E | Status |
|---|---|---|---|---|---|---|---|---|---|
| Authentication | | | | | | | | | |
| Patient | | | | | | | | | |
| Caregiver | | | | | | | | | |
| Admin | | | | | | | | | |
| Games | | | | | | | | | |
| Memory | | | | | | | | | |
| Reminders | | | | | | | | | |
| Community | | | | | | | | | |
| Meetings | | | | | | | | | |
| Notifications | | | | | | | | | |
| AI | | | | | | | | | |
| Safety | | | | | | | | | |
| Analytics | | | | | | | | | |
| File Uploads | | | | | | | | | |
| Mobile Integration | | | | | | | | | |

Do not mark PASS because a UI page exists.

---

# 5. ISSUE SEVERITY

Classify every discovered issue.

## P0 - Critical

Examples:

```text
Unauthorized patient data access
IDOR
Privilege escalation
Safety workflow broken
SOS failure
Critical data loss
Authentication bypass
Secret exposure
Severe security vulnerability
```

P0 means:

```text
Release blocker
```

---

## P1 - Major

Examples:

```text
Core feature completely disconnected
Important API mismatch
Game results not persisted
Reminders not functioning
Community registration broken
Admin role management broken
Major AI integration failure
Major frontend/backend contract mismatch
Important data synchronization failure
```

P1 means:

```text
Release blocker until fixed.
```

---

## P2 - Important

Examples:

```text
Important UX defect
Partial functionality
Non-critical synchronization issue
Incomplete error handling
Performance problem
```

---

## P3 - Minor

Examples:

```text
Visual issue
Minor wording problem
Small layout defect
Non-critical polish
```

---

# 6. REQUIRED ISSUE FORMAT

Every issue must be recorded as:

```text
Issue ID:
Severity:
Feature:
Location:
Expected:
Actual:
Root Cause:
Frontend Impact:
Backend Impact:
Database Impact:
Security Impact:
Fix:
Files Changed:
Test Performed:
Result:
Status:
```

Example:

```text
Issue ID: F15-001
Severity: P1
Feature: Reminders

Expected:
Creating a reminder should persist it.

Actual:
Frontend calls /api/reminder but backend exposes /api/reminders.

Root Cause:
API path mismatch.

Fix:
Updated centralized reminder API client.

Test:
Create reminder → database → GET reminder → UI refresh.

Result:
PASS

Status:
FIXED
```

---

# 7. REQUIRED FIX LOOP

For every P0/P1:

```text
Discover
 ↓
Create issue
 ↓
Find root cause
 ↓
Implement targeted fix
 ↓
Run relevant tests
 ↓
Run end-to-end test
 ↓
Verify database/provider state
 ↓
Verify frontend state
 ↓
Mark FIXED only if verified
```

Never mark an issue FIXED because the code "looks correct."

---

# 8. P0 RULE

For every P0:

```text
STOP NORMAL FEATURE WORK
        ↓
FIX P0
        ↓
SECURITY/SAFETY TEST
        ↓
REGRESSION TEST
        ↓
CONTINUE
```

At F15 completion:

```text
P0 = 0
```

unless an external dependency makes the issue genuinely impossible to resolve.

If a P0 cannot be fixed:

```text
Mark BLOCKED
Explain why
Explain external dependency
Do not claim F15 complete
```

---

# 9. P1 RULE

At F15 completion:

```text
P1 = 0
```

unless genuinely blocked by missing infrastructure/external dependency.

A frontend/backend mismatch inside this repository is normally expected to be fixed.

---

# 10. API INVENTORY

Build an inventory of actual endpoints.

For every endpoint record:

```text
Method
Path
Authentication
Role
Authorization
Request body
Query parameters
Response
Error responses
Pagination
Realtime impact
Frontend consumer
```

Search frontend for:

```text
fetch(
axios
api.
API_URL
baseURL
```

Search backend for:

```text
router
app.get
app.post
app.put
app.patch
app.delete
```

Compare the two.

---

# 11. API MISMATCH REPAIR

Look for:

```text
Wrong path
Wrong HTTP method
Wrong parameter
Wrong field name
Wrong response parsing
Wrong status expectation
Wrong enum
Wrong date format
Wrong ID format
```

Fix the centralized API layer where possible.

Do not scatter one-off workarounds throughout components.

---

# 12. AUTHENTICATION AUDIT

Verify:

```text
Registration
Login
Logout
Session persistence
Session refresh
Session expiry
401 handling
Protected routes
```

Test:

```text
Register
Login
Refresh browser
Open protected route
Logout
Reopen protected route
Expired session
```

---

# 13. AUTHORIZATION AUDIT

Verify actual roles from the repository.

At minimum inspect:

```text
Patient
Caregiver
Admin
```

and any other actual roles.

Test:

```text
Patient → own resources
Patient → other resources
Caregiver → authorized patient
Caregiver → unauthorized patient
Admin → admin resources
Non-admin → admin resources
```

---

# 14. IDOR AUDIT

Attempt changing:

```text
patientId
caregiverId
memoryId
reminderId
gameId
sessionId
meetingId
notificationId
analyticsId
safetyEventId
```

in:

```text
URL
Query
Body
Path
```

Verify backend authorization.

---

# 15. PATIENT END-TO-END FLOW

Test:

```text
Register
 ↓
Login
 ↓
Dashboard
 ↓
Play game
 ↓
Complete game
 ↓
Result persists
 ↓
Progress updates
 ↓
Create memory
 ↓
Retrieve memory
 ↓
Create reminder
 ↓
Reminder persists
 ↓
Notification
 ↓
Vote
 ↓
Pre-register
 ↓
Meeting/session
 ↓
AI
 ↓
Safety status
```

Mark each step:

```text
PASS
FAIL
PARTIAL
NOT SUPPORTED
BLOCKED
```

---

# 16. CAREGIVER END-TO-END FLOW

Test:

```text
Login
 ↓
Caregiver dashboard
 ↓
Authorized patient list
 ↓
Select patient
 ↓
Patient activity
 ↓
Games
 ↓
Memories
 ↓
Reminders
 ↓
Community
 ↓
Meetings
 ↓
Progress
 ↓
Safety
```

Verify strict patient isolation.

---

# 17. ADMIN END-TO-END FLOW

Test:

```text
Login
 ↓
Admin dashboard
 ↓
Users
 ↓
Roles
 ↓
Patients
 ↓
Caregivers
 ↓
Assignments
 ↓
Content
 ↓
Games
 ↓
Community
 ↓
Voting
 ↓
Scheduling
 ↓
Notifications
 ↓
Activity logs
 ↓
Analytics
 ↓
Safety
```

---

# 18. COGNITIVE GAMES

Verify:

```text
Game discovery
Game launch
Game state
Completion
Score/result
Persistence
History
Analytics
```

A game is not integrated if the result exists only in React state.

---

# 19. MEMORY

Verify:

```text
Create
Read
Update
Delete
Search where supported
Media where supported
```

Verify database persistence.

Test cross-user authorization.

---

# 20. REMINDERS

Verify:

```text
Create
Read
Update
Delete
Complete
Snooze
Scheduling
```

where supported.

Then verify:

```text
Reminder
 ↓
Backend scheduler
 ↓
Notification
 ↓
Frontend
```

---

# 21. COMMUNITY

Verify:

```text
Voting
Vote persistence
Vote restrictions
Pre-registration
Registration
Approval
Scheduling
Capacity
Host
Guest
Published session
```

---

# 22. COMMUNITY → MEETING

Verify:

```text
Vote
 ↓
Admin approval
 ↓
Schedule
 ↓
Published session
 ↓
Patient registration
 ↓
Meeting access
```

---

# 23. NOTIFICATIONS

Verify:

```text
Creation
Retrieval
Read/unread
Realtime
Admin notifications
Safety notifications
Reminder notifications
```

Do not create duplicate notification infrastructure.

---

# 24. REALTIME AUDIT

For every realtime feature verify:

```text
Connection
Authentication
Subscription
Event scope
Delivery
Reconnect
Disconnect
Cleanup
```

Test cross-user event isolation.

---

# 25. AI AUDIT

Verify:

```text
Frontend request
 ↓
API
 ↓
Backend
 ↓
Provider
 ↓
Response
 ↓
Frontend
```

Verify:

```text
Authentication
Authorization
Rate limits
Error handling
Conversation state
```

AI must never bypass normal permissions.

---

# 26. AI ACTION AUDIT

If AI can perform actions:

```text
Intent
 ↓
Authorization
 ↓
Confirmation if required
 ↓
Backend action
 ↓
Result
```

Never allow an AI-generated instruction to bypass backend authorization.

---

# 27. VOICE

If implemented:

```text
Input
 ↓
Speech processing
 ↓
AI
 ↓
Response
 ↓
Audio
```

Verify actual runtime configuration.

If unavailable:

```text
NOT SUPPORTED
```

Do not fake it.

---

# 28. SAFETY AUDIT

Safety is P0-sensitive.

Verify:

```text
Device registration
Authentication
Device status
Heartbeat
Location
Geofence
Fall detection
SOS
Safety events
Notifications
Caregiver visibility
Admin visibility
```

---

# 29. SOS END-TO-END

Use a test environment.

Verify:

```text
SOS
 ↓
Backend event
 ↓
Persistence
 ↓
Authorized notification
 ↓
Frontend status
 ↓
Resolution
```

Never trigger real emergency services during testing.

---

# 30. FALL DETECTION

Use simulated events.

Verify:

```text
Event
 ↓
Backend
 ↓
Safety record
 ↓
Notification
 ↓
Caregiver/admin
 ↓
Resolution
```

---

# 31. LOCATION

Verify:

```text
Permission
Acquisition
Upload
Persistence if intended
Authorization
Display
```

Never expose precise location without authorization.

---

# 32. GEOFENCING

If implemented:

```text
Location
 ↓
Geofence evaluation
 ↓
Event
 ↓
Notification
```

Verify which system is the source of truth.

Do not create a duplicate geofence engine.

---

# 33. MOBILE INTEGRATION

If a mobile app exists:

Verify:

```text
Authentication
Device registration
API base URL
Push notifications
Location
Safety events
Game data where supported
Sync
Logout
```

Test frontend/backend/mobile contracts.

---

# 34. ANALYTICS

Verify:

```text
Game completion
 ↓
Analytics
 ↓
Patient progress
 ↓
Caregiver progress
 ↓
Admin analytics
```

Also verify supported:

```text
Reminder activity
Community activity
Memory activity
AI activity
Safety summaries
```

No unsupported medical interpretation.

---

# 35. FILE UPLOADS

Audit:

```text
Images
Videos
PDFs
Memory media
Content media
```

Verify:

```text
Upload
Validation
Storage
Metadata
Retrieval
Authorization
```

---

# 36. DATABASE PERSISTENCE

For important CRUD operations:

```text
Create
 ↓
DB
 ↓
Read
 ↓
Update
 ↓
DB
 ↓
Read
 ↓
Delete if supported
 ↓
Read
```

Do not trust frontend state.

---

# 37. DATABASE CONSISTENCY

Inspect:

```text
References
Enums
Required fields
Optional fields
Deletion behavior
Cascade behavior
Indexes where relevant
```

Do not make unrelated schema changes.

---

# 38. DATE/TIME AUDIT

Test:

```text
Reminders
Sessions
Meetings
Notifications
Activity
Safety
Analytics
```

Check:

```text
Timezone
DST if relevant
Date boundaries
Week/month boundaries
```

---

# 39. CACHE AUDIT

Inspect:

```text
React/query cache
localStorage
sessionStorage
IndexedDB
```

Ensure sensitive data is not retained unnecessarily.

Clear/invalidate on:

```text
Logout
Patient switch
Authorization change
Session expiry
```

---

# 40. ROUTE AUDIT

Create a route matrix:

```text
Route
Auth required
Role
Backend authorization
Expected result
Actual result
```

Test direct URL navigation.

---

# 41. BUTTON AUDIT

Find important interactive elements.

Every important button must:

```text
Perform real action
Navigate correctly
Call real API
Open real dialog
or
be intentionally disabled
```

No fake production buttons.

---

# 42. FORM AUDIT

For every important form:

```text
Input
 ↓
Frontend validation
 ↓
API
 ↓
Backend validation
 ↓
Persistence
 ↓
Success/error
 ↓
UI refresh
```

---

# 43. ERROR HANDLING

Verify:

```text
400
401
403
404
409
422
429
500
503
Timeout
Network failure
```

No raw stack traces.

---

# 44. RETRY LOGIC

Retry safe reads where appropriate.

Do not automatically retry destructive operations or SOS actions.

---

# 45. IDEMPOTENCY

Test duplicate requests for:

```text
Votes
Registrations
Reminders
Memories
Safety events
Notifications
```

Use backend safeguards.

---

# 46. OFFLINE

Where offline support exists:

```text
Online
 ↓
Offline
 ↓
Action
 ↓
Reconnect
 ↓
Sync
```

Verify data integrity.

Safety limitations must be clearly communicated.

---

# 47. ENVIRONMENT AUDIT

Search for:

```text
localhost
127.0.0.1
hardcoded IP
development URLs
API keys
tokens
passwords
```

Ensure environment variables are used correctly.

---

# 48. CORS

Verify production-safe origins.

Do not use unrestricted:

```text
*
```

for sensitive production configuration unless genuinely required and safe.

---

# 49. SECRET AUDIT

Search repository for likely secrets.

Never commit:

```text
Database passwords
JWT secrets
AI keys
Storage keys
Provider tokens
```

If a secret is found:

```text
Remove it from source
Rotate if it may have been exposed
Document the action
```

---

# 50. SECURITY TESTS

At minimum test:

```text
Authentication bypass
Role bypass
IDOR
Privilege escalation
XSS
Sensitive data exposure
File upload abuse
Unsafe redirects where applicable
CORS
Token exposure
```

---

# 51. PRIVACY AUDIT

Ensure no unnecessary exposure of:

```text
Memory content
AI conversations
Voice transcripts
Precise location
Emergency contacts
Safety details
Authentication data
```

---

# 52. LOG AUDIT

Search for:

```text
console.log
logger
debug
```

Verify sensitive payloads are not logged.

---

# 53. PERFORMANCE AUDIT

Check:

```text
Duplicate API requests
Slow requests
Large payloads
Large lists
Analytics queries
Realtime subscriptions
Image loading
Video loading
```

Fix obvious integration inefficiencies.

---

# 54. DUPLICATE INFRASTRUCTURE AUDIT

Search for duplicate:

```text
API clients
Auth systems
Realtime systems
Notification systems
Analytics engines
AI clients
File upload services
```

Prefer the established architecture.

---

# 55. DEAD CODE AUDIT

Find:

```text
Unused routes
Unused components
Unused API functions
Unused services
```

Do not delete blindly.

---

# 56. TEST STRATEGY

Run:

```text
Unit tests
Integration tests
API tests
Frontend tests
End-to-end tests
Security tests
```

Use the project's existing tooling.

Do not replace the test framework unnecessarily.

---

# 57. AUTOMATIC FIX RULE

For each failure:

```text
Can safely fix in repository?
        │
   ┌────┴────┐
  YES       NO
   │         │
 FIX       BLOCK
   │         │
 TEST      DOCUMENT
   │
 PASS?
 ├── YES → FIXED
 └── NO  → Investigate again
```

Do not repeatedly patch symptoms.

Find the root cause.

---

# 58. REGRESSION TESTING

After each major fix:

```text
Run targeted test
 ↓
Run related module tests
 ↓
Run integration tests
```

Before completion:

```text
Run full available test suite
```

---

# 59. P0/P1 RE-AUDIT

After fixing issues:

```text
Search again
 ↓
Retest
 ↓
Look for related regressions
```

Do not assume fixing one API mismatch fixes every consumer.

---

# 60. COMPLETION GATE

F15 V2 cannot be declared complete if:

```text
P0 > 0
OR
P1 > 0
```

unless the remaining issue is explicitly:

```text
EXTERNAL BLOCKER
```

with documented evidence.

---

# 61. P2/P3 POLICY

P2/P3 may remain only if:

```text
Non-security
Non-safety
Non-data-loss
Non-core integration
```

and documented.

Record:

```text
Issue
Impact
Reason not fixed
Recommended future phase
```

---

# 62. NO FALSE PASS

Never write:

```text
PASS
```

because:

```text
Page loads
API returns 200
No obvious error
```

PASS requires meaningful verification.

---

# 63. FINAL END-TO-END MATRIX

Produce:

| Module | Happy Path | Error Path | Auth | Authorization | Persistence | Realtime | E2E | Result |
|---|---|---|---|---|---|---|---|---|
| Auth | | | | | | | | |
| Patient | | | | | | | | |
| Caregiver | | | | | | | | |
| Admin | | | | | | | | |
| Games | | | | | | | | |
| Memory | | | | | | | | |
| Reminders | | | | | | | | |
| Community | | | | | | | | |
| Meetings | | | | | | | | |
| Notifications | | | | | | | | |
| AI | | | | | | | | |
| Safety | | | | | | | | |
| Analytics | | | | | | | | |
| Uploads | | | | | | | | |
| Mobile | | | | | | | | |

---

# 64. FINAL SECURITY GATE

Before declaring complete:

```text
Authentication bypass: 0
Authorization bypass: 0
Known IDOR: 0
Known privilege escalation: 0
Known secret exposure: 0
Known critical data leakage: 0
Known unresolved P0 safety issue: 0
```

---

# 65. FINAL QUALITY GATE

Verify:

```text
Tests
Lint
Build
Routes
API contracts
Database persistence
Realtime
Error handling
Environment
Security
Privacy
Performance
```

---

# 66. DOCUMENTATION

Create/update:

```text
docs/F15_V2_INTEGRATION_AUDIT.md
docs/F15_V2_FULL_INTEGRATION_REPORT.md
```

The final report must include:

```text
Executive Summary

Repository Audit

B0-B14 Audit

F0-F14 Audit

API Inventory

Integration Matrix

Authentication

Authorization

IDOR

Patient Flow

Caregiver Flow

Admin Flow

Games

Memory

Reminders

Community

Meetings

Notifications

Realtime

AI

Voice

Safety

SOS

Fall Detection

Location

Geofencing

Mobile Integration

Analytics

File Uploads

Database Persistence

Caching

Routing

Forms

Error Handling

Environment Configuration

CORS

Security

Privacy

Performance

Duplicate Systems

Dead Code

Issues Discovered

P0 Issues

P1 Issues

P2 Issues

P3 Issues

Issues Fixed

Issues Remaining

External Blockers

Regression Tests

Final Test Results

Lint Result

Build Result

Browser Result

Production Readiness

Recommendations for F16
```

---

# 67. ISSUE SUMMARY

The final report must contain:

```text
Total issues discovered:
P0 discovered:
P1 discovered:
P2 discovered:
P3 discovered:

P0 fixed:
P1 fixed:
P2 fixed:
P3 fixed:

P0 remaining:
P1 remaining:
P2 remaining:
P3 remaining:
```

Do not hide fixed issues.

The purpose of the audit is to show what was actually found and repaired.

---

# 68. CHANGE LOG

Document:

```text
File
Change
Reason
Issue ID
Test
Result
```

---

# 69. FINAL TERMINAL COMMANDS

Run:

```bash
git status
git diff --stat
git diff --check
```

Then run the project's actual:

```text
Test command
Lint command
Build command
```

Do not invent commands if the repository uses different tooling.

---

# 70. FINAL RESULT FORMAT

Return:

```text
F15 V2 STATUS: COMPLETE / BLOCKED

P0 discovered: X
P0 fixed: X
P0 remaining: X

P1 discovered: X
P1 fixed: X
P1 remaining: X

P2 discovered: X
P2 fixed: X
P2 remaining: X

P3 discovered: X
P3 fixed: X
P3 remaining: X

Authentication: PASS/FAIL
Authorization: PASS/FAIL
IDOR: PASS/FAIL
Patient E2E: PASS/FAIL
Caregiver E2E: PASS/FAIL
Admin E2E: PASS/FAIL
Games: PASS/FAIL
Memory: PASS/FAIL
Reminders: PASS/FAIL
Community: PASS/FAIL
Meetings: PASS/FAIL
Notifications: PASS/FAIL
Realtime: PASS/FAIL/NOT SUPPORTED
AI: PASS/FAIL/NOT SUPPORTED
Voice: PASS/FAIL/NOT SUPPORTED
Safety: PASS/FAIL
SOS: PASS/FAIL/NOT SUPPORTED
Fall detection: PASS/FAIL/NOT SUPPORTED
Location: PASS/FAIL/NOT SUPPORTED
Geofencing: PASS/FAIL/NOT SUPPORTED
Mobile integration: PASS/FAIL/NOT SUPPORTED
Analytics: PASS/FAIL
File uploads: PASS/FAIL/NOT SUPPORTED
Database persistence: PASS/FAIL
Routing: PASS/FAIL
Forms: PASS/FAIL
Error handling: PASS/FAIL
Environment: PASS/FAIL
Security: PASS/FAIL
Privacy: PASS/FAIL
Performance: PASS/FAIL
Tests: PASS/FAIL
Lint: PASS/FAIL
Build: PASS/FAIL
Browser: PASS/FAIL

Production blocker: YES/NO
```

---

# 71. STOP CONDITION

When F15 V2 reaches:

```text
P0 = 0
P1 = 0
```

and all major end-to-end flows pass:

**STOP.**

Do not automatically begin F16.

Do not add unrelated features.

Do not redesign working modules.

Do not refactor stable code without a demonstrated integration reason.

---

# 72. FINAL PRINCIPLE

F15 V2 is the **truth-checking phase** for the entire Memora project.

The standard is not:

```text
"It was implemented in B7."
"It was implemented in F10."
"The page renders."
"The API exists."
```

The standard is:

```text
Real User
    ↓
Real Frontend
    ↓
Real API
    ↓
Real Authentication
    ↓
Real Authorization
    ↓
Real Backend Logic
    ↓
Real Database / Provider
    ↓
Real Response
    ↓
Real Frontend Update
```

If that chain breaks:

```text
DISCOVER
 ↓
CLASSIFY
 ↓
FIX
 ↓
RETEST
```

If the issue is security, safety, data loss, or a core workflow:

```text
P0/P1
 ↓
BLOCK RELEASE
```

Never hide incomplete functionality with mock data.

Never mark an issue fixed without testing it.

Never use frontend authorization as the security boundary.

Never expose another patient's information.

Never expose private memories, AI conversations, voice transcripts, precise location, emergency data, or safety information without explicit authorization.

Never bypass normal backend permissions through AI.

Never trigger real emergency workflows during development.

Never create duplicate infrastructure when an existing system can be repaired.

**F15 V2 is complete only when Memora's existing frontend and B0-B14 backend have been audited, repaired where necessary, retested, and proven to operate as one coherent end-to-end system.**
