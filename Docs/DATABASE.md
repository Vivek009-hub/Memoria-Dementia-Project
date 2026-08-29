# Memora - Database Specification

**Version:** 1.0  
**Status:** Phase 1 - Database Baseline  
**Database:** MongoDB  
**ODM:** Mongoose  
**Project:** Memora

---

# 1. Purpose

This document defines the database architecture for Memora.

It is the source of truth for:
- MongoDB collections
- Mongoose schemas
- Fields
- Relationships
- Indexes
- Ownership
- Access rules
- Data lifecycle
- Database conventions

All developers and AI coding assistants must follow this document when creating or modifying database models.

No developer or AI assistant should independently create a competing schema for an existing domain.

---

# 2. Database Strategy

Memora will use:

- MongoDB Atlas
- MongoDB
- Mongoose

The initial backend will use a single MongoDB database.

Recommended database name:

```text
memora
```

The backend is the only component allowed to communicate directly with MongoDB.

```text
Web Application
      |
      v
Backend API
      |
      v
MongoDB
```

and:

```text
Mobile Safety App
      |
      v
Backend API
      |
      v
MongoDB
```

The web and mobile applications must never connect directly to MongoDB.

---

# 3. Database Design Principles

The database design follows these principles:

1. Separate authentication data from domain-specific profiles.
2. Store ownership relationships explicitly.
3. Keep high-volume event data separate from configuration data.
4. Use references for relationships that need independent lifecycle management.
5. Avoid unnecessary duplication.
6. Use indexes for frequently queried fields.
7. Protect sensitive information through authorization.
8. Keep location and safety data in a dedicated domain.
9. Keep analytics data separate from core business entities where practical.
10. Do not store secrets in MongoDB.
11. Use timestamps on important records.
12. Prefer immutable event records for historical safety/audit data.
13. Database constraints must support application business rules where possible.
14. Avoid unbounded arrays in documents.
15. Do not store large media files directly in ordinary MongoDB documents unless explicitly justified.

---

# 4. Collection Overview

The initial database will contain these logical collections:

```text
AUTH
├── users
└── sessions

PATIENT / CAREGIVER
├── patientProfiles
├── caregiverRelationships
└── emergencyContacts

COGNITIVE
├── games
├── gameSessions
└── gameResults

MEMORY
├── memories
└── familyMembers

REMINDERS
├── reminders
└── reminderLogs

COMMUNITY
├── communityProposals
├── communityVotes
├── communitySessions
└── sessionRegistrations

MEETING CIRCLE
├── meetings
└── meetingParticipants

NOTIFICATIONS
└── notifications

ANALYTICS
└── activityEvents

SAFETY
├── locations
├── geofences
└── safetyEvents

AI
└── aiInteractions

SYSTEM
└── auditLogs
```

Some collections may be combined or split later if performance or product requirements justify it. Such changes must be documented.

---

# 5. Common Field Conventions

All appropriate documents should use:

```text
_id
createdAt
updatedAt
```

Mongoose timestamps should be preferred where suitable.

## IDs

MongoDB ObjectId is the default identifier.

References should normally use:

```text
ObjectId
```

Example:

```text
patientId: ObjectId
```

Do not create custom string IDs unless there is a documented reason.

---

# 6. Users Collection

Collection:

```text
users
```

Purpose:

Stores authentication-independent identity and account information.

## Fields

```text
_id
name
email
passwordHash
role
profileImageUrl
preferredLanguage
isActive
lastLoginAt
createdAt
updatedAt
```

## Role Values

```text
PATIENT
CAREGIVER
ADMIN
HOST
```

## Rules

- Email should be normalized.
- Passwords must never be stored in plain text.
- `passwordHash` must never be returned in API responses.
- Deactivated users cannot authenticate normally.
- Role changes must be authorized and audited.
- User documents should not contain large patient-specific data.

## Indexes

Recommended:

```text
email: unique
role
isActive
```

---

# 7. Sessions Collection

Collection:

```text
sessions
```

Purpose:

Stores server-side session information if the selected authentication implementation requires it.

Possible fields:

```text
_id
userId
sessionTokenHash
expiresAt
createdAt
lastUsedAt
revokedAt
deviceInfo
ipMetadata
```

The exact authentication/session strategy will be finalized during authentication implementation.

## Indexes

```text
userId
expiresAt
sessionTokenHash: unique
```

A TTL index may be used for expired sessions where appropriate.

---

# 8. Patient Profiles Collection

Collection:

```text
patientProfiles
```

Purpose:

Stores patient-specific information separate from the base User account.

## Fields

```text
_id
userId
dateOfBirth
preferredLanguage
accessibilitySettings
preferences
safetySettings
createdAt
updatedAt
```

Potential accessibility settings:

```text
largeText
highContrast
voiceEnabled
reducedMotion
```

Potential safety settings:

```text
locationSharingEnabled
fallDetectionEnabled
sosEnabled
```

These settings must be interpreted alongside explicit permissions and device capabilities.

## Relationships

```text
User 1 ---- 1 PatientProfile
```

## Indexes

```text
userId: unique
```

---

# 9. Caregiver Relationships Collection

Collection:

```text
caregiverRelationships
```

Purpose:

Represents which caregivers are authorized to support which patients.

This is intentionally a separate collection because a patient may eventually have multiple caregivers.

## Fields

```text
_id
caregiverId
patientId
relationshipType
permissions
status
createdBy
createdAt
updatedAt
```

Example relationship types:

```text
FAMILY
PROFESSIONAL
GUARDIAN
OTHER
```

Example permissions:

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

The final permission model will be finalized during authorization design.

## Status

```text
PENDING
ACTIVE
REVOKED
```

## Indexes

Important:

```text
caregiverId
patientId
status
```

A uniqueness constraint should prevent duplicate active relationships for the same caregiver/patient pair where appropriate.

---

# 10. Emergency Contacts Collection

Collection:

```text
emergencyContacts
```

Purpose:

Stores authorized emergency contacts associated with a patient.

## Fields

```text
_id
patientId
name
relationship
phoneNumber
email
priority
isActive
createdBy
createdAt
updatedAt
```

## Rules

- Contact information is sensitive.
- Only authorized users can manage or view it.
- Emergency-contact notification behavior must be explicitly configured.
- Do not assume that every contact is automatically authorized to access patient data.

## Indexes

```text
patientId
patientId + priority
```

---

# 11. Games Collection

Collection:

```text
games
```

Purpose:

Stores reusable cognitive-game definitions.

## Fields

```text
_id
title
description
category
difficulty
instructions
configuration
supportedLanguages
media
isActive
createdBy
createdAt
updatedAt
```

## Categories

Potential initial values:

```text
MEMORY_MATCHING
PICTURE_RECOGNITION
FAMILIAR_FACE
SEQUENCE
PATTERN
PUZZLE
WORD_LANGUAGE
MUSIC_MEMORY
DAILY_LIFE
```

## Difficulty

Example:

```text
EASY
MEDIUM
HARD
```

The implementation may later support numerical difficulty levels.

## Rules

Game definitions are separate from individual patient attempts.

---

# 12. Game Sessions Collection

Collection:

```text
gameSessions
```

Purpose:

Represents an individual attempt/session by a patient.

## Fields

```text
_id
patientId
gameId
startedAt
completedAt
status
difficulty
score
accuracy
responseTimeMs
hintsUsed
mistakes
metadata
createdAt
updatedAt
```

## Status

```text
STARTED
COMPLETED
ABANDONED
```

## Relationships

```text
Patient 1 ---- N GameSessions
Game 1 ------- N GameSessions
```

## Indexes

```text
patientId
gameId
patientId + startedAt
```

---

# 13. Game Results Collection

Collection:

```text
gameResults
```

This collection is optional for the first implementation.

It should only be created if detailed per-question/per-round results cannot reasonably live within `gameSessions`.

Potential fields:

```text
_id
gameSessionId
patientId
round
question
answer
correct
responseTimeMs
createdAt
```

Do not create this collection until the game engine requirements justify it.

Avoid storing excessive raw gameplay data.

---

# 14. Memories Collection

Collection:

```text
memories
```

Purpose:

Stores personalized memory content for patients.

## Fields

```text
_id
patientId
title
description
type
mediaUrl
thumbnailUrl
relatedPersonId
relatedPlace
importantDate
language
tags
createdBy
isActive
createdAt
updatedAt
```

## Types

```text
PHOTO
PERSON
PLACE
STORY
EVENT
OBJECT
```

## Relationships

```text
Patient 1 ---- N Memories
```

## Indexes

```text
patientId
patientId + type
patientId + importantDate
```

Media should normally be stored externally, with references in MongoDB.

---

# 15. Family Members Collection

Collection:

```text
familyMembers
```

Purpose:

Stores familiar people who may be referenced by memories or cognitive activities.

## Fields

```text
_id
patientId
name
relationship
photoUrl
description
language
isActive
createdBy
createdAt
updatedAt
```

Example:

```text
name: Rahul
relationship: Grandson
photoUrl: ...
```

## Relationships

```text
Patient 1 ---- N FamilyMembers
FamilyMember 1 ---- N Memories
```

## Indexes

```text
patientId
patientId + relationship
```

---

# 16. Reminders Collection

Collection:

```text
reminders
```

Purpose:

Stores configured reminders.

## Fields

```text
_id
patientId
createdBy
title
description
type
schedule
recurrence
voiceEnabled
isActive
startDate
endDate
createdAt
updatedAt
```

## Types

Potential values:

```text
MEDICATION
MEAL
APPOINTMENT
ACTIVITY
BIRTHDAY
IMPORTANT_EVENT
COMMUNITY_SESSION
MEETING_CIRCLE
OTHER
```

The scheduling representation must be standardized during reminder implementation.

---

# 17. Reminder Logs Collection

Collection:

```text
reminderLogs
```

Purpose:

Tracks individual reminder occurrences.

## Fields

```text
_id
reminderId
patientId
scheduledAt
deliveredAt
acknowledgedAt
completedAt
status
createdAt
```

## Status

```text
SCHEDULED
DELIVERED
ACKNOWLEDGED
COMPLETED
MISSED
CANCELLED
```

## Indexes

```text
patientId + scheduledAt
reminderId + scheduledAt
status
```

---

# 18. Community Proposals Collection

Collection:

```text
communityProposals
```

Purpose:

Stores session ideas that patients can vote on before they are scheduled.

## Fields

```text
_id
title
description
imageUrl
status
votingStartsAt
votingEndsAt
createdBy
approvedBy
approvedAt
createdAt
updatedAt
```

## Status

```text
DRAFT
VOTING
APPROVED
REJECTED
CLOSED
CONVERTED_TO_SESSION
```

Once approved and scheduled, the proposal should reference the resulting community session if needed:

```text
communitySessionId
```

---

# 19. Community Votes Collection

Collection:

```text
communityVotes
```

Purpose:

Stores patient votes for proposals.

## Fields

```text
_id
proposalId
patientId
createdAt
updatedAt
```

## Critical Constraint

A patient should have at most one active vote for a proposal.

Use a unique compound index:

```text
proposalId + patientId: unique
```

This is an important database-level protection against duplicate voting.

---

# 20. Community Sessions Collection

Collection:

```text
communitySessions
```

Purpose:

Stores officially approved and scheduled community events.

## Fields

```text
_id
proposalId
title
description
sessionImageUrl
date
startTime
endTime
timezone
hostId
featuredPerson
maximumParticipants
meetingType
meetingUrl
registrationStatus
status
createdBy
createdAt
updatedAt
```

Potential featured-person structure:

```text
featuredPerson:
  name
  designation
  imageUrl
  description
```

## Meeting Types

```text
VIDEO
VOICE
```

## Registration Status

```text
OPEN
CLOSED
FULL
```

## Session Status

```text
SCHEDULED
LIVE
COMPLETED
CANCELLED
```

---

# 21. Session Registrations Collection

Collection:

```text
sessionRegistrations
```

Purpose:

Stores patient pre-registration for community sessions.

## Fields

```text
_id
sessionId
patientId
status
registeredAt
cancelledAt
waitlistPosition
createdAt
updatedAt
```

## Status

```text
REGISTERED
WAITLISTED
CANCELLED
ATTENDED
NO_SHOW
```

## Critical Constraint

A patient should not have multiple active registrations for the same session.

Use an appropriate compound index:

```text
sessionId + patientId
```

Registration capacity must also be enforced by backend business logic.

---

# 22. Meetings Collection

Collection:

```text
meetings
```

Purpose:

Stores Meeting Circle sessions.

## Fields

```text
_id
title
description
hostId
startAt
endAt
meetingType
meetingUrl
maximumParticipants
status
createdBy
createdAt
updatedAt
```

Potential meeting types:

```text
VIDEO
VOICE
```

Status:

```text
SCHEDULED
LIVE
COMPLETED
CANCELLED
```

---

# 23. Meeting Participants Collection

Collection:

```text
meetingParticipants
```

Purpose:

Tracks participants in a Meeting Circle.

## Fields

```text
_id
meetingId
userId
role
joinedAt
leftAt
status
createdAt
updatedAt
```

Potential participant roles:

```text
PATIENT
CAREGIVER
HOST
GUEST
```

## Indexes

```text
meetingId
userId
meetingId + userId: unique
```

---

# 24. Notifications Collection

Collection:

```text
notifications
```

Purpose:

Stores in-app notification records.

## Fields

```text
_id
recipientUserId
type
title
message
priority
relatedResourceType
relatedResourceId
isRead
readAt
createdAt
expiresAt
```

Potential notification types:

```text
REMINDER
COMMUNITY_SESSION
MEETING
SOS
POSSIBLE_FALL
GEOFENCE
DEVICE_OFFLINE
LOW_BATTERY
SYSTEM
```

Potential priorities:

```text
LOW
NORMAL
HIGH
CRITICAL
```

Notifications should not contain unnecessary sensitive information.

---

# 25. Activity Events Collection

Collection:

```text
activityEvents
```

Purpose:

Stores application activity events used for analytics.

Examples:

```text
GAME_STARTED
GAME_COMPLETED
REMINDER_ACKNOWLEDGED
COMMUNITY_VOTE
SESSION_REGISTERED
SESSION_ATTENDED
VOICE_INTERACTION
MEMORY_VIEWED
```

## Fields

```text
_id
patientId
eventType
source
entityType
entityId
metadata
timestamp
createdAt
```

The event schema should remain lightweight.

Do not store full sensitive payloads when an event reference is sufficient.

---

# 26. Locations Collection

Collection:

```text
locations
```

Purpose:

Stores authorized patient location updates from the safety mobile application.

## Fields

```text
_id
patientId
latitude
longitude
accuracy
timestamp
source
deviceId
createdAt
```

Potential source:

```text
MOBILE_APP
```

For geospatial querying, a GeoJSON representation may be used:

```text
location:
  type: "Point"
  coordinates: [longitude, latitude]
```

If GeoJSON is used, create a `2dsphere` index.

## Critical Privacy Rule

Location data is highly sensitive.

Only authorized users/services may access it.

Location retention must be explicitly defined before production deployment.

---

# 27. Geofences Collection

Collection:

```text
geofences
```

Purpose:

Stores configured safe zones.

## Fields

```text
_id
patientId
name
center
radiusMeters
isActive
createdBy
createdAt
updatedAt
```

`center` should use a geospatial representation compatible with MongoDB geospatial queries.

Example conceptual structure:

```text
center:
  type: "Point"
  coordinates: [longitude, latitude]
```

## Indexes

```text
patientId
center: 2dsphere
```

---

# 28. Safety Events Collection

Collection:

```text
safetyEvents
```

Purpose:

Stores safety-related events in a common event history.

## Fields

```text
_id
patientId
type
status
location
timestamp
source
metadata
acknowledgedBy
acknowledgedAt
resolvedBy
resolvedAt
createdAt
updatedAt
```

## Event Types

```text
GEOFENCE_EXIT
GEOFENCE_ENTRY
SOS
POSSIBLE_FALL
DEVICE_OFFLINE
LOW_BATTERY
```

## Status

Potential values:

```text
OPEN
ACKNOWLEDGED
CANCELLED
RESOLVED
```

For safety events, preserve historical records rather than overwriting them.

---

# 29. AI Interactions Collection

Collection:

```text
aiInteractions
```

Purpose:

Stores controlled metadata about AI interactions for product functionality, debugging, and analytics.

## Fields

```text
_id
userId
patientId
type
language
inputMetadata
outputMetadata
provider
model
status
createdAt
```

Avoid storing complete conversation content unless explicitly required and appropriate.

If conversation content is stored, privacy, retention, access, and deletion policies must be defined.

Potential types:

```text
VOICE_ASSISTANT
MEMORY_ASSISTANCE
GAME_RECOMMENDATION
LANGUAGE_SUPPORT
OTHER
```

---

# 30. Audit Logs Collection

Collection:

```text
auditLogs
```

Purpose:

Records important administrative, security, and permission-sensitive actions.

## Fields

```text
_id
actorUserId
action
resourceType
resourceId
targetUserId
metadata
timestamp
createdAt
```

Examples:

```text
ROLE_CHANGED
USER_DEACTIVATED
COMMUNITY_PROPOSAL_APPROVED
COMMUNITY_SESSION_SCHEDULED
CAREGIVER_ACCESS_GRANTED
CAREGIVER_ACCESS_REVOKED
SAFETY_EVENT_ACKNOWLEDGED
```

Never store:
- Passwords
- API keys
- Authentication tokens
- Unnecessary sensitive data

---

# 31. Relationships Overview

Core relationships:

```text
User
 |
 +---- PatientProfile
 |
 +---- CaregiverRelationship ---- Patient
 |
 +---- Sessions
 |
 +---- Notifications
 |
 +---- AuditLogs
```

Patient domain:

```text
Patient
 |
 +---- Memories
 |
 +---- FamilyMembers
 |
 +---- Reminders
 |       |
 |       +---- ReminderLogs
 |
 +---- GameSessions
 |       |
 |       +---- Game
 |
 +---- ActivityEvents
 |
 +---- Locations
 |
 +---- Geofences
 |
 +---- SafetyEvents
 |
 +---- CommunityVotes
 |
 +---- SessionRegistrations
```

Community:

```text
CommunityProposal
      |
      +---- CommunityVotes
      |
      +---- CommunitySession
                  |
                  +---- SessionRegistrations
```

Meeting Circle:

```text
Meeting
   |
   +---- MeetingParticipants
```

---

# 32. Reference vs Embedding Strategy

MongoDB supports both embedding and referencing.

Memora should generally use references for entities with:
- Independent lifecycle
- Frequent updates
- Many-to-many relationships
- Potentially large data
- Independent authorization

Examples:

Use references:

```text
patientId
caregiverId
gameId
proposalId
sessionId
meetingId
```

Embedding is acceptable for small, tightly coupled data.

Examples:

```text
accessibilitySettings
featuredPerson
small configuration objects
```

Avoid huge nested documents.

---

# 33. Indexing Strategy

Indexes should be created deliberately.

Common index categories:

### Authentication

```text
users.email
```

### Ownership

```text
patientId
caregiverId
userId
```

### Time-based queries

```text
createdAt
timestamp
scheduledAt
startAt
```

### Geospatial

```text
2dsphere
```

### Unique business constraints

```text
communityVotes:
proposalId + patientId

sessionRegistrations:
sessionId + patientId

meetingParticipants:
meetingId + userId
```

Do not add indexes without considering write cost and actual query patterns.

---

# 34. Soft Delete vs Hard Delete

For some entities, deletion should be represented by status rather than physically removing the document.

Examples:
- Users
- Memories
- Games
- Geofences
- Reminders

Possible fields:

```text
isActive
deletedAt
```

Safety events and audit logs should generally be retained according to the defined retention policy rather than casually deleted.

The exact retention/deletion policy must be defined before production deployment.

---

# 35. Sensitive Data

The following are particularly sensitive:

```text
Location
Emergency contacts
Patient information
Memory content
Family photographs
Cognitive activity
Safety events
AI interaction data
```

Rules:
- Restrict access.
- Do not expose through unrestricted endpoints.
- Do not log sensitive values.
- Do not send unnecessary data to external AI providers.
- Use secure transport.
- Define retention/deletion policies.

---

# 36. Media Storage

Images and other large media should normally be stored in external object/media storage.

MongoDB stores metadata/reference information:

```text
mediaUrl
thumbnailUrl
mimeType
fileSize
```

Do not store large images directly inside ordinary MongoDB documents unless explicitly justified.

---

# 37. Location Storage Considerations

Location data can become high-volume.

The system should avoid storing unlimited high-frequency location data indefinitely.

Before production, define:
- Update frequency
- Retention duration
- Whether all raw points are retained
- Whether older data is aggregated
- Who can access historical data
- How patient/caregiver permissions work

The initial implementation should prefer the minimum data necessary to support the safety features.

---

# 38. Database Transactions

MongoDB transactions may be used where multiple related writes must succeed or fail together.

Examples:
- Critical registration/capacity workflows where appropriate
- Role/relationship changes with associated records
- Important state transitions

Do not use transactions everywhere by default.

Prefer atomic MongoDB operations where they are sufficient.

---

# 39. Concurrency Considerations

The backend must account for concurrent requests.

Important example:

```text
Session capacity = 20

Patient A registers
Patient B registers
Patient C registers
```

The system must prevent registrations from exceeding capacity.

This must be solved in backend/database logic, not by trusting frontend counters.

Similarly:

```text
Patient A votes
Patient A votes again
```

The unique database constraint should prevent duplicate votes.

---

# 40. Data Validation

Mongoose schemas should define appropriate:
- Required fields
- Types
- Enums
- Defaults
- Length limits
- Validation rules
- Indexes

However, database validation does not replace API request validation.

Both layers should be used where appropriate.

---

# 41. Privacy and Authorization

Database access must always occur through authorized backend services.

Example:

```text
GET /patients/:patientId/location
```

The backend must verify:

```text
Authenticated user
        +
Role
        +
Caregiver relationship / ownership
        +
Permission
```

Never assume that knowing a MongoDB ObjectId grants access.

---

# 42. Environment Separation

Use separate databases for:

```text
Development
Staging
Production
```

Example:

```text
memora-development
memora-staging
memora-production
```

Never use production data casually in development.

---

# 43. Seed Data

Development seed data may be created for:

- Admin account
- Test patients
- Test caregivers
- Test games
- Test community proposals
- Test sessions

Seed data must:
- Be clearly marked as development/test data.
- Never contain real patient information.
- Never contain real passwords or secrets.

---

# 44. Migration Strategy

MongoDB schema changes must be deliberate.

When changing a production schema:
1. Document the change.
2. Identify existing documents affected.
3. Determine backward compatibility.
4. Create a migration if required.
5. Test against staging.
6. Deploy migration safely.
7. Update `DATABASE.md`.

Never assume changing a Mongoose schema automatically migrates existing production data.

---

# 45. Data Retention

Before production launch, define retention policies for:

```text
Locations
Safety Events
Audit Logs
AI Interactions
Game Activity
Notifications
Reminder Logs
```

Retention should consider:
- Product requirements
- Privacy
- Security
- Applicable laws/regulations
- Operational needs

The application should not retain sensitive data indefinitely without a reason.

---

# 46. Database Development Rules for Claude

Every Claude coding session that modifies the database must:

1. Read `CLAUDE.md`.
2. Read `docs/DATABASE.md`.
3. Inspect existing models.
4. Reuse existing schemas where applicable.
5. Never create duplicate models.
6. Never silently rename fields.
7. Never silently change enum values.
8. Never remove an existing field without checking dependencies.
9. Add/update indexes deliberately.
10. Add tests for important database constraints.
11. Update this document for schema changes.
12. Explain migration implications.
13. Never place secrets in schemas or seed data.
14. Never use real patient information in development.

---

# 47. Model Naming Convention

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

MongoDB collection names should use lowercase plural names:

```text
users
patientProfiles
caregiverRelationships
games
gameSessions
memories
reminders
communityProposals
communityVotes
communitySessions
sessionRegistrations
meetings
meetingParticipants
notifications
activityEvents
locations
geofences
safetyEvents
aiInteractions
auditLogs
```

---

# 48. Database Change Process

Any database change must follow:

```text
Proposed change
      |
      v
Check DATABASE.md
      |
      v
Check existing models
      |
      v
Identify affected APIs
      |
      v
Identify migration needs
      |
      v
Implement
      |
      v
Test
      |
      v
Update DATABASE.md
      |
      v
Pull Request
```

---

# 49. Initial Implementation Order

Do not build all models simultaneously.

Recommended order:

```text
B1.1
User
PatientProfile
CaregiverRelationship

        ↓

B1.2
EmergencyContact

        ↓

B1.3
Game
GameSession

        ↓

B1.4
Memory
FamilyMember

        ↓

B1.5
Reminder
ReminderLog

        ↓

B1.6
CommunityProposal
CommunityVote
CommunitySession
SessionRegistration

        ↓

B1.7
Meeting
MeetingParticipant

        ↓

B1.8
Notification

        ↓

B1.9
ActivityEvent

        ↓

B1.10
Location
Geofence
SafetyEvent

        ↓

B1.11
AIInteraction
AuditLog
```

Some independent modules may be developed in parallel once their dependencies are stable.

---

# 50. Initial Database Definition of Done

The database foundation is complete when:

- MongoDB Atlas connection works.
- Mongoose is configured.
- Environment variables are secure.
- Core schemas are documented.
- User schema is implemented.
- Patient profile schema is implemented.
- Caregiver relationship schema is implemented.
- Important indexes are implemented.
- Duplicate-vote protection is defined.
- Duplicate-registration protection is defined.
- Geospatial indexes are defined before safety implementation.
- Timestamps are enabled where appropriate.
- Validation is implemented.
- Tests exist for critical constraints.
- No real patient data is used.
- Database documentation matches the actual schemas.

---

# 51. Current Status

**STATUS: DATABASE BASELINE FOR TEAM REVIEW**

Related documents:

- `PROJECT_SPEC.md` - Product requirements
- `ARCHITECTURE.md` - System architecture
- `DATABASE.md` - Database specification

Next implementation phase:

**B0 - Backend Foundation**

After B0 is complete, begin:

**B1 - Database Foundation**
