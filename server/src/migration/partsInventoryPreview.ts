type MigrationModuleInput = {
  moduleKey?: string;
  tableName?: string;
  records?: unknown;
};

export type PartsInventoryPreviewInput = {
  partsRequests?: unknown;
  inventoryItems?: unknown;
  inventoryMovements?: unknown;
  purchaseOrders?: unknown;
  suppliers?: unknown;
  modules?: MigrationModuleInput[];
};

type PreviewRecord = Record<string, unknown>;

const VALID_PO_STATUSES = new Set(["draft", "sent", "ordered", "partially received", "received", "cancelled"]);

function toRecords(value: unknown): PreviewRecord[] {
  if (Array.isArray(value)) return value.filter((item): item is PreviewRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item));
  if (value && typeof value === "object") {
    return Object.values(value).filter((item): item is PreviewRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item));
  }
  return [];
}

function direct(input: PartsInventoryPreviewInput, tableName: string): unknown {
  if (tableName === "parts_requests") return input.partsRequests;
  if (tableName === "inventory_items") return input.inventoryItems;
  if (tableName === "inventory_movements") return input.inventoryMovements;
  if (tableName === "purchase_orders") return input.purchaseOrders;
  if (tableName === "suppliers") return input.suppliers;
  return undefined;
}

function findModuleRecords(input: PartsInventoryPreviewInput, tableName: string): PreviewRecord[] {
  const directRecords = toRecords(direct(input, tableName));
  if (directRecords.length) return directRecords;
  const module = input.modules?.find((item) => item.tableName === tableName);
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

function duplicateWarnings(records: PreviewRecord[], buildKey: (record: PreviewRecord) => string, label: string): string[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const key = buildKey(record).toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([key, count]) => `${label} "${key}" appears ${count} times.`);
}

export function buildPartsInventoryImportPreview(input: PartsInventoryPreviewInput) {
  const partsRequests = findModuleRecords(input, "parts_requests");
  const inventoryItems = findModuleRecords(input, "inventory_items");
  const inventoryMovements = findModuleRecords(input, "inventory_movements");
  const purchaseOrders = findModuleRecords(input, "purchase_orders");
  const suppliers = findModuleRecords(input, "suppliers");

  const missingLinkedRoWarnings = partsRequests
    .map((record, index) => ({ index, link: text(record, ["repairOrderId", "localRoId", "roId", "repairOrderNumber"]) }))
    .filter((item) => !item.link)
    .map((item) => `Parts request ${item.index + 1} is missing a linked RO reference.`);

  const duplicateSkuPartWarnings = [
    ...duplicateWarnings(inventoryItems, (record) => text(record, ["sku"]), "SKU"),
    ...duplicateWarnings(inventoryItems, (record) => text(record, ["partNumber"]), "Part number"),
  ];

  const negativeStockWarnings = inventoryItems
    .map((record, index) => ({ index, quantity: numberValue(record, ["quantityOnHand", "quantity", "stockOnHand"]) }))
    .filter((item) => item.quantity !== null && item.quantity < 0)
    .map((item) => `Inventory item ${item.index + 1} has negative stock (${item.quantity}).`);

  const missingSupplierWarnings = [
    ...partsRequests
      .map((record, index) => ({ index, supplier: text(record, ["supplierId", "supplierName", "selectedSupplier"]) }))
      .filter((item) => !item.supplier)
      .map((item) => `Parts request ${item.index + 1} is missing supplier selection.`),
    ...purchaseOrders
      .map((record, index) => ({ index, supplier: text(record, ["supplierId", "supplierName"]) }))
      .filter((item) => !item.supplier)
      .map((item) => `Purchase order ${item.index + 1} is missing supplier.`),
  ];

  const invalidPoStatuses = purchaseOrders
    .map((record, index) => ({ index, status: text(record, ["status"]) }))
    .filter((item) => item.status && !VALID_PO_STATUSES.has(item.status.toLowerCase()))
    .map((item) => `Purchase order ${item.index + 1} has unrecognized status "${item.status}".`);

  const reviewCount =
    missingLinkedRoWarnings.length + duplicateSkuPartWarnings.length + negativeStockWarnings.length + missingSupplierWarnings.length + invalidPoStatuses.length;
  const totalRecords = partsRequests.length + inventoryItems.length + inventoryMovements.length + purchaseOrders.length + suppliers.length;

  return {
    totalPartsRequests: partsRequests.length,
    totalInventoryItems: inventoryItems.length,
    totalInventoryMovements: inventoryMovements.length,
    totalPurchaseOrders: purchaseOrders.length,
    totalSuppliers: suppliers.length,
    missingLinkedRoWarnings,
    duplicateSkuPartWarnings,
    negativeStockWarnings,
    missingSupplierWarnings,
    invalidPoStatuses,
    recordsReady: Math.max(totalRecords - reviewCount, 0),
    recordsNeedingReview: reviewCount,
    canCommit: false,
    warning: "Preview only. No parts, inventory, purchase order, supplier, or bid data was written to the database.",
  };
}
