import { partsRequestsRepository } from "../repositories/index.js";
import { partsRequestSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";

export const partsRequestRoutes = createCrudRoutes({
  basePath: "/api/parts-requests",
  resourceName: "Parts request",
  entityKey: "partsRequest",
  repository: partsRequestsRepository,
  createSchema: partsRequestSchema,
  updateSchema: partsRequestSchema,
  allowedQuery: ["search", "status", "category", "urgency"],
});
