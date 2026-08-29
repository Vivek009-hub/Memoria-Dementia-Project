# Memora - Technical Architecture

**Version:** 1.0  
**Status:** Phase 1 - Architecture Baseline  
**Project:** Memora

---

# 1. Purpose

This document defines the technical architecture for Memora.

It is the technical source of truth for:
- Backend structure
- Web application structure
- Mobile safety application
- Database interaction
- API communication
- AI integration
- Real-time communication
- Notifications
- Safety monitoring
- Authentication and authorization
- Multi-developer and AI-assisted development

All developers and AI coding assistants must follow this architecture unless the team explicitly approves a documented change.

---

# 2. Architecture Goals

Memora must be:

1. Modular
2. Maintainable
3. Secure
4. Scalable
5. Testable
6. Easy for multiple developers to work on simultaneously
7. Compatible with AI-assisted development
8. Suitable for gradual feature development
9. Reliable for safety-related features
10. Simple for the patient-facing experience

The architecture should avoid unnecessary complexity during the initial implementation.

---

# 3. High-Level System Architecture

Memora consists of three primary applications/services:

```text
                         MEMORA PLATFORM
                              |
             +----------------+----------------+
             |                |                |
             v                v                v
       Web Application   Backend API      Mobile Safety App
             |                |                |
             |                |                |
             +----------------+----------------+
                              |
                    +---------+---------+
                    |                   |
                    v                   v
                 MongoDB           External Services
                                      |
                           +----------+----------+
                           |          |          |
                           v          v          v
                         AI APIs   Storage   Notifications
```

The backend is the central application layer.

The web application and mobile application must not directly access MongoDB.

```text
Web -> Backend -> MongoDB
Mobile -> Backend -> MongoDB
```

Never:

```text
Web -> MongoDB
Mobile -> MongoDB
```

---

# 4. Applications

## 4.1 Web Application

The web application is responsible for:

- Patient interface
- Caregiver dashboard
- Admin dashboard
- Cognitive games
- Memory assistance
- Reminders
- Community Sessions
- Meeting Circle interface
- Analytics
- AI interaction interface

Suggested technology:

- React
- Vite
- Tailwind CSS

The web application communicates with the backend through REST APIs and real-time connections where required.

---

# 5. Mobile Safety Application

The mobile application is intentionally lightweight.

Suggested technology:

- React Native
- Expo where compatible with required native capabilities

Primary responsibilities:

- Authentication
- Location collection
- Geofence monitoring
- SOS
- Possible fall detection
- Device status
- Push notification handling
- Safety communication

The mobile app must not duplicate the full Memora web application.

Its primary role is to act as the patient's safety companion.

---

# 6. Backend

The backend is a Node.js + Express.js application.

Technology:

- Node.js
- Express.js
- JavaScript
- ES Modules
- Mongoose
- MongoDB

Responsibilities:

- Authentication
- Authorization
- Business logic
- Database access
- API endpoints
- AI orchestration
- Notifications
- Safety event processing
- Community management
- Analytics
- Audit logging

The backend is the authoritative source for business rules and access control.

---

# 7. Backend Architectural Pattern

Use a modular layered architecture:

```text
HTTP Request
     |
     v
Route
     |
     v
Validation
     |
     v
Controller
     |
     v
Service
     |
     v
Model / Repository
     |
     v
MongoDB
```

For external services:

```text
Service
  |
  +--> AI Provider
  |
  +--> Storage Provider
  |
  +--> Notification Provider
```

## Responsibilities

### Route
Defines:
- HTTP method
- URL
- Middleware
- Controller

Routes should contain minimal logic.

### Validation
Validates:
- Request body
- Query parameters
- Route parameters

Invalid input must be rejected before business logic runs.

### Controller
Responsible for:
- Reading request data
- Calling service methods
- Returning HTTP responses

Controllers should not contain large business rules.

### Service
Contains:
- Business logic
- Authorization-related business checks
- Workflows
- External-service orchestration

### Model
Defines:
- MongoDB schema
- Indexes
- Database-level constraints where applicable

---

# 8. Backend Folder Structure

```text
server/
|
├── src/
|   |
|   ├── config/
|   |   ├── database.js
|   |   ├── env.js
|   |   └── cors.js
|   |
|   ├── middleware/
|   |   ├── auth.middleware.js
|   |   ├── role.middleware.js
|   |   ├── validation.middleware.js
|   |   ├── error.middleware.js
|   |   ├── notFound.middleware.js
|   |   └── requestLogger.middleware.js
|   |
|   ├── modules/
|   |   |
|   |   ├── auth/
|   |   ├── users/
|   |   ├── patients/
|   |   ├── caregivers/
|   |   ├── games/
|   |   ├── memories/
|   |   ├── reminders/
|   |   ├── community/
|   |   ├── meetings/
|   |   ├── notifications/
|   |   ├── analytics/
|   |   ├── safety/
|   |   └── ai/
|   |
|   ├── routes/
|   |   └── index.js
|   |
|   ├── utils/
|   |   ├── errors.js
|   |   ├── logger.js
|   |   └── response.js
|   |
|   ├── app.js
|   └── server.js
|
├── tests/
|
├── package.json
└── .env.example
```

Each module should be internally organized.

Example:

```text
community/
|
├── community.model.js
├── community.controller.js
├── community.service.js
├── community.routes.js
├── community.validation.js
└── community.test.js
```

A module should own its feature-specific business logic.

---

# 9. Module Ownership

The following boundaries should be maintained:

| Module | Responsibility |
|---|---|
| auth | Authentication and sessions |
| users | General user information and roles |
| patients | Patient-specific information |
| caregivers | Caregiver relationships and permissions |
| games | Cognitive games and game sessions |
| memories | Personal memories and familiar content |
| reminders | Reminder scheduling and tracking |
| community | Voting, sessions, registration |
| meetings | Meeting Circle |
| notifications | Notification creation and delivery |
| analytics | Activity and engagement analytics |
| safety | Location, geofencing, SOS, possible falls |
| ai | AI orchestration and AI-related business logic |

A module should not directly manipulate another module's database models unless an explicitly documented dependency requires it.

Prefer service-to-service interaction.

---

# 10. API Architecture

All APIs use:

```text
/api/v1
```

Examples:

```text
/api/v1/auth
/api/v1/users
/api/v1/patients
/api/v1/caregivers
/api/v1/games
/api/v1/memories
/api/v1/reminders
/api/v1/community
/api/v1/meetings
/api/v1/notifications
/api/v1/analytics
/api/v1/safety
/api/v1/ai
```

API versioning must be maintained consistently.

---

# 11. API Response Standard

Successful responses should follow a consistent structure.

Example:

```json
{
  "success": true,
  "data": {}
}
```

For lists:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

Errors:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found"
  }
}
```

Do not expose internal stack traces or sensitive implementation details to clients.

---

# 12. Authentication Architecture

Authentication will be handled by the backend.

Initial approach:

- Email/password authentication
- Password hashing with bcrypt
- Secure authentication/session mechanism
- HTTP-only cookies where applicable
- CSRF protection strategy for cookie-based authentication
- Secure logout
- Session/token expiration and rotation strategy

The exact session implementation must be finalized before authentication development.

Authentication must never be implemented independently by separate developers.

---

# 13. Authorization Architecture

Memora uses role-based access control plus relationship-based authorization.

Roles:

```text
PATIENT
CAREGIVER
ADMIN
HOST
```

Role checks alone are not sufficient.

Example:

```text
Caregiver A
     |
     X
     |
Patient B
```

Caregiver A must not access Patient B merely because the requester has the CAREGIVER role.

The backend must verify:

```text
authenticated user
       +
role
       +
relationship/ownership
       +
requested resource
```

This is especially important for:
- Memories
- Reminders
- Cognitive data
- Location
- SOS
- Fall events
- Personal information

---

# 14. Database Architecture

MongoDB is the primary database.

Mongoose is used as the ODM.

Applications must access MongoDB only through backend code.

Database schemas and indexes are documented separately in:

```text
docs/DATABASE.md
```

No developer should create an independent schema without updating the shared database specification.

---

# 15. Database Access Rules

Models should be accessed through the owning module's service layer.

Avoid:

```text
Controller -> Model -> Model -> Model
```

Prefer:

```text
Controller
    ↓
Service
    ↓
Required data access
```

Cross-module data access should be deliberate and documented.

---

# 16. Web Application Architecture

Suggested structure:

```text
apps/web/
|
├── src/
|   |
|   ├── app/
|   ├── components/
|   ├── features/
|   |   ├── auth/
|   |   ├── patient/
|   |   ├── caregiver/
|   |   ├── admin/
|   |   ├── games/
|   |   ├── memories/
|   |   ├── reminders/
|   |   ├── community/
|   |   ├── meetings/
|   |   ├── notifications/
|   |   ├── analytics/
|   |   └── ai/
|   |
|   ├── services/
|   ├── hooks/
|   ├── utils/
|   └── main.jsx
```

Feature-specific UI should stay inside its feature directory where practical.

Shared UI components belong in:

```text
components/
```

---

# 17. Patient UI Architecture

The patient UI should be treated differently from administrative interfaces.

Priorities:

1. Large controls
2. Minimal text
3. High contrast
4. Clear icons
5. Consistent placement
6. Voice interaction
7. Minimal navigation depth
8. Clear confirmation states
9. Accessibility

The patient interface should not expose unnecessary technical information.

---

# 18. Caregiver UI

The caregiver interface can provide more information than the patient UI.

Primary areas:

```text
Dashboard
|
├── Patients
├── Cognitive Activity
├── Memories
├── Reminders
├── Community
├── Meeting Circle
├── Safety
└── Notifications
```

All information must be filtered by backend authorization.

---

# 19. Admin UI

Admin functionality includes:

```text
Admin Dashboard
|
├── Users
├── Roles
├── Content
├── Cognitive Games
├── Community Proposals
├── Community Sessions
├── Registrations
├── Meeting Circle
├── Notifications
├── Safety Events
└── Audit Logs
```

Administrative permissions must be enforced on the backend, not only hidden in the frontend.

---

# 20. AI Architecture

AI functionality must be isolated behind the Memora backend.

Preferred architecture:

```text
Client
   |
   v
Memora Backend
   |
   v
AI Service
   |
   v
External AI Provider
```

The frontend/mobile app must never contain private AI provider API keys.

AI functionality may include:

- Voice assistant
- Natural-language interaction
- Personalized activity recommendations
- Cognitive-game personalization
- Memory assistance
- Regional-language support
- Community-session assistance

AI responses must be subject to product safety rules.

---

# 21. AI Safety Boundary

The AI must not:
- Diagnose dementia
- Claim to diagnose a medical condition
- Recommend unsafe medical treatment
- Present itself as a healthcare professional
- Replace professional medical care

AI prompts and responses should minimize exposure of sensitive personal data.

Only the information necessary for the requested AI task should be sent to an external provider.

---

# 22. Real-Time Architecture

Use Socket.IO where real-time communication is required.

Potential uses:

```text
SOS alerts
Caregiver safety alerts
Live safety status
Meeting Circle
Real-time notifications
Session status
```

General pattern:

```text
Mobile/Web
    |
 Socket.IO
    |
Backend
    |
Event/Service
```

REST APIs remain the default for ordinary CRUD operations.

Do not use WebSockets where ordinary HTTP is sufficient.

---

# 23. Notification Architecture

Notifications should be generated by backend services.

Conceptual flow:

```text
Event
  |
  v
Notification Service
  |
  +----> In-app notification
  |
  +----> Push notification
  |
  +----> Voice notification where applicable
```

Examples of triggering events:
- Reminder due
- Community session scheduled
- Registration confirmed
- Geofence exit
- SOS
- Possible fall
- Device offline
- Low battery

Notification delivery should be decoupled from the business operation where possible.

---

# 24. Safety Architecture

Safety functionality is treated as a separate high-reliability domain.

```text
Memora Mobile App
       |
       +--> Location
       +--> Geofence
       +--> SOS
       +--> Sensor data
       |
       v
Safety API
       |
       v
Safety Service
       |
       +--> Safety Event
       +--> Notification Service
       +--> Caregiver Dashboard
       +--> Audit Log
```

The safety system must:
- Record events
- Preserve timestamps
- Handle connectivity failures
- Report device status
- Avoid silently claiming that the patient is safe
- Restrict access to authorized caregivers/admins

---

# 25. Location Data Architecture

Location data is sensitive.

The system should support:
- Current/most recent location
- Timestamp
- Accuracy where available
- Location history according to configured retention requirements
- Geofence events

Location access must require authorization.

The system should avoid collecting more location history than necessary.

---

# 26. Geofencing Architecture

A geofence contains:

```text
Patient
Zone name
Center coordinates
Radius
Active status
Created by
```

Conceptual flow:

```text
Mobile Location
      |
      v
Safety Service
      |
      v
Geofence Evaluation
      |
   +--+--+
   |     |
Inside  Outside
         |
         v
    Safety Event
         |
         v
    Notification
```

The exact decision between device-side and server-side geofence evaluation will be finalized during safety implementation.

---

# 27. SOS Architecture

```text
Patient
  |
  v
Mobile SOS
  |
  v
Backend Safety API
  |
  +--> Create SOS Event
  |
  +--> Get latest location
  |
  +--> Notify authorized contacts
  |
  +--> Real-time caregiver alert
  |
  +--> Audit event
```

SOS state transitions must be explicitly defined.

Possible states:

```text
INITIATED
CONFIRMED
ACKNOWLEDGED
CANCELLED
RESOLVED
```

---

# 28. Fall Detection Architecture

The mobile application may process sensor data locally and identify a possible fall.

Potential sensors:
- Accelerometer
- Gyroscope
- Orientation

Conceptual flow:

```text
Sensors
   |
   v
Fall Detection Logic
   |
   v
Possible Fall
   |
   v
Patient Confirmation
   |
   +----> OK -> Cancel
   |
   +----> HELP -> Alert
   |
   +----> No response -> Configured escalation
```

This feature is a possible-fall detection system and must not claim guaranteed medical-grade detection.

Safety testing must include false positives and connectivity failures.

---

# 29. Community Session Architecture

Community Sessions contain two major stages.

```text
Community Proposal
        |
        v
Voting
        |
        v
Admin Approval
        |
        v
Scheduled Community Session
        |
        v
Pre-Registration
        |
        v
Session
```

The backend owns:
- Vote uniqueness
- Approval state
- Scheduling
- Capacity
- Registration
- Waiting list
- Session status

Frontend controls must never be treated as security boundaries.

---

# 30. Meeting Circle Architecture

Meeting Circle is separate from Community Sessions.

It may use:
- Voice communication
- Video communication
- Real-time presence
- Guided conversations
- Group activities

The exact video/voice provider and architecture will be decided before implementation.

---

# 31. File and Media Storage

Files such as:
- Patient photographs
- Memory images
- Guest images
- Game media

should not be stored directly inside MongoDB as large binary documents unless there is a specific reason.

Preferred pattern:

```text
Client
  |
  v
Backend
  |
  v
Secure Storage Provider
  |
  v
Media URL / Asset Reference
  |
  v
MongoDB
```

Stored database records should contain references and metadata.

Access to private patient media must be controlled.

---

# 32. Analytics Architecture

Analytics should consume application events rather than duplicate business logic.

Examples:

```text
Game Completed
Reminder Acknowledged
Community Vote
Session Registration
Session Attendance
Voice Interaction
SOS Event
Possible Fall Event
Geofence Event
```

Conceptual flow:

```text
Application Event
       |
       v
Analytics Service
       |
       v
Analytics Data
       |
       v
Caregiver/Admin Dashboard
```

Analytics are activity and engagement indicators, not medical diagnoses.

---

# 33. Audit Logging

Important administrative and security-sensitive actions should be auditable.

Examples:
- Role changes
- User activation/deactivation
- Community proposal approval
- Session scheduling
- Safety event handling
- Sensitive-data access where required
- Permission changes

Audit records should include appropriate:
- Actor
- Action
- Target/resource
- Timestamp
- Relevant metadata

Never store passwords, secrets, or unnecessary sensitive data in audit logs.

---

# 34. Configuration Management

Configuration must come from environment variables or controlled configuration files.

Examples:

```text
NODE_ENV
PORT
MONGO_URI
CLIENT_URL
AI_PROVIDER_KEY
STORAGE_PROVIDER_KEY
NOTIFICATION_PROVIDER_KEY
```

Secrets must never be committed to Git.

Commit:

```text
.env.example
```

Never commit:

```text
.env
```

---

# 35. Error Handling

All backend errors should pass through centralized error handling.

Conceptual flow:

```text
Route
  |
  v
Controller
  |
  v
Service
  |
  v
Error
  |
  v
Central Error Middleware
  |
  v
Standard JSON Error
```

Production responses must not expose:
- Stack traces
- Database internals
- Secrets
- Provider credentials
- Sensitive patient information

---

# 36. Validation

Every externally supplied input must be validated.

Validation applies to:
- Request body
- Query parameters
- Route parameters
- Uploaded files
- External webhook payloads

Validation should happen before business logic.

The exact validation library will be standardized during backend setup.

---

# 37. Security Architecture

Required security layers include:

```text
HTTPS
  |
Authentication
  |
Authorization
  |
Input Validation
  |
Business Rules
  |
Database Access
```

Additional controls:
- Helmet
- CORS
- Rate limiting
- Password hashing
- Secure cookies/session handling
- Secret management
- File upload restrictions
- Logging
- Audit trails
- Least-privilege access

---

# 38. Multi-Developer Architecture Rules

Because multiple developers and AI coding assistants will work simultaneously:

### Rule 1
One module has one owner during a task.

### Rule 2
Do not modify unrelated modules.

### Rule 3
Do not duplicate existing models, services, routes, or utilities.

### Rule 4
Database changes require updating `docs/DATABASE.md`.

### Rule 5
API changes require updating API documentation.

### Rule 6
Breaking architecture changes require team approval.

### Rule 7
Every feature is developed in its own Git branch.

### Rule 8
Every feature enters the shared branch through a Pull Request.

### Rule 9
Tests must pass before merge.

### Rule 10
AI-generated code must be reviewed by a human.

---

# 39. Git Branch Strategy

Recommended:

```text
main
  |
  └── develop
        |
        +── feature/authentication
        +── feature/patient-profile
        +── feature/cognitive-games
        +── feature/community-voting
        +── feature/reminders
        +── feature/mobile-safety
```

Do not develop directly on `main`.

Use descriptive branch names based on the task.

---

# 40. AI-Assisted Development Rules

Every Claude coding session must:

1. Read `CLAUDE.md`.
2. Read relevant architecture documentation.
3. Inspect existing code before creating files.
4. Identify existing implementations that can be reused.
5. Work only on the assigned task.
6. Avoid unnecessary dependencies.
7. Avoid architectural changes unless explicitly requested.
8. Add or update tests.
9. Run linting.
10. Report files changed.
11. Report assumptions.
12. Report unresolved issues.

Claude must not silently change:
- Database schema
- API contracts
- Authentication behavior
- Authorization rules
- Security policy
- Product requirements

---

# 41. Testing Architecture

Testing should exist at multiple levels.

## Unit Tests

Test:
- Services
- Utility functions
- Validation
- Business rules

## API/Integration Tests

Test:
- Routes
- Authentication
- Authorization
- Database interactions
- API contracts

## Frontend Tests

Test:
- Components
- Feature behavior
- API integration

## Mobile Tests

Test:
- Safety flows
- Permission handling
- SOS
- Location behavior
- Sensor behavior where practical

## End-to-End Tests

Test important user journeys:

```text
Register
-> Login
-> Patient dashboard
-> Play game
-> Receive reminder
-> Vote
-> Register for session
```

Safety flows should receive separate high-priority testing.

---

# 42. CI/CD Architecture

GitHub Actions should run on Pull Requests.

Minimum checks:

```text
Install dependencies
       |
       v
Lint
       |
       v
Unit tests
       |
       v
Integration/API tests
       |
       v
Build
```

A Pull Request should not merge when required checks fail.

---

# 43. Environment Architecture

Maintain separate environments:

```text
Development
     |
     v
Staging
     |
     v
Production
```

### Development
For individual developers.

### Staging
For integration testing.

### Production
For real deployment.

Production data must never be used casually for development.

---

# 44. Deployment Architecture

Initial deployment can use:

```text
Web Frontend
      |
      v
Backend API
      |
      +----> MongoDB Atlas
      |
      +----> AI Provider
      |
      +----> Media Storage
      |
      +----> Notification Provider
```

The exact hosting providers will be selected later.

---

# 45. Data Flow Example: Cognitive Game

```text
Patient
   |
   v
Web App
   |
   v
GET /api/v1/games
   |
   v
Game Service
   |
   v
MongoDB
   |
   v
Game List
   |
   v
Patient
   |
   v
Starts Game
   |
   v
POST /api/v1/games/:id/sessions
   |
   v
Game Service
   |
   v
Game Session
   |
   v
MongoDB
```

---

# 46. Data Flow Example: Community Voting

```text
Patient
   |
   v
Web App
   |
   v
POST /api/v1/community/proposals/:id/vote
   |
   v
Authentication
   |
   v
Authorization
   |
   v
Community Service
   |
   v
Vote Validation
   |
   v
CommunityVote
   |
   v
MongoDB
```

The database must enforce appropriate uniqueness constraints to prevent duplicate votes.

---

# 47. Data Flow Example: SOS

```text
Patient
   |
   v
Mobile App
   |
   v
SOS API
   |
   v
Safety Service
   |
   +----> Create SOS Event
   |
   +----> Location
   |
   +----> Notification Service
   |
   +----> Socket.IO
   |
   v
Caregiver Dashboard
```

---

# 48. Data Flow Example: AI Assistant

```text
Patient
   |
   v
Web/Mobile
   |
   v
AI API
   |
   v
AI Service
   |
   +----> Retrieve only required Memora data
   |
   +----> Construct controlled AI request
   |
   v
External AI Provider
   |
   v
AI Service
   |
   v
Safety/response processing
   |
   v
Patient
```

AI provider credentials remain on the backend.

---

# 49. Architecture Decision Rules

When choosing between two technical approaches:

1. Prefer the simpler solution.
2. Prefer existing project dependencies.
3. Prefer established patterns already used in Memora.
4. Prefer testability.
5. Prefer secure defaults.
6. Prefer minimal data collection.
7. Avoid premature microservices.
8. Avoid unnecessary infrastructure.
9. Document decisions that affect multiple modules.

Memora should begin as a modular monolith rather than a microservices system.

---

# 50. Modular Monolith Decision

The initial backend will be a **modular monolith**.

```text
One Backend
|
├── Auth Module
├── Patient Module
├── Game Module
├── Memory Module
├── Reminder Module
├── Community Module
├── Meeting Module
├── Notification Module
├── Analytics Module
├── Safety Module
└── AI Module
```

All modules run in one backend deployment initially.

This reduces:
- Infrastructure complexity
- Deployment complexity
- Local development complexity
- AI-generated integration problems

If the system later requires service separation, modules can be extracted deliberately.

---

# 51. Architecture Change Process

Any significant architecture change must:

1. Describe the problem.
2. Describe the proposed solution.
3. Identify affected modules.
4. Identify database/API impact.
5. Identify migration requirements.
6. Identify testing impact.
7. Update this document.
8. Obtain team approval.
9. Implement the change.

AI assistants must not independently make major architectural changes.

---

# 52. Current Implementation Order

The backend should be implemented in this order:

```text
B0 - Backend Foundation
 |
 v
B1 - Database Foundation
 |
 v
B2 - Authentication
 |
 v
B3 - Users / Patients / Caregivers
 |
 v
B4 - Cognitive Games
 |
 v
B5 - Memories
 |
 v
B6 - Reminders
 |
 v
B7 - Community Sessions
 |
 v
B8 - Meeting Circle
 |
 v
B9 - Notifications
 |
 v
B10 - Analytics
 |
 v
B11 - AI
 |
 v
B12 - Safety Backend
 |
 v
B13 - Mobile Safety App
 |
 v
Integration + Testing
```

Some modules can be developed in parallel after their contracts and dependencies are stable.

---

# 53. B0 Definition of Done

Before moving beyond B0:

- Node.js backend initialized
- Express configured
- MongoDB connection configured
- Environment configuration established
- `/api/v1/health` implemented
- Centralized error handling implemented
- Logging implemented
- CORS configured
- Helmet configured
- ESLint configured
- Prettier configured
- Testing configured
- Basic health test passes
- `.env.example` exists
- `.env` is ignored
- No feature-specific models have been created

---

# 54. Architecture Status

**STATUS: BASELINE FOR TEAM REVIEW**

This document defines the architecture baseline for Memora.

Related documents:

- `PROJECT_SPEC.md` - Product scope and requirements
- `DATABASE.md` - Database schemas, relationships, indexes and data rules

Next technical deliverable:

**`docs/DATABASE.md`**
