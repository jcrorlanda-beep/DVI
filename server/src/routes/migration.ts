import { sendJson } from "../response.js";
import type { ApiRoute } from "./types.js";

export const migrationRoutes: ApiRoute[] = [
  {
    method: "POST",
    pattern: /^\/api\/migration\/import-preview$/,
    description: "Future localStorage import preview route",
    handler: (_req, res, context) => {
      const modules =
        context.body && typeof context.body === "object" && Array.isArray((context.body as Record<string, unknown>).modules)
          ? ((context.body as Record<string, unknown>).modules as Array<Record<string, unknown>>)
          : [];
      sendJson(res, 202, {
        success: true,
        data: {
          previewId: `preview_${Date.now()}`,
          modules: modules.map((module) => ({
            moduleKey: String(module.moduleKey ?? "unknown"),
            tableName: String(module.tableName ?? "unknown"),
            recordCount: Array.isArray(module.records) ? module.records.length : 0,
            warnings: ["Preview only. No data was imported."],
          })),
          canCommit: false,
          warnings: ["Import preview is a contract placeholder. Commit is disabled until migration validation is implemented."],
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/migration\/import-commit$/,
    description: "Future localStorage import commit route",
    handler: (_req, res) => {
      sendJson(res, 202, {
        success: true,
        data: {
          committed: false,
          importedCount: 0,
          localToRemoteMap: {},
          warning: "Import commit is disabled. Use preview, validate counts, and confirm mapping before enabling this endpoint.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];
