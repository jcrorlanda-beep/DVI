import { sendJson } from "../response.js";
import type { ApiRoute } from "./types.js";

export const aiRoutes: ApiRoute[] = [
  {
    method: "POST",
    pattern: /^\/api\/ai\/generate$/,
    description: "Future secure AI proxy route",
    handler: (_req, res, context) => {
      sendJson(res, 202, {
        success: true,
        data: {
          text: "",
          provider: "fallback",
          usedFallback: true,
          warning: "Backend AI proxy is not enabled yet. Frontend hybrid AI remains active.",
          receivedAction:
            context.body && typeof context.body === "object" ? (context.body as Record<string, unknown>).action ?? null : null,
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];
