import { createPrismaRepository } from "./baseRepository.js";
import { getPrismaClient } from "../db/prisma.js";

export type InspectionDto = {
  id: string;
  localId?: string | null;
  inspectionNumber?: string | null;
  intakeId?: string | null;
  repairOrderId?: string | null;
  customerId?: string | null;
  vehicleId?: string | null;
  customerName?: string | null;
  plateNumber?: string | null;
  conductionNumber?: string | null;
  status?: string | null;
  findings?: unknown;
  recommendations?: unknown;
  triggeredSections?: unknown;
  tireDetails?: unknown;
  brakeDetails?: unknown;
  underHoodDetails?: unknown;
  evidenceItems?: unknown;
  mediaMetadata?: unknown;
  technicianName?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function optionalText(data: Record<string, unknown>, key: string): string | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalJson(data: Record<string, unknown>, key: string): unknown {
  if (!(key in data)) return undefined;
  if (key === "evidenceItems" && !data[key] && "media" in data) return data.media ?? null;
  return data[key] ?? null;
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

function inspectionInput(data: Record<string, unknown>): Record<string, unknown> {
  const evidenceItems = optionalJson(data, "evidenceItems") ?? optionalJson(data, "media");
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    ...(optionalText(data, "inspectionNumber") !== undefined ? { inspectionNumber: optionalText(data, "inspectionNumber") } : {}),
    ...(optionalText(data, "intakeId") !== undefined ? { intakeId: optionalText(data, "intakeId") } : {}),
    ...(optionalText(data, "repairOrderId") !== undefined ? { repairOrderId: optionalText(data, "repairOrderId") } : {}),
    ...(optionalText(data, "customerId") !== undefined ? { customerId: optionalText(data, "customerId") } : {}),
    ...(optionalText(data, "vehicleId") !== undefined ? { vehicleId: optionalText(data, "vehicleId") } : {}),
    ...(optionalText(data, "customerName") !== undefined ? { customerName: optionalText(data, "customerName") } : {}),
    ...(optionalText(data, "plateNumber") !== undefined ? { plateNumber: optionalText(data, "plateNumber") } : {}),
    ...(optionalText(data, "conductionNumber") !== undefined ? { conductionNumber: optionalText(data, "conductionNumber") } : {}),
    ...(optionalText(data, "status") !== undefined ? { status: optionalText(data, "status") } : {}),
    ...(optionalJson(data, "findings") !== undefined ? { findings: optionalJson(data, "findings") } : {}),
    ...(optionalJson(data, "recommendations") !== undefined ? { recommendations: optionalJson(data, "recommendations") } : {}),
    ...(optionalJson(data, "triggeredSections") !== undefined ? { triggeredSections: optionalJson(data, "triggeredSections") } : {}),
    ...(optionalJson(data, "tireDetails") !== undefined ? { tireDetails: optionalJson(data, "tireDetails") } : {}),
    ...(optionalJson(data, "brakeDetails") !== undefined ? { brakeDetails: optionalJson(data, "brakeDetails") } : {}),
    ...(optionalJson(data, "underHoodDetails") !== undefined ? { underHoodDetails: optionalJson(data, "underHoodDetails") } : {}),
    ...(evidenceItems !== undefined ? { evidenceItems } : {}),
    ...(optionalJson(data, "mediaMetadata") !== undefined ? { mediaMetadata: optionalJson(data, "mediaMetadata") } : {}),
    ...(optionalText(data, "technicianName") !== undefined ? { technicianName: optionalText(data, "technicianName") } : {}),
    ...(optionalDateText(data, "completedAt") !== undefined ? { completedAt: optionalDateText(data, "completedAt") } : {}),
  };
}

export const inspectionsRepository = createPrismaRepository<InspectionDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "inspection",
  createInput: inspectionInput,
  updateInput: inspectionInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    const status = typeof filter?.status === "string" ? filter.status.trim() : "";
    return {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { inspectionNumber: { contains: search, mode: "insensitive" } },
              { customerName: { contains: search, mode: "insensitive" } },
              { plateNumber: { contains: search, mode: "insensitive" } },
              { technicianName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  },
  normalize: (record) => ({
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    inspectionNumber: typeof record.inspectionNumber === "string" ? record.inspectionNumber : null,
    intakeId: typeof record.intakeId === "string" ? record.intakeId : null,
    repairOrderId: typeof record.repairOrderId === "string" ? record.repairOrderId : null,
    customerId: typeof record.customerId === "string" ? record.customerId : null,
    vehicleId: typeof record.vehicleId === "string" ? record.vehicleId : null,
    customerName: typeof record.customerName === "string" ? record.customerName : null,
    plateNumber: typeof record.plateNumber === "string" ? record.plateNumber : null,
    conductionNumber: typeof record.conductionNumber === "string" ? record.conductionNumber : null,
    status: typeof record.status === "string" ? record.status : null,
    findings: record.findings ?? null,
    recommendations: record.recommendations ?? null,
    triggeredSections: record.triggeredSections ?? null,
    tireDetails: record.tireDetails ?? null,
    brakeDetails: record.brakeDetails ?? null,
    underHoodDetails: record.underHoodDetails ?? null,
    evidenceItems: record.evidenceItems ?? null,
    mediaMetadata: record.mediaMetadata ?? null,
    technicianName: typeof record.technicianName === "string" ? record.technicianName : null,
    completedAt: dateToIso(record.completedAt),
    createdAt: dateToIso(record.createdAt) ?? undefined,
    updatedAt: dateToIso(record.updatedAt) ?? undefined,
  }),
});

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function prepareInspectionInputForPersistence(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const client = await getPrismaClient();
  if (!client) return data;
  const prepared: Record<string, unknown> = { ...data };
  const localIntakeId = text(prepared.localIntakeId);
  const localRepairOrderId = text(prepared.localRepairOrderId);
  const localVehicleId = text(prepared.localVehicleId);
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

  if (!text(prepared.repairOrderId) && localRepairOrderId) {
    const ro = await (client.repairOrder as Record<string, any> | undefined)?.findUnique?.({ where: { localId: localRepairOrderId } });
    if (ro?.id) {
      prepared.repairOrderId = String(ro.id);
      if (!text(prepared.customerId) && ro.customerId) prepared.customerId = String(ro.customerId);
      if (!text(prepared.vehicleId) && ro.vehicleId) prepared.vehicleId = String(ro.vehicleId);
    }
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
