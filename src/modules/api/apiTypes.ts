import type {
  AuditLogRecord,
  ExpenseRecord,
  IntakeRecord,
  InspectionRecord,
  PaymentRecord,
  PartsRequestRecord,
  RepairOrderRecord,
  UserAccount,
  VehicleServiceHistoryRecord,
} from "../shared/types";

export type ApiSyncStatus = "Not Synced" | "Pending" | "Synced" | "Failed" | "Conflict";

export type ApiSyncMetadata = {
  localId?: string;
  remoteId?: string;
  lastSyncedAt?: string | null;
  syncStatus?: ApiSyncStatus;
};

export type ApiValidationError = {
  field: string;
  message: string;
};

export type ApiResponseMeta = {
  requestId?: string;
  generatedAt?: string;
  source?: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: ApiResponseMeta;
};

export type ApiFailure = {
  success: false;
  error: string;
  validationErrors?: ApiValidationError[];
  meta?: ApiResponseMeta;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export type PaginationQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type PagedResult<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export type ApiListResponse<T> = ApiResult<PagedResult<T>>;
export type ApiEntityResponse<T> = ApiResult<T>;

export type UserApiRecord = ApiSyncMetadata &
  Pick<UserAccount, "id" | "username" | "fullName" | "role" | "active" | "createdAt"> & {
    updatedAt?: string;
  };

export type CustomerApiRecord = ApiSyncMetadata & {
  id: string;
  customerName: string;
  companyName?: string;
  phone?: string;
  email?: string;
  accountType?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type VehicleApiRecord = ApiSyncMetadata & {
  id: string;
  customerId: string;
  plateNumber?: string;
  conductionNumber?: string;
  make?: string;
  model?: string;
  year?: string | number;
  color?: string;
  mileage?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type IntakeApiRecord = ApiSyncMetadata & IntakeRecord;
export type InspectionApiRecord = ApiSyncMetadata & InspectionRecord;
export type RepairOrderApiRecord = ApiSyncMetadata & RepairOrderRecord;
export type PartsRequestApiRecord = ApiSyncMetadata & PartsRequestRecord;
export type PaymentApiRecord = ApiSyncMetadata & PaymentRecord;
export type ExpenseApiRecord = ApiSyncMetadata & ExpenseRecord;
export type AuditLogApiRecord = ApiSyncMetadata & AuditLogRecord;
export type VehicleServiceHistoryApiRecord = ApiSyncMetadata & VehicleServiceHistoryRecord;

export type InventoryApiRecord = ApiSyncMetadata & {
  id: string;
  partNumber: string;
  name: string;
  category?: string;
  brand?: string;
  quantity?: number;
  minQuantity?: number;
  costPrice?: number;
  sellPrice?: number;
  supplier?: string;
  active?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PurchaseOrderApiRecord = ApiSyncMetadata & {
  id: string;
  poNumber: string;
  supplierName: string;
  status: string;
  linkedRequestId?: string;
  linkedRoId?: string;
  expectedDelivery?: string;
  totalCost?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DocumentApiRecord = ApiSyncMetadata & {
  id: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  uploadedAt?: string;
  uploadedBy?: string;
  sourceModule?: string;
  linkedEntityId?: string;
  linkedEntityLabel?: string;
  note?: string;
  customerVisible?: boolean;
};

export type AiBackendMode = "Local/Frontend Hybrid" | "Backend Proxy Future";
export type SmsBackendMode = "Frontend configured" | "Backend Proxy Future";
export type BackendDataMode = "Off / LocalStorage" | "Future Backend Enabled";

export type BackendHealthResponse = {
  status: "ok" | "unavailable";
  service?: string;
  mode?: string;
  environment?: string;
  databaseConfigured?: boolean;
  databaseConnected?: boolean;
  databaseMessage?: string;
  productionReadiness?: {
    environment?: string;
    ready?: boolean;
    errorCount?: number;
    warningCount?: number;
  };
  proxyStatus?: {
    aiProxyEnabled?: boolean;
    smsProxyEnabled?: boolean;
  };
  fileStorageConfigured?: boolean;
  maxUploadMb?: number;
  generatedAt?: string;
};

export type LoginRequest = {
  username: string;
  password: string;
  rememberDevice?: boolean;
};

export type SessionUserDto = {
  id: string;
  username: string;
  fullName: string;
  role: string;
  permissions: string[];
  active: boolean;
};

export type LoginResponse = ApiResult<{
  user: SessionUserDto;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}>;

export type RefreshResponse = ApiResult<{
  accessToken: string;
  expiresAt: string;
}>;

export type PermissionDto = {
  key: string;
  label: string;
  description?: string;
  category?: string;
};

export type RoleDto = {
  id: string;
  name: string;
  description?: string;
  permissions: PermissionDto[];
  locked?: boolean;
};

export type RolePermissionUpdateRequest = {
  permissionKeys: string[];
  reason?: string;
};

export type RolePermissionUpdateResponse = ApiResult<{
  role: RoleDto;
  changedPermissionKeys: string[];
}>;

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

export type AiProxyRequest = {
  action: string;
  input: string;
  model?: string;
  outputMode?: "Short" | "Standard" | "Detailed";
  sourceModule?: string;
  contextLabel?: string;
};

export type AiProxyResponse = ApiResult<{
  text: string;
  provider?: "ollama" | "openai" | "fallback";
  usedFallback?: boolean;
  warning?: string;
  errorReason?: string;
}>;

export type SmsProxyRequest = {
  messageType: string;
  to: string;
  body: string;
  roNumber?: string;
  provider?: "Android SMS Gateway" | "Twilio" | "Simulated";
};

export type SmsProxyResponse = ApiResult<{
  status: "queued" | "sent" | "failed" | "retry_pending";
  messageId?: string;
  providerResponse?: string;
  retryAfterAt?: string;
}>;
