# MEMORA - SIMPLIFIED ADMIN DASHBOARD
## Admin Login, Overview, Community Management, Users, Activity & Basic Traffic

### Implementation Prompt

> **Scope:** Implement a focused Admin Dashboard for Memora.
>
> **Critical rule:** Reuse the existing Memora architecture and preserve the existing frontend design. Do not redesign unrelated pages or create duplicate systems.

---

# 1. OBJECTIVE

Build an Admin Dashboard with only these core areas:

```text
ADMIN DASHBOARD
│
├── 1. Admin Login
├── 2. Overview
├── 3. Community Events
├── 4. Community Voting
├── 5. User Management
├── 6. Activity Log
└── 7. Basic Traffic
```

The goal is a reliable, working administration system rather than a large collection of partially implemented features.

Do not add advanced analytics, server monitoring, complex permission builders, bulk operations, admin access to private AI conversations, or unrestricted patient-location monitoring.

---

# 2. READ THE EXISTING PROJECT FIRST

Before writing code, inspect the existing repository and understand the current architecture.

Read available documentation such as:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/FRONTEND_ARCHITECTURE.md
docs/FRONTEND_API_CONTRACT.md
```

Inspect the completed phases:

```text
B0-B14
F0-F17
```

Especially inspect:

```text
Authentication
Authorization
Users
Roles
Community
Community Sessions
Voting
Notifications
Activity/Audit Logs
Analytics
Patient Dashboard
Caregiver Dashboard
```

Search for existing:

```text
Admin
User
Role
Event
Community
Session
Vote
Notification
Activity
Audit
Traffic
Analytics
```

---

# 3. DO NOT CREATE DUPLICATE ARCHITECTURE

If the project already has:

```text
User model
Role system
Authentication
Authorization
Community Event/Session model
Voting model
Notification service
Activity log
Analytics
```

reuse and extend them.

Do not create duplicate versions such as:

```text
AdminUser2
Event2
Vote2
Notification2
UserManagement2
```

unless there is a genuine architectural reason.

---

# 4. FRONTEND DESIGN PROTECTION

The existing Memora frontend is already designed.

Treat it as approved.

### DO NOT:

- redesign the existing application
- change global colors
- change typography
- change Tailwind configuration
- replace the existing design system
- redesign the Patient Dashboard
- redesign the Caregiver Dashboard
- redesign Community
- redesign Meeting Circle
- redesign Cognitive Games
- redesign Memory Assistance
- redesign Reminders
- redesign Safety
- redesign AI Assistant
- create an unrelated admin template

### DO:

- reuse existing components
- reuse existing cards
- reuse existing buttons
- reuse existing forms
- reuse existing tables
- reuse existing modal/dialog components
- reuse existing navigation/sidebar
- reuse existing API client
- reuse existing notification system
- reuse existing authentication
- make only necessary frontend additions

The Admin Dashboard can introduce new admin-specific screens, but they must visually belong to the existing Memora application.

---

# 5. ADMIN AUTHENTICATION

Implement a dedicated Admin Login using the existing authentication architecture where possible.

The initial admin credentials may be configured using environment variables:

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

The actual credentials must remain server-side.

### NEVER:

```text
if email === "admin@example.com"
and password === "password"
then show dashboard
```

inside React/frontend code.

Authentication must happen on the backend.

---

# 6. ADMIN PASSWORD SECURITY

If the admin account is stored in MongoDB:

```text
ADMIN_PASSWORD
      ↓
password hashing
      ↓
database hash
```

Never store plaintext passwords.

Reuse the existing bcrypt/password-hashing implementation if available.

If the project uses an existing User model, create/seed the admin through that architecture.

---

# 7. ADMIN CREDENTIAL SECURITY

Never expose:

```text
ADMIN_PASSWORD
ADMIN_EMAIL if considered sensitive
JWT secret
database credentials
API keys
```

inside the frontend bundle.

Never commit the real credentials to Git.

`.env.example` should contain placeholders only:

```env
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

---

# 8. ADMIN ROLE

Use the existing role system.

The dashboard must require:

```text
Authenticated user
+
ADMIN role
```

Do not create a second unrelated admin authorization mechanism.

---

# 9. ADMIN API SECURITY

Every admin endpoint must enforce authorization on the backend.

Examples conceptually:

```text
GET    /admin/overview
GET    /admin/users
PATCH  /admin/users/:id
GET    /admin/events
POST   /admin/events
PATCH  /admin/events/:id
GET    /admin/voting
GET    /admin/activity
GET    /admin/traffic
```

These are conceptual examples only.

Follow the existing route conventions.

---

# 10. FRONTEND ROUTE GUARD

Protect the admin route on the frontend for good UX.

However:

```text
Frontend route guard = UX
Backend authorization = Security
```

Never rely on the frontend route guard alone.

---

# 11. ADMIN OVERVIEW

Create a simple overview dashboard using real backend data.

Recommended cards:

```text
Total Users
Patients
Caregivers
Teachers
Upcoming Events
Active Users
```

Only display metrics that actually exist in the project.

Do not fabricate numbers.

---

# 12. OVERVIEW DESIGN

Reuse the existing Memora dashboard/card system.

Example concept:

```text
┌───────────────┐ ┌───────────────┐
│ Total Users   │ │ Patients      │
│     128       │ │      91       │
└───────────────┘ └───────────────┘

┌───────────────┐ ┌───────────────┐
│ Caregivers    │ │ Upcoming      │
│      27       │ │ Events: 4     │
└───────────────┘ └───────────────┘
```

Do not copy this exact visual layout if the existing design system has a better pattern.

---

# 13. OVERVIEW DATA

Use actual database queries.

Examples:

```text
countUsers()
countPatients()
countCaregivers()
countTeachers()
countUpcomingEvents()
countActiveUsers()
```

Reuse existing analytics/services if available.

---

# 14. COMMUNITY EVENT MANAGEMENT

This is the primary Admin feature.

Reuse the existing Community Event/Session architecture.

Admin should be able to:

```text
Create
View
Edit
Publish
Schedule
Cancel
Archive where appropriate
```

Do not create a separate event database.

---

# 15. CREATE EVENT

Use the fields supported by the existing Community system.

Potential fields:

```text
Title
Description
Date
Start Time
End Time
Speaker / Featured Person
Location or Meeting Information
Image if already supported
Status
```

Do not add unnecessary fields.

---

# 16. EVENT LIST

Show actual events.

Useful filters:

```text
All
Upcoming
Published
Scheduled
Completed
Cancelled
```

Only include statuses already supported by the existing event model.

---

# 17. EVENT EDITING

Admin can edit event information according to existing business rules.

Changes must update the backend/database.

Do not modify only frontend state.

---

# 18. EVENT PUBLISHING

Admin can publish an event through the existing Community workflow.

Once published, the existing patient-facing Community page should reflect it automatically.

Do not create a second patient-facing event system.

---

# 19. EVENT SCHEDULING

Admin can set:

```text
Date
Time
Speaker
```

and move the event into the existing scheduled state.

Use the existing session/event structure.

---

# 20. EVENT CANCELLATION

Admin can cancel an event.

The database must reflect:

```text
status = CANCELLED
```

or the equivalent existing status.

The patient-facing Community page must not continue treating it as an active upcoming event.

Reuse existing notifications if appropriate.

---

# 21. EVENT DELETION

Avoid permanently deleting historical event records unless existing requirements explicitly require it.

Prefer:

```text
Cancel
Archive
Soft delete
```

where compatible with the current architecture.

---

# 22. EVENT VALIDATION

Validate event data on:

```text
Frontend
Backend
```

Backend validation is mandatory.

Validate at minimum:

```text
Title
Date
Time
Required fields
Status
```

---

# 23. COMMUNITY VOTING MANAGEMENT

Reuse the existing patient voting functionality.

Admin should be able to:

```text
Create voting options
Open voting
Close voting
View results
Approve/select the outcome
Schedule the selected event
```

Do not replace the existing patient voting UI.

---

# 24. VOTING RESULTS

Show actual vote counts.

Example:

```text
Upcoming Session Vote

Music Memories        42 votes
Childhood Stories     31 votes
Movie Memories        18 votes
```

Do not hardcode values.

---

# 25. VOTING WORKFLOW

Preferred workflow:

```text
Admin creates/proposes options
        ↓
Voting opens
        ↓
Patients vote
        ↓
Admin closes voting
        ↓
Admin reviews results
        ↓
Admin approves/selects session
        ↓
Event scheduled
```

Reuse existing backend logic where available.

---

# 26. VOTING VALIDATION

Prevent:

```text
Voting after closing
Invalid event IDs
Unauthorized vote management
Duplicate administrative actions
```

Backend must enforce these rules.

---

# 27. USER MANAGEMENT

Create a simple user management page.

Display:

```text
Name
Email
Role
Status
Created Date
```

Only show fields necessary for administration.

Do not expose private patient data unnecessarily.

---

# 28. USER SEARCH

Allow search by:

```text
Name
Email
```

Use server-side search if the dataset can become large.

---

# 29. USER FILTERS

Allow filtering by existing roles:

```text
All
Patient
Caregiver
Teacher
Privilege User
Admin
```

Use only roles that actually exist in the project.

---

# 30. USER PAGINATION

Use pagination if necessary.

Do not fetch the entire user database into the browser.

Reuse existing pagination utilities.

---

# 31. USER ROLE MANAGEMENT

Admin may change roles according to the existing business rules.

Example:

```text
Patient
Caregiver
Teacher
Privilege User
Admin
```

Backend must verify that the requester is authorized to change roles.

Do not trust the frontend role dropdown as authorization.

---

# 32. LAST ADMIN PROTECTION

Do not allow the last administrator account to lose admin access accidentally.

Example:

```text
Only Admin
 ↓
Change own role
 ↓
DENY
```

unless another valid administrator already exists.

---

# 33. ACCOUNT STATUS

If the existing User model supports account status, allow:

```text
Active
Inactive/Suspended
```

Do not create a complex moderation system.

---

# 34. SUSPEND USER

If supported:

```text
Admin
 ↓
Suspend user
 ↓
Backend updates status
 ↓
User access is restricted
```

Do not implement suspension only in the frontend.

---

# 35. USER SECURITY

Test:

```text
Patient → user-management API = DENIED
Caregiver → user-management API = DENIED
Teacher → user-management API = DENIED
Privilege User → user-management API = DENIED
Admin → user-management API = ALLOWED
```

---

# 36. ACTIVITY LOG

Create/reuse an activity or audit log.

Show useful events such as:

```text
Admin created event
Admin edited event
Admin cancelled event
Admin changed user role
Admin suspended user
Caregiver connection accepted
```

Only include events already supported by the architecture or directly required by this feature.

---

# 37. ACTIVITY LOG FIELDS

Use:

```text
Timestamp
Actor
Action
Target
Result/status
```

Do not log unnecessary sensitive information.

---

# 38. ADMIN LOGIN ACTIVITY

Record:

```text
Successful admin login
Failed admin login
Admin logout
```

Never record:

```text
Password
Authentication token
Secret credentials
```

---

# 39. ACTIVITY LOG PAGINATION

Use pagination or limited recent activity.

Do not load an unlimited activity history into the browser.

---

# 40. BASIC TRAFFIC MONITORING

Keep traffic monitoring deliberately simple.

Show actual metrics such as:

```text
Today's Requests
Active Users
API Requests
Errors
Average Response Time
```

Only display metrics the backend can reliably calculate.

---

# 41. BASIC TRAFFIC CHART

If analytics infrastructure already exists, display one simple time-based chart:

```text
Requests / Visits
    │
    │       ╭─╮
    │    ╭──╯ ╰─╮
    │ ╭──╯      ╰──
    └────────────────
       Mon Tue Wed Thu Fri
```

Reuse existing chart components.

Do not build a complex analytics engine.

---

# 42. TRAFFIC TIME RANGE

If straightforward to implement, support:

```text
Today
7 Days
30 Days
```

Aggregate server-side.

Do not send huge raw request logs to the frontend.

---

# 43. TRAFFIC METRICS

Where available, measure:

```text
Request count
Unique authenticated users
Average response time
4xx errors
5xx errors
```

Define metrics clearly.

For example:

```text
Active User = authenticated user with activity during selected period
```

Do not call something "live users" unless the system actually measures live presence.

---

# 44. TRAFFIC PRIVACY

Do not store or display unnecessary:

```text
Passwords
Tokens
AI conversations
Private messages
Emergency contact information
Precise patient location
Sensitive request bodies
```

Do not log full request bodies by default.

---

# 45. TRAFFIC LOG RETENTION

If raw request logging is introduced, do not retain raw logs indefinitely.

Prefer:

```text
Raw operational logs
        ↓
short retention

Aggregated metrics
        ↓
longer retention
```

Follow existing infrastructure conventions.

---

# 46. NO ADVANCED ANALYTICS

Do NOT implement:

```text
Cohort analysis
Retention curves
Funnels
Heatmaps
Predictive analytics
User segmentation
Geographic analytics
```

They are outside this phase.

---

# 47. NO SERVER MONITORING

Do NOT implement:

```text
CPU dashboard
RAM dashboard
Disk dashboard
Network dashboard
Database internals
Server infrastructure monitoring
```

These are outside the Admin Dashboard scope.

---

# 48. NO ADMIN AI CONVERSATION VIEWER

Do not create an admin page showing all patient AI conversations.

Patient AI conversations remain private by default.

Do not expose them merely because the viewer is an admin.

---

# 49. NO ADMIN LIVE GPS MAP

Do not create an unrestricted map showing every patient's location.

Location access remains governed by the existing patient/caregiver/safety architecture.

This admin dashboard should not become a location surveillance system.

---

# 50. NO COMPLEX PERMISSION BUILDER

Do not create a UI such as:

```text
Role × Feature × Read × Write × Delete × Export
```

Reuse the existing role/authorization architecture.

---

# 51. NO MULTIPLE ADMIN ROLES

Use the existing:

```text
ADMIN
```

role unless the project already requires more.

Do not introduce:

```text
Super Admin
Analytics Admin
Event Admin
User Admin
Moderator Admin
```

for this phase.

---

# 52. NO BULK OPERATIONS

Do not implement:

```text
Select 500 users
 ↓
Bulk change role
```

Individual operations are sufficient.

---

# 53. NOTIFICATIONS

Reuse the existing notification system.

Relevant notifications may include:

```text
Event created
Event updated
Event cancelled
Voting opened
Voting closed
Event scheduled
```

Do not create a second notification service.

---

# 54. FRONTEND INTEGRATION

The Admin Dashboard frontend should communicate only with Memora's backend.

Correct:

```text
Admin React UI
 ↓
Memora API
 ↓
Backend
 ↓
Database/services
```

Never:

```text
React
 ↓
MongoDB
```

---

# 55. FRONTEND DESIGN REQUIREMENT

The admin UI must use the existing Memora design language.

Reuse:

```text
Existing colors
Existing typography
Existing spacing
Existing buttons
Existing cards
Existing forms
Existing tables
Existing modals
Existing navigation
Existing accessibility patterns
```

Do not copy a random dashboard template from the internet.

---

# 56. RESPONSIVE DESIGN

Test the admin dashboard on:

```text
Desktop
Tablet
```

Ensure it remains usable without changing global breakpoints.

---

# 57. ACCESSIBILITY

Reuse the existing accessibility implementation.

Ensure:

```text
Keyboard navigation
Visible focus
Form labels
Accessible tables
Accessible charts
Clear status indicators
Accessible dialogs
```

---

# 58. LOCALIZATION

Reuse the existing localization system.

Do not introduce a second i18n system.

Do not hardcode UI strings if the project already has localization support.

---

# 59. NO MOCK DATA

Search the implementation for:

```text
mock
dummy
fake
sample users
fake events
hardcoded traffic
hardcoded statistics
```

Remove production mock behavior.

Dashboard numbers must come from the backend.

The only fixed configuration allowed is the server-side initial admin credential configuration.

---

# 60. DATABASE INDEXING

Inspect actual queries.

Add indexes only where justified, potentially for:

```text
user role
user status
event date
event status
activity timestamp
traffic timestamp
```

Do not add unnecessary indexes.

---

# 61. PERFORMANCE

Avoid expensive dashboard operations on every request.

Use:

```text
aggregation
appropriate indexes
safe caching
precomputed metrics
```

where appropriate.

Do not over-engineer.

---

# 62. SECURITY TESTING

Test:

```text
Unauthenticated → admin API = DENIED
Patient → admin API = DENIED
Caregiver → admin API = DENIED
Teacher → admin API = DENIED
Privilege User → admin API = DENIED
Admin → admin API = ALLOWED
```

Also test:

```text
IDOR
Privilege escalation
Invalid user IDs
Invalid event IDs
Unauthorized role changes
Unauthorized event changes
```

---

# 63. ADMIN LOGIN TESTING

Test:

```text
Correct email + correct password
→ SUCCESS
```

```text
Correct email + wrong password
→ DENIED
```

```text
Wrong email + correct password
→ DENIED
```

```text
Normal user credentials
→ Cannot access admin dashboard
```

---

# 64. SECRET EXPOSURE TEST

Inspect frontend source/build output.

Verify none of the following are exposed:

```text
ADMIN_PASSWORD
Database password
JWT secret
Private API keys
Other server secrets
```

---

# 65. EVENT TESTING

Test:

```text
Create
Read
Edit
Publish
Schedule
Cancel
Archive if supported
```

Verify changes appear in the existing Community section.

---

# 66. VOTING TESTING

Test:

```text
Create options
Open voting
Patient votes
Close voting
View results
Approve/select result
Schedule event
```

Verify invalid states are rejected.

---

# 67. USER TESTING

Test:

```text
Search
Filter
Pagination
Role change
Account status
Last-admin protection
Unauthorized access
```

---

# 68. ACTIVITY TESTING

Verify admin actions produce appropriate activity records:

```text
Login
Event creation
Event editing
Event cancellation
Role change
User suspension
```

Do not create duplicate activity systems.

---

# 69. TRAFFIC TESTING

Verify:

```text
Request count
Active-user calculation
Error count
Response-time calculation
Date filtering
```

Use actual data.

---

# 70. FRONTEND REGRESSION TEST

After implementation, verify that these existing areas are unchanged:

```text
Patient Dashboard
Patient Profile
Caregiver Dashboard
Community
Meeting Circle
Cognitive Games
Memory Assistance
Reminders
Safety
AI Assistant
Notifications
```

If unrelated visual changes were introduced, revert them.

---

# 71. FRONTEND FILE CHANGE REPORT

At completion, list every frontend file modified.

For each file explain:

```text
Why it changed
What changed
Why the design was preserved
```

If a frontend file does not need to change, do not modify it.

---

# 72. DOCUMENTATION

Create/update:

```text
docs/ADMIN_DASHBOARD_ARCHITECTURE.md
docs/ADMIN_EVENT_MANAGEMENT.md
docs/ADMIN_USER_MANAGEMENT.md
docs/ADMIN_TRAFFIC.md
docs/ADMIN_SECURITY.md
docs/ADMIN_TEST_REPORT.md
```

Document:

```text
Authentication
Authorization
Admin credentials configuration
Overview
Events
Voting
Users
Activity
Traffic
Security
Testing
```

Never put real credentials in documentation.

---

# 73. FINAL DEFINITION OF DONE

## Admin Authentication

[ ] Admin login works
[ ] Server-side authentication works
[ ] Admin role enforced
[ ] Admin credentials not exposed
[ ] Password hashed if persisted
[ ] Admin session follows existing security rules
[ ] Failed login protection works

## Overview

[ ] Real user counts
[ ] Real role counts
[ ] Real upcoming event count
[ ] Real active-user metric where supported
[ ] No hardcoded statistics

## Community Events

[ ] Create event
[ ] View events
[ ] Edit event
[ ] Publish event
[ ] Schedule event
[ ] Cancel event
[ ] Existing Community page reflects changes
[ ] Event validation works

## Voting

[ ] Create voting options
[ ] Open voting
[ ] Close voting
[ ] View actual results
[ ] Select/approve result
[ ] Schedule resulting event
[ ] Invalid states rejected

## Users

[ ] User list
[ ] Search
[ ] Filters
[ ] Pagination
[ ] Role management
[ ] Account status management where supported
[ ] Last-admin protection
[ ] Unauthorized changes rejected

## Activity

[ ] Activity log
[ ] Admin actions recorded
[ ] Pagination/limited history
[ ] No sensitive secrets logged

## Traffic

[ ] Actual request metrics
[ ] Active-user metric where supported
[ ] Error metrics
[ ] Response-time metric where supported
[ ] Simple time-range filtering where implemented
[ ] No sensitive request data exposed

## Security

[ ] IDOR protection
[ ] Privilege escalation protection
[ ] Backend authorization
[ ] Secret protection
[ ] Cross-role access tests
[ ] No private AI conversation viewer
[ ] No unrestricted patient GPS viewer

## Frontend

[ ] Existing design preserved
[ ] Existing design system reused
[ ] Existing navigation preserved
[ ] No unrelated page redesign
[ ] Responsive behavior preserved
[ ] Accessibility preserved
[ ] Localization preserved

## Quality

[ ] No mock data
[ ] No duplicate architecture
[ ] Backend tests pass
[ ] Frontend tests pass
[ ] Integration tests pass
[ ] E2E tests pass
[ ] Build passes
[ ] Lint passes
[ ] Documentation updated
[ ] No secrets committed

---

# 74. FINAL REPORT

Return exactly this structure:

```text
MEMORA ADMIN DASHBOARD
STATUS: COMPLETE / BLOCKED

ADMIN AUTHENTICATION
Admin login: PASS/FAIL
Admin authorization: PASS/FAIL
Credential security: PASS/FAIL
Session security: PASS/FAIL

OVERVIEW
Overview metrics: PASS/FAIL
Real data: PASS/FAIL

COMMUNITY EVENTS
Create: PASS/FAIL
View: PASS/FAIL
Edit: PASS/FAIL
Publish: PASS/FAIL
Schedule: PASS/FAIL
Cancel: PASS/FAIL
Community integration: PASS/FAIL

COMMUNITY VOTING
Create options: PASS/FAIL
Open: PASS/FAIL
Close: PASS/FAIL
Results: PASS/FAIL
Approve/select: PASS/FAIL
Schedule result: PASS/FAIL

USER MANAGEMENT
List: PASS/FAIL
Search: PASS/FAIL
Filters: PASS/FAIL
Pagination: PASS/FAIL
Role management: PASS/FAIL
Account status: PASS/FAIL
Last-admin protection: PASS/FAIL

ACTIVITY
Activity log: PASS/FAIL
Admin action logging: PASS/FAIL

TRAFFIC
Request metrics: PASS/FAIL
Active users: PASS/FAIL/NOT AVAILABLE
Errors: PASS/FAIL
Response time: PASS/FAIL/NOT AVAILABLE
Time filtering: PASS/FAIL/NOT IMPLEMENTED

SECURITY
IDOR: PASS/FAIL
Privilege escalation: PASS/FAIL
Secret protection: PASS/FAIL
Cross-role isolation: PASS/FAIL

FRONTEND
Existing design preserved: YES/NO
Unrelated frontend changes: YES/NO
Accessibility: PASS/FAIL
Localization: PASS/FAIL
Responsive: PASS/FAIL

TESTING
Backend: PASS/FAIL
Frontend: PASS/FAIL
Integration: PASS/FAIL
E2E: PASS/FAIL
Build: PASS/FAIL
Lint: PASS/FAIL

FRONTEND FILES CHANGED:
...

REASON FOR EACH FRONTEND CHANGE:
...

BACKEND FILES CHANGED:
...

DATABASE CHANGES:
...

P0 ISSUES: X
P1 ISSUES: X
P2 ISSUES: X
P3 ISSUES: X

PRODUCTION BLOCKER: YES/NO
```

Never claim PASS without actually testing.

---

# 75. FINAL ARCHITECTURE

The final system should look like:

```text
                         MEMORA
                           │
             ┌─────────────┴─────────────┐
             ↓                           ↓
        EXISTING APP                ADMIN APP
             │                           │
             │                    Admin Login
             │                           │
             │                           ↓
             │                    Backend Auth
             │                           │
             │                           ↓
             │                      ADMIN ROLE
             │                           │
             │            ┌──────────────┼──────────────┐
             │            ↓              ↓              ↓
             │         EVENTS          USERS         TRAFFIC
             │            │              │              │
             │            └──────────────┼──────────────┘
             │                           ↓
             │                     ACTIVITY LOG
             │                           │
             └───────────────────────────┘
                                         ↓
                                   MEMORA BACKEND
                                         ↓
                                      DATABASE
```

The most important principle is:

```text
ADMIN DASHBOARD
      ≠
ENTIRE APPLICATION CONTROL PANEL
```

Keep the admin dashboard focused on:

```text
Events
Voting
Users
Activity
Basic Traffic
```

The admin dashboard should be reliable, secure, understandable, and easy to maintain.

**Do not add unnecessary complexity just to make the dashboard look larger.**

**Do not redesign the existing Memora frontend.**

**Do not create duplicate models, APIs, authentication systems, notification systems, or event systems.**

**Inspect the existing B0-B14 and F0-F17 implementation first, reuse what already exists, implement only the missing pieces, test the complete workflow, and report every change honestly.**
