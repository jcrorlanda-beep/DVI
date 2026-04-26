import { getPrismaClient } from "../db/prisma.js";
import { sendError, sendJson, sendUnavailable, sendValidationError } from "../response.js";
import type { ApiRoute } from "./types.js";

function text(data: Record<string, unknown>, key: string): string | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function bool(data: Record<string, unknown>, key: string): boolean | undefined {
  if (!(key in data)) return undefined;
  return typeof data[key] === "boolean" ? data[key] : Boolean(data[key]);
}

function numberLike(data: Record<string, unknown>, key: string): number | string | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return value.trim();
  return null;
}

function dateText(data: Record<string, unknown>, key: string): string | null | undefined {
  if (!(key in data)) return undefined;
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function workLineInput(data: Record<string, unknown>) {
  return {
    ...(text(data, "localId") !== undefined ? { localId: text(data, "localId") } : {}),
    ...(text(data, "serviceKey") !== undefined ? { serviceKey: text(data, "serviceKey") } : {}),
    title: text(data, "title") ?? text(data, "serviceTitle") ?? "Untitled service",
    ...(text(data, "category") !== undefined ? { category: text(data, "category") } : {}),
    ...(text(data, "status") !== undefined ? { status: text(data, "status") } : {}),
    ...(text(data, "technicianName") !== undefined ? { technicianName: text(data, "technicianName") } : {}),
    ...(bool(data, "approved") !== undefined ? { approved: bool(data, "approved") } : {}),
    ...(bool(data, "completed") !== undefined ? { completed: bool(data, "completed") } : {}),
    ...(numberLike(data, "quantity") !== undefined ? { quantity: numberLike(data, "quantity") } : {}),
    ...(numberLike(data, "unitPrice") !== undefined ? { unitPrice: numberLike(data, "unitPrice") } : {}),
    ...(dateText(data, "completedAt") !== undefined ? { completedAt: dateText(data, "completedAt") } : {}),
  };
}

function publicWorkLine(record: Record<string, unknown>) {
  return {
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    repairOrderId: String(record.repairOrderId ?? ""),
    serviceKey: typeof record.serviceKey === "string" ? record.serviceKey : null,
    title: String(record.title ?? ""),
    category: typeof record.category === "string" ? record.category : null,
    status: typeof record.status === "string" ? record.status : null,
    technicianName: typeof record.technicianName === "string" ? record.technicianName : null,
    approved: Boolean(record.approved),
    completed: Boolean(record.completed),
    quantity: record.quantity != null ? String(record.quantity) : null,
    unitPrice: record.unitPrice != null ? String(record.unitPrice) : null,
    completedAt: record.completedAt instanceof Date ? record.completedAt.toISOString() : typeof record.completedAt === "string" ? record.completedAt : null,
  };
}

async function getWorkLineDelegate(res: Parameters<ApiRoute["handler"]>[1]) {
  const client = await getPrismaClient();
  const delegate = client?.workLine as Record<string, any> | undefined;
  if (!delegate) {
    sendUnavailable(res, "Prisma workLine delegate is unavailable.");
    return null;
  }
  return delegate;
}

export const repairOrderContractRoutes: ApiRoute[] = [
  {
    method: "GET",
    pattern: /^\/api\/repair-orders\/(?<id>[^/]+)\/work-lines$/,
    description: "List repair order work lines",
    handler: async (_req, res, context) => {
      const delegate = await getWorkLineDelegate(res);
      if (!delegate) return;
      const records = await delegate.findMany({ where: { repairOrderId: context.params.id } });
      sendJson(res, 200, {
        success: true,
        data: { items: Array.isArray(records) ? records.map((record) => publicWorkLine(record)) : [], source: "prisma-repository" },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/repair-orders\/(?<id>[^/]+)\/work-lines$/,
    description: "Add repair order work line",
    handler: async (_req, res, context) => {
      if (!context.body || typeof context.body !== "object") {
        sendValidationError(res, 400, "Work line payload failed validation.", [
          { field: "$root", message: "Work line payload must be an object.", code: "invalid_payload" },
        ]);
        return;
      }
      const delegate = await getWorkLineDelegate(res);
      if (!delegate) return;
      const record = await delegate.create({ data: { ...workLineInput(context.body as Record<string, unknown>), repairOrderId: context.params.id } });
      sendJson(res, 201, {
        success: true,
        data: { workLine: publicWorkLine(record), source: "prisma-repository" },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "PATCH",
    pattern: /^\/api\/repair-orders\/(?<id>[^/]+)\/work-lines\/(?<workLineId>[^/]+)$/,
    description: "Update repair order work line",
    handler: async (_req, res, context) => {
      if (!context.body || typeof context.body !== "object") {
        sendError(res, 400, "Work line payload must be an object.");
        return;
      }
      const delegate = await getWorkLineDelegate(res);
      if (!delegate) return;
      const record = await delegate.update({
        where: { id: context.params.workLineId },
        data: workLineInput(context.body as Record<string, unknown>),
      });
      sendJson(res, 200, {
        success: true,
        data: { workLine: publicWorkLine(record), source: "prisma-repository" },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/repair-orders\/(?<id>[^/]+)\/approvals$/,
    description: "Record repair order approval metadata placeholder",
    handler: (_req, res, context) => {
      sendJson(res, 202, {
        success: true,
        data: {
          repairOrderId: context.params.id,
          accepted: false,
          placeholder: true,
          supportedMethods: ["customer portal", "SMS confirmation", "phone approval", "in-person"],
          warning: "Approval persistence is a backend contract placeholder. Existing frontend approval flow remains localStorage-first.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/approvals$/,
    description: "List approval metadata placeholder",
    handler: (_req, res) => {
      sendJson(res, 200, {
        success: true,
        data: {
          items: [],
          placeholder: true,
          warning: "Approval metadata routes are contract-only until backend approval storage is added.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];
