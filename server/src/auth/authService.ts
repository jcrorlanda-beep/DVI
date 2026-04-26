import { verifyPassword } from "./password.js";
import {
  findUserByLogin,
  recordFailedLogin,
  recordSuccessfulLogin,
  type BackendUserRecord,
} from "../repositories/usersRepository.js";
import type { BackendRequestUser } from "../middleware/auth.js";
import type { RepositoryResult } from "../repositories/types.js";

export type AuthFailureCode = "INVALID_CREDENTIALS" | "ACCOUNT_DISABLED" | "ACCOUNT_LOCKED" | "UNAVAILABLE";

export type AuthenticatedBackendUser = BackendRequestUser & {
  fullName: string;
  email?: string | null;
  status: string;
  active: boolean;
};

export type BackendAuthResult =
  | {
      success: true;
      user: AuthenticatedBackendUser;
      sourceUser: BackendUserRecord;
    }
  | {
      success: false;
      code: AuthFailureCode;
      message: string;
      status: number;
      retryable?: boolean;
    };

function toSessionUser(user: BackendUserRecord): AuthenticatedBackendUser {
  return {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    permissions: user.role === "Admin" ? ["*"] : user.permissions,
    status: user.status,
    active: user.active,
  };
}

function disabledResult(message: string, code: AuthFailureCode): BackendAuthResult {
  return {
    success: false,
    code,
    message,
    status: 403,
  };
}

export async function authenticateBackendUser(login: string, password: string): Promise<BackendAuthResult> {
  const lookup: RepositoryResult<BackendUserRecord | null> = await findUserByLogin(login);
  if (!lookup.success) {
    return {
      success: false,
      code: "UNAVAILABLE",
      message: lookup.error,
      status: 503,
      retryable: lookup.retryable,
    };
  }

  const user = lookup.data;
  if (!user) {
    return {
      success: false,
      code: "INVALID_CREDENTIALS",
      message: "Invalid username or password.",
      status: 401,
    };
  }

  if (user.status === "Disabled" || user.active === false) {
    return disabledResult("This backend account is disabled.", "ACCOUNT_DISABLED");
  }

  if (user.status === "Locked") {
    return disabledResult("This backend account is locked.", "ACCOUNT_LOCKED");
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    await recordFailedLogin(user.id, user.failedLoginCount);
    return {
      success: false,
      code: "INVALID_CREDENTIALS",
      message: "Invalid username or password.",
      status: 401,
    };
  }

  await recordSuccessfulLogin(user.id);

  return {
    success: true,
    user: toSessionUser(user),
    sourceUser: user,
  };
}
