export type AuditLogDto = {
  id: string;
  userId?: string;
  userName?: string;
  role?: string;
  module?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  createdAt: string;
};

export type CreateAuditLogRequest = {
  userId?: string;
  userName?: string;
  role?: string;
  module?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
};

export type AuditLogFilterQuery = {
  module?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  action?: string;
};
