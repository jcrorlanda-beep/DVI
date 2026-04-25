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

export type InventoryMovementRecord = {
  id: string;
  itemId: string;
  itemName: string;
  movementType: "Add Stock" | "Deduct Stock" | "Correction" | "Received From Parts Request" | "Used On RO" | "Received From PO";
  quantityChange: number;
  quantityAfter: number;
  sourceLabel: string;
  note: string;
  createdAt: string;
  createdBy: string;
};

export const INVENTORY_ITEMS_STORAGE_KEY = "dvi_inventory_items_v1";
export const INVENTORY_MOVEMENTS_STORAGE_KEY = "dvi_inventory_movements_v1";
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
  return readInventoryStorage<InventoryItemRecord[]>(INVENTORY_ITEMS_STORAGE_KEY, []);
}

export function readInventoryMovements() {
  return readInventoryStorage<InventoryMovementRecord[]>(INVENTORY_MOVEMENTS_STORAGE_KEY, []);
}

export function writeInventoryItems(items: InventoryItemRecord[]) {
  writeInventoryStorage(INVENTORY_ITEMS_STORAGE_KEY, items);
}

export function writeInventoryMovements(movements: InventoryMovementRecord[]) {
  writeInventoryStorage(INVENTORY_MOVEMENTS_STORAGE_KEY, movements);
}
