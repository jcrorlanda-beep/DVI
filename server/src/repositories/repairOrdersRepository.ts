import { getPrismaClient } from "../db/prisma.js";
import type { BaseRepository, RepositoryResult } from "./types.js";

export type WorkLineDto = {
  id: string;
  serviceKey?: string | null;
  title: string;
  category?: string | null;
  status?: string | null;
  approved?: boolean;
  completed?: boolean;
};

export type RepairOrderDto = {
  id: string;
  localId?: string | null;
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
    serviceKey: typeof record.serviceKey === "string" ? record.serviceKey : null,
    title: String(record.title ?? ""),
    category: typeof record.category === "string" ? record.category : null,
    status: typeof record.status === "string" ? record.status : null,
    approved: Boolean(record.approved),
    completed: Boolean(record.completed),
  };
}

function normalizeRepairOrder(record: Record<string, unknown>): RepairOrderDto {
  return {
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
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
    openedAt: typeof record.openedAt === "string" ? record.openedAt : null,
    completedAt: typeof record.completedAt === "string" ? record.completedAt : null,
    workLines: Array.isArray(record.workLines) ? record.workLines.map((item) => normalizeWorkLine(item as Record<string, unknown>)) : [],
    createdAt: typeof record.createdAt === "string" ? record.createdAt : undefined,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : undefined,
  };
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
    const client = await getPrismaClient();
    const delegate = client?.repairOrder as Record<string, any> | undefined;
    if (!delegate) return unavailable("Prisma repairOrder delegate is unavailable.");
    try {
      const { workLines, ...repairOrderData } = data;
      const record = await delegate.create({
        data: {
          ...repairOrderData,
          ...(Array.isArray(workLines) ? { workLines: { create: workLines } } : {}),
        },
        include: { workLines: true },
      });
      return { success: true, data: normalizeRepairOrder(record as Record<string, unknown>) };
    } catch (error) {
      return fail(error);
    }
  },
  async update(id, data) {
    const client = await getPrismaClient();
    const delegate = client?.repairOrder as Record<string, any> | undefined;
    if (!delegate) return unavailable("Prisma repairOrder delegate is unavailable.");
    try {
      const { workLines: _workLines, ...repairOrderData } = data;
      const record = await delegate.update({ where: { id }, data: repairOrderData, include: { workLines: true } });
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
