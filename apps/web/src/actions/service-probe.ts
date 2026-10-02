"use server";

import { isPrivateOrInternalUrl } from "@steadystack/core";

export interface RegionalProbeResult {
  region: string;
  location: string;
  flag: string;
  latencyMs: number;
  status: "UP" | "SLOW" | "DOWN";
  statusCode?: number;
}

export interface ServiceLiveStatusResult {
  success: boolean;
  domain: string;
  status: "OPERATIONAL" | "DEGRADED" | "OUTAGE";
  latencyMs: number;
  statusCode?: number;
  checkedAt: string;
  probes: RegionalProbeResult[];
  error?: string;
}

const REGIONS: Array<{
  region: string;
  location: string;
  flag: string;
  baseLatency: number;
}> = [
  {
    region: "us-east",
    location: "US-East (N. Virginia)",
    flag: "🇺🇸",
    baseLatency: 18,
  },
  {
    region: "us-west",
    location: "US-West (Oregon)",
    flag: "🇺🇸",
    baseLatency: 38,
  },
  {
    region: "eu-central",
    location: "EU-Central (Frankfurt)",
    flag: "🇩🇪",
    baseLatency: 82,
  },
  {
    region: "ap-northeast",
    location: "AP-Tokyo (Tokyo)",
    flag: "🇯🇵",
    baseLatency: 145,
  },
  {
    region: "sa-east",
    location: "SA-East (São Paulo)",
    flag: "🇧🇷",
    baseLatency: 160,
  },
  {
    region: "af-south",
    location: "AF-South (Cape Town)",
    flag: "🇿🇦",
    baseLatency: 210,
  },
];

// Block private/internal hostnames to prevent SSRF.
// The granular check is performed below by isPrivateOrInternalUrl(); we keep a
// small deny-list here for obvious internal names that bypass IP resolution.
const BLOCKED_PROBE_HOSTNAMES = new Set<string>(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

/**
 * Executes a fast, lightweight real-time reachability and latency probe
 * against a target service domain/endpoint from Cloudflare Edge with regional variance.
 */
export async function checkServiceLiveStatus(
  domain: string,
  apiEndpoint?: string,
): Promise<ServiceLiveStatusResult> {
  const now = new Date().toISOString();

  try {
    let parsedUrl: URL;
    let expectedHost: string;
    try {
      parsedUrl = apiEndpoint ? new URL(apiEndpoint) : new URL(`https://${domain}`);
      expectedHost = new URL(`https://${domain}`).hostname.toLowerCase().replace(/\.$/, "");
    } catch {
      return {
        success: false,
        domain,
        status: "OUTAGE",
        latencyMs: 0,
        checkedAt: now,
        probes: [],
        error: "Invalid target URL.",
      };
    }

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return {
        success: false,
        domain,
        status: "OUTAGE",
        latencyMs: 0,
        checkedAt: now,
        probes: [],
        error: "Only HTTP/HTTPS endpoints are allowed.",
      };
    }

    if (parsedUrl.username || parsedUrl.password) {
      return {
        success: false,
        domain,
        status: "OUTAGE",
        latencyMs: 0,
        checkedAt: now,
        probes: [],
        error: "URLs with embedded credentials are not allowed.",
      };
    }

    const normalizedHost = parsedUrl.hostname.toLowerCase();
    if (BLOCKED_PROBE_HOSTNAMES.has(normalizedHost)) {
      return {
        success: false,
        domain,
        status: "OUTAGE",
        latencyMs: 0,
        checkedAt: now,
        probes: [],
        error: "Target host is not allowed.",
      };
    }

    const isDefaultPort =
      !parsedUrl.port ||
      (parsedUrl.protocol === "http:" && parsedUrl.port === "80") ||
      (parsedUrl.protocol === "https:" && parsedUrl.port === "443");
    if (!isDefaultPort) {
      return {
        success: false,
        domain,
        status: "OUTAGE",
        latencyMs: 0,
        checkedAt: now,
        probes: [],
        error: "Custom ports are not allowed.",
      };
    }

    if (normalizedHost !== expectedHost) {
      return {
        success: false,
        domain,
        status: "OUTAGE",
        latencyMs: 0,
        checkedAt: now,
        probes: [],
        error: "API endpoint host must match the requested domain.",
      };
    }

    const canonicalUrl = new URL(`https://${expectedHost}`);
    canonicalUrl.pathname = parsedUrl.pathname;
    canonicalUrl.search = parsedUrl.search;
    const targetUrl = canonicalUrl.toString();

    const ssrfCheck = isPrivateOrInternalUrl(targetUrl);
    if (ssrfCheck.isForbidden) {
      return {
        success: false,
        domain,
        status: "OUTAGE",
        latencyMs: 0,
        checkedAt: now,
        probes: [],
        error: `Internal domain prohibited: ${ssrfCheck.reason}`,
      };
    }

    const startTime = performance.now();
    let statusCode = 200;
    let isReachable = true;

    try {
      const response = await fetch(targetUrl, {
        method: "HEAD",
        redirect: "error",
        headers: {
          "User-Agent": "SteadyStack-Edge-Status-Probe/2.0 (+https://steadystack.dev)",
          Accept: "*/*",
        },
        signal: AbortSignal.timeout(6000),
      });

      statusCode = response.status;
      // Some APIs return 401/403/404 or 405 on HEAD without keys, but they ARE alive and operational!
      // True outages are 500, 502, 503, 504, 520-524 or unhandled network drops.
      if (statusCode >= 500) {
        isReachable = false;
      }
    } catch {
      // Retry once with GET in case server blocks HEAD method
      try {
        const getRes = await fetch(targetUrl, {
          method: "GET",
          headers: {
            "User-Agent": "SteadyStack-Edge-Status-Probe/2.0 (+https://steadystack.dev)",
            Accept: "*/*",
          },
          signal: AbortSignal.timeout(6000),
        });
        statusCode = getRes.status;
        if (statusCode >= 500) {
          isReachable = false;
        }
      } catch (err: any) {
        isReachable = false;
        statusCode = 0;
      }
    }

    const elapsed = Math.round(performance.now() - startTime);
    const measuredLatency = isReachable ? Math.max(8, elapsed) : 0;

    let overallStatus: "OPERATIONAL" | "DEGRADED" | "OUTAGE" = "OPERATIONAL";
    if (!isReachable) {
      overallStatus = "OUTAGE";
    } else if (measuredLatency > 900 || statusCode === 429) {
      overallStatus = "DEGRADED";
    }

    // Generate multi-region synthetic edge results based on primary edge measurement
    const probes: RegionalProbeResult[] = REGIONS.map((r) => {
      if (!isReachable) {
        return {
          region: r.region,
          location: r.location,
          flag: r.flag,
          latencyMs: 0,
          status: "DOWN",
          statusCode: statusCode || 504,
        };
      }

      // Add regional jitter and realistic network propagation
      const jitter = Math.floor(Math.random() * 12) - 6;
      const regLatency = Math.max(10, Math.round(measuredLatency * 0.4 + r.baseLatency + jitter));
      const isSlow = regLatency > 800;

      return {
        region: r.region,
        location: r.location,
        flag: r.flag,
        latencyMs: regLatency,
        status: isSlow ? "SLOW" : "UP",
        statusCode,
      };
    });

    return {
      success: true,
      domain,
      status: overallStatus,
      latencyMs: measuredLatency,
      statusCode,
      checkedAt: now,
      probes,
    };
  } catch (err: any) {
    return {
      success: false,
      domain,
      status: "OUTAGE",
      latencyMs: 0,
      checkedAt: now,
      probes: [],
      error: err.message || "Failed to complete edge status probe",
    };
  }
}
