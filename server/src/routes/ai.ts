import { protectRoutes } from "../middleware/auth.js";
import { config } from "../config.js";
import { sendJson } from "../response.js";
import type { AiGenerateRequest, AiProxyProvider } from "../contracts/proxy.js";
import type { ApiRoute } from "./types.js";

function normalizeAiRequest(body: unknown): AiGenerateRequest {
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const provider = typeof record.preferredProvider === "string" ? (record.preferredProvider as AiProxyProvider) : "fallback";
  return {
    action: typeof record.action === "string" && record.action.trim() ? record.action.trim() : "general",
    input: typeof record.input === "string" ? record.input : "",
    outputMode: record.outputMode === "Short" || record.outputMode === "Detailed" ? record.outputMode : "Standard",
    preferredProvider: provider,
    model: typeof record.model === "string" ? record.model : undefined,
    sourceModule: typeof record.sourceModule === "string" ? record.sourceModule : undefined,
    contextLabel: typeof record.contextLabel === "string" ? record.contextLabel : undefined,
  };
}

function generateFallbackText(request: AiGenerateRequest) {
  const trimmedInput = request.input.trim();
  const summary = trimmedInput ? trimmedInput.slice(0, 240) : "No input was supplied.";
  return `Backend AI proxy preview for ${request.action}: ${summary}`;
}

const routes: ApiRoute[] = [
  {
    method: "POST",
    pattern: /^\/api\/ai\/generate$/,
    description: "Future secure AI proxy route with provider stubs",
    handler: (_req, res, context) => {
      if (!config.aiProxyEnabled) {
        sendJson(res, 202, {
          success: true,
          data: {
            text: "",
            provider: "fallback",
            usedFallback: true,
            warning: "Backend AI proxy is disabled by AI_PROXY_ENABLED=false. Frontend hybrid AI remains active.",
            receivedAction: "disabled",
            outputMode: "Standard",
          },
          meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
        });
        return;
      }
      const request = normalizeAiRequest(context.body);
      const requestedProvider = request.preferredProvider ?? "fallback";
      const provider: AiProxyProvider = requestedProvider === "ollama" || requestedProvider === "openai" ? "fallback" : "fallback";
      sendJson(res, 202, {
        success: true,
        data: {
          text: generateFallbackText(request),
          provider,
          usedFallback: provider !== requestedProvider || provider === "fallback",
          warning:
            requestedProvider === "openai" || requestedProvider === "ollama"
              ? "Backend AI provider calls are stubbed. Frontend hybrid AI remains active and no API keys are exposed."
              : "Backend AI proxy is in fallback/template mode. Frontend hybrid AI remains active.",
          receivedAction: request.action,
          outputMode: request.outputMode,
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];

export const aiRoutes = protectRoutes(routes, "advisor.tools");
