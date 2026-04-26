import { createServer } from "node:http";
import { config } from "./config.js";
import { handleRequest } from "./app.js";
import { logEnvironmentWarnings, validateEnvironment } from "./env/validation.js";

const server = createServer(handleRequest);
const envStatus = validateEnvironment();

if (config.nodeEnv === "production" && envStatus.errors.length > 0) {
  logEnvironmentWarnings(envStatus);
  throw new Error("Production environment validation failed. Fix required backend env vars before startup.");
}

server.listen(config.port, () => {
  console.log(`DVI backend foundation listening on http://localhost:${config.port}`);
  console.log("Health check: GET /api/health");
  logEnvironmentWarnings(envStatus);
});
