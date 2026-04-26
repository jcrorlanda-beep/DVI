import { buildPartsInventoryImportPreview } from "./partsInventoryPreview.js";

type MigrationModuleInput = {
  moduleKey?: string;
  tableName?: string;
  records?: unknown;
};

type PreviewRecord = Record<string, unknown>;

export type BusinessMigrationPreviewInput = Record<string, unknown> & {
  modules?: MigrationModuleInput[];
};

function toRecords(value: unknown): PreviewRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is PreviewRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item));
  if (value && typeof value === "object") {
    return Object.values(value).filter((item): item is PreviewRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item));
  }
  return [];
}

function findRecords(input: BusinessMigrationPreviewInput, directKey: string, tableName: string, aliases: string[] = []): PreviewRecord[] {
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

function numberValue(record: PreviewRecord, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  }
  return null;
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

function missingLinkWarnings(records: PreviewRecord[], label: string, keys: string[]): string[] {
  return records
    .map((record, index) => ({ index, link: text(record, keys) }))
    .filter((item) => !item.link)
    .map((item) => `${label} record ${item.index + 1} is missing a related record link.`);
}

function invalidAmountWarnings(records: PreviewRecord[], label: string): string[] {
  return records
    .map((record, index) => ({ index, amount: numberValue(record, ["amount", "total", "balance", "cost"]) }))
    .filter((item) => item.amount === null || item.amount < 0)
    .map((item) => `${label} record ${item.index + 1} has an invalid amount.`);
}

function invalidDocumentWarnings(documents: PreviewRecord[]): string[] {
  return documents.flatMap((record, index) => {
    const warnings: string[] = [];
    if (!text(record, ["fileName", "title"])) warnings.push(`Document record ${index + 1} is missing a filename/title.`);
    const fileSize = numberValue(record, ["fileSize", "size"]);
    if (fileSize !== null && fileSize < 0) warnings.push(`Document record ${index + 1} has invalid file size.`);
    if (record.customerVisible === true) warnings.push(`Document record ${index + 1} is marked customer-visible and should be manually reviewed.`);
    return warnings;
  });
}

function supplierBidCount(records: PreviewRecord[]) {
  return records.reduce((sum, record) => {
    const bids = record.bids;
    return sum + (Array.isArray(bids) ? bids.length : 0);
  }, 0);
}

function receivingEventCount(records: PreviewRecord[]) {
  return records.reduce((sum, record) => {
    const events = record.receivingEvents;
    return sum + (Array.isArray(events) ? events.length : 0);
  }, 0);
}

export function buildBusinessMigrationImportPreview(input: BusinessMigrationPreviewInput) {
  const partsInventoryPreview = buildPartsInventoryImportPreview(input);
  const partsRequests = findRecords(input, "partsRequests", "parts_requests");
  const purchaseOrders = findRecords(input, "purchaseOrders", "purchase_orders");
  const suppliers = findRecords(input, "suppliers", "suppliers");
  const invoices = findRecords(input, "invoices", "invoices");
  const payments = findRecords(input, "payments", "payments");
  const expenses = findRecords(input, "expenses", "expenses");
  const documents = findRecords(input, "documents", "document_attachments", ["attachments"]);

  const duplicatePoWarnings = duplicateWarnings(purchaseOrders, ["poNumber", "number"], "PO number");
  const duplicateSupplierWarnings = duplicateWarnings(suppliers, ["supplierName", "name"], "Supplier");
  const missingVehicleWarnings = missingLinkWarnings(partsRequests, "Parts request", ["vehicleId", "localVehicleId", "plateNumber", "plate"]);
  const invalidPaymentAmountWarnings = invalidAmountWarnings(payments, "Payment");
  const invalidExpenseAmountWarnings = invalidAmountWarnings(expenses, "Expense");
  const invalidFileMetadataWarnings = invalidDocumentWarnings(documents);
  const missingFinanceLinks = [
    ...missingLinkWarnings(invoices, "Invoice", ["repairOrderId", "localRoId", "customerId", "localCustomerId"]),
    ...missingLinkWarnings(payments, "Payment", ["invoiceId", "localInvoiceId", "repairOrderId", "localRoId"]),
  ];

  const totalRecords =
    partsInventoryPreview.totalPartsRequests +
    partsInventoryPreview.totalInventoryItems +
    partsInventoryPreview.totalInventoryMovements +
    partsInventoryPreview.totalPurchaseOrders +
    partsInventoryPreview.totalSuppliers +
    invoices.length +
    payments.length +
    expenses.length +
    documents.length;

  const recordsNeedingReview =
    partsInventoryPreview.recordsNeedingReview +
    duplicatePoWarnings.length +
    duplicateSupplierWarnings.length +
    missingVehicleWarnings.length +
    invalidPaymentAmountWarnings.length +
    invalidExpenseAmountWarnings.length +
    invalidFileMetadataWarnings.length +
    missingFinanceLinks.length;

  return {
    ...partsInventoryPreview,
    totalInvoices: invoices.length,
    totalPayments: payments.length,
    totalExpenses: expenses.length,
    totalDocuments: documents.length,
    totalSupplierBids: supplierBidCount(partsRequests),
    totalPoReceivingEvents: receivingEventCount(purchaseOrders),
    duplicatePoWarnings,
    duplicateSupplierWarnings,
    missingVehicleWarnings,
    invalidPaymentAmountWarnings,
    invalidExpenseAmountWarnings,
    invalidFileMetadataWarnings,
    customerVisibleDocumentWarnings: invalidFileMetadataWarnings.filter((warning) => warning.includes("customer-visible")),
    missingFinanceLinks,
    totalRecords,
    recordsReady: Math.max(totalRecords - recordsNeedingReview, 0),
    recordsNeedingReview,
    canCommit: false,
    warning: "Business preview only. No parts, inventory, PO, supplier, payment, expense, invoice, or document data was written to the database.",
  };
}
