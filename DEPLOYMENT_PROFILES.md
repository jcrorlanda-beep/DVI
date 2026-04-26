# Deployment Profiles

These profiles compare common ways to run the app. True shared multi-device data requires the backend, PostgreSQL, shared file storage, and tested auth/roles.

## Local Shop PC / Same-WiFi

Pros:
- simplest path
- low cost
- good for early shop trials

Cons:
- localStorage is per browser/device until backend cutover
- main PC must stay online
- backups depend on shop discipline

Required:
- built frontend served from the shop PC
- firewall rule for LAN access
- optional backend/PostgreSQL on same PC for testing

Database location:
- none for localStorage-only
- local PostgreSQL if backend is enabled later

File storage location:
- browser local preview/metadata until backend upload cutover
- local disk folder for backend files later

AI/Ollama:
- Ollama can run on the main PC and be shared over LAN if configured.

SMS gateway:
- Android gateway can run on a shop phone on the same Wi-Fi.

Backup:
- daily frontend backup export
- PostgreSQL and file folder backup once backend is used

## Synology-Hosted Frontend / Backend

Pros:
- central always-on shop server
- shared folder backups are familiar
- good fit for local network use

Cons:
- requires Synology package/container setup
- PostgreSQL and Node process management must be maintained
- remote access should use VPN or secure reverse proxy

Required:
- Node backend runtime or container
- PostgreSQL
- static frontend hosting
- protected shared folder for uploads/backups

Database location:
- Synology PostgreSQL package/container or separate LAN database.

File storage location:
- backed-up Synology shared folder via `FILE_STORAGE_ROOT`.

AI/Ollama:
- Ollama may run on a separate PC if Synology resources are limited.

SMS gateway:
- Android gateway remains on phone; backend should reach it over LAN.

Backup:
- Hyper Backup for database dumps and file storage folder

## VPS / Cloud Server

Pros:
- accessible from multiple locations
- easier HTTPS/DNS setup
- centralized backend/database

Cons:
- requires production security hardening
- public exposure increases risk
- Ollama local AI may need separate architecture

Required:
- HTTPS reverse proxy
- PostgreSQL
- Node backend process manager
- file storage folder or object storage
- restricted CORS and rate limiting

Database location:
- managed PostgreSQL or server-hosted PostgreSQL.

File storage location:
- server disk folder initially; object storage preferred later.

AI/Ollama:
- OpenAI backend proxy is simplest; Ollama requires a reachable private host or GPU-capable server.

SMS gateway:
- cloud SMS provider is simpler; Android gateway requires secure networking.

Backup:
- database dumps plus provider snapshots plus file storage backup

## Vercel Frontend + Separate Backend

Pros:
- easy static frontend deployment
- good CDN/user experience
- backend can be independently hosted

Cons:
- frontend environment variables are public at build time
- backend CORS must be precise
- file uploads require separate backend/object storage

Required:
- Vercel frontend
- Node backend on VPS/PaaS
- PostgreSQL
- secure file storage

Database location:
- managed PostgreSQL or backend host.

File storage location:
- backend host folder for early use; object storage recommended.

AI/Ollama:
- AI provider keys must stay backend-only. Do not rely on frontend OpenAI keys for public deployment.

SMS gateway:
- backend SMS proxy should be used before public deployment.

Backup:
- managed database backups plus file/object storage backup

## Future Docker Deployment

Pros:
- repeatable deployment
- easier dependency isolation
- good for Synology/VPS later

Cons:
- not implemented yet
- requires container orchestration/volumes
- backup of volumes must be planned

Required:
- Dockerfile/compose plan
- PostgreSQL service or external DB
- persistent upload volume
- env var management

Database location:
- compose PostgreSQL volume or external managed DB.

File storage location:
- persistent Docker volume or mounted folder.

AI/Ollama:
- separate Ollama container/host or backend OpenAI proxy.

SMS gateway:
- backend reaches provider/gateway through configured network.

Backup:
- database dumps plus Docker volume/file storage backups
