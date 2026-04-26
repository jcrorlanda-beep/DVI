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
    { method: "POST", path: "/api/migration/core/import-preview" },
    { method: "POST", path: "/api/migration/core/import-commit" },
    { method: "POST", path: "/api/migration/workflow/import-preview" },
    { method: "POST", path: "/api/migration/business/import-preview" },
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
    { method: "GET", path: "/api/repair-orders/ro_1/work-lines" },
    { method: "GET", path: "/api/qc-records" },
    { method: "GET", path: "/api/release-records" },
    { method: "GET", path: "/api/backjob-records" },
    { method: "GET", path: "/api/service-history" },
    { method: "POST", path: "/api/repair-orders/ro_1/work-lines" },
    { method: "PATCH", path: "/api/repair-orders/ro_1/work-lines/wl_1" },
    { method: "POST", path: "/api/repair-orders/ro_1/approvals" },
    { method: "GET", path: "/api/approvals" },
    { method: "GET", path: "/api/parts-requests" },
    { method: "GET", path: "/api/inventory" },
    { method: "GET", path: "/api/inventory-movements" },
    { method: "GET", path: "/api/inventory/item_1/movements" },
    { method: "POST", path: "/api/inventory/item_1/movements" },
    { method: "GET", path: "/api/purchase-orders" },
    { method: "POST", path: "/api/purchase-orders/po_1/receive" },
    { method: "GET", path: "/api/suppliers" },
    { method: "GET", path: "/api/suppliers/sup_1/requests" },
    { method: "POST", path: "/api/supplier-bids" },
    { method: "PATCH", path: "/api/supplier-bids/bid_1" },
    { method: "GET", path: "/api/payments" },
    { method: "GET", path: "/api/invoices" },
    { method: "GET", path: "/api/expenses" },
    { method: "GET", path: "/api/finance/reconciliation" },
    { method: "POST", path: "/api/finance/reconciliation/preview" },
    { method: "GET", path: "/api/reports/profit" },
    { method: "GET", path: "/api/reports/revenue" },
    { method: "GET", path: "/api/reports/expenses" },
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
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const response = await fetch(`${baseUrl}/api/health`);
    const payload = (await response.json()) as {
      success?: boolean;
      data?: { service?: string; status?: string; mode?: string };
    };

    assert(response.ok, `Health route returned ${response.status}`);
    assert(payload.success === true, "Health route did not return success.");
    assert(payload.data?.service === "dvi-backend", "Health route returned an unexpected service name.");
    assert(payload.data?.status === "ok", "Health route did not report ok status.");

    const customers = await fetch(`${baseUrl}/api/customers`);
    assert([200, 503].includes(customers.status), `Customers route returned unexpected ${customers.status}`);

    const vehicles = await fetch(`${baseUrl}/api/vehicles`);
    assert([200, 503].includes(vehicles.status), `Vehicles route returned unexpected ${vehicles.status}`);

    const auditLogs = await fetch(`${baseUrl}/api/audit-logs`);
    assert(auditLogs.status === 401, `Audit logs route should be protected, got ${auditLogs.status}`);

    const aiProxy = await fetch(`${baseUrl}/api/ai/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "smoke", input: "route check" }),
    });
    assert(aiProxy.status === 401, `AI proxy route should be protected, got ${aiProxy.status}`);

    const smsProxy = await fetch(`${baseUrl}/api/sms/send`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ to: "+10000000000", message: "route check" }),
    });
    assert(smsProxy.status === 401, `SMS proxy route should be protected, got ${smsProxy.status}`);

    const migrationPreview = await fetch(`${baseUrl}/api/migration/import-preview`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ modules: [] }),
    });
    assert(migrationPreview.status === 401, `Migration preview route should be protected, got ${migrationPreview.status}`);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  console.log("Backend smoke test passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
