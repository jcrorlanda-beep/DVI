# DVI Backend Foundation

This folder is a safe, parallel backend foundation for the DVI Workshop Management App.

The frontend still runs in localStorage mode. Nothing in this server folder replaces or migrates current browser data yet.

## Recommended Production Stack

- Node.js + Express or NestJS
- PostgreSQL
- Prisma ORM
- Dedicated file storage for documents and attachments
- Backend proxy routes for AI and SMS credentials

## Current Status

- Backend is optional and parallel to the React/Vite frontend.
- Frontend data remains localStorage-first until a later migration phase explicitly changes it.
- TypeScript Node HTTP starter with centralized response/error helpers.
- Health route: `GET /api/health`.
- Customer, vehicle, repair order, intake, inspection, parts, inventory, PO, supplier, invoice, payment, expense, audit log, and document metadata routes compile.
- Customer, vehicle, intake, and repair order routes are the first core shop persistence slice prepared for controlled migration testing.
- Inspection, QC, release, backjob, and service-history routes are prepared as the next workflow persistence slice.
- Parts requests, inventory, purchase orders, suppliers, finance records, and document metadata now have business-module persistence preparation for controlled backend testing.
- AI and SMS proxy routes are lite backend stubs behind placeholder permission checks; they do not call live providers yet.
- Migration import preview is read-only across all major module groups. Import commit remains disabled by default.
- Backend auth has a lite login foundation for future backend sessions, but the frontend still uses its existing local login.
- Environment placeholders live in `.env.example`.
- Prisma 7 config is handled by the repo-root `prisma.config.ts`.
- No production auth, automatic migration, or frontend data-source switching yet.

## Commands

From the repo root:

```bash
npm run server:typecheck
npm run server:build
npm run server:dev
npm run server:smoke
npx prisma validate
```

The starter server defaults to port `4100`.

`npm run server:smoke` starts the backend on an ephemeral local port, checks the health route, and verifies that the expected route skeletons are registered. It does not require PostgreSQL to be running.

The seed draft lives at `server/prisma/seed.ts`. It prepares roles, permissions, and a demo customer/vehicle for later database testing, but it is not run automatically.

## Safety Notes

- Do not commit real `.env` files or credentials.
- Keep frontend localStorage mode enabled until backend modules are migrated one at a time.
- Treat this server as preparation only until auth, database migrations, backups, and import validation are complete.
- Prisma 7 reads the datasource URL from `prisma.config.ts`, not from `schema.prisma`.
- Review `SECURITY_CHECKLIST.md` before any real deployment or live data import.

## API Response Wrapper

The backend uses a simple JSON wrapper for all routes:

- `success: true` with `data`
- `success: false` with `error` and optional `validationErrors`

The customer and vehicle routes are the first ones wired beyond placeholder responses. Audit log routes also accept safe filters:

- `module`
- `userId`
- `action`
- `dateFrom`
- `dateTo`

AI and SMS proxy routes are optional/future-only lite stubs:

- `POST /api/ai/generate`
- `POST /api/sms/send`

Future AI/SMS proxy work should keep provider secrets on the backend and avoid exposing OpenAI, Twilio, or Android gateway credentials in frontend builds.

Auth middleware is present in `server/src/middleware/auth.ts`. It can read the backend-lite development token returned by `/api/auth/login` or simulated `x-dvi-*` request headers for controlled backend testing.

Protected backend route groups:

- `/api/audit-logs` requires `audit.view`.
- `/api/migration/*` requires `backup.restore`.
- `/api/invoices`, `/api/payments`, `/api/expenses`, `/api/finance/*`, and `/api/reports/*` require `finance.summary`.
- `/api/inventory`, `/api/inventory-movements`, and `/api/purchase-orders` require `inventory.manage`.
- `/api/documents` requires `documents.manage`.
- `/api/ai/generate` and `/api/sms/send` require `advisor.tools`.

Backend auth currently uses a lightweight `scrypt` password hash helper from Node's standard library. This avoids adding native auth dependencies during the optional-backend phase. Before production, replace the stateless development token with signed sessions or JWT refresh-token rotation and revisit password policy/hashing requirements.

Backend auth foundation status:

- `POST /api/auth/login` verifies username/email plus password against backend users when PostgreSQL is available.
- Password hashes are never returned in API responses.
- Login success/failure counters are updated when the database is available.
- Session tokens are random bearer tokens and only HMAC hashes are stored in `auth_sessions`.
- `POST /api/auth/logout` revokes the stored session token when supplied.
- `GET /api/auth/me` verifies backend session tokens, with simulated `x-dvi-*` headers still available for controlled backend testing.
- Frontend login still uses localStorage until a later cutover phase.

## Environment Variables

| Variable | Required now | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | No | Future PostgreSQL connection string used by Prisma. A local fallback is provided by `prisma.config.ts` for validation only. |
| `PORT` | No | Backend HTTP port. Defaults to `4100`. |
| `NODE_ENV` | No | Runtime environment label. |
| `AUTH_TOKEN_SECRET` | Yes for backend auth sessions | At least 32 random characters. Used to hash/verify bearer session tokens. |
| `AUTH_SESSION_TTL_MINUTES` | No | Session lifetime. Defaults to 480 minutes. |

Do not commit real `.env` values. Use `server/.env.example` for placeholders only.

## Route Map

| Route group | Status |
| --- | --- |
| `GET /api/health` | Active health and optional database readiness response |
| `/api/auth/*` | Contract placeholder only |
| `/api/roles`, `/api/permissions` | Contract placeholder only |
| `/api/customers` | Repository-backed when database is available |
| `/api/vehicles` | Repository-backed when database is available |
| `/api/intakes` | Repository-backed core slice with local/remote link fallback |
| `/api/inspections` | Repository-backed workflow slice with intake/RO/customer/vehicle fallback and metadata-only media |
| `/api/qc-records` | Repository-backed workflow slice for QC checklist/result metadata |
| `/api/release-records` | Repository-backed workflow slice for handover/release metadata |
| `/api/backjob-records` | Repository-backed workflow slice for recheck/backjob metadata |
| `/api/service-history` | Repository-backed workflow slice for completed service history |
| `/api/repair-orders` | Repository-backed core slice with intake/customer/vehicle fallback and work line persistence |
| `/api/repair-orders/:id/work-lines` | Work-line list/add/update backend contract; customer-safe response omits internal cost |
| `/api/repair-orders/:id/approvals`, `/api/approvals` | Approval metadata contract placeholders |
| `/api/parts-requests` | Repository-backed business slice with RO/vehicle/supplier fallback linkage |
| `/api/inventory`, `/api/inventory-movements` | Repository-backed business slice with explicit movement logging and negative-stock protection |
| `/api/purchase-orders` | Repository-backed business slice with partial receiving events and over-receive protection |
| `/api/suppliers` | Repository-backed management slice with supplier-bid privacy helpers |
| `/api/invoices` | Repository-backed finance slice |
| `/api/payments` | Repository-backed skeleton with basic filters |
| `/api/expenses` | Repository-backed skeleton with basic filters |
| `/api/finance/reconciliation` | Read-only reconciliation preview contract |
| `/api/reports/profit`, `/api/reports/revenue`, `/api/reports/expenses` | Management-estimate report contracts |
| `/api/audit-logs` | Repository-backed with filters, detail read, and secret redaction on create |
| `/api/documents` | Metadata-only repository slice; no real file server yet |
| `/api/ai/generate` | Lite proxy stub; no live provider calls or exposed keys |
| `/api/sms/send` | Lite proxy stub; simulated queue response only |
| `/api/migration/import-preview` | Read-only full import preview across major module groups |
| `/api/migration/import-commit` | Disabled import commit contract; no writes by default |
| `/api/migration/core/import-preview` | Read-only core shop-data preview |
| `/api/migration/core/import-commit` | Disabled-by-default core shop-data commit contract |
| `/api/migration/workflow/import-preview` | Read-only workflow-data preview for inspection/QC/release/backjob/service history |
| `/api/migration/business/import-preview` | Read-only business-module preview for parts/inventory/PO/suppliers/finance/documents |

## Prisma 7 Notes

Prisma 7 reads datasource configuration from `prisma.config.ts`, not from `server/prisma/schema.prisma`.

Validation command:

```bash
npx prisma validate
```

In restricted environments, set `PRISMA_SCHEMA_ENGINE_BINARY` to the installed schema engine binary before running validation.

## Future Migration Flow

1. Keep frontend localStorage as the source of truth.
2. Export a backup from the frontend Backup / Export Center.
3. Run backend import preview only.
4. Review counts, duplicates, missing plate numbers, and file-size warnings.
5. Commit only after explicit confirmation in a later migration phase.
6. Enable backend reads module-by-module after parity testing.
