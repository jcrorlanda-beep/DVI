import { protectRoutes } from "../middleware/auth.js";
import { deleteStoredFile, getUploadConfig, readStoredFile, storeUploadedFile } from "../files/storage.js";
import { documentsRepository } from "../repositories/index.js";
import { sendError, sendJson, sendValidationError } from "../response.js";
import type { ApiRoute } from "./types.js";

const routes: ApiRoute[] = [
  {
    method: "POST",
    pattern: /^\/api\/files\/upload$/,
    description: "Upload file to backend storage",
    handler: async (_req, res, context) => {
      const body = context.body && typeof context.body === "object" ? (context.body as Record<string, unknown>) : {};
      try {
        const stored = await storeUploadedFile(body);
        const createDocument = body.createDocumentMetadata === true;
        const documentResult = createDocument
          ? await documentsRepository.create({
              fileId: stored.fileId,
              storageKey: stored.storageKey,
              fileName: stored.fileName,
              fileType: stored.mimeType,
              mimeType: stored.mimeType,
              fileSize: stored.fileSize,
              checksum: stored.checksum,
              uploadedAt: stored.uploadedAt,
              customerVisible: false,
              internalOnly: true,
              sourceModule: typeof body.sourceModule === "string" ? body.sourceModule : "Other",
              linkedEntityId: typeof body.linkedEntityId === "string" ? body.linkedEntityId : undefined,
              linkedEntityLabel: typeof body.linkedEntityLabel === "string" ? body.linkedEntityLabel : undefined,
              note: typeof body.note === "string" ? body.note : undefined,
            })
          : null;

        sendJson(res, 201, {
          success: true,
          data: {
            file: stored,
            document: documentResult?.success ? documentResult.data : null,
            metadataWarning: documentResult && !documentResult.success ? documentResult.error : undefined,
            config: getUploadConfig(),
          },
          meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
        });
      } catch (error) {
        sendValidationError(res, 400, error instanceof Error ? error.message : "Upload failed.", [
          { field: "file", message: "File upload payload was rejected.", code: "invalid_upload" },
        ]);
      }
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/files\/(?<id>[^/]+)$/,
    description: "Retrieve stored file bytes",
    handler: async (_req, res, context) => {
      try {
        const file = await readStoredFile(context.params.id);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("X-DVI-Storage-Key", file.storageKey);
        res.setHeader("Content-Length", String(file.fileSize));
        res.end(file.bytes);
      } catch {
        sendError(res, 404, "Stored file was not found.");
      }
    },
  },
  {
    method: "DELETE",
    pattern: /^\/api\/files\/(?<id>[^/]+)$/,
    description: "Delete stored file",
    handler: async (_req, res, context) => {
      try {
        await deleteStoredFile(context.params.id);
        sendJson(res, 200, {
          success: true,
          data: { deleted: true, fileId: context.params.id },
          meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
        });
      } catch {
        sendError(res, 404, "Stored file was not found.");
      }
    },
  },
];

export const fileRoutes = protectRoutes(routes, "documents.manage");
