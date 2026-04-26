import { createServer } from "node:http";
import { handleRequest } from "./app.js";
import { routes } from "./routes/index.js";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const expectedRoutes = [
    { method: "GET", path: "/api/health" },
    { method: "POST", path: "/api/ai/generate" },
    { method: "POST", path: "/api/sms/send" },
    { method: "POST", path: "/api/migration/import-preview" },
    { method: "POST", path: "/api/migration/import-commit" },
    { method: "POST", path: "/api/auth/login" },
    { method: "POST", path: "/api/auth/logout" },
    { method: "GET", path: "/api/auth/me" },
    { method: "POST", path: "/api/auth/refresh" },
    { method: "GET", path: "/api/users" },
    { method: "GET", path: "/api/roles" },
    { method: "GET", path: "/api/permissions" },
    { method: "GET", path: "/api/customers" },
    { method: "POST", path: "/api/customers" },
    { method: "GET", path: "/api/vehicles" },
    { method: "POST", path: "/api/vehicles" },
    { method: "GET", path: "/api/intakes" },
    { method: "GET", path: "/api/inspections" },
    { method: "GET", path: "/api/repair-orders" },
    { method: "GET", path: "/api/parts-requests" },
    { method: "GET", path: "/api/inventory" },
    { method: "GET", path: "/api/inventory-movements" },
    { method: "GET", path: "/api/purchase-orders" },
    { method: "GET", path: "/api/suppliers" },
    { method: "GET", path: "/api/payments" },
    { method: "GET", path: "/api/expenses" },
    { method: "GET", path: "/api/audit-logs" },
    { method: "POST", path: "/api/audit-logs" },
    { method: "GET", path: "/api/documents" },
  ];

  for (const expected of expectedRoutes) {
    assert(
      routes.some((route) => route.method === expected.method && route.pattern.test(expected.path)),
      `Missing expected route: ${expected.method} ${expected.path}`
    );
  }

  const server = createServer(handleRequest);
  await new Promise<void>((resolve) => server.listen(0, resolve));

  try {
    const address = server.address();
    assert(address && typeof address === "object" && typeof address.port === "number", "Failed to start smoke test server.");
    const response = await fetch(`http://127.0.0.1:${address.port}/api/health`);
    const payload = (await response.json()) as {
      success?: boolean;
      data?: { service?: string; status?: string; mode?: string };
    };

    assert(response.ok, `Health route returned ${response.status}`);
    assert(payload.success === true, "Health route did not return success.");
    assert(payload.data?.service === "dvi-backend", "Health route returned an unexpected service name.");
    assert(payload.data?.status === "ok", "Health route did not report ok status.");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  console.log("Backend smoke test passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
