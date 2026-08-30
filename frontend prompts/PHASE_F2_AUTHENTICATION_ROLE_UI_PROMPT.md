# Memora - Phase F2 Prompt: Authentication & Role-Based Application UI

**Phase:** F2  
**Name:** Authentication + Role-Based Application UI  
**Prerequisites:** F0 Frontend Foundation and F1 Design System completed and verified  
**Status:** Ready for implementation

---

# OBJECTIVE

Build the actual authentication experience and role-aware application shell for the Memora web frontend.

F2 connects the frontend foundation created in F0/F1 to the existing B2 authentication and B3 user/role architecture.

The goal is:

```text
Public Website
      ↓
Register / Login
      ↓
Backend Authentication
      ↓
Authenticated User
      ↓
Role Resolution
      ↓
Correct Application Shell
      ↓
Patient / Caregiver / Admin / Other Authorized UI
```

F2 should make authentication and role-based navigation work end-to-end.

Do NOT build the complete feature pages yet.

Later phases will implement:

```text
Patient Dashboard
Games
Memories
Reminders
Community Sessions
Meeting Circle
AI Assistant
Notifications
Safety
Caregiver Dashboard
Admin Dashboard
Analytics
```

---

# 1. READ FIRST

Before changing anything, read:

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
```

If available, also inspect:

```text
docs/F2_*.md
B2 authentication implementation
B3 user/role implementation
```

Then inspect the actual frontend implementation from:

```text
F0
F1
```

Do not assume the documentation exactly matches the code.

The actual repository and backend implementation are the source of truth.

---

# 2. CRITICAL RULES

## Rule 1: Use the existing B2 authentication system

Do not create a second authentication system.

Inspect the actual backend implementation and consume it.

The frontend must adapt to:

```text
Actual login endpoint
Actual registration endpoint
Actual logout behavior
Actual session/token behavior
Actual current-user endpoint
Actual authentication errors
```

Do not invent endpoints.

---

## Rule 2: Backend authorization is authoritative

The frontend can:

```text
Hide unauthorized navigation
Protect UX routes
Redirect users
Display role-specific UI
```

But it must NOT be treated as the security boundary.

The backend must enforce:

```text
Authentication
Authorization
Role permissions
Ownership
```

---

## Rule 3: No secrets in the frontend

Never place:

```text
JWT signing secret
Database credentials
AI API keys
Private backend keys
Notification provider secrets
```

in frontend code.

---

## Rule 4: Preserve F0/F1 architecture

Reuse:

```text
Central API client
State architecture
Routing architecture
Design tokens
Reusable components
Error handling
Loading states
Localization
Accessibility
```

Do not create duplicate implementations.

---

# 3. AUTHENTICATION FLOW

Implement:

```text
Landing Page
    ↓
Login / Register
    ↓
Backend Authentication
    ↓
Authenticated Session
    ↓
Current User
    ↓
Role Resolution
    ↓
Role-appropriate Application
```

---

# 4. REGISTRATION PAGE

Build the Memora registration UI according to the actual B2 registration contract.

Use the actual required fields.

Do NOT assume fields.

Inspect backend validation first.

Possible fields may include:

```text
Name
Email
Password
Confirm Password
Role/profile information
```

Only display fields that the backend actually requires.

---

# 5. REGISTRATION UX

The registration form should provide:

```text
Clear labels
Large inputs
Password requirements
Validation feedback
Loading state
Success feedback
Error feedback
```

Follow F1 design-system conventions.

---

# 6. PASSWORD INPUT

Password fields should support:

```text
Secure input
Show/hide password
Clear validation
Accessible labels
```

Do not display passwords in plain text by default.

---

# 7. PASSWORD VALIDATION

Frontend validation may provide immediate feedback.

But backend validation remains authoritative.

Do not duplicate complex password policy logic unless it is explicitly required.

---

# 8. LOGIN PAGE

Build a simple elder-friendly login page.

Example:

```text
Welcome back

Email
[________________]

Password
[________________]

[      Login      ]

Forgot password?
```

Only implement password recovery if it exists in the actual backend.

---

# 9. LOGIN UX

Support:

```text
Loading
Invalid credentials
Network failure
Server failure
Successful login
```

Messages should be simple.

Avoid technical errors such as:

```text
JWT verification failed
```

Use:

```text
"We couldn't sign you in. Please check your details."
```

where appropriate.

---

# 10. AUTHENTICATION API

Create/use the centralized API modules:

```text
authApi.login()
authApi.register()
authApi.logout()
authApi.getCurrentUser()
```

Only expose methods that correspond to actual backend APIs.

---

# 11. SESSION MANAGEMENT

Use the authentication architecture implemented by B2.

If the backend uses:

```text
HTTP-only cookies
```

preserve that.

If it uses another secure mechanism, follow the existing implementation.

Do not introduce a competing token system.

---

# 12. CURRENT USER

After authentication, resolve the current user through the backend.

Conceptually:

```text
Login
 ↓
Authenticated session
 ↓
GET current user
 ↓
Store authenticated user state
```

Do not trust a client-provided role when the backend can provide the authoritative role.

---

# 13. AUTHENTICATION INITIALIZATION

When the application loads:

```text
App starts
 ↓
Authentication state = loading
 ↓
Resolve session
 ↓
Fetch current user if required
 ↓
Authenticated?
 ├── Yes → application
 └── No → public area
```

Do not render protected content before authentication has been resolved.

---

# 14. AUTH LOADING SCREEN

Create a simple loading state.

Example:

```text
Loading Memora...
```

Do not display a confusing blank screen.

---

# 15. LOGOUT

Implement centralized logout.

Flow:

```text
User taps Logout
 ↓
Backend logout if required
 ↓
Clear auth state
 ↓
Clear user-scoped frontend state
 ↓
Redirect to public/login page
```

---

# 16. LOGOUT FAILURE

If backend logout fails, follow the existing security architecture.

Do not leave the UI appearing authenticated indefinitely.

Document the chosen behavior.

---

# 17. SESSION EXPIRATION

Handle expired authentication.

Example:

```text
Session expired.

Please sign in again.
```

Then:

```text
Clear stale auth state
 ↓
Redirect to login
```

Avoid redirect loops.

---

# 18. AUTHENTICATION REDIRECTS

Implement predictable redirects.

Examples:

```text
Unauthenticated → /login

Authenticated user → appropriate application home

Authenticated admin → admin application

Authenticated caregiver → caregiver application

Authenticated patient → patient application
```

Use the actual role architecture from B3.

---

# 19. ROLE RESOLUTION

The backend is authoritative for roles.

The frontend should receive role information from the authenticated user/session.

Do not allow:

```text
User selects "Admin"
```

and then treat them as admin.

---

# 20. ROLE MODEL

Inspect B3 and use the actual roles.

Possible roles from the project history include:

```text
User
Patient
Caregiver
Admin
Teacher
Privilege User
```

Do NOT automatically implement all of these if the actual B3 implementation differs.

Use the repository's canonical role model.

---

# 21. ROLE-BASED APPLICATION SHELL

Create appropriate shells based on role.

Potential:

```text
PatientLayout
CaregiverLayout
AdminLayout
```

Additional layouts should only be created if required.

---

# 22. PATIENT SHELL

The patient shell should prioritize:

```text
Large controls
Simple navigation
Low cognitive load
Clear primary actions
Readable content
```

Possible navigation:

```text
Home
Games
Memories
Reminders
Community
Meetings
Assistant
Notifications
Safety
Profile
```

Do not build the complete feature pages in F2.

---

# 23. CAREGIVER SHELL

The caregiver shell may expose:

```text
Dashboard
Patients
Safety
Notifications
Activity
Profile
```

Use the actual backend permissions.

Do not expose patient data merely because the UI contains a caregiver route.

---

# 24. ADMIN SHELL

The admin shell may expose:

```text
Dashboard
Users
Content
Community
Meetings
Analytics
Notifications
Activity
Profile
```

Use actual backend permissions.

---

# 25. TEACHER / PRIVILEGED USERS

If the actual backend supports these roles, create the appropriate navigation foundation.

Do not invent functionality.

If role behavior is unclear, document it instead of guessing.

---

# 26. NAVIGATION VISIBILITY

Navigation should be role-aware.

Example:

```text
Patient
 → Patient navigation

Caregiver
 → Caregiver navigation

Admin
 → Admin navigation
```

Do not show every possible menu item to every user.

---

# 27. ROUTE GUARDS

Create reusable route guards.

Conceptually:

```text
ProtectedRoute
RoleRoute
```

Example:

```text
/protected
/admin/*
/caregiver/*
/patient/*
```

Use the actual routing architecture from F0.

---

# 28. ROUTE GUARD SECURITY

Remember:

```text
Frontend route guard ≠ backend authorization
```

Never rely on route guards to protect data.

---

# 29. UNAUTHORIZED UI

If an authenticated user attempts to access a route they should not use:

Display an appropriate:

```text
Access denied
```

or redirect to their authorized home.

Do not expose protected data before showing the error.

---

# 30. 404 PAGE

Create a simple 404 page.

Example:

```text
We couldn't find that page.

[ Go Home ]
```

---

# 31. 403 PAGE

Create a simple authorization error page where appropriate.

Example:

```text
You don't have access to this page.

[ Go Home ]
```

---

# 32. AUTHENTICATION ERRORS

Normalize backend authentication errors through the F0 API/error architecture.

Do not scatter custom error parsing throughout login/register components.

---

# 33. NETWORK ERRORS

If login fails because the server is unreachable:

```text
We couldn't connect to Memora.

Please try again.
```

Provide a retry action.

---

# 34. FORM VALIDATION

Validate:

```text
Required fields
Email format if applicable
Password confirmation
Known frontend constraints
```

Do not replace backend validation.

---

# 35. ACCESSIBILITY

Login/register must support:

```text
Keyboard navigation
Screen readers
Visible focus
Large controls
Accessible labels
Error association
```

---

# 36. PASSWORD VISIBILITY

The show/hide password control must:

```text
Have an accessible label
Be keyboard accessible
Clearly indicate current state
```

---

# 37. FORM FOCUS

When validation fails:

```text
Focus the first relevant error
```

where practical.

---

# 38. AUTHENTICATION SUCCESS

After successful authentication:

```text
Resolve current user
 ↓
Resolve role
 ↓
Initialize application shell
 ↓
Navigate to correct home
```

Do not require users to manually reload the page.

---

# 39. ROLE CHANGES

If an admin changes a user's role, the frontend should not assume its old role remains valid forever.

When appropriate:

```text
Refresh current-user/session state
```

and adapt navigation.

Backend authorization remains authoritative.

---

# 40. USER PROFILE FOUNDATION

Create the basic authenticated profile entry point.

F2 may implement:

```text
View basic profile
```

but do not build the full profile-management feature unless required.

---

# 41. ACCOUNT MENU

Create a reusable account menu containing appropriate actions such as:

```text
Profile
Logout
```

Additional actions only if supported.

---

# 42. NOTIFICATION ENTRY POINT

The authenticated shell may contain the notification entry point:

```text
🔔 Notifications
```

Do not implement the complete notification system in F2.

That belongs to the notification phase.

---

# 43. SAFETY ENTRY POINT

The patient shell may contain:

```text
🚨 Safety
```

or the appropriate safety navigation.

Do not implement B12 business logic in F2.

---

# 44. AI ENTRY POINT

The patient shell may contain:

```text
🤖 Assistant
```

Do not implement the complete AI interface in F2.

That belongs to the AI UI phase.

---

# 45. COMMUNITY ENTRY POINT

The patient shell may contain:

```text
🫂 Community
```

Do not implement voting/session logic in F2.

---

# 46. MEETING ENTRY POINT

The patient shell may contain:

```text
🤝 Meetings
```

Do not implement meeting functionality in F2.

---

# 47. GLOBAL AUTH STATE

Ensure all authenticated components can consistently determine:

```text
Current user
Authentication state
Role
Loading state
```

Use the architecture established in F0.

---

# 48. USER-SCOPED DATA CLEANUP

When switching users or logging out, clear user-scoped frontend state.

Examples:

```text
Cached memories
Cached notifications
Cached reminders
Cached AI conversations
Cached safety data
```

Do not allow one account's cached data to appear for another account.

---

# 49. MULTI-TAB AUTHENTICATION

If practical with the chosen authentication architecture, handle:

```text
Logout in another tab
Session expiration
Authentication changes
```

Do not introduce a complex synchronization mechanism unless needed.

---

# 50. AUTHENTICATION LOOP PROTECTION

Prevent:

```text
/login → /app → /login → /app
```

loops.

Authentication initialization must have a clear state machine.

---

# 51. AUTH STATE MACHINE

Use a clear conceptual state:

```text
INITIALIZING
     ↓
AUTHENTICATED
     or
UNAUTHENTICATED
```

Avoid ambiguous combinations such as:

```text
loading = false
user = null
isAuthenticated = true
```

---

# 52. ROLE STATE

Role should be derived from the authenticated user/session.

Avoid manually duplicating:

```text
user.role
globalRole
localRole
routeRole
```

unless the architecture requires it.

---

# 53. ACCESSIBILITY OF ROLE-SPECIFIC UI

Navigation changes must remain understandable.

Do not make role differences dependent only on subtle styling.

---

# 54. RESPONSIVE AUTH UI

Login/register pages must work on:

```text
Desktop
Tablet
Mobile browser
```

Do not create tiny forms on small screens.

---

# 55. ELDER-FRIENDLY AUTH UI

Use F1 principles:

```text
Large inputs
Large buttons
Simple wording
Minimal distractions
Clear errors
Visible actions
```

Do not put unnecessary marketing content around the login form.

---

# 56. LOCALIZATION

Authentication text should use the existing localization architecture.

Prepare for:

```text
English
Hindi
Other configured regional languages
```

Do not hardcode user-facing strings if localization is already established.

---

# 57. LANGUAGE SELECTION

If the project specification includes language selection, provide it in an accessible location.

Do not force a complex language setup flow.

---

# 58. VOICE

Do not implement voice login unless explicitly supported by the project.

F2 only needs to preserve architecture compatibility with future voice features.

---

# 59. SECURITY CHECK

Inspect authentication UI for:

```text
Secrets
Tokens
Passwords
Sensitive logs
Unsafe redirects
```

Never log passwords or authentication tokens.

---

# 60. OPEN REDIRECT PROTECTION

Do not blindly redirect users to arbitrary URLs supplied by query parameters.

Use an allowlisted internal route strategy.

---

# 61. API CONTRACT VERIFICATION

Before coding the auth API layer, verify:

```text
Actual login endpoint
Actual registration endpoint
Actual logout endpoint
Actual current-user endpoint
Request fields
Response fields
Status codes
Error structure
Cookie/token behavior
```

Document any discrepancies.

---

# 62. REAL BACKEND TEST

Use the real development backend.

Test:

```text
Register
 ↓
Database
 ↓
Login
 ↓
Session
 ↓
Current user
 ↓
Role
 ↓
Protected route
 ↓
Logout
```

Do not use only mocked auth.

---

# 63. ROLE TESTING

For every supported role test:

```text
Login
 ↓
Correct role
 ↓
Correct shell
 ↓
Correct navigation
 ↓
Protected route
```

---

# 64. AUTHORIZATION TESTING

At minimum verify:

```text
Patient cannot access admin UI/API
Unauthorized user cannot access caregiver UI/API
Caregiver cannot access unrelated patient data
```

The frontend tests should complement backend authorization tests.

---

# 65. EXPIRED SESSION TEST

Test:

```text
Authenticated user
 ↓
Session expires
 ↓
API request returns 401
 ↓
Frontend handles session expiry
 ↓
User returns to login
```

Avoid infinite retries.

---

# 66. BACKEND FAILURE TEST

Test:

```text
Backend unavailable
 ↓
Login
 ↓
Friendly error
 ↓
Retry
```

---

# 67. BROWSER CONSOLE

Check for:

```text
Unhandled exceptions
Authentication loops
Failed API calls
React/framework warnings
Accessibility warnings
CORS failures
```

Fix meaningful issues.

---

# 68. NETWORK INSPECTION

Verify browser requests:

```text
Use correct endpoint
Use correct method
Use correct credentials
Use correct body
Use correct headers
```

Do not send unnecessary sensitive data.

---

# 69. NO PASSWORD LEAKAGE

Verify passwords are:

```text
Never logged
Never placed in URL
Never stored in application state longer than needed
Never persisted in localStorage
```

---

# 70. NO TOKEN LEAKAGE

Verify authentication tokens/cookies are handled according to B2.

Do not expose tokens in:

```text
console.log
URL
analytics
error messages
UI
```

---

# 71. TESTING

Add tests for:

```text
Login
Registration
Logout
Session restoration
Protected routes
Role routes
401 handling
403 handling
Expired session
```

Use the existing F0 testing framework.

---

# 72. COMPONENT TESTS

Test major authentication components:

```text
LoginForm
RegisterForm
AuthLoading
ProtectedRoute
RoleRoute
AccountMenu
```

Use actual component names from the implementation.

---

# 73. INTEGRATION TESTS

At minimum test:

```text
Login → Current User → Role → Correct Shell
Logout → Public Area
Unauthorized Role → Denied
Expired Session → Login
```

---

# 74. BUILD

Run the actual frontend build command from `package.json`.

Do not invent scripts.

---

# 75. LINT

Run the actual lint command if available.

Fix meaningful lint errors.

---

# 76. NO FEATURE CREEP

Do not implement:

```text
Games
Memory CRUD
Reminder CRUD
Community voting
Meeting scheduling
AI chat
Safety logic
Analytics
```

in F2.

Only create navigation/entry points where required.

---

# 77. MULTI-DEVELOPER RULES

Document how future developers access:

```text
Current user
Role
Authentication state
Protected routes
API client
```

Future developers must reuse the F2 auth system.

Do not create a second auth mechanism inside feature pages.

---

# 78. GIT SAFETY

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

---

# 79. DEFINITION OF DONE

F2 is complete only when:

[ ] F0 inspected  
[ ] F1 inspected  
[ ] B2 authentication implementation inspected  
[ ] B3 role implementation inspected  
[ ] Actual auth API contracts verified  
[ ] Registration page implemented  
[ ] Login page implemented  
[ ] Form validation implemented  
[ ] Loading states implemented  
[ ] Friendly auth errors implemented  
[ ] Central auth API integrated  
[ ] Session restoration implemented  
[ ] Current-user retrieval implemented  
[ ] Logout implemented  
[ ] Session expiration handled  
[ ] Authentication initialization implemented  
[ ] Protected routes implemented  
[ ] Role-aware routes implemented  
[ ] Correct role shell selection implemented  
[ ] Patient shell foundation implemented  
[ ] Caregiver shell foundation implemented if required  
[ ] Admin shell foundation implemented if required  
[ ] Additional supported-role shell foundation implemented if required  
[ ] Unauthorized route handling implemented  
[ ] 404 page implemented  
[ ] 403 page implemented  
[ ] Account menu implemented  
[ ] User-scoped state cleanup implemented  
[ ] Responsive auth UI implemented  
[ ] Accessibility verified  
[ ] Localization architecture respected  
[ ] Real backend authentication tested  
[ ] Registration tested  
[ ] Login tested  
[ ] Current user tested  
[ ] Logout tested  
[ ] Role routing tested  
[ ] Unauthorized access tested  
[ ] Expired session tested  
[ ] Backend failure tested  
[ ] Browser console checked  
[ ] Network requests inspected  
[ ] No passwords logged  
[ ] No tokens exposed  
[ ] No secrets committed  
[ ] Component tests added  
[ ] Integration tests added  
[ ] Lint passes  
[ ] Tests pass  
[ ] Build passes  
[ ] Documentation updated  
[ ] No duplicate auth system created  
[ ] No major feature logic implemented  

---

# 80. FINAL REPORT

Create:

```text
docs/F2_AUTH_ROLE_UI_REPORT.md
```

Use:

```text
# Memora F2 Authentication & Role UI Report

## Authentication Architecture

## Backend Contract Used

## Registration

## Login

## Session Management

## Current User

## Logout

## Session Expiration

## Role Model

## Route Guards

## Patient Shell

## Caregiver Shell

## Admin Shell

## Other Supported Roles

## Error Handling

## Accessibility

## Localization

## Security Findings

## API Integration

## Files Created

## Files Modified

## Tests Executed

## Integration Tests

## Lint Result

## Build Result

## Browser Testing

## Known Issues

## Backend Changes

## Recommendations for F3
```

---

# 81. FINAL TERMINAL OUTPUT

At the end provide:

```bash
git status
git diff --stat
```

Also report:

```text
Registration result
Login result
Current-user result
Logout result
Session restoration result
Role routing result
Authorization result
Test result
Lint result
Build result
Development server result
```

Do not claim success unless verified.

---

# 82. STOP CONDITION

After F2 is complete:

**STOP.**

Do not automatically implement F3.

The next phase is:

```text
F3
Patient Dashboard + Core Patient UI
```

F3 will build the actual patient-facing home/dashboard experience on top of:

```text
F0 Frontend Foundation
F1 Design System
F2 Authentication + Role UI
```

---

# FINAL PRINCIPLE

F2 should produce:

```text
Public User
    ↓
Register / Login
    ↓
Authenticated Session
    ↓
Authoritative User
    ↓
Authoritative Role
    ↓
Correct Application Shell
```

while preserving:

```text
ONE authentication system
ONE API layer
ONE routing architecture
ONE role model
ONE design system
ONE backend authority
```

Do not solve authentication differently inside individual features.

Build the authentication foundation once and make every future Memora feature use it.
