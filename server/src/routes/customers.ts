import { customersRepository } from "../repositories/index.js";
import { customerSchema, customerUpdateSchema } from "../validation/index.js";
import { readQueryParams, validateBody, validateQuery } from "../middleware/validation.js";
import { sendError, sendJson, sendUnavailable, sendValidationError } from "../response.js";
import type { ApiRoute } from "./types.js";

function extractId(params: Record<string, string>) {
  return params.id?.trim() || "";
}

export const customerRoutes: ApiRoute[] = [
  {
    method: "GET",
    pattern: /^\/api\/customers$/,
    description: "List customers",
    handler: async (req, res) => {
      const queryValidation = validateQuery(req, ["search", "includeArchived"]);
      if (!queryValidation.valid) {
        sendValidationError(res, 400, "Customer query failed validation.", queryValidation.issues);
        return;
      }
      const result = await customersRepository.list(readQueryParams(req));
      if (!result.success) {
        sendUnavailable(res, result.error);
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: {
          items: result.data,
          placeholder: false,
          source: "prisma-repository",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/customers\/(?<id>[^/]+)$/,
    description: "Get customer by id",
    handler: async (_req, res, context) => {
      const id = extractId(context.params);
      const result = await customersRepository.getById(id);
      if (!result.success) {
        sendError(res, 503, result.error);
        return;
      }
      if (!result.data) {
        sendError(res, 404, `Customer ${id} was not found.`);
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: {
          customer: result.data,
          source: "prisma-repository",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/customers$/,
    description: "Create customer",
    handler: async (_req, res, context) => {
      const validation = validateBody(customerSchema, context.body);
      if (!validation.valid) {
        sendValidationError(res, 400, "Customer payload failed validation.", validation.issues);
        return;
      }

      const result = await customersRepository.create(context.body as Record<string, unknown>);
      if (!result.success) {
        sendError(res, 503, result.error);
        return;
      }
      sendJson(res, 201, {
        success: true,
        data: {
          customer: result.data,
          source: "prisma-repository",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "PATCH",
    pattern: /^\/api\/customers\/(?<id>[^/]+)$/,
    description: "Update customer",
    handler: async (_req, res, context) => {
      const id = extractId(context.params);
      const validation = validateBody(customerUpdateSchema, context.body);
      if (!validation.valid) {
        sendValidationError(res, 400, "Customer payload failed validation.", validation.issues);
        return;
      }

      const result = await customersRepository.update(id, context.body as Record<string, unknown>);
      if (!result.success) {
        sendError(res, 503, result.error);
        return;
      }

      sendJson(res, 200, {
        success: true,
        data: {
          customer: result.data,
          source: "prisma-repository",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "DELETE",
    pattern: /^\/api\/customers\/(?<id>[^/]+)$/,
    description: "Archive customer",
    handler: async (_req, res, context) => {
      const id = extractId(context.params);
      const result = await customersRepository.update(id, { archivedAt: new Date().toISOString() } as Record<string, unknown>);
      if (!result.success) {
        sendUnavailable(res, result.error);
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: {
          customer: result.data,
          archived: true,
          source: "prisma-repository",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];
