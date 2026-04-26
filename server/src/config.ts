export type ServerConfig = {
  databaseUrl?: string;
  nodeEnv: string;
  port: number;
};

function parsePort(value: string | undefined): number {
  const parsed = Number(value ?? "4100");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 4100;
}

export const config: ServerConfig = {
  databaseUrl: process.env.DATABASE_URL,
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
};
