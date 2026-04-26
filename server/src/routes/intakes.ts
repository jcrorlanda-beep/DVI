import { intakesRepository } from "../repositories/index.js";
import { createCrudRoutes } from "./crudRoute.js";

export const intakeRoutes = createCrudRoutes({
  basePath: "/api/intakes",
  resourceName: "Intake",
  entityKey: "intake",
  repository: intakesRepository,
  allowedQuery: ["search", "status"],
});
