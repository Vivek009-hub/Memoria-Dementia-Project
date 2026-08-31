# Memora - Phase F16 Prompt
# Accessibility + Localization

**Phase:** F16  
**Name:** Accessibility + Localization  
**Prerequisites:** F15 V2 completed with no unresolved P0/P1 issues  
**Purpose:** Make the existing Memora frontend accessible, elderly-friendly, keyboard/screen-reader usable, and localization-ready across supported languages without breaking existing functionality.

---

# 0. EXECUTIVE INSTRUCTION

This is a **quality and inclusion phase**.

Do NOT rebuild the application.

Do NOT add unrelated features.

Do NOT change working backend architecture unless a genuine accessibility/localization integration defect requires it.

The goal is:

```text
Existing Memora UI
        ↓
Accessibility audit
        ↓
Localization audit
        ↓
Fix
        ↓
Test
        ↓
Regression test
        ↓
Document
```

The actual repository is authoritative.

Do not assume F0-F15 are perfect.

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
```

Inspect actual:

```text
F0-F15 frontend
Shared components
Design system
Routing
Forms
Dialogs
Charts
Tables
Notifications
Games
Memory
Reminders
Community
Meetings
AI
Safety
Caregiver dashboard
Admin dashboard
Analytics
Localization system
```

---

# 2. CRITICAL RULE

Do not claim accessibility or localization is complete because:

```text
The page looks good.
A language dropdown exists.
ARIA attributes exist.
The browser has no errors.
```

Completion requires actual testing.

---

# 3. ACCESSIBILITY GOAL

Memora must be usable by people with different:

```text
Vision
Hearing
Mobility
Cognitive
Language
Technology
```

needs.

The patient experience should receive particular attention because the platform is intended to support elderly users and dementia-related workflows.

---

# 4. ACCESSIBILITY PRINCIPLES

Prioritize:

```text
Clarity
Consistency
Large readable controls
Simple navigation
Visible focus
Keyboard access
Screen-reader compatibility
Low cognitive load
Predictable interactions
Clear feedback
Non-color-only status
```

---

# 5. DO NOT OVER-COMPLICATE

Do not make the UI technically accessible while making it harder for elderly users.

Prefer:

```text
Simple labels
Large targets
Few choices
Clear hierarchy
Predictable navigation
```

---

# 6. ACCESSIBILITY STANDARD

Use the project's applicable accessibility standard.

Target:

```text
WCAG 2.2 AA
```

where practical and applicable.

Do not claim formal certification.

---

# 7. GLOBAL AUDIT

Audit every major page:

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

Also audit shared components.

---

# 8. SEMANTIC HTML

Prefer:

```text
header
nav
main
section
article
footer
button
a
form
label
table
thead
tbody
```

Avoid unnecessary:

```text
<div onClick>
<span onClick>
```

when semantic controls exist.

---

# 9. HEADINGS

Use logical heading hierarchy:

```text
h1
  h2
    h3
```

Avoid skipping levels unnecessarily.

Each major page should have a clear primary heading.

---

# 10. LANDMARKS

Use meaningful landmarks:

```text
header
nav
main
aside
footer
```

Avoid multiple ambiguous regions.

---

# 11. NAVIGATION

Keyboard users must be able to navigate:

```text
Navigation
Sidebar
Tabs
Dropdowns
Dialogs
Forms
Cards
Tables
```

---

# 12. FOCUS

Ensure:

```text
Visible focus
Logical focus order
No focus traps except intentional dialogs
Focus restoration after modal closes
Focus moved appropriately after navigation
```

---

# 13. KEYBOARD

Everything interactive must work without a mouse.

Test:

```text
Tab
Shift+Tab
Enter
Space
Arrow keys where appropriate
Escape
```

---

# 14. BUTTONS

Buttons must have accessible names.

Bad:

```text
<button>...</button>
```

with no meaningful accessible name.

Good:

```text
<button aria-label="Mark reminder as complete">
```

when an icon-only control is required.

---

# 15. LINKS

Links should communicate destination.

Avoid meaningless:

```text
Click here
More
```

when context is insufficient.

---

# 16. ICON-ONLY CONTROLS

Every icon-only action must have:

```text
Accessible name
Tooltip where useful
Visible focus
Keyboard support
```

---

# 17. TOUCH TARGETS

Important controls should have sufficiently large touch targets.

Prioritize:

```text
Buttons
Navigation
Game controls
SOS
Reminder actions
Patient selector
```

Do not make critical controls tiny.

---

# 18. TEXT SIZE

Patient-facing text should be comfortably readable.

Do not rely on extremely small text to fit content.

---

# 19. RESPONSIVE ACCESSIBILITY

Test:

```text
Desktop
Tablet
Mobile
Zoom
```

Ensure zooming does not destroy functionality.

---

# 20. COLOR CONTRAST

Check:

```text
Text
Buttons
Links
Borders
Status indicators
Focus indicators
Disabled states
```

Use sufficient contrast.

---

# 21. COLOR INDEPENDENCE

Never communicate critical information using color alone.

Bad:

```text
Green = safe
Red = danger
```

without text/icon.

Good:

```text
🟢 Safe
🔴 Emergency
```

with accessible text.

---

# 22. DARK/LIGHT THEMES

If the project supports themes:

```text
Light
Dark
System
```

audit both.

Ensure:

```text
Contrast
Focus
Disabled states
Charts
Dialogs
```

remain usable.

---

# 23. IMAGES

Every meaningful image needs appropriate alternative text.

Decorative images should not create unnecessary screen-reader noise.

---

# 24. IMAGE ALT TEXT

Avoid:

```text
image
photo
picture
```

when a meaningful description is required.

Use contextual descriptions.

---

# 25. VIDEO

For videos, where applicable:

```text
Controls
Captions
Accessible player controls
Fullscreen keyboard access
```

must work.

Do not rely on custom inaccessible video controls.

---

# 26. AUDIO

For audio content where applicable:

```text
Play/pause
Volume
Progress
```

must be accessible.

---

# 27. AI ASSISTANT ACCESSIBILITY

Audit:

```text
Input
Send
Response
Loading
Errors
Voice controls
Conversation history
```

AI responses should be announced appropriately without causing excessive screen-reader interruptions.

---

# 28. GAMES ACCESSIBILITY

Audit every cognitive game.

Check:

```text
Keyboard operation where practical
Clear instructions
Visible state
Accessible feedback
Readable text
No color-only instructions
```

Do not make a game impossible for keyboard users without a documented reason.

---

# 29. GAME FEEDBACK

Game result messages should be accessible.

Example:

```text
Game completed.
Your score was 85.
```

Use appropriate live-region behavior where needed.

---

# 30. MEMORY ACCESSIBILITY

Audit:

```text
Memory list
Memory cards
Create form
Edit form
Delete dialog
Media
Search
```

---

# 31. REMINDER ACCESSIBILITY

Audit:

```text
Reminder list
Create reminder
Edit reminder
Complete
Snooze
Delete
Notifications
```

---

# 32. COMMUNITY ACCESSIBILITY

Audit:

```text
Voting
Session cards
Registration
Schedule
Host information
Meeting access
```

---

# 33. MEETING ACCESSIBILITY

Verify:

```text
Join controls
Meeting information
Dialogs
Links
Status
```

are keyboard and screen-reader accessible.

---

# 34. SAFETY ACCESSIBILITY

Safety information must be extremely clear.

Do not rely on color or animation alone.

Use:

```text
Status text
Icon
Heading
Timestamp
Action
```

where appropriate.

---

# 35. SOS ACCESSIBILITY

The SOS control must have:

```text
Clear label
Large target
Keyboard support where applicable
Accessible confirmation
Accessible success/error feedback
```

Do not hide SOS behind inaccessible gestures.

---

# 36. SAFETY ALERTS

Ensure alerts are:

```text
Visually prominent
Textually clear
Screen-reader accessible
```

Do not overuse aggressive live announcements.

---

# 37. LOCATION ACCESSIBILITY

Location status should have text.

Example:

```text
Location sharing: Active
```

rather than relying only on a map/color marker.

---

# 38. CAREGIVER ACCESSIBILITY

Audit:

```text
Patient selector
Patient cards
Activity
Games
Memories
Reminders
Community
Meetings
Progress
Safety
```

---

# 39. ADMIN ACCESSIBILITY

Audit:

```text
Tables
Filters
Forms
Dialogs
Role controls
Content editor
Uploads
Scheduling
Analytics
Activity logs
```

---

# 40. TABLE ACCESSIBILITY

For tables:

```text
Caption where useful
Header cells
Scope
Keyboard access
Responsive behavior
```

Do not create inaccessible pseudo-tables from divs unnecessarily.

---

# 41. FORMS

Every input needs:

```text
Label
Instruction where necessary
Error association
Required indication
```

---

# 42. FORM ERRORS

Errors must be:

```text
Visible
Specific
Associated with the relevant field
Accessible to screen readers
```

Example:

```text
Password must contain at least 8 characters.
```

---

# 43. REQUIRED FIELDS

Do not rely only on:

```text
*
```

Use accessible required semantics and/or clear text.

---

# 44. FORM SUBMISSION

After an error:

```text
Focus appropriate field
```

After success:

```text
Provide clear confirmation
```

Do not unexpectedly move focus.

---

# 45. DIALOGS

Every modal/dialog must have:

```text
Accessible name
Description where useful
Focus trap
Escape handling
Focus restoration
```

---

# 46. DELETE CONFIRMATION

Destructive dialogs must clearly identify:

```text
What will be deleted
What happens next
Cancel
Confirm
```

---

# 47. DROPDOWNS

Native/select controls are preferred when sufficient.

Custom dropdowns must support:

```text
Keyboard
Focus
Arrow navigation where appropriate
Escape
Screen readers
```

---

# 48. TABS

If tabs are used, implement appropriate:

```text
Tablist
Tab
Tabpanel
```

semantics and keyboard behavior.

---

# 49. ACCORDIONS

Accordions must have:

```text
Button semantics
Expanded/collapsed state
Keyboard support
```

---

# 50. TOASTS

Toast notifications must not be the only way to communicate important information.

Important errors/safety states must remain discoverable.

---

# 51. LIVE REGIONS

Use live regions carefully for:

```text
Important status
Form submission result
Game completion
AI response completion
Safety alerts
```

Do not announce every minor UI update.

---

# 52. LOADING STATES

Loading states must communicate status accessibly.

Example:

```text
Loading your progress...
```

Avoid endless spinners with no context.

---

# 53. ERROR STATES

Error messages must:

```text
Explain what happened
Suggest recovery
Be accessible
```

---

# 54. COGNITIVE ACCESSIBILITY

Reduce cognitive load through:

```text
Consistent layouts
Consistent button placement
Simple wording
Limited simultaneous choices
Clear confirmation
Predictable navigation
```

---

# 55. ELDER-FRIENDLY LANGUAGE

Prefer:

```text
Save
Cancel
Play
Start
Complete
Remind me
Join
Go back
```

Avoid unnecessary technical terminology.

---

# 56. LOCALIZATION GOAL

Centralize all user-visible strings.

Search for hardcoded text.

Potential search targets:

```text
""
' '
placeholder
aria-label
title
alert
toast
error
button text
```

Audit carefully.

---

# 57. TRANSLATION SYSTEM

Use the existing localization architecture if present.

Do not introduce a second i18n library unless the current architecture genuinely cannot support the requirement.

---

# 58. SUPPORTED LANGUAGES

Inspect the project specification and existing implementation.

Support:

```text
English
Hindi
Other configured languages
```

Do not claim a language is supported unless translations actually exist.

---

# 59. LANGUAGE SWITCHING

If language switching exists:

```text
Select language
 ↓
UI updates
 ↓
Preference persists
```

Verify after:

```text
Refresh
Logout/login
Navigation
```

where the architecture supports persistence.

---

# 60. DEFAULT LANGUAGE

Use the project's existing default-language behavior.

Do not silently change it.

---

# 61. FALLBACK LANGUAGE

If a translation is missing:

```text
Use configured fallback.
```

Do not display:

```text
undefined
translation.key
null
```

to users.

---

# 62. TRANSLATION KEYS

Use structured keys.

Example:

```text
auth.login.title
reminders.create.button
community.vote.submit
safety.sos.confirm
```

Follow existing naming conventions.

---

# 63. NO CONCATENATED TRANSLATIONS

Avoid constructing translated sentences by concatenating fragments.

Bad:

```text
"Hello " + name + ", you have " + count + " reminders"
```

Use translation parameters.

---

# 64. PLURALIZATION

Use proper pluralization.

Example:

```text
1 reminder
2 reminders
```

Do not assume English pluralization rules apply to all languages.

---

# 65. VARIABLES

Use translation interpolation for:

```text
Names
Counts
Dates
Times
Scores
```

---

# 66. DATE LOCALIZATION

Use locale-aware formatting for:

```text
Dates
Times
Weekdays
Months
```

---

# 67. NUMBER LOCALIZATION

Use locale-aware formatting for:

```text
Numbers
Percentages
Scores
Counts
```

---

# 68. CURRENCY

If the application ever displays currency:

```text
Use locale-aware formatting.
```

Do not hardcode currency formatting.

---

# 69. TEXT EXPANSION

Test translations that are longer than English.

UI must not break when text expands.

---

# 70. TEXT SHRINKING

Do not rely on fixed widths that cause translated text to disappear.

---

# 71. RTL PREPARATION

Even if RTL languages are not currently supported:

```text
Avoid hardcoded left/right assumptions where practical.
```

Do not implement full RTL unless required by project scope.

---

# 72. USER-GENERATED CONTENT

Do not automatically translate user-generated:

```text
Memory content
Names
Session descriptions
AI content
```

unless the product explicitly supports translation.

---

# 73. BACKEND CONTENT

If backend content is multilingual:

```text
Use the actual language fields/API.
```

Do not invent translation data in frontend.

---

# 74. RICH TEXT LOCALIZATION

Ensure content editor and rendered content behave correctly with translated text.

---

# 75. MEDIA LOCALIZATION

If localized media exists:

```text
Use actual localized assets.
```

Do not fake localized videos/images.

---

# 76. AI LOCALIZATION

If AI supports language selection:

```text
Use existing backend/provider behavior.
```

Do not claim AI understands a language merely because the interface is translated.

---

# 77. NOTIFICATIONS LOCALIZATION

Audit:

```text
Reminder notifications
Community notifications
Meeting notifications
Safety notifications
Admin notifications
```

Use localized templates where supported.

---

# 78. ERROR LOCALIZATION

Frontend-generated errors should be localized.

Backend error messages should be mapped to safe localized messages where appropriate.

Do not blindly display raw backend English messages if the UI promises localization.

---

# 79. ACCESSIBILITY + LOCALIZATION INTERACTION

Test combinations such as:

```text
Hindi + screen reader
Hindi + mobile
Large text + Hindi
Keyboard + localized dropdown
```

---

# 80. FONT SUPPORT

Verify configured fonts support the supported languages.

Avoid missing glyphs.

---

# 81. TEXT DIRECTION

Ensure mixed content handles:

```text
English
Hindi
Numbers
Dates
User names
```

correctly.

---

# 82. LOCALIZED ROUTES

If localized routing exists, verify it.

Do not introduce localized URLs unless already part of architecture.

---

# 83. LOCALIZED STORAGE

If language preference is stored:

```text
Use existing preference mechanism.
```

Do not duplicate preference storage.

---

# 84. ACCESSIBILITY TESTING TOOLS

Use available tooling such as:

```text
axe
Lighthouse
browser accessibility tree
keyboard testing
screen reader testing
```

Use the project's existing test setup where possible.

---

# 85. SCREEN READER TESTING

Test at least one supported desktop screen reader if available.

Verify:

```text
Page title
Headings
Navigation
Forms
Buttons
Dialogs
Tables
Alerts
Charts
```

---

# 86. KEYBOARD TESTING

Complete major workflows without a mouse:

```text
Login
Patient navigation
Game
Memory
Reminder
Community vote
Meeting
AI
SOS
Caregiver
Admin
Analytics
```

---

# 87. ZOOM TESTING

Test browser zoom:

```text
100%
200%
```

and verify important workflows remain usable.

---

# 88. MOTION

Respect:

```text
prefers-reduced-motion
```

where animations exist.

Avoid excessive animation.

---

# 89. AUTOPLAY

Avoid unexpected autoplay, especially audio/video.

---

# 90. FLASHING

Do not introduce rapidly flashing content.

---

# 91. FOCUS VISIBILITY

Never remove focus outlines without providing an equivalent visible focus indicator.

---

# 92. DISABLED CONTROLS

Disabled controls should have understandable state.

Do not use disabled controls as the only explanation for why an action cannot be performed.

---

# 93. STATUS INDICATORS

Important statuses should have:

```text
Text
Icon where useful
Accessible semantics
```

---

# 94. CHART ACCESSIBILITY

Analytics charts from F14 must provide:

```text
Accessible title
Text summary
Data table where appropriate
```

Do not make charts the only source of information.

---

# 95. GAME ACCESSIBILITY

For each game verify:

```text
Instructions
Controls
Feedback
Completion
Results
```

---

# 96. SAFETY ACCESSIBILITY

For safety flows:

```text
SOS
Alerts
Location
Fall events
Device status
```

ensure information remains understandable without relying on:

```text
Color
Sound
Animation
```

alone.

---

# 97. LANGUAGE TEST MATRIX

Create:

| Feature | English | Hindi | Long Text | Missing Key | Screen Reader |
|---|---|---|---|---|---|
| Login | | | | | |
| Patient | | | | | |
| Games | | | | | |
| Memory | | | | | |
| Reminders | | | | | |
| Community | | | | | |
| Meetings | | | | | |
| AI | | | | | |
| Safety | | | | | |
| Caregiver | | | | | |
| Admin | | | | | |
| Analytics | | | | | |

Only mark PASS after testing.

---

# 98. ACCESSIBILITY ISSUE SEVERITY

Use:

```text
A0 = Critical accessibility blocker
A1 = Major accessibility failure
A2 = Important accessibility defect
A3 = Minor accessibility defect
```

Examples:

```text
A0:
SOS cannot be operated/accessed by keyboard or assistive technology.

A1:
Important workflow cannot be completed with keyboard.

A2:
Form error is not announced.

A3:
Minor label/focus polish issue.
```

---

# 99. LOCALIZATION ISSUE SEVERITY

Use:

```text
L0 = Critical localization blocker
L1 = Major localization failure
L2 = Important localization defect
L3 = Minor localization issue
```

Examples:

```text
L0:
Application crashes when switching language.

L1:
Major workflow remains unusable in supported language.

L2:
Important untranslated UI remains.

L3:
Minor wording/translation issue.
```

---

# 100. AUTOMATIC FIX LOOP

For every A0/A1/L0/L1:

```text
Discover
 ↓
Record
 ↓
Find root cause
 ↓
Fix
 ↓
Test
 ↓
Regression test
 ↓
Mark FIXED
```

Do not merely report accessibility/localization failures.

---

# 101. NO FALSE PASS

Do not mark accessibility:

```text
PASS
```

because an automated scanner reports zero issues.

Manual testing is required.

---

# 102. REGRESSION TESTING

After accessibility/localization fixes:

```text
Run targeted tests
 ↓
Run affected feature tests
 ↓
Run full available test suite
```

Ensure functionality has not been broken.

---

# 103. PERFORMANCE

Localization should not unnecessarily:

```text
Increase bundle size
Load every language simultaneously
Duplicate large assets
```

Load translations efficiently according to existing architecture.

---

# 104. SECURITY

Accessibility/localization changes must not weaken:

```text
Authentication
Authorization
XSS protection
Content sanitization
Safety permissions
```

---

# 105. XSS

Translated/rich content must remain safely rendered.

Do not bypass sanitization to support rich text.

---

# 106. PRIVACY

Do not log:

```text
Private memories
AI conversations
Precise location
Safety events
Patient information
```

while testing accessibility/localization.

---

# 107. GIT SAFETY

Before work:

```bash
git status
git branch
```

Never use:

```bash
git reset --hard
git clean -fd
```

Suggested branch:

```text
feature/f16-accessibility-localization
```

---

# 108. DEFINITION OF DONE

F16 is complete only when:

[ ] F0-F15 reviewed  
[ ] F15 P0/P1 status verified  
[ ] All major pages audited  
[ ] Semantic HTML reviewed  
[ ] Heading hierarchy reviewed  
[ ] Landmarks reviewed  
[ ] Keyboard navigation verified  
[ ] Focus behavior verified  
[ ] Focus visibility verified  
[ ] Buttons accessible  
[ ] Links accessible  
[ ] Icon-only controls labeled  
[ ] Touch targets reviewed  
[ ] Text size reviewed  
[ ] Zoom 200% tested  
[ ] Contrast tested  
[ ] Color independence verified  
[ ] Images reviewed  
[ ] Video accessibility reviewed  
[ ] Audio accessibility reviewed  
[ ] AI accessibility reviewed  
[ ] Games accessibility reviewed  
[ ] Memory accessibility reviewed  
[ ] Reminder accessibility reviewed  
[ ] Community accessibility reviewed  
[ ] Meeting accessibility reviewed  
[ ] Safety accessibility reviewed  
[ ] SOS accessibility reviewed  
[ ] Caregiver accessibility reviewed  
[ ] Admin accessibility reviewed  
[ ] Tables accessible  
[ ] Forms accessible  
[ ] Errors accessible  
[ ] Dialogs accessible  
[ ] Dropdowns accessible  
[ ] Tabs accessible where used  
[ ] Accordions accessible where used  
[ ] Toasts reviewed  
[ ] Live regions reviewed  
[ ] Loading states accessible  
[ ] Cognitive load reviewed  
[ ] Elder-friendly language reviewed  
[ ] All user-facing strings audited  
[ ] Localization system verified  
[ ] English verified  
[ ] Hindi verified where supported  
[ ] Other configured languages verified  
[ ] Language switching verified  
[ ] Fallback verified  
[ ] Translation keys verified  
[ ] Pluralization verified  
[ ] Interpolation verified  
[ ] Date localization verified  
[ ] Number localization verified  
[ ] Text expansion tested  
[ ] Missing translation behavior tested  
[ ] Font/glyph support verified  
[ ] AI localization reviewed  
[ ] Notification localization reviewed  
[ ] Error localization reviewed  
[ ] Accessibility + localization combinations tested  
[ ] Reduced motion reviewed  
[ ] Autoplay reviewed  
[ ] No flashing introduced  
[ ] A0 issues = 0  
[ ] A1 issues = 0  
[ ] L0 issues = 0  
[ ] L1 issues = 0  
[ ] Remaining A2/A3 documented  
[ ] Remaining L2/L3 documented  
[ ] Regression tests pass  
[ ] Lint passes  
[ ] Build passes  
[ ] Browser console checked  
[ ] Documentation updated  
[ ] No secrets committed  
[ ] No unrelated feature creep  

---

# 109. FINAL REPORT

Create:

```text
docs/F16_ACCESSIBILITY_LOCALIZATION_REPORT.md
```

Use:

```text
# Memora F16 Accessibility + Localization Report

## Objective

## Standards

## Pages Audited

## Accessibility Architecture

## Semantic HTML

## Keyboard Navigation

## Focus Management

## Screen Reader Testing

## Touch Targets

## Typography

## Contrast

## Color Independence

## Images

## Video

## Audio

## Forms

## Dialogs

## Tables

## Charts

## Games

## Memory

## Reminders

## Community

## Meetings

## AI

## Safety

## SOS

## Caregiver Dashboard

## Admin Dashboard

## Localization Architecture

## Supported Languages

## Language Switching

## Translation Keys

## Pluralization

## Interpolation

## Date/Number Formatting

## Text Expansion

## Fallback Behavior

## AI Localization

## Notification Localization

## Error Localization

## Accessibility + Localization Interaction

## A0 Issues

## A1 Issues

## A2 Issues

## A3 Issues

## L0 Issues

## L1 Issues

## L2 Issues

## L3 Issues

## Issues Fixed

## Remaining Issues

## Testing

## Regression Testing

## Performance

## Security

## Files Created

## Files Modified

## Known Limitations

## Recommendations for F17
```

---

# 110. FINAL ISSUE SUMMARY

Report:

```text
Accessibility issues discovered:
A0:
A1:
A2:
A3:

Accessibility issues fixed:
A0:
A1:
A2:
A3:

Accessibility issues remaining:
A0:
A1:
A2:
A3:

Localization issues discovered:
L0:
L1:
L2:
L3:

Localization issues fixed:
L0:
L1:
L2:
L3:

Localization issues remaining:
L0:
L1:
L2:
L3:
```

---

# 111. FINAL TERMINAL OUTPUT

Run:

```bash
git status
git diff --stat
git diff --check
```

Then run the actual project:

```text
Test
Lint
Build
```

commands.

Do not invent commands if the repository uses different tooling.

---

# 112. FINAL RESULT FORMAT

Return:

```text
F16 STATUS: COMPLETE / BLOCKED

A0 discovered: X
A0 fixed: X
A0 remaining: X

A1 discovered: X
A1 fixed: X
A1 remaining: X

A2 discovered: X
A2 fixed: X
A2 remaining: X

A3 discovered: X
A3 fixed: X
A3 remaining: X

L0 discovered: X
L0 fixed: X
L0 remaining: X

L1 discovered: X
L1 fixed: X
L1 remaining: X

L2 discovered: X
L2 fixed: X
L2 remaining: X

L3 discovered: X
L3 fixed: X
L3 remaining: X

Keyboard navigation: PASS/FAIL
Focus management: PASS/FAIL
Screen reader: PASS/FAIL
Contrast: PASS/FAIL
Zoom: PASS/FAIL
Forms: PASS/FAIL
Dialogs: PASS/FAIL
Tables: PASS/FAIL
Charts: PASS/FAIL
Games: PASS/FAIL
Memory: PASS/FAIL
Reminders: PASS/FAIL
Community: PASS/FAIL
Meetings: PASS/FAIL
AI: PASS/FAIL
Safety: PASS/FAIL
SOS: PASS/FAIL
Caregiver: PASS/FAIL
Admin: PASS/FAIL

English: PASS/FAIL
Hindi: PASS/FAIL/NOT SUPPORTED
Other configured languages: PASS/FAIL/NOT SUPPORTED
Language switching: PASS/FAIL
Fallback: PASS/FAIL
Pluralization: PASS/FAIL
Date formatting: PASS/FAIL
Number formatting: PASS/FAIL
Text expansion: PASS/FAIL
Missing translation handling: PASS/FAIL

Regression tests: PASS/FAIL
Lint: PASS/FAIL
Build: PASS/FAIL
Browser: PASS/FAIL

Production blocker: YES/NO
```

Do not claim PASS unless verified.

---

# 113. STOP CONDITION

After F16:

**STOP.**

Do not implement F17 automatically.

F17 is:

```text
Frontend Testing & Hardening
```

Before F17 begins, use the F16 report to identify remaining accessibility/localization issues and regression risks.

---

# FINAL PRINCIPLE

F16 is about making Memora usable, understandable, and inclusive.

The target is:

```text
              MEMORA
                 │
        ┌────────┴────────┐
        ↓                 ↓
 Accessibility       Localization
        │                 │
        ↓                 ↓
 Keyboard            Languages
 Screen Reader       Translation
 Focus               Formatting
 Contrast            Fallback
 Cognitive Load      Text Expansion
        │                 │
        └────────┬────────┘
                 ↓
          Accessible UX
                 ↓
       Tested Real Workflows
```

Do not treat accessibility as a decorative layer.

Do not treat localization as a language dropdown.

Both must work across the actual Memora workflows.

Never break security to improve accessibility.

Never expose sensitive data through accessibility labels, logs, translated strings, URLs, or error messages.

Never hardcode user-facing strings when localization is required.

Never claim a language is supported without actual translations.

Never claim accessibility compliance without meaningful manual testing.

**F16 is complete when the existing Memora application can be operated through its major workflows by keyboard and assistive technology, remains understandable at enlarged text sizes, provides appropriate accessible feedback, and correctly supports the languages actually configured by the project.**
