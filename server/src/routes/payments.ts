import { paymentsRepository } from "../repositories/index.js";
import { paymentSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";

export const paymentRoutes = createCrudRoutes({
  basePath: "/api/payments",
  resourceName: "Payment",
  entityKey: "payment",
  repository: paymentsRepository,
  createSchema: paymentSchema,
  updateSchema: paymentSchema,
  allowedQuery: ["search", "status", "dateFrom", "dateTo", "method"],
});
