# Backend Audit Log API Contract

Centralized audit logging is planned but not enabled yet. Current frontend/localStorage audit logging remains unchanged.

## Planned Routes

- `GET /api/audit-logs`
- `POST /api/audit-logs`

## Filter Query Fields

- `module`
- `userId`
- `dateFrom`
- `dateTo`
- `action`

## Actions To Log Server-Side Later

- Login and logout
- Repair order status changes
- Approval changes
- Payment changes
- Inventory movement
- Purchase order status changes
- Supplier bid viewed/submitted/revised/selected
- AI draft generated/reviewed/copied/used
- Backup/export/restore events

## Safety Rules

- Do not log passwords, API keys, access tokens, refresh tokens, SMS provider secrets, or OpenAI keys.
- Avoid storing full customer messages unless retention policy is approved.
- Preserve immutable audit entries once backend persistence exists.
- Include actor user ID, role, module, action, entity reference, timestamp, and sanitized metadata.
