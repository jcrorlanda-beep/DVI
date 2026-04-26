import { createPrismaRepository } from "./baseRepository.js";

export type GenericRecordDto = Record<string, unknown> & {
  id: string;
};

function normalizeRecord(record: Record<string, unknown>): GenericRecordDto {
  return {
    ...record,
    id: String(record.id),
  };
}

export function createGenericRepository(modelName: string) {
  return createPrismaRepository<GenericRecordDto, Record<string, unknown>, Record<string, unknown>>({
    modelName,
    listFilter: (filter) => {
      const search = typeof filter?.search === "string" ? filter.search.trim() : "";
      const status = typeof filter?.status === "string" ? filter.status.trim() : "";
      const category = typeof filter?.category === "string" ? filter.category.trim() : "";
      const dateFrom = typeof filter?.dateFrom === "string" ? new Date(filter.dateFrom) : null;
      const dateTo = typeof filter?.dateTo === "string" ? new Date(filter.dateTo) : null;
      return {
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
        ...(dateFrom || dateTo
          ? {
              createdAt: {
                ...(dateFrom && !Number.isNaN(dateFrom.getTime()) ? { gte: dateFrom } : {}),
                ...(dateTo && !Number.isNaN(dateTo.getTime()) ? { lte: dateTo } : {}),
              },
            }
          : {}),
        ...(search ? { id: { contains: search, mode: "insensitive" } } : {}),
      };
    },
    normalize: normalizeRecord,
  });
}

export const intakesRepository = createGenericRepository("intake");
export const inspectionsRepository = createGenericRepository("inspection");
export const partsRequestsRepository = createGenericRepository("partsRequest");
export const inventoryItemsRepository = createGenericRepository("inventoryItem");
export const inventoryMovementsRepository = createGenericRepository("inventoryMovement");
export const purchaseOrdersRepository = createGenericRepository("purchaseOrder");
export const suppliersRepository = createGenericRepository("supplier");
export const paymentsRepository = createGenericRepository("payment");
export const expensesRepository = createGenericRepository("expense");
export const documentsRepository = createGenericRepository("documentAttachment");
