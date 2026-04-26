# Backend Migration Plan and Data Export Mapping

This plan prepares the bridge from the current localStorage app to a future PostgreSQL backend. It does not run a migration and does not change the frontend data source.

## Migration Order

1. Users and roles
2. Customers and vehicles
3. Intakes, inspections, and repair orders
4. Parts, inventory, and purchase orders
5. Payments, expenses, and audit logs
6. Documents and files

## LocalStorage to Database Mapping

| Local module | localStorage key | Future table |
| --- | --- | --- |
| Users | `dvi_phase1_users_v2` | `users` |
| Role permissions | `dvi_phase1_role_permissions_v2` | `role_permissions` |
| Customer accounts | `dvi_phase15a_customer_accounts_v1` | `customers` |
| Intake records | `dvi_phase2_intake_records_v1` | `intakes` |
| Inspection records | `dvi_phase3_inspection_records_v1` | `inspections` |
| Repair orders | `dvi_phase4_repair_orders_v1` | `repair_orders` |
| QC records | `dvi_phase6_qc_records_v1` | `qc_records` |
| Release records | `dvi_phase7_release_records_v1` | `release_records` |
| Parts requests | `dvi_phase8_parts_requests_v1` | `parts_requests` |
| Inventory | `dvi_inventory_items_v1` | `inventory_items` |
| Purchase orders | `dvi_purchase_orders_v1` | `purchase_orders` |
| Supplier directory | `dvi_supplier_directory_v1` | `suppliers` |
| Payments | `dvi_phase10_payment_records_v1` | `payments` |
| Expenses | `dvi_phase53_expense_records_v1` | `expenses` |
| Audit logs | `dvi_phase55_audit_logs_v1` | `audit_logs` |
| Document attachments | `dvi_document_attachments_v1` | `document_attachments` |
| Vehicle service history | `dvi_vehicle_service_history_records_v1` | `service_history` |
| Approval link tokens | `dvi_phase15b_approval_link_tokens_v1` | `approval_link_tokens` |

## Export Format

The frontend helper `src/modules/api/backendMigrationExport.ts` builds a future import bundle with:

- `formatVersion`
- `createdAt`
- `source`
- ordered module exports
- `recordCount`
- original records
- parse warnings
- sync metadata plan

## Sync Metadata Plan

- Preserve the existing browser record ID as `localId`.
- Assign database-generated IDs as `remoteId`.
- Track `lastSyncedAt` only after a successful import or later sync.
- Track `syncStatus` as `Pending`, `Synced`, `Failed`, or `Conflict`.

## Import Endpoint Contract

Future import routes are present as disabled placeholders:

- `POST /api/migration/import-preview`
- `POST /api/migration/import-commit`

The intended flow is:

1. Upload/export localStorage bundle to preview.
2. Validate module counts, required fields, duplicate customers, plate numbers, and attachment size warnings.
3. Review `localId` to `remoteId` mapping.
4. Commit only after explicit confirmation.

The current commit route does not write data.

## Backend Optional Status

The backend can be built, typechecked, and smoke-tested without switching the frontend away from localStorage. Settings may show backend diagnostics, but that panel is informational only.

Current checks:

```bash
npm run server:typecheck
npm run server:build
npm run server:smoke
npx prisma validate
npm run build
```

The future import flow should remain preview-first and non-destructive until users have verified backups and record counts.

## Risky Fields

- `plateNumber`: important identifier, but may have duplicates or formatting drift.
- customer duplicates: customer names and phone numbers may not be normalized.
- legacy missing fields: older records may be missing arrays or nested objects.
- file `dataUrl` size: large local files should move to a file-storage layer.
- AI logs: may include customer-facing draft text that needs retention rules.
- audit logs: can grow quickly and should be preserved carefully.

## Safe Rollback Plan

- Keep localStorage as source of truth during early backend trials.
- Export a full backup before any migration attempt.
- Import one module group at a time.
- Verify counts and sample records before enabling backend reads.
- Do not remove frontend/local-first behavior until the backend is proven.
