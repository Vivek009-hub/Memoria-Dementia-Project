# Memora - Phase B2 Prompt: Authentication

**Phase:** B2  
**Name:** Authentication & Session Foundation  
**Prerequisites:** B0 Backend Foundation, B1 Database Foundation  
**Status:** Ready for implementation

---

# Objective

Implement the authentication foundation for Memora.

B2 must provide secure user authentication while keeping authorization and feature-specific business logic for later phases.

The target flow is:

```text
Client
   |
   v
Authentication API
   |
   v
Validate Input
   |
   v
Authentication Service
   |
   +----> User Model
   |
   +----> Session Model
   |
   v
Secure Authentication Session
```

At the end of B2, a user should be able to:

```text
Register
   ↓
Login
   ↓
Receive authenticated session
   ↓
Access /api/v1/auth/me
   ↓
Logout
   ↓
Session becomes invalid
```

---

# 1. READ FIRST

Before making any changes, read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
```

Also inspect the current implementation of:

```text
server/src/config/
server/src/middleware/
server/src/modules/users/
server/src/modules/patients/
server/src/modules/caregivers/
server/src/routes/
```

B0 and B1 have already been completed.

Do not rebuild them.

---

# 2. B2 SCOPE

B2 includes:

```text
Authentication
Registration
Login
Logout
Current-user endpoint
Password hashing
Session management
Authentication middleware
Basic authentication validation
Authentication tests
```

B2 does NOT include:

```text
Authorization policies
Patient APIs
Caregiver APIs
Games
Memories
Reminders
Community Sessions
Meeting Circle
Notifications
Analytics
AI
Location
Geofencing
SOS
Fall Detection
```

Do not implement unrelated features.

---

# 3. AUTHENTICATION STRATEGY

Use secure server-managed sessions.

The database already defines:

```text
sessions
```

Use the Session model rather than inventing a second authentication storage mechanism.

Preferred conceptual flow:

```text
Login
  |
  v
Verify email/password
  |
  v
Generate secure random session token
  |
  v
Store only a hash of the session token
  |
  v
Set secure HTTP-only cookie
  |
  v
Client makes authenticated request
  |
  v
Backend hashes supplied session token
  |
  v
Find valid session
  |
  v
Load user
```

Do NOT store raw session tokens in MongoDB.

Do NOT use localStorage for authentication tokens.

Do NOT expose authentication secrets to the frontend.

---

# 4. PASSWORD SECURITY

Use bcrypt for password hashing.

Rules:

- Never store plaintext passwords.
- Never return passwordHash to clients.
- Never log passwords.
- Never log authentication tokens.
- Never include passwords in errors.
- Never expose passwordHash through `/me`.
- Use a reasonable bcrypt cost factor.
- Do not invent a custom password hashing algorithm.

Password requirements should be reasonable and documented.

Do not make unnecessarily restrictive requirements that would harm usability.

---

# 5. SESSION SECURITY

Sessions must contain:

```text
userId
sessionTokenHash
expiresAt
createdAt
lastUsedAt
revokedAt
```

Use a cryptographically secure random token.

Store only its hash in MongoDB.

Session expiration must be enforced.

A revoked session must not authenticate.

An expired session must not authenticate.

Do not put the raw session token in logs.

---

# 6. AUTHENTICATION COOKIE

Use an HTTP-only cookie for the session token.

Cookie requirements should include secure defaults:

```text
httpOnly: true
secure: true in production
sameSite: appropriate configured value
```

The cookie name should be defined centrally rather than repeated throughout the application.

Do not hardcode environment-specific security behavior.

The implementation must work correctly in local development and production.

---

# 7. CSRF CONSIDERATION

Because authentication uses cookies, consider CSRF protection.

For B2:

1. Identify the CSRF risk.
2. Choose an appropriate protection strategy.
3. Document the decision.
4. Apply protection to state-changing authenticated requests where required.

Do not claim CSRF protection exists unless it is actually implemented.

If a complete CSRF mechanism requires infrastructure or frontend integration that is outside B2, clearly document the remaining requirement rather than pretending it is solved.

---

# 8. ENVIRONMENT VARIABLES

Inspect the existing `.env.example`.

Add only authentication-related configuration that is actually required.

Potential values:

```env
SESSION_SECRET=
SESSION_TTL=
COOKIE_NAME=
```

Do not blindly add environment variables that the implementation does not use.

Never commit real secrets.

---

# 9. REGISTER API

Implement:

```http
POST /api/v1/auth/register
```

Request:

```json
{
  "name": "Example User",
  "email": "user@example.com",
  "password": "secure-password"
}
```

Registration should:

1. Validate input.
2. Normalize email.
3. Check whether the email already exists.
4. Hash the password.
5. Create the User.
6. Create an authenticated session only if this behavior is explicitly selected and documented.
7. Return a safe user representation.

Never return:

```text
password
passwordHash
session token
```

---

# 10. ROLE DURING REGISTRATION

Do NOT allow the client to freely select privileged roles.

A registration request must NOT be able to create:

```text
ADMIN
```

or otherwise grant privileged permissions.

The default role should be defined by the product/authentication policy.

If the product requires a default role, use the role defined in the project specification.

Role assignment for privileged users belongs to later authorization/admin functionality.

---

# 11. LOGIN API

Implement:

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

Flow:

```text
Validate input
    ↓
Normalize email
    ↓
Find user
    ↓
Verify password
    ↓
Verify account is active
    ↓
Create session
    ↓
Set HTTP-only cookie
    ↓
Return safe user
```

For invalid credentials, use a generic authentication error.

Do not reveal whether:

```text
email does not exist
```

versus:

```text
password is incorrect
```

---

# 12. LOGOUT API

Implement:

```http
POST /api/v1/auth/logout
```

Flow:

```text
Read session cookie
      ↓
Find session
      ↓
Revoke session
      ↓
Clear cookie
      ↓
Return success
```

Logout should succeed safely even if the session is already invalid.

Do not expose session details.

---

# 13. CURRENT USER API

Implement:

```http
GET /api/v1/auth/me
```

For an authenticated request:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "...",
      "preferredLanguage": "...",
      "isActive": true
    }
  }
}
```

Do not return:

```text
passwordHash
sessionTokenHash
```

For an unauthenticated request, return the project's standard authentication error.

---

# 14. AUTHENTICATION MIDDLEWARE

Create:

```text
server/src/middleware/auth.middleware.js
```

The middleware should:

1. Read the authentication cookie.
2. Validate its presence.
3. Hash/resolve the token securely.
4. Find the session.
5. Verify expiration.
6. Verify it has not been revoked.
7. Load the associated user.
8. Verify the user is active.
9. Attach the authenticated user/session context to the request.
10. Continue to the next middleware.

Conceptually:

```text
Request
  |
  v
Session Cookie
  |
  v
Session Lookup
  |
  v
User Lookup
  |
  v
req.user
  |
  v
Protected Route
```

Do not implement role-based authorization middleware yet unless it is required solely to support the authentication tests.

Authorization belongs to the next phase.

---

# 15. AUTHENTICATION CONTEXT

Use a consistent request context.

For example:

```text
req.user
req.session
```

The exact shape should follow the existing architecture.

Do not attach unnecessary sensitive information.

---

# 16. VALIDATION

Use the project's chosen validation strategy.

Validate:

### Registration

```text
name
email
password
```

### Login

```text
email
password
```

Reject malformed requests before authentication logic runs.

Do not rely only on Mongoose validation.

---

# 17. USER ENUM AND EXISTING MODEL

Do not change the User schema casually.

Before modifying User:

1. Read DATABASE.md.
2. Inspect B1 implementation.
3. Determine whether authentication requires a schema change.
4. Make the smallest necessary change.
5. Update DATABASE.md if the schema actually changes.

Do not duplicate the User model.

---

# 18. SESSION MODEL

Inspect the existing Session model.

If it does not yet exist, implement it according to:

```text
docs/DATABASE.md
```

Do not create a second session collection.

Recommended fields:

```text
userId
sessionTokenHash
expiresAt
createdAt
lastUsedAt
revokedAt
deviceInfo
ipMetadata
```

Avoid storing unnecessary personal information.

---

# 19. SESSION EXPIRATION

Sessions must expire.

Use:

```text
expiresAt
```

and enforce it during authentication.

Consider a MongoDB TTL index where appropriate.

Do not rely solely on TTL deletion for authentication security.

An expired session must be rejected even if MongoDB has not physically deleted it yet.

---

# 20. RATE LIMITING

Authentication endpoints are security-sensitive.

If the project does not already have rate limiting:

Add an appropriate rate-limiting strategy for:

```text
POST /api/v1/auth/login
POST /api/v1/auth/register
```

Keep the configuration reasonable for development.

Do not introduce a large infrastructure system just for rate limiting.

---

# 21. ERROR HANDLING

Use the centralized error handling already established in B0.

Do not create random response formats.

Authentication errors should use consistent error codes.

Examples:

```text
VALIDATION_ERROR
INVALID_CREDENTIALS
UNAUTHORIZED
ACCOUNT_INACTIVE
SESSION_EXPIRED
```

Use the project's established error conventions if they already exist.

---

# 22. SECURITY LOGGING

Do not log:

```text
password
passwordHash
session token
sessionTokenHash
cookies
authentication headers
database credentials
```

You may log high-level authentication events if appropriate, such as:

```text
login success
login failure
logout
```

without exposing sensitive values.

---

# 23. TESTING

Authentication must have comprehensive tests.

At minimum:

## Registration

```text
✓ registers valid user
✓ normalizes email
✓ hashes password
✓ does not store plaintext password
✓ rejects duplicate email
✓ rejects invalid email
✓ rejects invalid password input
✓ does not allow privileged role assignment
```

## Login

```text
✓ logs in with correct credentials
✓ rejects incorrect password
✓ rejects unknown credentials
✓ rejects inactive user
✓ creates session
✓ sets authentication cookie
✓ does not expose session token
```

## Authentication Middleware

```text
✓ accepts valid session
✓ rejects missing session
✓ rejects expired session
✓ rejects revoked session
✓ rejects session for inactive user
✓ attaches authenticated user context
```

## Me

```text
✓ returns current user when authenticated
✓ rejects unauthenticated request
✓ does not expose passwordHash
```

## Logout

```text
✓ revokes session
✓ clears cookie
✓ invalidates future requests
✓ safely handles already-invalid sessions
```

---

# 24. TEST DATABASE

Do not run authentication tests against the production database.

Use an isolated test database.

The test setup must prevent test data from contaminating development or production data.

Do not use real patient information.

---

# 25. API TESTING

Use:

```text
Vitest
Supertest
```

Test the actual HTTP endpoints.

Important:

```text
register
→ login
→ me
→ logout
→ me should fail
```

This complete flow should be tested.

---

# 26. SECURITY TESTS

Include tests for:

```text
Password is never returned
Password hash is not returned
Session token is not returned
Invalid credentials use safe errors
Inactive users cannot authenticate
Expired sessions fail
Revoked sessions fail
Privileged roles cannot be self-assigned
```

---

# 27. DO NOT IMPLEMENT

Do NOT implement:

```text
Role-based authorization
Patient permissions
Caregiver permissions
Admin dashboard
Games
Memories
Reminders
Community
Meeting Circle
Notifications
Analytics
AI
Location
Geofencing
SOS
Fall Detection
```

B2 is authentication only.

---

# 28. API DOCUMENTATION

Document the authentication endpoints if API documentation exists.

Document:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

Include:
- Request format
- Response format
- Authentication requirements
- Error cases

Do not expose implementation secrets.

---

# 29. CODE ORGANIZATION

Use the existing modular structure.

Recommended:

```text
server/src/modules/auth/
├── auth.controller.js
├── auth.service.js
├── auth.routes.js
├── auth.validation.js
└── auth.test.js
```

If the existing architecture has a better established pattern, follow it rather than creating a parallel structure.

Keep authentication-specific logic inside the auth module.

---

# 30. DEPENDENCY RULE

Before installing anything:

1. Inspect package.json.
2. Check whether the dependency already exists.
3. Check whether an existing project utility solves the problem.
4. Only then install a new dependency.

Do not install duplicate libraries for the same purpose.

---

# 31. NO ARCHITECTURE CHANGES

Do NOT:

```text
Convert to microservices
Replace MongoDB
Replace Express
Replace Mongoose
Replace JavaScript
Replace the session architecture
Introduce Redis
Introduce Kafka
Introduce GraphQL
Introduce Kubernetes
```

unless explicitly approved.

---

# 32. FINAL VERIFICATION

Run:

```bash
npm test
npm run lint
npm run format:check
```

If a build command exists, run it.

Start the development server and manually verify:

```text
Register
   ↓
Login
   ↓
GET /auth/me
   ↓
Logout
   ↓
GET /auth/me → unauthorized
```

Verify MongoDB contains:

```text
User
Session
```

with the expected fields.

Verify no plaintext password or raw session token is stored.

---

# 33. FINAL REPORT

Return:

```text
B2 AUTHENTICATION REPORT

Implementation:
-

Files created:
-

Files modified:
-

Dependencies added:
-

Endpoints:
-

Authentication strategy:
-

Session strategy:
-

Cookie configuration:
-

Password hashing:
-

Validation:
-

Rate limiting:
-

CSRF strategy:
-

Security checks:
-

Tests:
-

Lint:
-

Formatting:
-

Database verification:
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

Do NOT proceed to B3.

---

# 34. B2 DEFINITION OF DONE

B2 is complete only when:

[ ] Registration works
[ ] Passwords are securely hashed
[ ] Login works
[ ] Secure session is created
[ ] Raw session token is never stored
[ ] Authentication cookie is HTTP-only
[ ] Logout revokes session
[ ] `/api/v1/auth/me` works
[ ] Authentication middleware works
[ ] Expired sessions are rejected
[ ] Revoked sessions are rejected
[ ] Inactive users cannot authenticate
[ ] Privileged roles cannot be self-assigned
[ ] Authentication input is validated
[ ] Authentication endpoints are rate-limited appropriately
[ ] CSRF strategy is documented/implemented as required
[ ] Sensitive authentication information is not logged
[ ] Password hash is never returned
[ ] Session token is never returned
[ ] Authentication tests pass
[ ] Lint passes
[ ] Formatting passes
[ ] No unrelated features were implemented
[ ] DATABASE.md remains consistent with implementation

Only after all applicable items pass should B2 be considered complete.

---

# 35. STOP CONDITION

After B2 is complete:

STOP.

Do not begin B3.

The next phase will be:

```text
B3 - Users / Patients / Caregivers
```

B3 will build the actual user relationships and protected patient/caregiver functionality on top of the authentication foundation.
