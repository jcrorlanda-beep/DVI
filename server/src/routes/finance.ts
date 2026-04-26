import { protectRoutes } from "../middleware/auth.js";
import { invoicesRepository, paymentsRepository } from "../repositories/index.js";
import { buildPaymentAllocationSummary } from "../finance/reconciliation.js";
import { sendJson, sendUnavailable } from "../response.js";
import type { ApiRoute } from "./types.js";

const routes: ApiRoute[] = [
  {
    method: "GET",
    pattern: /^\/api\/finance\/reconciliation$/,
    description: "Preview invoice reconciliation",
    handler: async (_req, res) => {
      const invoices = await invoicesRepository.list();
      const payments = await paymentsRepository.list();
      if (!invoices.success || !payments.success) {
        sendUnavailable(res, !invoices.success ? invoices.error : payments.success ? "Unknown finance error" : payments.error);
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: {
          items: buildPaymentAllocationSummary(invoices.data as any[], payments.data as any[]),
          mode: "preview-only",
          warning: "No payments or invoices were adjusted.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/finance\/reconciliation\/preview$/,
    description: "Preview posted invoice/payment reconciliation",
    handler: (_req, res, context) => {
      const body = context.body && typeof context.body === "object" ? (context.body as Record<string, unknown>) : {};
      const invoices = Array.isArray(body.invoices) ? body.invoices : [];
      const payments = Array.isArray(body.payments) ? body.payments : [];
      sendJson(res, 200, {
        success: true,
        data: {
          items: buildPaymentAllocationSummary(invoices as any[], payments as any[]),
          mode: "preview-only",
          warning: "Preview only. No accounting entries or payment adjustments were created.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];

export const financeRoutes = protectRoutes(routes, "finance.summary");
