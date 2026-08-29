# Memora - Claude Development Instructions

**Project:** Memora  
**Purpose:** AI-powered cognitive care, memory assistance, community and safety platform  
**Current Phase:** B0 - Backend Foundation

---

# 1. Read Before Coding

Before making ANY change to the repository, read:

```text
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
```

If the task is related to a specific module, inspect that module's existing implementation before creating or modifying files.

These documents are the project's source of truth.

---

# 2. Project Source of Truth

The project has three primary specification documents:

```text
PROJECT_SPEC.md
    ↓
Product requirements

docs/ARCHITECTURE.md
    ↓
Technical architecture

docs/DATABASE.md
    ↓
Database architecture
```

Do not contradict these documents.

If a requirement is unclear:
- Do not silently invent a major behavior.
- State the ambiguity.
- Ask for clarification when necessary.
- For small implementation details, choose the simplest reasonable solution and document the assumption.

---

# 3. Core Development Principles

Always:

1. Inspect existing code before writing new code.
2. Reuse existing functionality where possible.
3. Keep changes focused on the assigned task.
4. Follow the existing architecture.
5. Follow the database specification.
6. Follow existing naming conventions.
7. Add tests for meaningful functionality.
8. Run tests after changes.
9. Run linting before creating a PR.
10. Keep commits focused.
11. Never commit secrets.
12. Never use real patient data during development.
13. Prefer simple solutions over unnecessary complexity.
14. Preserve backwards compatibility unless a breaking change is explicitly approved.

---

# 4. AI-Assisted Development Rules

Memora is being developed using multiple developers and AI coding assistants.

AI-generated code is not automatically trusted.

Claude must:

- Inspect the repository first.
- Read relevant documentation.
- Explain significant assumptions.
- Avoid duplicating existing implementations.
- Avoid unnecessary dependencies.
- Avoid unrelated refactoring.
- Avoid changing architecture without approval.
- Add or update tests.
- Run tests and linting.
- Report exactly what changed.
- Report unresolved issues.

Claude must NOT independently redefine product requirements.

---

# 5. Scope Control

Work only on the feature/task explicitly assigned.

For example, if the task is:

```text
Authentication
```

do not also implement:

```text
Games
AI
Safety
Notifications
```

unless explicitly requested.

Do not use a feature request as permission to redesign unrelated modules.

---

# 6. Current Phase: B0

The current phase is:

```text
B0 - Backend Foundation
```

B0 is infrastructure only.

## B0 Includes

- Node.js setup
- Express setup
- MongoDB connection configuration
- Mongoose configuration
- Environment configuration
- API versioning
- Health endpoint
- Basic middleware
- Error handling
- Logging
- CORS
- Helmet
- ESLint
- Prettier
- Vitest
- Supertest
- Basic tests

## B0 Does NOT Include

Do NOT implement:

- Authentication
- JWT
- Users
- Patients
- Caregivers
- Games
- Memories
- Reminders
- Community Sessions
- Meeting Circle
- Notifications
- Analytics
- AI
- Location tracking
- Geofencing
- SOS
- Fall detection

Do not create feature-specific database models during B0.

---

# 7. Backend Technology

The backend uses:

```text
Node.js
Express.js
JavaScript
ES Modules
MongoDB
Mongoose
```

Supporting tools may include:

```text
dotenv
helmet
cors
pino
pino-http
Vitest
Supertest
ESLint
Prettier
```

Do not introduce additional dependencies without a clear reason.

---

# 8. Backend Architecture

The backend is a modular monolith.

Conceptually:

```text
Client
   ↓
Route
   ↓
Validation
   ↓
Controller
   ↓
Service
   ↓
Model / Data Access
   ↓
MongoDB
```

Keep responsibilities separate.

## Routes

Routes define:
- HTTP methods
- URLs
- Middleware
- Controllers

Routes should contain minimal business logic.

## Controllers

Controllers:
- Read request data
- Call services
- Return responses

Controllers should not contain large business workflows.

## Services

Services contain:
- Business logic
- Workflows
- External-service orchestration
- Cross-entity operations

## Models

Models define:
- MongoDB schemas
- Validation where appropriate
- Indexes
- Database-related configuration

---

# 9. Backend Directory Structure

The intended backend structure is:

```text
server/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── patients/
│   │   ├── caregivers/
│   │   ├── games/
│   │   ├── memories/
│   │   ├── reminders/
│   │   ├── community/
│   │   ├── meetings/
│   │   ├── notifications/
│   │   ├── analytics/
│   │   ├── safety/
│   │   └── ai/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── tests/
├── package.json
└── .env.example
```

Do not create all feature modules just because they appear in this structure.

Create modules when implementation begins.

---

# 10. API Rules

All backend APIs use:

```text
/api/v1
```

Examples:

```text
/api/v1/auth
/api/v1/patients
/api/v1/games
/api/v1/memories
/api/v1/reminders
/api/v1/community
/api/v1/safety
/api/v1/ai
```

Do not create inconsistent API prefixes.

---

# 11. API Response Format

Successful response:

```json
{
  "success": true,
  "data": {}
}
```

List response:

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

Error response:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found"
  }
}
```

Do not expose stack traces or internal implementation details to clients.

---

# 12. Database Rules

MongoDB is accessed only through the backend.

Never:

```text
Frontend → MongoDB
Mobile → MongoDB
```

Always:

```text
Frontend → Backend → MongoDB
Mobile → Backend → MongoDB
```

Before modifying a database schema:

1. Read `docs/DATABASE.md`.
2. Inspect existing models.
3. Check dependencies.
4. Determine whether indexes change.
5. Determine whether existing data requires migration.
6. Update `docs/DATABASE.md` if the schema changes.
7. Add/update tests.

Never silently rename database fields.

Never silently remove fields.

Never create duplicate models.

---

# 13. Database Naming

Use singular PascalCase for Mongoose model names:

```text
User
PatientProfile
CaregiverRelationship
Game
GameSession
Memory
Reminder
CommunityProposal
CommunityVote
CommunitySession
SessionRegistration
Meeting
MeetingParticipant
Notification
ActivityEvent
Location
Geofence
SafetyEvent
AIInteraction
AuditLog
```

Use lowercase plural collection names.

Follow the conventions defined in `docs/DATABASE.md`.

---

# 14. Authentication and Authorization

When authentication is implemented:

- Passwords must be hashed.
- Passwords must never be stored in plaintext.
- Authentication must be handled by the backend.
- Authorization must be enforced server-side.
- Role checks are required where applicable.
- Resource ownership/relationship checks are also required.

Do not assume:

```text
User has role CAREGIVER
```

means:

```text
User can access every patient.
```

Caregiver access must be based on an authorized caregiver-patient relationship.

Sensitive resources require additional authorization.

---

# 15. Sensitive Data Rules

Memora may process sensitive information.

Treat these as sensitive:

```text
Patient information
Location
Emergency contacts
Memory content
Family photographs
Cognitive activity
Safety events
AI interaction data
```

Never:

- Log sensitive values unnecessarily.
- Expose sensitive data through public APIs.
- Send unnecessary patient data to external AI providers.
- Commit sensitive data to Git.
- Use real patient information for development/testing.

---

# 16. Secrets

Never commit:

```text
.env
API keys
database passwords
JWT secrets
private credentials
provider credentials
```

Commit only:

```text
.env.example
```

If a secret is accidentally exposed:
- Stop using it.
- Rotate/revoke it.
- Remove it from the repository/history as appropriate.
- Inform the team.

---

# 17. Logging Rules

Use structured logging.

Logs may contain:

```text
request ID
HTTP method
route
status
duration
timestamp
```

Do NOT log:

```text
passwords
tokens
API keys
database credentials
full patient locations
unnecessary personal data
```

---

# 18. Error Handling

Use centralized error handling.

Preferred flow:

```text
Route
 ↓
Controller
 ↓
Service
 ↓
Error
 ↓
Central Error Middleware
 ↓
Standard JSON Response
```

Do not create random error response formats in individual controllers.

---

# 19. Validation

All external input must be validated.

Validate:

- Request body
- Query parameters
- Route parameters
- File uploads
- External webhook payloads

Validation should happen before business logic.

Do not trust frontend validation as a security mechanism.

---

# 20. Security

Use secure defaults.

Required backend protections include:

- Helmet
- CORS configuration
- Rate limiting when authentication/public APIs are introduced
- Input validation
- Secure authentication
- Authorization
- Password hashing
- Secure secret handling
- File upload restrictions
- Audit logging where required

Security checks belong on the backend.

---

# 21. Patient Safety Features

Safety features are high-priority reliability features.

They include:

```text
Location
Geofencing
SOS
Possible Fall Detection
Device Status
Safety Alerts
```

Do not implement these features as medical-grade systems unless the project explicitly obtains the required validation, infrastructure, and professional oversight.

Never claim that fall detection is guaranteed.

Never claim that Memora provides emergency response unless the actual emergency infrastructure supports that claim.

---

# 22. AI Rules

AI functionality must remain behind the backend.

Correct:

```text
Client
 ↓
Memora Backend
 ↓
AI Service
 ↓
AI Provider
```

Incorrect:

```text
Client
 ↓
AI Provider using private API key
```

AI provider credentials must never be exposed to the frontend or mobile application.

AI must not:
- Diagnose dementia.
- Claim to diagnose a medical condition.
- Replace professional medical care.
- Provide unsafe medical instructions.

---

# 23. External Services

External providers may be used for:

- AI
- Media storage
- Push notifications
- Voice
- Video/meeting functionality

Wrap external providers behind services.

Example:

```text
community service
       ↓
notification service
       ↓
notification provider
```

Do not scatter provider-specific code across controllers.

---

# 24. Git Rules

Never work directly on:

```text
main
```

Use feature branches.

Example:

```text
feature/backend-foundation
feature/authentication
feature/patient-profile
feature/community-voting
feature/reminders
feature/safety-mobile
```

Before creating a branch, sync with the current target branch.

---

# 25. Pull Request Rules

Every meaningful feature should enter the shared branch through a Pull Request.

Before opening a PR:

```text
Tests pass
Lint passes
Formatting passes
Build passes where applicable
Documentation updated
No secrets
No unrelated changes
```

PR descriptions should explain:
- What changed
- Why it changed
- Tests performed
- Known limitations
- Database/API changes

---

# 26. Commit Rules

Prefer focused commits.

Good:

```text
feat(auth): add login endpoint
fix(reminders): prevent duplicate schedules
test(community): add duplicate vote test
chore(backend): configure eslint
```

Avoid:

```text
update stuff
changes
final
fixed everything
```

Do not mix unrelated features into one commit.

---

# 27. Multiple Developer Rules

Multiple developers may work simultaneously.

Each developer should own a clearly defined task.

Example:

```text
Developer A → Authentication
Developer B → Games
Developer C → Memories
Developer D → Community
```

Do not modify another developer's module without coordination.

If a shared file must be changed:
- Communicate first.
- Keep the change minimal.
- Coordinate the merge.

---

# 28. Multiple Claude Instance Rules

Multiple Claude sessions may work on Memora.

Every Claude instance must:

1. Read this file.
2. Read relevant project documentation.
3. Inspect existing code.
4. Identify existing implementations.
5. Work only within the assigned scope.
6. Avoid unrelated modifications.
7. Avoid duplicate files.
8. Avoid duplicate APIs.
9. Avoid duplicate database models.
10. Add tests.
11. Run tests.
12. Run linting.
13. Report changes.

Never assume that another Claude instance has implemented something.

Verify the repository.

---

# 29. Claude Task Protocol

For every non-trivial task, Claude should follow:

```text
1. Read documentation
        ↓
2. Inspect repository
        ↓
3. Identify dependencies
        ↓
4. Explain implementation plan
        ↓
5. Implement
        ↓
6. Run tests
        ↓
7. Run lint
        ↓
8. Check formatting
        ↓
9. Review changed files
        ↓
10. Report result
```

Before modifying shared architecture, stop and request approval.

---

# 30. No Silent Architecture Changes

Claude must not independently:

- Convert the backend to microservices.
- Change MongoDB to another database.
- Change React to another frontend framework.
- Replace REST APIs with GraphQL.
- Replace JavaScript with TypeScript.
- Introduce a new authentication architecture.
- Replace the mobile framework.
- Introduce major infrastructure.

Such changes require explicit team approval and documentation updates.

---

# 31. No Premature Optimization

Do not introduce:

- Redis
- Kafka
- RabbitMQ
- Kubernetes
- Microservices
- Complex event buses
- Distributed databases

unless a demonstrated requirement justifies them.

The initial architecture is a modular monolith.

Keep it simple.

---

# 32. Testing Rules

Meaningful functionality requires tests.

At minimum, test:

- Success cases
- Validation failures
- Authorization failures
- Important business rules
- Important database constraints
- Error handling

Critical constraints include:

```text
Duplicate community vote
Duplicate session registration
Unauthorized patient access
Unauthorized caregiver access
Invalid safety access
```

---

# 33. Definition of Done

A task is not complete merely because the code was generated.

A task is complete when:

```text
Implementation complete
        +
Tests added/updated
        +
Tests passing
        +
Lint passing
        +
Formatting valid
        +
Documentation updated if required
        +
No secrets
        +
No unrelated changes
```

---

# 34. Current Backend Milestones

The planned backend progression is:

```text
B0 - Backend Foundation
B1 - Database Foundation
B2 - Authentication
B3 - Users / Patients / Caregivers
B4 - Cognitive Games
B5 - Memories
B6 - Reminders
B7 - Community Sessions
B8 - Meeting Circle
B9 - Notifications
B10 - Analytics
B11 - AI
B12 - Safety Backend
B13 - Mobile Safety App
```

Do not skip directly to later milestones unless dependencies are complete.

---

# 35. B0 Definition of Done

B0 is complete when:

```text
☐ Node.js backend initialized
☐ Express configured
☐ MongoDB/Mongoose configured
☐ Environment configuration established
☐ /api/v1/health implemented
☐ Centralized error handling implemented
☐ 404 handling implemented
☐ Request logging implemented
☐ CORS configured
☐ Helmet configured
☐ ESLint configured
☐ Prettier configured
☐ Vitest configured
☐ Supertest configured
☐ Health endpoint tested
☐ .env.example created
☐ .env ignored
☐ No feature models created
```

---

# 36. B1 Database Foundation Definition

After B0, B1 will implement the first database entities according to `docs/DATABASE.md`.

Initial entities:

```text
User
PatientProfile
CaregiverRelationship
EmergencyContact
```

Then the remaining domain models will be implemented in dependency order.

Do not implement B1 during B0.

---

# 37. Final Rule

When uncertain, prefer:

```text
Existing architecture
        >
Simple implementation
        >
Minimal dependencies
        >
Small focused change
        >
Tests
```

Do not optimize for writing the most code.

Optimize for building a system that the entire team can understand, test, maintain, and safely extend.
