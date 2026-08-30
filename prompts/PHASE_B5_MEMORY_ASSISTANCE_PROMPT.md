# Memora - Phase B5 Prompt: Memory Assistance

**Phase:** B5  
**Name:** Memory Assistance & Personal Memory System  
**Prerequisites:** B0-B4 completed  
**Status:** Ready for implementation

---

# Objective

Implement Memora's backend memory-assistance system.

The purpose of B5 is to create a secure, patient-centered personal memory system where patients and authorized caregivers can store, organize, retrieve, and manage meaningful memories.

The system should support:

```text
People
Places
Events
Stories
Photos / Media
Important Dates
Memory Categories
Memory Recall
Caregiver-Assisted Memories
```

Target architecture:

```text
Patient / Caregiver
        ↓
Memory API
        ↓
Authentication
        ↓
Authorization
        ↓
Memory Service
        ↓
Memory / Media Models
        ↓
MongoDB / Media Storage
```

B5 should create a clean foundation that B11 AI can later use for intelligent memory assistance.

---

# 1. READ FIRST

Before changing anything, read:

```text
CLAUDE.md
PROJECT_SPEC.md
docs/ARCHITECTURE.md
docs/DATABASE.md
```

Then inspect the completed:

```text
B0 Backend Foundation
B1 Database Foundation
B2 Authentication
B3 Users / Patients / Caregivers
B4 Cognitive Games
```

Inspect:

```text
server/src/modules/
server/src/middleware/
server/src/routes/
server/src/config/
```

Do NOT rebuild previous phases.

---

# 2. B5 SCOPE

Implement:

- Memory model
- Memory categories/types
- Personal memories
- People associated with memories
- Places associated with memories
- Events/stories
- Memory media metadata
- Photo/media association
- Important dates where defined
- Memory CRUD
- Memory search/filtering
- Caregiver-assisted memory management
- Memory authorization
- Ownership checks
- Memory visibility/access rules
- Media upload integration if already supported by architecture
- Validation
- Pagination
- Tests
- Security tests

Do NOT implement:

```text
AI memory generation
AI memory summaries
AI conversational memory assistant
Voice interaction
Speech recognition
Text-to-speech
Reminders
Community Sessions
Meeting Circle
Notifications
Analytics dashboards
Geolocation tracking
Geofencing
SOS
Fall Detection
Mobile App
```

AI integration belongs to B11.

---

# 3. CORE PRINCIPLE

A memory belongs to a patient.

Conceptually:

```text
Patient
   |
   +---- Memory
   |       |
   |       +---- People
   |       +---- Places
   |       +---- Events
   |       +---- Story
   |       +---- Media
   |
   +---- Caregiver access
```

Do not make memories globally accessible.

Every memory request must pass authorization.

---

# 4. MEMORY OWNERSHIP

The primary owner of a memory is the patient.

Example:

```text
Patient A
   ↓
Memory A
   ↓
✓ Patient A can access
```

Another patient:

```text
Patient B
   ↓
Memory A
   ↓
✗ Forbidden
```

A caregiver may access or modify a patient's memories only when:

```text
ACTIVE caregiver relationship
+
appropriate permission
```

Reuse the authorization infrastructure created in B3.

Do not create a second permission system.

---

# 5. MEMORY TYPES

Use controlled memory types.

If DATABASE.md already defines them, follow it exactly.

If it does not, use a compact extensible set such as:

```text
PERSON
PLACE
EVENT
STORY
ACHIEVEMENT
FAMILY
CHILDHOOD
CAREER
TRAVEL
OTHER
```

Do not create excessive categories.

---

# 6. MEMORY MODEL

Implement the Memory model according to DATABASE.md.

Potential fields:

```text
patientId
title
description
memoryType
date
datePrecision
location
people
media
tags
importance
visibility
createdBy
updatedBy
createdAt
updatedAt
```

Only use fields that are defined or clearly justified by DATABASE.md.

Do not silently invent a different schema.

---

# 7. MEMORY DATE

Memory dates may be incomplete or approximate.

The system should support situations such as:

```text
Exact date
Month/year
Year only
Unknown
```

If DATABASE.md defines a date precision strategy, use it.

Do not force patients to provide an exact date when the memory is historical and approximate.

---

# 8. MEMORY TITLE

A memory should have a clear human-readable title.

Examples:

```text
"My Wedding Day"
"Trip to Kashmir"
"Grandfather's House"
"My First Job"
"Vinit's Birthday"
```

Do not require large amounts of text.

The patient-facing product will be designed for minimal cognitive load.

---

# 9. MEMORY DESCRIPTION / STORY

Support a human-readable description/story.

It may contain:

```text
Short description
Personal story
Context
Important details
```

Do not impose unnecessary text-length restrictions that make meaningful memories difficult to record.

Still protect the database from unbounded input.

---

# 10. PEOPLE ASSOCIATED WITH MEMORIES

A memory may involve people.

Examples:

```text
Mother
Father
Brother
Friend
Doctor
Teacher
Spouse
```

Follow DATABASE.md for whether people are embedded or represented as a separate entity.

Do NOT create duplicate user accounts simply because a person appears in a memory.

A person in a memory is not automatically a Memora user.

---

# 11. PLACES

A memory may contain a place.

Examples:

```text
Childhood home
School
Village
College
Workplace
Holiday destination
```

Follow DATABASE.md.

If geographic coordinates are stored:

- Treat them as sensitive.
- Do not expose unnecessary precision.
- Do not implement geofencing in B5.
- Do not use location tracking.

B12 handles safety location functionality.

---

# 12. MEDIA

Memories may contain media such as:

```text
Photos
Images
Audio
Video
```

B5 should store media metadata and references, not unnecessarily store large binary files inside MongoDB.

Preferred conceptual architecture:

```text
Client
  ↓
Backend
  ↓
Media Storage
  ↓
Memory Media Metadata
  ↓
Memory
```

If the project already has Cloudinary or another approved media-storage integration, reuse it.

Do not introduce another media provider without approval.

---

# 13. MEDIA SECURITY

Media is sensitive.

Do not expose private memory media through unrestricted public URLs unless the product architecture explicitly requires public access.

Use the project's existing media-access strategy.

Never log:

```text
private media URLs
patient memory contents
private media identifiers
```

unnecessarily.

---

# 14. MEMORY VISIBILITY

If DATABASE.md defines visibility, follow it.

Possible values:

```text
PRIVATE
CAREGIVER_SHARED
```

Do not invent public memory visibility unless explicitly required.

The default should be the most privacy-preserving appropriate state.

---

# 15. MEMORY CREATION

Implement:

```http
POST /api/v1/memories
```

A patient creates a memory for themselves.

Flow:

```text
Authenticate
   ↓
Verify patient
   ↓
Validate input
   ↓
Create memory
   ↓
Associate media/people/places
   ↓
Return safe memory
```

Do not allow the client to impersonate another patient by submitting another `patientId`.

---

# 16. CAREGIVER MEMORY CREATION

If the product specification allows caregivers to create memories for a patient:

```text
Caregiver
   ↓
ACTIVE relationship
   ↓
Required memory-management permission
   ↓
Create memory for patient
```

Do not allow this if the caregiver lacks the required permission.

If the exact creation workflow is not defined, implement the safest reasonable behavior and document the assumption.

---

# 17. GET MEMORY

Implement:

```http
GET /api/v1/memories/:memoryId
```

Authorization must happen before returning the memory.

Allowed:

```text
Patient owner
Authorized caregiver
Authorized admin policy where explicitly required
```

Denied:

```text
Unrelated user
Unauthorized caregiver
Revoked caregiver
```

---

# 18. LIST MEMORIES

Implement:

```http
GET /api/v1/memories
```

The endpoint should return only memories the authenticated requester is authorized to access.

Support sensible filters where useful:

```text
memoryType
tag
person
date
importance
```

Use pagination.

Do not return the entire patient's memory collection in one response.

---

# 19. SEARCH

Support memory search where practical.

Potential search fields:

```text
title
description/story
tags
people
places
```

Keep the first implementation simple.

Do not introduce Elasticsearch or another search infrastructure unless clearly justified.

MongoDB-supported queries are sufficient for B5 unless DATABASE.md says otherwise.

---

# 20. UPDATE MEMORY

Implement:

```http
PATCH /api/v1/memories/:memoryId
```

Only authorized users can update.

The service must verify:

```text
Memory exists
+
Requester has access
+
Requester has required modification permission
```

Do not allow users to change ownership arbitrarily.

The patient owner should not be able to transfer a memory to another patient through a normal update endpoint.

---

# 21. DELETE MEMORY

Implement:

```http
DELETE /api/v1/memories/:memoryId
```

Only authorized users can delete.

Consider soft deletion if DATABASE.md requires retention or recovery.

Do not permanently delete associated media without considering whether it is still referenced elsewhere.

If the architecture requires hard deletion, make the operation deliberate and tested.

---

# 22. MEMORY TAGS

Support tags if defined by DATABASE.md.

Examples:

```text
family
childhood
school
travel
music
birthday
career
```

Normalize tags consistently.

Avoid uncontrolled duplicate tag variants such as:

```text
Family
family
FAMILY
families
```

if the design expects normalized tags.

---

# 23. IMPORTANCE

If memory importance is defined, use controlled values.

For example:

```text
LOW
NORMAL
HIGH
```

Follow DATABASE.md if it specifies something else.

Do not treat importance as a medical measurement.

It is a personalization/organization attribute.

---

# 24. MEMORY RECALL FOUNDATION

B5 should provide APIs/data needed for future memory recall.

For example:

```http
GET /api/v1/memories/:memoryId
GET /api/v1/memories
```

Later B11 can use these records to generate:

```text
"Would you like to look at photos from your trip?"
```

But B5 itself should NOT generate AI prompts.

---

# 25. RANDOM / FEATURED MEMORY

If the product specification requires memory resurfacing, a simple backend foundation may be implemented.

For example:

```http
GET /api/v1/memories/featured
```

or:

```http
GET /api/v1/memories/random
```

Only implement this if it is clearly useful and compatible with DATABASE.md.

It must:

- Respect authorization.
- Exclude deleted/inactive memories.
- Avoid exposing private memories to caregivers without permission.
- Avoid unnecessary repetition if the data model supports tracking.

Do not build an AI recommendation engine here.

---

# 26. CAREGIVER PERMISSIONS

Use the B3 permission system.

Relevant permissions may include:

```text
manageMemories
viewProfile
```

Do not invent a separate memory permission model.

Example:

```text
Caregiver
+
ACTIVE relationship
+
manageMemories
=
Can create/update/delete memories
```

Where only viewing is needed:

```text
Caregiver
+
ACTIVE relationship
+
appropriate view permission
=
Can view memories
```

Follow the permission names defined in DATABASE.md.

---

# 27. AUTHORIZATION MATRIX

Test:

```text
Patient → own memories
✓

Patient → another patient's memories
✗

Caregiver → authorized patient + permission
✓

Caregiver → authorized patient without permission
✗

Caregiver → revoked relationship
✗

Unrelated user → patient memory
✗

Unauthenticated → memory API
✗
```

---

# 28. VALIDATION

Validate:

```text
memoryId
patientId
title
description
memoryType
date
datePrecision
tags
importance
visibility
people
places
media references
```

Reject:

```text
Invalid ObjectId
Invalid enum
Oversized input
Malformed media references
Invalid date
Invalid priority/importance
Unauthorized patientId
```

Do not trust client-provided ownership.

---

# 29. PAGINATION

List/search endpoints must use pagination.

Example:

```text
page
limit
```

or the project's established pagination format.

Set a reasonable maximum limit.

Do not allow:

```text
?limit=1000000
```

to create an expensive database query.

---

# 30. INDEXING

Follow DATABASE.md.

Likely useful indexes may include:

```text
Memory:
patientId + createdAt
patientId + memoryType
patientId + date
patientId + importance
```

If text search is implemented, use the most appropriate MongoDB indexing strategy.

Do not add indexes blindly.

Every index should correspond to a real query.

---

# 31. DATA PRIVACY

Memory data may be highly personal.

Never log:

```text
full memory stories
private photos
private media URLs
patient personal information
```

unless explicitly required for debugging and appropriately protected.

Do not send memory content to an AI provider in B5.

AI integration is B11.

---

# 32. CONCURRENCY

Protect against conflicting updates.

Example:

```text
User A updates memory
User B updates same memory
```

Use the existing timestamp/version strategy if the architecture provides one.

Do not silently overwrite data if the project's concurrency design requires conflict detection.

---

# 33. MEDIA UPLOADS

If media uploads are part of the existing architecture:

- Validate file type.
- Validate file size.
- Validate ownership/access.
- Prevent arbitrary file execution.
- Store metadata.
- Store files in the approved media service.
- Do not store huge binary data directly in MongoDB unless DATABASE.md explicitly requires it.

If the media provider is not yet configured, implement the memory metadata layer and clearly document the remaining integration instead of introducing an unapproved provider.

---

# 34. TESTING

Create comprehensive tests.

## Memory Model

```text
✓ valid memory creation
✓ required patient
✓ required title
✓ valid memory type
✓ invalid memory type rejected
✓ valid importance
✓ invalid importance rejected
✓ timestamps created
```

## Memory API

```text
✓ patient creates memory
✓ patient lists own memories
✓ patient retrieves own memory
✓ patient updates own memory
✓ patient deletes own memory
✓ unauthorized user rejected
```

## Caregiver

```text
✓ authorized caregiver can view memory
✓ authorized caregiver can manage memory with permission
✓ caregiver without permission rejected
✓ revoked caregiver rejected
✓ unrelated caregiver rejected
```

## Search/Filtering

```text
✓ pagination works
✓ type filtering works
✓ tag filtering works
✓ date filtering works
✓ search works if implemented
✓ maximum page size enforced
```

## Security

```text
✓ ownership cannot be changed through normal update
✓ arbitrary patientId cannot be used to create memory
✓ private memory is protected
✓ private media access is protected
✓ sensitive memory content is not logged
```

---

# 35. API TEST FLOW

Create an integration flow:

```text
Authenticate patient
        ↓
POST /memories
        ↓
Receive memory
        ↓
GET /memories
        ↓
GET /memories/:memoryId
        ↓
PATCH /memories/:memoryId
        ↓
GET /memories
        ↓
DELETE /memories/:memoryId
```

Also test:

```text
Patient A
   ↓
attempts Patient B memory
   ↓
403 / 404 according to security convention
```

And:

```text
Caregiver
   ↓
ACTIVE relationship
   ↓
manageMemories
   ↓
Memory access
```

---

# 36. API RESPONSE FORMAT

Continue using the existing response format.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Paginated response:

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
    "code": "FORBIDDEN",
    "message": "You do not have permission to access this resource"
  }
}
```

Do not expose raw MongoDB errors.

---

# 37. CODE ORGANIZATION

Follow the existing modular structure.

Recommended if consistent with the repository:

```text
server/src/modules/memories/
├── memory.model.js
├── memory.controller.js
├── memory.service.js
├── memory.routes.js
├── memory.validation.js
└── memory.test.js
```

If DATABASE.md requires separate models for:

```text
MemoryPerson
MemoryPlace
MemoryMedia
```

implement them according to that specification.

Do not create duplicate representations.

---

# 38. DO NOT REWRITE B0-B4

Do not rewrite:

```text
Express setup
MongoDB configuration
Authentication
Session management
User model
PatientProfile
CaregiverRelationship
EmergencyContact
Authorization
Game models
Game services
```

unless an actual defect blocks B5.

If a defect is found:

1. Explain it.
2. Make the smallest safe fix.
3. Add a regression test.
4. Mention it in the final report.

---

# 39. NO AI YET

Do NOT implement:

```text
AI summaries
AI memory extraction
AI memory recommendations
LLM integration
Voice assistant
Conversational memory assistant
```

B11 handles AI.

B5 should expose clean structured data that B11 can later consume.

---

# 40. NO FRONTEND YET

Do not implement:

```text
React components
Web UI
Mobile UI
Voice UI
```

B5 is backend only.

The APIs must be clean enough for the frontend team.

---

# 41. NO SAFETY FEATURES

Do NOT implement:

```text
GPS tracking
Geofencing
SOS
Fall detection
Safety alerts
```

Those belong to B12/B13.

A place associated with a memory is NOT a safety location.

Do not mix memory locations with geofencing data.

---

# 42. DOCUMENTATION

If B5 changes:

```text
Memory schema
Media metadata schema
People/place representation
Memory visibility
Permission definitions
API contracts
Indexes
```

update the appropriate documentation.

Do not silently change DATABASE.md.

If DATABASE.md conflicts with the implementation:

STOP and report the conflict.

---

# 43. FINAL VERIFICATION

Run:

```bash
npm test
npm run lint
npm run format:check
```

If a build command exists, run it.

Verify:

```text
Patient can create memory
Patient can list memories
Patient can retrieve memory
Patient can update memory
Patient can delete memory

Unauthorized patient access fails

Authorized caregiver access works

Unauthorized caregiver access fails

Revoked caregiver access fails

Pagination works

Validation works

Sensitive fields are protected
```

---

# 44. FINAL REPORT

Return:

```text
B5 MEMORY ASSISTANCE REPORT

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

Memory ownership:
-

Authorization:
-

Caregiver permissions:
-

Memory types:
-

Media strategy:
-

Search/filter strategy:
-

Pagination:
-

Indexes:
-

Validation:
-

Concurrency:
-

Security:
-

Tests:
-

Security tests:
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

Do NOT proceed to B6.

---

# 45. B5 DEFINITION OF DONE

B5 is complete only when:

[ ] Memory model implemented according to DATABASE.md
[ ] Memory CRUD implemented
[ ] Patient ownership enforced
[ ] Caregiver memory access enforced
[ ] Caregiver permissions reused from B3
[ ] Memory types validated
[ ] Memory dates handled appropriately
[ ] Memory tags supported if specified
[ ] Importance supported if specified
[ ] Visibility/privacy supported if specified
[ ] Media metadata supported
[ ] Existing media provider reused if available
[ ] Media access protected
[ ] Pagination implemented
[ ] Filtering implemented
[ ] Search implemented where appropriate
[ ] Required indexes implemented
[ ] Ownership cannot be changed through normal update
[ ] Unauthorized access rejected
[ ] Revoked caregiver access rejected
[ ] Sensitive data protected
[ ] Concurrency handled appropriately
[ ] Tests cover success cases
[ ] Tests cover authorization failures
[ ] Tests cover validation
[ ] Tests cover ownership
[ ] Tests cover caregiver permissions
[ ] Tests pass
[ ] Lint passes
[ ] Formatting passes
[ ] Documentation remains consistent
[ ] No AI integration implemented
[ ] No safety features implemented
[ ] No frontend/mobile implementation
[ ] No unrelated features implemented

Only after all applicable items pass should B5 be considered complete.

---

# 46. STOP CONDITION

After B5 is complete:

**STOP.**

Do not begin B6.

The next phase will be:

```text
B6 - Reminders
```

B6 will build Memora's reminder system for medications, appointments, activities, recurring reminders, completion tracking, and reminder history.
