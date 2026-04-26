# Backend Role and Permission Contract Plan

The backend role and permission API is a contract draft only. Current frontend role logic remains unchanged.

## Planned Routes

- `GET /api/roles`
- `GET /api/permissions`
- `PATCH /api/roles/:role/permissions`

## Current Frontend Mapping

The frontend already uses role names such as:

- Admin
- Manager
- Service Advisor
- Office Staff
- Inventory Control
- Chief Technician
- Senior Mechanic
- General Mechanic
- Reception
- OJT

Backend roles should preserve these labels during migration to avoid locking existing users out.

## Admin Full-Access Rule

Admin must always retain access to:

- Role and permission management
- Audit logs
- Backup and restore
- Margin/profit views
- Inventory cost and PO cost
- Supplier bid comparison
- Settings

## Role Sync Strategy

1. Import current frontend role definitions as backend roles.
2. Preserve frontend permission keys as backend permission keys.
3. Add `localId` values where existing role definitions include stable IDs.
4. Keep a rollback path where frontend local role settings can still be used if backend sync fails.

## Migration Risks

- Custom role changes in localStorage may not match future backend defaults.
- Restricted roles must not accidentally gain access to cost/margin/supplier bid data.
- Admin must never be locked out during sync.
