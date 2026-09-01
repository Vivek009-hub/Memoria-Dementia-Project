# MEMORA GLOBAL UI REDESIGN
## Apply the New Memora Design Across the Entire Website

### PRIMARY OBJECTIVE

The current Memora website contains a mixture of modernized screens and legacy components.

The new design must be applied to the **ENTIRE WEBSITE**, not just the mobile app, AI Companion, Progress page, or selected screens.

The final website must look like **one cohesive, premium Memora product**.

This is a **global frontend UI/UX migration**.

---

# 🚨 CRITICAL RULES

## DO NOT

- Change backend business logic.
- Change database schemas.
- Change API contracts.
- Remove existing functionality.
- Remove existing pages.
- Remove existing navigation destinations.
- Rebuild Gemini/AI functionality.
- Rebuild authentication.
- Break reminders.
- Break memories.
- Break routines.
- Break notifications.
- Break safety/geofencing.
- Break SOS.
- Create a second design system.
- Only change colors and call the work complete.
- Only change fonts and call the work complete.
- Only add rounded corners and call the work complete.

## DO

- Inspect the entire frontend.
- Find every legacy component.
- Rebuild outdated layouts where necessary.
- Reuse the new Memora design language.
- Create shared reusable UI components.
- Make every page responsive.
- Preserve all existing functionality.
- Test every route.
- Test desktop, tablet, and mobile.
- Remove visual inconsistencies.
- Make the entire website feel like it was designed as one product.

---

# 1. AUDIT THE ENTIRE FRONTEND FIRST

Before editing, inspect the complete frontend structure.

Find:

```text
pages
routes
layouts
components
navigation
headers
footers
sidebars
forms
modals
dialogs
cards
tables
lists
buttons
inputs
dropdowns
tabs
charts
notifications
loading states
empty states
error states
authentication screens
AI screens
patient screens
caregiver screens
admin screens
settings
profile
```

Create an internal inventory:

```text
MODERN
LEGACY
PARTIALLY MODERN
DUPLICATED
BROKEN
ORPHANED
```

Do not start changing random files before understanding the structure.

---

# 2. IDENTIFY THE NEW MEMORA DESIGN LANGUAGE

Find the newest/currently approved Memora design.

Use it as the **visual source of truth**.

Extract its:

- color palette
- typography
- font family
- page width
- spacing scale
- border radius
- card style
- button style
- icon style
- shadows
- borders
- navigation
- headers
- section layouts
- forms
- modals
- responsive behavior

The goal is:

```text
NEW MEMORA DESIGN
        ↓
GLOBAL DESIGN LANGUAGE
        ↓
EVERY PAGE
        ↓
EVERY COMPONENT
```

Do not invent unrelated styles for individual sections.

---

# 3. CREATE A GLOBAL DESIGN SYSTEM

If the project already has a design system, improve and reuse it.

If not, create shared frontend primitives.

Recommended:

```text
MemoraButton
MemoraCard
MemoraInput
MemoraSelect
MemoraTextarea
MemoraCheckbox
MemoraSwitch
MemoraBadge
MemoraAvatar
MemoraIconButton
MemoraPageHeader
MemoraSectionHeader
MemoraModal
MemoraDrawer
MemoraTabs
MemoraSegmentedControl
MemoraEmptyState
MemoraLoadingState
MemoraErrorState
MemoraToast
MemoraStatCard
MemoraProgressCard
```

Use variants instead of duplicating components.

Example:

```text
MemoraButton
 ├── primary
 ├── secondary
 ├── outline
 ├── ghost
 ├── danger
 ├── success
 └── icon
```

Do NOT create:

```text
OldButton
NewButton
ModernButton
AIButton
ProgressButton
SafetyButton
```

---

# 4. GLOBAL APP SHELL

Modernize the entire application shell.

Desktop should have a deliberate structure:

```text
┌──────────────────────────────────────────────────────────┐
│ Memora Logo     Status        Navigation     User/Profile │
├──────────────────────────────────────────────────────────┤
│                                                          │
│                      PAGE CONTENT                        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

Mobile should be intentionally mobile-first:

```text
┌──────────────────────────────┐
│ Menu / Logo       Bell/Profile│
├──────────────────────────────┤
│                              │
│          CONTENT             │
│                              │
├──────────────────────────────┤
│ Main navigation              │
└──────────────────────────────┘
```

Do not squeeze desktop navigation into mobile.

---

# 5. GLOBAL NAVIGATION

Audit every navigation implementation.

The same navigation destinations should remain available.

Desktop can use:

```text
Sidebar
```

or:

```text
Top navigation
```

depending on the current Memora architecture.

Mobile must use an intentional:

```text
Bottom navigation
```

or:

```text
Drawer / menu
```

pattern.

The navigation must not become a giant horizontally scrolling row.

Navigation must clearly indicate the current page.

---

# 6. GLOBAL HEADER

Every page should use a consistent header structure.

Possible structure:

```text
Back/Menu
     +
Page title
     +
Optional description
     +
Page action
```

Do not let every page create its own unrelated header.

---

# 7. GLOBAL PAGE LAYOUT

Standardize:

```text
App Shell
 ↓
Page Container
 ↓
Page Header / Hero
 ↓
Primary Controls
 ↓
Content Sections
 ↓
Supporting Content
```

Use consistent maximum widths.

Do not let some pages stretch to the entire screen while others use narrow containers without reason.

---

# 8. TYPOGRAPHY

Apply the new typography globally.

Do not allow legacy typography to remain.

Eliminate inconsistent:

- serif fonts
- Times New Roman
- browser-default fonts
- random font sizes
- random heading weights

Use the approved modern sans-serif font.

If the new Memora design uses Montserrat or a similar modern font, apply it consistently.

Create a clear hierarchy:

```text
Display
H1
H2
H3
Body Large
Body
Body Small
Caption
Label
Button
```

---

# 9. GLOBAL COLOR TOKENS

Centralize the new Memora palette.

Recommended semantic tokens:

```text
background
surface
surfaceElevated
primary
secondary
text
textMuted
border
success
warning
danger
info
```

Legacy screens must not introduce unrelated colors.

---

# 10. GLOBAL CARDS

Create one card language for the entire website.

Cards should share:

- radius
- padding
- border
- elevation
- title hierarchy
- icon alignment

Use variants where needed.

These should feel like the same product:

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
Admin Card
```

---

# 11. GLOBAL BUTTONS

Replace all legacy/default browser buttons.

Every button should use the shared Memora button system.

Ensure:

- consistent height
- padding
- radius
- typography
- icons
- hover
- pressed
- focus
- disabled
- loading

No random gray browser buttons.

---

# 12. GLOBAL FORMS

Modernize every form throughout the website.

Includes:

```text
Login
Register
Profile
Settings
Add Memory
Edit Memory
Add Reminder
Edit Reminder
Create Routine
Edit Routine
Safe Zone
Caregiver
Admin
AI configuration if present
Community
```

Use:

```text
Label
Input
Helper text
Error
```

with consistent spacing.

Preserve validation and functionality.

---

# 13. GLOBAL MODALS

Modernize every popup.

Standard:

```text
┌─────────────────────────────┐
│ Title                    ×  │
│ Description                │
│                             │
│ Content                     │
│                             │
│ Cancel        Primary       │
└─────────────────────────────┘
```

Mobile modals should fit the viewport.

Use bottom sheets/full-screen modal patterns where appropriate.

Do not leave old desktop-sized forms inside mobile dialogs.

---

# 14. DASHBOARD

Modernize the dashboard layout.

Use:

```text
Welcome / Patient context
        ↓
Important status
        ↓
Today's routine
        ↓
Upcoming reminders
        ↓
Memories / activity
        ↓
Safety
```

Do not overload the dashboard with unnecessary information.

Keep the most important patient actions prominent.

---

# 15. AI COMPANION

Use the new AI Companion design.

Structure:

```text
Page Header
 ↓
Companion / Conversation
 ↓
Voice control
 ↓
Quick actions
 ↓
Relevant context
```

Ensure the AI Companion visually belongs to the same Memora website.

Do not alter Gemini functionality.

---

# 16. PROGRESS

Redesign the actual layout, not just colors.

Use:

```text
Page Header
 ↓
Period Selector
 ↓
Summary Metrics
 ↓
Primary Progress Visualization
 ↓
Insights
 ↓
History
```

Responsive behavior:

```text
Desktop → multi-column
Tablet → two-column
Mobile → single-column
```

---

# 17. REMINDERS

Use:

```text
Page Header
 ↓
Upcoming / Today
 ↓
Reminder Cards
```

Each card should clearly show:

```text
Icon
Title
Time
Status
Actions
```

AI-created and manually-created reminders must use the same UI.

---

# 18. MEMORIES

Use:

```text
Page Header
 ↓
Search / Filters
 ↓
Memory Grid/List
```

Modernize:

- memory cards
- memory details
- add memory
- edit memory
- delete confirmation
- image upload
- empty state

Preserve existing local image upload functionality if already implemented.

---

# 19. ROUTINES

Use:

```text
Today's Routine
 ↓
Timeline / Routine Cards
 ↓
Completion states
```

Avoid old table-heavy layouts on mobile.

---

# 20. NOTIFICATIONS

Modernize:

```text
Notification Header
 ↓
Unread / All
 ↓
Notification Cards
```

Use clear unread states and timestamps.

---

# 21. SAFETY

Modernize:

```text
Safety Status
 ↓
Current Location / Safe Zone
 ↓
Safety Events
 ↓
Emergency Actions
```

The current safety state must be immediately understandable.

---

# 22. SOS

Keep SOS highly visible.

Use:

```text
Safety Context
 ↓
Emergency Action
 ↓
Confirmation
 ↓
Status
```

Do not make it look like a normal generic button.

---

# 23. COMMUNITY

If Community exists, modernize:

- posts
- cards
- profiles
- actions
- comments
- empty states
- forms

Keep functionality intact.

---

# 24. PROFILE

Modernize:

```text
Profile Header
 ↓
Personal Information
 ↓
Account Settings
 ↓
Preferences
 ↓
Security
```

---

# 25. SETTINGS

Modernize settings into grouped sections:

```text
Account
Notifications
Privacy
Appearance
Accessibility
Safety
Other
```

Use consistent settings cards and controls.

---

# 26. AUTHENTICATION

Modernize:

```text
Login
Register
Forgot Password
Reset Password
```

Use the new Memora visual language.

Do not change authentication logic.

---

# 27. CAREGIVER EXPERIENCE

Apply the same design system to caregiver screens.

Caregiver dashboard should visually organize:

```text
Patient
 ↓
Current Status
 ↓
Routine
 ↓
Reminders
 ↓
Memories
 ↓
Safety
 ↓
Events
```

---

# 28. ADMIN EXPERIENCE

Apply the new styling to all admin screens.

Modernize:

- user management
- roles
- content management
- teacher/privilege management
- activity logs
- notifications
- forms
- tables
- modals
- dashboards

Do not change admin permissions or business rules.

---

# 29. TABLES

Audit all tables.

Desktop tables may remain tables.

Mobile should become:

```text
Responsive Card List
```

where appropriate.

Do not force complex tables into tiny screens.

---

# 30. RESPONSIVE DESIGN

Test the entire website at:

```text
320px
360px
375px
390px
412px
430px
768px
1024px
1280px
1440px
1920px
```

Every page must be usable.

Check:

- no horizontal overflow
- no clipped content
- no overlapping elements
- no fixed-width legacy components
- no desktop-only layouts on mobile
- no broken dialogs
- no oversized navigation

Do not use:

```css
overflow-x: hidden;
```

as a fake solution.

Fix the actual layout.

---

# 31. DESKTOP DESIGN

The redesign must not sacrifice desktop quality.

At large widths:

- content should have sensible max-widths
- grids should use available space
- navigation should be comfortable
- cards should not become absurdly wide
- whitespace should feel intentional

---

# 32. TABLET DESIGN

At tablet widths:

- navigation should adapt
- grids should reduce columns
- forms should stack where necessary
- cards should resize naturally

---

# 33. MOBILE DESIGN

Mobile must be treated as a first-class design target.

Use:

```text
1-column content
comfortable touch targets
compact header
mobile navigation
stacked forms
responsive cards
full-width actions where appropriate
```

---

# 34. ACCESSIBILITY

Ensure:

- readable text
- good contrast
- keyboard navigation
- visible focus states
- screen-reader labels
- semantic HTML
- adequate touch targets
- meaningful button labels
- status not communicated by color alone

---

# 35. ICON SYSTEM

Standardize icons across the website.

Prefer the existing icon library.

Avoid randomly mixing:

```text
emoji
Unicode
SVG
different icon libraries
```

unless intentional.

---

# 36. EMPTY / LOADING / ERROR STATES

Every major page should have modern:

```text
Loading
Empty
Error
Success
```

states.

Use the shared components.

---

# 37. REMOVE LEGACY STYLES SAFELY

Search for:

```text
old CSS
legacy classes
duplicate styles
inline legacy styles
browser-default controls
obsolete theme variables
unused components
```

Do not delete anything without checking usage.

After migration, remove only confirmed-unused legacy styling.

---

# 38. NO DUPLICATE DESIGN SYSTEMS

The final frontend should have one hierarchy:

```text
Theme Tokens
     ↓
Shared UI Components
     ↓
Layout Components
     ↓
Page Components
```

Not:

```text
Old CSS
New CSS
AI CSS
Progress CSS
Safety CSS
Legacy CSS
```

with conflicting overrides.

---

# 39. PRESERVE FUNCTIONALITY

Before and after modernization, verify:

```text
Authentication
Navigation
Memories
Image upload
Reminders
Routines
Progress
Community
Notifications
AI
Voice
Safety
Geofencing
SOS
Caregiver
Admin
```

No functionality should disappear.

---

# 40. SEARCH FOR ORPHANED COMPONENTS

Find components that are:

- created but never imported
- imported but never reachable
- reachable only through dead routes
- duplicated
- legacy versions of newer components

Connect or remove only when safe.

Do not remove functionality accidentally.

---

# 41. ROUTE-BY-ROUTE AUDIT

Enumerate all frontend routes.

For each route record:

```text
Route
Page
Layout
Legacy/Modern
Responsive
Functional
```

Every active route must receive the new design.

---

# 42. VISUAL REGRESSION TEST

For every route, check:

```text
Header
Navigation
Page title
Cards
Buttons
Inputs
Forms
Modals
Tables
Lists
Spacing
Typography
Icons
Responsive behavior
```

The website should feel like a single product.

---

# 43. DO NOT STOP AT THE FIRST FEW PAGES

This is a GLOBAL migration.

Do not modernize only:

```text
Dashboard
AI
Progress
```

and report completion.

Continue through the complete route/component tree.

---

# 44. DO NOT CHANGE PRODUCT SCOPE

This task is NOT an opportunity to add:

- games
- extra AI features
- social features
- unnecessary dashboards
- extra animations
- unrelated functionality

Only modernize the existing product.

---

# 45. PERFORMANCE

Avoid introducing unnecessary:

- huge animation libraries
- excessive JavaScript for styling
- duplicated components
- oversized assets
- expensive rendering

The redesign should remain fast.

---

# 46. BUILD VERIFICATION

Run the complete frontend.

Check:

```text
build
lint if configured
runtime
navigation
console
responsive layout
```

Fix errors caused by the migration.

---

# 47. FINAL ACCEPTANCE CRITERIA

The website is complete only when:

- [ ] Every active page has been audited.
- [ ] Every major legacy component has been identified.
- [ ] Legacy layouts have been migrated.
- [ ] New Memora design is used globally.
- [ ] App shell is consistent.
- [ ] Navigation is responsive.
- [ ] Headers are consistent.
- [ ] Typography is consistent.
- [ ] Colors are consistent.
- [ ] Cards are consistent.
- [ ] Buttons are consistent.
- [ ] Forms are consistent.
- [ ] Modals are consistent.
- [ ] Tables are responsive.
- [ ] AI Companion matches the design.
- [ ] Progress matches the design.
- [ ] Reminders match the design.
- [ ] Memories match the design.
- [ ] Routines match the design.
- [ ] Notifications match the design.
- [ ] Safety matches the design.
- [ ] SOS matches the design.
- [ ] Caregiver pages match the design.
- [ ] Admin pages match the design.
- [ ] Authentication pages match the design.
- [ ] Mobile works.
- [ ] Tablet works.
- [ ] Desktop works.
- [ ] No major horizontal overflow exists.
- [ ] No browser-default legacy UI remains.
- [ ] Existing functionality still works.
- [ ] No duplicate design systems were created.

---

# 48. FINAL REPORT

After implementation, return:

## A. Complete Route Inventory

```text
Route | Page | Status
```

## B. Legacy Components Found

List exact components and paths.

## C. Components Redesigned

List exact components and paths.

## D. Shared Components

List components created or updated.

## E. Styling Changes

Explain the global design-system changes.

## F. Responsive Testing

```text
320px: PASS/FAIL
360px: PASS/FAIL
375px: PASS/FAIL
390px: PASS/FAIL
412px: PASS/FAIL
430px: PASS/FAIL
768px: PASS/FAIL
1024px: PASS/FAIL
1280px: PASS/FAIL
1440px: PASS/FAIL
1920px: PASS/FAIL
```

## G. Functional Regression

```text
Authentication: PASS/FAIL
Navigation: PASS/FAIL
Dashboard: PASS/FAIL
AI: PASS/FAIL
Voice: PASS/FAIL
Memories: PASS/FAIL
Reminders: PASS/FAIL
Routines: PASS/FAIL
Progress: PASS/FAIL
Community: PASS/FAIL
Notifications: PASS/FAIL
Safety: PASS/FAIL
Geofencing: PASS/FAIL
SOS: PASS/FAIL
Caregiver: PASS/FAIL
Admin: PASS/FAIL
```

## H. Remaining Legacy Areas

List every remaining legacy screen/component.

Do not hide unfinished areas.

---

# FINAL COMMAND

Perform a **complete visual migration of the entire Memora website**.

The desired result is NOT:

```text
OLD WEBSITE
+
new colors
+
new fonts
```

The desired result is:

```text
                 MEMORA
                    │
              Global Design
                    │
          ┌─────────┴─────────┐
          │                   │
       Desktop             Mobile
          │                   │
          └─────────┬─────────┘
                    │
             Shared Components
                    │
       ┌────────────┼────────────┐
       │            │            │
     Cards        Forms       Modals
       │            │            │
       └────────────┼────────────┘
                    │
        Every Memora Feature
                    │
 ┌──────┬──────┬──────┬──────┬──────┐
 │ AI   │Memory│Remind│Safety│Admin │
 └──────┴──────┴──────┴──────┴──────┘
                    │
             ONE COHESIVE PRODUCT
```

**Every existing page.**
**Every existing component.**
**Every existing form.**
**Every existing modal.**
**Every existing navigation element.**

must feel like part of the **same modern Memora design system**.

Do the migration systematically.

Run the application.

Test the routes.

Test responsive layouts.

Fix regressions.

Only report completion after the entire website has been audited and verified.
