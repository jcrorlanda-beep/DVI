import { backjobRecordsRepository, prepareBackjobRecordInputForPersistence } from "../repositories/index.js";
import { backjobRecordSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";
import type { ApiRoute } from "./types.js";

const routes = createCrudRoutes({
  basePath: "/api/backjob-records",
  resourceName: "Backjob record",
  entityKey: "backjobRecord",
  repository: backjobRecordsRepository,
  createSchema: backjobRecordSchema,
  updateSchema: backjobRecordSchema,
  allowedQuery: ["search", "status", "originalRepairOrderId", "returnRepairOrderId"],
});

export const backjobRecordRoutes: ApiRoute[] = routes.map((route) => {
  if (route.method !== "POST" && route.method !== "PATCH") return route;
  return {
    ...route,
    handler: async (req, res, context) => {
      context.body = await prepareBackjobRecordInputForPersistence(context.body as Record<string, unknown>);
      await route.handler(req, res, context);
    },
  };
});
