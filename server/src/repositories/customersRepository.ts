import { createPrismaRepository } from "./baseRepository.js";
import { getPrismaClient } from "../db/prisma.js";
import type { RepositoryResult } from "./types.js";

export type CustomerDto = {
  id: string;
  localId?: string | null;
  customerName: string;
  companyName?: string | null;
  phone?: string | null;
  email?: string | null;
  accountType?: string | null;
  notes?: string | null;
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CustomerDuplicateSummary = {
  sameNamePhone: CustomerDto[];
  sameEmail: CustomerDto[];
  sameCompanyName: CustomerDto[];
};

function optionalText(data: Record<string, unknown>, key: string): string | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalDateText(data: Record<string, unknown>, key: string): string | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function dateToIso(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  return typeof value === "string" ? value : null;
}

function normalizeCustomerRecord(record: Record<string, unknown>): CustomerDto {
  return {
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    customerName: String(record.customerName ?? ""),
    companyName: typeof record.companyName === "string" ? record.companyName : null,
    phone: typeof record.phone === "string" ? record.phone : null,
    email: typeof record.email === "string" ? record.email : null,
    accountType: typeof record.accountType === "string" ? record.accountType : null,
    notes: typeof record.notes === "string" ? record.notes : null,
    archivedAt: dateToIso(record.archivedAt),
    createdAt: dateToIso(record.createdAt) ?? undefined,
    updatedAt: dateToIso(record.updatedAt) ?? undefined,
  };
}

function customerInput(data: Partial<CustomerDto>): Record<string, unknown> {
  const record = data as Record<string, unknown>;
  return {
    ...(optionalText(record, "localId") !== undefined ? { localId: optionalText(record, "localId") } : {}),
    ...(optionalText(record, "customerName") !== undefined ? { customerName: optionalText(record, "customerName") } : {}),
    ...(optionalText(record, "companyName") !== undefined ? { companyName: optionalText(record, "companyName") } : {}),
    ...(optionalText(record, "phone") !== undefined ? { phone: optionalText(record, "phone") } : {}),
    ...(optionalText(record, "email") !== undefined ? { email: optionalText(record, "email") } : {}),
    ...(optionalText(record, "accountType") !== undefined ? { accountType: optionalText(record, "accountType") } : {}),
    ...(optionalText(record, "notes") !== undefined ? { notes: optionalText(record, "notes") } : {}),
    ...(optionalDateText(record, "archivedAt") !== undefined ? { archivedAt: optionalDateText(record, "archivedAt") } : {}),
  };
}

export const customersRepository = createPrismaRepository<CustomerDto>({
  modelName: "customer",
  createInput: customerInput,
  updateInput: customerInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    const includeArchived = filter?.includeArchived === "true";
    return {
      ...(includeArchived ? {} : { archivedAt: null }),
      ...(search
        ? {
            OR: [
              { customerName: { contains: search, mode: "insensitive" } },
              { companyName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  },
  normalize: normalizeCustomerRecord,
});

function normalizeSearchText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

async function findManyCustomers(where: Record<string, unknown>): Promise<RepositoryResult<CustomerDto[]>> {
  const client = await getPrismaClient();
  const delegate = client?.customer as Record<string, any> | undefined;
  if (!delegate?.findMany) {
    return {
      success: false,
      error: "Prisma customer delegate is unavailable.",
      code: "UNAVAILABLE",
      retryable: true,
    };
  }

  try {
    const records = await delegate.findMany({ where });
    return {
      success: true,
      data: Array.isArray(records) ? records.map((record) => normalizeCustomerRecord(record as Record<string, unknown>)) : [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Customer duplicate lookup failed.",
      code: "UNKNOWN",
    };
  }
}

export async function findCustomerDuplicateCandidates(
  data: Record<string, unknown>,
  excludeId?: string,
): Promise<RepositoryResult<CustomerDuplicateSummary>> {
  const customerName = normalizeSearchText(data.customerName);
  const phone = normalizeSearchText(data.phone);
  const email = normalizeSearchText(data.email).toLowerCase();
  const companyName = normalizeSearchText(data.companyName);

  const orFilters = [
    ...(customerName && phone ? [{ customerName: { equals: customerName, mode: "insensitive" }, phone: { equals: phone, mode: "insensitive" } }] : []),
    ...(email ? [{ email: { equals: email, mode: "insensitive" } }] : []),
    ...(companyName ? [{ companyName: { equals: companyName, mode: "insensitive" } }] : []),
  ];
  if (!orFilters.length) {
    return { success: true, data: { sameNamePhone: [], sameEmail: [], sameCompanyName: [] } };
  }

  const duplicateResult = await findManyCustomers({
    ...(excludeId ? { id: { not: excludeId } } : {}),
    OR: orFilters,
  });
  if (!duplicateResult.success) return duplicateResult;

  return {
    success: true,
    data: {
      sameNamePhone: duplicateResult.data.filter(
        (customer) =>
          customerName &&
          phone &&
          customer.customerName.toLowerCase() === customerName.toLowerCase() &&
          (customer.phone ?? "").toLowerCase() === phone.toLowerCase(),
      ),
      sameEmail: duplicateResult.data.filter((customer) => email && (customer.email ?? "").toLowerCase() === email),
      sameCompanyName: duplicateResult.data.filter((customer) => companyName && (customer.companyName ?? "").toLowerCase() === companyName.toLowerCase()),
    },
  };
}

export function hasCustomerDuplicates(summary: CustomerDuplicateSummary): boolean {
  return summary.sameNamePhone.length > 0 || summary.sameEmail.length > 0 || summary.sameCompanyName.length > 0;
}
