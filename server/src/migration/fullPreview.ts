import { buildCustomerVehicleImportPreview } from "./customerVehiclePreview.js";
import { buildPartsInventoryImportPreview } from "./partsInventoryPreview.js";
import { buildWorkflowImportPreview } from "./workflowPreview.js";

type MigrationModuleInput = {
  moduleKey?: string;
  tableName?: string;
  records?: unknown;
};

type PreviewRecord = Record<string, unknown>;

export type FullMigrationPreviewInput = Record<string, unknown> & {
  modules?: MigrationModuleInput[];
};

function toRecords(value: unknown): PreviewRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is PreviewRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item));
  if (value && typeof value === "object") {
    return Object.values(value).filter((item): item is PreviewRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item));
  }
  return [];
}

function findRecords(input: FullMigrationPreviewInput, directKey: string, tableName: string, aliases: string[] = []): PreviewRecord[] {
  const direct = toRecords(input[directKey]);
  if (direct.length) return direct;
  const accepted = new Set([directKey, tableName, ...aliases]);
  const module = input.modules?.find((item) => accepted.has(String(item.tableName ?? "")) || accepted.has(String(item.moduleKey ?? "")));
  return toRecords(module?.records);
}

function text(record: PreviewRecord, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function statusWarnings(records: PreviewRecord[], valid: Set<string>, label: string): string[] {
  return records
    .map((record, index) => ({ index, status: text(record, ["status", "paymentStatus", "accountingStatus"]) }))
    .filter((item) => item.status && !valid.has(item.status.toLowerCase()))
    .map((item) => `${label} record ${item.index + 1} has unrecognized status "${item.status}".`);
}

function missingLinkWarnings(records: PreviewRecord[], label: string, keys: string[]): string[] {
  return records
    .map((record, index) => ({ index, link: text(record, keys) }))
    .filter((item) => !item.link)
    .map((item) => `${label} record ${item.index + 1} is missing a related record link.`);
}

function duplicateWarnings(records: PreviewRecord[], keys: string[], label: string): string[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const key = text(record, keys).toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([key, count]) => `${label} "${key}" appears ${count} times.`);
}

function buildGenericModulePreview(input: FullMigrationPreviewInput) {
  const invoices = findRecords(input, "invoices", "invoices");
  const payments = findRecords(input, "payments", "payments");
  const expenses = findRecords(input, "expenses", "expenses");
  const auditLogs = findRecords(input, "auditLogs", "audit_logs", ["audit"]);
  const documents = findRecords(input, "documents", "document_attachments", ["attachments"]);
  const supplierBids = findRecords(input, "supplierBids", "supplier_bids");

  const validFinanceStatuses = new Set(["draft", "unpaid", "partial", "paid", "overpaid", "waived", "needs review", "exported", "ready to export"]);
  const invalidStatusWarnings = [
    ...statusWarnings(invoices, validFinanceStatuses, "Invoice"),
    ...statusWarnings(payments, validFinanceStatuses, "Payment"),
    ...statusWarnings(expenses, validFinanceStatuses, "Expense"),
  ];
  const missingLinkWarningsList = [
    ...missingLinkWarnings(invoices, "Invoice", ["repairOrderId", "localRoId", "customerId", "localCustomerId"]),
    ...missingLinkWarnings(payments, "Payment", ["invoiceId", "repairOrderId", "localRoId", "customerId"]),
    ...missingLinkWarnings(documents, "Document", ["linkedEntityId", "repairOrderId", "customerId", "vehicleId"]),
  ];
  const duplicateWarningsList = [
    ...duplicateWarnings(invoices, ["invoiceNumber", "number"], "Invoice number"),
    ...duplicateWarnings(documents, ["fileName"], "Document filename"),
  ];

  const totalRecords = invoices.length + payments.length + expenses.length + auditLogs.length + documents.length + supplierBids.length;
  const recordsNeedingReview = invalidStatusWarnings.length + missingLinkWarningsList.length + duplicateWarningsList.length;

  return {
    totalInvoices: invoices.length,
    totalPayments: payments.length,
    totalExpenses: expenses.length,
    totalAuditLogs: auditLogs.length,
    totalDocuments: documents.length,
    totalSupplierBids: supplierBids.length,
    invalidStatusWarnings,
    missingLinkWarnings: missingLinkWarningsList,
    duplicateWarnings: duplicateWarningsList,
    recordsReady: Math.max(totalRecords - recordsNeedingReview, 0),
    recordsNeedingReview,
  };
}

export function buildFullMigrationImportPreview(input: FullMigrationPreviewInput) {
  const customerVehiclePreview = buildCustomerVehicleImportPreview(input);
  const workflowPreview = buildWorkflowImportPreview(input);
  const partsInventoryPreview = buildPartsInventoryImportPreview(input);
  const financeAuditDocumentPreview = buildGenericModulePreview(input);

  const totalRecords =
    customerVehiclePreview.totalCustomers +
    customerVehiclePreview.totalVehicles +
    workflowPreview.totalIntakes +
    workflowPreview.totalInspections +
    workflowPreview.totalRepairOrders +
    workflowPreview.totalWorkLines +
    workflowPreview.totalApprovalMetadata +
    partsInventoryPreview.totalPartsRequests +
    partsInventoryPreview.totalInventoryItems +
    partsInventoryPreview.totalInventoryMovements +
    partsInventoryPreview.totalPurchaseOrders +
    partsInventoryPreview.totalSuppliers +
    financeAuditDocumentPreview.totalInvoices +
    financeAuditDocumentPreview.totalPayments +
    financeAuditDocumentPreview.totalExpenses +
    financeAuditDocumentPreview.totalAuditLogs +
    financeAuditDocumentPreview.totalDocuments +
    financeAuditDocumentPreview.totalSupplierBids;

  const recordsNeedingReview =
    customerVehiclePreview.recordsNeedingReview +
    workflowPreview.recordsNeedingReview +
    partsInventoryPreview.recordsNeedingReview +
    financeAuditDocumentPreview.recordsNeedingReview;

  return {
    totalRecords,
    validRecords: Math.max(totalRecords - recordsNeedingReview, 0),
    duplicateWarnings: [
      ...customerVehiclePreview.duplicateCustomerWarnings,
      ...customerVehiclePreview.duplicatePlateWarnings,
      ...partsInventoryPreview.duplicateSkuPartWarnings,
      ...financeAuditDocumentPreview.duplicateWarnings,
    ],
    missingLinkWarnings: [
      ...workflowPreview.missingCustomerVehicleLinks,
      ...partsInventoryPreview.missingLinkedRoWarnings,
      ...partsInventoryPreview.missingSupplierWarnings,
      ...financeAuditDocumentPreview.missingLinkWarnings,
    ],
    invalidStatusWarnings: [
      ...workflowPreview.invalidStatuses,
      ...partsInventoryPreview.invalidPoStatuses,
      ...financeAuditDocumentPreview.invalidStatusWarnings,
    ],
    recordsReady: Math.max(totalRecords - recordsNeedingReview, 0),
    recordsNeedingReview,
    previews: {
      customerVehiclePreview,
      workflowPreview,
      partsInventoryPreview,
      financeAuditDocumentPreview,
    },
    canCommit: false,
    warning: "Preview only. No database writes, localStorage deletes, or automatic migration actions were performed.",
  };
}
