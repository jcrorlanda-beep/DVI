import { createPrismaRepository } from "./baseRepository.js";
import { getPrismaClient } from "../db/prisma.js";
import { dateToIso, optionalBoolean, optionalInteger, optionalText } from "./inputHelpers.js";
import { resolveCustomerReference, resolveRepairOrderReference, resolveVehicleReference, text } from "./linkageHelpers.js";
import type { BaseRepository } from "./types.js";

export type DocumentAttachmentDto = {
  id: string;
  localId?: string | null;
  fileId?: string | null;
  fileName: string;
  fileType?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  storageKey?: string | null;
  dataUrlHash?: string | null;
  checksum?: string | null;
  uploadedById?: string | null;
  sourceModule?: string | null;
  linkedEntityId?: string | null;
  linkedEntityLabel?: string | null;
  customerId?: string | null;
  vehicleId?: string | null;
  repairOrderId?: string | null;
  customerVisible: boolean;
  internalOnly: boolean;
  note?: string | null;
  uploadedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function buildDocumentInput(data: Record<string, unknown>) {
  const input: Record<string, unknown> = {};
  for (const key of [
    "localId",
    "fileId",
    "fileName",
    "fileType",
    "mimeType",
    "storageKey",
    "dataUrlHash",
    "checksum",
    "uploadedById",
    "sourceModule",
    "linkedEntityId",
    "linkedEntityLabel",
    "customerId",
    "vehicleId",
    "repairOrderId",
    "note",
  ]) {
    const value = optionalText(data, key);
    if (value !== undefined) input[key] = value;
  }

  const fileSize = optionalInteger(data, "fileSize");
  if (fileSize !== undefined) input.fileSize = fileSize;

  if (!("fileName" in data) && "title" in data) input.fileName = optionalText(data, "title");
  if (!("fileType" in data) && "mimeType" in data) input.fileType = optionalText(data, "mimeType");
  if (!("mimeType" in data) && "fileType" in data) input.mimeType = optionalText(data, "fileType");
  if (!input.fileName) input.fileName = "Untitled document";

  const internalOnly = optionalBoolean(data, "internalOnly");
  const customerVisible = optionalBoolean(data, "customerVisible");
  if (internalOnly === true) input.customerVisible = false;
  else if (customerVisible !== undefined) input.customerVisible = customerVisible;
  if (internalOnly !== undefined) input.internalOnly = internalOnly;
  else if (customerVisible === true) input.internalOnly = false;

  if ("uploadedAt" in data) {
    const uploadedAt = typeof data.uploadedAt === "string" && data.uploadedAt.trim() ? new Date(data.uploadedAt) : null;
    input.uploadedAt = uploadedAt && !Number.isNaN(uploadedAt.getTime()) ? uploadedAt : null;
  }

  return input;
}

async function resolveLinkedEntityId(client: Awaited<ReturnType<typeof getPrismaClient>>, data: Record<string, unknown>) {
  if (!client || text(data.linkedEntityId)) return null;
  const sourceModule = text(data.sourceModule).toLowerCase();
  const localId = text(data.localLinkedEntityId) || text(data.localEntityId);
  if (!localId) return null;

  const modelName =
    sourceModule.includes("inspection")
      ? "inspection"
      : sourceModule.includes("parts")
        ? "partsRequest"
        : sourceModule.includes("release")
          ? "releaseRecord"
          : "";
  if (!modelName) return null;
  const delegate = client[modelName] as Record<string, any> | undefined;
  return delegate?.findUnique ? delegate.findUnique({ where: { localId } }) : null;
}

export async function prepareDocumentInputForPersistence(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const client = await getPrismaClient();
  if (!client) return data;
  const prepared: Record<string, unknown> = { ...data };

  const customer = await resolveCustomerReference(client, prepared);
  if (customer?.id) prepared.customerId = String(customer.id);

  const vehicle = await resolveVehicleReference(client, prepared);
  if (vehicle?.id) prepared.vehicleId = String(vehicle.id);

  const repairOrder = await resolveRepairOrderReference(client, prepared);
  if (repairOrder?.id) prepared.repairOrderId = String(repairOrder.id);

  const linkedEntity = await resolveLinkedEntityId(client, prepared);
  if (linkedEntity?.id) {
    prepared.linkedEntityId = String(linkedEntity.id);
    if (!text(prepared.linkedEntityLabel)) {
      prepared.linkedEntityLabel = String(linkedEntity.inspectionNumber ?? linkedEntity.releaseNumber ?? linkedEntity.requestNumber ?? linkedEntity.id);
    }
  }

  return prepared;
}

const baseDocumentsRepository = createPrismaRepository<DocumentAttachmentDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "documentAttachment",
  listFilter: (filter) => ({
    ...(typeof filter?.sourceModule === "string" && filter.sourceModule ? { sourceModule: filter.sourceModule } : {}),
    ...(typeof filter?.linkedEntityId === "string" && filter.linkedEntityId ? { linkedEntityId: filter.linkedEntityId } : {}),
    ...(typeof filter?.customerVisible === "string"
      ? { customerVisible: filter.customerVisible === "true" }
      : typeof filter?.customerVisible === "boolean"
        ? { customerVisible: filter.customerVisible }
        : {}),
    ...(typeof filter?.search === "string" && filter.search.trim()
      ? { fileName: { contains: filter.search.trim(), mode: "insensitive" } }
      : {}),
  }),
  normalize: (record) => ({
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    fileId: typeof record.fileId === "string" ? record.fileId : null,
    fileName: String(record.fileName ?? "Untitled document"),
    fileType: typeof record.fileType === "string" ? record.fileType : null,
    mimeType: typeof record.mimeType === "string" ? record.mimeType : null,
    fileSize: typeof record.fileSize === "number" ? record.fileSize : null,
    storageKey: typeof record.storageKey === "string" ? record.storageKey : null,
    dataUrlHash: typeof record.dataUrlHash === "string" ? record.dataUrlHash : null,
    checksum: typeof record.checksum === "string" ? record.checksum : null,
    uploadedById: typeof record.uploadedById === "string" ? record.uploadedById : null,
    sourceModule: typeof record.sourceModule === "string" ? record.sourceModule : null,
    linkedEntityId: typeof record.linkedEntityId === "string" ? record.linkedEntityId : null,
    linkedEntityLabel: typeof record.linkedEntityLabel === "string" ? record.linkedEntityLabel : null,
    customerId: typeof record.customerId === "string" ? record.customerId : null,
    vehicleId: typeof record.vehicleId === "string" ? record.vehicleId : null,
    repairOrderId: typeof record.repairOrderId === "string" ? record.repairOrderId : null,
    customerVisible: typeof record.customerVisible === "boolean" ? record.customerVisible : false,
    internalOnly: typeof record.internalOnly === "boolean" ? record.internalOnly : record.customerVisible !== true,
    note: typeof record.note === "string" ? record.note : null,
    uploadedAt: dateToIso(record.uploadedAt),
    createdAt: dateToIso(record.createdAt),
    updatedAt: dateToIso(record.updatedAt),
  }),
  createInput: (data) => ({
    customerVisible: false,
    ...buildDocumentInput(data),
  }),
  updateInput: buildDocumentInput,
});

export const documentsRepository: BaseRepository<DocumentAttachmentDto, Record<string, unknown>, Record<string, unknown>> = {
  ...baseDocumentsRepository,
  async create(data) {
    return baseDocumentsRepository.create(await prepareDocumentInputForPersistence(data));
  },
  async update(id, data) {
    return baseDocumentsRepository.update(id, await prepareDocumentInputForPersistence(data));
  },
};
