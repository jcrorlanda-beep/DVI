import { getPrismaClient, type PrismaClientLike } from "../db/prisma.js";
import type { BaseRepository, PrismaRepositoryConfig, RepositoryResult } from "./types.js";

function unavailable<T>(message: string): RepositoryResult<T> {
  return {
    success: false,
    error: message,
    code: "UNAVAILABLE",
    retryable: true,
  };
}

function unknownError<T>(error: unknown): RepositoryResult<T> {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Unexpected repository error",
    code: "UNKNOWN",
  };
}

async function withClient<TEntity, TResult>(
  modelName: string,
  handler: (client: PrismaClientLike, delegate: Record<string, any>) => Promise<TResult>,
): Promise<RepositoryResult<TResult>> {
  const client = await getPrismaClient();
  if (!client) {
    return unavailable(`Prisma client is unavailable for ${modelName}.`);
  }

  const delegate = client[modelName] as Record<string, any> | undefined;
  if (!delegate) {
    return unavailable(`Prisma model delegate ${modelName} is unavailable.`);
  }

  try {
    const data = await handler(client, delegate);
    return { success: true, data };
  } catch (error) {
    return unknownError<TResult>(error);
  }
}

export function createPrismaRepository<TEntity, TCreateInput = Partial<TEntity>, TUpdateInput = Partial<TEntity>>(
  config: PrismaRepositoryConfig<TEntity, TCreateInput, TUpdateInput>,
): BaseRepository<TEntity, TCreateInput, TUpdateInput> {
  return {
    async list(filter) {
      return withClient<TEntity[], TEntity[]>(config.modelName, async (_client, delegate) => {
        const where = config.listFilter?.(filter);
        const records = await delegate.findMany(where ? { where } : undefined);
        return Array.isArray(records) ? records.map((record: Record<string, unknown>) => config.normalize(record)) : [];
      });
    },
    async getById(id) {
      return withClient<TEntity | null, TEntity | null>(config.modelName, async (_client, delegate) => {
        const record = await delegate.findUnique({ where: { id } });
        return record ? config.normalize(record as Record<string, unknown>) : null;
      });
    },
    async create(data) {
      return withClient<TEntity, TEntity>(config.modelName, async (_client, delegate) => {
        const record = await delegate.create({ data: config.createInput ? config.createInput(data) : (data as Record<string, unknown>) });
        return config.normalize(record as Record<string, unknown>);
      });
    },
    async update(id, data) {
      return withClient<TEntity, TEntity>(config.modelName, async (_client, delegate) => {
        const record = await delegate.update({
          where: { id },
          data: config.updateInput ? config.updateInput(data) : (data as Record<string, unknown>),
        });
        return config.normalize(record as Record<string, unknown>);
      });
    },
    async remove(id) {
      return withClient<{ id: string }, { id: string }>(config.modelName, async (_client, delegate) => {
        const record = await delegate.delete({ where: { id } });
        return { id: String((record as Record<string, unknown>).id ?? id) };
      });
    },
  };
}
