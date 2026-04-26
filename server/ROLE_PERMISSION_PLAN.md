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

## Sensitive Backend Route Review

These backend route groups should remain protected before any frontend backend-data cutover:

- `audit.view`: audit log reads/writes.
- `backup.restore`: migration preview and future import commit routes.
- `finance.summary`: invoices, payments, expenses, reconciliation, and management estimate reports.
- `inventory.manage`: inventory, inventory movements, purchase orders, and receiving contracts.
- `supplier.manage`: supplier records and internal bid comparison.
- `documents.manage`: internal document metadata and customer-visible flag changes.
- `advisor.tools`: AI and SMS proxy routes until production scoping is finalized.

Customer-facing backend responses must never include internal cost, margin, supplier bids, competitor bids, audit details, or private document metadata.

Supplier-facing backend responses must only include that supplier's own bid/request context unless the user is internal management/admin.

## Role Sync Strategy

1. Import current frontend role definitions as backend roles.
2. Preserve frontend permission keys as backend permission keys.
3. Add `localId` values where existing role definitions include stable IDs.
4. Keep a rollback path where frontend local role settings can still be used if backend sync fails.

## Migration Risks

- Custom role changes in localStorage may not match future backend defaults.
- Restricted roles must not accidentally gain access to cost/margin/supplier bid data.
- Admin must never be locked out during sync.
- Placeholder middleware is not a substitute for production auth; it only provides a safe contract boundary during backend build-out.
