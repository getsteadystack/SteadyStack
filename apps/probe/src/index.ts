import {
  checkHttpUniversal,
  checkPortUniversal,
  checkGrpcHealth,
  checkSmtp,
  checkFtp,
  checkIcmpPing,
  checkMailRetrieval,
  decryptSecret,
  DEFAULT_CHECK_TIMEOUT_SECONDS,
} from "@steadystack/core";
import { env } from "@steadystack/env/probe";
import type { ProbeJob, CheckResult } from "@steadystack/types";

interface PollResponse {
  probeId: string;
  jobs: ProbeJob[];
}

const RAW_API_URL = env.STEADYSTACK_API_URL.replace(/\/+$/, "");
const API_URL = new URL(RAW_API_URL);
const PROBE_TOKEN = env.STEADYSTACK_PROBE_TOKEN;
const POLL_INTERVAL = env.PROBE_POLL_INTERVAL;
const HEARTBEAT_INTERVAL = env.PROBE_HEARTBEAT_INTERVAL;

const AUTH_HEADERS = {
  Authorization: `Bearer ${PROBE_TOKEN}`,
  "Content-Type": "application/json",
};

function resolvePath(path: string): string {
  return new URL(path.replace(/^\//, ""), API_URL).href;
}

async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const url = resolvePath(path);
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: AUTH_HEADERS,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? (err.cause != null ? String(err.cause) : err.message) : "unknown";
    throw new Error(`fetch failed for ${url}: ${message}`);
  }
  if (!response.ok) {
    throw new Error(
      `API ${path} failed: ${response.status} ${await response.text().catch(() => "")}`,
    );
  }
  return response.json() as Promise<T>;
}

async function sendHeartbeat(): Promise<void> {
  try {
    await apiPost("/api/probes/heartbeat");
    console.log(`[Heartbeat] Sent at ${new Date().toISOString()}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Heartbeat] Failed: ${message}`);
  }
}

async function pollJobs(): Promise<ProbeJob[]> {
  try {
    const response = await apiPost<PollResponse>("/api/probes/poll", {
      maxJobs: 10,
    });
    return response.jobs;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Poll] Failed: ${message}`);
    return [];
  }
}

async function runCheck(job: ProbeJob): Promise<CheckResult> {
  const start = performance.now();
  const timestamp = new Date().toISOString();
  const region = `probe:${env.PROBE_REGION}`;

  try {
    if (job.type === "HTTP" || job.type === "HTTPS" || job.url.startsWith("http")) {
      // Headers and the mTLS cert bundle are stored encrypted; the probe holds
      // the same platform ENCRYPTION_SECRET so it can decrypt them locally.
      let rawHeaders = job.headers;
      if (rawHeaders) {
        try {
          rawHeaders = await decryptSecret(rawHeaders, env.ENCRYPTION_SECRET);
        } catch {
          // decryptSecret already falls back to the raw payload on failure
        }
      }
      let clientCert: string | undefined;
      let clientKey: string | undefined;
      if (job.clientCert) {
        try {
          const raw = await decryptSecret(job.clientCert, env.ENCRYPTION_SECRET);
          const parsed = JSON.parse(raw) as { cert?: string; key?: string };
          clientCert = parsed.cert;
          clientKey = parsed.key;
        } catch {
          console.error(`[MTLS] Failed to decrypt client cert for monitor ${job.monitorId}`);
        }
      }
      const checkResult = await checkHttpUniversal(job.url, {
        method: job.method,
        headers: rawHeaders,
        body: job.body,
        timeoutSeconds: DEFAULT_CHECK_TIMEOUT_SECONDS,
        clientCert,
        clientKey,
      });

      return {
        monitorId: job.monitorId,
        status: checkResult.status,
        latency: checkResult.latency,
        errorReason: checkResult.errorReason,
        timestamp,
        region,
      };
    }

    if (job.type === "PING" || job.url.startsWith("ping://")) {
      const hostname = job.url.replace("ping://", "");
      const checkResult = await checkPortUniversal(hostname, 80, DEFAULT_CHECK_TIMEOUT_SECONDS * 1000);

      return {
        monitorId: job.monitorId,
        status: checkResult.isOpen ? "UP" : "DOWN",
        latency: checkResult.latency,
        errorReason: checkResult.errorReason,
        timestamp,
        region,
      };
    }

    if (job.type === "GRPC") {
      const grpcConfig = job.expectation ? (JSON.parse(job.expectation) as any) : {};
      const checkResult = await checkGrpcHealth(job.url, {
        serviceName: grpcConfig.serviceName,
        useTls: grpcConfig.useTls === true || job.url.startsWith("grpcs://") || job.url.includes(":443"),
        timeoutSeconds: DEFAULT_CHECK_TIMEOUT_SECONDS,
      });
      return {
        monitorId: job.monitorId,
        status: checkResult.status,
        latency: checkResult.latency,
        errorReason: checkResult.errorReason,
        timestamp,
        region,
      };
    }

    // SMTP/FTP/MAIL credentials are stored encrypted (same column as HTTP
    // custom headers) — decrypt once here so no handler sees the envelope.
    let protocolHeaders: Record<string, string> = {};
    if (job.headers) {
      try {
        const raw = await decryptSecret(job.headers, env.ENCRYPTION_SECRET);
        const parsed = JSON.parse(raw) as Record<string, string>;
        if (parsed && !Array.isArray(parsed)) protocolHeaders = parsed;
      } catch {
        // Malformed or unparseable payload — proceed without credentials.
      }
    }

    if (job.type === "SMTP") {
      const smtpConfig = protocolHeaders;
      const checkResult = await checkSmtp(job.url, {
        username: smtpConfig.username,
        password: smtpConfig.password,
        ehloDomain: smtpConfig.ehloDomain,
        timeoutSeconds: DEFAULT_CHECK_TIMEOUT_SECONDS,
      });
      return {
        monitorId: job.monitorId,
        status: checkResult.status,
        latency: checkResult.latency,
        errorReason: checkResult.errorReason,
        timestamp,
        region,
      };
    }

    if (job.type === "FTP") {
      const ftpConfig = protocolHeaders;
      const checkResult = await checkFtp(job.url, {
        username: ftpConfig.username,
        password: ftpConfig.password,
        timeoutSeconds: DEFAULT_CHECK_TIMEOUT_SECONDS,
      });
      return {
        monitorId: job.monitorId,
        status: checkResult.status,
        latency: checkResult.latency,
        errorReason: checkResult.errorReason,
        timestamp,
        region,
      };
    }

    if (job.type === "ICMP") {
      const checkResult = await checkIcmpPing(job.url, {
        timeoutSeconds: DEFAULT_CHECK_TIMEOUT_SECONDS,
      });
      return {
        monitorId: job.monitorId,
        status: checkResult.status,
        latency: checkResult.latency,
        errorReason: checkResult.errorReason,
        timestamp,
        region,
      };
    }

    if (job.type === "MAIL") {
      const mailConfig = protocolHeaders;
      const checkResult = await checkMailRetrieval(job.url, {
        username: mailConfig.username,
        password: mailConfig.password,
        timeoutSeconds: DEFAULT_CHECK_TIMEOUT_SECONDS,
      });
      return {
        monitorId: job.monitorId,
        status: checkResult.status,
        latency: checkResult.latency,
        errorReason: checkResult.errorReason,
        timestamp,
        region,
      };
    }

    if (job.type === "PORT" || job.url.startsWith("tcp://")) {
      const part = job.url.replace("tcp://", "");
      const [hostname, portStr] = part.split(":");
      const checkResult = await checkPortUniversal(
        hostname ?? "",
        parseInt(portStr ?? "80", 10),
        DEFAULT_CHECK_TIMEOUT_SECONDS * 1000,
      );

      return {
        monitorId: job.monitorId,
        status: checkResult.isOpen ? "UP" : "DOWN",
        latency: checkResult.latency,
        errorReason: checkResult.errorReason,
        timestamp,
        region,
      };
    }

    return {
      monitorId: job.monitorId,
      status: "DOWN",
      latency: Math.round(performance.now() - start),
      errorReason: `UNSUPPORTED_TYPE: ${job.type}`,
      timestamp,
      region,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "UNKNOWN_ERROR";
    return {
      monitorId: job.monitorId,
      status: "DOWN",
      latency: Math.round(performance.now() - start),
      errorReason: message.includes("Timeout") ? "TIMEOUT" : message,
      timestamp,
      region,
    };
  }
}

async function reportResultsBatch(results: CheckResult[]): Promise<void> {
  if (results.length === 0) return;
  try {
    await apiPost("/api/probes/result", results);
    console.log(`[Result] Successfully reported batch of ${results.length} result(s).`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Result] Failed to report batch of ${results.length} results: ${message}`);
  }
}

async function processJobs(jobs: ProbeJob[]): Promise<void> {
  if (jobs.length === 0) return;
  console.log(`[Jobs] Processing ${jobs.length} monitor(s) concurrently`);

  const concurrencyLimit = env.PROBE_CONCURRENCY;
  const results: CheckResult[] = [];
  let index = 0;

  async function worker() {
    while (index < jobs.length) {
      const currentIndex = index++;
      if (currentIndex >= jobs.length) break;
      const job = jobs[currentIndex];
      if (!job) continue;
      try {
        const result = await runCheck(job);
        results.push(result);
      } catch (err: unknown) {
        console.error(`[Jobs] Error running check for monitor ${job.monitorId}:`, err);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrencyLimit, jobs.length) }, () => worker());
  await Promise.all(workers);

  await reportResultsBatch(results);
}

async function main(): Promise<void> {
  console.log(`[Probe] Starting SteadyStack Private Probe`);
  console.log(`[Probe] API URL: ${API_URL.href}`);
  console.log(`[Probe] Poll Interval: ${POLL_INTERVAL}s`);
  console.log(`[Probe] Heartbeat Interval: ${HEARTBEAT_INTERVAL}s`);

  // Immediate first heartbeat
  await sendHeartbeat();

  // Periodic heartbeat
  setInterval(sendHeartbeat, HEARTBEAT_INTERVAL * 1000);

  // Main poll loop
  const pollLoop = async () => {
    const jobs = await pollJobs();
    await processJobs(jobs);
  };

  // Immediate first poll
  await pollLoop();
  setInterval(pollLoop, POLL_INTERVAL * 1000);
}

main().catch((err: unknown) => {
  console.error("[Probe] Fatal error:", err);
  process.exit(1);
});
