import type { IncomingMessage, ServerResponse } from "node:http";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE" | "OPTIONS";

export type RouteContext = {
  params: Record<string, string>;
  body?: unknown;
};

export type RouteHandler = (req: IncomingMessage, res: ServerResponse, context: RouteContext) => Promise<void> | void;

export type ApiRoute = {
  method: HttpMethod;
  pattern: RegExp;
  handler: RouteHandler;
  description: string;
};
