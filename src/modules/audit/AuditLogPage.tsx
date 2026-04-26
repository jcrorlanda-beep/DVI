import React, { useMemo, useState } from "react";
import type { SessionUser, AuditLogRecord, AuditLogModule } from "../shared/types";
import { formatDateTime } from "../shared/helpers";

const MODULES: AuditLogModule[] = [
  "RepairOrders",
  "Approvals",
  "Payments",
  "Inventory",
  "PurchaseOrders",
  "AI",
  "CustomerPortal",
  "Expenses",
  "Excel",
  "System",
];

const MODULE_COLORS: Record<AuditLogModule, { bg: string; text: string }> = {
  RepairOrders: { bg: "#dbeafe", text: "#1d4ed8" },
  Approvals: { bg: "#dcfce7", text: "#166534" },
  Payments: { bg: "#fef3c7", text: "#92400e" },
  Inventory: { bg: "#ede9fe", text: "#6d28d9" },
  PurchaseOrders: { bg: "#cffafe", text: "#155e75" },
  AI: { bg: "#fae8ff", text: "#86198f" },
  CustomerPortal: { bg: "#ffedd5", text: "#9a3412" },
  Expenses: { bg: "#ecfdf5", text: "#065f46" },
  Excel: { bg: "#d1fae5", text: "#065f46" },
  System: { bg: "#f1f5f9", text: "#475569" },
};

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 16, maxWidth: 1100, margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 },
  title: { fontSize: 20, fontWeight: 700, color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 2 },
  card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, marginBottom: 16 },
  filterRow: { display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 12 },
  select: { padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, color: "#0f172a", background: "#fff" },
  input: { padding: "8px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, color: "#0f172a", background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "8px 10px", background: "#f8fafc", textAlign: "left" as const, fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "8px 10px", fontSize: 12, color: "#334155", borderBottom: "1px solid #f1f5f9", verticalAlign: "top" as const },
  badge: { display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 },
  emptyState: { textAlign: "center" as const, padding: "32px 0", color: "#94a3b8", fontSize: 14 },
  secondaryBtn: { background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 12px", fontWeight: 500, cursor: "pointer", fontSize: 13 },
  diffBox: { background: "#f8fafc", borderRadius: 4, padding: "4px 8px", fontSize: 11, fontFamily: "monospace", whiteSpace: "pre-wrap" as const, wordBreak: "break-all" as const, marginTop: 4, maxWidth: 340 },
};

export function AuditLogPage({
  currentUser,
  auditLogs,
  users,
}: {
  currentUser: SessionUser;
  auditLogs: AuditLogRecord[];
  users: { id: string; fullName: string }[];
}) {
  const [filterModule, setFilterModule] = useState<AuditLogModule | "">("");
  const [filterUser, setFilterUser] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const term = filterAction.trim().toLowerCase();
    return auditLogs
      .filter((log) => {
        const matchModule = !filterModule || log.module === filterModule;
        const matchUser = !filterUser || log.userId === filterUser;
        const matchDate = !filterDate || log.timestamp.startsWith(filterDate);
        const matchAction = !term || log.action.toLowerCase().includes(term) || log.detail.toLowerCase().includes(term) || log.entityLabel.toLowerCase().includes(term);
        return matchModule && matchUser && matchDate && matchAction;
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [auditLogs, filterModule, filterUser, filterDate, filterAction]);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Audit Log</div>
          <div style={styles.subtitle}>Activity trail for key operations — {auditLogs.length} total entries</div>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.filterRow}>
          <select style={styles.select} value={filterModule} onChange={(e) => setFilterModule(e.target.value as AuditLogModule | "")}>
            <option value="">All modules</option>
            {MODULES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select style={styles.select} value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
            <option value="">All users</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
          </select>
          <input style={{ ...styles.input, width: 140 }} type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} title="Filter by date" />
          <input style={{ ...styles.input, minWidth: 160 }} placeholder="Search action/detail…" value={filterAction} onChange={(e) => setFilterAction(e.target.value)} />
          <button style={styles.secondaryBtn} onClick={() => { setFilterModule(""); setFilterUser(""); setFilterDate(""); setFilterAction(""); }}>Clear</button>
        </div>

        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{filtered.length} entries shown</div>

        {filtered.length === 0 ? (
          <div style={styles.emptyState}>No audit entries match the current filter.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Timestamp</th>
                <th style={styles.th}>Module</th>
                <th style={styles.th}>Action</th>
                <th style={styles.th}>Entity</th>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const hasDiff = !!(log.before || log.after);
                const isExpanded = expanded.has(log.id);
                const mc = MODULE_COLORS[log.module];
                return (
                  <tr key={log.id} style={{ background: isExpanded ? "#f8fafc" : "transparent" }}>
                    <td style={{ ...styles.td, whiteSpace: "nowrap" as const, color: "#94a3b8" }}>{formatDateTime(log.timestamp)}</td>
                    <td style={styles.td}><span style={{ ...styles.badge, background: mc.bg, color: mc.text }}>{log.module}</span></td>
                    <td style={{ ...styles.td, fontFamily: "monospace", fontSize: 11 }}>{log.action}</td>
                    <td style={styles.td}><span style={{ fontWeight: 600 }}>{log.entityLabel}</span>{log.entityId && <div style={{ fontSize: 10, color: "#94a3b8" }}>{log.entityId.slice(0, 12)}…</div>}</td>
                    <td style={styles.td}>{log.userName}</td>
                    <td style={styles.td}>
                      <div>{log.detail}</div>
                      {hasDiff && (
                        <button style={{ ...styles.secondaryBtn, padding: "2px 8px", fontSize: 11, marginTop: 4 }} onClick={() => toggleExpand(log.id)}>
                          {isExpanded ? "Hide diff" : "Show diff"}
                        </button>
                      )}
                      {isExpanded && hasDiff && (
                        <div>
                          {log.before && <div style={styles.diffBox}><strong>Before:</strong> {log.before}</div>}
                          {log.after && <div style={styles.diffBox}><strong>After:</strong> {log.after}</div>}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AuditLogPage;
