# Memora - Phase F7 Prompt: Community Sessions + Meeting Circle UI + Backend Integration

**Phase:** F7  
**Name:** Community Sessions + Meeting Circle UI + Backend Integration  
**Prerequisites:** F0, F1, F2, F3, F4, F5, and F6 completed and verified  
**Backend prerequisites:** Existing Community Session, Voting, Schedule, Pre-registration, Meeting Circle, and related notification APIs must be inspected before implementation  
**Status:** Ready for implementation

---

# OBJECTIVE

Build the patient-facing Community Sessions and Meeting Circle experience for Memora and connect it to the existing backend.

F7 must implement the complete patient-facing flow:

```text
Community
   ↓
┌──────────────────────────────────────────────┐
│ 🗳️ Vote for Sessions     📅 Schedule         │
└──────────────────────────────────────────────┘
```

## Voting flow

```text
Admin creates session options
        ↓
Patients view voting options
        ↓
Patient votes
        ↓
Backend records vote
        ↓
Admin reviews results
        ↓
Admin approves session
        ↓
Session moves to Schedule
```

## Schedule flow

```text
Approved Session
      ↓
Admin sets:
Date
Time
Duration
Host / Guest
Image
Description
Capacity
Meeting type
Registration status
      ↓
Patient views scheduled event
      ↓
Patient pre-registers
      ↓
Event happens
```

## Meeting Circle flow

Meeting Circle is the patient-facing meeting/community experience and must use the existing backend meeting architecture.

Do not rebuild backend functionality.

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
Community Session backend
Voting backend
Schedule backend
Pre-registration backend
Meeting Circle backend
Notification backend
B9
```

The actual repository and backend API contracts are authoritative.

---

# 2. CRITICAL RULES

## Rule 1: Inspect APIs before coding

Identify actual:

```text
Session endpoints
Voting endpoints
Schedule endpoints
Pre-registration endpoints
Meeting endpoints
Participant limits
Session statuses
Registration statuses
Meeting modes
Host/guest fields
Images/media
Authorization
Notification behavior
```

Do not invent endpoints.

---

## Rule 2: Reuse F0-F6

Reuse:

```text
API client
Auth
Patient layout
Routing
Design system
Cards
Buttons
Dialogs
Forms
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
Which sessions exist
Which sessions are open for voting
Vote eligibility
Vote state
Approval state
Schedule
Capacity
Registration state
Meeting permissions
```

The frontend only presents and interacts with those capabilities.

---

# 3. PAGE STRUCTURE

Create the Community experience using two clear primary tabs:

```text
🗳️ Vote
📅 Schedule
```

Optional badge counts may be displayed:

```text
Vote (3)
Schedule (5)
```

Only show counts if actual backend data supports them.

Do not create a long combined scrolling page when tabs provide a clearer experience.

---

# 4. COMMUNITY ROUTE

Use the route established by F3 or the existing application architecture, such as:

```text
/app/community
```

Do not create conflicting routes.

---

# 5. VOTING SECTION

The Vote tab shows:

```text
Upcoming session ideas
that are not yet officially scheduled
```

Do not show approved/scheduled sessions as voting options unless the backend explicitly defines that behavior.

---

# 6. SESSION VOTING CARD

Example:

```text
🎵 Music & Memory

Share memories connected to songs,
music, and important moments.

👥 42 interested

[ 🗳️ Vote for this Session ]
```

Only display actual backend data.

---

# 7. VOTING ACTION

Flow:

```text
Patient taps Vote
       ↓
Loading
       ↓
Backend
       ↓
Vote confirmed
       ↓
Card updates
```

Prevent duplicate voting requests.

---

# 8. VOTE STATE

If backend provides whether the current patient voted:

```text
✓ You voted
```

Display the state clearly.

Do not determine vote state only from local storage.

---

# 9. VOTE REVERSAL

Only provide:

```text
Unvote
Change vote
```

if the backend explicitly supports it.

Do not invent vote reversal.

---

# 10. VOTE COUNT

If vote counts are returned by the backend:

```text
👥 42 interested
```

display them.

Do not calculate counts from the current patient's UI.

---

# 11. VOTING EMPTY STATE

If there are no active voting options:

```text
🗳️

There are no sessions to vote on right now.

Check back later.
```

---

# 12. VOTING CLOSED

If backend says voting is closed:

```text
Voting is closed for this session.
```

Do not allow the frontend to submit a vote.

Backend authorization remains authoritative.

---

# 13. VOTING ERROR

Example:

```text
We couldn't record your vote.

[ Try Again ]
```

Do not show a successful vote state unless backend confirms it.

---

# 14. SCHEDULE SECTION

The Schedule tab contains:

```text
Officially approved and scheduled events.
```

Each event should use real backend data.

---

# 15. EVENT CARD

Use the previously defined structure:

```text
┌──────────────────────────────────────────────┐
│ 🎵 MUSIC & MEMORY                            │
│                                              │
│ 📅 15 September 2026                         │
│ ⏰ 5:00 PM - 6:00 PM                         │
│                                              │
│ 🎙️ Featuring                                 │
│ 👤 Dr. Priya Sharma                          │
│ Dementia Therapist                            │
│                                              │
│ Exploring memories through music.            │
│                                              │
│ 👥 12 / 20 Registered                        │
│                                              │
│ [ Pre-Register ]                             │
└──────────────────────────────────────────────┘
```

Only display:

```text
Host
Guest
Image
Capacity
Duration
Meeting type
Description
```

when those fields actually exist.

---

# 16. FEATURED PERSON

The featured person may be:

```text
Doctor
Therapist
Psychologist
Dementia specialist
Caregiver expert
Researcher
Guest speaker
```

Display the actual backend role/title.

Do not invent credentials.

---

# 17. FEATURED IMAGE

If an event has a featured person's image:

```text
Display image
 ↓
Accessible alt text
 ↓
Responsive sizing
```

Do not fail the event card if the image cannot load.

---

# 18. EVENT DETAILS

Create a details view/page where appropriate.

Show:

```text
Session title
Description
Date
Time
Duration
Featured person
Meeting type
Capacity
Registration state
```

Only display supported data.

---

# 19. PRE-REGISTRATION

If supported:

```text
[ Pre-Register ]
```

Flow:

```text
Patient taps
 ↓
Loading
 ↓
Backend
 ↓
Registration confirmed
 ↓
UI updates
```

---

# 20. REGISTRATION STATE

Possible states, only if supported:

```text
Not registered
Registered
Waitlisted
Registration closed
Full
Cancelled
```

Use backend values.

---

# 21. REGISTERED STATE

Example:

```text
✓ You're registered
```

Provide event details.

---

# 22. FULL EVENT

If capacity is reached:

```text
This session is full.
```

If waitlisting exists:

```text
[ Join Waitlist ]
```

Only show if supported.

---

# 23. REGISTRATION CLOSED

Display:

```text
Registration is closed.
```

Do not allow registration.

---

# 24. CANCELLED SESSION

If backend provides cancellation:

```text
This session has been cancelled.
```

Do not show an active Join/Pre-register action.

---

# 25. PRE-REGISTRATION DUPLICATE PROTECTION

Prevent:

```text
Double click
Repeated taps
Slow network duplicate requests
```

from creating duplicate registrations.

---

# 26. REGISTRATION CONFIRMATION

After successful registration:

```text
You're registered for this session.
```

If notifications/reminders are generated, rely on backend/B9.

Do not build a second notification system.

---

# 27. CAPACITY

If backend returns:

```text
12 / 20
```

display it simply.

Do not expose internal capacity calculations.

---

# 28. CAPACITY RACE CONDITION

The frontend must handle the case where:

```text
Event appears available
 ↓
Another patient registers
 ↓
Backend rejects registration because full
```

Show the backend result correctly.

Do not assume frontend availability remains valid.

---

# 29. SESSION DATE/TIME

Use centralized date/time utilities.

Display human-readable:

```text
15 September 2026
5:00 PM - 6:00 PM
```

Do not expose raw timestamps.

---

# 30. TIMEZONE

Use the project's existing timezone model.

Do not create a new timezone system.

Test:

```text
Date boundaries
Timezone conversion
```

according to backend behavior.

---

# 31. SESSION TYPE

If backend provides:

```text
Video
Voice
In-person
```

display the actual type.

Do not invent meeting modes.

---

# 32. MEETING CIRCLE

Build the patient-facing Meeting Circle entry point using the existing backend architecture.

Potential:

```text
/app/meetings
```

or the established route.

---

# 33. MEETING CIRCLE HOME

Example:

```text
🤝 Meeting Circle

Your upcoming meetings

┌──────────────────────────┐
│ Community Memory Circle  │
│ Today · 5:00 PM          │
│                          │
│ [ View Meeting ]         │
└──────────────────────────┘
```

Use actual backend data.

---

# 34. MEETING DETAILS

Show:

```text
Meeting name
Date
Time
Host
Description
Meeting type
Registration/participation state
```

Only show authorized fields.

---

# 35. JOIN MEETING

If backend supports direct joining:

```text
[ Join Meeting ]
```

Use the backend-generated meeting/session information.

Do not hardcode external meeting links.

---

# 36. MEETING LINK SECURITY

Do not expose protected meeting links to unauthorized users.

Do not put private meeting links into logs.

Do not copy them into analytics.

---

# 37. JOIN CONDITIONS

The frontend should respect backend conditions:

```text
Registered
Meeting open
Authorized
Not cancelled
```

Do not bypass them.

---

# 38. MEETING START TIME

If the meeting has a scheduled start time:

```text
Show when it starts.
```

If early joining is restricted, rely on backend response.

---

# 39. JOIN TOO EARLY

If backend rejects early joining:

```text
This meeting hasn't started yet.
```

Do not repeatedly attempt joining.

---

# 40. MEETING ENDED

Display:

```text
This meeting has ended.
```

Use backend/session state.

---

# 41. MEETING CANCELLED

Display:

```text
This meeting has been cancelled.
```

Do not show Join.

---

# 42. MEETING EMPTY STATE

If no upcoming meetings:

```text
🤝

You have no upcoming meetings.

Check Community Sessions for upcoming activities.
```

---

# 43. COMMUNITY DASHBOARD INTEGRATION

Update F3 dashboard to show a concise upcoming community item.

Example:

```text
🫂 Upcoming Session

Music & Memory
15 September · 5:00 PM

[ View ]
```

Do not duplicate the full Community page.

---

# 44. MEETING DASHBOARD INTEGRATION

If an upcoming Meeting Circle exists:

```text
🤝 Next Meeting
Today · 5:00 PM

[ View ]
```

Use real data.

---

# 45. NOTIFICATIONS

Use existing B9 notification behavior for:

```text
Vote result if supported
Registration confirmation
Session reminder
Meeting reminder
Cancellation
Schedule changes
```

Do not create frontend notification delivery.

---

# 46. NOTIFICATION BADGES

Reuse F3's notification system.

Do not create a second unread count.

---

# 47. NOTIFICATION CONTENT

Only display notifications returned for the authenticated user.

---

# 48. ACCESSIBILITY

Community and Meeting Circle must support:

```text
Keyboard navigation
Screen readers
Visible focus
Semantic headings
Accessible tabs
Accessible buttons
Accessible dialogs
Accessible status messages
```

---

# 49. TABS ACCESSIBILITY

Voting and Schedule tabs must use an accessible tab pattern.

Keyboard support should include:

```text
Tab
Arrow keys where appropriate
Enter
Space
```

Follow the project's existing component implementation.

---

# 50. STATUS ANNOUNCEMENTS

After:

```text
Vote
Registration
Cancellation
```

provide an accessible status update.

---

# 51. ELDER-FRIENDLY DESIGN

Prioritize:

```text
Large buttons
Readable text
Simple wording
Clear dates
Clear times
Limited actions
Large event cards
```

Avoid dense event-management UI.

---

# 52. LOCALIZATION

Use the established localization architecture.

Prepare for:

```text
English
Hindi
Other configured regional languages
```

Do not hardcode patient-facing strings.

---

# 53. TRANSLATION-SAFE UI

Long translated labels must not break:

```text
Tabs
Buttons
Cards
Dialogs
Event titles
Descriptions
```

---

# 54. DATE/TIME LOCALIZATION

Use centralized date/time utilities.

Do not hardcode English month/day names.

---

# 55. RESPONSIVE DESIGN

Test:

```text
Desktop
Tablet
Mobile browser
```

Event cards must reflow naturally.

---

# 56. TOUCH TARGETS

Important actions such as:

```text
Vote
Pre-register
Join
Cancel
```

must have large touch targets.

---

# 57. OFFLINE STATE

If community actions require connectivity:

```text
You are offline.
Community actions may be unavailable.
```

Do not falsely show votes or registrations as saved.

---

# 58. OFFLINE CACHING

If existing architecture supports cached schedules:

```text
Reuse it.
```

Do not build a second cache system.

---

# 59. SERVER STATE

Use the existing F0 server-state architecture.

Invalidate/update relevant data after:

```text
Vote
Registration
Cancellation
```

where applicable.

---

# 60. API LAYER

Use a centralized Community/Meeting API module.

Potential conceptual methods:

```text
communityApi.listVotingSessions()
communityApi.vote()
communityApi.listScheduledSessions()
communityApi.getSession()
communityApi.register()
meetingApi.list()
meetingApi.get()
meetingApi.join()
```

These are conceptual only.

Implement only methods corresponding to actual backend endpoints.

---

# 61. AUTHORIZATION

Do not trust frontend role or registration state.

Backend determines:

```text
Vote eligibility
Registration eligibility
Meeting access
```

---

# 62. PRIVACY

Do not expose:

```text
Other patients' private information
Private participant data
Protected meeting links
Internal admin notes
```

---

# 63. VOTE PRIVACY

If the backend treats votes as private:

```text
Do not expose individual patient identities.
```

Only display aggregate counts if the backend provides them.

---

# 64. PARTICIPANT PRIVACY

Do not display a participant list unless explicitly supported and intended for patients.

---

# 65. FEATURED PERSON PRIVACY

Only display publicly intended event information.

Do not expose private contact information.

---

# 66. SECURITY

Inspect for:

```text
Protected meeting URLs
Sensitive participant data
Unauthorized IDs
Tokens in logs
Private session details
```

---

# 67. NO DIRECT DATABASE ACCESS

The frontend must never access MongoDB or any database directly.

---

# 68. NO DIRECT EXTERNAL MEETING API

If meetings use:

```text
Zoom
Google Meet
Jitsi
Other provider
```

the frontend must use the project's backend-generated/authorized meeting mechanism.

Do not embed provider secrets.

---

# 69. NO DIRECT NOTIFICATION DELIVERY

Do not send notifications directly from the browser.

Use B9/backend.

---

# 70. ERROR HANDLING

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

using the F0 error system.

---

# 71. VOTE CONFLICT

If voting conflict occurs:

```text
Show backend result.
```

Do not overwrite local state blindly.

---

# 72. REGISTRATION CONFLICT

If registration fails because capacity changed:

```text
Update the UI from the backend state.
```

Do not continue showing "Registered".

---

# 73. SESSION NOT FOUND

If an event is removed:

```text
This session is no longer available.
```

Provide:

```text
[ Back to Schedule ]
```

---

# 74. SESSION CANCELLATION

If a scheduled event becomes cancelled:

```text
Display cancelled state.
```

If B9 sends a notification, let the backend handle delivery.

---

# 75. API RETRY

Use bounded retry only for safe read operations.

Do not automatically retry:

```text
Vote
Register
Join
```

without careful idempotency support.

---

# 76. DUPLICATE MUTATIONS

Prevent duplicate:

```text
Vote
Registration
```

requests.

---

# 77. POLLING

Do not introduce aggressive polling.

Use existing realtime/notification architecture if available.

---

# 78. REAL-TIME UPDATES

If schedule changes are delivered through an existing realtime system:

```text
Reuse it.
```

Do not create another websocket implementation.

---

# 79. COMPONENT ARCHITECTURE

Potential reusable components:

```text
CommunityTabs
VotingSessionCard
VoteButton
ScheduledSessionCard
SessionDetails
RegistrationButton
RegistrationStatus
CapacityIndicator
FeaturedPerson
MeetingCard
MeetingDetails
JoinMeetingButton
```

Only create components that provide real reuse.

---

# 80. COMPONENT REUSE

Reuse:

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

from F1 where possible.

---

# 81. TAB STATE

Use routing/query state according to the existing application architecture.

Do not create inconsistent local-only navigation if deep linking is expected.

---

# 82. DEEP LINKING

If a user opens a specific session URL:

```text
Load the session through the backend.
```

Do not depend on the session having been previously loaded in the list.

---

# 83. BACK NAVIGATION

Provide clear return paths:

```text
Session details → Schedule
Meeting details → Meeting Circle
```

---

# 84. GAME / MEMORY / REMINDER INTEGRATION

Do not mix Community business logic with:

```text
F4 Games
F5 Memories
F6 Reminders
```

Use dashboard/navigation links only where necessary.

---

# 85. AI INTEGRATION

Do not implement new AI functionality in F7.

If existing B11 functionality provides event recommendations:

```text
Frontend
 ↓
Central API
 ↓
B11
```

display suggestions only.

Do not automatically register the patient for recommended sessions.

---

# 86. SAFETY

Community and meetings are not emergency systems.

Do not use community registration as a replacement for:

```text
SOS
Fall detection
Geolocation
Emergency contact
```

Those belong to the safety architecture.

---

# 87. TESTING

Add tests for:

```text
Community tabs
Voting list
Vote action
Vote state
Schedule list
Session details
Registration
Capacity
Meeting Circle
Meeting details
Join
```

---

# 88. VOTING TESTS

Test:

```text
Sessions available
No sessions
Successful vote
Vote failure
Already voted
Voting closed
```

according to backend behavior.

---

# 89. REGISTRATION TESTS

Test:

```text
Available
Successful registration
Already registered
Full
Waitlist if supported
Registration closed
Cancellation if supported
```

---

# 90. MEETING TESTS

Test:

```text
Upcoming meeting
Meeting not started
Meeting open
Meeting ended
Meeting cancelled
Unauthorized join
```

according to actual backend behavior.

---

# 91. CAPACITY RACE TEST

Test:

```text
Session appears available
 ↓
Backend returns full
 ↓
Frontend displays full state
```

---

# 92. AUTHORIZATION TESTING

Verify:

```text
Patient can vote when permitted
Patient cannot vote when forbidden
Patient can register when permitted
Patient cannot access unauthorized meeting
```

---

# 93. PRIVACY TESTING

Verify:

```text
Private participant information is not exposed
Protected meeting links are not exposed to unauthorized users
```

---

# 94. ACCESSIBILITY TESTING

Test:

```text
Keyboard
Tabs
Focus
Screen reader
Buttons
Dialogs
Status messages
```

---

# 95. RESPONSIVE TESTING

Test:

```text
Desktop
Tablet
Mobile
```

especially event cards and tabs.

---

# 96. TIMEZONE TESTING

Test:

```text
Date transition
Time display
Timezone conversion
```

using the actual project timezone model.

---

# 97. BROWSER CONSOLE

Check for:

```text
Unhandled errors
React warnings
Failed API requests
Accessibility warnings
```

Fix meaningful issues.

---

# 98. SECURITY REVIEW

Inspect for:

```text
Protected meeting URLs
Sensitive participant data
Private admin data
Tokens in logs
Unauthorized session IDs
```

---

# 99. PERFORMANCE

Avoid:

```text
Repeated session requests
Repeated vote requests
Large participant lists
Unnecessary polling
Unoptimized images
```

Use pagination if backend supports it.

---

# 100. DOCUMENTATION

Create:

```text
docs/F7_COMMUNITY_MEETING_CIRCLE.md
```

Document:

```text
Community architecture
Voting flow
Schedule flow
Pre-registration flow
Meeting Circle flow
API integration
Capacity behavior
Notification integration
Timezone handling
Accessibility
Localization
Privacy
Security
Testing
```

Update:

```text
CLAUDE.md
docs/FRONTEND_ARCHITECTURE.md
```

where appropriate.

---

# 101. MULTI-DEVELOPER RULE

If multiple developers work on F7:

```text
Developer A → Voting
Developer B → Schedule
Developer C → Meeting Circle
```

all must use:

```text
Shared API layer
Shared design system
Shared components
Shared state architecture
```

Do not create separate Community architectures.

---

# 102. GIT SAFETY

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

# 103. DEFINITION OF DONE

F7 is complete only when:

[ ] F0 inspected  
[ ] F1 inspected  
[ ] F2 inspected  
[ ] F3 inspected  
[ ] F4 inspected  
[ ] F5 inspected  
[ ] F6 inspected  
[ ] Community backend inspected  
[ ] Voting backend inspected  
[ ] Schedule backend inspected  
[ ] Registration backend inspected  
[ ] Meeting backend inspected  
[ ] B9 notification system inspected  
[ ] Actual endpoints verified  
[ ] Voting tab implemented  
[ ] Voting cards implemented  
[ ] Vote action implemented  
[ ] Vote state implemented  
[ ] Vote counts displayed where supported  
[ ] Voting empty state implemented  
[ ] Voting closed state handled  
[ ] Schedule tab implemented  
[ ] Scheduled session cards implemented  
[ ] Session details implemented  
[ ] Featured person implemented where supported  
[ ] Featured image implemented where supported  
[ ] Capacity displayed where supported  
[ ] Pre-registration implemented where supported  
[ ] Registration state implemented  
[ ] Full state handled  
[ ] Waitlist implemented where supported  
[ ] Registration closed state handled  
[ ] Cancellation state handled  
[ ] Meeting Circle implemented  
[ ] Meeting details implemented  
[ ] Join flow implemented where supported  
[ ] Early join state handled  
[ ] Meeting ended state handled  
[ ] Meeting cancelled state handled  
[ ] Dashboard integration updated  
[ ] B9 notification behavior verified  
[ ] Date/time handling verified  
[ ] Timezone handling verified  
[ ] Loading states implemented  
[ ] Empty states implemented  
[ ] Error states implemented  
[ ] Retry handling implemented  
[ ] Duplicate mutations prevented  
[ ] Capacity race handled  
[ ] Authorization verified  
[ ] Privacy verified  
[ ] Protected meeting links secured  
[ ] No direct database access  
[ ] No direct meeting-provider secrets  
[ ] No direct notification delivery  
[ ] No unsupported AI logic  
[ ] No medical claims  
[ ] Accessibility verified  
[ ] Localization verified  
[ ] Responsive design verified  
[ ] Component tests added  
[ ] API integration tests added  
[ ] Voting tests added  
[ ] Registration tests added  
[ ] Meeting tests added  
[ ] Authorization tests performed  
[ ] Privacy tests performed  
[ ] Timezone tests performed  
[ ] Browser console checked  
[ ] Lint passes  
[ ] Tests pass  
[ ] Build passes  
[ ] Documentation updated  
[ ] No secrets committed  
[ ] No unrelated feature creep  

---

# 104. FINAL REPORT

Create:

```text
docs/F7_COMMUNITY_MEETING_CIRCLE_REPORT.md
```

Use:

```text
# Memora F7 Community + Meeting Circle Report

## Objective

## Backend APIs Used

## Voting

## Vote State

## Vote Counts

## Schedule

## Session Details

## Featured Person

## Capacity

## Pre-registration

## Registration States

## Meeting Circle

## Meeting Details

## Join Flow

## Notification Integration

## Dashboard Integration

## Date/Time Handling

## Timezone Handling

## Loading States

## Empty States

## Error Handling

## Accessibility

## Localization

## Responsive Design

## Privacy

## Security

## Performance

## Components Created

## Files Modified

## Tests Executed

## Authorization Tests

## Privacy Tests

## Timezone Tests

## Lint Result

## Build Result

## Browser Testing

## Known Issues

## Backend Changes

## Recommendations for F8
```

---

# 105. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
Voting result
Vote-state result
Schedule result
Session-details result
Pre-registration result
Capacity result
Meeting Circle result
Meeting join result
B9 integration result
Dashboard integration result
Timezone result
Accessibility result
Responsive result
Privacy result
Authorization result
Test result
Lint result
Build result
Development server result
```

Do not claim success unless verified.

---

# 106. STOP CONDITION

After F7 is complete:

**STOP.**

Do not automatically implement F8.

The next phase is:

```text
F8
Notifications + Activity Center UI + Backend Integration
```

F8 will build the patient-facing notification and activity experience using the existing B9 notification system.

---

# FINAL PRINCIPLE

F7 should make community participation feel simple:

```text
See something interesting
        ↓
Vote
        ↓
Admin approves
        ↓
Session appears on Schedule
        ↓
Pre-register
        ↓
Receive notification/reminder
        ↓
Join Meeting Circle
```

The architecture must remain:

```text
Patient
   ↓
Community / Meeting UI
   ↓
Central API Layer
   ├───────────────┐
   ↓               ↓
Community APIs    Meeting APIs
   ↓               ↓
Session/Voting    Authorized Meeting
   ↓               ↓
Registration     Join
   ↓
B9 Notifications
```

Keep voting, approval, scheduling, capacity, registration, meeting authorization, and notification delivery on the backend.

The frontend should make community participation easy, calm, accessible, and safe.
