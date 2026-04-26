import { createPrismaRepository } from "./baseRepository.js";

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

export const customersRepository = createPrismaRepository<CustomerDto>({
  modelName: "customer",
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
  normalize: (record) => ({
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    customerName: String(record.customerName ?? ""),
    companyName: typeof record.companyName === "string" ? record.companyName : null,
    phone: typeof record.phone === "string" ? record.phone : null,
    email: typeof record.email === "string" ? record.email : null,
    accountType: typeof record.accountType === "string" ? record.accountType : null,
    notes: typeof record.notes === "string" ? record.notes : null,
    archivedAt: typeof record.archivedAt === "string" ? record.archivedAt : null,
    createdAt: typeof record.createdAt === "string" ? record.createdAt : undefined,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : undefined,
  }),
});
