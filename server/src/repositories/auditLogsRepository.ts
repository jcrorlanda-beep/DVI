import { createPrismaRepository } from "./baseRepository.js";

export type AuditLogFilter = {
  module?: string;
  userId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type AuditLogRecordDto = {
  id: string;
  localId?: string | null;
  userId?: string | null;
  userName?: string | null;
  role?: string | null;
  action: string;
  module?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  details?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
};

function toDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export const auditLogsRepository = createPrismaRepository<AuditLogRecordDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "auditLog",
  listFilter: (filter) => {
    const typed = filter as AuditLogFilter | undefined;
    if (!typed) return {};

    const where: Record<string, unknown> = {};
    if (typed.module) where.module = typed.module;
    if (typed.userId) where.userId = typed.userId;
    if (typed.action) where.action = typed.action;
    if (typed.dateFrom || typed.dateTo) {
      where.createdAt = {
        ...(typed.dateFrom ? { gte: toDate(typed.dateFrom) } : {}),
        ...(typed.dateTo ? { lte: toDate(typed.dateTo) } : {}),
      };
    }

    return where;
  },
  normalize: (record) => ({
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    userId: typeof record.userId === "string" ? record.userId : null,
    userName: typeof record.userName === "string" ? record.userName : null,
    role: typeof record.role === "string" ? record.role : null,
    action: String(record.action ?? ""),
    module: typeof record.module === "string" ? record.module : null,
    entityType: typeof record.entityType === "string" ? record.entityType : null,
    entityId: typeof record.entityId === "string" ? record.entityId : null,
    details: record.details && typeof record.details === "object" ? (record.details as Record<string, unknown>) : null,
    createdAt: typeof record.createdAt === "string" ? record.createdAt : undefined,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : undefined,
  }),
  createInput: (data) => ({
    ...data,
    details: data.details ?? {},
  }),
  updateInput: (data) => ({
    ...data,
    details: data.details ?? {},
  }),
});
