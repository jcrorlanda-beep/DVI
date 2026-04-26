import type { AuditLogRecord, PaymentRecord, RepairOrderRecord } from "../shared/types";

export const DATA_MIGRATION_VERSION_STORAGE_KEY = "dvi_data_migration_version_v1";
export const CURRENT_DATA_MIGRATION_VERSION = 1;

type RecordLike = Record<string, unknown>;

function normalizeStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean) : [];
}

export function normalizeRequestedServices(value: unknown, fallback: string[] = []) {
  const normalized = normalizeStringArray(value);
  return normalized.length > 0 ? normalized : fallback;
}

export function normalizeBookingRecord<T extends RecordLike>(record: T) {
  const serviceType = String(record.serviceType ?? "");
  const serviceDetail = String(record.serviceDetail ?? "");
  const concern = String(record.concern ?? "");
  const notes = String(record.notes ?? "");
  const fallback = [serviceDetail, serviceType, concern, notes].map((item) => item.trim()).filter(Boolean);
  return {
    ...record,
    requestedServices: normalizeRequestedServices(record.requestedServices, fallback.length > 0 ? [fallback[0]] : []),
  };
}

export function normalizeRepairOrderRecord<T extends RecordLike>(record: T): T & Partial<RepairOrderRecord> {
  return {
    ...record,
    workLines: Array.isArray(record.workLines) ? record.workLines : [],
    deferredLineTitles: normalizeStringArray(record.deferredLineTitles),
    findingRecommendationDecisions: Array.isArray(record.findingRecommendationDecisions) ? record.findingRecommendationDecisions : [],
    supportTechnicianIds: Array.isArray(record.supportTechnicianIds) ? record.supportTechnicianIds : [],
  } as T & Partial<RepairOrderRecord>;
}

export function normalizePaymentRecord<T extends RecordLike>(record: T): T & Partial<PaymentRecord> {
  return {
    ...record,
    amount: String(record.amount ?? "0"),
    method: String(record.method ?? "Cash"),
    referenceNumber: String(record.referenceNumber ?? ""),
    notes: String(record.notes ?? ""),
  } as T & Partial<PaymentRecord>;
}

export function normalizeAuditLogRecord<T extends RecordLike>(record: T): T & Partial<AuditLogRecord> {
  return {
    ...record,
    module: String(record.module ?? "System"),
    action: String(record.action ?? "unknown"),
    entityId: String(record.entityId ?? ""),
    entityLabel: String(record.entityLabel ?? "Legacy Record"),
    userId: String(record.userId ?? ""),
    userName: String(record.userName ?? "System"),
    detail: String(record.detail ?? ""),
    before: record.before === undefined || record.before === null ? undefined : String(record.before),
    after: record.after === undefined || record.after === null ? undefined : String(record.after),
  } as T & Partial<AuditLogRecord>;
}

export function readDataMigrationVersion() {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(DATA_MIGRATION_VERSION_STORAGE_KEY);
  const parsed = Number(raw || "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

export function saveDataMigrationVersion(version = CURRENT_DATA_MIGRATION_VERSION) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DATA_MIGRATION_VERSION_STORAGE_KEY, String(version));
}

export function getDataMigrationReminder() {
  return "Always export a fresh backup before running cleanup or importing older records.";
}

