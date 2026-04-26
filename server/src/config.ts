export type ServerConfig = {
  aiProxyEnabled: boolean;
  corsOrigin: string;
  databaseUrl?: string;
  fileStorageRoot: string;
  maxUploadMb: number;
  nodeEnv: string;
  openAiModel?: string;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  port: number;
  smsAndroidGatewayUrl?: string;
  smsProvider?: string;
  smsProxyEnabled: boolean;
};

function parsePort(value: string | undefined): number {
  const parsed = Number(value ?? "4100");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 4100;
}

function parsePositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBooleanFlag(value: string | undefined, fallback = false): boolean {
  if (!value) return fallback;
  return ["true", "1", "yes", "enabled"].includes(value.trim().toLowerCase());
}

export const config: ServerConfig = {
  aiProxyEnabled: parseBooleanFlag(process.env.AI_PROXY_ENABLED, false),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  databaseUrl: process.env.DATABASE_URL,
  fileStorageRoot: process.env.FILE_STORAGE_ROOT ?? process.env.UPLOAD_STORAGE_ROOT ?? "server/uploads",
  maxUploadMb: parsePositiveNumber(process.env.MAX_UPLOAD_MB, 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  openAiModel: process.env.OPENAI_MODEL,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL,
  ollamaModel: process.env.OLLAMA_MODEL,
  port: parsePort(process.env.PORT),
  smsAndroidGatewayUrl: process.env.SMS_ANDROID_GATEWAY_URL,
  smsProvider: process.env.SMS_PROVIDER,
  smsProxyEnabled: parseBooleanFlag(process.env.SMS_PROXY_ENABLED, false),
};
