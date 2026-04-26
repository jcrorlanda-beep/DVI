import { normalizeInventoryItemRecord, normalizeInventoryMovementRecord } from "../dataQuality/legacyInventoryMigration";

export type InventoryItemRecord = {
  id: string;
  itemName: string;
  sku: string;
  category: string;
  brand: string;
  quantityOnHand: number;
  reorderLevel: number;
  unitCost: number;
  sellingPrice: number;
  supplier: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type InventoryAdjustmentStatus = "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Applied";

export type InventoryAdjustmentReason =
  | "New Stock"
  | "Correction"
  | "Damaged"
  | "Lost"
  | "Used for RO"
  | "Return to Supplier"
  | "Other";

export type InventoryDeductionMode = "Manual only" | "Prompt before deduction" | "Auto-deduct with log";

export type InventoryAdjustmentApprovalRecord = {
  status: InventoryAdjustmentStatus;
  reason: InventoryAdjustmentReason;
  note: string;
  approver: string;
  decidedAt: string;
};

export type InventoryAdjustmentRequest = {
  id: string;
  itemId: string;
  itemName: string;
  quantityChange: number;
  quantityAfter: number;
  reason: InventoryAdjustmentReason;
  note: string;
  status: InventoryAdjustmentStatus;
  createdAt: string;
  createdBy: string;
  approver?: string;
  decidedAt?: string;
  appliedAt?: string;
  relatedSource?: string;
  overrideAllowed?: boolean;
};

export type InventoryMovementRecord = {
  id: string;
  itemId: string;
  itemName: string;
  movementType: "Add Stock" | "Deduct Stock" | "Correction" | "Received From Parts Request" | "Used On RO" | "Received From PO" | "Adjustment Pending" | "Adjustment Approved" | "Adjustment Rejected" | "Adjustment Applied";
  quantityChange: number;
  quantityAfter: number;
  sourceLabel: string;
  note: string;
  createdAt: string;
  createdBy: string;
  adjustmentStatus?: InventoryAdjustmentStatus;
  adjustmentReason?: InventoryAdjustmentReason;
  approver?: string;
  decidedAt?: string;
  appliedAt?: string;
  relatedSource?: string;
};

export const INVENTORY_ITEMS_STORAGE_KEY = "dvi_inventory_items_v1";
export const INVENTORY_MOVEMENTS_STORAGE_KEY = "dvi_inventory_movements_v1";
export const INVENTORY_ADJUSTMENTS_STORAGE_KEY = "dvi_inventory_adjustments_v1";
export const INVENTORY_DEDUCTION_MODE_STORAGE_KEY = "dvi_inventory_deduction_mode_v1";
export const INVENTORY_UPDATED_EVENT = "dvi-inventory-updated";

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function readInventoryStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeInventoryStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(INVENTORY_UPDATED_EVENT));
}

export function readInventoryItems() {
  return readInventoryStorage<InventoryItemRecord[]>(INVENTORY_ITEMS_STORAGE_KEY, []).map(normalizeInventoryItemRecord);
}

export function readInventoryMovements() {
  return readInventoryStorage<InventoryMovementRecord[]>(INVENTORY_MOVEMENTS_STORAGE_KEY, []).map(normalizeInventoryMovementRecord);
}

export function writeInventoryItems(items: InventoryItemRecord[]) {
  writeInventoryStorage(INVENTORY_ITEMS_STORAGE_KEY, items);
}

export function writeInventoryMovements(movements: InventoryMovementRecord[]) {
  writeInventoryStorage(INVENTORY_MOVEMENTS_STORAGE_KEY, movements);
}

export function readInventoryAdjustments() {
  return readInventoryStorage<InventoryAdjustmentRequest[]>(INVENTORY_ADJUSTMENTS_STORAGE_KEY, []);
}

export function writeInventoryAdjustments(adjustments: InventoryAdjustmentRequest[]) {
  writeInventoryStorage(INVENTORY_ADJUSTMENTS_STORAGE_KEY, adjustments);
}

export function readInventoryDeductionMode() {
  return readInventoryStorage<InventoryDeductionMode>(INVENTORY_DEDUCTION_MODE_STORAGE_KEY, "Manual only");
}

export function writeInventoryDeductionMode(mode: InventoryDeductionMode) {
  writeInventoryStorage(INVENTORY_DEDUCTION_MODE_STORAGE_KEY, mode);
}
