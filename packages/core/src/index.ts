import type { MonitorStatus } from "@steadystack/types";

/**
 * Fixed internal timeout (in seconds) applied to all uptime checks.
 * The per-monitor timeout setting has been removed; checks can never hang
 * longer than this.
 */
export const DEFAULT_CHECK_TIMEOUT_SECONDS = 10;

/**
 * Validates a target URL string to prevent Server-Side Request Forgery (SSRF)
 * against private IP ranges, local loopbacks, link-local addresses, and cloud metadata endpoints.
 */
/**
 * Checks whether an IP string (v4 or v6) belongs to a private, loopback, link-local, or cloud metadata range.
 */
export function isPrivateOrInternalIp(ip: string): {
  isForbidden: boolean;
  reason?: string;
} {
  const normalized = ip
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, "");

  // IPv6 checks
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") {
    return {
      isForbidden: true,
      reason: "IPv6 loopback address (::1) is forbidden",
    };
  }
  if (normalized === "::" || normalized === "0:0:0:0:0:0:0:0") {
    return {
      isForbidden: true,
      reason: "IPv6 unspecified address (::) is forbidden",
    };
  }
  if (normalized.startsWith("fe80:") || normalized.startsWith("fe80::")) {
    return {
      isForbidden: true,
      reason: "IPv6 link-local address range (fe80::/10) is forbidden",
    };
  }
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
    return {
      isForbidden: true,
      reason: "IPv6 unique local address range (fc00::/7) is forbidden",
    };
  }
  // IPv4-mapped IPv6 (::ffff:127.0.0.1)
  if (normalized.startsWith("::ffff:")) {
    const v4Part = normalized.replace("::ffff:", "");
    return isPrivateOrInternalIp(v4Part);
  }

  // Handle IPv4 decimal/hex/octal representations
  let p1: number, p2: number, p3: number, p4: number;
  const ipParts = normalized.split(".");
  if (ipParts.length === 4) {
    p1 = parseInt(ipParts[0] || "", 10);
    p2 = parseInt(ipParts[1] || "", 10);
    p3 = parseInt(ipParts[2] || "", 10);
    p4 = parseInt(ipParts[3] || "", 10);
  } else if (/^\d+$/.test(normalized)) {
    // Single Dword integer IP (e.g., 2130706433 for 127.0.0.1)
    const num = Number(BigInt(normalized));
    p1 = (num >> 24) & 255;
    p2 = (num >> 16) & 255;
    p3 = (num >> 8) & 255;
    p4 = num & 255;
  } else {
    return { isForbidden: false };
  }

  if (isNaN(p1) || isNaN(p2) || isNaN(p3) || isNaN(p4)) {
    return { isForbidden: false };
  }

  // 127.0.0.0/8 (Loopback)
  if (p1 === 127)
    return {
      isForbidden: true,
      reason: "Loopback address range (127.0.0.0/8) is forbidden",
    };
  // 10.0.0.0/8 (Private)
  if (p1 === 10)
    return {
      isForbidden: true,
      reason: "Private network range (10.0.0.0/8) is forbidden",
    };
  // 100.64.0.0/10 (Carrier-Grade NAT / Shared Address Space)
  if (p1 === 100 && p2 >= 64 && p2 <= 127)
    return {
      isForbidden: true,
      reason: "Carrier-Grade NAT range (100.64.0.0/10) is forbidden",
    };
  // 172.16.0.0/12 (Private)
  if (p1 === 172 && p2 >= 16 && p2 <= 31)
    return {
      isForbidden: true,
      reason: "Private network range (172.16.0.0/12) is forbidden",
    };
  // 192.168.0.0/16 (Private)
  if (p1 === 192 && p2 === 168)
    return {
      isForbidden: true,
      reason: "Private network range (192.168.0.0/16) is forbidden",
    };
  // 169.254.0.0/16 (Link-Local / AWS & Cloud Metadata)
  if (p1 === 169 && p2 === 254)
    return {
      isForbidden: true,
      reason: "Link-local/metadata range (169.254.0.0/16) is forbidden",
    };
  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (p1 === 192 && p2 === 0 && p3 === 0)
    return {
      isForbidden: true,
      reason: "IETF protocol range (192.0.0.0/24) is forbidden",
    };
  // 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (Documentation / Test-Net)
  if (
    (p1 === 192 && p2 === 0 && p3 === 2) ||
    (p1 === 198 && p2 === 51 && p3 === 100) ||
    (p1 === 203 && p2 === 0 && p3 === 113)
  )
    return {
      isForbidden: true,
      reason: "Documentation / Test-Net address range is forbidden",
    };
  // 198.18.0.0/15 (Network Benchmark Tests)
  if (p1 === 198 && (p2 === 18 || p2 === 19))
    return {
      isForbidden: true,
      reason: "Benchmark testing range (198.18.0.0/15) is forbidden",
    };
  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved / Broadcast)
  if (p1 >= 224)
    return {
      isForbidden: true,
      reason: "Multicast/Reserved/Broadcast address range is forbidden",
    };
  // 0.0.0.0/8
  if (p1 === 0)
    return {
      isForbidden: true,
      reason: "Unspecified/invalid target IP address (0.0.0.0/8)",
    };

  return { isForbidden: false };
}

/**
 * Validates a target URL string to prevent Server-Side Request Forgery (SSRF)
 * against private IP ranges, local loopbacks, link-local addresses, and cloud metadata endpoints.
 */
export function isPrivateOrInternalUrl(urlStr: string): {
  isForbidden: boolean;
  reason?: string;
} {
  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");

    // Block direct dangerous hostnames and internal TLDs
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname === "169.254.169.254" ||
      hostname === "metadata.google.internal" ||
      hostname === "instance-data" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan") ||
      hostname.endsWith(".home") ||
      hostname.endsWith(".corp")
    ) {
      return {
        isForbidden: true,
        reason: `Forbidden target host: ${hostname}`,
      };
    }

    // Check for embedded IP addresses in DNS wildcards (e.g. 127.0.0.1.nip.io, 169-254-169-254.sslip.io)
    const ipv4Embedded = hostname.match(
      /(?:^|\.)(\d{1,3}[.-]\d{1,3}[.-]\d{1,3}[.-]\d{1,3})(?:\.|$)/,
    );
    if (ipv4Embedded && ipv4Embedded[1]) {
      const normalizedIp = ipv4Embedded[1].replace(/-/g, ".");
      const check = isPrivateOrInternalIp(normalizedIp);
      if (check.isForbidden) {
        return {
          isForbidden: true,
          reason: `Embedded private IP detected in hostname: ${normalizedIp} (${check.reason || "Forbidden target IP"})`,
        };
      }
    }

    return isPrivateOrInternalIp(hostname);
  } catch {
    return { isForbidden: true, reason: "Malformed or unparseable URL" };
  }
}

/**
 * Asynchronously validates a target URL string, resolving DNS records in Node runtimes
 * to block DNS-rebinding attacks against private/internal IP ranges.
 */
export async function isPrivateOrInternalUrlAsync(urlStr: string): Promise<{
  isForbidden: boolean;
  reason?: string;
}> {
  const syncCheck = isPrivateOrInternalUrl(urlStr);
  if (syncCheck.isForbidden) return syncCheck;

  try {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");

    // Universal DoH (DNS-over-HTTPS) query: safe across Cloudflare Workers, Node.js, and OpenNext
    try {
      const dohRes = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`,
        {
          headers: { accept: "application/dns-json" },
          signal: AbortSignal.timeout(2000),
        },
      );
      if (dohRes.ok) {
        const dohData: any = await dohRes.json();
        if (Array.isArray(dohData.Answer)) {
          for (const ans of dohData.Answer) {
            if (ans.type === 1 && typeof ans.data === "string") {
              const ipCheck = isPrivateOrInternalIp(ans.data);
              if (ipCheck.isForbidden) {
                return {
                  isForbidden: true,
                  reason: `DNS Rebinding Protected: Hostname ${hostname} resolved to forbidden IP ${ans.data} (${ipCheck.reason || "Forbidden IP"})`,
                };
              }
            }
          }
        }
      }
    } catch {
      // If DoH query fails or times out, fallback to synchronous checks
    }
  } catch {
    return { isForbidden: true, reason: "Malformed URL" };
  }

  return { isForbidden: false };
}

/**
 * Formats a detailed, developer-friendly diagnostic trace when a network socket check or fetch fails.
 *
 * Classifies the failure into one of several categories (timeout, DNS failure,
 * connection refused, SSL/TLS failure, connection reset) and returns a
 * multi-line diagnostic string describing the target, stage, and suggested
 * remediation steps.
 *
 * @param err - The error object thrown by the network operation.
 * @param target - The host:port or URL that was being checked.
 * @returns A formatted multi-line diagnostic trace.
 */
export function diagnoseError(err: any, target: string): string {
  const msg = err.message || "";
  const name = err.name || "";
  const code = err.code || "";

  // 1. Timeout
  if (name === "TimeoutError" || msg.includes("Timeout") || msg.includes("timeout")) {
    return `TIMEOUT: Request timed out.
• Target: ${target}
• Stage: Response Transmission
• Diagnostics: Connection was established, but the server failed to transmit a response within the timeout limit.
• Action: Inspect server capacity, slow database queries, or frozen process pools.`;
  }

  // 2. DNS Resolution Failure
  if (
    code === "ENOTFOUND" ||
    msg.includes("getaddrinfo") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("dns") ||
    msg.includes("DNS")
  ) {
    return `DNS_FAILURE: DNS Lookup failed.
• Target: ${target}
• Stage: Domain Resolution
• Diagnostics: The hostname could not be resolved to any active IP address.
• Action: Verify domain registration status and check that valid A/AAAA DNS records are configured.`;
  }

  // 3. Connection Refused
  if (code === "ECONNREFUSED" || msg.includes("ECONNREFUSED") || msg.includes("refused")) {
    return `CONNECTION_REFUSED: TCP Handshake failed.
• Target: ${target}
• Stage: TCP Handshake
• Diagnostics: The target host is active, but actively rejected the connection request on this port.
• Action: Verify that the web server process (e.g. Node, Nginx) is running, listening, and that firewall policies permit traffic.`;
  }

  // 4. SSL/TLS Handshake Failures
  if (
    code.includes("CERT") ||
    msg.includes("cert") ||
    msg.includes("ssl") ||
    msg.includes("SSL") ||
    msg.includes("tls") ||
    msg.includes("TLS") ||
    msg.includes("expired") ||
    msg.includes("depth") ||
    msg.includes("handshake")
  ) {
    return `SSL_ERROR: TLS Handshake failed.
• Target: ${target}
• Stage: SSL/TLS Negotiation
• Diagnostics: Could not establish a secure, verified cryptographic channel.
• Action: Check if the SSL certificate has expired, has a hostname mismatch, or uses an untrusted Certificate Authority.`;
  }

  // 5. Connection Reset/Aborted
  if (code === "ECONNRESET" || msg.includes("ECONNRESET") || msg.includes("reset")) {
    return `CONNECTION_RESET: Connection terminated abruptly.
• Target: ${target}
• Stage: TCP Connection
• Diagnostics: The connection was closed mid-transmission by the target server or an intermediate proxy/firewall.
• Action: Check server-side proxy limits, rate limiters, or firewall settings.`;
  }

  return `CONNECTION_FAILED: Request failed (${msg || code || "Unknown error"}).
• Target: ${target}
• Stage: Request Dispatch
• Diagnostics: An error occurred before receiving the HTTP response headers.
• Action: Verify network route availability to the target server.`;
}

/**
 * Formats a detailed diagnostic trace for unhealthy HTTP status codes.
 *
 * Provides targeted guidance for common gateway/application errors (502, 503,
 * 504, 500, 404) and a generic template for any other unhealthy status.
 *
 * @param status - The HTTP status code returned by the target server.
 * @param target - The URL that was being checked.
 * @returns A formatted multi-line diagnostic trace.
 */
export function diagnoseStatus(status: number, target: string): string {
  if (status === 502) {
    return `HTTP_502: Bad Gateway.
• Target: ${target}
• Stage: Proxy Upstream
• Diagnostics: The proxy server (e.g. Cloudflare, Nginx, ALB) received an invalid response from the backend application process.
• Action: Check if the application server process (e.g. PM2, Docker container) crashed, failed to start, or returned malformed headers.`;
  }

  if (status === 504) {
    return `HTTP_504: Gateway Timeout.
• Target: ${target}
• Stage: Proxy Upstream
• Diagnostics: The gateway server timed out waiting for the upstream application server to respond.
• Action: Investigate slow application handlers, database latency spikes, or infinite process loops.`;
  }

  if (status === 500) {
    return `HTTP_500: Internal Server Error.
• Target: ${target}
• Stage: Application Execution
• Diagnostics: The server encountered an unhandled exception or critical runtime crash while rendering the request.
• Action: Inspect your application server runtime logs for unhandled exceptions or stack traces.`;
  }

  if (status === 503) {
    return `HTTP_503: Service Unavailable.
• Target: ${target}
• Stage: Server Availability
• Diagnostics: The server is temporarily overloaded or down for planned maintenance.
• Action: Monitor RAM/CPU utilization and verify if a server deploy is in progress.`;
  }

  if (status === 404) {
    return `HTTP_404: Not Found.
• Target: ${target}
• Stage: Resource Routing
• Diagnostics: The server is online, but the requested URI path does not map to any active routes.
• Action: Double check that the request path is configured correctly in the client and server route files.`;
  }

  return `HTTP_${status}: Unhealthy Status Code.
• Target: ${target}
• Stage: HTTP Handshake
• Diagnostics: The request completed, but the status code was classified as unhealthy.
• Action: Verify server endpoint routing logic.`;
}

/**
 * Universal port connection checker that automatically detects the runtime environment.
 * Supports:
 * - Node.js (via net.connect)
 * - Cloudflare Workers (via cloudflare:sockets)
 * - Standard fetch bypass for HTTP(S) ports 80 and 443
 *
 * @param host - The hostname or IP address to connect to.
 * @param port - The TCP port to check.
 * @param timeoutMs - Connection timeout in milliseconds (default 3000).
 * @returns An object with the connection result: whether the port is open, the
 *   measured latency in ms, the connection status ("OPEN", "CLOSED", "TIMEOUT",
 *   "BLOCKED"), and an optional diagnostic error reason.
 */
export async function checkPortUniversal(
  host: string,
  port: number,
  timeoutMs = 3000,
): Promise<{
  isOpen: boolean;
  latency: number;
  status: string;
  errorReason?: string;
}> {
  const start = Date.now();
  const targetStr = `${host}:${port}`;

  // 1. HTTP/S Port check using fetch bypass
  if (port === 80 || port === 443) {
    try {
      const protocol = port === 443 ? "https" : "http";
      const signal = AbortSignal.timeout(timeoutMs);
      await fetch(`${protocol}://${host}`, { method: "HEAD", signal });
      return { isOpen: true, latency: Date.now() - start, status: "OPEN" };
    } catch (e: any) {
      return {
        isOpen: false,
        latency: 0,
        status: "CLOSED",
        errorReason: diagnoseError(e, targetStr),
      };
    }
  }

  // 2. Node.js Environment Check (via dynamic import of 'net')
  try {
    // @ts-ignore
    const net = await import("net");
    if (net && typeof net.connect === "function") {
      return await new Promise((resolve) => {
        const socket = net.connect({ host, port });
        const timer = setTimeout(() => {
          socket.destroy();
          resolve({
            isOpen: false,
            latency: 0,
            status: "TIMEOUT",
            errorReason: `TIMEOUT: Connection timed out.\n• Target: ${targetStr}\n• Diagnostics: Handshake timed out after ${timeoutMs}ms.`,
          });
        }, timeoutMs);

        socket.on("connect", () => {
          clearTimeout(timer);
          const latency = Date.now() - start;
          socket.end();
          resolve({ isOpen: true, latency, status: "OPEN" });
        });

        socket.on("error", (err: any) => {
          clearTimeout(timer);
          socket.destroy();
          resolve({
            isOpen: false,
            latency: 0,
            status: "CLOSED",
            errorReason: diagnoseError(err, targetStr),
          });
        });
      });
    }
  } catch (err) {
    // Fallthrough to Cloudflare Workers check if not in Node.js
  }

  // 3. Cloudflare Workers Environment Check (via dynamic import of 'cloudflare:sockets')
  try {
    // @ts-ignore
    const { connect } = await import("cloudflare:sockets");
    if (typeof connect === "function") {
      const socket = connect({ hostname: host, port });

      const timeoutPromise = new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), timeoutMs),
      );

      await Promise.race([socket.opened, timeoutPromise]);
      const latency = Date.now() - start;
      await socket.close();
      return { isOpen: true, latency, status: "OPEN" };
    }
  } catch (err: any) {
    let status = "CLOSED";
    if (err.message === "Timeout") {
      status = "TIMEOUT";
    } else if (err.message && err.message.includes("not permitted")) {
      status = "BLOCKED";
    }
    return {
      isOpen: false,
      latency: 0,
      status,
      errorReason: diagnoseError(err, targetStr),
    };
  }

  return {
    isOpen: false,
    latency: 0,
    status: "CLOSED",
    errorReason: "NO_COMPATIBLE_RUNTIME",
  };
}

/**
 * One hop in an HTTP redirect chain.
 */
export interface RedirectHop {
  /** The URL that was requested and responded with a redirect. */
  url: string;
  /** The 3xx status code returned. */
  status: number;
  /** The fully-resolved redirect target from the Location header. */
  location: string;
}

/**
 * Builds an undici Dispatcher presenting a client certificate (mTLS).
 * Returns null on runtimes without undici (Cloudflare Workers) — callers
 * should surface a clear unsupported-runtime error instead of silently
 * downgrading to an anonymous connection.
 */
export async function createMtlsDispatcher(certPem: string, keyPem: string): Promise<any | null> {
  try {
    // @ts-ignore — undici is bundled with Node; absent on Workers
    const { Agent } = await import("undici");
    return new Agent({ connect: { cert: certPem, key: keyPem } });
  } catch {
    return null;
  }
}

/**
 * Follows a URL's full redirect chain with per-hop SSRF validation and
 * reports every hop. Read-only diagnostic: always a GET, never enforces
 * monitor expectations, and capped at the same 5-hop limit as checks.
 */
export async function inspectRedirectChain(
  urlStr: string,
  config: { timeoutSeconds?: number; maxHops?: number } = {},
): Promise<{
  hops: RedirectHop[];
  finalUrl: string;
  finalStatus: number | null;
  errorReason?: string | undefined;
}> {
  const timeoutMs = (config.timeoutSeconds || DEFAULT_CHECK_TIMEOUT_SECONDS) * 1000;
  const maxHops = Math.max(1, Math.min(config.maxHops ?? 5, 10));

  let currentUrl = urlStr;
  const hops: RedirectHop[] = [];

  while (hops.length < maxHops) {
    const ssrfCheck = await isPrivateOrInternalUrlAsync(currentUrl);
    if (ssrfCheck.isForbidden) {
      return {
        hops,
        finalUrl: currentUrl,
        finalStatus: null,
        errorReason: `SSRF_PROTECTION: ${ssrfCheck.reason || "Forbidden target URL or redirect target"}`,
      };
    }

    let response: Response;
    try {
      response = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (err: any) {
      return {
        hops,
        finalUrl: currentUrl,
        finalStatus: null,
        errorReason: diagnoseError(err, currentUrl),
      };
    }

    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return { hops, finalUrl: currentUrl, finalStatus: response.status };
    }

    const location = response.headers.get("location");
    if (!location) {
      // Redirect without a Location header — dead end.
      return { hops, finalUrl: currentUrl, finalStatus: response.status };
    }
    const nextUrl = new URL(location, currentUrl).href;
    hops.push({ url: currentUrl, status: response.status, location: nextUrl });
    currentUrl = nextUrl;
  }

  return {
    hops,
    finalUrl: currentUrl,
    finalStatus: null,
    errorReason: `TOO_MANY_REDIRECTS: Exceeded maximum redirect hop count of ${maxHops}`,
  };
}

/**
 * Universal HTTP/HTTPS request checker that handles redirect following, custom headers, and timeouts.
 *
 * @param urlStr - The URL to check.
 * @param config - Request configuration: HTTP method, headers (as a JSON string
 *   or object), request body, and timeout in seconds.
 * @returns The check result: monitor status ("UP"|"DOWN"), latency in ms, an
 *   optional diagnostic error reason, the response body text, and the HTTP
 *   status code when a response was received.
 */
export async function checkHttpUniversal(
  urlStr: string,
  config: {
    method?: string;
    headers?: string | Record<string, string>;
    body?: string;
    timeoutSeconds?: number;
    /** PEM-encoded client certificate chain (mTLS). Node runtimes only. */
    clientCert?: string;
    /** PEM-encoded private key for the client certificate (mTLS). Node runtimes only. */
    clientKey?: string;
  } = {},
): Promise<{
  status: MonitorStatus;
  latency: number;
  errorReason?: string | undefined;
  bodyText: string;
  statusCode?: number | undefined;
  /** Final response body size in bytes (as received, before any truncation). */
  bodySizeBytes?: number | undefined;
  /** Redirect hops followed to reach the final response. */
  redirectChain?: RedirectHop[] | undefined;
}> {
  const start = Date.now();
  const method = config?.method || "GET";
  const timeoutMs = (config.timeoutSeconds || DEFAULT_CHECK_TIMEOUT_SECONDS) * 1000;

  // mTLS: undici Dispatcher with client cert — Node-only. Workers has no such
  // dispatcher concept, so this resolves to null there.
  let mtlsDispatcher: any = undefined;
  if (config.clientCert && config.clientKey) {
    mtlsDispatcher = await createMtlsDispatcher(config.clientCert, config.clientKey);
    if (!mtlsDispatcher) {
      return {
        status: "DOWN",
        latency: 0,
        errorReason: "MTLS_UNSUPPORTED_RUNTIME: Client certificates are only supported on Node.js-based checkers",
        bodyText: "",
      };
    }
  }
  const userHeaders: Record<string, string> = {};

  if (config.headers) {
    if (typeof config.headers === "string") {
      try {
        const parsed = JSON.parse(config.headers);
        if (Array.isArray(parsed)) {
          parsed.forEach((h: { key: string; value: string }) => {
            if (h.key) userHeaders[h.key] = h.value;
          });
        } else if (typeof parsed === "object") {
          Object.assign(userHeaders, parsed);
        }
      } catch {}
    } else if (typeof config.headers === "object") {
      Object.assign(userHeaders, config.headers);
    }
  }

  // Response body size limit: 5MB (5,242,880 bytes)
  const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

  let currentUrl = urlStr;
  let response: Response | null = null;
  let hops = 0;
  const maxHops = 5;
  const redirectChain: RedirectHop[] = [];

  while (hops < maxHops) {
    const ssrfCheck = await isPrivateOrInternalUrlAsync(currentUrl);
    if (ssrfCheck.isForbidden) {
      return {
        status: "DOWN",
        latency: Date.now() - start,
        errorReason: `SSRF_PROTECTION: ${ssrfCheck.reason || "Forbidden target URL or redirect target"}`,
        bodyText: "",
        redirectChain,
      };
    }

    try {
      response = await fetch(currentUrl, {
        method: hops === 0 ? method : "GET", // Follow redirects with GET
        redirect: "manual",
        headers: {
          "User-Agent":
            userHeaders["User-Agent"] ||
            userHeaders["user-agent"] ||
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
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
        body:
          hops === 0 && ["POST", "PUT", "PATCH"].includes(method) ? (config.body ?? null) : null,
        signal: AbortSignal.timeout(timeoutMs),
        // @ts-ignore — dispatcher is undici-specific; ignored on other runtimes
        dispatcher: mtlsDispatcher,
      });

      // Handle redirect chain manually to re-apply SSRF validation per hop
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) break;
        const nextUrl = new URL(location, currentUrl).href;
        redirectChain.push({
          url: currentUrl,
          status: response.status,
          location: nextUrl,
        });
        currentUrl = nextUrl;
        hops++;
        continue;
      }

      break;
    } catch (err: any) {
      const latency = Date.now() - start;
      const errorReason = diagnoseError(err, currentUrl);
      return {
        status: errorReason.startsWith("TIMEOUT") ? "DEGRADED" : "DOWN",
        latency,
        errorReason,
        bodyText: "",
        redirectChain,
      };
    }
  }

  if (!response) {
    return {
      status: "DOWN",
      latency: Date.now() - start,
      errorReason: "TOO_MANY_REDIRECTS: Exceeded maximum redirect hop count of 5",
      bodyText: "",
      redirectChain,
    };
  }

  // The loop can also exit with the last response still being a redirect —
  // that means the hop cap was hit. Without this, a 302 would fall through
  // to the "3xx is healthy" classifier and wrongly report UP.
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    return {
      status: "DOWN",
      latency: Date.now() - start,
      errorReason: "TOO_MANY_REDIRECTS: Exceeded maximum redirect hop count of 5",
      bodyText: "",
      statusCode: response.status,
      redirectChain,
    };
  }

  // Stream body with strict size limit to prevent OOM/memory exhaustion
  let bodyText = "";
  let bodySizeBytes = 0;
  if (response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        bodySizeBytes += value.length;
        if (bodySizeBytes > MAX_RESPONSE_BYTES) {
          reader.cancel("Response size exceeded maximum limit of 5MB");
          return {
            status: "DOWN",
            latency: Date.now() - start,
            errorReason: "RESPONSE_TOO_LARGE: Exceeded maximum body size limit of 5MB",
            bodyText: bodyText.substring(0, 1024) + "... [truncated]",
            statusCode: response.status,
            bodySizeBytes,
            redirectChain,
          };
        }
        bodyText += decoder.decode(value, { stream: true });
      }
    }
  }

  const latency = Date.now() - start;
  const statusNum = Number(response.status);
  const isRateLimited = statusNum === 429;
  const isIPBlocked = statusNum === 403;
  const isHealthyStatus =
    response.ok || (statusNum >= 300 && statusNum < 400) || isRateLimited || isIPBlocked;

  return {
    status: isHealthyStatus ? "UP" : "DOWN",
    latency,
    errorReason: isHealthyStatus ? undefined : diagnoseStatus(response.status, currentUrl),
    bodyText,
    statusCode: statusNum,
    bodySizeBytes,
    redirectChain: redirectChain.length > 0 ? redirectChain : undefined,
  };
}

declare global {
  var ENCRYPTION_SECRET: string | undefined;
  var BETTER_AUTH_SECRET: string | undefined;
}

/**
 * AES-256-GCM Field-Level Encryption Utilities for credentials at rest
 */
const ENCRYPTION_PREFIX = "enc:v1:";

export function isEncrypted(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(ENCRYPTION_PREFIX);
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );
  // Fixed domain-separated salt for deterministic key derivation from secret
  const salt = enc.encode("steadystack:credential-store:v1");
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptSecret(plainText: string, secretKey?: string): Promise<string> {
  if (!plainText) return "";
  const secret =
    secretKey ||
    (typeof process !== "undefined"
      ? process.env?.ENCRYPTION_SECRET || process.env?.BETTER_AUTH_SECRET
      : globalThis.ENCRYPTION_SECRET);

  if (!secret) return plainText; // Fallback if no encryption key is configured
  if (isEncrypted(plainText)) return plainText;

  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plainText);

  const cipherBuffer = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

  const combined = new Uint8Array(iv.length + cipherBuffer.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipherBuffer), iv.length);

  let binary = "";
  for (let i = 0; i < combined.byteLength; i++) {
    binary += String.fromCharCode(combined[i] ?? 0);
  }
  const base64 = btoa(binary);
  return `${ENCRYPTION_PREFIX}${base64}`;
}

export async function decryptSecret(
  cipherText: string | null | undefined,
  secretKey?: string,
): Promise<string> {
  if (!cipherText || typeof cipherText !== "string") return "";
  if (!isEncrypted(cipherText)) return cipherText; // Return plaintext directly if not encrypted

  const secret =
    secretKey ||
    (typeof process !== "undefined"
      ? process.env?.ENCRYPTION_SECRET || process.env?.BETTER_AUTH_SECRET
      : globalThis.ENCRYPTION_SECRET);

  if (!secret) return cipherText;

  try {
    const base64 = cipherText.slice(ENCRYPTION_PREFIX.length);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const iv = bytes.slice(0, 12);
    const data = bytes.slice(12);

    const key = await deriveKey(secret);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    console.error("[Crypto] Failed to decrypt payload, returning raw input:", err);
    return cipherText;
  }
}

/**
 * PBKDF2 Password Hashing & Verification Utilities for Status Page Access Gates
 */
const HASH_PREFIX = "pbkdf2:v1:";

export async function hashPassword(password: string): Promise<string> {
  if (!password) return "";
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  const hashArray = new Uint8Array(derivedBits);
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt, 0);
  combined.set(hashArray, salt.length);

  let binary = "";
  for (let i = 0; i < combined.byteLength; i++) {
    binary += String.fromCharCode(combined[i] ?? 0);
  }
  return `${HASH_PREFIX}${btoa(binary)}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string | null | undefined,
): Promise<boolean> {
  if (!password || !storedHash) return false;
  if (!storedHash.startsWith(HASH_PREFIX)) {
    // Backward compatibility for legacy plaintext passwords during transition
    return password === storedHash;
  }
  try {
    const raw = atob(storedHash.slice(HASH_PREFIX.length));
    const combined = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      combined[i] = raw.charCodeAt(i);
    }
    const salt = combined.slice(0, 16);
    const expectedHash = combined.slice(16);

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits"],
    );
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt,
        iterations: 100_000,
        hash: "SHA-256",
      },
      keyMaterial,
      256,
    );
    const actualHash = new Uint8Array(derivedBits);

    if (actualHash.length !== expectedHash.length) return false;
    let match = 0;
    for (let i = 0; i < actualHash.length; i++) {
      match |= (actualHash[i] ?? 0) ^ (expectedHash[i] ?? 0);
    }
    return match === 0;
  } catch {
    return false;
  }
}

/**
 * Cryptographically Signed HMAC Tokens for Status Page Authentication Cookies
 */
const TOKEN_PREFIX = "pg_sig:v1:";

export async function signAuthToken(
  payload: string,
  secretKey?: string,
  ttlSeconds = 86400,
): Promise<string> {
  const secret =
    secretKey !== undefined
      ? secretKey
      : typeof process !== "undefined"
        ? process.env?.BETTER_AUTH_SECRET || process.env?.ENCRYPTION_SECRET
        : globalThis.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET or ENCRYPTION_SECRET is required to sign authentication tokens",
    );
  }

  const expiresAt = Date.now() + ttlSeconds * 1000;
  const dataToSign = `${payload}:${expiresAt}`;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(dataToSign));
  const sigArray = new Uint8Array(sigBuffer);

  let binary = "";
  for (let i = 0; i < sigArray.length; i++) {
    binary += String.fromCharCode(sigArray[i] ?? 0);
  }
  const base64Sig = btoa(binary);
  return `${TOKEN_PREFIX}${payload}:${expiresAt}:${base64Sig}`;
}

export async function verifyAuthToken(
  token: string | null | undefined,
  expectedPayload: string,
  secretKey?: string,
): Promise<boolean> {
  if (!token || !token.startsWith(TOKEN_PREFIX)) return false;

  const secret =
    secretKey !== undefined
      ? secretKey
      : typeof process !== "undefined"
        ? process.env?.BETTER_AUTH_SECRET || process.env?.ENCRYPTION_SECRET
        : globalThis.BETTER_AUTH_SECRET;

  if (!secret) return false;

  try {
    const raw = token.slice(TOKEN_PREFIX.length);
    const parts = raw.split(":");
    if (parts.length < 3) return false;

    const payload = parts[0];
    const expiresAt = Number(parts[1]);
    const base64Sig = parts.slice(2).join(":");

    if (payload !== expectedPayload) return false;
    if (Date.now() > expiresAt) return false;

    const dataToSign = `${payload}:${expiresAt}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(dataToSign));
    const sigArray = new Uint8Array(sigBuffer);

    let binary = "";
    for (let i = 0; i < sigArray.length; i++) {
      binary += String.fromCharCode(sigArray[i] ?? 0);
    }
    const expectedBase64Sig = btoa(binary);

    return base64Sig === expectedBase64Sig;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Universal Raw Socket Client
// ---------------------------------------------------------------------------

interface UniversalSocket {
  write(data: Uint8Array | string): void;
  read(): Promise<Uint8Array | null>;
  close(): Promise<void>;
}

/**
 * Opens a raw TCP socket in the current runtime and returns a normalized
 * request/response client. Supports Node.js (net/tls) and Cloudflare Workers
 * (cloudflare:sockets — TCP only). TLS is only available in Node runtimes.
 */
async function openUniversalSocket(
  host: string,
  port: number,
  timeoutMs: number,
  useTls: boolean,
): Promise<UniversalSocket> {
  // Node.js runtime first (supports TLS)
  // Import the module without swallowing connection failures below: only the
  // import itself is fallible here. A rejected connect (ECONNREFUSED, timeout)
  // must propagate to the caller so it can classify the real error.
  let net: any = null;
  try {
    // @ts-ignore
    net = await import(useTls ? "tls" : "net");
  } catch {
    if (useTls) {
      // TLS unavailable (Workers runtime or missing module) — rethrow so the
      // caller can report it instead of silently downgrading to plaintext.
      throw new Error("TLS socket unavailable");
    }
    // Plaintext fallthrough to Cloudflare Workers socket below
  }
  if (net && typeof net.connect === "function") {
    {
      return await new Promise<UniversalSocket>((resolve, reject) => {
        const socket = net.connect({ host, port });
        const chunks: Uint8Array[] = [];
        let pending: ((value: Uint8Array | null) => void) | null = null;
        let closed = false;

        const timer = setTimeout(() => {
          socket.destroy();
          reject(new Error(`Socket connection timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        socket.on("connect", () => {
          clearTimeout(timer);
          resolve({
            write(data) {
              if (closed) return;
              socket.write(data);
            },
            read() {
              if (closed) return Promise.resolve(null);
              if (chunks.length > 0) {
                return Promise.resolve(chunks.shift()!);
              }
              return new Promise((res) => {
                pending = res;
              });
            },
            close() {
              closed = true;
              try {
                socket.end();
              } catch {}
              return Promise.resolve();
            },
          });
        });

        socket.on("data", (chunk: Uint8Array) => {
          if (pending) {
            const res = pending;
            pending = null;
            res(chunk);
          } else {
            chunks.push(chunk);
          }
        });

        socket.on("error", (err: Error) => {
          clearTimeout(timer);
          socket.destroy();
          reject(err);
        });

        socket.on("close", () => {
          closed = true;
          if (pending) {
            const res = pending;
            pending = null;
            res(null);
          }
        });
      });
    }
  }

  // Cloudflare Workers runtime (plaintext TCP only)
  try {
    // @ts-ignore
    const { connect } = await import("cloudflare:sockets");
    if (typeof connect === "function") {
      const socket = connect({ hostname: host, port });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Socket connection timed out after ${timeoutMs}ms`)), timeoutMs),
      );
      await Promise.race([socket.opened, timeoutPromise]);

      const writer = socket.writable.getWriter();
      const reader = socket.readable.getReader();
      let doneReading = false;

      return {
        async write(data) {
          if (doneReading) return;
          await writer.write(
            typeof data === "string" ? new TextEncoder().encode(data) : data,
          );
        },
        async read() {
          if (doneReading) return null;
          try {
            const { done, value } = await reader.read();
            if (done) {
              doneReading = true;
              return null;
            }
            return value;
          } catch {
            doneReading = true;
            return null;
          }
        },
        async close() {
          try {
            await writer.close();
          } catch {}
          try {
            reader.cancel();
          } catch {}
          try {
            socket.close();
          } catch {}
        },
      };
    }
  } catch (err) {
    throw err instanceof Error ? err : new Error("Socket unavailable");
  }

  throw new Error("NO_COMPATIBLE_RUNTIME");
}

interface RawConversationOptions {
  host: string;
  port: number;
  timeoutMs: number;
  useTls?: boolean;
}

interface RawExchange {
  greeting: string;
  responses: string[];
}

/**
 * Performs a line-oriented request/response conversation over a raw TCP/TLS
 * socket (SMTP, FTP, IMAP, POP3 all work this way: a greeting banner followed
 * by one response per command line).
 */
async function rawConversation(
  options: RawConversationOptions,
  commands: string[],
): Promise<RawExchange> {
  const { host, port, timeoutMs, useTls = false } = options;
  const socket = await openUniversalSocket(host, port, timeoutMs, useTls);

  const readAvailable = async (budgetMs: number): Promise<string> => {
    const decoder = new TextDecoder();
    let text = "";
    const deadline = Date.now() + budgetMs;
    while (Date.now() < deadline) {
      const remaining = deadline - Date.now();
      const chunk = await Promise.race([
        socket.read(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), remaining)),
      ]);
      if (!chunk) break;
      text += decoder.decode(chunk, { stream: true });
      // Give the server a moment to deliver the rest of the banner
      const more = await Promise.race([
        socket.read(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 150)),
      ]);
      if (!more) break;
      text += decoder.decode(more, { stream: true });
    }
    return text;
  };

  try {
    const greeting = await readAvailable(Math.min(timeoutMs, 5000));
    const responses: string[] = [];
    for (const command of commands) {
      socket.write(`${command}\r\n`);
      const response = await readAvailable(Math.min(timeoutMs, 5000));
      responses.push(response);
    }
    return { greeting, responses };
  } finally {
    try {
      socket.write("QUIT\r\n");
    } catch {}
    await socket.close();
  }
}

// ---------------------------------------------------------------------------
// Protocol Monitor Checkers
// ---------------------------------------------------------------------------

function parseHostPort(urlStr: string, defaultPort: number): { host: string; port: number } {
  let candidate = urlStr.trim();
  try {
    const url = new URL(candidate);
    return {
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : defaultPort,
    };
  } catch {}
  // Bare "host:port" or "host"
  candidate = candidate.replace(/^\w+:\/\//, "").split("/")[0] || candidate;
  const [host, portStr] = candidate.split(":");
  return {
    host: host || candidate,
    port: portStr ? parseInt(portStr, 10) : defaultPort,
  };
}

export interface ProtocolCheckResult {
  status: MonitorStatus;
  latency: number;
  errorReason?: string | undefined;
  banner: string;
}

/**
 * gRPC health check via the grpc.health.v1.Health protocol.
 *
 * Performs a full HTTP/2 connection preface + HEADERS frame for
 * /grpc.health.v1.Health/Check, reads the response HEADERS and DATA frames,
 * and decodes the HealthCheckResponse wire payload (field 1, varint:
 * 0=UNKNOWN, 1=SERVING, 2=NOT_SERVING).
 */
export async function checkGrpcHealth(
  urlStr: string,
  config: { serviceName?: string; timeoutSeconds?: number; useTls?: boolean } = {},
): Promise<ProtocolCheckResult> {
  const start = Date.now();
  const timeoutMs = (config.timeoutSeconds || DEFAULT_CHECK_TIMEOUT_SECONDS) * 1000;
  const { host, port } = parseHostPort(urlStr, config.useTls ? 443 : 80);

  try {
    const socket = await openUniversalSocket(host, port, timeoutMs, config.useTls === true);
    const readWithTimeout = async (budgetMs: number): Promise<Uint8Array | null> => {
      return await Promise.race([
        socket.read(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), budgetMs)),
      ]);
    };

    try {
      // HTTP/2 client connection preface
      socket.write(
        new Uint8Array([
          0x50, 0x52, 0x49, 0x20, 0x2a, 0x20, 0x48, 0x54, 0x54, 0x50, 0x2f, 0x32, 0x2e, 0x30,
          0x0d, 0x0a, 0x0d, 0x0a, 0x53, 0x4d, 0x0d, 0x0a, 0x0d, 0x0a,
        ]),
      );

      // SETTINGS frame (empty, ACK not required for our purposes)
      socket.write(new Uint8Array([0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00]));

      // HPACK-encoded HEADERS frame for /grpc.health.v1.Health/Check with
      // content-type application/grpc and te: trailers. Encoding uses literal
      // header fields without indexing (0x00 prefix).
      const authority = port === 80 || port === 443 ? host : `${host}:${port}`;
      const path = "/grpc.health.v1.Health/Check";
      const enc = new TextEncoder();
      const pseudoAndHeaders: [string, string][] = [
        [":method", "POST"],
        [":scheme", "http"],
        [":path", path],
        [":authority", authority],
        ["content-type", "application/grpc"],
        ["te", "trailers"],
      ];
      const headerBlock: number[] = [];
      const pushString = (s: string) => {
        const bytes = enc.encode(s);
        if (bytes.length < 127) {
          headerBlock.push(bytes.length);
        } else {
          let len = bytes.length;
          while (len >= 128) {
            headerBlock.push((len & 0x7f) | 0x80);
            len >>= 7;
          }
          headerBlock.push(len);
        }
        for (const b of bytes) headerBlock.push(b);
      };
      for (const [name, value] of pseudoAndHeaders) {
        headerBlock.push(0x00);
        pushString(name);
        pushString(value);
      }

      const headerBlockBytes = new Uint8Array(headerBlock);
      const frame = new Uint8Array(9 + headerBlockBytes.length);
      const blockLen = headerBlockBytes.length;
      frame[0] = (blockLen >> 16) & 0xff;
      frame[1] = (blockLen >> 8) & 0xff;
      frame[2] = blockLen & 0xff;
      frame[3] = 0x01; // HEADERS
      frame[4] = 0x04; // END_HEADERS
      frame[5] = 0x00;
      frame[6] = 0x00;
      frame[7] = 0x00;
      frame[8] = 0x01; // stream 1
      frame.set(headerBlockBytes, 9);
      socket.write(frame);

      // HealthCheckRequest{ service: config.serviceName } — protobuf wire format
      const svcName = config.serviceName || "";
      let messageBody: Uint8Array;
      if (svcName) {
        const nameBytes = enc.encode(svcName);
        messageBody = new Uint8Array(1 + nameBytes.length + 4);
        messageBody[0] = 0x0a; // field 1, wire type 2
        messageBody[1] = nameBytes.length;
        messageBody.set(nameBytes, 2);
      } else {
        messageBody = new Uint8Array(0);
      }
      const grpcFrame = new Uint8Array(5 + messageBody.length);
      grpcFrame[0] = 0x00; // uncompressed
      new DataView(grpcFrame.buffer).setUint32(1, messageBody.length);
      grpcFrame.set(messageBody, 5);
      const dataFrame = new Uint8Array(9 + grpcFrame.length);
      const grpcLen = grpcFrame.length;
      dataFrame[0] = (grpcLen >> 16) & 0xff;
      dataFrame[1] = (grpcLen >> 8) & 0xff;
      dataFrame[2] = grpcLen & 0xff;
      dataFrame[3] = 0x00; // DATA
      dataFrame[4] = 0x00; // no END_STREAM (await trailers)
      dataFrame[5] = 0x00;
      dataFrame[6] = 0x00;
      dataFrame[7] = 0x00;
      dataFrame[8] = 0x01;
      dataFrame.set(grpcFrame, 9);
      socket.write(dataFrame);

      // Read response frames until a HEADERS or DATA frame on stream 1 arrives
      const buffer: number[] = [];
      let sawHeaders = false;
      let grpcStatus: number | null = null;
      let servingState: number | null = null;
      let dataPayload: number[] = [];

      const deadline = Date.now() + timeoutMs;
      while (Date.now() < deadline) {
        const remaining = deadline - Date.now();
        const chunk = await readWithTimeout(remaining);
        if (!chunk) break;
        for (const b of chunk) buffer.push(b);

        while (buffer.length >= 9) {
          const len = (buffer[0]! << 16) | (buffer[1]! << 8) | buffer[2]!;
          const type = buffer[3]!;
          if (buffer.length < 9 + len) break;
          const payload = buffer.slice(9, 9 + len);
          buffer.splice(0, 9 + len);

          if (type === 0x01) {
            // HEADERS: scan for grpc-status literal header (crude but sufficient)
            const text = new TextDecoder().decode(new Uint8Array(payload));
            if (text.includes("grpc-status")) {
              const m = text.match(/grpc-status[\x00-\x7f]*?(\d{1,3})/);
              if (m) grpcStatus = parseInt(m[1]!, 10);
            }
            sawHeaders = true;
          } else if (type === 0x00) {
            dataPayload = payload;
          } else if (type === 0x07) {
            // GOAWAY — server rejected the connection
            throw new Error("Server sent GOAWAY (HTTP/2 handshake rejected)");
          }
        }

        if (sawHeaders && (grpcStatus !== null || dataPayload.length > 0)) break;
      }

      // Decode HealthCheckResponse payload: field 1 varint = serving state
      if (dataPayload.length > 0) {
        let i = 0;
        const payload = dataPayload;
        while (i < payload.length) {
          const tag = payload[i]!;
          if (tag === 0x08) {
            servingState = payload[i + 1] ?? null;
            break;
          }
          i++;
        }
      }

      const latency = Date.now() - start;
      if (grpcStatus !== null && grpcStatus !== 0) {
        return {
          status: "DOWN",
          latency,
          errorReason: `GRPC_STATUS_${grpcStatus}`,
          banner: "",
        };
      }
      if (servingState === 1) {
        return { status: "UP", latency, banner: "SERVING" };
      }
      if (servingState === 2) {
        return {
          status: "DOWN",
          latency,
          errorReason: "GRPC_NOT_SERVING",
          banner: "NOT_SERVING",
        };
      }
      if (dataPayload.length > 0 || sawHeaders) {
        // Response arrived but state UNKNOWN (0) or undecodable
        return {
          status: servingState === 0 ? "DOWN" : "UP",
          latency,
          errorReason: servingState === 0 ? "GRPC_UNKNOWN_STATE" : undefined,
          banner: sawHeaders ? "responded" : "",
        };
      }
      throw new Error("No gRPC response received within timeout");
    } finally {
      await socket.close();
    }
  } catch (err: any) {
    return {
      status: "DOWN",
      latency: Date.now() - start,
      errorReason: diagnoseError(err, `${host}:${port}`),
      banner: "",
    };
  }
}

/**
 * SMTP check: verifies the EHLO handshake and optionally tests AUTH LOGIN.
 * URL forms: smtp://host:port, smtps://host:465 (implicit TLS), host (25).
 */
export async function checkSmtp(
  urlStr: string,
  config: {
    username?: string;
    password?: string;
    timeoutSeconds?: number;
    ehloDomain?: string;
  } = {},
): Promise<ProtocolCheckResult> {
  const start = Date.now();
  const timeoutMs = (config.timeoutSeconds || DEFAULT_CHECK_TIMEOUT_SECONDS) * 1000;
  const isSmtps = urlStr.startsWith("smtps://");
  const { host, port } = parseHostPort(urlStr, isSmtps ? 465 : 25);

  try {
    const commands = [`EHLO ${config.ehloDomain || "steadystack.monitor"}`];
    if (config.username) {
      // AUTH LOGIN with base64 credentials
      commands.push("AUTH LOGIN");
      commands.push(btoa(config.username));
      if (config.password) commands.push(btoa(config.password));
    }

    const { greeting, responses } = await rawConversation(
      { host, port, timeoutMs, useTls: isSmtps },
      commands,
    );

    const latency = Date.now() - start;
    const bannerCode = parseInt(greeting.slice(0, 3), 10);
    if (isNaN(bannerCode) || bannerCode !== 220) {
      return {
        status: "DOWN",
        latency,
        errorReason: `SMTP_BAD_GREETING: ${greeting.slice(0, 80) || "no banner"}`,
        banner: greeting.slice(0, 200),
      };
    }

    const ehloResponse = responses[0] || "";
    if (!ehloResponse.startsWith("250")) {
      return {
        status: "DOWN",
        latency,
        errorReason: `SMTP_EHLO_FAILED: ${ehloResponse.slice(0, 80) || "no response"}`,
        banner: greeting.slice(0, 200),
      };
    }

    if (config.username) {
      // Command order: EHLO, AUTH LOGIN, username, [password]. The final 235
      // acceptance is the reply to the LAST command sent, not the one after
      // AUTH LOGIN (which is the 334 username prompt).
      const authResponse = responses[responses.length - 1] || "";
      const authCode = parseInt(authResponse.slice(0, 3), 10);
      if (authCode !== 235) {
        return {
          status: "DOWN",
          latency,
          errorReason: `SMTP_AUTH_FAILED: ${authResponse.slice(0, 80) || "no response"}`,
          banner: greeting.slice(0, 200),
        };
      }
    }

    return { status: "UP", latency, banner: greeting.slice(0, 200) };
  } catch (err: any) {
    return {
      status: "DOWN",
      latency: Date.now() - start,
      errorReason: diagnoseError(err, `${host}:${port}`),
      banner: "",
    };
  }
}

/**
 * FTP check: verifies the 220 greeting and that the USER command is accepted
 * (331 = need password, 230 = logged in). SFTP targets (sftp://) fall back to
 * a TCP availability check against port 22 because SSH handshake negotiation
 * is not feasible over line-oriented probes.
 */
export async function checkFtp(
  urlStr: string,
  config: { username?: string; password?: string; timeoutSeconds?: number } = {},
): Promise<ProtocolCheckResult> {
  const start = Date.now();
  const timeoutMs = (config.timeoutSeconds || DEFAULT_CHECK_TIMEOUT_SECONDS) * 1000;
  const isSftp = urlStr.startsWith("sftp://");
  const { host, port } = parseHostPort(urlStr, isSftp ? 22 : 21);

  if (isSftp) {
    // SSH/SFTP: just verify the TCP port is reachable and an SSH banner is returned
    try {
      const { greeting } = await rawConversation({ host, port, timeoutMs }, []);
      const latency = Date.now() - start;
      if (greeting.startsWith("SSH-")) {
        return { status: "UP", latency, banner: greeting.slice(0, 200) };
      }
      return {
        status: greeting ? "DOWN" : "UP",
        latency,
        errorReason: greeting ? `SFTP_BAD_BANNER: ${greeting.slice(0, 80)}` : undefined,
        banner: greeting.slice(0, 200),
      };
    } catch (err: any) {
      return {
        status: "DOWN",
        latency: Date.now() - start,
        errorReason: diagnoseError(err, `${host}:${port}`),
        banner: "",
      };
    }
  }

  try {
    const username = config.username || "anonymous";
    const commands = [`USER ${username}`];
    if (config.password) commands.push(`PASS ${config.password}`);

    const { greeting, responses } = await rawConversation({ host, port, timeoutMs }, commands);
    const latency = Date.now() - start;
    const bannerCode = parseInt(greeting.slice(0, 3), 10);
    if (isNaN(bannerCode) || bannerCode !== 220) {
      return {
        status: "DOWN",
        latency,
        errorReason: `FTP_BAD_GREETING: ${greeting.slice(0, 80) || "no banner"}`,
        banner: greeting.slice(0, 200),
      };
    }

    const userResponse = responses[0] || "";
    const userCode = parseInt(userResponse.slice(0, 3), 10);
    if (userCode !== 331 && userCode !== 230) {
      return {
        status: "DOWN",
        latency,
        errorReason: `FTP_LOGIN_REJECTED: ${userResponse.slice(0, 80) || "no response"}`,
        banner: greeting.slice(0, 200),
      };
    }

    return { status: "UP", latency, banner: greeting.slice(0, 200) };
  } catch (err: any) {
    return {
      status: "DOWN",
      latency: Date.now() - start,
      errorReason: diagnoseError(err, `${host}:${port}`),
      banner: "",
    };
  }
}

/**
 * IMAP / POP3 mailbox check.
 * URL forms: imap://host:143, imaps://host:993 (implicit TLS),
 * pop3://host:110, pop3s://host:995 (implicit TLS). Optional credentials test
 * a real LOGIN; without them the server banner + capability/auth readiness is
 * verified.
 */
export async function checkMailRetrieval(
  urlStr: string,
  config: { username?: string; password?: string; timeoutSeconds?: number } = {},
): Promise<ProtocolCheckResult> {
  const start = Date.now();
  const timeoutMs = (config.timeoutSeconds || DEFAULT_CHECK_TIMEOUT_SECONDS) * 1000;
  const lower = urlStr.toLowerCase();
  const isImap = lower.startsWith("imap") || lower.startsWith("imaps");
  const isTls = lower.startsWith("imaps") || lower.startsWith("pop3s");
  const { host, port } = parseHostPort(
    urlStr,
    isImap ? (isTls ? 993 : 143) : isTls ? 995 : 110,
  );

  const commands = isImap
    ? ["A001 CAPABILITY"]
    : ["CAPA"]; // POP3 capability discovery; some servers respond -ERR (still alive)
  if (config.username) {
    commands.push(isImap ? `A002 LOGIN ${config.username} ${config.password || ""}` : `USER ${config.username}`);
    if (!isImap && config.password) commands.push(`PASS ${config.password}`);
  }

  try {
    const { greeting, responses } = await rawConversation(
      { host, port, timeoutMs, useTls: isTls },
      commands,
    );

    const latency = Date.now() - start;
    if (isImap) {
      // Greeting must be OK/BAD/NO ("* OK ..." or "* PREAUTH")
      if (!greeting.startsWith("*")) {
        return {
          status: "DOWN",
          latency,
          errorReason: `IMAP_BAD_GREETING: ${greeting.slice(0, 80) || "no banner"}`,
          banner: greeting.slice(0, 200),
        };
      }
      const capaResponse = responses[0] || "";
      const hasImapRev1 = capaResponse.includes("IMAPrev1") || capaResponse.includes("IMAP4rev1");
      const hasAuth = capaResponse.includes("AUTH=") || /\bAUTH\b/.test(capaResponse);
      if (config.username) {
        const loginResponse = responses[1] || "";
        if (!loginResponse.includes("A002 OK")) {
          return {
            status: "DOWN",
            latency,
            errorReason: `IMAP_LOGIN_FAILED: ${loginResponse.slice(0, 80) || "no response"}`,
            banner: greeting.slice(0, 200),
          };
        }
      } else if (!hasImapRev1 && !hasAuth && !capaResponse.includes("A001")) {
        // No usable capability response — server likely broken
        return {
          status: "DOWN",
          latency,
          errorReason: `IMAP_NO_CAPABILITIES: ${capaResponse.slice(0, 80) || "empty"}`,
          banner: greeting.slice(0, 200),
        };
      }
      return { status: "UP", latency, banner: greeting.slice(0, 200) };
    }

    // POP3: greeting must be +OK
    if (!greeting.startsWith("+OK")) {
      return {
        status: "DOWN",
        latency,
        errorReason: `POP3_BAD_GREETING: ${greeting.slice(0, 80) || "no banner"}`,
        banner: greeting.slice(0, 200),
      };
    }
    if (config.username) {
      const passIdx = config.password ? 2 : 1;
      const finalResponse = responses[passIdx] || responses[passIdx - 1] || "";
      if (!finalResponse.startsWith("+OK")) {
        return {
          status: "DOWN",
          latency,
          errorReason: `POP3_AUTH_FAILED: ${finalResponse.slice(0, 80) || "no response"}`,
          banner: greeting.slice(0, 200),
        };
      }
    }
    return { status: "UP", latency, banner: greeting.slice(0, 200) };
  } catch (err: any) {
    return {
      status: "DOWN",
      latency: Date.now() - start,
      errorReason: diagnoseError(err, `${host}:${port}`),
      banner: "",
    };
  }
}

/**
 * True ICMP ping.
 *
 * Cloudflare Workers cannot send raw ICMP packets (cloudflare:sockets is
 * TCP-only), so this check runs a real ICMP echo in two modes:
 * 1. Node probes: system `ping` binary via child_process (true ICMP echo).
 * 2. Workers runtime: TCP connect fallback to port 80 (documented limitation).
 */
export async function checkIcmpPing(
  urlStr: string,
  config: { timeoutSeconds?: number } = {},
): Promise<ProtocolCheckResult & { packetLoss?: number }> {
  const start = Date.now();
  const timeoutMs = (config.timeoutSeconds || DEFAULT_CHECK_TIMEOUT_SECONDS) * 1000;
  const host = parseHostPort(urlStr, 0).host;

  if (!host) {
    return { status: "DOWN", latency: 0, errorReason: "ICMP_NO_HOST", banner: "" };
  }

  // Node runtime: real ICMP echo via the system ping binary
  try {
    // @ts-ignore
    const cp = await import("child_process");
    if (cp && typeof cp.execFile === "function") {
      const timeoutSec = Math.max(1, Math.ceil(timeoutMs / 1000));
      const result = await new Promise<{ code: number; stdout: string; stderr: string }>(
        (resolve) => {
          try {
            cp.execFile(
              "ping",
              ["-n", "-c", "1", "-W", String(timeoutSec), host],
              { timeout: timeoutMs },
              (err: any, stdout: string, stderr: string) => {
                // ping exits non-zero on 100% packet loss; stdout still tells us what happened
                resolve({ code: err ? (err.code ?? 1) : 0, stdout: stdout || "", stderr: stderr || "" });
              },
            );
          } catch (spawnErr) {
            resolve({ code: -1, stdout: "", stderr: String(spawnErr) });
          }
        },
      );

      const latency = Date.now() - start;
      const output = `${result.stdout}\n${result.stderr}`;
      const timeMatch = result.stdout.match(/time[=<]([\d.]+)\s*ms/i);
      const lossMatch = result.stdout.match(/([\d.]+)%\s*packet loss/i);
      const packetLoss = lossMatch ? parseFloat(lossMatch[1]!) : result.code === 0 ? 0 : 100;

      if (result.code === 0 && timeMatch) {
        return {
          status: "UP",
          latency: Math.round(parseFloat(timeMatch[1]!)),
          banner: `ICMP echo ${timeMatch[1]}ms`,
          packetLoss,
        };
      }
      if (result.code === -1) {
        // ping binary unavailable — fall through to TCP fallback below
      } else {
        return {
          status: "DOWN",
          latency,
          errorReason: `PING_FAILED: ${output.slice(0, 120).replace(/\n/g, " ") || "host unreachable"}`,
          banner: output.slice(0, 200),
          packetLoss,
        };
      }
    }
  } catch {
    // fall through to TCP fallback
  }

  // Workers / restricted runtimes: TCP connect fallback to port 80
  const portResult = await checkPortUniversal(host, 80, timeoutMs);
  const latency = Date.now() - start;
  return {
    status: portResult.isOpen ? "UP" : "DOWN",
    latency: portResult.isOpen ? portResult.latency : latency,
    errorReason: portResult.isOpen ? undefined : portResult.errorReason,
    banner: portResult.isOpen ? "TCP_FALLBACK" : "",
  };
}

// ===========================================================================
// DOWN-CONFIRMATION GATE (shared false-positive prevention primitives)
//
// A single failed check is not proof of an outage: DNS blips, TLS
// renegotiations, proxy hiccups, and slow origins routinely produce one-off
// failures. Industry-standard prevention (UptimeRobot, Hyperping, Better
// Stack) always re-verifies a first failure from a second attempt before
// declaring downtime, and most products only flip status after N consecutive
// failed rounds. These helpers give every engine the same two-layer gate:
//
//   1. confirmDownWithRetries — immediate in-pass re-verification of a
//      first-attempt DOWN (fast retries, no waiting for the next schedule).
//   2. classifyAttemptOutcome — consecutive-failure threshold so a DOWN only
//      replaces the recorded status once the monitor's alertThreshold is met.
// ===========================================================================

export type AttemptTransport = "http" | "ping" | "worker";

/** Result of a single check attempt (any transport). */
export type CheckAttempt = {
  status: "UP" | "DOWN";
  latency: number;
  errorReason?: string;
  transport: AttemptTransport;
};

/**
 * What the engine should do with an attempt, given the monitor's currently
 * recorded status and how many consecutive failures have now been observed.
 */
export type AttemptOutcome =
  | "UP" // apply UP (works for recovery from DOWN and staying UP)
  | "CONFIRMED_DOWN" // persist DOWN
  | "UNCONFIRMED_DOWN" // not enough consecutive failures — keep previous status
  | "HOLD_DOWN"; // already DOWN and still failing — persist DOWN, no new alert

/**
 * Classify a check attempt against the monitor's current recorded status.
 *
 * @param attemptStatus      outcome of the (possibly retried) check attempt
 * @param previousStatus     status currently recorded for the monitor
 * @param consecutiveFailures consecutive failed checks observed for this
 *                            monitor including the current attempt
 * @param downThreshold      monitor-level confirmation threshold (the stored
 *                           alertThreshold field); falls back to 1 so an
 *                           unconfigured monitor keeps strict behavior
 */
export function classifyAttemptOutcome(
  attemptStatus: "UP" | "DOWN",
  previousStatus: string,
  consecutiveFailures: number,
  downThreshold?: number,
): AttemptOutcome {
  if (attemptStatus === "UP") return "UP";

  const threshold = downThreshold && downThreshold > 0 ? Math.floor(downThreshold) : 1;
  if (previousStatus === "DOWN") return "HOLD_DOWN";
  if (consecutiveFailures >= threshold) return "CONFIRMED_DOWN";
  return "UNCONFIRMED_DOWN";
}

/**
 * Re-verify a first-attempt DOWN with immediate retries.
 *
 * The first failure is confirmed with one quick retry; if both fail a third
 * attempt runs before giving up. Any success converts the verdict back to UP,
 * which is exactly the "repeat the check from a second attempt before
 * alerting" behavior UptimeRobot applies on their first failed check.
 *
 * @param first   the failed first attempt
 * @param rerun   performs one fresh check attempt at the given start timestamp
 * @param delayMs pause between retries (keep it short — this blocks the check)
 */
// ===========================================================================
// HOLIDAY MODE (account-wide alert suspension)
//
// Users going on vacation need the same “quiet period” status pages and PagerD
// offer: monitoring keeps running and incidents keep being recorded, but no
// alert may fire until a chosen date. One pure predicate shared by every
// dispatch path (web actions, worker queue consumer) keeps the rule identical
// everywhere.
// ===========================================================================

/**
 * Whether the account is currently in holiday mode (all alerts suspended).
 *
 * @param holidayModeUntil the user's suspension deadline (Date, ISO string or null)
 * @param now              evaluation time; defaults to the current time
 */
export function isHolidayModeActive(
  holidayModeUntil?: Date | string | null,
  now: Date = new Date(),
): boolean {
  if (!holidayModeUntil) return false;
  const until = holidayModeUntil instanceof Date ? holidayModeUntil : new Date(holidayModeUntil);
  if (Number.isNaN(until.getTime())) return false;
  return until.getTime() > now.getTime();
}

/**
 * Re-verify a first-attempt DOWN with immediate retries.
 *
 * The first failure is confirmed with one quick retry; if both fail a third
 * attempt runs before giving up. Any success converts the verdict back to UP,
 * which is exactly the "repeat the check from a second attempt before
 * alerting" behavior UptimeRobot applies on their first failed check.
 *
 * @param first   the failed first attempt
 * @param rerun   performs one fresh check attempt at the given start timestamp
 * @param delayMs pause between retries (keep it short — this blocks the check)
 */
export async function confirmDownWithRetries(
  first: CheckAttempt,
  rerun: (start: number) => Promise<CheckAttempt>,
  delayMs: number,
): Promise<CheckAttempt> {
  for (let i = 0; i < 2; i++) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    const retry = await rerun(Date.now());
    if (retry.status === "UP") return retry;
  }
  return first;
}
