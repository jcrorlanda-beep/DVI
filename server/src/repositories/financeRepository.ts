import { createPrismaRepository } from "./baseRepository.js";
import { dateToIso, optionalDateText, optionalNumber, optionalText } from "./inputHelpers.js";

export type InvoiceDto = {
  id: string;
  localId?: string | null;
  invoiceNumber?: string | null;
  repairOrderId?: string | null;
  customerName?: string | null;
  plateNumber?: string | null;
  status?: string | null;
  subtotal?: string | null;
  total: string;
  balance?: string | null;
  issuedAt?: string | null;
  dueAt?: string | null;
  accountingStatus?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function money(data: Record<string, unknown>, key: string): number | string | null | undefined {
  const value = optionalNumber(data, key);
  if (value !== undefined) return value;
  return undefined;
}

function invoiceInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    ...(optionalText(data, "invoiceNumber") !== undefined ? { invoiceNumber: optionalText(data, "invoiceNumber") } : {}),
    ...(optionalText(data, "repairOrderId") !== undefined ? { repairOrderId: optionalText(data, "repairOrderId") } : {}),
    ...(optionalText(data, "customerName") !== undefined ? { customerName: optionalText(data, "customerName") } : {}),
    ...(optionalText(data, "plateNumber") !== undefined ? { plateNumber: optionalText(data, "plateNumber") } : {}),
    ...(optionalText(data, "status") !== undefined ? { status: optionalText(data, "status") } : {}),
    ...(money(data, "subtotal") !== undefined ? { subtotal: money(data, "subtotal") } : {}),
    total: money(data, "total") ?? 0,
    ...(money(data, "balance") !== undefined ? { balance: money(data, "balance") } : {}),
    ...(optionalDateText(data, "issuedAt") !== undefined ? { issuedAt: optionalDateText(data, "issuedAt") } : {}),
    ...(optionalDateText(data, "dueAt") !== undefined ? { dueAt: optionalDateText(data, "dueAt") } : {}),
    ...(optionalText(data, "accountingStatus") !== undefined ? { accountingStatus: optionalText(data, "accountingStatus") } : {}),
  };
}

export const invoicesRepository = createPrismaRepository<InvoiceDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "invoice",
  createInput: invoiceInput,
  updateInput: invoiceInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    const status = typeof filter?.status === "string" ? filter.status.trim() : "";
    return {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { invoiceNumber: { contains: search, mode: "insensitive" } },
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
    invoiceNumber: typeof record.invoiceNumber === "string" ? record.invoiceNumber : null,
    repairOrderId: typeof record.repairOrderId === "string" ? record.repairOrderId : null,
    customerName: typeof record.customerName === "string" ? record.customerName : null,
    plateNumber: typeof record.plateNumber === "string" ? record.plateNumber : null,
    status: typeof record.status === "string" ? record.status : null,
    subtotal: record.subtotal != null ? String(record.subtotal) : null,
    total: String(record.total ?? "0"),
    balance: record.balance != null ? String(record.balance) : null,
    issuedAt: dateToIso(record.issuedAt),
    dueAt: dateToIso(record.dueAt),
    accountingStatus: typeof record.accountingStatus === "string" ? record.accountingStatus : null,
    createdAt: dateToIso(record.createdAt) ?? undefined,
    updatedAt: dateToIso(record.updatedAt) ?? undefined,
  }),
});
