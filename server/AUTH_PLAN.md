# Backend Auth Contract Draft

Backend authentication is planned but not implemented. The current React demo login and localStorage session remain unchanged.

## Planned Routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/refresh`

Current route behavior is `501 Not Implemented` with safe placeholder messages.

## Planned Contracts

- `LoginRequest`
- `LoginResponse`
- `SessionUserDto`
- `RefreshResponse`

Server-side draft types live in `server/src/contracts/auth.ts`. Frontend-safe contract types live in `src/modules/api/apiTypes.ts`.

## Future Implementation Plan

1. Password hashing with a production-grade algorithm such as Argon2id or bcrypt.
2. Server-managed sessions or short-lived JWT access tokens.
3. Refresh token rotation with storage that can be revoked.
4. Role and permission loading from the backend database.
5. Audit logging for login, logout, failed login, refresh, and revoked session events.

## Security Notes

- Do not store plaintext passwords.
- Do not commit secrets or signing keys.
- Do not expose refresh tokens to customer portal links.
- Do not replace frontend login until backend auth has tests, migrations, and rollback support.
