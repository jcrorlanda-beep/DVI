import { releaseRecordsRepository, prepareReleaseRecordInputForPersistence } from "../repositories/index.js";
import { releaseRecordSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";
import type { ApiRoute } from "./types.js";

const routes = createCrudRoutes({
  basePath: "/api/release-records",
  resourceName: "Release record",
  entityKey: "releaseRecord",
  repository: releaseRecordsRepository,
  createSchema: releaseRecordSchema,
  updateSchema: releaseRecordSchema,
  allowedQuery: ["search", "status", "repairOrderId", "qcRecordId"],
});

export const releaseRecordRoutes: ApiRoute[] = routes.map((route) => {
  if (route.method !== "POST" && route.method !== "PATCH") return route;
  return {
    ...route,
    handler: async (req, res, context) => {
      context.body = await prepareReleaseRecordInputForPersistence(context.body as Record<string, unknown>);
      await route.handler(req, res, context);
    },
  };
});
