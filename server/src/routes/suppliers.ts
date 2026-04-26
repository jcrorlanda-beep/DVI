import { getRequestUser } from "../middleware/auth.js";
import { protectRoutes } from "../middleware/auth.js";
import { partsRequestsRepository, suppliersRepository } from "../repositories/index.js";
import { sendJson } from "../response.js";
import { canManageSupplierBid, getVisibleSupplierBids } from "../suppliers/privacy.js";
import { supplierSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";
import type { ApiRoute } from "./types.js";

const supplierContractRoutes: ApiRoute[] = [
  {
    method: "GET",
    pattern: /^\/api\/suppliers\/(?<id>[^/]+)\/requests$/,
    description: "List requests visible to one supplier",
    handler: async (req, res, context) => {
      const user = await getRequestUser(req);
      const result = await partsRequestsRepository.list({ supplierId: context.params.id });
      if (!result.success) {
        sendJson(res, 503, {
          success: false,
          error: result.error,
          meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
        });
        return;
      }

      const items = result.data.map((request) => ({
        ...request,
        bids: getVisibleSupplierBids({ user, audience: "supplier", supplierId: context.params.id }, request.bids),
      }));
      sendJson(res, result.success ? 200 : 503, {
        success: true,
        data: { items, source: "prisma-repository", privacy: "supplier-own-bids-only" },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/supplier-bids$/,
    description: "Submit supplier bid placeholder",
    handler: async (req, res, context) => {
      const user = await getRequestUser(req);
      const bid = context.body && typeof context.body === "object" ? (context.body as Record<string, unknown>) : {};
      sendJson(res, 202, {
        success: true,
        data: {
          accepted: canManageSupplierBid({ user, audience: user ? "internal" : "supplier", supplierId: typeof bid.supplierId === "string" ? bid.supplierId : null }, bid),
          placeholder: true,
          receivedBody: getVisibleSupplierBids({ user, audience: user ? "internal" : "supplier", supplierId: typeof bid.supplierId === "string" ? bid.supplierId : null }, [bid])[0] ?? null,
          warning: "Supplier bid persistence is contract-only until supplier bid storage is modeled.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "PATCH",
    pattern: /^\/api\/supplier-bids\/(?<id>[^/]+)$/,
    description: "Update supplier bid placeholder",
    handler: (_req, res, context) => {
      sendJson(res, 202, {
        success: true,
        data: {
          bidId: context.params.id,
          accepted: false,
          placeholder: true,
          warning: "Supplier bid revisions are contract-only until supplier bid storage is modeled.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];

export const supplierRoutes = [
  ...protectRoutes(createCrudRoutes({
  basePath: "/api/suppliers",
  resourceName: "Supplier",
  entityKey: "supplier",
  repository: suppliersRepository,
  createSchema: supplierSchema,
  updateSchema: supplierSchema,
  allowedQuery: ["search", "status", "category", "brand"],
  }), "supplier.manage"),
  ...supplierContractRoutes,
];
