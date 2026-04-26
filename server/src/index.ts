import { createServer } from "node:http";
import { config } from "./config.js";
import { handleRequest } from "./app.js";

const server = createServer(handleRequest);

server.listen(config.port, () => {
  console.log(`DVI backend foundation listening on http://localhost:${config.port}`);
  console.log("Health check: GET /api/health");
});
