# Meeting Circle API Specification

Base Endpoint: `/api/v1/meeting-circles`

All endpoints require authentication (`requireAuth`).

---

## 1. Create Meeting Circle
`POST /api/v1/meeting-circles`

**Request Body:**
```json
{
  "name": "Morning Music & Memories",
  "description": "A calm morning music circle for peers.",
  "visibility": "DISCOVERABLE"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "circle": {
      "id": "65e2a1b9f8d9a1029c",
      "name": "Morning Music & Memories",
      "description": "A calm morning music circle for peers.",
      "creatorId": "65e2a000f8d9a10000",
      "creatorName": "Alice",
      "visibility": "DISCOVERABLE",
      "maxParticipants": 6,
      "activeParticipantCount": 1,
      "status": "OPEN",
      "provider": "daily",
      "providerRoomName": "memora-morning-music-a1b2",
      "providerRoomUrl": "https://memora.daily.co/memora-morning-music-a1b2"
    },
    "roomUrl": "https://memora.daily.co/memora-morning-music-a1b2",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-09-01T03:00:00.000Z"
  }
}
```

---

## 2. List Discoverable Circles
`GET /api/v1/meeting-circles/discover`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "65e2a1b9f8d9a1029c",
      "name": "Morning Music & Memories",
      "description": "A calm morning music circle for peers.",
      "creatorName": "Alice",
      "visibility": "DISCOVERABLE",
      "maxParticipants": 6,
      "activeParticipantCount": 3,
      "status": "OPEN"
    }
  ]
}
```

---

## 3. List My Circles
`GET /api/v1/meeting-circles/mine`

Returns circles created by or currently joined by the authenticated user.

---

## 4. Join Circle
`POST /api/v1/meeting-circles/:circleId/join`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "circle": {
      "id": "65e2a1b9f8d9a1029c",
      "activeParticipantCount": 4
    },
    "roomUrl": "https://memora.daily.co/memora-morning-music-a1b2",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error (409 Conflict - Circle Full):**
```json
{
  "success": false,
  "error": {
    "message": "Meeting circle is full. Maximum 6 participants allowed.",
    "code": "CAPACITY_REACHED"
  }
}
```

---

## 5. Leave Circle
`POST /api/v1/meeting-circles/:circleId/leave`

Reconciles active participant status and decrements active participant count.

---

## 6. Delete Circle
`DELETE /api/v1/meeting-circles/:circleId`

Requires creator ownership or Admin role. Closes circle and deletes provider room.

---

## 7. Report Participant
`POST /api/v1/meeting-circles/:circleId/report`

**Request Body:**
```json
{
  "participantId": "65e2a000f8d9a10000",
  "reason": "Inappropriate behavior",
  "comments": "Disrupted discussion."
}
```
