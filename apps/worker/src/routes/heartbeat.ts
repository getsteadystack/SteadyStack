import { getPrisma } from "@steadystack/db";
import { AppError } from "../errors";
import { json, withErrorHandling } from "./http";
import type { RouteHandler } from "./types";

/**
 * GET/POST /api/heartbeat/:token — record an external heartbeat ping for a
 * HEARTBEAT monitor identified by its heartbeat token.
 */
export const heartbeatRoute: RouteHandler = withErrorHandling(async ({ request, env }, url) => {
  if (
    !url.pathname.startsWith("/api/heartbeat/") ||
    (request.method !== "GET" && request.method !== "POST")
  ) {
    return null;
  }

  const token = url.pathname.split("/api/heartbeat/")[1] || "";
  if (!token) throw new AppError(400, "Missing heartbeat token");

  const prisma = getPrisma(env.DATABASE_URL);

  // Look up monitor by heartbeat token
  const monitor = await prisma.monitor.findFirst({
    where: { heartbeatToken: token, type: "HEARTBEAT" },
    select: { id: true, name: true },
  });

  if (!monitor) throw new AppError(404, "Invalid heartbeat token");

  const { recordPing } = await import("../services/heartbeat");
  const sourceIp =
    request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || null;
  const userAgent = request.headers.get("User-Agent") || null;

  await recordPing(prisma, monitor.id, sourceIp, userAgent);

  return json({ ok: true, monitor: monitor.name });
});
