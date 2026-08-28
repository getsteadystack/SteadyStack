export interface ProbeRegistration {
  id: string;
  name: string;
  token: string;
  status: string;
}

export interface ProbeJob {
  id: string;
  monitorId: string;
  url: string;
  type: string;
  timeout: number;
  method?: string;
  headers?: string;
  body?: string;
  expectation?: string;
  script?: string;
}

export interface ProbeResult {
  monitorId: string;
  status: "UP" | "DOWN";
  latency: number;
  errorReason?: string;
  timestamp: string;
  region?: string;
}

export interface ProbeHeartbeatResult {
  probeId: string;
  status: "UP" | "DOWN";
  secondsSinceLastHeartbeat: number;
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return (
    "pg_probe_" +
    Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

export async function registerProbe(
  prisma: any,
  userId: string,
  name: string,
  platform?: string,
  region?: string,
  heartbeatInterval: number = 60,
): Promise<ProbeRegistration> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true },
  });
  const userTier = user?.tier || "INITIATE";

  if (userTier === "INITIATE") {
    throw new Error(
      "Private probes are not allowed on the Free tier. Please upgrade to Netrunner to register private probes.",
    );
  }

  if (userTier === "NETRUNNER") {
    const probeCount = await prisma.probe.count({
      where: {
        userId,
        status: { in: ["ACTIVE", "INACTIVE"] },
      },
    });
    if (probeCount >= 3) {
      throw new Error(
        "You have reached the limit of 3 private probes for the Netrunner tier. Upgrade to Construct for unlimited probes.",
      );
    }
  }

  const token = generateToken();
  const probe = await prisma.probe.create({
    data: {
      name,
      token,
      userId,
      platform: platform || null,
      region: region || null,
      heartbeatInterval,
      status: "ACTIVE",
    },
  });
  return {
    id: probe.id,
    name: probe.name,
    token: probe.token,
    status: probe.status,
  };
}

export async function authenticateProbe(
  prisma: any,
  token: string,
): Promise<{ id: string; name: string; userId: string } | null> {
  const probe = await prisma.probe.findUnique({
    where: { token },
    select: { id: true, name: true, userId: true, status: true },
  });
  if (!probe || probe.status !== "ACTIVE") return null;
  return probe;
}

export async function pollJobs(
  prisma: any,
  probeId: string,
  maxJobs: number = 10,
): Promise<ProbeJob[]> {
  // Fetch monitors assigned to this probe that are due for a check
  const assignments = await prisma.probeAssignment.findMany({
    where: { probeId },
    include: {
      monitor: {
        select: {
          id: true,
          url: true,
          type: true,
          timeout: true,
          method: true,
          headers: true,
          body: true,
          expectation: true,
          script: true,
          interval: true,
          nextCheck: true,
          lastCheck: true,
        },
      },
    },
    take: maxJobs,
  });

  const jobs: ProbeJob[] = [];
  const now = new Date();

  for (const assignment of assignments) {
    const m = assignment.monitor;
    const isDue = !m.nextCheck || new Date(m.nextCheck) <= now;
    if (isDue) {
      jobs.push({
        id: assignment.id,
        monitorId: m.id,
        url: m.url,
        type: m.type,
        timeout: m.timeout || 10,
        method: m.method || "GET",
        headers: m.headers || undefined,
        body: m.body || undefined,
        expectation: m.expectation || undefined,
        script: m.script || undefined,
      });
    }
  }

  return jobs;
}

export async function reportResult(
  prisma: any,
  probeId: string,
  result: ProbeResult,
): Promise<void> {
  await prisma.monitorEvent.create({
    data: {
      monitorId: result.monitorId,
      status: result.status,
      latency: result.latency,
      errorReason: result.errorReason || null,
      region: result.region || `probe:${probeId}`,
      probeId,
      timestamp: result.timestamp ? new Date(result.timestamp) : new Date(),
    },
  });

  // Update monitor status
  await prisma.monitor.update({
    where: { id: result.monitorId },
    data: {
      status: result.status,
      lastCheck: new Date(),
      nextCheck: new Date(Date.now() + 60 * 1000), // Default 60s polling
    },
  });
}

export async function reportResultsBatch(
  prisma: any,
  probeId: string,
  results: ProbeResult[],
): Promise<void> {
  if (results.length === 0) return;

  // 1. Bulk insert events using createMany
  await prisma.monitorEvent.createMany({
    data: results.map((result) => ({
      monitorId: result.monitorId,
      status: result.status,
      latency: result.latency,
      errorReason: result.errorReason || null,
      region: result.region || `probe:${probeId}`,
      probeId,
      timestamp: result.timestamp ? new Date(result.timestamp) : new Date(),
    })),
  });

  // 2. Fetch intervals of the monitors in batch
  const monitorIds = Array.from(new Set(results.map((r) => r.monitorId)));
  const monitors = await prisma.monitor.findMany({
    where: { id: { in: monitorIds } },
    select: { id: true, interval: true },
  });
  const intervalMap = new Map<string, number>(monitors.map((m: any) => [m.id, m.interval || 60]));

  // 3. Update monitor status concurrently (keep only the latest result per monitorId to avoid write contention)
  const latestResultsMap = new Map<string, ProbeResult>();
  for (const r of results) {
    const existing = latestResultsMap.get(r.monitorId);
    if (!existing || new Date(r.timestamp) > new Date(existing.timestamp)) {
      latestResultsMap.set(r.monitorId, r);
    }
  }

  await Promise.all(
    Array.from(latestResultsMap.values()).map((result) => {
      const interval = intervalMap.get(result.monitorId) || 60;
      return prisma.monitor.update({
        where: { id: result.monitorId },
        data: {
          status: result.status,
          lastCheck: new Date(),
          nextCheck: new Date(Date.now() + interval * 1000),
        },
      });
    }),
  );
}

export async function recordHeartbeat(
  prisma: any,
  probeId: string,
  ipAddress?: string,
): Promise<void> {
  await prisma.probe.update({
    where: { id: probeId },
    data: {
      lastHeartbeat: new Date(),
      status: "ACTIVE",
      ipAddress: ipAddress || undefined,
    },
  });
}

export async function checkProbeHeartbeats(prisma: any): Promise<ProbeHeartbeatResult[]> {
  const probes = await prisma.probe.findMany({
    where: { status: { not: "DISCONNECTED" } },
    select: { id: true, lastHeartbeat: true, heartbeatInterval: true },
  });

  const results: ProbeHeartbeatResult[] = [];
  const now = Date.now();
  const disconnectedProbeIds: string[] = [];

  for (const probe of probes) {
    if (!probe.lastHeartbeat) {
      results.push({
        probeId: probe.id,
        status: "DOWN",
        secondsSinceLastHeartbeat: -1,
      });
      continue;
    }

    const secondsSince = Math.floor((now - probe.lastHeartbeat.getTime()) / 1000);
    const maxGap = probe.heartbeatInterval * 3; // 3x grace multiplier
    const status = secondsSince > maxGap ? "DOWN" : "UP";

    if (status === "DOWN") {
      disconnectedProbeIds.push(probe.id);
    }

    results.push({
      probeId: probe.id,
      status,
      secondsSinceLastHeartbeat: secondsSince,
    });
  }

  if (disconnectedProbeIds.length > 0) {
    await prisma.probe.updateMany({
      where: { id: { in: disconnectedProbeIds } },
      data: { status: "DISCONNECTED" },
    });
  }

  return results;
}
