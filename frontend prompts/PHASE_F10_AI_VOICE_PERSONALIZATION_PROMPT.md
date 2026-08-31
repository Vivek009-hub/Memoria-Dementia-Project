# Memora - Phase F10 Prompt: AI Features + Personalized Recommendations + Voice Interaction UI

**Phase:** F10  
**Name:** AI Features + Personalized Recommendations + Voice Interaction UI + Backend Integration  
**Prerequisites:** F0-F9 completed and verified  
**Backend prerequisite:** Existing AI functionality implemented across B0-B14 must be inspected and mapped to actual APIs before frontend implementation  
**Status:** Ready for implementation

---

# OBJECTIVE

Build the patient-facing AI experience for Memora and connect it to the existing AI backend capabilities.

F10 is an **integration phase**, not a phase for inventing a new AI backend.

The frontend/mobile experience should expose only AI capabilities that actually exist in the backend.

Target architecture:

```text
Patient
   ↓
Memora AI UI
   ↓
Central API Layer
   ↓
Existing AI Backend
   ↓
AI Services / Models
   ↓
Personalized Result
```

For voice:

```text
Patient speaks
      ↓
Voice UI
      ↓
Speech recognition / existing voice backend
      ↓
AI service
      ↓
Response
      ↓
Text + optional speech
```

The experience must remain:

```text
Simple
Large
Voice-friendly
Low-text
Personalized
Accessible
Safe
```

---

# 1. READ FIRST

Before modifying anything, read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/B14_INTEGRATION_REPORT.md
docs/FRONTEND_ARCHITECTURE.md
docs/FRONTEND_API_CONTRACT.md
docs/F0_FRONTEND_FOUNDATION_REPORT.md
docs/F1_DESIGN_SYSTEM.md
docs/F1_DESIGN_SYSTEM_REPORT.md
docs/F2_AUTH_ROLE_UI_REPORT.md
docs/F3_PATIENT_DASHBOARD.md
docs/F3_PATIENT_DASHBOARD_REPORT.md
docs/F4_COGNITIVE_GAMES.md
docs/F4_COGNITIVE_GAMES_REPORT.md
docs/F5_MEMORY_ASSISTANCE_REPORT.md
docs/F6_REMINDERS.md
docs/F6_REMINDERS_REPORT.md
docs/F7_COMMUNITY_MEETING_CIRCLE.md
docs/F7_COMMUNITY_MEETING_CIRCLE_REPORT.md
docs/F8_NOTIFICATIONS_ACTIVITY.md
docs/F8_NOTIFICATIONS_ACTIVITY_REPORT.md
docs/F9_SAFETY_MOBILE_INTEGRATION.md
docs/F9_SAFETY_MOBILE_INTEGRATION_REPORT.md
```

Also inspect the actual implementation of:

```text
B0-B14
AI routes
AI controllers
AI services
AI models
AI provider integrations
Recommendation logic
Memory assistance logic
Voice-related APIs
Speech-to-text
Text-to-speech
Personalization
Game recommendation endpoints
Reminder suggestion endpoints
AI safety/guardrails
AI rate limiting
AI authorization
```

The actual repository and backend API contracts are authoritative.

---

# 2. CRITICAL RULES

## Rule 1: Audit B0-B14 first

Before writing frontend AI code, produce an internal mapping of:

```text
AI capability
Backend endpoint
Request
Response
Authentication
Authorization
Error states
Rate limits
```

Do not assume that an AI feature exists just because it was planned in documentation.

If an expected AI capability is absent:

```text
Do not fake it.
Do not implement a mock production feature.
Report it as missing.
```

---

## Rule 2: No direct AI provider calls from frontend

The browser/mobile app must NOT directly call:

```text
OpenAI
Anthropic
Google AI
Gemini
Other model providers
```

unless the existing architecture explicitly requires it.

Preferred:

```text
Frontend
   ↓
Memora Backend
   ↓
AI Provider
```

API keys must remain server-side.

---

## Rule 3: Reuse F0-F9

Reuse:

```text
API client
Authentication
Patient layout
Design system
Buttons
Cards
Dialogs
Forms
Loading
Error states
Localization
Accessibility
Date/time utilities
Notification system
Reminder system
Safety system
```

Do not create duplicate infrastructure.

---

# 3. F10 SCOPE

Implement, where supported:

```text
AI Assistant
Personalized Game Recommendations
Memory Assistance
Intelligent Reminder Suggestions
Voice Interaction
Regional Language AI
AI Response UI
AI Loading/Error States
AI Conversation State
AI Feedback
AI Safety/Guardrails UI
AI Privacy Controls where supported
Dashboard AI integration
```

Do not implement unsupported AI functionality.

---

# 4. AI ASSISTANT

Create the AI assistant route established by the frontend architecture.

Potential:

```text
/app/ai
```

Example:

```text
🤖 Memora Assistant

Hello! How can I help you today?

[ 🎤 Talk ]
[ Type a message... ]

Suggested:
[ Play a memory game ]
[ Look at my memories ]
[ What do I have today? ]
```

Keep the interface simple.

---

# 5. ASSISTANT CONVERSATION

If backend supports conversational context:

```text
User message
 ↓
Backend
 ↓
AI service
 ↓
Response
 ↓
Conversation UI
```

Do not maintain a second conversation history system in localStorage unless explicitly required.

---

# 6. CONVERSATION HISTORY

If the backend supports persistent conversations:

```text
Load conversation
 ↓
Display messages
```

Use backend identifiers.

If persistent history is not supported:

```text
Keep conversation state only for the current supported session.
```

Do not invent persistent storage.

---

# 7. MESSAGE UI

Patient messages:

```text
You
```

AI messages:

```text
Memora
```

Use large readable text.

Avoid dense chat layouts.

---

# 8. AI RESPONSE LENGTH

If backend allows response controls, prioritize concise responses appropriate for the patient experience.

Do not manipulate clinical/AI content in the frontend in a way that changes meaning.

---

# 9. AI LOADING

Use a simple state:

```text
Memora is thinking...
```

Avoid technical wording such as:

```text
LLM inference
Token generation
Model processing
```

---

# 10. AI ERROR

Example:

```text
I'm having trouble responding right now.

[ Try Again ]
```

Do not expose:

```text
Stack traces
Provider errors
API keys
Internal prompts
Model identifiers
```

---

# 11. RETRY

Retry only safe requests according to the backend/API architecture.

Do not automatically duplicate an AI request that could cause an unintended action.

---

# 12. AI ACTIONS

If AI can trigger actions such as:

```text
Create reminder
Start game
Open memory
Join session
```

the AI should request/route through existing backend APIs.

Do not let AI-generated text directly execute arbitrary frontend code.

---

# 13. STRUCTURED AI ACTIONS

If backend returns structured actions:

```text
action
type
resourceId
parameters
```

validate them against an explicit frontend allowlist.

Never execute arbitrary action names or URLs.

---

# 14. AI NAVIGATION

Only allow predefined Memora routes.

Example:

```text
Games
Memories
Reminders
Community
Notifications
Safety
```

Do not navigate to arbitrary URLs returned by AI.

---

# 15. PERSONALIZED GAME RECOMMENDATIONS

Integrate existing B11/B12 or actual backend recommendation functionality.

Example:

```text
🧠 Games for You

We picked these for today.

┌────────────────────────────┐
│ 🧩 Memory Match            │
│ A short memory activity    │
│                            │
│ [ Play ]                   │
└────────────────────────────┘
```

Use actual recommendation data.

---

# 16. RECOMMENDATION SOURCE

The backend must determine recommendations.

The frontend should not independently calculate:

```text
Best game
Difficulty
Cognitive score
Medical suitability
```

unless explicitly specified.

---

# 17. PERSONALIZATION

If backend returns personalization factors:

```text
Past activity
Preferences
Difficulty
Language
Interests
```

display only what is intended for patients.

Do not expose internal model features.

---

# 18. GAME DIFFICULTY

If backend supplies difficulty:

```text
Easy
Medium
Hard
```

display it only if appropriate to the patient experience.

Do not infer difficulty from score in frontend code.

---

# 19. RECOMMENDATION ACTION

```text
Recommendation
 ↓
[ Play ]
 ↓
F4 Game
```

Use existing F4 routes.

---

# 20. NO AUTO-START

Do not automatically launch games without explicit patient interaction.

---

# 21. MEMORY ASSISTANCE

Integrate the existing F5 memory assistance backend.

Potential:

```text
💭 Memory Help

What would you like to remember?

[ 🎤 Talk ]
[ Type ]
```

Only implement capabilities supported by F5/backend.

---

# 22. MEMORY SEARCH

If backend supports memory retrieval:

```text
Patient asks
 ↓
Backend memory search
 ↓
Relevant memories
 ↓
Simple presentation
```

Do not query the database directly from frontend.

---

# 23. MEMORY PRIVACY

Do not expose memories belonging to another user.

Do not include memory contents in:

```text
URL
analytics
console logs
```

---

# 24. MEMORY CREATION THROUGH AI

If supported:

```text
AI conversation
 ↓
Patient explicitly confirms
 ↓
Existing memory API
 ↓
Saved memory
```

Do not silently save memories based only on AI inference.

---

# 25. MEMORY CONFIRMATION

If AI proposes:

```text
"Would you like me to save this?"
```

the actual save should happen only after explicit confirmation when required by the backend/product design.

---

# 26. REMINDER SUGGESTIONS

Integrate existing AI reminder suggestion functionality if available.

Example:

```text
⏰ Suggested Reminder

You mentioned visiting your daughter tomorrow.

Would you like a reminder?

[ Create Reminder ]
[ Not Now ]
```

Only show this if the backend supports it.

---

# 27. REMINDER CREATION

If patient confirms:

```text
AI suggestion
 ↓
Existing F6 reminder creation flow/API
 ↓
Backend confirmation
```

Do not create a second reminder engine.

---

# 28. NO AUTOMATIC REMINDER CREATION

AI must not silently create reminders.

Require the appropriate explicit patient action unless the product/backend specifically defines another consented workflow.

---

# 29. VOICE INTERACTION

Voice should be a first-class interaction method.

Example:

```text
🤖 Memora Assistant

[ 🎤 Tap to Speak ]
```

---

# 30. VOICE STATES

Clearly distinguish:

```text
Ready
Listening
Processing
Speaking
Error
Permission required
```

Example:

```text
🎤 Listening...
```

---

# 31. SPEECH-TO-TEXT

Use the existing speech recognition architecture.

Possible:

```text
Microphone
 ↓
Speech recognition
 ↓
Text
 ↓
AI backend
```

Do not send raw microphone streams to arbitrary services.

---

# 32. TEXT-TO-SPEECH

If supported:

```text
AI response
 ↓
TTS
 ↓
Patient hears response
```

Use the project's approved backend/provider architecture.

---

# 33. VOICE AUTO-PLAY

Do not automatically play unexpected audio without appropriate user interaction/browser permission.

---

# 34. MICROPHONE PERMISSION

Request microphone permission only when voice interaction is initiated.

Do not request microphone access on page load.

---

# 35. MICROPHONE DENIED

Display:

```text
Microphone access is needed for voice interaction.

[ Try Again ]
```

where appropriate.

---

# 36. VOICE INTERRUPTION

If supported:

```text
Patient starts speaking
 ↓
Stop/reduce current TTS
 ↓
Listen
```

Only implement if supported by the selected voice architecture.

---

# 37. VOICE TIMEOUT

If no speech is detected:

```text
I didn't hear anything.

[ Try Again ]
```

Do not keep the microphone open indefinitely.

---

# 38. VOICE ERROR

Example:

```text
Voice interaction isn't available right now.

You can type instead.
```

Always provide a text fallback when possible.

---

# 39. REGIONAL LANGUAGE SUPPORT

AI interaction should use the existing localization and backend language architecture.

Potential:

```text
English
Hindi
Other configured regional languages
```

Only advertise languages actually supported by the AI backend.

---

# 40. LANGUAGE SELECTION

If supported:

```text
Language
[ Hindi ▼ ]
```

Use backend-supported values.

Do not send arbitrary language identifiers.

---

# 41. LANGUAGE CONSISTENCY

The system should avoid situations where:

```text
UI = Hindi
AI = English
TTS = another language
```

unless the user explicitly chooses that behavior.

---

# 42. VOICE LANGUAGE

If speech recognition/TTS supports language selection:

```text
Use the selected supported language.
```

Do not assume every TTS/STT provider supports every configured UI language.

---

# 43. AI SAFETY

AI responses must follow the existing backend safety/guardrail architecture.

The frontend must not attempt to replace AI safety filtering.

---

# 44. MEDICAL CLAIMS

Memora AI must not present itself as a doctor.

Do not add frontend language implying:

```text
Diagnosis
Medical certainty
Treatment
Clinical assessment
```

unless explicitly supported by the product specification and appropriate backend safeguards.

---

# 45. HIGH-RISK QUESTIONS

If backend provides safety responses for:

```text
Medical emergencies
Severe symptoms
Self-harm
Danger
```

display the backend response faithfully.

Do not invent emergency guidance in the frontend.

---

# 46. SOS SEPARATION

AI must not replace F9 emergency controls.

If the user needs immediate safety assistance:

```text
Safety / SOS
```

should remain clearly accessible.

Do not hide the SOS control behind the AI assistant.

---

# 47. AI ACTION CONFIRMATION

For actions with meaningful consequences:

```text
Create reminder
Save memory
Join event
```

use explicit confirmation where required.

AI text must never be treated as authorization.

---

# 48. PERSONAL DATA

AI requests may contain personal information.

Use the existing backend privacy architecture.

Do not log:

```text
AI prompts
AI responses
Memory contents
Voice transcripts
Location
Safety information
```

unless explicitly required and protected.

---

# 49. VOICE PRIVACY

Do not permanently store raw audio unless explicitly required.

Prefer:

```text
Audio
 ↓
Speech recognition
 ↓
Text
 ↓
Discard audio
```

if compatible with the actual architecture.

---

# 50. TRANSCRIPT PRIVACY

Treat transcripts as user data.

Do not expose them in URLs or analytics.

---

# 51. AI CONVERSATION PRIVACY

If conversations are persisted:

```text
Use authenticated backend ownership.
```

Do not use a frontend user ID as the only security mechanism.

---

# 52. AUTHORIZATION

Backend must enforce:

```text
Patient identity
Conversation ownership
Memory ownership
Recommendation access
Reminder access
```

---

# 53. RATE LIMITING

Respect backend AI rate limits.

If rate limited:

```text
Please wait a moment before trying again.
```

Do not spam retries.

---

# 54. COST CONTROL

Avoid unnecessary AI requests.

Do not call AI repeatedly due to:

```text
React rerenders
Route changes
Polling
Typing every character
```

unless explicitly designed for streaming/autocomplete.

---

# 55. STREAMING

If backend supports streaming AI responses:

```text
Use existing streaming architecture.
```

Do not implement an unrelated streaming protocol.

---

# 56. STREAMING CLEANUP

If streaming is used:

```text
Start
 ↓
Receive
 ↓
Complete / error
 ↓
Cleanup
```

Ensure aborted requests are cleaned up.

---

# 57. CONVERSATION RESET

If supported:

```text
[ New Conversation ]
```

must use backend/session semantics.

Do not simply hide messages while retaining the same backend conversation ID.

---

# 58. AI FEEDBACK

If backend supports feedback:

```text
👍
👎
```

or:

```text
Helpful
Not helpful
```

connect to the actual feedback endpoint.

Do not send feedback automatically.

---

# 59. FEEDBACK PRIVACY

Do not include unnecessary personal information in feedback payloads.

---

# 60. AI RESPONSE ACTIONS

If an AI response includes:

```text
Play Game
Save Memory
Create Reminder
View Community Session
```

render these as explicit UI actions.

Do not parse arbitrary natural-language commands in the frontend.

---

# 61. STRUCTURED RESPONSE CONTRACT

Prefer backend responses such as:

```text
{
  message,
  actions,
  metadata
}
```

only if the backend actually returns that structure.

Do not force an incompatible response format.

---

# 62. AI EMPTY STATE

Example:

```text
🤖

Hi! I'm Memora.

You can ask me about:
Games
Memories
Reminders
Community sessions

[ 🎤 Talk ]
```

---

# 63. AI OFFLINE STATE

Example:

```text
AI assistance is unavailable while you're offline.

You can still use available Memora features.
```

Do not claim AI is working offline unless explicitly supported.

---

# 64. AI ERROR RECOVERY

If AI fails:

```text
Try again
```

and provide alternative actions where appropriate.

---

# 65. AI RESPONSE TIME

Show meaningful progress for slow requests.

Do not leave patients staring at a frozen button.

---

# 66. ACCESSIBILITY

AI UI must support:

```text
Keyboard
Screen readers
Large text
Visible focus
Accessible buttons
Accessible message regions
Voice status
```

---

# 67. AI LIVE REGION

AI responses should be announced appropriately to screen readers.

Do not repeatedly announce every streaming token.

---

# 68. VOICE ACCESSIBILITY

Voice controls must have clear accessible labels:

```text
Start voice input
Stop listening
Play response
Stop response
```

---

# 69. ELDER-FRIENDLY DESIGN

Prioritize:

```text
Large voice button
Large text
Short responses
Simple suggested actions
Minimal typing
Clear status
```

---

# 70. LOCALIZATION

Use existing localization.

Do not hardcode:

```text
Thinking
Listening
Try again
Send
```

---

# 71. RESPONSIVE DESIGN

Test:

```text
Desktop
Tablet
Mobile browser
```

Voice controls must remain easy to tap.

---

# 72. MOBILE AI

If the mobile app supports AI interaction:

```text
Reuse the same backend AI APIs.
```

Do not create a separate mobile AI backend.

---

# 73. MOBILE VOICE

If voice is supported on mobile:

```text
Use platform-appropriate microphone/audio APIs.
```

Do not depend on the website being open.

---

# 74. MOBILE PERMISSIONS

Handle:

```text
Microphone
Notifications where applicable
```

using platform-appropriate permission flows.

---

# 75. MOBILE OFFLINE

If AI requires connectivity:

```text
AI unavailable offline.
```

Do not pretend the mobile app has an offline AI model unless one actually exists.

---

# 76. AI DASHBOARD INTEGRATION

Update F3 dashboard with a small AI entry point.

Example:

```text
🤖 Memora Assistant

[ Ask Memora ]
```

Do not duplicate the entire AI assistant.

---

# 77. PERSONALIZED DASHBOARD RECOMMENDATIONS

If backend provides recommendations:

```text
For You

🧩 Memory Match
🎵 Music Memory
```

Keep it concise.

---

# 78. GAME INTEGRATION

Recommendations must route into F4.

---

# 79. MEMORY INTEGRATION

Memory assistance must route into F5.

---

# 80. REMINDER INTEGRATION

Reminder suggestions must route into F6.

---

# 81. COMMUNITY INTEGRATION

If AI recommends a community session:

```text
AI suggestion
 ↓
F7 Session details
```

Do not automatically register.

---

# 82. SAFETY INTEGRATION

Safety controls remain in F9.

AI should provide a clear path to:

```text
Safety
SOS
```

when appropriate.

Do not replace F9.

---

# 83. API LAYER

Use a centralized AI API module.

Conceptual methods:

```text
aiApi.chat()
aiApi.getRecommendations()
aiApi.getMemoryAssistance()
aiApi.getReminderSuggestions()
aiApi.submitFeedback()
aiApi.startConversation()
aiApi.endConversation()
aiApi.transcribe()
aiApi.speak()
```

These are conceptual only.

Implement only actual backend endpoints.

---

# 84. COMPONENT ARCHITECTURE

Potential components:

```text
AIAssistant
AIMessage
AIInput
VoiceButton
VoiceStatus
AIResponseActions
RecommendationCard
RecommendationList
MemoryAssistant
ReminderSuggestion
AIErrorState
AIEmptyState
AIFeedback
LanguageSelector
```

Reuse F1 components wherever possible.

---

# 85. STATE MANAGEMENT

Use F0's state/server-state architecture.

Do not introduce a second global AI store unless genuinely required.

---

# 86. REQUEST CANCELLATION

If supported:

```text
Patient leaves AI page
 ↓
Cancel active request/stream
```

Avoid unnecessary backend work.

---

# 87. DUPLICATE REQUEST PROTECTION

Prevent duplicate:

```text
Chat submission
Feedback
Action execution
Voice request
```

where appropriate.

---

# 88. CACHE

Cache only safe, appropriate data.

Do not permanently cache:

```text
Private conversations
Voice transcripts
Sensitive memories
```

unless explicitly required.

---

# 89. SECURITY REVIEW

Inspect:

```text
AI prompt exposure
Provider API keys
Unsafe action execution
Unsafe navigation
Conversation ownership
Memory ownership
Voice transcript leakage
```

---

# 90. PROMPT EXPOSURE

Do not expose:

```text
System prompts
Developer prompts
Internal AI instructions
Provider configuration
```

to patients.

---

# 91. AI OUTPUT HANDLING

Treat AI output as untrusted data.

Do not directly render arbitrary HTML from AI.

Use safe text rendering.

---

# 92. MARKDOWN / HTML

If AI responses support markdown:

```text
Sanitize rendered content.
```

Do not use unsafe HTML injection.

---

# 93. LINK HANDLING

If AI returns links:

```text
Allowlist approved Memora routes/domains.
```

Do not allow arbitrary redirects.

---

# 94. ACTION HANDLING

Never execute:

```text
eval()
Function()
arbitrary JavaScript
```

from AI output.

---

# 95. TESTING

Add tests for:

```text
AI assistant
Conversation
AI loading
AI errors
Recommendations
Memory assistance
Reminder suggestions
Voice
Language
AI actions
Feedback
```

where supported.

---

# 96. AI TESTING

Test:

```text
Successful request
Empty response
Backend error
Timeout
Rate limit
Unauthorized
```

---

# 97. ACTION TESTING

Test:

```text
Valid action
Invalid action
Unauthorized action
Duplicate action
```

---

# 98. VOICE TESTING

Test:

```text
Permission granted
Permission denied
Listening
No speech
Successful recognition
Recognition error
TTS success
TTS failure
```

where supported.

---

# 99. RECOMMENDATION TESTING

Test:

```text
Recommendations available
No recommendations
Recommendation failure
Game navigation
```

---

# 100. MEMORY TESTING

Test:

```text
Search
View
Save confirmation
Failure
Unauthorized memory
```

where supported.

---

# 101. REMINDER TESTING

Test:

```text
Suggestion
Confirmation
Existing F6 creation flow
Failure
Duplicate action
```

---

# 102. AUTHORIZATION TESTING

Verify:

```text
Patient cannot access another patient's AI conversation
Patient cannot access another patient's memories
Patient cannot create another patient's reminders
```

---

# 103. PRIVACY TESTING

Verify:

```text
No sensitive AI logs
No voice transcript leakage
No memory leakage
No location leakage
No safety-event leakage
```

---

# 104. ACCESSIBILITY TESTING

Test:

```text
Keyboard
Screen reader
Focus
Voice controls
AI response announcements
Buttons
```

---

# 105. LOCALIZATION TESTING

Test:

```text
English
Hindi
Configured regional languages
Long translated labels
AI response language
Voice language
```

---

# 106. PERFORMANCE TESTING

Check:

```text
AI request frequency
Streaming cleanup
Voice resource cleanup
Memory usage
Repeated renders
Network requests
```

---

# 107. MOBILE TESTING

If mobile AI/voice is implemented, test on supported devices:

```text
Microphone permission
Voice input
TTS
Network loss
App backgrounding
App resume
```

---

# 108. BROWSER CONSOLE

Check for:

```text
Unhandled errors
React warnings
Failed API calls
Unsafe HTML warnings
Accessibility warnings
```

---

# 109. MOBILE LOGGING

Do not log:

```text
Voice transcripts
Raw audio
AI prompts
AI responses
Memory contents
Authentication tokens
```

in production.

---

# 110. DOCUMENTATION

Create:

```text
docs/F10_AI_VOICE_PERSONALIZATION.md
```

Document:

```text
AI capability mapping
Backend APIs used
AI assistant
Conversation architecture
Recommendations
Memory assistance
Reminder suggestions
Voice
Speech recognition
Text-to-speech
Regional languages
AI actions
Safety/guardrails
Privacy
Security
Accessibility
Localization
Mobile integration
Testing
```

Update:

```text
CLAUDE.md
docs/FRONTEND_ARCHITECTURE.md
```

where appropriate.

---

# 111. MULTI-DEVELOPER RULE

Recommended separation:

```text
Developer A → AI Assistant
Developer B → Recommendations
Developer C → Voice
Developer D → Memory/Reminder AI integration
Developer E → Mobile AI integration
```

All must use:

```text
Shared AI API layer
Shared authentication
Shared design system
Shared localization
Shared safety rules
```

Do not create multiple AI clients.

---

# 112. GIT SAFETY

Before modifying:

```bash
git status
```

Do not use:

```bash
git reset --hard
git clean -fd
```

Do not overwrite another developer's work.

Suggested branches:

```text
feature/f10-ai-assistant
feature/f10-recommendations
feature/f10-voice
feature/f10-memory-ai
feature/f10-mobile-ai
```

---

# 113. DEFINITION OF DONE

F10 is complete only when:

[ ] F0 inspected  
[ ] F1 inspected  
[ ] F2 inspected  
[ ] F3 inspected  
[ ] F4 inspected  
[ ] F5 inspected  
[ ] F6 inspected  
[ ] F7 inspected  
[ ] F8 inspected  
[ ] F9 inspected  
[ ] B0-B14 AI implementation inspected  
[ ] AI endpoints mapped  
[ ] AI request/response contracts verified  
[ ] AI authorization verified  
[ ] AI Assistant implemented where supported  
[ ] Conversation implemented where supported  
[ ] AI loading state implemented  
[ ] AI error state implemented  
[ ] AI retry implemented safely  
[ ] AI action handling implemented where supported  
[ ] Action allowlist implemented  
[ ] Safe navigation implemented  
[ ] Game recommendations implemented where supported  
[ ] F4 integration verified  
[ ] Memory assistance implemented where supported  
[ ] F5 integration verified  
[ ] Reminder suggestions implemented where supported  
[ ] F6 integration verified  
[ ] Community recommendation integration implemented where supported  
[ ] F7 integration verified  
[ ] Voice UI implemented where supported  
[ ] Microphone permission flow implemented  
[ ] Speech recognition integrated where supported  
[ ] TTS integrated where supported  
[ ] Voice error handling implemented  
[ ] Voice timeout implemented  
[ ] Regional language support implemented where supported  
[ ] Language consistency verified  
[ ] Mobile AI integration implemented where required  
[ ] AI safety/guardrail integration verified  
[ ] SOS remains accessible through F9  
[ ] Privacy verified  
[ ] Sensitive logging removed  
[ ] No direct AI-provider API keys in frontend/mobile  
[ ] No direct database access  
[ ] No unsafe AI HTML rendering  
[ ] No arbitrary AI navigation  
[ ] No arbitrary AI action execution  
[ ] Rate limits handled  
[ ] Duplicate requests prevented  
[ ] Request cancellation handled  
[ ] Loading states implemented  
[ ] Empty states implemented  
[ ] Error states implemented  
[ ] Accessibility verified  
[ ] Localization verified  
[ ] Responsive design verified  
[ ] AI tests added  
[ ] Recommendation tests added  
[ ] Voice tests added where applicable  
[ ] Memory tests added where applicable  
[ ] Reminder integration tests added  
[ ] Authorization tests performed  
[ ] Privacy tests performed  
[ ] Security tests performed  
[ ] Mobile tests performed where applicable  
[ ] Browser console checked  
[ ] Mobile logs checked  
[ ] Lint passes  
[ ] Web tests pass  
[ ] Web build passes  
[ ] Mobile tests/build pass where applicable  
[ ] Documentation updated  
[ ] No secrets committed  
[ ] No unrelated feature creep  

---

# 114. FINAL REPORT

Create:

```text
docs/F10_AI_VOICE_PERSONALIZATION_REPORT.md
```

Use:

```text
# Memora F10 AI + Voice + Personalization Report

## Objective

## B0-B14 AI Capability Audit

## AI APIs Used

## AI Assistant

## Conversation Architecture

## AI Actions

## Action Validation

## Personalized Recommendations

## Game Recommendations

## Memory Assistance

## Reminder Suggestions

## Community Recommendations

## Voice Interaction

## Speech Recognition

## Text-to-Speech

## Voice Permissions

## Regional Language Support

## Mobile AI Integration

## AI Safety/Guardrails

## Privacy

## Security

## Rate Limiting

## Request Cancellation

## Cache Strategy

## Dashboard Integration

## F4 Integration

## F5 Integration

## F6 Integration

## F7 Integration

## F9 Safety Integration

## Accessibility

## Localization

## Responsive Design

## Components Created

## Mobile Components/Services Created

## Files Created

## Files Modified

## Tests Executed

## AI Tests

## Recommendation Tests

## Voice Tests

## Authorization Tests

## Privacy Tests

## Security Tests

## Accessibility Tests

## Localization Tests

## Mobile Tests

## Lint Result

## Web Build Result

## Mobile Build Result

## Browser Testing

## Known Issues

## Missing Backend AI Capabilities

## Backend Changes

## Recommendations for F11
```

---

# 115. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
AI capability audit result
AI assistant result
Conversation result
AI action result
Recommendation result
Game recommendation result
Memory assistance result
Reminder suggestion result
Community integration result
Voice result
Speech recognition result
Text-to-speech result
Regional language result
Mobile AI result
AI safety/guardrail result
Privacy result
Security result
Accessibility result
Localization result
Responsive result
F4 integration result
F5 integration result
F6 integration result
F7 integration result
F9 integration result
Test result
Lint result
Web build result
Mobile build result
Development server result
```

Do not claim success unless verified.

---

# 116. STOP CONDITION

After F10 is complete:

**STOP.**

Do not automatically implement F11.

The next phase should be determined after reviewing the actual state of:

```text
Backend B0-B14
Frontend F0-F10
Mobile Safety App
Integration Tests
Deployment
```

Do not assume that F11 should add a feature before auditing the complete system.

---

# FINAL PRINCIPLE

F10 should make Memora feel intelligent without making it complicated.

The architecture should remain:

```text
                    PATIENT
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
      WEB UI        MOBILE UI      VOICE UI
        │              │              │
        └──────────────┼──────────────┘
                       ↓
                 MEMORA API
                       ↓
                Existing AI Layer
                       ↓
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       Assistant   Personalization  Memory
          ↓            ↓            ↓
       Actions      Games/Reminders  F5
          │
          └──────────────┬─────────────
                         ↓
                  Existing Features
              F4 / F5 / F6 / F7 / F9
```

The AI should be a helpful layer across Memora, not a separate application.

Keep AI provider credentials, model selection, prompts, personalization logic, safety filtering, persistence, authorization, rate limiting, and business logic on the backend.

The frontend/mobile application should provide the patient with a simple, accessible, voice-friendly interface to those capabilities.

**Never claim that an AI action, memory save, reminder creation, recommendation, voice transcription, or other operation succeeded until the relevant backend confirms it.**
