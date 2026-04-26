import type { AuditLogRecord, ExpenseRecord } from "./types";

export type RepositoryItem = {
  id: string;
};

export type RepositoryListOptions<T> = {
  search?: string;
  limit?: number;
  predicate?: (item: T) => boolean;
  sort?: (a: T, b: T) => number;
};

export type Repository<T extends RepositoryItem> = {
  list(options?: RepositoryListOptions<T>): T[];
  getById(id: string): T | null;
  create(item: T): T;
  update(id: string, patch: Partial<T>): T | null;
  remove(id: string): boolean;
  search(term: string): T[];
};

function readRecords<T>(storageKey: string): T[] {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeRecords<T>(storageKey: string, records: T[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(records));
  } catch {
    // LocalStorage-only repository. Persistence failures are non-fatal.
  }
}

function matchesTerm(item: unknown, term: string): boolean {
  if (!term.trim()) return true;
  const haystack = JSON.stringify(item).toLowerCase();
  return haystack.includes(term.trim().toLowerCase());
}

export function createLocalStorageRepository<T extends RepositoryItem>(storageKey: string): Repository<T> {
  return {
    list(options?: RepositoryListOptions<T>) {
      let items = readRecords<T>(storageKey);
      if (options?.predicate) {
        items = items.filter(options.predicate);
      }
      if (options?.search) {
        items = items.filter((item) => matchesTerm(item, options.search ?? ""));
      }
      if (options?.sort) {
        items = [...items].sort(options.sort);
      }
      if (typeof options?.limit === "number") {
        items = items.slice(0, Math.max(0, options.limit));
      }
      return items;
    },
    getById(id: string) {
      return readRecords<T>(storageKey).find((item) => item.id === id) ?? null;
    },
    create(item: T) {
      const items = readRecords<T>(storageKey);
      const next = [item, ...items];
      writeRecords(storageKey, next);
      return item;
    },
    update(id: string, patch: Partial<T>) {
      const items = readRecords<T>(storageKey);
      let updated: T | null = null;
      const next = items.map((item) => {
        if (item.id !== id) return item;
        updated = { ...item, ...patch } as T;
        return updated;
      });
      if (!updated) return null;
      writeRecords(storageKey, next);
      return updated;
    },
    remove(id: string) {
      const items = readRecords<T>(storageKey);
      const next = items.filter((item) => item.id !== id);
      if (next.length === items.length) return false;
      writeRecords(storageKey, next);
      return true;
    },
    search(term: string) {
      return readRecords<T>(storageKey).filter((item) => matchesTerm(item, term));
    },
  };
}

// Future-safe examples for local-first modules that can later share the same repository contract.
export const createExpenseRepository = () => createLocalStorageRepository<ExpenseRecord>("dvi_phase53_expense_records_v1");
export const createAuditLogRepository = () => createLocalStorageRepository<AuditLogRecord>("dvi_phase55_audit_logs_v1");
