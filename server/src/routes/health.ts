import { config } from "../config.js";
import { checkPrismaDatabaseStatus } from "../db/prisma.js";
import { validateEnvironment } from "../env/validation.js";
import { sendJson } from "../response.js";
import type { ApiRoute } from "./types.js";

export const healthRoutes: ApiRoute[] = [
  {
    method: "GET",
    pattern: /^\/api\/health$/,
    description: "Backend health check",
    handler: async (_req, res) => {
      const dbStatus = await checkPrismaDatabaseStatus();
      const envStatus = validateEnvironment();
      sendJson(res, 200, {
        success: true,
        data: {
          status: "ok",
          service: "dvi-backend",
          mode: "parallel-foundation",
          environment: config.nodeEnv,
          databaseConfigured: dbStatus.configured,
          databaseConnected: dbStatus.connected,
          databaseMessage: dbStatus.message,
          productionReadiness: {
            environment: envStatus.environment,
            ready: envStatus.productionReady,
            errorCount: envStatus.errors.length,
            warningCount: envStatus.warnings.length,
          },
          proxyStatus: {
            aiProxyEnabled: config.aiProxyEnabled,
            smsProxyEnabled: config.smsProxyEnabled,
          },
          fileStorageConfigured: Boolean(config.fileStorageRoot),
          maxUploadMb: config.maxUploadMb,
          generatedAt: new Date().toISOString(),
        },
        meta: {
          generatedAt: new Date().toISOString(),
          source: "dvi-server",
        },
      });
    },
  },
];
