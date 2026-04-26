import { sendError } from "../response.js";
import type { ApiRoute } from "./types.js";

export const authRoutes: ApiRoute[] = [
  {
    method: "POST",
    pattern: /^\/api\/auth\/login$/,
    description: "Future backend login route",
    handler: (_req, res) => {
      sendError(res, 501, "Backend authentication is not implemented yet. Frontend demo login remains active.");
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/auth\/logout$/,
    description: "Future backend logout route",
    handler: (_req, res) => {
      sendError(res, 501, "Backend logout is not implemented yet. Frontend session handling remains active.");
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/auth\/me$/,
    description: "Future backend current-session route",
    handler: (_req, res) => {
      sendError(res, 501, "Backend session lookup is not implemented yet. Frontend local session remains active.");
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/auth\/refresh$/,
    description: "Future backend token refresh route",
    handler: (_req, res) => {
      sendError(res, 501, "Backend token refresh is not implemented yet.");
    },
  },
];
