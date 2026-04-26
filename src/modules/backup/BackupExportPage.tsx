import React, { useMemo, useState } from "react";
import type { SessionUser } from "../shared/types";

export type BackupModuleKey = {
  key: string;
  label: string;
  storageKey: string;
};

type BackupMetadata = {
  exportedAt: string;
  exportedBy: string;
  version: string;
  moduleCount: number;
};

const BACKUP_METADATA_KEY = "dvi_backup_metadata_v1";

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 16, maxWidth: 860, margin: "0 auto" },
  header: { marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 700, color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 10 },
  cardSubtitle: { fontSize: 12, color: "#64748b", marginBottom: 12 },
  primaryBtn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, padding: "9px 18px", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  secondaryBtn: { background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 14px", fontWeight: 500, cursor: "pointer", fontSize: 13 },
  dangerBtn: { background: "#fee2e2", color: "#b91c1c", border: "1px solid #fca5a5", borderRadius: 6, padding: "8px 14px", fontWeight: 600, cursor: "pointer", fontSize: 13 },
  warningBox: { background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 6, padding: "10px 14px", fontSize: 13, color: "#92400e", marginBottom: 12 },
  errorBox: { background: "#fee2e2", color: "#b91c1c", borderRadius: 6, padding: "8px 12px", fontSize: 13, marginBottom: 8 },
  successBox: { background: "#dcfce7", color: "#15803d", borderRadius: 6, padding: "8px 12px", fontSize: 13, marginBottom: 8 },
  moduleRow: { display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #f1f5f9" },
  moduleLabel: { fontSize: 13, color: "#334155", flex: 1 },
  moduleKey: { fontSize: 11, color: "#94a3b8", fontFamily: "monospace" },
  checkboxGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 6, marginBottom: 12 },
  previewBox: { background: "#0f172a", color: "#a3e635", borderRadius: 6, padding: 12, fontFamily: "monospace", fontSize: 11, overflowX: "auto" as const, maxHeight: 260, whiteSpace: "pre-wrap" as const, wordBreak: "break-all" as const },
  hintList: { margin: "8px 0 0 18px", color: "#475569", fontSize: 13, lineHeight: 1.6 },
  inlineNote: { marginTop: 8, fontSize: 13, color: "#475569" },
};

const ALL_MODULES: BackupModuleKey[] = [
  { key: "users", label: "Users", storageKey: "dvi_phase1_users_v2" },
  { key: "rolePermissions", label: "Role Permissions", storageKey: "dvi_phase1_role_permissions_v2" },
  { key: "intakeRecords", label: "Intake Records", storageKey: "dvi_phase2_intake_records_v1" },
  { key: "inspectionRecords", label: "Inspection Records", storageKey: "dvi_phase3_inspection_records_v1" },
  { key: "repairOrders", label: "Repair Orders", storageKey: "dvi_phase4_repair_orders_v1" },
  { key: "qcRecords", label: "QC Records", storageKey: "dvi_phase6_qc_records_v1" },
  { key: "releaseRecords", label: "Release Records", storageKey: "dvi_phase7_release_records_v1" },
  { key: "partsRequests", label: "Parts Requests", storageKey: "dvi_phase8_parts_requests_v1" },
  { key: "approvalRecords", label: "Approval Records", storageKey: "dvi_phase9_approval_records_v1" },
  { key: "backjobRecords", label: "Backjob Records", storageKey: "dvi_phase9_backjob_records_v1" },
  { key: "invoiceRecords", label: "Invoice Records", storageKey: "dvi_phase10_invoice_records_v1" },
  { key: "paymentRecords", label: "Payment Records", storageKey: "dvi_phase10_payment_records_v1" },
  { key: "workLogs", label: "Work Logs", storageKey: "dvi_phase16_work_logs_v1" },
  { key: "bookings", label: "Bookings", storageKey: "dvi_phase17d_bookings_v1" },
  { key: "customerAccounts", label: "Customer Accounts", storageKey: "dvi_phase15a_customer_accounts_v1" },
  { key: "approvalLinkTokens", label: "Approval Link Tokens", storageKey: "dvi_phase15b_approval_link_tokens_v1" },
  { key: "maintenanceIntervalRules", label: "Maintenance Interval Rules", storageKey: "dvi_maintenance_interval_rules_v1" },
  { key: "servicePricingCatalog", label: "Service Pricing Catalog", storageKey: "dvi_service_pricing_catalog_v1" },
  { key: "vehicleServiceHistoryRecords", label: "Vehicle Service History", storageKey: "dvi_vehicle_service_history_records_v1" },
  { key: "expenseRecords", label: "Expense Records", storageKey: "dvi_phase53_expense_records_v1" },
  { key: "auditLogs", label: "Audit Logs", storageKey: "dvi_phase55_audit_logs_v1" },
];

function readKey(storageKey: string): unknown {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getByteSize(str: string): string {
  const bytes = new Blob([str]).size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function readBackupMeta(): BackupMetadata | null {
  try {
    const raw = localStorage.getItem(BACKUP_METADATA_KEY);
    return raw ? (JSON.parse(raw) as BackupMetadata) : null;
  } catch {
    return null;
  }
}

export function BackupExportPage({ currentUser }: { currentUser: SessionUser }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(ALL_MODULES.map((m) => m.key)));
  const [preview, setPreview] = useState<string | null>(null);
  const [restoreJson, setRestoreJson] = useState("");
  const [restoreError, setRestoreError] = useState("");
  const [restoreSuccess, setRestoreSuccess] = useState("");
  const [restoreParsed, setRestoreParsed] = useState<Record<string, unknown> | null>(null);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoreConfirmText, setRestoreConfirmText] = useState("");
  const [backupMeta, setBackupMeta] = useState<BackupMetadata | null>(() => readBackupMeta());

  function toggleModule(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function saveBackupMeta(meta: BackupMetadata) {
    try {
      localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(meta));
      setBackupMeta(meta);
    } catch {
      // advisory only
    }
  }

  function buildExport(keys: string[], persistMeta = false): Record<string, unknown> {
    const exportedAt = new Date().toISOString();
    const data: Record<string, unknown> = {
      exportedAt,
      exportedBy: currentUser.fullName,
      version: "DVI-backup-v1",
      moduleCount: keys.length,
    };
    for (const key of keys) {
      const mod = ALL_MODULES.find((m) => m.key === key);
      if (!mod) continue;
      data[mod.key] = readKey(mod.storageKey);
    }
    if (persistMeta) {
      saveBackupMeta({
        exportedAt,
        exportedBy: currentUser.fullName,
        version: "DVI-backup-v1",
        moduleCount: keys.length,
      });
    }
    return data;
  }

  function handlePreview() {
    const data = buildExport(Array.from(selected), false);
    setPreview(JSON.stringify(data, null, 2));
  }

  function handleExport() {
    const data = buildExport(Array.from(selected), true);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dvi-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleRestoreParse() {
    setRestoreError("");
    setRestoreSuccess("");
    setRestoreParsed(null);
    setShowRestoreConfirm(false);
    setRestoreConfirmText("");
    if (!restoreJson.trim()) {
      setRestoreError("Paste a backup JSON first.");
      return;
    }
    try {
      const parsed = JSON.parse(restoreJson);
      if (typeof parsed !== "object" || !parsed || !("version" in parsed)) {
        setRestoreError("Invalid backup file: missing version field.");
        return;
      }
      setRestoreParsed(parsed as Record<string, unknown>);
    } catch {
      setRestoreError("Invalid JSON. Please paste a valid backup file.");
    }
  }

  function handleRestoreConfirm() {
    if (!restoreParsed) return;
    if (restoreConfirmText.trim().toUpperCase() !== "RESTORE") {
      setRestoreError('Type RESTORE to confirm the restore.');
      return;
    }
    let restored = 0;
    for (const mod of ALL_MODULES) {
      if (mod.key in restoreParsed && restoreParsed[mod.key] !== null && restoreParsed[mod.key] !== undefined) {
        try {
          localStorage.setItem(mod.storageKey, JSON.stringify(restoreParsed[mod.key]));
          restored++;
        } catch {
          // ignore individual module failures
        }
      }
    }
    setRestoreSuccess(`Restored ${restored} module(s). Reload the page to apply.`);
    setShowRestoreConfirm(false);
    setRestoreParsed(null);
    setRestoreJson("");
    setRestoreConfirmText("");
  }

  const previewModules = useMemo(
    () => (restoreParsed ? ALL_MODULES.filter((m) => m.key in restoreParsed && restoreParsed[m.key] !== null) : []),
    [restoreParsed]
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>Backup & Export Center</div>
        <div style={styles.subtitle}>Export localStorage data to JSON or restore from a previous backup</div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Export Data</div>
        <div style={styles.cardSubtitle}>Select the modules to include in the export file.</div>
        <div style={styles.warningBox}>
          Backup checklist:
          <ul style={styles.hintList}>
            <li>Export before browser reset.</li>
            <li>Export before major updates.</li>
            <li>Export at the end of each day.</li>
            <li>Keep a copy outside the browser or computer.</li>
          </ul>
        </div>
        <div style={styles.inlineNote} data-testid="backup-last-reminder">
          {backupMeta
            ? `Last backup: ${backupMeta.exportedAt.slice(0, 10)} by ${backupMeta.exportedBy} (${backupMeta.moduleCount} modules, ${backupMeta.version})`
            : "No backup has been exported yet."}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button style={styles.secondaryBtn} onClick={() => setSelected(new Set(ALL_MODULES.map((m) => m.key)))}>Select All</button>
          <button style={styles.secondaryBtn} onClick={() => setSelected(new Set())}>Deselect All</button>
        </div>

        <div style={styles.checkboxGrid}>
          {ALL_MODULES.map((mod) => {
            const raw = localStorage.getItem(mod.storageKey);
            const size = raw ? getByteSize(raw) : "empty";
            return (
              <label
                key={mod.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "5px 8px",
                  borderRadius: 4,
                  background: selected.has(mod.key) ? "#eff6ff" : "transparent",
                }}
              >
                <input type="checkbox" checked={selected.has(mod.key)} onChange={() => toggleModule(mod.key)} />
                <span style={styles.moduleLabel}>{mod.label}</span>
                <span style={styles.moduleKey}>{size}</span>
              </label>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
          <button style={styles.primaryBtn} onClick={handleExport} disabled={selected.size === 0}>
            Download Backup ({selected.size} modules)
          </button>
          <button style={styles.secondaryBtn} data-testid="backup-preview-button" onClick={handlePreview} disabled={selected.size === 0}>
            Preview JSON
          </button>
        </div>

        {preview && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Preview ({getByteSize(preview)})</span>
              <button style={styles.secondaryBtn} onClick={() => setPreview(null)}>Close</button>
            </div>
            <div style={styles.cardSubtitle}>Preview includes exportedAt, exportedBy, version, and moduleCount metadata.</div>
            <div style={styles.previewBox}>
              {preview.slice(0, 4000)}
              {preview.length > 4000 ? "\n... (truncated for preview)" : ""}
            </div>
          </div>
        )}
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Restore from Backup</div>
        <div style={styles.warningBox}>
          WARNING: Restoring will overwrite selected modules in localStorage. This action cannot be undone. Always export a fresh backup before restoring.
        </div>

        {restoreError && <div style={styles.errorBox}>{restoreError}</div>}
        {restoreSuccess && <div style={styles.successBox}>{restoreSuccess}</div>}

        <textarea
          data-testid="backup-restore-json"
          style={{
            width: "100%",
            minHeight: 120,
            padding: 10,
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            fontSize: 12,
            fontFamily: "monospace",
            resize: "vertical" as const,
            background: "#fff",
            color: "#0f172a",
            boxSizing: "border-box" as const,
          }}
          placeholder='Paste backup JSON here (from a previously downloaded .json file)...'
          value={restoreJson}
          onChange={(e) => {
            setRestoreJson(e.target.value);
            setRestoreParsed(null);
            setShowRestoreConfirm(false);
            setRestoreConfirmText("");
            setRestoreError("");
            setRestoreSuccess("");
          }}
        />

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button style={styles.secondaryBtn} onClick={handleRestoreParse}>
            Validate & Preview
          </button>
          {restoreParsed && !showRestoreConfirm && (
            <button style={styles.dangerBtn} onClick={() => setShowRestoreConfirm(true)}>
              Restore Now
            </button>
          )}
        </div>

        {restoreParsed && (
          <div style={{ marginTop: 10, fontSize: 13, color: "#475569" }} data-testid="backup-restore-preview">
            <strong>Backup info:</strong> Exported by {String(restoreParsed.exportedBy ?? "unknown")} on {String(restoreParsed.exportedAt ?? "unknown").slice(0, 10)}
            <br />
            <strong>Module count:</strong> {String(restoreParsed.moduleCount ?? previewModules.length ?? "unknown")}
            <br />
            <strong>Modules found:</strong> {previewModules.map((m) => m.label).join(", ") || "None"}
          </div>
        )}

        {showRestoreConfirm && (
          <div style={{ ...styles.warningBox, marginTop: 10 }}>
            <strong>Confirm restore?</strong> This will overwrite existing data in the listed modules. Reload the page after restoring.
            <div style={{ marginTop: 8 }}>
              <label style={{ display: "block", fontSize: 12, color: "#475569", marginBottom: 4 }}>
                Type RESTORE to continue
              </label>
              <input
                data-testid="backup-restore-confirm-text"
                value={restoreConfirmText}
                onChange={(e) => setRestoreConfirmText(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }}
                placeholder="RESTORE"
              />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button style={styles.dangerBtn} data-testid="backup-restore-confirm-button" onClick={handleRestoreConfirm}>
                Yes, Restore
              </button>
              <button style={styles.secondaryBtn} onClick={() => setShowRestoreConfirm(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BackupExportPage;
