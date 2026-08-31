# Memora - Phase F12 Prompt: Caregiver Dashboard

**Phase:** F12  
**Name:** Caregiver Dashboard + Authorized Patient Support UI  
**Prerequisites:** F0-F11 completed, with F11 audit/report reviewed  
**Backend prerequisite:** Existing caregiver, patient, authorization, analytics, reminders, notifications, memory, community, meeting, AI, and safety APIs must be inspected before implementation  
**Status:** Ready for implementation

---

# OBJECTIVE

Build the complete caregiver-facing web experience for Memora.

The caregiver dashboard must allow an authenticated caregiver to view and interact with information about **only the patient(s) they are authorized to support**.

The caregiver experience should provide a clear overview of the patient's:

```text
Daily activity
Cognitive games
Memory assistance
Reminders
Community participation
Meetings
Notifications
Progress
Safety status
Safety alerts
```

The caregiver dashboard is a support interface.

It must NOT become:

```text
A medical diagnosis dashboard
An unrestricted patient-data viewer
A replacement for healthcare professionals
A second independent backend
```

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
```

Then inspect the actual implementation of:

```text
B0-B14
F0-F11
Caregiver backend
Patient backend
Authorization middleware
Role system
Analytics
Games
Memories
Reminders
Community
Meetings
Notifications
Safety
AI
```

The actual repository is authoritative.

Do not trust a phase report without verifying the corresponding implementation.

---

# 2. CRITICAL RULE

Before building any caregiver page:

```text
Identify actual caregiver APIs
        ↓
Identify actual authorization rules
        ↓
Identify actual patient-caregiver relationship
        ↓
Identify actual response schemas
        ↓
Implement frontend
```

Do not invent:

```text
Endpoints
Roles
Permissions
Patient relationships
Analytics fields
Safety permissions
```

If a backend capability does not exist:

```text
Do not fake it.
Do not use mock production data.
Document it as unavailable.
```

---

# 3. PRODUCT REQUIREMENT

The project specification identifies **Caregiver Management** as a core Memora module.

Caregiver access must be limited to authorized patients.

The caregiver should be able to support the patient without receiving unrestricted access to unrelated users or protected information.

---

# 4. F12 SCOPE

Implement, where supported by the backend:

```text
Caregiver Dashboard
Authorized Patient List
Patient Selection
Patient Overview
Daily Activity
Cognitive Game Activity
Memory Overview
Reminder Overview
Community Participation
Meeting Overview
Notification Overview
Progress / Analytics
Safety Status
Safety Alerts
Caregiver-relevant AI information
Empty States
Loading States
Error States
Authorization Handling
Responsive Design
Accessibility
Localization
Security
```

Do not implement unrelated admin functionality.

---

# 5. CAREGIVER ROUTE

Use the route established by the existing frontend architecture.

Potential example:

```text
/app/caregiver
```

Do not create a conflicting route if one already exists.

---

# 6. CAREGIVER LOGIN

Use the existing F2 authentication system.

Do not create another login system.

Flow:

```text
Login
 ↓
Authenticated user
 ↓
Role verification
 ↓
Caregiver Dashboard
```

---

# 7. ROLE PROTECTION

The frontend may protect caregiver routes for UX.

However:

```text
Backend authorization remains authoritative.
```

A non-caregiver must not gain caregiver access by manually entering a URL.

---

# 8. AUTHORIZATION

Every patient-related request must use backend authorization.

Never rely on:

```text
patientId in URL
frontend role state
localStorage
hidden UI controls
```

as the only authorization mechanism.

---

# 9. AUTHORIZED PATIENT LIST

If backend supports multiple patients:

```text
My Patients

👤 Patient A
👤 Patient B
```

Only show patients returned by the authorized caregiver endpoint.

Do not expose the entire patient database.

---

# 10. NO-PATIENT STATE

If caregiver has no assigned patients:

```text
No patients are currently assigned to you.
```

Do not show fake patients.

---

# 11. PATIENT SELECTION

If multiple patients exist:

```text
Select Patient
```

Use the existing design system.

The selected patient must be validated against the authorized patient list.

---

# 12. INVALID PATIENT

If a caregiver manually requests an unauthorized patient:

```text
You don't have access to this patient.
```

Handle the backend authorization response correctly.

Do not reveal whether an unauthorized patient exists.

---

# 13. PATIENT OVERVIEW

Example:

```text
Patient Overview

Today's Activity
🧩 Games       2 completed
⏰ Reminders   4 / 5
🫂 Community   1 session
💭 Memories    Recent activity
🚨 Safety      Connected
```

Only display data returned by the backend.

---

# 14. PATIENT PROFILE

Display only caregiver-authorized profile information.

Do not expose:

```text
Passwords
Tokens
Internal IDs
Private system metadata
Unauthorized health information
```

---

# 15. DAILY ACTIVITY

Show useful activity information.

Potential:

```text
Today's Activity

Games completed
Reminders completed
Community participation
Memories created
AI interaction summary if supported
```

Do not turn activity into a medical judgment.

---

# 16. GAME ACTIVITY

Integrate F4/backend game data.

Potential:

```text
Cognitive Activities

Memory Match
Completed
Score: 82

Picture Recognition
Completed
Score: 91
```

Use actual backend data.

---

# 17. GAME PERFORMANCE

If backend provides:

```text
Score
Accuracy
Response time
Mistakes
Hints
Completion
Difficulty
```

display appropriate caregiver-facing metrics.

Do not invent metrics.

---

# 18. MEDICAL BOUNDARY

Do not label game performance:

```text
Dementia worsening
Cognitive decline
Medical improvement
Disease progression
```

Use neutral language:

```text
Game performance
Activity trend
Recent participation
```

---

# 19. MEMORY OVERVIEW

If caregiver is authorized to view memories:

```text
Recent Memories
```

Display only authorized memory content.

---

# 20. MEMORY PRIVACY

Memories can contain highly personal information.

Do not:

```text
Log memory content
Expose memory IDs unnecessarily
Put memory text in URLs
Show unauthorized memories
```

---

# 21. MEMORY CREATION

If caregivers are authorized to create memories:

```text
Add Memory
```

Use the existing F5 backend.

Do not create a second memory system.

---

# 22. MEMORY EDITING

If authorized:

```text
Edit
 ↓
Save
 ↓
Backend confirmation
```

---

# 23. MEMORY DELETION

If authorized:

```text
Delete memory?
[ Cancel ]
[ Delete ]
```

Never silently delete.

---

# 24. REMINDER OVERVIEW

Integrate F6.

Example:

```text
Today's Reminders

✓ Morning routine
✓ Appointment
○ Evening activity
```

Use actual reminder status.

---

# 25. REMINDER COMPLETION

If backend exposes completion:

```text
Completed
Pending
Missed
Snoozed
```

display actual states.

Do not infer missed reminders merely because the frontend hasn't refreshed.

---

# 26. CAREGIVER REMINDER ACTIONS

Only implement actions allowed by backend authorization.

Potential:

```text
Create
Edit
Complete
Snooze
Delete
```

Do not assume caregivers have all patient permissions.

---

# 27. COMMUNITY OVERVIEW

Integrate F7.

Potential:

```text
Community

Upcoming Session
Music & Memory

Registered ✓
```

Show only information caregiver is authorized to see.

---

# 28. COMMUNITY PARTICIPATION

If backend exposes:

```text
Votes
Registrations
Attendance
```

show appropriate caregiver information.

Do not expose other patients' private voting or registration information unless explicitly authorized.

---

# 29. MEETING CIRCLE

Integrate F7/F8.

Show:

```text
Upcoming Meeting
Date
Time
Host
Registration state
```

Do not expose protected meeting links unless the caregiver is authorized to access them.

---

# 30. NOTIFICATIONS

Integrate F8/B9.

Caregiver notifications may include supported:

```text
Reminder updates
Community updates
Meeting updates
Safety alerts
Caregiver-specific system notifications
```

Do not duplicate the notification system.

---

# 31. SAFETY OVERVIEW

Integrate F9.

Potential:

```text
🚨 Safety

Device: Connected
Location: Available
Fall Detection: Active
SOS: No active alert
```

Only display actual backend/device state.

---

# 32. SAFETY PRIVACY

Precise location must not automatically be exposed just because the caregiver has dashboard access.

Follow the backend's explicit authorization.

If only status is authorized:

```text
Location: Available
```

rather than displaying coordinates.

---

# 33. SAFETY ALERTS

If caregiver is authorized to receive safety alerts:

```text
⚠️ Safety Alert

Fall detection event
Time: 10:42 AM
Status: Awaiting response
```

Use actual backend event state.

Do not claim emergency services were contacted unless the system confirms it.

---

# 34. SOS

Caregiver-facing SOS controls must follow actual backend permissions.

Do not create caregiver-triggered SOS if the backend does not support it.

If supported:

```text
Send SOS
```

must use the backend safety workflow.

---

# 35. AI INFORMATION

If caregiver-specific AI summaries/recommendations exist:

```text
AI Insights
```

may be shown.

Only use actual backend functionality.

---

# 36. AI SAFETY

Never present AI-generated caregiver information as:

```text
Diagnosis
Medical assessment
Disease progression
Clinical judgment
```

Use neutral language.

---

# 37. AI PRIVACY

Do not expose private patient AI conversations unless the backend explicitly authorizes caregiver access.

---

# 38. ANALYTICS

If F14/backend analytics are already available, F12 may consume caregiver-authorized analytics.

Do not duplicate the analytics engine.

Potential:

```text
Activity Trend
Game Participation
Reminder Completion
Community Engagement
```

---

# 39. ANALYTICS BOUNDARY

Analytics should describe activity, not diagnose medical conditions.

The caregiver UI must not transform:

```text
Score ↓
```

into:

```text
Dementia worsening
```

---

# 40. DASHBOARD LAYOUT

Recommended:

```text
┌──────────────────────────────────────────┐
│ 👥 Caregiver Dashboard                  │
├──────────────────────────────────────────┤
│ Patient: [ Select Patient ▼ ]            │
├───────────────┬──────────────────────────┤
│ Today's       │ Safety                   │
│ Activity      │ 🟢 Connected             │
├───────────────┼──────────────────────────┤
│ Games         │ Reminders                │
│ 2 completed   │ 4 / 5                    │
├───────────────┼──────────────────────────┤
│ Memories      │ Community                │
│ Recent        │ Upcoming session         │
├───────────────┴──────────────────────────┤
│ Progress                                  │
└──────────────────────────────────────────┘
```

Adapt to the existing F1 design system.

---

# 41. PATIENT SWITCHING

If multiple patients exist:

```text
Patient A
 ↓
Dashboard data
 ↓
Switch
 ↓
Patient B
 ↓
Dashboard data refresh
```

Ensure no data from Patient A remains visible while Patient B is loading.

---

# 42. DATA ISOLATION DURING SWITCH

On patient switch:

```text
Clear stale patient-specific state
 ↓
Request new patient data
 ↓
Render new patient
```

Do not accidentally display mixed patient data.

---

# 43. PATIENT URL STATE

If patient selection is represented in the URL:

```text
Validate against backend authorization.
```

Do not assume URL parameters are trusted.

---

# 44. LOADING STATE

When loading a patient:

```text
Loading patient information...
```

Use skeletons where appropriate.

Do not show stale data as if it belongs to the new patient.

---

# 45. EMPTY STATES

Handle:

```text
No patients
No games
No memories
No reminders
No community activity
No meetings
No notifications
No analytics
No safety events
```

---

# 46. ERROR STATES

Handle:

```text
401
403
404
409
429
500
Network failure
Timeout
```

Use user-friendly messages.

Do not display backend stack traces.

---

# 47. 401 HANDLING

Use existing authentication handling.

Do not create a second login flow.

---

# 48. 403 HANDLING

For unauthorized patient access:

```text
You don't have permission to view this information.
```

Do not expose sensitive details.

---

# 49. 404 HANDLING

If backend returns not found:

```text
Information is no longer available.
```

Use context-appropriate messaging.

---

# 50. 429 HANDLING

If rate limited:

```text
Please wait a moment and try again.
```

Do not spam retries.

---

# 51. 500 HANDLING

Example:

```text
Something went wrong.

[ Try Again ]
```

---

# 52. NETWORK FAILURE

Example:

```text
Unable to connect.

Check your connection and try again.
```

Do not show cached safety state as current unless clearly labeled.

---

# 53. REFRESH

After caregiver actions:

```text
Backend confirmation
 ↓
Refresh relevant state
```

Do not rely only on local optimistic state for important information.

---

# 54. REALTIME

If B9/F8/F9 provide realtime events:

```text
Safety alerts
Notifications
Relevant activity
```

reuse the existing realtime infrastructure.

Do not create another websocket/SSE system.

---

# 55. REALTIME PATIENT ISOLATION

Realtime events must be filtered by:

```text
Authenticated caregiver
Authorized patient
Relevant event
```

Never display another patient's event.

---

# 56. PAGINATION

If backend supports pagination:

```text
Use backend pagination.
```

Do not load huge patient activity histories unnecessarily.

---

# 57. DATE/TIME

Use the existing centralized date/time utilities.

Verify:

```text
Reminders
Community sessions
Meetings
Notifications
Activities
Safety events
```

display correctly.

---

# 58. TIMEZONE

Use the project's established timezone rules.

Do not manually add/subtract timezone offsets in components.

---

# 59. ACCESSIBILITY

Caregiver dashboard must support:

```text
Keyboard navigation
Screen readers
Visible focus
Accessible headings
Accessible patient selector
Accessible tables/cards
Accessible alerts
```

---

# 60. SAFETY ACCESSIBILITY

Safety alerts should be clearly announced.

Do not rely only on color.

Use:

```text
Icon
Text
Status
```

---

# 61. RESPONSIVE DESIGN

Test:

```text
Desktop
Tablet
Mobile browser
```

Caregiver dashboard should remain usable on smaller screens.

---

# 62. LOCALIZATION

Use existing localization.

Support:

```text
English
Hindi
Other configured languages
```

where implemented.

Do not hardcode caregiver-facing strings.

---

# 63. LANGUAGE CONSISTENCY

Caregiver UI should follow the existing language preference architecture.

---

# 64. SECURITY

Review:

```text
Patient ID handling
Authorization
API requests
Sensitive data
Location
Safety
Memory
AI
Meeting links
```

---

# 65. NO DIRECT DATABASE ACCESS

Frontend must never connect directly to MongoDB or another database.

Use backend APIs.

---

# 66. NO PATIENT DATA IN LOGS

Do not log:

```text
Patient names unnecessarily
Memory content
Precise location
AI conversations
Safety events
Emergency contact information
```

---

# 67. NO TOKENS IN URL

Do not put:

```text
JWT
access tokens
refresh tokens
session secrets
```

in URLs.

---

# 68. COMPONENT ARCHITECTURE

Potential components:

```text
CaregiverDashboard
PatientSelector
PatientOverview
ActivitySummary
GameActivityCard
MemorySummary
ReminderSummary
CommunitySummary
MeetingSummary
CaregiverNotificationPanel
ProgressSummary
SafetyStatusCard
SafetyAlertCard
```

Reuse existing components from F1-F10.

---

# 69. API ARCHITECTURE

Use a centralized caregiver API layer.

Conceptual methods:

```text
caregiverApi.getPatients()
caregiverApi.getPatientOverview(patientId)
caregiverApi.getPatientActivity(patientId)
caregiverApi.getPatientGames(patientId)
caregiverApi.getPatientMemories(patientId)
caregiverApi.getPatientReminders(patientId)
caregiverApi.getPatientCommunity(patientId)
caregiverApi.getPatientMeetings(patientId)
caregiverApi.getPatientNotifications(patientId)
caregiverApi.getPatientAnalytics(patientId)
caregiverApi.getPatientSafety(patientId)
```

These are conceptual only.

Implement actual existing endpoints.

---

# 70. API RESPONSE VALIDATION

Handle missing/optional fields safely.

Do not assume:

```text
data.patient
data.analytics
data.safety
```

always exist.

---

# 71. STATE MANAGEMENT

Use the existing F0 architecture.

Do not introduce a new global state library without a genuine requirement.

---

# 72. CACHE

Do not cache sensitive patient information indefinitely.

Invalidate patient-specific data when:

```text
Patient changes
Logout
Authorization changes
```

---

# 73. LOGOUT

On caregiver logout:

```text
Clear caregiver-specific client state.
```

Do not leave patient information visible after logout.

---

# 74. MULTI-TAB SECURITY

If the project supports shared auth/session state:

```text
Handle logout/session expiration across tabs.
```

Do not keep protected data visible after authentication expires.

---

# 75. PERFORMANCE

Avoid:

```text
Repeated patient API calls
Duplicate analytics requests
Continuous safety polling
Unnecessary realtime subscriptions
Large memory history loads
```

---

# 76. SAFETY POLLING

Do not implement aggressive polling.

If realtime is unavailable, use the backend's intended refresh strategy.

---

# 77. CAREGIVER ACTION CONFIRMATION

For meaningful mutations:

```text
Create reminder
Delete memory
Send SOS
```

show confirmation where appropriate.

---

# 78. NO SILENT MUTATIONS

Do not silently:

```text
Delete
Modify
Complete
Register
Send SOS
```

unless the product specification explicitly defines one-click behavior.

---

# 79. TESTING

Add tests for:

```text
Caregiver authentication
Role protection
Patient list
Patient selection
Patient authorization
Patient switching
Overview
Games
Memories
Reminders
Community
Meetings
Notifications
Analytics
Safety
```

where supported.

---

# 80. AUTHORIZATION TESTS

Test:

```text
Caregiver A → authorized patient → allowed
Caregiver A → unauthorized patient → denied
Patient → caregiver route → denied
Admin → caregiver route → behavior according to role architecture
```

Do not assume role behavior without inspecting the existing specification.

---

# 81. DATA ISOLATION TESTS

Verify:

```text
Patient A data
never appears
for Patient B.
```

Especially test:

```text
Memories
Reminders
Notifications
Analytics
Safety
AI
```

---

# 82. PATIENT SWITCH TEST

Test:

```text
Select Patient A
 ↓
Data A
 ↓
Select Patient B
 ↓
Data B
```

Verify no stale A data remains.

---

# 83. SAFETY TESTING

Use a controlled test environment.

Test:

```text
Connected
Disconnected
Alert
Resolved
No permission
```

Do not trigger real emergency workflows against real contacts during development testing.

---

# 84. AI TESTING

If caregiver AI is supported:

```text
Valid request
Unauthorized request
Empty response
Error
Rate limit
```

---

# 85. ACCESSIBILITY TESTING

Test:

```text
Keyboard
Screen reader
Focus
Patient selector
Cards
Alerts
Dialogs
```

---

# 86. RESPONSIVE TESTING

Test:

```text
Desktop
Tablet
Mobile
```

---

# 87. LOCALIZATION TESTING

Test:

```text
English
Hindi
Long translated strings
Patient names with long text
Caregiver labels
Alerts
```

---

# 88. BROWSER CONSOLE

Check for:

```text
React warnings
Unhandled errors
Failed requests
Accessibility warnings
```

---

# 89. SECURITY REVIEW

Inspect for:

```text
IDOR
Unauthorized patient access
Sensitive data leakage
XSS
Unsafe redirects
Token exposure
Location exposure
Meeting-link exposure
```

---

# 90. NO MEDICAL CLAIMS

Search caregiver UI for unsupported claims.

Avoid:

```text
Patient is getting worse
Patient has dementia
Cognitive decline detected
Treatment is working
```

Use:

```text
Activity decreased
Game participation changed
Reminder completion rate changed
```

where supported by actual data.

---

# 91. DOCUMENTATION

Create:

```text
docs/F12_CAREGIVER_DASHBOARD_REPORT.md
```

Document:

```text
Objective
Caregiver APIs
Authorization model
Patient relationship
Patient selection
Dashboard
Activity
Games
Memories
Reminders
Community
Meetings
Notifications
Analytics
Safety
AI
Realtime
Privacy
Security
Accessibility
Localization
Responsive design
Components
Files created
Files modified
Tests
Known issues
Backend gaps
Recommendations for F13
```

---

# 92. MULTI-DEVELOPER RULE

If multiple developers work on F12:

```text
Developer A → Dashboard + patient selector
Developer B → Activity/Games/Memories
Developer C → Reminders/Community/Meetings
Developer D → Notifications/Analytics
Developer E → Safety/AI
```

All must use:

```text
Shared API layer
Shared design system
Shared authorization assumptions
Shared state architecture
Shared localization
```

Do not create competing caregiver architectures.

---

# 93. GIT SAFETY

Before modifying:

```bash
git status
git branch
```

Do not use:

```bash
git reset --hard
git clean -fd
```

Do not overwrite another developer's work.

Suggested branches:

```text
feature/f12-caregiver-dashboard
feature/f12-caregiver-activity
feature/f12-caregiver-reminders
feature/f12-caregiver-analytics
feature/f12-caregiver-safety
```

---

# 94. DEFINITION OF DONE

F12 is complete only when:

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
[ ] Caregiver backend inspected  
[ ] Patient relationship inspected  
[ ] Authorization inspected  
[ ] Actual endpoints verified  
[ ] Caregiver route implemented  
[ ] Caregiver authentication integrated  
[ ] Role protection implemented  
[ ] Authorized patient list implemented where supported  
[ ] Patient selection implemented  
[ ] Patient overview implemented  
[ ] Patient switching implemented  
[ ] Daily activity implemented  
[ ] Game activity implemented  
[ ] Memory overview implemented where supported  
[ ] Reminder overview implemented  
[ ] Community overview implemented  
[ ] Meeting overview implemented  
[ ] Notification overview implemented  
[ ] Analytics overview implemented where supported  
[ ] Safety status implemented  
[ ] Safety alerts implemented where supported  
[ ] AI integration implemented where supported  
[ ] Patient authorization verified  
[ ] Cross-patient data isolation verified  
[ ] No unauthorized location exposure  
[ ] No unauthorized safety-event exposure  
[ ] No unauthorized AI conversation exposure  
[ ] No protected meeting-link leakage  
[ ] No direct database access  
[ ] No sensitive data logging  
[ ] Loading states implemented  
[ ] Empty states implemented  
[ ] Error states implemented  
[ ] Retry handling implemented  
[ ] Patient-switch stale-state prevention implemented  
[ ] Realtime integration reused where supported  
[ ] Pagination implemented where required  
[ ] Date/time handling verified  
[ ] Timezone handling verified  
[ ] Accessibility verified  
[ ] Localization verified  
[ ] Responsive design verified  
[ ] Security tests performed  
[ ] Authorization tests performed  
[ ] Privacy tests performed  
[ ] Accessibility tests performed  
[ ] Browser console checked  
[ ] Lint passes  
[ ] Tests pass  
[ ] Build passes  
[ ] Documentation updated  
[ ] No secrets committed  
[ ] No unrelated feature creep  

---

# 95. FINAL REPORT

Create:

```text
docs/F12_CAREGIVER_DASHBOARD_REPORT.md
```

Use:

```text
# Memora F12 Caregiver Dashboard Report

## Objective

## Backend APIs Used

## Caregiver Authorization Model

## Patient-Caregiver Relationship

## Caregiver Authentication

## Patient Selection

## Patient Overview

## Daily Activity

## Game Activity

## Memory Overview

## Reminder Overview

## Community Overview

## Meeting Overview

## Notification Overview

## Analytics Overview

## Safety Overview

## Safety Alerts

## AI Integration

## Realtime Integration

## Privacy

## Security

## Accessibility

## Localization

## Responsive Design

## Components Created

## Files Created

## Files Modified

## Tests Executed

## Authorization Tests

## Data Isolation Tests

## Safety Tests

## AI Tests

## Accessibility Tests

## Localization Tests

## Lint Result

## Build Result

## Browser Testing

## Known Issues

## Missing Backend Capabilities

## Recommendations for F13
```

---

# 96. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
Caregiver authentication: PASS/FAIL
Role protection: PASS/FAIL
Patient list: PASS/FAIL/NOT SUPPORTED
Patient selection: PASS/FAIL
Patient authorization: PASS/FAIL
Patient switching: PASS/FAIL
Patient overview: PASS/FAIL
Activity: PASS/FAIL
Games: PASS/FAIL
Memories: PASS/FAIL/NOT SUPPORTED
Reminders: PASS/FAIL
Community: PASS/FAIL
Meetings: PASS/FAIL
Notifications: PASS/FAIL
Analytics: PASS/FAIL/NOT SUPPORTED
Safety: PASS/FAIL
Safety alerts: PASS/FAIL/NOT SUPPORTED
AI: PASS/FAIL/NOT SUPPORTED
Realtime: PASS/FAIL/NOT SUPPORTED
Privacy: PASS/FAIL
Security: PASS/FAIL
Accessibility: PASS/FAIL
Localization: PASS/FAIL
Responsive UI: PASS/FAIL
Tests: PASS/FAIL
Lint: PASS/FAIL
Build: PASS/FAIL
Release impact: PASS/FAIL
```

Do not claim success unless verified.

---

# 97. STOP CONDITION

After F12 is complete:

**STOP.**

Do not implement F13 automatically.

F13 will implement:

```text
Admin Dashboard
```

But F13 must first inspect:

```text
F11 findings
F12 implementation
Actual admin backend
Actual role permissions
Actual content-management APIs
Actual community-management APIs
Actual analytics APIs
```

---

# FINAL PRINCIPLE

The caregiver dashboard is an **authorized support layer** over Memora's existing patient functionality.

The architecture should remain:

```text
                 CAREGIVER
                     │
                     ↓
            Caregiver Dashboard
                     │
                     ↓
              Memora API
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
       Patient     Activity   Safety
        Data        Data       Data
          │          │          │
          └──────────┼──────────┘
                     ↓
               Authorization
                     ↓
             Authorized Patient
```

The caregiver sees only what the backend authorizes.

Never use frontend role checks as the security boundary.

Never expose another patient's information.

Never expose precise location merely because a caregiver can access the dashboard.

Never present analytics or AI output as a medical diagnosis.

Never claim a safety event succeeded unless the backend confirms it.

Never create duplicate backend systems.

Never use mock data as a substitute for a missing backend capability.

**F12 is complete only when the caregiver can reliably support an authorized patient through one coherent, secure Memora interface.**
