import { createPrismaRepository } from "./baseRepository.js";
import { getPrismaClient } from "../db/prisma.js";
import { dateToIso, optionalJson, optionalText } from "./inputHelpers.js";

export type BackjobRecordDto = {
  id: string;
  localId?: string | null;
  backjobNumber?: string | null;
  originalRepairOrderId?: string | null;
  returnRepairOrderId?: string | null;
  customerName?: string | null;
  plateNumber?: string | null;
  status?: string | null;
  findings?: unknown;
  fixesPerformed?: unknown;
  rootCauseCategory?: string | null;
  rootCause?: unknown;
  costType?: string | null;
  technicianNotes?: string | null;
  customerExplanation?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function backjobInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    ...(optionalText(data, "backjobNumber") !== undefined ? { backjobNumber: optionalText(data, "backjobNumber") } : {}),
    ...(optionalText(data, "originalRepairOrderId") !== undefined ? { originalRepairOrderId: optionalText(data, "originalRepairOrderId") } : {}),
    ...(optionalText(data, "returnRepairOrderId") !== undefined ? { returnRepairOrderId: optionalText(data, "returnRepairOrderId") } : {}),
    ...(optionalText(data, "customerName") !== undefined ? { customerName: optionalText(data, "customerName") } : {}),
    ...(optionalText(data, "plateNumber") !== undefined ? { plateNumber: optionalText(data, "plateNumber") } : {}),
    ...(optionalText(data, "status") !== undefined ? { status: optionalText(data, "status") } : {}),
    ...(optionalJson(data, "findings") !== undefined ? { findings: optionalJson(data, "findings") } : {}),
    ...(optionalJson(data, "fixesPerformed") !== undefined ? { fixesPerformed: optionalJson(data, "fixesPerformed") } : {}),
    ...(optionalText(data, "rootCauseCategory") !== undefined ? { rootCauseCategory: optionalText(data, "rootCauseCategory") } : {}),
    ...(optionalJson(data, "rootCause") !== undefined ? { rootCause: optionalJson(data, "rootCause") } : {}),
    ...(optionalText(data, "costType") !== undefined ? { costType: optionalText(data, "costType") } : {}),
    ...(optionalText(data, "technicianNotes") !== undefined ? { technicianNotes: optionalText(data, "technicianNotes") } : {}),
    ...(optionalText(data, "customerExplanation") !== undefined ? { customerExplanation: optionalText(data, "customerExplanation") } : {}),
  };
}

function normalize(record: Record<string, unknown>): BackjobRecordDto {
  return {
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    backjobNumber: typeof record.backjobNumber === "string" ? record.backjobNumber : null,
    originalRepairOrderId: typeof record.originalRepairOrderId === "string" ? record.originalRepairOrderId : null,
    returnRepairOrderId: typeof record.returnRepairOrderId === "string" ? record.returnRepairOrderId : null,
    customerName: typeof record.customerName === "string" ? record.customerName : null,
    plateNumber: typeof record.plateNumber === "string" ? record.plateNumber : null,
    status: typeof record.status === "string" ? record.status : null,
    findings: record.findings ?? null,
    fixesPerformed: record.fixesPerformed ?? null,
    rootCauseCategory: typeof record.rootCauseCategory === "string" ? record.rootCauseCategory : null,
    rootCause: record.rootCause ?? null,
    costType: typeof record.costType === "string" ? record.costType : null,
    technicianNotes: typeof record.technicianNotes === "string" ? record.technicianNotes : null,
    customerExplanation: typeof record.customerExplanation === "string" ? record.customerExplanation : null,
    createdAt: dateToIso(record.createdAt),
    updatedAt: dateToIso(record.updatedAt),
  };
}

async function resolveRepairOrderId(localIdKey: string, numberKey: string, data: Record<string, unknown>) {
  const client = await getPrismaClient();
  if (!client) return null;
  const localId = optionalText(data, localIdKey);
  const roNumber = optionalText(data, numberKey);
  if (!localId && !roNumber) return null;
  const ro = await (client.repairOrder as Record<string, any> | undefined)?.findFirst?.({
    where: {
      OR: [
        ...(localId ? [{ localId }] : []),
        ...(roNumber ? [{ repairOrderNumber: { equals: roNumber, mode: "insensitive" } }] : []),
      ],
    },
  });
  return ro?.id ? String(ro.id) : null;
}

export async function prepareBackjobRecordInputForPersistence(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const prepared = { ...data };
  if (!optionalText(prepared, "originalRepairOrderId")) {
    const id = await resolveRepairOrderId("localOriginalRepairOrderId", "originalRepairOrderNumber", prepared);
    if (id) prepared.originalRepairOrderId = id;
  }
  if (!optionalText(prepared, "returnRepairOrderId")) {
    const id = await resolveRepairOrderId("localReturnRepairOrderId", "returnRepairOrderNumber", prepared);
    if (id) prepared.returnRepairOrderId = id;
  }
  return prepared;
}

export const backjobRecordsRepository = createPrismaRepository<BackjobRecordDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "backjobRecord",
  createInput: backjobInput,
  updateInput: backjobInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    const status = typeof filter?.status === "string" ? filter.status.trim() : "";
    return {
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ backjobNumber: { contains: search, mode: "insensitive" } }, { customerName: { contains: search, mode: "insensitive" } }, { plateNumber: { contains: search, mode: "insensitive" } }] } : {}),
    };
  },
  normalize,
});
