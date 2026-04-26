import { protectRoutes } from "../middleware/auth.js";
import { getPrismaClient } from "../db/prisma.js";
import { buildInventoryMovementInput, inventoryItemsRepository, inventoryMovementsRepository } from "../repositories/index.js";
import { sendJson, sendUnavailable, sendValidationError } from "../response.js";
import { inventoryItemSchema, inventoryMovementSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";
import type { ApiRoute } from "./types.js";

function movementDelta(movementType: string, quantity: number): number {
  const lowered = movementType.toLowerCase();
  if (lowered.includes("deduct") || lowered.includes("used") || lowered.includes("lost") || lowered.includes("damaged") || lowered.includes("return")) {
    return -Math.abs(quantity);
  }
  return Math.abs(quantity);
}

const movementRoutes: ApiRoute[] = [
  {
    method: "GET",
    pattern: /^\/api\/inventory\/(?<id>[^/]+)\/movements$/,
    description: "List inventory item movements",
    handler: async (_req, res, context) => {
      const result = await inventoryMovementsRepository.list({ inventoryItemId: context.params.id });
      if (!result.success) {
        sendUnavailable(res, result.error);
        return;
      }
      sendJson(res, 200, {
        success: true,
        data: { items: result.data, source: "prisma-repository" },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/inventory\/(?<id>[^/]+)\/movements$/,
    description: "Record inventory item movement",
    handler: async (_req, res, context) => {
      const validation = inventoryMovementSchema.validate(context.body);
      if (!validation.valid) {
        sendValidationError(res, 400, "Inventory movement payload failed validation.", validation.issues);
        return;
      }

      const body = context.body as Record<string, unknown>;
      const rawQuantity = typeof body.quantity === "number" ? body.quantity : Number(body.quantity ?? 0);
      const quantity = Number.isFinite(rawQuantity) ? Math.trunc(rawQuantity) : 0;
      const movementType = typeof body.movementType === "string" ? body.movementType : "Adjustment";
      const delta = movementDelta(movementType, quantity);
      const client = await getPrismaClient();
      const itemDelegate = client?.inventoryItem as Record<string, any> | undefined;
      const movementDelegate = client?.inventoryMovement as Record<string, any> | undefined;
      if (!itemDelegate || !movementDelegate) {
        sendUnavailable(res, "Prisma inventory delegates are unavailable.");
        return;
      }

      const item = await itemDelegate.findUnique({ where: { id: context.params.id } });
      if (!item) {
        sendValidationError(res, 404, "Inventory item was not found.", [
          { field: "inventoryItemId", message: "Inventory item does not exist.", code: "not_found" },
        ]);
        return;
      }
      const currentStock = typeof item?.quantityOnHand === "number" ? item.quantityOnHand : 0;
      if (currentStock + delta < 0) {
        sendValidationError(res, 409, "Inventory movement would create negative stock.", [
          { field: "quantity", message: "Quantity exceeds stock on hand.", code: "negative_stock" },
        ]);
        return;
      }

      const movement = await movementDelegate.create({ data: buildInventoryMovementInput(body, context.params.id) });
      const updatedItem = await itemDelegate.update({ where: { id: context.params.id }, data: { quantityOnHand: currentStock + delta } });
      sendJson(res, 201, {
        success: true,
        data: { movement, inventoryItem: updatedItem, stockDelta: delta, source: "prisma-repository" },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];

export const inventoryRoutes = protectRoutes([
  ...createCrudRoutes({
    basePath: "/api/inventory",
    resourceName: "Inventory item",
    entityKey: "inventoryItem",
    repository: inventoryItemsRepository,
    createSchema: inventoryItemSchema,
    updateSchema: inventoryItemSchema,
    allowedQuery: ["search", "status", "category", "brand", "supplier"],
  }),
  ...createCrudRoutes({
    basePath: "/api/inventory-movements",
    resourceName: "Inventory movement",
    entityKey: "inventoryMovement",
    repository: inventoryMovementsRepository,
    createSchema: inventoryMovementSchema,
    updateSchema: inventoryMovementSchema,
    allowedQuery: ["search", "movementType", "sourceModule", "linkedEntityId"],
  }),
  ...movementRoutes,
], "inventory.manage");
