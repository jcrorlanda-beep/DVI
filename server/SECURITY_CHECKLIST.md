# Backend Security Checklist

This backend is a foundation only. It is not production-secure until the items below are implemented and verified.

## Secrets

- Never commit `.env` files.
- Treat `DATABASE_URL` as a secret.
- Keep future OpenAI keys backend-only; do not expose production API keys in public frontend builds.
- Keep future SMS provider credentials backend-only.
- Redact credentials, tokens, URLs with passwords, and API keys from logs.

## Authentication

- Current backend auth routes are placeholders.
- Add password hashing before real login. Use a modern password hash such as Argon2id or bcrypt.
- Decide between server sessions and JWTs before enabling production auth.
- If JWTs are used, add refresh token rotation and revocation.
- Require real auth or signed tokens for customer and supplier portal access.

## Authorization

- Admin should retain full access.
- Enforce role and permission checks server-side before enabling backend writes.
- Never expose internal cost, margin, supplier competitor bids, or audit details to customer-facing routes.
- Supplier routes must only expose that supplier's own requests and bids.

## API Hardening

- Add a strict CORS policy for the real deployment origin.
- Add rate limits for login, AI proxy, SMS proxy, and public/customer-facing routes.
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
