# Meeting Circle Video Architecture

## Overview
Memora Meeting Circle provides small-group live video calling for patients, caregivers, and specialized hosts. The feature is powered by Daily managed video infrastructure (`DailyProvider`), backed by a 6-person capacity enforcement engine and room lifecycle manager in the Memora Node.js/Express server.

## Architecture Blueprint

```text
PATIENT (Frontend Web App)
  │
  ├── 1. POST /api/v1/meeting-circles (Create Circle)
  ├── 2. GET /api/v1/meeting-circles/discover (Discover Public Circles)
  ├── 3. POST /api/v1/meeting-circles/:circleId/join (Request Access)
  │
MEMORA BACKEND (Node.js/Express)
  │
  ├── Session Authentication (HTTP-only Cookie / Bearer Token)
  ├── Role & Ownership Authorization
  ├── Atomic Concurrency Lock: activeParticipantCount < 6
  ├── Daily Room Creation / Token Issuance (Server-Side Daily API Key)
  │
DAILY.CO MANAGED VIDEO INFRASTRUCTURE
  │
  ├── WebRTC Video/Audio Transport
  ├── 6-Participant Video Grid & Media Streams
  └── Room Security & Session Tokens
```

## Core Infrastructure Principles

1. **Hard 6-Participant Limit**:
   - Both frontend UI and backend Mongoose atomic filters (`activeParticipantCount: { $lt: 6 }`) enforce a strict maximum of 6 active participants per video circle.
   - 7th participant join attempts are rejected with `HTTP 409 Conflict (CAPACITY_REACHED)`.

2. **Daily Provider Credentials Security**:
   - `DAILY_API_KEY` and `DAILY_DOMAIN` remain strictly on the backend server.
   - Privileged credentials are never sent to the browser client or exposed in bundle code.

3. **Room & Participant Lifecycle**:
   - Circle creation registers a room with Daily REST API (`https://api.daily.co/v1/rooms`) with `max_participants: 6`.
   - Joining a circle issues a short-lived meeting token (`https://api.daily.co/v1/meeting-tokens`) and registers an `ACTIVE` participant.
   - Leaving a call decrements the `activeParticipantCount` and sets participant status to `LEFT`.
   - Closing/Deleting a circle revokes active participants and deletes the room on Daily.

4. **Participant Safety & Moderation**:
   - Participants can flag/report peers during a live call via `POST /api/v1/meeting-circles/:circleId/report`.
