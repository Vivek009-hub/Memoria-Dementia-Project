# Memora — Design System & Elder-Friendly UI Specification

**Version:** 1.0  
**Phase:** F1 — Design System & Elder-Friendly UI  

---

## 1. Design Philosophy

Memora is built for elderly users, including individuals living with mild cognitive impairment (MCI) or dementia, as well as their family caregivers and medical administrators.

- **Simple:** Obvious controls, minimal steps.
- **Readable:** Large fonts (≥16px body text), high contrast ratios, generous line heights.
- **Calm:** Deep navy surfaces (`#090d16`), teal brand accents (`#0d9488`), restrained motion.
- **Accessible:** Touch targets ≥ 48px × 48px, visible focus rings (`#38bdf8`), screen reader semantics.
- **Low Cognitive Load:** One obvious primary action per view, no decorative clutter.

---

## 2. Design Tokens (`client/src/styles/tokens.css`)

```css
--color-brand-500: #14b8a6;
--color-bg: #090d16;
--color-surface: #0f172a;
--color-border: #334155;

--min-touch-target: 48px;
```

---

## 3. Core Component Library

1. **Button (`Button.jsx`):** Touch targets ≥ 48px, variants (`primary`, `secondary`, `outline`, `ghost`, `danger`, `success`), sizes (`sm`, `md`, `lg`, `xl`), loading spin indicator, focus rings.
2. **Form Controls (`Input.jsx`, `Textarea.jsx`, `Select.jsx`, `Checkbox.jsx`, `Radio.jsx`, `Switch.jsx`, `DateInput.jsx`, `TimeInput.jsx`):** Explicit visible labels, localized error feedback below inputs.
3. **Alerts (`Alert.jsx`, `SafetyAlert.jsx`):** High-visibility banners combining icon + text + color contrast for Safe, Warning, and Emergency SOS states.
4. **Cards (`Card.jsx`, `GameCard.jsx`, `MemoryCard.jsx`, `ReminderCard.jsx`, `SessionCard.jsx`, `MeetingCard.jsx`):** Content containers with title, metadata, badge, and primary/secondary action slots.
5. **Badges (`StatusBadge.jsx`):** Supports backend enum values (`ACTIVE`, `PENDING`, `COMPLETED`, `RESOLVED`, `CANCELLED`, `SAFE`, `WARNING`, `EMERGENCY`).
6. **Voice Primitives (`VoiceButton.jsx`, `VoiceStatus.jsx`, `AIChatBubble.jsx`):** Audio feedback scaffolds for AI Assistant interactions.
7. **Emergency SOS Button (`SOSButtonPrimitive.jsx`):** 176px pulse button for immediate patient emergency triggering.
