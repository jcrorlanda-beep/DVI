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

### Customer / Vehicle Preview

`POST /api/migration/import-preview` now includes a customer/vehicle preview summary when the request contains direct `customers` and `vehicles` arrays or matching module records.

The preview reports:

- total customers
- total vehicles
- duplicate customer name/phone warnings
- duplicate plate warnings
- vehicles missing both plate and conduction number
- records ready
- records needing review

The preview is intentionally read-only. It does not write to PostgreSQL, does not delete localStorage data, and does not overwrite existing backend records.

### Intake / Inspection / Repair Order Preview

`POST /api/migration/import-preview` also includes a workflow preview summary when the request contains direct `intakes`, `inspections`, `repairOrders`, or matching module records.

The preview reports:

- total intakes
- total inspections
- total repair orders
- total work lines detected inside repair orders
- approval metadata detected inside work lines
- missing customer or vehicle links
- duplicate RO numbers
- invalid or unrecognized statuses
- records ready
- records needing review

This is preview-only. It does not write intake, inspection, repair order, work line, or approval records to PostgreSQL.

### Parts / Inventory / PO / Supplier Preview

`POST /api/migration/import-preview` also includes a parts and inventory preview summary when the request contains direct records or matching module exports for parts requests, inventory items, inventory movements, purchase orders, and suppliers.

The preview reports:

- total parts requests
- total inventory items
- total inventory movements
- total purchase orders
- total suppliers
- missing linked RO warnings
- duplicate SKU or part-number warnings
- negative stock warnings
- missing supplier warnings
- invalid PO statuses
- records ready
- records needing review

This is preview-only. It does not write parts, inventory, purchase order, supplier, or bid data to PostgreSQL.

### Business Modules Preview

`POST /api/migration/business/import-preview` provides a focused preview for business-operation modules:

- parts requests
- supplier bids embedded in parts requests
- inventory items
- inventory movements
- purchase orders
- PO receiving events
- suppliers
- invoices
- payments
- expenses
- document metadata

The preview reports:

- total records by type
- records ready
- records needing review
- missing RO, vehicle, and supplier links
- duplicate SKUs / part numbers
- duplicate PO numbers
- duplicate supplier names
- invalid payment and expense amounts
- invalid document metadata
- negative stock warnings
- customer-visible document warnings

This preview is read-only. It does not write to PostgreSQL, does not update stock, does not overwrite backend data, and does not delete localStorage.

### Full Migration Preview

`POST /api/migration/import-preview` now also returns a `fullPreview` object that aggregates all major localStorage module groups:

- customers
- vehicles
- intakes
- inspections
- repair orders
- work lines
- approvals
- parts requests
- supplier bids
- inventory
- inventory movements
- purchase orders
- suppliers
- invoices
- payments
- expenses
- audit logs
- documents

The full preview reports:

- total records
- valid records
- duplicate warnings
- missing link warnings
- invalid status warnings
- records ready
- records needing review

Import commit remains disabled by default. `MIGRATION_COMMIT_ENABLED=true` only unlocks the contract response for future work; it does not currently perform destructive writes.

### Core Shop Data Preview / Commit Contract

The first real backend migration slice focuses only on core shop records:

- customers
- vehicles
- intakes
- repair orders
- work lines

Routes:

- `POST /api/migration/core/import-preview`
- `POST /api/migration/core/import-commit`

The core preview reports:

- total records by type
- records ready
- records needing review
- duplicate customers
- duplicate plates
- missing customer links
- missing vehicle links
- invalid statuses
- duplicate intake numbers
- duplicate RO numbers

The core commit route is protected by the backend `backup.restore` permission and is disabled unless `MIGRATION_COMMIT_ENABLED=true`.

Even when the flag is enabled, the current route requires dry-run review and blocks commits when preview warnings exist. It does not overwrite existing backend data and does not delete localStorage. Record creation remains intentionally disabled until an operator-tested migration writer is added.

Recommended operator flow:

1. Export a full frontend backup.
2. Run `/api/migration/core/import-preview`.
3. Resolve duplicates and missing links.
4. Store the preview output with the backup.
5. Only then enable `MIGRATION_COMMIT_ENABLED=true` in a controlled backend environment.
6. Keep localStorage as source of truth until a later frontend cutover phase.

### Workflow Migration Preview

The next workflow migration slice prepares backend persistence and preview coverage for:

- inspections
- QC records
- release / handover records
- backjob / recheck records
- service history records

Routes:

- `GET /api/inspections`
- `GET /api/qc-records`
- `GET /api/release-records`
- `GET /api/backjob-records`
- `GET /api/service-history`
- `POST /api/migration/workflow/import-preview`

The workflow preview reports:

- total records by type
- records ready
- records needing review
- missing RO links
- missing vehicle links
- missing customer links
- invalid statuses
- duplicate inspection / QC / release / backjob numbers
- invalid service history dates
- invalid odometer values

Known workflow data risks:

- Missing RO links can prevent QC, release, and backjob records from attaching cleanly.
- Inspection media remains metadata-only until real file storage is implemented.
- Legacy localStorage records may use older field names or nested structures.
- Status names may not match backend reporting expectations yet.
- Service history writeback can create duplicates if old local records were written more than once.

This preview is read-only. It does not write PostgreSQL records, delete localStorage, or switch frontend data sources.

### Business Module Persistence Status

The backend now has repository-backed persistence preparation for business modules when PostgreSQL is available:

- parts requests with RO, vehicle/plate, and supplier fallback linkage
- inventory items and explicit inventory movement logging
- purchase orders with supplier, RO, parts-request linkage and visible receiving events
- suppliers with management-only CRUD and supplier-bid privacy helpers
- invoices, payments, and expenses with finance-safe filters and link fallback
- document metadata with internal-only default and customer-visible review warnings

The frontend still uses localStorage for these modules. Backend routes are for controlled migration/testing only until a later cutover phase.

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
- Keep import batch IDs, `localId` to `remoteId` mapping, `importedAt`, and `importedBy` metadata before any future commit implementation.
