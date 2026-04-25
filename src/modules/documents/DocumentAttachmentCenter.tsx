import React, { useEffect, useMemo, useState } from "react";
import type { RepairOrderRecord } from "../shared/types";

type Props = {
  repairOrders: RepairOrderRecord[];
  isCompactLayout: boolean;
};

type AttachmentRecord = {
  id: string;
  roId: string;
  roNumber: string;
  documentType: "Estimate" | "Inspection Photo" | "Approval Evidence" | "Invoice" | "Release Document" | "Other";
  fileName: string;
  note: string;
  addedAt: string;
  addedBy: string;
};

const STORAGE_KEY = "dvi_document_attachments_v1";

function readAttachments() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]") as AttachmentRecord[];
  } catch {
    return [];
  }
}

function uid() {
  return `doc_${Math.random().toString(36).slice(2, 10)}`;
}

function vehicleLabel(ro: RepairOrderRecord) {
  return [ro.year, ro.make, ro.model].filter(Boolean).join(" ") || ro.plateNumber || ro.conductionNumber || "Vehicle";
}

export function DocumentAttachmentCenter({ repairOrders, isCompactLayout }: Props) {
  const activeRos = repairOrders.filter((ro) => !["Closed"].includes(ro.status));
  const [attachments, setAttachments] = useState<AttachmentRecord[]>(() => readAttachments());
  const [roId, setRoId] = useState(() => activeRos[0]?.id ?? "");
  const [documentType, setDocumentType] = useState<AttachmentRecord["documentType"]>("Estimate");
  const [fileName, setFileName] = useState("");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attachments));
  }, [attachments]);

  const selectedRo = activeRos.find((ro) => ro.id === roId) ?? activeRos[0] ?? null;
  const filteredAttachments = useMemo(
    () =>
      attachments
        .filter((row) => filter === "all" || row.documentType === filter)
        .sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
    [attachments, filter]
  );

  const addAttachment = () => {
    if (!selectedRo) return;
    const name = fileName.trim();
    if (!name) return;
    const record: AttachmentRecord = {
      id: uid(),
      roId: selectedRo.id,
      roNumber: selectedRo.roNumber,
      documentType,
      fileName: name,
      note: note.trim(),
      addedAt: new Date().toISOString(),
      addedBy: "Staff",
    };
    setAttachments((current) => [record, ...current]);
    setFileName("");
    setNote("");
  };

  return (
    <section style={styles.panel} data-testid="document-attachment-center">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Document / Attachment Center</div>
          <h2 style={styles.title}>Attachment index</h2>
          <div style={styles.subtitle}>Internal document tracking for estimates, inspection media, approval evidence, invoices, and release documents.</div>
        </div>
        <span style={styles.badge}>{attachments.length} indexed item(s)</span>
      </div>

      <div style={{ ...styles.form, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(5, minmax(0, 1fr))" }}>
        <label style={styles.label}>
          Repair Order
          <select data-testid="document-center-ro-select" style={styles.input} value={selectedRo?.id ?? ""} onChange={(event) => setRoId(event.target.value)}>
            {activeRos.map((ro) => (
              <option key={ro.id} value={ro.id}>{ro.roNumber} / {vehicleLabel(ro)}</option>
            ))}
          </select>
        </label>
        <label style={styles.label}>
          Type
          <select data-testid="document-center-type" style={styles.input} value={documentType} onChange={(event) => setDocumentType(event.target.value as AttachmentRecord["documentType"])}>
            <option>Estimate</option>
            <option>Inspection Photo</option>
            <option>Approval Evidence</option>
            <option>Invoice</option>
            <option>Release Document</option>
            <option>Other</option>
          </select>
        </label>
        <label style={styles.label}>
          File / Link Name
          <input data-testid="document-center-file-name" style={styles.input} value={fileName} onChange={(event) => setFileName(event.target.value)} placeholder="estimate-ro-001.pdf" />
        </label>
        <label style={styles.label}>
          Note
          <input data-testid="document-center-note" style={styles.input} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note" />
        </label>
        <label style={styles.label}>
          Filter
          <select data-testid="document-center-filter" style={styles.input} value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="all">All documents</option>
            <option>Estimate</option>
            <option>Inspection Photo</option>
            <option>Approval Evidence</option>
            <option>Invoice</option>
            <option>Release Document</option>
            <option>Other</option>
          </select>
        </label>
      </div>

      <div style={styles.actions}>
        <button type="button" style={styles.button} onClick={addAttachment} disabled={!selectedRo || !fileName.trim()}>Index Attachment</button>
        <span style={styles.meta}>Metadata only. No public exposure and no customer portal document sharing added.</span>
      </div>

      <div style={styles.list}>
        {filteredAttachments.length ? filteredAttachments.slice(0, 10).map((row) => (
          <article key={row.id} style={styles.card} data-testid={`document-center-row-${row.id}`}>
            <div style={styles.cardHeader}>
              <strong>{row.fileName}</strong>
              <span style={styles.type}>{row.documentType}</span>
            </div>
            <div style={styles.meta}>{row.roNumber} / {new Date(row.addedAt).toLocaleString()}</div>
            {row.note ? <div style={styles.note}>{row.note}</div> : null}
          </article>
        )) : <div style={styles.empty}>No indexed attachments yet.</div>}
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
  badge: { borderRadius: 999, padding: "6px 10px", background: "#f1f5f9", color: "#334155", fontSize: 12, fontWeight: 800 },
  form: { display: "grid", gap: 10 },
  label: { display: "grid", gap: 6, color: "#475569", fontSize: 12, fontWeight: 800, textTransform: "uppercase" },
  input: { border: "1px solid #cbd5e1", borderRadius: 6, padding: "8px 10px", background: "#fff", color: "#0f172a", textTransform: "none", fontWeight: 600 },
  actions: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 10 },
  button: { border: "none", borderRadius: 8, padding: "9px 12px", background: "#2563eb", color: "#fff", fontWeight: 800, cursor: "pointer" },
  list: { display: "grid", gap: 8, marginTop: 12 },
  card: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc" },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  type: { borderRadius: 999, padding: "4px 8px", background: "#dbeafe", color: "#1d4ed8", fontSize: 11, fontWeight: 800 },
  meta: { color: "#64748b", fontSize: 12 },
  note: { color: "#334155", fontSize: 12, marginTop: 6 },
  empty: { border: "1px dashed #cbd5e1", borderRadius: 8, padding: 16, color: "#64748b", background: "#f8fafc" },
};
