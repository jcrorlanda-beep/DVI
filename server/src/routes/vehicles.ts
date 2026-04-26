import { vehiclesRepository, findVehicleDuplicateCandidates, hasVehicleDuplicates, prepareVehicleInputForPersistence } from "../repositories/index.js";
import { vehicleSchema, vehicleUpdateSchema } from "../validation/index.js";
import { readQueryParams, validateBody, validateQuery } from "../middleware/validation.js";
import { sendError, sendJson, sendUnavailable, sendValidationError } from "../response.js";
import type { ApiRoute } from "./types.js";

function extractId(params: Record<string, string>) {
  return params.id?.trim() || "";
}

export const vehicleRoutes: ApiRoute[] = [
  {
    method: "GET",
    pattern: /^\/api\/vehicles$/,
    description: "List vehicles",
    handler: async (req, res) => {
      const queryValidation = validateQuery(req, ["search", "includeArchived"]);
      if (!queryValidation.valid) {
        sendValidationError(res, 400, "Vehicle query failed validation.", queryValidation.issues);
        return;
      }
      const result = await vehiclesRepository.list(readQueryParams(req));
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
    pattern: /^\/api\/vehicles\/(?<id>[^/]+)$/,
    description: "Get vehicle by id",
    handler: async (_req, res, context) => {
      const id = extractId(context.params);
      const result = await vehiclesRepository.getById(id);
      if (!result.success) {
        sendError(res, 503, result.error);
        return;
      }
      if (!result.data) {
        sendError(res, 404, `Vehicle ${id} was not found.`);
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: {
          vehicle: result.data,
          source: "prisma-repository",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/vehicles$/,
    description: "Create vehicle",
    handler: async (_req, res, context) => {
      const validation = validateBody(vehicleSchema, context.body);
      if (!validation.valid) {
        sendValidationError(res, 400, "Vehicle payload failed validation.", validation.issues);
        return;
      }

      const body = await prepareVehicleInputForPersistence(context.body as Record<string, unknown>);
      const duplicates = await findVehicleDuplicateCandidates(body);
      if (!duplicates.success) {
        sendUnavailable(res, duplicates.error);
        return;
      }
      if (hasVehicleDuplicates(duplicates.data)) {
        sendJson(res, 409, {
          success: false,
          error: "Potential duplicate vehicle detected. Review plate, conduction number, or customer vehicle match before creating.",
          meta: { generatedAt: new Date().toISOString(), source: "dvi-server", duplicates: duplicates.data } as any,
        });
        return;
      }

      const result = await vehiclesRepository.create(body);
      if (!result.success) {
        sendError(res, 503, result.error);
        return;
      }
      sendJson(res, 201, {
        success: true,
        data: {
          vehicle: result.data,
          source: "prisma-repository",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "PATCH",
    pattern: /^\/api\/vehicles\/(?<id>[^/]+)$/,
    description: "Update vehicle",
    handler: async (_req, res, context) => {
      const id = extractId(context.params);
      const validation = validateBody(vehicleUpdateSchema, context.body);
      if (!validation.valid) {
        sendValidationError(res, 400, "Vehicle payload failed validation.", validation.issues);
        return;
      }

      const body = await prepareVehicleInputForPersistence(context.body as Record<string, unknown>);
      const duplicates = await findVehicleDuplicateCandidates(body, id);
      if (!duplicates.success) {
        sendUnavailable(res, duplicates.error);
        return;
      }
      if (hasVehicleDuplicates(duplicates.data)) {
        sendJson(res, 409, {
          success: false,
          error: "Potential duplicate vehicle detected. Review plate, conduction number, or customer vehicle match before updating.",
          meta: { generatedAt: new Date().toISOString(), source: "dvi-server", duplicates: duplicates.data } as any,
        });
        return;
      }

      const result = await vehiclesRepository.update(id, body);
      if (!result.success) {
        sendError(res, 503, result.error);
        return;
      }

      sendJson(res, 200, {
        success: true,
        data: {
          vehicle: result.data,
          source: "prisma-repository",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "DELETE",
    pattern: /^\/api\/vehicles\/(?<id>[^/]+)$/,
    description: "Archive vehicle",
    handler: async (_req, res, context) => {
      const id = extractId(context.params);
      const result = await vehiclesRepository.update(id, { archivedAt: new Date().toISOString() } as Record<string, unknown>);
      if (!result.success) {
        sendUnavailable(res, result.error);
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: {
          vehicle: result.data,
          archived: true,
          source: "prisma-repository",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];
