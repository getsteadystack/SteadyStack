import { initTRPC, TRPCError } from "@trpc/server";

import type { Context } from "./context";

/** Procedure metadata — consumed by the OpenAPI generator (src/openapi.ts). */
export interface ProcedureMeta {
  /** Auth model: procedures marked "session" require a logged-in web session. */
  auth?: "public" | "session";
  /** Marks rate-limited procedures (shown as 429 in the API reference). */
  rateLimited?: boolean;
  /** Human-facing description surfaced in the generated OpenAPI document. */
  description?: string;
}

export const t = initTRPC.context<Context>().meta<ProcedureMeta>().create();

export const router = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure
  .use(({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
        cause: "No session",
      });
    }
    return next({
      ctx: {
        ...ctx,
        session: ctx.session,
      },
    });
  })
  .meta({ auth: "session" });

// ─── In-memory sliding-window rate limiter ────────────────────────────────────
// Keyed by "<userId>:<procedurePath>". Stores an array of call timestamps.
// Per-isolate state; resets on cold-start. For cross-isolate enforcement,
// wire in Upstash Redis when the paid plan is available.

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_CALLS = 100; // max calls per window per user per procedure

type RateLimitStore = Map<string, number[]>;
const g = globalThis as typeof globalThis & { __rlStore?: RateLimitStore };
if (!g.__rlStore) g.__rlStore = new Map();

const rateLimitMiddleware = t.middleware(({ ctx, path, next }) => {
  if (!ctx.session) return next(); // unauthenticated — let protectedProcedure handle it

  const userId = ctx.session.user.id;
  const key = `${userId}:${path}`;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  const calls = (g.__rlStore!.get(key) ?? []).filter((ts) => ts > windowStart);
  calls.push(now);
  g.__rlStore!.set(key, calls);

  // Periodic bounded prune to avoid memory growth in long-running instances
  if (g.__rlStore!.size > 5_000) {
    for (const [k, timestamps] of g.__rlStore!.entries()) {
      if (timestamps.length === 0 || (timestamps[timestamps.length - 1] ?? 0) < windowStart) {
        g.__rlStore!.delete(k);
      }
    }
  }

  if (calls.length > RATE_LIMIT_MAX_CALLS) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded: ${RATE_LIMIT_MAX_CALLS} calls per minute allowed.`,
    });
  }

  return next();
});

/**
 * Rate-limited protected procedure.
 * Enforces session auth + 100 req/min per user per procedure (sliding window).
 * Use this for all state-mutating or expensive query procedures.
 */
export const rateLimitedProcedure = protectedProcedure
  .use(rateLimitMiddleware)
  .meta({ auth: "session", rateLimited: true });

/**
 * Creates a tRPC procedure middleware enforcing workspace feature flags or quotas.
 */
export const createFeatureFlagMiddleware = (
  checkFn: (userId: string) => Promise<{ allowed: boolean; error?: string }>,
) =>
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }
    const result = await checkFn(ctx.session.user.id);
    if (!result.allowed) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: result.error || "Feature access denied by plan limits",
      });
    }
    return next();
  });

export * from "./routers/index";
