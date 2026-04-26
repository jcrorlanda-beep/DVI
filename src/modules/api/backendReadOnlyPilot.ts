import { apiGet } from "./apiClient";
import { isBackendReadEnabled, type AppDataMode } from "./backendDataMode";

type BackendListResponse<T> = {
  items?: T[];
  source?: string;
};

export type BackendPilotComparison = {
  status: "idle" | "available" | "unavailable" | "skipped";
  localCount: number;
  backendCount: number | null;
  warnings: string[];
};

export async function fetchBackendListCount(path: string): Promise<{ count: number; warning?: string }> {
  const result = await apiGet<BackendListResponse<unknown>>(path);
  if (!result.success) return { count: 0, warning: result.error };
  const items = Array.isArray(result.data.items) ? result.data.items : [];
  return { count: items.length };
}

export function readLocalArrayCount(storageKey: string, storage: Storage | undefined = typeof window !== "undefined" ? window.localStorage : undefined): number {
  if (!storage) return 0;
  try {
    const parsed = JSON.parse(storage.getItem(storageKey) ?? "[]");
    return Array.isArray(parsed) ? parsed.length : parsed && typeof parsed === "object" ? Object.keys(parsed).length : 0;
  } catch {
    return 0;
  }
}

export function readLocalVehicleCount(storage: Storage | undefined = typeof window !== "undefined" ? window.localStorage : undefined): number {
  if (!storage) return 0;
  try {
    const customers = JSON.parse(storage.getItem("dvi_phase15a_customer_accounts_v1") ?? "[]");
    const repairOrders = JSON.parse(storage.getItem("dvi_phase4_repair_orders_v1") ?? "[]");
    const keys = new Set<string>();
    for (const row of [...(Array.isArray(customers) ? customers : []), ...(Array.isArray(repairOrders) ? repairOrders : [])]) {
      if (!row || typeof row !== "object") continue;
      const record = row as Record<string, unknown>;
      const plate = typeof record.plateNumber === "string" ? record.plateNumber.trim().toLowerCase() : "";
      const conduction = typeof record.conductionNumber === "string" ? record.conductionNumber.trim().toLowerCase() : "";
      const fallback = [record.make, record.model, record.year, record.customerName].filter((value) => typeof value === "string" && value.trim()).join("|").toLowerCase();
      const key = plate || conduction || fallback;
      if (key) keys.add(key);
    }
    return keys.size;
  } catch {
    return 0;
  }
}

export function readLocalRepairOrders(storage: Storage | undefined = typeof window !== "undefined" ? window.localStorage : undefined): Record<string, unknown>[] {
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem("dvi_phase4_repair_orders_v1") ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : [];
  } catch {
    return [];
  }
}

export function getRoPilotWarnings(repairOrders: Record<string, unknown>[]): string[] {
  const counts = new Map<string, number>();
  const warnings: string[] = [];
  repairOrders.forEach((record, index) => {
    const roNumber = typeof record.roNumber === "string" ? record.roNumber.trim() : typeof record.repairOrderNumber === "string" ? record.repairOrderNumber.trim() : "";
    if (roNumber) counts.set(roNumber.toLowerCase(), (counts.get(roNumber.toLowerCase()) ?? 0) + 1);
    const customer = typeof record.customerName === "string" ? record.customerName.trim() : "";
    const vehicle = typeof record.plateNumber === "string" ? record.plateNumber.trim() : typeof record.conductionNumber === "string" ? record.conductionNumber.trim() : "";
    if (!customer || !vehicle) warnings.push(`Local RO ${index + 1} is missing customer or vehicle link data.`);
  });
  for (const [roNumber, count] of counts.entries()) {
    if (count > 1) warnings.push(`Duplicate local RO number "${roNumber}" appears ${count} times.`);
  }
  return warnings;
}

export function buildPilotComparison(localCount: number, backendCount: number | null, warning?: string): BackendPilotComparison {
  const warnings = [
    ...(warning ? [warning] : []),
    ...(backendCount !== null && backendCount !== localCount ? [`Count mismatch: local ${localCount}, backend ${backendCount}.`] : []),
  ];
  return {
    status: warning ? "unavailable" : backendCount === null ? "idle" : "available",
    localCount,
    backendCount,
    warnings,
  };
}

export function shouldRunReadOnlyPilot(mode: AppDataMode): boolean {
  return isBackendReadEnabled(mode);
}
