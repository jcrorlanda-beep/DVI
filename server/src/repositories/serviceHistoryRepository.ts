import { createPrismaRepository } from "./baseRepository.js";
import { getPrismaClient } from "../db/prisma.js";
import { dateToIso, optionalDateText, optionalInteger, optionalText } from "./inputHelpers.js";

export type ServiceHistoryRecordDto = {
  id: string;
  localId?: string | null;
  customerId?: string | null;
  vehicleId?: string | null;
  repairOrderId?: string | null;
  customerName?: string | null;
  plateNumber?: string | null;
  serviceTitle: string;
  category?: string | null;
  completedAt?: string | null;
  odometer?: number | null;
  sourceModule?: string | null;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function serviceHistoryInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    ...(optionalText(data, "customerId") !== undefined ? { customerId: optionalText(data, "customerId") } : {}),
    ...(optionalText(data, "vehicleId") !== undefined ? { vehicleId: optionalText(data, "vehicleId") } : {}),
    ...(optionalText(data, "repairOrderId") !== undefined ? { repairOrderId: optionalText(data, "repairOrderId") } : {}),
    ...(optionalText(data, "customerName") !== undefined ? { customerName: optionalText(data, "customerName") } : {}),
    ...(optionalText(data, "plateNumber") !== undefined ? { plateNumber: optionalText(data, "plateNumber") } : {}),
    serviceTitle: optionalText(data, "serviceTitle") ?? optionalText(data, "title") ?? "Completed service",
    ...(optionalText(data, "category") !== undefined ? { category: optionalText(data, "category") } : {}),
    ...(optionalDateText(data, "completedAt") !== undefined ? { completedAt: optionalDateText(data, "completedAt") } : {}),
    ...(optionalInteger(data, "odometer") !== undefined ? { odometer: optionalInteger(data, "odometer") } : {}),
    ...(optionalText(data, "sourceModule") !== undefined ? { sourceModule: optionalText(data, "sourceModule") } : {}),
    ...(optionalText(data, "notes") !== undefined ? { notes: optionalText(data, "notes") } : {}),
  };
}

function normalize(record: Record<string, unknown>): ServiceHistoryRecordDto {
  return {
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    customerId: typeof record.customerId === "string" ? record.customerId : null,
    vehicleId: typeof record.vehicleId === "string" ? record.vehicleId : null,
    repairOrderId: typeof record.repairOrderId === "string" ? record.repairOrderId : null,
    customerName: typeof record.customerName === "string" ? record.customerName : null,
    plateNumber: typeof record.plateNumber === "string" ? record.plateNumber : null,
    serviceTitle: String(record.serviceTitle ?? ""),
    category: typeof record.category === "string" ? record.category : null,
    completedAt: dateToIso(record.completedAt),
    odometer: typeof record.odometer === "number" ? record.odometer : null,
    sourceModule: typeof record.sourceModule === "string" ? record.sourceModule : null,
    notes: typeof record.notes === "string" ? record.notes : null,
    createdAt: dateToIso(record.createdAt),
    updatedAt: dateToIso(record.updatedAt),
  };
}

export async function prepareServiceHistoryInputForPersistence(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const client = await getPrismaClient();
  if (!client) return data;
  const prepared = { ...data };
  const localCustomerId = optionalText(prepared, "localCustomerId");
  const localVehicleId = optionalText(prepared, "localVehicleId");
  const localRepairOrderId = optionalText(prepared, "localRepairOrderId");
  const plateNumber = optionalText(prepared, "plateNumber");

  if (!optionalText(prepared, "repairOrderId") && localRepairOrderId) {
    const ro = await (client.repairOrder as Record<string, any> | undefined)?.findUnique?.({ where: { localId: localRepairOrderId } });
    if (ro?.id) {
      prepared.repairOrderId = String(ro.id);
      if (!optionalText(prepared, "customerId") && ro.customerId) prepared.customerId = String(ro.customerId);
      if (!optionalText(prepared, "vehicleId") && ro.vehicleId) prepared.vehicleId = String(ro.vehicleId);
    }
  }
  if (!optionalText(prepared, "customerId") && localCustomerId) {
    const customer = await (client.customer as Record<string, any> | undefined)?.findUnique?.({ where: { localId: localCustomerId } });
    if (customer?.id) prepared.customerId = String(customer.id);
  }
  if (!optionalText(prepared, "vehicleId") && localVehicleId) {
    const vehicle = await (client.vehicle as Record<string, any> | undefined)?.findUnique?.({ where: { localId: localVehicleId } });
    if (vehicle?.id) {
      prepared.vehicleId = String(vehicle.id);
      if (!optionalText(prepared, "customerId") && vehicle.customerId) prepared.customerId = String(vehicle.customerId);
    }
  }
  if (!optionalText(prepared, "vehicleId") && plateNumber) {
    const vehicle = await (client.vehicle as Record<string, any> | undefined)?.findFirst?.({ where: { plateNumber: { equals: plateNumber, mode: "insensitive" } } });
    if (vehicle?.id) {
      prepared.vehicleId = String(vehicle.id);
      if (!optionalText(prepared, "customerId") && vehicle.customerId) prepared.customerId = String(vehicle.customerId);
    }
  }
  return prepared;
}

export const serviceHistoryRepository = createPrismaRepository<ServiceHistoryRecordDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "serviceHistoryRecord",
  createInput: serviceHistoryInput,
  updateInput: serviceHistoryInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    return {
      ...(typeof filter?.vehicleId === "string" && filter.vehicleId ? { vehicleId: filter.vehicleId } : {}),
      ...(typeof filter?.customerId === "string" && filter.customerId ? { customerId: filter.customerId } : {}),
      ...(search ? { OR: [{ serviceTitle: { contains: search, mode: "insensitive" } }, { plateNumber: { contains: search, mode: "insensitive" } }] } : {}),
    };
  },
  normalize,
});
