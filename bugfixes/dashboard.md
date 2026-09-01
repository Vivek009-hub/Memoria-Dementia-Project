# MEMORA PATIENT DASHBOARD
## Detailed Frontend Layout & UI Redesign Prompt

---

## 0. ROLE OF THIS PROMPT

You are modifying an **existing Memora application**.

The backend and core application functionality already exist.

Your job is to redesign the **Patient Dashboard / Overview page** so that it closely follows the attached dashboard reference image.

This is a **frontend UI/UX redesign task**.

### DO NOT:

- Rebuild the entire application.
- Rewrite the backend.
- Change MongoDB schemas.
- Change API contracts.
- Replace working API calls with mock data.
- Hardcode dashboard values.
- Remove existing features.
- Break existing routes.
- Create unnecessary duplicate components.
- Keep any accidental old blue styling.

### DO:

- Inspect the existing dashboard implementation first.
- Reuse existing data and functionality.
- Reuse existing authentication/user data.
- Refactor existing components where appropriate.
- Create reusable UI components where needed.
- Replace the current dashboard visual system completely.
- Make the dashboard closely resemble the attached reference.
- Make the result responsive and accessible.
- Test the dashboard after implementation.

---

# 1. VISUAL TARGET

The attached image is the **primary visual reference**.

Do not literally insert the screenshot into the page.

Recreate the design using real HTML/React components.

The dashboard should communicate:

> **Premium + calm + trustworthy + human + healthcare + memory care**

The visual language should feel like a high-end digital care product rather than a generic admin/SaaS dashboard.

### Core visual characteristics

- Deep charcoal background
- Warm gold Memora branding
- Thin subtle borders
- Large elegant typography
- Generous whitespace
- Dark premium cards
- Restrained accent colors
- Minimal shadows
- Subtle hover animations
- Clear information hierarchy
- Consistent iconography
- Calm interactions

---

# 2. GLOBAL DESIGN TOKENS

Create or update a centralized design token system.

Prefer CSS variables or the project's existing Tailwind theme configuration.

## Colors

### Background

```css
--memora-bg: #151515;
```

### Sidebar

```css
--memora-sidebar: #161616;
```

### Surface

```css
--memora-surface: #1D1D1D;
```

### Elevated Surface

```css
--memora-surface-elevated: #222222;
```

### Border

```css
--memora-border: #343434;
```

### Gold

```css
--memora-gold: #D8B24C;
```

### Bright Gold

```css
--memora-gold-bright: #F0C75E;
```

### Primary Text

```css
--memora-text: #F5F5F0;
```

### Secondary Text

```css
--memora-text-secondary: #A7A7A2;
```

### Muted Text

```css
--memora-text-muted: #74746F;
```

### Success

```css
--memora-success: #45B982;
```

### Warning

```css
--memora-warning: #E5A83B;
```

### Danger

```css
--memora-danger: #D95C5C;
```

### Purple Accent

Use only for cognitive/brain-related content.

### Pink Accent

Use only for caregiver/family-related content.

### Green Accent

Use only for memory/health/completion-related content.

---

# 3. CRITICAL LEGACY BLUE CLEANUP

The existing dashboard contains components that still use an older blue visual system.

This must be fixed completely.

Before implementation, search the dashboard and its imported components for:

```text
blue
blue-
bg-blue
text-blue
border-blue
hover:bg-blue
hover:text-blue
from-blue
to-blue
indigo
cyan
sky
old-primary
primary-blue
```

Also inspect:

- Dashboard cards
- Stat cards
- Buttons
- Progress bars
- Icons
- Sidebar
- Header
- Modals
- Empty states
- Loading states
- Error states
- Dropdowns
- Tooltips
- Badges

Replace legacy styling with the Memora design tokens.

### Final requirement

There must be **zero accidental blue styling** remaining on the dashboard.

Do not simply override blue with another color at the end.

Remove the old styling logic and migrate the components properly.

---

# 4. PAGE ARCHITECTURE

The final desktop dashboard should follow this structure:

```text
┌──────────────────────────────────────────────────────────────────┐
│                         TOP HEADER                               │
├───────────────────┬──────────────────────────────────────────────┤
│                   │                                              │
│                   │     DATE                                     │
│                   │     MAIN GREETING                            │
│     SIDEBAR       │     DESCRIPTION              TALK TO MEMORA  │
│                   │                                              │
│                   │     STAT  STAT  STAT  STAT                  │
│                   │                                              │
│                   │     QUICK ACCESS                              │
│                   │     CARD       CARD       CARD                │
│                   │                                              │
│                   │     TODAY'S SCHEDULE    RECENT ACTIVITY      │
│                   │                                              │
└───────────────────┴──────────────────────────────────────────────┘
```

---

# 5. SIDEBAR

## Dimensions

Desktop sidebar:

```text
width: approximately 280px;
height: 100vh;
position: fixed;
```

The sidebar should remain visually separated from the content using a subtle vertical border.

Do not make the sidebar excessively bright.

---

## Logo

At the top:

```text
MEMORA
```

Use the existing Memora logo if one already exists.

If an existing logo asset is available, reuse it.

Do not create multiple competing logo implementations.

Logo treatment:

- White/cream text
- Gold symbol
- Clean modern typography
- Generous spacing

---

# 6. SIDEBAR NAVIGATION

Navigation items:

```text
Overview
Profile
Memories
Conversations
Reminders
Safety & SOS
Games
Community
Meeting Circle
```

Each item should have:

- Icon
- Label
- Hover state
- Active state
- Adequate click area

---

## Active Navigation

The Overview item should resemble the reference.

Use:

- Subtle gold-tinted background
- Thin gold border
- Gold icon
- Light text
- Small gold indicator on the left

Example:

```text
┌────────────────────────────┐
│ │  ◉  Overview             │
└────────────────────────────┘
```

Do not use blue.

---

## Navigation Spacing

Navigation items should have comfortable vertical spacing.

Avoid making the sidebar feel crowded.

The user should be able to quickly identify:

> Where am I?

without reading the entire sidebar.

---

# 7. SIDEBAR ENCOURAGEMENT CARD

At the bottom of the sidebar, add a compact supportive card.

Example content:

```text
♡ 

You're doing great!

Keep engaging daily to
strengthen your memories.
```

Visual treatment:

- Dark surface
- Thin subtle border
- Gold heart icon
- Muted secondary text
- Small decorative gold line
- Comfortable padding

This should feel supportive but not childish.

---

# 8. TOP HEADER

The main content area needs a clean top header.

Right-aligned controls:

```text
Notification
User Name
PATIENT
Logout
```

Example:

```text
🔔     Vivek     PATIENT     Logout
```

Use actual icons, not emoji.

---

## Notification

Use a subtle bell icon.

If notification functionality already exists, preserve it.

Do not create fake notifications.

---

## User

Display the authenticated user's actual name.

Never hardcode:

```text
Vivek
```

The reference uses Vivek only as sample data.

---

## Patient Badge

Style:

```text
background: transparent/dark
border: 1px solid rgba(216,178,76,0.35)
color: #D8B24C
```

Use uppercase text.

---

## Logout

Logout should remain functional.

Use a subtle icon + text treatment.

Do not turn Logout into the largest button in the header.

---

# 9. MAIN CONTENT CONTAINER

The dashboard content should be spacious.

Use:

```text
padding-left: 40px–56px;
padding-right: 40px–56px;
padding-top: 36px–48px;
padding-bottom: 48px;
```

Adjust responsively.

The main content should not touch the viewport edges.

---

# 10. PAGE HEADER / GREETING

The first section should contain:

### Date

```text
TUESDAY, SEPTEMBER 1, 2026
```

The actual date should be generated dynamically.

Styling:

- 12–14px
- Uppercase
- Gold
- Letter spacing
- Medium weight

---

## Main Greeting

Example:

```text
Good afternoon, Vivek
```

The greeting should be dynamic.

The time-based greeting can be:

```text
Good morning
Good afternoon
Good evening
```

Use the authenticated user's name.

---

## Description

```text
Here is your personal memory overview,
daily reminders, and assistant activity.
```

Use muted secondary text.

Maximum width should prevent the paragraph from becoming excessively long.

---

# 11. TALK TO MEMORA CTA

Place the primary CTA on the right side of the greeting area.

Button:

```text
Talk to Memora
```

Include the existing conversation/AI icon.

### Styling

```text
background: #F0C75E;
color: #151515;
```

Approximate:

```text
height: 52px;
padding: 0 24px;
border-radius: 10px;
```

Use a subtle hover state.

Clicking it must use the existing AI companion/conversation route or functionality.

Do not create a duplicate AI flow.

---

# 12. STATISTICS GRID

Create four cards below the greeting.

Desktop:

```text
4 equal columns
```

Tablet:

```text
2 × 2
```

Mobile:

```text
1 column
```

Cards should have consistent dimensions.

---

# 13. STAT CARD: DAILY ROUTINE

Content:

```text
Daily Routine

83%

5 of 6 completed
```

Icon:

- Clock
- Check-circle
- Similar existing icon if available

Accent:

```text
Gold
```

Progress:

```text
83%
```

The value must come from actual dashboard data.

---

# 14. STAT CARD: BRAIN PRACTICE

Content:

```text
Brain Practice

4 Played

88% accuracy
```

Icon:

```text
Brain
```

Accent:

```text
Purple
```

Use purple carefully.

The card should still remain primarily dark.

---

# 15. STAT CARD: MEMORY VAULT

Content:

```text
Memory Vault

6 Saved

Photos and stories
```

Icon:

```text
Book / Memory
```

Accent:

```text
Green
```

Use actual memory count from existing data.

---

# 16. STAT CARD: CAREGIVER SYNC

Content:

```text
Caregiver Sync

Active

Connected & Safe
```

Icon:

```text
Users
```

Accent:

```text
Pink
```

Use actual caregiver connection state.

---

# 17. STAT CARD VISUAL DESIGN

Each card should contain:

```text
┌─────────────────────────────┐
│  [ICON]                     │
│                             │
│  CATEGORY                   │
│                             │
│  LARGE VALUE                │
│                             │
│  description                │
│                             │
│  ━━━━━━━━━━━━━━━            │
└─────────────────────────────┘
```

### Card styling

```text
background: #1D1D1D
border: 1px solid #343434
border-radius: 14px
```

Avoid heavy box shadows.

Use subtle elevation.

---

# 18. PROGRESS BAR

Progress bars should have:

### Track

```text
#0F0F0F
```

### Fill

Accent-specific.

Gold:

```text
#F0C75E
```

Purple:

```text
purple accent
```

Green:

```text
#45B982
```

Pink:

```text
pink accent
```

Use rounded ends.

Keep the progress bar thin and elegant.

---

# 19. QUICK ACCESS SECTION

After statistics:

```text
Quick Access
```

Section heading should use the same typography system.

Create three cards:

```text
AI Companion
Memory Vault
Daily Reminders
```

---

# 20. AI COMPANION QUICK ACCESS CARD

Content:

```text
AI Companion

Have a natural voice or text
conversation with Memora anytime.

Start Conversation →
```

Icon:

- Chat / AI icon

Icon container:

- Gold-tinted dark background
- Gold icon

Click:

- Navigate to existing AI companion/conversation page.

---

# 21. MEMORY VAULT QUICK ACCESS CARD

Content:

```text
Memory Vault

Revisit your family photographs,
stories, and personal memories.

Explore Vault →
```

Click:

- Navigate to existing Memories page.

---

# 22. DAILY REMINDERS QUICK ACCESS CARD

Content:

```text
Daily Reminders

View and add medications,
appointments, and daily routines.

View Schedule →
```

Click:

- Navigate to existing Reminders page.

---

# 23. QUICK ACCESS CARD LAYOUT

Each card should contain:

```text
[ICON]

Title

Description


CTA                                  →
```

The arrow should sit toward the lower/right area.

Use:

```text
background: #1D1D1D;
border: 1px solid #343434;
border-radius: 12px–14px;
```

Hover:

- Slight elevation
- Slight gold border transition
- No dramatic scaling

Animation duration:

```text
150–250ms
```

---

# 24. LOWER CONTENT GRID

Below Quick Access, create:

```text
Today's Schedule             Recent Activity
```

Desktop:

```text
approximately 60% / 40%
```

Tablet/mobile:

```text
stack vertically
```

---

# 25. TODAY'S SCHEDULE CARD

Header:

```text
Today's Schedule                         View All
```

Include a calendar icon.

Use actual reminder/schedule data.

Each item should show:

```text
Time
Activity
Description
Status/accent indicator
```

Example:

```text
09:00 AM
Medicine
Vitamin B12

11:30 AM
Recall Activity
Photo memory game

04:00 PM
Evening Walk
30 mins with caregiver
```

These are visual examples only.

Do not hardcode them if the application already has schedule data.

---

# 26. TIMELINE DESIGN

Create a vertical timeline.

Example:

```text
09:00 AM      ●
              │
              │  Medicine
              │  Vitamin B12

11:30 AM      ●
              │
              │  Recall Activity
              │  Photo memory game

04:00 PM      ●

                 Evening Walk
                 30 mins with caregiver
```

Use subtle vertical lines.

Activity dots can use the relevant accent color.

Do not use blue dots.

---

# 27. RECENT ACTIVITY CARD

Header:

```text
Recent Activity                         View All
```

Activity rows:

```text
[ICON]  New memory added by Caregiver
        Family trip to Manali                    2h ago

[ICON]  Brain practice completed
        Puzzle Master                             5h ago

[ICON]  Reminder completed
        Morning medicine                          1d ago
```

Use actual activity data when available.

---

# 28. ACTIVITY ROW DESIGN

Each activity should contain:

- Small accent icon container
- Title
- Secondary description
- Timestamp

Use subtle horizontal separators.

Do not overdecorate.

---

# 29. ICON SYSTEM

Use one consistent icon library.

Preferred:

```text
Lucide React
```

if already installed or compatible with the existing project.

Do not mix:

- Font Awesome
- random SVG icons
- emoji
- multiple icon libraries

without a specific reason.

Typical icon size:

```text
18–22px
```

---

# 30. TYPOGRAPHY SYSTEM

Use:

```text
Montserrat
```

or a visually similar modern geometric sans-serif.

Avoid:

- Times New Roman
- Default serif
- Inconsistent font families
- Excessive font weights

---

## Typography Scale

### Date

```text
12–14px
uppercase
medium
letter spacing
```

### Main Heading

```text
40–48px
font-weight: 500–600
```

### Section Heading

```text
22–26px
font-weight: 500–600
```

### Card Title

```text
16–19px
font-weight: 500–600
```

### Stat Value

```text
30–38px
font-weight: 500–600
```

### Body

```text
14–16px
```

### Metadata

```text
12–13px
```

---

# 31. BORDER RADIUS

Use moderate rounding.

Recommended:

```text
Buttons: 10–12px
Cards: 12–14px
Inputs: 10px
Icon containers: 10–12px
```

Do not make every component a pill.

---

# 32. SHADOWS

Use shadows sparingly.

The reference design relies more on:

- contrast
- borders
- spacing
- surface elevation

than huge shadows.

Avoid:

```text
large dark shadows
neon glows
strong outer glow
```

---

# 33. BACKGROUND DETAILS

The reference has subtle decorative visual elements.

If decorative elements are used:

- Keep them extremely subtle.
- Use low-opacity gold.
- Keep them away from important controls.
- Never let decoration reduce readability.

Decorative graphics must never become the primary visual focus.

---

# 34. RESPONSIVE DESIGN

## Desktop: 1440px+

Target the reference layout closely.

Sidebar:

```text
~280px
```

Main content:

```text
remaining viewport width
```

Stats:

```text
4 columns
```

Quick Access:

```text
3 columns
```

Bottom section:

```text
2 columns
```

---

## Laptop: 1024–1280px

Reduce:

- Main padding
- Card gaps
- Heading size

Maintain:

```text
4 stat columns
```

if space permits.

Otherwise move to:

```text
2 × 2
```

---

## Tablet: 768–1023px

Use:

```text
2 × 2 stats
```

Quick Access:

```text
2 columns
```

Bottom:

```text
1 column
```

Sidebar may become collapsible.

---

## Mobile: below 768px

Sidebar becomes:

```text
drawer / mobile menu
```

Stats:

```text
1 column
```

Quick Access:

```text
1 column
```

Schedule:

```text
1 column
```

Activity:

```text
1 column
```

Greeting:

```text
stack vertically
```

Talk to Memora:

```text
full-width or near full-width
```

Do not allow horizontal scrolling.

---

# 35. ACCESSIBILITY

Memora is designed for users who may experience cognitive difficulties.

The dashboard must prioritize:

- Readable typography
- High contrast
- Clear labels
- Large click targets
- Predictable navigation
- Consistent layout
- Simple visual hierarchy
- Minimal distractions

Interactive elements should have visible focus states.

Avoid interactions that depend only on color.

---

# 36. DATA REQUIREMENTS

The dashboard must remain dynamic.

Never hardcode sample values from the screenshot.

Do not hardcode:

```text
Vivek
83%
5 of 6
4 Played
88%
6 Saved
Active
```

These are reference values only.

Use:

- Authenticated user data
- Memory count
- Reminder data
- Game statistics
- Caregiver status
- Activity history
- Existing API responses

---

# 37. EXISTING FUNCTIONALITY

Preserve all existing dashboard functionality.

Do not break:

- Navigation
- Authentication
- Logout
- User data
- Memory counts
- Reminder counts
- Game statistics
- Caregiver status
- AI companion navigation
- API calls
- Notifications
- Existing route behavior

The redesign must operate on the existing application architecture.

---

# 38. COMPONENT REFACTORING

Before creating new components, inspect existing components.

Prefer reusable components such as:

```text
DashboardLayout
Sidebar
Header
PageHeader
StatCard
ProgressBar
QuickAccessCard
ScheduleCard
TimelineItem
ActivityCard
ActivityItem
Badge
Button
IconButton
```

If equivalent components already exist, refactor them rather than creating duplicates.

---

# 39. CSS / TAILWIND CLEANUP

Inspect:

```text
globals.css
index.css
App.css
tailwind.config.*
component CSS
CSS modules
inline styles
```

Remove obsolete dashboard styles.

Look for:

```text
old blue colors
old gradients
old shadows
old card classes
old button classes
old typography
old spacing
```

Do not leave dead styling that can accidentally affect the redesigned components.

---

# 40. STATE DESIGN

The dashboard should have polished states.

## Loading

Use dark-theme skeleton loaders.

Skeleton colors should remain subtle.

Example:

```text
#222222
```

with a restrained highlight.

---

## Empty State

Example:

```text
No recent activity

Your recent activity will appear here.
```

Use the same premium dark style.

---

## Error State

Example:

```text
Unable to load your dashboard

Please try again.
```

Use danger color only for the error indicator.

Do not turn the entire component red.

---

# 41. INTERACTION DESIGN

Use subtle transitions:

```text
150–250ms
```

For:

- Hover
- Focus
- Active states
- Card transitions
- Button transitions
- Sidebar selection

Avoid:

- bouncing
- excessive scale
- flashy transitions
- distracting animations

Memora should feel calm and predictable.

---

# 42. ROUTING

Do not change existing route paths unless absolutely necessary.

CTA navigation should use existing routes.

For example:

```text
Talk to Memora → existing conversation/AI route
Start Conversation → existing conversation route
Explore Vault → existing memories route
View Schedule → existing reminders route
View All → existing corresponding pages
```

Use the project's existing routing system.

---

# 43. PERFORMANCE

Do not introduce unnecessary dependencies.

Prefer existing libraries.

Avoid:

- huge animation libraries for tiny effects
- duplicate icon packages
- unnecessary UI frameworks
- unnecessary state management

The dashboard should load efficiently.

---

# 44. FINAL QA CHECKLIST

After implementation, inspect the actual rendered dashboard.

## Layout

- [ ] Sidebar has correct width.
- [ ] Sidebar remains visually stable.
- [ ] Main content has correct spacing.
- [ ] Header is aligned correctly.
- [ ] Greeting is aligned correctly.
- [ ] Talk to Memora button is positioned correctly.
- [ ] Statistics form a clean grid.
- [ ] Quick Access forms a clean grid.
- [ ] Bottom section uses two columns on desktop.
- [ ] No unwanted horizontal scrolling.

## Visual

- [ ] Background is charcoal/dark.
- [ ] Gold is the primary Memora accent.
- [ ] No accidental blue remains.
- [ ] Cards use consistent borders.
- [ ] Cards use consistent radius.
- [ ] Typography is consistent.
- [ ] Icons are consistent.
- [ ] Progress bars match their card accents.
- [ ] Shadows are subtle.
- [ ] Spacing is consistent.

## Functionality

- [ ] Sidebar navigation works.
- [ ] Profile navigation works.
- [ ] Memories navigation works.
- [ ] Conversations navigation works.
- [ ] Reminders navigation works.
- [ ] Safety & SOS navigation works.
- [ ] Games navigation works.
- [ ] Community navigation works.
- [ ] Meeting Circle navigation works.
- [ ] Logout works.
- [ ] Talk to Memora works.
- [ ] Quick Access buttons work.
- [ ] View All buttons work.
- [ ] Dynamic data still loads.

## Technical

- [ ] No console errors.
- [ ] No React warnings.
- [ ] No broken imports.
- [ ] No missing assets.
- [ ] No 404 errors caused by the redesign.
- [ ] No unused duplicate dashboard components where safely removable.
- [ ] No unnecessary backend changes.
- [ ] No API contract changes.

---

# 45. VISUAL COMPARISON

After implementing the dashboard, compare the rendered result against the attached reference image.

Evaluate:

### Sidebar

Does it have the same visual weight?

### Header

Does the top area feel equally minimal?

### Greeting

Does the heading have the same visual dominance?

### CTA

Is the gold Talk to Memora button visually prominent?

### Stat Cards

Are the four cards evenly sized and spaced?

### Quick Access

Do the three cards have similar proportions?

### Bottom Section

Does the Schedule + Activity arrangement resemble the reference?

### Overall

Does the dashboard feel like the same product family?

---

# 46. DO NOT OVER-IMPLEMENT

Do not add features that aren't already part of the dashboard.

Do not add:

- Analytics graphs
- Financial charts
- News feeds
- Social media widgets
- Weather
- Unrelated statistics
- Extra games
- Complex animations
- Cryptocurrency-style dashboards
- Generic SaaS metrics

The dashboard should remain focused on:

```text
Memory
Care
Routine
Conversation
Safety
Connection
```

---

# 47. IMPLEMENTATION ORDER

Follow this order:

### Step 1

Inspect the existing dashboard and its imported components.

### Step 2

Identify the current layout structure.

### Step 3

Identify all legacy blue components/styles.

### Step 4

Identify reusable components.

### Step 5

Create/update the Memora design tokens.

### Step 6

Redesign the global dashboard shell:

```text
Sidebar
Header
Main content
```

### Step 7

Redesign the greeting section.

### Step 8

Redesign statistics cards.

### Step 9

Redesign Quick Access.

### Step 10

Redesign Today's Schedule.

### Step 11

Redesign Recent Activity.

### Step 12

Implement responsive behavior.

### Step 13

Test all interactions and dynamic data.

### Step 14

Search again for old blue styling.

### Step 15

Fix console errors/warnings.

### Step 16

Perform final visual comparison against the reference.

---

# 48. IMPORTANT FINAL INSTRUCTION

**Do not stop when the dashboard merely has the correct colors.**

The redesign must reproduce the visual composition of the reference:

```text
Premium dark foundation
        ↓
Warm gold branding
        ↓
Elegant typography
        ↓
Fixed navigation
        ↓
Large greeting
        ↓
Four metric cards
        ↓
Quick Access cards
        ↓
Schedule timeline
        ↓
Recent activity
```

The result should look intentionally designed, not like the old dashboard with its colors swapped.

---

# 49. DEFINITION OF DONE

The dashboard redesign is complete only when all of the following are true:

- [ ] Reference-inspired layout implemented.
- [ ] Sidebar redesigned.
- [ ] Header redesigned.
- [ ] Greeting redesigned.
- [ ] Talk to Memora CTA redesigned.
- [ ] Four statistics cards redesigned.
- [ ] Quick Access redesigned.
- [ ] Today's Schedule redesigned.
- [ ] Recent Activity redesigned.
- [ ] Typography upgraded.
- [ ] Montserrat or equivalent modern font used.
- [ ] Dark charcoal theme implemented.
- [ ] Gold is the primary Memora accent.
- [ ] Purple/green/pink accents are used sparingly.
- [ ] Old blue styling completely removed.
- [ ] Existing data remains dynamic.
- [ ] Existing APIs remain intact.
- [ ] Existing routes remain intact.
- [ ] Existing functionality remains intact.
- [ ] Responsive behavior works.
- [ ] Accessibility is respected.
- [ ] Loading states are redesigned.
- [ ] Empty states are redesigned.
- [ ] Error states are redesigned.
- [ ] No console errors.
- [ ] No broken navigation.
- [ ] No unnecessary duplicate components.
- [ ] No unnecessary backend changes.

## Final Principle

> **Preserve the brain of Memora. Redesign its face.**

The backend, data, logic, and functionality are already the application's foundation.

This task is about giving that foundation a cohesive, premium, polished interface that matches the attached Memora dashboard reference.
