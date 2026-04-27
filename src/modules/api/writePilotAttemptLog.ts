/**
 * Write Pilot Attempt Log (Phase 229)
 *
 * Lightweight localStorage-backed log of recent backend write pilot attempts.
 * Each helper in writePilotHelpers.ts can call appendPilotAttempt() after a pilot write.
 * The Settings page reads this log to show last attempt per entity type.
 *
 * This log is informational only and does not affect data flow.
 * localStorage remains the source of truth regardless of what this log contains.
 */

export type WritePilotEntityType =
  | "customer"
  | "vehicle"
  | "intake"
  | "repairOrder"
  | "inspection"
  | "qcRecord"
  | "releaseRecord"
  | "backjob"
  | "serviceHistory"
  | "partsRequest"
  | "inventoryItem"
  | "inventoryMovement"
  | "purchaseOrder"
  | "supplier"
  | "payment"
  | "expense"
  | "invoice"
  | "document"
  | "fileUpload"
  | "customerDocument";

export type WritePilotAttemptEntry = {
  entityType: WritePilotEntityType;
  localId: string;
  entityLabel: string;
  syncStatus: "synced" | "conflict" | "skipped_locked" | "failed";
  remoteId: string | null;
  warning?: string;
  conflictReason?: string;
  attemptedAt: string;
};

const STORAGE_KEY = "dvi_write_pilot_attempt_log_v1";
const MAX_ENTRIES = 200;

export function readPilotAttemptLog(): WritePilotAttemptEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendPilotAttempt(entry: Omit<WritePilotAttemptEntry, "attemptedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const existing = readPilotAttemptLog();
    const next = [{ ...entry, attemptedAt: new Date().toISOString() }, ...existing].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // noop — log failure should never affect app flow
  }
}

export function getLastAttemptByType(entityType: WritePilotEntityType): WritePilotAttemptEntry | null {
  return readPilotAttemptLog().find((e) => e.entityType === entityType) ?? null;
}

export function getPilotAttemptSummary(): Record<WritePilotEntityType, WritePilotAttemptEntry | null> {
  return {
    customer: getLastAttemptByType("customer"),
    vehicle: getLastAttemptByType("vehicle"),
    intake: getLastAttemptByType("intake"),
    repairOrder: getLastAttemptByType("repairOrder"),
    inspection: getLastAttemptByType("inspection"),
    qcRecord: getLastAttemptByType("qcRecord"),
    releaseRecord: getLastAttemptByType("releaseRecord"),
    backjob: getLastAttemptByType("backjob"),
    serviceHistory: getLastAttemptByType("serviceHistory"),
    partsRequest: getLastAttemptByType("partsRequest"),
    inventoryItem: getLastAttemptByType("inventoryItem"),
    inventoryMovement: getLastAttemptByType("inventoryMovement"),
    purchaseOrder: getLastAttemptByType("purchaseOrder"),
    supplier: getLastAttemptByType("supplier"),
    payment: getLastAttemptByType("payment"),
    expense: getLastAttemptByType("expense"),
    invoice: getLastAttemptByType("invoice"),
    document: getLastAttemptByType("document"),
    fileUpload: getLastAttemptByType("fileUpload"),
    customerDocument: getLastAttemptByType("customerDocument"),
  };
}

export function clearPilotAttemptLog(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

export function syncStatusLabel(status: WritePilotAttemptEntry["syncStatus"]): string {
  switch (status) {
    case "synced": return "Synced";
    case "conflict": return "Conflict";
    case "skipped_locked": return "Locked / Skipped";
    case "failed": return "Failed";
  }
}
