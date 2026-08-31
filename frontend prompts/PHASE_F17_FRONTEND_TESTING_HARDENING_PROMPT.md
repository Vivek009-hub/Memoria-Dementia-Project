# Memora - Phase F17 Prompt
# Frontend Testing & Hardening

**Phase:** F17  
**Name:** Frontend Testing & Hardening  
**Prerequisites:** F0-F16 completed  
**Purpose:** Perform the final frontend quality, reliability, security, performance, regression, and release-readiness pass across the complete Memora application.

---

# 0. EXECUTIVE INSTRUCTION

This is the **final frontend testing and hardening phase**.

Do NOT add unrelated features.

Do NOT redesign working modules.

Do NOT create mock functionality.

Do NOT assume F0-F16 are correct merely because previous reports say they are complete.

The actual repository and runtime behavior are authoritative.

The required workflow is:

```text
AUDIT
  ↓
TEST
  ↓
DISCOVER
  ↓
CLASSIFY
  ↓
FIX
  ↓
RETEST
  ↓
REGRESSION TEST
  ↓
PERFORMANCE TEST
  ↓
SECURITY TEST
  ↓
RE-AUDIT
  ↓
RELEASE CHECK
  ↓
DOCUMENT
```

F17 should leave the frontend in a **release-candidate state**.

---

# 1. READ FIRST

Read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/FRONTEND_ARCHITECTURE.md
docs/FRONTEND_API_CONTRACT.md
docs/F11_FULL_SYSTEM_INTEGRATION_REPORT.md
docs/F12_CAREGIVER_DASHBOARD_REPORT.md
docs/F13_ADMIN_DASHBOARD_REPORT.md
docs/F14_ANALYTICS_PROGRESS_REPORT.md
docs/F15_V2_FULL_INTEGRATION_REPORT.md
docs/F15_V2_INTEGRATION_AUDIT.md
docs/F16_ACCESSIBILITY_LOCALIZATION_REPORT.md
```

Inspect the actual repository.

---

# 2. SOURCE OF TRUTH

Use:

```text
Actual source code
        ↓
Actual backend behavior
        ↓
Actual database behavior
        ↓
Actual tests
        ↓
Actual runtime/browser behavior
        ↓
Documentation
```

Previous phase reports are not proof.

If documentation says PASS but runtime fails:

```text
Runtime = FAIL
```

---

# 3. F17 SCOPE

Audit:

```text
Frontend functionality
Frontend ↔ backend integration
Authentication
Authorization
Routing
State management
API handling
Realtime
Games
Memory
Reminders
Community
Meetings
Notifications
AI
Safety
Analytics
Caregiver
Admin
Accessibility
Localization
Security
Performance
Responsive behavior
Browser compatibility
Error handling
Offline behavior
Build
Deployment configuration
```

---

# 4. TEST ENVIRONMENT

Document:

```text
Operating system
Node version
Package manager
Frontend framework/version
Backend framework/version
Database environment
Browser(s)
Viewport sizes
Environment variables required
Test database
External providers
```

Never expose secret values.

---

# 5. GIT SAFETY

Before changes:

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

Do not overwrite another developer's changes.

Suggested branch:

```text
feature/f17-testing-hardening
```

---

# 6. TEST CLASSIFICATION

Use:

```text
P0 = Critical release blocker
P1 = Major release blocker
P2 = Important issue
P3 = Minor issue
```

F17 should end with:

```text
P0 = 0
P1 = 0
```

unless a genuine external blocker is documented.

---

# 7. REQUIRED ISSUE FORMAT

For every issue:

```text
Issue ID:
Severity:
Feature:
Environment:
Steps to Reproduce:
Expected:
Actual:
Root Cause:
Impact:
Fix:
Files Changed:
Test Added/Updated:
Retest:
Result:
Status:
```

---

# 8. AUTOMATIC FIX LOOP

For every safely fixable P0/P1/P2:

```text
Discover
 ↓
Document
 ↓
Find root cause
 ↓
Fix
 ↓
Test
 ↓
Retest
 ↓
Regression test
 ↓
Mark FIXED
```

Do not stop at reporting bugs.

Do not mark FIXED without retesting.

---

# 9. TEST INVENTORY

First identify actual test tooling.

Inspect:

```text
package.json
test configuration
lint configuration
build configuration
E2E configuration
CI configuration
```

Use the existing framework.

Do not replace test infrastructure without a strong reason.

---

# 10. UNIT TESTING

Test important isolated logic:

```text
Utility functions
Validation
Formatting
State transformations
API response normalization
Permission helpers
Date/time helpers
Localization helpers
```

---

# 11. COMPONENT TESTING

Test important components:

```text
Forms
Dialogs
Buttons
Cards
Navigation
Tables
Charts
Game components
Reminder components
Memory components
Notification components
Safety components
```

---

# 12. PAGE TESTING

Test major pages:

```text
Landing
Login
Register
Patient Dashboard
Games
Memory
Reminders
Community
Meeting Circle
AI Assistant
Notifications
Safety
Caregiver Dashboard
Admin Dashboard
Analytics
Progress
```

---

# 13. AUTHENTICATION TESTING

Test:

```text
Registration
Login
Logout
Session persistence
Session expiry
Invalid credentials
Expired credentials
Protected routes
Unauthorized API
```

Expected behavior must be verified.

---

# 14. AUTHORIZATION TESTING

Test:

```text
Patient
Caregiver
Admin
Other actual project roles
```

Verify:

```text
Correct route access
Correct API access
Correct data scope
```

---

# 15. IDOR TESTING

Attempt unauthorized access to:

```text
Patient
Memory
Reminder
Game result
Analytics
Community registration
Meeting
Notification
Safety event
Caregiver relationship
```

Changing an ID must not bypass backend authorization.

---

# 16. PRIVILEGE ESCALATION

Attempt:

```text
Patient → Admin
Patient → Caregiver
Caregiver → Admin
Unauthorized role changes
```

Frontend hiding a button is not sufficient.

---

# 17. ROUTING TESTING

Test:

```text
Direct URL
Refresh
Back
Forward
Protected route
Unauthorized route
Unknown route
Deep link
```

---

# 18. NAVIGATION TESTING

Every important navigation element must:

```text
Go to correct route
Preserve expected state
Handle loading
Handle errors
```

No dead navigation.

---

# 19. API TESTING

Test actual frontend API integration.

Verify:

```text
Method
URL
Headers
Authentication
Body
Parameters
Response
Errors
```

---

# 20. API FAILURE TESTING

Simulate:

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

Verify the frontend handles each appropriately.

---

# 21. NETWORK INTERRUPTION

Test:

```text
Normal connection
 ↓
Disconnect
 ↓
Perform safe operation
 ↓
Reconnect
```

Verify:

```text
No unexplained data loss
No duplicate mutation
Clear status
Recovery
```

---

# 22. RETRY TESTING

Verify retries do not cause duplicate:

```text
Votes
Registrations
Reminders
Memories
Safety events
Notifications
```

---

# 23. PATIENT E2E

Run a realistic patient journey:

```text
Register
 ↓
Login
 ↓
Dashboard
 ↓
Game
 ↓
Game result
 ↓
Progress
 ↓
Memory
 ↓
Reminder
 ↓
Notification
 ↓
Community vote
 ↓
Session registration
 ↓
Meeting
 ↓
AI
 ↓
Safety
 ↓
Logout
```

---

# 24. CAREGIVER E2E

Run:

```text
Login
 ↓
Caregiver Dashboard
 ↓
Authorized patient
 ↓
Activity
 ↓
Games
 ↓
Memory
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
 ↓
Logout
```

Verify patient isolation.

---

# 25. ADMIN E2E

Run:

```text
Login
 ↓
Admin Dashboard
 ↓
Users
 ↓
Roles
 ↓
Content
 ↓
Community
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
 ↓
Logout
```

---

# 26. COGNITIVE GAMES

Test each implemented game:

```text
Launch
Instructions
Controls
Gameplay
Completion
Result
Persistence
History
Progress
Restart
Exit
```

Test edge cases:

```text
Immediate exit
Refresh during game
Network loss
Repeated completion
Invalid state
```

---

# 27. MEMORY

Test:

```text
Create
Read
Update
Delete
Search
Media
Empty state
Large content
Invalid input
Unauthorized access
```

---

# 28. REMINDERS

Test:

```text
Create
Read
Update
Delete
Complete
Snooze
Schedule
Notification
```

where supported.

Test:

```text
Past date
Future date
Timezone
Duplicate reminder
Invalid date
```

---

# 29. COMMUNITY

Test:

```text
Voting
Vote restrictions
Pre-registration
Registration
Approval
Scheduling
Capacity
Session display
Meeting access
```

Test duplicate voting and registration.

---

# 30. MEETING CIRCLE

Test:

```text
Upcoming
Registered
Join
Invalid/expired access
Capacity
Session status
```

---

# 31. NOTIFICATIONS

Test:

```text
Creation
Display
Read
Unread
Realtime
Navigation
Dismissal where supported
```

Verify notification scope.

---

# 32. REALTIME

Test:

```text
Connect
Authenticate
Receive event
Disconnect
Reconnect
Multiple tabs
Logout
```

Verify no cross-user events.

---

# 33. AI

Test:

```text
Request
Loading
Response
Error
Timeout
Rate limit
Conversation
Logout
```

If AI actions exist:

```text
Authorization
Confirmation
Backend action
Result
```

must be tested.

---

# 34. VOICE

If implemented:

```text
Permission
Input
Processing
Response
Audio
Failure
```

Test unsupported browser/device behavior.

---

# 35. SAFETY

Safety receives P0-level attention.

Test controlled simulations for:

```text
SOS
Fall event
Location
Geofence
Device status
Safety notification
Resolution
```

Do not trigger real emergency services.

---

# 36. SOS

Test:

```text
Initiate
Confirm
Cancel
Send
Failure
Notification
Status
Resolution
```

Ensure duplicate submissions are controlled.

---

# 37. FALL DETECTION

Use simulated events.

Test:

```text
Event
Backend
Notification
Caregiver/admin
Resolution
Duplicate event
```

---

# 38. LOCATION

Test:

```text
Permission denied
Permission granted
Location unavailable
Network unavailable
Location update
Authorization
```

---

# 39. GEOFENCING

If implemented:

```text
Inside boundary
Outside boundary
Boundary condition
Network failure
Duplicate alert
```

Verify correct source of truth.

---

# 40. MOBILE INTEGRATION

If mobile app exists, test:

```text
Login
Device registration
Sync
Push
Location
Safety
Logout
```

---

# 41. ANALYTICS

Test:

```text
Game activity
Reminder activity
Community activity
Memory activity
AI activity
Safety summaries
```

where supported.

Verify:

```text
No fake values
Correct role scope
Date filters
Empty state
Large data
```

---

# 42. ACCESSIBILITY REGRESSION

Re-run F16 critical checks:

```text
Keyboard
Focus
Screen reader
Contrast
Zoom
Forms
Dialogs
Tables
Charts
SOS
Games
```

---

# 43. LOCALIZATION REGRESSION

Test configured languages:

```text
Language switch
Fallback
Pluralization
Dates
Numbers
Long text
Missing key
```

---

# 44. SECURITY TESTING

Audit:

```text
XSS
IDOR
Privilege escalation
Authentication bypass
Sensitive data exposure
Token exposure
Unsafe storage
File upload
CORS
Open redirects where relevant
```

---

# 45. XSS TESTING

Test user-controlled fields such as:

```text
Names
Memory text
Session content
Rich text
Comments
AI-related rendered content
```

Ensure sanitization remains active.

---

# 46. FILE UPLOAD SECURITY

Test:

```text
Invalid file
Large file
Wrong MIME type
Unexpected extension
Malicious filename
Unauthorized upload
Unauthorized retrieval
```

Do not disable backend validation.

---

# 47. STORAGE SECURITY

Audit:

```text
localStorage
sessionStorage
IndexedDB
cookies
```

Ensure sensitive information is not unnecessarily stored.

---

# 48. BROWSER STORAGE CLEANUP

Test:

```text
Logout
Session expiry
Account switch
Patient switch
```

Verify protected data is cleared appropriately.

---

# 49. CONSOLE AUDIT

Run the application and inspect:

```text
Errors
Warnings
Failed requests
Unhandled promises
React warnings
Accessibility warnings
```

Production-critical console errors should be zero.

---

# 50. NETWORK AUDIT

Inspect browser network activity for:

```text
Failed requests
Duplicate requests
Unexpected endpoints
Unexpected payloads
Secrets
Sensitive query parameters
```

---

# 51. PERFORMANCE TESTING

Measure important pages:

```text
Landing
Login
Patient Dashboard
Games
Memory
Reminders
Community
AI
Safety
Caregiver
Admin
Analytics
```

---

# 52. PERFORMANCE ISSUES

Look for:

```text
Large JavaScript bundles
Large images
Unnecessary renders
Duplicate API calls
Slow charts
Large lists
Memory leaks
Long blocking operations
```

Fix practical issues.

---

# 53. MEMORY LEAK TESTING

Inspect:

```text
Timers
Intervals
Event listeners
WebSocket subscriptions
SSE subscriptions
Observers
Media streams
```

Ensure cleanup on unmount/navigation.

---

# 54. REALTIME CLEANUP

Verify navigating away from a realtime page does not leave stale subscriptions.

---

# 55. PAGINATION

Test large datasets for:

```text
Users
Patients
Notifications
Memories
Game history
Activity
Analytics
Community
```

where applicable.

---

# 56. SEARCH

If search exists:

```text
Normal query
Empty query
No results
Special characters
Large query
Unauthorized data
```

---

# 57. FILTERS

Test:

```text
No filter
Single filter
Multiple filters
Clear filter
Invalid filter
Date range
```

---

# 58. DATE/TIME

Test:

```text
Timezone
Day boundary
Month boundary
Year boundary
Past
Future
DST where relevant
```

---

# 59. RESPONSIVE TESTING

Test at minimum:

```text
Mobile
Tablet
Desktop
```

Check:

```text
Navigation
Forms
Games
Charts
Tables
Dialogs
Safety
```

---

# 60. BROWSER TESTING

Use the browsers actually supported by the project.

Test:

```text
Login
Patient
Caregiver
Admin
Game
Memory
Reminder
Community
AI
Safety
Analytics
```

---

# 61. BUILD TESTING

Run the actual production build.

Verify:

```text
Build succeeds
No unresolved imports
No missing assets
No environment errors
No route build errors
```

---

# 62. LINT

Run the project's actual lint command.

Fix:

```text
Errors
Important warnings
```

Do not blindly disable lint rules.

---

# 63. TYPE CHECKING

If the project uses TypeScript:

```text
Run type checker.
```

Fix meaningful type errors.

If the project uses JavaScript:

```text
Use existing validation/testing conventions.
```

Do not introduce TypeScript solely for F17.

---

# 64. DEPENDENCY AUDIT

Inspect:

```text
npm audit
Outdated critical dependencies
Known vulnerable packages
Unused packages
```

Do not blindly upgrade major dependencies.

Evaluate compatibility before changing versions.

---

# 65. PACKAGE AUDIT

Remove clearly unused dependencies only after verifying they are unused.

---

# 66. ENVIRONMENT AUDIT

Verify:

```text
Frontend API URL
Backend URL
AI provider
Storage
Notifications
Realtime
Mobile
```

No development-only configuration should accidentally become production configuration.

---

# 67. SECRET SCAN

Search for:

```text
API keys
JWT secrets
Database credentials
Provider tokens
Private keys
Passwords
```

Do not print secrets in reports.

If a real secret has been committed:

```text
Remove it
Rotate it
Document it
```

---

# 68. CORS

Verify production-safe origins.

Do not use unrestricted CORS unnecessarily.

---

# 69. ERROR BOUNDARIES

Ensure unexpected frontend errors do not blank the entire application unnecessarily.

Use existing error boundary architecture.

---

# 70. RECOVERY

Test:

```text
Component error
API error
Network error
Session error
```

Verify useful recovery paths.

---

# 71. LOADING

Every major API-driven page must correctly support:

```text
Loading
Success
Empty
Error
```

---

# 72. EMPTY STATES

Verify empty states are distinguishable from failures.

---

# 73. USER FEEDBACK

Verify important actions provide clear feedback:

```text
Saved
Deleted
Completed
Registered
Voted
Sent
Failed
```

---

# 74. DOUBLE SUBMISSION

Test rapid clicking on:

```text
Submit
Save
Vote
Register
SOS
Delete
Send
```

Prevent duplicate operations where necessary.

---

# 75. DESTRUCTIVE ACTIONS

Verify:

```text
Delete
Remove
Cancel
SOS
```

have appropriate confirmation/guarding.

Do not add unnecessary confirmation to routine actions.

---

# 76. RACE CONDITIONS

Test rapid:

```text
Navigation
Filtering
Saving
Refreshing
Patient switching
```

Ensure stale responses do not overwrite newer state.

---

# 77. STALE STATE

Test:

```text
Mutation
Navigate away
Return
Refresh
Switch user/patient
```

---

# 78. MULTI-TAB TESTING

Test:

```text
Login in tab A
Logout in tab B
```

and other important shared-session behavior where supported.

---

# 79. SESSION EXPIRY

Test an expired session during:

```text
Form submission
API request
Realtime connection
Navigation
```

---

# 80. SECURITY LOGGING

Ensure no sensitive information is exposed in:

```text
Console
Network logs
Error reports
Analytics
URLs
```

---

# 81. PRODUCTION ERROR MESSAGES

Users should not see:

```text
Stack trace
MongoDB error
Internal server path
Provider error
Secret
```

---

# 82. ACCESSIBILITY FINAL CHECK

Verify:

```text
Keyboard
Screen reader
Focus
Contrast
Zoom
Reduced motion
Forms
Dialogs
Charts
Tables
Safety
```

---

# 83. LOCALIZATION FINAL CHECK

Verify:

```text
English
Hindi if supported
Other configured languages
Fallback
Long text
Pluralization
Date
Number
```

---

# 84. USER EXPERIENCE HARDENING

Look for confusing states such as:

```text
Button appears clickable but is not
Loading never ends
Empty state looks like an error
Success looks like failure
Error has no recovery
```

Fix only meaningful problems.

---

# 85. TEST DATA CLEANUP

Use isolated test accounts/data.

Do not leave:

```text
Fake users
Test safety events
Test tokens
Debug records
```

in production data.

---

# 86. DATABASE SAFETY

Do not perform destructive production database operations during frontend testing.

---

# 87. EXTERNAL SERVICES

Document unavailable dependencies:

```text
AI provider
Email
Push
Storage
Realtime
Maps
```

Do not claim PASS when an essential external service was never tested.

---

# 88. BLOCKED TESTS

If a test cannot run:

```text
Mark BLOCKED.
Explain dependency.
Do not mark PASS.
```

---

# 89. TEST EVIDENCE

For important tests record:

```text
Test name
Environment
Steps
Expected
Actual
Result
```

Screenshots/logs may be referenced where the project workflow supports them.

---

# 90. COVERAGE

If test coverage tooling exists, measure it.

Do not chase a specific percentage blindly.

Prioritize:

```text
Security
Authentication
Authorization
Safety
Core user workflows
Data mutations
Critical error paths
```

---

# 91. FINAL REGRESSION

After all fixes:

```text
Run unit tests
 ↓
Run component tests
 ↓
Run integration tests
 ↓
Run E2E tests
 ↓
Run security checks
 ↓
Run accessibility checks
 ↓
Run localization checks
 ↓
Run production build
```

---

# 92. FINAL P0/P1 GATE

Before completion:

```text
P0 remaining = 0
P1 remaining = 0
```

If not:

```text
F17 = BLOCKED
```

unless a genuine external blocker is documented.

---

# 93. P2/P3 POLICY

P2/P3 may remain only when:

```text
Non-security
Non-safety
Non-data-loss
Non-core
```

and explicitly documented.

---

# 94. RELEASE CANDIDATE CHECKLIST

Verify:

[ ] All F0-F16 modules tested  
[ ] Patient journey passes  
[ ] Caregiver journey passes  
[ ] Admin journey passes  
[ ] Authentication passes  
[ ] Authorization passes  
[ ] IDOR tests pass  
[ ] Games pass  
[ ] Memory passes  
[ ] Reminders pass  
[ ] Community passes  
[ ] Meetings pass  
[ ] Notifications pass  
[ ] Realtime passes where supported  
[ ] AI passes where supported  
[ ] Voice passes where supported  
[ ] Safety passes  
[ ] SOS passes in controlled testing  
[ ] Fall detection passes in controlled testing  
[ ] Location passes where supported  
[ ] Geofencing passes where supported  
[ ] Mobile integration passes where supported  
[ ] Analytics passes  
[ ] File uploads pass where supported  
[ ] Accessibility regression passes  
[ ] Localization regression passes  
[ ] Responsive testing passes  
[ ] Browser testing passes  
[ ] API errors handled  
[ ] Network interruption handled  
[ ] Retry behavior verified  
[ ] Double submission controlled  
[ ] Race conditions reviewed  
[ ] Stale state reviewed  
[ ] Multi-tab behavior reviewed  
[ ] Session expiry tested  
[ ] Console errors reviewed  
[ ] Network errors reviewed  
[ ] Security audit completed  
[ ] Secret scan completed  
[ ] Storage audit completed  
[ ] Dependency audit completed  
[ ] CORS reviewed  
[ ] Performance reviewed  
[ ] Memory leaks reviewed  
[ ] Build passes  
[ ] Lint passes  
[ ] Type check passes where applicable  
[ ] P0 = 0  
[ ] P1 = 0  
[ ] Remaining P2/P3 documented  
[ ] No fake production data  
[ ] No test data contamination  
[ ] Documentation updated  

---

# 95. FINAL REPORT

Create:

```text
docs/F17_FRONTEND_TESTING_HARDENING_REPORT.md
```

Use:

```text
# Memora F17 Frontend Testing & Hardening Report

## Executive Summary

## Test Environment

## Repository Audit

## F0-F16 Regression Audit

## Test Infrastructure

## Unit Tests

## Component Tests

## Integration Tests

## End-to-End Tests

## Authentication Testing

## Authorization Testing

## IDOR Testing

## Patient E2E

## Caregiver E2E

## Admin E2E

## Games

## Memory

## Reminders

## Community

## Meetings

## Notifications

## Realtime

## AI

## Voice

## Safety

## SOS

## Fall Detection

## Location

## Geofencing

## Mobile Integration

## Analytics

## File Uploads

## Network Failure Testing

## Retry Testing

## Race Condition Testing

## Double Submission Testing

## Multi-Tab Testing

## Session Expiry

## Accessibility Regression

## Localization Regression

## Responsive Testing

## Browser Testing

## Performance Testing

## Memory Leak Testing

## Security Testing

## Secret Audit

## Dependency Audit

## CORS

## Environment Configuration

## Console Audit

## Network Audit

## Build

## Lint

## Type Checking

## Issues Discovered

## P0 Issues

## P1 Issues

## P2 Issues

## P3 Issues

## Issues Fixed

## Remaining Issues

## Blocked Tests

## Production Blockers

## Release Candidate Assessment

## Final Recommendations
```

---

# 96. ISSUE SUMMARY

Report:

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

---

# 97. TEST SUMMARY

Report:

```text
Unit tests: PASS/FAIL
Component tests: PASS/FAIL
Integration tests: PASS/FAIL
E2E tests: PASS/FAIL
Security tests: PASS/FAIL
Accessibility tests: PASS/FAIL
Localization tests: PASS/FAIL
Responsive tests: PASS/FAIL
Browser tests: PASS/FAIL
Performance tests: PASS/FAIL
Build: PASS/FAIL
Lint: PASS/FAIL
Type check: PASS/FAIL/NOT APPLICABLE
```

---

# 98. FINAL MODULE MATRIX

Report:

| Module | Functional | Security | E2E | Accessibility | Localization | Performance | Result |
|---|---|---|---|---|---|---|---|
| Authentication | | | | | | | |
| Patient | | | | | | | |
| Caregiver | | | | | | | |
| Admin | | | | | | | |
| Games | | | | | | | |
| Memory | | | | | | | |
| Reminders | | | | | | | |
| Community | | | | | | | |
| Meetings | | | | | | | |
| Notifications | | | | | | | |
| AI | | | | | | | |
| Safety | | | | | | | |
| Analytics | | | | | | | |
| Mobile | | | | | | | |

---

# 99. FINAL TERMINAL COMMANDS

Run:

```bash
git status
git diff --stat
git diff --check
```

Then run the actual project commands for:

```text
Tests
Lint
Type checking
Build
```

Do not invent commands.

---

# 100. FINAL RESULT FORMAT

Return:

```text
F17 STATUS: COMPLETE / BLOCKED

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

Accessibility: PASS/FAIL
Localization: PASS/FAIL
Responsive: PASS/FAIL
Browser compatibility: PASS/FAIL
Network recovery: PASS/FAIL
Race conditions: PASS/FAIL
Double submission: PASS/FAIL
Session expiry: PASS/FAIL
Security: PASS/FAIL
Secret audit: PASS/FAIL
Dependency audit: PASS/FAIL
Performance: PASS/FAIL
Memory leaks: PASS/FAIL

Unit tests: PASS/FAIL
Component tests: PASS/FAIL
Integration tests: PASS/FAIL
E2E tests: PASS/FAIL
Lint: PASS/FAIL
Type check: PASS/FAIL/NOT APPLICABLE
Build: PASS/FAIL

Production blocker: YES/NO
Release candidate: YES/NO
```

Never claim PASS unless verified.

---

# 101. FINAL RELEASE GATE

Memora may be considered a frontend release candidate only if:

```text
P0 = 0
P1 = 0
Core E2E = PASS
Security = PASS
Accessibility = PASS
Localization = PASS
Build = PASS
Critical tests = PASS
```

If any critical gate fails:

```text
F17 = BLOCKED
```

---

# 102. STOP CONDITION

After F17:

**STOP.**

Do not automatically create another development phase.

At this point the project should move into:

```text
Release Candidate
        ↓
Deployment/Staging
        ↓
User Acceptance Testing
        ↓
Production Readiness
        ↓
Production Release
```

Any future work should be driven by:

```text
Real bugs
User feedback
Security findings
Performance findings
Product requirements
```

not arbitrary additional phase generation.

---

# FINAL PRINCIPLE

F17 is the final quality gate for the frontend.

The goal is not:

```text
"Every screen exists."
```

The goal is:

```text
Every important workflow works.
Every important workflow is tested.
Every important workflow is secure.
Every important workflow is accessible.
Every important workflow is localized where supported.
Every important workflow survives common failures.
```

The final standard is:

```text
REAL USER
   ↓
REAL UI
   ↓
REAL API
   ↓
REAL AUTHENTICATION
   ↓
REAL AUTHORIZATION
   ↓
REAL BACKEND
   ↓
REAL DATABASE / PROVIDER
   ↓
REAL RESPONSE
   ↓
CORRECT UI
   ↓
TESTED
   ↓
HARDENED
```

Never hide failures with mock data.

Never mark untested functionality as PASS.

Never ignore security or safety failures.

Never expose private patient information.

Never expose secrets.

Never trigger real emergency workflows during testing.

Never weaken backend authorization to make frontend tests pass.

Never sacrifice accessibility for visual polish.

Never claim localization without actual translations.

Never claim production readiness while critical blockers remain.

**F17 is complete when the Memora frontend has been systematically tested, repaired, regression-tested, security-reviewed, performance-reviewed, accessibility-checked, localization-checked, and verified as a stable release candidate.**
