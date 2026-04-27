/**
 * Write Pilot Routes (Phase 223)
 *
 * Disabled-by-default route stubs for the backend write pilot.
 * All routes return a 423 Locked response.
 * No database writes, no localStorage touches.
 * Auth guard is wired but all writes are rejected until the pilot is explicitly enabled.
 */

import { sendJson } from "../response.js";
import type { ApiRoute } from "./types.js";

const WRITE_PILOT_LOCKED_BODY = {
  success: false,
  error: "Write pilot is locked. Backend write pilot is not enabled in this build.",
  data: {
    syncStatus: "skipped_locked",
    remoteId: null,
    warning: "No backend write was performed. LocalStorage remains the source of truth.",
  },
};

export const writePilotRoutes: ApiRoute[] = [
  {
    method: "POST",
    pattern: /^\/api\/write-pilot\/customers$/,
    description: "Write-pilot create customer — locked, returns 423",
    handler: (_req, res) => {
      sendJson(res, 423, WRITE_PILOT_LOCKED_BODY);
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/write-pilot\/vehicles$/,
    description: "Write-pilot create vehicle — locked, returns 423",
    handler: (_req, res) => {
      sendJson(res, 423, WRITE_PILOT_LOCKED_BODY);
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/write-pilot\/intakes$/,
    description: "Write-pilot create intake — locked, returns 423",
    handler: (_req, res) => {
      sendJson(res, 423, WRITE_PILOT_LOCKED_BODY);
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/write-pilot\/repair-orders$/,
    description: "Write-pilot create repair order — locked, returns 423",
    handler: (_req, res) => {
      sendJson(res, 423, WRITE_PILOT_LOCKED_BODY);
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/write-pilot\/status$/,
    description: "Write-pilot status check — always returns locked",
    handler: (_req, res) => {
      sendJson(res, 200, {
        success: true,
        data: {
          enabled: false,
          status: "locked",
          reason: "Write pilot is locked by default. All write operations are no-ops.",
          lockedRoutes: [
            "POST /api/write-pilot/customers",
            "POST /api/write-pilot/vehicles",
            "POST /api/write-pilot/intakes",
            "POST /api/write-pilot/repair-orders",
          ],
        },
        meta: { generatedAt: new Date().toISOString(), source: "dvi-server" },
      });
    },
  },
];
