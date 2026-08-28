import { AppError } from "../errors";
import type { Env } from "../env";

/**
 * Build CORS headers for a response.
 *
 * Checks against env.CORS_ORIGIN, request Origin header (matching .steadystack.dev domains
 * and local dev), or configured comma-separated origins.
 */
export function getCorsHeaders(env?: Env, request?: Request): Record<string, string> {
  const reqOrigin = request?.headers.get("Origin");
  let origin = "null";

  if (env?.CORS_ORIGIN) {
    const allowed = env.CORS_ORIGIN.split(",").map((o) => o.trim());
    if (reqOrigin && allowed.includes(reqOrigin)) {
      origin = reqOrigin;
    } else if (allowed.includes("*")) {
      origin = "*";
    } else {
      origin = allowed[0] || "null";
    }
  } else if (reqOrigin) {
    try {
      const parsed = new URL(reqOrigin);
      if (
        parsed.protocol === "https:" &&
        (parsed.hostname === "steadystack.dev" || parsed.hostname.endsWith(".steadystack.dev"))
      ) {
        origin = parsed.origin;
      }
    } catch {}
  } else if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    origin = "*";
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

/** Build a JSON response with CORS headers applied. */
export function json(
  data: unknown,
  status = 200,
  env?: Env,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...getCorsHeaders(env),
      ...extraHeaders,
    },
  });
}

/** Maximum allowed request body size in bytes (1 MB). */
export const MAX_REQUEST_BODY_SIZE = 1_048_576;

/** Parse a JSON request body, throwing an AppError(400) for malformed input or oversized payloads. */
export async function requireJsonBody(request: Request): Promise<any> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const size = Number.parseInt(contentLength, 10);
    if (!Number.isNaN(size) && size > MAX_REQUEST_BODY_SIZE) {
      throw new AppError(
        413,
        `Request body too large. Maximum allowed size is ${MAX_REQUEST_BODY_SIZE} bytes.`,
      );
    }
  }

  try {
    return await request.json();
  } catch {
    throw new AppError(400, "Invalid JSON body");
  }
}

/**
 * Convert a caught error into a standardized JSON error response.
 *
 * AppError instances map to their own status code; anything else becomes a
 * generic 500 response.
 */
export function errorResponse(err: unknown): Response {
  if (err instanceof AppError) {
    return json({ error: err.message }, err.statusCode);
  }
  const message = err instanceof Error ? err.message : "Internal server error";
  return json({ error: message }, 500);
}

/** Wrap a route handler so thrown errors become standardized JSON responses. */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<Response | null>,
): (...args: T) => Promise<Response | null> {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (err) {
      console.error("[Route Error]", err);
      return errorResponse(err);
    }
  };
}
