export type DataQualityIssue = {
  id: string;
  storageKey: string;
  severity: "Warning" | "Error";
  message: string;
};

export type DataQualitySummary = {
  checkedKeys: number;
  issueCount: number;
  issues: DataQualityIssue[];
};

export function safeFormatDate(value: unknown) {
  const date = new Date(String(value ?? ""));
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
}

export function safeFormatNumber(value: unknown, fallback = "0") {
  const parsed = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed.toLocaleString("en-US") : fallback;
}

function readStorageJson(key: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { ok: true, value: null };
    return { ok: true, value: JSON.parse(raw) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Invalid JSON" };
  }
}

export function validateStoredRecords(storageKeys: string[]): DataQualitySummary {
  if (typeof window === "undefined") return { checkedKeys: 0, issueCount: 0, issues: [] };
  const issues: DataQualityIssue[] = [];
  storageKeys.forEach((key) => {
    const result = readStorageJson(key);
    if (!result.ok) {
      issues.push({ id: `${key}:parse`, storageKey: key, severity: "Error", message: `Could not read saved data: ${result.error}` });
      return;
    }
    if (Array.isArray(result.value)) {
      result.value.forEach((record, index) => {
        if (!record || typeof record !== "object") {
          issues.push({ id: `${key}:${index}:shape`, storageKey: key, severity: "Warning", message: `Record ${index + 1} is not an object.` });
          return;
        }
        const row = record as { id?: unknown; createdAt?: unknown; updatedAt?: unknown };
        if (!row.id) issues.push({ id: `${key}:${index}:id`, storageKey: key, severity: "Warning", message: `Record ${index + 1} is missing an id.` });
        if (row.createdAt && safeFormatDate(row.createdAt) === "-") {
          issues.push({ id: `${key}:${index}:date`, storageKey: key, severity: "Warning", message: `Record ${index + 1} has an invalid created date.` });
        }
      });
    }
  });
  return { checkedKeys: storageKeys.length, issueCount: issues.length, issues };
}

export function cleanupInvalidJsonStorage(storageKeys: string[]): string[] {
  if (typeof window === "undefined") return [];
  const cleaned: string[] = [];
  storageKeys.forEach((key) => {
    const result = readStorageJson(key);
    if (!result.ok) {
      window.localStorage.removeItem(key);
      cleaned.push(key);
    }
  });
  return cleaned;
}
