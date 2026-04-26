import { createPrismaRepository } from "./baseRepository.js";
import { getPrismaClient } from "../db/prisma.js";
import type { RepositoryResult } from "./types.js";

export type VehicleDto = {
  id: string;
  localId?: string | null;
  customerId?: string | null;
  plateNumber?: string | null;
  conductionNumber?: string | null;
  make?: string | null;
  model?: string | null;
  year?: string | null;
  color?: string | null;
  mileage?: number | null;
  notes?: string | null;
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type VehicleDuplicateSummary = {
  duplicatePlateNumber: VehicleDto[];
  duplicateConductionNumber: VehicleDto[];
  sameCustomerMakeModelYear: VehicleDto[];
};

function optionalText(data: Record<string, unknown>, key: string): string | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeVehicleRecord(record: Record<string, unknown>): VehicleDto {
  return {
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    customerId: typeof record.customerId === "string" ? record.customerId : null,
    plateNumber: typeof record.plateNumber === "string" ? record.plateNumber : null,
    conductionNumber: typeof record.conductionNumber === "string" ? record.conductionNumber : null,
    make: typeof record.make === "string" ? record.make : null,
    model: typeof record.model === "string" ? record.model : null,
    year: typeof record.year === "string" ? record.year : null,
    color: typeof record.color === "string" ? record.color : null,
    mileage: typeof record.mileage === "number" ? record.mileage : null,
    notes: typeof record.notes === "string" ? record.notes : null,
    archivedAt: dateToIso(record.archivedAt),
    createdAt: dateToIso(record.createdAt) ?? undefined,
    updatedAt: dateToIso(record.updatedAt) ?? undefined,
  };
}

function optionalNumberValue(data: Record<string, unknown>, key: string): number | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
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

function vehicleInput(data: Partial<VehicleDto>): Record<string, unknown> {
  const record = data as Record<string, unknown>;
  return {
    ...(optionalText(record, "localId") !== undefined ? { localId: optionalText(record, "localId") } : {}),
    ...(optionalText(record, "customerId") !== undefined ? { customerId: optionalText(record, "customerId") } : {}),
    ...(optionalText(record, "plateNumber") !== undefined ? { plateNumber: optionalText(record, "plateNumber") } : {}),
    ...(optionalText(record, "conductionNumber") !== undefined ? { conductionNumber: optionalText(record, "conductionNumber") } : {}),
    ...(optionalText(record, "make") !== undefined ? { make: optionalText(record, "make") } : {}),
    ...(optionalText(record, "model") !== undefined ? { model: optionalText(record, "model") } : {}),
    ...(optionalText(record, "year") !== undefined ? { year: optionalText(record, "year") } : {}),
    ...(optionalText(record, "color") !== undefined ? { color: optionalText(record, "color") } : {}),
    ...(optionalNumberValue(record, "mileage") !== undefined ? { mileage: optionalNumberValue(record, "mileage") } : {}),
    ...(optionalText(record, "notes") !== undefined ? { notes: optionalText(record, "notes") } : {}),
    ...(optionalDateText(record, "archivedAt") !== undefined ? { archivedAt: optionalDateText(record, "archivedAt") } : {}),
  };
}

export const vehiclesRepository = createPrismaRepository<VehicleDto>({
  modelName: "vehicle",
  createInput: vehicleInput,
  updateInput: vehicleInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    const includeArchived = filter?.includeArchived === "true";
    return {
      ...(includeArchived ? {} : { archivedAt: null }),
      ...(search
        ? {
            OR: [
              { plateNumber: { contains: search, mode: "insensitive" } },
              { conductionNumber: { contains: search, mode: "insensitive" } },
              { make: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  },
  normalize: normalizeVehicleRecord,
});

function normalizeSearchText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function prepareVehicleInputForPersistence(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const localCustomerId = normalizeSearchText(data.localCustomerId);
  if (!localCustomerId || normalizeSearchText(data.customerId)) return data;
  const client = await getPrismaClient();
  const customer = await (client?.customer as Record<string, any> | undefined)?.findUnique?.({ where: { localId: localCustomerId } });
  return customer?.id ? { ...data, customerId: String(customer.id) } : data;
}

async function findManyVehicles(where: Record<string, unknown>): Promise<RepositoryResult<VehicleDto[]>> {
  const client = await getPrismaClient();
  const delegate = client?.vehicle as Record<string, any> | undefined;
  if (!delegate?.findMany) {
    return {
      success: false,
      error: "Prisma vehicle delegate is unavailable.",
      code: "UNAVAILABLE",
      retryable: true,
    };
  }

  try {
    const records = await delegate.findMany({ where });
    return {
      success: true,
      data: Array.isArray(records) ? records.map((record) => normalizeVehicleRecord(record as Record<string, unknown>)) : [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Vehicle duplicate lookup failed.",
      code: "UNKNOWN",
    };
  }
}

export async function findVehicleDuplicateCandidates(
  data: Record<string, unknown>,
  excludeId?: string,
): Promise<RepositoryResult<VehicleDuplicateSummary>> {
  const plateNumber = normalizeSearchText(data.plateNumber);
  const conductionNumber = normalizeSearchText(data.conductionNumber);
  const customerId = normalizeSearchText(data.customerId);
  const make = normalizeSearchText(data.make);
  const model = normalizeSearchText(data.model);
  const year = normalizeSearchText(data.year);

  const orFilters = [
    ...(plateNumber ? [{ plateNumber: { equals: plateNumber, mode: "insensitive" } }] : []),
    ...(conductionNumber ? [{ conductionNumber: { equals: conductionNumber, mode: "insensitive" } }] : []),
    ...(!plateNumber && customerId && make && model && year
      ? [{ customerId, make: { equals: make, mode: "insensitive" }, model: { equals: model, mode: "insensitive" }, year: { equals: year, mode: "insensitive" } }]
      : []),
  ];
  if (!orFilters.length) return { success: true, data: { duplicatePlateNumber: [], duplicateConductionNumber: [], sameCustomerMakeModelYear: [] } };

  const duplicateResult = await findManyVehicles({
    ...(excludeId ? { id: { not: excludeId } } : {}),
    OR: orFilters,
  });
  if (!duplicateResult.success) return duplicateResult;

  return {
    success: true,
    data: {
      duplicatePlateNumber: duplicateResult.data.filter((vehicle) => plateNumber && (vehicle.plateNumber ?? "").toLowerCase() === plateNumber.toLowerCase()),
      duplicateConductionNumber: duplicateResult.data.filter(
        (vehicle) => conductionNumber && (vehicle.conductionNumber ?? "").toLowerCase() === conductionNumber.toLowerCase(),
      ),
      sameCustomerMakeModelYear: duplicateResult.data.filter(
        (vehicle) =>
          !plateNumber &&
          customerId &&
          vehicle.customerId === customerId &&
          (vehicle.make ?? "").toLowerCase() === make.toLowerCase() &&
          (vehicle.model ?? "").toLowerCase() === model.toLowerCase() &&
          (vehicle.year ?? "").toLowerCase() === year.toLowerCase(),
      ),
    },
  };
}

export function hasVehicleDuplicates(summary: VehicleDuplicateSummary): boolean {
  return summary.duplicatePlateNumber.length > 0 || summary.duplicateConductionNumber.length > 0 || summary.sameCustomerMakeModelYear.length > 0;
}
