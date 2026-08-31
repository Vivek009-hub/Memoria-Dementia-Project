# Admin Security & Authorization Specification

## Key Security Controls

1. **Server-Side Authentication**:
   - Initial admin credentials (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) are loaded strictly server-side.
   - Admin passwords are never exposed or embedded in client JS bundles.

2. **Backend Role Authorization**:
   - All `/api/v1/admin/*` endpoints strictly require `requireAuth` + `requireRole('ADMIN')`.
   - Access attempts from `PATIENT`, `CAREGIVER`, `HOST`, or unauthenticated callers return `403 Forbidden` / `401 Unauthorized`.

3. **Last-Admin Protection**:
   - Prevents revoking admin role or suspending status when `activeAdminCount <= 1`.

4. **Privacy Scope Limits**:
   - No patient live GPS surveillance map.
   - No private patient AI conversation viewer.
