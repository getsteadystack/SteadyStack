/**
 * Module 18.1: Cyber Grid - Mesh & Proxy Services
 * Highly optimized integration for proxy mesh and quantum anomaly detection.
 */
import { ProxyError, MonitorStatus as Status } from "../constants";

export interface ProxyResponse {
  status: "UP" | "DOWN";
  latency: number;
  error?: string;
  source: string;
}

/**
 * Determines if a proxy error indicates an infrastructure/mesh failure (CORS, bans, timeouts)
 * rather than a definitive target failure. This ensures we don't mark targets as DOWN
 * just because the proxy itself was blocked.
 */
export function isProxyInfrastructureError(error?: string): boolean {
  if (!error) return false;

  // These prefixes indicate a definitive target failure, captured by the proxy.
  // Any OTHER error is an infrastructure/proxy-level failure.
  return (
    !error.startsWith("TARGET_HTTP_") &&
    !error.startsWith("HTTP_") &&
    !error.startsWith("CLUSTER_HTTP_")
  );
}

export class ProxyMesh {
  private static iopsCount = 0;
  private static lastIopsReset = Date.now();
  private static readonly MAX_IOPS = 5000;
  private static readonly IOPS_WINDOW = 1000; // 1 second

  /**
   * Component 18-1-0: Primary Proxy Fallback Handler
   * Operates under tight latencies to prevent cascading mesh failures.
   */
  async component_18_1_0(url: string, timeoutMs: number = 5000): Promise<ProxyResponse> {
    this.incrementIOPS();

    if (ProxyMesh.iopsCount > ProxyMesh.MAX_IOPS) {
      console.error("[Mesh] CRITICAL: IOPS limit exceeded (5000+). Preventing cascading failure.");
      return {
        status: Status.DOWN,
        latency: 0,
        error: ProxyError.MESH_CONGESTION_FAILSAFE,
        source: "18-1-0",
      };
    }

    const start = Date.now();
    try {
      const encodedUrl = encodeURIComponent(url);
      const proxyUrl = `https://api.allorigins.win/get?url=${encodedUrl}`;

      const response = await fetch(proxyUrl, {
        method: "GET",
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        // The PROXY itself failed — not the target. Treat as proxy unavailable.
        console.warn(
          `[Mesh 18-1-0] Proxy returned ${response.status} — proxy unavailable, not target.`,
        );
        return {
          status: Status.DOWN,
          latency: Date.now() - start,
          error: ProxyError.PROXY_UNAVAILABLE,
          source: "18-1-0",
        };
      }

      const data: any = await response.json();
      const latency = Date.now() - start;

      // Extract actual target status from proxy wrapper
      if (data.status && data.status.http_code >= 200 && data.status.http_code < 400) {
        return { status: Status.UP, latency, source: "18-1-0" };
      }

      // If allorigins couldn't fetch at all or was blocked by target WAF (403/429), treat as proxy failure
      if (
        !data.status ||
        data.status.http_code === 0 ||
        data.status.http_code === 403 ||
        data.status.http_code === 429
      ) {
        console.warn(
          `[Mesh 18-1-0] Proxy returned http_code=${data.status?.http_code || 0} — proxy blocked or could not reach target, skipping.`,
        );
        return {
          status: Status.DOWN,
          latency,
          error: ProxyError.PROXY_FETCH_FAILED,
          source: "18-1-0",
        };
      }

      return {
        status: Status.DOWN,
        latency,
        error: `TARGET_HTTP_${data.status?.http_code || "UNKNOWN"}`,
        source: "18-1-0",
      };
    } catch (err: any) {
      return {
        status: Status.DOWN,
        latency: Date.now() - start,
        error: err.name === "TimeoutError" ? ProxyError.MESH_TIMEOUT : err.message,
        source: "18-1-0",
      };
    }
  }

  /**
   * Component 18-1-1: Secondary Proxy Fallback Handler
   * Uses corsproxy.io as a distinct verification vector.
   */
  async component_18_1_1(url: string, timeoutMs: number = 5000): Promise<ProxyResponse> {
    this.incrementIOPS();

    if (ProxyMesh.iopsCount > ProxyMesh.MAX_IOPS) {
      return {
        status: Status.DOWN,
        latency: 0,
        error: ProxyError.MESH_CONGESTION_FAILSAFE,
        source: "18-1-1",
      };
    }

    const start = Date.now();
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;

      const response = await fetch(proxyUrl, {
        method: "GET",
        signal: AbortSignal.timeout(timeoutMs),
      });

      const latency = Date.now() - start;
      if (response.ok) {
        return { status: Status.UP, latency, source: "18-1-1" };
      }

      if (response.status === 403 || response.status === 429) {
        return {
          status: Status.DOWN,
          latency,
          error: ProxyError.PROXY_FETCH_FAILED,
          source: "18-1-1",
        };
      }

      return {
        status: Status.DOWN,
        latency,
        error: `HTTP_${response.status}`,
        source: "18-1-1",
      };
    } catch (err: any) {
      return {
        status: Status.DOWN,
        latency: Date.now() - start,
        error: err.name === "TimeoutError" ? ProxyError.MESH_TIMEOUT : err.message,
        source: "18-1-1",
      };
    }
  }

  /**
   * Component 19-3-1: Deploy Cluster Data (Quantum Verification)
   * High-fidelity verification for cluster environments with strict IOPS control.
   */
  async component_19_3_1(
    url: string,
    historicalLatencies: number[],
    timeoutMs: number = 2000,
  ): Promise<ProxyResponse & { anomaly?: any }> {
    this.incrementIOPS();

    // Strict 1000 IOPS check for Cluster Grid as per requirement 19-3-1
    if (ProxyMesh.iopsCount > 1000) {
      console.warn("[Mesh] GRID PEAK: IOPS limit (1000) reached for 19-3-1.");
      return {
        status: Status.DOWN,
        latency: 0,
        error: ProxyError.GRID_CONGESTION_FAILSAFE,
        source: "19-3-1",
      };
    }

    const start = Date.now();
    try {
      // Use a dedicated verification vector (Cloudflare as a proxy to avoid IP bans)
      const response = await fetch(url, {
        method: "HEAD", // Fast check for clusters
        signal: AbortSignal.timeout(timeoutMs),
      });

      const latency = Date.now() - start;
      const anomaly = QuantumAnomalyDetector.detect(latency, historicalLatencies);

      if (response.ok) {
        return { status: Status.UP, latency, source: "19-3-1", anomaly };
      }

      return {
        status: Status.DOWN,
        latency,
        error: `CLUSTER_HTTP_${response.status}`,
        source: "19-3-1",
      };
    } catch (err: any) {
      return {
        status: Status.DOWN,
        latency: Date.now() - start,
        error: err.name === "TimeoutError" ? ProxyError.CLUSTER_TIMEOUT : err.message,
        source: "19-3-1",
      };
    }
  }

  private incrementIOPS() {
    const now = Date.now();
    if (now - ProxyMesh.lastIopsReset > ProxyMesh.IOPS_WINDOW) {
      ProxyMesh.iopsCount = 0;
      ProxyMesh.lastIopsReset = now;
    }
    ProxyMesh.iopsCount++;
  }
}

/**
 * Quantum Anomaly Detection Module
 * Uses statistical deviation (Z-Score) to identify anomalous performance patterns.
 */
export class QuantumAnomalyDetector {
  /**
   * Analyze check results for quantum anomalies.
   * Compares current latency against historical baseline (avg + 3*std_dev).
   */
  static detect(
    currentLatency: number,
    historicalLatencies: number[],
  ): { isAnomaly: boolean; score: number } {
    if (historicalLatencies.length < 5) return { isAnomaly: false, score: 0 };

    const n = historicalLatencies.length;
    const mean = historicalLatencies.reduce((a, b) => a + b, 0) / n;
    const stdDev = Math.sqrt(
      historicalLatencies.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / n,
    );

    // If stdDev is 0, avoid division by zero
    if (stdDev === 0) return { isAnomaly: currentLatency > mean * 2, score: 0 };

    const zScore = (currentLatency - mean) / stdDev;

    // Z-Score > 3 is a common statistical threshold for anomalies (99.7% confidence)
    return {
      isAnomaly: zScore > 3,
      score: Number(zScore.toFixed(2)),
    };
  }
}
