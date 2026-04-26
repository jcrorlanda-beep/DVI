import { createPrismaRepository } from "./baseRepository.js";
import { getPrismaClient } from "../db/prisma.js";
import { dateToIso, optionalInteger, optionalJson, optionalText } from "./inputHelpers.js";
import { resolveRepairOrderReference, resolveSupplierReference, resolveVehicleReference, text } from "./linkageHelpers.js";
import type { BaseRepository } from "./types.js";

export type PartsRequestDto = {
  id: string;
  localId?: string | null;
  requestNumber?: string | null;
  repairOrderId?: string | null;
  supplierId?: string | null;
  partName: string;
  partNumber?: string | null;
  category?: string | null;
  quantity?: number | null;
  urgency?: string | null;
  status?: string | null;
  selectedBidId?: string | null;
  plateNumber?: string | null;
  requestedBy?: string | null;
  bids?: unknown;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function partsRequestInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    ...(optionalText(data, "requestNumber") !== undefined ? { requestNumber: optionalText(data, "requestNumber") } : {}),
    ...(optionalText(data, "repairOrderId") !== undefined ? { repairOrderId: optionalText(data, "repairOrderId") } : {}),
    ...(optionalText(data, "supplierId") !== undefined ? { supplierId: optionalText(data, "supplierId") } : {}),
    partName: optionalText(data, "partName") ?? optionalText(data, "itemName") ?? optionalText(data, "requestedItem") ?? "Unspecified part",
    ...(optionalText(data, "partNumber") !== undefined ? { partNumber: optionalText(data, "partNumber") } : {}),
    ...(optionalText(data, "category") !== undefined ? { category: optionalText(data, "category") } : {}),
    ...(optionalInteger(data, "quantity") !== undefined ? { quantity: optionalInteger(data, "quantity") } : {}),
    ...(optionalText(data, "urgency") !== undefined ? { urgency: optionalText(data, "urgency") } : {}),
    ...(optionalText(data, "status") !== undefined ? { status: optionalText(data, "status") } : {}),
    ...(optionalText(data, "selectedBidId") !== undefined ? { selectedBidId: optionalText(data, "selectedBidId") } : {}),
    ...(optionalText(data, "plateNumber") !== undefined ? { plateNumber: optionalText(data, "plateNumber") } : {}),
    ...(optionalText(data, "requestedBy") !== undefined ? { requestedBy: optionalText(data, "requestedBy") } : {}),
    ...(optionalJson(data, "bids") !== undefined ? { bids: optionalJson(data, "bids") } : {}),
    ...(optionalText(data, "notes") !== undefined ? { notes: optionalText(data, "notes") } : {}),
  };
}

export async function preparePartsRequestInputForPersistence(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const client = await getPrismaClient();
  if (!client) return data;
  const prepared: Record<string, unknown> = { ...data };

  const ro = await resolveRepairOrderReference(client, prepared);
  if (ro?.id) {
    prepared.repairOrderId = String(ro.id);
    if (!text(prepared.plateNumber) && typeof ro.plateNumber === "string") prepared.plateNumber = ro.plateNumber;
  }

  const vehicle = await resolveVehicleReference(client, prepared);
  if (vehicle?.plateNumber && !text(prepared.plateNumber)) prepared.plateNumber = String(vehicle.plateNumber);

  const supplier = await resolveSupplierReference(client, prepared);
  if (supplier?.id) {
    prepared.supplierId = String(supplier.id);
  }

  return prepared;
}

const basePartsRequestsRepository = createPrismaRepository<PartsRequestDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "partsRequest",
  createInput: partsRequestInput,
  updateInput: partsRequestInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    const status = typeof filter?.status === "string" ? filter.status.trim() : "";
    const category = typeof filter?.category === "string" ? filter.category.trim() : "";
    const urgency = typeof filter?.urgency === "string" ? filter.urgency.trim() : "";
    const supplierId = typeof filter?.supplierId === "string" ? filter.supplierId.trim() : "";
    return {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...(urgency ? { urgency } : {}),
      ...(supplierId ? { supplierId } : {}),
      ...(search
        ? {
            OR: [
              { requestNumber: { contains: search, mode: "insensitive" } },
              { partName: { contains: search, mode: "insensitive" } },
              { partNumber: { contains: search, mode: "insensitive" } },
              { plateNumber: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  },
  normalize: (record) => ({
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    requestNumber: typeof record.requestNumber === "string" ? record.requestNumber : null,
    repairOrderId: typeof record.repairOrderId === "string" ? record.repairOrderId : null,
    supplierId: typeof record.supplierId === "string" ? record.supplierId : null,
    partName: String(record.partName ?? ""),
    partNumber: typeof record.partNumber === "string" ? record.partNumber : null,
    category: typeof record.category === "string" ? record.category : null,
    quantity: typeof record.quantity === "number" ? record.quantity : null,
    urgency: typeof record.urgency === "string" ? record.urgency : null,
    status: typeof record.status === "string" ? record.status : null,
    selectedBidId: typeof record.selectedBidId === "string" ? record.selectedBidId : null,
    plateNumber: typeof record.plateNumber === "string" ? record.plateNumber : null,
    requestedBy: typeof record.requestedBy === "string" ? record.requestedBy : null,
    bids: record.bids ?? null,
    notes: typeof record.notes === "string" ? record.notes : null,
    createdAt: dateToIso(record.createdAt) ?? undefined,
    updatedAt: dateToIso(record.updatedAt) ?? undefined,
  }),
});

export const partsRequestsRepository: BaseRepository<PartsRequestDto, Record<string, unknown>, Record<string, unknown>> = {
  ...basePartsRequestsRepository,
  async create(data) {
    return basePartsRequestsRepository.create(await preparePartsRequestInputForPersistence(data));
  },
  async update(id, data) {
    return basePartsRequestsRepository.update(id, await preparePartsRequestInputForPersistence(data));
  },
};
