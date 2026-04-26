import { createPrismaRepository } from "./baseRepository.js";
import { getPrismaClient } from "../db/prisma.js";
import { dateToIso, optionalDateText, optionalNumber, optionalText } from "./inputHelpers.js";
import { resolveInvoiceReference, resolveRepairOrderReference } from "./linkageHelpers.js";
import type { BaseRepository } from "./types.js";

export type PaymentDto = {
  id: string;
  localId?: string | null;
  paymentNumber?: string | null;
  repairOrderId?: string | null;
  invoiceId?: string | null;
  customerName?: string | null;
  plateNumber?: string | null;
  method?: string | null;
  status?: string | null;
  amount: string;
  paidAt?: string | null;
  accountingStatus?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type ExpenseDto = {
  id: string;
  localId?: string | null;
  expenseNumber?: string | null;
  category?: string | null;
  vendorName?: string | null;
  description?: string | null;
  amount: string;
  incurredAt?: string | null;
  status?: string | null;
  accountingStatus?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function paymentInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    ...(optionalText(data, "paymentNumber") !== undefined || optionalText(data, "referenceNumber") !== undefined
      ? { paymentNumber: optionalText(data, "paymentNumber") ?? optionalText(data, "referenceNumber") }
      : {}),
    ...(optionalText(data, "repairOrderId") !== undefined ? { repairOrderId: optionalText(data, "repairOrderId") } : {}),
    ...(optionalText(data, "invoiceId") !== undefined ? { invoiceId: optionalText(data, "invoiceId") } : {}),
    ...(optionalText(data, "customerName") !== undefined ? { customerName: optionalText(data, "customerName") } : {}),
    ...(optionalText(data, "plateNumber") !== undefined ? { plateNumber: optionalText(data, "plateNumber") } : {}),
    ...(optionalText(data, "method") !== undefined || optionalText(data, "paymentMethod") !== undefined
      ? { method: optionalText(data, "method") ?? optionalText(data, "paymentMethod") }
      : {}),
    ...(optionalText(data, "status") !== undefined ? { status: optionalText(data, "status") } : {}),
    amount: optionalNumber(data, "amount") ?? 0,
    ...(optionalDateText(data, "paidAt") !== undefined || optionalDateText(data, "paymentDate") !== undefined
      ? { paidAt: optionalDateText(data, "paidAt") ?? optionalDateText(data, "paymentDate") }
      : {}),
    ...(optionalText(data, "accountingStatus") !== undefined ? { accountingStatus: optionalText(data, "accountingStatus") } : {}),
  };
}

function expenseInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    ...(optionalText(data, "expenseNumber") !== undefined ? { expenseNumber: optionalText(data, "expenseNumber") } : {}),
    ...(optionalText(data, "category") !== undefined ? { category: optionalText(data, "category") } : {}),
    ...(optionalText(data, "vendorName") !== undefined || optionalText(data, "vendor") !== undefined || optionalText(data, "payee") !== undefined
      ? { vendorName: optionalText(data, "vendorName") ?? optionalText(data, "vendor") ?? optionalText(data, "payee") }
      : {}),
    ...(optionalText(data, "description") !== undefined || optionalText(data, "note") !== undefined
      ? { description: optionalText(data, "description") ?? optionalText(data, "note") }
      : {}),
    amount: optionalNumber(data, "amount") ?? 0,
    ...(optionalDateText(data, "incurredAt") !== undefined || optionalDateText(data, "expenseDate") !== undefined || optionalDateText(data, "date") !== undefined
      ? { incurredAt: optionalDateText(data, "incurredAt") ?? optionalDateText(data, "expenseDate") ?? optionalDateText(data, "date") }
      : {}),
    ...(optionalText(data, "status") !== undefined ? { status: optionalText(data, "status") } : {}),
    ...(optionalText(data, "accountingStatus") !== undefined ? { accountingStatus: optionalText(data, "accountingStatus") } : {}),
  };
}

async function preparePaymentInputForPersistence(data: Record<string, unknown>): Promise<Record<string, unknown>> {
  const client = await getPrismaClient();
  if (!client) return data;
  const prepared: Record<string, unknown> = { ...data };

  const repairOrder = await resolveRepairOrderReference(client, prepared);
  if (repairOrder?.id) {
    prepared.repairOrderId = String(repairOrder.id);
    if (!prepared.customerName && typeof repairOrder.customerName === "string") prepared.customerName = repairOrder.customerName;
    if (!prepared.plateNumber && typeof repairOrder.plateNumber === "string") prepared.plateNumber = repairOrder.plateNumber;
  }

  const invoice = await resolveInvoiceReference(client, prepared);
  if (invoice?.id) prepared.invoiceId = String(invoice.id);

  return prepared;
}

function dateRange(field: "paidAt" | "incurredAt", filter?: Record<string, unknown>) {
  const dateFrom = typeof filter?.dateFrom === "string" ? new Date(filter.dateFrom) : null;
  const dateTo = typeof filter?.dateTo === "string" ? new Date(filter.dateTo) : null;
  return dateFrom || dateTo
    ? {
        [field]: {
          ...(dateFrom && !Number.isNaN(dateFrom.getTime()) ? { gte: dateFrom } : {}),
          ...(dateTo && !Number.isNaN(dateTo.getTime()) ? { lte: dateTo } : {}),
        },
      }
    : {};
}

const basePaymentsRepository = createPrismaRepository<PaymentDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "payment",
  createInput: paymentInput,
  updateInput: paymentInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    const status = typeof filter?.status === "string" ? filter.status.trim() : "";
    const method = typeof filter?.method === "string" ? filter.method.trim() : "";
    return {
      ...(status ? { status } : {}),
      ...(method ? { method } : {}),
      ...dateRange("paidAt", filter),
      ...(search
        ? {
            OR: [
              { paymentNumber: { contains: search, mode: "insensitive" } },
              { customerName: { contains: search, mode: "insensitive" } },
              { plateNumber: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  },
  normalize: (record) => ({
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    paymentNumber: typeof record.paymentNumber === "string" ? record.paymentNumber : null,
    repairOrderId: typeof record.repairOrderId === "string" ? record.repairOrderId : null,
    invoiceId: typeof record.invoiceId === "string" ? record.invoiceId : null,
    customerName: typeof record.customerName === "string" ? record.customerName : null,
    plateNumber: typeof record.plateNumber === "string" ? record.plateNumber : null,
    method: typeof record.method === "string" ? record.method : null,
    status: typeof record.status === "string" ? record.status : null,
    amount: String(record.amount ?? "0"),
    paidAt: dateToIso(record.paidAt),
    accountingStatus: typeof record.accountingStatus === "string" ? record.accountingStatus : null,
    createdAt: dateToIso(record.createdAt) ?? undefined,
    updatedAt: dateToIso(record.updatedAt) ?? undefined,
  }),
});

export const paymentsRepository: BaseRepository<PaymentDto, Record<string, unknown>, Record<string, unknown>> = {
  ...basePaymentsRepository,
  async create(data) {
    return basePaymentsRepository.create(await preparePaymentInputForPersistence(data));
  },
  async update(id, data) {
    return basePaymentsRepository.update(id, await preparePaymentInputForPersistence(data));
  },
};

export const expensesRepository = createPrismaRepository<ExpenseDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "expense",
  createInput: expenseInput,
  updateInput: expenseInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    const status = typeof filter?.status === "string" ? filter.status.trim() : "";
    const category = typeof filter?.category === "string" ? filter.category.trim() : "";
    return {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
      ...dateRange("incurredAt", filter),
      ...(search
        ? {
            OR: [
              { expenseNumber: { contains: search, mode: "insensitive" } },
              { vendorName: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  },
  normalize: (record) => ({
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    expenseNumber: typeof record.expenseNumber === "string" ? record.expenseNumber : null,
    category: typeof record.category === "string" ? record.category : null,
    vendorName: typeof record.vendorName === "string" ? record.vendorName : null,
    description: typeof record.description === "string" ? record.description : null,
    amount: String(record.amount ?? "0"),
    incurredAt: dateToIso(record.incurredAt),
    status: typeof record.status === "string" ? record.status : null,
    accountingStatus: typeof record.accountingStatus === "string" ? record.accountingStatus : null,
    createdAt: dateToIso(record.createdAt) ?? undefined,
    updatedAt: dateToIso(record.updatedAt) ?? undefined,
  }),
});
