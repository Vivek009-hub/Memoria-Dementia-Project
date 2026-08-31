# MEMORA - GAME PROGRESS HISTORY SPECIFICATION & ARCHITECTURE

## 1. Overview
The Game Progress History subsystem tracks, persists, and reports completed cognitive game sessions for patient users in Memora.

## 2. End-to-End Data Flow

```text
+-------------------+
|  Patient User     |
+---------+---------+
          |
          v
+-------------------+
| 1. Selects Game   |
|    (GameLibrary)  |
+---------+---------+
          |
          v
+-------------------+
| 2. Starts Session | ---> POST /api/v1/games/:gameId/sessions (Backend validates & returns { id })
+---------+---------+
          |
          v
+-------------------+
| 3. Plays & Finishes|
|    Cognitive Game |
+---------+---------+
          |
          v
+-------------------+
| 4. Saves Result   | ---> POST /api/v1/games/sessions/:sessionId/complete (Atomic update status -> COMPLETED)
+---------+---------+
          |
          v
+-------------------+
| 5. Database Write | ---> Saved to `gameSessions` collection with completedAt & score
+---------+---------+
          |
          v
+-------------------+
| 6. Progress View  | ---> GET /api/v1/games/history (Queries DB sorted by completedAt DESC)
+-------------------+
```

## 3. Database Model & Schema Contracts

- **Collection**: `gameSessions`
- **Ownership**: `patientId` (Mongoose ObjectId ref `User`)
- **Key Fields**:
  - `patientId`: ObjectId (Required)
  - `gameId`: ObjectId (Required)
  - `startedAt`: Date (Default: `Date.now`)
  - `completedAt`: Date
  - `status`: String (`STARTED` | `COMPLETED` | `ABANDONED`)
  - `difficulty`: String (`EASY` | `MEDIUM` | `HARD`)
  - `score`: Number
  - `accuracy`: Number (0–100)
  - `responseTimeMs`: Number
  - `hintsUsed`: Number
  - `mistakes`: Number
  - `metadata`: Mixed

## 4. API Endpoint Definitions

- `POST /api/v1/games/:gameId/sessions`: Patient starts a session.
- `POST /api/v1/games/sessions/:sessionId/complete`: Patient submits completed session results.
- `GET /api/v1/games/history`: Patient fetches own game session history (`completedAt` DESC).
- `GET /api/v1/games/patients/:patientId/history`: Authorized caregiver (`viewCognitiveActivity: true`) fetches patient history.

## 5. Security & Patient Isolation
- Authenticated session (`req.user.id`) determines patient identity.
- Unauthenticated requests return `401 Unauthorized`.
- Cross-patient requests without authorized caregiver permissions return `403 Forbidden`.
