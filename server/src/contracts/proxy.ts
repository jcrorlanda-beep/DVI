export type AiProxyProvider = "ollama" | "openai" | "fallback";

export type AiGenerateRequest = {
  action: string;
  input: string;
  model?: string;
  outputMode?: "Short" | "Standard" | "Detailed";
  preferredProvider?: AiProxyProvider;
  sourceModule?: string;
  contextLabel?: string;
};

export type AiGenerateResponse = {
  text: string;
  provider: AiProxyProvider;
  usedFallback: boolean;
  warning?: string;
};

export type SmsSendRequest = {
  messageType?: string;
  templateType?: string;
  to: string;
  body?: string;
  message?: string;
  linkedEntityId?: string;
  roNumber?: string;
  provider?: "Android SMS Gateway" | "Twilio" | "Simulated";
};

export type SmsSendResponse = {
  status: "queued" | "sent" | "failed" | "retry_pending";
  messageId?: string;
  provider?: "android-gateway" | "simulated" | "future-cloud-provider";
  queuedAt?: string;
  sentAt?: string;
  error?: string;
  providerResponse?: string;
  retryAfterAt?: string;
};

export type SmsSendLogDto = {
  id: string;
  to: string;
  templateType?: string;
  linkedEntityId?: string;
  status: SmsSendResponse["status"];
  provider: SmsSendResponse["provider"];
  queuedAt: string;
  sentAt?: string;
  error?: string;
};
