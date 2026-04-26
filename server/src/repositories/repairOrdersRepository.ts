import { getPrismaClient } from "../db/prisma.js";
import type { BaseRepository, RepositoryResult } from "./types.js";

export type WorkLineDto = {
  id: string;
  localId?: string | null;
  serviceKey?: string | null;
  title: string;
  category?: string | null;
  status?: string | null;
  technicianName?: string | null;
  approved?: boolean;
  completed?: boolean;
  quantity?: string | null;
  unitPrice?: string | null;
  unitCost?: string | null;
  completedAt?: string | null;
};

export type RepairOrderDto = {
  id: string;
  localId?: string | null;
  intakeId?: string | null;
  repairOrderNumber?: string | null;
  customerId?: string | null;
  vehicleId?: string | null;
  customerName?: string | null;
  plateNumber?: string | null;
  status?: string | null;
  advisorName?: string | null;
  technicianName?: string | null;
  odometer?: number | null;
  subtotal?: string | null;
  total?: string | null;
  openedAt?: string | null;
  completedAt?: string | null;
  workLines?: WorkLineDto[];
  createdAt?: string;
  updatedAt?: string;
};

function unavailable<T>(message: string): RepositoryResult<T> {
  return { success: false, error: message, code: "UNAVAILABLE", retryable: true };
}

function fail<T>(error: unknown): RepositoryResult<T> {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Unexpected repair order repository error",
    code: "UNKNOWN",
  };
}

function normalizeWorkLine(record: Record<string, unknown>): WorkLineDto {
  return {
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    serviceKey: typeof record.serviceKey === "string" ? record.serviceKey : null,
    title: String(record.title ?? ""),
    category: typeof record.category === "string" ? record.category : null,
    status: typeof record.status === "string" ? record.status : null,
    technicianName: typeof record.technicianName === "string" ? record.technicianName : null,
    approved: Boolean(record.approved),
    completed: Boolean(record.completed),
    quantity: record.quantity != null ? String(record.quantity) : null,
    unitPrice: record.unitPrice != null ? String(record.unitPrice) : null,
    unitCost: record.unitCost != null ? String(record.unitCost) : null,
    completedAt: dateToIso(record.completedAt),
  };
}

function optionalText(data: Record<string, unknown>, key: string): string | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalNumber(data: Record<string, unknown>, key: string): number | string | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return value.trim();
  return null;
}

function optionalBoolean(data: Record<string, unknown>, key: string): boolean | undefined {
  if (!(key in data)) return undefined;
  return typeof data[key] === "boolean" ? data[key] : Boolean(data[key]);
}

function optionalDateText(data: Record<string, unknown>, key: string): string | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function dateToIso(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : null;
}

function workLineInput(line: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(optionalText(line, "localId") !== undefined ? { localId: optionalText(line, "localId") } : {}),
    ...(optionalText(line, "serviceKey") !== undefined ? { serviceKey: optionalText(line, "serviceKey") } : {}),
    title: optionalText(line, "title") ?? optionalText(line, "serviceTitle") ?? "Untitled service",
    ...(optionalText(line, "category") !== undefined ? { category: optionalText(line, "category") } : {}),
    ...(optionalText(line, "status") !== undefined ? { status: optionalText(line, "status") } : {}),
    ...(optionalText(line, "technicianName") !== undefined ? { technicianName: optionalText(line, "technicianName") } : {}),
    ...(optionalBoolean(line, "approved") !== undefined ? { approved: optionalBoolean(line, "approved") } : {}),
    ...(optionalBoolean(line, "completed") !== undefined ? { completed: optionalBoolean(line, "completed") } : {}),
    ...(optionalNumber(line, "quantity") !== undefined ? { quantity: optionalNumber(line, "quantity") } : {}),
    ...(optionalNumber(line, "unitPrice") !== undefined ? { unitPrice: optionalNumber(line, "unitPrice") } : {}),
    ...(optionalNumber(line, "unitCost") !== undefined ? { unitCost: optionalNumber(line, "unitCost") } : {}),
    ...(optionalDateText(line, "completedAt") !== undefined ? { completedAt: optionalDateText(line, "completedAt") } : {}),
  };
}

function repairOrderInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    ...(optionalText(data, "intakeId") !== undefined ? { intakeId: optionalText(data, "intakeId") } : {}),
    ...(optionalText(data, "repairOrderNumber") !== undefined ? { repairOrderNumber: optionalText(data, "repairOrderNumber") } : {}),
    ...(optionalText(data, "customerId") !== undefined ? { customerId: optionalText(data, "customerId") } : {}),
    ...(optionalText(data, "vehicleId") !== undefined ? { vehicleId: optionalText(data, "vehicleId") } : {}),
    ...(optionalText(data, "customerName") !== undefined ? { customerName: optionalText(data, "customerName") } : {}),
    ...(optionalText(data, "plateNumber") !== undefined ? { plateNumber: optionalText(data, "plateNumber") } : {}),
    ...(optionalText(data, "status") !== undefined ? { status: optionalText(data, "status") } : {}),
    ...(optionalText(data, "advisorName") !== undefined ? { advisorName: optionalText(data, "advisorName") } : {}),
    ...(optionalText(data, "technicianName") !== undefined ? { technicianName: optionalText(data, "technicianName") } : {}),
    ...(optionalNumber(data, "odometer") !== undefined ? { odometer: optionalNumber(data, "odometer") } : {}),
    ...(optionalNumber(data, "subtotal") !== undefined ? { subtotal: optionalNumber(data, "subtotal") } : {}),
    ...(optionalNumber(data, "total") !== undefined ? { total: optionalNumber(data, "total") } : {}),
    ...(optionalDateText(data, "openedAt") !== undefined ? { openedAt: optionalDateText(data, "openedAt") } : {}),
    ...(optionalDateText(data, "completedAt") !== undefined ? { completedAt: optionalDateText(data, "completedAt") } : {}),
  };
}

function normalizeRepairOrder(record: Record<string, unknown>): RepairOrderDto {
  return {
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    intakeId: typeof record.intakeId === "string" ? record.intakeId : null,
    repairOrderNumber: typeof record.repairOrderNumber === "string" ? record.repairOrderNumber : null,
    customerId: typeof record.customerId === "string" ? record.customerId : null,
    vehicleId: typeof record.vehicleId === "string" ? record.vehicleId : null,
    customerName: typeof record.customerName === "string" ? record.customerName : null,
    plateNumber: typeof record.plateNumber === "string" ? record.plateNumber : null,
    status: typeof record.status === "string" ? record.status : null,
    advisorName: typeof record.advisorName === "string" ? record.advisorName : null,
    technicianName: typeof record.technicianName === "string" ? record.technicianName : null,
    odometer: typeof record.odometer === "number" ? record.odometer : null,
    subtotal: record.subtotal != null ? String(record.subtotal) : null,
    total: record.total != null ? String(record.total) : null,
    openedAt: dateToIso(record.openedAt),
    completedAt: dateToIso(record.completedAt),
    workLines: Array.isArray(record.workLines) ? record.workLines.map((item) => normalizeWorkLine(item as Record<string, unknown>)) : [],
    createdAt: dateToIso(record.createdAt) ?? undefined,
    updatedAt: dateToIso(record.updatedAt) ?? undefined,
  };
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function prepareRepairOrderInput(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const client = await getPrismaClient();
  if (!client) return data;
  const prepared: Record<string, unknown> = { ...data };

  const localCustomerId = text(prepared.localCustomerId);
  const localVehicleId = text(prepared.localVehicleId);
  const localIntakeId = text(prepared.localIntakeId);
  const plateNumber = text(prepared.plateNumber);
  const conductionNumber = text(prepared.conductionNumber);

  if (!text(prepared.intakeId) && localIntakeId) {
    const intake = await (client.intake as Record<string, any> | undefined)?.findUnique?.({ where: { localId: localIntakeId } });
    if (intake?.id) {
      prepared.intakeId = String(intake.id);
      if (!text(prepared.customerId) && intake.customerId) prepared.customerId = String(intake.customerId);
      if (!text(prepared.vehicleId) && intake.vehicleId) prepared.vehicleId = String(intake.vehicleId);
    }
  }

  if (!text(prepared.customerId) && localCustomerId) {
    const customer = await (client.customer as Record<string, any> | undefined)?.findUnique?.({ where: { localId: localCustomerId } });
    if (customer?.id) prepared.customerId = String(customer.id);
  }

  if (!text(prepared.vehicleId) && localVehicleId) {
    const vehicle = await (client.vehicle as Record<string, any> | undefined)?.findUnique?.({ where: { localId: localVehicleId } });
    if (vehicle?.id) {
      prepared.vehicleId = String(vehicle.id);
      if (!text(prepared.customerId) && vehicle.customerId) prepared.customerId = String(vehicle.customerId);
    }
  }

  if (!text(prepared.vehicleId) && (plateNumber || conductionNumber)) {
    const vehicle = await (client.vehicle as Record<string, any> | undefined)?.findFirst?.({
      where: {
        OR: [
          ...(plateNumber ? [{ plateNumber: { equals: plateNumber, mode: "insensitive" } }] : []),
          ...(conductionNumber ? [{ conductionNumber: { equals: conductionNumber, mode: "insensitive" } }] : []),
        ],
      },
    });
    if (vehicle?.id) {
      prepared.vehicleId = String(vehicle.id);
      if (!text(prepared.customerId) && vehicle.customerId) prepared.customerId = String(vehicle.customerId);
    }
  }

  return prepared;
}

function buildWhere(filter?: Record<string, unknown>) {
  const search = typeof filter?.search === "string" ? filter.search.trim() : "";
  const status = typeof filter?.status === "string" ? filter.status.trim() : "";
  return {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { repairOrderNumber: { contains: search, mode: "insensitive" } },
            { customerName: { contains: search, mode: "insensitive" } },
            { plateNumber: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
}

export const repairOrdersRepository: BaseRepository<RepairOrderDto, Record<string, unknown>, Record<string, unknown>> = {
  async list(filter) {
    const client = await getPrismaClient();
    const delegate = client?.repairOrder as Record<string, any> | undefined;
    if (!delegate) return unavailable("Prisma repairOrder delegate is unavailable.");
    try {
      const records = await delegate.findMany({ where: buildWhere(filter), include: { workLines: true } });
      return { success: true, data: records.map((record: Record<string, unknown>) => normalizeRepairOrder(record)) };
    } catch (error) {
      return fail(error);
    }
  },
  async getById(id) {
    const client = await getPrismaClient();
    const delegate = client?.repairOrder as Record<string, any> | undefined;
    if (!delegate) return unavailable("Prisma repairOrder delegate is unavailable.");
    try {
      const record = await delegate.findUnique({ where: { id }, include: { workLines: true } });
      return { success: true, data: record ? normalizeRepairOrder(record as Record<string, unknown>) : null };
    } catch (error) {
      return fail(error);
    }
  },
  async create(data) {
    const prepared = await prepareRepairOrderInput(data);
    const client = await getPrismaClient();
    const delegate = client?.repairOrder as Record<string, any> | undefined;
    if (!delegate) return unavailable("Prisma repairOrder delegate is unavailable.");
    try {
      const workLines = Array.isArray(prepared.workLines) ? prepared.workLines : [];
      const record = await delegate.create({
        data: {
          ...repairOrderInput(prepared),
          ...(workLines.length ? { workLines: { create: workLines.map((line) => workLineInput(line as Record<string, unknown>)) } } : {}),
        },
        include: { workLines: true },
      });
      return { success: true, data: normalizeRepairOrder(record as Record<string, unknown>) };
    } catch (error) {
      return fail(error);
    }
  },
  async update(id, data) {
    const prepared = await prepareRepairOrderInput(data);
    const client = await getPrismaClient();
    const delegate = client?.repairOrder as Record<string, any> | undefined;
    if (!delegate) return unavailable("Prisma repairOrder delegate is unavailable.");
    try {
      const workLines = Array.isArray(prepared.workLines) ? prepared.workLines : [];
      const record = await delegate.update({
        where: { id },
        data: {
          ...repairOrderInput(prepared),
          ...(workLines.length
            ? {
                workLines: {
                  deleteMany: {},
                  create: workLines.map((line) => workLineInput(line as Record<string, unknown>)),
                },
              }
            : {}),
        },
        include: { workLines: true },
      });
      return { success: true, data: normalizeRepairOrder(record as Record<string, unknown>) };
    } catch (error) {
      return fail(error);
    }
  },
  async remove(id) {
    const client = await getPrismaClient();
    const delegate = client?.repairOrder as Record<string, any> | undefined;
    if (!delegate) return unavailable("Prisma repairOrder delegate is unavailable.");
    try {
      const record = await delegate.delete({ where: { id } });
      return { success: true, data: { id: String((record as Record<string, unknown>).id ?? id) } };
    } catch (error) {
      return fail(error);
    }
  },
};
