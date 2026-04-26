export type SyncConflictStatus = "none" | "warning" | "conflict" | "needsReview";

export type SyncConflict = {
  id: string;
  type: string;
  status: SyncConflictStatus;
  message: string;
};

type RecordLike = Record<string, unknown>;

function text(record: RecordLike, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function duplicates(records: RecordLike[], buildKey: (record: RecordLike) => string, type: string, label: string): SyncConflict[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const key = buildKey(record).toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([key, count]) => ({
      id: `${type}-${key}`,
      type,
      status: "conflict",
      message: `${label} "${key}" appears ${count} times.`,
    }));
}

export function detectDuplicatePlates(records: RecordLike[]): SyncConflict[] {
  return duplicates(records, (record) => text(record, ["plateNumber", "plate"]), "duplicatePlate", "Plate number");
}

export function detectDuplicateCustomers(records: RecordLike[]): SyncConflict[] {
  return duplicates(records, (record) => `${text(record, ["customerName", "name"])}|${text(record, ["phone"])}`, "duplicateCustomer", "Customer name/phone");
}

export function detectRoNumberConflicts(records: RecordLike[]): SyncConflict[] {
  return duplicates(records, (record) => text(record, ["roNumber", "repairOrderNumber"]), "duplicateRoNumber", "RO number");
}

export function detectUpdatedAfterImport(records: RecordLike[]): SyncConflict[] {
  return records.flatMap((record, index) => {
    const updatedAt = Date.parse(text(record, ["updatedAt"]));
    const importedAt = Date.parse(text(record, ["importedAt", "lastSyncedAt"]));
    if (!Number.isFinite(updatedAt) || !Number.isFinite(importedAt) || updatedAt <= importedAt) return [];
    return [{
      id: `updated-after-import-${index}`,
      type: "updatedAfterImport",
      status: "needsReview" as const,
      message: `Record ${index + 1} was updated locally after backend import/sync metadata.`,
    }];
  });
}

export function summarizeConflicts(conflicts: SyncConflict[]) {
  return {
    total: conflicts.length,
    conflicts: conflicts.filter((item) => item.status === "conflict").length,
    warnings: conflicts.filter((item) => item.status === "warning").length,
    needsReview: conflicts.filter((item) => item.status === "needsReview").length,
  };
}
