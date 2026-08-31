# Memora - Phase F13 Prompt: Admin Dashboard

**Phase:** F13  
**Name:** Admin Dashboard + Platform Management UI  
**Prerequisites:** F0-F12 completed and F11 audit reviewed  
**Backend prerequisite:** Existing admin, user/role, content, community, notification, activity, analytics, AI, and safety APIs must be inspected before implementation  
**Status:** Ready for implementation

---

# OBJECTIVE

Build the complete administrative web interface for Memora.

The Admin Dashboard is the platform's management and control center.

It must allow an authorized administrator to manage the parts of Memora already supported by the backend, including:

```text
Users
Roles
Patients
Caregivers
Content
Cognitive Games
Community Sessions
Voting
Scheduling
Hosts / Guests
Notifications
Activity Logs
Analytics
System configuration where supported
```

The administrator must have appropriate control over platform resources without bypassing backend authorization.

F13 is an **admin frontend implementation phase**, not a new backend architecture phase.

---

# 1. READ FIRST

Before modifying anything, read:

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
```

Then inspect the actual implementation of:

```text
B0-B14
F0-F12
Admin backend routes
Admin controllers
Admin services
Role middleware
User management
Content management
Community management
Notification system
Activity system
Analytics
Safety
```

The repository is authoritative.

Do not assume an admin API exists simply because the specification mentions it.

---

# 2. CRITICAL RULE

Before building each admin section:

```text
Find actual backend endpoint
        ↓
Inspect request schema
        ↓
Inspect response schema
        ↓
Inspect authorization
        ↓
Inspect database/service
        ↓
Implement frontend
        ↓
Test real operation
```

Do not use mock production data.

If a required backend capability is missing:

```text
Document the gap.
Do not invent a fake production API.
```

---

# 3. ADMIN ACCESS

Only authorized administrators may access the Admin Dashboard.

Use the existing F2 authentication and role architecture.

Flow:

```text
Login
 ↓
Authentication
 ↓
Admin authorization
 ↓
Admin Dashboard
```

---

# 4. BACKEND AUTHORIZATION

Frontend route protection is only a UX layer.

The backend must remain authoritative.

Never trust:

```text
localStorage role
URL parameters
hidden buttons
frontend state
```

as the security boundary.

---

# 5. ADMIN ROUTE

Use the existing frontend route if one exists.

Potential:

```text
/app/admin
```

Do not create duplicate admin routes.

---

# 6. ADMIN LAYOUT

Recommended structure:

```text
┌──────────────────────────────────────────────┐
│ Memora Admin                                │
├───────────────┬──────────────────────────────┤
│ Dashboard     │                              │
│ Users         │      Main Content            │
│ Caregivers    │                              │
│ Patients      │                              │
│ Content       │                              │
│ Games         │                              │
│ Community     │                              │
│ Notifications │                              │
│ Activity      │                              │
│ Analytics     │                              │
│ Settings      │                              │
└───────────────┴──────────────────────────────┘
```

Use the F1 design system.

---

# 7. ADMIN OVERVIEW

The landing page should summarize actual platform data.

Potential:

```text
Platform Overview

Patients
Caregivers
Active Users
Upcoming Sessions
Pending Registrations
Unread Admin Notifications
Recent Safety Events
Platform Activity
```

Only display metrics supported by backend APIs.

---

# 8. USER MANAGEMENT

Implement the actual user-management functionality supported by B0-B14.

Potential:

```text
Users
├── Search
├── Filter
├── View
├── Role
├── Status
├── Created date
└── Actions
```

Do not expose passwords or authentication secrets.

---

# 9. USER SEARCH

If supported by backend:

```text
Search users
```

Use server-side search where available.

Do not download the entire user database merely to filter it in the browser.

---

# 10. USER FILTERS

Where supported:

```text
Patient
Caregiver
Admin
Other configured roles
Active
Inactive
```

Use actual backend-supported values.

---

# 11. USER DETAILS

Display only appropriate administrative information.

Do not display:

```text
Password
Password hash
JWT
Refresh token
API keys
Secrets
```

---

# 12. ROLE MANAGEMENT

Integrate the actual role system.

Potential:

```text
User
Caregiver
Admin
```

or whatever roles actually exist.

Do not invent role names.

---

# 13. ROLE CHANGE

If the backend supports role changes:

```text
Select role
 ↓
Confirm
 ↓
Backend authorization
 ↓
Success
```

Use explicit confirmation for privileged changes.

---

# 14. ROLE CHANGE SECURITY

An administrator must not be able to elevate privileges beyond the permissions granted by backend authorization.

Prevent accidental self-lockout if the backend has protections for administrator accounts.

---

# 15. USER DEACTIVATION

If supported:

```text
Deactivate user?
[ Cancel ]
[ Deactivate ]
```

Do not delete users unless the backend explicitly supports and the product requires deletion.

---

# 16. CAREGIVER MANAGEMENT

Integrate caregiver functionality from B0-B14.

Potential:

```text
Caregivers
├── List
├── Search
├── View
├── Assign patients
├── Remove patient assignment
└── Status
```

Only implement actual supported operations.

---

# 17. PATIENT-CAREGIVER ASSIGNMENT

If backend supports assignment:

```text
Caregiver
 ↓
Select authorized patient
 ↓
Confirm
 ↓
Backend
 ↓
Assignment created
```

Do not allow arbitrary assignment IDs without backend authorization.

---

# 18. ASSIGNMENT REMOVAL

If supported:

```text
Remove patient access?
[ Cancel ]
[ Remove ]
```

Ensure caregiver access is actually revoked by the backend.

---

# 19. PATIENT MANAGEMENT

Admin may view/manage patients according to actual backend permissions.

Potential:

```text
Patient list
Patient status
Caregiver assignment
Account status
Activity summary
```

Do not expose unnecessary private information.

---

# 20. CONTENT MANAGEMENT

The admin should manage content supported by the existing backend.

Potential:

```text
Content
├── Topics
├── Subtopics
├── Descriptions
├── Images
├── Videos
├── PDFs
└── Publish status
```

Use actual B0-B14 content models and APIs.

---

# 21. RICH TEXT

If existing backend supports rich text:

```text
Use existing editor architecture.
```

Sanitize content before rendering.

Do not directly inject untrusted HTML.

---

# 22. MEDIA

If content supports:

```text
Images
Videos
PDFs
```

reuse existing upload/storage APIs.

Do not upload directly to storage unless the backend architecture explicitly supports secure signed uploads.

---

# 23. CONTENT EDITING

Flow:

```text
Select content
 ↓
Edit
 ↓
Validate
 ↓
Save
 ↓
Backend confirmation
 ↓
Refresh
```

Do not show "saved" until the backend confirms success.

---

# 24. CONTENT VERSIONING

If backend supports versions:

```text
Show version/status
```

Do not invent version history in frontend state.

---

# 25. COGNITIVE GAME MANAGEMENT

If admin game management exists:

```text
Games
├── List
├── Create
├── Edit
├── Enable/disable
└── Content/configuration
```

Use actual backend functionality.

---

# 26. GAME SAFETY

Do not let admin UI expose unsupported claims such as:

```text
This game diagnoses dementia
This score measures disease progression
```

Use activity/performance terminology.

---

# 27. COMMUNITY MANAGEMENT

Integrate F7.

Admin should manage:

```text
Voting options
Session proposals
Approved sessions
Scheduled sessions
Hosts
Guests
Capacity
Descriptions
Images
Meeting type
Registration
```

where supported.

---

# 28. VOTING MANAGEMENT

Workflow:

```text
Create voting option
 ↓
Patients vote
 ↓
Admin reviews results
 ↓
Admin approves selected option
```

Do not change votes directly unless the backend explicitly supports administrative moderation.

---

# 29. SESSION APPROVAL

When approved:

```text
Voting option
 ↓
Approved
 ↓
Schedule configuration
```

Ensure it moves correctly from voting state to schedule state according to backend behavior.

---

# 30. SCHEDULING

Admin may configure:

```text
Date
Time
Duration
Host
Featured guest
Image
Description
Capacity
Meeting type
Registration status
```

Only use fields supported by backend.

---

# 31. CAPACITY

If capacity is enforced by backend:

```text
Display actual registration count.
Display actual capacity.
```

Do not rely on frontend counters.

---

# 32. REGISTRATION

Admin should be able to view registration information only as authorized.

Do not expose unnecessary patient data.

---

# 33. MEETING MANAGEMENT

Integrate F8.

Potential:

```text
Meeting
Host
Time
Status
Registration
Join information
```

Never expose protected meeting links to unauthorized users.

---

# 34. HOST / FEATURED PERSON

If supported:

```text
Name
Role
Image
Description
```

Example roles:

```text
Doctor
Therapist
Psychologist
Dementia specialist
Caregiver expert
Researcher
Guest speaker
```

These are examples, not mandatory role values.

---

# 35. NOTIFICATION MANAGEMENT

Integrate F8/B9.

Admin functionality may include:

```text
View notifications
Create supported system notifications
Review delivery/status
```

Only implement actual backend capabilities.

Do not create another notification system.

---

# 36. ACTIVITY LOG

Integrate B9/F8 activity functionality.

Display:

```text
Who
What
When
Relevant resource
```

Use backend-generated activity data.

---

# 37. ACTIVITY PRIVACY

Do not expose:

```text
Passwords
Tokens
Sensitive private content
Unnecessary memory text
Precise location
```

in admin activity logs.

---

# 38. SAFETY EVENTS

If admin is authorized to view safety events:

```text
Safety Events
├── Event type
├── Patient
├── Time
├── Status
└── Resolution
```

Follow actual backend permissions.

---

# 39. SAFETY PRIVACY

Precise location is sensitive.

Only display exact location if:

```text
Backend authorizes it
AND
Admin role is authorized
AND
Product requirements require it
```

Otherwise display status only.

---

# 40. SOS MANAGEMENT

If admin has access to safety events:

```text
SOS event
Status
Time
Patient
Resolution
```

Do not claim an emergency was successfully handled unless the backend confirms the state.

---

# 41. FALL DETECTION

If admin safety views include fall detection:

```text
Fall event
Time
Status
Resolution
```

Do not modify the fall-detection algorithm from the admin UI unless explicitly supported.

---

# 42. LOCATION

If location tracking is available:

```text
Location status
Last update
```

Prefer status over precise coordinates unless explicit authorization requires the map.

---

# 43. AI ADMIN VIEW

If B0-B14 provides AI administration features:

```text
AI usage
AI configuration
AI errors
```

only expose actual backend-supported controls.

Never expose:

```text
API keys
System prompts
Provider secrets
```

---

# 44. AI ANALYTICS

If supported:

```text
AI request count
AI usage
Errors
```

Do not expose patient conversation content unnecessarily.

---

# 45. ANALYTICS

F14 will provide the broader analytics UI.

F13 may provide admin entry points to analytics.

Do not duplicate the analytics engine.

Potential:

```text
Users
Engagement
Games
Reminders
Community
AI
Safety
```

Use actual backend metrics.

---

# 46. ANALYTICS BOUNDARY

Analytics must not be presented as:

```text
Diagnosis
Treatment effectiveness
Dementia progression
Clinical assessment
```

unless explicitly supported by an appropriate clinical architecture.

Use neutral platform/activity terminology.

---

# 47. ADMIN SEARCH

Where appropriate provide:

```text
Search
Filter
Sort
Pagination
```

Do not load massive datasets unnecessarily.

---

# 48. PAGINATION

Use backend pagination if available.

Do not implement fake frontend-only pagination over a complete database dump.

---

# 49. SORTING

Prefer backend sorting when supported.

---

# 50. BULK ACTIONS

Only implement bulk actions if backend supports them.

Potential:

```text
Select users
 ↓
Bulk deactivate
```

Never invent bulk APIs.

---

# 51. CONFIRMATION

Require confirmation for destructive or privileged actions:

```text
Role change
Deactivation
Deletion
Removing caregiver access
Publishing content
Approving session
```

---

# 52. UNSAVED CHANGES

If forms can be edited:

```text
Warn before navigating away with unsaved changes.
```

---

# 53. FORM VALIDATION

Validate:

```text
Required fields
Dates
Times
Capacity
URLs
Uploads
Text length
```

Frontend validation is for UX.

Backend validation remains authoritative.

---

# 54. DATE/TIME

Use centralized date/time utilities.

Do not manually manipulate timezone offsets.

---

# 55. TIMEZONE

Community sessions, meetings, reminders, and activity timestamps must follow the project's established timezone architecture.

---

# 56. LOADING STATES

Provide clear loading states for:

```text
Dashboard
Users
Patients
Caregivers
Content
Games
Community
Notifications
Activities
Analytics
Safety
```

---

# 57. EMPTY STATES

Handle:

```text
No users
No caregivers
No patients
No content
No games
No sessions
No notifications
No activities
No analytics
No safety events
```

---

# 58. ERROR STATES

Handle:

```text
401
403
404
409
422
429
500
Network failure
Timeout
```

Do not display raw backend errors.

---

# 59. SUCCESS STATES

Only show success after backend confirmation.

Examples:

```text
User updated
Role changed
Content saved
Session approved
Schedule updated
Assignment created
```

---

# 60. REALTIME

Reuse existing realtime infrastructure for:

```text
Notifications
Safety events
Activity updates
```

where supported.

Do not create a second websocket/SSE system.

---

# 61. REALTIME CLEANUP

Ensure subscriptions are removed when:

```text
Admin leaves page
Component unmounts
Logout occurs
```

---

# 62. SECURITY

Audit:

```text
Admin route
API calls
Role changes
Patient access
Caregiver assignment
Content upload
Meeting links
Safety events
Analytics
```

---

# 63. ADMIN AUTHORIZATION

Test that:

```text
Patient → Admin dashboard → denied
Caregiver → Admin dashboard → denied
Unauthorized user → Admin dashboard → denied
Admin → authorized admin features → allowed
```

Use actual project roles.

---

# 64. PRIVILEGE ESCALATION

Test:

```text
Normal user cannot call admin APIs.
Caregiver cannot call admin APIs.
```

Do not rely solely on frontend route protection.

---

# 65. IDOR TESTING

Test:

```text
Admin resource A
Admin resource B
```

and ensure IDs cannot be manipulated to bypass backend authorization.

---

# 66. XSS PROTECTION

Especially test:

```text
Content
Rich text
User names
Session descriptions
Guest descriptions
Activity fields
```

Never render unsafe HTML.

---

# 67. FILE UPLOAD SECURITY

If admin can upload media:

```text
File type
File size
Extension
MIME
Authorization
Storage
```

must follow backend rules.

---

# 68. SECRET PROTECTION

Never expose:

```text
AI keys
Database credentials
JWT secrets
Storage secrets
Provider tokens
```

---

# 69. ADMIN ACTIVITY AUDIT

Important administrative actions should use the existing activity/audit system where supported:

```text
Role changes
Content changes
Caregiver assignments
Session approval
Schedule changes
```

Do not create an unrelated audit-log system.

---

# 70. DASHBOARD NAVIGATION

Every major admin section should have:

```text
Clear navigation
Breadcrumbs where useful
Back navigation
Active state
```

---

# 71. RESPONSIVE DESIGN

The admin interface should work on:

```text
Desktop
Tablet
Mobile browser
```

Prioritize desktop for dense management tables, but do not make mobile unusable.

---

# 72. ACCESSIBILITY

Admin UI must support:

```text
Keyboard navigation
Screen readers
Focus management
Accessible tables
Accessible dialogs
Accessible forms
Accessible alerts
```

---

# 73. LOCALIZATION

Use existing localization architecture.

Support configured languages:

```text
English
Hindi
Other configured languages
```

Do not hardcode patient-facing/admin-facing strings.

---

# 74. STATE MANAGEMENT

Use the existing F0 architecture.

Do not create a second global state architecture.

---

# 75. API CLIENT

Reuse the centralized API client.

Conceptual:

```text
adminApi.getDashboard()
adminApi.getUsers()
adminApi.updateUserRole()
adminApi.getPatients()
adminApi.getCaregivers()
adminApi.assignCaregiver()
adminApi.getContent()
adminApi.updateContent()
adminApi.getGames()
adminApi.getCommunitySessions()
adminApi.approveSession()
adminApi.scheduleSession()
adminApi.getNotifications()
adminApi.getActivities()
adminApi.getAnalytics()
adminApi.getSafetyEvents()
```

These names are conceptual.

Use actual backend endpoints.

---

# 76. API RESPONSE VALIDATION

Handle optional/missing fields safely.

Do not crash the entire dashboard because one optional metric is unavailable.

---

# 77. ADMIN DASHBOARD PERFORMANCE

Avoid:

```text
Fetching every table on initial load
Duplicate requests
Repeated analytics requests
Unnecessary polling
Huge activity histories
Huge user lists
```

Load sections when appropriate.

---

# 78. TABLE PERFORMANCE

For large datasets:

```text
Server pagination
Server filtering
Server sorting
```

where backend supports them.

---

# 79. NO DIRECT DATABASE ACCESS

Frontend must never connect directly to MongoDB.

---

# 80. NO MOCK ADMIN DATA

Do not use hardcoded:

```text
User counts
Patient counts
Vote counts
Registration counts
Activity logs
Safety events
Analytics
```

in production UI.

---

# 81. TESTING

Add tests for:

```text
Admin authentication
Admin route protection
User management
Role management
Caregiver management
Patient management
Content management
Game management
Community management
Scheduling
Notifications
Activity logs
Safety
Analytics
```

where supported.

---

# 82. ADMIN AUTHORIZATION TESTS

Test:

```text
Admin → allowed
Caregiver → denied
Patient → denied
Unauthenticated → denied
```

---

# 83. USER MANAGEMENT TESTS

Test:

```text
Search
Filter
Role update
Deactivation if supported
Error handling
```

---

# 84. CAREGIVER MANAGEMENT TESTS

Test:

```text
List
Assignment
Removal
Unauthorized operation
```

where supported.

---

# 85. CONTENT TESTS

Test:

```text
Create
Edit
Upload
Publish
Validation
XSS protection
```

where supported.

---

# 86. COMMUNITY TESTS

Test:

```text
Create voting option
Review votes
Approve
Schedule
Update
Capacity
Registration
```

where supported.

---

# 87. NOTIFICATION TESTS

Test:

```text
List
Read
Admin-triggered notification where supported
```

---

# 88. ACTIVITY TESTS

Verify administrative actions appear in the existing activity system where intended.

---

# 89. SAFETY TESTS

Use a controlled environment.

Test:

```text
Safety event list
SOS state
Fall event state
Location status
```

Do not trigger real emergency notifications.

---

# 90. ANALYTICS TESTS

Test:

```text
Data available
No data
Loading
Error
Date filters where supported
```

---

# 91. ACCESSIBILITY TESTING

Test:

```text
Keyboard
Screen reader
Focus
Tables
Dialogs
Forms
Alerts
```

---

# 92. RESPONSIVE TESTING

Test:

```text
Desktop
Tablet
Mobile
```

---

# 93. LOCALIZATION TESTING

Test:

```text
English
Hindi
Long strings
Tables
Dialogs
Forms
```

---

# 94. SECURITY REVIEW

Inspect:

```text
Admin route protection
Backend authorization
IDOR
XSS
File upload
Role escalation
Sensitive data exposure
Meeting links
Safety data
```

---

# 95. PERFORMANCE TESTING

Check:

```text
Initial load
Dashboard API count
Table pagination
Analytics requests
Realtime subscriptions
Memory usage
```

---

# 96. BROWSER CONSOLE

Verify no:

```text
Unhandled errors
React warnings
Failed requests
Accessibility warnings
```

---

# 97. GIT SAFETY

Before changes:

```bash
git status
git branch
```

Never use:

```bash
git reset --hard
git clean -fd
```

Do not overwrite other developers' work.

Suggested branch:

```text
feature/f13-admin-dashboard
```

If splitting work:

```text
feature/f13-user-management
feature/f13-content-management
feature/f13-community-management
feature/f13-admin-analytics
feature/f13-admin-safety
```

---

# 98. DEFINITION OF DONE

F13 is complete only when:

[ ] F0 inspected  
[ ] F1 inspected  
[ ] F2 inspected  
[ ] F3 inspected  
[ ] F4 inspected  
[ ] F5 inspected  
[ ] F6 inspected  
[ ] F7 inspected  
[ ] F8 inspected  
[ ] F9 inspected  
[ ] F10 inspected  
[ ] F11 inspected  
[ ] F12 inspected  
[ ] Actual admin backend inspected  
[ ] Admin authorization inspected  
[ ] Admin route implemented  
[ ] Admin authentication integrated  
[ ] Admin dashboard overview implemented  
[ ] User management implemented where supported  
[ ] User search implemented where supported  
[ ] User filtering implemented where supported  
[ ] Role management implemented where supported  
[ ] User deactivation implemented where supported  
[ ] Caregiver management implemented where supported  
[ ] Patient management implemented where supported  
[ ] Caregiver assignment implemented where supported  
[ ] Content management implemented where supported  
[ ] Rich text integrated where supported  
[ ] Media upload integrated where supported  
[ ] Game management implemented where supported  
[ ] Community management implemented  
[ ] Voting management implemented where supported  
[ ] Session approval implemented where supported  
[ ] Scheduling implemented where supported  
[ ] Host/guest management implemented where supported  
[ ] Meeting management implemented where supported  
[ ] Notification management implemented where supported  
[ ] Activity log implemented where supported  
[ ] Safety event view implemented where supported  
[ ] AI admin functionality implemented where supported  
[ ] Analytics entry point integrated where supported  
[ ] Backend authorization verified  
[ ] IDOR testing performed  
[ ] Privilege escalation testing performed  
[ ] XSS testing performed  
[ ] File upload security reviewed  
[ ] Sensitive data exposure reviewed  
[ ] Loading states implemented  
[ ] Empty states implemented  
[ ] Error states implemented  
[ ] Success confirmation implemented  
[ ] Confirmation dialogs implemented  
[ ] Realtime reused where supported  
[ ] Pagination implemented where required  
[ ] Date/time verified  
[ ] Timezone verified  
[ ] Accessibility verified  
[ ] Localization verified  
[ ] Responsive design verified  
[ ] Performance reviewed  
[ ] Browser console checked  
[ ] Tests pass  
[ ] Lint passes  
[ ] Build passes  
[ ] Documentation updated  
[ ] No secrets committed  
[ ] No mock production data  
[ ] No duplicate infrastructure  
[ ] No unrelated feature creep  

---

# 99. FINAL REPORT

Create:

```text
docs/F13_ADMIN_DASHBOARD_REPORT.md
```

Use:

```text
# Memora F13 Admin Dashboard Report

## Objective

## Admin Backend Audit

## Authorization Model

## Admin Route

## Dashboard Overview

## User Management

## Role Management

## Patient Management

## Caregiver Management

## Caregiver Assignment

## Content Management

## Game Management

## Community Management

## Voting Management

## Session Approval

## Scheduling

## Host / Guest Management

## Meeting Management

## Notification Management

## Activity Logs

## Safety Events

## AI Administration

## Analytics Integration

## API Integration

## Realtime Integration

## Security

## Privacy

## Accessibility

## Localization

## Responsive Design

## Performance

## Components Created

## Files Created

## Files Modified

## Tests Executed

## Authorization Tests

## IDOR Tests

## XSS Tests

## File Upload Tests

## Community Tests

## Safety Tests

## Analytics Tests

## Accessibility Tests

## Localization Tests

## Lint Result

## Build Result

## Browser Testing

## Known Issues

## Missing Backend Capabilities

## Recommendations for F14
```

---

# 100. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
Admin authentication: PASS/FAIL
Admin route protection: PASS/FAIL
Dashboard overview: PASS/FAIL
User management: PASS/FAIL/NOT SUPPORTED
Role management: PASS/FAIL/NOT SUPPORTED
Patient management: PASS/FAIL/NOT SUPPORTED
Caregiver management: PASS/FAIL/NOT SUPPORTED
Caregiver assignment: PASS/FAIL/NOT SUPPORTED
Content management: PASS/FAIL/NOT SUPPORTED
Game management: PASS/FAIL/NOT SUPPORTED
Community management: PASS/FAIL
Voting management: PASS/FAIL/NOT SUPPORTED
Session approval: PASS/FAIL/NOT SUPPORTED
Scheduling: PASS/FAIL/NOT SUPPORTED
Host/guest management: PASS/FAIL/NOT SUPPORTED
Meeting management: PASS/FAIL/NOT SUPPORTED
Notifications: PASS/FAIL
Activity logs: PASS/FAIL/NOT SUPPORTED
Safety events: PASS/FAIL/NOT SUPPORTED
AI administration: PASS/FAIL/NOT SUPPORTED
Analytics integration: PASS/FAIL/NOT SUPPORTED
API integration: PASS/FAIL
Authorization: PASS/FAIL
IDOR protection: PASS/FAIL
XSS protection: PASS/FAIL
File upload security: PASS/FAIL/NOT SUPPORTED
Privacy: PASS/FAIL
Accessibility: PASS/FAIL
Localization: PASS/FAIL
Responsive UI: PASS/FAIL
Performance: PASS/FAIL
Tests: PASS/FAIL
Lint: PASS/FAIL
Build: PASS/FAIL
Browser testing: PASS/FAIL
```

Do not claim success unless verified.

---

# 101. STOP CONDITION

After F13 is complete:

**STOP.**

Do not implement F14 automatically.

F14 will focus on:

```text
Analytics & Progress UI
```

Before F14 begins, inspect:

```text
F11 findings
F12 implementation
F13 implementation
Actual analytics backend
Actual analytics schemas
Privacy/authorization rules
```

---

# FINAL PRINCIPLE

The Admin Dashboard is the platform control center, but it must remain governed by backend authorization.

The architecture should remain:

```text
                       ADMIN
                         │
                         ↓
                  Admin Dashboard
                         │
                         ↓
                   Memora API
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
        Users         Content        Community
          │              │              │
          ↓              ↓              ↓
     Caregivers       Games         Meetings
          │
          └──────────────┬──────────────┘
                         ↓
                   Notifications
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
           Analytics              Safety
```

The frontend is an administrative interface, not a security boundary.

Never expose passwords, tokens, API keys, or secrets.

Never allow frontend-only role checks to grant privileges.

Never expose another user's private information unnecessarily.

Never expose precise location without explicit authorization.

Never treat analytics as diagnosis.

Never create duplicate backend systems.

Never use fake production data to make an unfinished API look complete.

Never claim an administrative action succeeded until the backend confirms it.

**F13 is complete when an authorized administrator can manage the existing Memora platform through one coherent, secure, tested dashboard.**
