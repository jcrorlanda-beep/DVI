# Backend Security Checklist

This backend is a foundation only. It is not production-secure until the items below are implemented and verified.

## Secrets

- Never commit `.env` files.
- Treat `DATABASE_URL` as a secret.
- Keep future OpenAI keys backend-only; do not expose production API keys in public frontend builds.
- Keep future SMS provider credentials backend-only.
- Redact credentials, tokens, URLs with passwords, and API keys from logs.
- Audit log create routes redact sensitive keys such as passwords, tokens, API keys, OpenAI keys, SMS credentials, and database URLs before storage.

## Authentication

- Backend auth foundation exists, but frontend login remains local until an explicit cutover phase.
- Backend auth now uses server-side password hashing and session-token hashing for the optional backend foundation.
- Set `AUTH_TOKEN_SECRET` or `SESSION_SECRET` to at least 32 random characters before using backend auth routes.
- Rotate token secrets and invalidate sessions before production if a development secret was ever used.
- Decide between server sessions and JWTs before enabling production auth.
- If JWTs are used, add refresh token rotation and revocation.
- Keep session expiration short enough for shop-device risk; default backend foundation TTL is 480 minutes.
- Account lockout is modeled with `status` and `failedLoginCount`; review thresholds before production use.
- Require real auth or signed tokens for customer and supplier portal access.

## Authorization

- Admin should retain full access.
- Enforce role and permission checks server-side before enabling backend writes.
- Never expose internal cost, margin, supplier competitor bids, or audit details to customer-facing routes.
- Supplier routes must only expose that supplier's own requests and bids.
- AI and SMS proxy routes are protected by placeholder advisor-tool permissions until production scoping and rate limits are implemented.
- Document metadata routes are internal by default; customer-visible sharing must remain explicit.
- File upload/retrieval routes require `documents.manage`; customer-facing routes must use explicit customer-visible metadata and future signed tokens.
- Backup/restore and migration routes must remain restricted to `backup.restore`.
- Never return `passwordHash`, raw session tokens, token secrets, provider API keys, SMS credentials, or database URLs from API responses.

## API Hardening

- Add a strict CORS policy for the real deployment origin.
- Set `CORS_ORIGIN` to the exact production frontend origin; do not leave wildcard CORS for public production.
- Add rate limits for login, AI proxy, SMS proxy, and public/customer-facing routes.
- Keep migration import commit disabled until backup, dry-run, import batch tracking, and rollback procedures are implemented.
- Add request size limits, especially for future document uploads and migration imports.
- Keep `MAX_UPLOAD_MB` conservative and enforce allowed file types on every upload.
- Never return raw filesystem paths to the frontend or customer portal.
- Validate every write request server-side.
- Return safe error messages without stack traces in production.

## Data Protection

- Back up PostgreSQL before migrations and import commits.
- Keep import flow preview-first and confirmation-gated.
- Avoid logging secrets, full payment details, or raw API keys.
- Define retention rules for AI drafts, SMS logs, audit logs, and document metadata.
- Back up backend file storage separately from PostgreSQL; uploaded files are not contained in database backups.
- Customer-visible documents are default-deny and must be manually reviewed before exposure.
- Document/file pilot routes must stay guarded and optional; localStorage remains the frontend source of truth.
- Never expose raw file paths, storage roots, supplier quotes, competitor bids, margins, audit notes, staff-only notes, or credentials through customer document responses.
- Public customer downloads require signed preview/download tokens before production use.
- Audit document/file pilot attempts without logging raw file content, secrets, or private filesystem paths.
- Supplier bid privacy must be regression-tested before supplier portal cutover.

## Production QA Gate

- [ ] `NODE_ENV=production` environment validation has no errors.
- [ ] `DATABASE_URL` points to the intended PostgreSQL instance.
- [ ] `AUTH_TOKEN_SECRET` or `SESSION_SECRET` is unique, random, and at least 32 characters.
- [ ] HTTPS is enabled.
- [ ] CORS is restricted.
- [ ] `.env` and backup files are not committed.
- [ ] OpenAI/SMS credentials are backend-only.
- [ ] `AI_PROXY_ENABLED` and `SMS_PROXY_ENABLED` are intentionally set.
- [ ] Real SMS is not enabled until test sends and opt-in controls are complete.
- [ ] Migration commit is disabled by default.
- [ ] Backup and restore drill has passed.
- [ ] Customer/supplier portal has real auth or signed-token access before public deployment.

## Deployment Readiness

- Use HTTPS for real deployments.
- Rotate demo passwords before shop use.
- Confirm `.env` is ignored and never bundled.
- Confirm backend diagnostics do not expose credentials.
- Confirm frontend can still run in localStorage mode if backend is offline.
