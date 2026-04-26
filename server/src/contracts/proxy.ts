export type AiProxyProvider = "ollama" | "openai" | "fallback";

export type AiGenerateRequest = {
  action: string;
  input: string;
  model?: string;
  outputMode?: "Short" | "Standard" | "Detailed";
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
  messageType: string;
  to: string;
  body: string;
  roNumber?: string;
  provider?: "Android SMS Gateway" | "Twilio" | "Simulated";
};

export type SmsSendResponse = {
  status: "queued" | "sent" | "failed" | "retry_pending";
  messageId?: string;
  providerResponse?: string;
  retryAfterAt?: string;
};
