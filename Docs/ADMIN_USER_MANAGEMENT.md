# Admin User Management & Security Documentation

## Overview
Admin User Management enables searching, filtering, role updating, and account suspension for platform user accounts.

## Endpoints

### 1. List Users
`GET /api/v1/admin/users`
- **Query Params**: `q` (search string), `role` (`PATIENT`, `CAREGIVER`, `HOST`, `ADMIN`), `status` (`active`, `suspended`), `page`, `limit`

### 2. Update User Role
`PATCH /api/v1/admin/users/:userId/role`
- **Body**: `{ "role": "HOST" }`
- **Security Check**: Enforces **Last Admin Protection**. If the target user is currently an `ADMIN` and the request attempts to change their role while active admin count <= 1, returns `HTTP 400 (LAST_ADMIN_PROTECTION)`.

### 3. Update User Status
`PATCH /api/v1/admin/users/:userId/status`
- **Body**: `{ "isActive": false }`
- **Security Check**: Enforces **Last Admin Protection**. Prevents suspending the sole remaining active administrator account.
