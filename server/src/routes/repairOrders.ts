import { readQueryParams, validateBody, validateQuery } from "../middleware/validation.js";
import { repairOrdersRepository } from "../repositories/index.js";
import { sendError, sendJson, sendUnavailable, sendValidationError } from "../response.js";
import { repairOrderSchema } from "../validation/index.js";
import type { ApiRoute } from "./types.js";

function extractId(params: Record<string, string>) {
  return params.id?.trim() || "";
}

export const repairOrderRoutes: ApiRoute[] = [
  {
    method: "GET",
    pattern: /^\/api\/repair-orders$/,
    description: "List repair orders",
    handler: async (req, res) => {
      const queryValidation = validateQuery(req, ["search", "status"]);
      if (!queryValidation.valid) {
        sendValidationError(res, 400, "Repair order query failed validation.", queryValidation.issues);
        return;
      }
      const result = await repairOrdersRepository.list(readQueryParams(req));
      if (!result.success) {
        sendUnavailable(res, result.error);
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: { items: result.data, source: "prisma-repository" },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/repair-orders\/(?<id>[^/]+)$/,
    description: "Get repair order by id",
    handler: async (_req, res, context) => {
      const id = extractId(context.params);
      const result = await repairOrdersRepository.getById(id);
      if (!result.success) {
        sendUnavailable(res, result.error);
        return;
      }
      if (!result.data) {
        sendError(res, 404, `Repair order ${id} was not found.`);
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: { repairOrder: result.data, source: "prisma-repository" },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/repair-orders$/,
    description: "Create repair order",
    handler: async (_req, res, context) => {
      const validation = validateBody(repairOrderSchema, context.body);
      if (!validation.valid) {
        sendValidationError(res, 400, "Repair order payload failed validation.", validation.issues);
        return;
      }
      const result = await repairOrdersRepository.create(context.body as Record<string, unknown>);
      if (!result.success) {
        sendUnavailable(res, result.error);
        return;
      }
      sendJson(res, 201, {
        success: true,
        data: { repairOrder: result.data, source: "prisma-repository" },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "PATCH",
    pattern: /^\/api\/repair-orders\/(?<id>[^/]+)$/,
    description: "Update repair order",
    handler: async (_req, res, context) => {
      const validation = validateBody(repairOrderSchema, context.body);
      if (!validation.valid) {
        sendValidationError(res, 400, "Repair order payload failed validation.", validation.issues);
        return;
      }
      const result = await repairOrdersRepository.update(extractId(context.params), context.body as Record<string, unknown>);
      if (!result.success) {
        sendUnavailable(res, result.error);
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: { repairOrder: result.data, source: "prisma-repository" },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];
