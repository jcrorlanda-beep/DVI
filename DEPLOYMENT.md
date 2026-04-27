# DVI Workshop Management App — Deployment Guide

## Overview

DVI is a React + TypeScript + Vite single-page application.  
All data is stored in **browser localStorage** — no backend server or database is required.  
The app runs entirely in the browser after the static build files are served.

---

## Requirements

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | Build only |
| npm | 9+ | Build only |
| Any static file server | — | nginx, serve, Vite preview |
| Modern browser | Chrome/Edge/Firefox | Required for localStorage |

---

## Build for Production

```bash
# Install dependencies
npm install

# Build
npm run build
# Output: dist/

# Preview locally
npm run preview
```

The `dist/` folder contains all static files. Serve it with any web server.

---

## Serving on the Same Wi-Fi Network

Any device on the same Wi-Fi network can access the app.

### Option A — Vite preview (dev/testing)

```bash
npm run preview -- --host 0.0.0.0 --port 4173
```

Access from other devices: `http://<your-machine-IP>:4173`

For deployment tradeoffs, see `DEPLOYMENT_PROFILES.md`.

### Option B — serve (lightweight static server)

```bash
npx serve dist --listen 0.0.0.0:4173
```

### Option C — nginx (production)

```nginx
server {
  listen 80;
  root /path/to/dist;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

**Find your machine IP:**
- Windows: `ipconfig` → IPv4 Address
- macOS/Linux: `ifconfig` or `ip addr`

---

## Environment Variables

Environment variables are injected **at build time** by Vite using the `VITE_` prefix.

### Available Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_OPENAI_API_KEY` | Optional | OpenAI API key for AI-assisted draft generation |
| `VITE_OLLAMA_BASE_URL` | Optional | Ollama base URL (default: `http://localhost:11434`) |
| `VITE_DVI_API_URL` | Optional | Future backend API URL for diagnostics and later integration testing |
| `VITE_DVI_USE_BACKEND` | Optional | Future backend data flag. Defaults off; localStorage remains active |

### Setup

Create a `.env` file in the project root (already gitignored):

```env
# .env  — never commit this file
VITE_OPENAI_API_KEY=sk-...
VITE_OLLAMA_BASE_URL=http://localhost:11434
```

> ⚠ **API Key Safety:** The OpenAI key is embedded in the built JS bundle if set at build time.  
> Do not deploy a build with a production API key to a public URL without additional access control.

### Optional Backend Foundation

The backend foundation is parallel and optional. It does not replace browser localStorage yet.

```bash
npm run server:typecheck
npm run server:build
npm run server:dev
npm run server:smoke
```

Use `VITE_DVI_API_URL=http://localhost:4100` only for backend diagnostics or future integration testing. The frontend remains localStorage-first until a later migration phase explicitly changes the data source.

Current backend capabilities are still migration-prep oriented:

- Health and diagnostics route.
- Backend auth foundation with hashed passwords and hashed bearer-session storage when PostgreSQL and `AUTH_TOKEN_SECRET` are configured.
- Repository-backed slices for core records, finance records, audit logs, and document metadata when PostgreSQL is available.
- Read-only migration preview across major localStorage module groups.
- Core shop-data migration preview for customers, vehicles, intakes, repair orders, and work lines.
- Workflow migration preview for inspections, QC, release/handover, backjobs, and service history.
- Business-module migration preview for parts requests, inventory, purchase orders, suppliers, payments, expenses, invoices, and document metadata.
- Disabled import commit contract.
- Lite AI/SMS proxy stubs with no live provider calls.

Do not treat this backend as production-ready until production auth, CORS, rate limits, database migrations, file storage, backups, and import rollback are complete.

Production security gate:

- backend auth secret configured and never committed
- HTTPS enabled
- `CORS_ORIGIN` restricted to the deployed frontend origin
- OpenAI and SMS provider credentials backend-only
- supplier bid privacy verified
- customer-visible documents default-deny and manually reviewed
- audit logs redacting secrets
- backup/restore and migration permissions restricted
- `MIGRATION_COMMIT_ENABLED=false` unless running a controlled migration window
- `AI_PROXY_ENABLED` and `SMS_PROXY_ENABLED` intentionally set, with real SMS disabled until tested
- rate limiting planned before public exposure
- real customer/supplier portal auth or signed tokens planned before public links

For core migration testing, keep `MIGRATION_COMMIT_ENABLED` unset or `false` by default. Enable it only in a backed-up test environment after reviewing preview output. The frontend remains localStorage-first until an explicit cutover phase.

Workflow migration is preview-only in this batch. Treat inspection media as metadata only; no real file storage is active yet.

Business-module migration is also preview-only. Supplier bids remain privacy-scoped, document records remain metadata-only, and customer-visible documents should be manually reviewed before any future import commit.

Backend file storage foundations are available for controlled testing only. The frontend Document Center still works in local metadata/preview mode unless a later cutover enables backend uploads.

Document/file backend pilot rules:

- localStorage Document Center remains the default source of truth.
- Backend metadata writes use `/api/pilot/documents` only when the write pilot guard is explicitly enabled.
- Backend file uploads use `/api/files/upload` and must not expose raw server paths to the frontend or customer portal.
- Customer-visible documents are default-deny and must be explicitly reviewed before exposure.
- Customer-facing document responses must hide supplier quotes, competitor bids, internal costs, margins, audit notes, staff-only notes, credentials, and raw file paths.
- Signed preview/download tokens are required before public customer downloads are production-ready.
- Bulk file migration is not automatic; upload/link records one at a time during pilot testing.
- If backend document metadata and file storage get out of sync, keep localStorage as source of truth and restore backend database/file storage from the paired backup.

Backend file env vars:

| Variable | Required | Description |
|----------|----------|-------------|
| `FILE_STORAGE_ROOT` / `UPLOAD_STORAGE_ROOT` | Optional | Folder for backend file uploads. Defaults to `server/uploads`. |
| `MAX_UPLOAD_MB` | Optional | Maximum upload size in MB. Defaults to `10`. |

Allowed upload types are images, PDFs, text-like files, and common doc-like files. The backend returns `fileId` and `storageKey`, never arbitrary server paths.

Production storage options:

- Simple server deployment: store files on a dedicated server disk path and back it up.
- Synology deployment: point `FILE_STORAGE_ROOT` at a protected shared folder.
- Future scale: use S3-compatible/object storage and keep only metadata in PostgreSQL.

Backup warning: database backups are not enough once real file uploads are enabled. The file storage folder must be backed up with the database.

### Backend Database Backup / Restore Plan

Use `server/BACKUP_RESTORE_PLAN.md` as the operator runbook before multi-device production use.

Minimum backup set:

- PostgreSQL dump from `pg_dump`
- file storage folder/archive from `FILE_STORAGE_ROOT`
- app commit/version note
- migration preview output if a migration is being prepared

Recommended schedule:

- daily after shop close
- before every migration/import test
- before every deployment update
- before enabling backend write/cutover mode

Restore should be drilled against a staging database first. Do not run destructive restore commands automatically from the app.

### Multi-Device Backend Cutover Plan

True multi-device shared data requires the backend, PostgreSQL, shared file storage, and tested role/auth behavior. Use this staged sequence:

1. Export localStorage backup.
2. Run migration preview.
3. Fix duplicate and missing-link warnings.
4. Enable import commit only during a controlled migration window.
5. Import customers and vehicles first.
6. Import intake, RO, and workflow data.
7. Import business modules.
8. Verify record counts and sample records.
9. Enable backend read-only mode if available.
10. Enable backend write mode only after testing.
11. Keep rollback backups.

Cutover risks include duplicate customers/plates, localStorage/backend divergence, file-storage mismatch, role mismatches, and simultaneous editing during migration. Avoid multi-browser editing until backend write mode is proven.

### Reading env vars in code

```ts
const apiKey = import.meta.env.VITE_OPENAI_API_KEY ?? "";
```

---

## Local AI with Ollama

The app supports a hybrid AI mode: Ollama (local, private) with OpenAI fallback.

### Setup Ollama

1. Install from https://ollama.com
2. Pull a model:
   ```bash
   ollama pull llama3.2
   # or
   ollama pull mistral
   ```
3. Start the server:
   ```bash
   ollama serve
   # Runs on http://localhost:11434 by default
   ```
4. In the app → Settings → AI Configuration → select **Ollama (Local)**

### Same-Network Ollama Access

To allow other devices on the same Wi-Fi to use Ollama:

```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

Set `VITE_OLLAMA_BASE_URL=http://<host-machine-IP>:11434` in `.env`.

---

## OpenAI Fallback

When Ollama is unavailable or returns an error, the app falls back to the OpenAI API.

- Set `VITE_OPENAI_API_KEY` in `.env`
- In the app → Settings → AI Configuration → select **OpenAI** or **Auto (Ollama → OpenAI fallback)**
- Fallback advisor text is used when both providers are unavailable

---

## Android SMS Gateway (Optional)

For SMS approval link dispatch, configure the SMS provider in  
**Settings → SMS Provider**.

| Provider | Notes |
|----------|-------|
| Simulated | Default — no real SMS sent |
| Android SMS Gateway | Self-hosted app on an Android phone |
| Twilio | Cloud SMS service |

Configuration is stored in localStorage (not in code or env).

---

## Backup Recommendation

Since all data lives in **browser localStorage**:

- Export a backup regularly via **Backup & Export → Download Backup**
- Store the `.json` file externally (USB drive, cloud storage, email)
- Restore by pasting the JSON in the **Restore** section
- **Do not clear browser data** without first exporting a backup
- Different browsers on different devices have **separate localStorage** — data is not synced automatically

---

## API Key Security Checklist

- [x] `.env` and `.env.*` are in `.gitignore`
- [x] No API keys hardcoded in source files
- [x] `VITE_OPENAI_API_KEY` is read from environment only — never stored in localStorage
- [x] Android SMS Gateway API key is stored in localStorage (user-entered in Settings), not in code
- [x] Twilio credentials are stored in localStorage (user-entered in Settings), not in code
- [ ] If deploying to a shared/public server: add HTTP Basic Auth or VPN to protect the app and embedded keys

---

## Data Reset

To reset all app data:

1. In the app → Settings → scroll to "Danger Zone" → **Reset All Data**  
   OR
2. Clear the site's localStorage in browser DevTools:  
   `Application → Storage → Local Storage → Clear All`

---

## Ports Summary

| Service | Default Port |
|---------|-------------|
| Vite dev server | 5173 |
| Vite preview | 4173 |
| Ollama API | 11434 |
| nginx (production) | 80 / 443 |

---

## Troubleshooting

| Issue | Likely Cause | Fix |
|-------|-------------|-----|
| White screen on load | JavaScript error or corrupted localStorage | Open DevTools Console; or clear localStorage |
| AI features not working | Missing API key or Ollama not running | Check Settings → AI Configuration |
| "Port in use" | Another process on the same port | Use `--port <other>` flag |
| Data lost after browser update | Browser cleared storage | Restore from backup JSON |
| Other devices can't connect | Firewall or wrong IP | Allow the port in firewall; verify IP with `ipconfig` |

---

## Backend Cutover Pilot (Phase 220–223)

### Current State

- **localStorage is still the default and only active data source.**
- Backend exists in parallel but is not used for any live data by default.
- No automatic sync, no automatic migration, no automatic overwrite.

### Read-Only Pilot

The Settings page (Admin only) includes a **Backend Read-Only Pilot Panel** that compares
local (localStorage) record counts against backend record counts for all major entities:
customers, vehicles, intakes, repair orders, inspections, parts requests, inventory items,
payments, and expenses.

This is purely a diagnostic comparison — no data is merged, overwritten, or imported.
To run it, the App Data Mode must be set to `backendReadOnly` in Settings → Backend Proxy Planning,
and the backend server must be running.

### Migration Preview

The **Migration Preview** card in Settings runs a preview analysis of what a future backend
migration would include based on current localStorage data.

- If the backend is online: sends local data to the backend preview endpoints (`/api/migration/core/import-preview`, `/api/migration/business/import-preview`) and shows the server-side analysis.
- If the backend is offline: runs a local-only analysis using conflict detection helpers.

The preview is **read-only**. No data is written to the backend or removed from localStorage.

### Write Pilot Guard

The **Write Pilot Guard** card in Settings shows the current write-pilot status (Locked by default).
It requires all of the following before the enable path can be opened:

1. Backend health online
2. Database connected
3. Migration preview completed
4. Backup confirmed (local + database)
5. Cutover checklist complete
6. Backend readiness guard passed

The enable button is disabled and locked in this phase. A future phase will open the enable path
after all requirements are verified.

### Write Pilot API Contracts

The backend exposes locked write-pilot stubs at:
- `GET  /api/write-pilot/status` → always returns `{ enabled: false, status: "locked" }`
- `POST /api/write-pilot/customers` → 423 Locked
- `POST /api/write-pilot/vehicles` → 423 Locked
- `POST /api/write-pilot/intakes` → 423 Locked
- `POST /api/write-pilot/repair-orders` → 423 Locked

Frontend contracts are in `src/modules/api/writePilotContracts.ts`.
All write functions are no-ops that log a warning and return `syncStatus: "skipped_locked"`.

### Rollback Plan

At any time, the app can be reverted to pure localStorage mode:
1. Set App Data Mode back to `localStorage` in Settings → Backend Proxy Planning.
2. No data migration is needed — localStorage was never replaced.
3. The backend server can be stopped without affecting the frontend.

### Warning: Simultaneous Editing During Migration

Do NOT allow staff to create records in the frontend while a migration commit is in progress.
Simultaneous editing after a migration commit can create split data between localStorage and the backend.
Announce a brief maintenance window before any future migration commit.

---

## Backend Write Pilot (Phase 225–244)

### Current State

- **localStorage is still the default and only active data source.**
- Backend write pilot is **opt-in only** — requires `WRITE_PILOT_ENABLED=true` on the server.
- No automatic sync, no automatic migration, no automatic overwrite.
- Each pilot write attempt is logged to localStorage and the app audit log.

### Write Pilot Routes

| Route | Phase | Description |
|-------|-------|-------------|
| `POST /api/pilot/customers` | 225 | Create customer in backend (pilot) |
| `PATCH /api/pilot/customers/:localId` | 225 | Update customer by localId (pilot) |
| `POST /api/pilot/vehicles` | 226 | Create vehicle in backend (pilot) |
| `PATCH /api/pilot/vehicles/:localId` | 226 | Update vehicle by localId (pilot) |
| `POST /api/pilot/intakes` | 227 | Create intake in backend (pilot) |
| `PATCH /api/pilot/intakes/:localId` | 227 | Update intake by localId (pilot) |
| `POST /api/pilot/repair-orders` | 228 | Create repair order in backend (pilot) |
| `PATCH /api/pilot/repair-orders/:localId` | 228 | Update RO by localId (pilot) |
| `POST /api/pilot/inspections` | 230 | Create inspection in backend (pilot) |
| `PATCH /api/pilot/inspections/:localId` | 230 | Update inspection by localId (pilot) |
| `POST /api/pilot/qc` | 231 | Create QC record in backend (pilot) |
| `PATCH /api/pilot/qc/:localId` | 231 | Update QC record by localId (pilot) |
| `POST /api/pilot/releases` | 232 | Create release record in backend (pilot) |
| `PATCH /api/pilot/releases/:localId` | 232 | Update release record by localId (pilot) |
| `POST /api/pilot/backjobs` | 233 | Create backjob record in backend (pilot) |
| `PATCH /api/pilot/backjobs/:localId` | 233 | Update backjob record by localId (pilot) |
| `POST /api/pilot/service-history` | 233 | Create service history record in backend (pilot) |
| `PATCH /api/pilot/service-history/:localId` | 233 | Update service history record by localId (pilot) |
| `POST /api/pilot/parts-requests` | 235 | Create parts request in backend (pilot) |
| `PATCH /api/pilot/parts-requests/:localId` | 235 | Update parts request by localId (pilot) |
| `POST /api/pilot/inventory` | 236 | Create inventory item in backend (pilot) |
| `PATCH /api/pilot/inventory/:localId` | 236 | Update inventory item by localId (pilot) |
| `POST /api/pilot/inventory/:localId/movements` | 236 | Create inventory movement linked to item (pilot) |
| `POST /api/pilot/purchase-orders` | 237 | Create purchase order in backend (pilot) |
| `PATCH /api/pilot/purchase-orders/:localId` | 237 | Update purchase order by localId (pilot) |
| `POST /api/pilot/suppliers` | 237 | Create supplier in backend (pilot) |
| `PATCH /api/pilot/suppliers/:localId` | 237 | Update supplier by localId (pilot) |
| `POST /api/pilot/supplier-bids` | 237 | Stub — no SupplierBid model; always returns skipped_locked |
| `PATCH /api/pilot/supplier-bids/:localId` | 237 | Stub — no SupplierBid model; always returns skipped_locked |
| `POST /api/pilot/payments` | 238 | Create payment in backend (pilot) |
| `PATCH /api/pilot/payments/:localId` | 238 | Update payment by localId (pilot) |
| `POST /api/pilot/expenses` | 238 | Create expense in backend (pilot) |
| `PATCH /api/pilot/expenses/:localId` | 238 | Update expense by localId (pilot) |
| `POST /api/pilot/invoices` | 238 | Create invoice in backend (pilot) |
| `PATCH /api/pilot/invoices/:localId` | 238 | Update invoice by localId (pilot) |
| `POST /api/pilot/documents` | 240 | Create document metadata in backend (pilot) |
| `PATCH /api/pilot/documents/:localId` | 240 | Update document metadata by localId (pilot) |
| `DELETE /api/pilot/documents/:localId` | 240 | Delete document metadata by localId (pilot) |

All routes return HTTP 200 with `{ syncStatus: "skipped_locked" }` when `WRITE_PILOT_ENABLED` is not set.

### Enabling the Write Pilot

Set the server environment variable before starting the backend:

```bash
WRITE_PILOT_ENABLED=true npm run server:dev
```

Or in a `.env` file for the server (never commit this):

```env
WRITE_PILOT_ENABLED=true
```

**Requirements before enabling:**
1. Run migration preview and review results.
2. Export a full localStorage backup.
3. Confirm database backup exists.
4. Resolve duplicate customers, plates, and RO numbers.
5. Complete the Cutover Safety Checklist in Settings.
6. Announce a maintenance window to staff.

### Response Shape

All pilot routes return:

```json
{
  "success": true,
  "data": {
    "localId": "the-frontend-local-id",
    "remoteId": "cuid-from-backend-or-null",
    "syncStatus": "synced | conflict | skipped_locked | failed",
    "warning": "optional message",
    "conflictReason": "optional conflict description"
  }
}
```

### Conflict Handling

- `syncStatus: "conflict"` — duplicate or missing-link detected; no write performed.
- `syncStatus: "skipped_locked"` — pilot not enabled; no write performed.
- `syncStatus: "failed"` — backend unavailable or validation error; no write performed.
- `syncStatus: "synced"` — record created/updated in backend; `remoteId` is populated.

Conflicts are informational. The frontend still saves to localStorage regardless.
Review conflicts before any future migration commit.

### Write Pilot Status UI

The Settings page includes a **Backend Write Pilot Status** card showing:
- Last pilot attempt per entity type (all 20: customer, vehicle, intake, repair order, inspection, QC record, release record, backjob, service history, parts request, inventory item, inventory movement, purchase order, supplier, payment, expense, invoice, document, file upload, customer document)
- Sync status, local ID, remote ID, and conflict/warning message
- Recent attempt log (collapsible, last 20)
- Refresh and admin-only clear log actions

**Privacy rules enforced in pilot routes:**
- Parts requests: `bids` and `selectedBidId` stripped — competitor bid data never written to backend
- Inventory items: `unitCost` and `sellingPrice` stripped — internal cost fields
- Purchase orders: `totalCost` and `cost` stripped — internal cost field
- Supplier bids: no separate model; routes return `skipped_locked` always
- No accounting integration, no tax logic, no QuickBooks sync
- Documents: customer-visible sharing is default-deny; raw file paths never returned; internal/staff-only documents never exposed to customer routes
- File upload/retrieval routes (`uploadFileBackendPilot`, `getFileBackendPilot`, `deleteFileBackendPilot`) are pilot-only; file storage root is never exposed in responses
- Customer document routes (`listCustomerVisibleDocuments`, `getCustomerVisibleDocument`) require explicit `customerVisible=true` per document; signed download tokens required before production use

### Rollback

To stop the write pilot at any time:
1. Remove or set `WRITE_PILOT_ENABLED=false` and restart the backend.
2. Set `AppDataMode` back to `localStorage` in Settings → Backend Proxy Planning.
3. localStorage is not affected — rollback is immediate and safe.
