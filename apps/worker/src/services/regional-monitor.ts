/**
 * Regional Monitoring Service
 *
 * Dispatches checks to geographically pinned Cloudflare RegionalProbe Durable Objects.
 * Evaluates results using the 4-of-7 Quorum Consensus Engine.
 */

import { isPrivateOrInternalUrlAsync, decryptSecret } from "@steadystack/core";
import {
  CLOUDFLARE_PROBE_REGIONS,
  FREE_TIER_PROBE_REGIONS,
  getRegionByCode,
  type DOLocationHint,
  STEADYSTACK_CANONICAL_USER_AGENT,
} from "@steadystack/shared";
import type { ProbeCheckResult } from "@steadystack/types";
import type { Env } from "../env";
import { evaluateQuorum, type QuorumConfig } from "./quorum-engine";

export interface RegionalCheckResult {
  region: string;
  status: "UP" | "DOWN";
  latency: number;
  timestamp: Date;
  errorReason?: string | undefined;
  errorClass?: string | undefined;
  colo?: string | undefined;
  asn?: string | undefined;
}

export interface Monitor {
  id: string;
  name: string;
  url: string;
  interval?: number | null;
  timeout?: number | null;
  method?: string | null;
  headers?: string | null;
  body?: string | null;
  expectation?: string | null;
  alertThreshold?: number | null;
  dynamicThresholding?: boolean | null;
  checkRegions?: string | null;
  runbookUrl?: string | null;
}

/**
 * Performs a single check for a region, prioritizing RegionalProbe DOs
 */
export async function checkSingleRegion(
  env: Env,
  monitor: Monitor,
  regionCode: string,
): Promise<RegionalCheckResult> {
  const start = performance.now();
  const regionDef = getRegionByCode(regionCode);
  const resolvedRegion = regionDef?.code || regionCode;

  // 1. Prioritize DO-based execution ONLY if explicitly enabled (paid plan)
  if (env.ENABLE_DURABLE_OBJECTS === "true" && env.REGIONAL_PROBE && regionDef?.isCloudflareDO) {
    try {
      const probeId = env.REGIONAL_PROBE.idFromName(resolvedRegion);
      const probe = env.REGIONAL_PROBE.get(probeId, {
        locationHint: (regionDef.code as DOLocationHint) || "wnam",
      });

      const res = await probe.fetch(
        new Request("https://probe/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ monitor, isScheduledAlarm: false }),
        }),
      );

      if (res.ok) {
        const r = (await res.json()) as ProbeCheckResult;
        if (r) {
          return {
            region: resolvedRegion,
            status: r.status,
            latency: r.latency,
            timestamp: new Date(r.timestamp),
            errorReason: r.errorReason,
            errorClass: r.errorClass,
            colo: r.colo,
            asn: r.asn,
          };
        }
      }
    } catch (doErr) {
      console.warn(
        `[RegionalProbe:${resolvedRegion}] DO dispatch failed, falling back to edge fetch:`,
        doErr,
      );
    }
  }

  // 2. Direct edge fetch fallback with SSRF check
  try {
    const ssrfCheck = await isPrivateOrInternalUrlAsync(monitor.url);
    if (ssrfCheck.isForbidden) {
      return {
        region: resolvedRegion,
        status: "DOWN",
        latency: Math.round(performance.now() - start),
        timestamp: new Date(),
        errorReason: `SSRF_PROTECTION: ${ssrfCheck.reason}`,
        errorClass: "SECURITY_VIOLATION",
      };
    }

    const userHeaders: Record<string, string> = {};
    if (monitor.headers) {
      try {
        const rawHeaders = await decryptSecret(monitor.headers, env?.ENCRYPTION_SECRET);
        const parsed = JSON.parse(rawHeaders);
        if (Array.isArray(parsed)) {
          for (const h of parsed as { key?: string; value?: string }[]) {
            if (h.key && h.value) userHeaders[h.key] = h.value;
          }
        } else if (typeof parsed === "object" && parsed !== null) {
          Object.assign(userHeaders, parsed);
        }
      } catch {}
    }

    const hasBody =
      ["POST", "PUT", "PATCH"].includes(monitor.method || "GET") && Boolean(monitor.body);

    const response = await fetch(monitor.url, {
      method: monitor.method || "GET",
      headers: {
        "User-Agent": STEADYSTACK_CANONICAL_USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-CH-UA": '"Chromium";v="133", "Not(A:Brand";v="99", "Google Chrome";v="133"',
        "Sec-CH-UA-Mobile": "?0",
        "Sec-CH-UA-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        ...userHeaders,
      },
      ...(hasBody && monitor.body ? { body: monitor.body } : {}),
      signal: AbortSignal.timeout(((monitor.timeout || 10) as number) * 1000),
      redirect: "follow",
    });

    await response.text();

    const latency = Math.round(performance.now() - start);
    const statusNum = Number(response.status);
    const isUp =
      response.ok || (statusNum >= 300 && statusNum < 400) || [403, 429].includes(statusNum);

    return {
      region: resolvedRegion,
      status: isUp ? "UP" : "DOWN",
      latency,
      timestamp: new Date(),
      errorReason: isUp ? undefined : `HTTP ${response.status}`,
      errorClass: isUp ? undefined : statusNum >= 500 ? "SERVER_ERROR" : "CLIENT_ERROR",
    };
  } catch (error: any) {
    let errorClass = "NETWORK_ERROR";
    let errorReason = error instanceof Error ? error.message : "Unknown error";
    let latency = Math.round(performance.now() - start);

    if (error.name === "TimeoutError" || error.message?.includes("timeout")) {
      errorClass = "TIMEOUT";
      const timeoutSeconds = monitor.timeout || 10;
      errorReason = `Timed out after ${timeoutSeconds}s`;
      latency = timeoutSeconds * 1000;
    } else if (error.message?.includes("fetch")) {
      errorClass = "DNS_OR_CONNECT_FAILURE";
    }

    return {
      region: resolvedRegion,
      status: "DOWN",
      latency,
      timestamp: new Date(),
      errorReason,
      errorClass,
    };
  }
}

/**
 * Perform checks from all configured or default probe regions for a monitor
 */
export async function performRegionalChecks(
  monitor: Monitor,
  env?: Env,
): Promise<RegionalCheckResult[]> {
  let targetRegions: string[] = [];

  if (monitor.checkRegions) {
    try {
      targetRegions = JSON.parse(monitor.checkRegions);
    } catch {
      targetRegions = [];
    }
  }

  // If no regions configured, use default primary regions on free tier (2-of-3 quorum)
  if (targetRegions.length === 0) {
    targetRegions = ["wnam", "weur", "apac"];
  } else if (targetRegions.length > 3) {
    // Select 3 geographically distributed regions (Americas, Europe, Asia/Pacific)
    // to guarantee global quorum while staying well under Cloudflare Workers' 50 subrequest limit per tick
    const keyRegions = ["wnam", "weur", "apac"];
    const filtered = targetRegions.filter((r) => keyRegions.includes(r));
    targetRegions = filtered.length >= 3 ? filtered : targetRegions.slice(0, 3);
  }

  // Execute checks in bounded concurrency (max 5 simultaneous subrequests) to respect DO limits
  const results: RegionalCheckResult[] = [];
  const concurrency = 5;
  for (let i = 0; i < targetRegions.length; i += concurrency) {
    const chunk = targetRegions.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map((region) => checkSingleRegion(env!, monitor, region)),
    );
    results.push(...chunkResults);
  }
  return results;
}

/**
 * Evaluate overall status using Quorum Consensus Engine (4-of-7 confirmation)
 */
export function getOverallStatus(
  results: RegionalCheckResult[],
  monitorId: string = "default",
): "UP" | "DOWN" | "DEGRADED" {
  if (results.length === 0) return "UP";

  const probeResults: ProbeCheckResult[] = results.map((r) => ({
    monitorId,
    probeId: `probe-${r.region}`,
    region: r.region,
    status: r.status,
    latency: r.latency,
    errorReason: r.errorReason,
    errorClass: r.errorClass,
    timestamp: r.timestamp.toISOString(),
  }));

  const quorumEval = evaluateQuorum(monitorId, probeResults);
  return quorumEval.finalStatus;
}

/**
 * Get average latency across healthy UP regions
 */
export function getAverageLatency(results: RegionalCheckResult[]): number {
  const upResults = results.filter((r) => r.status === "UP");
  if (upResults.length === 0) return 0;

  const total = upResults.reduce((sum, r) => sum + r.latency, 0);
  return Math.round(total / upResults.length);
}
