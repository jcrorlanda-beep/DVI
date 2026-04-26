import type { ServerResponse } from "node:http";

export type ApiValidationError = {
  field: string;
  message: string;
  code: string;
};

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      meta?: {
        requestId?: string;
        generatedAt?: string;
        source?: string;
      };
    }
  | {
      success: false;
      error: string;
      validationErrors?: ApiValidationError[];
      meta?: {
        requestId?: string;
        generatedAt?: string;
        source?: string;
      };
    };

export function sendJson<T>(res: ServerResponse, statusCode: number, payload: ApiResponse<T>) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload, null, 2));
}

function redactErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error || "Unexpected server error");
  return message
    .replace(/postgresql:\/\/[^\s"']+/gi, "[redacted-database-url]")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, "Bearer [redacted]")
    .replace(/(api[_-]?key|token|password)=([^&\s]+)/gi, "$1=[redacted]");
}

export function logSafeServerError(error: unknown, context: Record<string, unknown> = {}) {
  const safeContext = Object.fromEntries(
    Object.entries(context).filter(([key]) => !/password|token|secret|apiKey|databaseUrl/i.test(key))
  );
  console.error("[dvi-server]", redactErrorMessage(error), safeContext);
}

export function sendError(res: ServerResponse, statusCode: number, error: string) {
  sendJson(res, statusCode, {
    success: false,
    error: redactErrorMessage(error),
    meta: {
      generatedAt: new Date().toISOString(),
      source: "dvi-server",
    },
  });
}

export function sendNotFound(res: ServerResponse, resource = "Route") {
  sendError(res, 404, `${resource} not found.`);
}

export function sendBadRequest(res: ServerResponse, error: string) {
  sendError(res, 400, error);
}

export function sendUnavailable(res: ServerResponse, error = "Backend database is unavailable.") {
  sendError(res, 503, error);
}

export function sendUnimplemented(res: ServerResponse, resource: string) {
  sendError(res, 501, `${resource} is not implemented yet. Backend remains optional.`);
}

export function sendValidationError(
  res: ServerResponse,
  statusCode: number,
  error: string,
  validationErrors: ApiValidationError[]
) {
  sendJson(res, statusCode, {
    success: false,
    error: redactErrorMessage(error),
    validationErrors,
    meta: {
      generatedAt: new Date().toISOString(),
      source: "dvi-server",
    },
  });
}
