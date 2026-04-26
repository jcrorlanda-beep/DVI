import { protectRoutes } from "../middleware/auth.js";
import { invoicesRepository } from "../repositories/index.js";
import { invoiceSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";

export const invoiceRoutes = protectRoutes(createCrudRoutes({
  basePath: "/api/invoices",
  resourceName: "Invoice",
  entityKey: "invoice",
  repository: invoicesRepository,
  createSchema: invoiceSchema,
  updateSchema: invoiceSchema,
  allowedQuery: ["search", "status", "dateFrom", "dateTo"],
}), "finance.summary");
