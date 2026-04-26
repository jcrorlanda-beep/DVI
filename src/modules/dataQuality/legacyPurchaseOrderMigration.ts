type RecordLike = Record<string, unknown>;

export type PurchaseOrderStatus = "Draft" | "Sent" | "Ordered" | "Partially Received" | "Received" | "Cancelled";

export type PurchaseOrderLiteRecord = {
  id: string;
  poNumber: string;
  status: PurchaseOrderStatus;
  supplier: string;
  requestId: string;
  requestNumber: string;
  roNumber: string;
  itemName: string;
  partNumber: string;
  quantity: number;
  orderedQuantity?: number;
  receivedQuantity?: number;
  receivingEvents?: Array<{ id: string; receivedAt: string; receivedBy: string; quantity: number; note: string }>;
  cost: number;
  expectedDelivery: string;
  createdAt: string;
  updatedAt: string;
};

function numberValue(value: unknown) {
  const parsed = Number(String(value ?? "0").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizePurchaseOrderRecord<T extends RecordLike>(record: T): T & PurchaseOrderLiteRecord {
  return {
    ...record,
    id: String(record.id ?? `po_${Math.random().toString(36).slice(2, 10)}`),
    poNumber: String(record.poNumber ?? "PO-LEGACY"),
    status: String(record.status ?? "Draft") as PurchaseOrderStatus,
    supplier: String(record.supplier ?? ""),
    requestId: String(record.requestId ?? ""),
    requestNumber: String(record.requestNumber ?? ""),
    roNumber: String(record.roNumber ?? ""),
    itemName: String(record.itemName ?? ""),
    partNumber: String(record.partNumber ?? ""),
    quantity: numberValue(record.quantity),
    orderedQuantity: numberValue(record.orderedQuantity ?? record.quantity),
    receivedQuantity: numberValue(record.receivedQuantity ?? 0),
    receivingEvents: Array.isArray(record.receivingEvents) ? record.receivingEvents : [],
    cost: numberValue(record.cost),
    expectedDelivery: String(record.expectedDelivery ?? ""),
    createdAt: String(record.createdAt ?? new Date().toISOString()),
    updatedAt: String(record.updatedAt ?? record.createdAt ?? new Date().toISOString()),
  } as T & PurchaseOrderLiteRecord;
}
