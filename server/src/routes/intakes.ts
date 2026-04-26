import { intakesRepository, prepareIntakeInputForPersistence } from "../repositories/index.js";
import { intakeSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";
import type { ApiRoute } from "./types.js";

const routes = createCrudRoutes({
  basePath: "/api/intakes",
  resourceName: "Intake",
  entityKey: "intake",
  repository: intakesRepository,
  createSchema: intakeSchema,
  updateSchema: intakeSchema,
  allowedQuery: ["search", "status"],
});

export const intakeRoutes: ApiRoute[] = routes.map((route) => {
  if (route.method !== "POST" && route.method !== "PATCH") return route;
  return {
    ...route,
    handler: async (req, res, context) => {
      context.body = await prepareIntakeInputForPersistence(context.body as Record<string, unknown>);
      await route.handler(req, res, context);
    },
  };
});
