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
- Customer, vehicle, repair order, intake, inspection, parts, inventory, PO, supplier, payment, expense, audit log, and document routes compile.
- AI, SMS, auth, role, and migration import routes are safe placeholders only.
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

AI and SMS proxy routes are placeholders only:

- `POST /api/ai/generate`
- `POST /api/sms/send`

Future AI/SMS proxy work should keep provider secrets on the backend and avoid exposing OpenAI, Twilio, or Android gateway credentials in frontend builds.

Auth middleware is present as a placeholder in `server/src/middleware/auth.ts`. It documents where session/JWT verification and permission checks will be enforced later, but it is not wired into current placeholder routes yet.

## Environment Variables

| Variable | Required now | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | No | Future PostgreSQL connection string used by Prisma. A local fallback is provided by `prisma.config.ts` for validation only. |
| `PORT` | No | Backend HTTP port. Defaults to `4100`. |
| `NODE_ENV` | No | Runtime environment label. |

Do not commit real `.env` values. Use `server/.env.example` for placeholders only.

## Route Map

| Route group | Status |
| --- | --- |
| `GET /api/health` | Active health and optional database readiness response |
| `/api/auth/*` | Contract placeholder only |
| `/api/roles`, `/api/permissions` | Contract placeholder only |
| `/api/customers` | Repository-backed when database is available |
| `/api/vehicles` | Repository-backed when database is available |
| `/api/intakes` | Repository-backed skeleton |
| `/api/inspections` | Repository-backed skeleton |
| `/api/repair-orders` | Repository-backed skeleton with work line include/create support |
| `/api/parts-requests` | Repository-backed skeleton |
| `/api/inventory`, `/api/inventory-movements` | Repository-backed skeleton |
| `/api/purchase-orders` | Repository-backed skeleton |
| `/api/suppliers` | Repository-backed skeleton |
| `/api/payments` | Repository-backed skeleton with basic filters |
| `/api/expenses` | Repository-backed skeleton with basic filters |
| `/api/audit-logs` | Repository-backed skeleton with safe filters |
| `/api/documents` | Metadata-only skeleton; no real file server yet |
| `/api/ai/generate` | Disabled proxy placeholder |
| `/api/sms/send` | Disabled proxy placeholder |
| `/api/migration/import-preview` | Disabled import preview placeholder |
| `/api/migration/import-commit` | Disabled import commit placeholder |

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
