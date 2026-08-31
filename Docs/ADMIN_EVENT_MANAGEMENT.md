# Admin Event & Voting Management Documentation

## Overview
Administrative management of community sessions and voting proposals extends existing `CommunityProposal` and `CommunitySession` collections without creating duplicate event systems.

## Endpoints

### 1. Create Voting Proposal
`POST /api/v1/admin/community/sessions/ideas`
- **Role**: `ADMIN`
- **Fields**: `title`, `description`, `sessionType`, `votingStartsAt`, `votingEndsAt`

### 2. Toggle Voting Status
`PATCH /api/v1/admin/community/sessions/ideas/:ideaId/toggle-voting`
- **Role**: `ADMIN`
- **Body**: `{ "isOpen": true/false }`
- **Behavior**: Switches proposal status between `VOTING` and `CLOSED`.

### 3. Schedule Session
`POST /api/v1/admin/community/sessions/schedule`
- **Role**: `ADMIN`
- **Fields**: `title`, `date`, `startTime`, `durationMinutes`, `maximumParticipants`, `meetingType`

### 4. Cancel Session
`POST /api/v1/admin/community/sessions/:sessionId/cancel`
- **Role**: `ADMIN`
- **Behavior**: Updates session status to `CANCELLED`, registration status to `CLOSED`, and notifies registered participants.
