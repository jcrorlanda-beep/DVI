import type { IncomingMessage } from "node:http";
import type { ValidationIssue, ValidationSchema } from "../validation/index.js";

export type ValidationOutcome =
  | {
      valid: true;
      data: unknown;
    }
  | {
      valid: false;
      issues: ValidationIssue[];
    };

export function validateBody(schema: ValidationSchema, body: unknown): ValidationOutcome {
  const result = schema.validate(body);
  return result.valid ? { valid: true, data: body } : { valid: false, issues: result.issues };
}

export function readQueryParams(req: IncomingMessage): Record<string, string> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  return Object.fromEntries(Array.from(url.searchParams.entries()).filter(([, value]) => value.trim() !== ""));
}

export function validateQuery(
  req: IncomingMessage,
  allowedKeys: string[],
): { valid: true; query: Record<string, string> } | { valid: false; issues: ValidationIssue[] } {
  const query = readQueryParams(req);
  const issues = Object.keys(query)
    .filter((key) => !allowedKeys.includes(key))
    .map((key) => ({
      field: key,
      message: `Query parameter ${key} is not supported.`,
      code: "unsupported_query",
    }));

  return issues.length ? { valid: false, issues } : { valid: true, query };
}
