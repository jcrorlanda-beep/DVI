import { createPrismaRepository } from "./baseRepository.js";
import { dateToIso, optionalBoolean, optionalJson, optionalText } from "./inputHelpers.js";

export type SupplierDto = {
  id: string;
  localId?: string | null;
  supplierName: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  brandsCarried?: unknown;
  categories?: unknown;
  active: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function supplierInput(data: Record<string, unknown>): Record<string, unknown> {
  return {
    ...(optionalText(data, "localId") !== undefined ? { localId: optionalText(data, "localId") } : {}),
    supplierName: optionalText(data, "supplierName") ?? optionalText(data, "name") ?? "Unnamed supplier",
    ...(optionalText(data, "contactPerson") !== undefined ? { contactPerson: optionalText(data, "contactPerson") } : {}),
    ...(optionalText(data, "phone") !== undefined ? { phone: optionalText(data, "phone") } : {}),
    ...(optionalText(data, "email") !== undefined ? { email: optionalText(data, "email") } : {}),
    ...(optionalText(data, "address") !== undefined ? { address: optionalText(data, "address") } : {}),
    ...(optionalJson(data, "brandsCarried") !== undefined || optionalJson(data, "brands") !== undefined
      ? { brandsCarried: optionalJson(data, "brandsCarried") ?? optionalJson(data, "brands") }
      : {}),
    ...(optionalJson(data, "categories") !== undefined || optionalJson(data, "categoriesSupplied") !== undefined
      ? { categories: optionalJson(data, "categories") ?? optionalJson(data, "categoriesSupplied") }
      : {}),
    ...(optionalBoolean(data, "active") !== undefined ? { active: optionalBoolean(data, "active") } : {}),
    ...(optionalText(data, "notes") !== undefined ? { notes: optionalText(data, "notes") } : {}),
  };
}

export const suppliersRepository = createPrismaRepository<SupplierDto, Record<string, unknown>, Record<string, unknown>>({
  modelName: "supplier",
  createInput: supplierInput,
  updateInput: supplierInput,
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    return search
      ? {
          OR: [
            { supplierName: { contains: search, mode: "insensitive" } },
            { contactPerson: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};
  },
  normalize: (record) => ({
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    supplierName: String(record.supplierName ?? ""),
    contactPerson: typeof record.contactPerson === "string" ? record.contactPerson : null,
    phone: typeof record.phone === "string" ? record.phone : null,
    email: typeof record.email === "string" ? record.email : null,
    address: typeof record.address === "string" ? record.address : null,
    brandsCarried: record.brandsCarried ?? null,
    categories: record.categories ?? null,
    active: record.active !== false,
    notes: typeof record.notes === "string" ? record.notes : null,
    createdAt: dateToIso(record.createdAt) ?? undefined,
    updatedAt: dateToIso(record.updatedAt) ?? undefined,
  }),
});
