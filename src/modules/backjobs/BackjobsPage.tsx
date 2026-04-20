import React, { useEffect, useMemo, useState } from "react";
import type {
  SessionUser,
  UserAccount,
  RepairOrderRecord,
  InvoiceRecord,
  BackjobRecord,
  BackjobOutcome,
} from "../shared/types";
import { formatDateTime, getResponsiveSpan } from "../shared/helpers";

// --- local helpers ---

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function todayStamp(date = new Date()) {
  const yyyy = date.getFullYear().toString();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocalStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const STORAGE_KEY_COUNTERS = "dvi_phase2_counters_v1";

function nextDailyNumber(prefix: string) {
  const stamp = todayStamp();
  const counters = readLocalStorage<Record<string, number>>(STORAGE_KEY_COUNTERS, {});
  const key = `${prefix}_${stamp}`;
  const next = (counters[key] ?? 0) + 1;
  counters[key] = next;
  writeLocalStorage(STORAGE_KEY_COUNTERS, counters);
  return `${prefix}-${stamp}-${String(next).padStart(3, "0")}`;
}

function downloadTextFile(filename: string, content: string) {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function printTextDocument(title: string, content: string) {
  if (typeof window === "undefined") return;
  const popup = window.open("", "_blank", "width=900,height=700");
  if (!popup) return;
  const escapedTitle = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapedBody = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  popup.document.write(`
    <html>
      <head>
        <title>${escapedTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { font-size: 24px; margin-bottom: 16px; }
          pre { white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.5; font-size: 13px; }
        </style>
      </head>
      <body>
        <h1>${escapedTitle}</h1>
        <pre>${escapedBody}</pre>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
}

function buildBackjobExportText(backjob: BackjobRecord, users: UserAccount[]) {
  const comebackTech = users.find((user) => user.id === backjob.comebackPrimaryTechnicianId)?.fullName || "Unassigned";
  const originalTech = users.find((user) => user.id === backjob.originalPrimaryTechnicianId)?.fullName || "Unassigned";
  return [
    `Backjob: ${backjob.backjobNumber}`,
    `Status: ${backjob.status}`,
    `Linked RO: ${backjob.linkedRoNumber}`,
    `Customer: ${backjob.customerLabel}`,
    `Plate: ${backjob.plateNumber || "-"}`,
    `Responsibility: ${backjob.responsibility}`,
    `Original Invoice: ${backjob.originalInvoiceNumber || "-"}`,
    `Comeback Invoice: ${backjob.comebackInvoiceNumber || "-"}`,
    `Original Technician: ${originalTech}`,
    `Comeback Technician: ${comebackTech}`,
    `Complaint: ${backjob.complaint || "-"}`,
    `Findings: ${backjob.findings || "-"}`,
    `Root Cause: ${backjob.rootCause || "-"}`,
    `Action Taken: ${backjob.actionTaken || "-"}`,
    `Resolution Notes: ${backjob.resolutionNotes || "-"}`,
    `Created: ${formatDateTime(backjob.createdAt)}`,
    `Updated: ${formatDateTime(backjob.updatedAt)}`,
  ].join("\n");
}

// --- local component ---

function Card({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.cardTitle}>{title}</div>
          {subtitle ? <div style={styles.cardSubtitle}>{subtitle}</div> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </div>
  );
}

// --- component ---

function BackjobPage({
  currentUser,
  users,
  repairOrders,
  invoiceRecords,
  backjobRecords,
  setBackjobRecords,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  users: UserAccount[];
  repairOrders: RepairOrderRecord[];
  invoiceRecords: InvoiceRecord[];
  backjobRecords: BackjobRecord[];
  setBackjobRecords: React.Dispatch<React.SetStateAction<BackjobRecord[]>>;
  isCompactLayout: boolean;
}) {
  const [selectedRoId, setSelectedRoId] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [complaint, setComplaint] = useState("");
  const [findings, setFindings] = useState("");
  const [rootCause, setRootCause] = useState("");
  const [responsibility, setResponsibility] = useState<BackjobOutcome>("Internal");
  const [actionTaken, setActionTaken] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [status, setStatus] = useState<"Open" | "In Progress" | "Monitoring" | "Closed">("Open");
  const [comebackPrimaryTechnicianId, setComebackPrimaryTechnicianId] = useState("");
  const [supportingTechnicianIds, setSupportingTechnicianIds] = useState<string[]>([]);
  const [comebackInvoiceNumber, setComebackInvoiceNumber] = useState("");

  const eligibleRos = useMemo(
    () => repairOrders.filter((row) => ["Released", "Closed", "Ready Release", "In Progress", "Quality Check"].includes(row.status)),
    [repairOrders]
  );

  const selectedRO = useMemo(
    () => eligibleRos.find((row) => row.id === selectedRoId) ?? null,
    [eligibleRos, selectedRoId]
  );

  const selectedOriginalInvoice = useMemo(
    () => (selectedRO ? invoiceRecords.find((row) => row.roId === selectedRO.id) ?? null : null),
    [invoiceRecords, selectedRO]
  );

  useEffect(() => {
    if (!selectedRO) return;
    setComebackPrimaryTechnicianId((prev) => prev || selectedRO.primaryTechnicianId || "");
    setSupportingTechnicianIds((prev) => (prev.length ? prev : selectedRO.supportTechnicianIds || []));
  }, [selectedRO]);

  const techNameById = useMemo(() => new Map(users.map((user) => [user.id, user.fullName])), [users]);

  const summary = useMemo(
    () => ({
      total: backjobRecords.length,
      open: backjobRecords.filter((row) => row.status === "Open").length,
      inProgress: backjobRecords.filter((row) => row.status === "In Progress").length,
      monitoring: backjobRecords.filter((row) => row.status === "Monitoring").length,
      closed: backjobRecords.filter((row) => row.status === "Closed").length,
      warranty: backjobRecords.filter((row) => row.responsibility === "Warranty").length,
    }),
    [backjobRecords]
  );

  const visibleRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return backjobRecords;
    return backjobRecords.filter((row) =>
      [
        row.backjobNumber,
        row.linkedRoNumber,
        row.plateNumber,
        row.customerLabel,
        row.complaint,
        row.rootCause,
        row.findings,
        row.actionTaken,
        row.responsibility,
        row.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [backjobRecords, search]);

  const resetForm = () => {
    setSelectedRoId("");
    setComplaint("");
    setFindings("");
    setRootCause("");
    setResponsibility("Internal");
    setActionTaken("");
    setResolutionNotes("");
    setStatus("Open");
    setComebackPrimaryTechnicianId("");
    setSupportingTechnicianIds([]);
    setComebackInvoiceNumber("");
    setError("");
  };

  const saveBackjob = () => {
    if (!selectedRO) {
      setError("Select a linked repair order first.");
      return;
    }
    if (!complaint.trim()) {
      setError("Complaint is required.");
      return;
    }
    if (!rootCause.trim()) {
      setError("Root cause is required.");
      return;
    }

    const now = new Date().toISOString();
    const record: BackjobRecord = {
      id: uid("bj"),
      backjobNumber: nextDailyNumber("BJ"),
      linkedRoId: selectedRO.id,
      linkedRoNumber: selectedRO.roNumber,
      createdAt: now,
      updatedAt: now,
      plateNumber: selectedRO.plateNumber || selectedRO.conductionNumber || "",
      customerLabel: selectedRO.accountLabel,
      originalInvoiceNumber: selectedOriginalInvoice?.invoiceNumber || "",
      comebackInvoiceNumber: comebackInvoiceNumber.trim(),
      originalPrimaryTechnicianId: selectedRO.primaryTechnicianId || "",
      comebackPrimaryTechnicianId,
      supportingTechnicianIds,
      complaint: complaint.trim(),
      findings: findings.trim(),
      rootCause: rootCause.trim(),
      responsibility,
      actionTaken: actionTaken.trim(),
      resolutionNotes: resolutionNotes.trim(),
      status,
      createdBy: currentUser.fullName,
    };

    setBackjobRecords((prev) => [record, ...prev]);
    resetForm();
  };

  const updateBackjobStatus = (id: string, nextStatus: "Open" | "In Progress" | "Monitoring" | "Closed") => {
    setBackjobRecords((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, status: nextStatus, updatedAt: new Date().toISOString() } : row
      )
    );
  };

  const technicians = users.filter((user) =>
    ["Chief Technician", "Senior Mechanic", "General Mechanic", "OJT"].includes(user.role)
  );

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title="Backjob / Comeback Control Center"
            subtitle="Track returned jobs, root cause, responsibility, technician linkage, and comeback resolution in one place"
            right={<span style={styles.statusInfo}>{summary.total} tracked comebacks</span>}
          >
            <div style={styles.heroText}>
              Use this area for customer returns, warranty comebacks, internal backjobs, and follow-up monitoring so the original RO, invoice, and technician accountability stay visible.
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }}>
          <div style={styles.statCard}><div style={styles.statLabel}>Open</div><div style={styles.statValue}>{summary.open}</div><div style={styles.statNote}>New comeback cases</div></div>
        </div>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }}>
          <div style={styles.statCard}><div style={styles.statLabel}>In Progress</div><div style={styles.statValue}>{summary.inProgress}</div><div style={styles.statNote}>Actively being resolved</div></div>
        </div>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }}>
          <div style={styles.statCard}><div style={styles.statLabel}>Monitoring</div><div style={styles.statValue}>{summary.monitoring}</div><div style={styles.statNote}>Watching after repair</div></div>
        </div>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }}>
          <div style={styles.statCard}><div style={styles.statLabel}>Closed</div><div style={styles.statValue}>{summary.closed}</div><div style={styles.statNote}>Resolved cases</div></div>
        </div>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(2, isCompactLayout) }}>
          <div style={styles.statCard}><div style={styles.statLabel}>Warranty</div><div style={styles.statValue}>{summary.warranty}</div><div style={styles.statNote}>Warranty-tagged comebacks</div></div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
          <Card title="New Backjob Record" subtitle="Link a comeback to the original RO and keep the cause and resolution visible">
            <div style={styles.formStack}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Linked Repair Order</label>
                <select style={styles.select} value={selectedRoId} onChange={(e) => setSelectedRoId(e.target.value)}>
                  <option value="">Select released or active RO</option>
                  {eligibleRos.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.roNumber} • {row.plateNumber || row.conductionNumber || "-"} • {row.accountLabel}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRO ? (
                <div style={styles.sectionCardMuted}>
                  <div style={styles.quickAccessList}>
                    <div style={styles.quickAccessRow}><span>Customer</span><strong>{selectedRO.accountLabel}</strong></div>
                    <div style={styles.quickAccessRow}><span>Plate</span><strong>{selectedRO.plateNumber || selectedRO.conductionNumber || "-"}</strong></div>
                    <div style={styles.quickAccessRow}><span>Original Invoice</span><strong>{selectedOriginalInvoice?.invoiceNumber || "None yet"}</strong></div>
                    <div style={styles.quickAccessRow}><span>Original Primary Tech</span><strong>{techNameById.get(selectedRO.primaryTechnicianId) || "-"}</strong></div>
                  </div>
                </div>
              ) : null}

              <div style={styles.formGroup}>
                <label style={styles.label}>Complaint</label>
                <textarea style={styles.textarea} value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="Customer comeback complaint or follow-up concern" />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Findings</label>
                <textarea style={styles.textarea} value={findings} onChange={(e) => setFindings(e.target.value)} placeholder="Inspection findings for the comeback" />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Root Cause</label>
                <textarea style={styles.textarea} value={rootCause} onChange={(e) => setRootCause(e.target.value)} placeholder="Underlying cause of the return or repeat issue" />
              </div>

              <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Responsibility</label>
                  <select style={styles.select} value={responsibility} onChange={(e) => setResponsibility(e.target.value as BackjobOutcome)}>
                    <option value="Customer Pay">Customer Pay</option>
                    <option value="Internal">Internal</option>
                    <option value="Warranty">Warranty</option>
                    <option value="Goodwill">Goodwill</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Case Status</label>
                  <select style={styles.select} value={status} onChange={(e) => setStatus(e.target.value as "Open" | "In Progress" | "Monitoring" | "Closed")}>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Monitoring">Monitoring</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Comeback Primary Technician</label>
                  <select style={styles.select} value={comebackPrimaryTechnicianId} onChange={(e) => setComebackPrimaryTechnicianId(e.target.value)}>
                    <option value="">Select technician</option>
                    {technicians.map((user) => (
                      <option key={user.id} value={user.id}>{user.fullName} • {user.role}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Comeback Invoice Number</label>
                  <input style={styles.input} value={comebackInvoiceNumber} onChange={(e) => setComebackInvoiceNumber(e.target.value)} placeholder="Optional invoice for comeback work" />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Action Taken</label>
                <textarea style={styles.textarea} value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} placeholder="Repair or corrective action performed during comeback" />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Resolution Notes</label>
                <textarea style={styles.textarea} value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} placeholder="Final notes, customer communication, monitoring note, or closure summary" />
              </div>

              {error ? <div style={styles.errorBox}>{error}</div> : null}

              <div style={styles.inlineActions}>
                <button type="button" style={styles.primaryButton} onClick={saveBackjob}>Save Backjob</button>
                <button type="button" style={styles.secondaryButton} onClick={resetForm}>Reset</button>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
          <Card
            title="Backjob Registry"
            subtitle="Search returned jobs by backjob number, RO, plate, complaint, cause, or status"
            right={<span style={styles.statusNeutral}>{visibleRecords.length} shown</span>}
          >
            <div style={styles.formGroup}>
              <label style={styles.label}>Search</label>
              <input style={styles.input} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search backjob no., RO, plate, complaint, root cause, responsibility" />
            </div>

            {visibleRecords.length === 0 ? (
              <div style={styles.emptyState}>No backjob records yet.</div>
            ) : isCompactLayout ? (
              <div style={styles.mobileCardList}>
                {visibleRecords.map((row) => (
                  <div key={row.id} style={styles.mobileDataCard}>
                    <div style={styles.mobileDataCardHeader}>
                      <strong>{row.backjobNumber}</strong>
                      <span style={styles.statusInfo}>{row.status}</span>
                    </div>
                    <div style={styles.mobileDataPrimary}>{row.linkedRoNumber} • {row.plateNumber || "-"}</div>
                    <div style={styles.mobileDataSecondary}>{row.customerLabel}</div>
                    <div style={styles.concernCard}>{row.complaint}</div>
                    <div style={styles.formHint}>Root cause: {row.rootCause || "-"}</div>
                    <div style={styles.formHint}>Responsibility: {row.responsibility}</div>
                    <div style={styles.mobileActionStack}>
                      <button type="button" style={styles.smallButton} onClick={() => updateBackjobStatus(row.id, "In Progress")}>Set In Progress</button>
                      <button type="button" style={styles.smallButtonMuted} onClick={() => updateBackjobStatus(row.id, "Monitoring")}>Monitoring</button>
                      <button type="button" style={styles.smallButtonSuccess} onClick={() => updateBackjobStatus(row.id, "Closed")}>Close</button>
                      <button type="button" style={styles.smallButtonMuted} onClick={() => printTextDocument(`Backjob ${row.backjobNumber}`, buildBackjobExportText(row, users))}>Print</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Backjob No.</th>
                      <th style={styles.th}>Linked RO / Plate</th>
                      <th style={styles.th}>Customer</th>
                      <th style={styles.th}>Complaint / Root Cause</th>
                      <th style={styles.th}>Responsibility</th>
                      <th style={styles.th}>Tech Link</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleRecords.map((row) => (
                      <tr key={row.id}>
                        <td style={styles.td}>
                          <div style={styles.tablePrimary}>{row.backjobNumber}</div>
                          <div style={styles.tableSecondary}>{formatDateTime(row.createdAt)}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.tablePrimary}>{row.linkedRoNumber}</div>
                          <div style={styles.tableSecondary}>{row.plateNumber || "-"}</div>
                        </td>
                        <td style={styles.td}>{row.customerLabel}</td>
                        <td style={styles.td}>
                          <div style={styles.concernCell}>{row.complaint}</div>
                          <div style={styles.tableSecondary}>Cause: {row.rootCause || "-"}</div>
                        </td>
                        <td style={styles.td}><span style={styles.statusWarning}>{row.responsibility}</span></td>
                        <td style={styles.td}>
                          <div style={styles.tablePrimary}>{techNameById.get(row.comebackPrimaryTechnicianId) || techNameById.get(row.originalPrimaryTechnicianId) || "-"}</div>
                          <div style={styles.tableSecondary}>Orig Inv: {row.originalInvoiceNumber || "-"} • Comeback Inv: {row.comebackInvoiceNumber || "-"}</div>
                        </td>
                        <td style={styles.td}><span style={styles.statusInfo}>{row.status}</span></td>
                        <td style={styles.td}>
                          <div style={styles.inlineActionsColumn}>
                            <button type="button" style={styles.smallButton} onClick={() => updateBackjobStatus(row.id, "In Progress")}>In Progress</button>
                            <button type="button" style={styles.smallButtonMuted} onClick={() => updateBackjobStatus(row.id, "Monitoring")}>Monitoring</button>
                            <button type="button" style={styles.smallButtonSuccess} onClick={() => updateBackjobStatus(row.id, "Closed")}>Close</button>
                            <button type="button" style={styles.smallButtonMuted} onClick={() => downloadTextFile(`${row.backjobNumber}_backjob.txt`, buildBackjobExportText(row, users))}>Export</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BackjobPage;

const styles: Record<string, React.CSSProperties> = {
  pageContent: { width: "100%" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: 16,
  },

  gridItem: { minWidth: 0 },

  card: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.98) 100%)",
    border: "1px solid rgba(29,78,216,0.16)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 28px rgba(5, 11, 29, 0.12)",
    height: "100%",
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
    flexWrap: "wrap",
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.3,
  },

  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
    lineHeight: 1.5,
  },

  heroText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 1.7,
    marginBottom: 4,
  },

  statCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.98) 100%)",
    border: "1px solid rgba(29,78,216,0.16)",
    borderRadius: 14,
    padding: "14px 16px",
    boxShadow: "0 4px 14px rgba(5,11,29,0.08)",
    textAlign: "center" as const,
  },

  statLabel: { fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const, letterSpacing: 0.5 },
  statValue: { fontSize: 28, fontWeight: 900, color: "#1d4ed8", margin: "4px 0" },
  statNote: { fontSize: 11, color: "#94a3b8" },

  formStack: { display: "flex", flexDirection: "column" as const, gap: 12 },
  formGroup: { display: "flex", flexDirection: "column" as const, gap: 4 },
  formGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },

  label: { fontSize: 13, fontWeight: 700, color: "#374151" },

  input: {
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  },

  select: {
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  },

  textarea: {
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    width: "100%",
    minHeight: 72,
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
  },

  sectionCardMuted: {
    background: "rgba(241,245,249,0.8)",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 10,
    padding: 12,
  },

  quickAccessList: { display: "grid", gap: 6 },

  quickAccessRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 13,
    color: "#475569",
    gap: 8,
  },

  errorBox: {
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#991b1b",
  },

  inlineActions: { display: "flex", gap: 10, flexWrap: "wrap" as const, alignItems: "center" },
  inlineActionsColumn: { display: "flex", flexDirection: "column" as const, gap: 6 },

  primaryButton: {
    border: "none",
    borderRadius: 12,
    padding: "13px 16px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(37,99,235,0.22)",
  },

  secondaryButton: {
    border: "1px solid rgba(148,163,184,0.3)",
    borderRadius: 12,
    padding: "13px 16px",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
  },

  smallButton: {
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  smallButtonMuted: {
    border: "1px solid rgba(148,163,184,0.3)",
    borderRadius: 8,
    padding: "6px 12px",
    background: "#f8fafc",
    color: "#374151",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  smallButtonSuccess: {
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  formHint: { fontSize: 12, color: "#94a3b8" },

  emptyState: {
    textAlign: "center" as const,
    color: "#94a3b8",
    fontSize: 14,
    padding: "32px 0",
  },

  mobileCardList: { display: "flex", flexDirection: "column" as const, gap: 12 },

  mobileDataCard: {
    background: "#f8fafc",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },

  mobileDataCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
  },

  mobileDataPrimary: { fontSize: 14, fontWeight: 700, color: "#0f172a" },
  mobileDataSecondary: { fontSize: 13, color: "#64748b" },

  mobileActionStack: { display: "flex", gap: 6, flexWrap: "wrap" as const, marginTop: 4 },

  concernCard: {
    background: "#fff",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
    color: "#374151",
  },

  tableWrap: { overflowX: "auto" as const },

  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },

  th: {
    padding: "10px 12px",
    textAlign: "left" as const,
    fontWeight: 700,
    color: "#374151",
    borderBottom: "2px solid rgba(148,163,184,0.2)",
    whiteSpace: "nowrap" as const,
    background: "#f8fafc",
  },

  td: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(148,163,184,0.12)",
    verticalAlign: "top" as const,
  },

  tablePrimary: { fontWeight: 700, color: "#0f172a", fontSize: 13 },
  tableSecondary: { fontSize: 12, color: "#64748b", marginTop: 2 },

  concernCell: {
    fontSize: 13,
    color: "#374151",
    maxWidth: 200,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    whiteSpace: "nowrap" as const,
  },

  statusInfo: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    background: "#dbeafe",
    color: "#1d4ed8",
    whiteSpace: "nowrap" as const,
  },

  statusWarning: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    background: "#fef3c7",
    color: "#92400e",
    whiteSpace: "nowrap" as const,
  },

  statusNeutral: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    background: "#f1f5f9",
    color: "#475569",
    whiteSpace: "nowrap" as const,
  },
};
