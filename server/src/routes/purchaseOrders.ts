import { protectRoutes } from "../middleware/auth.js";
import { getPrismaClient } from "../db/prisma.js";
import { buildPurchaseOrderInput, purchaseOrdersRepository } from "../repositories/index.js";
import { sendJson, sendUnavailable, sendValidationError } from "../response.js";
import { purchaseOrderSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";
import type { ApiRoute } from "./types.js";

function numeric(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  return 0;
}

function orderedQuantityTotal(items: unknown): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return sum;
    const record = item as Record<string, unknown>;
    return sum + numeric(record.orderedQuantity ?? record.quantity ?? record.qty);
  }, 0);
}

function receivedQuantityTotal(events: unknown): number {
  if (!Array.isArray(events)) return 0;
  return events.reduce((sum, event) => {
    if (!event || typeof event !== "object" || Array.isArray(event)) return sum;
    return sum + numeric((event as Record<string, unknown>).quantity);
  }, 0);
}

const receiveRoutes: ApiRoute[] = [
  {
    method: "POST",
    pattern: /^\/api\/purchase-orders\/(?<id>[^/]+)\/receive$/,
    description: "Record purchase order receiving event",
    handler: async (_req, res, context) => {
      const body = context.body && typeof context.body === "object" ? (context.body as Record<string, unknown>) : {};
      const quantity = typeof body.quantity === "number" ? body.quantity : Number(body.quantity ?? 0);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        sendValidationError(res, 400, "Receiving payload failed validation.", [
          { field: "quantity", message: "Received quantity must be greater than zero.", code: "invalid_quantity" },
        ]);
        return;
      }

      const client = await getPrismaClient();
      const delegate = client?.purchaseOrder as Record<string, any> | undefined;
      if (!delegate) {
        sendUnavailable(res, "Prisma purchaseOrder delegate is unavailable.");
        return;
      }

      const existing = await delegate.findUnique({ where: { id: context.params.id } });
      if (!existing) {
        sendValidationError(res, 404, "Purchase order was not found.", [
          { field: "purchaseOrderId", message: "Purchase order does not exist.", code: "not_found" },
        ]);
        return;
      }

      const receivingEvents = Array.isArray(existing.receivingEvents) ? existing.receivingEvents : [];
      const orderedTotal = orderedQuantityTotal(existing.items);
      const previouslyReceived = receivedQuantityTotal(receivingEvents);
      const allowOverReceive = body.allowOverReceive === true || body.override === true;
      if (orderedTotal > 0 && previouslyReceived + quantity > orderedTotal && !allowOverReceive) {
        sendValidationError(res, 409, "Receiving quantity exceeds ordered quantity.", [
          { field: "quantity", message: "Cannot receive more than ordered without an explicit override.", code: "over_receiving_blocked" },
        ]);
        return;
      }

      const nextReceivedTotal = previouslyReceived + quantity;
      const nextEvent = {
        receivedAt: typeof body.receivedAt === "string" ? body.receivedAt : new Date().toISOString(),
        receivedBy: typeof body.receivedBy === "string" ? body.receivedBy : null,
        quantity,
        note: typeof body.note === "string" ? body.note : null,
        override: allowOverReceive,
      };
      const updated = await delegate.update({
        where: { id: context.params.id },
        data: buildPurchaseOrderInput({
          receivingEvents: [...receivingEvents, nextEvent],
          status: orderedTotal > 0 && nextReceivedTotal >= orderedTotal ? "Received" : "Partially Received",
        }),
      });
      sendJson(res, 202, {
        success: true,
        data: {
          purchaseOrder: updated,
          receivingEvent: nextEvent,
          warning: "Receiving was recorded on the PO only. Inventory stock is not auto-updated by this endpoint.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];

export const purchaseOrderRoutes = protectRoutes([
  ...createCrudRoutes({
  basePath: "/api/purchase-orders",
  resourceName: "Purchase order",
  entityKey: "purchaseOrder",
  repository: purchaseOrdersRepository,
  createSchema: purchaseOrderSchema,
  updateSchema: purchaseOrderSchema,
  allowedQuery: ["search", "status", "supplierId"],
  }),
  ...receiveRoutes,
], "inventory.manage");
