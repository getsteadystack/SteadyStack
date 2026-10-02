"use server";

import prisma from "@steadystack/db";
import { auth } from "@steadystack/auth";
import { headers } from "next/headers";

export type DataInventory = {
  category: string;
  description: string;
  collected: boolean;
  retention: string;
  purpose: string;
  canAnonymize: boolean;
  anonymized: boolean;
};

export type PrivacyReport = {
  userName: string;
  userEmail: string;
  tier: string;
  accountCreated: string;
  totalMonitors: number;
  totalEvents: number;
  totalIncidents: number;
  totalStatusPages: number;
  dataInventory: DataInventory[];
  anonymizeAnalytics: boolean;
  showOnLeaderboard: boolean;
  leaderboardBio: string;
};

export async function getPrivacyReport(): Promise<PrivacyReport> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const [monitorCount, eventCount, incidentCount, statusPageCount] = await Promise.all([
    prisma.monitor.count({ where: { userId } }),
    prisma.monitorEvent.count({
      where: { monitor: { userId } },
    }),
    prisma.incident.count({
      where: { monitor: { userId } },
    }),
    prisma.statusPage.count({ where: { userId } }),
  ]);

  let privacy = await prisma.userPrivacy.findUnique({
    where: { userId },
  });

  if (!privacy) {
    privacy = await prisma.userPrivacy.create({
      data: {
        userId,
        anonymizeAnalytics: true,
        showOnLeaderboard: false,
        leaderboardBio: "",
      },
    });
  }

  const anonymizeAnalytics = privacy.anonymizeAnalytics;

  const dataInventory: DataInventory[] = [
    {
      category: "Account Profile",
      description: "Name, email, avatar image, timezone preferences",
      collected: true,
      retention: "Until account deletion",
      purpose: "Account management, notifications, personalization",
      canAnonymize: false,
      anonymized: false,
    },
    {
      category: "Monitor Configuration",
      description: "URLs, check intervals, headers, request bodies, scripts, alert rules",
      collected: true,
      retention: "Until monitor deletion or account deletion",
      purpose: "Core monitoring functionality",
      canAnonymize: false,
      anonymized: false,
    },
    {
      category: "Check Results (MonitorEvents)",
      description: "Latency, status codes, error reasons, timestamps, probe region",
      collected: true,
      retention: "3 days (Starter), 45 days (Pro), 1 year (Agency & Scale)",
      purpose: "Uptime tracking, incident detection, SLA reports",
      canAnonymize: false,
      anonymized: false,
    },
    {
      category: "Latency Aggregates",
      description: "Aggregated latency metrics (avg, min, max, p50, p95, p99)",
      collected: true,
      retention: "Until account deletion",
      purpose: "Performance charts, trend analysis, regression detection",
      canAnonymize: false,
      anonymized: false,
    },
    {
      category: "Incident Data",
      description: "Incident timelines, severity, post-mortems, resolution notes",
      collected: true,
      retention: "Until incident deletion or account deletion",
      purpose: "Incident management, post-mortem analysis",
      canAnonymize: false,
      anonymized: false,
    },
    {
      category: "Notification Channel Config",
      description: "Webhook URLs, email addresses, Slack/Discord channel IDs",
      collected: true,
      retention: "Until channel deletion or account deletion",
      purpose: "Alert delivery",
      canAnonymize: false,
      anonymized: false,
    },
    {
      category: "Status Page Analytics",
      description: "Visitor IP (hashed), page views, timestamps",
      collected: true,
      retention: "26 months (GDPR-compliant rolling window)",
      purpose: "Status page traffic insights",
      canAnonymize: true,
      anonymized: anonymizeAnalytics,
    },
    {
      category: "Session Data",
      description: "Session tokens, IP addresses, user agents",
      collected: true,
      retention: "Until session expiry or logout",
      purpose: "Authentication and security",
      canAnonymize: false,
      anonymized: false,
    },
    {
      category: "Private Probe Data",
      description: "Probe IP address, last heartbeat, deployment platform info",
      collected: true,
      retention: "Until probe deletion or account deletion",
      purpose: "Private monitoring infrastructure management",
      canAnonymize: false,
      anonymized: false,
    },
  ];

  return {
    userName: session.user.name ?? "Unknown",
    userEmail: session.user.email ?? "Unknown",
    tier: session.user.tier ?? "INITIATE",
    accountCreated: session.user.createdAt?.toISOString() ?? "Unknown",
    totalMonitors: monitorCount,
    totalEvents: eventCount,
    totalIncidents: incidentCount,
    totalStatusPages: statusPageCount,
    dataInventory,
    anonymizeAnalytics,
    showOnLeaderboard: privacy.showOnLeaderboard,
    leaderboardBio: privacy.leaderboardBio ?? "",
  };
}

export async function updateAnalyticsAnonymization(anonymize: boolean) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const privacy = await prisma.userPrivacy.upsert({
    where: { userId },
    update: { anonymizeAnalytics: anonymize },
    create: { userId, anonymizeAnalytics: anonymize },
  });

  return { success: true, anonymized: privacy.anonymizeAnalytics };
}

export async function updateLeaderboardPrivacy(show: boolean, bio: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const privacy = await prisma.userPrivacy.upsert({
    where: { userId },
    update: { showOnLeaderboard: show, leaderboardBio: bio },
    create: { userId, showOnLeaderboard: show, leaderboardBio: bio },
  });

  return {
    success: true,
    showOnLeaderboard: privacy.showOnLeaderboard,
    leaderboardBio: privacy.leaderboardBio ?? "",
  };
}

export async function exportPersonalData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const [user, monitors, events, incidents, channels, statusPages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        timezone: true,
        dateFormat: true,
        timeFormat: true,
        tier: true,
        createdAt: true,
      },
    }),
    prisma.monitor.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        url: true,
        type: true,
        interval: true,
        timeout: true,
        createdAt: true,
      },
    }),
    prisma.monitorEvent.findMany({
      where: { monitor: { userId } },
      take: 10000,
      orderBy: { timestamp: "desc" },
      select: {
        id: true,
        status: true,
        latency: true,
        errorReason: true,
        timestamp: true,
        region: true,
      },
    }),
    prisma.incident.findMany({
      where: { monitor: { userId } },
      select: {
        id: true,
        title: true,
        status: true,
        severity: true,
        startedAt: true,
        resolvedAt: true,
      },
    }),
    prisma.notificationChannel.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
      },
    }),
    prisma.statusPage.findMany({
      where: { userId },
      select: {
        id: true,
        slug: true,
        title: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    account: user,
    monitors,
    recentEvents: events,
    incidents,
    notificationChannels: channels,
    statusPages,
  };
}
