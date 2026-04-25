import React, { useEffect, useMemo, useState } from "react";
import type { ApprovalRecord, RepairOrderRecord } from "../shared/types";

type Props = {
  approvalRecords: ApprovalRecord[];
  repairOrders: RepairOrderRecord[];
  isCompactLayout: boolean;
};

type ApprovalEvidenceRecord = {
  id: string;
  approvalRecordId: string;
  roId: string;
  signerName: string;
  evidenceType: "Digital Signature" | "SMS Confirmation" | "Verbal Approval" | "Uploaded Document";
  reference: string;
  capturedAt: string;
  capturedBy: string;
};

const STORAGE_KEY = "dvi_approval_evidence_v1";

function readEvidence() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as ApprovalEvidenceRecord[];
  } catch {
    return [];
  }
}

function uid() {
  return `evidence_${Math.random().toString(36).slice(2, 10)}`;
}

export function ApprovalEvidencePanel({ approvalRecords, repairOrders, isCompactLayout }: Props) {
  const [evidenceRecords, setEvidenceRecords] = useState<ApprovalEvidenceRecord[]>(() => readEvidence());
  const [approvalRecordId, setApprovalRecordId] = useState(() => approvalRecords[0]?.id ?? "");
  const [signerName, setSignerName] = useState("");
  const [evidenceType, setEvidenceType] = useState<ApprovalEvidenceRecord["evidenceType"]>("Digital Signature");
  const [reference, setReference] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(evidenceRecords));
  }, [evidenceRecords]);

  const selectedApproval = approvalRecords.find((record) => record.id === approvalRecordId) ?? approvalRecords[0] ?? null;
  const selectedRo = repairOrders.find((ro) => ro.id === selectedApproval?.roId) ?? null;

  const evidenceByApproval = useMemo(() => {
    const map = new Map<string, ApprovalEvidenceRecord[]>();
    evidenceRecords.forEach((row) => {
      map.set(row.approvalRecordId, [...(map.get(row.approvalRecordId) ?? []), row]);
    });
    return map;
  }, [evidenceRecords]);

  const saveEvidence = () => {
    if (!selectedApproval) return;
    const signer = signerName.trim() || selectedApproval.customerName || selectedRo?.customerName || "Customer";
    const record: ApprovalEvidenceRecord = {
      id: uid(),
      approvalRecordId: selectedApproval.id,
      roId: selectedApproval.roId,
      signerName: signer,
      evidenceType,
      reference: reference.trim() || "Captured for internal approval evidence.",
      capturedAt: new Date().toISOString(),
      capturedBy: "Staff",
    };
    setEvidenceRecords((current) => [record, ...current]);
    setSignerName("");
    setReference("");
  };

  return (
    <section style={styles.panel} data-testid="approval-evidence-panel">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Digital Signature / Approval Evidence</div>
          <h2 style={styles.title}>Approval evidence register</h2>
          <div style={styles.subtitle}>Internal-only proof log for signatures, SMS confirmations, and approval references.</div>
        </div>
        <span style={styles.badge}>{evidenceRecords.length} evidence record(s)</span>
      </div>

      <div style={{ ...styles.form, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(4, minmax(0, 1fr))" }}>
        <label style={styles.label}>
          Approval Record
          <select data-testid="approval-evidence-select" style={styles.input} value={selectedApproval?.id ?? ""} onChange={(event) => setApprovalRecordId(event.target.value)}>
            {approvalRecords.map((record) => (
              <option key={record.id} value={record.id}>{record.approvalNumber} / {record.roNumber}</option>
            ))}
          </select>
        </label>
        <label style={styles.label}>
          Signer
          <input data-testid="approval-evidence-signer" style={styles.input} value={signerName} onChange={(event) => setSignerName(event.target.value)} placeholder={selectedApproval?.customerName || "Customer"} />
        </label>
        <label style={styles.label}>
          Evidence Type
          <select data-testid="approval-evidence-type" style={styles.input} value={evidenceType} onChange={(event) => setEvidenceType(event.target.value as ApprovalEvidenceRecord["evidenceType"])}>
            <option>Digital Signature</option>
            <option>SMS Confirmation</option>
            <option>Verbal Approval</option>
            <option>Uploaded Document</option>
          </select>
        </label>
        <label style={styles.label}>
          Reference / Note
          <input data-testid="approval-evidence-reference" style={styles.input} value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Reference, initials, or note" />
        </label>
      </div>
      <div style={styles.actions}>
        <button type="button" style={styles.button} onClick={saveEvidence} disabled={!selectedApproval}>Capture Evidence</button>
        <span style={styles.meta}>{selectedRo ? `${selectedRo.roNumber} / ${selectedRo.plateNumber || selectedRo.conductionNumber || "No plate"}` : "No approval selected."}</span>
      </div>

      <div style={styles.list}>
        {approvalRecords.slice(0, 6).map((record) => {
          const rows = evidenceByApproval.get(record.id) ?? [];
          return (
            <div key={record.id} style={styles.card} data-testid={`approval-evidence-row-${record.id}`}>
              <div style={styles.cardHeader}>
                <strong>{record.approvalNumber}</strong>
                <span style={rows.length ? styles.complete : styles.pending}>{rows.length ? "Evidence Captured" : "No Evidence Yet"}</span>
              </div>
              <div style={styles.meta}>{record.roNumber} / {record.customerName}</div>
              {rows.slice(0, 2).map((row) => (
                <div key={row.id} style={styles.evidenceLine}>{row.evidenceType}: {row.signerName} / {new Date(row.capturedAt).toLocaleString()} / {row.reference}</div>
              ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 12 },
  eyebrow: { fontSize: 12, textTransform: "uppercase", color: "#64748b", fontWeight: 700 },
  title: { margin: "2px 0 0", fontSize: 20, color: "#0f172a" },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 4 },
  badge: { borderRadius: 999, padding: "6px 10px", background: "#dcfce7", color: "#166534", fontSize: 12, fontWeight: 800 },
  form: { display: "grid", gap: 10 },
  label: { display: "grid", gap: 6, color: "#475569", fontSize: 12, fontWeight: 800, textTransform: "uppercase" },
  input: { border: "1px solid #cbd5e1", borderRadius: 6, padding: "8px 10px", background: "#fff", color: "#0f172a", textTransform: "none", fontWeight: 600 },
  actions: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 10 },
  button: { border: "none", borderRadius: 8, padding: "9px 12px", background: "#2563eb", color: "#fff", fontWeight: 800, cursor: "pointer" },
  list: { display: "grid", gap: 8, marginTop: 12 },
  card: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc" },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  complete: { borderRadius: 999, padding: "4px 8px", background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 800 },
  pending: { borderRadius: 999, padding: "4px 8px", background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 800 },
  meta: { color: "#64748b", fontSize: 12 },
  evidenceLine: { color: "#334155", fontSize: 12, marginTop: 6 },
};
