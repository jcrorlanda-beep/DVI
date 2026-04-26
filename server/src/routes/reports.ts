import { protectRoutes } from "../middleware/auth.js";
import { expensesRepository, invoicesRepository, paymentsRepository } from "../repositories/index.js";
import { buildManagementProfitReport } from "../reports/managementReports.js";
import { sendJson, sendUnavailable } from "../response.js";
import type { ApiRoute } from "./types.js";

async function readReportInputs(res: Parameters<ApiRoute["handler"]>[1]) {
  const invoices = await invoicesRepository.list();
  const payments = await paymentsRepository.list();
  const expenses = await expensesRepository.list();
  if (!invoices.success) {
    sendUnavailable(res, invoices.error);
    return null;
  }
  if (!payments.success) {
    sendUnavailable(res, payments.error);
    return null;
  }
  if (!expenses.success) {
    sendUnavailable(res, expenses.error);
    return null;
  }
  return { invoices: invoices.data as any[], payments: payments.data as any[], expenses: expenses.data as any[] };
}

const routes: ApiRoute[] = [
  {
    method: "GET",
    pattern: /^\/api\/reports\/profit$/,
    description: "Management profit estimate report",
    handler: async (_req, res) => {
      const inputs = await readReportInputs(res);
      if (!inputs) return;
      sendJson(res, 200, {
        success: true,
        data: buildManagementProfitReport(inputs),
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/reports\/revenue$/,
    description: "Management revenue estimate report",
    handler: async (_req, res) => {
      const inputs = await readReportInputs(res);
      if (!inputs) return;
      sendJson(res, 200, {
        success: true,
        data: {
          reportType: "management-estimate",
          totalRevenue: buildManagementProfitReport(inputs).totalRevenue,
          revenueCategoryBreakdown: buildManagementProfitReport(inputs).revenueCategoryBreakdown,
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/reports\/expenses$/,
    description: "Management expense estimate report",
    handler: async (_req, res) => {
      const inputs = await readReportInputs(res);
      if (!inputs) return;
      sendJson(res, 200, {
        success: true,
        data: {
          reportType: "management-estimate",
          totalExpenses: buildManagementProfitReport(inputs).totalExpenses,
          expenseCategoryBreakdown: buildManagementProfitReport(inputs).expenseCategoryBreakdown,
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];

export const reportRoutes = protectRoutes(routes, "finance.summary");
