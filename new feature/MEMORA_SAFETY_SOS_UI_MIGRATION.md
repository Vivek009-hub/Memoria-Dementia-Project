# MEMORA – SAFETY & SOS PAGE DESIGN MIGRATION

## TASK

The Safety and SOS/Emergency pages inside the Patient Portal are still using the old legacy UI styling.

Update these pages so they fully match the CURRENT Memora Patient Portal design system.

The current design direction is:

```text
Premium
Modern
Minimal
High-contrast
Black / Dark theme
Yellow accent
Elegant
Accessible
Elder-friendly
```

## IMPORTANT

**START MODIFYING THE CODE DIRECTLY. DO NOT ONLY GIVE ME A DESIGN PLAN OR SUMMARY.**

Do not change the functionality or business logic of the Safety and SOS features.

This task is primarily a UI/UX migration and styling consistency update.

---

# 1. INSPECT THE CURRENT DESIGN SYSTEM FIRST

Before modifying the Safety and SOS pages, inspect the existing updated Patient Portal pages that already use the new black and yellow design.

Use the current working pages as the visual source of truth.

Inspect:

- Dashboard
- Memories
- Games
- Reminders
- Community
- Meeting Circle
- AI Companion
- Profile

Identify and reuse the existing:

- Background colors
- Surface/card colors
- Yellow accent colors
- Typography
- Border styles
- Border radius
- Shadows
- Button styles
- Input styles
- Icon styling
- Spacing system
- Hover states
- Responsive behavior

## CRITICAL

Do NOT invent a separate design system for Safety and SOS.

Reuse the exact current Memora design tokens, components, classes, and styling patterns wherever possible.

---

# 2. REMOVE OLD LEGACY STYLING

Find all old styling used specifically in:

```text
Safety Page
SOS Page
Emergency Page
Emergency Contact components
Safety Status components
SOS Modal/Dialog
Emergency buttons
```

Remove visual inconsistencies such as:

- Old blue colors
- Old purple colors
- Old gradients
- Old card styles
- Old button styles
- Old typography
- Legacy shadows
- Different border radius
- Inconsistent spacing
- Legacy icon containers

Do not remove working functionality.

Only replace outdated visual styling.

---

# 3. CURRENT MEMORA VISUAL DIRECTION

The Safety and SOS pages must visually feel like part of the same application as the current Patient Portal.

Use the existing project color palette.

Conceptually:

```text
Primary Background
→ Deep Black / Near Black

Secondary Surfaces
→ Dark charcoal / dark neutral

Primary Accent
→ Existing Memora Yellow

Primary Text
→ White / warm off-white

Secondary Text
→ Muted gray

Borders
→ Existing subtle dark neutral borders
→ Yellow emphasis where appropriate
```

## IMPORTANT

Do not randomly choose new shades.

Inspect the existing current components and reuse their exact colors, Tailwind classes, CSS variables, or theme tokens.

---

# 4. SAFETY PAGE REDESIGN

Update the Safety page to match the current premium black and yellow design.

The page should feel:

```text
Calm
Trustworthy
Premium
Clear
Non-cluttered
Accessible
```

Do NOT make the entire page aggressively red or danger-themed.

Safety monitoring should feel reassuring.

Use yellow accents consistently with the rest of Memora.

---

# 5. SOS / EMERGENCY PAGE REDESIGN

The SOS feature is an emergency feature, so visual hierarchy is extremely important.

Keep the current Memora black and yellow design system.

Allow emergency actions to have controlled danger emphasis only where necessary.

Example hierarchy:

```text
Normal Interface
→ Black / dark surfaces

Primary Memora Actions
→ Yellow

Emergency / destructive action
→ Controlled red emphasis only for critical emergency actions
```

Do NOT turn the entire SOS page red.

The emergency trigger should stand out clearly while the surrounding interface remains consistent with the Memora design system.

---

# 6. SOS BUTTON

The SOS trigger must be visually prominent and accessible.

Requirements:

- Large touch target
- Clear text label
- High contrast
- Elder-friendly
- Impossible to miss
- Consistent with the current Memora design

Do not use the old legacy button design.

Use the current Memora button styling as the foundation.

The SOS action may use danger styling, but it must still visually belong to the black and yellow Memora ecosystem.

---

# 7. SAFETY STATUS CARDS

If the page contains information such as:

- Current location
- Location sharing
- Emergency contacts
- Caregiver connection
- Safety monitoring
- Last known activity
- Emergency status

Redesign these cards using the SAME card system already used in the updated Patient Dashboard.

Requirements:

- Dark surface
- Existing border radius
- Existing padding
- Existing typography system
- Yellow accent details
- Existing icon style
- Proper spacing
- Responsive layout

Do not create a completely different card design.

---

# 8. EMERGENCY CONTACTS

Redesign emergency contact sections to match the current Memora UI.

Each contact card should use the existing dark premium card style.

Preserve existing functionality including:

- View contact
- Add contact
- Edit contact
- Delete contact
- Call/contact action

Do not break backend integration.

Do not replace real backend data with dummy contacts.

---

# 9. FORMS AND MODALS

Any Safety or SOS forms, popups, dialogs, or modals still using the old UI must also be updated.

Examples:

```text
Add Emergency Contact
Edit Emergency Contact
Confirm SOS
Location Permission
Emergency Confirmation
Delete Contact Confirmation
```

All of these must match the current Memora design system.

Reuse existing:

- Modal styling
- Inputs
- Buttons
- Dropdowns
- Typography
- Borders
- Spacing

Do not leave popups in the old legacy design while updating only the main page.

---

# 10. ICON CONSISTENCY

Inspect the icons used throughout the new Patient Portal.

Use the same icon library and styling for:

- Safety
- Shield
- SOS
- Emergency contacts
- Location
- Phone
- Caregiver
- Alert
- Warning

Do not mix multiple unrelated icon styles.

Maintain consistency in:

- Icon size
- Stroke weight
- Icon containers
- Accent colors

---

# 11. ELDER-FRIENDLY ACCESSIBILITY

Memora is designed for dementia patients and elderly users.

The Safety and SOS pages must remain easy to understand and operate.

Ensure:

- Large readable text
- Clear labels
- Large buttons
- Adequate spacing
- High contrast
- No tiny icon-only critical actions
- Important actions include text labels
- Emergency action is easy to find
- Confirmation dialogs use simple language

Do not sacrifice accessibility for visual minimalism.

---

# 12. RESPONSIVE DESIGN

Ensure the redesigned pages work correctly on:

```text
Desktop
Laptop
Tablet
Mobile
```

Check:

- Card stacking
- Button sizes
- SOS button visibility
- Modal responsiveness
- Emergency contacts layout
- Text overflow
- Navigation interaction

Do not break the mobile Patient Portal UI.

---

# 13. REUSE EXISTING COMPONENTS

Before creating new components, inspect whether the updated Patient Portal already has reusable:

- Cards
- Buttons
- Page headers
- Section headers
- Modals
- Inputs
- Empty states
- Loading states

Reuse them wherever possible.

Do not duplicate components unnecessarily.

---

# 14. DO NOT CHANGE FUNCTIONALITY

Preserve all existing functionality including:

- SOS trigger
- Emergency workflow
- Location functionality
- Emergency contacts
- Caregiver connection
- Backend API calls
- Authentication
- Patient data
- Notifications

Do not rewrite backend logic unless absolutely necessary to fix a UI integration issue.

This task is primarily a UI migration.

---

# 15. REMOVE ALL OLD STYLE REFERENCES

Search specifically for legacy styling affecting Safety and SOS pages.

Check:

- Component-level CSS
- Tailwind classes
- Inline styles
- Old theme constants
- Old reusable components
- Modal styles
- Button variants

Ensure the old visual theme is no longer leaking into these pages.

---

# 16. VISUAL CONSISTENCY CHECK

After implementation compare:

```text
Patient Dashboard
        ↓
Safety Page
        ↓
SOS Page
```

They should feel like they belong to the exact same application.

Check consistency in:

```text
Background
Typography
Colors
Cards
Buttons
Borders
Spacing
Icons
Headers
Navigation
Modals
Forms
```

---

# 17. FUNCTIONAL REGRESSION TEST

After redesigning, test:

```text
Safety page loads
SOS page loads
Emergency contacts load
Add contact works
Edit contact works
Delete contact works
SOS trigger works
Location functionality works
Caregiver integration still works
Backend data still loads
Mobile layout works
```

Do not use dummy data to make the UI appear functional.

Use the existing backend integration.

---

# FINAL INSTRUCTION

START MODIFYING THE CODE NOW.

Do not give me a redesign proposal.

Do not only describe the changes.

Actually inspect the current updated Memora Patient Portal design and migrate the Safety and SOS pages from the old legacy style to the current premium black and yellow Memora design system.

The final result must:

```text
✓ Match the current Patient Portal design
✓ Use the existing black and yellow theme
✓ Remove legacy styling
✓ Preserve all functionality
✓ Preserve backend integration
✓ Keep SOS visually prominent
✓ Remain elder-friendly
✓ Work responsively
✓ Update all related modals and forms
```

---

# FINAL REPORT

After implementation, provide a short report:

```text
SAFETY & SOS UI MIGRATION REPORT

Pages Updated:
<list>

Components Updated:
<list>

Legacy Styles Removed:
<list>

Functionality Tested:
<list>

Responsive Testing:
PASS / PARTIAL / FAIL

Backend Integration:
PASS / PARTIAL / FAIL

Final Status:
PASS / PARTIAL / BLOCKED
```
