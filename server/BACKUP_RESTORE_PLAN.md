# Database Backup and Restore Plan

This plan prepares multi-device production operations. It does not run backup or restore commands automatically.

## Backup Schedule

- Daily after shop close.
- Before every app/backend deployment update.
- Before every migration preview/import test.
- Before enabling any backend write/cutover mode.

## PostgreSQL Backup Examples

Use environment variables or a password manager rather than writing credentials into scripts.

```bash
pg_dump "$DATABASE_URL" --format=custom --file=dvi-backup-YYYYMMDD.dump
```

Plain SQL option:

```bash
pg_dump "$DATABASE_URL" --file=dvi-backup-YYYYMMDD.sql
```

## PostgreSQL Restore Examples

Restore commands are intentionally documentation-only. Test on a staging database first.

```bash
createdb dvi_restore_test
pg_restore --dbname=dvi_restore_test --clean --if-exists dvi-backup-YYYYMMDD.dump
```

Plain SQL option:

```bash
psql "$RESTORE_DATABASE_URL" < dvi-backup-YYYYMMDD.sql
```

## File Storage Backup

Database backups do not include uploaded files. Back up `FILE_STORAGE_ROOT` or `UPLOAD_STORAGE_ROOT` alongside PostgreSQL.

During the document/file backend pilot, treat the database metadata and file storage folder as one backup unit. If metadata points to missing files, or files exist without document metadata, keep the frontend in localStorage mode and restore the paired database/file backup before retrying.

Do not bulk-upload local browser files automatically. Pilot uploads should be reviewed, linked, and verified in small batches until signed customer download tokens and a production file backup routine exist.

Recommended pairing:

- database dump file
- file storage folder/archive
- app version/commit hash
- migration preview output if applicable

## Verification Checklist

- Confirm backup file exists and is larger than zero bytes.
- Confirm file storage archive exists if uploads are enabled.
- Restore to a test database at least monthly.
- Compare customer, vehicle, RO, invoice/payment, document metadata, and audit log counts.
- Spot-check uploaded file previews after restore.
- Store at least one backup copy outside the app server/computer.

## Restore Drill Checklist

- Announce maintenance window.
- Stop backend writes.
- Back up current database and file storage before restore.
- Restore database to a staging database first.
- Restore file storage to a staging folder first.
- Run backend smoke check.
- Verify sample records and document links.
- Only then restore production if the drill passes.

## Synology Notes

- Store PostgreSQL dumps in a protected shared folder.
- Point `FILE_STORAGE_ROOT` at a shared folder that is included in Hyper Backup.
- Keep database dumps and file storage backups in the same backup set.
- Restrict SMB/shared-folder access to admin/service accounts.

## Cloud / VPS Notes

- Use provider snapshots in addition to PostgreSQL dumps, not instead of dumps.
- Store offsite copies in encrypted object storage.
- Verify restore access before relying on automated snapshots.
- Include firewall, DNS, TLS certificate, env var, and file storage notes in the runbook.
