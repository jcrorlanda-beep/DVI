import { createPrismaRepository } from "./baseRepository.js";
import { getPrismaClient } from "../db/prisma.js";
import { dateToIso, optionalDateText, optionalJson, optionalNumber, optionalText } from "./inputHelpers.js";
import { resolvePartsRequestReference, resolveRepairOrderReference, resolveSupplierReference } from "./linkageHelpers.js";
import type { BaseRepository } from "./types.js";

export type PurchaseOrderDto = {
  id: string;
  localId?: string | null;
  poNumber?: string | null;
  supplierId?: string | null;
  repairOrderId?: string | null;
  partsRequestId?: string | null;
  supplierName?: string | null;
  status?: string | null;
  expectedDelivery?: string | null;
  items?: unknown;
  receivingEvents?: unknown;
  totalCost?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function purchaseOrderInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    ...(optionalText(data, "poNumber") !== undefined ? { poNumber: optionalText(data, "poNumber") } : {}),
    ...(optionalText(data, "supplierId") !== undefined ? { supplierId: optionalText(data, "supplierId") } : {}),
    ...(optionalText(data, "repairOrderId") !== undefined ? { repairOrderId: optionalText(data, "repairOrderId") } : {}),
    ...(optionalText(data, "partsRequestId") !== undefined ? { partsRequestId: optionalText(data, "partsRequestId") } : {}),
    ...(optionalText(data, "supplierName") !== undefined ? { supplierName: optionalText(data, "supplierName") } : {}),
    ...(optionalText(data, "status") !== undefined ? { status: optionalText(data, "status") } : {}),
    ...(optionalDateText(data, "expectedDelivery") !== undefined || optionalDateText(data, "expectedDeliveryDate") !== undefined
      ? { expectedDelivery: optionalDateText(data, "expectedDelivery") ?? optionalDateText(data, "expectedDeliveryDate") }
      : {}),
    ...(optionalJson(data, "items") !== undefined || optionalJson(data, "poItems") !== undefined
      ? { items: optionalJson(data, "items") ?? optionalJson(data, "poItems") }
      : {}),
    ...(optionalJson(data, "receivingEvents") !== undefined ? { receivingEvents: optionalJson(data, "receivingEvents") } : {}),
    ...(optionalNumber(data, "totalCost") !== undefined || optionalNumber(data, "cost") !== undefined
      ? { totalCost: optionalNumber(data, "totalCost") ?? optionalNumber(data, "cost") }
      : {}),
  };
}

export async function preparePurchaseOrderInputForPersistence(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const client = await getPrismaClient();
  if (!client) return data;
  const prepared: Record<string, unknown> = { ...data };

  const supplier = await resolveSupplierReference(client, prepared);
  if (supplier?.id) {
    prepared.supplierId = String(supplier.id);
    if (!prepared.supplierName && typeof supplier.supplierName === "string") prepared.supplierName = supplier.supplierName;
  }

  const repairOrder = await resolveRepairOrderReference(client, prepared);
  if (repairOrder?.id) prepared.repairOrderId = String(repairOrder.id);

  const partsRequest = await resolvePartsRequestReference(client, prepared);
  if (partsRequest?.id) prepared.partsRequestId = String(partsRequest.id);

  return prepared;
}

const basePurchaseOrdersRepository = createPrismaRepository<PurchaseOrderDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "purchaseOrder",
  createInput: purchaseOrderInput,
  updateInput: purchaseOrderInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    const status = typeof filter?.status === "string" ? filter.status.trim() : "";
    const supplierId = typeof filter?.supplierId === "string" ? filter.supplierId.trim() : "";
    return {
      ...(status ? { status } : {}),
      ...(supplierId ? { supplierId } : {}),
      ...(search
        ? {
            OR: [
              { poNumber: { contains: search, mode: "insensitive" } },
              { supplierName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  },
  normalize: (record) => ({
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    poNumber: typeof record.poNumber === "string" ? record.poNumber : null,
    supplierId: typeof record.supplierId === "string" ? record.supplierId : null,
    repairOrderId: typeof record.repairOrderId === "string" ? record.repairOrderId : null,
    partsRequestId: typeof record.partsRequestId === "string" ? record.partsRequestId : null,
    supplierName: typeof record.supplierName === "string" ? record.supplierName : null,
    status: typeof record.status === "string" ? record.status : null,
    expectedDelivery: dateToIso(record.expectedDelivery),
    items: record.items ?? null,
    receivingEvents: record.receivingEvents ?? null,
    totalCost: record.totalCost != null ? String(record.totalCost) : null,
    createdAt: dateToIso(record.createdAt) ?? undefined,
    updatedAt: dateToIso(record.updatedAt) ?? undefined,
  }),
});

export function buildPurchaseOrderInput(data: Record<string, unknown>): Record<string, unknown> {
  return purchaseOrderInput(data);
}

export const purchaseOrdersRepository: BaseRepository<PurchaseOrderDto, Record<string, unknown>, Record<string, unknown>> = {
  ...basePurchaseOrdersRepository,
  async create(data) {
    return basePurchaseOrdersRepository.create(await preparePurchaseOrderInputForPersistence(data));
  },
  async update(id, data) {
    return basePurchaseOrdersRepository.update(id, await preparePurchaseOrderInputForPersistence(data));
  },
};
