# Memora - Phase F1 Prompt: Design System & Elder-Friendly UI

**Phase:** F1  
**Name:** Design System + Elder-Friendly UI  
**Prerequisites:** F0 completed and verified  
**Status:** Ready for implementation

---

# OBJECTIVE

Build the visual design system and reusable elder-friendly UI foundation for the Memora web application.

F1 is primarily a **UI/design-system phase**.

The objective is to establish a consistent visual language that future feature phases can use without independently inventing layouts, buttons, colors, typography, cards, navigation, forms, accessibility behavior, or responsive patterns.

Core principle:

```text
Simple
Readable
Calm
Accessible
Consistent
Low cognitive load
```

The interface is intended to support elderly users, including users who may have difficulty with:

```text
Small text
Dense layouts
Complex navigation
Long instructions
Low contrast
Small touch targets
Rapid animations
```

Do not build the complete Games, Memories, Reminders, Community, Meeting, AI, Notification, Safety, Caregiver, or Admin feature functionality in F1.

---

# 1. READ FIRST

Before changing anything, read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/B14_INTEGRATION_REPORT.md
docs/FRONTEND_ARCHITECTURE.md
docs/FRONTEND_API_CONTRACT.md
docs/F0_FRONTEND_FOUNDATION_REPORT.md
```

Then inspect the actual F0 implementation.

Especially inspect:

```text
Frontend framework
Routing
API client
State management
Existing components
Existing styles
Existing layouts
Existing localization setup
Existing tests
```

Do not replace working F0 architecture without a verified reason.

---

# 2. CRITICAL RULES

## Rule 1: F1 is a design-system phase

Build:

```text
Design tokens
Typography
Colors
Spacing
Buttons
Cards
Forms
Alerts
Dialogs
Navigation
Layout primitives
Accessibility patterns
Responsive patterns
Voice-friendly UI patterns
```

Do NOT fully implement feature-specific business logic.

---

## Rule 2: Reuse before creating

Before creating a component:

```text
Search existing components.
```

If an appropriate component already exists:

```text
Reuse or improve it.
```

Do not create duplicate:

```text
Button
Card
Modal
Input
PageHeader
Navigation
```

implementations.

---

## Rule 3: Do not change the backend

F1 should normally modify only:

```text
Frontend
Frontend documentation
Frontend tests
```

Do not modify B0-B14 backend logic unless a verified frontend-blocking issue exists.

If a backend issue is discovered:

1. Document it.
2. Do not silently rewrite it.
3. Make the smallest safe fix only if necessary.
4. Add a regression test.
5. Report it.

---

# 3. DESIGN PHILOSOPHY

Memora should feel:

```text
Calm
Warm
Trustworthy
Simple
Readable
Human
Accessible
```

Avoid:

```text
Visual clutter
Excessive gradients
Tiny text
Dense dashboards
Overly complex navigation
Excessive animation
Too many competing colors
Decorative elements that reduce readability
```

---

# 4. ELDER-FIRST PRINCIPLE

Design for the user who needs the interface to be obvious without explanation.

A user should be able to understand:

```text
Where am I?
What can I do?
What happened?
What should I tap?
How do I go back?
```

without studying the interface.

---

# 5. COGNITIVE LOAD

Minimize:

```text
Choices
Text
Steps
Navigation depth
Visual noise
Unexpected behavior
```

Prefer:

```text
One clear primary action
Few secondary actions
Clear labels
Predictable navigation
Consistent placement
```

---

# 6. TYPOGRAPHY

Create a centralized typography system.

Define styles for:

```text
Display
Page heading
Section heading
Card heading
Body
Large body
Label
Caption
Button
Error
Success
```

Use readable font sizes.

Do not use extremely small text for important information.

---

# 7. FONT WEIGHTS

Use a limited set of weights.

Prefer:

```text
Regular
Medium
Semibold/Bold
```

Avoid excessive font-weight variation.

---

# 8. LINE HEIGHT

Use generous line height for readability.

Long text should not feel compressed.

---

# 9. TEXT WIDTH

Avoid very long lines of text.

For content-heavy pages, use a readable maximum width.

---

# 10. COLOR SYSTEM

Create centralized design tokens.

At minimum define:

```text
Primary
Secondary
Background
Surface
Text
Muted text
Border
Success
Warning
Error
Info
Focus
Disabled
```

Do not hardcode colors throughout components.

---

# 11. COLOR ACCESSIBILITY

Do not communicate information using color alone.

Bad:

```text
Green = safe
Red = unsafe
```

without any text/icon.

Preferred:

```text
🟢 Safe
🔴 Safety Alert
```

Use:

```text
Icon + Text + Color
```

where appropriate.

---

# 12. CONTRAST

Ensure important text and controls have sufficient contrast.

Pay special attention to:

```text
Body text
Buttons
Placeholder text
Disabled states
Error messages
Safety alerts
Navigation
```

Do not use extremely light gray text for important information.

---

# 13. SAFETY COLORS

Safety states must be visually distinct but accessible.

Examples:

```text
Safe
Warning
Emergency
Resolved
```

Do not make the entire application permanently alarming.

Reserve strong visual emphasis for actual safety states.

---

# 14. SPACING SYSTEM

Create centralized spacing tokens.

Example scale:

```text
xs
sm
md
lg
xl
2xl
```

Use consistent spacing across the application.

Do not randomly use dozens of pixel values.

---

# 15. BORDER RADIUS

Create consistent radius tokens.

Use larger, friendly shapes where appropriate.

Avoid excessive rounding that reduces visual hierarchy.

---

# 16. SHADOWS

Use a restrained shadow system.

Avoid heavy shadows everywhere.

---

# 17. BUTTON SYSTEM

Create a reusable button component.

Variants may include:

```text
Primary
Secondary
Outline
Ghost
Danger
Success
```

Only implement variants that are genuinely needed.

---

# 18. LARGE BUTTONS

Primary elderly-facing controls should have generous touch/click areas.

Prefer:

```text
Large label
Large icon
Clear spacing
```

Avoid tiny clickable controls.

---

# 19. BUTTON STATES

Every reusable button should support:

```text
Default
Hover
Focus
Active
Disabled
Loading
```

Do not make loading buttons clickable repeatedly.

---

# 20. PRIMARY ACTION

Pages should have a visually obvious primary action.

Example:

```text
Save Memory
```

rather than several equally prominent buttons.

---

# 21. ICONS

Use icons consistently.

Do not use an icon without a label for important actions unless the meaning is universally clear.

Especially for elderly users, prefer:

```text
Icon + Label
```

over:

```text
Icon only
```

---

# 22. ICON LIBRARY

Use one consistent icon library if the project already has one.

Do not mix multiple icon systems unnecessarily.

---

# 23. CARDS

Create a reusable card component.

Cards should support:

```text
Title
Description
Metadata
Icon/image
Primary action
Secondary action
Status
```

Do not overload cards with too many controls.

---

# 24. ALERTS

Create reusable:

```text
Success
Info
Warning
Error
Safety
```

alert patterns.

Use clear language.

---

# 25. SAFETY ALERT

Safety alerts should be unmistakable.

Example:

```text
🚨 Safety Alert

A safety event needs attention.

[ View Safety Event ]
```

Do not hide safety information in subtle toast notifications.

---

# 26. TOASTS

Use toast notifications for:

```text
Minor success
Background updates
Non-critical information
```

Do not rely on toasts for critical safety information.

---

# 27. MODALS / DIALOGS

Create a reusable dialog.

Use dialogs for:

```text
Confirmation
Important warnings
Short forms
```

Do not put long complex workflows into modals.

---

# 28. CONFIRMATION DIALOGS

Use clear actions:

```text
Cancel
Confirm
```

Avoid confusing labels such as:

```text
Continue
Proceed
Okay
```

when the action is destructive or important.

---

# 29. DESTRUCTIVE ACTIONS

For actions such as deleting a memory:

```text
Delete Memory?

This cannot be undone.

[ Cancel ]
[ Delete ]
```

Do not hide the consequence.

---

# 30. INPUT COMPONENTS

Create reusable:

```text
TextInput
Textarea
Select
Checkbox
Radio
Switch
DateInput
TimeInput
```

only as needed.

---

# 31. INPUT LABELS

Every important input must have a visible or properly accessible label.

Do not rely only on placeholders.

Bad:

```text
[ Enter your name... ]
```

Preferred:

```text
Name
[ Enter your name ]
```

---

# 32. FORM ERRORS

Display errors close to the relevant field.

Use simple language.

Example:

```text
Please enter your name.
```

Avoid:

```text
ValidationError: name must satisfy schema.
```

---

# 33. FORM SUCCESS

After successful actions provide clear feedback.

Do not leave the user wondering whether the action worked.

---

# 34. NAVIGATION

Create a consistent navigation system.

Patient navigation should remain simple.

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
```

Use the actual feature set defined by the project.

---

# 35. NAVIGATION DEPTH

Avoid deep navigation trees.

Prefer:

```text
Home
 ↓
Feature
 ↓
Details
```

rather than:

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

# 36. BREADCRUMBS

Use breadcrumbs primarily for:

```text
Admin
Caregiver
Content management
```

if the hierarchy is genuinely complex.

Do not add breadcrumbs everywhere.

---

# 37. PAGE HEADER

Create a reusable page-header pattern:

```text
Page title
Short description
Primary action
```

Keep it consistent.

---

# 38. DASHBOARD FOUNDATION

Create reusable dashboard layout primitives.

Do not implement the full patient/caregiver/admin dashboards yet.

Provide:

```text
Page shell
Content grid
Section
Card grid
Responsive layout
```

---

# 39. RESPONSIVE DESIGN

The web application must adapt to:

```text
Desktop
Tablet
Mobile browser
```

Do not simply shrink desktop layouts.

Reflow content appropriately.

---

# 40. MOBILE BROWSER

Ensure important actions remain usable on smaller screens.

Especially:

```text
SOS
Navigation
Forms
Cards
Buttons
Dialogs
```

---

# 41. TOUCH-FRIENDLY WEB

Even though this is a web application, support touch interaction.

Avoid controls that are difficult to tap.

---

# 42. KEYBOARD ACCESSIBILITY

Every interactive element must be keyboard accessible.

Test:

```text
Tab
Shift+Tab
Enter
Space
Escape
Arrow keys where appropriate
```

---

# 43. FOCUS STATES

Never remove focus indicators without providing an accessible replacement.

Focus must be visible.

---

# 44. SCREEN READERS

Use semantic elements:

```text
button
nav
main
header
section
form
label
```

Use ARIA only where necessary.

---

# 45. HEADING HIERARCHY

Maintain logical heading order.

Prefer:

```text
h1
  h2
    h3
```

Avoid arbitrary heading levels purely for styling.

---

# 46. ALT TEXT

Images that communicate information need useful alt text.

Decorative images should be marked appropriately.

---

# 47. LINK VS BUTTON

Use:

```text
Link → navigation
Button → action
```

Do not use clickable `<div>` elements for normal actions.

---

# 48. REDUCED MOTION

Respect user preferences for reduced motion where possible.

Avoid excessive animations.

---

# 49. ANIMATION

Animations should communicate:

```text
State change
Navigation
Feedback
Loading
```

Do not animate purely for decoration.

Keep animations short and predictable.

---

# 50. LOADING SKELETONS

Create a reusable skeleton/loading pattern where appropriate.

Avoid flashing large empty layouts.

---

# 51. EMPTY STATES

Create reusable empty states.

Example:

```text
🧠
No memories yet.

You can add your first memory here.

[ Add Memory ]
```

Keep the language simple.

---

# 52. ERROR STATES

Create reusable error states.

Example:

```text
We couldn't load this information.

[ Try Again ]
```

Do not expose backend implementation details.

---

# 53. OFFLINE STATE

Create a consistent offline indicator.

Example:

```text
You are offline.
Some information may be unavailable.
```

Do not overwhelm the patient.

---

# 54. VOICE-FRIENDLY UI

Prepare components that can later support voice interaction.

Examples:

```text
VoiceButton
VoiceStatus
SpeakResponse
```

Do not build the complete AI voice system in F1.

---

# 55. LANGUAGE SUPPORT

The design system must work with longer translated text.

Do not create fixed-width buttons that break when a translation is longer.

---

# 56. REGIONAL LANGUAGE SUPPORT

Continue the localization architecture established in F0.

Do not hardcode feature text in components if the project has localization enabled.

Example:

```text
t("common.save")
```

instead of:

```text
"Save"
```

---

# 57. FONT / SCRIPT COMPATIBILITY

Ensure typography works with supported regional languages, including Hindi if configured by the project.

Do not assume every font supports every script.

---

# 58. DATA DISPLAY

Create reusable patterns for:

```text
Status
Date
Time
Person
Count
Progress
```

Keep information easy to scan.

---

# 59. STATUS BADGES

Create a reusable status badge.

Examples:

```text
Active
Pending
Scheduled
Completed
Resolved
Cancelled
```

Use the actual backend enum values.

Do not invent conflicting status names.

---

# 60. PROGRESS INDICATORS

Create reusable progress patterns for future:

```text
Game progress
Activity
Reminder completion
Community participation
```

Do not imply medical progress unless the backend explicitly provides a safe, approved metric.

---

# 61. AVATAR / PERSON COMPONENT

Create a reusable person representation for:

```text
User
Caregiver
Doctor
Guest
Host
```

where needed.

Do not expose unauthorized personal information.

---

# 62. IMAGE HANDLING

Create consistent image behavior:

```text
Loading
Error
Fallback
Alt text
Aspect ratio
```

Do not let broken images destroy layout.

---

# 63. FILE / MEDIA PREVIEW

If the existing backend supports media:

Prepare reusable UI patterns for:

```text
Image
Video
PDF
```

but do not build full feature-specific media workflows in F1.

---

# 64. ACCESSIBLE ERROR ANNOUNCEMENTS

Important validation/errors should be announced appropriately to assistive technologies.

Use semantic status/alert mechanisms where appropriate.

---

# 65. FORM FOCUS MANAGEMENT

When a form submission fails:

```text
Focus
 ↓
Relevant error / first invalid field
```

where appropriate.

---

# 66. MODAL FOCUS MANAGEMENT

Dialogs should:

```text
Receive focus
Trap focus appropriately
Return focus when closed
```

Use a tested dialog implementation where possible.

---

# 67. SKIP NAVIGATION

Consider a skip-to-content mechanism for keyboard users.

---

# 68. GLOBAL LAYOUT

Create a consistent application shell:

```text
Header
Navigation
Main content
Optional footer
```

Do not force identical navigation on every role if roles have different needs.

---

# 69. PATIENT LAYOUT

The patient layout should prioritize:

```text
Large controls
Simple navigation
Clear primary actions
Low cognitive load
```

---

# 70. CAREGIVER LAYOUT

Caregiver interfaces can contain more information but must remain organized.

Potential:

```text
Patients
Safety
Notifications
Activity
```

---

# 71. ADMIN LAYOUT

Admin interfaces may be information-dense but should still use:

```text
Clear sections
Tables
Filters
Search
Consistent actions
```

Do not optimize the admin interface at the expense of patient simplicity.

---

# 72. ROLE-SPECIFIC VISUAL LANGUAGE

Use one Memora design system across roles.

Do not create completely unrelated visual systems for:

```text
Patient
Caregiver
Admin
```

---

# 73. TABLE FOUNDATION

Admin/caregiver pages may need tables.

Create a reusable table foundation supporting:

```text
Header
Rows
Loading
Empty
Error
Pagination
Responsive behavior
```

Do not implement feature-specific tables yet.

---

# 74. SEARCH FOUNDATION

Create a reusable search input pattern if required.

Support:

```text
Label
Clear
Loading
No results
Error
```

Do not implement backend search logic in F1.

---

# 75. PAGINATION FOUNDATION

Create UI primitives for pagination if required by existing APIs.

Do not invent pagination parameters that the backend does not support.

---

# 76. FILTER FOUNDATION

Prepare reusable filter controls.

Do not build feature-specific filtering logic yet.

---

# 77. DATE PICKER FOUNDATION

If the application requires date selection, use an accessible date picker.

Do not build a custom calendar unless necessary.

---

# 78. TIME INPUT FOUNDATION

Ensure time inputs work clearly for elderly users.

Avoid overly compact time selectors.

---

# 79. NOTIFICATION UI FOUNDATION

Create reusable visual patterns for:

```text
Notification item
Unread state
Notification badge
Notification panel
```

Do not implement B9 business logic here.

---

# 80. SAFETY UI FOUNDATION

Create reusable visual primitives for:

```text
Safety status
Warning
Emergency
Resolved
```

Do not implement B12 logic.

---

# 81. SOS UI FOUNDATION

You may create a reusable visual SOS button/pattern, but do not implement the complete B12 SOS flow in F1.

The future component should support:

```text
Large
Highly visible
Accessible
Clear label
Loading state
Disabled state
Confirmation
```

---

# 82. AI UI FOUNDATION

Create only reusable visual primitives for future B11 UI:

```text
Chat message
Assistant avatar
Voice button
Typing/loading state
Error state
```

Do not build complete AI functionality.

---

# 83. GAME UI FOUNDATION

Create only generic reusable UI primitives where useful:

```text
Progress
Score
Timer
Game card
```

Do not implement actual game flows in F1.

---

# 84. MEMORY UI FOUNDATION

Create generic patterns for:

```text
Content card
Image card
Metadata
Tag
```

Do not implement memory CRUD in F1.

---

# 85. REMINDER UI FOUNDATION

Create generic:

```text
Reminder card
Status badge
Date/time display
```

Do not implement reminder scheduling logic.

---

# 86. COMMUNITY UI FOUNDATION

Create generic:

```text
Session card
Vote button
Schedule badge
Registration badge
```

Do not implement voting/scheduling business logic.

---

# 87. MEETING UI FOUNDATION

Create generic:

```text
Meeting card
Host/guest display
Date/time
Join button
Status
```

Do not implement meeting provider integration.

---

# 88. DESIGN TOKEN IMPLEMENTATION

Centralize tokens instead of hardcoding values.

Potential token categories:

```text
--color-*
--space-*
--radius-*
--shadow-*
--font-*
--breakpoint-*
```

Use the project's actual styling system.

---

# 89. TAILWIND / DAISYUI

If the existing project uses Tailwind CSS/DaisyUI:

- Extend the existing configuration.
- Establish Memora-specific tokens/theme.
- Avoid fighting the framework with large amounts of custom CSS.
- Reuse existing utilities/components where appropriate.

Do not introduce a second styling framework.

---

# 90. COMPONENT API DESIGN

Reusable components should have simple predictable APIs.

Avoid components with dozens of unrelated props.

Prefer composable components.

---

# 91. COMPONENT STATES

For reusable components, explicitly consider:

```text
Default
Loading
Disabled
Error
Empty
Success
Focus
Responsive
```

---

# 92. COMPONENT DOCUMENTATION

Document important reusable components.

For each major component explain:

```text
Purpose
Props/API
States
Accessibility
Example usage
```

Do not create excessive documentation for trivial components.

---

# 93. DESIGN SYSTEM DEMO PAGE

Create a development-only design-system showcase if appropriate.

Include:

```text
Typography
Colors
Buttons
Inputs
Cards
Alerts
Badges
Dialogs
Navigation
Loading
Empty
Error
Accessibility examples
```

Do not expose development-only controls in production.

---

# 94. ACCESSIBILITY TESTING

Test:

```text
Keyboard navigation
Screen reader labels
Focus visibility
Color contrast
Large text
Reduced motion
Form errors
Dialogs
```

---

# 95. RESPONSIVE TESTING

Check:

```text
Desktop
Tablet
Mobile browser
```

at reasonable viewport sizes.

---

# 96. BROWSER TESTING

Check at least the browsers supported by the project.

If no browser matrix exists, document the browsers tested.

---

# 97. PERFORMANCE

Avoid making the design system heavy.

Check:

```text
Bundle impact
Large icon packages
Unused CSS
Large image assets
Unnecessary dependencies
```

---

# 98. NO UNNECESSARY DEPENDENCIES

Before adding a package:

1. Check whether the project already has an equivalent.
2. Check whether the browser/framework can handle it.
3. Add only if justified.

---

# 99. TESTING

Add tests for reusable components.

At minimum test:

```text
Button
Input
Card
Dialog
Navigation
Alert
Status badge
Protected layout integration
```

Use the project's existing testing tools.

---

# 100. VISUAL REGRESSION

If the project already supports visual regression testing, add relevant design-system coverage.

Do not introduce a large new visual-testing system solely for F1 unless justified.

---

# 101. ACCESSIBILITY REGRESSION

Make accessibility checks part of the frontend workflow where practical.

---

# 102. FRONTEND DOCUMENTATION

Create/update:

```text
docs/DESIGN_SYSTEM.md
```

Document:

```text
Design philosophy
Typography
Colors
Spacing
Buttons
Forms
Cards
Navigation
Accessibility
Responsive behavior
Localization considerations
Component conventions
```

---

# 103. CLAUDE DEVELOPMENT RULES

Update `CLAUDE.md` with F1 conventions where appropriate.

Future Claude sessions should:

```text
Read DESIGN_SYSTEM.md
Reuse existing components
Use existing design tokens
Avoid duplicate components
Follow accessibility rules
Follow localization rules
Run tests
Run lint
Run build
```

---

# 104. MULTI-DEVELOPER RULE

Future developers must not independently create:

```text
New button style
New card style
New alert style
New spacing system
New typography scale
New color palette
```

without first checking the existing design system.

This is essential because multiple developers will work on F2+.

---

# 105. NO FEATURE LOGIC

F1 should not contain business logic such as:

```text
if patient can access memory
if user can vote
if caregiver owns patient
if SOS should escalate
if AI should access memory
```

Those decisions belong to backend/API logic.

---

# 106. FRONTEND SECURITY

Do not treat UI hiding as authorization.

Example:

```text
Admin button hidden
```

does NOT mean:

```text
User cannot call admin API
```

Backend authorization remains authoritative.

---

# 107. NO SENSITIVE DATA IN DESIGN DEMO

The design-system demo must use:

```text
Synthetic data
```

Never use real patient:

```text
Memories
Locations
Safety events
Medical information
```

---

# 108. GIT SAFETY

Before modifying:

```bash
git status
```

Do not use destructive commands:

```bash
git reset --hard
git clean -fd
```

Do not overwrite another developer's work.

---

# 109. DEFINITION OF DONE

F1 is complete only when:

[ ] F0 architecture inspected  
[ ] Existing components inspected  
[ ] Design philosophy documented  
[ ] Typography system established  
[ ] Color tokens established  
[ ] Spacing system established  
[ ] Radius system established  
[ ] Shadow system established  
[ ] Button system implemented  
[ ] Button states implemented  
[ ] Icon convention established  
[ ] Card system implemented  
[ ] Alert system implemented  
[ ] Toast pattern implemented where appropriate  
[ ] Dialog foundation implemented  
[ ] Input foundation implemented  
[ ] Form error pattern implemented  
[ ] Page header implemented  
[ ] Navigation foundation implemented  
[ ] Layout primitives implemented  
[ ] Patient layout foundation implemented  
[ ] Caregiver layout foundation implemented if required  
[ ] Admin layout foundation implemented if required  
[ ] Responsive behavior implemented  
[ ] Mobile-browser usability checked  
[ ] Keyboard accessibility checked  
[ ] Focus states implemented  
[ ] Screen-reader semantics checked  
[ ] Heading hierarchy checked  
[ ] Image/alt-text conventions established  
[ ] Reduced-motion consideration implemented  
[ ] Localization compatibility verified  
[ ] Regional-language typography checked  
[ ] Loading state foundation implemented  
[ ] Empty state foundation implemented  
[ ] Error state foundation implemented  
[ ] Offline state foundation implemented  
[ ] Status badge implemented  
[ ] Progress foundation implemented  
[ ] Table foundation implemented if required  
[ ] Search foundation implemented if required  
[ ] Pagination foundation implemented if required  
[ ] Notification UI primitives implemented  
[ ] Safety UI primitives implemented  
[ ] SOS visual component foundation implemented  
[ ] AI UI primitives implemented  
[ ] Game UI primitives implemented where useful  
[ ] Memory UI primitives implemented where useful  
[ ] Reminder UI primitives implemented where useful  
[ ] Community UI primitives implemented where useful  
[ ] Meeting UI primitives implemented where useful  
[ ] Design tokens centralized  
[ ] No duplicate styling framework introduced  
[ ] Design-system demo created if appropriate  
[ ] Component tests added  
[ ] Accessibility tests performed  
[ ] Responsive testing performed  
[ ] Browser testing performed  
[ ] Build passes  
[ ] Lint passes  
[ ] Tests pass  
[ ] Documentation updated  
[ ] No backend duplication  
[ ] No new major feature logic  
[ ] No secrets committed  
[ ] No real patient data used in demos  

---

# 110. FINAL REPORT

Create:

```text
docs/F1_DESIGN_SYSTEM_REPORT.md
```

Use:

```text
# Memora F1 Design System Report

## Design Philosophy

## Frontend Stack

## Design Tokens

## Typography

## Color System

## Spacing

## Components

## Buttons

## Cards

## Forms

## Alerts

## Dialogs

## Navigation

## Layouts

## Patient UI Foundation

## Caregiver UI Foundation

## Admin UI Foundation

## Accessibility

## Responsive Design

## Localization

## Voice-Friendly Foundation

## Safety UI Foundation

## AI UI Foundation

## Design-System Demo

## Files Created

## Files Modified

## Tests

## Lint Result

## Build Result

## Browser Testing

## Accessibility Testing

## Known Issues

## Recommendations for F2
```

---

# 111. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
Test result
Lint result
Build result
Development server result
Browser testing result
Accessibility testing result
```

Do not claim success unless verified.

---

# 112. STOP CONDITION

After F1 is complete:

**STOP.**

Do not implement F2 automatically.

Do not build the complete patient dashboard.

Do not implement Games, Memories, Reminders, Community, Meeting Circle, AI, Notifications, Safety, Caregiver, or Admin feature logic.

The next phase is:

```text
F2
Authentication + Role-Based Application UI
```

F2 will build the actual authentication experience and role-aware application shell on top of F0 and F1.

---

# FINAL PRINCIPLE

The F1 goal is:

```text
One Memora
One visual language
One component system
One accessibility standard
One responsive system
```

so that future developers can build:

```text
Games
Memories
Reminders
Community
Meeting Circle
AI
Notifications
Safety
Caregiver
Admin
```

without creating different visual systems for every feature.

Build the foundation once. Reuse it everywhere.
