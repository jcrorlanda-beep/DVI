import React, { useEffect, useMemo, useState } from "react";
import type { RepairOrderRecord } from "../shared/types";
import { BackToListButton } from "../shared/BackToListButton";
import { isBackendWritePilotRequested } from "../api/backendDataMode";
import { createDocumentBackendPilot, updateDocumentBackendPilot, uploadFileBackendPilot } from "../api/writePilotHelpers";
import {
  buildDocumentAttachmentPreview,
  buildLinkedAttachmentLabel,
  DOCUMENT_ATTACHMENT_SOURCE_MODULES,
  DOCUMENT_ATTACHMENT_TYPES,
  formatDocumentAttachmentSize,
  normalizeDocumentAttachmentRecord,
  readDocumentAttachmentRecords,
  type DocumentAttachmentRecord,
} from "./documentAttachmentHelpers";

type Props = {
  repairOrders: RepairOrderRecord[];
  isCompactLayout: boolean;
  currentUserFullName?: string;
};

function vehicleLabel(ro: RepairOrderRecord) {
  return [ro.year, ro.make, ro.model].filter(Boolean).join(" ") || ro.plateNumber || ro.conductionNumber || "Vehicle";
}

function legacySafeLabel(record: DocumentAttachmentRecord) {
  return record.linkedEntityLabel.trim() || record.roNumber.trim() || "Unlinked attachment";
}

export function DocumentAttachmentCenter({ repairOrders, isCompactLayout, currentUserFullName }: Props) {
  const activeRos = repairOrders.filter((ro) => !["Closed"].includes(ro.status));
  const [attachments, setAttachments] = useState<DocumentAttachmentRecord[]>(() => readDocumentAttachmentRecords());
  const [roId, setRoId] = useState(() => activeRos[0]?.id ?? "");
  const [documentType, setDocumentType] = useState<DocumentAttachmentRecord["documentType"]>("Estimate");
  const [sourceModule, setSourceModule] = useState<DocumentAttachmentRecord["sourceModule"]>("Repair Orders");
  const [fileName, setFileName] = useState("");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedAttachmentId, setSelectedAttachmentId] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileWarning, setFileWarning] = useState("");
  const [backendUploadStatus, setBackendUploadStatus] = useState<"local" | "ready" | "uploading" | "uploaded" | "failed" | "unavailable">("local");
  const [backendUploadMessage, setBackendUploadMessage] = useState("Local metadata only. Backend file/document pilot is optional and guarded.");
  const backendApiUrl = typeof import.meta !== "undefined" ? String(import.meta.env.VITE_DVI_API_URL ?? "").trim() : "";
  const backendUploadEnabled = String(import.meta.env.VITE_DVI_USE_BACKEND ?? "").toLowerCase() === "true" && !!backendApiUrl;
  const backendWritePilotRequested = isBackendWritePilotRequested();
  const backendUploadReady = backendUploadEnabled && backendWritePilotRequested;

  useEffect(() => {
    window.localStorage.setItem("dvi_document_attachments_v1", JSON.stringify(attachments));
  }, [attachments]);

  const selectedRo = activeRos.find((ro) => ro.id === roId) ?? activeRos[0] ?? null;
  const filteredAttachments = useMemo(
    () =>
      attachments
        .filter((row) => filter === "all" || row.documentType === filter)
        .sort((a, b) => b.addedAt.localeCompare(a.addedAt)),
    [attachments, filter]
  );
  const selectedAttachment = filteredAttachments.find((row) => row.id === selectedAttachmentId) ?? null;

  useEffect(() => {
    if (!selectedRo) return;
    if (!roId || !activeRos.some((row) => row.id === roId)) {
      setRoId(selectedRo.id);
    }
  }, [activeRos, roId, selectedRo]);

  const addAttachment = async () => {
    if (!selectedRo && !pendingFile && !fileName.trim()) return;
    const now = new Date().toISOString();
    const chosenName = fileName.trim() || pendingFile?.name?.trim() || "Attachment";
    const linkedEntityId = selectedRo?.id ?? "";
    const linkedEntityLabel = selectedRo ? `${selectedRo.roNumber} / ${vehicleLabel(selectedRo)}` : "Unlinked attachment";
    const uploadedBy = currentUserFullName?.trim() || "Staff";

    if (pendingFile) {
      const preview = await buildDocumentAttachmentPreview(pendingFile);
      const record = normalizeDocumentAttachmentRecord({
        id: `doc_${Math.random().toString(36).slice(2, 10)}`,
        roId: selectedRo?.id ?? "",
        roNumber: selectedRo?.roNumber ?? "",
        documentType,
        fileName: chosenName,
        note: note.trim(),
        addedAt: now,
        addedBy: uploadedBy,
        fileType: pendingFile.type || "application/octet-stream",
        fileSize: pendingFile.size,
        uploadedAt: now,
        uploadedBy,
        sourceModule,
        linkedEntityId,
        linkedEntityLabel,
        previewKind: preview.previewKind,
        dataUrl: preview.dataUrl,
        textPreview: preview.textPreview,
        customerVisible: false,
      });
      setAttachments((current) => [record, ...current]);
      setSelectedAttachmentId(record.id);
      setFileWarning(preview.warning || "");
      void createDocumentBackendPilot({
        localId: record.id,
        fileName: record.fileName,
        fileType: record.fileType,
        mimeType: record.fileType,
        fileSize: record.fileSize,
        sourceModule: record.sourceModule,
        linkedEntityId: record.linkedEntityId,
        linkedEntityLabel: record.linkedEntityLabel,
        customerVisible: false,
        internalOnly: true,
        uploadedAt: record.uploadedAt,
        uploadedBy: record.uploadedBy,
        note: record.note,
      });
    } else {
      const record = normalizeDocumentAttachmentRecord({
        id: `doc_${Math.random().toString(36).slice(2, 10)}`,
        roId: selectedRo?.id ?? "",
        roNumber: selectedRo?.roNumber ?? "",
        documentType,
        fileName: chosenName,
        note: note.trim(),
        addedAt: now,
        addedBy: uploadedBy,
        fileType: "application/octet-stream",
        fileSize: 0,
        uploadedAt: now,
        uploadedBy,
        sourceModule,
        linkedEntityId,
        linkedEntityLabel,
        previewKind: "file",
        customerVisible: false,
      });
      setAttachments((current) => [record, ...current]);
      setSelectedAttachmentId(record.id);
      setFileWarning("");
      void createDocumentBackendPilot({
        localId: record.id,
        fileName: record.fileName,
        fileType: record.fileType,
        mimeType: record.fileType,
        fileSize: record.fileSize,
        sourceModule: record.sourceModule,
        linkedEntityId: record.linkedEntityId,
        linkedEntityLabel: record.linkedEntityLabel,
        customerVisible: false,
        internalOnly: true,
        uploadedAt: record.uploadedAt,
        uploadedBy: record.uploadedBy,
        note: record.note,
      });
    }

    setFileName("");
    setNote("");
    setPendingFile(null);
  };

  const uploadSelectedToBackend = async () => {
    if (!selectedAttachment) return;
    if (!backendUploadReady) {
      setBackendUploadStatus(backendUploadEnabled ? "unavailable" : "local");
      setBackendUploadMessage("Backend upload pilot is locked or backend API is not configured. Local metadata remains intact.");
      return;
    }
    if (!selectedAttachment.dataUrl) {
      setBackendUploadStatus("failed");
      setBackendUploadMessage("No local preview payload is available for upload. Metadata can remain local until the file is selected again.");
      return;
    }
    if (selectedAttachment.fileSize > 10 * 1024 * 1024) {
      setBackendUploadStatus("failed");
      setBackendUploadMessage("File exceeds the safe frontend pilot limit. Use a backend-managed migration later.");
      return;
    }
    if (!/^(image\/|text\/|application\/pdf|application\/json|application\/xml|application\/rtf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/.test(selectedAttachment.fileType)) {
      setBackendUploadStatus("failed");
      setBackendUploadMessage("File type is not allowed for backend upload pilot.");
      return;
    }
    setBackendUploadStatus("uploading");
    setBackendUploadMessage("Uploading to backend storage pilot. Local metadata remains the source of truth.");
    const upload = await uploadFileBackendPilot({
      localId: selectedAttachment.id,
      fileName: selectedAttachment.fileName,
      mimeType: selectedAttachment.fileType,
      fileSize: selectedAttachment.fileSize,
      dataUrl: selectedAttachment.dataUrl,
      sourceModule: selectedAttachment.sourceModule,
      linkedEntityId: selectedAttachment.linkedEntityId,
      linkedEntityLabel: selectedAttachment.linkedEntityLabel,
      note: selectedAttachment.note,
    });
    if (!upload.success || !upload.fileId) {
      setBackendUploadStatus("failed");
      setBackendUploadMessage(upload.warning ?? "Backend upload failed. Local metadata was not changed.");
      return;
    }
    const nextRecord = { ...selectedAttachment, fileId: upload.fileId, storageKey: upload.storageKey };
    setAttachments((current) => current.map((row) => (row.id === selectedAttachment.id ? nextRecord : row)));
    await updateDocumentBackendPilot(selectedAttachment.id, {
      fileName: selectedAttachment.fileName,
      fileType: selectedAttachment.fileType,
      mimeType: selectedAttachment.fileType,
      fileSize: selectedAttachment.fileSize,
      sourceModule: selectedAttachment.sourceModule,
      linkedEntityId: selectedAttachment.linkedEntityId,
      linkedEntityLabel: selectedAttachment.linkedEntityLabel,
      customerVisible: false,
      internalOnly: true,
      fileId: upload.fileId,
      storageKey: upload.storageKey,
      note: selectedAttachment.note,
    });
    setBackendUploadStatus("uploaded");
    setBackendUploadMessage("Uploaded to backend storage pilot and linked to metadata. LocalStorage remains the active document index.");
  };

  const deleteAttachment = (attachmentId: string) => {
    const target = attachments.find((row) => row.id === attachmentId);
    if (!target) return;
    const confirmDelete = typeof window !== "undefined" ? window.confirm(`Delete attachment ${target.fileName}?`) : true;
    if (!confirmDelete) return;
    setAttachments((current) => current.filter((row) => row.id !== attachmentId));
    if (selectedAttachmentId === attachmentId) {
      setSelectedAttachmentId("");
    }
  };

  const setCustomerVisible = (attachmentId: string, nextVisible: boolean) => {
    setAttachments((current) =>
      current.map((row) =>
        row.id === attachmentId
          ? {
              ...row,
              customerVisible: nextVisible,
            }
          : row
      )
    );
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPendingFile(file);
    if (!file) {
      setFileWarning("");
      return;
    }
    setFileName(file.name);
    if (file.size > 1_500_000) {
      setFileWarning("Large files can exceed browser storage. Metadata will still be saved, but preview data may be omitted.");
    } else if (file.size > 1_000_000) {
      setFileWarning("This file is large. Keep file sizes small when possible.");
    } else {
      setFileWarning("");
    }
  };

  const selectedFileInfo = pendingFile
    ? `${pendingFile.name} / ${pendingFile.type || "application/octet-stream"} / ${formatDocumentAttachmentSize(pendingFile.size)}`
    : "";

  return (
    <section style={styles.panel} data-testid="document-attachment-center">
      <div style={styles.header}>
        <div>
          <div style={styles.eyebrow}>Document / Attachment Center</div>
          <h2 style={styles.title}>Attachment index</h2>
          <div style={styles.subtitle}>
            Internal document tracking for estimates, inspection media, approval evidence, invoices, and release documents.
          </div>
        </div>
        <div style={styles.headerBadges}>
          <span style={styles.badge}>{attachments.length} indexed item(s)</span>
          <span style={backendUploadReady ? styles.smallBadgeSuccess : styles.smallBadgeMuted}>
            {backendUploadReady ? "Backend upload pilot ready" : backendUploadEnabled ? "Backend configured / pilot locked" : "Local metadata / preview mode"}
          </span>
        </div>
      </div>

      <div style={styles.infoBanner} data-testid="document-center-upload-mode">
        Current upload mode: {backendUploadReady ? `Backend upload pilot ready at ${backendApiUrl}` : backendUploadEnabled ? "Backend API configured, but write pilot is locked" : "Local metadata / preview mode"}.
        The app still works offline; large production files should be stored on the backend/file server, not in browser localStorage.
      </div>
      <div style={styles.infoBanner} data-testid="document-center-backend-upload-status">
        Backend upload status: {backendUploadStatus}. {backendUploadMessage}
      </div>

      <div style={{ ...styles.form, gridTemplateColumns: isCompactLayout ? "1fr" : "repeat(6, minmax(0, 1fr))" }}>
        <label style={styles.label}>
          Repair Order
          <select
            data-testid="document-center-ro-select"
            style={styles.input}
            value={selectedRo?.id ?? ""}
            onChange={(event) => setRoId(event.target.value)}
          >
            {activeRos.map((ro) => (
              <option key={ro.id} value={ro.id}>
                {ro.roNumber} / {vehicleLabel(ro)}
              </option>
            ))}
          </select>
        </label>
        <label style={styles.label}>
          Source Module
          <select
            data-testid="document-center-source-module"
            style={styles.input}
            value={sourceModule}
            onChange={(event) => setSourceModule(event.target.value as DocumentAttachmentRecord["sourceModule"])}
          >
            {DOCUMENT_ATTACHMENT_SOURCE_MODULES.map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
        </label>
        <label style={styles.label}>
          Document Type
          <select
            data-testid="document-center-type"
            style={styles.input}
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value as DocumentAttachmentRecord["documentType"])}
          >
            {DOCUMENT_ATTACHMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label style={styles.label}>
          File Upload
          <input
            data-testid="document-center-file-input"
            style={styles.input}
            type="file"
            accept="image/*,application/pdf,text/plain,text/markdown,text/csv,application/json,application/xml,.txt,.md,.csv,.json,.xml,.rtf,.log,.html,.htm,.doc,.docx"
            onChange={onFileChange}
          />
        </label>
        <label style={styles.label}>
          File / Link Name
          <input
            data-testid="document-center-file-name"
            style={styles.input}
            value={fileName}
            onChange={(event) => setFileName(event.target.value)}
            placeholder="estimate-ro-001.pdf"
          />
        </label>
        <label style={styles.label}>
          Note
          <input
            data-testid="document-center-note"
            style={styles.input}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional note"
          />
        </label>
        <label style={styles.label}>
          Filter
          <select
            data-testid="document-center-filter"
            style={styles.input}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">All documents</option>
            {DOCUMENT_ATTACHMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div style={styles.actions}>
        <button
          type="button"
          style={styles.button}
          onClick={() => void addAttachment()}
          disabled={!selectedRo && !pendingFile && !fileName.trim()}
        >
          Index Attachment
        </button>
        <span style={styles.meta}>
          Metadata is stored locally in the browser unless a later backend upload cutover is enabled.
        </span>
      </div>

      {fileWarning ? <div style={styles.warning} data-testid="document-center-upload-warning">{fileWarning}</div> : null}
      {selectedFileInfo ? <div style={styles.fileInfo}>{selectedFileInfo}</div> : null}

      <div style={styles.list}>
        {filteredAttachments.length
          ? filteredAttachments.slice(0, 10).map((row) => (
              <button
                key={row.id}
                type="button"
                style={styles.cardButton}
                data-testid={`document-center-row-${row.id}`}
                onClick={() => setSelectedAttachmentId(row.id)}
              >
                <div style={styles.cardHeader}>
                  <strong>{row.fileName}</strong>
                  <span style={styles.type}>{row.documentType}</span>
                </div>
                <div style={styles.badgeRow}>
                  <span style={styles.smallBadge}>{row.sourceModule}</span>
                  <span style={styles.smallBadge}>{formatDocumentAttachmentSize(row.fileSize)}</span>
                  {row.customerVisible ? <span style={styles.smallBadgeSuccess}>Customer Visible</span> : <span style={styles.smallBadgeMuted}>Internal Only</span>}
                  {row.fileId || row.storageKey ? <span style={styles.smallBadge}>Backend File Ref</span> : <span style={styles.smallBadgeMuted}>Metadata / Local Preview</span>}
                </div>
                <div style={styles.meta}>{row.roNumber || "Unlinked"} / {new Date(row.addedAt).toLocaleString()}</div>
                {row.note ? <div style={styles.note}>{row.note}</div> : null}
              </button>
            ))
          : <div style={styles.empty}>No indexed attachments yet.</div>}
      </div>

      {selectedAttachment ? (
        <div style={{ ...styles.card, marginTop: 12 }} data-testid="document-detail-panel">
          <div style={styles.cardHeader}>
            <strong>Document Detail</strong>
            <span style={styles.type}>{selectedAttachment.documentType}</span>
          </div>
          <div style={styles.detailToolbar}>
            <BackToListButton onClick={() => setSelectedAttachmentId("")} testId="document-back-to-list" />
          </div>
          <div style={styles.detailGrid}>
            <div style={styles.meta}><strong>File:</strong> {selectedAttachment.fileName}</div>
            <div style={styles.meta}><strong>Source:</strong> {selectedAttachment.sourceModule}</div>
            <div style={styles.meta}><strong>Type:</strong> {selectedAttachment.fileType}</div>
            <div style={styles.meta}><strong>Size:</strong> {formatDocumentAttachmentSize(selectedAttachment.fileSize)}</div>
            <div style={styles.meta}><strong>Linked:</strong> {legacySafeLabel(selectedAttachment)}</div>
            <div style={styles.meta}><strong>Uploaded:</strong> {new Date(selectedAttachment.uploadedAt).toLocaleString()}</div>
            <div style={styles.meta}><strong>Uploaded by:</strong> {selectedAttachment.uploadedBy}</div>
            <div style={styles.meta}><strong>Visibility:</strong> {selectedAttachment.customerVisible ? "Customer visible" : "Internal only"}</div>
          </div>
          <div style={styles.warning} data-testid="document-center-sharing-warning">
            Only mark documents customer-visible after confirming content is appropriate.
          </div>
          {!selectedAttachment.dataUrl && !selectedAttachment.fileId && !selectedAttachment.storageKey ? (
            <div style={styles.infoBanner} data-testid="document-center-missing-file-state">
              Missing file state: this record is metadata-only or legacy data. The detail view stays safe even when no file preview exists.
            </div>
          ) : null}
          <label style={styles.visibilityLabel}>
            <input
              data-testid="document-center-customer-visible"
              type="checkbox"
              checked={!!selectedAttachment.customerVisible}
              onChange={(event) => setCustomerVisible(selectedAttachment.id, event.target.checked)}
            />
            Customer visible
          </label>
          <div style={styles.badgeRow}>
            {selectedAttachment.customerVisible ? <span style={styles.smallBadgeSuccess}>Customer-visible metadata</span> : <span style={styles.smallBadgeMuted}>Internal-only metadata</span>}
            {selectedAttachment.fileId ? <span style={styles.smallBadge}>File ID linked</span> : null}
            {selectedAttachment.storageKey ? <span style={styles.smallBadge}>Storage key linked</span> : null}
          </div>
          {selectedAttachment.note ? <div style={styles.note}>{selectedAttachment.note}</div> : <div style={styles.note}>No note provided.</div>}

          <div style={styles.previewBox} data-testid="document-preview-panel">
            {selectedAttachment.dataUrl ? (
              selectedAttachment.previewKind === "image" ? (
                <img src={selectedAttachment.dataUrl} alt={selectedAttachment.fileName} style={styles.previewImage} />
              ) : selectedAttachment.previewKind === "pdf" ? (
                <iframe title={selectedAttachment.fileName} src={selectedAttachment.dataUrl} style={styles.previewFrame} />
              ) : selectedAttachment.previewKind === "text" ? (
                <pre style={styles.previewText}>{selectedAttachment.textPreview || "Preview loaded."}</pre>
              ) : (
                <div style={styles.empty}>Preview is not supported for this file type, but the attachment metadata was saved.</div>
              )
            ) : (
              <div style={styles.empty}>Preview unavailable. The file may be too large for browser storage, or the record may be legacy metadata only.</div>
            )}
          </div>

          <div style={styles.actions}>
            <button type="button" style={backendUploadReady ? styles.button : styles.disabledButton} disabled={!backendUploadReady || !selectedAttachment.dataUrl || backendUploadStatus === "uploading"} onClick={() => void uploadSelectedToBackend()}>
              Upload to backend storage
            </button>
            <button type="button" style={styles.dangerButton} data-testid="document-center-delete" onClick={() => deleteAttachment(selectedAttachment.id)}>
              Delete Attachment
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 12 },
  headerBadges: { display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" },
  eyebrow: { fontSize: 12, textTransform: "uppercase", color: "#64748b", fontWeight: 700 },
  title: { margin: "2px 0 0", fontSize: 20, color: "#0f172a" },
  subtitle: { color: "#64748b", fontSize: 13, marginTop: 4 },
  badge: { borderRadius: 999, padding: "6px 10px", background: "#f1f5f9", color: "#334155", fontSize: 12, fontWeight: 800 },
  form: { display: "grid", gap: 10 },
  label: { display: "grid", gap: 6, color: "#475569", fontSize: 12, fontWeight: 800, textTransform: "uppercase" },
  input: { border: "1px solid #cbd5e1", borderRadius: 6, padding: "8px 10px", background: "#fff", color: "#0f172a", textTransform: "none", fontWeight: 600 },
  actions: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 10 },
  button: { border: "none", borderRadius: 8, padding: "9px 12px", background: "#2563eb", color: "#fff", fontWeight: 800, cursor: "pointer" },
  disabledButton: { border: "none", borderRadius: 8, padding: "9px 12px", background: "#cbd5e1", color: "#475569", fontWeight: 800, cursor: "not-allowed" },
  dangerButton: { border: "none", borderRadius: 8, padding: "9px 12px", background: "#b91c1c", color: "#fff", fontWeight: 800, cursor: "pointer" },
  list: { display: "grid", gap: 8, marginTop: 12 },
  card: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc" },
  cardButton: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#f8fafc", cursor: "pointer", textAlign: "left" as const },
  cardHeader: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  type: { borderRadius: 999, padding: "4px 8px", background: "#dbeafe", color: "#1d4ed8", fontSize: 11, fontWeight: 800 },
  badgeRow: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 },
  smallBadge: { borderRadius: 999, padding: "3px 8px", background: "#e2e8f0", color: "#334155", fontSize: 11, fontWeight: 700 },
  smallBadgeSuccess: { borderRadius: 999, padding: "3px 8px", background: "#dcfce7", color: "#166534", fontSize: 11, fontWeight: 700 },
  smallBadgeMuted: { borderRadius: 999, padding: "3px 8px", background: "#f1f5f9", color: "#475569", fontSize: 11, fontWeight: 700 },
  meta: { color: "#64748b", fontSize: 12 },
  note: { color: "#334155", fontSize: 12, marginTop: 6 },
  empty: { border: "1px dashed #cbd5e1", borderRadius: 8, padding: 16, color: "#64748b", background: "#f8fafc" },
  warning: { borderRadius: 8, padding: "10px 12px", background: "#fffbeb", border: "1px solid #f59e0b", color: "#92400e", fontSize: 12, fontWeight: 700, marginTop: 10 },
  infoBanner: { borderRadius: 8, padding: "10px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", fontSize: 12, fontWeight: 700, marginTop: 10 },
  fileInfo: { marginTop: 8, color: "#475569", fontSize: 12, fontWeight: 700 },
  detailGrid: { display: "grid", gap: 6, gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", marginTop: 8 },
  detailToolbar: { display: "flex", justifyContent: "flex-end", marginTop: 8 },
  visibilityLabel: { display: "flex", alignItems: "center", gap: 8, marginTop: 10, color: "#475569", fontSize: 13, fontWeight: 700 },
  previewBox: { border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, background: "#fff", marginTop: 10 },
  previewImage: { maxWidth: "100%", width: "100%", borderRadius: 8, objectFit: "contain" as const, display: "block" },
  previewFrame: { width: "100%", minHeight: 420, border: "none", borderRadius: 8, background: "#fff" },
  previewText: { margin: 0, padding: 12, whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const, fontSize: 12, color: "#0f172a", background: "#f8fafc", borderRadius: 8, maxHeight: 420, overflow: "auto" },
};
