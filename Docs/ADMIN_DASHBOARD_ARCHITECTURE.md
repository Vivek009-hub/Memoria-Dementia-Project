# Admin Dashboard Architecture

## Overview
The Memora Simplified Admin Dashboard provides administrative controls over platform operations across 6 core domains:
1. **Admin Login & Auth**: Server-side credential verification (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), bcrypt password hashing, and HTTP session cookie protection.
2. **Overview**: Real-time DB aggregation for user counts, active users (24h), caregivers, hosts, and scheduled events.
3. **Community Events**: Event lifecycle management (Create, Edit, Publish, Schedule, Cancel) reusing existing `CommunitySession` collection.
4. **Community Voting**: Voting proposal control (Create, Open/Close toggle, Vote count breakdown, Select & Schedule) reusing existing `CommunityProposal` collection.
5. **User Management**: User search, role filtering (`PATIENT`, `CAREGIVER`, `HOST`, `ADMIN`), role changes, status suspension/activation, and backend **Last-Admin Protection**.
6. **Activity Log & Traffic**: Paginated audit logs (`ActivityEvent`) and operational traffic analytics (`TrafficLog`) with range filtering (`today`, `7d`, `30d`).

## System Flow Architecture

```text
ADMIN REACT UI (Client)
  │
  ├── 1. POST /api/v1/auth/login (Backend Auth)
  ├── 2. GET /api/v1/admin/analytics/overview (Real DB Aggregations)
  ├── 3. GET/PATCH /api/v1/admin/users (User Administration & Role Management)
  ├── 4. POST/PATCH /api/v1/admin/community/* (Event & Voting Lifecycle)
  ├── 5. GET /api/v1/admin/analytics/activity (Audit Log)
  └── 6. GET /api/v1/admin/analytics/traffic (Traffic Metrics)
  │
EXPRESS BACKEND SERVER
  │
  ├── Middleware: requireAuth + requireRole('ADMIN')
  ├── Middleware: trafficLogger (Excludes sensitive payloads)
  ├── Last Admin Protection Check (Active ADMIN count > 1)
  │
MONGODB DATABASE
  ├── users
  ├── communitySessions
  ├── communityProposals
  ├── activity_events
  └── traffic_logs
```
