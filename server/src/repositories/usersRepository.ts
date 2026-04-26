import { getPrismaClient } from "../db/prisma.js";
import type { RepositoryResult } from "./types.js";

export type BackendUserRecord = {
  id: string;
  localId?: string | null;
  username: string;
  email?: string | null;
  fullName: string;
  role: string;
  permissions: string[];
  active: boolean;
  status: "Active" | "Disabled" | "Locked" | string;
  failedLoginCount: number;
  lastLoginAt?: string | null;
  passwordHash?: string | null;
};

function normalizeUser(record: Record<string, any>): BackendUserRecord {
  const role = record.role && typeof record.role === "object" ? record.role : null;
  const roleName = typeof role?.name === "string" ? role.name : typeof record.roleName === "string" ? record.roleName : "Unknown";
  const rolePermissions = Array.isArray(role?.permissions) ? role.permissions : [];
  const permissions = rolePermissions
    .map((entry: Record<string, any>) => entry?.permission?.key)
    .filter((key: unknown): key is string => typeof key === "string");

  return {
    id: String(record.id),
    localId: typeof record.localId === "string" ? record.localId : null,
    username: String(record.username ?? ""),
    email: typeof record.email === "string" ? record.email : null,
    fullName: String(record.fullName ?? ""),
    role: roleName,
    permissions,
    active: Boolean(record.active),
    status: typeof record.status === "string" ? record.status : Boolean(record.active) ? "Active" : "Disabled",
    failedLoginCount: typeof record.failedLoginCount === "number" ? record.failedLoginCount : 0,
    lastLoginAt: record.lastLoginAt instanceof Date ? record.lastLoginAt.toISOString() : typeof record.lastLoginAt === "string" ? record.lastLoginAt : null,
    passwordHash: typeof record.passwordHash === "string" ? record.passwordHash : null,
  };
}

async function findUser(where: Record<string, unknown>): Promise<RepositoryResult<BackendUserRecord | null>> {
  const client = await getPrismaClient();
  const delegate = client?.user as Record<string, any> | undefined;
  if (!delegate?.findFirst && !delegate?.findUnique) {
    return {
      success: false,
      error: "Prisma user delegate is unavailable.",
      code: "UNAVAILABLE",
      retryable: true,
    };
  }

  try {
    const record = await (delegate.findFirst
      ? delegate.findFirst({
          where,
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        })
      : delegate.findUnique({
          where,
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        }));
    return { success: true, data: record ? normalizeUser(record as Record<string, any>) : null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "User lookup failed.",
      code: "UNKNOWN",
    };
  }
}

export async function findUserByUsername(username: string): Promise<RepositoryResult<BackendUserRecord | null>> {
  return findUser({ username });
}

export async function findUserById(id: string): Promise<RepositoryResult<BackendUserRecord | null>> {
  return findUser({ id });
}

export async function findUserByLogin(login: string): Promise<RepositoryResult<BackendUserRecord | null>> {
  const normalized = login.trim();
  return findUser({
    OR: [{ username: normalized }, { email: normalized.toLowerCase() }],
  });
}

export async function recordSuccessfulLogin(userId: string): Promise<RepositoryResult<{ id: string }>> {
  const client = await getPrismaClient();
  const delegate = client?.user as Record<string, any> | undefined;
  if (!delegate?.update) {
    return {
      success: false,
      error: "Prisma user delegate is unavailable.",
      code: "UNAVAILABLE",
      retryable: true,
    };
  }

  try {
    await delegate.update({
      where: { id: userId },
      data: {
        failedLoginCount: 0,
        lastLoginAt: new Date(),
      },
    });
    return { success: true, data: { id: userId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login success tracking failed.",
      code: "UNKNOWN",
    };
  }
}

export async function recordFailedLogin(userId: string, currentFailedLoginCount: number): Promise<RepositoryResult<{ id: string; locked: boolean }>> {
  const client = await getPrismaClient();
  const delegate = client?.user as Record<string, any> | undefined;
  if (!delegate?.update) {
    return {
      success: false,
      error: "Prisma user delegate is unavailable.",
      code: "UNAVAILABLE",
      retryable: true,
    };
  }

  const nextFailedLoginCount = currentFailedLoginCount + 1;
  const locked = nextFailedLoginCount >= 10;
  try {
    await delegate.update({
      where: { id: userId },
      data: {
        failedLoginCount: nextFailedLoginCount,
        ...(locked ? { status: "Locked", active: false } : {}),
      },
    });
    return { success: true, data: { id: userId, locked } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Login failure tracking failed.",
      code: "UNKNOWN",
    };
  }
}
