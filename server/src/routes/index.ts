import { healthRoutes } from "./health.js";
import { aiRoutes } from "./ai.js";
import { auditLogRoutes } from "./auditLogs.js";
import { authRoutes } from "./auth.js";
import { customerRoutes } from "./customers.js";
import { documentRoutes } from "./documents.js";
import { expenseRoutes } from "./expenses.js";
import { inspectionRoutes } from "./inspections.js";
import { intakeRoutes } from "./intakes.js";
import { inventoryRoutes } from "./inventory.js";
import { migrationRoutes } from "./migration.js";
import { partsRequestRoutes } from "./partsRequests.js";
import { paymentRoutes } from "./payments.js";
import { purchaseOrderRoutes } from "./purchaseOrders.js";
import { repairOrderRoutes } from "./repairOrders.js";
import { roleRoutes } from "./roles.js";
import { supplierRoutes } from "./suppliers.js";
import { smsRoutes } from "./sms.js";
import type { ApiRoute } from "./types.js";
import { userRoutes } from "./users.js";
import { vehicleRoutes } from "./vehicles.js";

export const routes: ApiRoute[] = [
  ...healthRoutes,
  ...aiRoutes,
  ...smsRoutes,
  ...migrationRoutes,
  ...authRoutes,
  ...roleRoutes,
  ...userRoutes,
  ...customerRoutes,
  ...vehicleRoutes,
  ...intakeRoutes,
  ...inspectionRoutes,
  ...repairOrderRoutes,
  ...partsRequestRoutes,
  ...inventoryRoutes,
  ...purchaseOrderRoutes,
  ...supplierRoutes,
  ...paymentRoutes,
  ...expenseRoutes,
  ...auditLogRoutes,
  ...documentRoutes,
];
