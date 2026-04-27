import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";

export type StoredFileRecord = {
  fileId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  checksum: string;
  uploadedAt: string;
  uploadedBy?: string | null;
};

const ALLOWED_MIME_PREFIXES = ["image/", "text/"];
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/json",
  "application/xml",
  "application/rtf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg", ".pdf", ".txt", ".md", ".csv", ".json", ".xml", ".rtf", ".log", ".html", ".htm", ".doc", ".docx"]);

function storageRoot() {
  return path.resolve(process.cwd(), config.fileStorageRoot);
}

function sanitizeFileName(fileName: string) {
  const base = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
  return base || "upload.bin";
}

function isAllowedFileType(fileName: string, mimeType: string) {
  const ext = path.extname(fileName).toLowerCase();
  return ALLOWED_EXTENSIONS.has(ext) || ALLOWED_MIME_TYPES.has(mimeType) || ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
}

function decodeUploadPayload(data: Record<string, unknown>) {
  const dataUrl = typeof data.dataUrl === "string" ? data.dataUrl.trim() : "";
  if (dataUrl) {
    const match = /^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.+)$/i.exec(dataUrl);
    if (!match) throw new Error("Invalid dataUrl upload payload.");
    return {
      buffer: Buffer.from(match[2], "base64"),
      mimeType: match[1] || "application/octet-stream",
    };
  }

  const base64 = typeof data.base64 === "string" ? data.base64.trim() : typeof data.fileBase64 === "string" ? data.fileBase64.trim() : "";
  if (!base64) throw new Error("Upload payload must include base64 or dataUrl.");
  return {
    buffer: Buffer.from(base64, "base64"),
    mimeType: typeof data.mimeType === "string" && data.mimeType.trim() ? data.mimeType.trim() : "application/octet-stream",
  };
}

export function getUploadConfig() {
  return {
    storageConfigured: Boolean(config.fileStorageRoot),
    maxUploadMb: config.maxUploadMb,
    allowedTypes: ["images", "PDFs", "text/doc-like files"],
  };
}

export async function storeUploadedFile(data: Record<string, unknown>, uploadedBy?: string | null): Promise<StoredFileRecord> {
  const fileName = sanitizeFileName(typeof data.fileName === "string" ? data.fileName : typeof data.name === "string" ? data.name : "upload.bin");
  const decoded = decodeUploadPayload(data);
  const mimeType = typeof data.mimeType === "string" && data.mimeType.trim() ? data.mimeType.trim() : decoded.mimeType;
  if (!isAllowedFileType(fileName, mimeType)) {
    throw new Error("File type is not allowed.");
  }

  const maxBytes = config.maxUploadMb * 1024 * 1024;
  if (decoded.buffer.byteLength > maxBytes) {
    throw new Error(`File exceeds MAX_UPLOAD_MB (${config.maxUploadMb} MB).`);
  }

  const fileId = randomUUID();
  const ext = path.extname(fileName).toLowerCase() || ".bin";
  const storageKey = `${fileId}${ext}`;
  const root = storageRoot();
  const targetPath = path.resolve(root, storageKey);
  if (!targetPath.startsWith(root)) {
    throw new Error("Unsafe upload path.");
  }

  await mkdir(root, { recursive: true });
  await writeFile(targetPath, decoded.buffer);

  return {
    fileId,
    fileName,
    mimeType,
    fileSize: decoded.buffer.byteLength,
    storageKey,
    checksum: createHash("sha256").update(decoded.buffer).digest("hex"),
    uploadedAt: new Date().toISOString(),
    uploadedBy: uploadedBy ?? null,
  };
}

export async function readStoredFile(fileIdOrStorageKey: string) {
  const root = storageRoot();
  const safeKey = path.basename(fileIdOrStorageKey);
  const targetPath = path.resolve(root, safeKey);
  if (!targetPath.startsWith(root)) throw new Error("Unsafe file path.");
  const bytes = await readFile(targetPath);
  const stats = await stat(targetPath);
  return {
    bytes,
    fileSize: stats.size,
    storageKey: safeKey,
  };
}

export async function deleteStoredFile(fileIdOrStorageKey: string) {
  const root = storageRoot();
  const safeKey = path.basename(fileIdOrStorageKey);
  const targetPath = path.resolve(root, safeKey);
  if (!targetPath.startsWith(root)) throw new Error("Unsafe file path.");
  await rm(targetPath, { force: true });
}
