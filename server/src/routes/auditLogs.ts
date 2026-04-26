import { auditLogsRepository, type AuditLogFilter } from "../repositories/auditLogsRepository.js";
import { sendError, sendJson, sendValidationError } from "../response.js";
import type { ApiRoute } from "./types.js";

function readQuery(reqUrl: string | undefined, host: string | undefined) {
  const url = new URL(reqUrl ?? "/", `http://${host ?? "localhost"}`);
  return {
    module: url.searchParams.get("module") ?? undefined,
    userId: url.searchParams.get("userId") ?? undefined,
    dateFrom: url.searchParams.get("dateFrom") ?? undefined,
    dateTo: url.searchParams.get("dateTo") ?? undefined,
    action: url.searchParams.get("action") ?? undefined,
  };
}

function isAuditLogPayload(value: unknown): value is { action: string } {
  return Boolean(value) && typeof value === "object" && typeof (value as Record<string, unknown>).action === "string";
}

export const auditLogRoutes: ApiRoute[] = [
  {
    method: "GET",
    pattern: /^\/api\/audit-logs$/,
    description: "Future centralized audit log list route",
    handler: async (req, res) => {
      const filters = readQuery(req.url, req.headers.host) as AuditLogFilter;
      const result = await auditLogsRepository.list(filters);
      if (!result.success) {
        sendError(res, 503, result.error);
        return;
      }

      const items = [...result.data].sort((left, right) => {
        const leftTime = new Date(left.createdAt ?? 0).getTime();
        const rightTime = new Date(right.createdAt ?? 0).getTime();
        return rightTime - leftTime;
      });

      sendJson(res, 200, {
        success: true,
        data: {
          items,
          filters,
          placeholder: false,
          source: "prisma-repository",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/audit-logs$/,
    description: "Future centralized audit log create route",
    handler: async (_req, res, context) => {
      if (!isAuditLogPayload(context.body)) {
        sendValidationError(res, 400, "Audit log payload is missing the required action field.", [
          {
            field: "action",
            message: "Action is required.",
            code: "required_string",
          },
        ]);
        return;
      }

      const result = await auditLogsRepository.create(context.body as Record<string, unknown>);
      if (!result.success) {
        sendError(res, 503, result.error);
        return;
      }

      sendJson(res, 201, {
        success: true,
        data: {
          auditLog: result.data,
          source: "prisma-repository",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];
