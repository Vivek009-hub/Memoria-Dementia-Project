# Memora - Phase F3 Prompt: Patient Dashboard & Core Patient UI

**Phase:** F3  
**Name:** Patient Dashboard + Core Patient UI  
**Prerequisites:** F0, F1, and F2 completed and verified  
**Status:** Ready for implementation

---

# OBJECTIVE

Build the primary patient-facing web experience for Memora.

F3 is the first major feature-facing frontend phase.

The goal is to turn the foundation created in F0/F1 and the authentication/role shell created in F2 into a usable, simple, calm, elder-friendly patient application.

The target flow is:

```text
Login
  ↓
Authenticated Patient
  ↓
Patient Application Shell
  ↓
Patient Home Dashboard
  ↓
Core Navigation
  ↓
Feature Entry Points
```

F3 should create the actual patient-facing home experience and navigation.

Detailed implementations for:

```text
Cognitive Games
Memories
Reminders
Community Sessions
Meeting Circle
AI Assistant
Notifications
Safety
```

will be completed in their dedicated later phases.

F3 may consume already-existing backend APIs where useful for the dashboard, but must not duplicate feature business logic.

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
```

If filenames differ, locate the equivalent documents.

Inspect the actual implementation of:

```text
F0
F1
F2
```

Do not assume documentation perfectly matches the repository.

The actual code and backend API contracts are authoritative.

---

# 2. CRITICAL RULES

## Rule 1: Preserve F0-F2 architecture

Reuse:

```text
Central API client
Authentication state
Routing
Layouts
Design tokens
Reusable components
Localization
Accessibility patterns
Error handling
Loading patterns
```

Do not create duplicate systems.

---

## Rule 2: Patient-first design

The patient interface must prioritize:

```text
Simple navigation
Large controls
Readable information
Low cognitive load
Clear actions
Predictable behavior
Accessibility
```

---

## Rule 3: Do not build every feature

F3 focuses on:

```text
Patient application shell
Patient navigation
Patient home
Dashboard
Daily overview
Feature entry cards
Upcoming-event preview
Reminder preview
Notification preview
Activity preview where supported
```

Do not implement complete feature workflows that belong to later phases.

---

## Rule 4: Backend remains authoritative

The frontend must not decide:

```text
Authorization
Memory ownership
Game result ownership
Reminder scheduling
Community approval
Meeting permissions
AI memory access
Safety escalation
Geofence state
Caregiver access
```

Use backend APIs.

---

# 3. PATIENT APPLICATION SHELL

Use the F2 patient layout as the foundation.

Conceptually:

```text
┌────────────────────────────────────────────────────┐
│ Memora                              🔔       👤    │
├───────────────┬────────────────────────────────────┤
│               │                                    │
│ 🏠 Home       │                                    │
│ 🧠 Games      │             Main Content           │
│ 💭 Memories   │                                    │
│ ⏰ Reminders  │                                    │
│ 🫂 Community  │                                    │
│ 🤝 Meetings   │                                    │
│ 🤖 Assistant  │                                    │
│ 🚨 Safety     │                                    │
│               │                                    │
└───────────────┴────────────────────────────────────┘
```

Adapt this to the actual route/feature structure.

---

# 4. PATIENT NAVIGATION

Provide clear entry points for supported patient features.

Potential:

```text
Home
Games
Memories
Reminders
Community
Meetings
Assistant
Notifications
Safety
Profile
```

Use only features actually defined by the project.

---

# 5. NAVIGATION SIMPLICITY

Do not create a deep menu hierarchy.

Prefer:

```text
Home
 ↓
Feature
 ↓
Details
```

Avoid:

```text
Home
 ↓
Category
 ↓
Subcategory
 ↓
Subcategory
 ↓
Details
```

---

# 6. ACTIVE NAVIGATION

The current page must be visually obvious.

Use the F1 design system.

Do not rely on color alone.

Use:

```text
Icon
Label
Active indicator
```

where appropriate.

---

# 7. HEADER

Use the existing F1/F2 header architecture.

Potential elements:

```text
Memora
Notification
Profile
```

Do not add unnecessary controls.

---

# 8. PATIENT HOME

Build the actual patient home dashboard.

The dashboard should answer:

```text
What should I do today?
Do I have anything important?
What is coming up?
What can I do now?
```

Avoid overwhelming the patient with analytics.

---

# 9. GREETING

If the authenticated user's display name is available:

```text
Good morning, [Name]
```

or:

```text
Good afternoon, [Name]
Good evening, [Name]
```

Use the actual authenticated user data.

Do not expose unnecessary personal information.

---

# 10. TODAY'S OVERVIEW

Create a clear section for today's relevant information.

Potential:

```text
Today's Activity
Today's Reminders
Upcoming Session
Notifications
```

Only show information supported by actual APIs.

Do not invent data.

---

# 11. PRIMARY ACTION

The dashboard should have one clear primary action when appropriate.

Examples:

```text
Start Today's Activity
Continue Game
View Reminder
Join Session
```

The actual action should be based on available backend data.

Do not create fake recommendations.

---

# 12. FEATURE CARDS

Create reusable patient feature cards for:

```text
🧠 Cognitive Games
💭 Memories
⏰ Reminders
🫂 Community Sessions
🤝 Meeting Circle
🤖 AI Assistant
🔔 Notifications
🚨 Safety
```

Each card should have:

```text
Icon
Title
Short description
Clear action
```

Avoid long text.

---

# 13. COGNITIVE GAMES CARD

Dashboard entry point:

```text
🧠 Cognitive Games

Exercise your memory and thinking.

[ Start ]
```

Do not implement game mechanics in F3.

---

# 14. MEMORIES CARD

Dashboard entry point:

```text
💭 My Memories

View and remember meaningful moments.

[ Open ]
```

Do not implement complete memory CRUD in F3.

---

# 15. REMINDERS CARD

Dashboard entry point:

```text
⏰ Reminders

See what you need to remember today.

[ View ]
```

Where backend data is available, display a small summary.

---

# 16. COMMUNITY CARD

Dashboard entry point:

```text
🫂 Community Sessions

See upcoming sessions and activities.

[ Explore ]
```

Do not implement voting logic in F3.

---

# 17. MEETING CIRCLE CARD

Dashboard entry point:

```text
🤝 Meeting Circle

See your upcoming meetings.

[ View Meetings ]
```

Do not implement complete meeting functionality in F3.

---

# 18. AI ASSISTANT CARD

Dashboard entry point:

```text
🤖 Talk to Memora

Ask Memora about your memories and activities.

[ Talk to Memora ]
```

Do not call the AI provider directly.

The complete AI UI belongs to its dedicated phase.

---

# 19. NOTIFICATIONS CARD

If notification summary data is available:

```text
🔔 Notifications

You have 3 new notifications.

[ View ]
```

Use actual B9 data.

Do not fabricate notification counts.

---

# 20. SAFETY CARD

The safety entry point must be clear but should not make the entire dashboard alarming.

Example:

```text
🚨 Safety

Safety information and emergency options.

[ Open ]
```

Do not implement B12 safety logic in F3.

---

# 21. UPCOMING EVENT

If community/meeting APIs support it, show a concise upcoming event card.

Example:

```text
🫂 Music & Memory

15 September
5:00 PM

[ View Session ]
```

Use actual backend data.

Do not invent event details.

---

# 22. REMINDER PREVIEW

If reminder APIs are available, show a small preview:

```text
⏰ Today

10:00 AM
Take a walk

2:00 PM
Call family
```

Use actual data.

If there are no reminders:

```text
No reminders for today.
```

---

# 23. NOTIFICATION PREVIEW

If B9 APIs are available:

```text
🔔 Notifications

2 new notifications
```

Do not expose notification content that the authenticated user is not authorized to view.

---

# 24. ACTIVITY PREVIEW

If the backend provides safe activity data, show a simple summary.

Examples:

```text
Today's activity
Games completed
Recent activity
```

Do not turn this into a medical dashboard.

---

# 25. PERSONALIZATION

Personalization must be based on actual user/backend data.

Allowed:

```text
User's name
Actual reminders
Actual upcoming sessions
Actual game recommendations
Actual authorized memories
```

Not allowed:

```text
Invented preferences
Invented medical status
Invented memories
Invented activity
```

---

# 26. AI-BASED PERSONALIZATION

If B11 already provides recommendations through an existing API, F3 may display them.

Architecture:

```text
Dashboard
 ↓
B11 API
 ↓
Recommendation
 ↓
Dashboard card
```

Do not implement recommendation logic in React.

---

# 27. LOADING STATES

Each dashboard data section should support:

```text
Loading
Success
Empty
Error
```

Avoid a single endless spinner for the entire dashboard.

---

# 28. PARTIAL FAILURE

If one dashboard section fails:

```text
Games → works
Reminders → works
Community → fails
```

do not make the entire dashboard unusable.

Show an appropriate local error state.

---

# 29. RETRY

For failed dashboard sections provide:

```text
Try Again
```

where appropriate.

Do not reload the entire application unnecessarily.

---

# 30. EMPTY STATES

Use simple patient-friendly messages.

Examples:

```text
No reminders today.
```

```text
No upcoming sessions.
```

```text
No new notifications.
```

---

# 31. OFFLINE STATE

If the browser is offline, show a simple status.

Example:

```text
You are offline.
Some information may be unavailable.
```

Do not overwhelm the patient.

---

# 32. RESPONSIVE DESIGN

The patient dashboard must work on:

```text
Desktop
Tablet
Mobile browser
```

Do not simply shrink desktop cards.

Reflow them.

---

# 33. MOBILE-WEB DASHBOARD

On smaller screens:

```text
Navigation collapses
Cards stack
Buttons remain large
Text remains readable
```

---

# 34. ELDER-FRIENDLY UI

Follow F1:

```text
Large controls
Readable text
High contrast
Simple language
Clear icons
Limited choices
Predictable layout
```

---

# 35. ACCESSIBILITY

Ensure:

```text
Keyboard navigation
Screen reader support
Visible focus
Semantic HTML
Accessible labels
Heading hierarchy
Alt text
```

---

# 36. ICONS

Use the established F1 icon system.

Prefer:

```text
Icon + Label
```

for important actions.

Do not create a new icon library.

---

# 37. CARDS

Reuse the F1 card component.

Do not create custom card styles for every dashboard section.

---

# 38. BUTTONS

Reuse F1 buttons.

Do not introduce unrelated button styles.

---

# 39. TYPOGRAPHY

Use F1 typography tokens.

Do not hardcode arbitrary font sizes throughout the dashboard.

---

# 40. COLORS

Use F1 color tokens.

Safety states may have stronger emphasis, but do not turn the entire dashboard into an emergency interface.

---

# 41. ACCESSIBLE DASHBOARD ORDER

Use a logical reading order:

```text
Page heading
 ↓
Today's primary action
 ↓
Important reminders/events
 ↓
Core features
 ↓
Secondary information
```

---

# 42. SCREEN READER LANDMARKS

Use appropriate:

```text
header
nav
main
section
footer
```

where applicable.

---

# 43. KEYBOARD NAVIGATION

Test:

```text
Tab
Shift+Tab
Enter
Space
Escape
```

All important dashboard actions must be keyboard accessible.

---

# 44. FOCUS

Ensure focus remains visible when navigating.

Do not remove browser focus outlines without replacement.

---

# 45. LOCALIZATION

All patient-facing text should use the project's localization system.

Prepare for:

```text
English
Hindi
Other configured regional languages
```

---

# 46. TRANSLATION-SAFE DESIGN

Do not assume labels have fixed lengths.

Buttons and cards must accommodate longer translations.

Avoid hardcoded fixed widths that break localization.

---

# 47. DATE/TIME

Use backend timestamp conventions and the user's appropriate local timezone.

Do not hardcode dates.

---

# 48. API INTEGRATION

Use only the centralized API layer created in F0.

Potential dashboard API calls:

```text
Current user
Reminders
Notifications
Upcoming community session
Upcoming meeting
Game/recommendation summary
```

Only use APIs that actually exist.

---

# 49. API REQUEST STRATEGY

Avoid unnecessary duplicate requests.

Do not have:

```text
Dashboard component → fetch reminders
Reminder card → fetch reminders again
Sidebar → fetch reminders again
```

unless the architecture explicitly requires it.

Prefer shared server-state handling where appropriate.

---

# 50. DASHBOARD DATA AGGREGATION

Do not create a new backend endpoint just because it is convenient unless a real performance or architectural need exists.

Prefer existing APIs first.

If multiple requests are necessary, handle them cleanly.

---

# 51. AUTHORIZATION

The dashboard must only render data returned for the authenticated user.

Never request:

```text
All patients
All memories
All safety events
```

and filter them in React.

---

# 52. SECURITY

Inspect dashboard data for:

```text
Private memories
Location
Safety events
Caregiver information
AI conversations
```

Only display authorized data.

---

# 53. NO MEDICAL DASHBOARD

Do not display unsupported medical claims such as:

```text
Dementia score
Disease progression
Diagnosis
Clinical prediction
```

unless the project explicitly defines a validated and safe representation.

---

# 54. SAFETY UX

The safety entry point should be discoverable.

However:

```text
Normal dashboard
```

should not constantly look like:

```text
Emergency dashboard
```

Reserve strong emphasis for actual safety states.

---

# 55. NOTIFICATION BADGE

If unread notification count is available:

```text
🔔 3
```

Use accessible text as well.

Do not rely only on a red dot.

---

# 56. PROFILE

Connect the existing F2 account/profile entry point.

Do not build complete profile management unless specified.

---

# 57. LOGOUT

Keep logout accessible through the F2 account menu.

Do not duplicate logout logic inside the dashboard.

---

# 58. ERROR BOUNDARY

Use the F0 global error boundary.

Do not create unrelated error boundaries for every small card unless needed.

---

# 59. PERFORMANCE

Avoid:

```text
Huge dashboard bundle
Repeated API calls
Unnecessary animations
Unnecessary polling
Large images
```

---

# 60. POLLING

Do not introduce aggressive polling.

For data such as notifications, use the existing project strategy.

---

# 61. REAL BACKEND DATA

Once the backend is available:

```text
Use real API responses.
```

Do not ship mock dashboard data.

---

# 62. TEST DATA

For tests only, synthetic fixtures may be used.

Never use real patient data.

---

# 63. TESTING

Add tests for:

```text
Patient dashboard rendering
Authenticated patient access
Navigation
Feature cards
Loading states
Empty states
Error states
Responsive behavior where practical
```

---

# 64. AUTH TEST

Verify:

```text
Unauthenticated user
 ↓
Cannot access patient dashboard
```

---

# 65. ROLE TEST

Verify:

```text
Patient
 ↓
Patient dashboard

Non-patient role
 ↓
Appropriate role application
```

Use the actual role architecture.

Do not accidentally show patient-specific UI to unrelated roles.

---

# 66. DATA TESTING

Test:

```text
Reminders available
No reminders
Upcoming event available
No upcoming event
Notifications available
No notifications
API failure
```

---

# 67. PARTIAL FAILURE TEST

Test:

```text
One API succeeds
One API fails
```

The dashboard should remain usable.

---

# 68. ACCESSIBILITY TESTING

Test:

```text
Keyboard
Focus
Screen reader semantics
Contrast
Labels
Heading order
```

---

# 69. RESPONSIVE TESTING

Test reasonable:

```text
Desktop viewport
Tablet viewport
Mobile viewport
```

---

# 70. BROWSER CONSOLE

Check for:

```text
Unhandled errors
React/framework warnings
Failed requests
CORS errors
Missing keys
Accessibility warnings
```

Fix meaningful issues.

---

# 71. NO FEATURE CREEP

Do NOT implement complete:

```text
Game engine
Memory CRUD
Reminder scheduling
Voting
Meeting system
AI chat
Notification backend
Safety engine
Caregiver dashboard
Admin dashboard
```

Only create dashboard entry points/previews necessary for F3.

---

# 72. MULTI-DEVELOPER RULE

Future feature developers must be able to plug their features into the patient dashboard without redesigning it.

Document:

```text
How to add dashboard cards
How to add navigation items
How to fetch dashboard data
How to use feature components
```

---

# 73. COMPONENT REUSE

Before creating a component:

```text
Search F1 components.
```

Reuse:

```text
Button
Card
Badge
Alert
Loading
EmptyState
ErrorState
PageHeader
```

where appropriate.

---

# 74. NO DUPLICATE DESIGN SYSTEM

Do not introduce:

```text
New colors
New typography
New button styles
New card styles
```

outside F1 unless a documented design-system extension is needed.

---

# 75. DOCUMENTATION

Create:

```text
docs/F3_PATIENT_DASHBOARD.md
```

Document:

```text
Patient shell
Navigation
Dashboard structure
Dashboard data sources
Feature cards
Loading states
Empty states
Error states
Responsive behavior
Accessibility
Localization
```

Update:

```text
CLAUDE.md
docs/FRONTEND_ARCHITECTURE.md
```

where required.

---

# 76. GIT SAFETY

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

Preserve unrelated changes.

---

# 77. DEFINITION OF DONE

F3 is complete only when:

[ ] F0 inspected  
[ ] F1 inspected  
[ ] F2 inspected  
[ ] Patient role architecture verified  
[ ] Patient application shell implemented  
[ ] Patient navigation implemented  
[ ] Active navigation implemented  
[ ] Patient header implemented/reused  
[ ] Patient home dashboard implemented  
[ ] Personalized greeting implemented where supported  
[ ] Today's overview implemented  
[ ] Primary action implemented where supported  
[ ] Cognitive Games entry card implemented  
[ ] Memories entry card implemented  
[ ] Reminders entry card implemented  
[ ] Community entry card implemented  
[ ] Meeting Circle entry card implemented  
[ ] AI Assistant entry card implemented  
[ ] Notifications entry point implemented  
[ ] Safety entry point implemented  
[ ] Upcoming-event preview implemented where API exists  
[ ] Reminder preview implemented where API exists  
[ ] Notification preview implemented where API exists  
[ ] Activity preview implemented where API exists  
[ ] Real backend data used  
[ ] No fake production data  
[ ] Loading states implemented  
[ ] Empty states implemented  
[ ] Error states implemented  
[ ] Partial API failures handled  
[ ] Retry behavior implemented where appropriate  
[ ] Offline state handled  
[ ] Responsive desktop layout verified  
[ ] Responsive tablet layout verified  
[ ] Responsive mobile-web layout verified  
[ ] Elder-friendly sizing verified  
[ ] Accessibility verified  
[ ] Keyboard navigation verified  
[ ] Focus states verified  
[ ] Screen-reader semantics verified  
[ ] Localization architecture respected  
[ ] Translation-safe layouts verified  
[ ] Date/time handling verified  
[ ] API client reused  
[ ] No duplicate API clients  
[ ] Authorization respected  
[ ] No medical claims introduced  
[ ] No direct database access  
[ ] No direct AI provider access  
[ ] No safety logic duplicated in frontend  
[ ] Component tests added  
[ ] Dashboard integration tests added  
[ ] Browser console checked  
[ ] Lint passes  
[ ] Tests pass  
[ ] Build passes  
[ ] Documentation updated  
[ ] No major feature creep  
[ ] No secrets committed  

---

# 78. FINAL REPORT

Create:

```text
docs/F3_PATIENT_DASHBOARD_REPORT.md
```

Use:

```text
# Memora F3 Patient Dashboard Report

## Objective

## Patient Role Architecture

## Patient Shell

## Navigation

## Dashboard Structure

## Greeting

## Today's Overview

## Primary Action

## Feature Cards

## Upcoming Events

## Reminder Preview

## Notification Preview

## Activity Preview

## API Integration

## Loading States

## Empty States

## Error States

## Offline Handling

## Responsive Design

## Accessibility

## Localization

## Security

## Files Created

## Files Modified

## Tests Executed

## Integration Tests

## Lint Result

## Build Result

## Browser Testing

## Known Issues

## Recommendations for F4
```

---

# 79. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
Patient dashboard result
Navigation result
Authentication result
API integration result
Loading result
Empty-state result
Error-state result
Responsive result
Accessibility result
Test result
Lint result
Build result
Development server result
```

Do not claim success unless verified.

---

# 80. STOP CONDITION

After F3 is complete:

**STOP.**

Do not automatically implement F4.

Do not build the complete Games feature.

The next phase is:

```text
F4
Cognitive Games UI + Backend Integration
```

F4 will implement the actual patient-facing cognitive gaming experience using the existing B4 game APIs.

---

# FINAL PRINCIPLE

F3 should make Memora feel like a real application for the patient:

```text
Login
  ↓
Welcome
  ↓
See today's important information
  ↓
Choose one clear activity
  ↓
Access Memora features
```

The dashboard should never feel like an enterprise analytics portal.

It should feel like a simple, calm starting point for the person using Memora.
