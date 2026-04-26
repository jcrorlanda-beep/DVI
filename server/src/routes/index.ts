import { healthRoutes } from "./health.js";
import { aiRoutes } from "./ai.js";
import { auditLogRoutes } from "./auditLogs.js";
import { authRoutes } from "./auth.js";
import { backjobRecordRoutes } from "./backjobRecords.js";
import { customerRoutes } from "./customers.js";
import { documentRoutes } from "./documents.js";
import { expenseRoutes } from "./expenses.js";
import { financeRoutes } from "./finance.js";
import { inspectionRoutes } from "./inspections.js";
import { intakeRoutes } from "./intakes.js";
import { inventoryRoutes } from "./inventory.js";
import { invoiceRoutes } from "./invoices.js";
import { migrationRoutes } from "./migration.js";
import { partsRequestRoutes } from "./partsRequests.js";
import { paymentRoutes } from "./payments.js";
import { purchaseOrderRoutes } from "./purchaseOrders.js";
import { qcRecordRoutes } from "./qcRecords.js";
import { releaseRecordRoutes } from "./releaseRecords.js";
import { repairOrderRoutes } from "./repairOrders.js";
import { repairOrderContractRoutes } from "./repairOrderContracts.js";
import { reportRoutes } from "./reports.js";
import { roleRoutes } from "./roles.js";
import { serviceHistoryRoutes } from "./serviceHistory.js";
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
  ...backjobRecordRoutes,
  ...customerRoutes,
  ...vehicleRoutes,
  ...intakeRoutes,
  ...inspectionRoutes,
  ...repairOrderRoutes,
  ...repairOrderContractRoutes,
  ...partsRequestRoutes,
  ...inventoryRoutes,
  ...invoiceRoutes,
  ...purchaseOrderRoutes,
  ...qcRecordRoutes,
  ...releaseRecordRoutes,
  ...serviceHistoryRoutes,
  ...supplierRoutes,
  ...paymentRoutes,
  ...expenseRoutes,
  ...financeRoutes,
  ...auditLogRoutes,
  ...documentRoutes,
  ...reportRoutes,
];
