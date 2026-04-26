import { expensesRepository } from "../repositories/index.js";
import { expenseSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";

export const expenseRoutes = createCrudRoutes({
  basePath: "/api/expenses",
  resourceName: "Expense",
  entityKey: "expense",
  repository: expensesRepository,
  createSchema: expenseSchema,
  updateSchema: expenseSchema,
  allowedQuery: ["search", "status", "category", "dateFrom", "dateTo"],
});
