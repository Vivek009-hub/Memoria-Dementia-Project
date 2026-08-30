# Memora - Phase B13 Prompt: Safety Mobile App

**Phase:** B13  
**Name:** Memora Safety & Assistance Mobile Application  
**Prerequisites:** B0-B12 completed  
**Status:** Ready for implementation

---

# Objective

Build the Memora mobile application that connects elderly patients to the B12 Safety & Emergency Backend.

The mobile application is the device-side safety layer for:

```text
SOS
Background Location
Geofence Monitoring
Fall Detection Integration
Safety Events
Emergency Contacts
Push Notifications
Voice Interaction
Offline Safety Handling
Device Authentication
```

The mobile app must NOT duplicate backend safety authority.

Core architecture:

```text
                 MEMORA MOBILE APP
                        │
        ┌───────────────┼────────────────┐
        ↓               ↓                ↓
   SOS Button      Location Engine   Fall Detection
        │               │                │
        └───────────────┼────────────────┘
                        ↓
                 B12 Safety API
                        ↓
               Safety Event Engine
                        ↓
                 B9 Notifications
                        ↓
              Caregiver / Contacts
```

The application should be designed specifically for elderly users:

```text
Large buttons
Minimal text
Simple navigation
Voice interaction
Regional language support
High visibility
Few screens
Clear feedback
```

---

# 1. READ FIRST

Before changing anything, read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
```

Then inspect:

```text
B0-B12 backend implementation
B12 Safety API
B9 Notification API
B3 Emergency Contact API
B6 Reminder API
B7 Community Session API
B8 Meeting Circle API
B10 Analytics API
B11 AI API
```

Inspect the actual backend route definitions and API contracts.

Do NOT guess endpoint names if the repository already defines them.

---

# 2. B13 SCOPE

Implement:

- Mobile project foundation
- Authentication integration
- Secure API client
- Secure device/session storage
- Elder-friendly home screen
- SOS button
- SOS confirmation/cancel flow
- Background location support
- Location permission handling
- Geofence integration
- Fall detection integration
- Safety event status
- Emergency contact display
- Safety history
- Push notification integration
- Notification handling
- Voice interaction foundation
- Regional language support
- Offline/retry handling
- Network status handling
- Battery-aware location strategy
- App lifecycle handling
- Secure local storage
- Error handling
- Accessibility
- Logging/diagnostics
- Tests
- Device/integration testing

Do NOT implement:

```text
Backend safety logic
Backend geofence calculations
Backend emergency escalation rules
Direct database access
AI provider credentials
Server secrets
Medical diagnosis
Emergency service dispatch
```

---

# 3. MOBILE TECHNOLOGY

Before choosing the framework:

1. Inspect PROJECT_SPEC.md.
2. Inspect repository conventions.
3. Check whether a mobile framework was already selected.

Possible options:

```text
React Native
Flutter
Native Android
```

Do NOT randomly switch technologies.

If PROJECT_SPEC.md already specifies a framework, use it.

If no framework is specified, choose one that fits the team's existing skills and document the decision before implementation.

---

# 4. MOBILE PROJECT STRUCTURE

Keep the mobile application separate from the backend.

Recommended:

```text
memora/
├── server/
├── client/
└── mobile/
```

or the repository structure defined by PROJECT_SPEC.md.

Do not mix mobile source files into the backend.

---

# 5. MOBILE ARCHITECTURE

Use:

```text
UI
 ↓
Presentation / State
 ↓
Domain Services
 ↓
API / Device Services
 ↓
B12 Backend
```

Separate device capabilities:

```text
LocationService
FallDetectionService
NotificationService
VoiceService
SecureStorageService
NetworkService
```

Do not put native device APIs directly inside UI components.

---

# 6. ELDER-FRIENDLY DESIGN

The primary interface should be extremely simple.

Example:

```text
┌──────────────────────────────┐
│          MEMORA              │
│                              │
│      Good Morning            │
│                              │
│   ┌──────────────────────┐   │
│   │     🧠 PLAY GAME     │   │
│   └──────────────────────┘   │
│                              │
│   ┌──────────────────────┐   │
│   │     🧠 MY MEMORIES   │   │
│   └──────────────────────┘   │
│                              │
│   ┌──────────────────────┐   │
│   │     🔔 REMINDERS     │   │
│   └──────────────────────┘   │
│                              │
│   ┌──────────────────────┐   │
│   │     🫂 COMMUNITY     │   │
│   └──────────────────────┘   │
│                              │
│   ┌──────────────────────┐   │
│   │      🚨 SOS          │   │
│   └──────────────────────┘   │
└──────────────────────────────┘
```

Do not overload the home screen.

---

# 7. LARGE CONTROLS

Controls must be easy to tap.

Prefer:

```text
Large touch targets
Large icons
Large text
Strong visual hierarchy
```

Avoid:

```text
Tiny buttons
Dense menus
Small icons without labels
Hidden emergency actions
```

Follow platform accessibility guidance.

---

# 8. SOS BUTTON

SOS must be immediately accessible.

The UI should clearly indicate:

```text
🚨 SOS
```

Do not hide SOS behind multiple menus.

---

# 9. SOS CONFIRMATION

Prevent accidental activation without making emergency activation difficult.

Recommended:

```text
Tap SOS
    ↓
Large confirmation screen
    ↓
"Do you need help?"
    ↓
[ YES, SEND SOS ]
[ CANCEL ]
```

For a safety-critical interface, avoid complicated multi-step confirmation.

Follow PROJECT_SPEC.md.

---

# 10. SOS REQUEST

When confirmed:

```text
Mobile
  ↓
Acquire latest location if available
  ↓
POST B12 SOS
  ↓
Display result
```

The app must not directly contact:

```text
Emergency services
Caregivers
SMS providers
Push providers
```

B12/B9 own those responsibilities.

---

# 11. SOS FEEDBACK

After sending:

Success:

```text
SOS sent.
Your emergency contacts have been notified.
```

Only say contacts were notified if the backend actually confirms the notification action according to its API semantics.

Failure:

```text
We could not send the SOS.
Please try again or contact someone nearby.
```

Do not expose technical errors.

---

# 12. SOS OFFLINE BEHAVIOR

If the device is offline:

```text
SOS
 ↓
Network unavailable
 ↓
Retry strategy
```

Do not falsely show:

```text
SOS sent
```

unless the request was actually accepted by the backend.

If the app supports queued emergency requests, make the state explicit:

```text
SOS waiting to send
```

and retry immediately when connectivity returns.

Do not silently discard an emergency event.

---

# 13. SOS DUPLICATES

The mobile app should avoid sending repeated requests when:

```text
User taps multiple times
Network request is slow
App retries
```

Use:

```text
Idempotency key
```

if B12 supports it.

---

# 14. LOCATION PERMISSIONS

Request location permissions clearly.

Explain:

```text
Memora uses your location to help with safety features.
```

Do not request permissions unrelated to the feature.

---

# 15. LOCATION PERMISSION STATES

Handle:

```text
Granted
Denied
Restricted
Limited
Revoked
```

depending on platform.

If permission is unavailable:

```text
Safety location features may be limited.
```

Do not crash.

---

# 16. BACKGROUND LOCATION

Background location should be used only when required by B12 safety functionality.

Do not continuously track location at unnecessarily high frequency.

The strategy should balance:

```text
Safety
Battery
Privacy
Network usage
```

---

# 17. LOCATION FREQUENCY

Do not hardcode arbitrary high-frequency GPS polling.

Use configurable values.

Consider:

```text
Movement
Battery level
Geofence presence
Network state
Last successful location
```

The backend remains authoritative for safety events.

---

# 18. LOCATION PAYLOAD

Send only required information.

Example:

```json
{
  "latitude": 28.6000,
  "longitude": 77.2000,
  "accuracy": 15,
  "timestamp": "..."
}
```

Do not send:

```text
email
password
AI tokens
notification tokens
unrelated profile data
```

---

# 19. LOCATION ACCURACY

Display/handle GPS accuracy appropriately.

If:

```text
accuracy = poor
```

do not tell the patient:

```text
"Your location is exact."
```

Use B12's server-side rules for geofence decisions.

---

# 20. GEOFENCE

The mobile app should retrieve/configure geofences through B12.

It should NOT implement the authoritative geofence decision independently.

Flow:

```text
B12
 ↓
Active geofence
 ↓
Mobile
 ↓
Location updates
 ↓
B12
 ↓
Authoritative breach evaluation
```

If local platform geofencing is used for battery efficiency, treat it as an optimization/trigger, not the authoritative safety state.

---

# 21. GEOFENCE EVENTS

The mobile app should respond to B12 results:

```text
Inside
Outside
Unknown
Breach
```

Do not create a second independent geofence alert system.

---

# 22. GEOFENCE NOTIFICATIONS

If B9 generates a caregiver notification:

```text
B12 → B9 → Caregiver
```

The mobile patient app should not duplicate it.

---

# 23. FALL DETECTION

The mobile application integrates with the selected fall-detection mechanism.

Possible sources:

```text
Device sensors
Wearable
Platform APIs
Future ML model
```

Do not implement a complicated fall-detection ML system unless PROJECT_SPEC.md explicitly requires it.

---

# 24. FALL DETECTION ARCHITECTURE

Use:

```text
FallDetectionService
       ↓
Fall event
       ↓
Patient confirmation
       ↓
B12
```

Do not place fall detection logic inside the UI.

---

# 25. FALL CONFIRMATION

When a fall is detected:

```text
┌──────────────────────────────┐
│      Are you okay?           │
│                              │
│   🚨 Fall may have occurred  │
│                              │
│   [ YES, I'M OKAY ]          │
│                              │
│   [ I NEED HELP ]            │
└──────────────────────────────┘
```

The exact flow must follow B12.

---

# 26. FALL TIMEOUT

If the patient does not respond:

```text
Fall detected
      ↓
Confirmation window
      ↓
No response
      ↓
B12 escalation
```

The mobile app must NOT decide:

```text
"Patient definitely needs emergency services."
```

B12 owns the authoritative escalation logic.

---

# 27. FALSE POSITIVES

Fall detection can be wrong.

The app should make it easy to cancel:

```text
I'm okay
```

without requiring complicated navigation.

---

# 28. FALL OFFLINE

If the device is offline:

```text
Fall event
 ↓
Store safely
 ↓
Retry
```

Do not silently discard the event.

Use a bounded local queue.

---

# 29. LOCAL SAFETY QUEUE

If offline event storage is required:

```text
Local Queue
├── event ID
├── event type
├── detectedAt
├── location if available
└── retry status
```

Protect it using secure storage appropriate to the platform.

Do not store secrets in plain text.

---

# 30. NETWORK RETRY

Handle:

```text
No network
Timeout
Server unavailable
Connection lost
```

Use:

```text
Exponential backoff
Bounded retries
Idempotency
```

Do not retry endlessly.

Safety-critical events should have an appropriate retry priority.

---

# 31. DEVICE AUTHENTICATION

The mobile app must authenticate securely with the backend.

Use the existing B2 authentication architecture.

Do not invent a separate user identity system.

---

# 32. TOKEN STORAGE

Never store:

```text
Access tokens
Refresh tokens
Device secrets
```

in plain:

```text
AsyncStorage
SharedPreferences
localStorage
plain text files
```

Use platform secure storage.

Examples:

```text
Android Keystore
iOS Keychain
```

or framework equivalents.

---

# 33. TOKEN EXPIRATION

Handle:

```text
Access token expired
Refresh token valid
```

without forcing unnecessary logout.

If refresh fails:

```text
Securely clear invalid credentials
Require login
```

Do not loop endlessly.

---

# 34. API CLIENT

Create a centralized API client:

```text
ApiClient
```

Responsibilities:

```text
Authentication headers
Request timeout
Error normalization
Retry
Token refresh
Base URL
```

Do not repeat HTTP configuration in every screen.

---

# 35. API ERROR HANDLING

Convert backend errors into simple user-facing messages.

Backend:

```text
SAFETY_EVENT_ALREADY_RESOLVED
```

Mobile:

```text
"This safety alert has already been handled."
```

Do not show:

```text
MongoDB error
HTTP stack trace
provider exception
```

---

# 36. PUSH NOTIFICATIONS

Integrate with B9's push notification architecture.

The app should:

```text
Register device
       ↓
Receive push
       ↓
Display notification
       ↓
Open appropriate screen
```

Do not directly implement B9 notification creation.

---

# 37. DEVICE TOKEN

Register the device token through B9.

Use the endpoint defined by the backend.

Never send:

```text
AI API key
Backend secret
Database credential
```

from the mobile application.

---

# 38. PUSH PERMISSION

Request notification permission appropriately.

Explain simply:

```text
Memora uses notifications to remind you about important activities and safety events.
```

Do not request notification permission repeatedly.

---

# 39. CRITICAL SAFETY NOTIFICATIONS

If the platform supports appropriate notification priority for safety events:

Use the backend's B9 priority.

Do not create a second notification system.

---

# 40. NOTIFICATION ROUTING

Example:

```text
COMMUNITY_SESSION_SCHEDULED
        ↓
Open Community Session

MEETING_STARTED
        ↓
Open Meeting

REMINDER_DUE
        ↓
Open Reminder

SOS / FALL / GEOFENCE
        ↓
Open Safety Event
```

Validate all IDs before navigation.

---

# 41. NOTIFICATION SECURITY

Do not put sensitive information directly into push payloads.

Prefer:

```text
notificationId
eventId
```

then fetch authorized details from B12/B9.

Do not include:

```text
exact private location
private memory
access tokens
```

unless explicitly required.

---

# 42. SAFETY EVENT SCREEN

Provide a simple screen:

```text
🚨 Safety Event

Type:
SOS

Status:
Acknowledged

Time:
5:42 PM

Location:
Available

[ Close ]
```

For patients, only show information they are authorized to see.

---

# 43. SAFETY HISTORY

Potential screen:

```text
Safety History

🚨 SOS
15 Sep
Resolved

⚠️ Fall Detection
10 Sep
Resolved

📍 Geofence Alert
5 Sep
Resolved
```

Do not expose other patients' events.

---

# 44. EMERGENCY CONTACTS

Display configured emergency contacts if allowed.

Example:

```text
Emergency Contacts

👤 Priya
Daughter

👤 Rahul
Son
```

Do not expose:

```text
private contact data
```

unless the authenticated patient is authorized to view it.

---

# 45. DIRECT CALLING

If PROJECT_SPEC.md explicitly requires a call button:

```text
Call Emergency Contact
```

The app should use the platform's approved calling mechanism.

Do not transmit calls through Memora servers.

Do not automatically call emergency services.

---

# 46. EMERGENCY CONTACT EDITING

If contact editing is required:

Use B3 APIs.

Do not create a second local contact database as the source of truth.

---

# 47. VOICE INTERACTION

The app should provide a foundation for:

```text
Voice input
Text-to-speech
Voice assistant
```

Potential flow:

```text
🎤 Tap
 ↓
Speak
 ↓
Speech recognition
 ↓
B11 AI
 ↓
Response
 ↓
Text-to-speech
```

---

# 48. VOICE SAFETY

Voice commands must NOT directly execute sensitive actions without confirmation.

Example:

```text
User:
"Send SOS."
```

Safer flow:

```text
Voice intent
 ↓
Confirm:
"Do you want to send an SOS?"
 ↓
YES
 ↓
B12
```

Do not allow accidental voice activation of critical actions.

---

# 49. AI INTEGRATION

The mobile app may call B11 APIs:

```text
AI Chat
Memory Assistant
Recommendations
```

Never call the AI provider directly from the mobile app.

Correct:

```text
Mobile
 ↓
B11
 ↓
AI Provider
```

Incorrect:

```text
Mobile
 ↓
AI Provider
```

---

# 50. AI CREDENTIAL SECURITY

Absolutely never put:

```text
OPENAI_API_KEY
ANTHROPIC_API_KEY
GEMINI_API_KEY
```

or equivalent credentials in the mobile project.

The mobile app only receives backend responses.

---

# 51. REGIONAL LANGUAGE SUPPORT

Support at least the languages specified by PROJECT_SPEC.md.

Potential:

```text
English
Hindi
```

Design the app so additional languages can be added.

Use localization resources:

```text
en.json
hi.json
```

or the framework's equivalent.

---

# 52. DO NOT HARDCODE UI TEXT

Avoid:

```text
<Text>Play Game</Text>
```

when localization is required.

Prefer:

```text
t("home.playGame")
```

or framework equivalent.

---

# 53. SIMPLE LANGUAGE

Use short phrases:

```text
Play Game
My Memories
My Reminders
Community
Meeting
Safety
SOS
```

Avoid complex wording.

---

# 54. TEXT-TO-SPEECH

Where supported:

```text
Read important notifications
Read reminders
Read AI responses
Read safety status
```

Do not automatically read every notification aloud without user consent.

---

# 55. VOICE ACCESSIBILITY

Provide:

```text
Tap to speak
Speak response
Repeat
```

Do not require continuous listening by default.

Continuous microphone access creates privacy and battery concerns.

---

# 56. ACCESSIBILITY

Support platform accessibility features.

Include:

```text
Large text
Screen reader labels
High contrast
Clear focus
Large touch targets
Reduced motion where appropriate
```

Do not rely only on color.

---

# 57. COLOR

Use color carefully.

Example:

```text
SOS → visually prominent
Success → clear positive state
Warning → clear warning state
```

But do not communicate meaning only through color.

Use:

```text
Icon + text + color
```

---

# 58. DARK MODE

If supported by the project, ensure:

```text
SOS
Safety
Reminders
Buttons
Text
```

remain readable in both themes.

---

# 59. OFFLINE MODE

The app should remain useful when offline.

Available offline:

```text
Cached basic profile
Cached emergency contacts where appropriate
Cached UI
Queued safety events
Cached recent notifications
```

Do not cache:

```text
AI provider credentials
Backend secrets
Unnecessary private data
```

---

# 60. OFFLINE INDICATOR

Display a clear state:

```text
No internet connection
```

Do not overwhelm the patient with technical information.

---

# 61. NETWORK RECOVERY

When network returns:

```text
Reconnect
 ↓
Refresh authentication
 ↓
Sync queued events
 ↓
Refresh safety state
 ↓
Refresh notifications
```

Queued events must be processed idempotently.

---

# 62. BATTERY MANAGEMENT

Background location and sensors can consume significant battery.

Use:

```text
Platform background APIs
Appropriate location accuracy
Reasonable intervals
Movement detection
```

Do not poll GPS continuously at maximum accuracy.

---

# 63. LOW BATTERY

If the project requires low-battery alerts:

```text
Mobile
 ↓
B12
 ↓
B9
 ↓
Caregiver
```

Do not implement a separate notification mechanism.

Only implement if specified.

---

# 64. APP LIFECYCLE

Handle:

```text
Foreground
Background
Suspended
Killed
Restarted
```

Safety functionality must not rely solely on a foreground UI screen.

Use platform-approved background mechanisms.

---

# 65. BACKGROUND LIMITATIONS

Mobile operating systems impose restrictions.

Do not claim:

```text
Background location always works.
Fall detection always works.
SOS always works without connectivity.
```

Document platform limitations.

---

# 66. DEVICE RESTART

After device restart:

```text
App/device initializes
 ↓
Authenticate
 ↓
Restore safety configuration
 ↓
Restore background monitoring if permitted
```

Do not assume previous in-memory state still exists.

---

# 67. SECURE LOCAL DATA

Encrypt or securely store sensitive local data using platform mechanisms.

Do not store:

```text
Location history
Safety secrets
Tokens
Private AI conversations
```

in plaintext unless explicitly justified.

---

# 68. LOCATION DATA LOCAL STORAGE

If location events are queued offline:

Store only:

```text
Required event data
```

and delete after successful synchronization.

Do not retain an unlimited local GPS history.

---

# 69. MOBILE LOGGING

Development logs may include:

```text
API endpoint category
success/failure
latency
event type
```

Never log:

```text
access token
refresh token
exact emergency location unnecessarily
AI secrets
database credentials
private memory content
```

Disable verbose sensitive logging in production.

---

# 70. CRASH HANDLING

The app must not crash because:

```text
GPS unavailable
Network unavailable
Push permission denied
AI unavailable
B12 unavailable
```

Show a simple user-facing message.

---

# 71. SECURITY

Protect against:

```text
Token theft
Insecure storage
Deep-link abuse
Unauthorized notification navigation
API endpoint manipulation
Sensitive screenshot exposure where appropriate
Debug builds leaking secrets
```

---

# 72. DEEP LINK SECURITY

Push notifications may open:

```text
Safety Event
Community Session
Meeting
Reminder
```

The app must verify authorization with the backend.

Do not trust a notification payload containing:

```text
patientId
eventId
```

as proof of access.

---

# 73. AUTHORIZATION

The backend remains authoritative.

Mobile UI checks are only for user experience.

Never rely on:

```text
if (isCaregiver) showLocation()
```

as the security boundary.

B12/B9 enforce actual authorization.

---

# 74. APP CONFIGURATION

Use environment/configuration for:

```text
API base URL
environment
feature flags
logging level
```

Do not hardcode production URLs throughout the application.

---

# 75. DEVELOPMENT ENVIRONMENTS

Support:

```text
Development
Testing
Production
```

Do not accidentally point development builds at production safety data.

---

# 76. TESTING

Create:

```text
Unit tests
Component/UI tests
API integration tests
Device capability tests
Safety flow tests
Offline tests
Permission tests
Accessibility tests
```

---

# 77. SOS TESTS

Test:

```text
✓ SOS button visible
✓ SOS confirmation works
✓ SOS request sent
✓ idempotency key generated
✓ duplicate tap handled
✓ offline behavior handled
✓ success state shown
✓ failure state shown
```

---

# 78. LOCATION TESTS

Test:

```text
✓ permission granted
✓ permission denied
✓ permission revoked
✓ valid location sent
✓ invalid location rejected
✓ offline location queued
✓ queued location retries
✓ queue clears after success
```

---

# 79. GEOFENCE TESTS

Test:

```text
✓ geofence loaded
✓ geofence state displayed
✓ local geofence trigger handled
✓ backend remains authoritative
✓ duplicate breach not generated
✓ network failure handled
```

---

# 80. FALL TESTS

Test:

```text
✓ fall event generated by mock detector
✓ confirmation screen appears
✓ patient confirms safe
✓ patient requests help
✓ timeout behavior works
✓ offline event queued
✓ duplicate fall event handled
```

---

# 81. NOTIFICATION TESTS

Test:

```text
✓ notification permission flow
✓ device token registration
✓ push received
✓ correct navigation
✓ unauthorized resource cannot be opened
✓ safety notification displayed clearly
```

---

# 82. VOICE TESTS

Test:

```text
✓ microphone permission
✓ speech recognition
✓ unsupported speech handled
✓ AI response spoken
✓ critical action requires confirmation
✓ microphone can be disabled
```

---

# 83. LANGUAGE TESTS

Test:

```text
✓ English
✓ Hindi
✓ fallback language
✓ long translated strings
✓ accessibility labels translated
✓ notification text translated where supported
```

---

# 84. ACCESSIBILITY TESTS

Verify:

```text
✓ screen reader labels
✓ large text
✓ large touch targets
✓ high contrast
✓ no color-only information
✓ SOS remains easy to find
```

---

# 85. OFFLINE TESTS

Test:

```text
Network lost
   ↓
SOS
   ↓
Queued
   ↓
Network returns
   ↓
Request synchronized
```

Also:

```text
Fall
   ↓
Offline
   ↓
Queue
   ↓
Reconnect
   ↓
B12
```

---

# 86. SECURITY TESTS

Verify:

```text
✓ tokens not stored in insecure storage
✓ secrets absent from mobile bundle
✓ unauthorized deep links rejected
✓ API authorization remains server-side
✓ notification payload contains no sensitive secrets
✓ debug logs do not expose credentials
```

---

# 87. BATTERY TESTS

Measure:

```text
Background location impact
Fall detection impact
Push notification impact
Offline queue impact
```

Avoid unnecessary background work.

---

# 88. PERFORMANCE

The app should:

```text
Start quickly
Render simple screens quickly
Avoid blocking UI on network requests
Avoid excessive battery use
Avoid unnecessary API calls
```

---

# 89. MOBILE API CONTRACT

Create/update documentation for:

```text
Authentication
SOS
Location
Fall Events
Geofences
Safety Events
Emergency Contacts
Notifications
AI
```

Do not expose backend implementation details.

---

# 90. NO BACKEND DUPLICATION

Do NOT implement inside mobile:

```text
Authoritative SOS lifecycle
Emergency escalation
Caregiver authorization
Server-side geofence state
Notification delivery
Safety event resolution rules
```

Those belong to B12/B9.

---

# 91. NO DIRECT DATABASE ACCESS

The mobile application must never connect directly to:

```text
MongoDB
MongoDB Atlas
Database server
Redis
Internal queues
```

All data goes through backend APIs.

---

# 92. NO AI PROVIDER DIRECT ACCESS

The mobile app must never connect directly to:

```text
OpenAI
Anthropic
Gemini
Other LLM provider
```

unless a future architecture explicitly requires a public client-side model.

For B11:

```text
Mobile → Memora Backend → AI Provider
```

---

# 93. NO EMERGENCY SERVICE DIRECT ACCESS

The mobile app must not implement:

```text
Direct ambulance dispatch
Police API
Hospital API
```

unless separately specified and legally/operationally validated.

---

# 94. PROJECT STRUCTURE

Recommended:

```text
mobile/
├── src/
│   ├── api/
│   ├── auth/
│   ├── navigation/
│   ├── screens/
│   │   ├── Home/
│   │   ├── Safety/
│   │   ├── Memories/
│   │   ├── Games/
│   │   ├── Reminders/
│   │   ├── Community/
│   │   ├── Meetings/
│   │   └── AI/
│   ├── services/
│   │   ├── LocationService/
│   │   ├── FallDetectionService/
│   │   ├── NotificationService/
│   │   ├── VoiceService/
│   │   ├── SecureStorageService/
│   │   └── NetworkService/
│   ├── state/
│   ├── localization/
│   ├── components/
│   ├── utils/
│   └── tests/
└── ...
```

Adapt to the selected mobile framework.

---

# 95. HOME SCREEN

Implement the minimal home experience.

Suggested primary actions:

```text
🧠 Games
🧠 Memories
⏰ Reminders
🫂 Community
🤝 Meetings
🤖 Assistant
🚨 SOS
```

Keep navigation simple.

---

# 96. SAFETY SCREEN

Provide:

```text
SOS
Safety Status
Current/last known location
Emergency Contacts
Recent Safety Events
```

Only show authorized information.

---

# 97. COMMUNITY INTEGRATION

Use B7 APIs.

Mobile should allow patients to:

```text
View voting options
Vote
View schedule
Pre-register
View session details
```

Do not duplicate voting/scheduling logic locally.

---

# 98. MEETING INTEGRATION

Use B8 APIs.

Mobile should allow:

```text
View scheduled meeting
Join meeting
View meeting status
```

The actual meeting UI/provider integration must follow B8's selected provider.

Do not create a second meeting backend.

---

# 99. REMINDER INTEGRATION

Use B6 APIs.

Mobile should allow:

```text
View reminders
Mark reminder complete
View reminder status
```

Do not implement reminder logic separately.

---

# 100. MEMORY INTEGRATION

Use B5 APIs.

Mobile should allow:

```text
View memories
Create memories
Edit memories
Search memories
```

AI memory assistance uses B11.

---

# 101. GAME INTEGRATION

Use B4 APIs.

Mobile should allow:

```text
Browse games
Start game
Complete game
View progress
```

Game logic may run locally where appropriate, but authoritative results must follow B4 architecture.

---

# 102. AI INTEGRATION

Use B11 APIs for:

```text
Memory Assistant
AI Chat
Recommendations
```

Voice:

```text
Voice input
 ↓
B11
 ↓
Response
 ↓
Text-to-speech
```

Do not expose AI provider credentials.

---

# 103. ANALYTICS

Use B10 APIs to display patient-facing progress where appropriate.

Potential:

```text
Games this week
Reminder completion
Community participation
Activity trend
```

Do not display:

```text
Dementia score
Medical diagnosis
Clinical progression
```

---

# 104. NOTIFICATION INTEGRATION

Use B9.

The mobile app is a delivery/client layer.

Architecture:

```text
B9
 ↓
Push
 ↓
Mobile
```

Do not duplicate notification creation logic.

---

# 105. APP SETTINGS

Potential:

```text
Language
Text size
Voice
Notifications
Safety settings
Privacy
Account
Logout
```

Do not expose technical settings to elderly users unnecessarily.

---

# 106. SAFETY SETTINGS

Potential:

```text
Location permission status
Geofence status
Fall detection status
Notification status
Emergency contacts
```

Use simple status indicators.

---

# 107. LOCATION STATUS

Example:

```text
Location Safety
🟢 Active
Last updated: 2 minutes ago
```

If stale:

```text
🟠 Location may be outdated
```

Do not falsely claim live tracking.

---

# 108. FALL DETECTION STATUS

Example:

```text
Fall Detection
🟢 Active
```

If unavailable:

```text
🟠 Fall detection unavailable
```

Do not claim detection works if platform permission/sensor support is unavailable.

---

# 109. GEOFENCE STATUS

Example:

```text
Safe Area
🟢 Active
Home
```

If no geofence:

```text
No safe area configured
```

---

# 110. USER EDUCATION

Keep explanations short.

Example:

```text
Why location?
"Location helps Memora respond to safety events."
```

Do not overwhelm the patient with privacy/legal text on every screen.

Detailed privacy information can exist in settings.

---

# 111. PRIVACY SCREEN

Provide accessible privacy information explaining:

```text
What location is used for
What safety data is stored
How AI features use data
How notifications work
```

Do not make unsupported claims.

---

# 112. APP PERMISSIONS

Request only when needed:

```text
Location → when safety location is enabled
Notifications → when notifications are needed
Microphone → when voice is used
Motion/sensor permissions → when fall detection requires them
```

Do not request everything on first launch.

---

# 113. PERMISSION EDUCATION

Before system permission dialogs, provide simple context:

```text
"Memora needs location access to help with safety."
```

Then show the OS permission prompt.

---

# 114. ACCOUNT LOGOUT

Logout must:

```text
Invalidate local session
Clear secure tokens
Clear sensitive cached data
Unregister device if required
Return to login
```

Do not leave credentials behind.

---

# 115. ACCOUNT SWITCHING

If multiple users can use the device:

```text
User A logout
 ↓
Secure cleanup
 ↓
User B login
```

Do not allow User B to see User A's cached:

```text
memories
notifications
safety events
AI conversations
location
```

---

# 116. DATA ISOLATION

Every local cache must be scoped to:

```text
authenticated user
```

Avoid global caches containing personal data.

---

# 117. DEEP LINK / PUSH DATA VALIDATION

Before opening:

```text
Safety event
Memory
Meeting
Community Session
Reminder
```

the app should:

```text
Authenticate
 ↓
Request backend resource
 ↓
Verify authorization
 ↓
Display
```

---

# 118. MOBILE SECURITY CHECKLIST

Verify:

```text
[ ] No backend secrets in app
[ ] No AI provider keys
[ ] Secure token storage
[ ] HTTPS production API
[ ] No direct database access
[ ] No direct AI provider access
[ ] No direct emergency-service integration
[ ] Sensitive logs removed
[ ] Deep links validated
[ ] User data isolated
[ ] Logout clears sensitive state
```

---

# 119. TESTING WITH MOCK BACKEND

Development should support a mock backend or test environment.

Do not require production services for:

```text
UI tests
Unit tests
Safety UI tests
Offline tests
```

---

# 120. DEVICE TESTING

Test on real supported devices.

At minimum verify:

```text
GPS
Background location
Push notifications
Battery behavior
Microphone
Sensors
App restart
Network loss
Permission changes
```

---

# 121. ANDROID / IOS DIFFERENCES

Document platform-specific limitations.

Examples may include:

```text
Background execution
Location permission levels
Push behavior
Battery optimization
Sensor availability
```

Do not assume Android and iOS behave identically.

---

# 122. FALL DETECTION HARDWARE

If a wearable/device is used later:

Create an adapter:

```text
FallDetectionProvider
```

rather than coupling the entire application to one hardware vendor.

If no wearable is selected:

Use a mock provider for development/testing.

---

# 123. LOCATION PROVIDER ABSTRACTION

Use:

```text
LocationProvider
```

so platform-specific implementations remain isolated.

Example:

```text
AndroidLocationProvider
IOSLocationProvider
MockLocationProvider
```

---

# 124. NOTIFICATION PROVIDER ABSTRACTION

Use the framework/platform notification APIs behind:

```text
MobileNotificationService
```

The backend B9 remains the source of notification events.

---

# 125. VOICE PROVIDER ABSTRACTION

Use:

```text
SpeechRecognitionProvider
TextToSpeechProvider
```

where appropriate.

Do not hardwire the UI to one speech engine.

---

# 126. BATTERY-AWARE SAFETY

Prioritize:

```text
SOS reliability
Fall detection reliability
Geofence safety
```

while minimizing unnecessary:

```text
GPS
network
CPU
sensor
```

usage.

Document tradeoffs.

---

# 127. APP UPDATE SAFETY

If a new app version changes safety behavior:

```text
B12 API compatibility
```

must be considered.

Do not break older supported clients without versioning/compatibility planning.

---

# 128. API VERSIONING

Use the backend's existing version:

```text
/api/v1/
```

Do not invent:

```text
/v2
```

unless required.

---

# 129. ERROR RECOVERY

For critical safety screens:

If API fails:

```text
Retry
```

should be obvious.

Do not trap the user on a blank screen.

---

# 130. UI STATE

Every network-driven screen should handle:

```text
Loading
Success
Empty
Offline
Error
Retry
```

Do not assume network success.

---

# 131. EMPTY STATES

Use simple wording.

Example:

```text
No reminders today.
```

rather than:

```text
No reminder objects were returned from the API.
```

---

# 132. SAFETY EMPTY STATE

If no active safety events:

```text
You're okay.
No active safety alerts.
```

Avoid alarming language.

---

# 133. MEETING UX

When a Meeting Circle event is scheduled:

```text
Community
 ↓
Upcoming
 ↓
Meeting
 ↓
Join
```

Follow B8.

Do not expose provider-specific implementation details to the user.

---

# 134. COMMUNITY UX

Keep:

```text
🗳️ Vote
📅 Schedule
```

as the two primary sections.

The flow remains:

```text
Vote
 ↓
Admin approves
 ↓
Schedule
 ↓
Pre-register
 ↓
Meeting Circle
```

---

# 135. AI UX

Keep AI interaction simple:

```text
🎤 Ask Memora
```

Potential prompts:

```text
"What did I do last Sunday?"
"Tell me about my family."
"When is my next session?"
"What game should I play?"
```

AI responses must remain grounded and non-medical.

---

# 136. NO MEDICAL CLAIMS

The mobile app must not present AI output as:

```text
Diagnosis
Medical advice
Treatment
Clinical assessment
```

If B11 returns safety/medical disclaimers, display them appropriately.

---

# 137. NO AUTONOMOUS SAFETY ACTION

The mobile app must not let AI:

```text
Trigger SOS automatically
Resolve SOS automatically
Change geofence automatically
Contact emergency services automatically
```

Critical safety actions require explicit user/system authorization.

---

# 138. BUILD CONFIGURATION

Separate:

```text
Development
Staging
Production
```

Use secure configuration.

Do not commit:

```text
production credentials
signing secrets
provider secrets
```

---

# 139. SECRET MANAGEMENT

Never place secrets in:

```text
Git
source code
public config
mobile bundle
screenshots
logs
```

Remember:

```text
Mobile application code is inspectable.
```

Anything shipped in the app should be treated as public.

---

# 140. RELEASE CHECKLIST

Before production:

```text
[ ] Production API configured
[ ] HTTPS enabled
[ ] No secrets in bundle
[ ] Secure storage verified
[ ] Push notifications verified
[ ] Location permissions verified
[ ] Background location tested
[ ] Fall detection tested
[ ] SOS tested
[ ] Offline queue tested
[ ] Deep links secured
[ ] Accessibility tested
[ ] Localization tested
[ ] Battery tested
[ ] Crash handling tested
[ ] B12 compatibility verified
[ ] B9 compatibility verified
```

---

# 141. DOCUMENTATION

Update:

```text
docs/ARCHITECTURE.md
```

and create/update mobile documentation.

Document:

```text
Mobile architecture
B12 API integration
B9 notification integration
Authentication
Secure storage
Location strategy
Geofence integration
Fall detection provider
SOS flow
Offline queue
Voice architecture
Localization
Accessibility
Battery strategy
Platform limitations
```

---

# 142. DO NOT REWRITE B0-B12

Do not rewrite:

```text
Backend
Authentication
Users
Caregivers
Games
Memories
Reminders
Community Sessions
Meeting Circle
Notifications
Analytics
AI
Safety Backend
```

unless a genuine integration defect blocks B13.

If a backend defect is found:

1. Explain it.
2. Make the smallest safe fix.
3. Add a regression test.
4. Mention it in the final report.

Do not move backend logic into the mobile application.

---

# 143. FINAL VERIFICATION

Run the mobile project's appropriate commands.

Examples:

```bash
npm test
npm run lint
npm run format:check
```

or the equivalent commands for the selected framework.

Also run the project's build command.

Verify:

```text
Authentication works
Home screen works
SOS works
Location works
Geofence integration works
Fall detection integration works
Notifications work
Voice works
Localization works
Accessibility works
Offline behavior works
Secure storage works
AI integration works
Community works
Meetings work
Reminders work
Memories work
Games work
Analytics works
```

---

# 144. FINAL REPORT

Return:

```text
B13 MEMORA SAFETY MOBILE APP REPORT

Framework:
-

Mobile architecture:
-

Platforms:
-

Files created:
-

Files modified:
-

Authentication:
-

Secure storage:
-

API client:
-

Home screen:
-

SOS:
-

SOS confirmation:
-

SOS offline handling:
-

Location:
-

Background location:
-

Location permissions:
-

Geofence:
-

Fall detection:
-

Fall confirmation:
-

Safety events:
-

Emergency contacts:
-

Push notifications:
-

Device token:
-

Voice:
-

Text-to-speech:
-

Regional languages:
-

Accessibility:
-

Offline mode:
-

Retry strategy:
-

Battery strategy:
-

AI integration:
-

Memory integration:
-

Games integration:
-

Reminders integration:
-

Community integration:
-

Meeting integration:
-

Analytics integration:
-

Security:
-

Privacy:
-

Deep-link security:
-

Tests:
-

Device tests:
-

Accessibility tests:
-

Offline tests:
-

Battery tests:
-

Lint:
-

Formatting:
-

Build:
-

Known issues:
-

Platform limitations:
-

Assumptions:
-
```

Also provide:

```bash
git status
git diff --stat
```

Do NOT commit or push.

Do NOT proceed to B14.

---

# 145. B13 DEFINITION OF DONE

B13 is complete only when:

[ ] Mobile framework selected according to project specification
[ ] Mobile project created
[ ] Backend API integration implemented
[ ] Authentication integrated
[ ] Secure token storage implemented
[ ] Centralized API client implemented
[ ] User-scoped local storage implemented
[ ] Elder-friendly home screen implemented
[ ] Large controls implemented
[ ] SOS button implemented
[ ] SOS confirmation implemented
[ ] SOS API integrated with B12
[ ] SOS idempotency supported
[ ] SOS offline behavior handled
[ ] SOS success/failure feedback implemented
[ ] Location permissions handled
[ ] Background location implemented where required
[ ] Location API integrated with B12
[ ] Location accuracy handled
[ ] Location privacy respected
[ ] Geofence integration implemented
[ ] Backend remains authoritative for geofence decisions
[ ] Geofence state displayed
[ ] Fall detection provider abstraction implemented
[ ] Fall detection integrated where supported
[ ] Fall confirmation implemented
[ ] Fall offline handling implemented
[ ] Fall escalation delegated to B12
[ ] Safety event screen implemented
[ ] Safety history implemented
[ ] Emergency contacts displayed where authorized
[ ] B3 contact data reused
[ ] B9 push notification integration implemented
[ ] Device token registration implemented if required
[ ] Notification routing implemented
[ ] Sensitive push payloads avoided
[ ] Voice interaction foundation implemented
[ ] Speech recognition integrated where supported
[ ] Text-to-speech integrated where supported
[ ] Critical voice actions require confirmation
[ ] Regional language support implemented
[ ] UI strings localized
[ ] Accessibility implemented
[ ] Large text supported
[ ] Screen reader labels supported
[ ] High contrast supported
[ ] Offline state implemented
[ ] Safety event retry queue implemented where required
[ ] Retry is bounded and idempotent
[ ] Network recovery implemented
[ ] Battery-aware location strategy implemented
[ ] App lifecycle handled
[ ] Device restart handled
[ ] Deep links secured
[ ] AI integrated through B11 backend only
[ ] No AI provider credentials in mobile
[ ] Games integrated through B4
[ ] Memories integrated through B5
[ ] Reminders integrated through B6
[ ] Community integrated through B7
[ ] Meetings integrated through B8
[ ] Notifications integrated through B9
[ ] Analytics integrated through B10
[ ] Safety integrated through B12
[ ] No direct database access
[ ] No backend safety logic duplicated
[ ] No autonomous AI safety actions
[ ] No fake emergency dispatch
[ ] No medical diagnosis
[ ] Security testing completed
[ ] Offline testing completed
[ ] Device testing completed
[ ] Accessibility testing completed
[ ] Battery testing completed
[ ] All automated tests pass
[ ] Lint passes
[ ] Formatting passes
[ ] Build passes
[ ] Documentation updated
[ ] No secrets committed
[ ] No unrelated features implemented

Only after all applicable items pass should B13 be considered complete.

---

# 146. STOP CONDITION

After B13 is complete:

**STOP.**

Do not begin another phase automatically.

At this point Memora should have:

```text
Backend
+
Database
+
Authentication
+
Cognitive Games
+
Memory Assistance
+
Reminders
+
Community Sessions
+
Meeting Circle
+
Notifications
+
Analytics
+
AI
+
Safety Backend
+
Safety Mobile App
```

The next work should be treated as a separate integration/stabilization stage rather than blindly adding another feature phase.

Recommended next stage:

```text
INTEGRATION / HARDENING
```

Focus on:

```text
End-to-end integration
Security audit
Privacy audit
Performance testing
Mobile/backend compatibility
AI safety evaluation
Accessibility review
Real-device testing
Failure recovery
Deployment
Monitoring
Documentation
```

Do not add new major functionality until the existing system works reliably end-to-end.
