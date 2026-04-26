import type { IncomingMessage, ServerResponse } from "node:http";
import { sendError } from "../response.js";

export type BackendRequestUser = {
  id: string;
  username: string;
  role: string;
  permissions: string[];
};

export type AuthContext = {
  user?: BackendRequestUser;
};

export function getRequestUser(_req: IncomingMessage): BackendRequestUser | null {
  // Future auth will verify a session/JWT and attach the user here.
  return null;
}

export function requireAuth(req: IncomingMessage, res: ServerResponse): AuthContext | null {
  const user = getRequestUser(req);
  if (!user) {
    sendError(res, 401, "Authentication is not implemented yet for backend routes.");
    return null;
  }
  return { user };
}

export function requirePermission(req: IncomingMessage, res: ServerResponse, permission: string): AuthContext | null {
  const context = requireAuth(req, res);
  if (!context) return null;
  if (!context.user?.permissions.includes(permission)) {
    sendError(res, 403, `Missing permission: ${permission}`);
    return null;
  }
  return context;
}
