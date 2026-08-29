# Memora - Phase B3 Prompt: Users, Patients & Caregivers

**Phase:** B3  
**Name:** Users / Patients / Caregivers  
**Prerequisites:** B0 Backend Foundation, B1 Database Foundation, B2 Authentication

## Objective

Implement protected user, patient, caregiver, and emergency-contact functionality on top of B2 authentication.

Target flow:

```text
Authenticated Client
        ↓
Authentication Middleware
        ↓
Authorization / Ownership Checks
        ↓
Controller
        ↓
Service
        ↓
Mongoose
        ↓
MongoDB
```

At the end of B3, authenticated users should be able to manage their appropriate profiles, patients should manage their own emergency contacts, and authorized caregivers should access patients only through an active caregiver relationship and the required permission.

---

# 1. READ FIRST

Before changing anything, read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
```

Then inspect the existing B0-B2 implementation, especially:

```text
server/src/config/
server/src/middleware/
server/src/modules/auth/
server/src/modules/users/
server/src/modules/patients/
server/src/modules/caregivers/
server/src/routes/
```

B0, B1, and B2 are already implemented.

**Do not rebuild them.**

---

# 2. B3 SCOPE

Implement only:

- User profile APIs
- Patient profile APIs
- Caregiver relationship APIs
- Emergency contact APIs
- Reusable authorization foundation
- Ownership checks
- Caregiver-patient relationship checks
- Permission checks
- Basic role-checking foundation
- Tests for authorization and ownership

Do NOT implement:

- Cognitive games
- Memories
- Reminders
- Community Sessions
- Meeting Circle
- Notifications
- Analytics
- AI
- Location
- Geofencing
- SOS
- Fall detection

---

# 3. CORE SECURITY PRINCIPLE

Authentication answers:

```text
Who are you?
```

Authorization answers:

```text
What are you allowed to access?
```

Never rely on the frontend for authorization.

Correct flow:

```text
Request
  ↓
Authentication
  ↓
Authorization
  ↓
Ownership / Relationship Check
  ↓
Service
  ↓
Database
```

---

# 4. REUSE B2 AUTHENTICATION

Reuse the authentication system created in B2.

Use the existing authenticated request context, such as:

```text
req.user
req.session
```

Do NOT create another session system.

Do NOT duplicate authentication middleware.

---

# 5. AUTHORIZATION FOUNDATION

Create reusable authorization functionality supporting:

```text
Role
Ownership
Caregiver relationship
Relationship status
Relationship permission
```

Conceptual helpers may include:

```text
requireAuth()
requireRole()
requirePatientAccess()
requirePermission()
```

Use existing project conventions if equivalent functionality already exists.

Do not create duplicate middleware.

---

# 6. ACCESS RULES

Examples:

```text
Patient → own profile
✓ Allowed

Patient → another patient's profile
✗ Denied

Caregiver → patient with ACTIVE relationship + permission
✓ Allowed

Caregiver → unrelated patient
✗ Denied

Caregiver → patient with REVOKED relationship
✗ Denied

Authenticated random user → arbitrary patient
✗ Denied
```

Authorization must be checked server-side.

---

# 7. USER PROFILE API

Implement:

```http
GET /api/v1/users/me
PATCH /api/v1/users/me
```

`GET /users/me` returns only safe user information.

Example:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "PATIENT",
      "profileImageUrl": "...",
      "preferredLanguage": "...",
      "isActive": true
    }
  }
}
```

Never return:

```text
passwordHash
sessionTokenHash
```

---

# 8. USER PROFILE UPDATE

`PATCH /api/v1/users/me`

Allow appropriate self-service fields such as:

```text
name
profileImageUrl
preferredLanguage
```

Do NOT allow this endpoint to change:

```text
role
isActive
passwordHash
```

Role management belongs to future administrative functionality.

---

# 9. PATIENT PROFILE API

Implement:

```http
GET /api/v1/patients/me
PATCH /api/v1/patients/me
```

Use the existing B1 `PatientProfile` model.

Do not create another patient model.

A patient should be able to access and update their own profile.

Example response:

```json
{
  "success": true,
  "data": {
    "patient": {
      "userId": "...",
      "dateOfBirth": "...",
      "preferredLanguage": "...",
      "accessibilitySettings": {},
      "preferences": {},
      "safetySettings": {}
    }
  }
}
```

---

# 10. PATIENT ACCESS BY ID

If an endpoint such as:

```http
GET /api/v1/patients/:patientId
```

is useful for caregiver functionality, implement it with strict authorization.

Allowed:

```text
Patient → own profile
Caregiver → authorized patient + required permission
Admin → according to explicitly defined policy
```

Denied:

```text
Random authenticated user → arbitrary patient
```

Do not expose patient data merely because the requester knows a MongoDB ObjectId.

---

# 11. CAREGIVER RELATIONSHIPS

Implement relationship management using the existing B1 model.

Recommended endpoints:

```http
GET    /api/v1/caregivers/relationships
POST   /api/v1/caregivers/relationships
PATCH  /api/v1/caregivers/relationships/:relationshipId
DELETE /api/v1/caregivers/relationships/:relationshipId
```

Follow the existing API naming conventions if they differ.

---

# 12. RELATIONSHIP DATA

Use the existing fields:

```text
caregiverId
patientId
relationshipType
permissions
status
createdBy
createdAt
updatedAt
```

Relationship types:

```text
FAMILY
PROFESSIONAL
GUARDIAN
OTHER
```

Statuses:

```text
PENDING
ACTIVE
REVOKED
```

Do not invent arbitrary enum values.

---

# 13. RELATIONSHIP CREATION SECURITY

Do NOT allow an authenticated user to arbitrarily grant themselves access to another patient.

The relationship creation workflow must enforce the product's intended policy.

If the existing project specification does not completely define the invitation/approval workflow:

1. Implement the safest minimal workflow.
2. Clearly document the assumption.
3. Do not silently grant access.

Do not implement a full admin relationship-management system unless explicitly required.

---

# 14. CAREGIVER PERMISSIONS

The existing database specification defines permissions including:

```text
viewProfile
manageMemories
manageReminders
viewCognitiveActivity
viewLocation
manageGeofences
receiveSafetyAlerts
manageCommunityRegistration
```

B3 should establish reusable permission checking.

Do not implement the downstream features yet.

For example:

```text
Caregiver
+
ACTIVE relationship
+
viewProfile
=
Can view patient profile
```

But:

```text
Caregiver
+
ACTIVE relationship
+
no viewProfile permission
=
Forbidden
```

Future modules must be able to reuse this authorization layer.

---

# 15. EMERGENCY CONTACT API

Implement:

```http
GET    /api/v1/patients/me/emergency-contacts
POST   /api/v1/patients/me/emergency-contacts
PATCH  /api/v1/patients/me/emergency-contacts/:contactId
DELETE /api/v1/patients/me/emergency-contacts/:contactId
```

Use the existing B1 `EmergencyContact` model.

Do not create another emergency-contact model.

---

# 16. EMERGENCY CONTACT ACCESS

A patient can manage their own emergency contacts.

A caregiver may access them only if:

```text
ACTIVE relationship
+
appropriate permission
```

Unrelated users must be rejected.

Do not implement SOS behavior in B3.

---

# 17. SENSITIVE DATA

Treat these as sensitive:

```text
Patient information
Emergency contacts
Caregiver relationships
Personal profile data
```

Never log unnecessarily:

```text
phone numbers
email addresses
personal details
patient data
```

Do not expose sensitive information through broad endpoints.

---

# 18. SERVICE LAYER

Keep business logic out of controllers.

Preferred:

```text
Route
 ↓
Middleware
 ↓
Controller
 ↓
Service
 ↓
Model
```

Authorization logic that will be reused by multiple modules should be centralized.

Avoid copying the same caregiver-access query into Games, Memories, Reminders, Safety, etc.

---

# 19. REUSABLE PATIENT ACCESS CHECK

Create a reusable authorization service/helper conceptually equivalent to:

```text
canAccessPatient(user, patientId, permission)
```

It should evaluate:

```text
Authenticated user
+
Role
+
Patient ownership
+
Caregiver relationship
+
Relationship status
+
Required permission
```

Do not hardcode future feature-specific logic into this helper.

It should be generic enough for later modules.

---

# 20. ROLE CHECKING

Establish basic role checking using the existing roles:

```text
PATIENT
CAREGIVER
ADMIN
HOST
```

Do not add roles.

A reusable mechanism such as:

```text
requireRole("ADMIN")
```

may be created if needed.

Do NOT build the complete admin dashboard or role-management APIs.

---

# 21. VALIDATION

Validate all external input.

Validate:

```text
User profile updates
Patient profile updates
Relationship creation/update
Emergency contact creation/update
Route IDs
Query parameters
```

Validate ObjectIds before database queries where appropriate.

Validate:

```text
enum values
string lengths
email format
phone format
priority
```

Use API-level validation in addition to Mongoose validation.

---

# 22. DATABASE RULES

Reuse these B1 models:

```text
User
PatientProfile
CaregiverRelationship
EmergencyContact
```

Do not create duplicates.

Do not change MongoDB technology.

Do not add unrelated collections.

If a schema change is genuinely required:

1. Explain why.
2. Make the smallest safe change.
3. Update `docs/DATABASE.md`.
4. Add/update tests.

---

# 23. API RESPONSE FORMAT

Continue using the established response format.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Forbidden:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource"
  }
}
```

Use the existing error infrastructure if B0/B2 already defines it.

Do not expose raw MongoDB errors.

---

# 24. TESTING

Add API/integration tests with Supertest and the project's existing test framework.

## User Profile

```text
✓ authenticated user can view own profile
✓ authenticated user can update own profile
✓ unauthenticated request rejected
✓ role cannot be changed through profile endpoint
✓ isActive cannot be changed through profile endpoint
✓ passwordHash cannot be changed through profile endpoint
```

## Patient Profile

```text
✓ patient can view own profile
✓ patient can update own profile
✓ unrelated user cannot access patient
✓ authorized caregiver can access patient
✓ caregiver without required permission is rejected
✓ revoked caregiver cannot access patient
```

## Caregiver Relationships

```text
✓ valid relationship workflow works
✓ invalid relationship type rejected
✓ invalid status rejected
✓ duplicate relationship rejected
✓ unauthorized relationship management rejected
✓ revoked relationship cannot grant access
```

## Emergency Contacts

```text
✓ patient can create contact
✓ patient can list contacts
✓ patient can update contact
✓ patient can delete contact
✓ unrelated user cannot access contacts
✓ caregiver requires appropriate permission
```

---

# 25. SECURITY TEST MATRIX

Explicitly test:

```text
PATIENT → own data
✓

PATIENT → another patient's data
✗

CAREGIVER → authorized patient
✓

CAREGIVER → unrelated patient
✗

CAREGIVER → required permission
✓

CAREGIVER → missing permission
✗

REVOKED caregiver → patient
✗

Unauthenticated → protected API
✗
```

This is one of the most important parts of B3.

---

# 26. NO FRONTEND-ONLY AUTHORIZATION

Never implement security like:

```text
Frontend hides button
        ↓
User cannot access feature
```

Instead:

```text
Frontend
   ↓
Backend
   ↓
Authentication
   ↓
Authorization
   ↓
Database
```

A malicious client must still receive:

```text
401 / 403
```

when it attempts unauthorized access.

---

# 27. DO NOT REWRITE B0-B2

Do not rewrite:

```text
Express configuration
Database configuration
Authentication
Session management
User model
PatientProfile model
CaregiverRelationship model
EmergencyContact model
```

unless an actual defect blocks B3.

If you discover a defect:

1. Explain it.
2. Make the smallest fix.
3. Add a regression test.
4. Mention it in the final report.

---

# 28. NO UNRELATED FEATURES

Do NOT implement:

```text
Cognitive games
Memories
Reminders
Community voting
Community sessions
Meeting Circle
Notifications
Analytics
AI
Location
Geofencing
SOS
Fall detection
```

B4 and later phases handle these.

---

# 29. DOCUMENTATION

If B3 changes:

```text
API contracts
Authorization rules
Permission definitions
Database schema
```

update the appropriate documentation.

Do not silently change:

```text
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
```

If requirements are ambiguous, report the ambiguity.

---

# 30. CODE QUALITY

Follow `CLAUDE.md`.

Do not:

- Add unnecessary dependencies.
- Duplicate utilities.
- Duplicate models.
- Duplicate authentication.
- Duplicate authorization logic.
- Refactor unrelated code.
- Introduce microservices.
- Change database technology.
- Change frameworks.
- Add unnecessary infrastructure.

Keep the implementation modular and understandable.

---

# 31. FINAL VERIFICATION

Run:

```bash
npm test
npm run lint
npm run format:check
```

If a build command exists, run it.

Manually verify:

```text
Register
   ↓
Login
   ↓
GET /api/v1/users/me
   ↓
GET /api/v1/patients/me
   ↓
PATCH profile
   ↓
Create emergency contact
   ↓
Create/manage caregiver relationship
   ↓
Test authorized caregiver access
   ↓
Test unauthorized caregiver access
   ↓
Test revoked relationship
```

---

# 32. FINAL REPORT

Return:

```text
B3 USERS / PATIENTS / CAREGIVERS REPORT

Implementation:
-

Files created:
-

Files modified:
-

Endpoints:
-

Authorization architecture:
-

Role checks:
-

Ownership checks:
-

Caregiver relationship checks:
-

Permission checks:
-

Validation:
-

Database changes:
-

Tests:
-

Security tests:
-

Lint:
-

Formatting:
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

Do NOT proceed to B4.

---

# 33. B3 DEFINITION OF DONE

B3 is complete only when:

[ ] User profile API implemented
[ ] Patient profile API implemented
[ ] Emergency contact API implemented
[ ] Caregiver relationship API implemented
[ ] B2 authentication middleware reused
[ ] Authorization foundation implemented
[ ] Ownership checks implemented
[ ] Caregiver relationship checks implemented
[ ] Permission checks implemented
[ ] Role checks established
[ ] Unauthorized access rejected
[ ] Revoked relationships cannot grant access
[ ] Sensitive data protected
[ ] Input validation implemented
[ ] Duplicate relationships handled
[ ] Positive tests pass
[ ] Negative/security tests pass
[ ] All tests pass
[ ] Lint passes
[ ] Formatting passes
[ ] Documentation remains consistent
[ ] No unrelated features implemented

Only after all applicable items pass should B3 be considered complete.

---

# 34. STOP CONDITION

After B3 is complete:

**STOP.**

Do not begin B4.

The next phase will be:

```text
B4 - Cognitive Games
```

B4 will build the cognitive-game system and patient game-session functionality on top of the authenticated and authorized foundation established by B0-B3.
