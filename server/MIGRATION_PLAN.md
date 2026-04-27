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

## Cutover Control Guards

The frontend now has planning-only cutover controls. These controls do not switch the data source and do not write to the backend.

- Data mode defaults to `localStorage`.
- Backend read-only and write modes remain guarded.
- Backend write mode is locked until a future explicit pilot phase.
- Settings diagnostics can compare local counts with backend counts for customers, vehicles, and repair orders.
- Sync conflict helpers identify duplicate customers, duplicate plates, duplicate RO numbers, and local records updated after import metadata.
- The cutover checklist tracks backups, migration preview, duplicate review, role review, portal safety, supplier privacy, AI/SMS proxy checks, and rollback planning.

## Multi-Device Cutover Plan

Cutover must be staged. Do not switch the entire frontend to backend mode at once.

1. Export a full localStorage backup from the frontend Backup / Export Center.
2. Back up PostgreSQL and file storage if backend test data already exists.
3. Run migration preview for customers and vehicles.
4. Fix duplicate customer, duplicate plate, and missing-link warnings.
5. Enable `MIGRATION_COMMIT_ENABLED=true` only in a controlled migration window.
6. Import customers and vehicles first.
7. Verify customer and vehicle counts plus sample records.
8. Import intake, repair order, inspection, QC, release, backjob, and service-history data.
9. Import business modules: parts, inventory, purchase orders, suppliers, invoices, payments, expenses, and documents.
10. Verify counts, links, audit records, and customer-visible document flags.
11. Enable backend read-only mode for a pilot group if that mode exists.
12. Enable backend write mode only after read-only parity testing.
13. Keep localStorage backup and backend backup available for rollback.

Cutover risks:

- duplicate customers
- duplicate plates or conduction numbers
- missing customer/vehicle/RO links
- localStorage and backend divergence during migration
- file storage folder not matching document metadata
- user/role mismatch between frontend accounts and backend users
- simultaneous editing from multiple browsers during migration
- old localStorage records with legacy field names

Conflict detection concepts before sync:

- same `localId`, different backend `remoteId`
- same RO number, different payload
- same plate number across multiple vehicle records
- same customer name/phone across multiple customer records
- local record updated after backend import
- backend record updated after local export

Conflict statuses should remain informational until a later resolution phase: `none`, `warning`, `conflict`, and `needsReview`. No automatic conflict resolution should run during preview or pilot mode.

Rollback rule: if counts or sample records do not match expectations, keep frontend in localStorage mode, disable backend write flags, and restore backend database/file storage from the pre-cutover backup if needed.

## Document / File Backend Pilot

The document/file pilot is not a full cutover.

- Document metadata may be written through guarded `/api/pilot/documents` routes only when the write pilot is explicitly enabled.
- File upload testing may use `/api/files/upload`; responses must return `fileId`/`storageKey`, not raw server paths.
- localStorage document metadata remains the frontend source of truth until a future cutover phase.
- Customer-visible documents are default-deny. `customerVisible=true` requires explicit review and must never be the default.
- Customer portal document routes must return redacted customer DTOs only.
- Signed download/preview tokens are still required before customer downloads are production-ready.
- Bulk file migration is not automatic. Preview file metadata first, then upload files in controlled batches later.
- Rollback requires restoring both PostgreSQL document metadata and the paired file storage folder/archive.

---

## Cutover Pilot Phases (220–223)

### Phase 220 — Backend Read-Only Pilot Panel

The Settings page now includes a full entity comparison table (9 entities):
customers, vehicles, intakes, repair orders, inspections, parts requests, inventory items, payments, expenses.

Each row shows: local count, backend count, status label (Not checked / Counts match / Mismatch detected / Backend unavailable / Needs review).

Requirements:
- App Data Mode must be `backendReadOnly` in Settings.
- Backend server must be running.
- No writes occur during comparison.

### Phase 221 — Migration Preview UI

The Settings page now has a **Migration Preview** card.

Workflow:
1. Click "Run Migration Preview".
2. The frontend reads all entity arrays from localStorage.
3. It POSTs to `/api/migration/core/import-preview` and `/api/migration/business/import-preview`.
4. Results are displayed in three categories: Core Data, Business Modules, and Preview Metadata.
5. If the backend is offline, a local-only analysis is shown instead.

The preview is **preview-only**. No data is imported or committed.
When completed, the `migrationPreviewCompleted` flag is set to `true` in local state,
which allows the `evaluateBackendReadiness` guard to include it in readiness scoring.

### Phase 222 — Write Pilot Guard

The Settings page now has a **Write Pilot Guard** card (admin-only).

Requirements display:
- Backend health online
- Database connected
- Migration preview completed
- Backup confirmed (local + database from cutover checklist)
- Cutover checklist complete
- Backend readiness guard passed

The "Enable Write Pilot" button is disabled with explanation. No writes occur.
A future phase will open the enable path once all requirements are verified.

Write pilot status:
- **Locked**: One or more requirements not met.
- **Ready for admin testing**: All requirements met (enable path still disabled in this phase).
- **Blocked**: Readiness guard is blocked.

### Phase 223 — Write Pilot API Contracts

Frontend contracts: `src/modules/api/writePilotContracts.ts`
- `WritePilotWriteResult` DTO
- `WritePilotConflict` and `WritePilotConflictResponse` DTOs
- Stub functions for createCustomer, createVehicle, createIntake, createRo — all return `skipped_locked`

Backend route stubs: `server/src/routes/writePilot.ts`
- `GET /api/write-pilot/status` → `{ enabled: false, status: "locked" }`
- `POST /api/write-pilot/customers` → 423 Locked
- `POST /api/write-pilot/vehicles` → 423 Locked
- `POST /api/write-pilot/intakes` → 423 Locked
- `POST /api/write-pilot/repair-orders` → 423 Locked

All backend write-pilot routes require no auth in this stub phase but will require admin auth
before the enable path is opened.

### Required Checklist Before Opening Write Pilot Enable Path

- [ ] Backend health check: online
- [ ] Database connection: confirmed
- [ ] Migration preview: run and reviewed
- [ ] Local backup: exported and verified
- [ ] Database backup: confirmed
- [ ] File storage backup: confirmed (if documents are in scope)
- [ ] Cutover checklist: all items checked
- [ ] Duplicate customers: resolved or acknowledged
- [ ] Duplicate plates: resolved or acknowledged
- [ ] RO number conflicts: resolved or acknowledged
- [ ] User/role sync: verified
- [ ] Customer portal access: verified
- [ ] Supplier privacy: verified
- [ ] AI/SMS proxy: verified
- [ ] Rollback plan: documented and tested
- [ ] Maintenance window: announced to staff

---

## Write Pilot Phases (225–239)

### Phase 225 — Customer Backend Write Pilot

Adds `POST /api/pilot/customers` and `PATCH /api/pilot/customers/:localId`.
Requires `WRITE_PILOT_ENABLED=true` on the backend server.
If not enabled: returns `{ syncStatus: "skipped_locked" }` — a no-op, not an error.
If enabled: runs name/phone/email duplicate checks before writing to Prisma.

Frontend helper: `createCustomerBackendPilot()`, `updateCustomerBackendPilot()` in
`src/modules/api/writePilotHelpers.ts`.

localStorage customer flow is unchanged — pilot is called in addition, not instead.

### Phase 226 — Vehicle Backend Write Pilot

Adds `POST /api/pilot/vehicles` and `PATCH /api/pilot/vehicles/:localId`.
Duplicate checks: plate number, conduction number, and customer/make/model/year match.
Missing plate and conduction number returns `syncStatus: "failed"`.

### Phase 227 — Intake Backend Write Pilot

Adds `POST /api/pilot/intakes` and `PATCH /api/pilot/intakes/:localId`.
Conflict checks: duplicate intake number (against different localId), missing intake number.
Idempotency: if the same localId already synced (same intakeNumber + same localId), returns existing `remoteId`.
Preserves: intake number, customer/vehicle link, odometer, concern, requested services.

### Phase 228 — Repair Order Backend Write Pilot

Adds `POST /api/pilot/repair-orders` and `PATCH /api/pilot/repair-orders/:localId`.
Conflict checks: duplicate RO number (against different localId).
PATCH strips internal cost/margin fields (`unitCost`, `costTotal`, `margin`, `profit`) before updating.
Preserves: RO number, customer/vehicle/intake references, status, work lines.

### Phase 229 — Write Pilot Status UI + QA

- `src/modules/api/writePilotAttemptLog.ts`: localStorage-backed attempt log (max 200 entries).
  Key: `dvi_write_pilot_attempt_log_v1`.
- Settings page: new "Backend Write Pilot Status" card showing last attempt per entity type,
  recent attempt log (collapsible), and a footer safety note.
- `BackendPilot` added to `AuditLogModule` type — pilot events appear in the audit log.

### Phase 230 — Inspection Backend Write Pilot

Adds `POST /api/pilot/inspections` and `PATCH /api/pilot/inspections/:localId`.
Conflict check: duplicate inspection number (against different localId).
Idempotency: if same localId already synced to same inspectionNumber, returns existing `remoteId`.
Frontend helper: `createInspectionBackendPilot()`, `updateInspectionBackendPilot()`.

### Phase 231 — QC Record Backend Write Pilot

Adds `POST /api/pilot/qc` and `PATCH /api/pilot/qc/:localId`.
Conflict check: duplicate QC number (against different localId).
Idempotency: if same localId already synced to same qcNumber, returns existing `remoteId`.
Frontend helper: `createQcBackendPilot()`, `updateQcBackendPilot()`.

### Phase 232 — Release Record Backend Write Pilot

Adds `POST /api/pilot/releases` and `PATCH /api/pilot/releases/:localId`.
Conflict check: duplicate release number (against different localId).
Idempotency: if same localId already synced to same releaseNumber, returns existing `remoteId`.
Frontend helper: `createReleaseBackendPilot()`, `updateReleaseBackendPilot()`.

### Phase 233 — Backjob + Service History Backend Write Pilot

Adds `POST /api/pilot/backjobs`, `PATCH /api/pilot/backjobs/:localId`,
`POST /api/pilot/service-history`, and `PATCH /api/pilot/service-history/:localId`.
Backjob: conflict check on duplicate backjob number (against different localId).
Service history: no unique number field — localId idempotency guard only.
Frontend helpers: `createBackjobBackendPilot()`, `updateBackjobBackendPilot()`,
`createServiceHistoryBackendPilot()`, `updateServiceHistoryBackendPilot()`.

### Phase 234 — Workflow Pilot Status UI + QA

- `WritePilotEntityType` extended: adds `"inspection"`, `"qcRecord"`, `"releaseRecord"`, `"backjob"`, `"serviceHistory"`.
- `getPilotAttemptSummary()` now returns all 9 entity types.
- Settings "Backend Write Pilot Status" card now shows all 9 entity rows (4 core + 5 workflow).

### Phase 235 — Parts Request Backend Write Pilot

Adds `POST /api/pilot/parts-requests` and `PATCH /api/pilot/parts-requests/:localId`.
Idempotency check on `requestNumber`. Validates positive quantity.
Privacy: `bids` and `selectedBidId` stripped from payload — competitor bid data is never written to the backend.
Frontend helpers: `createPartsRequestBackendPilot()`, `updatePartsRequestBackendPilot()`.

### Phase 236 — Inventory Backend Write Pilot

Adds `POST /api/pilot/inventory`, `PATCH /api/pilot/inventory/:localId`,
and `POST /api/pilot/inventory/:itemLocalId/movements`.
Inventory item: informational SKU duplicate check (not @unique in schema). Negative `quantityOnHand` blocked on create.
Privacy: `unitCost` and `sellingPrice` stripped from item payload — internal cost fields.
Movement: requires item localId path param resolved to backend remoteId. Zero-quantity blocked.
Frontend helpers: `createInventoryItemBackendPilot()`, `updateInventoryItemBackendPilot()`, `createInventoryMovementBackendPilot()`.

### Phase 237 — Purchase Order / Supplier Backend Write Pilot

Adds `POST/PATCH /api/pilot/purchase-orders`, `POST/PATCH /api/pilot/suppliers`,
and stub routes `POST/PATCH /api/pilot/supplier-bids`.
Purchase order: idempotency check on `poNumber`. Privacy: `totalCost` stripped — internal cost field.
Supplier: informational name duplicate check (supplierName is not @unique in schema). Requires non-empty `supplierName`.
Supplier bids: no separate `SupplierBid` model in Prisma schema. Bid data is embedded as JSON in `PartsRequest.bids`.
  Supplier bid routes are stubs that always return `syncStatus: "skipped_locked"` — competitor bid data is never written to the backend.
Frontend helpers: `createPurchaseOrderBackendPilot()`, `updatePurchaseOrderBackendPilot()`,
  `createSupplierBackendPilot()`, `updateSupplierBackendPilot()`,
  `createSupplierBidBackendPilot()` (sync no-op), `updateSupplierBidBackendPilot()` (sync no-op).

### Phase 238 — Payments / Expenses / Invoices Backend Write Pilot

Adds `POST/PATCH /api/pilot/payments`, `POST/PATCH /api/pilot/expenses`,
and `POST/PATCH /api/pilot/invoices`.
Payments: validates amount > 0. `paymentsRepository.create()` calls `preparePaymentInputForPersistence` internally to resolve RO/invoice links.
Expenses: validates amount > 0.
Invoices: validates total >= 0. Idempotency check on `invoiceNumber`.
No accounting integration, no tax logic, no QuickBooks sync.
Frontend helpers: `createPaymentBackendPilot()`, `updatePaymentBackendPilot()`,
  `createExpenseBackendPilot()`, `updateExpenseBackendPilot()`,
  `createInvoiceBackendPilot()`, `updateInvoiceBackendPilot()`.

### Phase 239 — Business Backend Pilot Status UI + QA

- `WritePilotEntityType` extended to 17 types: adds `"partsRequest"`, `"inventoryItem"`, `"inventoryMovement"`, `"purchaseOrder"`, `"supplier"`, `"payment"`, `"expense"`, `"invoice"`.
- `getPilotAttemptSummary()` now returns all 17 entity types.
- Settings "Backend Write Pilot Status" card now shows all 17 entity rows.
- Business write pilot rules enforced:
  - localStorage remains the default source of truth
  - No automatic sync, no automatic migration
  - Conflicts must be reviewed before any future cutover
  - Cost/margin fields stripped from all business module payloads
  - Supplier competitor bids never written to backend
  - No accounting or QuickBooks integration
  - Backend offline does not affect localStorage flow

### Phase 240 — Document Metadata Backend Write Pilot

Adds `POST /api/pilot/documents`, `PATCH /api/pilot/documents/:localId`, `DELETE /api/pilot/documents/:localId`.
Payload validated by `validateDocumentPilotPayload()`: requires `fileName`, `sourceModule`; rejects sensitive patterns
(`password`, `token`, `secret`, `.env`, `key.pem`, etc.); blocks path traversal sequences.
`customerVisible` defaults to `false` (default-deny); documents with `customerVisible=true` are flagged for review before any customer portal exposure.
Raw file paths (`storagePath`, `storageRoot`) are never returned to the frontend or customer routes.
Frontend helpers: `createDocumentBackendPilot()`, `updateDocumentBackendPilot()`, `deleteDocumentBackendPilot()`.

### Phase 241 — File Upload Backend Write Pilot

Adds pilot helpers for binary file storage: `uploadFileBackendPilot()`, `getFileBackendPilot()`, `deleteFileBackendPilot()`.
All helpers are guarded by `isBackendWritePilotRequested()` and operate through `/api/pilot/files/*` routes.
`FILE_STORAGE_ROOT`/`UPLOAD_STORAGE_ROOT` is resolved server-side and never exposed in API responses.
Allowed file extensions enforced by `MAX_UPLOAD_MB` environment variable.
Pilot file uploads are small-batch only; bulk upload automation is blocked until signed tokens and a production backup routine exist.

### Phase 242 — Customer-Safe Document Sharing Pilot

Adds customer-facing read helpers: `listCustomerVisibleDocuments()`, `getCustomerVisibleDocument()`.
Default-deny: only documents with `customerVisible=true` are returned. Raw paths never included.
Internal documents (staff notes, audit attachments, supplier quotes, cost sheets) are never exposed.
Signed preview/download tokens are required before production customer portal use; pilot stubs return placeholder safe links.

### Phase 243 — Document/File Pilot Attempt Log + Settings UI

`WritePilotEntityType` extended to 20 types: adds `"document"`, `"fileUpload"`, `"customerDocument"`.
`getPilotAttemptSummary()` now returns all 20 entity types.
`appendDocumentPilotAttempt(entityType, localId, label, result)` helper added for document/file-specific logging.
Settings page now includes a custom **Document / File Backend Pilot Status** card showing:
- File storage status and `MAX_UPLOAD_MB` config
- Last pilot attempt for each of: document, fileUpload, customerDocument
- Per-attempt sync status, localId, remoteId, and any warning/conflict message

### Phase 244 — Document/File Pilot QA + Documentation

Build suite: `npm run build` ✓ clean (116 modules), `npm run server:typecheck` ✓ clean.
Documentation updates: DEPLOYMENT.md updated to Phase 225–244 (3 document routes added to route table, entity count updated to 20, document privacy rules added); server/MIGRATION_PLAN.md updated with Phase 240–244 per-phase docs; server/SECURITY_CHECKLIST.md updated with document/file pilot security rules (default-deny customer docs, no raw paths, signed tokens required for production); server/BACKUP_RESTORE_PLAN.md updated with file storage backup guidance (database + file storage must be backed up as one unit).

### Write Pilot Rules (applies to all pilot routes)

- Write pilot is **optional and guarded**.
- `WRITE_PILOT_ENABLED` must be `true` in the backend environment to perform writes.
- localStorage remains the default and active source of truth regardless of pilot status.
- No automatic sync, no automatic migration, no automatic overwrite.
- Conflicts must be reviewed manually before any future cutover.
- Each write pilot attempt is logged to localStorage and to the app audit log.
- Backend is identified by `remoteId` (Prisma CUID). Frontend uses `localId` (localStorage key).
- localId → remoteId mapping is stored in the pilot attempt log for traceability.
- Export a full backup before enabling any migration commit.

### Write Pilot Rollback

At any point, stop the write pilot by:
1. Setting `WRITE_PILOT_ENABLED=false` (or unsetting it) and restarting the backend.
2. Setting `AppDataMode` back to `localStorage` in Settings → Backend Proxy Planning.
3. No localStorage data is modified by the pilot — rollback is immediate and safe.
