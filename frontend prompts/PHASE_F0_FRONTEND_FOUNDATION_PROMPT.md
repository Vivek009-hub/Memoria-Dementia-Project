# Memora - Phase F0 Prompt: Frontend Foundation

**Phase:** F0  
**Name:** Frontend Foundation  
**Prerequisites:** B0-B14 completed and integrated  
**Status:** Ready for implementation

## Objective

Build the foundational architecture for the Memora web frontend.

F0 is **not** the phase for building every feature page. Establish a clean, scalable frontend foundation that all later frontend phases can safely use.

Core architecture:

```text
Web UI
  ↓
Pages / Components / Layouts
  ↓
State + Services
  ↓
Central API Client
  ↓
Existing B0-B14 Backend
  ↓
Database / External Services
```

The frontend must consume the existing backend APIs and must not become a second backend.

---

# 1. READ FIRST

Before changing anything, read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/B14_INTEGRATION_REPORT.md
```

Then inspect the actual B0-B14 repository, including:

```text
Backend routes
Controllers
Services
Models
Authentication
Authorization
API response formats
Error formats
Existing frontend code, if any
```

Do not guess API contracts.

The actual backend implementation is the source of truth.

---

# 2. CRITICAL RULES

### Do not rewrite working code

If a frontend already exists, inspect it first. Preserve working implementation unless a verified problem requires a change.

### Do not add major features

F0 should establish infrastructure only:

```text
Frontend project
Routing
Central API client
Authentication state
State-management foundation
Error handling
Loading handling
Reusable component foundation
Layouts
Environment configuration
Basic design tokens
Testing foundation
```

Do not fully implement:

```text
Games
Memories
Reminders
Community
Meeting Circle
AI
Notifications
Safety
Caregiver dashboard
Admin dashboard
```

Those belong to later phases.

### Backend remains authoritative

The frontend must not independently implement authoritative:

```text
Authorization
Role permissions
Safety state
Geofence decisions
Reminder scheduling
Community approval
Meeting scheduling
Notification generation
Analytics calculations
AI provider access
```

### No direct database access

Never connect the browser directly to:

```text
MongoDB
MongoDB Atlas
Redis
Database server
```

Correct:

```text
Frontend → Backend API → Database
```

### No direct AI provider access

Never put AI provider credentials in the frontend.

Correct:

```text
Frontend → B11 API → AI Service → AI Provider
```

---

# 3. FRONTEND STACK

Inspect `PROJECT_SPEC.md` and the existing repository first.

If the project specifies:

```text
React
Vite
Tailwind CSS
DaisyUI
```

use that stack.

Do not switch frameworks without a documented reason.

If a frontend already exists, preserve its established framework unless it is genuinely broken.

---

# 4. FRONTEND LOCATION

Follow the existing repository structure.

If compatible, use:

```text
memora/
├── backend/
├── frontend/
├── mobile/
└── docs/
```

Do not unnecessarily move or reorganize the repository.

---

# 5. FRONTEND STRUCTURE

Establish a structure similar to:

```text
frontend/
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── config/
│   ├── hooks/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── services/
│   ├── state/
│   ├── localization/
│   ├── styles/
│   ├── utils/
│   ├── App.*
│   └── main.*
├── public/
└── package.json
```

Adapt this to the actual framework and existing project.

Do not create unnecessary empty abstractions.

---

# 6. CENTRAL API ARCHITECTURE

Create one canonical API layer.

Suggested structure:

```text
src/api/
├── client
├── authApi
├── gamesApi
├── memoriesApi
├── remindersApi
├── communityApi
├── meetingsApi
├── notificationsApi
├── analyticsApi
├── aiApi
└── safetyApi
```

Only create modules for APIs that actually exist.

---

# 7. CENTRAL API CLIENT

The central client should handle:

```text
Base URL
Authentication
Request handling
Response parsing
Timeouts
Error normalization
Token/session handling according to B2
```

Do not create separate HTTP clients inside individual feature components.

Avoid:

```text
Component A → fetch()
Component B → axios()
Component C → another API client
```

Prefer:

```text
Feature API modules
       ↓
Central API client
```

---

# 8. ENVIRONMENT CONFIGURATION

Use the project's existing frontend environment convention.

For Vite, this may be:

```text
VITE_API_BASE_URL
```

Create/update:

```text
.env.example
```

Never include real secrets.

Remember that frontend environment values are potentially public.

---

# 9. FRONTEND SECRETS

Never place these in frontend code or frontend configuration:

```text
Database credentials
JWT signing secrets
AI provider API keys
Backend private keys
Notification provider secrets
Server credentials
```

Anything shipped to a browser must be treated as potentially public.

---

# 10. ROUTING FOUNDATION

Create the routing architecture.

Possible routes:

```text
/
 /login
 /register
 /app
 /app/games
 /app/memories
 /app/reminders
 /app/community
 /app/meetings
 /app/assistant
 /app/notifications
 /app/safety
```

Only create placeholders where appropriate. Do not build complete feature pages yet.

---

# 11. PUBLIC ROUTES

Implement the appropriate public routes, such as:

```text
/
 /login
 /register
```

according to `PROJECT_SPEC.md`.

Unauthenticated users must not access protected application routes.

---

# 12. PROTECTED ROUTES

Create a reusable protected-route mechanism:

```text
Route requested
 ↓
Authentication resolved?
 ↓
Authenticated → render
Unauthenticated → public/login route
```

Frontend route protection is only a UX mechanism.

Backend authorization remains the real security boundary.

---

# 13. ROLE-BASED ROUTING FOUNDATION

Inspect the actual role architecture before implementing.

Possible roles may include:

```text
User
Patient
Caregiver
Admin
Teacher
Privilege User
```

Use only roles actually defined by the project.

The frontend may hide routes for usability, but backend authorization must remain authoritative.

---

# 14. AUTHENTICATION STATE

Create one canonical authentication state.

It may contain:

```text
isAuthenticated
currentUser
role
loading
```

or the equivalent required by the backend.

Do not create multiple independent auth systems.

Avoid:

```text
AuthContext
Redux auth
Zustand auth
local auth state
```

all representing the same thing.

Choose one architecture and document it.

---

# 15. SESSION RESTORATION

On startup:

```text
App starts
 ↓
Resolve existing session
 ↓
Fetch current user if required
 ↓
Restore auth state
 ↓
Render correct application
```

Avoid flashing protected content before authentication is resolved.

---

# 16. LOGOUT

Implement a centralized logout action.

It should:

```text
Call backend logout if applicable
Clear authentication state
Clear user-scoped client state
Redirect to public/login page
```

Do not leave private cached information visible after logout.

---

# 17. USER-SCOPED STATE

Any personal data cached on the client must be scoped to the authenticated user.

Examples:

```text
Memories
Notifications
Reminders
Analytics
Safety events
AI conversations
```

Avoid global caches that can leak data between accounts.

---

# 18. STATE MANAGEMENT

Inspect the project before selecting a state-management library.

If one is already specified, use it.

If none is specified, use the simplest suitable approach.

Separate conceptually:

```text
Authentication state
Server/API state
UI state
```

Do not put every piece of state into a global store.

---

# 19. ERROR HANDLING

Establish consistent handling for:

```text
400 Validation
401 Authentication
403 Authorization
404 Not Found
409 Conflict
429 Rate Limit
500 Server Error
Network Failure
Timeout
```

Do not expose raw stack traces.

---

# 20. USER-FRIENDLY ERROR MESSAGES

Convert technical backend errors into simple messages.

Example:

```text
RESOURCE_NOT_FOUND
```

becomes:

```text
"We couldn't find that information."
```

Do not expose internal implementation details.

---

# 21. GLOBAL ERROR BOUNDARY

Implement an application-level error boundary if appropriate for the chosen framework.

Provide a simple recovery state:

```text
Something went wrong.

[ Try Again ]
```

Do not display stack traces to normal users.

---

# 22. LOADING STATES

Establish reusable loading patterns for:

```text
Initial page loading
API requests
Button actions
Background refresh
```

Avoid indefinite loading indicators.

---

# 23. EMPTY STATES

Create a reusable empty-state pattern.

Example:

```text
No reminders today.
```

not:

```text
GET /api/v1/reminders returned 0 records.
```

---

# 24. RETRY PATTERN

Provide retry actions for recoverable errors.

Do not automatically retry destructive operations.

Use bounded retries where appropriate.

---

# 25. FORM FOUNDATION

Create reusable form patterns supporting:

```text
Validation
Field errors
Loading
Disabled state
Success feedback
```

Backend validation remains authoritative.

---

# 26. DATE/TIME FOUNDATION

Use one consistent approach to:

```text
Timestamps
Timezone conversion
Date formatting
Local display
```

Inspect backend conventions before implementing.

Do not create different date formats in different modules.

---

# 27. DESIGN FOUNDATION

Create a small centralized foundation for:

```text
Typography
Spacing
Border radius
Shadows
Breakpoints
Touch target sizes
```

Do not build the complete design system yet.

That belongs to F1.

---

# 28. MEMORA VISUAL DIRECTION

The frontend foundation should support a UI that is:

```text
Calm
Simple
Friendly
Readable
Accessible
Trustworthy
```

Avoid:

```text
Dense dashboards
Tiny controls
Excessive animation
Complex navigation
Visual clutter
```

---

# 29. ELDER-FRIENDLY FOUNDATION

Prepare reusable patterns for:

```text
Large buttons
Readable cards
Large icons
Clear labels
Simple navigation
High contrast
Voice controls
```

Complete patient-facing visual design belongs to F1.

---

# 30. ACCESSIBILITY FOUNDATION

Use:

```text
Semantic HTML
Keyboard navigation
Visible focus
Accessible labels
Proper headings
Appropriate ARIA
Color contrast
```

Do not use color as the only way to communicate state.

---

# 31. RESPONSIVE FOUNDATION

Support:

```text
Desktop
Tablet
Mobile browser
```

The native mobile app remains responsible for device-specific capabilities.

---

# 32. WEB VS MOBILE RESPONSIBILITIES

Web frontend:

```text
Patient portal
Caregiver dashboard
Admin dashboard
General interaction
```

Native mobile:

```text
Background location
Device sensors
Fall detection
Native safety functionality
```

Both communicate through the backend.

---

# 33. REUSABLE COMPONENT FOUNDATION

Create only genuinely reusable components.

Potential examples:

```text
Button
Input
Card
Modal
Dialog
Badge
Alert
Spinner
EmptyState
ErrorState
PageHeader
Navigation
```

Avoid creating dozens of abstractions with no real reuse.

---

# 34. LAYOUT FOUNDATION

Create layouts appropriate to the actual application:

```text
PublicLayout
PatientLayout
CaregiverLayout
AdminLayout
```

Only implement layouts that the existing role architecture requires.

---

# 35. FRONTEND API CONTRACT

Create:

```text
docs/FRONTEND_API_CONTRACT.md
```

For each API consumed by the frontend document:

```text
Endpoint
HTTP method
Authentication
Authorization
Request
Response
Errors
```

Use actual backend contracts.

Do not invent endpoints.

---

# 36. BACKEND CONTRACT VERIFICATION

Before implementing API modules:

1. Inspect backend routes.
2. Inspect controllers/services.
3. Verify request fields.
4. Verify response fields.
5. Verify status codes.
6. Verify authentication requirements.

Example:

Do not assume:

```text
GET /api/v1/memories
```

exists.

Verify it first.

---

# 37. AUTHENTICATION STORAGE

Follow the actual B2 architecture.

If the backend uses secure HTTP-only cookies, preserve that approach.

Do not introduce insecure token storage merely for convenience.

Do not store sensitive authentication data in localStorage without a documented architectural reason.

---

# 38. NO MOCK PRODUCTION DATA

Mock data may be used for:

```text
Unit tests
Development scaffolding
Component testing
```

but must not accidentally become production data.

Do not ship:

```text
Fake patients
Fake memories
Fake analytics
Fake notifications
Fake safety events
```

as real application data.

---

# 39. AI FOUNDATION

Create only the API/service foundation for B11.

Architecture:

```text
Frontend
 ↓
B11 API
 ↓
AI Service
 ↓
AI Provider
```

Never call the AI provider directly from the browser.

---

# 40. SAFETY FOUNDATION

Create only the API/navigation foundation needed by future safety UI.

Architecture:

```text
Web/Mobile
 ↓
B12 Safety API
 ↓
B9 Notifications
 ↓
Caregiver
```

Do not implement safety decisions in React.

---

# 41. NOTIFICATION FOUNDATION

Prepare the client for B9.

Architecture:

```text
B9
 ↓
Notification API
 ↓
Frontend
```

Do not create another notification backend.

---

# 42. LOCALIZATION FOUNDATION

Prepare for regional languages.

If compatible with the chosen stack, establish:

```text
localization/
├── en
└── hi
```

or the project's chosen localization format.

Do not translate every page in F0.

---

# 43. VOICE FOUNDATION

Do not build the complete voice assistant yet.

Only make sure the architecture can later support:

```text
Voice input
Text-to-speech
B11 AI
```

---

# 44. FRONTEND LOGGING

Logs must never expose:

```text
Passwords
Tokens
AI keys
Database credentials
Private memory content
Sensitive location data
```

Keep development logging useful but safe.

---

# 45. PERFORMANCE FOUNDATION

Avoid obvious problems such as:

```text
Duplicate dependencies
Repeated API calls
Unnecessary global state
Unnecessary rerenders
Huge initial bundles
```

Do not prematurely optimize feature pages that do not yet exist.

---

# 46. TESTING FOUNDATION

Use the project's existing testing tooling.

Prepare tests for:

```text
API client
Routing
Authentication
Error handling
Reusable components
```

Do not attempt complete feature coverage in F0.

---

# 47. API CLIENT TESTS

Test:

```text
Success
400
401
403
404
409
429
500
Network failure
Timeout
```

Verify error normalization.

---

# 48. ROUTING TESTS

Test:

```text
Public route
Protected route
Unauthenticated redirect
Authenticated access
Role-aware behavior
Unknown route
```

---

# 49. AUTH TESTS

Test:

```text
Login success
Login failure
Session restoration
Logout
Expired session
Unauthorized access
```

---

# 50. DEVELOPMENT BACKEND INTEGRATION

Connect the frontend to the real development backend.

Verify at least:

```text
Login
Current-user/session retrieval
Logout
One representative protected API
```

Do not rely on mocks once the real backend is available.

---

# 51. CORS

Verify the development frontend origin is correctly permitted by the backend.

Do not solve CORS by opening authenticated production APIs to:

```text
*
```

Use the project's legitimate frontend origins.

---

# 52. BROWSER CONSOLE

Check for:

```text
Unhandled exceptions
Network errors
Framework warnings
Missing keys
Failed imports
CORS errors
Authentication loops
```

Fix meaningful problems.

---

# 53. SECURITY FOUNDATION

Inspect frontend for:

```text
XSS
Unsafe HTML rendering
Unsafe URLs
Sensitive localStorage usage
Secrets in source
Secrets in bundle
```

If rich text is later displayed, use safe sanitization.

---

# 54. DOCUMENTATION

Create/update:

```text
docs/FRONTEND_ARCHITECTURE.md
docs/FRONTEND_API_CONTRACT.md
```

Document:

```text
Frontend structure
Routing
Authentication
API layer
State management
Error handling
Environment configuration
Accessibility foundation
Localization foundation
Testing
Multi-developer conventions
```

Update `CLAUDE.md` only where frontend development rules need to be recorded.

---

# 55. MULTI-DEVELOPER RULES

Future frontend developers must know:

```text
Where API calls go
Where pages go
Where components go
Where state goes
Where utilities go
How auth is accessed
How routes are protected
How errors are handled
How localization is accessed
```

Document these conventions.

The goal is to prevent:

```text
Developer A → one API client
Developer B → another API client
Developer C → another auth system
Developer D → random state management
```

---

# 56. NO DUPLICATE SYSTEMS

There must be one canonical:

```text
API client
Authentication state
Routing strategy
Error strategy
Localization strategy
```

unless the architecture explicitly requires otherwise.

---

# 57. GIT SAFETY

Before changes:

```bash
git status
```

Do not use destructive commands such as:

```bash
git reset --hard
git clean -fd
```

Do not overwrite another developer's work.

Preserve unrelated changes.

---

# 58. BACKEND CHANGES

F0 should primarily modify:

```text
Frontend
Frontend documentation
Minimal backend CORS/configuration only if required
```

If a backend defect blocks frontend development:

1. Document the issue.
2. Make the smallest safe fix.
3. Add a regression test.
4. Report it.

Do not rewrite B0-B14.

---

# 59. DEFINITION OF DONE

F0 is complete only when:

[ ] Existing frontend inspected  
[ ] Frontend stack verified  
[ ] Frontend structure established  
[ ] Central API client established  
[ ] Environment configuration established  
[ ] No frontend secrets  
[ ] Routing foundation implemented  
[ ] Public routes implemented  
[ ] Protected route foundation implemented  
[ ] Role-aware routing foundation implemented  
[ ] Authentication state established  
[ ] Session restoration implemented where required  
[ ] Logout implemented  
[ ] User-scoped client state established  
[ ] State-management approach documented  
[ ] Loading-state approach established  
[ ] Error-state approach established  
[ ] Global error boundary implemented where appropriate  
[ ] Reusable foundation components created  
[ ] Layout foundation created  
[ ] Responsive foundation created  
[ ] Accessibility foundation created  
[ ] Localization foundation created  
[ ] Date/time conventions established  
[ ] Frontend API contract documented  
[ ] Backend API contracts verified  
[ ] Real development backend connection tested  
[ ] Login tested  
[ ] Current-user/session retrieval tested  
[ ] Logout tested  
[ ] Representative protected API tested  
[ ] API error handling tested  
[ ] Routing tests added  
[ ] Authentication tests added  
[ ] Build passes  
[ ] Lint passes  
[ ] Tests pass  
[ ] Browser console reviewed  
[ ] CORS verified  
[ ] Frontend architecture documented  
[ ] Multi-developer conventions documented  
[ ] No major feature pages implemented  
[ ] No backend duplication introduced  
[ ] No direct database access  
[ ] No direct AI provider access  
[ ] No secrets committed  

---

# 60. FINAL REPORT

Create:

```text
docs/F0_FRONTEND_FOUNDATION_REPORT.md
```

Use:

```text
# Memora F0 Frontend Foundation Report

## Frontend Stack

## Repository Structure

## Existing Frontend Findings

## Files Created

## Files Modified

## Routing Architecture

## Authentication Architecture

## API Architecture

## State Management

## Error Handling

## Loading Handling

## Component Architecture

## Layout Architecture

## Accessibility Foundation

## Localization Foundation

## Environment Configuration

## Backend Integration

## Security Findings

## Tests Executed

## Test Results

## Lint Result

## Build Result

## Browser Console Findings

## CORS Findings

## Backend Changes

## Known Issues

## Recommendations for F1
```

---

# 61. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
Test result
Lint result
Build result
Development server result
Backend connectivity result
```

Do not claim success unless verified.

---

# 62. STOP CONDITION

After F0 is complete:

**STOP.**

Do not implement F1 automatically.

Do not build all feature pages.

Do not modify B0-B14 unnecessarily.

The next phase is:

```text
F1
Design System + Elder-Friendly UI
```

---

# FINAL PRINCIPLE

The F0 goal is:

```text
Create a stable frontend foundation
that multiple developers can safely build on
without creating another integration mess.
```

The desired development model is:

```text
Developer A → Games
Developer B → Memories
Developer C → Community
Developer D → AI
Developer E → Caregiver/Admin
Developer F → Safety

              ↓

        ONE FRONTEND
              ↓
        ONE API LAYER
              ↓
        ONE AUTH SYSTEM
              ↓
       ONE DESIGN SYSTEM
              ↓
        MEMORA BACKEND
```

Read first. Inspect first. Reuse first. Then implement.
