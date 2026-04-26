# DVI Workshop Management App

DVI is a React + TypeScript workshop management system for repair orders, inspections, release, parts, backjobs, service history, technician productivity, supplier analytics, customer portals, and advisor dashboards.

## Local setup

1. Install dependencies with `npm install`.
2. Start the app with `npm run dev`.
3. Create a production build with `npm run build`.
4. Run end-to-end tests with `npm run test:e2e`.

## Hybrid AI assist

The app uses a local-first hybrid AI setup for advisor communication tools:

1. Ollama local AI first
2. OpenAI cloud fallback
3. Template fallback if both fail

Supported environment variables:

- `VITE_OLLAMA_API_URL`
- `VITE_OLLAMA_MODEL`
- `VITE_OPENAI_API_KEY`

Notes:

- AI content is advisory only and remains reviewable before use.
- API keys are not stored in localStorage.
- The app continues to work without AI.
- Use the Settings page to review AI mode, module toggles, and logs.
- The current AI mode is local-first hybrid by default.
- A future backend proxy path is planned so the frontend will call `/api/ai/generate` instead of exposing provider credentials.

For same-WiFi Ollama use, point `VITE_OLLAMA_API_URL` at the machine running Ollama, such as `http://192.168.1.20:11434`.

## Deployment readiness

- Keep `.env` and `.env.*` out of git.
- Do not hardcode API keys in frontend code.
- Template fallback should remain available when AI providers are offline.

## SMS proxy planning

Current SMS behavior stays frontend-configured for now. The app can use the simulated provider, Android SMS gateway, or Twilio-style settings from the frontend, but credentials remain local-only.

Planned future proxy flow:

- Frontend → `/api/sms/send`
- Backend → SMS provider / Android gateway

Suggested rollout order:

1. Keep current frontend SMS templates and send logs intact
2. Add backend proxy support later
3. Keep a retry queue with `queued`, `sent`, `failed`, and `retry_pending` states

Important notes:

- Do not expose SMS credentials in UI
- Do not store SMS secrets in localStorage
- Keep `Frontend configured` as the default mode until backend proxying is ready

## QuickBooks planning

QuickBooks integration is not implemented yet. The intended mapping is:

- Customers
- Invoices
- Payments
- Expenses
- Purchase orders
- Suppliers / vendors

Recommended first step:

- Export-ready CSV / JSON only
- DVI -> QuickBooks one-way export first
- No live sync, OAuth, or API credentials yet

Important risks to handle later:

- Duplicate customers
- Vehicle identity is not native to QuickBooks
- Service item mapping
- Parts item mapping
- User/license constraints

## Performance notes

Current builds are working, but the app shell is still large and Vite reports a bundle-size warning. The safest future code-splitting candidates are:

- `src/App.tsx`
- Dashboard modules
- Reports and analytics modules
- AI modules
- Large settings and operational pages

Safe optimization ideas for later:

- Memoize expensive summary calculations only where they are already isolated
- Avoid repeated filtering/parsing of large saved record arrays
- Introduce lazy-loaded feature modules only after confirming the routing path stays stable

Do not treat this as a required refactor yet. It is a future performance plan only.

## Backend migration planning

The app is still local-first, but the recommended backend path is:

1. Node.js with Express or NestJS
2. PostgreSQL
3. Prisma ORM
4. File storage layer for documents and attachments
5. Thin API proxy layer for AI and SMS

Suggested migration sequence:

1. Auth, users, and roles
2. Customers and vehicles
3. Intake, inspection, and repair orders
4. Parts, inventory, and purchase orders
5. Payments, expenses, and audit log
6. Files and documents
7. AI and SMS proxy services

LocalStorage-to-database mapping notes:

- Keep the current local keys as migration sources
- Move records in small batches with safe normalization
- Preserve old IDs as `localId` values when assigning remote records
- Track `remoteId`, `lastSyncedAt`, and `syncStatus` during future sync work

Planned API route groups:

- `/api/auth/*`
- `/api/customers/*`
- `/api/vehicles/*`
- `/api/intake/*`
- `/api/inspection/*`
- `/api/repair-orders/*`
- `/api/parts/*`
- `/api/inventory/*`
- `/api/purchase-orders/*`
- `/api/payments/*`
- `/api/expenses/*`
- `/api/audit/*`
- `/api/documents/*`
- `/api/ai/*`
- `/api/sms/*`

Planned database table groups:

- users
- roles
- customers
- vehicles
- intakes
- inspections
- repair_orders
- repair_order_work_lines
- parts_requests
- inventory_items
- purchase_orders
- payments
- expenses
- audit_logs
- documents
- ai_logs
- sms_logs

Risks and fallback plan:

- Keep localStorage support until the backend path is fully proven
- Migrate one module at a time to avoid workflow breakage
- Use export-first fallback if any API integration fails
- Keep AI and SMS proxy traffic behind simple service boundaries
- Do not remove the current frontend-only mode until all core flows are validated

Backend foundation files now live in `server/`. See:

- `server/README.md`
- `server/AUTH_PLAN.md`
- `server/ROLE_PERMISSION_PLAN.md`
- `server/AUDIT_LOG_PLAN.md`
- `server/prisma/schema.prisma`
- `server/MIGRATION_PLAN.md`

The frontend helper `src/modules/api/backendMigrationExport.ts` can prepare a localStorage export bundle for a future backend import, but it does not run migration or change data sources.

## Roadmap notes

- Later: Global UX Declutter Refactor. This is intentionally not implemented in the current operational feature batch.
- Future UX rule: list pages show summaries only, create actions open modal/page, selecting an item opens detail view, and dashboards stay summary-focused.

### UX declutter plan

Modules targeted for the future list-to-detail cleanup:

- Intake
- Inspection
- Repair Orders
- Parts
- QC
- Release
- Backjobs
- Customers / Vehicles
- Reports / Dashboards

Reusable components to introduce later:

- DetailDrawer
- DetailPageShell
- CreateModal
- SummaryListPage
- EmptyState
- BackToListButton

Suggested migration order:

1. Repair Orders
2. Intake
3. Parts
4. QC / Release
5. Customers / Vehicles
6. Dashboards / Reports

## Release notes

- [FRONTEND_RELEASE_NOTES.md](FRONTEND_RELEASE_NOTES.md) contains a stakeholder-facing summary of the current frontend build.
- [FRONTEND_RELEASE_CHECKLIST.md](FRONTEND_RELEASE_CHECKLIST.md) contains the recommended pre-release smoke-test checklist.
