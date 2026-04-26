import { inspectionsRepository, prepareInspectionInputForPersistence } from "../repositories/index.js";
import { inspectionSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";
import type { ApiRoute } from "./types.js";

const routes = createCrudRoutes({
  basePath: "/api/inspections",
  resourceName: "Inspection",
  entityKey: "inspection",
  repository: inspectionsRepository,
  createSchema: inspectionSchema,
  updateSchema: inspectionSchema,
  allowedQuery: ["search", "status"],
});

export const inspectionRoutes: ApiRoute[] = routes.map((route) => {
  if (route.method !== "POST" && route.method !== "PATCH") return route;
  return {
    ...route,
    handler: async (req, res, context) => {
      context.body = await prepareInspectionInputForPersistence(context.body as Record<string, unknown>);
      await route.handler(req, res, context);
    },
  };
});
