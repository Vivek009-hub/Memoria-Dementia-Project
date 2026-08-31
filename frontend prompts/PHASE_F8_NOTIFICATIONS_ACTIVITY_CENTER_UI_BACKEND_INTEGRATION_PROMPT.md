# Memora - Phase F8 Prompt: Notifications + Activity Center UI + Backend Integration

**Phase:** F8  
**Name:** Notifications + Activity Center UI + Backend Integration  
**Prerequisites:** F0, F1, F2, F3, F4, F5, F6, and F7 completed and verified  
**Backend prerequisite:** Existing B9 notification APIs, notification models, notification preferences, read/unread behavior, and activity-related APIs must be inspected before implementation  
**Status:** Ready for implementation

---

# OBJECTIVE

Build the patient-facing Notifications and Activity Center experience for Memora and connect it to the existing backend notification system.

F8 should give patients one simple place to understand important updates from Memora without overwhelming them.

Target flow:

```text
Patient
  ↓
🔔 Notification Bell
  ↓
Notification Center
  ↓
Unread / Read Notifications
  ↓
Tap Notification
  ↓
Navigate to Relevant Feature
```

The Activity Center should provide a clear history of meaningful patient-facing events when supported by the existing backend.

The frontend must consume the existing B9 notification architecture.

Do NOT build a second notification delivery system.

Do NOT duplicate notification persistence.

Do NOT create browser push infrastructure unless it already exists in the project specification/backend.

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
docs/F0_FRONTEND_FOUNDATION_REPORT.md
docs/F1_DESIGN_SYSTEM.md
docs/F1_DESIGN_SYSTEM_REPORT.md
docs/F2_AUTH_ROLE_UI_REPORT.md
docs/F3_PATIENT_DASHBOARD.md
docs/F3_PATIENT_DASHBOARD_REPORT.md
docs/F4_COGNITIVE_GAMES.md
docs/F4_COGNITIVE_GAMES_REPORT.md
docs/F5_MEMORY_ASSISTANCE_REPORT.md
docs/F6_REMINDERS.md
docs/F6_REMINDERS_REPORT.md
docs/F7_COMMUNITY_MEETING_CIRCLE.md
docs/F7_COMMUNITY_MEETING_CIRCLE_REPORT.md
```

Also inspect the actual implementation of:

```text
F0
F1
F2
F3
F4
F5
F6
F7
B9
Notification models
Notification routes
Notification controllers
Notification services
Notification creation/triggers
Read/unread logic
Notification preferences
Activity APIs if they exist
Realtime notification mechanism if it exists
```

The actual repository and backend API contracts are authoritative.

---

# 2. CRITICAL RULES

## Rule 1: Inspect B9 first

Identify the actual:

```text
Notification endpoints
Request fields
Response fields
Notification types
Read/unread state
Read-all behavior
Deletion behavior
Pagination
Sorting
Preferences
Realtime behavior
Authorization
```

Do not invent endpoints.

---

## Rule 2: Reuse F0-F7

Reuse:

```text
Central API client
Authentication
Patient layout
Routing
Design system
Cards
Buttons
Tabs
Dialogs
Badges
Loading
Empty states
Error states
Localization
Accessibility
Date/time utilities
```

Do not create duplicate systems.

---

## Rule 3: Backend is authoritative

The backend determines:

```text
Which notifications exist
Who receives them
Read/unread state
Notification type
Timestamp
Destination
Expiration
Authorization
```

The frontend determines only presentation and interaction.

---

# 3. F8 SCOPE

Implement:

```text
Notification Bell
Unread Badge
Notification Center
Notification List
Notification Item
Read State
Mark Read
Mark All Read where supported
Delete/Dismiss where supported
Notification Details where needed
Navigation from notifications
Activity Center where supported
Activity List
Activity Details where supported
Loading
Empty
Error
Retry
Pagination/infinite loading where supported
Realtime updates where supported
Accessibility
Localization
Responsive design
Privacy
```

Only implement capabilities supported by the backend.

---

# 4. NOTIFICATION BELL

The notification bell should be available through the existing patient layout where appropriate.

Example:

```text
┌──────────────────────────────────┐
│ Memora                     🔔 3  │
└──────────────────────────────────┘
```

The badge should represent actual unread notifications if B9 provides that value.

Do not calculate unread count by loading an arbitrary subset of notifications.

---

# 5. UNREAD BADGE

If there are unread notifications:

```text
🔔 3
```

If there are none:

```text
🔔
```

Do not show:

```text
0
```

unless the existing design system explicitly uses that convention.

---

# 6. NOTIFICATION CENTER

Create:

```text
/app/notifications
```

or the route established by the existing application.

Example:

```text
🔔 Notifications

[ All ] [ Unread ]

┌──────────────────────────────┐
│ 🎵 Community Session         │
│ You registered for Music &   │
│ Memory.                      │
│ 10 minutes ago               │
└──────────────────────────────┘

┌──────────────────────────────┐
│ ⏰ Reminder                  │
│ You have an upcoming activity│
│ at 5:00 PM.                  │
│ 1 hour ago                   │
└──────────────────────────────┘
```

Use actual backend notification data.

---

# 7. NOTIFICATION TYPES

Use actual B9 notification types.

Potential examples:

```text
Reminder
Community Session
Meeting
System
Memory
Game
Safety
```

Only display types that actually exist.

Do not create frontend-only notification types.

---

# 8. NOTIFICATION ITEM

A notification item should prioritize:

```text
Icon
Short title
Short message
Timestamp
Read/unread state
```

Avoid dense metadata.

---

# 9. READ STATE

Unread notifications should be clearly distinguishable.

Do not rely only on color.

Use:

```text
Unread
Read
```

with accessible visual cues.

---

# 10. MARK AS READ

If supported:

```text
Patient opens notification
       ↓
Mark as read
       ↓
Backend confirms
       ↓
UI updates
```

Use the actual B9 endpoint.

---

# 11. MARK ALL AS READ

If supported:

```text
[ Mark all as read ]
```

Flow:

```text
Patient taps
 ↓
Backend
 ↓
Confirmation
 ↓
Unread badge updates
```

Prevent duplicate requests.

---

# 12. DELETE / DISMISS

Only implement if B9 supports it.

Example:

```text
[ Dismiss ]
```

Do not permanently delete notifications using a frontend-only operation.

---

# 13. NOTIFICATION DETAILS

Only create a separate details page if the notification contains enough information to justify it.

Otherwise:

```text
Tap notification
 ↓
Mark read
 ↓
Navigate to destination
```

is preferable.

---

# 14. NOTIFICATION NAVIGATION

If B9 supplies a destination:

```text
Notification
 ↓
Target route
```

Use safe, predefined application routes.

Do not blindly navigate to arbitrary URLs returned by untrusted data.

---

# 15. DEEP LINKING

Example:

```text
Community notification
 ↓
Community Session details
```

or:

```text
Reminder notification
 ↓
Reminder details
```

Use existing F3-F7 routes.

---

# 16. ROUTE VALIDATION

If notification payload contains:

```text
route
path
resourceId
```

validate it before navigation.

Do not allow arbitrary:

```text
javascript:
external redirects
```

---

# 17. NOTIFICATION EMPTY STATE

If there are no notifications:

```text
🔔

You're all caught up.

No new notifications.
```

---

# 18. UNREAD EMPTY STATE

If the user selects Unread and none exist:

```text
You're all caught up.

No unread notifications.
```

---

# 19. LOADING STATE

Use F0/F1 loading components.

Example:

```text
Loading your notifications...
```

---

# 20. ERROR STATE

Example:

```text
We couldn't load your notifications.

[ Try Again ]
```

Do not expose backend stack traces.

---

# 21. PAGINATION

If B9 supports pagination:

```text
Use the backend pagination contract.
```

Do not fetch the entire notification history unnecessarily.

---

# 22. INFINITE SCROLL

If infinite loading is used:

```text
Load next page
 ↓
Append
 ↓
Stop when backend says no more
```

Avoid duplicate pages.

Only use infinite scroll if it fits the existing frontend architecture.

---

# 23. NOTIFICATION SORTING

Use backend ordering if available.

Otherwise use centralized deterministic timestamp sorting.

Do not create different ordering rules in multiple components.

---

# 24. NOTIFICATION TIMESTAMPS

Display human-friendly timestamps:

```text
Just now
10 minutes ago
Today
Yesterday
15 September
```

Use centralized date/time utilities.

---

# 25. TIMEZONE

Use the project's existing timezone model.

Do not create a new timezone implementation.

---

# 26. REALTIME NOTIFICATIONS

If B9 already supports:

```text
WebSocket
SSE
Polling
Push
```

reuse the existing mechanism.

Do not create a second realtime system.

---

# 27. REALTIME UPDATE FLOW

If supported:

```text
Backend creates notification
        ↓
Existing realtime mechanism
        ↓
Frontend receives notification
        ↓
Notification list updates
        ↓
Unread badge updates
```

Do not require a full page refresh.

---

# 28. DUPLICATE REALTIME EVENTS

Ensure the same notification is not displayed twice if the backend/realtime layer delivers duplicate events.

Use the backend notification identifier.

---

# 29. RECONNECT

If realtime exists:

```text
Connection lost
 ↓
Existing reconnect mechanism
 ↓
Resume updates
```

Do not build a competing connection manager.

---

# 30. NOTIFICATION CACHE

Use the F0 server-state architecture.

Do not create ad-hoc global notification caches.

---

# 31. CACHE INVALIDATION

After:

```text
Mark read
Mark all read
Delete/dismiss
```

update or invalidate the notification state correctly.

---

# 32. UNREAD COUNT CONSISTENCY

The following should remain consistent:

```text
Bell badge
Notification page
Unread tab
```

Use the same server-state source where possible.

---

# 33. ACTIVITY CENTER

If the existing backend provides an activity feed, create the patient-facing Activity Center.

Potential route:

```text
/app/activity
```

or combine it with notifications if that matches the existing product architecture.

Do not create an activity backend if none exists.

---

# 34. ACTIVITY CENTER PURPOSE

Activity Center should show meaningful patient-facing events.

Potential examples:

```text
Completed a cognitive game
Added a memory
Registered for a community session
Completed a reminder
Joined a meeting
```

Only display activities supported by the backend.

---

# 35. ACTIVITY CARD

Example:

```text
🧠 Cognitive Game Completed

Memory Match
Score: 85

Today · 4:30 PM
```

Only show score/metrics if the activity API explicitly provides them.

---

# 36. ACTIVITY PRIVACY

Do not display private internal events.

Do not expose:

```text
Admin actions
Internal backend events
AI system logs
Security logs
Other patients' activities
```

---

# 37. ACTIVITY TIMELINE

If appropriate:

```text
Today
  ↓
Yesterday
  ↓
Earlier
```

Use actual timestamps.

---

# 38. ACTIVITY EMPTY STATE

Example:

```text
📋

No recent activity yet.
```

---

# 39. ACTIVITY DETAILS

Only create details pages if backend provides meaningful detail and the UX benefits from it.

Do not create fake detail data.

---

# 40. NOTIFICATION → ACTIVITY RELATIONSHIP

Do not assume every notification is an activity.

Keep the two concepts separate:

```text
Notification = something the patient should notice
Activity = something the patient did or an event recorded about them
```

If the backend combines them, follow the actual backend model.

---

# 41. REMINDER INTEGRATION

F6 reminder events may generate B9 notifications.

F8 should display them through B9.

Do not implement reminder notification generation.

---

# 42. COMMUNITY INTEGRATION

F7 community events may generate:

```text
Registration confirmation
Session reminder
Cancellation
Schedule change
```

Display backend-generated notifications.

Do not create them in React.

---

# 43. MEETING INTEGRATION

Meeting-related notifications may include:

```text
Upcoming meeting
Meeting reminder
Meeting cancellation
Schedule change
```

Use actual B9 notification data.

---

# 44. GAME INTEGRATION

Game-related activity may be displayed if the activity backend provides it.

Do not create a separate game history database.

---

# 45. MEMORY INTEGRATION

Memory-related activity may be displayed if supported.

Do not log memory contents into activity records from the frontend.

---

# 46. SAFETY NOTIFICATIONS

If safety-related notifications exist:

```text
Display according to B9/backend semantics.
```

Do not create a new SOS/fall-detection system in F8.

Safety functionality belongs to the dedicated safety/mobile architecture.

---

# 47. NOTIFICATION PREFERENCES

If B9 supports preferences, implement patient-accessible preference UI only if specified.

Potential:

```text
Reminder notifications
Community notifications
Meeting notifications
```

Use actual backend preference types.

---

# 48. PREFERENCE SAFETY

Do not allow patients to disable critical safety notifications if the backend/project prevents that.

Backend remains authoritative.

---

# 49. PREFERENCE PAGE

If implemented, use:

```text
/app/settings/notifications
```

or the project's existing settings architecture.

Do not create a separate settings system.

---

# 50. TOGGLES

Notification preference toggles should be:

```text
Accessible
Large enough
Clearly labeled
```

Do not use unlabeled switches.

---

# 51. PREFERENCE SAVE

If preferences are server-persisted:

```text
Toggle
 ↓
Backend
 ↓
Confirmation
```

Do not treat localStorage as the source of truth.

---

# 52. PREFERENCE FAILURE

If saving fails:

```text
Restore previous state
```

or otherwise synchronize with the backend.

Do not leave UI state claiming a preference was saved when it was not.

---

# 53. BROWSER NOTIFICATIONS

Do not implement browser notifications unless they already exist in the project requirements/backend.

If browser permission is required:

```text
Request only when necessary.
```

Do not automatically request notification permission on page load.

---

# 54. PUSH NOTIFICATIONS

If push infrastructure already exists:

```text
Use the existing architecture.
```

Do not introduce another provider.

---

# 55. PRIVACY

Notifications can contain sensitive personal information.

Do not expose notification content in:

```text
URLs
console logs
analytics
error reports
```

unless explicitly required and safe.

---

# 56. LOGGING

Do not use:

```text
console.log(notification)
console.log(activity)
```

in production.

Avoid logging:

```text
Notification message
Private event details
Patient identifiers
Meeting links
```

---

# 57. AUTHORIZATION

Backend must determine:

```text
Which notifications the user receives
Which activity records the user can access
```

Do not fetch all notifications and filter them client-side.

---

# 58. USER ID

Do not allow frontend-controlled:

```text
userId
patientId
recipientId
```

to determine whose notifications are shown.

Use authenticated identity.

---

# 59. SECURITY

Inspect for:

```text
Unsafe notification routes
External redirects
Private meeting URLs
Sensitive data in logs
Token leakage
Unauthorized resource IDs
```

---

# 60. NO DIRECT DATABASE ACCESS

Frontend must never access MongoDB or another database directly.

---

# 61. NO DIRECT NOTIFICATION PROVIDER ACCESS

Do not call:

```text
Firebase
OneSignal
Email provider
SMS provider
```

directly from the patient UI unless the existing architecture explicitly requires it.

Use the backend.

---

# 62. ACCESSIBILITY

Notification UI must support:

```text
Keyboard navigation
Screen readers
Visible focus
Semantic lists
Accessible buttons
Accessible tabs
Accessible status messages
```

---

# 63. SCREEN READER ANNOUNCEMENTS

For realtime notifications:

```text
New notification received
```

should be announced appropriately without repeatedly interrupting the user.

Use accessible live-region behavior carefully.

---

# 64. UNREAD VISUALS

Do not rely only on:

```text
Background color
Dot color
```

Use accessible text/state where appropriate.

---

# 65. TAB ACCESSIBILITY

If using:

```text
All
Unread
```

implement an accessible tab/filter pattern consistent with F1.

---

# 66. ELDER-FRIENDLY DESIGN

Prioritize:

```text
Large notification rows
Short messages
Clear timestamps
Large tap targets
Simple actions
Minimal controls
```

Avoid notification overload.

---

# 67. LOCALIZATION

Use the existing localization system.

Prepare for:

```text
English
Hindi
Other configured regional languages
```

Do not hardcode patient-facing notification labels.

---

# 68. TRANSLATION-SAFE UI

Long translated notification titles/messages must not break:

```text
Cards
Rows
Badges
Tabs
Buttons
```

---

# 69. DATE/TIME LOCALIZATION

Use centralized utilities.

Do not hardcode:

```text
Today
Yesterday
months
days
```

without localization support.

---

# 70. RESPONSIVE DESIGN

Test:

```text
Desktop
Tablet
Mobile browser
```

Notification rows should remain readable on small screens.

---

# 71. TOUCH TARGETS

Important actions such as:

```text
Open
Mark read
Mark all read
Dismiss
```

must have comfortable touch targets.

---

# 72. OFFLINE STATE

If notifications cannot be fetched offline:

```text
You are offline.
Notifications may be unavailable.
```

Do not falsely show stale data as current unless the cache explicitly identifies it as cached.

---

# 73. CACHED NOTIFICATIONS

If existing architecture supports caching:

```text
Reuse it.
```

Clearly handle stale cached data where appropriate.

---

# 74. ERROR HANDLING

Handle applicable:

```text
400
401
403
404
409
410
429
500
Network failure
Timeout
```

through F0 error handling.

---

# 75. MARK READ FAILURE

If marking read fails:

```text
Do not permanently remove unread state locally.
```

Synchronize with backend.

---

# 76. MARK ALL READ FAILURE

If mark-all fails:

```text
Keep unread state consistent with backend.
```

Do not pretend all notifications were read.

---

# 77. DELETE FAILURE

If deletion is supported and fails:

```text
Keep notification visible.
```

---

# 78. REALTIME FAILURE

If realtime connection fails:

```text
Use existing fallback behavior.
```

Do not silently claim realtime is active.

---

# 79. API LAYER

Use a centralized notification/activity API module.

Conceptual methods:

```text
notificationApi.list()
notificationApi.getUnreadCount()
notificationApi.markRead()
notificationApi.markAllRead()
notificationApi.delete()
activityApi.list()
activityApi.get()
notificationApi.getPreferences()
notificationApi.updatePreferences()
```

These are conceptual only.

Implement only actual backend endpoints.

---

# 80. COMPONENT ARCHITECTURE

Potential reusable components:

```text
NotificationBell
UnreadBadge
NotificationCenter
NotificationList
NotificationItem
NotificationStatus
ActivityCenter
ActivityList
ActivityItem
NotificationPreferences
```

Only create components that provide real reuse.

---

# 81. COMPONENT REUSE

Reuse existing:

```text
Card
Button
Badge
Tabs
Dialog
Loading
EmptyState
ErrorState
```

from F1/F3.

---

# 82. STATE MANAGEMENT

Use the F0 server-state architecture.

Do not introduce a new state library.

---

# 83. CACHE CONSISTENCY

Keep these synchronized:

```text
Notification Bell
Unread Count
Notification List
Unread Filter
```

---

# 84. PERFORMANCE

Avoid:

```text
Fetching entire notification history
Repeated unread-count requests
Aggressive polling
Rendering huge lists
Duplicate realtime subscriptions
```

Use pagination where supported.

---

# 85. SUBSCRIPTION CLEANUP

If realtime listeners are used:

```text
Subscribe
 ↓
Component unmount
 ↓
Unsubscribe
```

Do not leave duplicate listeners after navigation.

---

# 86. DUPLICATE EVENTS

Deduplicate realtime notifications using the backend notification identifier.

Do not rely only on message text.

---

# 87. TESTING

Add tests for:

```text
Notification bell
Unread count
Notification list
Unread filter
Mark read
Mark all read
Delete/dismiss where supported
Navigation
Activity center
Preferences where supported
Realtime updates where supported
```

---

# 88. NOTIFICATION TESTING

Test:

```text
No notifications
Unread notifications
Read notifications
Successful mark read
Mark read failure
Mark all read
Delete
Pagination
```

where supported.

---

# 89. REALTIME TESTING

If realtime exists, test:

```text
New notification arrives
Unread badge updates
Notification list updates
Duplicate event handling
Reconnect behavior
Cleanup
```

---

# 90. ACTIVITY TESTING

If activity exists, test:

```text
Activity list
Empty state
Details
Pagination
Privacy
```

---

# 91. AUTHORIZATION TESTING

Verify:

```text
Patient receives only authorized notifications
Patient cannot access another user's notification
Patient cannot access another user's activity
```

---

# 92. NAVIGATION SECURITY TESTING

Verify notification destinations cannot:

```text
Open arbitrary external URLs
Execute javascript URLs
Bypass authorization
```

---

# 93. ACCESSIBILITY TESTING

Test:

```text
Keyboard
Screen reader
Focus
Tabs
Live regions
Buttons
Status messages
```

---

# 94. RESPONSIVE TESTING

Test:

```text
Desktop
Tablet
Mobile
```

---

# 95. LOCALIZATION TESTING

Test:

```text
English
Hindi
Configured regional languages
Long translated notification text
```

---

# 96. BROWSER CONSOLE

Check for:

```text
Unhandled errors
React warnings
Failed requests
Duplicate subscriptions
Accessibility warnings
```

---

# 97. SECURITY REVIEW

Inspect for:

```text
Sensitive notification logs
Unsafe navigation
Private meeting URLs
Unauthorized IDs
Tokens in logs
Direct provider calls
```

---

# 98. DOCUMENTATION

Create:

```text
docs/F8_NOTIFICATIONS_ACTIVITY.md
```

Document:

```text
Notification architecture
Bell/unread count
Notification center
Read/unread behavior
Navigation
Activity center
Realtime behavior
Preferences
Privacy
Security
Accessibility
Localization
Responsive design
Testing
```

Update:

```text
CLAUDE.md
docs/FRONTEND_ARCHITECTURE.md
```

where appropriate.

---

# 99. MULTI-DEVELOPER RULE

If multiple developers work on F8:

```text
Developer A → Notification Center
Developer B → Activity Center
Developer C → Preferences/Realtime
```

all must reuse:

```text
Shared API layer
Shared notification state
Shared design system
Shared components
```

Do not create multiple notification stores or realtime connection managers.

---

# 100. GIT SAFETY

Before modifying:

```bash
git status
```

Do not use:

```bash
git reset --hard
git clean -fd
```

Do not overwrite another developer's work.

---

# 101. DEFINITION OF DONE

F8 is complete only when:

[ ] F0 inspected  
[ ] F1 inspected  
[ ] F2 inspected  
[ ] F3 inspected  
[ ] F4 inspected  
[ ] F5 inspected  
[ ] F6 inspected  
[ ] F7 inspected  
[ ] B9 inspected  
[ ] Notification APIs verified  
[ ] Notification types verified  
[ ] Read/unread model verified  
[ ] Pagination verified  
[ ] Realtime behavior verified  
[ ] Preference behavior verified where supported  
[ ] Notification bell implemented  
[ ] Unread badge implemented  
[ ] Notification center implemented  
[ ] Notification list implemented  
[ ] Notification item implemented  
[ ] Read state implemented  
[ ] Mark read implemented where supported  
[ ] Mark all read implemented where supported  
[ ] Delete/dismiss implemented where supported  
[ ] Notification navigation implemented  
[ ] Safe route handling implemented  
[ ] Activity center implemented where backend supports it  
[ ] Activity list implemented where supported  
[ ] Activity details implemented where supported  
[ ] Notification preferences implemented where supported  
[ ] Realtime integration implemented where supported  
[ ] Duplicate realtime events handled  
[ ] Subscription cleanup verified  
[ ] Cache consistency verified  
[ ] Dashboard bell integration verified  
[ ] Loading states implemented  
[ ] Empty states implemented  
[ ] Error states implemented  
[ ] Retry behavior implemented  
[ ] Authorization verified  
[ ] Privacy verified  
[ ] Sensitive logging removed  
[ ] No direct database access  
[ ] No direct notification-provider access  
[ ] No unsafe redirects  
[ ] Accessibility verified  
[ ] Localization verified  
[ ] Responsive design verified  
[ ] Notification tests added  
[ ] Activity tests added  
[ ] Realtime tests added where applicable  
[ ] Authorization tests performed  
[ ] Navigation security tests performed  
[ ] Accessibility tests performed  
[ ] Localization tests performed  
[ ] Browser console checked  
[ ] Lint passes  
[ ] Tests pass  
[ ] Build passes  
[ ] Documentation updated  
[ ] No secrets committed  
[ ] No unrelated feature creep  

---

# 102. FINAL REPORT

Create:

```text
docs/F8_NOTIFICATIONS_ACTIVITY_REPORT.md
```

Use:

```text
# Memora F8 Notifications + Activity Report

## Objective

## B9 APIs Used

## Notification Bell

## Unread Count

## Notification Center

## Notification List

## Read/Unread State

## Mark Read

## Mark All Read

## Delete/Dismiss

## Navigation

## Activity Center

## Activity List

## Activity Details

## Notification Preferences

## Realtime Integration

## Duplicate Event Handling

## Cache Strategy

## Dashboard Integration

## Privacy

## Security

## Accessibility

## Localization

## Responsive Design

## Error Handling

## Offline Behavior

## Components Created

## Files Modified

## Tests Executed

## Authorization Tests

## Navigation Security Tests

## Realtime Tests

## Accessibility Tests

## Localization Tests

## Lint Result

## Build Result

## Browser Testing

## Known Issues

## Backend Changes

## Recommendations for F9
```

---

# 103. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
Notification bell result
Unread-count result
Notification center result
Read result
Mark-all-read result
Delete/dismiss result
Navigation result
Activity center result
Realtime result
Preference result
Dashboard integration result
Privacy result
Authorization result
Accessibility result
Localization result
Responsive result
Test result
Lint result
Build result
Development server result
```

Do not claim success unless verified.

---

# 104. STOP CONDITION

After F8 is complete:

**STOP.**

Do not automatically implement F9.

The next phase is:

```text
F9
Safety Dashboard + SOS + Location/Fall-Detection Mobile Integration UI
```

F9 will connect the frontend/mobile safety experience to the existing safety backend and mobile-app architecture.

It should cover the patient-facing safety controls and status UI for:

```text
🚨 SOS
📍 Location sharing/status
🧍 Fall detection status
📱 Mobile safety connection
👥 Emergency contacts where supported
```

Do not implement F9 during F8.

---

# FINAL PRINCIPLE

F8 should make notifications behave like a calm information layer over Memora:

```text
Something important happens
        ↓
Backend creates notification
        ↓
B9 delivers notification
        ↓
Memora shows it
        ↓
Patient understands it
        ↓
Patient can act on it
        ↓
Notification becomes read
```

And:

```text
Patient activity
      ↓
Existing backend activity system
      ↓
Activity Center
      ↓
Simple personal history
```

Keep notification generation, persistence, delivery, authorization, realtime infrastructure, and privacy controls on the backend.

The frontend should provide a clear, accessible window into that system.
