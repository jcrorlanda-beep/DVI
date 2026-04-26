export type BackendMigrationModuleMap = {
  moduleKey: string;
  label: string;
  storageKey: string;
  tableName: string;
  migrationOrder: number;
  riskNotes?: string[];
};

export type BackendMigrationModuleExport = BackendMigrationModuleMap & {
  recordCount: number;
  records: unknown;
  parseError?: string;
};

export type BackendMigrationExportBundle = {
  formatVersion: "dvi-backend-migration-v1";
  createdAt: string;
  source: "localStorage";
  migrationOrder: string[];
  syncPlan: {
    idStrategy: string;
    localIdField: string;
    remoteIdField: string;
    lastSyncedAtField: string;
    syncStatusField: string;
  };
  riskyFields: string[];
  modules: BackendMigrationModuleExport[];
};

export const BACKEND_MIGRATION_MODULES: BackendMigrationModuleMap[] = [
  { moduleKey: "users", label: "Users", storageKey: "dvi_phase1_users_v2", tableName: "users", migrationOrder: 1 },
  { moduleKey: "rolePermissions", label: "Role Permissions", storageKey: "dvi_phase1_role_permissions_v2", tableName: "role_permissions", migrationOrder: 1 },
  { moduleKey: "customerAccounts", label: "Customer Accounts", storageKey: "dvi_phase15a_customer_accounts_v1", tableName: "customers", migrationOrder: 2 },
  {
    moduleKey: "intakeRecords",
    label: "Intake Records",
    storageKey: "dvi_phase2_intake_records_v1",
    tableName: "intakes",
    migrationOrder: 3,
    riskNotes: ["Legacy records may have missing requestedServices arrays."],
  },
  {
    moduleKey: "inspectionRecords",
    label: "Inspection Records",
    storageKey: "dvi_phase3_inspection_records_v1",
    tableName: "inspections",
    migrationOrder: 3,
    riskNotes: ["Legacy inspection evidence/media fields may be missing."],
  },
  {
    moduleKey: "repairOrders",
    label: "Repair Orders",
    storageKey: "dvi_phase4_repair_orders_v1",
    tableName: "repair_orders",
    migrationOrder: 3,
    riskNotes: ["RO totals may be missing if older work lines did not include pricing."],
  },
  { moduleKey: "qcRecords", label: "QC Records", storageKey: "dvi_phase6_qc_records_v1", tableName: "qc_records", migrationOrder: 3 },
  { moduleKey: "releaseRecords", label: "Release Records", storageKey: "dvi_phase7_release_records_v1", tableName: "release_records", migrationOrder: 3 },
  { moduleKey: "partsRequests", label: "Parts Requests", storageKey: "dvi_phase8_parts_requests_v1", tableName: "parts_requests", migrationOrder: 4 },
  { moduleKey: "inventory", label: "Inventory", storageKey: "dvi_inventory_items_v1", tableName: "inventory_items", migrationOrder: 4 },
  { moduleKey: "purchaseOrders", label: "Purchase Orders", storageKey: "dvi_purchase_orders_v1", tableName: "purchase_orders", migrationOrder: 4 },
  { moduleKey: "supplierDirectory", label: "Supplier Directory", storageKey: "dvi_supplier_directory_v1", tableName: "suppliers", migrationOrder: 4 },
  { moduleKey: "paymentRecords", label: "Payment Records", storageKey: "dvi_phase10_payment_records_v1", tableName: "payments", migrationOrder: 5 },
  { moduleKey: "expenseRecords", label: "Expense Records", storageKey: "dvi_phase53_expense_records_v1", tableName: "expenses", migrationOrder: 5 },
  { moduleKey: "auditLogs", label: "Audit Logs", storageKey: "dvi_phase55_audit_logs_v1", tableName: "audit_logs", migrationOrder: 5 },
  {
    moduleKey: "documentAttachments",
    label: "Document Attachments",
    storageKey: "dvi_document_attachments_v1",
    tableName: "document_attachments",
    migrationOrder: 6,
    riskNotes: ["Large dataUrl payloads should move to file storage before production import."],
  },
  { moduleKey: "vehicleServiceHistoryRecords", label: "Vehicle Service History", storageKey: "dvi_vehicle_service_history_records_v1", tableName: "service_history", migrationOrder: 6 },
  { moduleKey: "approvalLinkTokens", label: "Approval Link Tokens", storageKey: "dvi_phase15b_approval_link_tokens_v1", tableName: "approval_link_tokens", migrationOrder: 7 },
];

export const BACKEND_MIGRATION_ORDER = [
  "users/roles",
  "customers/vehicles",
  "intakes/inspections/repair-orders",
  "parts/inventory/purchase-orders",
  "payments/expenses/audit",
  "documents/files",
  "AI/SMS proxy metadata",
];

export const BACKEND_MIGRATION_RISKY_FIELDS = [
  "plateNumber",
  "customer duplicates",
  "legacy missing fields",
  "file dataUrl size",
  "AI logs",
  "audit logs",
];

function countRecords(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (value && typeof value === "object") return Object.keys(value).length;
  return value === null || value === undefined ? 0 : 1;
}

function readStorageValue(storageKey: string): { records: unknown; parseError?: string } {
  if (typeof window === "undefined") {
    return { records: null, parseError: "localStorage is not available in this environment." };
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return { records: null };

  try {
    return { records: JSON.parse(raw) };
  } catch {
    return { records: null, parseError: "Stored value is not valid JSON." };
  }
}

export function readBackendMigrationStorageSnapshot(modules: BackendMigrationModuleMap[] = BACKEND_MIGRATION_MODULES): BackendMigrationModuleExport[] {
  return modules.map((module) => {
    const result = readStorageValue(module.storageKey);
    return {
      ...module,
      records: result.records,
      recordCount: countRecords(result.records),
      parseError: result.parseError,
    };
  });
}

export function buildBackendMigrationExport(modules: BackendMigrationModuleMap[] = BACKEND_MIGRATION_MODULES): BackendMigrationExportBundle {
  return {
    formatVersion: "dvi-backend-migration-v1",
    createdAt: new Date().toISOString(),
    source: "localStorage",
    migrationOrder: BACKEND_MIGRATION_ORDER,
    syncPlan: {
      idStrategy: "Preserve browser IDs as localId, assign database IDs as remoteId after import validation.",
      localIdField: "localId",
      remoteIdField: "remoteId",
      lastSyncedAtField: "lastSyncedAt",
      syncStatusField: "syncStatus",
    },
    riskyFields: BACKEND_MIGRATION_RISKY_FIELDS,
    modules: readBackendMigrationStorageSnapshot(modules),
  };
}
