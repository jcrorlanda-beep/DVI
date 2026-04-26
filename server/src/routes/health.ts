import { config } from "../config.js";
import { checkPrismaDatabaseStatus } from "../db/prisma.js";
import { sendJson } from "../response.js";
import type { ApiRoute } from "./types.js";

export const healthRoutes: ApiRoute[] = [
  {
    method: "GET",
    pattern: /^\/api\/health$/,
    description: "Backend health check",
    handler: async (_req, res) => {
      const dbStatus = await checkPrismaDatabaseStatus();
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
