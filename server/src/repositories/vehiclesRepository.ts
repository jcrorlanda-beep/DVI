import { createPrismaRepository } from "./baseRepository.js";

export type VehicleDto = {
  id: string;
  localId?: string | null;
  customerId?: string | null;
  plateNumber?: string | null;
  conductionNumber?: string | null;
  make?: string | null;
  model?: string | null;
  year?: string | null;
  color?: string | null;
  mileage?: number | null;
  notes?: string | null;
  archivedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export const vehiclesRepository = createPrismaRepository<VehicleDto>({
  modelName: "vehicle",
  listFilter: (filter) => {
    const search = typeof filter?.search === "string" ? filter.search.trim() : "";
    const includeArchived = filter?.includeArchived === "true";
    return {
      ...(includeArchived ? {} : { archivedAt: null }),
      ...(search
        ? {
            OR: [
              { plateNumber: { contains: search, mode: "insensitive" } },
              { conductionNumber: { contains: search, mode: "insensitive" } },
              { make: { contains: search, mode: "insensitive" } },
              { model: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
  },
  normalize: (record) => ({
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    customerId: typeof record.customerId === "string" ? record.customerId : null,
    plateNumber: typeof record.plateNumber === "string" ? record.plateNumber : null,
    conductionNumber: typeof record.conductionNumber === "string" ? record.conductionNumber : null,
    make: typeof record.make === "string" ? record.make : null,
    model: typeof record.model === "string" ? record.model : null,
    year: typeof record.year === "string" ? record.year : null,
    color: typeof record.color === "string" ? record.color : null,
    mileage: typeof record.mileage === "number" ? record.mileage : null,
    notes: typeof record.notes === "string" ? record.notes : null,
    archivedAt: typeof record.archivedAt === "string" ? record.archivedAt : null,
    createdAt: typeof record.createdAt === "string" ? record.createdAt : undefined,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : undefined,
  }),
});
