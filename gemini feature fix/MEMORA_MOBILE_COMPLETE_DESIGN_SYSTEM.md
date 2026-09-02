# MEMORA MOBILE UI - COMPLETE DESIGN SYSTEM & VISUAL MIGRATION

## Objective

Apply the approved Memora design across the **entire mobile application**.

The goal is not simply to recolor existing screens. Every active mobile screen and reusable component must visually follow one consistent Memora design system:

- Premium
- Modern
- Calm
- Dark
- Accessible
- Warm
- Trustworthy
- Patient-friendly

The final app must feel like one professionally designed patient and caregiver companion.

---

# 1. CRITICAL RULES

This is a frontend UI/UX task.

DO NOT change:

- backend logic
- database schemas
- API contracts
- authentication logic
- Gemini/AI logic
- AI Agent logic
- reminder logic
- memory logic
- routine logic
- notification logic
- geofencing logic
- SOS logic
- caregiver permissions
- admin permissions

DO NOT remove existing features.

DO NOT add unrelated features.

Preserve existing behavior and data.

The following are NOT sufficient by themselves:

- changing colors
- changing fonts
- adding border-radius
- adding shadows

The actual visual system, component styling, spacing, hierarchy, and responsive behavior must be unified.

---

# 2. DESIGN SOURCE OF TRUTH

Use the currently approved/new Memora design as the source of truth.

The visual language should be:

```text
Dark charcoal background
+
Deep navy surfaces
+
Warm gold primary accent
+
Purple/indigo secondary accent
+
Teal/green positive accent
+
Soft blue/lavender informational accents
+
Modern geometric sans-serif typography
+
Large clean headings
+
Rounded premium cards
+
Subtle borders
+
Minimal shadows
+
Generous spacing
+
Clear hierarchy
```

Do not invent a separate visual identity for individual screens.

---

# 3. GLOBAL COLOR SYSTEM

Create or standardize centralized theme tokens.

Use approximately:

```text
APP BACKGROUND       #121212
PRIMARY SURFACE      #0F172A
ELEVATED SURFACE     #151B2B
SECONDARY SURFACE    #1A1A1A

MEMORA GOLD          #F4C542
GOLD HIGHLIGHT       #FFD75A

INDIGO               #6366F1
LIGHT INDIGO         #818CF8
TEAL                 #14B8A6
GREEN                #10B981
LAVENDER             #A78BFA
BLUE                 #60A5FA

PRIMARY TEXT         #F8FAFC
SECONDARY TEXT       #CBD5E1
MUTED TEXT           #94A3B8
BORDER               #27324A

DANGER               #EF4444
WARNING              #F59E0B
SUCCESS              #10B981
```

Adapt exact values if the existing approved Memora design already defines them.

Do not scatter raw colors throughout components.

Prefer centralized tokens such as:

```text
memora-bg
memora-surface
memora-surface-elevated
memora-primary
memora-secondary
memora-success
memora-warning
memora-danger
memora-text
memora-text-muted
memora-border
```

---

# 4. COLOR USAGE

Use accents intentionally.

### Gold

Use for:

- primary CTA
- selected/high-priority actions
- brand highlights
- important metrics
- selected navigation state

Do NOT make the entire application yellow.

### Purple / Indigo

Use primarily for:

- AI
- cognitive activity
- analytics
- progress
- secondary emphasis

### Teal / Green

Use for:

- safe status
- completed status
- successful actions
- positive states

### Red

Use only for:

- SOS
- danger
- destructive actions
- critical safety states

---

# 5. BACKGROUND LAYERS

Use layered dark surfaces instead of one flat background:

```text
App Background
    ↓
Page Surface
    ↓
Card Surface
    ↓
Elevated Card / Modal
```

The surfaces should have enough contrast to create hierarchy without looking harsh.

---

# 6. TYPOGRAPHY

Use a modern sans-serif font.

Preferred:

```text
Montserrat
```

or the closest modern geometric sans-serif already configured in the project.

Do NOT use:

- Times New Roman
- Georgia
- browser-default serif fonts
- random font families

Use a consistent hierarchy:

```text
Display     32-36px / bold
H1          28-32px / 700
H2          22-26px / 700
H3          18-20px / 700
Body        15-16px / 400-500
Small       13-14px
Caption     11-12px
Button      14-15px / 600-700
```

Use the existing project's equivalent tokens if they already exist.

---

# 7. TYPOGRAPHY STYLE

Headings should feel:

- bold
- clean
- modern
- confident

Body text should be:

- readable
- calm
- comfortable

Avoid excessive uppercase text.

Use uppercase mainly for small category/status labels.

---

# 8. SPACING SYSTEM

Standardize spacing.

Prefer:

```text
4
8
12
16
20
24
32
40
48
64
```

Use the project's existing spacing tokens where available.

Do not use random margins and padding throughout the application.

---

# 9. MOBILE PAGE PADDING

Use approximately:

```text
16-20px horizontal padding
```

depending on viewport.

Content should not touch screen edges unless intentionally full-bleed.

---

# 10. BORDER RADIUS

Use a consistent radius system.

Recommended:

```text
Small elements: 8px
Inputs:          10-12px
Cards:           18-22px
Hero sections:   24-28px
Modals:          24px+
```

Keep the design premium and structured, not excessively rounded.

---

# 11. BORDERS AND SHADOWS

Use subtle borders.

Avoid heavy outlines.

Use shadows sparingly.

The dark theme should rely mainly on:

```text
surface contrast
+
subtle borders
+
light elevation
```

Do not introduce neon/glowing effects everywhere.

---

# 12. GLOBAL MOBILE APP SHELL

Every screen should use one consistent shell:

```text
┌───────────────────────────────┐
│ Header                        │
├───────────────────────────────┤
│                               │
│         PAGE CONTENT          │
│                               │
│                               │
├───────────────────────────────┤
│ Mobile Navigation             │
└───────────────────────────────┘
```

Do not let individual screens create unrelated shells.

---

# 13. MOBILE HEADER

Use a compact modern header.

Example:

```text
┌───────────────────────────────┐
│ ☰   Memora             🔔     │
└───────────────────────────────┘
```

Adapt this to the existing navigation architecture.

Header can contain:

- menu/back
- Memora identity
- page title when appropriate
- notification
- profile

Keep it visually clean.

---

# 14. MOBILE NAVIGATION

Never squeeze desktop navigation into mobile.

Do NOT use:

```text
AI Assistant | Progress | Reminders | Memories | Community | Safety
```

as a tiny horizontal row.

Use an intentional mobile pattern:

```text
Bottom Navigation
```

and/or:

```text
Compact Header + Drawer
```

according to the existing architecture.

Active navigation:

```text
Memora gold accent
+
clear active background/pill
+
accent icon
```

Inactive items should be muted.

---

# 15. GLOBAL PAGE STRUCTURE

Use a consistent structure:

```text
App Shell
 ↓
Page Header / Hero
 ↓
Primary Controls
 ↓
Main Content
 ↓
Supporting Content
```

Every page should have deliberate spacing and hierarchy.

---

# 16. HERO SECTIONS

Use premium hero surfaces:

```text
┌───────────────────────────────┐
│ CATEGORY                      │
│                               │
│ Large Page Heading            │
│ Description                   │
│                               │
│ Actions / controls            │
└───────────────────────────────┘
```

Use deep navy, subtle border, generous padding, and rounded corners.

---

# 17. GLOBAL CARD SYSTEM

All cards should feel related:

```text
Memory Card
Reminder Card
Routine Card
Progress Card
Safety Card
Notification Card
AI Card
Community Card
Profile Card
```

Shared card characteristics:

- same radius family
- same padding system
- same border treatment
- same typography hierarchy
- same elevation

Use variants instead of creating unrelated card systems.

---

# 18. STAT CARDS

Use:

```text
Icon / Category
       ↓
Primary metric
       ↓
Supporting information
       ↓
Progress/action
```

Example:

```text
┌─────────────────────────┐
│ ICON   ROUTINE          │
│                         │
│ 85%                     │
│ 17 of 20 completed      │
│                         │
│ ───────────────────     │
└─────────────────────────┘
```

Do not overcrowd cards.

---

# 19. BUTTON SYSTEM

Create/use one global button system.

Variants:

```text
Primary
Secondary
Outline
Ghost
Danger
Success
Icon
Large Patient Action
```

Primary:

```text
Gold background
Dark text
```

Secondary:

```text
Elevated dark surface
Light text
Subtle border
```

Buttons must have consistent:

- height
- padding
- radius
- font
- icon size
- states

No browser-default gray buttons.

---

# 20. BUTTON STATES

Implement:

```text
Default
Pressed
Focused
Disabled
Loading
```

Keep layout stable between states.

---

# 21. INPUT SYSTEM

Use:

```text
Dark surface
Subtle border
Light text
Muted placeholder
Gold/indigo focus
```

Structure:

```text
LABEL

┌───────────────────────────────┐
│ Enter text...                 │
└───────────────────────────────┘

Helper/error text
```

---

# 22. SELECTS / DROPDOWNS

Modernize browser-default controls while maintaining accessibility.

Use the same:

```text
surface
border
radius
font
focus
```

system.

---

# 23. TOGGLES

Modernize switches for:

- voice
- notifications
- settings
- preferences

The state must be understandable without relying only on color.

---

# 24. MODALS

Use one global modal design:

```text
┌───────────────────────────────┐
│ Title                     ×   │
│ Description                   │
│                               │
│ Content                       │
│                               │
│ Cancel       Primary          │
└───────────────────────────────┘
```

Use elevated dark surface, backdrop, consistent padding, and rounded corners.

Long forms should use an appropriate full-screen/bottom-sheet mobile presentation.

---

# 25. BOTTOM SHEETS

Where appropriate:

```text
Rounded top corners
Dark elevated surface
Close/drag affordance
Safe-area bottom padding
```

Do not allow content to hide behind navigation.

---

# 26. TOASTS / ALERTS

Use compact modern feedback:

```text
✓ Reminder created
```

```text
! Unable to save memory
```

Avoid browser-default alerts.

---

# 27. AI COMPANION

AI is a flagship experience.

Use:

```text
AI Header
 ↓
Conversation
 ↓
Voice Interaction
 ↓
Quick Actions
 ↓
Context Cards
```

Use purple/indigo as the AI accent while retaining the global Memora base.

---

# 28. AI CHAT

Use actual conversation bubbles.

Patient:

```text
┌──────────────────────┐
│ What is my routine   │
│ today?               │
└──────────────────────┘
```

Memora:

```text
┌────────────────────────────┐
│ You have a morning walk    │
│ at 10:00 AM.               │
└────────────────────────────┘
```

Do not display raw paragraphs as chat.

---

# 29. AI VOICE STATES

Clearly distinguish:

```text
READY
LISTENING
PROCESSING
SPEAKING
ERROR
```

The microphone should be the primary interaction.

Recommended hierarchy:

```text
Status
  ↓
Large microphone
  ↓
"Tap to speak"
```

---

# 30. AI QUICK ACTIONS

Use modern chips/cards:

```text
What do I do today?
My reminders
Tell me about my family
Tell me a story
```

They must wrap correctly on small screens.

---

# 31. REMINDERS

Structure:

```text
Page Header
 ↓
Today
 ↓
Upcoming
 ↓
Reminder Cards
```

Card:

```text
┌────────────────────────────┐
│ 🕐  Turn off the stove     │
│                            │
│     In 15 minutes          │
│                            │
│     Active                 │
└────────────────────────────┘
```

AI-created and manually-created reminders must use the same card component.

---

# 32. MEMORIES

Memory cards should feel personal and warm.

Use:

```text
Image
Title
Short description
Date/category
```

Example:

```text
┌────────────────────────────┐
│                            │
│          IMAGE             │
│                            │
├────────────────────────────┤
│ Family Picnic              │
│ Sunday afternoon...        │
│ Memories                   │
└────────────────────────────┘
```

Do not make memories look like generic admin records.

---

# 33. IMAGE PRESENTATION

Use consistent:

- aspect ratio
- object-fit
- radius
- loading state
- fallback

Images must not overflow cards.

---

# 34. ROUTINES

Use a calm timeline/card system.

Example:

```text
TODAY

● 8:00 AM
  Breakfast

● 10:00 AM
  Morning Walk

● 1:00 PM
  Lunch
```

Use:

```text
✓ = completed
○ = upcoming
accent = current
```

---

# 35. PROGRESS

Use:

```text
Progress Header
 ↓
Period selector
 ↓
Key metrics
 ↓
Chart/visualization
 ↓
Insights
 ↓
History
```

Use:

```text
Purple/indigo = cognitive analytics
Gold = important completion metrics
Teal/green = positive completion
```

---

# 36. COMMUNITY

Use modern cards:

```text
Avatar
Name
Time
Content
Actions
```

Avoid old forum/table layouts.

---

# 37. NOTIFICATIONS

Use:

```text
Unread
Read
Important
```

with subtle visual differentiation.

Unread indicators should be obvious but not overwhelming.

---

# 38. SAFETY

Safety requires strong visual hierarchy.

Example:

```text
┌─────────────────────────────┐
│ SAFE                        │
│                             │
│ Home Safe Zone              │
│ Patient is inside the zone. │
└─────────────────────────────┘
```

Use:

```text
Green/teal = safe
Amber = warning
Red = danger
```

---

# 39. SOS

SOS must remain highly visible.

Use a dedicated emergency section.

Example:

```text
┌─────────────────────────────┐
│ EMERGENCY                   │
│                             │
│          [ SOS ]            │
│                             │
│ Get immediate help          │
└─────────────────────────────┘
```

Use red only for emergency/destructive states.

Do not make SOS look like an ordinary action.

---

# 40. PROFILE

Modernize:

```text
Avatar
Name
Account
Preferences
Security
Logout
```

Use grouped cards.

---

# 41. SETTINGS

Group settings:

```text
ACCOUNT
NOTIFICATIONS
ACCESSIBILITY
PRIVACY
SAFETY
PREFERENCES
```

Use consistent rows/cards.

---

# 42. LOGIN / REGISTER

Use the same Memora identity:

```text
Memora Logo
Welcome
Description
Form
Primary CTA
Secondary Action
```

Do not make authentication visually unrelated.

---

# 43. LOADING STATES

Use consistent:

```text
Skeleton
Spinner
Progress indicator
```

where appropriate.

Avoid raw "Loading..." everywhere.

---

# 44. EMPTY STATES

Use calm helpful messages.

Example:

```text
No memories yet.

Start building your memory vault.

[ Add Memory ]
```

---

# 45. ERROR STATES

Do not show technical errors to normal users:

```text
500
ECONNREFUSED
MongoError
TypeError
```

Use patient/caregiver-friendly messages.

Keep technical details in logs.

---

# 46. GLOBAL ICON SYSTEM

Use one primary icon library already present in the project.

Standardize:

- icon size
- stroke weight
- alignment
- spacing
- active/inactive states

Avoid random mixing of emoji, Unicode, SVG, and multiple icon libraries.

---

# 47. RESPONSIVE LAYOUT

Design mobile-first.

Test at:

```text
320px
360px
375px
390px
412px
430px
768px
```

At all sizes verify:

- no horizontal overflow
- no clipping
- no overlapping
- no desktop navigation squeezed into mobile
- no fixed-width cards
- no broken modals
- no tiny touch targets

Do NOT solve layout problems by blindly using:

```css
overflow-x: hidden;
```

Fix the actual layout.

---

# 48. SAFE AREA

Respect:

```text
status bar
notches
home indicators
bottom navigation
```

Use safe-area handling where required.

---

# 49. TOUCH TARGETS

Important patient-facing controls must be comfortable to tap:

- microphone
- SOS
- navigation
- reminder actions
- back
- close
- primary actions

Avoid tiny clickable areas.

---

# 50. ANIMATION

Use subtle motion only.

Recommended:

```text
150-250ms
ease-out
```

Use for:

- modal
- navigation
- button press
- page transitions
- AI listening state

Avoid constant pulsing, excessive bouncing, neon effects, and unnecessary motion.

---

# 51. LEGACY UI MIGRATION

Search the entire mobile frontend for:

```text
default browser buttons
old gray buttons
old inputs
old cards
flat panels
legacy typography
random fonts
random colors
hardcoded old colors
fixed widths
desktop navigation
inconsistent radius
inconsistent shadows
random icon libraries
old CSS classes
duplicate styles
```

Migrate them to the global Memora system.

---

# 52. FIX SHARED COMPONENTS FIRST

If the same visual problem appears across many screens, fix the shared component.

For example:

```text
20 legacy buttons
```

should become:

```text
1 shared MemoraButton
```

Do not make 20 independent CSS fixes.

---

# 53. DESIGN TOKEN ARCHITECTURE

Standardize:

```text
colors
typography
spacing
radius
shadows
breakpoints
transitions
```

Use them globally.

---

# 54. COMPONENT ARCHITECTURE

Preferred hierarchy:

```text
Theme
 ↓
Design Tokens
 ↓
Primitive Components
 ↓
Composite Components
 ↓
Layout Components
 ↓
Pages
```

Do not create page-specific duplicates when a reusable component is appropriate.

---

# 55. SCREEN-BY-SCREEN MIGRATION

Apply the design to every mobile screen, including:

```text
Splash / Launch
Login
Register
Forgot Password
Dashboard
AI Companion
Progress
Reminders
Memories
Memory Detail
Add Memory
Edit Memory
Routines
Routine Detail
Community
Notifications
Safety
Safe Zones
SOS
Profile
Settings
Caregiver screens
Admin screens if included in mobile
```

If a route exists in the mobile app, audit it.

---

# 56. COMPONENT-BY-COMPONENT MIGRATION

Audit:

```text
AppShell
Header
Navigation
BottomNavigation
Sidebar/Drawer
PageHeader
Card
Button
IconButton
Input
Select
Textarea
Checkbox
Switch
Modal
BottomSheet
Toast
Badge
Avatar
Tabs
SegmentedControl
StatCard
ProgressCard
ReminderCard
MemoryCard
RoutineCard
SafetyCard
NotificationCard
LoadingState
EmptyState
ErrorState
```

---

# 57. DO NOT LEAVE LEGACY VISUAL COMPONENTS

If a component still works but visually belongs to the old application, modernize its presentation.

Do not leave:

```text
old gray button
old rectangular card
old browser input
old header
old navigation
old modal
```

just because the functionality works.

Preserve behavior, modernize the presentation.

---

# 58. PRESERVE COMPONENT CONTRACTS

When possible, preserve existing component props/API.

Example:

```jsx
<MemoraButton
  onClick={handleSave}
  disabled={saving}
>
  Save
</MemoraButton>
```

Do not cause unnecessary page rewrites.

---

# 59. PATIENT-FRIENDLY DESIGN

The interface should be understandable without technical knowledge.

Prioritize:

```text
Clear labels
Large actions
Simple navigation
Obvious status
Minimal clutter
Predictable placement
```

Do not overcomplicate the UI.

---

# 60. DO NOT OVER-DESIGN

Target:

```text
EXPENSIVE
MODERN
CLEAN
CALM
ACCESSIBLE
CONSISTENT
```

Avoid:

```text
FLASHY
OVER-ANIMATED
CLUTTERED
GAMIFIED
```

Memora should feel like a premium care companion, not a game.

---

# 61. FUNCTIONAL REGRESSION

After visual migration, verify:

```text
Authentication
Navigation
AI chat
Voice
Memory CRUD
Image upload
Reminder CRUD
Routine completion
Progress
Community
Notifications
Safety
Geofence
SOS
Profile
Settings
```

No existing flow may be broken.

---

# 62. VISUAL QA

Inspect every screen and verify:

```text
Typography
Color
Spacing
Card hierarchy
Buttons
Icons
Navigation
Forms
Modals
Responsive behavior
Accessibility
```

Every screen should feel like part of the same application.

---

# 63. FINAL ACCEPTANCE CRITERIA

The migration is complete only when:

- [ ] Entire mobile app uses one color system.
- [ ] Entire mobile app uses one typography system.
- [ ] Entire mobile app uses one spacing system.
- [ ] Cards are visually consistent.
- [ ] Buttons are visually consistent.
- [ ] Inputs are visually consistent.
- [ ] Modals are visually consistent.
- [ ] Icons are visually consistent.
- [ ] Navigation is consistent.
- [ ] Legacy visual components are migrated.
- [ ] Browser-default UI is removed where styled UI is intended.
- [ ] No old gray button styling remains.
- [ ] No random fonts remain.
- [ ] No random colors remain.
- [ ] AI Companion matches the global design.
- [ ] Progress matches the global design.
- [ ] Reminders match the global design.
- [ ] Memories match the global design.
- [ ] Routines match the global design.
- [ ] Community matches the global design.
- [ ] Notifications match the global design.
- [ ] Safety matches the global design.
- [ ] SOS remains clearly identifiable.
- [ ] Profile/settings match the global design.
- [ ] Authentication matches the global design.
- [ ] Caregiver screens match the global design.
- [ ] No horizontal overflow exists.
- [ ] Touch targets are appropriate.
- [ ] Accessibility is maintained.
- [ ] Existing functionality still works.
- [ ] No duplicate design systems were created.

---

# 64. REQUIRED RESPONSIVE TESTING

Test the real application at:

```text
320px
360px
375px
390px
412px
430px
768px
```

Verify at each width:

```text
Navigation
Header
Cards
Forms
Modals
AI
Reminders
Memories
Progress
Safety
SOS
```

---

# 65. FINAL REPORT

After implementation, provide:

## Design System

```text
Colors
Typography
Spacing
Radius
Shadows
Breakpoints
```

## Shared Components

List exact paths.

## Screens Updated

List every mobile screen.

## Legacy Components Migrated

List exact paths.

## Responsive Testing

```text
320px: PASS/FAIL
360px: PASS/FAIL
375px: PASS/FAIL
390px: PASS/FAIL
412px: PASS/FAIL
430px: PASS/FAIL
768px: PASS/FAIL
```

## Functional Regression

```text
Authentication: PASS/FAIL
AI: PASS/FAIL
Voice: PASS/FAIL
Memories: PASS/FAIL
Reminders: PASS/FAIL
Routines: PASS/FAIL
Progress: PASS/FAIL
Community: PASS/FAIL
Notifications: PASS/FAIL
Safety: PASS/FAIL
Geofence: PASS/FAIL
SOS: PASS/FAIL
Profile: PASS/FAIL
Settings: PASS/FAIL
```

## Remaining Legacy UI

List every remaining component that does not follow the new design.

Do not claim completion if significant legacy UI remains.

---

# FINAL COMMAND

Perform a **complete visual migration of the entire Memora mobile application**.

Do not interpret this as:

```text
change colors
+
change fonts
+
add rounded corners
```

Interpret it as:

```text
OLD / INCONSISTENT MEMORA
            ↓
Global design tokens
            ↓
Shared component system
            ↓
Modern app shell
            ↓
Modern navigation
            ↓
Modern page layouts
            ↓
Modern cards
            ↓
Modern forms
            ↓
Modern modals
            ↓
Modern feature screens
            ↓
Responsive mobile UX
            ↓
ONE COHESIVE MEMORA APP
```

Every screen must visually belong to the same product.

The final result should feel:

```text
Premium
Modern
Calm
Intelligent
Trustworthy
Accessible
Patient-friendly
```

while using:

```text
#121212 background
#0F172A surfaces
#F4C542 Memora gold
Indigo/Purple feature accents
Teal/Green positive states
Modern sans-serif typography
Rounded premium cards
Subtle borders
Generous spacing
Clear hierarchy
```

Preserve functionality, data, APIs, navigation behavior, and existing features.

Run the actual mobile application and visually verify the result before reporting completion.
