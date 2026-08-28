import { PrismaClient } from "./generated/client/edge.js";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool as NeonPool } from "@neondatabase/serverless";

declare global {
  // eslint-disable-next-line no-var
  var DATABASE_URL: string | undefined;
  // eslint-disable-next-line no-var
  var DATABASE_POOL_URL: string | undefined;
}

export function createPrisma(databaseUrl?: string) {
  const url =
    databaseUrl ||
    (typeof process !== "undefined" ? process.env.DATABASE_URL : globalThis.DATABASE_URL);

  if (!url) {
    throw new Error("DATABASE_URL is not set. Ensure it's provided in your environment variables.");
  }

  // Prefer DATABASE_POOL_URL when available so the pool targets a connection pooler
  // (e.g. Neon's pooled endpoint or a PgBouncer URL) rather than hitting Postgres directly.
  // DATABASE_URL should still point to the direct connection for Prisma CLI migrations.
  // Set DATABASE_POOL_URL in production to prevent connection exhaustion under load.
  const poolUrl =
    (typeof process !== "undefined"
      ? process.env.DATABASE_POOL_URL
      : globalThis.DATABASE_POOL_URL) || url;

  // Determine if SSL is needed but remove sslmode from URL to avoid conflict with explicit ssl config
  const isSsl = poolUrl.includes("sslmode=require") || poolUrl.includes("sslmode=verify");
  // Strip both sslmode= and channel_binding= — @neondatabase/serverless does not understand
  // channel_binding, so if it's left in the URL the driver parses "neondb&channel_binding=require"
  // as the database name, causing P1003 "Database does not exist".
  const cleanUrl = poolUrl
    .replace(/[?&]sslmode=[^&]+/g, "")
    .replace(/[?&]channel_binding=[^&]+/g, "")
    // Tidy up any dangling ? or & left after stripping params
    .replace(/\?&/, "?")
    .replace(/[?&]$/, "");

  // Detect Cloudflare Workers runtime
  const isWorkerd =
    typeof navigator === "object" &&
    navigator !== null &&
    typeof navigator.userAgent === "string" &&
    navigator.userAgent === "Cloudflare-Workers";

  const poolConfig: any = {
    connectionString: cleanUrl,
    // In Cloudflare Workers, connections can't persist across invocations — use 1.
    // In Node.js, allow a small pool for concurrent queries within a request.
    max: isWorkerd ? 1 : 5,
    idleTimeoutMillis: isWorkerd ? 10_000 : 30_000,
    connectionTimeoutMillis: 10_000,
    // keepAlive uses Node.js net.Socket APIs not available in pg-cloudflare's CloudflareSocket
    ...(isWorkerd ? {} : { keepAlive: true, keepAliveInitialDelayMillis: 5_000 }),
  };

  const isNeon = poolUrl.includes("neon.tech");

  let pool: any;
  let adapter: any;

  if (isNeon) {
    // Neon database connection string requires SSL, which @neondatabase/serverless handles natively via WebSockets
    pool = new NeonPool({ connectionString: cleanUrl });
    adapter = new PrismaNeon(pool);
  } else {
    // Only enable SSL if explicitly specified in the connection string (sslmode=require/verify) or provider requires it
    if (isSsl) {
      poolConfig.ssl = { rejectUnauthorized: false };
    }

    pool = new Pool(poolConfig);
    pool.on("error", (err: any) => {
      // pg.Pool handles dead idle connections automatically by removing them from the pool.
      // NEVER call resetPrisma or pool.end() here as it closes the entire pool and destroys active queries.
      console.warn("[PG Pool] Idle client connection event (handled by pool):", err.message);
    });
    adapter = new PrismaPg(pool);
  }

  const isDev = typeof process !== "undefined" && process.env.NODE_ENV === "development";

  const client = new PrismaClient({
    adapter,
    log: isDev ? ["query", "error", "warn"] : ["error"],
  });
  (client as any).$pool = pool;
  return client;
}

// Global type for singleton storage
type PrismaSingleton = {
  prisma?: PrismaClient | undefined;
  instances?: Map<string, PrismaClient> | undefined;
};

const g = globalThis as unknown as PrismaSingleton;
if (!g.instances) {
  g.instances = new Map<string, PrismaClient>();
}

function getUrl() {
  if (typeof process !== "undefined" && process.env?.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  if (typeof globalThis !== "undefined" && globalThis.DATABASE_URL) {
    return globalThis.DATABASE_URL;
  }
  return undefined;
}

export async function resetPrisma(databaseUrl?: string) {
  if (databaseUrl && g.instances?.has(databaseUrl)) {
    const client = g.instances.get(databaseUrl);
    g.instances.delete(databaseUrl);
    if (client) {
      try {
        await client.$disconnect();
      } catch {}
      if ((client as any).$pool) {
        try {
          await (client as any).$pool.end();
        } catch {}
      }
    }
  } else if (!databaseUrl && g.prisma) {
    const oldClient = g.prisma;
    g.prisma = undefined;
    try {
      await oldClient.$disconnect();
    } catch {}
    if ((oldClient as any).$pool) {
      try {
        await (oldClient as any).$pool.end();
      } catch {}
    }
  }
}

export function getPrisma(databaseUrl?: string) {
  if (databaseUrl) {
    const existing = g.instances?.get(databaseUrl);
    if (existing) {
      const pool = (existing as any).$pool;
      if (pool && (pool.ended || pool.ending)) {
        g.instances?.delete(databaseUrl);
      } else {
        return existing;
      }
    }
    const created = createPrisma(databaseUrl);
    if (!g.instances) {
      g.instances = new Map<string, PrismaClient>();
    }
    g.instances.set(databaseUrl, created);
    return created;
  }

  if (g.prisma) {
    const pool = (g.prisma as any).$pool;
    if (pool && (pool.ended || pool.ending)) {
      g.prisma = undefined;
    }
  }

  if (!g.prisma) {
    const url = getUrl();
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set. Ensure it's provided in your environment variables.",
      );
    }
    g.prisma = createPrisma(url);
  }
  return g.prisma;
}

// Proxy to allow default import to work like a PrismaClient instance
const prismaProxy = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    // @ts-ignore
    const value = client[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default prismaProxy;
export * from "./generated/client/edge.js";
