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

- Current backend auth routes are placeholders.
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

## API Hardening

- Add a strict CORS policy for the real deployment origin.
- Add rate limits for login, AI proxy, SMS proxy, and public/customer-facing routes.
- Keep migration import commit disabled until backup, dry-run, import batch tracking, and rollback procedures are implemented.
- Add request size limits, especially for future document uploads and migration imports.
- Validate every write request server-side.
- Return safe error messages without stack traces in production.

## Data Protection

- Back up PostgreSQL before migrations and import commits.
- Keep import flow preview-first and confirmation-gated.
- Avoid logging secrets, full payment details, or raw API keys.
- Define retention rules for AI drafts, SMS logs, audit logs, and document metadata.

## Deployment Readiness

- Use HTTPS for real deployments.
- Rotate demo passwords before shop use.
- Confirm `.env` is ignored and never bundled.
- Confirm backend diagnostics do not expose credentials.
- Confirm frontend can still run in localStorage mode if backend is offline.
