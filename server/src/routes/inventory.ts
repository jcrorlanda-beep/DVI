import { inventoryItemsRepository, inventoryMovementsRepository } from "../repositories/index.js";
import { inventoryItemSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";

export const inventoryRoutes = [
  ...createCrudRoutes({
    basePath: "/api/inventory",
    resourceName: "Inventory item",
    entityKey: "inventoryItem",
    repository: inventoryItemsRepository,
    createSchema: inventoryItemSchema,
    allowedQuery: ["search", "status", "category", "brand", "supplier"],
  }),
  ...createCrudRoutes({
    basePath: "/api/inventory-movements",
    resourceName: "Inventory movement",
    entityKey: "inventoryMovement",
    repository: inventoryMovementsRepository,
    allowedQuery: ["search", "movementType", "sourceModule", "linkedEntityId"],
  }),
];
