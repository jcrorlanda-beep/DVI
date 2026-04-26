import { purchaseOrdersRepository } from "../repositories/index.js";
import { createCrudRoutes } from "./crudRoute.js";

export const purchaseOrderRoutes = createCrudRoutes({
  basePath: "/api/purchase-orders",
  resourceName: "Purchase order",
  entityKey: "purchaseOrder",
  repository: purchaseOrdersRepository,
  allowedQuery: ["search", "status", "supplierId"],
});
