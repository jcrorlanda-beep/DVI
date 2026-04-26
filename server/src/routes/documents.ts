import { documentsRepository } from "../repositories/index.js";
import { documentAttachmentSchema } from "../validation/index.js";
import { createCrudRoutes } from "./crudRoute.js";

export const documentRoutes = createCrudRoutes({
  basePath: "/api/documents",
  resourceName: "Document metadata",
  entityKey: "document",
  repository: documentsRepository,
  createSchema: documentAttachmentSchema,
  updateSchema: documentAttachmentSchema,
  allowedQuery: ["search", "sourceModule", "linkedEntityId", "customerVisible"],
  allowDelete: true,
});
