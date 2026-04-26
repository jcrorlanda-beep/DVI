import { authenticateBackendUser } from "../auth/authService.js";
import { createAuthSession, readBearerSessionToken, revokeAuthSession, verifyAuthSessionToken } from "../auth/sessionService.js";
import { getRequestUser } from "../middleware/auth.js";
import { sendError, sendJson, sendValidationError } from "../response.js";
import type { ApiRoute } from "./types.js";

function readLoginPayload(body: unknown): { username: string; password: string } | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const username = typeof record.username === "string" ? record.username.trim() : "";
  const password = typeof record.password === "string" ? record.password : "";
  return username && password ? { username, password } : null;
}

export const authRoutes: ApiRoute[] = [
  {
    method: "POST",
    pattern: /^\/api\/auth\/login$/,
    description: "Backend login route for future backend sessions",
    handler: async (_req, res, context) => {
      const payload = readLoginPayload(context.body);
      if (!payload) {
        sendValidationError(res, 400, "Login payload failed validation.", [
          { field: "username", message: "Username is required.", code: "required_string" },
          { field: "password", message: "Password is required.", code: "required_string" },
        ]);
        return;
      }

      const result = await authenticateBackendUser(payload.username, payload.password);
      if (!result.success) {
        sendError(res, result.status, result.message);
        return;
      }

      const sessionUser = result.user;

      const session = await createAuthSession(sessionUser.id, _req);
      if (!session.success) {
        sendError(res, session.status, session.message);
        return;
      }

      sendJson(res, 200, {
        success: true,
        data: {
          user: sessionUser,
          accessToken: session.token,
          expiresAt: session.expiresAt,
          tokenType: "backend-session",
          warning: "Backend auth foundation is ready, but the frontend login still uses localStorage until a later cutover phase.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/auth\/logout$/,
    description: "Backend logout route",
    handler: async (req, res) => {
      const rawToken = readBearerSessionToken(req);
      if (rawToken) {
        const revoked = await revokeAuthSession(rawToken);
        if (!revoked.success) {
          sendError(res, revoked.status, revoked.message);
          return;
        }
      }

      sendJson(res, 200, {
        success: true,
        data: {
          loggedOut: true,
          warning: rawToken ? "Backend session token was revoked if present." : "No backend session token was supplied; frontend local login is unchanged.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/auth\/me$/,
    description: "Backend current-session route",
    handler: async (req, res) => {
      const rawToken = readBearerSessionToken(req);
      if (rawToken) {
        const session = await verifyAuthSessionToken(rawToken);
        if (!session.success) {
          sendError(res, session.status, session.message);
          return;
        }

        sendJson(res, 200, {
          success: true,
          data: {
            user: {
              ...session.user,
              active: true,
            },
            expiresAt: session.expiresAt,
            warning: "Backend auth is still separate from frontend local login.",
          },
          meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
        });
        return;
      }

      const user = await getRequestUser(req);
      if (!user) {
        sendError(res, 401, "No backend session token was provided.");
        return;
      }

      sendJson(res, 200, {
        success: true,
        data: {
          user: {
            ...user,
            active: true,
          },
          warning: "Backend auth is still separate from frontend local login.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/auth\/refresh$/,
    description: "Future backend token refresh route",
    handler: (_req, res) => {
      sendJson(res, 202, {
        success: true,
        data: {
          refreshed: false,
          warning: "Token refresh is a placeholder until signed sessions or JWT refresh rotation are implemented.",
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];
