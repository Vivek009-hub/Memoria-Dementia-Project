# MEMORA - Prompt 3
## Geofencing + SOS + Caregiver Safety System

> **Purpose:** Add the mobile safety layer to the existing Memora application after Prompt 1 and Prompt 2 have been successfully implemented and tested.
>
> This prompt focuses ONLY on:
> - Patient location
> - Geofencing / safe zones
> - Wandering/out-of-zone detection
> - SOS
> - Caregiver alerts
> - Safety event history
> - Mobile background location where supported
>
> Do NOT redesign the AI companion, rebuild Gemini, add games, or implement unrelated Memora functionality.

---

# 1. ROLE

Act as a senior mobile engineer, backend engineer, and safety-focused system architect.

You are working inside the **existing completed Memora project**.

Prompt 1 established the AI Agent foundation.

Prompt 2 established the voice companion and intelligent reminder system.

Now extend the existing system with a **reliable mobile safety layer**.

The goal is:

> Help caregivers know when a patient leaves a configured safe area and provide a simple emergency SOS mechanism.

This is an assistive safety system.

It is NOT a guarantee that a patient cannot get lost.

---

# 2. FIRST: INSPECT THE EXISTING CODEBASE

Before changing anything:

1. Inspect the complete project.
2. Verify Prompt 1 and Prompt 2 implementations.
3. Identify:
   - Mobile application architecture
   - Backend architecture
   - Authentication
   - Patient model
   - Caregiver model/relationship
   - Notification system
   - Existing user roles
   - Existing location-related code
   - Existing reminder/event architecture
   - Existing API conventions
   - Existing WebSocket/realtime infrastructure
   - Existing environment variables
4. Reuse existing services.
5. Do not create duplicate authentication, patient, caregiver, notification, or event systems.

Do not start by rewriting existing files.

---

# 3. CORE SAFETY EXPERIENCE

The patient uses the Memora mobile application.

The caregiver configures a safe area around an important location, such as the patient's home.

Example:

```text
Patient Home
      ↓
Safe Zone
      ↓
Radius: 200 meters
```

The mobile app monitors location according to the permissions and capabilities of the device.

If the patient leaves the safe zone:

```text
Patient
   ↓
Mobile location
   ↓
Geofence
   ↓
Outside safe zone
   ↓
Memora backend
   ↓
Caregiver alert
```

The caregiver should be able to see:

- Which patient triggered the event
- Time
- Safe zone
- Event type
- Most recent available location
- Event status

---

# 4. IMPORTANT SAFETY PRINCIPLE

Do NOT rely on Gemini to determine whether a patient has left a safe zone.

Geofence calculations must be deterministic.

Use:

```text
GPS coordinates
+
Configured latitude/longitude
+
Configured radius
=
Inside / Outside
```

Gemini must not be responsible for calculating safety status.

---

# 5. MOBILE LOCATION

Use the appropriate native/mobile location APIs for the actual mobile framework already present in the project.

If the project uses React Native:

- Use a suitable maintained React Native location solution.
- Follow platform-specific permission requirements.

If another mobile framework exists:

- Follow that framework's recommended location APIs.

Do not introduce a second mobile framework.

---

# 6. LOCATION PERMISSIONS

Handle permissions explicitly.

Possible states:

```text
UNKNOWN
REQUESTED
GRANTED
DENIED
RESTRICTED
LIMITED
```

The app should clearly explain why location permission is needed.

Example:

> "Memora uses your location to help your caregiver know when you move outside your safe area."

Do not request location permission without explanation.

---

# 7. BACKGROUND LOCATION

Implement background location where the target mobile platform supports it and where the required permissions are granted.

Do not assume background location works identically on Android and iOS.

Inspect the existing mobile target platforms.

Implement the minimum reliable solution supported by the chosen framework.

If the OS restricts background location:

- Detect the limitation.
- Explain it clearly.
- Do not falsely claim continuous tracking.

---

# 8. BATTERY CONSIDERATIONS

Do NOT request extremely high-frequency GPS updates unnecessarily.

Use a sensible balance between:

- Accuracy
- Battery consumption
- Detection latency
- Network usage

Avoid:

```text
GPS request every second forever
```

unless technically required and justified.

Prefer:

- Native geofencing where appropriate
- Reasonable location intervals
- Distance filters
- Background-friendly strategies

The goal is to make the app practical on a patient's phone.

---

# 9. SAFE ZONE MODEL

Use the existing database architecture.

If no safe-zone model exists, create one.

Conceptually:

```text
SafeZone
├── patientId
├── name
├── latitude
├── longitude
├── radiusMeters
├── enabled
├── createdBy
├── createdAt
└── updatedAt
```

Adapt naming/types to existing project conventions.

The safe zone belongs to a specific patient.

---

# 10. SAFE ZONE CONFIGURATION

The caregiver should be able to configure:

- Safe zone name
- Location
- Radius
- Enabled/disabled status

Example:

```text
Safe Zone

Name:
Home

Radius:
200 meters

Status:
Enabled
```

Do not allow the patient to arbitrarily modify their own safety zone unless the existing product explicitly requires it.

Caregiver/admin authorization must be enforced server-side.

---

# 11. SAFE ZONE CREATION

Prefer selecting the location using:

- Current caregiver location, where appropriate
- Map selection
- Existing saved patient location

Do not hard-code coordinates.

Do not invent locations.

If map functionality is already available, reuse it.

---

# 12. RADIUS VALIDATION

The backend must validate the radius.

Do not accept:

```text
-50 meters
0 meters
999999999 meters
```

Use sensible configurable limits.

The exact maximum/minimum should be appropriate to the application and deployment.

Do not rely on frontend validation alone.

---

# 13. GEOFENCE LOGIC

The system should determine:

```text
insideSafeZone
outsideSafeZone
```

based on actual coordinates.

Use an appropriate geographic distance calculation such as the Haversine formula or platform-native geofencing APIs.

Conceptually:

```text
distance(patientLocation, safeZoneCenter)
                    ↓
        distance <= radius
                    ↓
                  INSIDE
```

Otherwise:

```text
distance > radius
       ↓
OUTSIDE
```

Do not use a simplistic latitude/longitude comparison.

---

# 14. EXIT EVENT

When the patient transitions from:

```text
INSIDE
   ↓
OUTSIDE
```

create a geofence exit event.

Do NOT create a new event every time a location update is received while the patient remains outside.

The system should detect the **state transition**.

---

# 15. RE-ENTRY EVENT

When the patient transitions:

```text
OUTSIDE
   ↓
INSIDE
```

create a re-entry event.

Example:

> "Patient has returned to the safe zone."

This allows the caregiver to understand whether the patient returned.

---

# 16. GPS ACCURACY / FALSE POSITIVES

GPS can fluctuate.

Do not trigger an immediate emergency solely because one noisy location reading is slightly outside the boundary.

Implement a sensible stability strategy.

For example:

```text
Potential exit detected
        ↓
Validate subsequent location
        ↓
Confirm transition
        ↓
Create exit event
```

The exact strategy should account for:

- GPS accuracy
- Location age
- Distance from boundary
- Platform limitations

Document the strategy.

---

# 17. LOCATION EVENT MODEL

If there is no existing event model, create one.

Conceptually:

```text
SafetyEvent
├── patientId
├── type
│   ├── GEOFENCE_EXIT
│   ├── GEOFENCE_REENTRY
│   └── SOS
├── latitude
├── longitude
├── accuracy
├── safeZoneId
├── timestamp
├── status
├── acknowledgedBy
└── acknowledgedAt
```

Adapt this to the existing schema conventions.

---

# 18. LOCATION PRIVACY

Do not store unnecessarily detailed location history forever.

The safety system should store enough information to support:

- Current/recent safety event
- Caregiver alert
- Event investigation

Avoid creating an unrestricted historical movement tracker unless explicitly required.

If detailed history is implemented, apply:

- Retention policy
- Access control
- Clear purpose
- Secure storage

---

# 19. CAREGIVER ALERT

When a confirmed geofence exit occurs:

```text
Patient leaves safe zone
        ↓
Backend confirms event
        ↓
Caregiver notification
```

Example:

> ⚠️ **Memora Safety Alert**
>
> Rajesh has left the Home safe zone.
>
> Time: 10:42 AM
>
> Most recent location available.

Do not claim the patient's location is exact if GPS accuracy is poor.

---

# 20. NOTIFICATION CHANNEL

Inspect the existing notification infrastructure.

Reuse it if possible.

Depending on the existing mobile architecture, use appropriate:

- Push notifications
- In-app notifications
- Backend events
- Realtime updates

Do not create a completely separate notification framework if Memora already has one.

---

# 21. REALTIME UPDATES

If the existing project uses WebSockets/Socket.io, consider using them for caregiver dashboard updates.

Conceptually:

```text
Mobile
 ↓
Backend
 ↓
Safety event
 ↓
Socket event
 ↓
Caregiver dashboard
```

Use the existing realtime infrastructure if available.

Do not add WebSockets simply for the sake of it.

---

# 22. SOS FEATURE

Implement a very simple patient-facing SOS control.

The patient should not have to navigate multiple screens.

Example:

```text
┌─────────────────────────┐
│                         │
│       MEMORA            │
│                         │
│                         │
│    🚨 NEED HELP         │
│                         │
│      Press SOS          │
│                         │
└─────────────────────────┘
```

Make the button large and obvious.

---

# 23. SOS CONFIRMATION

Because accidental taps are possible, use a simple confirmation mechanism.

Possible flow:

```text
Patient taps SOS
       ↓
Short confirmation
       ↓
"Do you need help?"
       ↓
Confirm
       ↓
SOS sent
```

Do not make the confirmation complicated.

If the product requirements explicitly demand one-tap SOS later, the architecture should allow it.

---

# 24. SOS BACKEND FLOW

When confirmed:

```text
Patient
   ↓
SOS
   ↓
Authenticated mobile request
   ↓
Backend authorization
   ↓
Create SOS event
   ↓
Attach latest available location
   ↓
Notify caregiver
```

The backend must determine the patient from the authenticated session/token.

Do not trust a patient ID supplied by the client.

---

# 25. SOS LOCATION

If location permission is available:

Attach:

- Latitude
- Longitude
- Accuracy
- Timestamp

If location is unavailable:

Do not block the SOS.

Send the SOS without location and clearly indicate:

> "Location unavailable."

---

# 26. SOS CAREGIVER ALERT

Example:

> 🚨 **SOS REQUEST**
>
> Rajesh has requested assistance.
>
> Time: 11:18 AM
>
> Location: Available

The caregiver should be able to open the safety event.

---

# 27. SOS STATUS

Track:

```text
TRIGGERED
ACKNOWLEDGED
RESOLVED
```

The caregiver can acknowledge the event.

Do not allow the AI to mark an SOS as resolved automatically.

---

# 28. CAREGIVER SAFETY SCREEN

Add a focused safety section to the existing caregiver interface.

It should show:

### Current status

```text
Patient: Rajesh

🟢 Inside Safe Zone

Home
Radius: 200m
```

or:

```text
🔴 Outside Safe Zone

Exited:
10:42 AM
```

### Recent events

```text
10:42 AM
Geofence Exit

11:18 AM
SOS

11:31 AM
SOS Acknowledged
```

Keep the interface simple.

Do not redesign unrelated caregiver pages.

---

# 29. MAP DISPLAY

If the project already has a map implementation, reuse it.

Otherwise, integrate a suitable map solution consistent with the existing mobile/web stack.

The caregiver should be able to see:

- Safe-zone center
- Safe-zone radius
- Most recent patient location
- Event location

Do not display fake or estimated roads.

If GPS accuracy is poor, communicate uncertainty.

---

# 30. SAFETY STATUS

Create a deterministic safety status.

For example:

```text
SAFE
OUTSIDE_ZONE
SOS_ACTIVE
LOCATION_UNAVAILABLE
```

The AI should not determine this state.

Backend/mobile logic should.

---

# 31. AI INTEGRATION

Prompt 3 is NOT about changing the AI Agent.

However, the existing AI companion may be informed about safety events through controlled application logic.

For example, after a confirmed geofence exit:

> "You appear to be outside your usual safe area. Are you okay?"

This should be an application-controlled safety interaction.

Do not allow Gemini to:

- Decide whether the patient is safe
- Disable geofencing
- Disable SOS
- Change the safe-zone radius
- Resolve safety events
- Modify emergency contacts
- Access unrestricted location history

---

# 32. AI + SAFETY BOUNDARY

Maintain this architecture:

```text
                 Gemini
                   │
          Conversation only
                   │
                   ▼
              AI Agent
                   │
          Limited safe tools


Mobile / Backend Safety Engine
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
    GPS/Geo     SOS Logic   Notifications
       │           │           │
       └───────────┼───────────┘
                   ▼
              Caregiver
```

Safety-critical decisions must remain deterministic.

---

# 33. CAREGIVER PERMISSIONS

Only authorized caregivers/admins should be able to:

- Create safe zones
- Modify safe zones
- Disable safe zones
- View patient safety events
- Acknowledge SOS events
- View location associated with safety events

Use the existing role/permission system.

Do not create a parallel role system.

---

# 34. PATIENT PERMISSIONS

The patient should be able to:

- Use SOS
- View basic safety status if appropriate
- Grant/deny location permissions through the OS
- Interact with the AI companion

Do not allow unauthorized safety configuration.

---

# 35. AUTHORIZATION

Every safety API must enforce:

```text
Authentication
     ↓
Identify user
     ↓
Determine patient/caregiver relationship
     ↓
Authorize action
     ↓
Execute
```

Never trust:

```text
patientId
caregiverId
safeZoneId
```

from an untrusted client or LLM without server-side validation.

---

# 36. API DESIGN

Adapt to existing API conventions.

Conceptually:

```text
GET    /api/safety/status
GET    /api/safety/safe-zones
POST   /api/safety/safe-zones
PATCH  /api/safety/safe-zones/:id
DELETE /api/safety/safe-zones/:id

POST   /api/safety/location
POST   /api/safety/sos

GET    /api/safety/events
PATCH  /api/safety/events/:id/acknowledge
PATCH  /api/safety/events/:id/resolve
```

Do not blindly create these exact routes if the project uses another API structure.

Reuse existing patterns.

---

# 37. LOCATION API SECURITY

Do not accept arbitrary location submissions from unauthorized users.

Validate:

- Latitude range
- Longitude range
- Accuracy
- Timestamp
- Authenticated patient
- Device/session association where appropriate

Reject malformed coordinates.

---

# 38. LOCATION DATA VALIDATION

Valid latitude:

```text
-90 to +90
```

Valid longitude:

```text
-180 to +180
```

Reject:

```text
null
NaN
Infinity
strings pretending to be coordinates
```

Also reject stale location updates where appropriate.

---

# 39. DEVICE TIME VS SERVER TIME

Do not rely entirely on device time for safety events.

Prefer server timestamps for authoritative event records.

Store device timestamp only if useful for diagnostics.

Always handle timezone consistently.

---

# 40. OFFLINE BEHAVIOR

The mobile application may lose connectivity.

Define behavior clearly.

If the patient presses SOS while offline:

- Attempt to send immediately.
- If impossible, queue the event locally where safe and technically appropriate.
- Retry when connectivity returns.
- Clearly indicate that delivery is pending.

Do not falsely tell the patient:

> "Your caregiver has been notified."

unless the backend confirms delivery/receipt according to the notification system.

---

# 41. GEOFENCE OFFLINE BEHAVIOR

If the platform supports native local geofencing:

- Use it where appropriate.

If the app cannot communicate with the backend:

- Record the local event if appropriate.
- Synchronize when connectivity returns.
- Clearly identify delayed events.

Do not claim real-time caregiver alerts while offline.

---

# 42. DUPLICATE EVENT PREVENTION

Prevent repeated SOS submissions caused by:

- Double tap
- Network retry
- App retry
- Duplicate push event

Use:

- Event IDs
- Idempotency keys where appropriate
- Server-side duplicate detection

An SOS should not create five caregiver alerts because the user tapped twice.

---

# 43. GEOFENCE STATE PERSISTENCE

The system must retain enough state to distinguish:

```text
Inside → Outside
```

from:

```text
Outside → Outside
```

Do not create repeated exit events for every location update.

Persist state using the appropriate architecture.

---

# 44. LOCATION ACCURACY DISPLAY

If GPS reports:

```text
accuracy = 150 meters
```

do not display the location as though it were exact to a few meters.

Use a visible uncertainty indicator where appropriate.

Example:

> "Location accuracy: approximately 150 m"

---

# 45. TEST PLAN

Test all of the following.

## Safe zone creation

- Create a safe zone.
- Verify it is associated with the correct patient.
- Verify unauthorized users cannot modify it.

## Inside zone

Simulate a patient location inside the radius.

Expected:

```text
SAFE
```

No exit alert.

## Exit zone

Move outside the configured radius.

Expected:

```text
GEOFENCE_EXIT
```

Caregiver receives one alert.

## Remain outside

Continue sending locations outside.

Expected:

No duplicate exit events.

## Re-enter

Return inside.

Expected:

```text
GEOFENCE_REENTRY
```

## GPS noise

Send slightly fluctuating positions around the boundary.

Expected:

System does not generate excessive false alerts.

## SOS

Patient presses SOS.

Expected:

- Confirmation
- SOS event
- Location attached if available
- Caregiver notified

## Double SOS

Press repeatedly.

Expected:

Duplicate protection.

## Location unavailable

Trigger SOS without location permission/network.

Expected:

SOS is still attempted.

Location is marked unavailable.

## Unauthorized access

Try to access another patient's safety data.

Expected:

Rejected.

## Offline

Disable network.

Expected:

Graceful behavior and retry/sync where implemented.

---

# 46. PLATFORM TESTING

If supporting Android and iOS:

Test separately.

Verify:

- Foreground location
- Background location
- Permission flows
- Notification behavior
- Battery behavior
- App restart behavior
- Device reboot behavior if relevant

Do not claim a feature works on a platform until it has been tested on that platform.

---

# 47. SECURITY CHECKLIST

Verify:

- [ ] Authentication required.
- [ ] Caregiver authorization enforced.
- [ ] Patient isolation enforced.
- [ ] Safe-zone ownership validated.
- [ ] Location coordinates validated.
- [ ] SOS requests authenticated.
- [ ] No unrestricted location history access.
- [ ] AI cannot modify safety configuration.
- [ ] AI cannot resolve SOS events.
- [ ] Duplicate events are prevented.
- [ ] Secrets remain server-side.
- [ ] Notifications do not expose unnecessary sensitive information.
- [ ] Location data is protected.
- [ ] Logs do not unnecessarily contain precise location data.

---

# 48. PRIVACY REQUIREMENTS

Location is sensitive data.

Implement data minimization.

Only collect location information needed for:

- Geofence functionality
- Current/recent safety event
- SOS

Do not collect detailed location history merely because it is technically possible.

Document:

- Why location is collected
- When it is collected
- Who can access it
- How long safety events are retained

Follow applicable privacy requirements for the deployment environment.

---

# 49. UI PRINCIPLES

Patient interface:

- Large controls
- Very simple wording
- Minimal screens
- Clear safety status
- Large SOS control
- Clear location permission explanation

Caregiver interface:

- Clear current status
- Clear alerts
- Simple map
- Recent safety events
- Acknowledge/resolve controls

Avoid adding complex analytics.

---

# 50. DO NOT CHANGE UNRELATED FEATURES

Do not modify:

- Games
- Existing memory functionality
- Existing AI foundation
- Existing authentication unless required for integration
- Existing dashboards unrelated to safety
- Existing styling system unnecessarily
- Existing APIs unnecessarily

Reuse the existing architecture.

---

# 51. IMPLEMENTATION ORDER

Implement in this order:

### Step 1
Inspect existing mobile/backend architecture.

### Step 2
Implement safe-zone data model.

### Step 3
Implement caregiver safe-zone APIs.

### Step 4
Implement mobile location permissions.

### Step 5
Implement location collection.

### Step 6
Implement geofence state calculation.

### Step 7
Implement exit/re-entry event handling.

### Step 8
Implement caregiver notifications.

### Step 9
Implement caregiver safety status UI.

### Step 10
Implement SOS.

### Step 11
Implement SOS location attachment.

### Step 12
Implement SOS caregiver notification.

### Step 13
Implement offline/retry/idempotency behavior.

### Step 14
Test Android/iOS behavior as applicable.

### Step 15
Perform security/privacy audit.

---

# 52. ACCEPTANCE CRITERIA

Prompt 3 is complete only when:

## Geofencing

- [ ] Caregiver can create a safe zone.
- [ ] Caregiver can modify a safe zone.
- [ ] Caregiver can enable/disable a safe zone.
- [ ] Patient location can be obtained with permission.
- [ ] Safe-zone calculations are deterministic.
- [ ] Exit transitions are detected.
- [ ] Re-entry transitions are detected.
- [ ] Duplicate exit events are prevented.
- [ ] GPS noise is handled reasonably.
- [ ] Battery usage is considered.

## Caregiver

- [ ] Caregiver sees current safety status.
- [ ] Caregiver receives geofence alerts.
- [ ] Caregiver can view relevant event location.
- [ ] Caregiver can acknowledge events.
- [ ] Caregiver cannot access unauthorized patients.

## SOS

- [ ] Patient has an obvious SOS control.
- [ ] Accidental activation is handled.
- [ ] SOS reaches backend.
- [ ] SOS event is persisted.
- [ ] Latest available location is attached when possible.
- [ ] Caregiver receives notification.
- [ ] SOS status can be acknowledged/resolved.
- [ ] Duplicate SOS requests are controlled.

## Reliability

- [ ] Offline behavior is handled.
- [ ] Network retry does not create duplicates.
- [ ] GPS unavailable is handled.
- [ ] Permission denial is handled.
- [ ] App errors do not crash the safety experience.

## Security

- [ ] Authentication enforced.
- [ ] Authorization enforced.
- [ ] Patient data isolation enforced.
- [ ] Location data protected.
- [ ] AI cannot control safety-critical settings.
- [ ] No arbitrary database access exists.

## Existing Memora

- [ ] Prompt 1 AI still works.
- [ ] Prompt 2 voice companion still works.
- [ ] Existing authentication still works.
- [ ] Existing functionality remains intact.
- [ ] No unnecessary duplicate systems were created.

---

# 53. FINAL REPORT REQUIRED

After implementation, provide:

## Files created

List every new file.

## Files modified

List every modified file and why.

## Mobile architecture

Explain:

```text
Mobile
 ↓
Location permissions
 ↓
Location service
 ↓
Geofence engine
 ↓
Backend
```

## Geofence architecture

Explain:

```text
Safe Zone
+
Patient Location
+
Distance Calculation
        ↓
Inside / Outside
        ↓
Safety Event
        ↓
Caregiver Alert
```

## SOS architecture

Explain:

```text
Patient
 ↓
SOS
 ↓
Backend
 ↓
Safety Event
 ↓
Location
 ↓
Caregiver notification
```

## Database changes

List every new/modified model.

## API changes

List every new/modified endpoint.

## Notification changes

Explain how caregiver notifications work.

## Permissions

Explain Android/iOS location and notification permission requirements.

## Security

Explain patient isolation and authorization.

## Testing

List tests performed and results.

## Known limitations

Clearly identify platform limitations, GPS limitations, offline limitations, and anything intentionally deferred.

---

# 54. DO NOT IMPLEMENT PROMPT 4 YET

After completing this prompt, stop.

Do not perform the final full-project redesign or broad optimization.

Prompt 4 will handle:

> **Full Integration + Testing + Security Audit + Performance + UI Polish + SIH Demo Readiness**

The goal of Prompt 3 is to leave Memora with a **working, secure mobile safety subsystem containing geofencing and SOS** that integrates cleanly with the AI companion created in Prompts 1 and 2.

---

# FINAL PRODUCT PRINCIPLE

The Memora safety system should follow:

```text
DETERMINISTIC SAFETY
+
CONTROLLED AI
+
MOBILE LOCATION
+
CAREGIVER OVERSIGHT
```

The AI can communicate with the patient.

The mobile app determines location.

The backend validates safety events.

The caregiver receives alerts.

No single AI response should be trusted as the authority for a safety-critical decision.
