# MEMORA FIX 06
## Connect All Existing AI, Voice, Reminder, Geofence and SOS Features to Memora

The implementation audit shows substantial feature code already exists.

The goal now is to ensure it is ACTUALLY connected to the real Memora user experience.

**Do not build new features. Do not create duplicate systems.**

### 1. Map the Existing Application

Inspect:
- login
- patient navigation
- patient dashboard
- AI companion
- reminders
- routines
- memories
- mobile navigation
- caregiver dashboard
- safety page
- SOS page
- notifications

### 2. Find Orphaned Components

For each feature/component classify it:

```text
CONNECTED
PARTIALLY CONNECTED
ORPHANED
```

Pay special attention to:
- AI assistant screens
- safety screens
- SOS screen
- SafetyContext
- AI API service
- safety API service

### 3. Routing

Verify patients can reach AI Companion through normal navigation.

Verify caregivers can reach Safety through normal navigation.

Do not require manually entering URLs.

### 4. AI

Verify:

```text
Login
→ AI Companion
→ microphone/type
→ real backend
→ real Gemini
→ response
```

### 5. Reminder Integration

AI-created reminders MUST appear in the existing Memora reminder UI/data source.

Do not maintain separate AI and normal reminder databases.

### 6. Routine Integration

AI must use the same routine source as Memora.

### 7. Memory Integration

AI must use existing Memora memories.

### 8. Caregiver Integration

Caregiver should be able to access:

```text
Patient
→ Routine
→ Reminders
→ Safety status
→ Safety events
→ SOS
```

### 9. Geofence Integration

Verify:

```text
Caregiver creates safe zone
→ backend
→ patient mobile configuration
→ location service
→ exit detection
→ caregiver alert
```

### 10. SOS Integration

Verify:

```text
Patient
→ SOS
→ backend
→ safety event
→ caregiver alert
```

### 11. Notifications

Find the existing notification architecture and make reminders, safety events, and SOS use appropriate existing infrastructure.

Prevent duplicates.

### 12. Authentication

All features must use existing Memora authentication.

### 13. API Base URL

Verify mobile/client API URLs work on an actual device.

Remove inaccessible hard-coded localhost URLs where necessary.

### 14. Mock Data

Search new feature code for:
```text
mock
dummy
sample
fake
hardcoded
```

Replace accidental production mocks with real APIs. Keep legitimate test fixtures.

### 15. Final User Journeys

Actually test:

#### Journey A
```text
Patient login
→ AI Companion
→ "Hello Memora"
→ real Gemini response
```

#### Journey B
```text
"Remind me to turn off the stove in 15 minutes."
→ reminder created
→ visible in Memora
→ notification
```

#### Journey C
```text
"What do I need to do today?"
→ actual routine
→ AI response
```

#### Journey D
```text
Patient exits safe zone
→ geofence
→ safety event
→ caregiver alert
```

#### Journey E
```text
Patient
→ SOS
→ caregiver alert
→ acknowledge
→ resolve
```

For every journey report:
```text
PASS
PARTIAL
FAIL
```

Only mark PASS after actual runtime testing.

### Final Report

Return:

#### Connected Features
Everything verified.

#### Partially Connected
Anything requiring device/platform/manual configuration.

#### Broken
Anything still failing.

#### Files Modified
Exact paths.

#### Routes
Exact routes.

#### API Endpoints
Exact endpoints.

#### Environment Variables
Names only.

#### SIH Demo
Recommended 3-5 minute demonstration.

## FINAL RULE

Do not add features.

Do not rebuild the architecture.

Do not stop after writing code.

Run the application.

Test the journeys.

Fix the failures.

Only then report completion.
