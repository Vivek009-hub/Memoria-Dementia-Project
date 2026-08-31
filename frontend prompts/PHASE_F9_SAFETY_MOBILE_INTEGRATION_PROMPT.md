# Memora - Phase F9 Prompt: Safety Dashboard + SOS + Location + Fall Detection Mobile Integration

**Phase:** F9  
**Name:** Safety Dashboard + SOS + Location/Fall Detection Mobile Integration UI  
**Prerequisites:** F0-F8 completed and verified  
**Backend prerequisites:** Existing safety, SOS, emergency-contact, geolocation, fall-detection, device/mobile integration, and notification APIs must be inspected before implementation  
**Status:** Ready for implementation

---

# OBJECTIVE

Build the patient-facing safety experience for Memora and connect the web frontend to the existing safety backend and the dedicated small mobile safety app.

The safety architecture should be:

```text
                    MEMORA
                       │
          ┌────────────┴────────────┐
          ↓                         ↓
     Web Frontend              Mobile App
          │                         │
          │                  Location Sensor
          │                  Accelerometer
          │                  Fall Detection
          │                  Background Monitoring
          │                         │
          └────────────┬────────────┘
                       ↓
                Existing Backend
                       ↓
              Safety / SOS Services
                       ↓
              Emergency Contacts
                       ↓
                 Notifications
```

F9 should provide a simple safety dashboard and connect the patient account to the mobile safety app.

The interface must be extremely clear because safety actions may be used during stressful situations.

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
```

Also inspect the actual implementation of:

```text
F0-F8
Safety backend
SOS backend
Emergency contact backend
Location backend
Fall detection backend
Device registration
Mobile authentication
Mobile/device status
B9 notifications
Safety event logging
```

If the mobile app does not yet exist, inspect the project's mobile architecture requirements before creating it.

The actual repository and backend API contracts are authoritative.

---

# 2. CRITICAL SAFETY RULES

## Rule 1: Inspect existing safety APIs first

Identify actual:

```text
SOS endpoints
Emergency contact endpoints
Location endpoints
Fall detection endpoints
Safety event endpoints
Device registration endpoints
Device status endpoints
Mobile authentication endpoints
Notification endpoints
```

Do not invent endpoints.

---

## Rule 2: Safety backend is authoritative

The backend determines:

```text
SOS state
Safety event state
Device registration
Emergency contact authorization
Location-sharing state
Fall event state
Alert state
```

Do not make the frontend the source of truth.

---

## Rule 3: Mobile app is responsible for sensor access

The small mobile app should be responsible for capabilities that require device-level access, such as:

```text
GPS/location
Accelerometer
Motion sensors
Background monitoring
Fall detection
Emergency triggering
```

Do not attempt to implement continuous background geolocation or fall detection in the browser.

---

# 3. F9 SCOPE

Implement:

```text
Safety Dashboard
SOS UI
SOS Confirmation
SOS State
Emergency Contact UI where supported
Location Status
Mobile App Connection Status
Device Status
Fall Detection Status
Safety Event History where supported
Safety Notifications
Safety Settings where supported
Mobile App Pairing/Registration where supported
Safety Error States
Offline States
Accessibility
Localization
Responsive design
Security
Privacy
```

Also implement the frontend/mobile integration contract required to connect the small mobile safety app to the existing backend.

---

# 4. SAFETY DASHBOARD

Create:

```text
/app/safety
```

or the route established by the application architecture.

Example:

```text
🚨 Safety

┌────────────────────────────────┐
│        🚨 EMERGENCY            │
│                                │
│       [ SEND SOS ]             │
│                                │
└────────────────────────────────┘

📍 Location
Connected

🧍 Fall Detection
Active

📱 Safety App
Connected

👥 Emergency Contacts
2 contacts
```

Use actual backend/device data.

Do not display "Active" or "Connected" unless the system confirms it.

---

# 5. SOS BUTTON

The SOS control is the most important F9 UI element.

It should be:

```text
Large
Highly visible
Easy to tap
Accessible
Clearly labeled
```

Example:

```text
🚨 SEND SOS
```

Do not make it a tiny icon.

---

# 6. SOS FLOW

Preferred flow:

```text
Patient taps SOS
       ↓
Confirmation
       ↓
Patient confirms
       ↓
Backend SOS API
       ↓
Safety event created
       ↓
Emergency workflow triggered
       ↓
Notification system
```

Use the actual backend behavior.

---

# 7. SOS CONFIRMATION

Unless the existing specification explicitly requires one-tap SOS, use a confirmation step to reduce accidental activation.

Example:

```text
🚨 Send Emergency Alert?

This will notify your emergency contacts.

[ Cancel ]
[ SEND SOS ]
```

The confirmation must be large and clear.

---

# 8. ONE-TAP SOS

If the backend/project explicitly requires one-tap SOS:

```text
Follow the existing product specification.
```

Do not add a confirmation that contradicts the defined emergency workflow.

---

# 9. SOS DUPLICATE PROTECTION

Prevent accidental repeated SOS requests.

If an SOS is already active:

```text
Emergency alert already active.
```

Do not create multiple alerts from repeated taps.

---

# 10. SOS LOADING

During submission:

```text
Sending emergency alert...
```

Disable duplicate interaction.

---

# 11. SOS SUCCESS

After backend confirmation:

```text
🚨 Emergency alert sent.

Your emergency contacts have been notified.
```

Only say contacts were notified if the backend confirms the relevant notification workflow.

---

# 12. SOS FAILURE

If the backend fails:

```text
We couldn't send the emergency alert.

Please try again or use the available emergency method.
```

Do not falsely claim an alert was sent.

---

# 13. SOS STATE

If backend exposes active SOS state:

```text
Active
Resolved
Cancelled
Failed
```

display the actual state.

Do not invent status values.

---

# 14. SOS RESOLUTION

If the backend supports resolving/cancelling SOS:

```text
Resolve Emergency
```

Use the actual backend workflow.

Do not automatically resolve an SOS on page refresh.

---

# 15. EMERGENCY CONTACTS

If supported, show:

```text
Emergency Contacts

👤 Family Member
📞 Contact information

👤 Caregiver
📞 Contact information
```

Only display data authorized for the patient.

---

# 16. CONTACT PRIVACY

Do not expose:

```text
Private contact information
Internal contact IDs
Authentication tokens
```

in URLs or logs.

---

# 17. ADD CONTACT

Only implement if the existing backend allows patient-managed contacts.

Potential:

```text
[ Add Emergency Contact ]
```

Use the actual backend contract.

---

# 18. EDIT CONTACT

If supported:

```text
Edit
 ↓
Save
 ↓
Backend confirmation
```

---

# 19. DELETE CONTACT

If supported:

```text
Delete contact?

[ Cancel ]
[ Delete ]
```

Never silently delete.

---

# 20. CONTACT VERIFICATION

If backend has verification state:

```text
Verified
Pending
Failed
```

display actual state.

Do not invent verification.

---

# 21. LOCATION STATUS

The web dashboard should show location status rather than attempting to perform continuous tracking itself.

Example:

```text
📍 Location

Safety App
✓ Connected

Last update
10:42 AM
```

Only display values actually returned by the backend.

---

# 22. LOCATION SHARING STATE

If supported:

```text
Location sharing
ON
```

or:

```text
Location sharing
OFF
```

Use actual backend/device state.

---

# 23. LOCATION PERMISSION

If the mobile app has not granted location permission:

```text
Location access is not enabled.
Open the Safety App to enable it.
```

Do not pretend location is active.

---

# 24. CURRENT LOCATION

Only display exact current location if:

```text
The backend exposes it
The patient is authorized to see it
The project explicitly requires patient access
```

Do not expose location unnecessarily.

---

# 25. LOCATION PRIVACY

Location is highly sensitive.

Do not place precise coordinates into:

```text
URLs
console logs
analytics
error messages
```

unless explicitly required and protected.

---

# 26. LOCATION HISTORY

Only implement location history if explicitly supported.

Do not create a map history from arbitrary backend data.

---

# 27. LOCATION MAP

If a map is required:

```text
Use the project's approved map architecture.
```

Do not expose exact location to unauthorized users.

Do not embed a third-party map using secret keys in frontend code.

---

# 28. FALL DETECTION STATUS

The web UI should show the state of the mobile fall-detection system.

Example:

```text
🧍 Fall Detection

✓ Active
Safety App connected
```

Possible backend states may include:

```text
Active
Inactive
Disconnected
Permission required
Unavailable
Alert triggered
```

Only use actual backend states.

---

# 29. FALL DETECTION IS MOBILE-FIRST

The mobile app handles:

```text
Sensor data
Motion detection
Fall detection algorithm
Background monitoring
```

The web frontend displays status and backend-confirmed events.

---

# 30. FALL EVENT FLOW

Preferred:

```text
Mobile sensors
      ↓
Fall detection logic
      ↓
Potential fall
      ↓
Mobile confirmation flow if specified
      ↓
Backend safety event
      ↓
Emergency notification
      ↓
Web Safety Dashboard
```

Use the actual project design.

---

# 31. FALL FALSE-POSITIVE FLOW

If the mobile app supports confirmation:

```text
Possible fall detected.

Are you okay?

[ I'm OK ]
[ Send SOS ]
```

Implement only if the mobile/backend specification supports it.

Do not invent emergency logic independently in the web frontend.

---

# 32. FALL EVENT STATE

If backend exposes:

```text
Detected
Awaiting confirmation
Confirmed
Dismissed
Resolved
```

display the actual state.

---

# 33. FALL ALERT UI

If a backend-confirmed fall alert exists:

```text
⚠️ Fall Alert

A fall event was detected.

Status: Awaiting response
```

Do not minimize or hide an active safety event.

---

# 34. SAFETY NOTIFICATIONS

Use B9 for:

```text
SOS updates
Fall alerts
Location/device problems
Safety app disconnection
Emergency contact updates
```

Do not create a second notification system.

---

# 35. DEVICE CONNECTION

Display the mobile safety app/device status.

Example:

```text
📱 Safety App

✓ Connected
Last active: 2 minutes ago
```

Only use actual backend heartbeat/status data.

---

# 36. DEVICE OFFLINE

Example:

```text
📱 Safety App

⚠️ Not connected

Open the Safety App to reconnect.
```

Do not claim that fall detection/location monitoring is active when the device is disconnected.

---

# 37. DEVICE HEARTBEAT

If backend provides heartbeat information:

```text
Use backend heartbeat state.
```

Do not implement a fake frontend timer.

---

# 38. DEVICE PAIRING

If supported:

```text
Pair Safety App
```

Use the existing device registration/pairing flow.

Do not invent QR codes, pairing codes, or tokens unless the backend specifies them.

---

# 39. MOBILE APP REGISTRATION

If required:

```text
Mobile App
 ↓
Authentication
 ↓
Device registration
 ↓
Backend
 ↓
Safety Dashboard
```

Follow the existing mobile API contract.

---

# 40. MOBILE AUTHENTICATION

The mobile app must use the project's approved authentication architecture.

Do not store sensitive authentication tokens insecurely.

Inspect existing auth implementation before modifying it.

---

# 41. MOBILE TOKEN STORAGE

Use secure platform storage where supported.

Do not store long-lived sensitive tokens in plain text files.

---

# 42. MOBILE APP SCOPE

If the mobile app does not yet exist, F9 should establish only the safety foundation required for:

```text
Authentication
Device registration
Location permission
Location reporting
Sensor permission
Fall detection status
SOS trigger
Background monitoring architecture
Safety event synchronization
```

Do not build unrelated mobile features.

---

# 43. BACKGROUND LOCATION

Background location is platform-specific.

Implement using the appropriate mobile architecture already selected by the project.

Do not attempt to reproduce this using:

```text
Browser tabs
Web pages
setInterval
```

---

# 44. BACKGROUND FALL DETECTION

Do not depend on the Memora website being open.

The mobile app must provide the background safety capability where the platform permits it.

---

# 45. MOBILE PERMISSIONS

Handle permissions clearly:

```text
Location
Motion/Sensors
Notifications
Background activity
```

Only request permissions when needed.

---

# 46. PERMISSION DENIED

If permission is denied:

```text
Explain which safety feature is affected.
```

Do not falsely report the feature as active.

---

# 47. PERMISSION SETTINGS

Where platform supports it:

```text
Open Settings
```

may be offered.

Do not create a fake settings link.

---

# 48. MOBILE OFFLINE

The mobile safety app must handle temporary network loss according to the existing safety architecture.

Potential:

```text
Offline
 ↓
Local safety state
 ↓
Reconnect
 ↓
Synchronize
```

Do not invent offline safety guarantees.

---

# 49. SAFETY EVENT QUEUING

Only implement local event queueing if explicitly supported.

If implemented:

```text
Persist safely
 ↓
Retry
 ↓
Server confirmation
 ↓
Deduplicate
```

---

# 50. SOS OFFLINE

Do not claim offline SOS works unless the mobile architecture explicitly supports an emergency fallback.

If cellular/SMS/phone-call fallback is part of the project specification, follow that architecture.

---

# 51. LOCATION SYNC

If mobile reports location:

```text
Mobile
 ↓
Secure API
 ↓
Backend
 ↓
Authorized consumers
```

Do not send location directly from mobile to arbitrary web clients.

---

# 52. SENSOR DATA

Do not upload raw accelerometer streams unnecessarily.

Prefer the existing backend safety architecture.

If the system only requires fall events/status:

```text
Sensor data
 ↓
On-device processing
 ↓
Safety event
```

where supported.

---

# 53. SENSOR PRIVACY

Do not store raw sensor data unless the project specification explicitly requires it.

---

# 54. SAFETY DATA RETENTION

Follow backend retention rules.

Do not create permanent browser/localStorage copies of safety events.

---

# 55. SAFETY EVENT HISTORY

If supported:

```text
Safety Events

15 Sep
Fall detection event
Resolved

10 Sep
SOS
Resolved
```

Only display authorized events.

---

# 56. SAFETY EVENT DETAILS

If supported, show:

```text
Event type
Time
Status
Relevant safe details
```

Do not expose internal sensor data.

---

# 57. ADMIN/CAREGIVER SAFETY DATA

Do not build caregiver/admin dashboards in F9 unless specifically included in the existing frontend phase plan.

F9 patient UI should focus on the patient.

---

# 58. CAREGIVER CONTACTS

Emergency contacts are different from a full caregiver dashboard.

Only implement contact functionality supported by the backend.

---

# 59. SAFETY DASHBOARD STATES

The dashboard should clearly communicate:

```text
Safe / Connected
Needs attention
Emergency active
Device disconnected
Permission required
```

Use actual backend/device states.

---

# 60. NO FALSE REASSURANCE

Do not display:

```text
You are safe.
Everything is okay.
Fall detection is guaranteed.
Emergency services have been contacted.
```

unless the backend explicitly confirms the corresponding state.

Prefer:

```text
Safety App Connected
SOS Active
Alert Sent
Location Last Updated 10:42 AM
```

---

# 61. ACCESSIBILITY

Safety controls must support:

```text
Keyboard access
Screen readers
Visible focus
Large controls
Clear labels
High contrast
Status announcements
```

---

# 62. SOS ACCESSIBILITY

The SOS button must have an unambiguous accessible label:

```text
Send emergency alert
```

Do not use only:

```text
🚨
```

as the accessible name.

---

# 63. SAFETY STATUS ANNOUNCEMENTS

Important changes should be announced:

```text
Emergency alert sent
Fall alert detected
Safety app disconnected
Location unavailable
```

Use accessible live regions carefully.

---

# 64. COLOR

Do not rely only on color for:

```text
Emergency
Connected
Disconnected
Warning
```

Use:

```text
Icon
Text
State
```

---

# 65. ELDER-FRIENDLY DESIGN

Safety UI should prioritize:

```text
Large SOS button
Few choices
Clear language
Large status cards
Minimal scrolling
Obvious actions
```

Do not bury SOS under menus.

---

# 66. LOCALIZATION

Use the established localization system.

Prepare for:

```text
English
Hindi
Other configured regional languages
```

Safety messages must be translated clearly.

---

# 67. TRANSLATION SAFETY

Long translated safety messages must not break:

```text
SOS button
Dialogs
Status cards
Alerts
```

---

# 68. RESPONSIVE DESIGN

Test:

```text
Desktop
Tablet
Mobile browser
```

The SOS action must remain immediately accessible.

---

# 69. OFFLINE WEB STATE

If the web dashboard is offline:

```text
Safety data may be unavailable.
```

Do not imply the website itself is monitoring the patient.

---

# 70. SECURITY

Safety data requires strong protection.

Inspect for:

```text
Unauthorized SOS access
Unauthorized location access
Protected safety events
Device registration abuse
Token leakage
Unsafe deep links
```

---

# 71. AUTHORIZATION

Backend must enforce:

```text
Patient identity
Device ownership
Safety-event ownership
Location access
Emergency-contact access
```

The frontend must not enforce these as the only protection.

---

# 72. DEVICE OWNERSHIP

Do not allow a patient to submit arbitrary:

```text
deviceId
patientId
userId
```

to claim another device.

Use authenticated backend registration.

---

# 73. LOCATION AUTHORIZATION

Never trust a frontend-controlled user identifier to determine whose location is being displayed.

---

# 74. SOS AUTHORIZATION

SOS requests must use authenticated identity and backend authorization.

---

# 75. REPLAY PROTECTION

Where the backend supports event IDs/idempotency:

```text
Use them.
```

Avoid duplicate SOS/fall events.

---

# 76. API LAYER

Use a centralized safety API module.

Conceptual methods:

```text
safetyApi.getStatus()
safetyApi.sendSOS()
safetyApi.getSOSStatus()
safetyApi.resolveSOS()
safetyApi.getContacts()
safetyApi.createContact()
safetyApi.updateContact()
safetyApi.deleteContact()
safetyApi.getLocationStatus()
safetyApi.getFallDetectionStatus()
safetyApi.getDeviceStatus()
safetyApi.getSafetyEvents()
```

These are conceptual only.

Implement only actual backend endpoints.

---

# 77. MOBILE API LAYER

If the mobile app communicates with backend:

```text
mobileSafetyApi
```

must follow the actual backend contract.

Do not create a separate backend.

---

# 78. COMPONENT ARCHITECTURE

Potential web components:

```text
SafetyDashboard
SOSButton
SOSConfirmation
SOSStatus
EmergencyContactList
EmergencyContactCard
LocationStatus
FallDetectionStatus
DeviceStatus
SafetyEventList
SafetyEventCard
SafetyAlert
```

Potential mobile components/modules:

```text
SafetyStatus
PermissionManager
LocationService
MotionService
FallDetectionService
SOSService
DeviceRegistration
SafetySync
```

Adapt to the actual mobile architecture.

---

# 79. STATE MANAGEMENT

Use existing F0 architecture on web.

For mobile, use the architecture selected by the project.

Do not introduce unnecessary state libraries.

---

# 80. REALTIME SAFETY UPDATES

If backend already supports realtime:

```text
SOS changes
Fall events
Device status
```

reuse the existing mechanism.

Do not create a second realtime infrastructure.

---

# 81. REALTIME SAFETY EVENT DEDUPLICATION

Use backend event identifiers.

Do not display the same emergency event multiple times.

---

# 82. CONNECTION LOSS

If realtime disconnects:

```text
Show appropriate stale/unavailable state.
```

Do not falsely claim live monitoring.

---

# 83. CACHE

Safety information should not be treated as permanently fresh.

Use appropriate server-state behavior.

Do not cache precise location indefinitely in the browser.

---

# 84. NO LOCATION IN LOCAL STORAGE

Do not store precise current coordinates in localStorage unless explicitly required and securely designed.

---

# 85. NO SAFETY SECRETS

Never commit:

```text
API keys
Map keys
Push credentials
Mobile secrets
Backend secrets
```

---

# 86. TESTING

Add tests for:

```text
Safety dashboard
SOS
SOS confirmation
SOS success/failure
Emergency contacts
Location status
Fall status
Device status
Safety events
```

where supported.

---

# 87. SOS TESTING

Test:

```text
Open SOS
Cancel
Confirm
Success
Failure
Duplicate tap
Existing active SOS
```

---

# 88. LOCATION TESTING

Test:

```text
Connected
Disconnected
Permission unavailable
Stale location
No location
```

according to backend behavior.

Do not use fake "live" state in production.

---

# 89. FALL DETECTION TESTING

Test:

```text
Active
Inactive
Disconnected
Permission required
Alert event
```

only for states supported by the backend/mobile implementation.

---

# 90. MOBILE PERMISSION TESTING

Test:

```text
Location granted
Location denied
Sensor access granted
Sensor access denied
Notification permission states
Background permission states
```

on supported platforms.

---

# 91. DEVICE TESTING

Test:

```text
Registered
Connected
Disconnected
Reconnected
Unknown device
Unauthorized device
```

according to backend behavior.

---

# 92. SAFETY EVENT TESTING

Test:

```text
SOS event
Fall event
Resolution
Duplicate event
Authorization
```

---

# 93. SECURITY TESTING

Verify:

```text
Patient cannot access another patient's location
Patient cannot access another patient's safety events
Patient cannot control another patient's device
Patient cannot trigger SOS for another patient
```

---

# 94. ACCESSIBILITY TESTING

Test:

```text
Keyboard
Screen reader
Focus
SOS control
Dialogs
Status announcements
```

---

# 95. RESPONSIVE TESTING

Test:

```text
Desktop
Tablet
Mobile browser
```

---

# 96. LOCALIZATION TESTING

Test:

```text
English
Hindi
Configured regional languages
Long safety labels
Emergency messages
```

---

# 97. BROWSER CONSOLE

Check for:

```text
Unhandled errors
React warnings
Failed API requests
Unsafe logs
Accessibility warnings
```

---

# 98. MOBILE LOGGING

Do not log:

```text
Precise coordinates
Authentication tokens
Private contact details
Raw sensor streams
Emergency payloads
```

in production.

---

# 99. PRIVACY REVIEW

Confirm:

```text
Location minimized
Sensor data minimized
Emergency contacts protected
Safety events protected
Meeting/community data isolated
```

---

# 100. PERFORMANCE

Avoid:

```text
High-frequency location requests
Unnecessary polling
Large sensor uploads
Continuous web geolocation
Repeated SOS requests
```

---

# 101. BATTERY

The mobile safety app must avoid unnecessary battery drain.

Use:

```text
Platform-appropriate background APIs
Reasonable location intervals
On-device processing where appropriate
```

Do not implement aggressive continuous polling.

---

# 102. MOBILE NETWORK USAGE

Minimize unnecessary:

```text
Location uploads
Sensor uploads
Heartbeat frequency
```

Follow the backend/mobile architecture.

---

# 103. SENSOR PROCESSING

If fall detection is implemented on-device:

```text
Sensor
 ↓
Fall detection algorithm
 ↓
Potential event
 ↓
Confirmation/verification
 ↓
Backend
```

Keep raw sensor data local unless backend explicitly requires otherwise.

---

# 104. FALSE POSITIVE HANDLING

Do not automatically trigger repeated SOS alerts from uncertain sensor events unless the safety specification explicitly requires it.

Follow the existing fall-detection workflow.

---

# 105. EMERGENCY CONTACT NOTIFICATION

The mobile/web frontend must not directly notify every contact.

Use:

```text
Safety backend
 ↓
B9 / notification system
```

or the actual emergency communication architecture.

---

# 106. EMERGENCY SERVICES

Do not claim the system contacts:

```text
Police
Ambulance
Emergency services
```

unless the backend/product explicitly implements and confirms that capability.

---

# 107. SOS RESOLUTION

If the backend supports resolving an SOS:

```text
Backend confirmation
 ↓
Update UI
 ↓
Notification/state refresh
```

Do not resolve locally without confirmation.

---

# 108. MOBILE APP CRASH / DISCONNECT

The web dashboard should reflect backend/device status if available.

It must not claim that the mobile safety service is running merely because the patient has installed the app.

---

# 109. DEVICE LAST-SEEN

If backend provides:

```text
Last seen
Last heartbeat
Last location update
```

display the actual timestamp using centralized date/time utilities.

---

# 110. STALE STATUS

If a device has not reported within the backend-defined threshold:

```text
Use backend status.
```

Do not invent a frontend threshold.

---

# 111. DOCUMENTATION

Create:

```text
docs/F9_SAFETY_MOBILE_INTEGRATION.md
```

Document:

```text
Safety architecture
SOS flow
Emergency contacts
Location architecture
Fall detection architecture
Mobile app architecture
Device registration
Permissions
Background monitoring
Safety events
Notification integration
Privacy
Security
Accessibility
Localization
Testing
```

If mobile code is created, document its architecture separately where appropriate.

---

# 112. MULTI-DEVELOPER RULE

Recommended separation:

```text
Developer A → Safety Dashboard
Developer B → SOS UI/API integration
Developer C → Mobile location
Developer D → Mobile fall detection
Developer E → Device registration
```

All developers must follow the same:

```text
Backend contracts
Authentication
Safety event model
API layer
Error handling
Security rules
```

Do not create competing safety implementations.

---

# 113. GIT SAFETY

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

Use separate branches where appropriate:

```text
feature/f9-safety-dashboard
feature/f9-sos
feature/f9-mobile-location
feature/f9-mobile-fall-detection
feature/f9-device-integration
```

---

# 114. DEFINITION OF DONE

F9 is complete only when:

[ ] F0 inspected  
[ ] F1 inspected  
[ ] F2 inspected  
[ ] F3 inspected  
[ ] F4 inspected  
[ ] F5 inspected  
[ ] F6 inspected  
[ ] F7 inspected  
[ ] F8 inspected  
[ ] Safety backend inspected  
[ ] SOS backend inspected  
[ ] Location backend inspected  
[ ] Fall detection backend inspected  
[ ] Device backend inspected  
[ ] B9 notification system inspected  
[ ] Actual safety APIs verified  
[ ] Safety dashboard implemented  
[ ] SOS button implemented  
[ ] SOS confirmation implemented where required  
[ ] SOS success state implemented  
[ ] SOS failure state implemented  
[ ] Duplicate SOS protection implemented  
[ ] SOS status implemented where supported  
[ ] SOS resolution implemented where supported  
[ ] Emergency contacts implemented where supported  
[ ] Location status implemented  
[ ] Fall detection status implemented  
[ ] Device status implemented  
[ ] Safety event history implemented where supported  
[ ] Mobile app authentication implemented where required  
[ ] Device registration implemented where required  
[ ] Location permission flow implemented  
[ ] Sensor permission flow implemented  
[ ] Mobile location integration implemented where required  
[ ] Mobile fall detection integration implemented where required  
[ ] Background monitoring architecture implemented where required  
[ ] Safety synchronization implemented where required  
[ ] Notification integration verified  
[ ] Realtime integration reused where supported  
[ ] Event deduplication implemented  
[ ] Loading states implemented  
[ ] Empty states implemented  
[ ] Error states implemented  
[ ] Offline states implemented  
[ ] Authorization verified  
[ ] Device ownership verified  
[ ] Location privacy verified  
[ ] Safety-event privacy verified  
[ ] No precise location logging  
[ ] No raw sensor logging  
[ ] No secrets committed  
[ ] No direct database access  
[ ] No direct notification-provider access  
[ ] No unsupported emergency-service claims  
[ ] Accessibility verified  
[ ] Localization verified  
[ ] Responsive design verified  
[ ] Mobile permission testing performed  
[ ] SOS testing performed  
[ ] Location testing performed  
[ ] Fall detection testing performed  
[ ] Device testing performed  
[ ] Security testing performed  
[ ] Privacy testing performed  
[ ] Accessibility testing performed  
[ ] Browser console checked  
[ ] Mobile logs checked  
[ ] Lint passes  
[ ] Tests pass  
[ ] Web build passes  
[ ] Mobile build passes where applicable  
[ ] Documentation updated  
[ ] No unrelated feature creep  

---

# 115. FINAL REPORT

Create:

```text
docs/F9_SAFETY_MOBILE_INTEGRATION_REPORT.md
```

Use:

```text
# Memora F9 Safety + Mobile Integration Report

## Objective

## Safety Architecture

## Safety Backend APIs Used

## Safety Dashboard

## SOS Flow

## SOS States

## Emergency Contacts

## Location Integration

## Location Permissions

## Location Privacy

## Fall Detection

## Fall Event Flow

## Mobile App Architecture

## Device Registration

## Device Status

## Background Monitoring

## Safety Synchronization

## Notification Integration

## Realtime Integration

## Offline Behavior

## Privacy

## Security

## Battery Considerations

## Network Considerations

## Accessibility

## Localization

## Responsive Design

## Web Components Created

## Mobile Components/Services Created

## Files Created

## Files Modified

## Tests Executed

## SOS Tests

## Location Tests

## Fall Detection Tests

## Device Tests

## Authorization Tests

## Security Tests

## Privacy Tests

## Accessibility Tests

## Lint Result

## Web Build Result

## Mobile Build Result

## Browser Testing

## Mobile Testing

## Known Issues

## Backend Changes

## Recommendations for F10
```

---

# 116. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
Safety dashboard result
SOS result
SOS confirmation result
SOS duplicate-protection result
Emergency contact result
Location status result
Fall detection result
Device connection result
Mobile authentication result
Device registration result
Mobile location result
Mobile fall detection result
Background monitoring result
Notification result
Realtime result
Offline result
Privacy result
Security result
Accessibility result
Localization result
Responsive result
Web test result
Mobile test result
Web lint result
Web build result
Mobile build result
Development server result
```

Do not claim success unless verified.

---

# 117. STOP CONDITION

After F9 is complete:

**STOP.**

Do not automatically implement F10.

The next phase should be:

```text
F10
AI Features + Personalized Recommendations + Voice Interaction UI
```

F10 will connect the frontend experience to the existing AI capabilities from B0-B14.

It should integrate:

```text
🤖 AI Assistant
🧠 Personalized Game Recommendations
💭 Memory Assistance
⏰ Intelligent Reminder Suggestions
🎤 Voice Interaction
🌐 Regional Language AI
```

Only implement the AI capabilities actually present in the backend.

---

# FINAL PRINCIPLE

F9 is a safety-critical integration phase.

The architecture should remain:

```text
              PATIENT
                 │
        ┌────────┴────────┐
        ↓                 ↓
    WEB APP            MOBILE APP
        │                 │
 Safety UI          GPS / Sensors
        │                 │
        └────────┬────────┘
                 ↓
          SAFETY BACKEND
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
      SOS     Location   Fall Event
       │         │         │
       └─────────┼─────────┘
                 ↓
          Notification Layer
                 ↓
          Emergency Contacts
```

The website is **not** the safety sensor.

The mobile app is responsible for device-level capabilities.

The backend is responsible for authorization, persistence, event processing, safety state, and notification orchestration.

Never claim that an emergency alert, location update, fall detection event, or notification succeeded until the relevant system confirms it.
