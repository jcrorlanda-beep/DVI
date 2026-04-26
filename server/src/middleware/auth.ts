import type { IncomingMessage, ServerResponse } from "node:http";
import { readBearerSessionToken, verifyAuthSessionToken } from "../auth/sessionService.js";
import { sendError } from "../response.js";
import type { ApiRoute } from "../routes/types.js";

export type BackendRequestUser = {
  id: string;
  username: string;
  role: string;
  permissions: string[];
};

export type AuthContext = {
  user?: BackendRequestUser;
};

export const ADMIN_PERMISSIONS = ["*"];
export const BACKEND_PERMISSIONS = {
  advisorTools: "advisor.tools",
  auditView: "audit.view",
  backupRestore: "backup.restore",
  documentsManage: "documents.manage",
  financeSummary: "finance.summary",
  inventoryManage: "inventory.manage",
  supplierManage: "supplier.manage",
} as const;

function decodeDevSession(token: string): BackendRequestUser | null {
  if (!token.startsWith("dvi-dev-session.")) return null;
  try {
    const encoded = token.slice("dvi-dev-session.".length);
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<BackendRequestUser>;
    if (!parsed.id || !parsed.username || !parsed.role) return null;
    return {
      id: parsed.id,
      username: parsed.username,
      role: parsed.role,
      permissions: Array.isArray(parsed.permissions) ? parsed.permissions.filter((item): item is string => typeof item === "string") : [],
    };
  } catch {
    return null;
  }
}

export function createDevSessionToken(user: BackendRequestUser): string {
  return `dvi-dev-session.${Buffer.from(JSON.stringify(user)).toString("base64url")}`;
}

function getDevRequestUser(req: IncomingMessage): BackendRequestUser | null {
  const authHeader = Array.isArray(req.headers.authorization) ? req.headers.authorization[0] : req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
  const tokenUser = bearerToken ? decodeDevSession(bearerToken) : null;
  if (tokenUser) return tokenUser;

  const userId = Array.isArray(req.headers["x-dvi-user-id"]) ? req.headers["x-dvi-user-id"][0] : req.headers["x-dvi-user-id"];
  const username = Array.isArray(req.headers["x-dvi-username"]) ? req.headers["x-dvi-username"][0] : req.headers["x-dvi-username"];
  const role = Array.isArray(req.headers["x-dvi-role"]) ? req.headers["x-dvi-role"][0] : req.headers["x-dvi-role"];
  if (!userId || !username || !role) return null;

  const permissionHeader = Array.isArray(req.headers["x-dvi-permissions"])
    ? req.headers["x-dvi-permissions"][0]
    : req.headers["x-dvi-permissions"];
  const permissions = typeof permissionHeader === "string" ? permissionHeader.split(",").map((item) => item.trim()).filter(Boolean) : [];
  return { id: userId, username, role, permissions };
}

export async function getRequestUser(req: IncomingMessage): Promise<BackendRequestUser | null> {
  const rawSessionToken = readBearerSessionToken(req);
  if (rawSessionToken) {
    const verified = await verifyAuthSessionToken(rawSessionToken);
    return verified.success ? verified.user : null;
  }
  return getDevRequestUser(req);
}

export function userHasPermission(user: BackendRequestUser, permission: string): boolean {
  return user.role === "Admin" || user.permissions.includes("*") || user.permissions.includes(permission);
}

export async function requireAuth(req: IncomingMessage, res: ServerResponse): Promise<AuthContext | null> {
  const user = await getRequestUser(req);
  if (!user) {
    sendError(res, 401, "Backend authentication is required for this route.");
    return null;
  }
  return { user };
}

export async function requirePermission(req: IncomingMessage, res: ServerResponse, permission: string): Promise<AuthContext | null> {
  const context = await requireAuth(req, res);
  if (!context) return null;
  if (!context.user || !userHasPermission(context.user, permission)) {
    sendError(res, 403, `Missing permission: ${permission}`);
    return null;
  }
  return context;
}

export function protectRoutes(routes: ApiRoute[], permission: string): ApiRoute[] {
  return routes.map((route) => ({
    ...route,
    description: `${route.description} (requires ${permission})`,
    handler: async (req, res, context) => {
      if (!(await requirePermission(req, res, permission))) return;
      await route.handler(req, res, context);
    },
  }));
}
