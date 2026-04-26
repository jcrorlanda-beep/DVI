import type { BaseRepository } from "../repositories/types.js";
import { readQueryParams, validateBody, validateQuery } from "../middleware/validation.js";
import { sendError, sendJson, sendUnavailable, sendValidationError } from "../response.js";
import type { ValidationSchema } from "../validation/index.js";
import type { ApiRoute } from "./types.js";

type CrudRouteOptions<TEntity> = {
  basePath: string;
  resourceName: string;
  entityKey: string;
  repository: BaseRepository<TEntity, Record<string, unknown>, Record<string, unknown>>;
  createSchema?: ValidationSchema;
  updateSchema?: ValidationSchema;
  allowedQuery?: string[];
  allowDelete?: boolean;
};

function extractId(params: Record<string, string>) {
  return params.id?.trim() || "";
}

export function createCrudRoutes<TEntity>({
  basePath,
  resourceName,
  entityKey,
  repository,
  createSchema,
  updateSchema,
  allowedQuery = ["search", "status", "category"],
  allowDelete = false,
}: CrudRouteOptions<TEntity>): ApiRoute[] {
  const listPattern = new RegExp(`^${basePath}$`);
  const entityPattern = new RegExp(`^${basePath}/(?<id>[^/]+)$`);
  const routes: ApiRoute[] = [
    {
      method: "GET",
      pattern: listPattern,
      description: `List ${resourceName}`,
      handler: async (req, res) => {
        const queryValidation = validateQuery(req, allowedQuery);
        if (!queryValidation.valid) {
          sendValidationError(res, 400, `${resourceName} query failed validation.`, queryValidation.issues);
          return;
        }
        const result = await repository.list(readQueryParams(req));
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
      pattern: entityPattern,
      description: `Get ${resourceName} by id`,
      handler: async (_req, res, context) => {
        const id = extractId(context.params);
        const result = await repository.getById(id);
        if (!result.success) {
          sendUnavailable(res, result.error);
          return;
        }
        if (!result.data) {
          sendError(res, 404, `${resourceName} ${id} was not found.`);
          return;
        }
        sendJson(res, 200, {
          success: true,
          data: { [entityKey]: result.data, source: "prisma-repository" },
          meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
        });
      },
    },
    {
      method: "POST",
      pattern: listPattern,
      description: `Create ${resourceName}`,
      handler: async (_req, res, context) => {
        if (createSchema) {
          const validation = validateBody(createSchema, context.body);
          if (!validation.valid) {
            sendValidationError(res, 400, `${resourceName} payload failed validation.`, validation.issues);
            return;
          }
        }
        const result = await repository.create(context.body as Record<string, unknown>);
        if (!result.success) {
          sendUnavailable(res, result.error);
          return;
        }
        sendJson(res, 201, {
          success: true,
          data: { [entityKey]: result.data, source: "prisma-repository" },
          meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
        });
      },
    },
    {
      method: "PATCH",
      pattern: entityPattern,
      description: `Update ${resourceName}`,
      handler: async (_req, res, context) => {
        if (updateSchema) {
          const validation = validateBody(updateSchema, context.body);
          if (!validation.valid) {
            sendValidationError(res, 400, `${resourceName} payload failed validation.`, validation.issues);
            return;
          }
        }
        const result = await repository.update(extractId(context.params), context.body as Record<string, unknown>);
        if (!result.success) {
          sendUnavailable(res, result.error);
          return;
        }
        sendJson(res, 200, {
          success: true,
          data: { [entityKey]: result.data, source: "prisma-repository" },
          meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
        });
      },
    },
  ];

  if (allowDelete) {
    routes.push({
      method: "DELETE",
      pattern: entityPattern,
      description: `Delete ${resourceName}`,
      handler: async (_req, res, context) => {
        const result = await repository.remove(extractId(context.params));
        if (!result.success) {
          sendUnavailable(res, result.error);
          return;
        }
        sendJson(res, 200, {
          success: true,
          data: { removed: result.data, source: "prisma-repository" },
          meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
        });
      },
    });
  }

  return routes;
}
