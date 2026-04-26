import { documentsRepository } from "../repositories/index.js";
import { canCustomerViewDocument, redactDocumentForCustomer } from "../documents/sharing.js";
import { sendError, sendJson, sendUnavailable } from "../response.js";
import type { ApiRoute } from "./types.js";

function queryFromRequest(reqUrl: string | undefined, host: string | undefined) {
  return new URL(reqUrl ?? "/", `http://${host ?? "localhost"}`).searchParams;
}

export const customerPortalDocumentRoutes: ApiRoute[] = [
  {
    method: "GET",
    pattern: /^\/api\/customer-portal\/documents$/,
    description: "List customer-visible document metadata",
    handler: async (req, res) => {
      const query = queryFromRequest(req.url, req.headers.host);
      const customerId = query.get("customerId");
      const vehicleId = query.get("vehicleId");
      const repairOrderId = query.get("repairOrderId");
      const result = await documentsRepository.list({ customerVisible: true });
      if (!result.success) {
        sendUnavailable(res, result.error);
        return;
      }
      const items = result.data
        .filter((document) => canCustomerViewDocument({ audience: "customer", customerId, vehicleId, repairOrderId }, document as Record<string, unknown>))
        .map((document) => redactDocumentForCustomer(document as Record<string, unknown>));
      sendJson(res, 200, {
        success: true,
        data: { items, privacy: "customer-visible-only", source: "prisma-repository" },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/customer-portal\/documents\/(?<id>[^/]+)$/,
    description: "Get one customer-visible document metadata record",
    handler: async (req, res, context) => {
      const query = queryFromRequest(req.url, req.headers.host);
      const result = await documentsRepository.getById(context.params.id);
      if (!result.success) {
        sendUnavailable(res, result.error);
        return;
      }
      if (!result.data) {
        sendError(res, 404, "Customer document was not found.");
        return;
      }
      const allowed = canCustomerViewDocument(
        {
          audience: "customer",
          customerId: query.get("customerId"),
          vehicleId: query.get("vehicleId"),
          repairOrderId: query.get("repairOrderId"),
        },
        result.data as Record<string, unknown>,
      );
      if (!allowed) {
        sendError(res, 404, "Customer document was not found.");
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: { document: redactDocumentForCustomer(result.data as Record<string, unknown>), privacy: "customer-visible-only" },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];
