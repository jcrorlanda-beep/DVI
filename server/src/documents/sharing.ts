import type { BackendRequestUser } from "../middleware/auth.js";

export type DocumentVisibilityContext = {
  user?: BackendRequestUser | null;
  audience: "staff" | "customer";
  customerId?: string | null;
  vehicleId?: string | null;
  repairOrderId?: string | null;
};

export type DocumentRecordLike = Record<string, unknown> & {
  customerVisible?: boolean;
  internalOnly?: boolean;
};

const PRIVATE_SOURCE_PATTERNS = [/supplier/i, /bid/i, /quote/i, /audit/i, /margin/i, /profit/i, /cost/i, /internal/i];

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isSensitiveDocument(document: DocumentRecordLike) {
  const source = `${text(document.sourceModule)} ${text(document.documentType)} ${text(document.linkedEntityLabel)} ${text(document.fileName)}`;
  return PRIVATE_SOURCE_PATTERNS.some((pattern) => pattern.test(source));
}

export function canStaffViewDocument(context: DocumentVisibilityContext, _document: DocumentRecordLike): boolean {
  const user = context.user;
  return Boolean(user && (user.role === "Admin" || user.role === "Manager" || user.permissions.includes("documents.manage")));
}

export function canCustomerViewDocument(context: DocumentVisibilityContext, document: DocumentRecordLike): boolean {
  if (context.audience !== "customer") return false;
  if (document.customerVisible !== true || document.internalOnly === true) return false;
  if (isSensitiveDocument(document)) return false;

  const customerId = text(document.customerId);
  const vehicleId = text(document.vehicleId);
  const repairOrderId = text(document.repairOrderId) || text(document.linkedEntityId);
  const matchesKnownLink =
    (context.customerId && customerId && context.customerId === customerId) ||
    (context.vehicleId && vehicleId && context.vehicleId === vehicleId) ||
    (context.repairOrderId && repairOrderId && context.repairOrderId === repairOrderId);

  return Boolean(matchesKnownLink || (!customerId && !vehicleId && !repairOrderId));
}

export function redactDocumentForCustomer(document: DocumentRecordLike) {
  return {
    id: text(document.id),
    title: text(document.fileName) || "Document",
    fileName: text(document.fileName) || "Document",
    documentType: text(document.documentType) || text(document.sourceModule) || "Document",
    linkedEntityLabel: text(document.linkedEntityLabel),
    uploadedAt: text(document.uploadedAt) || text(document.createdAt),
    createdAt: text(document.createdAt),
    fileSize: typeof document.fileSize === "number" ? document.fileSize : null,
    mimeType: text(document.mimeType) || text(document.fileType),
    previewToken: text(document.fileId) ? `future_signed_preview:${text(document.fileId)}` : null,
    downloadToken: text(document.fileId) ? `future_signed_download:${text(document.fileId)}` : null,
    warning: "Preview/download tokens are placeholders until signed customer document access is implemented.",
  };
}
