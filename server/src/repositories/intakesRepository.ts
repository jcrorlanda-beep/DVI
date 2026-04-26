import { createPrismaRepository } from "./baseRepository.js";
import { getPrismaClient } from "../db/prisma.js";

export type IntakeDto = {
  id: string;
  localId?: string | null;
  intakeNumber?: string | null;
  customerId?: string | null;
  vehicleId?: string | null;
  customerName?: string | null;
  plateNumber?: string | null;
  conductionNumber?: string | null;
  odometer?: number | null;
  requestedServices?: unknown;
  concern?: string | null;
  status?: string | null;
  source?: string | null;
  openedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function optionalText(data: Record<string, unknown>, key: string): string | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalNumberValue(data: Record<string, unknown>, key: string): number | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  if (typeof value === "number" && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return Math.trunc(Number(value));
  return null;
}

function optionalJson(data: Record<string, unknown>, key: string): unknown {
  return key in data ? data[key] ?? null : undefined;
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

function intakeInput(data: Record<string, unknown>): Record<string, unknown> {
  const concern = optionalText(data, "concern") ?? optionalText(data, "serviceRequest");
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    ...(optionalText(data, "intakeNumber") !== undefined ? { intakeNumber: optionalText(data, "intakeNumber") } : {}),
    ...(optionalText(data, "customerId") !== undefined ? { customerId: optionalText(data, "customerId") } : {}),
    ...(optionalText(data, "vehicleId") !== undefined ? { vehicleId: optionalText(data, "vehicleId") } : {}),
    ...(optionalText(data, "customerName") !== undefined ? { customerName: optionalText(data, "customerName") } : {}),
    ...(optionalText(data, "plateNumber") !== undefined ? { plateNumber: optionalText(data, "plateNumber") } : {}),
    ...(optionalText(data, "conductionNumber") !== undefined ? { conductionNumber: optionalText(data, "conductionNumber") } : {}),
    ...(optionalNumberValue(data, "odometer") !== undefined ? { odometer: optionalNumberValue(data, "odometer") } : {}),
    ...(optionalJson(data, "requestedServices") !== undefined ? { requestedServices: optionalJson(data, "requestedServices") } : {}),
    ...(concern !== undefined ? { concern } : {}),
    ...(optionalText(data, "status") !== undefined ? { status: optionalText(data, "status") } : {}),
    ...(optionalText(data, "source") !== undefined ? { source: optionalText(data, "source") } : {}),
    ...(optionalDateText(data, "openedAt") !== undefined ? { openedAt: optionalDateText(data, "openedAt") } : {}),
  };
}

export const intakesRepository = createPrismaRepository<IntakeDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "intake",
  createInput: intakeInput,
  updateInput: intakeInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    const status = typeof filter?.status === "string" ? filter.status.trim() : "";
    return {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { intakeNumber: { contains: search, mode: "insensitive" } },
              { customerName: { contains: search, mode: "insensitive" } },
              { plateNumber: { contains: search, mode: "insensitive" } },
              { concern: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  },
  normalize: (record) => ({
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    intakeNumber: typeof record.intakeNumber === "string" ? record.intakeNumber : null,
    customerId: typeof record.customerId === "string" ? record.customerId : null,
    vehicleId: typeof record.vehicleId === "string" ? record.vehicleId : null,
    customerName: typeof record.customerName === "string" ? record.customerName : null,
    plateNumber: typeof record.plateNumber === "string" ? record.plateNumber : null,
    conductionNumber: typeof record.conductionNumber === "string" ? record.conductionNumber : null,
    odometer: typeof record.odometer === "number" ? record.odometer : null,
    requestedServices: record.requestedServices ?? null,
    concern: typeof record.concern === "string" ? record.concern : null,
    status: typeof record.status === "string" ? record.status : null,
    source: typeof record.source === "string" ? record.source : null,
    openedAt: dateToIso(record.openedAt),
    createdAt: dateToIso(record.createdAt) ?? undefined,
    updatedAt: dateToIso(record.updatedAt) ?? undefined,
  }),
});

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function prepareIntakeInputForPersistence(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const client = await getPrismaClient();
  if (!client) return data;

  const prepared: Record<string, unknown> = { ...data };
  const localCustomerId = text(prepared.localCustomerId);
  const localVehicleId = text(prepared.localVehicleId);
  const plateNumber = text(prepared.plateNumber);
  const conductionNumber = text(prepared.conductionNumber);

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
