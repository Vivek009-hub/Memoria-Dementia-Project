# MEMORA – MULTILINGUAL SUPPORT IMPLEMENTATION

## TASK

Implement a unified multilingual system across the existing Memora project.

This must support:

- Website UI
- Mobile UI
- Backend user preferences
- Gemini AI Companion
- Cross-device language synchronization

# IMPORTANT

**START CODING DIRECTLY. DO NOT ONLY GIVE ME A PLAN OR SUMMARY.**

Inspect the existing project architecture first, then implement the feature in the actual codebase.

Do not stop after analysis.

---

# 1. PRESERVE EXISTING DESIGN

Do NOT redesign or unnecessarily change:

- Existing Memora UI
- Colors and color palette
- Fonts and typography
- Layouts
- Navigation
- Existing components
- Existing functionality

Only add the required multilingual functionality and language selection UI.

The language feature must blend into the current Memora design.

---

# 2. SUPPORTED LANGUAGES

Implement multilingual architecture for the following languages.

## Core Indian Languages

- English
- Hindi
- Bengali
- Marathi
- Tamil
- Telugu
- Gujarati
- Punjabi
- Urdu
- Kannada
- Malayalam
- Odia
- Assamese

## North-East Priority Languages

- Bodo
- Khasi
- Garo
- Meitei / Manipuri
- Mizo
- Kokborok
- Nepali

The architecture must make it easy to add additional languages later.

Use proper standard language codes where available.

Do not scatter language names or language codes throughout components. Create a central language configuration/registry.

---

# 3. WEBSITE AND MOBILE UI TRANSLATION

Inspect the existing website and mobile frameworks before implementation.

Use an appropriate mature internationalization library for the existing technology stack.

For React-based projects, use an established solution such as:

- i18next
- react-i18next

Do not build an unnecessary custom translation engine.

Replace hardcoded user-facing UI text with translation keys.

Examples include:

- Dashboard
- My Memories
- Games
- Reminders
- Community
- Meeting Circle
- AI Companion
- Profile
- Settings
- Save
- Cancel
- Delete
- Emergency
- Notifications
- Login
- Register
- Caregiver
- Admin

Use clean semantic translation keys.

Example:

```text
common.save
common.cancel
common.delete
common.loading

nav.dashboard
nav.memories
nav.games
nav.reminders

memory.create
memory.edit
memory.delete

profile.language

assistant.greeting
```

Do not hardcode translated strings directly inside every component.

---

# 4. LANGUAGE SELECTOR

Add a language selector inside the existing:

```text
Profile / Settings
```

Example concept:

```text
Language & Region

Preferred Language

[ English ▼ ]
```

Implement this on both:

- Website
- Mobile application

The language selector must:

- Match the existing Memora design
- Be easy for elderly users to understand
- Have large enough tap targets
- Show native language names where possible
- Not clutter the dashboard

Do not create an entirely new settings design.

Integrate into the existing profile/settings structure.

---

# 5. BACKEND LANGUAGE PREFERENCE

Inspect the existing User/Profile schema.

Add language preference support without breaking existing users.

Conceptually:

```javascript
preferredLanguage: "en"
```

Requirements:

- Default language is English
- Selected language is saved in the backend
- Language codes are validated
- Existing users remain backward compatible
- Invalid language values are safely rejected or normalized

Reuse the existing profile/settings API where possible.

Do NOT create duplicate user APIs unnecessarily.

---

# 6. CROSS-DEVICE SYNCHRONIZATION

The backend user profile must be the main source of truth for authenticated users.

Required behavior:

```text
User selects Hindi on Website
        ↓
Backend saves Hindi
        ↓
User opens Mobile App
        ↓
Mobile loads Hindi automatically
```

And:

```text
User selects Assamese on Mobile
        ↓
Backend updates preference
        ↓
User later opens Website
        ↓
Website loads Assamese automatically
```

Language priority:

```text
1. Backend user preference
2. Local saved preference
3. Device/browser language
4. English fallback
```

Do not overwrite an explicitly selected language unexpectedly.

---

# 7. FALLBACK SYSTEM

Implement safe translation fallback.

Required behavior:

```text
Selected Language
        ↓
Translation available?
        │
   YES → Display translation
        │
   NO
        ↓
Fallback language
        ↓
English
```

The application must never:

- Crash because a translation is missing
- Display raw translation keys
- Show broken language configuration

---

# 8. GEMINI AI COMPANION MULTILINGUAL SUPPORT

The existing Gemini AI Companion must support the user's language preference.

Do NOT replace the existing Gemini AI architecture.

Extend the existing implementation.

Pass language context to the AI system.

Conceptually:

```text
preferredLanguage
fallbackLanguage
autoLanguageDetection
```

Update the existing Gemini system instruction/context so the AI:

- Responds primarily in the user's preferred language
- Understands Hindi and English naturally
- Handles Hinglish naturally
- Handles mixed-language conversations
- Supports regional languages where Gemini can reliably handle them
- Does not translate word-for-word mechanically
- Uses simple elderly-friendly language
- Avoids repetitive scripted responses
- Preserves existing dementia-care context and safety instructions

---

# 9. AI LANGUAGE BEHAVIOR

The AI should consider:

```text
User's current message language
+
Saved preferred language
+
Conversation context
```

Example:

```text
Preferred Language: Hindi

User:
Aaj mujhe meri family ki yaad aa rahi hai.
```

The AI should respond naturally based on the user's language style.

It should not force overly formal Hindi if the user naturally speaks Hinglish.

The AI should also not permanently change the user's saved preferred language because of one message written in another language.

Separate:

```text
Saved Preferred Language
```

from:

```text
Current Conversation Language
```

---

# 10. USER-GENERATED CONTENT

Do NOT automatically translate user-created data.

This includes:

- Memory titles
- Memory descriptions
- Names
- Locations
- Voice notes
- Voice transcripts
- User messages
- Emergency contact names

Translate only the application UI surrounding this content.

Do not modify or corrupt existing database content.

---

# 11. FONT AND SCRIPT SUPPORT

Ensure the existing typography can render supported Indian languages properly.

Support appropriate font fallback for:

- Devanagari
- Bengali
- Assamese
- Tamil
- Telugu
- Gujarati
- Gurmukhi
- Kannada
- Malayalam
- Odia
- Urdu
- Other supported North-East scripts

Do NOT replace the existing Memora modern typography with generic fonts.

Preserve the current visual identity.

Only add multilingual font fallbacks where necessary.

---

# 12. URDU RTL SUPPORT

Make the language system direction-aware.

Support:

```text
LTR
RTL
```

Test Urdu layouts carefully.

Check:

- Text alignment
- Forms
- Buttons
- Icons
- Navigation
- Modals
- Mobile screens

Do not globally break the existing layout while adding RTL support.

---

# 13. VOICE AI LANGUAGE ARCHITECTURE

If voice input/output already exists, integrate language awareness.

If it will be implemented later, prepare the architecture.

Concept:

```text
Selected Language
        ↓
Speech-to-Text
        ↓
Gemini AI
        ↓
Language-aware response
        ↓
Text-to-Speech
```

Do not falsely claim every language supports voice input or output.

Use capability-based fallback.

If voice support is unavailable for a selected language:

- Allow text interaction
- Use a supported fallback where appropriate
- Do not crash the AI Companion

---

# 14. CENTRAL LANGUAGE CONFIGURATION

Create a maintainable language registry.

Each language should contain information conceptually similar to:

```javascript
{
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    direction: "ltr",
    uiSupported: true,
    aiSupported: true
}
```

The exact implementation should match the existing project architecture.

This registry should make future languages easy to add without editing every component.

---

# 15. ROLE COVERAGE

Multilingual support must work across all existing Memora roles.

## Patient

- Dashboard
- Memories
- Games
- Reminders
- Community
- Meeting Circle
- AI Companion
- Emergency
- Profile

## Caregiver

- Dashboard
- Patient information
- Safety
- Emergency contacts
- Progress

## Admin

- Dashboard
- Users
- Events
- Community management
- Analytics/traffic

Do not only translate the patient dashboard and leave the rest of the application hardcoded.

---

# 16. AUTHENTICATION AND ERROR STATES

Translate existing:

- Login
- Register
- Forgot Password
- Reset Password
- Email
- Password
- Validation errors
- Loading states
- Network errors
- Empty states
- Unauthorized messages
- Save/update errors

Language selection must work before login using local/device preference.

After login, synchronize carefully with the user's backend preference.

Do not unexpectedly overwrite existing saved preferences.

---

# 17. DATE AND NUMBER LOCALIZATION

Use locale-aware formatting where practical for:

- Dates
- Times
- Numbers
- Relative dates

Do not change actual database values.

Only change how information is displayed.

---

# 18. IMPLEMENTATION ORDER

Follow this order:

```text
STEP 1
Inspect existing Website, Mobile, Backend and AI architecture

        ↓

STEP 2
Create central language configuration

        ↓

STEP 3
Install/configure internationalization libraries

        ↓

STEP 4
Implement Website translation system

        ↓

STEP 5
Implement Mobile translation system

        ↓

STEP 6
Add language selector

        ↓

STEP 7
Add backend user language preference

        ↓

STEP 8
Implement Website ↔ Backend sync

        ↓

STEP 9
Implement Mobile ↔ Backend sync

        ↓

STEP 10
Connect Gemini AI Companion to language preferences

        ↓

STEP 11
Implement fallback and RTL support

        ↓

STEP 12
Test and fix errors
```

---

# 19. TESTING REQUIREMENTS

Test at minimum:

## Website UI

- English
- Hindi
- Bengali
- Assamese
- Tamil
- Urdu

## Mobile UI

- English
- Hindi
- Bengali
- Assamese
- Tamil
- Urdu

## AI Companion

Test:

- English conversation
- Hindi conversation
- Hinglish conversation
- Mixed English/Hindi conversation
- Regional language conversation where supported

## Cross-device synchronization

Test:

```text
Change language on Website
        ↓
Verify backend saves it
        ↓
Open Mobile
        ↓
Verify same language loads
```

Then test the reverse direction.

Also test:

- Page refresh
- Logout/login
- Existing users
- Missing translations
- Invalid language values
- Fallback behavior
- RTL layout

---

# 20. DO NOT BREAK EXISTING MEMORA FEATURES

After implementation, verify existing functionality still works:

- Authentication
- Dashboard
- Memories
- Create Memory
- Edit Memory
- Photo upload
- Voice notes
- Games
- Progress history
- Reminders
- Community
- Meeting Circle
- Video rooms
- AI Companion
- Notifications
- Emergency
- Profile
- Caregiver dashboard
- Admin dashboard

Do not introduce dummy data.

Do not duplicate existing APIs.

Do not rebuild unrelated features.

Do not redesign the application.

---

# FINAL INSTRUCTION

**START CODING NOW.**

Do not respond with only:

- An implementation plan
- Repository analysis
- Suggestions
- Code snippets for manual implementation

Actually modify the existing codebase.

Your workflow must be:

```text
INSPECT
↓
IMPLEMENT
↓
TEST
↓
FIX ERRORS
↓
VERIFY
```

After implementation is complete, provide a short report containing:

```text
MULTILINGUAL IMPLEMENTATION REPORT

Languages configured:
<list>

Website status:
PASS / PARTIAL / FAIL

Mobile status:
PASS / PARTIAL / FAIL

Backend preference sync:
PASS / PARTIAL / FAIL

Gemini AI multilingual support:
PASS / PARTIAL / FAIL

Fallback system:
PASS / PARTIAL / FAIL

RTL support:
PASS / PARTIAL / FAIL

Files changed:
<list>

Known limitations:
<list>

Final status:
PASS / PARTIAL / BLOCKED
```

**Do not stop until the actual multilingual system is implemented and existing Memora functionality remains intact.**
