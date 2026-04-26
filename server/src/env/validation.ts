export type EnvironmentValidationIssue = {
  key: string;
  severity: "error" | "warning";
  message: string;
};

export type EnvironmentValidationSummary = {
  environment: string;
  productionReady: boolean;
  errors: EnvironmentValidationIssue[];
  warnings: EnvironmentValidationIssue[];
};

function hasValue(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

function flagValue(value: string | undefined) {
  if (!hasValue(value)) return null;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "enabled"].includes(normalized)) return true;
  if (["false", "0", "no", "disabled"].includes(normalized)) return false;
  return null;
}

function issue(key: string, severity: EnvironmentValidationIssue["severity"], message: string): EnvironmentValidationIssue {
  return { key, severity, message };
}

export function validateEnvironment(env: NodeJS.ProcessEnv = process.env): EnvironmentValidationSummary {
  const environment = env.NODE_ENV ?? "development";
  const isProduction = environment === "production";
  const errors: EnvironmentValidationIssue[] = [];
  const warnings: EnvironmentValidationIssue[] = [];
  const authSecret = env.AUTH_TOKEN_SECRET ?? env.SESSION_SECRET;

  const requireInProduction = (key: string, value: string | undefined, message: string) => {
    if (hasValue(value)) return;
    const target = isProduction ? errors : warnings;
    target.push(issue(key, isProduction ? "error" : "warning", message));
  };

  requireInProduction("DATABASE_URL", env.DATABASE_URL, "DATABASE_URL is required before backend database production use.");
  requireInProduction("AUTH_TOKEN_SECRET or SESSION_SECRET", authSecret, "A backend session secret is required before production auth use.");
  requireInProduction("CORS_ORIGIN", env.CORS_ORIGIN, "CORS_ORIGIN should restrict browser access in production.");
  requireInProduction("FILE_STORAGE_ROOT or UPLOAD_STORAGE_ROOT", env.FILE_STORAGE_ROOT ?? env.UPLOAD_STORAGE_ROOT, "File storage root is required before production file uploads.");
  requireInProduction("MAX_UPLOAD_MB", env.MAX_UPLOAD_MB, "MAX_UPLOAD_MB should be explicit in production.");

  if (hasValue(authSecret) && String(authSecret).trim().length < 32) {
    errors.push(issue("AUTH_TOKEN_SECRET or SESSION_SECRET", "error", "Backend auth secret must be at least 32 characters."));
  }

  for (const key of ["AI_PROXY_ENABLED", "SMS_PROXY_ENABLED"] as const) {
    const parsed = flagValue(env[key]);
    if (parsed === null) {
      const target = isProduction ? errors : warnings;
      target.push(issue(key, isProduction ? "error" : "warning", `${key} should be set to true or false before production deployment.`));
    }
  }

  if (flagValue(env.AI_PROXY_ENABLED) === true) {
    if (!hasValue(env.OPENAI_API_KEY) && !hasValue(env.OLLAMA_BASE_URL)) {
      warnings.push(issue("OPENAI_API_KEY / OLLAMA_BASE_URL", "warning", "AI proxy is enabled but no AI provider endpoint/key is configured."));
    }
  }

  if (flagValue(env.SMS_PROXY_ENABLED) === true) {
    if (!hasValue(env.SMS_PROVIDER)) {
      warnings.push(issue("SMS_PROVIDER", "warning", "SMS proxy is enabled but SMS_PROVIDER is not configured."));
    }
    if (env.SMS_PROVIDER === "Android SMS Gateway" && !hasValue(env.SMS_ANDROID_GATEWAY_URL)) {
      warnings.push(issue("SMS_ANDROID_GATEWAY_URL", "warning", "Android SMS Gateway selected but gateway URL is missing."));
    }
  }

  return {
    environment,
    productionReady: errors.length === 0 && warnings.length === 0,
    errors,
    warnings,
  };
}

export function logEnvironmentWarnings(summary: EnvironmentValidationSummary) {
  for (const item of [...summary.errors, ...summary.warnings]) {
    const prefix = item.severity === "error" ? "[dvi-server env error]" : "[dvi-server env warning]";
    console.warn(`${prefix} ${item.key}: ${item.message}`);
  }
}
