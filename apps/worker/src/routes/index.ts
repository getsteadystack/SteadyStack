import type { ExecutionContext } from "@cloudflare/workers-types";
import type { Env } from "../env";
import { getCorsHeaders } from "./http";
import type { RouteHandler } from "./types";
import { websocketRoute } from "./websocket";
import { debugFetchRoute } from "./debug";
import { checkNowRoute } from "./check-now";
import { broadcastRoute } from "./broadcast";
import { dnsAuditRoute, payloadAuditRoute } from "./audits";
import {
  bgpCheckRoute,
  databaseCheckRoute,
  dnsWatchdogRoute,
  domainExpirationRoute,
  globalLatencyRoute,
  graphqlCheckRoute,
  mcpCheckRoute,
  portCheckRoute,
  securityHeadersRoute,
  sslCheckRoute,
  websocketCheckRoute,
} from "./checks";
import { heartbeatRoute } from "./heartbeat";
import {
  probeHeartbeatRoute,
  probePollRoute,
  probeRegisterRoute,
  probeResultRoute,
} from "./probes";
import { locationsRoute } from "./locations";
import { reportsDispatchRoute } from "./reports";

export type { RouteHandler } from "./types";

// Routes are evaluated in order; the first handler that returns a Response
// owns the request. Order matters where paths overlap.
export const ROUTES: RouteHandler[] = [
  websocketRoute,
  debugFetchRoute,
  checkNowRoute,
  broadcastRoute,
  reportsDispatchRoute,
  dnsAuditRoute,
  payloadAuditRoute,
  securityHeadersRoute,
  sslCheckRoute,
  portCheckRoute,
  heartbeatRoute,
  dnsWatchdogRoute,
  domainExpirationRoute,
  mcpCheckRoute,
  graphqlCheckRoute,
  websocketCheckRoute,
  databaseCheckRoute,
  bgpCheckRoute,
  globalLatencyRoute,
  locationsRoute,
  probeRegisterRoute,
  probePollRoute,
  probeResultRoute,
  probeHeartbeatRoute,
];

/**
 * Dispatch an incoming request to the registered route handlers. Returns the
 * CORS preflight response for OPTIONS requests and a plain health response
 * when no route matches.
 */
export async function handleFetch(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  url: URL,
): Promise<Response> {
  for (const handler of ROUTES) {
    const response = await handler({ request, env, ctx }, url);
    if (response) return response;
  }

  // CORS Preflight — respond with env-scoped origin, never a wildcard in production
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(env, request) });
  }

  return new Response("SteadyStack Worker is Running", { status: 200 });
}
