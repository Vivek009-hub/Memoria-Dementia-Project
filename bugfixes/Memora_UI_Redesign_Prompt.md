# MEMORA UI REDESIGN / VISUAL REFACTOR PROMPT

## ROLE

You are working on an EXISTING, FULLY FUNCTIONAL project called **Memora**.

Your job is to perform a **frontend visual redesign only**.

The target aesthetic is the attached reference design: a premium, understated dark interface with warm yellow/mustard accents, clean sans-serif typography, generous spacing, subtle borders, and polished photography.

**IMPORTANT: Memora's existing functionality is already implemented. DO NOT rebuild the application. DO NOT replace the backend. DO NOT redesign the architecture.**

Your goal is:

> **Keep all existing functionality exactly as it is, but make the frontend visually resemble the approved Memora reference design.**

---

# 1. FIRST: INSPECT THE EXISTING PROJECT

Before changing anything:

1. Inspect the complete frontend folder structure.
2. Identify:
   - Framework and build tool
   - Routing
   - Global CSS / Tailwind configuration
   - Component structure
   - Existing layout components
   - Navbar/sidebar
   - Dashboard
   - Memories
   - AI companion/conversation
   - Reminders
   - SOS
   - Geofencing
   - Caregiver/admin pages
   - Authentication pages
   - Any games/cognitive sections
3. Identify reusable components that already exist.
4. Identify existing API calls, hooks, state management, authentication logic and backend integrations.
5. Understand the current responsive behavior.

ONLY AFTER understanding the existing codebase should you begin the visual refactor.

---

# 2. ABSOLUTE RULE: DO NOT BREAK FUNCTIONALITY

This is a UI redesign, NOT a feature-development task.

Do NOT:

- Change backend code
- Change database schemas
- Change API endpoints
- Change authentication logic
- Change authorization/roles
- Change existing routes
- Remove existing features
- Rename API response fields
- Change request/response formats
- Replace working API calls with mock data
- Remove existing state management
- Remove existing business logic
- Replace working components unnecessarily
- Hardcode fake dashboard information
- Create fake functionality just to make the UI look complete

If a component already works, **restyle/refactor its presentation rather than rebuilding its logic**.

If functionality and styling are mixed together, separate the visual layer carefully while preserving the existing behavior.

---

# 3. CORE DESIGN DIRECTION

The design should feel:

**Premium**
**Minimal**
**Warm**
**Calm**
**Human**
**Sophisticated**
**Accessible**
**Modern**

It should NOT feel:

- Futuristic
- Cyberpunk
- Overly technological
- Like a generic AI SaaS dashboard
- Like a crypto dashboard
- Like a gaming dashboard
- Like a glassmorphism template
- Like an overly decorative healthcare template

The AI should be powerful underneath the interface, but the interface itself should feel calm and familiar.

Think:

> **A premium personal memory/journal application with AI quietly built into it.**

---

# 4. REFERENCE DESIGN

Use the attached visual reference as the primary design direction.

The reference combines:

- A charcoal/dark workspace
- A compact left sidebar
- Warm yellow accents
- Clean geometric sans-serif typography
- Rounded but restrained cards
- Subtle borders
- Large amounts of whitespace
- Photography-heavy memory cards
- Simple line icons
- Minimal visual noise
- Strong alignment and spacing
- Clear hierarchy

Use the reference as inspiration for the visual language, NOT as something to copy pixel-for-pixel.

---

# 5. COLOR SYSTEM

Create a consistent global color system.

### Primary background

```text
#1E1E1E
```

### Sidebar / deep surface

```text
#1B1B1B
```

### Surface

```text
#252525
```

### Secondary surface

```text
#2A2A2A
```

### Borders

```text
#343434
```

### Primary text

```text
#E8E8E8
```

### Secondary text

```text
#A0A0A0
```

### Muted text

```text
#747474
```

### Primary accent

```text
#DDBB55
```

### Accent hover

```text
#E8C968
```

### Accent background

```text
rgba(221, 187, 85, 0.10)
```

### Danger / SOS

```text
#C95C5C
```

### Success

```text
#8BAA78
```

Do not introduce random colors throughout the application.

The yellow should be **muted mustard/gold**, not neon yellow.

Use yellow sparingly for:

- Active navigation
- Primary CTA
- Important indicators
- Selected states
- Small accents
- Progress indicators
- Important icons

Do NOT make large areas yellow unless specifically appropriate.

---

# 6. TYPOGRAPHY

## PRIMARY FONT: MONTSERRAT

Use **Montserrat** throughout the application.

If the project already uses another font, replace it with Montserrat where practical.

Import/use:

- 400 Regular
- 500 Medium
- 600 SemiBold
- 700 Bold only when genuinely necessary

### Typography rules

Page titles:
```text
32–40px
font-weight: 500–600
```

Section titles:
```text
20–24px
font-weight: 500–600
```

Body:
```text
14–16px
font-weight: 400
```

Small labels:
```text
12–14px
font-weight: 400–500
```

Buttons:
```text
14–15px
font-weight: 500–600
```

### VERY IMPORTANT

Do NOT use:

- Times New Roman
- Georgia
- Playfair Display
- Any serif font
- Decorative handwritten fonts
- Futuristic fonts

The entire interface should have a **clean Montserrat-style geometric sans-serif appearance**.

If Montserrat is technically inconvenient in the existing setup, use a close geometric sans-serif fallback such as:

```text
Montserrat, Manrope, Inter, sans-serif
```

---

# 7. GENERAL UI PRINCIPLES

## LESS IS MORE

Do not put everything inside a card.

Use:

- whitespace
- typography
- dividers
- alignment
- subtle backgrounds

to establish hierarchy.

Avoid:

```text
Card
  -> Card
      -> Card
          -> Button
```

Instead prefer:

```text
Heading
Content
Divider
Content
```

---

# 8. CARDS

Cards should be:

- Dark
- Subtle
- Elegant
- Functional

Recommended:

```text
background: #252525
border: 1px solid #343434
border-radius: 10–14px
```

Avoid extremely rounded cards.

Do NOT use:

```text
border-radius: 30px+
```

unless there is a specific reason.

Avoid excessive shadows.

If shadows are used, they should be extremely subtle.

---

# 9. NO EXCESSIVE AI VISUAL EFFECTS

Do NOT add:

- Neon glows
- Purple/blue AI gradients
- Glowing orbs
- Floating blobs
- Excessive glassmorphism
- Holographic effects
- Animated particle backgrounds
- AI sparkles everywhere
- Excessive waveform animations
- Huge gradient text

Memora should look expensive because of:

**spacing + typography + photography + consistency + restraint**

not because of visual effects.

---

# 10. SIDEBAR

Redesign the existing navigation into a clean premium sidebar inspired by the reference.

Structure should feel approximately like:

```text
MEMORA

Home
Memories
Conversations
Reminders
SOS

----------------

Caregiver
Settings
Help & Support
```

Use simple line icons.

The active navigation item should have:

- subtle darker/lighter surface
- muted yellow icon
- muted yellow text
- small yellow indicator if appropriate

Do NOT create huge navigation buttons.

Keep the sidebar compact and elegant.

---

# 11. DASHBOARD

Redesign the existing dashboard while preserving every existing piece of functionality.

The visual hierarchy should roughly be:

```text
Good morning

Short supporting sentence

[ Main Memora conversation area ]   [ Today's reminders ]

Recent memories

[ memory ] [ memory ] [ memory ] [ memory ]

Today's schedule / activity
```

The dashboard should not become an analytics dashboard.

Avoid meaningless metrics such as:

- AI score
- cognitive intelligence score
- engagement score
- performance percentage

unless those metrics already exist as genuine Memora functionality.

Prioritize useful human information:

- memories
- conversations
- reminders
- daily activities
- schedules
- important notifications
- caregiver information

---

# 12. AI COMPANION / CONVERSATION PAGE

This is one of Memora's most important experiences.

Make it calm and extremely simple.

Avoid making it look like ChatGPT.

Preferred visual direction:

```text
Talk to Memora

Good morning.
How are you feeling today?

                [ microphone ]

              Tap to talk
```

When the user is speaking/listening, use a subtle visual state.

Keep existing voice functionality completely intact.

If the existing system supports:

- reminders from conversation
- routine awareness
- contextual memory
- agentic actions
- natural language interaction

DO NOT CHANGE ANY OF THAT.

Only redesign how those states are displayed.

---

# 13. MEMORY PAGE

Make Memories feel like a premium personal photo journal.

Use existing uploaded/local images whenever available.

Memory cards should prioritize:

1. Image
2. Memory title
3. Short description
4. Date
5. Number of photos / relevant metadata

Example visual hierarchy:

```text
[ PHOTO ]

Dinner with family
Yesterday · 5 photos
```

Avoid excessive badges.

Avoid fake AI labels such as:

```text
AI GENERATED
AI MEMORY
AI POWERED
```

unless they already exist and are functionally necessary.

---

# 14. REMINDERS

Keep reminders visually clean.

Example:

```text
Today's reminders

Medicine                         8:00 AM     ✓
Drink water                     11:00 AM     ○
Evening walk                     5:30 PM     ○
```

Use subtle separators.

Yellow can indicate completed/active states.

Do not create huge colorful reminder cards.

---

# 15. SOS

The SOS feature is functionally important and should remain visually distinct.

Use the existing SOS behavior.

Use the red accent only for emergency-related UI.

Keep it extremely clear.

Example:

```text
Emergency assistance

Are you in danger?

        [ SOS ]

Press and hold to activate
```

After activation, show the existing status information clearly.

Do NOT make SOS visually confusing or decorative.

---

# 16. GEOFENCING

Preserve all existing geofencing functionality.

Redesign:

- safe zones
- current location state
- alerts
- geofence status
- caregiver notifications

using the same Memora design system.

Do not turn the map into a futuristic neon map.

Keep it clean and readable.

---

# 17. CAREGIVER / ADMIN UI

Apply the same design system to caregiver/admin pages.

However, these pages can contain more information because they serve a management purpose.

Use:

- clean tables
- subtle filters
- compact cards
- clear status indicators
- simple charts only where useful
- consistent spacing

Do not turn them into generic enterprise dashboards.

---

# 18. BUTTONS

Primary button:

```text
background: #DDBB55
color: #1E1E1E
border-radius: 8px
font-weight: 600
```

Example:

```text
Start a conversation →
```

Secondary button:

```text
background: transparent
border: 1px solid #444
color: #E8E8E8
```

Hover should be subtle.

Do not use oversized pill buttons everywhere.

---

# 19. INPUTS

Inputs should feel integrated with the dark interface.

Use:

```text
background: #252525
border: 1px solid #383838
border-radius: 8px
color: #E8E8E8
```

Focus:

```text
border-color: #DDBB55
```

Keep focus states accessible.

---

# 20. ICONOGRAPHY

Use one consistent icon library if one already exists.

If the project already uses Lucide or a similar line-icon library, continue using it.

Icons should be:

- Thin/medium stroke
- Simple
- Monochrome by default
- Yellow only when active/important

Avoid mixing:

- emojis
- 3D icons
- colorful illustrations
- multiple icon styles

throughout the same interface.

---

# 21. IMAGES

Photography is an important part of Memora's aesthetic.

For memory images:

- Preserve aspect ratios where appropriate.
- Use tasteful cropping.
- Avoid excessive overlays.
- Use subtle dark gradients only when text must sit over an image.
- Keep image quality high.

Do NOT replace real user images with random stock/AI images.

If an image is missing, use the existing application's empty state.

---

# 22. ANIMATIONS

Use very subtle animations.

Good:

- 150–250ms hover transitions
- subtle card hover
- smooth sidebar transitions
- gentle modal transitions
- subtle microphone/listening state

Avoid:

- bouncing UI
- excessive scaling
- spinning cards
- dramatic page transitions
- animated gradients
- particle effects

The interface should feel calm.

---

# 23. RESPONSIVENESS

The redesign must work on:

- Desktop
- Laptop
- Tablet
- Mobile

Do not simply shrink the desktop UI.

On mobile:

- sidebar should become a mobile navigation/drawer/bottom navigation depending on existing architecture
- cards should stack naturally
- memory grids should adapt
- buttons should remain usable
- typography should scale appropriately
- no horizontal scrolling

Preserve all existing functionality on mobile.

---

# 24. ACCESSIBILITY

Because Memora is designed around elderly users and caregivers:

Prioritize:

- readable text
- strong contrast
- large enough interactive targets
- clear focus states
- understandable labels
- simple navigation
- minimal visual clutter

Do not make text tiny just to fit more information.

---

# 25. DESIGN SYSTEM

Before modifying dozens of components, create/reuse a consistent design system.

Centralize:

- colors
- typography
- spacing
- border radius
- shadows
- buttons
- inputs
- cards
- navigation states

If Tailwind is already being used, update the Tailwind theme/config where appropriate rather than scattering arbitrary colors across components.

Avoid hundreds of inconsistent one-off values.

---

# 26. DO NOT OVERDESIGN

This is extremely important.

The target is:

**EXPENSIVE + AESTHETIC + SIMPLE**

NOT:

**EXPENSIVE + AESTHETIC + OVERDECORATED**

Avoid:

- excessive cards
- excessive borders
- excessive icons
- excessive yellow
- excessive animations
- excessive gradients
- excessive text
- excessive rounded corners

The UI should have breathing room.

---

# 27. IMPORTANT: PRESERVE EXISTING DATA

If the existing dashboard currently receives:

```text
user data
memories
reminders
events
notifications
conversation history
caregiver information
```

continue rendering the real data.

Do not replace it with example content from the visual reference.

The reference names such as "Anita", "Trip to Jaipur", etc. are ONLY visual examples.

Use actual authenticated user data and existing API data.

---

# 28. IMPLEMENTATION STRATEGY

Work in this order:

### STEP 1
Inspect the project.

### STEP 2
Identify the existing design system / styling architecture.

### STEP 3
Create the global Memora visual theme.

### STEP 4
Update typography.

### STEP 5
Update global colors/backgrounds.

### STEP 6
Redesign the application shell/sidebar/navigation.

### STEP 7
Redesign the dashboard.

### STEP 8
Redesign Memories.

### STEP 9
Redesign Conversations / AI Companion.

### STEP 10
Redesign Reminders.

### STEP 11
Redesign SOS.

### STEP 12
Redesign Geofencing.

### STEP 13
Redesign caregiver/admin pages.

### STEP 14
Update authentication/onboarding screens.

### STEP 15
Check responsive layouts.

### STEP 16
Run the application and verify that all existing functionality still works.

---

# 29. QUALITY CHECK AFTER IMPLEMENTATION

Before considering the work complete, verify:

- Application builds successfully.
- No existing routes are broken.
- Login still works.
- Registration still works.
- Authentication still works.
- Existing API calls still work.
- Memories still load.
- Images still load.
- Memory creation still works.
- Conversations still work.
- AI companion still works.
- Voice functionality still works if already implemented.
- Reminders still work.
- Agentic reminder/routine functionality still works if already implemented.
- SOS still works.
- Geofencing still works.
- Caregiver functionality still works.
- Admin functionality still works.
- Existing games/cognitive features still work if they exist.
- Mobile layout works.
- No console errors were introduced.
- No mock data replaced real data.

---

# 30. FINAL VISUAL TEST

After implementation, compare the application against the reference design and ask:

### Does it feel:

- Calm?
- Premium?
- Minimal?
- Warm?
- Human?
- Consistent?
- Modern?

### Does it avoid:

- Generic AI dashboard appearance?
- Purple/blue SaaS styling?
- Excessive gradients?
- Glassmorphism?
- Neon effects?
- Serif typography?
- Huge rounded cards?
- Excessive yellow?
- Excessive animations?

If not, simplify it further.

---

# FINAL INSTRUCTION

**Do not rebuild Memora.**

This is a **visual transformation of an existing working product**.

Preserve the existing architecture, business logic, backend, APIs, database, authentication, routes, state management and functionality.

Change the visual layer to create a premium Memora experience inspired by the supplied reference:

> **Dark charcoal + muted mustard yellow + Montserrat + subtle borders + restrained cards + beautiful photography + generous whitespace + simple line icons + calm interactions.**

The final result should look like a product designed by a strong professional product designer, not a template generated by an AI.

When making design decisions, choose **restraint over decoration**.

When choosing between adding another visual element and leaving more whitespace, **leave the whitespace**.
