import { createPrismaRepository } from "./baseRepository.js";
import { dateToIso, optionalBoolean, optionalInteger, optionalJson, optionalNumber, optionalText } from "./inputHelpers.js";

export type InventoryItemDto = {
  id: string;
  localId?: string | null;
  itemName: string;
  sku?: string | null;
  partNumber?: string | null;
  category?: string | null;
  brand?: string | null;
  quantityOnHand: number;
  reorderLevel: number;
  unitCost?: string | null;
  sellingPrice?: string | null;
  supplierName?: string | null;
  active: boolean;
  movementLog?: unknown;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type InventoryMovementDto = {
  id: string;
  localId?: string | null;
  inventoryItemId?: string | null;
  movementType: string;
  quantity: number;
  reason?: string | null;
  sourceModule?: string | null;
  linkedEntityId?: string | null;
  note?: string | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function inventoryItemInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    itemName: optionalText(data, "itemName") ?? optionalText(data, "name") ?? "Unnamed item",
    ...(optionalText(data, "sku") !== undefined ? { sku: optionalText(data, "sku") } : {}),
    ...(optionalText(data, "partNumber") !== undefined ? { partNumber: optionalText(data, "partNumber") } : {}),
    ...(optionalText(data, "category") !== undefined ? { category: optionalText(data, "category") } : {}),
    ...(optionalText(data, "brand") !== undefined ? { brand: optionalText(data, "brand") } : {}),
    ...(optionalInteger(data, "quantityOnHand") !== undefined ? { quantityOnHand: optionalInteger(data, "quantityOnHand") } : {}),
    ...(optionalInteger(data, "reorderLevel") !== undefined ? { reorderLevel: optionalInteger(data, "reorderLevel") } : {}),
    ...(optionalNumber(data, "unitCost") !== undefined ? { unitCost: optionalNumber(data, "unitCost") } : {}),
    ...(optionalNumber(data, "sellingPrice") !== undefined ? { sellingPrice: optionalNumber(data, "sellingPrice") } : {}),
    ...(optionalText(data, "supplierName") !== undefined || optionalText(data, "supplier") !== undefined || optionalText(data, "vendorName") !== undefined
      ? { supplierName: optionalText(data, "supplierName") ?? optionalText(data, "supplier") ?? optionalText(data, "vendorName") }
      : {}),
    ...(optionalBoolean(data, "active") !== undefined ? { active: optionalBoolean(data, "active") } : {}),
    ...(optionalJson(data, "movementLog") !== undefined ? { movementLog: optionalJson(data, "movementLog") } : {}),
    ...(optionalText(data, "notes") !== undefined ? { notes: optionalText(data, "notes") } : {}),
  };
}

function inventoryMovementInput(data: Record<string, unknown>, inventoryItemId?: string): Record<string, unknown> {
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    inventoryItemId: inventoryItemId ?? optionalText(data, "inventoryItemId"),
    movementType: optionalText(data, "movementType") ?? optionalText(data, "type") ?? "Adjustment",
    quantity: optionalInteger(data, "quantity") ?? 0,
    ...(optionalText(data, "reason") !== undefined || optionalText(data, "adjustmentReason") !== undefined
      ? { reason: optionalText(data, "reason") ?? optionalText(data, "adjustmentReason") }
      : {}),
    ...(optionalText(data, "sourceModule") !== undefined ? { sourceModule: optionalText(data, "sourceModule") } : {}),
    ...(optionalText(data, "linkedEntityId") !== undefined ? { linkedEntityId: optionalText(data, "linkedEntityId") } : {}),
    ...(optionalText(data, "note") !== undefined || optionalText(data, "adjustmentNote") !== undefined
      ? { note: optionalText(data, "note") ?? optionalText(data, "adjustmentNote") }
      : {}),
    ...(optionalText(data, "createdBy") !== undefined ? { createdBy: optionalText(data, "createdBy") } : {}),
  };
}

export const inventoryItemsRepository = createPrismaRepository<InventoryItemDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "inventoryItem",
  createInput: inventoryItemInput,
  updateInput: inventoryItemInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    const category = typeof filter?.category === "string" ? filter.category.trim() : "";
    const brand = typeof filter?.brand === "string" ? filter.brand.trim() : "";
    const supplier = typeof filter?.supplier === "string" ? filter.supplier.trim() : "";
    return {
      ...(category ? { category } : {}),
      ...(brand ? { brand } : {}),
      ...(supplier ? { supplierName: { contains: supplier, mode: "insensitive" } } : {}),
      ...(search
        ? {
            OR: [
              { itemName: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
              { partNumber: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  },
  normalize: (record) => ({
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    itemName: String(record.itemName ?? ""),
    sku: typeof record.sku === "string" ? record.sku : null,
    partNumber: typeof record.partNumber === "string" ? record.partNumber : null,
    category: typeof record.category === "string" ? record.category : null,
    brand: typeof record.brand === "string" ? record.brand : null,
    quantityOnHand: typeof record.quantityOnHand === "number" ? record.quantityOnHand : 0,
    reorderLevel: typeof record.reorderLevel === "number" ? record.reorderLevel : 0,
    unitCost: record.unitCost != null ? String(record.unitCost) : null,
    sellingPrice: record.sellingPrice != null ? String(record.sellingPrice) : null,
    supplierName: typeof record.supplierName === "string" ? record.supplierName : null,
    active: record.active !== false,
    movementLog: record.movementLog ?? null,
    notes: typeof record.notes === "string" ? record.notes : null,
    createdAt: dateToIso(record.createdAt) ?? undefined,
    updatedAt: dateToIso(record.updatedAt) ?? undefined,
  }),
});

export const inventoryMovementsRepository = createPrismaRepository<InventoryMovementDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "inventoryMovement",
  createInput: inventoryMovementInput,
  updateInput: inventoryMovementInput,
  listFilter: (filter) => ({
    ...(typeof filter?.inventoryItemId === "string" ? { inventoryItemId: filter.inventoryItemId } : {}),
    ...(typeof filter?.movementType === "string" ? { movementType: filter.movementType } : {}),
    ...(typeof filter?.sourceModule === "string" ? { sourceModule: filter.sourceModule } : {}),
    ...(typeof filter?.linkedEntityId === "string" ? { linkedEntityId: filter.linkedEntityId } : {}),
  }),
  normalize: (record) => ({
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    inventoryItemId: typeof record.inventoryItemId === "string" ? record.inventoryItemId : null,
    movementType: String(record.movementType ?? ""),
    quantity: typeof record.quantity === "number" ? record.quantity : 0,
    reason: typeof record.reason === "string" ? record.reason : null,
    sourceModule: typeof record.sourceModule === "string" ? record.sourceModule : null,
    linkedEntityId: typeof record.linkedEntityId === "string" ? record.linkedEntityId : null,
    note: typeof record.note === "string" ? record.note : null,
    createdBy: typeof record.createdBy === "string" ? record.createdBy : null,
    createdAt: dateToIso(record.createdAt) ?? undefined,
    updatedAt: dateToIso(record.updatedAt) ?? undefined,
  }),
});

export function buildInventoryMovementInput(data: Record<string, unknown>, inventoryItemId: string): Record<string, unknown> {
  return inventoryMovementInput(data, inventoryItemId);
}
