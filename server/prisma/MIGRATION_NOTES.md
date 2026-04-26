# Prisma Schema Draft Notes

This schema is a first-pass draft for a future PostgreSQL migration. It is intentionally not wired to the React app yet.

## Core Rules

- Preserve browser `localStorage` mode until each module is migrated and verified.
- Store previous frontend IDs in `localId` for rollback and reconciliation.
- Use `plateNumber` as a major vehicle lookup field, but avoid treating plate alone as globally unique without cleanup.
- Keep flexible `Json` fields where frontend records still vary heavily between phases.

## Suggested Migration Order

1. Users, roles, and permissions
2. Customers and vehicles
3. Intakes, inspections, repair orders, and work lines
4. Parts requests, inventory, purchase orders, and suppliers
5. Payments, expenses, and audit logs
6. Document attachments and file storage references
7. AI/SMS logs and backend proxy-only records

## Validation Risks

- Legacy records may be missing optional arrays such as inspection media or booking requested services.
- Customers and vehicles may have duplicates that require manual review.
- Attachment `dataUrl` payloads should move to file storage, not database text columns.
- Audit logs and AI logs can grow quickly; plan archival/retention before production use.
