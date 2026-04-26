import { createPrismaRepository } from "./baseRepository.js";
import { getPrismaClient } from "../db/prisma.js";
import { dateToIso, optionalDateText, optionalJson, optionalText } from "./inputHelpers.js";

export type ReleaseRecordDto = {
  id: string;
  localId?: string | null;
  releaseNumber?: string | null;
  repairOrderId?: string | null;
  qcRecordId?: string | null;
  repairOrderNumber?: string | null;
  status?: string | null;
  releaseChecklist?: unknown;
  handoverNotes?: string | null;
  customerMessageSummary?: string | null;
  documentLinks?: unknown;
  releasedAt?: string | null;
  releasedBy?: string | null;
  customerConfirmation?: unknown;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function releaseInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    ...(optionalText(data, "releaseNumber") !== undefined ? { releaseNumber: optionalText(data, "releaseNumber") } : {}),
    ...(optionalText(data, "repairOrderId") !== undefined ? { repairOrderId: optionalText(data, "repairOrderId") } : {}),
    ...(optionalText(data, "qcRecordId") !== undefined ? { qcRecordId: optionalText(data, "qcRecordId") } : {}),
    ...(optionalText(data, "repairOrderNumber") !== undefined ? { repairOrderNumber: optionalText(data, "repairOrderNumber") } : {}),
    ...(optionalText(data, "status") !== undefined ? { status: optionalText(data, "status") } : {}),
    ...(optionalJson(data, "releaseChecklist") !== undefined ? { releaseChecklist: optionalJson(data, "releaseChecklist") } : {}),
    ...(optionalText(data, "handoverNotes") !== undefined ? { handoverNotes: optionalText(data, "handoverNotes") } : {}),
    ...(optionalText(data, "customerMessageSummary") !== undefined ? { customerMessageSummary: optionalText(data, "customerMessageSummary") } : {}),
    ...(optionalJson(data, "documentLinks") !== undefined ? { documentLinks: optionalJson(data, "documentLinks") } : {}),
    ...(optionalDateText(data, "releasedAt") !== undefined ? { releasedAt: optionalDateText(data, "releasedAt") } : {}),
    ...(optionalText(data, "releasedBy") !== undefined ? { releasedBy: optionalText(data, "releasedBy") } : {}),
    ...(optionalJson(data, "customerConfirmation") !== undefined ? { customerConfirmation: optionalJson(data, "customerConfirmation") } : {}),
  };
}

function normalize(record: Record<string, unknown>): ReleaseRecordDto {
  return {
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    releaseNumber: typeof record.releaseNumber === "string" ? record.releaseNumber : null,
    repairOrderId: typeof record.repairOrderId === "string" ? record.repairOrderId : null,
    qcRecordId: typeof record.qcRecordId === "string" ? record.qcRecordId : null,
    repairOrderNumber: typeof record.repairOrderNumber === "string" ? record.repairOrderNumber : null,
    status: typeof record.status === "string" ? record.status : null,
    releaseChecklist: record.releaseChecklist ?? null,
    handoverNotes: typeof record.handoverNotes === "string" ? record.handoverNotes : null,
    customerMessageSummary: typeof record.customerMessageSummary === "string" ? record.customerMessageSummary : null,
    documentLinks: record.documentLinks ?? null,
    releasedAt: dateToIso(record.releasedAt),
    releasedBy: typeof record.releasedBy === "string" ? record.releasedBy : null,
    customerConfirmation: record.customerConfirmation ?? null,
    createdAt: dateToIso(record.createdAt),
    updatedAt: dateToIso(record.updatedAt),
  };
}

export async function prepareReleaseRecordInputForPersistence(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const client = await getPrismaClient();
  if (!client) return data;
  const prepared = { ...data };
  const localRepairOrderId = optionalText(prepared, "localRepairOrderId");
  const repairOrderNumber = optionalText(prepared, "repairOrderNumber");
  const localQcRecordId = optionalText(prepared, "localQcRecordId");
  const qcNumber = optionalText(prepared, "qcNumber");

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

  if (!optionalText(prepared, "qcRecordId") && (localQcRecordId || qcNumber)) {
    const qc = await (client.qcRecord as Record<string, any> | undefined)?.findFirst?.({
      where: {
        OR: [
          ...(localQcRecordId ? [{ localId: localQcRecordId }] : []),
          ...(qcNumber ? [{ qcNumber: { equals: qcNumber, mode: "insensitive" } }] : []),
        ],
      },
    });
    if (qc?.id) {
      prepared.qcRecordId = String(qc.id);
      if (!optionalText(prepared, "repairOrderId") && qc.repairOrderId) prepared.repairOrderId = String(qc.repairOrderId);
    }
  }
  return prepared;
}

export const releaseRecordsRepository = createPrismaRepository<ReleaseRecordDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "releaseRecord",
  createInput: releaseInput,
  updateInput: releaseInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    const status = typeof filter?.status === "string" ? filter.status.trim() : "";
    return {
      ...(status ? { status } : {}),
      ...(search ? { OR: [{ releaseNumber: { contains: search, mode: "insensitive" } }, { repairOrderNumber: { contains: search, mode: "insensitive" } }] } : {}),
    };
  },
  normalize,
});
