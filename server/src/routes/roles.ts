import { sendJson } from "../response.js";
import type { ApiRoute } from "./types.js";

export const roleRoutes: ApiRoute[] = [
  {
    method: "GET",
    pattern: /^\/api\/roles$/,
    description: "Future backend role list route",
    handler: (_req, res) => {
      sendJson(res, 200, {
        success: true,
        data: {
          items: [],
          placeholder: true,
          message: "Backend role management is not connected yet. Frontend role definitions remain active.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/permissions$/,
    description: "Future backend permission list route",
    handler: (_req, res) => {
      sendJson(res, 200, {
        success: true,
        data: {
          items: [],
          placeholder: true,
          message: "Backend permission catalog is not connected yet.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "PATCH",
    pattern: /^\/api\/roles\/(?<role>[^/]+)\/permissions$/,
    description: "Future backend role permission update route",
    handler: (_req, res, context) => {
      sendJson(res, 202, {
        success: true,
        data: {
          role: context.params.role,
          placeholder: true,
          message: "Backend role permission updates are not implemented yet. Current frontend role settings remain active.",
          receivedBody: context.body ?? null,
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];
