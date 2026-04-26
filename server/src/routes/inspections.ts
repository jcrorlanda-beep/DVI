import { inspectionsRepository } from "../repositories/index.js";
import { createCrudRoutes } from "./crudRoute.js";

export const inspectionRoutes = createCrudRoutes({
  basePath: "/api/inspections",
  resourceName: "Inspection",
  entityKey: "inspection",
  repository: inspectionsRepository,
  allowedQuery: ["search", "status"],
});
