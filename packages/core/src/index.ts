import type { MonitorStatus } from "@steadystack/types";

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
  } = {},
): Promise<{
  status: MonitorStatus;
  latency: number;
  errorReason?: string | undefined;
  bodyText: string;
  statusCode?: number | undefined;
}> {
  const start = Date.now();
  const method = config?.method || "GET";
  const timeoutMs = (config.timeoutSeconds || 10) * 1000;
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

  while (hops < maxHops) {
    const ssrfCheck = await isPrivateOrInternalUrlAsync(currentUrl);
    if (ssrfCheck.isForbidden) {
      return {
        status: "DOWN",
        latency: Date.now() - start,
        errorReason: `SSRF_PROTECTION: ${ssrfCheck.reason || "Forbidden target URL or redirect target"}`,
        bodyText: "",
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
      });

      // Handle redirect chain manually to re-apply SSRF validation per hop
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location) break;
        currentUrl = new URL(location, currentUrl).href;
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
      };
    }
  }

  if (!response) {
    return {
      status: "DOWN",
      latency: Date.now() - start,
      errorReason: "TOO_MANY_REDIRECTS: Exceeded maximum redirect hop count of 5",
      bodyText: "",
    };
  }

  // Stream body with strict size limit to prevent OOM/memory exhaustion
  let bodyText = "";
  if (response.body) {
    const reader = response.body.getReader();
    let receivedBytes = 0;
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        receivedBytes += value.length;
        if (receivedBytes > MAX_RESPONSE_BYTES) {
          reader.cancel("Response size exceeded maximum limit of 5MB");
          return {
            status: "DOWN",
            latency: Date.now() - start,
            errorReason: "RESPONSE_TOO_LARGE: Exceeded maximum body size limit of 5MB",
            bodyText: bodyText.substring(0, 1024) + "... [truncated]",
            statusCode: response.status,
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
