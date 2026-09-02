# MEMORA MOBILE UI REDESIGN
## Apply the Correct Multi-Accent Memora Theme Across the Entire Mobile App

---

# PRIMARY OBJECTIVE

Redesign the **entire Memora mobile application's visual styling** so that every screen and component follows the approved Memora theme.

The current app has the newer component/layout structure, but its styling is being interpreted too heavily as a **blue + yellow theme**.

That is INCORRECT.

## IMPORTANT THEME CLARIFICATION

**Memora is NOT a blue-and-yellow themed application.**

Memora uses a:

```text
DARK NEUTRAL FOUNDATION
+
MULTI-ACCENT FEATURE PALETTE
```

The application should use different accent colors for different feature categories while maintaining one unified dark foundation.

The final result should look:

```text
Premium
Modern
Dark
Elegant
Warm
Colorful but controlled
Calm
Accessible
Patient-friendly
```

---

# 1. DO NOT TURN THE APP INTO A BLUE + YELLOW THEME

This is the most important instruction.

DO NOT make:

```text
Blue background
+
Blue cards
+
Yellow buttons
+
Yellow headings
```

throughout the entire application.

That is NOT the Memora design.

Instead use:

```text
Dark neutral foundation
        +
Feature-specific accent colors
        +
Shared typography
        +
Shared spacing
        +
Shared component shapes
```

The colors should work together without every screen becoming dominated by one accent.

---

# 2. MEMORA COLOR PHILOSOPHY

Use the following visual hierarchy:

```text
                 DARK MEMORA FOUNDATION
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
      GOLD             PURPLE/INDIGO       TEAL
        │                 │                 │
     BRAND /           AI / COGNITIVE     MEMORIES /
     PRIMARY           / ANALYTICS        POSITIVE
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                   OTHER ACCENTS
                          │
                Lavender / Blue / Red
```

Each accent has a purpose.

Do not randomly assign colors.

---

# 3. BASE BACKGROUND

The primary application background should be a **dark neutral charcoal**, not blue.

Recommended:

```text
#121212
```

or a visually equivalent dark neutral.

The background should feel:

```text
charcoal
near-black
warm/cool neutral
premium
```

Do NOT make the entire background:

```text
#0F172A
#111827
```

or another obviously navy-heavy color.

Deep navy may be used as a **secondary surface**, but it must not become the dominant application color.

---

# 4. SURFACE PALETTE

Use layered surfaces.

Recommended:

```text
Background:
#121212

Surface:
#181818

Elevated Surface:
#1E1E1E

Secondary Surface:
#202020

Dark Content Surface:
#111827
```

The final values can be adjusted slightly to match the approved Memora visual reference.

The important rule is:

**CHARCOAL IS THE FOUNDATION.**

Navy is an accent surface, not the entire theme.

---

# 5. PRIMARY MEMORA GOLD

Gold is the **brand accent**, not the only accent.

Recommended:

```text
Primary Gold:
#F4C542

Gold Highlight:
#FFD75A

Muted Gold:
#C9A735
```

Use gold for:

- Memora branding
- primary CTAs
- important actions
- selected navigation state
- brand highlights
- key emphasis
- important metrics

Do NOT color every heading, icon and card gold.

Gold should feel intentional and premium.

---

# 6. PURPLE / VIOLET

Purple represents:

```text
AI
Cognitive features
Intelligence
Companion
Community where appropriate
```

Recommended:

```text
Purple:
#8B5CF6

Violet:
#A855F7

Light Purple:
#A78BFA
```

Use it for:

- AI Companion
- AI indicators
- cognitive features
- AI conversation elements
- selected analytical elements where appropriate
- community accents when appropriate

Do not turn the whole AI page purple.

The foundation remains dark.

---

# 7. INDIGO / BLUE

Blue and indigo are supporting accents.

Recommended:

```text
Indigo:
#6366F1

Light Indigo:
#818CF8

Blue:
#60A5FA
```

Use them primarily for:

- progress
- analytics
- charts
- informational states
- secondary visual emphasis

Do NOT use blue as the main application background.

---

# 8. TEAL / EMERALD

Teal represents:

```text
Memories
Success
Safe
Completed
Positive
Healthy status
```

Recommended:

```text
Teal:
#14B8A6

Emerald:
#10B981

Light Teal:
#2DD4BF
```

Use it for:

- Memory Vault
- completed routines
- successful actions
- safe state
- positive progress
- confirmation states

---

# 9. LAVENDER

Use lavender as a softer secondary accent.

Recommended:

```text
#A78BFA
```

Use for:

- secondary AI elements
- supporting information
- subtle highlights
- community or cognitive details

Do not overuse it.

---

# 10. RED

Red is reserved for:

```text
SOS
Emergency
Danger
Destructive action
Critical safety warning
```

Recommended:

```text
#EF4444
```

Never use red as a general accent.

---

# 11. AMBER / WARNING

Use amber for:

```text
Warning
Attention
Upcoming event
Potential safety issue
```

Recommended:

```text
#F59E0B
```

Keep warning states visually distinct from the primary gold brand color.

---

# 12. TEXT COLORS

Use:

```text
Primary:
#F8FAFC

Secondary:
#CBD5E1

Muted:
#94A3B8

Very Muted:
#64748B
```

Text must remain readable against dark surfaces.

Do not use dark gray text on dark backgrounds.

---

# 13. BORDER COLORS

Use subtle borders.

Recommended:

```text
#2A2A2A
```

or an equivalent low-contrast border.

Feature-colored borders should only appear where useful.

For example:

```text
AI card → subtle purple border
Memory card → subtle teal border
Primary action → subtle gold border
```

Do not outline every element in bright colors.

---

# 14. COLOR TOKENS

Create a global theme/token system.

Example:

```text
--memora-bg
--memora-surface
--memora-surface-elevated

--memora-gold
--memora-gold-light

--memora-purple
--memora-violet

--memora-indigo
--memora-blue

--memora-teal
--memora-emerald

--memora-lavender

--memora-success
--memora-warning
--memora-danger
--memora-info

--memora-text
--memora-text-secondary
--memora-text-muted
--memora-border
```

Do not hardcode dozens of colors across components.

---

# 15. FEATURE COLOR MAPPING

Use this mapping consistently.

| Feature | Primary Accent |
|---|---|
| Memora Brand | Gold |
| Primary Actions | Gold |
| AI Companion | Purple/Violet |
| Cognitive Features | Purple/Indigo |
| Progress | Indigo/Blue |
| Analytics | Indigo/Blue |
| Memories | Teal/Emerald |
| Routine Completion | Teal/Green |
| Safe Status | Green/Teal |
| Community | Purple/Lavender |
| Reminders | Gold / Amber |
| Notifications | Context dependent |
| Warning | Amber |
| SOS | Red |
| Error | Red |
| Success | Green |

IMPORTANT:

These are **accent assignments**, not separate themes.

Every feature must still use the same:

```text
dark background
typography
card style
spacing
radius
buttons
inputs
navigation
```

---

# 16. EXAMPLE OF CORRECT COLOR USAGE

### AI

```text
Dark charcoal background
Dark elevated cards
Purple AI icon
Purple subtle glow/highlight
White heading
Muted description
Gold primary action where appropriate
```

### Memories

```text
Dark charcoal background
Dark cards
Teal memory icon
Teal progress/status
White heading
Muted description
Gold action button where appropriate
```

### Progress

```text
Dark charcoal background
Dark cards
Indigo/blue charts
Purple/indigo analytical accent
White heading
Gold for important completion metric
```

### Safety

```text
Dark charcoal background
Dark cards
Green safe state
Amber warning
Red emergency/SOS
```

---

# 17. TYPOGRAPHY

Use a modern geometric sans-serif.

Preferred:

```text
Montserrat
```

or the closest already-configured modern sans-serif.

Never use:

```text
Times New Roman
Georgia
serif browser defaults
random fonts
```

Typography should be consistent across the entire mobile application.

---

# 18. TYPOGRAPHY HIERARCHY

Use:

```text
Display:
32-36px / 700-800

H1:
28-32px / 700

H2:
22-26px / 700

H3:
18-20px / 600-700

Body:
15-16px / 400-500

Small:
13-14px

Caption:
11-12px

Button:
14-15px / 600-700
```

Adapt these to the existing mobile framework where necessary.

---

# 19. TYPOGRAPHY CHARACTER

Headings:

```text
Bold
Modern
Clean
Confident
```

Body:

```text
Readable
Calm
Comfortable
```

Do not make every text element bold.

Do not use excessive uppercase.

---

# 20. APP BACKGROUND

Every screen should begin with the same dark neutral foundation.

Example:

```text
#121212
```

Do not let individual pages introduce completely different backgrounds.

---

# 21. CARD DESIGN

Cards should be premium dark surfaces.

Use:

```text
Dark surface
Subtle border
18-22px radius
16-20px padding
Minimal shadow
```

Do not make every card blue.

Instead:

```text
BASE CARD
Dark charcoal surface

FEATURE ACCENT
Small icon
Small indicator
Subtle top/bottom/side accent
```

---

# 22. CARD EXAMPLE

### Correct

```text
┌─────────────────────────────┐
│  🟣  AI COMPANION           │
│                             │
│  Talk to Memora             │
│  Your personal companion.   │
│                             │
│  Start Conversation →       │
└─────────────────────────────┘
```

The card remains dark.

Purple provides the feature identity.

### Incorrect

```text
Entire card = purple
Entire page = blue
All buttons = yellow
```

Avoid this.

---

# 23. CARD ICONS

Use feature-specific accent colors.

Examples:

```text
AI → Purple
Progress → Indigo
Memory → Teal
Reminder → Gold
Safety → Green
SOS → Red
Community → Lavender
```

Icons should usually sit inside subtle tinted backgrounds.

---

# 24. CARD ICON CONTAINERS

Example:

```text
┌─────────┐
│   🟣    │
└─────────┘
```

Use a low-opacity version of the feature accent as the icon background.

Do not use saturated full-color blocks everywhere.

---

# 25. BUTTON DESIGN

Primary button:

```text
Gold background
Dark text
```

Secondary:

```text
Dark elevated surface
Light text
Subtle border
```

AI-specific action:

```text
Purple accent
```

Danger:

```text
Red
```

Success:

```text
Teal/green
```

Buttons must remain visually related even when their accents differ.

---

# 26. NAVIGATION

Navigation should use the dark neutral foundation.

Inactive:

```text
Muted gray icon
Muted gray text
```

Active:

```text
Feature accent
+
subtle active background
```

Do not make every navigation item bright.

---

# 27. BOTTOM NAVIGATION

Use a proper mobile navigation structure.

Example:

```text
┌────────────────────────────────┐
│                                │
│          PAGE CONTENT          │
│                                │
├────────────────────────────────┤
│ Home   AI   Reminders  Memory  │
└────────────────────────────────┘
```

Use accent colors selectively for the active destination.

Do NOT create a tiny horizontal desktop-style menu.

---

# 28. HEADER

Use:

```text
Menu / Back
Memora / Page Title
Notification / Profile
```

on a dark neutral surface.

Brand accent can use gold.

---

# 29. AI COMPANION VISUAL DESIGN

AI should use purple/violet as its feature accent.

Structure:

```text
AI Header
 ↓
Conversation
 ↓
Voice interaction
 ↓
Quick actions
 ↓
Context/reminder cards
```

Keep the base background dark.

Purple identifies AI.

Gold can be used for primary actions.

---

# 30. AI VOICE STATE

Use:

```text
READY → neutral
LISTENING → purple
PROCESSING → indigo
SPEAKING → violet
ERROR → red
```

Do not make every state gold.

---

# 31. MICROPHONE

The microphone should be a large, accessible control.

Use:

```text
Dark circular/surface container
Purple or violet active state
Clear microphone icon
```

When listening, show a subtle purple visual state.

Avoid excessive glowing effects.

---

# 32. AI CHAT BUBBLES

Patient message:

```text
dark elevated surface
```

AI response:

```text
slightly different dark surface
purple accent/icon
```

Keep text white and readable.

---

# 33. QUICK ACTION CHIPS

Use subtle accent-colored chips.

Examples:

```text
What do I do today?
My reminders
Tell me about my family
Tell me a story
```

AI chips can use:

```text
purple border
purple icon
dark surface
```

Do not make them fully purple.

---

# 34. MEMORY UI

Memories should use teal/emerald accents.

Example:

```text
Memory image
        ↓
Family Picnic
        ↓
Short description
        ↓
Teal memory indicator
```

Memory cards should feel personal, not administrative.

---

# 35. REMINDER UI

Reminders can use:

```text
Gold
Amber
```

depending on importance.

Example:

```text
🟡  Take medication
    8:00 PM
    Upcoming
```

Do not use blue as the default reminder color.

---

# 36. ROUTINE UI

Routine completion should use teal/green.

Example:

```text
✓ Breakfast
✓ Morning walk
○ Lunch
```

Completed:

```text
green/teal
```

Current:

```text
gold or appropriate accent
```

Upcoming:

```text
muted
```

---

# 37. PROGRESS UI

Progress should primarily use:

```text
Indigo
Blue
Purple
```

for analytical visualization.

Do not turn the entire Progress page blue.

Use the dark neutral base.

Charts should use multiple related accent colors when needed.

---

# 38. COMMUNITY UI

Community should use:

```text
Purple
Lavender
```

as supporting accents.

Cards remain dark.

Avatars and indicators can provide small color accents.

---

# 39. NOTIFICATIONS

Notifications should use contextual colors.

Examples:

```text
Reminder → Gold
AI → Purple
Safety → Green/Red
System → Indigo
Success → Teal
Warning → Amber
```

Do not make every notification the same color.

---

# 40. SAFETY UI

Safety should use semantic colors.

```text
SAFE:
Green / Teal

WARNING:
Amber

DANGER:
Red
```

The base remains dark.

Example:

```text
┌──────────────────────────────┐
│ 🟢 SAFE                      │
│                              │
│ Home Safe Zone               │
│ Patient is inside the zone.  │
└──────────────────────────────┘
```

---

# 41. SOS UI

SOS must use red.

Example:

```text
┌──────────────────────────────┐
│ EMERGENCY                    │
│                              │
│          [ SOS ]             │
│                              │
│ Get immediate help           │
└──────────────────────────────┘
```

Red must remain reserved for emergency/destructive states.

---

# 42. FORMS

All inputs should use:

```text
Dark surface
Light text
Muted placeholder
Subtle border
Gold/feature accent focus
```

Focus color can adapt to the feature.

For example:

```text
AI form → Purple focus
Memory form → Teal focus
General form → Gold focus
```

---

# 43. MODALS

Use:

```text
Dark elevated surface
Subtle border
24px radius
Backdrop
White text
Muted description
Feature-colored primary action
```

Do not make all modals blue.

---

# 44. SETTINGS

Use dark cards and subtle semantic accents.

Do not assign a different theme to every settings section.

---

# 45. PROFILE

Use the same dark foundation.

Gold for brand/primary actions.

Purple/teal can appear in supporting profile elements.

---

# 46. LOGIN / REGISTER

Use:

```text
Dark neutral background
Memora gold branding
White typography
Subtle surface cards
Gold primary CTA
```

Do not make authentication pages blue.

---

# 47. EMPTY STATES

Use the global dark foundation with a feature-specific icon.

Examples:

```text
No memories yet
[Teal memory icon]

No reminders today
[Gold reminder icon]

No conversations yet
[Purple AI icon]
```

---

# 48. LOADING STATES

Use subtle skeletons and spinners.

Feature-specific accent can be used sparingly.

Do not create colorful flashing loading screens.

---

# 49. ERROR STATES

Use red only where the state is actually an error.

Keep the background dark.

Use clear patient-friendly messaging.

---

# 50. ANIMATION

Keep animation subtle.

Use approximately:

```text
150-250ms
ease-out
```

Feature-specific active states can have subtle motion.

Do NOT use:

```text
neon glow
constant pulse
excessive bounce
large gradients
```

---

# 51. GRADIENTS

Gradients are optional and must be subtle.

If used:

```text
dark → slightly lighter dark
```

or:

```text
feature accent → transparent
```

Do not use giant bright gradients.

---

# 52. GLOW EFFECTS

Use extremely sparingly.

A subtle purple glow around an active AI listening state is acceptable.

A glowing blue/yellow entire page is NOT acceptable.

---

# 53. MOBILE RESPONSIVENESS

Test:

```text
320px
360px
375px
390px
412px
430px
768px
```

Ensure:

- no horizontal overflow
- no clipped text
- no overlapping cards
- no squeezed navigation
- no fixed-width components
- no broken modals
- no tiny controls

---

# 54. TOUCH TARGETS

Make important controls easy to tap:

```text
Microphone
SOS
Navigation
Reminder actions
Primary CTA
Back
Close
```

Use comfortable touch areas.

---

# 55. SAFE AREAS

Respect:

```text
status bar
notches
home indicator
bottom navigation
```

---

# 56. ICONOGRAPHY

Use one consistent icon library.

Standardize:

```text
size
stroke
weight
alignment
container
active state
```

Do not randomly mix icon libraries.

---

# 57. GLOBAL DESIGN TOKEN ARCHITECTURE

Use:

```text
Theme
 ↓
Color Tokens
 ↓
Typography Tokens
 ↓
Spacing Tokens
 ↓
Radius Tokens
 ↓
Shadow Tokens
 ↓
Shared Components
 ↓
Feature Components
 ↓
Screens
```

This ensures a single global design system.

---

# 58. SHARED COMPONENTS

Use/rebuild:

```text
MemoraButton
MemoraCard
MemoraInput
MemoraSelect
MemoraTextarea
MemoraSwitch
MemoraBadge
MemoraIconButton
MemoraPageHeader
MemoraSectionHeader
MemoraModal
MemoraBottomSheet
MemoraTabs
MemoraSegmentedControl
MemoraStatCard
MemoraProgressCard
MemoraReminderCard
MemoraMemoryCard
MemoraRoutineCard
MemoraSafetyCard
MemoraNotificationCard
MemoraEmptyState
MemoraLoadingState
MemoraErrorState
```

Use feature variants instead of separate visual systems.

---

# 59. DO NOT CREATE SEPARATE THEMES

Do NOT create:

```text
AI Theme
Progress Theme
Memory Theme
Safety Theme
Community Theme
```

Instead create:

```text
MEMORA GLOBAL THEME
       +
FEATURE ACCENTS
```

---

# 60. COMPLETE SCREEN COVERAGE

Apply this design system to every mobile screen:

```text
Splash
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
Admin screens if included
```

If the screen exists, it must use the new design system.

---

# 61. LEGACY UI SEARCH

Search for:

```text
old colors
blue-heavy backgrounds
yellow-heavy screens
default buttons
default inputs
old cards
legacy typography
random fonts
hardcoded colors
fixed widths
old navigation
inconsistent shadows
inconsistent radius
random icons
duplicate CSS
```

Migrate them.

---

# 62. IMPORTANT: FIX THE SHARED SOURCE, NOT JUST THE SYMPTOMS

If 15 screens use the same old button:

```text
Fix MemoraButton
```

If 10 screens use the same old card:

```text
Fix MemoraCard
```

If every page uses the same old background:

```text
Fix global theme
```

Do not manually patch every page with duplicate CSS.

---

# 63. DO NOT OVER-COLOR THE UI

The approximate visual ratio should feel like:

```text
70-80%
Dark neutral surfaces/background

10-15%
Feature accents

5-10%
Primary/highlight actions
```

These are visual guidelines, not strict mathematical requirements.

The interface should breathe.

---

# 64. VISUAL BALANCE

A good screen should look approximately like:

```text
DARK FOUNDATION
────────────────────────

White/light text

   Small feature accent
   ↓
   Main heading

Dark card
   └── Feature accent icon

Dark card
   └── Feature accent indicator

Gold primary action

────────────────────────
```

Not:

```text
BLUE EVERYTHING
+
YELLOW EVERYTHING
```

---

# 65. PREMIUM DESIGN RULE

The application should look expensive because of:

```text
spacing
typography
contrast
hierarchy
restraint
consistency
```

not because of:

```text
bright colors
huge gradients
neon
excessive shadows
animations
```

---

# 66. PATIENT-FRIENDLY RULE

Despite being premium, the UI must remain simple.

Prioritize:

```text
Clear
Predictable
Readable
Large enough
Calm
Accessible
```

---

# 67. FUNCTIONALITY PRESERVATION

Do NOT change:

```text
API calls
Backend
Database
Authentication
Gemini
AI Agent
Voice
Memories
Reminders
Routines
Progress
Notifications
Geofencing
SOS
Caregiver logic
Admin logic
```

The task is visual.

---

# 68. FINAL VISUAL CHECK

For every screen ask:

### Foundation

```text
Is the background dark neutral?
```

### Accent

```text
Is the feature using the correct accent?
```

### Typography

```text
Is the modern font consistent?
```

### Cards

```text
Are cards dark and premium?
```

### Buttons

```text
Are buttons part of the global Memora system?
```

### Navigation

```text
Is navigation consistent?
```

### Spacing

```text
Does the screen breathe?
```

### Mobile

```text
Does it work at 320-430px?
```

### Accessibility

```text
Can a patient easily understand it?
```

---

# 69. FINAL ACCEPTANCE CRITERIA

The task is complete only when:

- [ ] The entire mobile app uses the dark neutral Memora foundation.
- [ ] The app is NOT interpreted as blue + yellow.
- [ ] Gold is used as the brand/primary accent.
- [ ] Purple/violet is used for AI/cognitive features.
- [ ] Indigo/blue is used for analytics/progress.
- [ ] Teal/emerald is used for memories/success/safe states.
- [ ] Lavender is used as a secondary accent.
- [ ] Red is reserved for SOS/danger.
- [ ] Amber is used for warnings.
- [ ] Typography is consistent.
- [ ] Montserrat or the approved modern sans-serif is used.
- [ ] Cards share one visual language.
- [ ] Buttons share one visual language.
- [ ] Inputs share one visual language.
- [ ] Modals share one visual language.
- [ ] Navigation shares one visual language.
- [ ] AI Companion uses purple without becoming a purple theme.
- [ ] Memories use teal without becoming a teal theme.
- [ ] Progress uses indigo/blue without becoming a blue theme.
- [ ] Safety uses semantic green/amber/red.
- [ ] SOS is clearly red.
- [ ] The app remains calm and patient-friendly.
- [ ] No major legacy styling remains.
- [ ] No random colors remain.
- [ ] No random fonts remain.
- [ ] No browser-default UI remains where styled UI is intended.
- [ ] No horizontal overflow exists.
- [ ] Existing functionality works.

---

# 70. REQUIRED TESTING

Test:

```text
320px
360px
375px
390px
412px
430px
768px
```

Verify:

```text
Dashboard
AI
Progress
Reminders
Memories
Routines
Community
Notifications
Safety
SOS
Profile
Settings
Authentication
```

---

# 71. FINAL REPORT

Return:

## Theme Tokens

List:

```text
Background
Surfaces
Gold
Purple
Indigo
Blue
Teal
Emerald
Lavender
Red
Amber
Text
Borders
```

## Shared Components

List exact paths.

## Screens Updated

List every screen.

## Legacy UI Removed/Replaced

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

## Remaining Legacy Areas

List every remaining screen/component that does not follow the theme.

---

# FINAL COMMAND

Apply the **correct Memora multi-accent theme to the entire mobile application**.

The design MUST be based on:

```text
              DARK NEUTRAL FOUNDATION
                       │
        ┌──────────────┼──────────────┐
        │              │              │
       GOLD          PURPLE         TEAL
        │              │              │
      BRAND           AI          MEMORIES
        │              │              │
        └──────────────┼──────────────┘
                       │
                  INDIGO / BLUE
                       │
                   PROGRESS
                       │
              LAVENDER / AMBER
                       │
              SECONDARY / WARNING
                       │
                     RED
                       │
                      SOS
```

**Do not turn Memora into a blue-and-yellow application.**

**Do not turn individual features into completely separate themes.**

The correct implementation is:

```text
ONE DARK MEMORA DESIGN SYSTEM
+
MULTIPLE CONTROLLED FEATURE ACCENTS
```

Preserve all functionality.

Modernize the entire visual experience.

Run the actual mobile application and verify every screen before reporting completion.
