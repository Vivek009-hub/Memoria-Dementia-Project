# Memora - Phase B12 Prompt: Safety & Emergency Backend

**Phase:** B12  
**Name:** Safety, Emergency & Location Backend  
**Prerequisites:** B0-B11 completed  
**Status:** Ready for implementation

---

# Objective

Implement Memora's backend safety and emergency infrastructure.

B12 provides the server-side foundation for:

```text
SOS
Emergency Contacts
Location Events
Geofencing
Fall Detection Events
Safety Alerts
Caregiver Safety Notifications
Emergency Event Lifecycle
```

B12 must integrate with:

```text
B3 Caregivers / Emergency Contacts
B9 Notifications
B10 Analytics
B11 AI only as an optional informational layer
```

The architecture should be:

```text
Mobile Safety App / Authorized Client
              ↓
        Safety API
              ↓
      Safety Event Service
              ↓
       ┌──────┼─────────┐
       ↓      ↓         ↓
      SOS  Location   Fall Event
       │      │         │
       └──────┼─────────┘
              ↓
       Safety Event Engine
              ↓
       ┌──────┼─────────┐
       ↓      ↓         ↓
   Geofence  Rules   Escalation
              ↓
        B9 Notification
              ↓
      Caregiver / Admin
```

B12 is backend infrastructure.

The actual mobile application is **B13**.

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
B0 Backend Foundation
B1 Database Foundation
B2 Authentication
B3 Users / Patients / Caregivers
B4 Cognitive Games
B5 Memory Assistance
B6 Reminders
B7 Community Sessions
B8 Meeting Circle
B9 Notifications
B10 Analytics
B11 AI
```

Inspect existing:

```text
server/src/modules/
server/src/services/
server/src/jobs/
server/src/middleware/
server/src/routes/
server/src/config/
```

Do NOT rebuild previous phases.

---

# 2. B12 SCOPE

Implement:

- Safety event architecture
- SOS event lifecycle
- Emergency contact management integration
- Location event ingestion
- Location privacy controls
- Geofence model
- Geofence rule evaluation
- Geofence breach events
- Fall detection event ingestion
- Fall event lifecycle
- Safety alert generation
- Caregiver safety notifications through B9
- Safety escalation state
- Safety event acknowledgement
- Safety event resolution
- Safety event cancellation where appropriate
- Idempotency
- Rate limiting
- Authentication
- Authorization
- Privacy/security
- Auditability
- Background monitoring jobs where required
- Validation
- Data retention
- Tests
- Security tests
- Concurrency tests

Do NOT implement:

```text
Android app
iOS app
React Native app
Flutter app
GPS hardware
Wearable hardware
Camera-based fall detection
Medical diagnosis
Autonomous emergency dispatch
AI-controlled emergency actions
```

---

# 3. CRITICAL SAFETY PRINCIPLE

B12 is a safety-support system, not a replacement for emergency services or clinical care.

The backend must NOT claim:

```text
"Emergency services have been contacted"
```

unless an actual verified emergency-service integration exists and successfully confirms the action.

Do not fake:

```text
Police dispatch
Ambulance dispatch
Hospital notification
Emergency service confirmation
```

If the system only alerts caregivers:

```text
"Emergency contact notification sent."
```

is appropriate only when the notification system confirms the delivery attempt according to its actual semantics.

---

# 4. SAFETY EVENTS

Use a unified safety event model.

Potential event types:

```text
SOS
FALL_DETECTED
GEOFENCE_BREACH
LOW_BATTERY
DEVICE_OFFLINE
```

Only implement events explicitly required by PROJECT_SPEC.md.

Do not create unnecessary safety event types.

---

# 5. SAFETY EVENT MODEL

Potential fields:

```text
eventId
patientId
type
status
severity
source
location
triggeredAt
acknowledgedAt
resolvedAt
resolvedBy
metadata
createdAt
updatedAt
```

Follow DATABASE.md.

Do not store unnecessary location history inside every event.

---

# 6. SAFETY EVENT STATUS

Use a controlled lifecycle.

Recommended:

```text
TRIGGERED
ACKNOWLEDGED
ESCALATED
RESOLVED
CANCELLED
```

Follow DATABASE.md if it defines different states.

Valid example:

```text
TRIGGERED
    ↓
ACKNOWLEDGED
    ↓
RESOLVED
```

Escalation:

```text
TRIGGERED
    ↓
ESCALATED
    ↓
ACKNOWLEDGED
    ↓
RESOLVED
```

Do not permit arbitrary transitions.

---

# 7. SAFETY SEVERITY

Use controlled values:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Example:

```text
SOS → CRITICAL
Confirmed fall → HIGH
Geofence breach → HIGH
```

These are system classifications, not medical diagnoses.

Follow PROJECT_SPEC.md.

---

# 8. SOURCE

Safety events may originate from:

```text
MOBILE_APP
WEARABLE
DEVICE
SYSTEM
CAREGIVER
ADMIN
```

Only support sources actually needed.

Never allow the client to impersonate:

```text
SYSTEM
ADMIN
CAREGIVER
```

---

# 9. SOS

Implement backend support for an SOS trigger.

Potential endpoint:

```http
POST /api/v1/safety/sos
```

Request may include:

```json
{
  "location": {
    "latitude": 28.6,
    "longitude": 77.2,
    "accuracy": 12
  }
}
```

The backend must derive:

```text
patientId
userId
source
```

from authentication/session context.

Do not trust client-supplied patient ownership.

---

# 10. SOS FLOW

Expected flow:

```text
Patient / authorized mobile app
          ↓
Authenticate
          ↓
Trigger SOS
          ↓
Validate request
          ↓
Create safety event
          ↓
Capture latest location if supplied
          ↓
Determine emergency contacts
          ↓
Create safety notifications
          ↓
B9 Notification Service
          ↓
Caregiver / authorized recipients
          ↓
Event acknowledged
          ↓
Event resolved
```

---

# 11. SOS IDEMPOTENCY

Repeated button presses must not create uncontrolled duplicate emergency events.

Example:

```text
SOS
SOS
SOS
SOS
```

should be handled safely.

Possible behavior:

```text
Existing active SOS
       ↓
Return existing event
```

or use an idempotency key.

Follow PROJECT_SPEC.md.

---

# 12. SOS CANCELLATION

If the specification allows cancellation:

```http
POST /api/v1/safety/events/:eventId/cancel
```

Cancellation must verify:

```text
event ownership
+
event status
+
authorized requester
```

Do not allow arbitrary cancellation of another patient's SOS.

For critical events, cancellation may require stronger confirmation depending on project requirements.

---

# 13. EMERGENCY CONTACTS

Reuse B3 emergency contact functionality.

Do NOT create a second emergency-contact system.

B12 should consume:

```text
B3 EmergencyContact
```

data.

Verify:

```text
Active contact
+
correct patient relationship
+
allowed notification channel
```

before sending safety notifications.

---

# 14. CAREGIVER RELATIONSHIP

Use B3 caregiver relationships.

Do not assume:

```text
user is caregiver
```

because a client says so.

Verify the actual relationship and status.

---

# 15. EMERGENCY CONTACT PRIORITY

If B3 supports contact priority:

```text
Primary
Secondary
Tertiary
```

respect it.

If escalation is implemented:

```text
Primary contact
      ↓
No acknowledgement
      ↓
Secondary contact
```

Only implement escalation behavior if specified.

---

# 16. SAFETY NOTIFICATIONS

B12 must use B9.

Correct:

```text
Safety Event
      ↓
B9 Notification Service
```

Incorrect:

```text
Safety Event
      ↓
Firebase directly
```

Do not create a second notification infrastructure.

---

# 17. SAFETY NOTIFICATION TYPES

Potential:

```text
SOS_ALERT
FALL_ALERT
GEOFENCE_ALERT
SAFETY_EVENT_ACKNOWLEDGED
SAFETY_EVENT_RESOLVED
```

Follow B9 notification conventions.

If these types do not exist, add them to B9's controlled notification type definition.

---

# 18. SAFETY ALERT RECIPIENTS

Determine recipients server-side.

Potential:

```text
Emergency contacts
Authorized caregivers
Admin
```

Do not notify unrelated users.

Do not expose the patient's location to users without permission.

---

# 19. LOCATION DATA

Location is highly sensitive.

Only collect what is required.

Potential fields:

```text
latitude
longitude
accuracy
timestamp
source
```

Do not collect:

```text
continuous location
high-frequency location
background tracking
```

unless explicitly required by the specification.

---

# 20. LOCATION PRECISION

Do not unnecessarily expose exact coordinates.

Internal safety processing may use precise coordinates when required.

User-facing notifications may use:

```text
Approximate location
```

unless exact location is necessary and authorized.

---

# 21. LOCATION EVENT MODEL

If location history is needed:

```text
LocationEvent
├── patientId
├── latitude
├── longitude
├── accuracy
├── timestamp
├── source
└── createdAt
```

Follow DATABASE.md.

Do not store unlimited location history without a retention policy.

---

# 22. LOCATION INGESTION

Potential endpoint:

```http
POST /api/v1/safety/location
```

Validate:

```text
latitude: -90 to 90
longitude: -180 to 180
accuracy >= 0
timestamp valid
```

Reject impossible coordinates.

---

# 23. LOCATION AUTHORIZATION

A user may submit location only for:

```text
themselves
```

unless an explicitly authorized device/caregiver mechanism exists.

Never trust:

```json
{
  "patientId": "someone-else"
}
```

from the client.

---

# 24. LOCATION SPOOFING

The backend cannot perfectly verify GPS authenticity.

Do not claim:

```text
GPS is guaranteed accurate.
```

Store:

```text
accuracy
source
timestamp
```

where available.

Document that client-reported GPS can be inaccurate or spoofed.

---

# 25. LOCATION RATE LIMITING

Protect location ingestion against abuse.

Do not allow:

```text
10,000 location requests/second
```

from one device/account.

Use reasonable rate limits based on actual app requirements.

---

# 26. GEOFENCE MODEL

A geofence represents an allowed/safe geographic area.

Potential fields:

```text
patientId
name
centerLatitude
centerLongitude
radiusMeters
isActive
createdAt
updatedAt
```

Potential future:

```text
polygon
```

Do not implement polygon geofencing unless required.

---

# 27. GEOFENCE CREATION

Potential:

```http
POST /api/v1/safety/geofences
```

Only authorized users should create geofences.

Potential authorization:

```text
Patient
Authorized caregiver
Admin
```

Follow PROJECT_SPEC.md.

---

# 28. GEOFENCE UPDATE

Potential:

```http
PATCH /api/v1/safety/geofences/:geofenceId
```

Verify ownership/authorization.

Do not allow unrelated users to modify another patient's safety boundary.

---

# 29. GEOFENCE DELETE

Potential:

```http
DELETE /api/v1/safety/geofences/:geofenceId
```

Only authorized users.

Do not silently delete safety configuration without authorization.

---

# 30. GEOFENCE VALIDATION

Validate:

```text
latitude
longitude
radius
```

Radius must be:

```text
> 0
```

and limited to a sensible maximum.

Do not accept:

```text
radius = -100
radius = 999999999
```

Choose limits based on PROJECT_SPEC.md and document assumptions.

---

# 31. GEOFENCE EVALUATION

When a new location arrives:

```text
Location
   ↓
Find active geofences
   ↓
Calculate distance
   ↓
Inside / Outside
   ↓
Detect state transition
```

Do NOT create an alert every time a device sends a location outside the boundary.

Only trigger when appropriate.

---

# 32. GEOFENCE STATE

Track:

```text
INSIDE
OUTSIDE
UNKNOWN
```

A breach should generally represent:

```text
INSIDE → OUTSIDE
```

rather than:

```text
OUTSIDE
OUTSIDE
OUTSIDE
```

every time a location update arrives.

---

# 33. GPS ACCURACY

Account for location accuracy.

Example:

```text
Geofence radius = 50m
GPS accuracy = 100m
```

Do not confidently claim a breach without considering uncertainty.

Possible approach:

```text
Accuracy too poor
      ↓
UNKNOWN
```

or a configurable uncertainty buffer.

Follow PROJECT_SPEC.md.

---

# 34. GEOFENCE HYSTERESIS

Prevent GPS jitter from causing:

```text
INSIDE
OUTSIDE
INSIDE
OUTSIDE
```

rapidly.

Use a configurable buffer/debounce strategy.

Example:

```text
Exit threshold
+
Re-entry threshold
```

Do not hardcode unexplained behavior.

---

# 35. GEOFENCE ALERT

When a genuine breach is detected:

```text
Location
   ↓
Geofence engine
   ↓
GEOFENCE_BREACH event
   ↓
B9 safety notification
   ↓
Authorized caregiver
```

Do not directly send push notifications from the geofence service.

---

# 36. FALL DETECTION

B12 receives fall detection events.

The mobile device or future sensor system performs detection.

B12 does NOT implement the actual machine-learning/sensor algorithm.

Potential endpoint:

```http
POST /api/v1/safety/fall-events
```

Request:

```json
{
  "detectedAt": "...",
  "confidence": 0.91,
  "location": {
    "latitude": 28.6,
    "longitude": 77.2,
    "accuracy": 15
  }
}
```

---

# 37. FALL DETECTION TRUST

The backend must treat:

```text
confidence
```

as device-reported information, not medical truth.

Do not say:

```text
"Patient definitely fell."
```

Prefer:

```text
"Fall detection event received."
```

---

# 38. FALL EVENT LIFECYCLE

Potential flow:

```text
Fall detected
      ↓
Event created
      ↓
Optional confirmation window
      ↓
Patient confirms safe
      ↓
Cancel event

OR

No confirmation
      ↓
Escalate
      ↓
Notify caregiver
```

If a confirmation window is specified, implement it as a configurable backend rule.

---

# 39. FALSE POSITIVES

Fall detection may be wrong.

Therefore:

```text
Fall detected
      ↓
Confirmation opportunity
```

can reduce unnecessary alerts.

Do not assume every detection is a real emergency.

---

# 40. FALL CONFIRMATION

Potential:

```http
POST /api/v1/safety/fall-events/:eventId/confirm-safe
```

Verify:

```text
event belongs to user
+
event is active
```

Only allow valid state transitions.

---

# 41. FALL ESCALATION

If confirmation is not received:

```text
Fall event
   ↓
Timeout
   ↓
Escalate
   ↓
Notify authorized caregiver
```

Use existing background job infrastructure.

Do not create an entirely new scheduler.

---

# 42. ESCALATION TIMERS

If PROJECT_SPEC.md does not define the exact timer:

Do NOT silently invent a critical production value.

Instead:

1. Make the timeout configurable.
2. Choose a documented development default.
3. Mark the production value as configurable/pending.

---

# 43. SAFETY ACKNOWLEDGEMENT

Potential:

```http
POST /api/v1/safety/events/:eventId/acknowledge
```

Only authorized caregivers/admins or the patient where appropriate.

Record:

```text
acknowledgedAt
acknowledgedBy
```

---

# 44. SAFETY RESOLUTION

Potential:

```http
POST /api/v1/safety/events/:eventId/resolve
```

Record:

```text
resolvedAt
resolvedBy
resolutionReason
```

Do not permit arbitrary resolution.

---

# 45. SAFETY EVENT HISTORY

Potential:

```http
GET /api/v1/safety/events
GET /api/v1/safety/events/:eventId
```

Patients should see their own events.

Caregivers should only see events for authorized patients.

Admins follow project authorization rules.

---

# 46. SAFETY DASHBOARD DATA

Provide backend data for future clients:

```text
Active SOS
Active fall event
Recent geofence breach
Event status
Triggered time
Acknowledged time
Resolved time
Approximate/current location where authorized
```

Do not build the dashboard UI.

---

# 47. CURRENT LOCATION

Potential:

```http
GET /api/v1/safety/location/current
```

Only return location if:

```text
Requester authorized
+
Location available
+
Privacy policy permits
```

Do not expose continuous tracking by default.

---

# 48. LOCATION SHARING

If caregiver location viewing is required:

```text
Patient
  ↓
Explicit/required authorization
  ↓
Caregiver
  ↓
Current/last known location
```

Do not automatically make location public to all caregivers/admins.

---

# 49. LOCATION STALENESS

A location should have:

```text
timestamp
```

The API should allow clients to determine whether it is stale.

Do not present a 3-hour-old location as:

```text
"Current location"
```

Prefer:

```text
Last known location
```

when appropriate.

---

# 50. DEVICE OFFLINE

If the safety system receives device-heartbeat data, it may support:

```text
DEVICE_OFFLINE
```

only if explicitly required.

Do not create device monitoring infrastructure just for B12.

---

# 51. SAFETY NOTIFICATION FLOW

All safety notifications must use B9:

```text
B12 Safety Event
       ↓
Notification Service B9
       ↓
Notification
       ↓
Configured delivery channels
```

B12 should not know whether B9 uses:

```text
FCM
Email
SMS
WebSocket
```

---

# 52. CRITICAL ALERT DELIVERY

For critical alerts, B12 should request the appropriate notification priority.

Example:

```text
SOS
 ↓
CRITICAL
 ↓
B9
```

Do not implement a separate critical notification channel inside B12.

---

# 53. NOTIFICATION FAILURE

If a notification provider fails:

```text
Safety event remains active
```

Do NOT mark the safety event resolved merely because notification delivery failed.

Record delivery failure through B9.

If escalation is required, use the B9 delivery/event infrastructure.

---

# 54. EMERGENCY CONTACT ESCALATION

If specified:

```text
Primary contact
      ↓
Wait for acknowledgement
      ↓
Secondary contact
      ↓
Wait
      ↓
Admin
```

Implement only if PROJECT_SPEC.md explicitly requires this workflow.

Otherwise:

```text
Notify configured authorized recipients
```

and stop.

---

# 55. SAFETY EVENT IDEMPOTENCY

Safety event creation must be idempotent where repeated client submissions are possible.

Use:

```text
clientEventId
```

or another safe idempotency mechanism.

Never rely only on timestamps.

---

# 56. CONCURRENCY

Protect against:

```text
Patient cancels SOS
Caregiver acknowledges SOS
Worker escalates SOS
```

all happening simultaneously.

Use safe state transitions.

Example:

```text
TRIGGERED → ACKNOWLEDGED
```

must prevent a concurrent process from incorrectly changing the event back to:

```text
TRIGGERED
```

---

# 57. STATE MACHINE

Implement safety state transitions centrally.

Conceptually:

```text
TRIGGERED
   ├──→ ACKNOWLEDGED
   ├──→ ESCALATED
   ├──→ CANCELLED
   └──→ RESOLVED

ESCALATED
   ├──→ ACKNOWLEDGED
   └──→ RESOLVED

ACKNOWLEDGED
   └──→ RESOLVED
```

Exact transitions must follow PROJECT_SPEC.md.

---

# 58. AUDITABILITY

Safety events are important.

Record:

```text
who triggered
when triggered
who acknowledged
when acknowledged
who resolved
when resolved
what source triggered it
```

Do not rely solely on mutable current state.

If an audit-log system exists, reuse it.

---

# 59. SAFETY EVENT AUDIT LOG

Potential:

```text
SafetyEventHistory
├── eventId
├── action
├── actorId
├── previousStatus
├── newStatus
├── timestamp
└── metadata
```

Only create a separate model if existing audit infrastructure cannot satisfy the requirement.

---

# 60. LOCATION PRIVACY

Location data must have strict access control.

Examples:

```text
Patient → own location
Authorized caregiver → permitted patient location
Unrelated patient → denied
Unrelated caregiver → denied
Public user → denied
```

---

# 61. DATA MINIMIZATION

Do not collect:

```text
Every GPS point every second
```

unless explicitly required.

Prefer:

```text
Event-driven location
Periodic safety location
Current/last-known location
```

based on the product specification.

---

# 62. LOCATION RETENTION

Define:

```text
Raw location retention
Safety event retention
Geofence history retention
```

Raw location should generally have a shorter retention period than safety event history unless there is a justified reason otherwise.

Follow project privacy requirements.

---

# 63. ENCRYPTION

Use existing infrastructure for:

```text
TLS
Database encryption
Secret management
```

Do not invent custom encryption schemes.

Never implement:

```text
home-made encryption
```

for location data.

---

# 64. AUTHORIZATION MATRIX

Test:

```text
Patient
  ↓
Trigger own SOS
✓

Patient
  ↓
Trigger another patient's SOS
✗

Patient
  ↓
View own safety events
✓

Patient
  ↓
View unrelated safety event
✗

Authorized caregiver
  ↓
View patient's safety event
✓

Unrelated caregiver
  ↓
View patient's safety event
✗

Authorized caregiver
  ↓
Acknowledge event
✓

Normal patient
  ↓
Resolve another patient's event
✗
```

Exact permissions follow PROJECT_SPEC.md.

---

# 65. GEOFENCE AUTHORIZATION

Test:

```text
✓ authorized caregiver creates geofence
✓ patient creates own geofence if allowed
✓ unrelated caregiver rejected
✓ unauthorized user rejected
✓ patient cannot edit another patient's geofence
```

---

# 66. LOCATION VALIDATION TESTS

Test:

```text
✓ valid coordinates accepted
✓ latitude > 90 rejected
✓ latitude < -90 rejected
✓ longitude > 180 rejected
✓ longitude < -180 rejected
✓ negative accuracy rejected
✓ malformed timestamp rejected
```

---

# 67. GEOFENCE TESTS

Test:

```text
✓ inside location remains inside
✓ inside → outside creates breach
✓ outside → outside does not spam alerts
✓ outside → inside updates state
✓ GPS jitter handled
✓ poor accuracy handled
✓ inactive geofence ignored
```

---

# 68. SOS TESTS

Test:

```text
✓ SOS creates event
✓ SOS notification generated
✓ duplicate SOS handled
✓ unauthorized SOS rejected
✓ cancellation protected
✓ acknowledgement protected
✓ resolution protected
```

---

# 69. FALL TESTS

Test:

```text
✓ fall event accepted
✓ invalid confidence rejected
✓ fall notification generated where required
✓ duplicate fall handled
✓ patient can confirm safe where allowed
✓ timeout escalation works
✓ resolved fall cannot escalate
```

---

# 70. CONCURRENCY TESTS

Test:

```text
SOS trigger + duplicate trigger
SOS cancel + caregiver acknowledgement
Fall confirmation + escalation worker
Geofence update + location evaluation
```

Verify final states are valid.

---

# 71. NOTIFICATION INTEGRATION TESTS

Test:

```text
SOS
 ↓
B12
 ↓
B9
 ↓
Safety notification
```

and:

```text
Fall
 ↓
B12
 ↓
B9
```

and:

```text
Geofence breach
 ↓
B12
 ↓
B9
```

Do not call external push/email providers in automated tests.

Use mocks.

---

# 72. NO AI CONTROL

B11 AI must NOT autonomously:

```text
Trigger SOS
Resolve SOS
Cancel SOS
Change geofence
Escalate emergency
Contact emergency services
```

If AI is used to explain an event:

```text
AI explanation
```

must remain separate from:

```text
Safety event state
```

---

# 73. NO MEDICAL DECISIONS

Do NOT implement:

```text
Medical emergency classification
Disease diagnosis
Fall injury diagnosis
Clinical severity diagnosis
Treatment recommendation
```

Safety severity values are operational classifications, not medical diagnoses.

---

# 74. EMERGENCY SERVICES

Do NOT implement direct emergency service integration unless PROJECT_SPEC.md explicitly requires a verified provider.

Never fake:

```text
112 called
Ambulance dispatched
Police notified
Hospital notified
```

If future emergency service integration is added, it must have:

```text
Verified provider
Authentication
Delivery confirmation
Failure handling
Audit trail
Legal/privacy review
```

---

# 75. BACKGROUND JOBS

Potential jobs:

```text
Fall confirmation timeout
Safety escalation
Geofence state cleanup
Location retention cleanup
Safety event expiration
```

Reuse existing B6/B9 job infrastructure.

Do not create duplicate worker systems.

---

# 76. JOB IDEMPOTENCY

Every safety worker must be safe to run more than once.

Example:

```text
Escalation job
runs twice
```

must not:

```text
send duplicate escalation endlessly
```

Use:

```text
event state
+
escalation timestamp
+
idempotency key
```

or equivalent.

---

# 77. RATE LIMITING

Protect:

```text
/sos
/location
/fall-events
/geofences
```

against abuse.

Be careful:

```text
Do NOT rate-limit legitimate emergency actions so aggressively that SOS becomes unusable.
```

Use reasonable limits and document them.

---

# 78. VALIDATION

Validate:

```text
eventId
geofenceId
latitude
longitude
accuracy
confidence
timestamp
status
```

Reject malformed requests.

---

# 79. API SUMMARY

Potential endpoints:

```http
POST /api/v1/safety/sos

POST /api/v1/safety/location

POST /api/v1/safety/fall-events

GET  /api/v1/safety/events
GET  /api/v1/safety/events/:eventId

POST /api/v1/safety/events/:eventId/acknowledge
POST /api/v1/safety/events/:eventId/resolve
POST /api/v1/safety/events/:eventId/cancel

GET    /api/v1/safety/geofences
POST   /api/v1/safety/geofences
PATCH  /api/v1/safety/geofences/:geofenceId
DELETE /api/v1/safety/geofences/:geofenceId

GET /api/v1/safety/location/current
```

Only implement endpoints required by the specification.

---

# 80. RESPONSE FORMAT

Continue using the project's existing API format.

Example:

```json
{
  "success": true,
  "data": {
    "eventId": "...",
    "type": "SOS",
    "status": "TRIGGERED"
  }
}
```

Never return:

```text
database stack traces
provider secrets
internal service details
```

---

# 81. ERROR CODES

Use consistent application errors.

Potential:

```text
SAFETY_EVENT_NOT_FOUND
SAFETY_EVENT_ALREADY_RESOLVED
UNAUTHORIZED_SAFETY_ACCESS
INVALID_LOCATION
INVALID_GEOFENCE
INVALID_STATE_TRANSITION
SAFETY_EVENT_DUPLICATE
```

Reuse existing error conventions.

---

# 82. DATABASE INDEXES

Follow DATABASE.md.

Potential:

```text
SafetyEvent:
patientId + createdAt
patientId + status
type + status
eventId

LocationEvent:
patientId + timestamp

Geofence:
patientId + isActive

SafetyEventHistory:
eventId + timestamp
```

Use geospatial indexes only if the chosen database implementation actually benefits from them.

---

# 83. GEO QUERIES

If MongoDB geospatial queries are used:

Use MongoDB-supported geospatial functionality.

Do not manually scan every patient's geofence in application memory.

For example:

```text
Location
   ↓
Database geospatial query
   ↓
Candidate geofences
   ↓
Safety rule evaluation
```

---

# 84. LOCATION ACCURACY

Do not treat:

```text
accuracy = 500m
```

as equivalent to:

```text
accuracy = 5m
```

The geofence engine must account for accuracy.

---

# 85. GEOFENCE EDGE CASES

Handle:

```text
Location exactly on boundary
GPS jumps across boundary
Poor accuracy
Inactive geofence
Multiple active geofences
Patient changes geofence
Duplicate location
Out-of-order location timestamps
```

Define behavior and test it.

---

# 86. OUT-OF-ORDER LOCATION

Example:

```text
Location A: 10:05
Location B: 10:03
```

Do not allow an older location to overwrite a newer state incorrectly.

Use timestamps and/or sequence numbers where available.

---

# 87. DUPLICATE LOCATION

Repeated identical location events should not create repeated:

```text
geofence breach
```

events.

Use event deduplication/state transition logic.

---

# 88. MULTIPLE GEOFENCES

A patient may have:

```text
Home
Hospital
Care Center
```

If multiple geofences exist:

```text
Inside any active safe zone
```

must be handled according to project rules.

Do not assume there is only one geofence unless PROJECT_SPEC.md says so.

---

# 89. GEOFENCE STATE STORAGE

Store the last known state if needed:

```text
geofenceState
lastEvaluatedAt
```

This helps prevent repeated breach notifications.

Do not store unnecessary location history in the geofence document.

---

# 90. SAFETY EVENT HISTORY

Safety history should remain auditable.

Do not allow users to silently modify:

```text
triggeredAt
acknowledgedAt
resolvedAt
```

after the event has been recorded.

---

# 91. SOFT DELETE

If safety events are soft-deleted:

Do not make them disappear from audit history.

Prefer:

```text
active/inactive
```

or retention/archive rules.

Follow DATABASE.md.

---

# 92. PRIVACY

Safety data includes:

```text
Location
Emergency events
Caregiver information
Potentially sensitive activity
```

Protect it with:

```text
Authentication
Authorization
Least privilege
Data minimization
Retention
Auditability
```

---

# 93. NO PUBLIC LOCATION

Never expose an endpoint such as:

```http
GET /api/v1/patients/:id/location
```

without strict authorization.

Avoid predictable resource access that can create IDOR vulnerabilities.

---

# 94. NO CLIENT-CONTROLLED RECIPIENTS

Do not allow:

```json
{
  "notifyUserId": "random-user"
}
```

to determine safety recipients.

Recipients must come from:

```text
B3 emergency contacts
B3 caregiver relationships
Project authorization rules
```

---

# 95. SECURITY TESTING

Test:

```text
IDOR
Authorization bypass
Patient impersonation
Caregiver impersonation
Geofence ownership
Location privacy
SOS ownership
Event ownership
Recipient injection
Malformed coordinates
Replay attacks
Duplicate events
```

---

# 96. REPLAY PROTECTION

A captured SOS request should not be replayable indefinitely.

Use:

```text
idempotency key
timestamp
authentication
```

where appropriate.

Do not require unrealistic client clocks.

---

# 97. DEVICE AUTHENTICATION

If B13 uses device-specific credentials/tokens:

Do not invent the final mobile authentication mechanism in B12.

Document the interface.

B13 will integrate with the chosen authentication architecture.

---

# 98. MOBILE API CONTRACT

Prepare stable APIs for B13.

Document:

```text
Authentication
SOS
Location
Fall event
Geofence
Event status
Current location
```

B13 should not need to understand internal database models.

---

# 99. MOBILE CLIENT FAILURE

The backend should assume:

```text
network loss
duplicate requests
delayed requests
offline device
battery loss
app restart
```

Design APIs to be retry-safe where practical.

---

# 100. SAFETY OFFLINE BEHAVIOR

Do not assume the mobile app is always online.

B12 should safely accept delayed events where possible.

Example:

```text
Fall detected at 10:00
Device reconnects at 10:03
```

The event should retain the original detection timestamp.

Do not use server receipt time as the only event time.

---

# 101. CLOCK SKEW

Client timestamps can be wrong.

Store:

```text
clientDetectedAt
serverReceivedAt
```

if useful.

Do not blindly trust client timestamps for ordering critical events.

---

# 102. OBSERVABILITY

Log safe operational information:

```text
event ID
event type
patient internal ID
source
status transition
timestamp
```

Do not log exact location unnecessarily.

Never log:

```text
authentication tokens
provider secrets
full emergency contact data
```

---

# 103. MONITORING

Track:

```text
SOS events
Fall events
Geofence breaches
Notification failures
Acknowledgement latency
Resolution latency
```

Use aggregate metrics where possible.

Do not expose sensitive individual safety data through logs or metrics.

---

# 104. SAFETY EVENT LATENCY

Measure:

```text
event triggered
      ↓
notification requested
      ↓
notification delivery attempt
```

This helps evaluate system reliability.

Do not claim emergency response time unless actual emergency services are integrated.

---

# 105. DATA RETENTION

Define separate retention policies for:

```text
Safety events
Safety audit history
Raw location
Geofence configuration
```

Location should generally have stricter retention than safety event metadata.

Follow project policy.

---

# 106. ARCHITECTURE DOCUMENTATION

Update:

```text
docs/ARCHITECTURE.md
docs/DATABASE.md
```

Document:

```text
Safety Event lifecycle
SOS flow
Fall flow
Geofence flow
Location flow
B3 integration
B9 integration
Authorization
Privacy
Retention
Escalation
Background jobs
```

---

# 107. CODE ORGANIZATION

Follow existing architecture.

Recommended:

```text
server/src/modules/safety/
├── safetyEvent.model.js
├── safetyEventHistory.model.js
├── locationEvent.model.js
├── geofence.model.js
├── safety.controller.js
├── safety.service.js
├── safety.repository.js
├── safety.events.js
├── safety.rules.js
├── safety.validation.js
├── safety.routes.js
├── safety.worker.js
├── geofence.service.js
└── safety.test.js
```

Only create files actually required.

Do not duplicate:

```text
Notification service
Caregiver service
Emergency contact service
Authentication
```

---

# 108. DO NOT REWRITE B0-B11

Do not rewrite:

```text
Authentication
Authorization
Users
Patients
Caregivers
Emergency Contacts
Games
Memories
Reminders
Community Sessions
Meeting Circle
Notifications
Analytics
AI
```

unless a genuine defect blocks B12.

If a defect is found:

1. Explain it.
2. Make the smallest safe fix.
3. Add a regression test.
4. Mention it in the final report.

---

# 109. FINAL VERIFICATION

Run:

```bash
npm test
npm run lint
npm run format:check
```

If a build command exists, run it.

Verify:

```text
SOS works
Emergency contacts resolved correctly
Safety notifications use B9
Location ingestion works
Geofence detection works
Fall event ingestion works
Safety lifecycle works
Acknowledgement works
Resolution works
Escalation works where specified
Authorization works
Location privacy works
Duplicate events handled
Concurrency protected
Background jobs idempotent
No AI emergency control
No fake emergency dispatch
```

---

# 110. END-TO-END TEST

Test SOS:

```text
Patient
   ↓
Mobile/API SOS
   ↓
B12 creates event
   ↓
Emergency contacts resolved
   ↓
B9 notification created
   ↓
Caregiver receives notification
   ↓
Caregiver acknowledges
   ↓
Event resolved
```

Geofence:

```text
Patient inside safe zone
       ↓
Location update
       ↓
Patient leaves boundary
       ↓
B12 detects transition
       ↓
GEOFENCE_BREACH
       ↓
B9 notification
```

Fall:

```text
Mobile detects fall
       ↓
B12 receives event
       ↓
Confirmation window
       ↓
Patient does not respond
       ↓
Escalation
       ↓
B9 notification
```

---

# 111. FINAL REPORT

Return:

```text
B12 SAFETY & EMERGENCY BACKEND REPORT

Implementation:
-

Models created/modified:
-

Files created:
-

Files modified:
-

Endpoints:
-

Safety event types:
-

Safety state machine:
-

SOS implementation:
-

Emergency contacts integration:
-

Caregiver integration:
-

Location ingestion:
-

Location privacy:
-

Geofence implementation:
-

Geofence evaluation:
-

GPS accuracy handling:
-

Fall event implementation:
-

Fall confirmation:
-

Escalation:
-

B9 notification integration:
-

Authorization:
-

Privacy:
-

Auditability:
-

Idempotency:
-

Concurrency:
-

Replay protection:
-

Background jobs:
-

Retention:
-

Indexes:
-

Geospatial queries:
-

Security tests:
-

Concurrency tests:
-

End-to-end tests:
-

Lint:
-

Formatting:
-

Database changes:
-

Documentation changes:
-

Known issues:
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

Do NOT proceed to B13.

---

# 112. B12 DEFINITION OF DONE

B12 is complete only when:

[ ] Safety module implemented
[ ] Safety event model implemented
[ ] Safety event lifecycle implemented
[ ] Controlled safety states implemented
[ ] Controlled severity implemented
[ ] SOS implemented
[ ] SOS idempotency implemented
[ ] SOS ownership protected
[ ] Emergency contact integration uses B3
[ ] Caregiver authorization uses B3
[ ] Safety notifications use B9
[ ] No second notification infrastructure created
[ ] Location ingestion implemented if required
[ ] Location validation implemented
[ ] Location authorization implemented
[ ] Location privacy implemented
[ ] Location timestamp handling implemented
[ ] Location retention documented
[ ] Geofence model implemented
[ ] Geofence authorization implemented
[ ] Geofence validation implemented
[ ] Geofence state transitions implemented
[ ] Geofence GPS jitter handled
[ ] GPS accuracy considered
[ ] Duplicate location handled
[ ] Out-of-order location handled
[ ] Multiple geofences handled
[ ] Geofence breach event implemented
[ ] Fall event ingestion implemented
[ ] Fall event validation implemented
[ ] Fall confirmation implemented if required
[ ] Fall escalation implemented if required
[ ] Escalation timers configurable
[ ] Background workers reuse existing infrastructure
[ ] Background jobs are idempotent
[ ] Safety acknowledgement implemented
[ ] Safety resolution implemented
[ ] Safety event history implemented
[ ] Auditability implemented
[ ] Current/last-known location endpoint protected if required
[ ] IDOR protection implemented
[ ] Replay protection implemented where appropriate
[ ] Rate limiting implemented
[ ] Provider failures do not resolve safety events
[ ] No fake emergency-service integration
[ ] No autonomous AI emergency control
[ ] No medical diagnosis
[ ] Required indexes implemented
[ ] Privacy documentation updated
[ ] Architecture documentation updated
[ ] Database documentation updated
[ ] Tests cover SOS
[ ] Tests cover geofencing
[ ] Tests cover fall detection events
[ ] Tests cover authorization
[ ] Tests cover privacy
[ ] Tests cover concurrency
[ ] Tests cover idempotency
[ ] Tests cover replay protection
[ ] Tests cover notification integration
[ ] All tests pass
[ ] Lint passes
[ ] Formatting passes
[ ] No mobile app implemented
[ ] No hardware implemented
[ ] No unrelated features implemented

Only after all applicable items pass should B12 be considered complete.

---

# 113. STOP CONDITION

After B12 is complete:

**STOP.**

Do not begin B13.

The next phase will be:

```text
B13 - Memora Safety Mobile App
```

B13 will build the mobile client that communicates with B12.

Expected mobile capabilities:

```text
SOS Button
Background Location
Geofence Support
Fall Detection Integration
Emergency Contact Access
Safety Event Status
Push Notifications
Voice Interaction
Simple Elder-Friendly UI
Regional Language Support
Offline/Retry Handling
Battery-Aware Location
Secure Device Authentication
```

B13 must use the B12 APIs and must NOT duplicate backend safety logic.

The mobile application must never expose:

```text
API secrets
AI provider keys
database credentials
internal safety rules
```

Emergency actions must remain controlled by the B12 backend.
