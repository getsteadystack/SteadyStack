import { NextRequest, NextResponse } from "next/server";
import prisma from "@steadystack/db";
import { authenticateApiKey } from "../_lib/auth";

// GET /api/v1/alert-rules - List alert rules (optionally filter by monitorId)
export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req, "read");
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  const { searchParams } = new URL(req.url);
  const monitorId = searchParams.get("monitorId");

  const where: any = {
    monitor: {
      userId: auth.user.userId,
    },
  };

  if (monitorId) {
    where.monitorId = monitorId;
  }

  const alertRules = await prisma.alertRule.findMany({
    where,
    include: {
      channels: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    data: alertRules,
    count: alertRules.length,
  });
}

// POST /api/v1/alert-rules - Create alert rule
export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req, "write");
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const {
    monitorId,
    trigger = "STATUS_CHANGE",
    threshold,
    comparison,
    targetStatus = "DOWN",
    enabled = true,
    channelIds = [],
  } = body;

  if (!monitorId || typeof monitorId !== "string") {
    return NextResponse.json({ error: "monitorId is required" }, { status: 400 });
  }

  // Verify monitor belongs to user
  const monitor = await prisma.monitor.findFirst({
    where: {
      id: monitorId,
      userId: auth.user.userId,
    },
  });

  if (!monitor) {
    return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
  }

  const validTriggers = ["STATUS_CHANGE", "LATENCY", "SSL_EXPIRY", "DNS_WATCHDOG", "DOMAIN_EXPIRY"];
  if (!validTriggers.includes(trigger)) {
    return NextResponse.json(
      { error: `Invalid trigger. Allowed: ${validTriggers.join(", ")}` },
      { status: 400 },
    );
  }

  // If channel IDs provided, verify they belong to user
  if (Array.isArray(channelIds) && channelIds.length > 0) {
    const channels = await prisma.notificationChannel.findMany({
      where: {
        id: { in: channelIds },
        userId: auth.user.userId,
      },
      select: { id: true },
    });

    if (channels.length !== channelIds.length) {
      return NextResponse.json(
        { error: "One or more notification channels not found or unauthorized" },
        { status: 400 },
      );
    }
  }

  const alertRule = await prisma.alertRule.create({
    data: {
      monitorId,
      trigger: trigger as any,
      threshold: threshold !== undefined && threshold !== null ? Number(threshold) : null,
      comparison: comparison ? (comparison as any) : null,
      targetStatus: targetStatus ? (targetStatus as any) : null,
      enabled: Boolean(enabled),
      channels:
        Array.isArray(channelIds) && channelIds.length > 0
          ? {
              connect: channelIds.map((id: string) => ({ id })),
            }
          : undefined,
    },
    include: {
      channels: {
        select: {
          id: true,
          name: true,
          type: true,
        },
      },
    },
  });

  return NextResponse.json({ data: alertRule }, { status: 201 });
}
