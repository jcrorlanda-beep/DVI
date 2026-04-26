import { config } from "../config.js";

export type PrismaClientLike = {
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
  $queryRawUnsafe: <T = unknown>(query: string, ...values: unknown[]) => Promise<T>;
  [key: string]: unknown;
};

type PrismaModuleLike = {
  PrismaClient: new (options?: { datasources?: { db?: { url?: string } } }) => PrismaClientLike;
};

let prismaClient: PrismaClientLike | null = null;
let prismaClientLoadPromise: Promise<PrismaClientLike | null> | null = null;

function resolveDatabaseUrl(): string {
  return (
    process.env.DATABASE_URL?.trim() ||
    config.databaseUrl?.trim() ||
    "postgresql://postgres:postgres@localhost:5432/dvi"
  );
}

function buildClientOptions() {
  return {
    datasources: {
      db: {
        url: resolveDatabaseUrl(),
      },
    },
  };
}

async function loadPrismaClient(): Promise<PrismaClientLike | null> {
  try {
    const mod = (await import("@prisma/client")) as unknown as PrismaModuleLike;
    if (!mod?.PrismaClient) return null;
    return new mod.PrismaClient(buildClientOptions());
  } catch {
    return null;
  }
}

export async function getPrismaClient(): Promise<PrismaClientLike | null> {
  if (prismaClient) return prismaClient;
  if (!prismaClientLoadPromise) {
    prismaClientLoadPromise = loadPrismaClient().then((client) => {
      prismaClient = client;
      return client;
    });
  }
  return prismaClientLoadPromise;
}

export async function checkPrismaDatabaseStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  message?: string;
}> {
  const configured = Boolean(process.env.DATABASE_URL?.trim());
  const client = await getPrismaClient();

  if (!configured) {
    return {
      configured: false,
      connected: false,
      message: "DATABASE_URL is not configured. The backend still runs in optional mode.",
    };
  }

  if (!client) {
    return {
      configured: true,
      connected: false,
      message: "Prisma client is unavailable in this environment.",
    };
  }

  try {
    await client.$queryRawUnsafe("SELECT 1");
    return {
      configured: true,
      connected: true,
      message: "Database connection check passed.",
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      message: error instanceof Error ? error.message : "Database connection check failed.",
    };
  }
}

export async function disconnectPrismaClient() {
  if (!prismaClient) return;
  try {
    await prismaClient.$disconnect();
  } catch {
    // best-effort shutdown
  } finally {
    prismaClient = null;
    prismaClientLoadPromise = null;
  }
}
