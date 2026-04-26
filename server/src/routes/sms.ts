import { sendJson } from "../response.js";
import type { ApiRoute } from "./types.js";

export const smsRoutes: ApiRoute[] = [
  {
    method: "POST",
    pattern: /^\/api\/sms\/send$/,
    description: "Future secure SMS proxy route",
    handler: (_req, res, context) => {
      sendJson(res, 202, {
        success: true,
        data: {
          status: "queued",
          providerResponse: "Backend SMS proxy is not enabled yet. Current frontend SMS flow remains active.",
          receivedMessageType:
            context.body && typeof context.body === "object" ? (context.body as Record<string, unknown>).messageType ?? null : null,
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];
