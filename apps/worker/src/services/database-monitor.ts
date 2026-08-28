import { connect } from "cloudflare:sockets";

export interface DatabaseExpectation {
  rowCountMin?: number;
  rowCountMax?: number;
  valueThreshold?: number;
  valuePath?: string;
}

export interface DatabaseResult {
  url: string;
  status: "UP" | "DOWN";
  latency: number;
  errorReason?: string | undefined;
  dbType: string;
  queryExecuted: boolean;
  executionTimeMs: number;
  rowCount: number;
  errorMessage?: string;
}

function parseDbUrl(url: string): {
  dbType: string;
  host: string;
  port: number;
} {
  try {
    const u = new URL(url);
    const dbType = u.protocol.replace(":", "");
    const host = u.hostname;
    const port =
      parseInt(u.port, 10) || (dbType === "postgresql" ? 5432 : dbType === "mysql" ? 3306 : 27017);
    return { dbType, host, port };
  } catch {
    // Fallback: treat as host:port string
    const parts = url.split(":");
    return {
      dbType: "tcp",
      host: parts[0] || url,
      port: parseInt(parts[1] || "5432", 10),
    };
  }
}

async function checkTcpConnectivity(
  host: string,
  port: number,
  timeoutMs: number,
): Promise<{ ok: boolean; latency: number; error?: string }> {
  const start = performance.now();
  try {
    const socket = connect({ hostname: host, port });
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeoutMs),
    );
    await Promise.race([socket.opened, timeoutPromise]);
    const latency = Math.round(performance.now() - start);
    await socket.close().catch(() => {});
    return { ok: true, latency };
  } catch (err: any) {
    const latency = Math.round(performance.now() - start);
    return { ok: false, latency, error: err.message };
  }
}

export async function checkDatabase(
  connectionUrl: string,
  query?: string,
  expectation?: DatabaseExpectation,
): Promise<DatabaseResult> {
  const start = performance.now();
  const { dbType, host, port } = parseDbUrl(connectionUrl);

  // If a query is specified and it's PostgreSQL, try actual query execution
  if (query && dbType === "postgresql") {
    let prisma: any = null;
    try {
      if (!/^\s*select\b/i.test(query)) {
        throw new Error("Only SELECT queries are allowed for security reasons.");
      }

      const { getPrisma } = await import("@steadystack/db");
      prisma = getPrisma(connectionUrl);

      const queryStart = performance.now();
      const rawResult = await prisma.$queryRawUnsafe(query);
      const executionTimeMs = Math.round(performance.now() - queryStart);

      const rows = Array.isArray(rawResult) ? rawResult : [];
      const rowCount = rows.length;

      const totalLatency = Math.round(performance.now() - start);

      let errorReason: string | undefined;
      if (expectation) {
        if (expectation.rowCountMin !== undefined && rowCount < expectation.rowCountMin) {
          errorReason = `Row count ${rowCount} below minimum ${expectation.rowCountMin}`;
        } else if (expectation.rowCountMax !== undefined && rowCount > expectation.rowCountMax) {
          errorReason = `Row count ${rowCount} exceeds maximum ${expectation.rowCountMax}`;
        }
      }

      return {
        url: connectionUrl,
        status: errorReason ? "DOWN" : "UP",
        latency: totalLatency,
        errorReason,
        dbType,
        queryExecuted: true,
        executionTimeMs,
        rowCount,
      };
    } catch (err: any) {
      const totalLatency = Math.round(performance.now() - start);
      return {
        url: connectionUrl,
        status: "DOWN",
        latency: totalLatency,
        errorReason: `QUERY_FAILED: ${err.message}`,
        dbType,
        queryExecuted: false,
        executionTimeMs: totalLatency,
        rowCount: 0,
        errorMessage: err.message,
      };
    }
  }

  // Fallback: TCP connectivity check
  const tcpResult = await checkTcpConnectivity(host, port, 5000);
  const totalLatency = Math.round(performance.now() - start);

  return {
    url: connectionUrl,
    status: tcpResult.ok ? "UP" : "DOWN",
    latency: totalLatency,
    errorReason: tcpResult.ok ? undefined : `CONNECTION_FAILED: ${tcpResult.error}`,
    dbType,
    queryExecuted: false,
    executionTimeMs: tcpResult.latency,
    rowCount: 0,
  };
}
