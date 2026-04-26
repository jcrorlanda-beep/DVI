import { prepareServiceHistoryInputForPersistence, serviceHistoryRepository } from "../repositories/index.js";
import { serviceHistoryRecordSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";
import type { ApiRoute } from "./types.js";

const routes = createCrudRoutes({
  basePath: "/api/service-history",
  resourceName: "Service history record",
  entityKey: "serviceHistoryRecord",
  repository: serviceHistoryRepository,
  createSchema: serviceHistoryRecordSchema,
  updateSchema: serviceHistoryRecordSchema,
  allowedQuery: ["search", "vehicleId", "customerId", "repairOrderId"],
});

export const serviceHistoryRoutes: ApiRoute[] = routes.map((route) => {
  if (route.method !== "POST" && route.method !== "PATCH") return route;
  return {
    ...route,
    handler: async (req, res, context) => {
      context.body = await prepareServiceHistoryInputForPersistence(context.body as Record<string, unknown>);
      await route.handler(req, res, context);
    },
  };
});
