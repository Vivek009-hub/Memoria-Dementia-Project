# MEMORA - PATIENT PROFILE, LOCATION, EMERGENCY CONTACTS & CAREGIVER SYNC

## Non-Invasive Full-Stack Implementation Prompt

**Feature:** Patient Profile + Safety Information + Caregiver Connection + Permission-Based Sync

**Critical constraint:** Preserve the existing Memora frontend design. This is an implementation and integration task, NOT a frontend redesign.

---

# 1. OBJECTIVE

Implement a complete Patient Profile feature that allows an authenticated patient to:

1. View their profile information.
2. Edit permitted profile information.
3. View their current/last-known location.
4. Control location sharing where permitted.
5. Add, edit, and remove emergency contacts.
6. Connect their patient account with a caregiver account.
7. Accept/approve a caregiver connection securely.
8. View the caregiver connection status.
9. Control what information is shared with the caregiver.
10. Synchronize authorized information between the patient and caregiver accounts.
11. Keep private information private unless explicitly authorized by the existing product/safety architecture.

The implementation must integrate with the existing Memora backend and frontend.

Do NOT create a disconnected standalone feature.

---

# 2. CRITICAL FRONTEND PROTECTION RULE

The existing frontend design is approved.

Before making changes, inspect the current:

- design system
- patient dashboard
- caregiver dashboard
- safety page
- navigation
- profile-related components
- cards
- typography
- colors
- spacing
- responsive behavior
- accessibility system
- localization system

### DO NOT:

- redesign the application
- change the global theme
- change colors
- change typography
- change sidebar
- change header
- change navigation
- redesign the patient dashboard
- redesign the caregiver dashboard
- modify unrelated pages
- replace existing components unnecessarily
- create a second design system

### DO:

- reuse existing components
- reuse existing forms
- reuse existing cards
- reuse existing API client
- reuse existing authentication
- reuse existing authorization
- reuse existing notifications
- reuse existing realtime infrastructure
- reuse existing safety/location infrastructure
- make minimal frontend changes

**The existing frontend is the visual source of truth.**

---

# 3. READ THE EXISTING PROJECT FIRST

Before implementation, inspect:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/FRONTEND_ARCHITECTURE.md
docs/FRONTEND_API_CONTRACT.md
```

Also inspect relevant existing phase reports and implementations, especially:

```text
B0-B14
F0-F17
Patient Dashboard
Caregiver Dashboard
Safety & Emergency
Notifications
Authentication
Authorization
Location
Geofencing
Emergency Contacts
```

Search the repository for:

```text
patient
profile
caregiver
guardian
emergency
contact
location
geolocation
gps
geofence
safety
notification
permission
sharing
relationship
family
sync
realtime
```

---

# 4. DO NOT CREATE DUPLICATE ARCHITECTURE

If existing models/services already support:

```text
Patient
Caregiver
EmergencyContact
Location
SafetyEvent
Relationship
Permission
Notification
Realtime
```

reuse or extend them.

Do NOT create:

```text
PatientProfile2
CaregiverConnection2
EmergencyContact2
Location2
```

without a demonstrated architectural reason.

---

# 5. PATIENT PROFILE PAGE

Add a Patient Profile entry using the existing navigation system.

The page should conceptually contain:

```text
PROFILE

Profile information

Personal Information
--------------------
Name
Email
Phone
Other existing permitted fields

My Location
-----------
Current/last-known location
Last updated
Location sharing status

Emergency Contacts
------------------
Contact cards
+ Add Emergency Contact

My Caregiver
------------
Connection status
Connected caregiver
Manage connection

Privacy & Sharing
-----------------
Location sharing
Caregiver sharing permissions

[Edit Profile]
```

Use the existing Memora design system.

Do not copy the conceptual layout literally if the existing UI architecture has a better established pattern.

---

# 6. PROFILE DATA

Inspect the existing User/Patient model.

Use existing fields.

Only add fields that are genuinely required.

Potential information:

```text
name
profile photo
email
phone
preferred language
other already-supported profile fields
```

Do not introduce unnecessary sensitive fields.

---

# 7. PROFILE EDITING

Patients should be able to edit only fields permitted by the existing authorization/product rules.

Backend must validate changes.

Do not trust the frontend to enforce profile permissions.

---

# 8. CURRENT LOCATION

Integrate with the existing location/safety architecture.

The patient should be able to see:

```text
Current Location
or
Last Known Location

Last updated:
<time>

Location sharing:
Enabled / Disabled
```

If a map component already exists, reuse it.

If a map library already exists, reuse it.

Do not introduce a second mapping library unnecessarily.

---

# 9. LOCATION SOURCE

Inspect the existing location implementation first.

If location collection already exists:

```text
Reuse it.
```

If it does not exist, implement only the minimum required location architecture.

Do NOT continuously track the user's location simply because the Profile page is open.

Location collection should follow the existing safety/geofencing design.

---

# 10. CURRENT VS LAST-KNOWN LOCATION

Clearly distinguish:

```text
Current location
```

from:

```text
Last known location
```

because GPS/network/device availability may prevent real-time updates.

If the backend cannot guarantee a live location, do not label a stale coordinate as "Live".

---

# 11. LOCATION TIMESTAMP

Display the last update time.

Example:

```text
Last updated:
2 minutes ago
```

Use the actual backend timestamp.

Do not hardcode it.

---

# 12. LOCATION SHARING

If the product allows patient-controlled sharing, provide:

```text
Location sharing
[ON/OFF]
```

The backend must enforce the setting.

Do not treat a frontend toggle as security.

---

# 13. LOCATION PRIVACY

A caregiver must not automatically receive precise location unless:

```text
The relationship is active
AND
the caregiver has the required permission
```

Backend authorization must enforce this on every request.

---

# 14. EMERGENCY CONTACTS

Implement real emergency-contact management.

Patient can:

```text
View contacts
Add contact
Edit contact
Remove contact
```

where allowed.

---

# 15. EMERGENCY CONTACT DATA

Inspect existing emergency-contact schema first.

Conceptually:

```text
name
relationship
phone
secondary phone where required
priority
createdAt
updatedAt
```

Do not duplicate existing fields.

Only collect information necessary for the feature.

---

# 16. EMERGENCY CONTACT VALIDATION

Validate on both:

```text
Frontend
Backend
```

Validate:

```text
required name
valid phone
valid relationship if required
ownership
```

---

# 17. EMERGENCY CONTACT OWNERSHIP

Contacts must belong to the correct patient.

Patient A must not be able to modify:

```text
Patient B's emergency contacts
```

Test IDOR explicitly.

---

# 18. EMERGENCY CONTACT UI

Reuse existing card/form components.

Conceptually:

```text
Emergency Contacts

[Contact]
Name
Relationship
Phone

[Call] [Edit]

[+ Add Emergency Contact]
```

Do not redesign the global component system.

---

# 19. CAREGIVER CONNECTION

Implement a secure account-linking system.

Do NOT connect accounts merely because a patient enters an email address.

Preferred flow:

```text
Patient
 ↓
Connect Caregiver
 ↓
Generate secure invitation/code
 ↓
Caregiver receives invitation/code
 ↓
Caregiver authenticates
 ↓
Caregiver accepts
 ↓
Relationship becomes active
 ↓
Sharing permissions configured
 ↓
Sync begins
```

---

# 20. CONNECTION STATUS

Support clear states where required:

```text
NOT_CONNECTED
PENDING
CONNECTED
REVOKED
```

Reuse existing relationship states if available.

---

# 21. CONNECTION METHOD

Inspect the existing authentication/account-linking architecture.

Choose the safest approach compatible with it:

```text
Secure invitation
```

or:

```text
Short-lived pairing code
```

or:

```text
Invitation link
```

Do not create insecure account linking.

---

# 22. PAIRING CODE SECURITY

If using a code:

```text
Generate server-side
Short expiration
Single-use where appropriate
Rate limited
Associated with intended relationship
```

Do not use predictable IDs.

Do not use the patient's MongoDB ID as a pairing code.

---

# 23. INVITATION SECURITY

Do not expose unnecessary patient information before the caregiver authenticates and accepts the relationship.

Do not automatically connect two accounts.

Require explicit acceptance.

---

# 24. CAREGIVER ACCEPTANCE

Required flow:

```text
Caregiver logs in
 ↓
Views pending invitation
 ↓
Sees appropriate limited information
 ↓
Accepts
 ↓
Backend creates active relationship
 ↓
Permissions become active
 ↓
Both accounts reflect connection
```

---

# 25. PATIENT APPROVAL

If the existing safety/privacy policy requires mutual confirmation, implement:

```text
Patient approves
+
Caregiver accepts
=
Active relationship
```

Do not bypass existing authorization rules.

---

# 26. ONE PATIENT / MULTIPLE CAREGIVERS

Inspect the existing product requirements.

Do not assume a single caregiver unless the current architecture explicitly requires it.

If multiple caregivers are supported:

```text
Patient
 ├── Caregiver A
 ├── Caregiver B
 └── Caregiver C
```

Each relationship must have independent permissions.

If only one caregiver is supported, enforce that on the backend.

---

# 27. CAREGIVER PROFILE

Show only appropriate caregiver information to the patient.

Example:

```text
Connected Caregiver

Name
Relationship
Connection status

[Manage Connection]
```

Do not expose unnecessary caregiver account information.

---

# 28. SHARING PERMISSIONS

Do NOT synchronize everything automatically.

Create/reuse permission controls.

Conceptually:

```text
Caregiver Sharing

Basic Profile        ON
Emergency Contacts   ON
Current Location     OFF/ON
Reminders            OFF/ON
Activities            OFF/ON
Game Progress         OFF/ON
Meeting Circles       OFF/ON
AI Conversations      OFF
Private Memories      OFF
```

The exact categories must be reconciled with the existing Memora product/privacy architecture.

---

# 29. DEFAULT PERMISSIONS

Use the safest existing product defaults.

Sensitive information should not be shared by default unless required by the project's explicit safety requirements.

Do not expose:

```text
AI conversations
private memories
private communications
```

by default.

---

# 30. PERMISSION STORAGE

Store sharing permissions server-side.

Do not rely on:

```text
localStorage
frontend state
cookies
```

for authorization.

---

# 31. PERMISSION CHECK

Every caregiver data request must check:

```text
Authenticated caregiver
        ↓
Relationship exists
        ↓
Relationship active
        ↓
Requested permission enabled
        ↓
Allow
```

Do not assume that because two accounts are connected, all data is accessible.

---

# 32. CAREGIVER DASHBOARD SYNC

Integrate authorized patient information into the EXISTING caregiver dashboard.

Do NOT redesign the caregiver dashboard.

Reuse existing dashboard cards/components.

Potential synchronized information:

```text
Patient profile
Location
Emergency contacts
Reminders
Activities
Game progress
Safety status
```

Only show data for which permission exists.

---

# 33. SYNC ARCHITECTURE

The backend is the source of truth.

Correct:

```text
Patient
 ↓
Memora Backend
 ↓
Permission Layer
 ↓
Caregiver
```

Do NOT implement:

```text
Patient browser
     ↕
Caregiver browser
```

as the source of truth.

---

# 34. REALTIME SYNC

If existing realtime infrastructure exists:

```text
Reuse it.
```

Potential flow:

```text
Patient changes allowed data
 ↓
Backend updates
 ↓
Realtime event
 ↓
Caregiver dashboard updates
```

If realtime is not necessary for a particular field, normal API refresh is acceptable.

Do not create duplicate websocket infrastructure.

---

# 35. LOCATION REALTIME SYNC

If live location sharing is explicitly supported:

```text
Patient device
 ↓
Location update
 ↓
Backend
 ↓
Permission check
 ↓
Caregiver
```

Use existing realtime infrastructure if available.

Do not stream location unnecessarily when sharing is disabled.

---

# 36. LOCATION UPDATE FREQUENCY

Do not implement aggressive GPS polling without a product requirement.

Use the existing safety/geofencing location strategy.

Optimize for:

```text
Battery
Network usage
Privacy
Accuracy
Safety
```

---

# 37. EMERGENCY CONTACT SYNC

If the caregiver has permission:

```text
Patient updates emergency contact
 ↓
Backend
 ↓
Caregiver view reflects change
```

The caregiver should not receive changes if permission is disabled.

---

# 38. REMINDER SYNC

If enabled by the existing sharing architecture:

```text
Patient reminder
 ↓
Backend
 ↓
Permission check
 ↓
Caregiver dashboard
```

Do not duplicate the reminder database.

---

# 39. GAME/PROGRESS SYNC

If enabled:

```text
Patient activity/result
 ↓
Backend
 ↓
Permission check
 ↓
Caregiver progress view
```

Do not create duplicate game-result storage.

---

# 40. NOTIFICATION INTEGRATION

Reuse the existing notification system.

Potential notifications:

```text
Caregiver invitation received
Connection accepted
Connection revoked
Sharing permission changed
Emergency contact changed
```

Do not create a second notification architecture.

---

# 41. CONNECTION REVOCATION

Patient should be able to revoke the caregiver connection where permitted.

Flow:

```text
Patient
 ↓
Disconnect caregiver
 ↓
Backend authorization
 ↓
Relationship revoked
 ↓
Caregiver loses access
 ↓
Relevant notification
```

The revocation must take effect server-side immediately.

---

# 42. CAREGIVER DISCONNECTION

If product rules allow caregivers to disconnect themselves:

```text
Caregiver
 ↓
Disconnect
 ↓
Relationship revoked
 ↓
Patient notified
```

Use existing relationship rules.

---

# 43. ACCESS AFTER REVOCATION

Test:

```text
Connected
 ↓
Caregiver accesses location
 ↓
Patient revokes connection
 ↓
Caregiver requests location again
 ↓
DENIED
```

This is mandatory.

---

# 44. IDOR PROTECTION

Test:

```text
Caregiver A
 ↓
Changes patientId in request
 ↓
Attempts to access Patient B
 ↓
DENIED
```

Test this for:

```text
Profile
Location
Emergency contacts
Reminders
Progress
Safety information
AI-related data
```

---

# 45. AUTHORIZATION

Never authorize based solely on:

```text
patientId
caregiverId
relationshipId
```

sent by the client.

Derive the authenticated identity server-side and validate the relationship.

---

# 46. PRIVACY

The following should be treated as sensitive:

```text
Precise location
Safety events
Emergency information
Private memories
AI conversations
Personal communications
```

Do not expose them to the caregiver unless explicitly authorized by the product architecture.

---

# 47. AI CONVERSATION PRIVACY

Caregiver access to the patient's AI conversations must be:

```text
OFF by default
```

Do not synchronize AI conversations simply because the accounts are connected.

If the existing product specifically requires caregiver access, implement a separate explicit permission and audit it carefully.

---

# 48. PROFILE DATA PRIVACY

Only expose fields appropriate for the caregiver.

Do not return the full patient database record to the caregiver frontend.

Return only the fields required by the current screen.

---

# 49. API DESIGN

Reuse existing API conventions.

Conceptual APIs may include:

```text
GET    /profile
PATCH  /profile

GET    /emergency-contacts
POST   /emergency-contacts
PATCH  /emergency-contacts/:id
DELETE /emergency-contacts/:id

POST   /caregiver-connections/invite
GET    /caregiver-connections
POST   /caregiver-connections/:id/accept
POST   /caregiver-connections/:id/revoke

GET    /profile/location
PATCH  /profile/location-sharing

GET    /caregiver/patient-profile
GET    /caregiver/patient-location
GET    /caregiver/patient-emergency-contacts
```

These are conceptual only.

Inspect the existing backend and reuse existing routes where equivalent functionality already exists.

Do not create duplicate endpoints.

---

# 50. FRONTEND API INTEGRATION

The existing patient profile page should call the Memora backend.

Do not connect directly to MongoDB.

Do not connect directly to internal services from React.

Correct:

```text
React
 ↓
Memora API
 ↓
Backend
 ↓
Database/services
```

---

# 51. LOCATION MAP SECURITY

If a map provider requires a client-side public key, use the provider's documented public-key architecture.

Do not expose server secrets.

Do not place private location API credentials in frontend code.

---

# 52. CURRENT LOCATION ERROR STATES

Handle:

```text
Location unavailable
Permission denied
GPS unavailable
Network unavailable
Location stale
Backend unavailable
```

Do not show fake coordinates.

---

# 53. EMERGENCY CONTACT ERROR STATES

Handle:

```text
Invalid phone
Duplicate contact if prohibited
Unauthorized edit
Network error
Delete failure
```

---

# 54. CAREGIVER CONNECTION ERROR STATES

Handle:

```text
Invalid invitation
Expired code
Already connected
Invitation already used
Unauthorized acceptance
Connection revoked
Rate limit
Network failure
```

---

# 55. NO MOCK DATA

Search the implementation for:

```text
mock
dummy
fake
hardcoded
placeholder
sample patient
sample caregiver
sample location
```

Do not use mock data in production flows.

---

# 56. NO FRONTEND-ONLY PERMISSIONS

Never implement:

```text
if (canViewLocation) show location
```

as the actual security mechanism.

Frontend visibility is UX.

Backend authorization is security.

---

# 57. AUDIT LOGGING

If the existing project has an activity/audit-log system, reuse it for sensitive actions such as:

```text
Caregiver connected
Caregiver disconnected
Location sharing changed
Sharing permission changed
Emergency contact changed
```

Do not log sensitive data unnecessarily.

---

# 58. SECURITY LOGGING

Never log:

```text
pairing secrets
invitation tokens
authentication tokens
API keys
precise location unnecessarily
full private AI conversations
```

---

# 59. ACCESSIBILITY

Follow the existing F16 accessibility implementation.

Ensure:

```text
Forms have labels
Buttons have accessible names
Toggle states are announced
Errors are clear
Map has an accessible fallback
Connection status is readable
Emergency contacts are accessible
```

Do not redesign the accessibility system.

---

# 60. LOCALIZATION

Use the existing localization system for:

```text
Profile
Location
Emergency Contacts
Caregiver
Connected
Pending
Disconnected
Sharing Permissions
```

Do not hardcode new UI strings if localization infrastructure already exists.

---

# 61. RESPONSIVENESS

Reuse the existing responsive system.

Test:

```text
Desktop
Tablet
Mobile
```

Do not change global responsive breakpoints unless absolutely necessary.

---

# 62. TESTING: PROFILE

Test:

```text
View profile
Edit profile
Invalid profile update
Unauthorized profile update
```

---

# 63. TESTING: LOCATION

Test:

```text
Location available
Location unavailable
Stale location
Sharing enabled
Sharing disabled
Caregiver with permission
Caregiver without permission
Revoked caregiver
```

---

# 64. TESTING: EMERGENCY CONTACTS

Test:

```text
Create
Read
Update
Delete
Invalid input
Cross-user access
```

---

# 65. TESTING: CAREGIVER CONNECTION

Test:

```text
Generate invitation
Accept invitation
Expired invitation
Invalid invitation
Already-connected account
Unauthorized acceptance
Connection status
Revoke connection
Access after revocation
```

---

# 66. TESTING: SYNC

Test:

```text
Patient changes permitted profile data
 ↓
Caregiver sees update
```

Test:

```text
Patient changes non-permitted data
 ↓
Caregiver does NOT see it
```

---

# 67. TESTING: LOCATION SYNC

Where live sharing exists:

```text
Patient location changes
 ↓
Backend receives update
 ↓
Authorized caregiver sees updated location
```

Also test:

```text
Sharing disabled
 ↓
Caregiver cannot retrieve new location
```

---

# 68. CONCURRENT / RACE CONDITIONS

Test:

```text
Patient revokes caregiver
while caregiver requests patient data
```

Expected:

```text
No unauthorized data access.
```

Also test simultaneous permission changes and data requests.

---

# 69. CROSS-USER SECURITY

Create:

```text
Patient A
Patient B
Caregiver A
Caregiver B
```

Verify:

```text
Caregiver A → Patient A = allowed according to permissions
Caregiver A → Patient B = denied
Caregiver B → Patient A = denied
```

---

# 70. BACKEND TESTING

Test:

```text
Authentication
Authorization
Relationship validation
Permission validation
IDOR
Input validation
Invitation expiration
Revocation
Location access
Emergency-contact ownership
```

---

# 71. FRONTEND TESTING

Test:

```text
Profile loading
Profile editing
Emergency contact forms
Caregiver connection flow
Permission controls
Location display
Loading states
Error states
Responsive behavior
```

---

# 72. END-TO-END TEST

Run the complete workflow:

```text
Patient logs in
 ↓
Opens Profile
 ↓
Views profile information
 ↓
Views location
 ↓
Views emergency contacts
 ↓
Creates caregiver invitation
 ↓
Caregiver logs in
 ↓
Accepts invitation
 ↓
Relationship becomes active
 ↓
Permissions configured
 ↓
Patient updates permitted information
 ↓
Caregiver sees synchronized information
 ↓
Patient disables location sharing
 ↓
Caregiver can no longer access location
 ↓
Patient revokes caregiver
 ↓
Caregiver loses access
```

---

# 73. FRONTEND CHANGE LIMIT

At the end, list every frontend file changed.

For each file state:

```text
Why it changed
What changed
Why the existing design was preserved
```

If a frontend file did not need to change, leave it untouched.

---

# 74. DO NOT MODIFY UNRELATED FEATURES

Do not redesign or rewrite:

```text
AI Assistant
Meeting Circle
Cognitive Games
Memory Assistance
Reminders
Community Sessions
Safety UI
Admin Dashboard
Analytics
```

unless a direct integration is required.

Even then, make the smallest possible change.

---

# 75. DOCUMENTATION

Create/update:

```text
docs/PATIENT_PROFILE_ARCHITECTURE.md
docs/CAREGIVER_CONNECTION_API.md
docs/PATIENT_CAREGIVER_SYNC.md
docs/PATIENT_PROFILE_TEST_REPORT.md
```

Document:

```text
Profile architecture
Location architecture
Emergency contacts
Caregiver relationship
Pairing/invitation flow
Permissions
Synchronization
Authorization
Privacy
Realtime behavior
Testing
```

---

# 76. FINAL SECURITY CHECKLIST

[ ] Patient identity derived from authentication  
[ ] Caregiver identity derived from authentication  
[ ] Relationship checked server-side  
[ ] Sharing permissions checked server-side  
[ ] IDOR protection tested  
[ ] Location protected  
[ ] Emergency contacts protected  
[ ] Private AI conversations protected  
[ ] Revocation immediately removes access  
[ ] Invitation is secure  
[ ] Invitation expires  
[ ] Pairing cannot be guessed  
[ ] Sensitive tokens not logged  
[ ] API secrets not exposed  
[ ] Cross-user access rejected  

---

# 77. FINAL DEFINITION OF DONE

[ ] Patient Profile page implemented  
[ ] Existing frontend design preserved  
[ ] Existing navigation reused  
[ ] Existing components reused  
[ ] Profile information works  
[ ] Profile editing works  
[ ] Current/last-known location works  
[ ] Location timestamp works  
[ ] Location sharing works where required  
[ ] Emergency contacts CRUD works  
[ ] Emergency contact ownership enforced  
[ ] Caregiver invitation works  
[ ] Caregiver acceptance works  
[ ] Connection status works  
[ ] Sharing permissions work  
[ ] Backend authorization works  
[ ] Caregiver dashboard receives authorized data  
[ ] Sync works  
[ ] Realtime reused where available  
[ ] Location sync works where supported  
[ ] Revocation works  
[ ] Access after revocation is denied  
[ ] Cross-user access denied  
[ ] IDOR tests pass  
[ ] No mock data  
[ ] No placeholder implementation  
[ ] Accessibility preserved  
[ ] Localization preserved  
[ ] Responsive design preserved  
[ ] Backend tests pass  
[ ] Frontend tests pass  
[ ] Integration tests pass  
[ ] E2E tests pass  
[ ] Build passes  
[ ] Lint passes  
[ ] Documentation updated  
[ ] No secrets committed  

---

# 78. FINAL REPORT

Return:

```text
PATIENT PROFILE + CAREGIVER SYNC: COMPLETE / BLOCKED

Profile: PASS/FAIL
Profile editing: PASS/FAIL
Location: PASS/FAIL
Location sharing: PASS/FAIL
Emergency contacts: PASS/FAIL
Caregiver invitation: PASS/FAIL
Caregiver acceptance: PASS/FAIL
Connection status: PASS/FAIL
Sharing permissions: PASS/FAIL
Caregiver dashboard sync: PASS/FAIL
Realtime sync: PASS/FAIL/NOT REQUIRED
Revocation: PASS/FAIL
Authorization: PASS/FAIL
IDOR: PASS/FAIL
Cross-user isolation: PASS/FAIL
Privacy: PASS/FAIL
Accessibility: PASS/FAIL
Localization: PASS/FAIL
Responsive: PASS/FAIL
Frontend tests: PASS/FAIL
Backend tests: PASS/FAIL
Integration tests: PASS/FAIL
E2E tests: PASS/FAIL
Build: PASS/FAIL
Lint: PASS/FAIL

Frontend files changed:
...

Reason for each frontend change:
...

Backend files changed:
...

Database changes:
...

P0 issues: X
P1 issues: X
P2 issues: X
P3 issues: X

Production blocker: YES/NO
```

Never claim PASS without actually testing.

---

# 79. FINAL ARCHITECTURE

The intended architecture is:

```text
                    MEMORA
                       │
              ┌────────┴────────┐
              ↓                 ↓
          PATIENT            CAREGIVER
              │                 │
              └────────┬────────┘
                       ↓
                 MEMORA BACKEND
                       │
              ┌────────┴─────────┐
              ↓                  ↓
        Relationship         Permission
          Service              Layer
              │                  │
              └────────┬─────────┘
                       ↓
                    Database
                       │
             ┌─────────┼─────────┐
             ↓         ↓         ↓
          Profile   Location   Emergency
                                  Contacts
             │         │         │
             └─────────┴─────────┘
                       ↓
                 Authorized Sync
                       ↓
                Caregiver Account
```

The core security principle is:

```text
CONNECTED
    ≠
ACCESS TO EVERYTHING
```

Instead:

```text
Connected
   ↓
Relationship verified
   ↓
Requested data
   ↓
Permission verified
   ↓
Data returned
```

The core frontend principle is:

```text
EXISTING MEMORA DESIGN
          ↓
       PRESERVED
          ↓
New functionality connected behind it
```

Do not redesign the frontend to implement this feature.

**Implement the functionality, integrate it into the existing UI, preserve the approved design, and do not declare completion until the complete patient → caregiver connection → permission → synchronization → revocation workflow has been tested end-to-end.**
