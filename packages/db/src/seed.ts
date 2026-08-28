import { randomBytes, scryptSync } from "node:crypto";
import prisma from "./index.js";
import {
  type MonitorType,
  type MonitorStatus,
  type NotificationType,
  type AlertTrigger,
  type InsightType,
  type InsightSeverity,
  type IncidentStatus,
  type Severity,
  type IncidentEventType,
  type PostMortemStatus,
  type LatencyGranularity,
} from "./generated/client/index.js";

export interface SeedOptions {
  userEmail?: string | undefined;
  cleanExisting?: boolean | undefined;
  resetDb?: boolean | undefined;
  verbose?: boolean | undefined;
}

export async function seedDatabase(options: SeedOptions = {}) {
  const { userEmail, cleanExisting = false, resetDb = false, verbose = true } = options;

  const log = (...args: any[]) => {
    if (verbose) console.info(...args);
  };

  log(
    "🌱 [SteadyStack Seed] Initializing real SteadyStack services, APIs & endpoint seed generator...",
  );

  // 1. Locate or create target user & core auth profile
  let targetUser = userEmail
    ? await prisma.user.findUnique({ where: { email: userEmail } })
    : await prisma.user.findFirst({ orderBy: { createdAt: "asc" } });

  const defaultEmail = userEmail || "admin@steadystack.dev";
  const userId = targetUser?.id || "seed-user-admin-01";

  if (!targetUser) {
    log(`👤 No user found. Creating default administrative user: ${defaultEmail}`);
    targetUser = await prisma.user.create({
      data: {
        id: userId,
        email: defaultEmail,
        name: "SteadyStack Admin",
        emailVerified: true,
        tier: "CONSTRUCT",
        onboardingCompleted: true,
        timezone: "UTC",
        dateFormat: "YYYY-MM-DD",
        timeFormat: "HH:mm",
      },
    });
    log(`✅ Created seed user: ${targetUser.email} (${targetUser.id})`);
  } else {
    // Ensure user is on Construct tier with onboarding complete
    targetUser = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        tier: "CONSTRUCT",
        onboardingCompleted: true,
        emailVerified: true,
      },
    });
    log(`👤 Target user identified: ${targetUser.email} (${targetUser.id})`);
  }

  // 2. Seed User Session, Account, Subscription, API Key & Integrations
  log("🔐 Setting up Authentication, Subscription, API Keys & Integrations...");

  // Session
  const sessionToken = "steadystack_seed_session_token_admin_2026";
  await prisma.session.upsert({
    where: { token: sessionToken },
    update: {
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userId,
    },
    create: {
      id: "seed-session-01",
      token: sessionToken,
      userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ipAddress: "127.0.0.1",
      userAgent: "SteadyStack Dev Environment (Bun/Next.js)",
    },
  });

  // Account
  const existingAccount = await prisma.account.findFirst({
    where: { userId, providerId: "credential" },
  });
  if (!existingAccount) {
    await prisma.account.create({
      data: {
        id: "seed-account-01",
        accountId: userId,
        providerId: "credential",
        userId,
        issuer: "local:credential",
      },
    });
  } else if (existingAccount.accountId !== userId || !existingAccount.issuer) {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { accountId: userId, issuer: "local:credential" },
    });
  }

  // Subscription (Construct Tier)
  await prisma.subscription.upsert({
    where: { userId },
    update: {
      plan: "CONSTRUCT",
      status: "ACTIVE",
      currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
    create: {
      userId,
      stripeCustomerId: "cus_steadystack_admin_seed",
      stripeSubscriptionId: "sub_steadystack_construct_seed",
      plan: "CONSTRUCT",
      status: "ACTIVE",
      currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      tierVersion: "v1_launch",
    },
  });

  // API Key for CLI and programmatic SDK access
  const rawApiKey = "pg_live_steadystack_admin_master_key_2026";
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(rawApiKey, salt, 64).toString("hex");
  const apiKeyHash = `${salt}:${derivedKey}`;
  await prisma.apiKey.upsert({
    where: { keyHash: apiKeyHash },
    update: {
      name: "SteadyStack CLI & CI/CD Master Key",
      scopes: "read,write,admin",
      lastUsedAt: new Date(),
    },
    create: {
      name: "SteadyStack CLI & CI/CD Master Key",
      keyHash: apiKeyHash,
      prefix: rawApiKey.slice(0, 12) + "...",
      scopes: "read,write,admin",
      userId,
      lastUsedAt: new Date(),
    },
  });

  // User Integrations
  await prisma.userIntegration.upsert({
    where: {
      userId_provider_teamId: {
        userId,
        provider: "vercel",
        teamId: "personal",
      },
    },
    update: {
      teamName: "SteadyStack Cloud Platform",
      teamSlug: "steadystack-cloud",
    },
    create: {
      provider: "vercel",
      accessToken: "vercel_sec_steadystack_dev_token",
      configurationId: "icfg_steadystack_dev",
      userId,
      teamId: "personal",
      teamName: "SteadyStack Cloud Platform",
      teamSlug: "steadystack-cloud",
    },
  });

  // User Privacy
  await prisma.userPrivacy.upsert({
    where: { userId },
    update: { anonymizeAnalytics: false, showOnLeaderboard: true },
    create: {
      userId,
      anonymizeAnalytics: false,
      showOnLeaderboard: true,
      leaderboardBio: "SteadyStack SRE & Core Infrastructure Team",
    },
  });

  // Referral Code
  await prisma.referralCode.upsert({
    where: { userId },
    update: { clicks: 42 },
    create: {
      userId,
      code: "PULSE-VIP-2026",
      clicks: 42,
    },
  });

  // 3. Clean or Reset previous seed records if requested
  if (cleanExisting || resetDb) {
    log("🧹 [DB Reset] Cleaning previous monitors, telemetry, notifications, and status pages...");

    // Status pages & links
    await prisma.statusPageView.deleteMany({});
    await prisma.statusPageOverride.deleteMany({});
    await prisma.statusPageMonitor.deleteMany({});
    await prisma.statusPageGroup.deleteMany({});
    await prisma.statusPageI18n.deleteMany({});
    await prisma.statusPageSubscriber.deleteMany({});
    await prisma.statusPage.deleteMany({ where: { userId } });

    // Incidents, Post-Mortems, Templates, Insights
    await prisma.monitorInsight.deleteMany({});
    await prisma.postMortem.deleteMany({});
    await prisma.incidentEvent.deleteMany({});
    await prisma.regionalIncident.deleteMany({});
    await prisma.incident.deleteMany({});
    await prisma.incidentTemplate.deleteMany({
      where: { createdById: userId },
    });

    // Telemetry, Probes & Monitors
    await prisma.maintenanceWindow.deleteMany({});
    await prisma.heartbeatPing.deleteMany({});
    await prisma.dailyMonitorSummary.deleteMany({});
    await prisma.latencyAggregate.deleteMany({});
    await prisma.regionalBaseline.deleteMany({});
    await prisma.monitorEvent.deleteMany({});
    await prisma.alertRule.deleteMany({});
    await prisma.probeAssignment.deleteMany({});
    await prisma.probe.deleteMany({ where: { userId } });
    await prisma.monitor.deleteMany({ where: { userId } });

    // Channels
    await prisma.notificationChannel.deleteMany({ where: { userId } });

    log("✨ [DB Reset] All previous data cleaned successfully.");
  }

  // 4. Create Multi-Channel Notification Endpoints
  log("🔔 Creating Notification Channels across all notification types...");
  const channelsToCreate: {
    name: string;
    type: NotificationType;
    config: any;
  }[] = [
    {
      name: "SteadyStack Security Ops (Primary Email)",
      type: "EMAIL",
      config: { email: targetUser.email },
    },
    {
      name: "SteadyStack Slack #ops-alerts",
      type: "SLACK",
      config: {
        webhookUrl: "https://webhook.steadystack.internal/integrations/slack",
        channel: "#ops-alerts",
      },
    },
    {
      name: "SteadyStack Discord DevOps Room",
      type: "DISCORD",
      config: {
        webhookUrl: "https://webhook.steadystack.internal/integrations/discord",
      },
    },
    {
      name: "SteadyStack PagerDuty P1 Bridge",
      type: "WEBHOOK",
      config: {
        url: "https://webhook.steadystack.internal/integrations/pagerduty",
        headers: { "X-Routing-Key": "steadystack-ops-bridge" },
      },
    },
    {
      name: "SteadyStack Telegram SRE Bot",
      type: "TELEGRAM",
      config: {
        chatId: "-1001987654321",
        botToken: "mock_telegram_bot_token_steadystack",
      },
    },
    {
      name: "SteadyStack SMS On-Call Dispatcher",
      type: "SMS",
      config: {
        phoneNumber: "+15550198765",
      },
    },
  ];

  const createdChannels: any[] = [];
  for (const ch of channelsToCreate) {
    const existing = await prisma.notificationChannel.findFirst({
      where: { userId, name: ch.name },
    });
    if (existing) {
      createdChannels.push(existing);
    } else {
      const created = await prisma.notificationChannel.create({
        data: {
          name: ch.name,
          type: ch.type,
          config: ch.config,
          userId,
        },
      });
      createdChannels.push(created);
    }
  }
  log(`✅ Configured ${createdChannels.length} notification channels.`);

  // 5. Seed Private Network Probes
  log("🛰️ Registering Private Network Probes...");
  const probesToSeed = [
    {
      name: "SteadyStack Docker Local Probe 01",
      token: "pg_probe_local_dev_token_2026",
      userId,
      platform: "docker",
      region: "us-east-1",
      status: "ACTIVE" as const,
      version: "v1.4.2",
      ipAddress: "172.18.0.10",
      lastHeartbeat: new Date(),
      heartbeatInterval: 60,
    },
    {
      name: "SteadyStack Edge WASM Mesh Probe 02",
      token: "pg_probe_edge_wasm_token_2026",
      userId,
      platform: "wasm",
      region: "eu-central-1",
      status: "ACTIVE" as const,
      version: "v1.4.2",
      ipAddress: "172.18.0.22",
      lastHeartbeat: new Date(),
      heartbeatInterval: 60,
    },
  ];

  const seededProbes: any[] = [];
  for (const p of probesToSeed) {
    const probe = await prisma.probe.upsert({
      where: { token: p.token },
      update: {
        userId,
        status: "ACTIVE",
        name: p.name,
        lastHeartbeat: new Date(),
        version: p.version,
        platform: p.platform,
        region: p.region,
      },
      create: p,
    });
    seededProbes.push(probe);
  }
  const privateProbe = seededProbes[0];
  log(`✅ Configured ${seededProbes.length} active private probes for ${targetUser.email}.`);

  // 6. Define Real SteadyStack Monitor Types & Endpoints (All 13 Types)
  interface SeedMonitorDef {
    name: string;
    url: string;
    type: MonitorType;
    interval: number;
    timeout: number;
    status: MonitorStatus;
    checkRegions: string[];
    alertThreshold: number;
    dynamicThresholding: boolean;
    runbookUrl?: string;
    method?: string;
    headers?: { key: string; value: string }[];
    body?: string;
    expectation?: any;
    script?: any;
    heartbeatToken?: string;
    tags: string[];
    baseLatencyMs: number;
    groupName: string;
    assignToPrivateProbe?: boolean;
    isDown?: boolean;
    isMaintenance?: boolean;
  }

  const monitorDefinitions: SeedMonitorDef[] = [
    // ── Group 1: Core API & Application Gateways (HTTP) ───────────────────────────
    {
      name: "SteadyStack Core API Health Check",
      url: "http://localhost:3000/api/health",
      type: "HTTP",
      method: "GET",
      interval: 30,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1", "eu-central-1", "ap-northeast-1", "sa-east-1", "af-south-1"],
      alertThreshold: 2,
      dynamicThresholding: true,
      runbookUrl: "https://docs.steadystack.dev/runbooks/api-health",
      headers: [
        { key: "Accept", value: "application/json" },
        { key: "X-Watchdog-Source", value: "steadystack-mesh" },
      ],
      expectation: {
        body_contains: "ok",
        json_assertions: [
          { path: "$.status", operator: "==", value: "ok" },
          { path: "$.db", operator: "==", value: "connected" },
        ],
      },
      tags: ["core", "api", "health", "tier-1", "mesh"],
      baseLatencyMs: 14,
      groupName: "Core API & Application Gateways",
    },
    {
      name: "SteadyStack Database Connection Probe",
      url: "http://localhost:3000/api/test-db",
      type: "HTTP",
      method: "GET",
      interval: 60,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1", "eu-west-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      runbookUrl: "https://docs.steadystack.dev/runbooks/db-connectivity",
      headers: [{ key: "Accept", value: "application/json" }],
      expectation: {
        json_assertions: [{ path: "$.status", operator: "==", value: "connected" }],
      },
      tags: ["database", "postgres", "health", "tier-1"],
      baseLatencyMs: 12,
      groupName: "Core API & Application Gateways",
    },
    {
      name: "SteadyStack Better-Auth Session Service",
      url: "http://localhost:3000/api/auth/get-session",
      type: "HTTP",
      method: "GET",
      interval: 60,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1", "eu-central-1", "ap-northeast-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      runbookUrl: "https://docs.steadystack.dev/runbooks/auth-failures",
      headers: [{ key: "Accept", value: "application/json" }],
      tags: ["auth", "better-auth", "security", "session"],
      baseLatencyMs: 18,
      groupName: "Core API & Application Gateways",
    },
    {
      name: "SteadyStack Web App Dashboard UI",
      url: "http://localhost:3000/dashboard",
      type: "HTTP",
      method: "GET",
      interval: 60,
      timeout: 10,
      status: "UP",
      checkRegions: ["us-east-1", "eu-west-1", "sa-east-1"],
      alertThreshold: 2,
      dynamicThresholding: false,
      expectation: {
        body_contains: "SteadyStack",
      },
      tags: ["web", "nextjs", "dashboard", "frontend"],
      baseLatencyMs: 28,
      groupName: "Core API & Application Gateways",
    },
    {
      name: "SteadyStack Stripe Webhook Receiver",
      url: "http://localhost:3000/api/stripe/webhook",
      type: "HTTP",
      method: "POST",
      interval: 120,
      timeout: 10,
      status: "UP",
      checkRegions: ["us-east-1", "eu-central-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      headers: [
        { key: "Content-Type", value: "application/json" },
        {
          key: "Stripe-Signature",
          value: "t=1720000000,v1=test_signature_seed",
        },
      ],
      body: JSON.stringify({
        type: "payment_intent.succeeded",
        data: { object: { id: "pi_seed_steadystack_123" } },
      }),
      tags: ["billing", "stripe", "webhooks", "payments"],
      baseLatencyMs: 25,
      groupName: "Core API & Application Gateways",
    },
    {
      name: "SteadyStack CLI & REST API Management Gateway",
      url: "http://localhost:3000/api/cli/monitors",
      type: "HTTP",
      method: "GET",
      interval: 60,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1", "eu-west-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      headers: [
        { key: "Accept", value: "application/json" },
        { key: "Authorization", value: `Bearer ${rawApiKey}` },
      ],
      tags: ["cli", "api", "management", "rest"],
      baseLatencyMs: 16,
      groupName: "Core API & Application Gateways",
    },

    // ── Group 2: Edge Worker & Realtime Streaming ──────────────────────────────────
    {
      name: "SteadyStack Cloudflare Worker Edge Engine",
      url: "http://127.0.0.1:8787/",
      type: "HTTP",
      method: "GET",
      interval: 30,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1", "eu-central-1", "ap-northeast-1"],
      alertThreshold: 1,
      dynamicThresholding: true,
      expectation: {
        body_contains: "SteadyStack Worker is Running",
      },
      tags: ["worker", "cloudflare-edge", "monitoring-engine"],
      baseLatencyMs: 8,
      groupName: "Edge Worker & Realtime Streaming",
    },
    {
      name: "SteadyStack Worker Edge Heartbeat Ping",
      url: "http://127.0.0.1:8787/api/heartbeat",
      type: "HTTP",
      method: "GET",
      interval: 30,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1", "eu-central-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      tags: ["worker", "edge", "heartbeat"],
      baseLatencyMs: 6,
      groupName: "Edge Worker & Realtime Streaming",
    },
    {
      name: "SteadyStack Private Probe Gateway API",
      url: "http://127.0.0.1:8787/api/probes/register",
      type: "HTTP",
      method: "POST",
      interval: 60,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      headers: [{ key: "Content-Type", value: "application/json" }],
      body: JSON.stringify({
        token: "pg_probe_local_dev_token_2026",
        version: "v1.4.2",
        platform: "docker",
      }),
      tags: ["probe", "gateway", "docker", "edge"],
      baseLatencyMs: 7,
      groupName: "Edge Worker & Realtime Streaming",
    },
    {
      name: "SteadyStack Live Telemetry WebSocket Stream",
      url: "ws://127.0.0.1:8787/api/broadcast",
      type: "WEBSOCKET",
      interval: 60,
      timeout: 10,
      status: "UP",
      checkRegions: ["us-east-1", "eu-central-1", "ap-southeast-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      expectation: {
        event: "ping",
        timeoutMs: 5000,
        payload_contains: "connected",
      },
      tags: ["websocket", "durable-objects", "realtime", "telemetry"],
      baseLatencyMs: 11,
      groupName: "Edge Worker & Realtime Streaming",
    },

    // ── Group 3: Database, Caching & Infrastructure Layer ─────────────────────────
    {
      name: "SteadyStack PostgreSQL Activity & Connection Pool Probe",
      url: "postgresql://steadystack:steadystack@localhost:5432/steadystack",
      type: "DATABASE",
      interval: 60,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      body: "SELECT count(*) AS pool_connections, pg_is_in_recovery() AS is_replica FROM pg_stat_activity;",
      expectation: {
        assertions: [{ column: "is_replica", operator: "==", value: "false" }],
      },
      tags: ["database", "postgres", "sql-probe", "connection-pool"],
      baseLatencyMs: 5,
      groupName: "Database, Caching & Infrastructure Layer",
      assignToPrivateProbe: true,
    },
    {
      name: "SteadyStack PostgreSQL Database Port (5432)",
      url: "tcp://localhost:5432",
      type: "PORT",
      interval: 60,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      runbookUrl: "https://docs.steadystack.dev/runbooks/postgres-port",
      tags: ["database", "postgres", "port-5432", "tier-1"],
      baseLatencyMs: 4,
      groupName: "Database, Caching & Infrastructure Layer",
      assignToPrivateProbe: true,
    },
    {
      name: "SteadyStack Redis Cache & Queue Port (6379)",
      url: "tcp://localhost:6379",
      type: "PORT",
      interval: 60,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      tags: ["redis", "cache", "port-6379"],
      baseLatencyMs: 3,
      groupName: "Database, Caching & Infrastructure Layer",
      assignToPrivateProbe: true,
    },
    {
      name: "SteadyStack MailHog SMTP Port (1025)",
      url: "tcp://localhost:1025",
      type: "PORT",
      interval: 120,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      tags: ["mailhog", "smtp", "port-1025"],
      baseLatencyMs: 3,
      groupName: "Database, Caching & Infrastructure Layer",
      assignToPrivateProbe: true,
    },
    {
      name: "SteadyStack MailHog Email Inbox Web UI",
      url: "http://localhost:8025",
      type: "HTTP",
      method: "GET",
      interval: 120,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      expectation: {
        body_contains: "MailHog",
      },
      tags: ["mailhog", "email-preview", "web-ui"],
      baseLatencyMs: 6,
      groupName: "Database, Caching & Infrastructure Layer",
    },

    // ── Group 4: Public Feeds, Badges & Network Security ──────────────────────────
    {
      name: "SteadyStack Status Badge SVG Endpoint",
      url: "http://localhost:3000/api/badge/steadystack-global-status",
      type: "HTTP",
      method: "GET",
      interval: 60,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1", "eu-central-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      headers: [{ key: "Accept", value: "image/svg+xml" }],
      expectation: {
        body_contains: "<svg",
      },
      tags: ["badge", "svg", "status-page", "public-api"],
      baseLatencyMs: 12,
      groupName: "Public Feeds, Badges & Network Security",
    },
    {
      name: "SteadyStack Embed Widget JSON Endpoint",
      url: "http://localhost:3000/api/widget/steadystack-global-status/status",
      type: "HTTP",
      method: "GET",
      interval: 60,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1", "ap-southeast-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      expectation: {
        json_assertions: [
          {
            path: "$.statusPage.slug",
            operator: "==",
            value: "steadystack-global-status",
          },
        ],
      },
      tags: ["widget", "embed", "status-page", "api"],
      baseLatencyMs: 14,
      groupName: "Public Feeds, Badges & Network Security",
    },
    {
      name: "SteadyStack Incident RSS Feed",
      url: "http://localhost:3000/api/feeds/steadystack-global-status/rss",
      type: "HTTP",
      method: "GET",
      interval: 120,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1", "eu-west-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      headers: [{ key: "Accept", value: "application/xml, text/xml" }],
      expectation: {
        body_contains: "<rss",
      },
      tags: ["feeds", "rss", "syndication", "status"],
      baseLatencyMs: 15,
      groupName: "Public Feeds, Badges & Network Security",
    },
    {
      name: "SteadyStack Cloudflare Anycast CDN Mesh",
      url: "ping://1.1.1.1",
      type: "PING",
      interval: 30,
      timeout: 5,
      status: "UP",
      checkRegions: [
        "us-east-1",
        "us-west-1",
        "eu-west-1",
        "eu-central-1",
        "ap-southeast-1",
        "ap-northeast-1",
        "sa-east-1",
        "af-south-1",
      ],
      alertThreshold: 2,
      dynamicThresholding: true,
      runbookUrl: "https://docs.steadystack.dev/runbooks/anycast-mesh",
      tags: ["network", "cdn", "anycast", "icmp", "global-mesh"],
      baseLatencyMs: 8,
      groupName: "Public Feeds, Badges & Network Security",
    },
    {
      name: "SteadyStack Local Gateway ICMP Ping",
      url: "ping://127.0.0.1",
      type: "PING",
      interval: 60,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1", "us-west-2"],
      alertThreshold: 1,
      dynamicThresholding: false,
      tags: ["network", "gateway", "icmp", "local-dev"],
      baseLatencyMs: 2,
      groupName: "Public Feeds, Badges & Network Security",
    },
    {
      name: "SteadyStack Production Edge TLS 1.3 Certificate Watchdog",
      url: "https://steadystack.dev",
      type: "SSL",
      interval: 3600,
      timeout: 10,
      status: "UP",
      checkRegions: ["us-east-1", "eu-west-1", "ap-northeast-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      runbookUrl: "https://docs.steadystack.dev/runbooks/ssl-renewal",
      tags: ["security", "ssl", "tls-1.3", "certificates"],
      baseLatencyMs: 32,
      groupName: "Public Feeds, Badges & Network Security",
    },
    {
      name: "SteadyStack Authoritative DNS Watchdog",
      url: "steadystack.dev",
      type: "DNS",
      interval: 60,
      timeout: 5,
      status: "UP",
      checkRegions: ["us-east-1", "eu-west-1", "ap-southeast-1", "sa-east-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      expectation: {
        expectedIPs: ["104.21.55.10", "172.67.182.20"],
      },
      tags: ["dns", "nameserver", "anti-poisoning"],
      baseLatencyMs: 10,
      groupName: "Public Feeds, Badges & Network Security",
    },
    {
      name: "SteadyStack Domain Registration & WHOIS Expiration Watchdog",
      url: "steadystack.dev",
      type: "DOMAIN",
      interval: 86400,
      timeout: 15,
      status: "UP",
      checkRegions: ["us-east-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      tags: ["domain", "whois", "registrar", "expiration"],
      baseLatencyMs: 85,
      groupName: "Public Feeds, Badges & Network Security",
    },
    {
      name: "SteadyStack Cloudflare AS13335 BGP Route & RPKI Sentinel",
      url: "AS13335",
      type: "BGP",
      interval: 300,
      timeout: 15,
      status: "UP",
      checkRegions: ["us-east-1", "eu-west-1", "ap-southeast-1"],
      alertThreshold: 1,
      dynamicThresholding: false,
      expectation: {
        expected_upstream: ["AS174", "AS3356", "AS2914"],
        rpki_required: true,
      },
      tags: ["network", "bgp", "rpki", "anti-hijack"],
      baseLatencyMs: 110,
      groupName: "Public Feeds, Badges & Network Security",
    },
    {
      name: "SteadyStack Worker Cron Dead Man's Snitch",
      url: "heartbeat://steadystack-worker-snitch-live",
      heartbeatToken: "steadystack-worker-snitch-live",
      type: "HEARTBEAT",
      interval: 60,
      timeout: 10,
      status: "UP",
      checkRegions: [],
      alertThreshold: 1,
      dynamicThresholding: false,
      runbookUrl: "https://docs.steadystack.dev/runbooks/worker-cron-snitch",
      tags: ["heartbeat", "deadmans-snitch", "worker", "cron"],
      baseLatencyMs: 2,
      groupName: "Edge Worker & Realtime Streaming",
    },
    {
      name: "SteadyStack Nightly Database S3 Backup Snitch",
      url: "heartbeat://steadystack-nightly-db-backup",
      heartbeatToken: "steadystack-nightly-db-backup",
      type: "HEARTBEAT",
      interval: 86400,
      timeout: 30,
      status: "UP",
      checkRegions: [],
      alertThreshold: 1,
      dynamicThresholding: false,
      tags: ["heartbeat", "backup", "disaster-recovery", "cron"],
      baseLatencyMs: 2,
      groupName: "Database, Caching & Infrastructure Layer",
    },
    {
      name: "Synthetic E2E: User Sign-in & Dashboard Journey",
      url: "http://localhost:3000/login",
      type: "BROWSER",
      interval: 300,
      timeout: 30,
      status: "UP",
      checkRegions: ["us-east-1", "eu-central-1", "ap-northeast-1"],
      alertThreshold: 2,
      dynamicThresholding: true,
      runbookUrl: "https://docs.steadystack.dev/runbooks/synthetic-auth",
      script: [
        { action: "goto", value: "http://localhost:3000/login", selector: "" },
        {
          action: "fill",
          value: "admin@steadystack.dev",
          selector: "input[name='email']",
        },
        {
          action: "fill",
          value: "AdminPassword123!",
          selector: "input[name='password']",
        },
        { action: "click", value: "", selector: "button[type='submit']" },
        { action: "wait", value: "1500", selector: "" },
        { action: "assert_text", value: "Monitors", selector: "" },
      ],
      tags: ["synthetic", "browser", "playwright", "auth", "critical-journey"],
      baseLatencyMs: 380,
      groupName: "Core API & Application Gateways",
    },
    {
      name: "API Sequence: Health Check → Auth Session → Test DB",
      url: "http://localhost:3000",
      type: "SEQUENCE",
      interval: 120,
      timeout: 20,
      status: "UP",
      checkRegions: ["us-east-1", "eu-central-1", "ap-southeast-1"],
      alertThreshold: 2,
      dynamicThresholding: true,
      runbookUrl: "https://docs.steadystack.dev/runbooks/api-chain",
      script: [
        {
          name: "1. Core API Health Check",
          method: "GET",
          url: "/api/health",
          headers: [{ key: "Accept", value: "application/json" }],
          body: "",
          assertions: [
            { type: "status_code", path: "", value: "200" },
            { type: "json_path", path: "status", value: "ok" },
          ],
          extractions: [],
        },
        {
          name: "2. Query Better-Auth Session Service",
          method: "GET",
          url: "/api/auth/get-session",
          headers: [{ key: "Accept", value: "application/json" }],
          body: "",
          assertions: [{ type: "status_code", path: "", value: "200" }],
          extractions: [],
        },
        {
          name: "3. Direct Database Connectivity Ping",
          method: "GET",
          url: "/api/test-db",
          headers: [{ key: "Accept", value: "application/json" }],
          body: "",
          assertions: [
            { type: "status_code", path: "", value: "200" },
            { type: "json_path", path: "status", value: "connected" },
          ],
          extractions: [],
        },
      ],
      tags: ["sequence", "api-chain", "synthetic", "health", "auth"],
      baseLatencyMs: 140,
      groupName: "Core API & Application Gateways",
    },
  ];

  log(
    `📡 Seeding ${monitorDefinitions.length} Real SteadyStack Monitors across all types and verification configurations...`,
  );

  const seededMonitors: any[] = [];

  for (const def of monitorDefinitions) {
    let monitor = await prisma.monitor.findFirst({
      where: { userId, name: def.name },
    });

    const monitorData = {
      name: def.name,
      url: def.url,
      type: def.type,
      interval: def.interval,
      timeout: def.timeout,
      status: def.status,
      userId,
      checkRegions: def.checkRegions.length > 0 ? JSON.stringify(def.checkRegions) : null,
      alertThreshold: def.alertThreshold,
      dynamicThresholding: def.dynamicThresholding,
      runbookUrl: def.runbookUrl || null,
      method: def.method || "GET",
      headers: def.headers ? JSON.stringify(def.headers) : null,
      body: def.body || null,
      expectation: def.expectation ? JSON.stringify(def.expectation) : null,
      script: def.script ? JSON.stringify(def.script) : null,
      heartbeatToken: def.heartbeatToken || null,
      tags: def.tags,
      lastCheck: new Date(),
      nextCheck: new Date(Date.now() + def.interval * 1000),
    };

    if (monitor) {
      monitor = await prisma.monitor.update({
        where: { id: monitor.id },
        data: monitorData,
      });
    } else {
      monitor = await prisma.monitor.create({
        data: monitorData,
      });
    }

    seededMonitors.push({ ...monitor, def });

    // Assign to private probe if marked
    if (def.assignToPrivateProbe && privateProbe) {
      await prisma.probeAssignment.upsert({
        where: {
          probeId_monitorId: {
            probeId: privateProbe.id,
            monitorId: monitor.id,
          },
        },
        update: {},
        create: {
          probeId: privateProbe.id,
          monitorId: monitor.id,
        },
      });
    }

    // Attach Default Alert Rules
    await prisma.alertRule.deleteMany({ where: { monitorId: monitor.id } });
    await prisma.alertRule.create({
      data: {
        monitorId: monitor.id,
        trigger: (def.type === "SSL"
          ? "SSL_EXPIRY"
          : def.type === "DNS"
            ? "DNS_WATCHDOG"
            : def.type === "DOMAIN"
              ? "DOMAIN_EXPIRY"
              : "STATUS_CHANGE") as AlertTrigger,
        threshold: def.type === "SSL" ? 14 : def.type === "DOMAIN" ? 30 : null,
        targetStatus: "DOWN",
        enabled: true,
        channels: {
          connect: createdChannels.slice(0, 3).map((ch) => ({ id: ch.id })),
        },
      },
    });

    // Generate Realistic Time-Series Telemetry Events
    await prisma.monitorEvent.deleteMany({ where: { monitorId: monitor.id } });

    const now = Date.now();
    const eventCount = 30;
    const eventsToCreate: any[] = [];
    const regions = def.checkRegions.length > 0 ? def.checkRegions : ["us-east-1"];

    for (let i = 0; i < eventCount; i++) {
      const timestamp = new Date(now - i * (def.interval * 1000 || 60000));
      const region = regions[i % regions.length] ?? "us-east-1";

      let regionMultiplier = 1.0;
      if (region.startsWith("eu")) regionMultiplier = 3.2;
      else if (region.startsWith("ap")) regionMultiplier = 5.8;
      else if (region.startsWith("sa")) regionMultiplier = 7.5;
      else if (region.startsWith("af") || region.startsWith("me")) regionMultiplier = 8.8;

      let eventStatus: MonitorStatus = def.status;
      let latency = Math.max(
        1,
        Math.round(def.baseLatencyMs * regionMultiplier + (Math.random() * 6 - 3)),
      );
      let errorReason: string | null = null;

      if (def.isDown && i < 6) {
        eventStatus = "DOWN";
        latency = 0;
        errorReason = "HTTP_503_SERVICE_UNAVAILABLE";
      } else if (def.isMaintenance) {
        eventStatus = "MAINTENANCE";
        latency = 0;
      }

      eventsToCreate.push({
        monitorId: monitor.id,
        status: eventStatus,
        latency,
        errorReason,
        timestamp,
        region,
        probeId: def.assignToPrivateProbe ? privateProbe?.id : null,
      });
    }

    await prisma.monitorEvent.createMany({
      data: eventsToCreate,
    });

    // Seed Heartbeat Pings if Heartbeat monitor
    if (def.type === "HEARTBEAT") {
      await prisma.heartbeatPing.deleteMany({
        where: { monitorId: monitor.id },
      });
      const pings: any[] = [];
      for (let p = 0; p < 15; p++) {
        pings.push({
          monitorId: monitor.id,
          pingedAt: new Date(now - p * (def.interval * 1000)),
          sourceIp: `198.51.100.${10 + p}`,
          userAgent: "SteadyStack-Cron-Snitch/2.4 (Bun-Edge)",
        });
      }
      await prisma.heartbeatPing.createMany({ data: pings });
    }

    // Seed Regional Baselines & Latency Aggregates
    await prisma.regionalBaseline.deleteMany({
      where: { monitorId: monitor.id },
    });
    await prisma.latencyAggregate.deleteMany({
      where: { monitorId: monitor.id },
    });

    for (const r of regions) {
      let rMult = 1.0;
      if (r.startsWith("eu")) rMult = 3.2;
      else if (r.startsWith("ap")) rMult = 5.8;
      else if (r.startsWith("sa")) rMult = 7.5;
      else if (r.startsWith("af") || r.startsWith("me")) rMult = 8.8;

      const baseline = Math.max(1, Math.round(def.baseLatencyMs * rMult));

      await prisma.regionalBaseline.create({
        data: {
          monitorId: monitor.id,
          region: r,
          baselineLatency: baseline,
        },
      });

      // Insert Hourly Latency Aggregates for the past 24 hours
      const aggregates: any[] = [];
      for (let h = 0; h < 24; h++) {
        const aggTime = new Date(now - h * 3600 * 1000);
        aggregates.push({
          monitorId: monitor.id,
          region: r,
          timestamp: aggTime,
          granularity: "ONE_HOUR" as LatencyGranularity,
          avgLatency: baseline + (Math.random() * 4 - 2),
          minLatency: Math.max(1, baseline - 3),
          maxLatency: baseline + 12,
          p50Latency: baseline,
          p95Latency: baseline + 6,
          p99Latency: baseline + 10,
          sampleCount: 60,
          successRate: def.isDown ? 0.92 : 0.9999,
        });
      }
      await prisma.latencyAggregate.createMany({ data: aggregates });
    }

    // Seed 7-Day Daily Summaries
    await prisma.dailyMonitorSummary.deleteMany({
      where: { monitorId: monitor.id },
    });
    const dailySummaries: any[] = [];
    for (let d = 0; d < 7; d++) {
      const summaryDate = new Date(now - d * 86400 * 1000);
      dailySummaries.push({
        monitorId: monitor.id,
        date: summaryDate,
        uptimePct: def.isDown && d === 0 ? 96.8 : 100.0,
        avgLatency: Math.max(1, Math.round(def.baseLatencyMs * 1.5)),
        checksTotal: 2880,
        checksUp: def.isDown && d === 0 ? 2788 : 2880,
        checksDown: def.isDown && d === 0 ? 92 : 0,
        downDuration: def.isDown && d === 0 ? 5520 : 0,
      });
    }
    await prisma.dailyMonitorSummary.createMany({ data: dailySummaries });
  }

  // 7. Seed Incident Templates
  log("📝 Creating Incident Response Templates...");
  const incidentTemplates = [
    {
      name: "Database Connection Pool Saturation",
      title: "Elevated Latency Due to PostgreSQL Connection Pool Saturation",
      description:
        "PostgreSQL connection exhaustion observed across active worker instances. Triaging connection pool limits and slow queries.",
      severity: "HIGH" as Severity,
      status: "INVESTIGATING" as IncidentStatus,
    },
    {
      name: "Edge CDN & Anycast Route Degradation",
      title: "Intermittent Edge Packet Loss on Anycast Route Mesh",
      description:
        "Elevated packet loss and DNS resolution latency detected in regional edge POPs. Re-routing traffic to backup transit providers.",
      severity: "MEDIUM" as Severity,
      status: "IDENTIFIED" as IncidentStatus,
    },
    {
      name: "Scheduled Database Cluster Maintenance",
      title: "Planned PostgreSQL Version Upgrade & Partition Indexing",
      description:
        "Scheduled maintenance window to perform database index rebalancing and schema migrations.",
      severity: "LOW" as Severity,
      status: "MONITORING" as IncidentStatus,
    },
  ];

  for (const tpl of incidentTemplates) {
    const existing = await prisma.incidentTemplate.findFirst({
      where: { createdById: userId, name: tpl.name },
    });
    if (!existing) {
      await prisma.incidentTemplate.create({
        data: {
          ...tpl,
          createdById: userId,
        },
      });
    }
  }

  // 8. Seed Realistic Resolved Incident & Post-Mortem
  log("🚨 Creating Historical Resolved Incident & Post-Mortem...");
  const dbProbeMonitor = seededMonitors.find(
    (m) => m.def.name === "SteadyStack Database Connection Probe",
  );

  if (dbProbeMonitor) {
    await prisma.incident.deleteMany({
      where: { monitorId: dbProbeMonitor.id },
    });
    const resolvedIncident = await prisma.incident.create({
      data: {
        monitorId: dbProbeMonitor.id,
        status: "RESOLVED" as IncidentStatus,
        severity: "HIGH" as Severity,
        title: "Transient Connection Pool Exhaustion on Primary PostgreSQL Instance",
        description:
          "Automated health check detected elevated connection latency and intermittent connection pool timeout errors.",
        startedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 47 * 60 * 60 * 1000 - 30 * 60 * 1000),
        events: {
          create: [
            {
              type: "STATE_CHANGE" as IncidentEventType,
              message: "Watchdog detected connection pool queue timeout on port 5432.",
              createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
            },
            {
              type: "ALERT_SENT" as IncidentEventType,
              message: "Automated alert dispatched to #ops-alerts and PagerDuty.",
              createdAt: new Date(Date.now() - 47 * 60 * 60 * 1000 - 55 * 60 * 1000),
            },
            {
              type: "COMMENT" as IncidentEventType,
              message:
                "SRE team adjusted PgBouncer pool ceiling and cleared idle backend connections.",
              createdAt: new Date(Date.now() - 47 * 60 * 60 * 1000 - 40 * 60 * 1000),
            },
            {
              type: "AUTO_RESOLVE" as IncidentEventType,
              message: "All 3 consecutive regional probes confirmed 100% healthy response times.",
              createdAt: new Date(Date.now() - 47 * 60 * 60 * 1000 - 30 * 60 * 1000),
            },
          ],
        },
      },
    });

    // Create Incident Post-Mortem
    await prisma.postMortem.upsert({
      where: { incidentId: resolvedIncident.id },
      update: {},
      create: {
        incidentId: resolvedIncident.id,
        summary: "Primary PostgreSQL connection pool reached maximum allocated client limit.",
        rootCause:
          "Unindexed aggregation query ran in parallel across 4 background workers simultaneously.",
        impactScope: "API response latency elevated by 240ms for 30 minutes. Zero data loss.",
        detectionMethod: "SteadyStack Synthetic Database Health Probe",
        timeline:
          "T-48h: Saturation detected -> T-47.5h: Pool limit expanded -> T-47.5h: Health verified and resolved",
        actionItems:
          "1. Added composite index on telemetry event timestamp.\n2. Configured strict PgBouncer client timeout.\n3. Added connection count watchdog alert.",
        status: "PUBLISHED" as PostMortemStatus,
      },
    });
  }

  // Active Maintenance Window
  const edgeWorkerMonitor = seededMonitors.find(
    (m) => m.def.name === "SteadyStack Cloudflare Worker Edge Engine",
  );
  if (edgeWorkerMonitor) {
    await prisma.maintenanceWindow.deleteMany({
      where: { monitorId: edgeWorkerMonitor.id },
    });
    await prisma.maintenanceWindow.create({
      data: {
        monitorId: edgeWorkerMonitor.id,
        description: "Scheduled edge worker runtime upgrade and Durable Object state compaction",
        startAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        endAt: new Date(Date.now() + 3 * 60 * 60 * 1000),
      },
    });
  }

  // 9. Generate AI Insights for the Monitors
  log("🧠 Generating AI Monitor Insights...");
  await prisma.monitorInsight.deleteMany({
    where: { monitor: { userId } },
  });

  const apiMonitor = seededMonitors.find((m) => m.def.name === "SteadyStack Core API Health Check");
  if (apiMonitor) {
    await prisma.monitorInsight.create({
      data: {
        monitorId: apiMonitor.id,
        type: "ANOMALY" as InsightType,
        severity: "INFO" as InsightSeverity,
        message: "P95 latency decreased by 14% following edge route optimization in eu-central-1.",
        metadata: JSON.stringify({
          improvementPct: 14,
          region: "eu-central-1",
        }),
      },
    });
  }

  const sslMonitor = seededMonitors.find(
    (m) => m.def.name === "SteadyStack Production Edge TLS 1.3 Certificate Watchdog",
  );
  if (sslMonitor) {
    await prisma.monitorInsight.create({
      data: {
        monitorId: sslMonitor.id,
        type: "PREDICTION" as InsightType,
        severity: "WARNING" as InsightSeverity,
        message: "TLS certificate expires in 68 days. Automated ACME renewal scheduled in 38 days.",
        metadata: JSON.stringify({ daysRemaining: 68, autoRenew: true }),
      },
    });
  }

  const p95Monitor = seededMonitors.find(
    (m) => m.def.name === "SteadyStack Cloudflare Anycast CDN Mesh",
  );
  if (p95Monitor) {
    await prisma.monitorInsight.create({
      data: {
        monitorId: p95Monitor.id,
        type: "ADVICE" as InsightType,
        severity: "INFO" as InsightSeverity,
        message:
          "Anycast mesh latency is optimal across all 6 continents with 99.99% edge availability.",
        metadata: JSON.stringify({ optimal: true, globalP50: "8ms" }),
      },
    });
  }

  // 10. Create / Update Public Status Page with Grouped Monitors
  log("🌐 Creating Global Status Page & Grouped Components...");
  const statusPageSlug = "steadystack-global-status";
  let statusPage = await prisma.statusPage.findFirst({
    where: { userId, slug: statusPageSlug },
  });

  const statusPageData = {
    slug: statusPageSlug,
    title: "SteadyStack Global Infrastructure Status",
    description:
      "Real-time operational status for SteadyStack core API gateways, Cloudflare edge workers, PostgreSQL clusters, and public feeds.",
    theme: {
      mode: "dark",
      colors: {
        primary: "#10b981",
        background: "#090d16",
      },
    },
    isPrivate: false,
    seoIndex: true,
    showUptime: true,
    showResponseTime: true,
    showPaused: false,
    showInShowcase: true,
    widgetEnabled: true,
    historyDays: 90,
    barType: "absolute",
    cardType: "duration",
    userId,
  };

  if (statusPage) {
    statusPage = await prisma.statusPage.update({
      where: { id: statusPage.id },
      data: statusPageData,
    });
  } else {
    statusPage = await prisma.statusPage.create({
      data: statusPageData,
    });
  }

  // Create Groups
  const groupNames = [
    "Core API & Application Gateways",
    "Edge Worker & Realtime Streaming",
    "Database, Caching & Infrastructure Layer",
    "Public Feeds, Badges & Network Security",
  ];

  await prisma.statusPageGroup.deleteMany({
    where: { statusPageId: statusPage.id },
  });
  const createdGroups = new Map<string, string>();

  for (const [idx, gName] of groupNames.entries()) {
    const grp = await prisma.statusPageGroup.create({
      data: {
        statusPageId: statusPage.id,
        name: gName,
        sortOrder: idx + 1,
        isExpanded: true,
      },
    });
    createdGroups.set(gName, grp.id);
  }

  // Link monitors to status page with groups
  await prisma.statusPageMonitor.deleteMany({
    where: { statusPageId: statusPage.id },
  });

  for (const [i, sm] of seededMonitors.entries()) {
    const groupId = createdGroups.get(sm.def.groupName) || null;
    await prisma.statusPageMonitor.create({
      data: {
        statusPageId: statusPage.id,
        monitorId: sm.id,
        groupId,
        sortOrder: i + 1,
        displayName: sm.def.name,
      },
    });
  }

  // Seed Status Page Subscriber
  const subscriberEmail = "subscriber@steadystack.dev";
  await prisma.statusPageSubscriber.upsert({
    where: {
      statusPageId_email: {
        statusPageId: statusPage.id,
        email: subscriberEmail,
      },
    },
    update: { verified: true },
    create: {
      statusPageId: statusPage.id,
      email: subscriberEmail,
      verified: true,
      manageToken: "token_sub_steadystack_admin_manage",
      notifyIncidents: true,
      notifyMaintenance: true,
    },
  });

  // Seed Status Page Views for Analytics
  await prisma.statusPageView.deleteMany({
    where: { statusPageId: statusPage.id },
  });
  const sampleViews = [
    { country: "US", userAgent: "Mozilla/5.0 Chrome/120.0" },
    { country: "DE", userAgent: "Mozilla/5.0 Firefox/122.0" },
    { country: "JP", userAgent: "Mozilla/5.0 Safari/605.1" },
    { country: "GB", userAgent: "Mozilla/5.0 Chrome/120.0" },
    { country: "BR", userAgent: "Mozilla/5.0 Edge/120.0" },
  ];
  for (const sv of sampleViews) {
    await prisma.statusPageView.create({
      data: {
        statusPageId: statusPage.id,
        visitorHash: createHash("sha256")
          .update(sv.country + Math.random())
          .digest("hex")
          .slice(0, 16),
        country: sv.country,
        userAgent: sv.userAgent,
      },
    });
  }

  log("\n========================================================");
  log("🎉 [SteadyStack Seed Complete] Successfully seeded database!");
  log(`👤 Target User: ${targetUser.email} (${targetUser.id})`);
  log(`🔑 CLI API Key: ${rawApiKey}`);
  log(`📡 Total Real Monitors Seeded: ${seededMonitors.length}`);
  log("📋 Monitor Types Covered:");
  const distinctTypes = Array.from(new Set(monitorDefinitions.map((m) => m.type)));
  for (const t of distinctTypes) {
    const count = monitorDefinitions.filter((m) => m.type === t).length;
    log(`   - ${t.padEnd(12)}: ${count} configuration(s)`);
  }
  log(`🔔 Notification Channels: ${createdChannels.length}`);
  log(`📁 Status Page Groups: ${groupNames.length}`);
  log(`🌐 Status Page: http://localhost:3000/status/${statusPageSlug}`);
  log(`📊 Dashboard: http://localhost:3000/dashboard`);
  log("========================================================\n");

  return {
    user: targetUser,
    apiKey: rawApiKey,
    monitorsCount: seededMonitors.length,
    channelsCount: createdChannels.length,
    statusPageSlug,
  };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const emailArgIdx = args.findIndex((a) => a === "--user" || a === "--email");
  const userEmail = emailArgIdx !== -1 ? args[emailArgIdx + 1] : undefined;
  const cleanExisting = args.includes("--clean") || args.includes("--reset");
  const resetDb = args.includes("--reset");

  seedDatabase({ userEmail, cleanExisting, resetDb })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed execution failed:", err);
      process.exit(1);
    });
}
