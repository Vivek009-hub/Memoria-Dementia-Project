# Memora - Phase B14 Prompt: Full System Integration & Hardening

**Phase:** B14  
**Name:** Full System Integration & Hardening  
**Prerequisites:** B0-B13 completed/generated  
**Status:** Ready for implementation

---

# OBJECTIVE

Memora has now been developed across phases B0-B13 by multiple developers and AI-assisted coding workflows.

B14 is NOT a new feature phase.

The objective is to make the existing system work as ONE connected product.

The system must be audited, repaired, integrated, and tested across:

```text
Database
Backend
Authentication
Authorization
Web Frontend
Mobile App
Cognitive Games
Memory Assistance
Reminders
Community Sessions
Meeting Circle
Notifications
Analytics
AI
Safety Backend
Safety Mobile App
```

The core objective is:

```text
AUDIT
  ↓
IDENTIFY
  ↓
REPAIR
  ↓
INTEGRATE
  ↓
TEST
  ↓
VERIFY
```

Do NOT blindly rewrite the project.

Do NOT add major new features.

Do NOT assume previous phases are complete merely because their files exist.

---

# 1. CRITICAL RULES

## Rule 1: Read before modifying

Before changing code, inspect:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
```

Also inspect:

```text
B0-B13 prompts/documentation
```

Read the actual repository.

---

## Rule 2: Do not trust phase completion claims

A phase is NOT considered complete because:

```text
The prompt says completed
The developer says completed
The files exist
Tests exist
The route exists
The UI exists
```

Verify the implementation.

---

## Rule 3: Do not rewrite working code

If something works:

```text
KEEP IT
```

Only modify it if:

```text
A verified defect exists
An integration problem exists
A security problem exists
A specification mismatch exists
```

---

## Rule 4: No new major features

Do NOT introduce:

```text
New AI features
New game types
New safety features
New notification systems
New authentication systems
New databases
New mobile features
New community features
```

unless required to repair an existing implementation.

---

## Rule 5: Backend remains authoritative

The following must remain server-controlled:

```text
Authentication
Authorization
User roles
Memory ownership
Game results
Reminder state
Community voting
Community approval
Meeting scheduling
Notification generation
Analytics
AI authorization
Safety event state
Geofence decisions
Safety escalation
```

The web/mobile clients must not become the source of truth.

---

# 2. INITIAL REPOSITORY AUDIT

Before making modifications, inventory:

```text
Repository
Backend
Frontend
Mobile
Database
Models
Routes
Controllers
Services
Repositories
Middleware
Jobs
Workers
Queues
AI
Notifications
Tests
Configuration
Environment variables
Documentation
```

Identify:

```text
Missing files
Unused files
Duplicate files
Duplicate modules
Dead code
TODOs
FIXMEs
Stub implementations
Placeholder implementations
Mock implementations
Temporary code
Commented-out production logic
```

Do not automatically delete anything.

---

# 3. PROJECT STRUCTURE AUDIT

Verify that the actual structure matches:

```text
PROJECT_SPEC.md
CLAUDE.md
ARCHITECTURE.md
```

Identify:

```text
Backend code inside frontend
Frontend code inside backend
Mobile code mixed incorrectly
Duplicated utilities
Duplicated services
Incorrect imports
Circular dependencies
Broken module boundaries
```

Fix only verified issues.

---

# 4. DEPENDENCY AUDIT

Inspect:

```text
package.json
lock files
mobile dependencies
frontend dependencies
backend dependencies
```

Check:

```text
Missing dependencies
Unused dependencies
Conflicting versions
Deprecated dependencies
Duplicate libraries performing the same job
```

Do NOT perform a large dependency upgrade unless required.

---

# 5. ENVIRONMENT AUDIT

Inspect:

```text
.env.example
configuration files
environment loaders
```

Check that:

```text
Database configuration
JWT configuration
API URLs
CORS
Notification configuration
AI configuration
Mobile configuration
```

use consistent variable names.

Never print secret values.

Never commit secrets.

---

# 6. DATABASE AUDIT

Compare:

```text
DATABASE.md
      ↕
Actual models
      ↕
Actual queries
      ↕
Services
      ↕
Controllers
```

Check:

```text
Schema mismatches
Field name mismatches
Type mismatches
Missing references
Incorrect references
Missing indexes
Incorrect indexes
Duplicate models
Unused models
Missing timestamps
Incorrect relationships
```

---

# 7. DATABASE RELATIONSHIP AUDIT

Verify relationships among:

```text
User
Patient
Caregiver
Emergency Contact
Game
Game Result
Memory
Reminder
Community Session
Vote
Meeting
Notification
Analytics
AI Conversation
Safety Event
Location
Geofence
```

Every reference must point to the correct model/entity.

Do not create duplicate representations of the same concept.

---

# 8. DATABASE DATA OWNERSHIP

Verify that every user-owned resource has clear ownership.

Examples:

```text
Memory → patient/user
Game Result → patient/user
Reminder → patient/user
Safety Event → patient
Location → patient
Geofence → patient
AI Conversation → user
```

Do not rely on client-supplied ownership.

---

# 9. AUTHENTICATION AUDIT

Trace every protected request:

```text
Request
 ↓
Authentication middleware
 ↓
Authenticated identity
 ↓
Role/relationship
 ↓
Authorization
 ↓
Controller
 ↓
Service
 ↓
Database
```

Verify:

```text
Login
Logout
Token validation
Token refresh
Password handling
Session handling
Protected routes
```

Do not create a second authentication system.

---

# 10. AUTHORIZATION AUDIT

This is a CRITICAL security pass.

Test:

```text
Patient A → Patient A data ✓
Patient A → Patient B data ✗

Caregiver A → authorized patient ✓
Caregiver A → unrelated patient ✗

Normal user → admin endpoint ✗
Normal user → privileged endpoint ✗

Teacher/privileged roles → only allowed resources
```

Check for IDOR vulnerabilities.

Never trust:

```text
userId
patientId
caregiverId
role
```

from the client when they can be derived from authenticated identity.

---

# 11. ROLE AUDIT

Verify the actual project role model.

Do not assume roles from old prompts.

Use the authoritative specification.

Check:

```text
Admin
Teacher
Privilege User
User
Patient
Caregiver
```

or whatever roles actually exist in PROJECT_SPEC.md.

Ensure role checks are consistent across:

```text
Backend
Frontend
Mobile
```

Frontend/mobile role checks are UX only.

Backend authorization remains authoritative.

---

# 12. API INVENTORY

Generate an actual API inventory.

For each endpoint record:

```text
HTTP method
Path
Authentication
Authorization
Validation
Controller
Service
Database interaction
Response
Error behavior
Tests
```

Find endpoints that are:

```text
Defined but not registered
Registered but broken
Calling missing functions
Using wrong models
Using wrong fields
Missing validation
Missing authorization
Returning inconsistent responses
Duplicated
Unused
```

---

# 13. API CONTRACT AUDIT

Verify:

```text
Frontend request
      ↕
Backend route
      ↕
Controller
      ↕
Service
      ↕
Database
```

Check:

```text
Field names
Field types
Required fields
Optional fields
Enums
Status values
Dates
IDs
Pagination
Error format
```

Do not allow frontend/mobile assumptions to diverge from backend contracts.

---

# 14. STATUS / ENUM AUDIT

Search for inconsistent values.

Example:

```text
ACTIVE
active
Active
```

or:

```text
RESOLVED
COMPLETED
DONE
```

where one canonical value should exist.

Create a canonical representation.

Update consumers only when required.

---

# 15. B0 FOUNDATION AUDIT

Verify:

```text
Application startup
Configuration
Environment loading
Error handling
Logging
Database connection
Routing
Middleware
Project structure
```

Run the application from a clean environment if possible.

---

# 16. B1 DATABASE AUDIT

Verify:

```text
Database connection
Models
Schemas
Indexes
Relationships
CRUD
Validation
```

Test actual persistence.

Do not rely only on mocks.

---

# 17. B2 AUTHENTICATION AUDIT

Verify:

```text
Registration
Login
Logout
Password hashing
Token handling
Protected routes
Token expiration
Refresh if implemented
```

Test invalid credentials.

Test expired sessions.

Test unauthorized access.

---

# 18. B3 USER / CAREGIVER AUDIT

Verify:

```text
User profiles
Patient profiles
Caregiver relationships
Emergency contacts
Role management
Ownership
Authorization
```

Test caregiver access to authorized patients.

Test rejection of unrelated patients.

---

# 19. B4 COGNITIVE GAMES AUDIT

Verify:

```text
Game listing
Game availability
Game start
Game completion
Game result storage
Game result ownership
Score/progress storage
Analytics integration
```

Cross-phase flow:

```text
Patient
 ↓
Game
 ↓
Result
 ↓
B10 Analytics
```

Verify the actual data reaches analytics.

---

# 20. B5 MEMORY AUDIT

Verify:

```text
Create memory
Read memory
Update memory
Delete memory
Search memory
Ownership
Privacy
```

Cross-phase:

```text
B5 Memory
 ↓
B11 AI
 ↓
Memory Assistant
```

Verify unauthorized memories cannot enter AI context.

---

# 21. B6 REMINDER AUDIT

Verify:

```text
Create reminder
Update reminder
Delete reminder
Reminder scheduling
Reminder completion
Recurring reminders if implemented
```

Cross-phase:

```text
B6
 ↓
Reminder trigger
 ↓
B9
 ↓
Notification
```

Verify scheduled jobs actually work.

---

# 22. B7 COMMUNITY AUDIT

Verify:

```text
Voting
Vote uniqueness
Vote ownership
Admin approval
Session lifecycle
Session schedule
Pre-registration
Capacity
```

The required flow is:

```text
Admin creates voting option
 ↓
Patients vote
 ↓
Admin reviews votes
 ↓
Admin approves
 ↓
Scheduled session
 ↓
Patients pre-register
```

Verify approved sessions move correctly from voting to schedule.

---

# 23. B8 MEETING CIRCLE AUDIT

Verify:

```text
Meeting creation
Meeting scheduling
Host/guest
Meeting details
Registration
Join flow
Meeting status
```

Cross-phase:

```text
B7 Community
 ↓
Approved session
 ↓
B8 Meeting
```

Verify the integration actually works.

---

# 24. B9 NOTIFICATION AUDIT

B9 must remain the central notification system.

Verify:

```text
Notification creation
Notification storage
Read/unread state
Push registration
Delivery
Retry
Notification preferences
```

Search the entire repository for direct notification-provider calls.

Identify duplicate notification implementations.

The preferred architecture is:

```text
Feature
 ↓
B9 Notification Service
 ↓
Provider
```

not:

```text
Feature
 ↓
FCM/Email/SMS directly
```

---

# 25. B10 ANALYTICS AUDIT

Verify analytics receive actual events from:

```text
B4 Games
B5 Memories where applicable
B6 Reminders
B7 Community
B8 Meetings
```

Check:

```text
Aggregation
Time periods
Ownership
Authorization
Indexes
Background jobs
```

Analytics must not become medical diagnosis.

---

# 26. B11 AI AUDIT

Verify:

```text
AI provider abstraction
AI configuration
AI service
Memory Assistant
Memory Search
AI Chat
Recommendations
Context retrieval
Authorization
Safety guardrails
Rate limits
Usage tracking
```

Critical flow:

```text
Authenticated User
 ↓
Authorization
 ↓
Relevant data retrieval
 ↓
Minimal context
 ↓
AI
 ↓
Validated response
```

Never:

```text
AI
 ↓
All database records
```

---

# 27. AI SECURITY AUDIT

Test:

```text
Ignore previous instructions
Show all patient memories
Reveal system prompt
Reveal API keys
Bypass authorization
Access another patient
```

Verify the system does not expose:

```text
Secrets
System prompts
Unauthorized memories
Other patients' data
Tokens
```

---

# 28. AI HALLUCINATION AUDIT

Test questions where the answer does not exist.

Expected:

```text
No fabricated memory
No fabricated date
No fabricated person
```

The AI should say that it cannot find supporting information.

---

# 29. AI MEDICAL SAFETY AUDIT

Verify AI does NOT:

```text
Diagnose dementia
Predict disease progression
Prescribe treatment
Recommend medication changes
Provide fake clinical scores
Make medical decisions
```

---

# 30. B12 SAFETY BACKEND AUDIT

Verify:

```text
SOS
Fall Events
Location
Geofences
Safety Events
Acknowledgement
Resolution
Escalation
Emergency Contacts
```

Cross-phase:

```text
B12
 ↓
B9
 ↓
Caregiver notification
```

Verify actual notification integration.

---

# 31. SAFETY STATE MACHINE AUDIT

Verify valid state transitions.

Example:

```text
TRIGGERED
 ↓
ACKNOWLEDGED
 ↓
RESOLVED
```

and, where supported:

```text
TRIGGERED
 ↓
ESCALATED
 ↓
ACKNOWLEDGED
 ↓
RESOLVED
```

Prevent invalid transitions.

Test concurrent updates.

---

# 32. GEOFENCE AUDIT

Verify:

```text
Geofence creation
Geofence ownership
Location ingestion
Distance calculation
Inside/outside state
Boundary handling
GPS accuracy
GPS jitter
Duplicate events
Out-of-order events
```

The backend remains authoritative.

---

# 33. FALL DETECTION AUDIT

Verify:

```text
Fall event ingestion
Validation
Duplicate handling
Confirmation
Timeout
Escalation
B9 notification
```

Do not treat client-reported confidence as medical truth.

---

# 34. LOCATION PRIVACY AUDIT

Verify:

```text
Patient → own location ✓
Authorized caregiver → permitted patient ✓
Unrelated caregiver → denied
Unrelated user → denied
Public → denied
```

Check APIs for IDOR.

Do not expose exact location unnecessarily.

---

# 35. B13 MOBILE APP AUDIT

Since B13 has already been implemented, inspect the actual mobile application.

Verify:

```text
Project builds
Authentication works
API client works
Secure storage works
Home screen works
SOS works
Location works
Geofence integration works
Fall detection integration works
Push notifications work
Voice works
Localization works
Offline behavior works
```

Do NOT assume B13 is complete.

---

# 36. MOBILE → BACKEND AUDIT

For every mobile API call verify:

```text
Mobile request
 ↓
B12/B9/B11/etc.
 ↓
Correct endpoint
 ↓
Correct authentication
 ↓
Correct authorization
 ↓
Correct response
 ↓
Mobile parsing
```

Check field-name mismatches.

Example:

```text
Backend:
eventId

Mobile expects:
id
```

Identify and repair these issues.

---

# 37. MOBILE SECURITY AUDIT

Verify:

```text
No API secrets
No AI provider keys
No database credentials
Secure token storage
No plaintext sensitive storage
No unsafe logs
No direct database access
No direct AI provider access
```

Remember:

```text
Mobile code can be inspected.
```

Anything embedded in the application should be treated as potentially public.

---

# 38. MOBILE OFFLINE AUDIT

Test:

```text
Network disconnected
 ↓
SOS
 ↓
Retry/queue
 ↓
Network restored
 ↓
Backend
```

Also:

```text
Fall
 ↓
Offline
 ↓
Queue
 ↓
Reconnect
 ↓
B12
```

Ensure retries are idempotent.

---

# 39. MOBILE NOTIFICATION AUDIT

Verify:

```text
B9
 ↓
Push notification
 ↓
Mobile
 ↓
Correct screen
```

Do not trust notification payloads as authorization.

The mobile app must fetch and verify the resource.

---

# 40. MOBILE VOICE AUDIT

Verify:

```text
Microphone permission
Speech recognition
AI request
AI response
Text-to-speech
```

Critical commands such as SOS must require appropriate explicit confirmation.

---

# 41. MOBILE LOCALIZATION AUDIT

Verify:

```text
English
Hindi
Configured regional languages
```

Check:

```text
Buttons
Notifications
Accessibility labels
Errors
Safety messages
```

No important UI text should remain accidentally hardcoded.

---

# 42. MOBILE ACCESSIBILITY AUDIT

Verify:

```text
Large controls
Screen reader labels
High contrast
Large text
No color-only information
SOS visibility
```

---

# 43. CROSS-PHASE FLOW TESTING

This is the most important B14 work.

Actually execute the following flows.

---

## Flow A: Registration → Login

```text
Register
 ↓
Database
 ↓
Login
 ↓
Authenticated session
 ↓
Protected endpoint
```

Expected:

```text
Works end-to-end
```

---

## Flow B: Game → Analytics → AI

```text
Patient
 ↓
Play game
 ↓
Game result
 ↓
B10 analytics
 ↓
B11 recommendation
```

Verify actual data propagation.

---

## Flow C: Memory → AI Assistant

```text
Create memory
 ↓
Store memory
 ↓
Search through AI
 ↓
Relevant memory
 ↓
Grounded answer
```

Verify privacy.

---

## Flow D: Reminder → Notification

```text
Create reminder
 ↓
Scheduler
 ↓
B9
 ↓
Notification
 ↓
Mobile/Web
```

Verify actual delivery path.

---

## Flow E: Community → Meeting

```text
Admin creates session option
 ↓
Patient votes
 ↓
Admin approves
 ↓
Schedule
 ↓
Meeting
```

Verify database state transitions.

---

## Flow F: Meeting → Notification

```text
Meeting scheduled
 ↓
B9
 ↓
Patient notification
 ↓
Client opens meeting
```

---

## Flow G: SOS → Caregiver

```text
Patient
 ↓
Mobile SOS
 ↓
B12
 ↓
Safety Event
 ↓
B3 Emergency Contact
 ↓
B9
 ↓
Caregiver
 ↓
Acknowledgement
 ↓
Resolution
```

This flow MUST work.

---

## Flow H: Geofence → Caregiver

```text
Mobile location
 ↓
B12
 ↓
Geofence evaluation
 ↓
Breach
 ↓
Safety Event
 ↓
B9
 ↓
Caregiver
```

---

## Flow I: Fall → Escalation

```text
Mobile fall event
 ↓
B12
 ↓
Confirmation
 ↓
No response
 ↓
Escalation
 ↓
B9
 ↓
Caregiver
```

---

# 44. CLIENT CONSISTENCY AUDIT

Check web and mobile for:

```text
API URLs
Authentication
Field names
Status values
Error handling
Date formats
Time zones
IDs
Pagination
```

---

# 45. DATE / TIME AUDIT

This is especially important for:

```text
Reminders
Community Sessions
Meetings
Notifications
Analytics
Safety events
AI context
```

Verify:

```text
Timezone handling
UTC storage where appropriate
Local display
Daylight-saving behavior where relevant
Timestamp consistency
```

Do not use inconsistent date formats between modules.

---

# 46. FILE UPLOAD AUDIT

If Memora supports:

```text
Images
Videos
PDFs
Profile images
Memory media
```

verify:

```text
Upload
Validation
Storage
URL generation
Authorization
Deletion
Broken-file handling
```

Do not expose private files publicly without authorization.

---

# 47. ERROR HANDLING AUDIT

Every important operation should handle:

```text
Validation error
Authentication error
Authorization error
Not found
Conflict
Database failure
Network failure
External provider failure
Timeout
```

Do not expose stack traces to users.

---

# 48. FRONTEND ERROR AUDIT

Verify web/mobile clients handle:

```text
Loading
Success
Empty
Error
Offline
Retry
```

No blank screens.

No uncaught exceptions for normal backend failures.

---

# 49. API RESPONSE CONSISTENCY

Standardize where appropriate:

```json
{
  "success": true,
  "data": {}
}
```

and errors according to the project's existing convention.

Do not randomly change every endpoint if an established convention already exists.

---

# 50. SECURITY AUDIT

Inspect for:

```text
IDOR
Missing authorization
Mass assignment
Unsafe user-controlled fields
Injection
XSS
CSRF where applicable
CORS problems
Weak authentication
Insecure token handling
Sensitive logs
Secrets in source
Unsafe file uploads
Open redirects
Rate-limit bypass
```

Use the existing framework's security mechanisms.

Do not implement homemade security mechanisms when standard solutions exist.

---

# 51. MASS ASSIGNMENT

Check whether clients can submit fields such as:

```text
role
isAdmin
patientId
ownerId
status
approved
verified
```

and have the backend blindly save them.

Only allow explicitly permitted fields.

---

# 52. CORS AUDIT

Verify production CORS does not unnecessarily allow:

```text
*
```

for authenticated APIs.

Use the project's legitimate frontend origins.

Do not break development environments.

---

# 53. RATE LIMITING AUDIT

Verify appropriate protection for:

```text
Login
Registration
AI
SOS
Location
Fall events
Public endpoints
```

Do not make safety endpoints unusable due to overly aggressive limits.

---

# 54. FILE SECURITY

If uploads exist, verify:

```text
MIME validation
Extension validation
File size limits
Storage isolation
Authorization
```

Do not trust only the file extension.

---

# 55. BACKGROUND JOB AUDIT

Inspect:

```text
Reminder jobs
Notification jobs
Analytics jobs
AI jobs
Safety escalation jobs
Cleanup jobs
```

Verify:

```text
Registration
Idempotency
Retries
Error handling
Concurrency
No duplicate workers
```

---

# 56. JOB FAILURE HANDLING

A failed worker must not silently destroy state.

Example:

```text
Safety notification failed
```

must NOT become:

```text
Safety event resolved
```

---

# 57. LOGGING AUDIT

Logs must not expose:

```text
Passwords
Access tokens
Refresh tokens
AI API keys
Database credentials
Private memories
Exact location unnecessarily
Emergency contact secrets
```

Use safe identifiers.

---

# 58. OBSERVABILITY AUDIT

Ensure important flows can be diagnosed using:

```text
Request ID
Event ID
User/internal ID
Timestamp
Module
Status
```

without logging sensitive content.

---

# 59. PERFORMANCE AUDIT

Look for:

```text
N+1 database queries
Unbounded queries
Missing indexes
Large API responses
Unnecessary AI calls
Repeated API calls
Duplicate location processing
Slow startup
Blocking UI
```

Fix obvious high-impact problems.

Do not prematurely optimize everything.

---

# 60. API PAGINATION

Check endpoints returning lists:

```text
Memories
Games
Notifications
Community sessions
Meetings
Safety events
Analytics
```

Avoid returning unbounded collections.

Use existing pagination conventions.

---

# 61. AI PERFORMANCE

Avoid unnecessary AI calls.

Prefer:

```text
Simple database search
```

when an LLM is not needed.

Use AI when it provides real value.

---

# 62. MOBILE PERFORMANCE

Check:

```text
Startup
Rendering
API calls
Background location
Sensor usage
Push handling
Memory usage
Battery
```

---

# 63. TEST SUITE AUDIT

Run all existing tests.

Then inspect whether tests actually cover behavior.

Do not accept:

```text
Tests pass
```

without checking whether critical paths are tested.

---

# 64. ADD MISSING TESTS

Add tests for verified gaps in:

```text
Authentication
Authorization
Database
API
Cross-module integration
AI
Safety
Mobile
Notifications
```

Prioritize critical paths.

---

# 65. END-TO-END TESTS

At minimum create/verify tests for:

```text
Register → Login
Login → Protected API
Game → Analytics
Memory → AI
Reminder → Notification
Community → Meeting
Meeting → Notification
SOS → B12 → B9
Fall → B12 → B9
Geofence → B12 → B9
Mobile → Backend
```

---

# 66. SECURITY REGRESSION TESTS

Verify:

```text
Patient A cannot access Patient B
Caregiver cannot access unrelated patient
Normal user cannot access admin APIs
AI cannot retrieve unauthorized memory
Mobile cannot access unauthorized safety event
Notification deep link cannot bypass authorization
```

---

# 67. CLEAN ENVIRONMENT TEST

Where practical:

```text
Clone
Install dependencies
Configure environment
Start database
Run migrations/setup
Start backend
Start frontend
Start mobile
```

Verify the project works from a clean setup.

Document anything that prevents clean setup.

---

# 68. BUILD AUDIT

Run commands defined by the repository.

Use:

```bash
npm test
npm run lint
npm run build
```

only if those scripts actually exist.

For mobile:

```text
Use the framework's documented test/build commands.
```

Do not invent commands.

---

# 69. NO FAKE SUCCESS

Never report:

```text
"All tests passed"
```

unless they actually passed.

If a command fails:

```text
Report the failure honestly.
```

---

# 70. REPAIR STRATEGY

After the audit, repair issues in this order:

```text
1. CRITICAL security issues
2. Authentication/authorization failures
3. Database/schema mismatches
4. Broken APIs
5. Cross-phase integration failures
6. Safety failures
7. Notification failures
8. AI privacy/safety failures
9. Mobile/backend contract issues
10. Background job failures
11. Test gaps
12. Performance issues
13. Minor cleanup
```

Do not fix low-priority formatting while critical authorization is broken.

---

# 71. REPAIR RULE

For each verified issue:

```text
Identify
 ↓
Understand root cause
 ↓
Make smallest safe change
 ↓
Add/update regression test
 ↓
Run affected tests
 ↓
Run full suite later
```

Do not perform speculative rewrites.

---

# 72. DATABASE MIGRATION RULE

If a schema change is required:

```text
Document why
Update model
Update affected services
Update affected clients
Update tests
Update DATABASE.md
```

Do not silently alter production-sensitive schema behavior.

---

# 73. API CHANGE RULE

If an API contract must change:

```text
Backend
 ↓
Frontend
 ↓
Mobile
 ↓
Tests
 ↓
Documentation
```

must all be updated.

Do not fix the backend while leaving the mobile client using the old contract.

---

# 74. CROSS-PHASE FIX RULE

When fixing an integration:

Example:

```text
B12 expects:
eventId

Mobile sends:
id
```

Do not immediately create duplicate fields.

Determine the canonical contract and update all affected consumers.

---

# 75. GIT SAFETY

Before modifications:

```bash
git status
```

Record the current state.

Do NOT delete or reset existing developer work.

Do NOT use destructive commands such as:

```bash
git reset --hard
git clean -fd
```

unless explicitly instructed by the project owner.

---

# 76. COMMIT STRATEGY

Prefer small logical commits if the team workflow requires commits.

Examples:

```text
fix(auth): repair caregiver authorization
fix(safety): repair B12 notification integration
fix(ai): enforce memory ownership
fix(mobile): align safety API contract
test(integration): add SOS end-to-end test
```

Do not create one enormous opaque commit containing unrelated changes.

If the project workflow says Claude should not commit, do not commit.

---

# 77. MULTI-DEVELOPER SAFETY

Because multiple developers are working on Memora:

Before modifying a file:

```text
Check git status
Check recent changes
Inspect surrounding code
```

Do not overwrite another developer's work.

Preserve unrelated modifications.

---

# 78. CLAUDE / AI CODE SAFETY

Do not generate large blocks of replacement code without understanding the existing implementation.

Before editing:

```text
Read
Trace dependencies
Understand contract
Modify
Test
```

Avoid:

```text
"rewrite this entire module"
```

unless absolutely necessary.

---

# 79. DOCUMENTATION SYNCHRONIZATION

After repairs update:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
```

only where actual behavior has changed.

Do not rewrite documentation to falsely match broken code.

---

# 80. FINAL SYSTEM ARCHITECTURE

The desired architecture should resemble:

```text
                 ┌─────────────────────┐
                 │       WEB APP       │
                 └──────────┬──────────┘
                            │
                 ┌──────────▼──────────┐
                 │     MOBILE APP      │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │     API BACKEND     │
                 └──────────┬──────────┘
                            │
       ┌────────────────────┼─────────────────────┐
       ↓                    ↓                     ↓
 Authentication        Business Modules       Safety
       │                    │                     │
       │          ┌─────────┼─────────┐           │
       │          ↓         ↓         ↓           │
       │       Games     Memories  Reminders      │
       │          ↓         ↓         ↓           │
       │       Analytics  AI       Community       │
       │                    │         │            │
       │                    └────┬────┘            │
       │                         ↓                 │
       │                     Meetings              │
       │                                           │
       └────────────────────┬──────────────────────┘
                            ↓
                     Notification B9
                            ↓
                     Push / Email / etc.
                            │
                            ↓
                       Caregivers
```

Database:

```text
All backend modules
       ↓
Single authoritative database layer
```

AI:

```text
Authorized backend context
       ↓
B11
       ↓
AI provider
```

Safety:

```text
Mobile
 ↓
B12
 ↓
B9
 ↓
Caregiver
```

---

# 81. DEFINITION OF DONE

B14 is complete only when:

[ ] Repository audited
[ ] B0 audited
[ ] B1 audited
[ ] B2 audited
[ ] B3 audited
[ ] B4 audited
[ ] B5 audited
[ ] B6 audited
[ ] B7 audited
[ ] B8 audited
[ ] B9 audited
[ ] B10 audited
[ ] B11 audited
[ ] B12 audited
[ ] B13 audited
[ ] Database verified
[ ] Database relationships verified
[ ] API inventory completed
[ ] API contracts verified
[ ] Authentication verified
[ ] Authorization verified
[ ] IDOR testing completed
[ ] Role permissions verified
[ ] Cross-phase integrations verified
[ ] Notification architecture unified
[ ] AI authorization verified
[ ] AI privacy verified
[ ] AI safety verified
[ ] Safety lifecycle verified
[ ] Geofence verified
[ ] Fall detection integration verified
[ ] SOS verified
[ ] Mobile/backend contracts verified
[ ] Offline behavior verified
[ ] Push notifications verified
[ ] Voice integration verified
[ ] Localization verified
[ ] Accessibility verified
[ ] Background jobs verified
[ ] Idempotency verified
[ ] Concurrency issues addressed
[ ] Error handling verified
[ ] Logging reviewed
[ ] Secrets reviewed
[ ] CORS reviewed
[ ] Rate limiting reviewed
[ ] File uploads reviewed where applicable
[ ] Performance bottlenecks reviewed
[ ] Missing critical tests added
[ ] End-to-end tests added/verified
[ ] Security regression tests added/verified
[ ] Clean setup tested where practical
[ ] Backend tests pass
[ ] Frontend tests pass where available
[ ] Mobile tests pass where available
[ ] Lint passes
[ ] Builds pass
[ ] Documentation synchronized
[ ] No major feature creep
[ ] No unnecessary rewrites
[ ] No secrets committed

---

# 82. FINAL REPORT

Create:

```text
docs/B14_INTEGRATION_REPORT.md
```

Use this structure:

# Memora B14 Full System Integration Report

## Executive Summary

```text
READY
READY WITH KNOWN ISSUES
NOT READY
```

## Repository Health

## B0 Status

## B1 Status

## B2 Status

## B3 Status

## B4 Status

## B5 Status

## B6 Status

## B7 Status

## B8 Status

## B9 Status

## B10 Status

## B11 Status

## B12 Status

## B13 Status

## Database Findings

## API Findings

## Authentication Findings

## Authorization Findings

## Security Findings

## AI Findings

## Safety Findings

## Mobile Findings

## Notification Findings

## Background Job Findings

## Cross-Phase Integration Findings

## Bugs Fixed

For each:

```text
Issue
Root cause
Files changed
Fix
Regression test
```

## Remaining Issues

For each:

```text
Issue
Severity
Reason not fixed
Recommended next step
```

## Tests Executed

```text
Command
Result
```

## End-to-End Tests

```text
Flow
Result
```

## Performance Findings

## Security Test Results

## Documentation Changes

## Final Recommendation

Choose exactly:

```text
READY FOR PRODUCTION HARDENING
READY FOR DEPLOYMENT TESTING
NOT READY
```

---

# 83. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also provide:

```text
Backend test result
Frontend test result
Mobile test result
Lint result
Build result
Integration result
```

Do not claim success unless verified.

---

# 84. STOP CONDITION

After completing B14:

**STOP.**

Do not create another feature phase automatically.

Do not begin new functionality.

The next stage should be treated as:

```text
PRODUCTION HARDENING & DEPLOYMENT
```

Focus on:

```text
Security audit
Privacy review
Load testing
Real-device testing
Failure recovery
Production configuration
Monitoring
Backups
Deployment
CI/CD
Domain/SSL
Database production setup
AI provider production configuration
Notification provider production configuration
Mobile release configuration
Final documentation
```

B14's goal is simple:

```text
B0-B13
   ↓
ONE CONNECTED SYSTEM
   ↓
VERIFIED
   ↓
TESTED
   ↓
RELIABLE
```

Do not move forward until the actual repository demonstrates that the pieces work together.
