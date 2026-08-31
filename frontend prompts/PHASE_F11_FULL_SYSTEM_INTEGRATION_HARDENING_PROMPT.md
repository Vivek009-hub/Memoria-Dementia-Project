# Memora - Phase F11 Prompt: Full-System Integration, Verification, Hardening + Release Readiness

**Phase:** F11  
**Name:** Full-System Integration, Cross-Phase Verification, Hardening + Release Readiness  
**Prerequisites:** Backend B0-B14, Frontend F0-F10, and the mobile safety foundation are implemented  
**Status:** Ready for implementation  
**Important:** F11 is an audit, integration, hardening, and release-readiness phase. Do not introduce major new product features unless a verified integration gap requires a minimal fix.

---

# OBJECTIVE

Perform a complete end-to-end audit of the Memora system.

The goal is to verify that the work produced across:

```text
Backend:
B0 → B14

Frontend:
F0 → F10

Mobile Safety App:
F9 mobile integration
```

is actually:

```text
Connected
Compatible
Functional
Secure
Accessible
Localized
Tested
Buildable
Deployable
```

F11 exists specifically because multiple developers and AI coding agents may have implemented different phases independently.

The central question is:

> Does Memora work as one system rather than as a collection of individually generated phases?

Do not assume that because a phase report says "completed", the implementation is complete.

Inspect the actual repository.

---

# 1. READ EVERYTHING FIRST

Read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/B14_INTEGRATION_REPORT.md
docs/FRONTEND_ARCHITECTURE.md
docs/FRONTEND_API_CONTRACT.md
```

Then inspect all available phase reports:

```text
B0-B14 reports
F0-F10 reports
F9 mobile integration report
```

Also inspect:

```text
package.json
lock files
environment configuration
Docker files if present
CI/CD files if present
README
database configuration
API configuration
authentication configuration
mobile project configuration
```

The actual source code is authoritative.

Reports are evidence, not proof.

---

# 2. CRITICAL RULE

Do not blindly trust any previous phase.

For every claimed feature:

```text
Report says implemented
        ↓
Inspect source
        ↓
Inspect API
        ↓
Inspect database
        ↓
Run test
        ↓
Run application
        ↓
Verify integration
```

If something is missing:

```text
Identify
Fix if within F11 scope
Test
Document
```

---

# 3. SYSTEM INVENTORY

Create an inventory of:

```text
Backend services
Frontend applications
Mobile applications
Databases
Authentication
Authorization
AI services
Notification services
Safety services
External providers
Storage
Realtime services
Scheduled jobs
```

Document:

```text
What exists
Where it lives
How it communicates
What depends on what
```

---

# 4. ARCHITECTURE VERIFICATION

Verify the intended architecture:

```text
                    MEMORA
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       WEB APP      MOBILE APP    BACKEND
          │            │            │
          └────────────┼────────────┘
                       ↓
                 Backend APIs
                       │
       ┌───────────────┼────────────────┐
       ↓               ↓                ↓
   Core Features       AI           Safety
       │               │                │
       └───────────────┼────────────────┘
                       ↓
                 Notifications
```

Confirm the implementation actually follows the architecture.

---

# 5. FRONTEND → BACKEND AUDIT

Audit every frontend API call.

For each:

```text
Frontend endpoint
HTTP method
Request body
Headers
Authentication
Response shape
Error shape
Backend route
Controller
Service
Database interaction
```

Verify they match.

Look specifically for:

```text
Wrong URL
Wrong HTTP method
Wrong field names
Wrong response assumptions
Missing authentication
Missing authorization
Old endpoints
Dead endpoints
Hardcoded mock responses
```

---

# 6. API CONTRACT AUDIT

Compare:

```text
docs/FRONTEND_API_CONTRACT.md
```

against actual backend routes.

If documentation is outdated:

```text
Update documentation.
```

Do not silently maintain two different API contracts.

---

# 7. DATABASE AUDIT

Verify that database models used by backend actually support frontend functionality.

Check:

```text
Users
Roles
Patients
Memories
Games
Game results
Reminders
Community sessions
Votes
Registrations
Meetings
Notifications
Activities
Safety events
Emergency contacts
Devices
Locations
AI conversations
AI recommendations
```

Only audit models that actually exist in the repository.

---

# 8. DATABASE RELATIONSHIP AUDIT

Check:

```text
User → Memories
User → Reminders
User → Notifications
User → Activities
User → Safety Events
User → Devices
User → Conversations
Session → Votes
Session → Registrations
Session → Meeting
```

Verify references are consistent.

---

# 9. AUTHENTICATION AUDIT

Test:

```text
Register
Login
Logout
Session/token refresh if supported
Protected route
Expired session
Invalid token
```

Verify frontend and backend use the same authentication model.

---

# 10. AUTHORIZATION AUDIT

Test role boundaries.

At minimum inspect:

```text
Patient
Admin
Other configured roles
```

Verify users cannot access resources belonging to another user.

Test both:

```text
Frontend route protection
Backend authorization
```

Backend authorization must remain authoritative.

---

# 11. PATIENT JOURNEY

Test a complete patient journey:

```text
Register
 ↓
Login
 ↓
Dashboard
 ↓
Play game
 ↓
View result
 ↓
View/add memory
 ↓
Create/view reminder
 ↓
View community sessions
 ↓
Vote
 ↓
View schedule
 ↓
Pre-register
 ↓
Receive notification
 ↓
View Meeting Circle
 ↓
Use AI
 ↓
Open Safety
```

Do not stop at individual pages.

---

# 12. ADMIN JOURNEY

Test the actual admin workflow supported by the project:

```text
Login
 ↓
Admin dashboard
 ↓
Manage users
 ↓
Manage content
 ↓
Create/update relevant content
 ↓
Manage community sessions
 ↓
Review votes
 ↓
Approve/schedule session
 ↓
Review activity/notifications where supported
```

Use the actual project specification.

---

# 13. AI JOURNEY

Verify:

```text
Patient opens AI
 ↓
AI request
 ↓
Backend
 ↓
Existing AI service
 ↓
Response
 ↓
Frontend rendering
```

Test:

```text
AI assistant
Recommendations
Memory assistance
Reminder suggestions
Voice where supported
Regional language where supported
```

Do not add new AI providers during F11 unless required to repair an existing documented integration.

---

# 14. AI ACTION AUDIT

If AI can trigger actions:

```text
Create reminder
Save memory
Open game
Open community session
```

verify:

```text
Action is structured
Action is validated
Action is authorized
Action is confirmed where required
Action cannot execute arbitrary code
```

---

# 15. AI SECURITY AUDIT

Verify:

```text
No provider API keys in frontend
No provider API keys in mobile app
No system prompts exposed
No arbitrary HTML execution
No arbitrary URL redirects
No arbitrary JavaScript execution
No cross-user conversation access
```

---

# 16. VOICE AUDIT

If voice exists:

```text
Microphone permission
Speech recognition
AI request
Response
Text-to-speech
Cleanup
```

Test:

```text
Permission granted
Permission denied
No speech
Network failure
Recognition failure
TTS failure
```

---

# 17. MEMORY AUDIT

Verify:

```text
Create
Read
Update
Delete if supported
AI-assisted retrieval
Ownership
Privacy
```

Ensure one user's memories cannot appear in another user's account.

---

# 18. GAME AUDIT

Verify:

```text
Game list
Game launch
Game state
Game completion
Score/result
History
Recommendations
```

Check that F4 and backend game functionality actually communicate.

---

# 19. REMINDER AUDIT

Verify:

```text
Create
Read
Update
Delete
Complete
Snooze if supported
Recurring behavior if supported
Timezone
Notifications
```

Do not create a second reminder engine.

---

# 20. COMMUNITY AUDIT

Verify the exact workflow:

```text
Admin creates voting option
 ↓
Patient sees option
 ↓
Patient votes
 ↓
Admin sees results
 ↓
Admin approves
 ↓
Admin schedules
 ↓
Patient sees Schedule
 ↓
Patient pre-registers
```

Test capacity and registration state.

---

# 21. MEETING CIRCLE AUDIT

Verify:

```text
Meeting exists
Patient authorization
Registration
Join state
Meeting start/end
Cancellation
Protected meeting link
```

Do not expose protected meeting URLs to unauthorized users.

---

# 22. NOTIFICATION AUDIT

Verify B9 and F8 together.

Test:

```text
Notification creation
Delivery
Unread count
Notification list
Mark read
Mark all read if supported
Navigation
Realtime behavior if supported
```

Ensure no second notification system exists.

---

# 23. NOTIFICATION TRIGGER AUDIT

Check integrations from:

```text
Reminders
Community
Meetings
Safety
AI
System events
```

Only verify triggers that actually exist in B9.

---

# 24. ACTIVITY AUDIT

If activity functionality exists:

```text
Activity creation
Activity visibility
Activity ownership
Activity list
Pagination
Privacy
```

Verify notifications and activities are not incorrectly treated as the same thing.

---

# 25. SAFETY AUDIT

F9 is safety-sensitive.

Verify:

```text
Safety Dashboard
SOS
Emergency contacts
Location status
Fall detection status
Device status
Safety events
B9 integration
```

---

# 26. SOS END-TO-END TEST

Test:

```text
Patient
 ↓
SOS button
 ↓
Confirmation if required
 ↓
Backend
 ↓
Safety event
 ↓
Notification workflow
 ↓
Correct state displayed
```

Do not claim an SOS was sent unless the backend confirms it.

---

# 27. MOBILE SAFETY AUDIT

Verify:

```text
Mobile authentication
Device registration
Location permission
Sensor permission
Background architecture
Location synchronization
Fall detection synchronization
SOS synchronization
Device heartbeat/status
```

Do not claim continuous monitoring unless the mobile/backend architecture actually supports it.

---

# 28. LOCATION PRIVACY AUDIT

Verify precise location is not unnecessarily exposed through:

```text
URLs
Logs
Analytics
Frontend storage
Unauthorized endpoints
```

---

# 29. FALL DETECTION AUDIT

Verify:

```text
Sensor processing
Fall event creation
Duplicate protection
Confirmation workflow if supported
Backend synchronization
Notification
Frontend status
```

Do not invent or alter the project's fall-detection algorithm during F11.

---

# 30. DEVICE AUDIT

Verify:

```text
Device ownership
Registration
Authentication
Heartbeat
Disconnect state
Reconnect
Unauthorized device protection
```

---

# 31. CROSS-PHASE INTEGRATION MATRIX

Create a matrix:

| Feature | Backend | Frontend | Mobile | Notifications | AI | Status |
|---|---|---|---|---|---|---|
| Authentication | ✓/✗ | ✓/✗ | ✓/✗ | - | - | |
| Games | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | |
| Memories | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | |
| Reminders | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | |
| Community | ✓/✗ | ✓/✗ | - | ✓/✗ | ✓/✗ | |
| Meetings | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | - | |
| AI | ✓/✗ | ✓/✗ | ✓/✗ | - | ✓ | |
| Voice | ✓/✗ | ✓/✗ | ✓/✗ | - | ✓ | |
| SOS | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | - | |
| Location | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | - | |
| Fall Detection | ✓/✗ | ✓/✗ | ✓/✗ | ✓/✗ | - | |

Replace symbols with actual verified status.

---

# 32. DEAD CODE AUDIT

Search for:

```text
TODO
FIXME
mock
dummy
placeholder
hardcoded
localhost
test data
fake
temporary
```

Review every relevant occurrence.

Do not delete something simply because the word "mock" appears. Determine whether it is production code or a legitimate test.

---

# 33. MOCK DATA AUDIT

Production screens must not accidentally display:

```text
Fake patients
Fake notifications
Fake votes
Fake games
Fake memories
Fake locations
Fake safety events
```

unless explicitly required as seeded/demo data.

---

# 34. ENVIRONMENT AUDIT

Verify:

```text
Development
Test
Production
```

configuration separation.

Inspect:

```text
.env
.env.example
frontend environment variables
backend environment variables
mobile configuration
```

Never commit secrets.

---

# 35. API URL AUDIT

Find:

```text
localhost
127.0.0.1
hardcoded IPs
hardcoded production URLs
```

Ensure they are appropriate for the environment.

---

# 36. CORS AUDIT

Verify backend CORS configuration allows only intended origins.

Do not use:

```text
*
```

for sensitive production APIs unless explicitly justified.

---

# 37. COOKIE/TOKEN AUDIT

Verify:

```text
Secure
HttpOnly
SameSite
Expiration
Refresh behavior
Storage
```

according to the actual authentication architecture.

---

# 38. SECRET AUDIT

Search repository for:

```text
API keys
JWT secrets
database passwords
provider credentials
map keys
push credentials
AI keys
```

Do not expose or print secret values.

---

# 39. INPUT VALIDATION

Verify backend validates:

```text
Request body
Query parameters
Path parameters
Uploaded files
AI action parameters
Device IDs
Session IDs
```

Do not rely solely on frontend validation.

---

# 40. OUTPUT VALIDATION

Verify frontend safely handles unexpected backend responses.

Do not assume every field is always present.

---

# 41. ERROR CONTRACT

Verify backend/frontend agree on error structure.

Ensure users see understandable errors rather than raw:

```text
500
stack traces
database errors
provider errors
```

---

# 42. RATE LIMITING

Inspect rate limiting for:

```text
Authentication
AI
SOS
Voting
Registration
Uploads
```

Use actual backend configuration.

Do not introduce arbitrary client-side rate limits that break legitimate use.

---

# 43. FILE UPLOAD AUDIT

If uploads exist:

```text
Images
Videos
PDFs
Memory media
Profile images
Featured person images
```

verify:

```text
Validation
Size limits
MIME handling
Authorization
Storage
Error handling
```

---

# 44. IMAGE/MEDIA AUDIT

Check:

```text
Broken images
Missing fallback
Oversized assets
Unauthorized media
```

---

# 45. RICH TEXT AUDIT

If rich text exists:

```text
Sanitize HTML
Prevent XSS
Handle malformed content
```

Never blindly inject unsanitized content.

---

# 46. OFFLINE AUDIT

Verify offline behavior for:

```text
Games
Memories
Reminders
Community
Notifications
AI
Safety dashboard
Mobile safety
```

Each feature should clearly indicate what is unavailable offline.

Do not claim offline support that does not exist.

---

# 47. TIMEZONE AUDIT

Test:

```text
Reminders
Community sessions
Meetings
Notifications
Activity timestamps
Safety events
```

across date boundaries.

Use the project's established timezone architecture.

---

# 48. LOCALIZATION AUDIT

Verify:

```text
English
Hindi
Other configured languages
```

where supported.

Search for hardcoded patient-facing strings.

---

# 49. ACCESSIBILITY AUDIT

Verify:

```text
Keyboard navigation
Screen readers
Focus
Headings
Buttons
Forms
Dialogs
Tabs
Live regions
Color contrast
Touch targets
```

Pay special attention to:

```text
SOS
Voice
AI
Community voting
Registration
Notifications
```

---

# 50. ELDER-FRIENDLY UX AUDIT

Verify:

```text
Large buttons
Readable text
Minimal text
Simple navigation
Clear status
Limited simultaneous choices
```

Ensure newer phases did not make the interface unnecessarily complex.

---

# 51. RESPONSIVE AUDIT

Test:

```text
Desktop
Tablet
Mobile browser
```

Check:

```text
Navigation
Cards
Dialogs
AI
Voice
Safety
Community
Notifications
Games
```

---

# 52. PERFORMANCE AUDIT

Inspect:

```text
Initial load
API calls
Duplicate API calls
Large bundles
Image sizes
Repeated renders
Polling
Realtime subscriptions
Memory leaks
```

---

# 53. REALTIME AUDIT

If realtime exists:

```text
Subscribe
Receive
Update
Deduplicate
Reconnect
Unmount cleanup
```

Verify there are no duplicate websocket/SSE subscriptions.

---

# 54. BACKGROUND JOB AUDIT

If backend uses:

```text
Cron
Queues
Workers
Scheduled jobs
```

verify:

```text
Jobs start
Jobs execute
Failures are handled
Duplicate jobs are prevented where necessary
```

---

# 55. DEPENDENCY AUDIT

Inspect:

```text
npm dependencies
mobile dependencies
backend dependencies
```

Look for:

```text
Unused dependencies
Conflicting versions
Duplicate libraries
Obsolete packages
```

Do not upgrade major dependencies blindly.

---

# 56. BUILD AUDIT

Run the actual build commands for:

```text
Backend
Frontend
Mobile app
```

Use repository-defined commands.

Do not invent commands if package scripts already define them.

---

# 57. LINT AUDIT

Run configured linting.

Fix meaningful errors.

Do not disable lint rules simply to make the build pass.

---

# 58. TYPE/CODE QUALITY AUDIT

If TypeScript exists in any part of the repository, run the project's type checks.

If the project uses JavaScript:

```text
Use available static analysis.
```

Do not introduce TypeScript solely for F11.

---

# 59. TEST AUDIT

Run:

```text
Backend tests
Frontend tests
Integration tests
Mobile tests
```

where configured.

Record:

```text
Passed
Failed
Skipped
Not available
```

Do not claim tests exist if the repository does not contain them.

---

# 60. END-TO-END TESTING

Perform end-to-end tests for:

```text
Authentication
Patient dashboard
Game
Memory
Reminder
Community
Meeting
Notification
AI
Voice
Safety
Mobile connection
```

---

# 61. DATA CONSISTENCY TEST

Verify:

```text
Frontend state
Backend state
Database state
```

remain consistent after:

```text
Create
Update
Delete
Complete
Vote
Register
Mark read
SOS
```

---

# 62. REFRESH TEST

For important state:

```text
Perform action
 ↓
Refresh browser
 ↓
Verify state persists correctly
```

Test:

```text
Vote
Registration
Reminder
Memory
Notification read state
SOS state
```

where supported.

---

# 63. MULTI-USER TEST

Where possible, use multiple test accounts.

Verify:

```text
User A
cannot see
User B's
private data.
```

Test:

```text
Memories
Reminders
Notifications
Activities
AI conversations
Safety events
Location
Devices
```

---

# 64. ROLE TEST

Test all configured roles.

Verify:

```text
Patient
Admin
Other configured roles
```

only access intended features.

---

# 65. SECURITY TEST

Inspect for:

```text
IDOR
XSS
CSRF where relevant
Unsafe redirects
Authentication bypass
Authorization bypass
Sensitive logging
Secret leakage
```

Do not perform destructive security testing against external systems.

---

# 66. PRIVACY TEST

Verify sensitive information is minimized.

Especially:

```text
Health-related information
Memories
Location
Safety events
AI conversations
Voice transcripts
Emergency contacts
```

---

# 67. NO MEDICAL CLAIMS

Search patient-facing UI for unsupported claims such as:

```text
Treats dementia
Diagnoses dementia
Prevents dementia
Cures dementia
Guaranteed cognitive improvement
```

Replace or flag unsupported claims according to the project requirements.

Do not invent clinical claims.

---

# 68. SAFETY CLAIM AUDIT

Do not claim:

```text
Guaranteed fall detection
Guaranteed SOS delivery
Guaranteed location tracking
Guaranteed emergency response
```

unless the system actually provides and verifies those guarantees.

---

# 69. OBSERVABILITY

Verify production-safe logging.

Logs should help debugging without exposing:

```text
Passwords
Tokens
Precise locations
Private memories
AI prompts
AI responses
Voice transcripts
Emergency contact data
```

---

# 70. HEALTH CHECKS

If backend health endpoints exist:

```text
Verify them.
```

If production deployment requires health checks, ensure they do not expose secrets or sensitive data.

---

# 71. DEPLOYMENT AUDIT

Inspect:

```text
Frontend deployment configuration
Backend deployment configuration
Database configuration
Mobile build configuration
Environment variables
CORS
HTTPS
Storage
```

---

# 72. HTTPS

Production safety and authentication traffic should use HTTPS.

Do not claim production-ready security over plain HTTP.

---

# 73. DATABASE BACKUP

If the deployment architecture includes backups:

```text
Verify configuration/documentation.
```

Do not delete or alter production data.

---

# 74. MIGRATION AUDIT

If schema migrations exist:

```text
Verify they are reproducible.
```

Do not manually modify production databases to hide migration problems.

---

# 75. DOCUMENTATION AUDIT

Verify:

```text
README
CLAUDE.md
PROJECT_SPEC.md
ARCHITECTURE.md
DATABASE.md
FRONTEND_ARCHITECTURE.md
API contract
Phase reports
```

are not contradictory.

---

# 76. AI-DEVELOPER SAFETY

Because multiple AI agents may have contributed code:

Search for:

```text
duplicate components
duplicate API clients
duplicate services
duplicate models
duplicate routes
conflicting utilities
unused old implementations
```

---

# 77. DUPLICATE SYSTEM AUDIT

Specifically search for duplicate:

```text
Auth systems
Notification systems
Reminder systems
API clients
State managers
Localization systems
Date/time utilities
Realtime clients
AI clients
```

Consolidate where safe.

---

# 78. FRONTEND ROUTE AUDIT

List every frontend route.

Verify:

```text
Route exists
Page exists
Auth protection correct
Role protection correct
API calls correct
404 handling
```

---

# 79. BACKEND ROUTE AUDIT

List every backend route.

Verify:

```text
Controller exists
Service exists where appropriate
Validation exists
Authorization exists
Error handling exists
```

---

# 80. MOBILE ROUTE/SCREEN AUDIT

If the mobile app has navigation:

```text
List screens
Verify navigation
Verify authentication
Verify safety screens
```

---

# 81. DEAD END AUDIT

Find UI buttons that:

```text
Do nothing
Open wrong page
Call missing API
Show placeholder
```

Every patient-facing primary action must either work or clearly state why it is unavailable.

---

# 82. PLACEHOLDER AUDIT

Search for:

```text
Coming soon
TODO
Not implemented
Placeholder
Demo
```

Review every patient-facing occurrence.

---

# 83. HARD-CODED DATA AUDIT

Find hardcoded:

```text
Patient names
Vote counts
Registration counts
Dates
Times
Notification counts
AI responses
Safety status
Location
```

Remove accidental production hardcoding.

---

# 84. FRONTEND STATE AUDIT

Verify no page incorrectly assumes:

```text
Action succeeded
User is authorized
Data exists
Device is connected
AI responded
SOS succeeded
```

without backend confirmation.

---

# 85. NETWORK FAILURE AUDIT

Test representative failures:

```text
Backend offline
Slow network
Timeout
401
403
404
409
429
500
```

Verify user-friendly recovery.

---

# 86. LOADING STATE AUDIT

Every important asynchronous action should have an appropriate loading state.

Check:

```text
Login
Game
Memory
Reminder
Vote
Registration
Notifications
AI
SOS
```

---

# 87. EMPTY STATE AUDIT

Check:

```text
No games
No memories
No reminders
No sessions
No notifications
No activities
No meetings
No safety events
```

---

# 88. ERROR STATE AUDIT

Check every major feature has a meaningful error state.

Avoid blank screens.

---

# 89. FORM AUDIT

Verify:

```text
Validation
Error messages
Disabled states
Submission
Duplicate prevention
```

---

# 90. USER FEEDBACK AUDIT

After important actions:

```text
Vote
Register
Save memory
Create reminder
Mark notification read
Send SOS
```

the patient should receive clear confirmation when the backend confirms success.

---

# 91. MOBILE BATTERY AUDIT

Verify mobile safety services do not use unnecessary:

```text
GPS
Sensors
Network
Background loops
```

---

# 92. MOBILE PERMISSION AUDIT

Verify permissions are:

```text
Requested at appropriate time
Explained
Handled when denied
Handled when revoked
```

---

# 93. MOBILE BACKGROUND AUDIT

Test:

```text
App foreground
App background
App resumed
Network lost
Network restored
Device restarted
```

where supported.

---

# 94. MOBILE SAFETY RELIABILITY

Do not claim guaranteed background execution because mobile operating systems can restrict background activity.

Document actual limitations.

---

# 95. RELEASE BLOCKERS

Classify issues:

```text
P0 - Critical
P1 - High
P2 - Medium
P3 - Low
```

P0 examples:

```text
SOS broken
Unauthorized private-data access
Authentication bypass
Production secret exposed
Database corruption
Critical build failure
```

P1 examples:

```text
Major patient workflow broken
AI action incorrectly executes
Notifications completely broken
Mobile safety integration unavailable
```

---

# 96. FIX POLICY

F11 may fix:

```text
Integration bugs
Broken API contracts
Incorrect state handling
Security issues
Accessibility issues
Build issues
Test failures
Duplicate infrastructure
Obvious cross-phase inconsistencies
```

Do not expand F11 into a new feature-development phase.

---

# 97. NO FEATURE CREEP

Do not add:

```text
New games
New AI models
New community systems
New safety algorithms
New notification providers
New database architecture
```

unless required to repair a documented integration failure.

---

# 98. REGRESSION TESTING

After every significant fix:

```text
Run targeted test
 ↓
Run related integration test
 ↓
Run full relevant suite
```

Do not fix one feature while silently breaking another.

---

# 99. GIT SAFETY

Before modifications:

```bash
git status
git branch
```

Do not use:

```bash
git reset --hard
git clean -fd
```

Do not overwrite another developer's changes.

---

# 100. CHANGE DISCIPLINE

Keep F11 changes focused.

Before committing:

```bash
git diff
git diff --stat
```

Review every changed file.

Remove accidental:

```text
Debug files
Logs
Build artifacts
Secrets
Temporary files
```

---

# 101. FINAL VALIDATION COMMANDS

Use the repository's actual commands.

Typical examples:

```bash
npm test
npm run lint
npm run build
```

For backend:

```bash
npm test
npm run lint
```

For mobile, use the project's configured build/test commands.

Do not report a command as successful unless it actually ran successfully.

---

# 102. FINAL RELEASE CHECK

Verify:

```text
Backend builds
Frontend builds
Mobile builds
Tests pass
Lint passes
Environment configured
No secrets committed
Database configuration valid
API contracts consistent
Authentication works
Authorization works
Patient journey works
Admin journey works
AI works
Voice works where supported
Community works
Notifications work
Safety works
Mobile safety works where supported
```

---

# 103. FINAL SYSTEM SMOKE TEST

Perform:

```text
1. Register patient
2. Login
3. Open dashboard
4. Play a game
5. Complete a game
6. View memory
7. Create reminder
8. View notification
9. Vote for community session
10. View scheduled session
11. Pre-register
12. Open Meeting Circle
13. Open AI
14. Use voice where supported
15. Open Safety
16. Verify mobile device status
17. Verify location status
18. Verify fall detection status
19. Test SOS in a controlled test environment
20. Logout
```

Do not perform a real emergency action against real contacts during testing.

Use a test/sandbox environment for SOS and safety workflows.

---

# 104. FINAL DOCUMENTATION

Create:

```text
docs/F11_FULL_SYSTEM_INTEGRATION_REPORT.md
```

Use:

```text
# Memora F11 Full-System Integration Report

## Executive Summary

## System Inventory

## Architecture Verification

## Backend B0-B14 Audit

## Frontend F0-F10 Audit

## Mobile Safety Audit

## API Contract Audit

## Database Audit

## Authentication Audit

## Authorization Audit

## Patient Journey

## Admin Journey

## Games Integration

## Memory Integration

## Reminder Integration

## Community Integration

## Meeting Integration

## Notification Integration

## Activity Integration

## AI Integration

## Voice Integration

## Safety Integration

## SOS Verification

## Location Verification

## Fall Detection Verification

## Device Verification

## Mobile Integration

## Realtime Verification

## Offline Verification

## Timezone Verification

## Localization Verification

## Accessibility Verification

## Responsive Verification

## Performance Verification

## Security Audit

## Privacy Audit

## Secret Audit

## Dependency Audit

## Build Verification

## Test Verification

## End-to-End Verification

## Cross-Phase Integration Matrix

## Duplicate Infrastructure Found

## Dead Code Found

## Placeholder Code Found

## Hardcoded Data Found

## Issues Discovered

## Issues Fixed

## Remaining Issues

## P0 Issues

## P1 Issues

## P2 Issues

## P3 Issues

## Release Blockers

## Deployment Readiness

## Known Limitations

## Final Recommendation
```

---

# 105. FINAL RELEASE STATUS

End the report with exactly one of:

```text
RELEASE READY
```

or:

```text
RELEASE READY WITH KNOWN NON-BLOCKING ISSUES
```

or:

```text
NOT RELEASE READY
```

Choose based on actual verification.

Never choose "RELEASE READY" merely because builds pass.

---

# 106. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
Backend build: PASS/FAIL
Frontend build: PASS/FAIL
Mobile build: PASS/FAIL
Backend tests: PASS/FAIL/NOT AVAILABLE
Frontend tests: PASS/FAIL/NOT AVAILABLE
Mobile tests: PASS/FAIL/NOT AVAILABLE
Lint: PASS/FAIL/NOT AVAILABLE
API contract audit: PASS/FAIL
Database audit: PASS/FAIL
Authentication: PASS/FAIL
Authorization: PASS/FAIL
Patient journey: PASS/FAIL
Admin journey: PASS/FAIL
Games: PASS/FAIL
Memories: PASS/FAIL
Reminders: PASS/FAIL
Community: PASS/FAIL
Meetings: PASS/FAIL
Notifications: PASS/FAIL
AI: PASS/FAIL
Voice: PASS/FAIL/NOT SUPPORTED
SOS: PASS/FAIL/TEST ENVIRONMENT ONLY
Location: PASS/FAIL
Fall detection: PASS/FAIL/NOT SUPPORTED
Mobile safety: PASS/FAIL
Security: PASS/FAIL
Privacy: PASS/FAIL
Accessibility: PASS/FAIL
Localization: PASS/FAIL
Responsive UI: PASS/FAIL
Realtime: PASS/FAIL/NOT SUPPORTED
Offline behavior: PASS/FAIL
Deployment readiness: PASS/FAIL
Release status: RELEASE READY / RELEASE READY WITH KNOWN NON-BLOCKING ISSUES / NOT RELEASE READY
```

---

# 107. STOP CONDITION

After F11 is complete:

**STOP.**

Do not automatically create F12.

At this point the project should move from feature development into:

```text
Bug fixes
Clinical/user testing
Security review
Deployment
Monitoring
Documentation
Demo preparation
```

Any future phase must be created only after reviewing the actual F11 audit.

---

# FINAL PRINCIPLE

F11 is the moment where Memora stops being:

```text
B0 + B1 + ... + B14
+
F0 + F1 + ... + F10
```

and becomes:

```text
                         MEMORA
                            │
             ┌──────────────┼──────────────┐
             ↓              ↓              ↓
          Backend         Web App       Mobile App
             │              │              │
             └──────────────┼──────────────┘
                            ↓
                    Integrated System
                            │
       ┌────────────────────┼────────────────────┐
       ↓                    ↓                    ↓
   Cognitive              Memory              Safety
    Support              Support             Support
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ↓
                       AI Layer
                            ↓
                   Personalized Experience
```

Every major action must follow:

```text
Patient
 ↓
Frontend / Mobile
 ↓
Authenticated API
 ↓
Backend
 ↓
Database / Service
 ↓
Confirmed Result
 ↓
Frontend / Mobile
```

No phase report is proof by itself.

No frontend mock is a backend integration.

No button is complete until its real action works.

No API integration is complete until request and response contracts match.

No safety feature is complete until the real safety workflow is verified in a controlled environment.

No AI feature is complete until the actual B0-B14 implementation is connected.

No release is ready until the whole system has been tested together.

**F11 is the integration gate. Verify everything. Fix what is broken. Document what remains. Then stop.**
