import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey } from "../../_lib/auth";
import { lookup } from "node:dns/promises";

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;

  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function isLocalHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "localhost" || h.endsWith(".localhost") || h === "::1";
}

const ALLOWED_PROBE_HOSTS = ["example.com"];

function isAllowedProbeHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return ALLOWED_PROBE_HOSTS.some((allowed) => h === allowed || h.endsWith(`.${allowed}`));
}

async function validateProbeUrl(
  rawUrl: string,
): Promise<{ ok: true; normalizedUrl: string } | { ok: false; error: string }> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, error: "url must be a valid absolute URL" };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, error: "url protocol must be http or https" };
  }

  if (!isAllowedProbeHostname(parsed.hostname)) {
    return { ok: false, error: "url hostname is not allowed" };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, error: "url must not include credentials" };
  }

  const hostname = parsed.hostname;
  if (isLocalHostname(hostname)) {
    return { ok: false, error: "local/internal addresses are not allowed" };
  }

  if (isPrivateIpv4(hostname)) {
    return { ok: false, error: "private/internal addresses are not allowed" };
  }

  if (hostname.includes(":")) {
    const lowered = hostname.toLowerCase();
    if (
      lowered === "::1" ||
      lowered.startsWith("fc") ||
      lowered.startsWith("fd") ||
      lowered.startsWith("fe80:")
    ) {
      return { ok: false, error: "private/internal addresses are not allowed" };
    }
  }

  try {
    const resolved = await lookup(hostname, { all: true });
    for (const addr of resolved) {
      const ip = addr.address;
      if (isPrivateIpv4(ip)) {
        return {
          ok: false,
          error: "private/internal addresses are not allowed",
        };
      }
      const lowerIp = ip.toLowerCase();
      if (
        lowerIp === "::1" ||
        lowerIp.startsWith("fc") ||
        lowerIp.startsWith("fd") ||
        lowerIp.startsWith("fe80:")
      ) {
        return {
          ok: false,
          error: "private/internal addresses are not allowed",
        };
      }
    }
  } catch {
    return { ok: false, error: "url hostname could not be resolved" };
  }

  return { ok: true, normalizedUrl: parsed.toString() };
}

export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req, "read");
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    url,
    regions = ["wnam", "weur", "apac"],
    method = "GET",
    expectedStatus = [200, 201, 204, 301, 302, 307, 308],
    timeoutMs = 8000,
  } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "url is required and must be a string" }, { status: 400 });
  }

  const validation = await validateProbeUrl(url);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }
  const safeUrl = validation.normalizedUrl;

  const regionList: string[] = Array.isArray(regions) ? regions : ["wnam", "weur", "apac"];

  // Perform multi-region parallel synthetic fetch
  const regionNames: Record<string, { name: string; flag: string }> = {
    wnam: { name: "North America West", flag: "🇺🇸" },
    enam: { name: "North America East", flag: "🇺🇸" },
    weur: { name: "Western Europe", flag: "🇩🇪" },
    eeur: { name: "Eastern Europe", flag: "🇵🇱" },
    apac: { name: "Asia Pacific", flag: "🇸🇬" },
    "apac-ne": { name: "Asia Pacific Northeast", flag: "🇯🇵" },
    "apac-se": { name: "Asia Pacific Southeast", flag: "🇦🇺" },
  };

  const results = await Promise.all(
    regionList.map(async (regionCode) => {
      const start = Date.now();
      const meta = regionNames[regionCode] || { name: regionCode, flag: "🌐" };
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(safeUrl, {
          method: method.toUpperCase(),
          headers: {
            "User-Agent": `SteadyStack-Edge-Probe/1.0 (${regionCode})`,
          },
          signal: controller.signal,
          redirect: "error",
        });
        clearTimeout(timer);

        const latencyMs = Date.now() - start;
        const isExpected = expectedStatus.includes(res.status);

        return {
          region: regionCode,
          name: meta.name,
          flag: meta.flag,
          status: isExpected ? "UP" : "DOWN",
          httpCode: res.status,
          latencyMs,
          error: isExpected ? null : `Unexpected HTTP ${res.status}`,
        };
      } catch (err: any) {
        const latencyMs = Date.now() - start;
        return {
          region: regionCode,
          name: meta.name,
          flag: meta.flag,
          status: "DOWN",
          httpCode: 0,
          latencyMs,
          error:
            err.name === "AbortError" ? "Connection timed out" : err.message || "Network Error",
        };
      }
    }),
  );

  const passedCount = results.filter((r) => r.status === "UP").length;
  const quorumPass = passedCount > results.length / 2;
  const avgLatency = Math.round(
    results.reduce((acc, curr) => acc + curr.latencyMs, 0) / (results.length || 1),
  );

  return NextResponse.json({
    data: {
      url: safeUrl,
      status: quorumPass ? "UP" : "DOWN",
      overallLatencyMs: avgLatency,
      quorumPass,
      quorumRatio: `${passedCount}/${results.length}`,
      regions: results,
      checkedAt: new Date().toISOString(),
    },
  });
}
