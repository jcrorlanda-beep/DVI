import { protectRoutes } from "../middleware/auth.js";
import { sendJson } from "../response.js";
import type { SmsSendRequest, SmsSendResponse } from "../contracts/proxy.js";
import type { ApiRoute } from "./types.js";

function normalizeSmsRequest(body: unknown): SmsSendRequest {
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  return {
    to: typeof record.to === "string" ? record.to.trim() : "",
    message: typeof record.message === "string" ? record.message : typeof record.body === "string" ? record.body : "",
    templateType: typeof record.templateType === "string" ? record.templateType : typeof record.messageType === "string" ? record.messageType : undefined,
    linkedEntityId: typeof record.linkedEntityId === "string" ? record.linkedEntityId : undefined,
    roNumber: typeof record.roNumber === "string" ? record.roNumber : undefined,
    provider: record.provider === "Android SMS Gateway" || record.provider === "Twilio" ? record.provider : "Simulated",
  };
}

const routes: ApiRoute[] = [
  {
    method: "POST",
    pattern: /^\/api\/sms\/send$/,
    description: "Future secure SMS proxy route with provider stubs",
    handler: (_req, res, context) => {
      const request = normalizeSmsRequest(context.body);
      const queuedAt = new Date().toISOString();
      const response: SmsSendResponse = {
        status: "queued",
        provider: request.provider === "Android SMS Gateway" ? "android-gateway" : "simulated",
        queuedAt,
        providerResponse: "Backend SMS proxy is in simulated queue mode. Current frontend SMS flow remains active.",
      };
      sendJson(res, 202, {
        success: true,
        data: {
          ...response,
          sendLog: {
            id: `sms-preview-${Date.now()}`,
            to: request.to || "missing-recipient",
            templateType: request.templateType,
            linkedEntityId: request.linkedEntityId,
            status: response.status,
            provider: response.provider,
            queuedAt,
          },
          messageLength: request.message?.length ?? 0,
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];

export const smsRoutes = protectRoutes(routes, "advisor.tools");
