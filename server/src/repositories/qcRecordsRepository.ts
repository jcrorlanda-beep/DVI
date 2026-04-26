import { createPrismaRepository } from "./baseRepository.js";
import { getPrismaClient } from "../db/prisma.js";
import { dateToIso, optionalDateText, optionalJson, optionalText } from "./inputHelpers.js";

export type QcRecordDto = {
  id: string;
  localId?: string | null;
  qcNumber?: string | null;
  repairOrderId?: string | null;
  repairOrderNumber?: string | null;
  status?: string | null;
  result?: string | null;
  checklist?: unknown;
  passFailNotes?: string | null;
  failedReasons?: unknown;
  reQcNotes?: string | null;
  technicianMetadata?: unknown;
  checkedBy?: string | null;
  completedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function qcInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    ...(optionalText(data, "qcNumber") !== undefined ? { qcNumber: optionalText(data, "qcNumber") } : {}),
    ...(optionalText(data, "repairOrderId") !== undefined ? { repairOrderId: optionalText(data, "repairOrderId") } : {}),
    ...(optionalText(data, "repairOrderNumber") !== undefined ? { repairOrderNumber: optionalText(data, "repairOrderNumber") } : {}),
    ...(optionalText(data, "status") !== undefined ? { status: optionalText(data, "status") } : {}),
    ...(optionalText(data, "result") !== undefined ? { result: optionalText(data, "result") } : {}),
    ...(optionalJson(data, "checklist") !== undefined ? { checklist: optionalJson(data, "checklist") } : {}),
    ...(optionalText(data, "passFailNotes") !== undefined ? { passFailNotes: optionalText(data, "passFailNotes") } : {}),
    ...(optionalJson(data, "failedReasons") !== undefined ? { failedReasons: optionalJson(data, "failedReasons") } : {}),
    ...(optionalText(data, "reQcNotes") !== undefined ? { reQcNotes: optionalText(data, "reQcNotes") } : {}),
    ...(optionalJson(data, "technicianMetadata") !== undefined ? { technicianMetadata: optionalJson(data, "technicianMetadata") } : {}),
    ...(optionalText(data, "checkedBy") !== undefined ? { checkedBy: optionalText(data, "checkedBy") } : {}),
    ...(optionalDateText(data, "completedAt") !== undefined ? { completedAt: optionalDateText(data, "completedAt") } : {}),
  };
}

function normalize(record: Record<string, unknown>): QcRecordDto {
  return {
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    qcNumber: typeof record.qcNumber === "string" ? record.qcNumber : null,
    repairOrderId: typeof record.repairOrderId === "string" ? record.repairOrderId : null,
    repairOrderNumber: typeof record.repairOrderNumber === "string" ? record.repairOrderNumber : null,
    status: typeof record.status === "string" ? record.status : null,
    result: typeof record.result === "string" ? record.result : null,
    checklist: record.checklist ?? null,
    passFailNotes: typeof record.passFailNotes === "string" ? record.passFailNotes : null,
    failedReasons: record.failedReasons ?? null,
    reQcNotes: typeof record.reQcNotes === "string" ? record.reQcNotes : null,
    technicianMetadata: record.technicianMetadata ?? null,
    checkedBy: typeof record.checkedBy === "string" ? record.checkedBy : null,
    completedAt: dateToIso(record.completedAt),
    createdAt: dateToIso(record.createdAt),
    updatedAt: dateToIso(record.updatedAt),
  };
}

export async function prepareQcRecordInputForPersistence(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const client = await getPrismaClient();
  if (!client) return data;
  const prepared = { ...data };
  const localRepairOrderId = optionalText(prepared, "localRepairOrderId");
  const repairOrderNumber = optionalText(prepared, "repairOrderNumber");
  if (!optionalText(prepared, "repairOrderId") && (localRepairOrderId || repairOrderNumber)) {
    const repairOrder = await (client.repairOrder as Record<string, any> | undefined)?.findFirst?.({
      where: {
        OR: [
          ...(localRepairOrderId ? [{ localId: localRepairOrderId }] : []),
          ...(repairOrderNumber ? [{ repairOrderNumber: { equals: repairOrderNumber, mode: "insensitive" } }] : []),
        ],
      },
    });
    if (repairOrder?.id) prepared.repairOrderId = String(repairOrder.id);
  }
  return prepared;
}

export const qcRecordsRepository = createPrismaRepository<QcRecordDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "qcRecord",
  createInput: qcInput,
  updateInput: qcInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    const status = typeof filter?.status === "string" ? filter.status.trim() : "";
    return {
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ qcNumber: { contains: search, mode: "insensitive" } }, { repairOrderNumber: { contains: search, mode: "insensitive" } }] } : {}),
    };
  },
  normalize,
});
