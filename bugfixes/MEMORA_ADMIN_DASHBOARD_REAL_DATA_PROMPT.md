# MEMORA — ADMIN DASHBOARD: REPLACE STATIC SEEDED DATA WITH REAL BACKEND DATA

## 🚨 EXECUTION MODE — START CODING NOW

The Admin Dashboard currently displays static/seeded/hardcoded values instead of real data from the backend/database.

The screenshot shows values such as:

- Total Registered Users: `17`
- Patient Accounts: `11`
- Caregiver Accounts: `5`
- Session Hosts / Teachers: `0`
- Upcoming Events: `0`
- Active Users (24H): `15`

These values must NOT remain hardcoded.

## PRIMARY OBJECTIVE

Convert the Admin Dashboard from a static/demo dashboard into a **real data-driven dashboard**.

The dashboard must fetch the actual current data from the existing backend/database and display it dynamically.

### IMPORTANT

**DO NOT JUST EXPLAIN THE SOLUTION.**

**DO NOT GIVE ME A SUMMARY FIRST.**

**START INSPECTING AND MODIFYING THE CODE NOW.**

Follow:

```text
INSPECT
→ FIND STATIC DATA
→ FIND EXISTING BACKEND/DATABASE
→ CONNECT FRONTEND TO REAL API
→ IMPLEMENT/FIX BACKEND ENDPOINTS IF NEEDED
→ TEST
→ FIX ERRORS
→ VERIFY REAL VALUES
```

---

# 1. DO NOT CHANGE THE EXISTING ADMIN UI

The existing Admin Dashboard design is already implemented and should be preserved.

Do NOT redesign:

- Header
- Sidebar
- Tabs
- Cards
- Colors
- Fonts
- Spacing
- Icons
- Buttons
- Layout
- Responsive structure

The screenshot represents the existing UI that should remain visually consistent.

### Only change the DATA SOURCE.

The cards should look the same, but their values must come from the real backend.

---

# 2. FIND WHERE THE STATIC DATA COMES FROM

Immediately inspect the Admin Dashboard code.

Search for:

```text
AdminDashboard
Admin Overview
Total Registered Users
Patient Accounts
Caregiver Accounts
Session Hosts
Upcoming Events
Active Users
17
11
5
15
```

Also search for:

```text
mock
dummy
seed
seeded
hardcoded
static
fake
demo
```

Find the exact variables/constants/components responsible for these values.

For example, look for patterns such as:

```javascript
const stats = {
    totalUsers: 17,
    patients: 11,
    caregivers: 5,
    activeUsers: 15
};
```

or:

```javascript
const dashboardStats = [...]
```

or hardcoded JSX such as:

```jsx
<span>17</span>
```

or static arrays.

### REMOVE THE STATIC DATA SOURCE.

Do not merely hide it.

---

# 3. INSPECT THE EXISTING BACKEND

Before creating new APIs, inspect the existing backend.

Search for:

```text
User
Patient
Caregiver
Admin
Event
Community
Session
Activity
Notification
Analytics
```

Inspect:

- User model/schema
- Role fields
- Patient model if present
- Caregiver model if present
- Community Event model
- Community Session model
- Activity/Audit model
- Authentication middleware
- Admin authorization middleware
- Existing controllers
- Existing routes
- Existing API services

### IMPORTANT

Reuse existing backend models and routes whenever possible.

Do NOT create duplicate models if the required data already exists.

---

# 4. DETERMINE THE REAL DATA SOURCE FOR EACH ADMIN STAT

Map every card to real backend data.

## A. TOTAL REGISTERED USERS

Current UI:

```text
TOTAL REGISTERED USERS
17
All system roles
```

This must represent the actual number of registered users in the database.

Expected logic:

```text
Users collection
→ count all valid registered users
→ return count
→ display count
```

Do NOT use a frontend constant.

---

# 5. PATIENT ACCOUNTS

Current UI:

```text
PATIENT ACCOUNTS
11
Active patients
```

Fetch the actual number of users whose role corresponds to the existing patient role.

Use the actual role value from the project's User schema.

Do NOT assume the role name if the repository already defines it.

---

# 6. CAREGIVER ACCOUNTS

Current UI:

```text
CAREGIVER ACCOUNTS
5
Caregivers & Guardians
```

Fetch the actual number of caregiver/guardian accounts from the database using the existing role/model structure.

Do NOT hardcode `5`.

---

# 7. SESSION HOSTS / TEACHERS

Current UI:

```text
SESSION HOSTS / TEACHERS
0
Community session hosts
```

Determine from the existing application how session hosts/teachers are represented.

Use the real database relationship/model/role.

If session hosts are users with a particular role:

```text
Users
→ filter appropriate role
→ count
```

If hosts are stored in a Community Session/Event collection:

```text
Sessions/Events
→ identify unique hosts
→ count
```

Use whichever matches the existing architecture.

Do NOT invent a new concept if the project already has one.

---

# 8. UPCOMING EVENTS

Current UI:

```text
UPCOMING EVENTS
0
Scheduled community sessions
```

This must be based on actual future events/sessions in the database.

Use the existing Community/Event/Session model.

Conceptually:

```text
Events
→ date/time > current time
→ optionally only active/published events
→ count
```

Use the actual date field and status fields in the project.

Do NOT count past events.

Do NOT hardcode `0`.

---

# 9. ACTIVE USERS (24H)

Current UI:

```text
ACTIVE USERS (24H)
15
Logged in past 24 hours
```

This must be based on real activity data.

First inspect whether the project already tracks:

```text
lastLogin
lastActive
lastSeen
activity logs
session timestamps
audit logs
```

Use the existing field/data source if available.

Conceptually:

```text
current time
-
24 hours
=
24h threshold
```

Then count users whose existing activity/last-active timestamp falls within that period.

### IMPORTANT

Do NOT simply use:

```text
total users
```

and label it active users.

Do NOT hardcode `15`.

Do NOT fake activity data.

---

# 10. IF A REQUIRED BACKEND ENDPOINT DOES NOT EXIST

If the frontend needs an Admin Dashboard statistics endpoint and no suitable endpoint exists:

**CREATE ONE IN THE EXISTING BACKEND ARCHITECTURE.**

For example, conceptually:

```text
GET /api/admin/dashboard/stats
```

But FIRST inspect the project's existing route naming conventions.

Use the project's established API structure instead of blindly introducing a new naming convention.

The endpoint should return real database-derived values.

Example response shape:

```json
{
  "totalUsers": 0,
  "patientAccounts": 0,
  "caregiverAccounts": 0,
  "sessionHosts": 0,
  "upcomingEvents": 0,
  "activeUsers24h": 0
}
```

The exact property names should match the existing frontend architecture.

---

# 11. ADMIN AUTHORIZATION IS REQUIRED

The Admin Dashboard is restricted to administrators.

Make sure the statistics endpoint is protected by the existing authentication and admin authorization middleware.

The backend must NOT expose admin statistics publicly.

Use the existing auth system.

Do NOT bypass authentication.

Do NOT hardcode a secret admin token into frontend code.

---

# 12. FRONTEND API INTEGRATION

Find the existing API architecture.

It may use:

```text
axios
fetch
custom API client
React Query
SWR
Redux
Context
Zustand
custom hooks
```

Use whatever the project already uses.

Do NOT introduce another API/data-fetching library unnecessarily.

Create/use an appropriate Admin Dashboard stats service/hook.

The flow should become:

```text
Admin Dashboard
      ↓
Admin stats API
      ↓
Backend
      ↓
Database
      ↓
Real statistics
      ↓
Frontend
      ↓
Dashboard cards
```

---

# 13. REMOVE HARDCODED VALUES

After connecting the API, search the Admin Dashboard again for the previous static values:

```text
17
11
5
15
```

Do not blindly remove every occurrence globally because some numbers may be legitimate elsewhere.

Instead verify that these values are no longer being used as Admin Dashboard statistics.

The dashboard must render from fetched state.

---

# 14. LOADING STATE

While the dashboard statistics are being fetched, implement a proper loading state using the existing UI style.

Do NOT redesign the cards.

Possible behavior:

```text
Loading...
```

or an existing skeleton/loading component if the project already has one.

Do not show fake numbers during loading.

---

# 15. ERROR STATE

If the API fails:

```text
GET /admin/stats
```

the dashboard must not silently display fake seeded values.

Use the project's existing error handling/toast pattern.

Display an appropriate fallback such as:

```text
Unable to load statistics
```

while preserving the dashboard layout.

---

# 16. EMPTY DATABASE BEHAVIOR

If there are genuinely:

```text
0 patients
0 caregivers
0 upcoming events
```

display:

```text
0
```

That is valid.

Do NOT replace zero with demo values.

---

# 17. REAL-TIME / REFRESH BEHAVIOR

The dashboard should retrieve current data when the Admin Dashboard loads.

If the existing project has a refresh/revalidation system, use it.

At minimum:

```text
Open Admin Dashboard
→ fetch current backend data
→ display current values
```

If the admin creates/deletes users or events through the dashboard and the architecture supports immediate refresh:

```text
Mutation succeeds
→ invalidate/refetch dashboard stats
→ cards update
```

Do not use a full page reload as the primary mechanism.

---

# 18. COMMUNITY EVENTS MUST BE REAL

The Admin Dashboard contains:

```text
Community Events
```

and:

```text
Upcoming Events
```

Make sure the statistic is connected to the same real event data used by the Community section.

If an admin creates an event:

```text
Create Event
→ database
→ Admin Overview
→ Upcoming Events count increases
```

If an upcoming event is deleted/cancelled:

```text
Delete/Cancel Event
→ database
→ Admin Overview
→ count updates
```

Use the existing event status rules.

---

# 19. USER MANAGEMENT MUST USE THE SAME SOURCE

The:

```text
User Management
```

section and:

```text
Total Registered Users
Patient Accounts
Caregiver Accounts
```

should not use separate fake datasets.

They must be based on the same actual users/database.

There should be one source of truth.

---

# 20. DO NOT USE LOCAL STORAGE AS THE DATABASE

Do NOT implement this using:

```text
localStorage
sessionStorage
hardcoded JSON
frontend arrays
```

The database/backend is the source of truth.

---

# 21. DO NOT CREATE DUPLICATE SEED DATA

Do not add more seed values to make the dashboard work.

Do not modify seeded counts to match the screenshot.

The screenshot values are examples of what is currently displayed and are NOT the desired final values.

The final values must reflect the actual database.

---

# 22. TEST WITH REAL DATA

After implementation, verify the values against the database.

For example:

```text
Database:
Users = X
Patients = Y
Caregivers = Z
Upcoming events = A
Active users in last 24h = B
```

The Admin Dashboard must show:

```text
X
Y
Z
A
B
```

Do not mark the feature complete until the values match.

---

# 23. TEST DATA CHANGES

Perform real database-changing operations through the existing application.

## Test 1 — New Patient

```text
Create/register patient
→ database changes
→ reload Admin Dashboard
→ Patient Accounts changes
→ Total Registered Users changes
```

## Test 2 — New Caregiver

```text
Create/register caregiver
→ database changes
→ reload Admin Dashboard
→ Caregiver Accounts changes
→ Total Registered Users changes
```

## Test 3 — New Upcoming Event

```text
Create future community event
→ database changes
→ reload Admin Dashboard
→ Upcoming Events changes
```

## Test 4 — Event No Longer Upcoming

```text
Past/cancel/delete event
→ database changes
→ reload dashboard
→ Upcoming Events recalculates
```

## Test 5 — Activity

Use the existing login/activity mechanism.

Verify that actual user activity is reflected in:

```text
Active Users (24H)
```

---

# 24. HANDLE DATE/TIME CORRECTLY

Upcoming event and active-user calculations depend on time.

Use the backend/server's appropriate current time logic.

Avoid timezone bugs.

For upcoming events, compare against the actual event date/time.

For active users, compare against a real activity timestamp.

---

# 25. SECURITY

Do NOT expose:

- passwords
- password hashes
- tokens
- private user information unnecessarily

The statistics endpoint should return only the aggregate information required by the dashboard.

---

# 26. PERFORMANCE

Do not fetch every user into the frontend just to calculate counts if the backend/database can perform efficient counts.

Prefer database-level aggregation/count operations.

Conceptually:

```text
countDocuments()
```

or appropriate aggregation.

Do not send hundreds/thousands of users to the browser merely to display:

```text
Total Registered Users
```

---

# 27. CHECK FOR EXISTING ANALYTICS

The screenshot has:

```text
Platform Analytics
Basic Traffic
Activity Log
```

Do not build all analytics in this task unless necessary for the six overview cards.

However, if existing analytics/activity endpoints already provide the required real values, reuse them.

Do not duplicate backend logic unnecessarily.

---

# 28. KEEP EXISTING ADMIN FEATURES WORKING

After changing the Admin Dashboard data source, verify that these still work:

```text
Community Events
Community Voting
User Management
Activity Log
Basic Traffic
Notifications System
```

Do not break navigation or existing admin functionality.

---

# 29. SEARCH FOR ALL STATIC ADMIN DATA

After the main implementation, search the Admin Dashboard code for:

```text
mock
dummy
seed
static
fake
demo
hardcoded
```

Remove/replace only data that is supposed to represent real backend state.

Some UI configuration arrays may legitimately remain static, such as:

```text
navigation items
labels
icons
```

Do not remove legitimate static UI configuration.

---

# 30. IMPORTANT — DO NOT STOP AT ANALYSIS

If you discover:

> "The dashboard is using hardcoded values."

DO NOT JUST TELL ME THAT.

**REMOVE THE HARDCODED DATA AND CONNECT THE REAL API.**

If you discover:

> "There is no stats endpoint."

**CREATE THE REQUIRED ENDPOINT.**

If you discover:

> "The API exists but frontend isn't using it."

**CONNECT THE FRONTEND.**

If you discover:

> "The API returns incorrect values."

**FIX THE BACKEND QUERY.**

If you discover:

> "The API works but UI is stale."

**FIX THE frontend state/cache.**

Continue until the complete flow works.

---

# 31. 🚨 DO NOT GIVE ME A SUMMARY BEFORE CODING

Your workflow MUST be:

```text
INSPECT
   ↓
FIND STATIC DATA
   ↓
TRACE EXISTING BACKEND
   ↓
IMPLEMENT/FIX API
   ↓
CONNECT FRONTEND
   ↓
RUN
   ↓
TEST
   ↓
FIX ERRORS
   ↓
VERIFY REAL DATABASE VALUES
```

NOT:

```text
INSPECT
   ↓
WRITE SUMMARY
   ↓
STOP
```

---

# 32. DO NOT WAIT FOR CONFIRMATION

You have enough information to start.

Do NOT ask:

```text
"Should I proceed?"
"Do you want me to implement this?"
"Would you like me to create the API?"
```

**Proceed immediately.**

---

# 33. RUN PROJECT CHECKS

Inspect `package.json` and run the project's existing:

```text
lint
test
build
```

commands where available.

Fix any errors caused by your changes.

Check for:

```text
TypeScript errors
ESLint errors
React runtime errors
API errors
MongoDB errors
authentication errors
```

---

# 34. FINAL ACCEPTANCE CRITERIA

The task is complete only when:

### Total Registered Users

```text
Frontend value
=
actual database user count
```

### Patient Accounts

```text
Frontend value
=
actual patient count
```

### Caregiver Accounts

```text
Frontend value
=
actual caregiver count
```

### Session Hosts / Teachers

```text
Frontend value
=
actual host/teacher count according to existing architecture
```

### Upcoming Events

```text
Frontend value
=
actual upcoming event/session count
```

### Active Users (24H)

```text
Frontend value
=
actual users active within the previous 24 hours
```

And:

```text
Refresh browser
→ values still come from backend
```

No hardcoded statistics.

---

# 35. FINAL RESPONSE

Only AFTER actually editing and testing the project, give a short report:

```text
ADMIN DASHBOARD REAL DATA INTEGRATION

Status: PASS

Connected:
- Total Registered Users: PASS
- Patient Accounts: PASS
- Caregiver Accounts: PASS
- Session Hosts / Teachers: PASS
- Upcoming Events: PASS
- Active Users (24H): PASS

Backend:
- Real database queries: PASS
- Admin authorization: PASS

Frontend:
- API integration: PASS
- Loading state: PASS
- Error handling: PASS
- Static seeded statistics removed: PASS

Persistence:
- Refresh shows real backend values: PASS

Files changed:
<list files>

Root cause:
<one short sentence>
```

If something genuinely cannot be completed because of an environment limitation, report:

```text
BLOCKED
```

and state the exact blocker.

---

# 🚨 FINAL COMMAND

**START CODING NOW.**

Do not give me a plan first.

Do not give me a summary first.

Do not wait for confirmation.

**Inspect the existing Memora project, locate the static Admin Dashboard statistics, connect them to the real backend/database, create/fix the required API if necessary, modify the frontend to consume the real data, run the project checks, fix errors, and verify the displayed numbers against real database data.**

The existing Admin Dashboard design must remain unchanged.
