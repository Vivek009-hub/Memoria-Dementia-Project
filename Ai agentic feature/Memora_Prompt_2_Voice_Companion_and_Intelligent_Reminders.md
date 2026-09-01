# MEMORA - Prompt 2
## Voice AI Companion + Intelligent Reminders + Proactive Conversation

> **Purpose:** Build the patient-facing voice companion on top of the AI Agent foundation created in Prompt 1.
>
> **Important:** Prompt 1 must already be implemented and tested before running this prompt.
>
> This prompt focuses on:
> - Voice input
> - Speech-to-text
> - Gemini conversational interaction
> - Text-to-speech
> - Bluetooth earbuds through the patient's phone
> - Natural conversation
> - Patient-aware responses
> - Natural-language reminders
> - Proactive routine-aware conversations
> - Reminder notifications
> - Conversation history
>
> Do NOT implement geofencing or SOS in this prompt. Those belong to Prompt 3.

---

# 1. ROLE

Act as a senior mobile/full-stack engineer specializing in voice interfaces, conversational AI, and accessibility.

You are working inside the **existing Memora codebase**.

Prompt 1 has already established:

- Gemini integration
- Memora AI Agent
- Patient context
- Controlled tools
- Patient-specific data access
- Reminder foundation
- Routine access
- Memory retrieval
- Conversation persistence

Your task is to build the **actual patient-facing conversational experience** around that foundation.

Do not rebuild the AI Agent from scratch.

Extend the implementation created in Prompt 1.

---

# 2. FIRST: INSPECT BEFORE CODING

Before modifying anything:

1. Inspect the current project.
2. Verify Prompt 1's AI Agent implementation.
3. Identify:
   - Current frontend/mobile architecture
   - Existing AI endpoints
   - Existing Gemini provider
   - Existing agent service
   - Existing patient-context service
   - Existing reminder model/service
   - Existing routine model/service
   - Existing notification system
   - Existing authentication
   - Existing conversation storage
   - Existing mobile application, if already present
4. Reuse existing functionality.
5. Do not create duplicate systems.

Do not blindly follow the file structure in this prompt if the existing project uses another architecture.

Adapt to the actual codebase.

---

# 3. CORE EXPERIENCE

The goal is to make Memora feel like a **simple personal voice companion**.

The patient should be able to:

1. Speak naturally.
2. Have Memora understand them.
3. Receive a spoken response.
4. Ask about their routine.
5. Create reminders naturally.
6. Have Memora proactively remind them.
7. Have casual conversations.
8. Receive personalized responses using authorized Memora data.

The companion should NOT control games, navigate the website, or perform unrelated application actions.

---

# 4. IMPORTANT PRODUCT PRINCIPLE

The AI should feel like:

> "A familiar companion who knows my routine and remembers what is important to me."

It should NOT feel like:

> "A chatbot interface with a microphone."

Prioritize:

- Simplicity
- Calm interaction
- Short responses
- Natural speech
- Personalization
- Predictable behavior
- Accessibility
- Reliability

---

# 5. TARGET USER EXPERIENCE

The patient opens the Memora Companion.

The screen should be extremely simple.

Conceptually:

```text
┌──────────────────────────────┐
│                              │
│          MEMORA              │
│                              │
│      AI COMPANION            │
│                              │
│       ● Listening            │
│                              │
│          🎤                  │
│                              │
│    "I'm here with you."      │
│                              │
│   Today's next activity      │
│   Morning walk · 10:00 AM    │
│                              │
└──────────────────────────────┘
```

Do not overload the screen with dashboards.

The patient should primarily interact through voice.

---

# 6. VOICE PIPELINE

Implement:

```text
Patient speaks
      ↓
Microphone
      ↓
Speech-to-text
      ↓
Memora AI Agent
      ↓
Gemini
      ↓
Tool calls when necessary
      ↓
Response text
      ↓
Text-to-speech
      ↓
Phone audio
      ↓
Bluetooth earbuds
```

The phone should handle the microphone and Bluetooth audio.

Do NOT introduce ESP32 or other hardware.

---

# 7. MOBILE-FIRST IMPLEMENTATION

If the project already contains a mobile application:

- Extend it.

If Memora currently has only a web frontend and the requested mobile application does not yet exist:

- Inspect the project before deciding whether to add React Native or another mobile architecture.
- Do not rewrite the existing web application.
- Keep the new mobile companion isolated and maintainable.

If a mobile application already exists, use its existing authentication/session infrastructure.

Do not create a second login system.

---

# 8. SPEECH-TO-TEXT

Implement reliable speech recognition.

The implementation may use:

- Native mobile speech recognition where appropriate
- A server-side speech-to-text service
- Another compatible speech-to-text provider

Choose the approach that best fits the existing project and deployment environment.

Do NOT assume that browser speech recognition is suitable for all mobile devices.

The architecture should allow the speech-to-text provider to be replaced later.

Conceptually:

```text
SpeechToTextProvider
    ↓
Current STT implementation
```

Do not hard-code STT logic throughout the application.

---

# 9. TEXT-TO-SPEECH

Implement spoken AI responses.

The architecture should allow a replaceable TTS provider.

Conceptually:

```text
TextToSpeechProvider
    ↓
Current TTS implementation
```

The AI response:

> "It's time for your morning walk."

must be converted into speech and played through the phone's audio output.

If Bluetooth earbuds are connected to the phone, the normal mobile audio routing should allow the response to play through them.

Do not attempt to directly control generic Bluetooth earbuds from the backend.

---

# 10. BLUETOOTH EARBUDS

The app should not need to know the brand/model of the earbuds.

The patient's phone handles Bluetooth pairing.

Memora simply uses the phone's audio output.

The desired flow is:

```text
Patient phone
    ↓
Memora
    ↓
Text-to-speech
    ↓
Phone audio system
    ↓
Bluetooth earbuds
```

Do not build custom Bluetooth protocols.

Provide a small settings/help message explaining:

> "Connect your Bluetooth earbuds to your phone before starting the companion."

---

# 11. CONVERSATION MODE

Implement a natural conversation interface.

The patient should be able to say:

> "I'm bored."

Memora:

> "I'm here with you. Would you like to talk for a while?"

Patient:

> "Yes."

Memora:

> "What would you like to talk about?"

The AI should maintain enough recent conversation context to avoid sounding repetitive.

Conversation history should continue using the persistence mechanism created in Prompt 1.

---

# 12. CONVERSATION TURN MANAGEMENT

Avoid requiring the patient to press a button after every sentence if technically feasible.

Prefer a conversational flow:

```text
Memora speaks
      ↓
Waits
      ↓
Patient speaks
      ↓
Detect speech
      ↓
Transcribe
      ↓
Gemini
      ↓
Memora responds
      ↓
Repeat
```

However, continuous microphone capture must be implemented carefully.

Do NOT continuously upload raw microphone audio to the server without a clear reason.

Use voice activity detection, explicit listening windows, or an equivalent privacy-aware mechanism.

---

# 13. LISTENING STATES

The UI must clearly communicate the current state.

At minimum:

```text
IDLE
LISTENING
PROCESSING
SPEAKING
ERROR
```

Example:

```text
● Ready
● Listening...
● Thinking...
● Speaking...
```

The patient should never have to guess whether Memora is listening.

---

# 14. PRIVACY REQUIREMENT

Do NOT design this as hidden continuous surveillance.

The app should clearly indicate when it is listening.

Do not continuously upload microphone data when the companion is inactive.

Do not silently record conversations.

If conversations are stored, make that behavior explicit in the product architecture and respect applicable privacy requirements.

---

# 15. NATURAL-LANGUAGE REMINDERS

This is one of the most important features.

The patient can say:

> "Remind me to turn off the stove in 15 minutes."

Gemini should recognize the request and call the existing reminder tool.

Conceptually:

```text
createReminder({
    task: "Turn off the stove",
    trigger: "15 minutes from now"
})
```

The backend validates the request and stores the reminder.

The AI should then respond:

> "Okay. I'll remind you in 15 minutes."

Only say this after the backend confirms successful reminder creation.

---

# 16. RELATIVE TIME PARSING

Support natural expressions such as:

```text
in 15 minutes
in half an hour
in 2 hours
at 6 PM
tomorrow morning
tomorrow at 10 AM
after lunch
before my appointment
```

Do NOT let Gemini alone determine the final timestamp.

The backend must:

1. Parse/validate the proposed time.
2. Resolve it using the patient's timezone.
3. Validate that it is reasonable.
4. Store the canonical timestamp.
5. Return confirmation.

For ambiguous requests, ask a clarification question.

Example:

> "Remind me tomorrow."

Response:

> "What would you like me to remind you about?"

---

# 17. REMINDER VALIDATION

The backend must prevent:

- Invalid timestamps
- Past reminders unless explicitly supported
- Negative durations
- Impossible dates
- Extremely large delays
- Duplicate accidental reminders

Validate tool arguments server-side.

Never trust Gemini's arguments blindly.

---

# 18. REMINDER LIFECYCLE

Implement/verify:

```text
Created
   ↓
Scheduled
   ↓
Due
   ↓
Triggered
   ↓
Acknowledged / Pending
   ↓
Completed / Dismissed
```

Adapt this to the existing reminder system.

Do not create a second reminder database if one already exists.

---

# 19. REMINDER EXAMPLE

Patient:

> "I'm going to take a nap. Remind me to call Priya in one hour."

Backend creates:

```text
Task:
Call Priya

Due:
Current time + 1 hour

Status:
Scheduled
```

At the due time:

Memora speaks:

> "You asked me to remind you to call Priya."

The reminder should also be available in the app's reminder history.

---

# 20. PROACTIVE ROUTINE ASSISTANT

Memora should not only wait for the patient to speak.

The backend should be capable of initiating conversations based on the patient's configured routine.

Conceptually:

```text
Scheduler
   ↓
Check patient routine
   ↓
Is interaction due?
   ↓
Check quiet hours
   ↓
Check whether already completed
   ↓
Generate appropriate message
   ↓
Send notification / initiate companion interaction
```

Example:

Patient routine:

```text
08:30 Breakfast
10:00 Morning walk
13:00 Lunch
20:00 Evening routine
```

At 10:00:

> "It's time for your morning walk."

---

# 21. IMPORTANT: BACKEND OWNS THE SCHEDULE

Do not ask Gemini every minute:

> "Should I remind the patient now?"

That would be wasteful and unreliable.

Instead:

```text
Node.js Scheduler
      ↓
Determines event is due
      ↓
AI optionally generates natural wording
      ↓
Notification / voice interaction
```

The scheduler is deterministic.

Gemini is responsible for language and conversation.

---

# 22. SMART ROUTINE CHECKING

Before proactively reminding the patient, check:

- Has the task already been completed?
- Has the patient already acknowledged it?
- Is quiet time active?
- Has the patient recently been contacted?
- Is another interaction already happening?
- Is the patient currently in an active conversation?

Do not bombard the patient with repeated messages.

---

# 23. QUIET HOURS

Add patient/caregiver-configurable quiet hours.

Example:

```text
Quiet hours:
22:00 → 07:00
```

During quiet hours:

- Do not initiate normal conversations.
- Do not generate routine reminders unless configured as critical.
- Still allow the patient to manually open and talk to the companion.

Use the existing user/patient settings system if available.

---

# 24. CONVERSATION FREQUENCY

Allow a configurable interaction frequency.

For example:

```text
Low
Medium
High
```

Do not hard-code aggressive behavior.

The exact settings should fit the existing Memora UX.

---

# 25. PATIENT PERSONALIZATION

The agent should use:

- Name
- Preferred language
- Known interests
- Family information
- Relevant memories
- Routine
- Reminder history
- Recent conversation context

Example:

Patient preference:

```text
Likes:
Gardening
Cricket
Old Hindi music
```

Patient says:

> "I'm bored."

AI may respond:

> "Would you like to talk about your garden?"

Do not force personalization into every conversation.

---

# 26. PERSONAL MEMORY CONVERSATION

Patient:

> "Tell me about my daughter."

Agent:

```text
getRelevantMemories("daughter")
```

Backend returns relevant memories.

Gemini responds using only those memories.

If no information exists:

> "I don't have information about that yet."

Never fabricate:

- Family members
- Names
- Events
- Relationships
- Places
- Dates

---

# 27. LANGUAGE SUPPORT

Inspect existing Memora language support.

If the patient has a preferred language, use it where supported.

The agent should respect the configured language.

Example:

```text
Preferred language: Hindi
```

Patient:

> "Mujhe aaj kya karna hai?"

The companion should respond naturally in Hindi if the configured AI/STT/TTS pipeline supports it.

Do not hard-code only English if the existing product supports multiple languages.

---

# 28. VOICE RESPONSE STYLE

Responses should generally be short.

Prefer:

> "It's time for your morning walk."

over:

> "According to the schedule associated with your profile, you are currently expected to participate in your scheduled morning walking activity."

For elderly users:

- Short sentences
- Clear words
- Calm tone
- One idea at a time
- Avoid excessive information

---

# 29. INTERRUPTION HANDLING

If technically supported, handle situations where the patient starts speaking while the AI is speaking.

Desired behavior:

```text
AI speaking
     ↓
Patient starts speaking
     ↓
Stop/duck audio
     ↓
Listen to patient
```

If this is too complex for the current stack, implement a reliable non-interruptible turn-based mode instead.

Do not sacrifice reliability for a flashy demo.

---

# 30. NETWORK FAILURE

The companion must handle:

- No internet
- Slow network
- Gemini timeout
- STT failure
- TTS failure
- Backend unavailable

Example:

> "I'm having trouble connecting right now. Please try again in a moment."

The app must not crash.

---

# 31. AI FAILURE

If Gemini returns an invalid response or tool call:

1. Validate it.
2. Reject invalid tool calls.
3. Retry only when safe.
4. Provide a fallback response.

Never execute arbitrary model-generated code.

---

# 32. TOOL SECURITY

Continue Prompt 1's security architecture.

Gemini may request:

```text
createReminder(...)
getTodayRoutine()
getRelevantMemories(...)
```

But the backend must still enforce:

```text
Authentication
+
Patient authorization
+
Input validation
+
Tool permission
```

The AI must never be allowed to:

- Query arbitrary collections
- Execute MongoDB queries
- Execute JavaScript
- Access another patient
- Modify arbitrary records
- Access API keys
- Access server filesystem

---

# 33. MEDICAL SAFETY

The AI is an assistive companion, not a doctor.

It may:

- Remind about caregiver-configured tasks.
- Encourage routine activities.
- Have normal conversations.
- Help the patient remember information stored in Memora.

It must NOT:

- Diagnose dementia.
- Diagnose other medical conditions.
- Change medication dosage.
- Invent medication instructions.
- Tell the patient to stop prescribed medication.
- Claim a medical emergency diagnosis.

If a patient says:

> "I feel severe chest pain."

The AI should not diagnose them.

It should respond calmly and encourage contacting their caregiver/emergency services according to the application's configured safety policy.

Do not create emergency workflows in this prompt. Those belong to Prompt 3.

---

# 34. CAREGIVER CONFIGURATION

Use existing caregiver functionality where available.

Caregiver should eventually be able to configure:

- Patient routine
- Reminder preferences
- Quiet hours
- Interaction frequency
- Preferred language
- Patient interests
- Personalization data

Do not rebuild caregiver authentication or unrelated caregiver pages.

If settings already exist, reuse them.

---

# 35. PATIENT EXPERIENCE

Keep the companion screen extremely simple.

Recommended elements:

```text
Memora logo/name

Current AI state

Large microphone/listening control

Current conversation, optionally

Next routine item

Small reminder indicator

Settings/accessibility control
```

Avoid:

- Large dashboards
- Dense tables
- Complicated menus
- Tiny controls
- Excessive text
- Game controls
- Unrelated Memora modules

---

# 36. ACCESSIBILITY

Design specifically for elderly users.

Use:

- Large touch targets
- Large readable typography
- High contrast
- Simple wording
- Clear listening indicators
- Clear audio feedback
- Minimal navigation
- Avoid tiny icons without labels
- Avoid relying on color alone

If the patient's device supports accessibility features, do not interfere with them.

---

# 37. NOTIFICATION BEHAVIOR

When a reminder becomes due, use the existing notification infrastructure where possible.

The notification should be clear.

Example:

```text
Memora Reminder

Please remember to turn off the stove.
```

If the companion is actively running and audio is available, it can also speak the reminder.

Do not create duplicate notifications unnecessarily.

---

# 38. CONVERSATION HISTORY

Continue storing conversations using Prompt 1's model/service.

Record:

- Patient
- User message
- Assistant response
- Timestamp
- Relevant metadata if needed

Avoid storing unnecessary raw audio.

Prefer storing:

```text
Transcript
+
metadata
```

rather than indefinite raw audio recordings.

---

# 39. PRIVACY CONTROLS

If the application stores transcripts:

- Keep them associated with the correct patient.
- Respect existing authorization.
- Do not expose them publicly.
- Do not expose them to other patients.
- Do not send unrelated historical conversations to Gemini.

Only send relevant context.

---

# 40. PERFORMANCE

Avoid excessive AI requests.

For normal conversation:

```text
1 patient turn
      ↓
1 AI request
```

For tool calls:

```text
Patient
 ↓
Gemini
 ↓
Tool
 ↓
Gemini final response
```

Avoid unnecessary repeated calls.

For routine reminders:

```text
Scheduler
 ↓
Due?
 ↓
Generate message if necessary
```

Do not continuously poll Gemini.

---

# 41. IMPLEMENTATION ORDER

Implement in this order:

### Step 1
Inspect Prompt 1.

### Step 2
Create voice provider abstractions.

### Step 3
Implement speech-to-text.

### Step 4
Connect transcript to existing Memora Agent.

### Step 5
Implement text-to-speech.

### Step 6
Connect audio output to the phone's normal audio system.

### Step 7
Build simple companion UI.

### Step 8
Implement natural-language reminders.

### Step 9
Implement reminder scheduling/triggering.

### Step 10
Implement proactive routine conversations.

### Step 11
Implement quiet hours and interaction frequency.

### Step 12
Test complete voice loop.

### Step 13
Test failures and edge cases.

---

# 42. TEST SCENARIOS

Test these manually.

## Test 1: Basic conversation

Patient:

> "Hello Memora."

Expected:

Natural spoken response.

---

## Test 2: Casual conversation

Patient:

> "I'm bored."

Expected:

Friendly response.

No tool call required.

---

## Test 3: Routine

Patient:

> "What should I do now?"

Expected:

Agent retrieves the patient's actual routine.

---

## Test 4: Personalization

Patient:

> "I'm bored."

Patient profile contains:

```text
Gardening
```

Expected:

AI may naturally mention gardening.

---

## Test 5: Memory

Patient:

> "Tell me about my daughter."

Expected:

Relevant Memora memories retrieved.

No fabricated information.

---

## Test 6: Reminder

Patient:

> "Remind me to turn off the stove in 15 minutes."

Expected:

1. Gemini detects reminder intent.
2. Tool call occurs.
3. Backend validates.
4. Reminder is stored.
5. AI confirms creation.
6. Reminder triggers after 15 minutes.

---

## Test 7: Ambiguous reminder

Patient:

> "Remind me tomorrow."

Expected:

AI asks what to remind them about.

---

## Test 8: Routine reminder

At configured routine time:

Expected:

> "It's time for your morning walk."

No duplicate reminder if already completed.

---

## Test 9: Quiet hours

During quiet hours:

Expected:

No normal proactive conversation.

Manual patient interaction still works.

---

## Test 10: Bluetooth earbuds

Connect Bluetooth earbuds to the phone.

Expected:

AI response is heard through earbuds.

---

## Test 11: Microphone permission denied

Expected:

Clear explanation and fallback UI.

---

## Test 12: Network disconnected

Expected:

Friendly connection error.

No application crash.

---

## Test 13: Gemini unavailable

Expected:

Friendly fallback.

No sensitive technical error.

---

## Test 14: Cross-patient access attempt

Expected:

Backend rejects unauthorized access.

---

# 43. ACCEPTANCE CRITERIA

This prompt is complete only when:

### Voice

- [ ] Patient can speak to Memora.
- [ ] Speech is converted into text.
- [ ] Text reaches the existing AI Agent.
- [ ] Gemini generates a response.
- [ ] Response is converted to speech.
- [ ] Patient can hear the response.
- [ ] Bluetooth earbuds work through the phone.
- [ ] Listening/processing/speaking states are clear.

### Conversation

- [ ] Natural conversation works.
- [ ] Recent context is maintained.
- [ ] Patient personalization works.
- [ ] Relevant memories can be used.
- [ ] AI does not fabricate patient information.

### Reminders

- [ ] Natural-language reminder requests work.
- [ ] Relative times work.
- [ ] Absolute times work.
- [ ] Backend validates reminder data.
- [ ] Reminder is persisted.
- [ ] Reminder triggers.
- [ ] Patient receives the reminder.
- [ ] Reminder lifecycle is tracked.

### Routine

- [ ] AI can answer routine questions.
- [ ] Proactive routine reminders work.
- [ ] Completed routines are respected.
- [ ] Quiet hours work.
- [ ] Interaction frequency is respected.

### Security

- [ ] Gemini remains server-side.
- [ ] Patient isolation works.
- [ ] Tool calls are validated.
- [ ] LLM cannot access arbitrary database records.
- [ ] No arbitrary code execution is possible.

### Existing Memora

- [ ] Existing functionality remains operational.
- [ ] Existing authentication remains operational.
- [ ] Existing database functionality remains operational.
- [ ] Existing UI is not unnecessarily redesigned.
- [ ] No duplicate reminder or patient systems were created.

---

# 44. FINAL REPORT REQUIRED

After implementation, provide:

## Files created

List every new file.

## Files modified

List every modified file and explain why.

## Voice architecture

Explain:

```text
Microphone
 ↓
STT
 ↓
Memora Agent
 ↓
Gemini
 ↓
TTS
 ↓
Phone audio
 ↓
Bluetooth earbuds
```

## Reminder architecture

Explain:

```text
Patient speech
 ↓
Gemini
 ↓
createReminder tool
 ↓
Node.js validation
 ↓
MongoDB
 ↓
Scheduler
 ↓
Notification / voice reminder
```

## Proactive architecture

Explain how:

```text
Routine
 ↓
Scheduler
 ↓
Due event
 ↓
AI-generated message
 ↓
Patient
```

works.

## Providers

List:

- AI provider
- STT provider
- TTS provider

Do not expose secrets.

## Tests

List all tests performed and results.

## Known limitations

Clearly identify anything intentionally deferred to Prompt 3.

---

# 45. DO NOT IMPLEMENT PROMPT 3 FEATURES

Stop after this prompt.

Do NOT implement:

- GPS tracking
- Geofencing
- Safe-zone management
- Location history
- SOS button
- Emergency alerts
- Emergency contacts
- Caregiver emergency workflows

Those belong to:

> **Prompt 3 - Geofencing + SOS + Caregiver Safety**

---

# FINAL PRODUCT PRINCIPLE

Do not build:

> "A chatbot with speech."

Build:

> **"A voice-first Memora companion that knows the patient's routine and authorized personal context, can understand natural requests such as 'remind me to turn off the stove in 15 minutes,' can proactively check in at appropriate times, and can hold simple personalized conversations."**

The AI should provide intelligence.

The Memora backend should provide memory, scheduling, authorization, and persistence.

The mobile device should provide microphone, audio output, notifications, and the patient-facing experience.

Keep the system simple, reliable, private, and easy for an elderly patient to use.
