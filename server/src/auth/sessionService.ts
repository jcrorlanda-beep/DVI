import { createHmac, randomBytes } from "node:crypto";
import type { IncomingMessage } from "node:http";
import { getPrismaClient } from "../db/prisma.js";
import type { BackendRequestUser } from "../middleware/auth.js";
import { findUserById } from "../repositories/usersRepository.js";
import type { RepositoryResult } from "../repositories/types.js";

const DEFAULT_SESSION_TTL_MINUTES = 8 * 60;

export type AuthSessionResult =
  | {
      success: true;
      token: string;
      expiresAt: string;
    }
  | {
      success: false;
      status: number;
      message: string;
      retryable?: boolean;
    };

export type VerifiedSessionResult =
  | {
      success: true;
      user: BackendRequestUser;
      expiresAt: string;
    }
  | {
      success: false;
      status: number;
      message: string;
    };

function getAuthSecret(): string | null {
  const secret = process.env.AUTH_TOKEN_SECRET?.trim() || process.env.SESSION_SECRET?.trim() || "";
  return secret.length >= 32 ? secret : null;
}

function getSessionTtlMinutes(): number {
  const configured = Number(process.env.AUTH_SESSION_TTL_MINUTES ?? "");
  return Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_SESSION_TTL_MINUTES;
}

function hashToken(rawToken: string): string | null {
  const secret = getAuthSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(rawToken).digest("hex");
}

function readRequestIp(req?: IncomingMessage): string | null {
  if (!req) return null;
  const forwarded = Array.isArray(req.headers["x-forwarded-for"]) ? req.headers["x-forwarded-for"][0] : req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) return forwarded.split(",")[0]?.trim() ?? null;
  return req.socket.remoteAddress ?? null;
}

export function readBearerSessionToken(req: IncomingMessage): string | null {
  const authHeader = Array.isArray(req.headers.authorization) ? req.headers.authorization[0] : req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
  return token.startsWith("dvi-session.") ? token.slice("dvi-session.".length) : null;
}

export async function createAuthSession(userId: string, req?: IncomingMessage): Promise<AuthSessionResult> {
  const tokenSecret = getAuthSecret();
  if (!tokenSecret) {
    return {
      success: false,
      status: 503,
      message: "Backend auth token secret is not configured. Set AUTH_TOKEN_SECRET before using backend auth sessions.",
    };
  }

  const client = await getPrismaClient();
  const delegate = client?.authSession as Record<string, any> | undefined;
  if (!delegate?.create) {
    return {
      success: false,
      status: 503,
      message: "Prisma auth session delegate is unavailable.",
      retryable: true,
    };
  }

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(rawToken);
  if (!tokenHash) {
    return {
      success: false,
      status: 503,
      message: "Backend auth token hashing is unavailable.",
    };
  }

  const expiresAt = new Date(Date.now() + getSessionTtlMinutes() * 60 * 1000);
  await delegate.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent: typeof req?.headers["user-agent"] === "string" ? req.headers["user-agent"] : null,
      ipAddress: readRequestIp(req),
    },
  });

  return {
    success: true,
    token: `dvi-session.${rawToken}`,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function verifyAuthSessionToken(rawSessionToken: string): Promise<VerifiedSessionResult> {
  const tokenHash = hashToken(rawSessionToken);
  if (!tokenHash) {
    return {
      success: false,
      status: 503,
      message: "Backend auth token secret is not configured.",
    };
  }

  const client = await getPrismaClient();
  const delegate = client?.authSession as Record<string, any> | undefined;
  if (!delegate?.findUnique) {
    return {
      success: false,
      status: 503,
      message: "Prisma auth session delegate is unavailable.",
    };
  }

  const session = await delegate.findUnique({ where: { tokenHash } });
  if (!session || session.revokedAt) {
    return {
      success: false,
      status: 401,
      message: "Backend session is invalid or revoked.",
    };
  }

  const expiresAt = session.expiresAt instanceof Date ? session.expiresAt : new Date(session.expiresAt);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
    return {
      success: false,
      status: 401,
      message: "Backend session has expired.",
    };
  }

  const userResult: RepositoryResult<Awaited<ReturnType<typeof findUserById>> extends RepositoryResult<infer T> ? T : never> = await findUserById(String(session.userId));
  if (!userResult.success) {
    return {
      success: false,
      status: 503,
      message: userResult.error,
    };
  }

  const user = userResult.data;
  if (!user || user.status !== "Active" || !user.active) {
    return {
      success: false,
      status: 401,
      message: "Backend session user is not active.",
    };
  }

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      permissions: user.role === "Admin" ? ["*"] : user.permissions,
    },
    expiresAt: expiresAt.toISOString(),
  };
}

export async function revokeAuthSession(rawSessionToken: string): Promise<AuthSessionResult> {
  const tokenHash = hashToken(rawSessionToken);
  if (!tokenHash) {
    return {
      success: false,
      status: 503,
      message: "Backend auth token secret is not configured.",
    };
  }

  const client = await getPrismaClient();
  const delegate = client?.authSession as Record<string, any> | undefined;
  if (!delegate?.update) {
    return {
      success: false,
      status: 503,
      message: "Prisma auth session delegate is unavailable.",
      retryable: true,
    };
  }

  try {
    await delegate.update({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  } catch {
    // Logout should be safe/idempotent from the client's perspective.
  }

  return {
    success: true,
    token: "",
    expiresAt: new Date().toISOString(),
  };
}
