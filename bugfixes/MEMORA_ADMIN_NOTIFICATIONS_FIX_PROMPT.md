# MEMORA — ADMIN NOTIFICATIONS: FIX "COULD NOT LOAD NOTIFICATIONS" ERROR

## 🚨 EXECUTION MODE — START CODING NOW

The Admin Dashboard → **Notifications System** page is currently broken.

The current UI shows:

> Could Not Load Notifications

with this backend validation error:

```text
type must be one of:
REMINDER,
COMMUNITY_SESSION,
MEETING,
SOS,
POSSIBLE_FALL,
GEOFENCE,
DEVICE_OFFLINE,
LOW_BATTERY,
SYSTEM
```

The frontend is apparently sending a notification `type` value that the backend/database validation does not accept, or the frontend/backend type definitions are inconsistent.

### ABSOLUTE RULE

**START CODING NOW. DO NOT GIVE ME A PLAN OR SUMMARY FIRST.**

You must inspect the existing code, find the exact mismatch, edit the repository, run the available checks, fix the issue, and verify that the Notifications page actually loads.

Do NOT merely explain the error.

Do NOT give me code snippets for manual implementation.

Do NOT stop after identifying the cause.

**Actually modify the existing project.**

---

# 1. DO NOT REDESIGN THE NOTIFICATIONS UI

The existing Notifications System UI is already implemented.

Keep the current design exactly as much as possible:

- Sidebar
- Header
- Notifications title
- Activity Center label
- Mark All Read button
- Settings button
- Category tabs
- Unread Only checkbox
- Notification cards/list
- Error container styling
- Try Again button
- Existing colors
- Existing typography
- Existing spacing

The goal is to **fix functionality**, not redesign the page.

---

# 2. FIRST INSPECT THE EXISTING NOTIFICATION ARCHITECTURE

Immediately search the repository for:

```text
Notification
notifications
NotificationType
notificationType
type
REMINDER
COMMUNITY_SESSION
MEETING
SOS
POSSIBLE_FALL
GEOFENCE
DEVICE_OFFLINE
LOW_BATTERY
SYSTEM
Mark All Read
Unread Only
```

Inspect:

- Notification frontend component
- Notification API/service
- Notification hooks
- Notification context/store
- Backend notification routes
- Backend notification controller/service
- Notification model/schema
- Notification enum/constants
- Validation schemas
- Authentication middleware
- Admin authorization middleware
- Existing notification creation logic
- Existing notification seed data if present

Do not create duplicate notification systems.

---

# 3. IDENTIFY THE EXACT FAILURE

Reproduce the request made when the Admin Notifications page loads.

Inspect:

```text
GET /notifications
```

or the project's actual notification endpoint.

Determine:

```text
Frontend request
        ↓
API route
        ↓
Backend controller/service
        ↓
Database query
        ↓
Notification model validation
        ↓
Error
```

Find the exact field/value causing:

```text
type must be one of:
REMINDER,
COMMUNITY_SESSION,
MEETING,
SOS,
POSSIBLE_FALL,
GEOFENCE,
DEVICE_OFFLINE,
LOW_BATTERY,
SYSTEM
```

### DO NOT GUESS

Inspect the actual:

- request parameters
- database documents
- schema enum
- TypeScript types
- frontend filter values
- backend validation

Then fix the actual mismatch.

---

# 4. CHECK FRONTEND CATEGORY VALUES

The screenshot shows these notification categories:

```text
All Alerts
Reminders
Community
Meetings
Safety SOS
System
```

These UI labels do NOT necessarily have to equal backend enum values.

Inspect the mapping.

For example, the frontend may incorrectly send:

```text
REMINDERS
```

when backend expects:

```text
REMINDER
```

Or:

```text
COMMUNITY
```

when backend expects:

```text
COMMUNITY_SESSION
```

Or:

```text
SAFETY_SOS
```

when backend expects:

```text
SOS
```

If such a mismatch exists, fix the mapping.

### IMPORTANT

Do not change backend enum values simply to match a UI label without first understanding the existing notification architecture.

Prefer a clean UI-label → backend-type mapping.

---

# 5. CHECK THE "ALL ALERTS" FILTER

The default tab is:

```text
All Alerts
```

Verify what value is sent to the backend for this state.

A common bug is something like:

```text
type=ALL
```

or:

```text
type=ALL_ALERTS
```

when `ALL` is not a valid notification type.

If the user selects **All Alerts**, the frontend should normally omit the type filter or use the existing backend-supported mechanism for requesting all types.

Do NOT send an invalid notification type.

Fix this in the actual implementation.

---

# 6. CHECK EVERY CATEGORY MAPPING

Verify all UI filters against the backend enum.

Required backend types shown by the current error:

```text
REMINDER
COMMUNITY_SESSION
MEETING
SOS
POSSIBLE_FALL
GEOFENCE
DEVICE_OFFLINE
LOW_BATTERY
SYSTEM
```

Map the UI appropriately.

Example conceptual mapping:

```text
All Alerts       → no type filter
Reminders        → REMINDER
Community        → COMMUNITY_SESSION
Meetings         → MEETING
Safety SOS       → SOS
System           → SYSTEM
```

But inspect the existing code before implementing this.

Do not blindly assume these mappings if the repository defines a different structure.

---

# 7. CHECK THE BACKEND NOTIFICATION MODEL

Find the actual Notification schema/model.

Inspect the `type` field.

For example:

```javascript
type: {
    type: String,
    enum: [...]
}
```

Verify the enum values.

The error itself indicates that the backend currently accepts:

```text
REMINDER
COMMUNITY_SESSION
MEETING
SOS
POSSIBLE_FALL
GEOFENCE
DEVICE_OFFLINE
LOW_BATTERY
SYSTEM
```

Make sure frontend requests and database records use values supported by this schema.

---

# 8. CHECK EXISTING DATABASE RECORDS

Inspect actual notification records.

Look for invalid values such as:

```text
ALL
ALL_ALERTS
REMINDERS
COMMUNITY
SAFETY_SOS
FALL
```

or any other values not supported by the current enum.

### IMPORTANT

Do NOT automatically delete existing records.

Determine whether the invalid data is:

1. caused by a bad frontend query/filter, or
2. already stored in the database.

If existing records contain obsolete notification types, implement the safest project-consistent migration/normalization strategy.

Do not silently destroy user notification history.

---

# 9. CHECK NOTIFICATION CREATION LOGIC

Search every place where notifications are created.

Examples:

```text
createNotification
Notification.create
new Notification
notifyUser
sendNotification
```

Verify that all notification creators use valid types.

Check notifications generated by:

```text
Reminders
Community sessions
Meetings
Safety/SOS
Possible falls
Geofence
Device offline
Low battery
System
```

If one of these creates an invalid type, fix that source too.

Otherwise the page may work temporarily but break again when a new notification is created.

---

# 10. CHECK TYPE DEFINITIONS

If the project uses TypeScript, inspect all notification type definitions.

Search for:

```typescript
type NotificationType =
enum NotificationType
interface Notification
```

Make sure there is one consistent source of truth.

Avoid situations where:

```text
Frontend enum
≠
Backend enum
≠
Database enum
```

If constants are duplicated, use the existing project architecture to keep them synchronized.

Do not introduce unnecessary complexity.

---

# 11. CHECK QUERY PARAMETER VALIDATION

Inspect backend validation for notification filters.

For example:

```text
req.query.type
```

Verify that:

```text
undefined
```

or no type filter is handled correctly for **All Alerts**.

The backend should not try to validate an omitted type as though it were a real notification type.

If the project uses a validation library, fix the schema/controller appropriately.

---

# 12. CHECK THE "UNREAD ONLY" FILTER

The screenshot contains:

```text
Unread Only
```

Verify that enabling it does not create another invalid request.

Expected conceptual behavior:

```text
All Alerts + Unread Only
→ no type filter + unread=true

Reminders + Unread Only
→ type=REMINDER + unread=true
```

Use the project's actual parameter names.

Test both states.

---

# 13. CHECK "MARK ALL READ"

The page includes:

```text
Mark All Read
```

After fixing loading, verify that this action still works.

Expected:

```text
Click Mark All Read
        ↓
Backend update
        ↓
Notifications become read
        ↓
Unread indicators disappear/update
```

Do not replace it with frontend-only state.

---

# 14. CHECK "TRY AGAIN"

The existing:

```text
Try Again
```

button should retry the actual notification request.

After fixing the underlying error:

```text
Try Again
→ refetch notifications
→ display results
```

Do not hardcode success behavior.

---

# 15. CHECK EMPTY STATE

If there are genuinely no notifications, do NOT show:

```text
Could Not Load Notifications
```

Instead show the existing or appropriate empty state.

For example:

```text
No notifications yet.
```

Use the project's existing empty-state design if one exists.

---

# 16. CHECK ERROR HANDLING

The current page correctly exposes the backend validation message:

```text
type must be one of...
```

Do not hide the underlying error while fixing the root cause.

However, after the bug is fixed, normal users should not encounter this validation error during ordinary page loading.

If an API error still occurs, the UI should continue using the existing error-state component.

---

# 17. DO NOT FIX THIS BY DISABLING VALIDATION

Do NOT solve the problem by removing:

```text
enum validation
```

from the Notification model.

Do NOT change:

```text
type
```

to an unrestricted string merely to make the page load.

The enum provides useful data integrity.

Fix the frontend/backend contract instead.

---

# 18. DO NOT FIX THIS BY HIDING THE ERROR

Do NOT:

```javascript
catch(() => [])
```

just to make the page appear empty.

Do NOT:

```javascript
setNotifications([])
```

on every API failure.

Do NOT use fake notifications.

The page must load the actual notifications from the backend.

---

# 19. REAL DATA ONLY

The Notifications System must use real backend/database data.

Do NOT introduce:

```text
mock notifications
dummy notifications
hardcoded notification arrays
fake counts
static demo alerts
```

The source of truth must remain the backend/database.

---

# 20. PRESERVE EXISTING NOTIFICATION FEATURES

After fixing the error, verify that these work:

```text
All Alerts
Reminders
Community
Meetings
Safety SOS
System
Unread Only
Mark All Read
Try Again
Settings
```

Do not break existing notification behavior while fixing the type issue.

---

# 21. TEST ALL VALID TYPES

Where test data or existing records are available, verify notifications for:

```text
REMINDER
COMMUNITY_SESSION
MEETING
SOS
POSSIBLE_FALL
GEOFENCE
DEVICE_OFFLINE
LOW_BATTERY
SYSTEM
```

They should be retrievable and render correctly.

---

# 22. TEST INVALID TYPE HANDLING

Verify that an invalid type does not crash the entire Notifications page.

The backend should reject invalid notification types according to the existing validation rules.

The frontend should avoid sending invalid values.

Do not weaken validation.

---

# 23. TEST FILTERING

Test:

```text
All Alerts
```

Expected:

```text
All valid notification types
```

Test:

```text
Reminders
```

Expected:

```text
REMINDER
```

Test:

```text
Community
```

Expected:

```text
COMMUNITY_SESSION
```

Test:

```text
Meetings
```

Expected:

```text
MEETING
```

Test:

```text
Safety SOS
```

Expected:

```text
SOS
```

Test:

```text
System
```

Expected:

```text
SYSTEM
```

Also verify any additional backend types are handled according to the existing UI architecture.

---

# 24. CHECK ADMIN AUTHORIZATION

The Notifications System is inside the Admin Dashboard.

Use the existing admin authentication/authorization system.

Do NOT expose admin-only notification management endpoints publicly.

Do NOT hardcode authorization tokens in the frontend.

---

# 25. DO NOT CREATE DUPLICATE NOTIFICATION APIs

Before creating a new endpoint, search the backend.

If an existing notification endpoint already supports the required functionality, fix and reuse it.

Do NOT create:

```text
/api/admin/notifications2
/api/notifications-new
/api/notifications-fixed
```

or similar duplicate endpoints.

---

# 26. PERFORMANCE

Do not fetch all notifications from the database unnecessarily if the existing API supports:

```text
pagination
limit
type filter
unread filter
```

Use the existing architecture.

Do not introduce an unrelated data-fetching library.

---

# 27. RUN PROJECT CHECKS

Inspect `package.json` and run the project's available:

```text
lint
test
build
```

commands.

Also check:

```text
TypeScript errors
ESLint errors
React runtime errors
API errors
Database validation errors
Authentication errors
```

Fix errors caused by your changes.

---

# 28. FINAL END-TO-END TEST

The following must work:

```text
Login as Admin
      ↓
Admin Dashboard
      ↓
Notifications System
      ↓
Page loads successfully
      ↓
Real notifications appear
```

Then:

```text
Click All Alerts
→ notifications load
```

```text
Click Reminders
→ reminder notifications load
```

```text
Click Community
→ community-session notifications load
```

```text
Click Meetings
→ meeting notifications load
```

```text
Click Safety SOS
→ SOS notifications load
```

```text
Click System
→ system notifications load
```

```text
Enable Unread Only
→ only unread notifications load
```

```text
Click Mark All Read
→ real backend state changes
```

---

# 29. IMPORTANT — DO NOT STOP AFTER FINDING THE BUG

If you discover:

> "The frontend sends an invalid notification type."

**FIX THE FRONTEND.**

If you discover:

> "The backend filter incorrectly validates the All Alerts state."

**FIX THE BACKEND.**

If you discover:

> "Existing notification records contain obsolete types."

**Handle the data safely and fix the creation logic.**

If you discover:

> "Frontend and backend enums are inconsistent."

**Synchronize the actual contract.**

If you discover multiple issues:

**FIX ALL OF THEM.**

Do not stop after reporting the first issue.

---

# 30. 🚨 DO NOT GIVE ME A SUMMARY BEFORE CODING

Your workflow MUST be:

```text
INSPECT
   ↓
REPRODUCE
   ↓
TRACE REQUEST
   ↓
FIND TYPE MISMATCH
   ↓
EDIT CODE
   ↓
FIX FRONTEND/BACKEND/DATA AS REQUIRED
   ↓
RUN
   ↓
TEST
   ↓
FIX ERRORS
   ↓
VERIFY
```

NOT:

```text
INSPECT
   ↓
WRITE PLAN
   ↓
WRITE SUMMARY
   ↓
STOP
```

---

# 31. DO NOT WAIT FOR CONFIRMATION

Do NOT ask:

```text
Should I proceed?
Would you like me to fix it?
Should I create an API?
```

**Proceed immediately.**

---

# 32. FINAL ACCEPTANCE CRITERIA

The task is complete only when:

- Notifications page loads without the validation error.
- Real notifications are fetched from the backend.
- No fake/static notifications are introduced.
- All existing valid notification types work.
- All Alerts does not send an invalid type.
- Category filters map correctly to backend types.
- Unread Only works.
- Mark All Read works.
- Try Again works.
- Admin authorization remains intact.
- Existing notification validation remains intact.
- Existing UI design is preserved.
- Project checks pass.

---

# 33. FINAL RESPONSE AFTER CODING

Only AFTER actually modifying and testing the project, give a short report:

```text
ADMIN NOTIFICATIONS FIX

Status: PASS

Root cause:
<actual root cause>

Fixed:
- Notification type mismatch: PASS
- All Alerts filter: PASS
- Category filters: PASS
- Real backend data: PASS
- Unread Only: PASS
- Mark All Read: PASS
- Try Again: PASS
- Admin authorization: PASS

Tests:
- Page load: PASS
- Reminders: PASS
- Community: PASS
- Meetings: PASS
- Safety SOS: PASS
- System: PASS

Files changed:
<list actual files>

UI redesign:
NONE
```

If something genuinely cannot be tested because of an environment limitation, report:

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

**Inspect the existing Memora project, reproduce the Notifications error shown in the screenshot, identify the invalid notification type/filter contract, fix the actual frontend/backend/database issue, preserve the existing UI, run the available checks, and verify that the Admin Notifications page loads real notifications successfully.**
