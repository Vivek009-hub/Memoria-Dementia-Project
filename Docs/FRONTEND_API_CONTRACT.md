# Memora — Frontend API Contract Specification

**Version:** 1.0  
**Phase:** F0 — Frontend Foundation  

---

## Canonical API Mapping

| Domain Module | Client Module | Endpoint Path | Method | Auth | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Auth (B2) | `authApi.js` | `/api/v1/auth/login` | POST | None | Public |
| Auth (B2) | `authApi.js` | `/api/v1/auth/register` | POST | None | Public |
| Auth (B2) | `authApi.js` | `/api/v1/auth/me` | GET | Cookie | Any |
| Auth (B2) | `authApi.js` | `/api/v1/auth/logout` | POST | Cookie | Any |
| Users (B3) | `usersApi.js` | `/api/v1/users/me` | GET/PATCH | Cookie | Any |
| Patients (B3) | `patientsApi.js` | `/api/v1/patients/me` | GET/PATCH | Cookie | Patient |
| Caregivers (B3) | `caregiversApi.js` | `/api/v1/caregivers/relationships` | GET/POST | Cookie | Caregiver |
| Games (B4) | `gamesApi.js` | `/api/v1/games` | GET | Cookie | Patient |
| Memories (B5) | `memoriesApi.js` | `/api/v1/memories` | GET/POST | Cookie | Patient/Caregiver |
| Reminders (B6) | `remindersApi.js` | `/api/v1/reminders` | GET/POST | Cookie | Patient/Caregiver |
| Community (B7) | `communityApi.js` | `/api/v1/community/sessions` | GET | Cookie | Patient |
| Meetings (B8) | `meetingsApi.js` | `/api/v1/meetings` | GET | Cookie | Patient |
| Notifications (B9) | `notificationsApi.js` | `/api/v1/notifications` | GET/PATCH | Cookie | Any |
| Analytics (B10) | `analyticsApi.js` | `/api/v1/analytics/me/overview` | GET | Cookie | Patient/Caregiver |
| AI Assistant (B11) | `aiApi.js` | `/api/v1/ai/chat` | POST | Cookie | Patient |
| Safety & SOS (B12) | `safetyApi.js` | `/api/v1/safety/sos` | POST | Cookie | Patient |

---

## Response Format Standard

All API requests return the standardized JSON format:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses return:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-facing error description"
  }
}
```
