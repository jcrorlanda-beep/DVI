export type DocumentAttachmentSourceModule =
  | "Repair Orders"
  | "Inspection"
  | "Approvals"
  | "Release"
  | "Backjobs"
  | "Parts"
  | "Other";

export type DocumentAttachmentDocumentType =
  | "Estimate"
  | "Inspection Photo"
  | "Approval Evidence"
  | "Invoice"
  | "Release Document"
  | "Other";

export type DocumentAttachmentPreviewKind = "image" | "pdf" | "text" | "file";

export type DocumentAttachmentRecord = {
  id: string;
  roId: string;
  roNumber: string;
  documentType: DocumentAttachmentDocumentType;
  fileName: string;
  note: string;
  addedAt: string;
  addedBy: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  sourceModule: DocumentAttachmentSourceModule;
  linkedEntityId: string;
  linkedEntityLabel: string;
  previewKind: DocumentAttachmentPreviewKind;
  dataUrl?: string;
  textPreview?: string;
  customerVisible?: boolean;
};

export type DocumentAttachmentPreview = {
  dataUrl?: string;
  textPreview?: string;
  previewKind: DocumentAttachmentPreviewKind;
  warning?: string;
};

export const DOCUMENT_ATTACHMENT_STORAGE_KEY = "dvi_document_attachments_v1";

export const DOCUMENT_ATTACHMENT_SOURCE_MODULES: DocumentAttachmentSourceModule[] = [
  "Repair Orders",
  "Inspection",
  "Approvals",
  "Release",
  "Backjobs",
  "Parts",
  "Other",
];

export const DOCUMENT_ATTACHMENT_TYPES: DocumentAttachmentDocumentType[] = [
  "Estimate",
  "Inspection Photo",
  "Approval Evidence",
  "Invoice",
  "Release Document",
  "Other",
];

export const DOCUMENT_ATTACHMENT_PREVIEW_LIMIT_BYTES = 1_500_000;
export const DOCUMENT_ATTACHMENT_WARNING_BYTES = 1_000_000;

function isDocumentAttachmentSourceModule(value: unknown): value is DocumentAttachmentSourceModule {
  return typeof value === "string" && DOCUMENT_ATTACHMENT_SOURCE_MODULES.includes(value as DocumentAttachmentSourceModule);
}

function isDocumentAttachmentType(value: unknown): value is DocumentAttachmentDocumentType {
  return typeof value === "string" && DOCUMENT_ATTACHMENT_TYPES.includes(value as DocumentAttachmentDocumentType);
}

function isImageFile(fileType: string, fileName: string) {
  return fileType.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileName);
}

function isPdfFile(fileType: string, fileName: string) {
  return fileType === "application/pdf" || /\.pdf$/i.test(fileName);
}

function isTextLikeFile(fileType: string, fileName: string) {
  return (
    fileType.startsWith("text/") ||
    [
      ".txt",
      ".md",
      ".csv",
      ".json",
      ".xml",
      ".rtf",
      ".log",
      ".html",
      ".htm",
    ].some((extension) => fileName.toLowerCase().endsWith(extension))
  );
}

function getPreviewKind(fileType: string, fileName: string): DocumentAttachmentPreviewKind {
  if (isImageFile(fileType, fileName)) return "image";
  if (isPdfFile(fileType, fileName)) return "pdf";
  if (isTextLikeFile(fileType, fileName)) return "text";
  return "file";
}

function guessFileTypeFromName(fileName: string) {
  const lower = fileName.toLowerCase();
  if (/\.(png|jpe?g|gif|webp|bmp|svg)$/.test(lower)) return "image/*";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".csv")) return "text/csv";
  if (lower.endsWith(".json")) return "application/json";
  if (lower.endsWith(".xml")) return "application/xml";
  if (lower.endsWith(".md")) return "text/markdown";
  if (lower.endsWith(".rtf")) return "application/rtf";
  if (lower.endsWith(".txt") || lower.endsWith(".log")) return "text/plain";
  return "application/octet-stream";
}

function formatLinkedLabel(roNumber: string, linkedEntityLabel: string) {
  const ro = roNumber.trim();
  const label = linkedEntityLabel.trim();
  if (ro && label) return `${ro} / ${label}`;
  return ro || label || "Linked record";
}

function normalizePreviewKind(value: unknown, fileType: string, fileName: string): DocumentAttachmentPreviewKind {
  if (value === "image" || value === "pdf" || value === "text" || value === "file") return value;
  return getPreviewKind(fileType, fileName);
}

function normalizeDocumentType(value: unknown): DocumentAttachmentDocumentType {
  if (isDocumentAttachmentType(value)) return value;
  return "Other";
}

export function normalizeDocumentAttachmentRecord(row: Partial<DocumentAttachmentRecord> & Record<string, unknown>): DocumentAttachmentRecord {
  const fileName = String(row.fileName ?? row.name ?? "Attachment").trim() || "Attachment";
  const roId = String(row.roId ?? row.linkedEntityId ?? row.entityId ?? "").trim();
  const roNumber = String(row.roNumber ?? row.entityLabel ?? row.linkedEntityLabel ?? "").trim();
  const linkedEntityId = String(row.linkedEntityId ?? row.roId ?? row.entityId ?? roId).trim();
  const linkedEntityLabel = String(row.linkedEntityLabel ?? row.entityLabel ?? "").trim() || formatLinkedLabel(roNumber, "");
  const fileType = String(row.fileType ?? row.mimeType ?? guessFileTypeFromName(fileName)).trim() || "application/octet-stream";
  const fileSize = Number(row.fileSize ?? row.size ?? 0);
  const addedAt = String(row.addedAt ?? row.uploadedAt ?? row.createdAt ?? new Date().toISOString());
  const uploadedAt = String(row.uploadedAt ?? row.addedAt ?? row.createdAt ?? addedAt);
  const addedBy = String(row.addedBy ?? row.uploadedBy ?? row.createdBy ?? "Staff");
  const uploadedBy = String(row.uploadedBy ?? row.addedBy ?? row.createdBy ?? addedBy);
  const documentType = normalizeDocumentType(row.documentType);
  const sourceModule = isDocumentAttachmentSourceModule(row.sourceModule)
    ? row.sourceModule
    : (roId || roNumber ? "Repair Orders" : "Other");
  const previewKind = normalizePreviewKind(row.previewKind, fileType, fileName);

  return {
    id: String(row.id ?? `doc_${Math.random().toString(36).slice(2, 10)}`),
    roId,
    roNumber: String(row.roNumber ?? ""),
    documentType,
    fileName,
    note: String(row.note ?? ""),
    addedAt,
    addedBy,
    fileType,
    fileSize: Number.isFinite(fileSize) && fileSize >= 0 ? fileSize : 0,
    uploadedAt,
    uploadedBy,
    sourceModule,
    linkedEntityId,
    linkedEntityLabel,
    previewKind,
    dataUrl: typeof row.dataUrl === "string" && row.dataUrl.trim() ? row.dataUrl : typeof row.previewDataUrl === "string" ? row.previewDataUrl : undefined,
    textPreview: typeof row.textPreview === "string" && row.textPreview.trim() ? row.textPreview : undefined,
    customerVisible: typeof row.customerVisible === "boolean" ? row.customerVisible : false,
  };
}

export function readDocumentAttachmentRecords(storage: Storage | undefined = typeof window !== "undefined" ? window.localStorage : undefined) {
  if (!storage) return [] as DocumentAttachmentRecord[];
  try {
    const raw = storage.getItem(DOCUMENT_ATTACHMENT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<DocumentAttachmentRecord> & Record<string, unknown>>;
    return parsed.map((row) => normalizeDocumentAttachmentRecord(row));
  } catch {
    return [];
  }
}

export function writeDocumentAttachmentRecords(
  storage: Storage | undefined,
  records: DocumentAttachmentRecord[]
) {
  if (!storage) return;
  storage.setItem(DOCUMENT_ATTACHMENT_STORAGE_KEY, JSON.stringify(records));
}

export function formatDocumentAttachmentSize(fileSize: number) {
  if (!Number.isFinite(fileSize) || fileSize <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = fileSize;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size >= 10 || unitIndex === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unitIndex]}`;
}

export async function buildDocumentAttachmentPreview(file: File): Promise<DocumentAttachmentPreview> {
  const previewKind = getPreviewKind(file.type || guessFileTypeFromName(file.name), file.name);
  const warning =
    file.size > DOCUMENT_ATTACHMENT_PREVIEW_LIMIT_BYTES
      ? "File is larger than the recommended browser storage limit. Metadata will be saved, but preview data may be omitted."
      : file.size > DOCUMENT_ATTACHMENT_WARNING_BYTES
        ? "Large files can exceed browser storage. Keep file sizes small when possible."
        : undefined;

  if (file.size > DOCUMENT_ATTACHMENT_PREVIEW_LIMIT_BYTES) {
    return { previewKind, warning };
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });

  if (previewKind === "text") {
    let textPreview = "";
    try {
      textPreview = await file.text();
    } catch {
      textPreview = "";
    }
    return {
      previewKind,
      dataUrl,
      textPreview: textPreview.slice(0, 20_000),
      warning,
    };
  }

  return {
    previewKind,
    dataUrl,
    warning,
  };
}

export function buildLinkedAttachmentLabel(roNumber: string, vehicleLabel: string) {
  const label = formatLinkedLabel(roNumber, vehicleLabel);
  return label;
}
