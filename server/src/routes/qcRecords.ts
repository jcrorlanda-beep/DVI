import { qcRecordsRepository, prepareQcRecordInputForPersistence } from "../repositories/index.js";
import { qcRecordSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";
import type { ApiRoute } from "./types.js";

const routes = createCrudRoutes({
  basePath: "/api/qc-records",
  resourceName: "QC record",
  entityKey: "qcRecord",
  repository: qcRecordsRepository,
  createSchema: qcRecordSchema,
  updateSchema: qcRecordSchema,
  allowedQuery: ["search", "status", "repairOrderId"],
});

export const qcRecordRoutes: ApiRoute[] = routes.map((route) => {
  if (route.method !== "POST" && route.method !== "PATCH") return route;
  return {
    ...route,
    handler: async (req, res, context) => {
      context.body = await prepareQcRecordInputForPersistence(context.body as Record<string, unknown>);
      await route.handler(req, res, context);
    },
  };
});
