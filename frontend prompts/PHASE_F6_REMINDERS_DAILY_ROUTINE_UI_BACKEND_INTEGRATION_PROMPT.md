# Memora - Phase F6 Prompt: Reminders & Daily Routine UI + Backend Integration

**Phase:** F6  
**Name:** Reminders + Daily Routine UI + Backend Integration  
**Prerequisites:** F0, F1, F2, F3, F4, and F5 completed and verified  
**Backend prerequisite:** Existing reminder/task/schedule APIs must be inspected before implementation  
**Status:** Ready for implementation

---

# OBJECTIVE

Build the patient-facing reminder and daily-routine experience for Memora and connect it to the existing backend reminder system.

The goal is to make important daily information easy to see, understand, and act on.

Target flow:

```text
Patient Dashboard
      ↓
⏰ Reminders
      ↓
Today's Routine
      ↓
Upcoming Reminder
      ↓
Reminder Details
      ↓
Mark Complete / Snooze / Action
      ↓
Existing Backend APIs
```

The interface must remain:

```text
Simple
Large
Readable
Predictable
Low-cognitive-load
Accessible
```

Do not turn the reminder system into a complicated productivity application.

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
```

Also inspect the actual implementations of:

```text
F0
F1
F2
F3
F4
F5
Reminder backend
Reminder models
Reminder routes
Reminder controllers
Reminder services
Notification integration
B9 notification implementation
Any scheduling/recurring logic
```

Do not assume documentation exactly matches the repository.

The actual code and backend contracts are authoritative.

---

# 2. CRITICAL RULES

## Rule 1: Inspect the existing reminder API first

Identify the actual:

```text
Reminder endpoints
Request fields
Response fields
Validation
Authorization
Ownership
Status fields
Date/time format
Recurrence
Completion
Snooze
Deletion
Notification behavior
```

Do not invent endpoints.

## Rule 2: Reuse F0-F5

Reuse:

```text
Central API client
Authentication
Patient layout
Routing
Design tokens
Buttons
Cards
Forms
Dialogs
Loading
Empty states
Error states
Localization
Accessibility
```

Do not create duplicate systems.

## Rule 3: Backend is authoritative

The backend determines:

```text
Reminder ownership
Reminder persistence
Reminder schedule
Reminder recurrence
Reminder completion
Reminder status
Notification generation
Authorization
```

The frontend controls presentation and user interaction only.

## Rule 4: Time is important

Inspect how the backend stores timestamps and how the project handles timezone conversion before implementing the UI.

Do not create competing timezone logic.

---

# 3. F6 SCOPE

Implement:

```text
Reminder List
Today's Routine
Upcoming Reminders
Reminder Details
Create Reminder where supported
Edit Reminder where supported
Delete Reminder where supported
Mark Complete where supported
Snooze where supported
Recurring Reminder UI where supported
Reminder Status
Date/Time Display
Empty States
Loading States
Error States
Retry
Notification integration where supported
Dashboard integration
Accessibility
Localization
Responsive design
Timezone-safe display
```

Only implement functionality supported by the actual backend.

---

# 4. REMINDER HOME

Create the route established by F3, such as:

```text
/app/reminders
```

Example:

```text
⏰ My Reminders

Today

┌─────────────────────────────┐
│ 10:00 AM                    │
│ 📞 Call family              │
│                             │
│ [ Mark Complete ]           │
└─────────────────────────────┘

┌─────────────────────────────┐
│ 2:00 PM                     │
│ 🧠 Memory activity          │
│                             │
│ [ View ]                    │
└─────────────────────────────┘
```

Use actual backend data.

Do not add medication-specific functionality unless it already exists in the project.

---

# 5. TODAY VIEW

Make today's reminders obvious.

Possible structure:

```text
Today
 ↓
Morning
 ↓
Afternoon
 ↓
Evening
```

Only use these groupings if appropriate for the backend data.

---

# 6. UPCOMING REMINDERS

Provide a simple upcoming section.

Example:

```text
Next reminder

⏰ 2:00 PM
Call family

[ View ]
```

Use actual backend data.

---

# 7. REMINDER CARD

Reuse the F1 card system.

Prioritize:

```text
Time
Reminder title
Short description
Status
Primary action
```

Avoid unnecessary metadata.

---

# 8. REMINDER STATUS

If supported, display actual statuses such as:

```text
Pending
Completed
Snoozed
Cancelled
Missed
```

Do not invent status semantics.

---

# 9. MARK COMPLETE

If supported:

```text
[ ✓ Mark Complete ]
```

Flow:

```text
Patient taps
 ↓
Loading
 ↓
Backend update
 ↓
Confirmation
 ↓
UI updates
```

Do not falsely mark it complete if the backend rejects the operation.

---

# 10. SNOOZE

If supported:

```text
[ Snooze ]
```

Only offer choices supported by the backend.

Example:

```text
Snooze reminder

[ 10 minutes ]
[ 30 minutes ]
[ 1 hour ]
[ Cancel ]
```

Do not invent arbitrary scheduling semantics.

---

# 11. CREATE REMINDER

If patient creation is supported, implement an appropriate page/dialog.

Potential fields:

```text
Title
Description
Date
Time
Recurrence
```

Use only actual backend fields.

Keep the form simple.

---

# 12. EDIT REMINDER

If supported:

```text
Open reminder
 ↓
Edit
 ↓
Save
 ↓
Backend
 ↓
Updated UI
```

Reuse the create form where practical.

---

# 13. DELETE REMINDER

If supported:

```text
Delete this reminder?

[ Cancel ]
[ Delete ]
```

Never silently delete.

---

# 14. RECURRING REMINDERS

If recurrence exists in the backend, expose only supported options.

Possible concept:

```text
Repeat
[ Does not repeat ▼ ]

Every day
Every week
Custom
```

Inspect the actual backend recurrence model before implementation.

Do not build a separate calendar engine.

---

# 15. TIMEZONE

Determine:

```text
Backend timezone behavior
User timezone behavior
Stored timestamp format
```

Use the existing centralized date/time utilities.

---

# 16. DATE/TIME DISPLAY

Display human-friendly times:

```text
10:00 AM
```

and dates such as:

```text
Today
Tomorrow
Monday
15 September
```

where appropriate.

Never show raw ISO timestamps to patients.

---

# 17. DAY BOUNDARIES

Test behavior around:

```text
11:59 PM
12:00 AM
Timezone changes
DST where applicable
```

Do not let different components disagree about what "today" means.

---

# 18. REMINDER DETAILS

Create a simple details view.

Example:

```text
Call Family

Today
2:00 PM

Remember to call your family.

Status: Pending

[ Mark Complete ]
[ Snooze ]
[ Edit ]
```

Only show actions actually supported and authorized.

---

# 19. EMPTY STATES

If no reminders exist:

```text
⏰

No reminders yet.

[ Add Reminder ]
```

Only show the add action if permitted.

If reminders exist but none are for today:

```text
No reminders for today.

You have upcoming reminders.
```

---

# 20. LOADING / ERROR

Use F0/F1 patterns.

Loading:

```text
Loading your reminders...
```

Error:

```text
We couldn't load your reminders.

[ Try Again ]
```

Do not expose stack traces.

---

# 21. PARTIAL FAILURE

One failed reminder-related request must not unnecessarily break the entire application.

Use local error states where appropriate.

---

# 22. ACTION FAILURE

Handle failures for:

```text
Create
Update
Delete
Complete
Snooze
```

Do not show success until backend confirmation.

---

# 23. DUPLICATE ACTIONS

Prevent duplicate requests caused by:

```text
Double-click
Repeated taps
Slow network
Browser lag
```

especially for:

```text
Complete
Snooze
Save
Delete
```

---

# 24. NOTIFICATION INTEGRATION

If B9 generates notifications from reminders:

```text
Reminder
 ↓
Backend
 ↓
B9 notification system
 ↓
Notification UI
```

Do not create another notification engine.

---

# 25. DASHBOARD INTEGRATION

Update the F3 dashboard only where necessary.

Example:

```text
⏰ Today's Reminders

2 reminders today

Next:
2:00 PM - Call family

[ View Reminders ]
```

Use real data.

Do not duplicate the entire reminder list on the dashboard.

---

# 26. ACCESSIBILITY

Support:

```text
Keyboard navigation
Screen readers
Visible focus
Large controls
Accessible labels
Semantic headings
Accessible dialogs
Status announcements
```

When a reminder is:

```text
Created
Updated
Completed
Snoozed
Deleted
```

provide an accessible status message.

---

# 27. ELDER-FRIENDLY DESIGN

Prioritize:

```text
Large buttons
Readable text
Simple labels
Clear actions
Limited choices
Predictable layout
```

Avoid tiny icons for important actions.

Do not rely on color alone for reminder status.

---

# 28. LOCALIZATION

Use the established localization architecture for:

```text
English
Hindi
Other configured regional languages
```

Do not hardcode patient-facing strings.

Make sure translated labels do not break buttons, cards, forms, or dialogs.

---

# 29. RESPONSIVE DESIGN

Test:

```text
Desktop
Tablet
Mobile browser
```

Important actions must remain comfortable for touch.

---

# 30. OFFLINE BEHAVIOR

If offline sync is not already supported:

```text
You are offline.
Reminder changes may be unavailable.
```

Do not falsely show a change as saved.

If offline sync already exists, reuse it instead of creating another synchronization system.

---

# 31. CACHE / SERVER STATE

Use the F0 server-state architecture.

After:

```text
Create
Update
Delete
Complete
Snooze
```

invalidate or update the relevant reminder data.

Do not create ad-hoc caches in individual components.

---

# 32. API LAYER

Use the centralized API layer.

Potential conceptual methods:

```text
reminderApi.list()
reminderApi.get()
reminderApi.create()
reminderApi.update()
reminderApi.delete()
reminderApi.complete()
reminderApi.snooze()
```

Only create methods corresponding to actual backend endpoints.

---

# 33. AUTHORIZATION

Do not allow patient-controlled:

```text
userId
patientId
ownerId
```

to determine ownership.

Use authenticated identity and backend authorization.

Verify that:

```text
User A cannot view User B's reminder.
User A cannot edit User B's reminder.
User A cannot delete User B's reminder.
```

---

# 34. PRIVACY

Reminder contents may contain personal information.

Do not place reminder contents into:

```text
URLs
console logs
analytics
error messages
```

unless explicitly required and safe.

Do not use:

```text
console.log(reminder)
```

in production.

---

# 35. NO MEDICAL ASSUMPTIONS

A missed reminder is not automatically a medical or emergency event.

Do not introduce:

```text
Diagnosis
Medical advice
Disease progression
Clinical warnings
```

based on reminder behavior.

---

# 36. AI

Do not implement new AI logic in F6.

If an existing B11 endpoint already provides reminder suggestions:

```text
Frontend
 ↓
Central API
 ↓
B11
```

Display suggestions as suggestions.

Do not automatically create reminders without explicit supported user/backend confirmation.

---

# 37. COMPONENT ARCHITECTURE

Potential reusable components:

```text
ReminderCard
ReminderList
ReminderDetails
ReminderForm
ReminderStatus
ReminderTime
SnoozeDialog
DeleteReminderDialog
TodayReminders
UpcomingReminders
```

Reuse existing F1/F3 components whenever possible.

Do not create one giant reminder component.

---

# 38. FORM ARCHITECTURE

Create and update should share form structure and validation where practical.

Do not duplicate identical forms.

---

# 39. STATE MANAGEMENT

Use the existing F0 state/server-state architecture.

Do not introduce a new state library.

---

# 40. PERFORMANCE

Avoid:

```text
Repeated API requests
Unnecessary rerenders
Huge reminder lists
Aggressive polling
```

If the backend supports pagination/date filtering, use it.

Do not fetch an entire history just to display today's reminders.

---

# 41. TESTING

Add tests for:

```text
Reminder list
Reminder details
Create
Edit
Delete
Complete
Snooze
Recurrence
Today view
Upcoming view
Loading
Empty
Error
```

Only test supported operations.

---

# 42. API / AUTHORIZATION TESTING

Test:

```text
Get reminders
Get reminder
Create
Update
Delete
Complete
Snooze
```

where supported.

Verify:

```text
Patient sees authorized reminders
Unauthorized access is rejected
Unauthorized update is rejected
Unauthorized delete is rejected
```

---

# 43. TIMEZONE TESTING

Test reminders around:

```text
Midnight
Date transitions
Different local timezone
DST where applicable
```

according to the actual project timezone model.

---

# 44. DUPLICATE ACTION TESTING

Verify:

```text
Double complete
Double snooze
Double save
Double delete
```

do not create inconsistent backend state.

---

# 45. ACCESSIBILITY / RESPONSIVE TESTING

Test:

```text
Keyboard
Focus
Screen reader
Dialogs
Forms
Status messages
Desktop
Tablet
Mobile browser
```

---

# 46. BROWSER CONSOLE

Check for:

```text
Unhandled errors
React warnings
Failed requests
Accessibility warnings
Timer issues
```

Fix meaningful issues.

---

# 47. SECURITY REVIEW

Inspect for:

```text
Reminder data in logs
Sensitive data in URLs
Unauthorized IDs
Unsafe redirects
Tokens in logs
Direct database access
```

---

# 48. DOCUMENTATION

Create:

```text
docs/F6_REMINDERS.md
```

Document:

```text
Reminder architecture
API integration
Reminder states
Create/update/delete
Complete
Snooze
Recurrence
Timezone handling
Notification integration
Accessibility
Localization
Offline behavior
Testing
```

Update:

```text
CLAUDE.md
docs/FRONTEND_ARCHITECTURE.md
```

where appropriate.

---

# 49. MULTI-DEVELOPER RULE

If multiple developers work on reminders, they must reuse:

```text
Shared API layer
Shared components
Shared state architecture
Shared design system
```

Do not create multiple reminder implementations.

---

# 50. GIT SAFETY

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

# 51. DEFINITION OF DONE

F6 is complete only when:

[ ] F0 inspected  
[ ] F1 inspected  
[ ] F2 inspected  
[ ] F3 inspected  
[ ] F4 inspected  
[ ] F5 inspected  
[ ] Reminder backend inspected  
[ ] B9 notification implementation inspected  
[ ] Actual reminder APIs verified  
[ ] Actual reminder statuses verified  
[ ] Actual recurrence model verified  
[ ] Timezone behavior verified  
[ ] Reminder library implemented  
[ ] Today's view implemented  
[ ] Upcoming view implemented  
[ ] Reminder cards implemented  
[ ] Reminder details implemented  
[ ] Create implemented where supported  
[ ] Edit implemented where supported  
[ ] Delete implemented where supported  
[ ] Complete implemented where supported  
[ ] Snooze implemented where supported  
[ ] Recurrence implemented where supported  
[ ] Loading states implemented  
[ ] Empty states implemented  
[ ] Error states implemented  
[ ] Retry implemented  
[ ] Duplicate actions prevented  
[ ] Cache invalidation implemented  
[ ] Dashboard integration completed  
[ ] Notification integration verified where applicable  
[ ] Timezone-safe display verified  
[ ] Date/time localization verified  
[ ] Patient authorization respected  
[ ] Privacy checks completed  
[ ] No sensitive reminder logging  
[ ] No direct database access  
[ ] No direct AI provider access  
[ ] No unsupported medical logic  
[ ] Accessibility verified  
[ ] Responsive design verified  
[ ] Localization verified  
[ ] Component tests added  
[ ] API integration tests added  
[ ] Authorization tests performed  
[ ] Timezone tests performed  
[ ] Action duplication tests performed  
[ ] Accessibility tests performed  
[ ] Responsive tests performed  
[ ] Browser console checked  
[ ] Lint passes  
[ ] Tests pass  
[ ] Build passes  
[ ] Documentation updated  
[ ] No secrets committed  
[ ] No unrelated feature creep  

---

# 52. FINAL REPORT

Create:

```text
docs/F6_REMINDERS_REPORT.md
```

Use:

```text
# Memora F6 Reminders Report

## Objective

## Reminder Backend APIs Used

## Reminder Library

## Today's View

## Upcoming View

## Reminder Details

## Create Reminder

## Edit Reminder

## Delete Reminder

## Complete

## Snooze

## Recurrence

## Date/Time Handling

## Timezone Handling

## Notification Integration

## Dashboard Integration

## Loading States

## Empty States

## Error Handling

## Offline Behavior

## Accessibility

## Localization

## Privacy

## Security

## Performance

## Cache Strategy

## Components Created

## Files Modified

## Tests Executed

## Authorization Tests

## Timezone Tests

## Accessibility Tests

## Lint Result

## Build Result

## Browser Testing

## Known Issues

## Backend Changes

## Recommendations for F7
```

---

# 53. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
Reminder library result
Today's view result
Upcoming view result
Create result
Edit result
Delete result
Complete result
Snooze result
Recurrence result
Timezone result
B9 integration result
Dashboard integration result
Accessibility result
Responsive result
Test result
Lint result
Build result
Development server result
```

Do not claim success unless verified.

---

# 54. STOP CONDITION

After F6 is complete:

**STOP.**

Do not automatically implement F7.

The next phase is:

```text
F7
Community Sessions + Meeting Circle UI + Backend Integration
```

F7 will implement:

```text
🗳️ Community Session Voting
📅 Scheduled Sessions
🫂 Pre-registration
🤝 Meeting Circle
```

using the existing backend APIs.

---

# FINAL PRINCIPLE

F6 should make reminders feel like a calm personal assistant rather than a task-management application:

```text
What do I need to remember?
        ↓
When do I need to remember it?
        ↓
What should I do now?
        ↓
Complete / Snooze
        ↓
Memora keeps the record
```

The architecture should remain:

```text
Patient
   ↓
Memora Reminder UI
   ↓
Central API Layer
   ↓
Existing Reminder Backend
   ↓
Notification System
```

Keep scheduling, ownership, persistence, authorization, notification generation, and recurrence semantics on the backend.

The frontend should make those capabilities easy and safe for the patient to use.
