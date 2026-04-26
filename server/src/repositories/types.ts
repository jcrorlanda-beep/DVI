import type { PrismaClientLike } from "../db/prisma.js";

export type RepositoryErrorCode = "UNAVAILABLE" | "NOT_FOUND" | "VALIDATION" | "UNKNOWN";

export type RepositoryResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      code: RepositoryErrorCode;
      retryable?: boolean;
    };

export type BaseRepository<TEntity, TCreateInput = Partial<TEntity>, TUpdateInput = Partial<TEntity>> = {
  list(filter?: Record<string, unknown>): Promise<RepositoryResult<TEntity[]>>;
  getById(id: string): Promise<RepositoryResult<TEntity | null>>;
  create(data: TCreateInput): Promise<RepositoryResult<TEntity>>;
  update(id: string, data: TUpdateInput): Promise<RepositoryResult<TEntity>>;
  remove(id: string): Promise<RepositoryResult<{ id: string }>>;
};

export type PrismaRepositoryConfig<TEntity, TCreateInput, TUpdateInput> = {
  modelName: string;
  normalize: (record: Record<string, unknown>) => TEntity;
  createInput?: (data: TCreateInput) => Record<string, unknown>;
  updateInput?: (data: TUpdateInput) => Record<string, unknown>;
  listFilter?: (filter?: Record<string, unknown>) => Record<string, unknown>;
};

export type PrismaRepositoryContext = {
  client: PrismaClientLike;
  modelName: string;
};
