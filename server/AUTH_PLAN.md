# Backend Auth Hardening Plan

Backend authentication is implemented as a backend foundation. The current React demo login and localStorage session remain unchanged and are not connected to this backend yet.

## Planned Routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/refresh`

Current behavior:

- `POST /api/auth/login` validates against backend seed/demo-style user records when a database is available.
- `POST /api/auth/logout` revokes the current backend session token when supplied.
- `GET /api/auth/me` verifies the backend session token or simulated `x-dvi-*` headers for controlled backend testing.
- `POST /api/auth/refresh` remains a safe placeholder until refresh-token rotation is implemented.

## Planned Contracts

- `LoginRequest`
- `LoginResponse`
- `SessionUserDto`
- `RefreshResponse`

Server-side draft types live in `server/src/contracts/auth.ts`. Frontend-safe contract types live in `src/modules/api/apiTypes.ts`.

## Future Implementation Plan

1. Keep password hashing server-side only. The current Node `scrypt` helper is acceptable for development; production should revisit Argon2id or bcrypt with audited parameters.
2. Choose one session model before frontend cutover:
   - Server session: easier revocation, requires session store.
   - JWT access token plus refresh token: better stateless reads, requires rotation, revocation, and replay protection.
3. Add refresh token rotation with hashed token storage and device/session metadata.
4. Add password reset flow with single-use expiring tokens and audit logging.
5. Add account lockout/rate limiting for repeated failed logins.
6. Load role/permission grants from the backend database and preserve Admin full access.
7. Audit login, logout, failed login, refresh, password reset, permission change, and revoked session events.

## Security Notes

- Do not store plaintext passwords.
- Do not commit secrets or signing keys.
- Do not expose refresh tokens to customer portal links.
- Do not replace frontend login until backend auth has tests, migrations, and rollback support.
- Customer and supplier portals need real auth or signed, scoped access tokens before production use.
