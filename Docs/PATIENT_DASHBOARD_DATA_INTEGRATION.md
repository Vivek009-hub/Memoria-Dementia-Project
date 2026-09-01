# MEMORA PATIENT DASHBOARD DATA INTEGRATION

## Executive Summary
This document defines the real backend data integration for the Memora Patient Overview / Dashboard and Analytics pages. All placeholder, hardcoded, and fallback mock values have been removed. All dynamic overview statistics, today's schedule timeline, and recent activity logs are fetched directly from MongoDB database collections.

---

## Data-Flow Architecture

```text
Authenticated Patient (JWT)
         ↓
GET /api/v1/analytics/me/overview
GET /api/v1/reminders
GET /api/v1/notifications?limit=5
         ↓
Backend Controllers & Aggregators
  • GameSession (games completed & avg accuracy)
  • ReminderLog / Reminder (daily routine & adherence)
  • Memory (active memory count)
  • SessionRegistration / CommunityVote (community attendances)
  • ActivityEvent / Notifications (recent activity log)
         ↓
MongoDB Collections
         ↓
Real Patient-Specific Data
         ↓
Patient Dashboard UI
```

---

## Integration Details

| Metric / Element | Database Model / Source | API Endpoint | Query / Aggregation |
| :--- | :--- | :--- | :--- |
| **Daily Routine Completion** | `ReminderLog` / `Reminder` | `GET /api/v1/analytics/me/overview` | Count completed vs total scheduled logs for patient |
| **Brain Practice Played** | `GameSession` | `GET /api/v1/analytics/me/overview` | Count completed sessions & average accuracy |
| **Memory Vault Count** | `Memory` | `GET /api/v1/analytics/me/overview` | Count active memory documents for `patientId` |
| **Community Attendance** | `SessionRegistration` | `GET /api/v1/analytics/me/overview` | Count attended sessions for `patientId` |
| **Today's Schedule** | `Reminder` | `GET /api/v1/reminders` | Query active patient reminders for today |
| **Recent Activity Log** | `ActivityEvent` / `Notification` | `GET /api/v1/notifications?limit=5` | Sort recent events by `timestamp` DESC |

---

## Security & Patient Isolation
- **Authentication**: JWT token validation required on all `/api/v1/analytics/me/overview` endpoints.
- **Patient Isolation**: All queries strictly enforce `patientId: req.user.id` or authorized caregiver pairing.
- **IDOR Protection**: Manipulating `patientId` in query parameters or URL paths is denied unless user has caregiver/admin role relationship.

---

## Fallback & Error Handling
- **No Mock Fallbacks**: Hardcoded fallback state objects (`remindersCompleted: 5, gamesCompleted: 4`, etc.) have been completely removed.
- **Zero States**: When a new patient has 0 records, the UI cleanly renders `0 / 0%` and empty state banners ("No reminders scheduled for today", "No recent activity recorded yet").
- **Error States**: Network/API errors display an error banner with a manual "Try Again" refetch button.
