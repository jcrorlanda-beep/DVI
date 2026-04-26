import type { InventoryItemRecord, InventoryMovementRecord } from "../inventory/inventoryStorage";

type RecordLike = Record<string, unknown>;

function numberValue(value: unknown) {
  const parsed = Number(String(value ?? "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeInventoryItemRecord<T extends RecordLike>(record: T): T & InventoryItemRecord {
  return {
    ...record,
    id: String(record.id ?? `inv_${Math.random().toString(36).slice(2, 10)}`),
    itemName: String(record.itemName ?? "Untitled item"),
    sku: String(record.sku ?? ""),
    category: String(record.category ?? "General"),
    brand: String(record.brand ?? ""),
    quantityOnHand: numberValue(record.quantityOnHand),
    reorderLevel: numberValue(record.reorderLevel),
    unitCost: numberValue(record.unitCost),
    sellingPrice: numberValue(record.sellingPrice),
    supplier: String(record.supplier ?? ""),
    active: record.active === undefined ? true : Boolean(record.active),
    createdAt: String(record.createdAt ?? new Date().toISOString()),
    updatedAt: String(record.updatedAt ?? record.createdAt ?? new Date().toISOString()),
  } as T & InventoryItemRecord;
}

export function normalizeInventoryMovementRecord<T extends RecordLike>(record: T): T & InventoryMovementRecord {
  const movementType = String(record.movementType ?? "Add Stock");
  return {
    ...record,
    id: String(record.id ?? `move_${Math.random().toString(36).slice(2, 10)}`),
    itemId: String(record.itemId ?? ""),
    itemName: String(record.itemName ?? "Untitled item"),
    movementType: ([
      "Add Stock",
      "Deduct Stock",
      "Correction",
      "Received From Parts Request",
      "Used On RO",
      "Received From PO",
      "Adjustment Pending",
      "Adjustment Approved",
      "Adjustment Rejected",
      "Adjustment Applied",
    ].includes(movementType)
      ? movementType
      : "Add Stock") as InventoryMovementRecord["movementType"],
    quantityChange: numberValue(record.quantityChange),
    quantityAfter: numberValue(record.quantityAfter),
    sourceLabel: String(record.sourceLabel ?? ""),
    note: String(record.note ?? ""),
    createdAt: String(record.createdAt ?? new Date().toISOString()),
    createdBy: String(record.createdBy ?? "System"),
    adjustmentStatus: String(record.adjustmentStatus ?? "") || undefined,
    adjustmentReason: String(record.adjustmentReason ?? "") || undefined,
    approver: String(record.approver ?? "") || undefined,
    decidedAt: String(record.decidedAt ?? "") || undefined,
    appliedAt: String(record.appliedAt ?? "") || undefined,
    relatedSource: String(record.relatedSource ?? "") || undefined,
  } as T & InventoryMovementRecord;
}
