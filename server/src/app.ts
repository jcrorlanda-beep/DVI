import type { IncomingMessage, ServerResponse } from "node:http";
import { config } from "./config.js";
import { logSafeServerError, sendBadRequest, sendError, sendNotFound } from "./response.js";
import { routes } from "./routes/index.js";
import type { ApiRoute } from "./routes/types.js";

function applyCors(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", config.corsOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function getPathname(req: IncomingMessage): string {
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `http://${host}`);
  return url.pathname;
}

function matchRoute(method: string, pathname: string): { route: ApiRoute; params: Record<string, string> } | null {
  for (const route of routes) {
    if (route.method !== method) continue;
    const match = route.pattern.exec(pathname);
    if (!match) continue;
    const params = match.groups ? { ...match.groups } : {};
    return { route, params };
  }
  return null;
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  if (!["POST", "PATCH", "PUT"].includes(req.method ?? "")) return undefined;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return { _parseError: "Invalid JSON body" };
  }
}

export async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  applyCors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  const pathname = getPathname(req);
  const matched = matchRoute(req.method ?? "GET", pathname);

  if (!matched) {
    sendNotFound(res, "Route");
    return;
  }

  try {
    const body = await readJsonBody(req);
    if (body && typeof body === "object" && "_parseError" in body) {
      sendBadRequest(res, "Invalid JSON body.");
      return;
    }
    await matched.route.handler(req, res, {
      params: matched.params,
      body,
    });
  } catch (error) {
    logSafeServerError(error, { method: req.method, pathname });
    sendError(res, 500, "Unexpected server error");
  }
}
