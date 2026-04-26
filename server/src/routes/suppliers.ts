import { suppliersRepository } from "../repositories/index.js";
import { createCrudRoutes } from "./crudRoute.js";

export const supplierRoutes = createCrudRoutes({
  basePath: "/api/suppliers",
  resourceName: "Supplier",
  entityKey: "supplier",
  repository: suppliersRepository,
  allowedQuery: ["search", "status", "category", "brand"],
});
