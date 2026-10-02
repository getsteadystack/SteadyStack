import { NextRequest, NextResponse } from "next/server";
import prisma from "@steadystack/db";
import { encryptSecret } from "@steadystack/core";
import { authenticateApiKey } from "../_lib/auth";
import { assertMonitorLimits } from "@/lib/billing-server";

// GET /api/v1/monitors - List monitors
export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req, "read");
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  const status = searchParams.get("status");

  const where: any = {
    userId: auth.user.userId,
  };

  if (tag) {
    where.tags = { has: tag };
  }
  if (status) {
    where.status = status;
  }

  const monitors = await prisma.monitor.findMany({
    where,
    select: {
      id: true,
      name: true,
      url: true,
      type: true,
      status: true,
      interval: true,
      timeout: true,
      method: true,
      headers: true,
      body: true,
      expectation: true,
      tags: true,
      checkRegions: true,
      alertThreshold: true,
      dynamicThresholding: true,
      runbookUrl: true,
      lastCheck: true,
      nextCheck: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const parsedMonitors = monitors.map((m) => ({
    ...m,
    headers: m.headers ? JSON.parse(m.headers) : null,
    expectation: m.expectation ? JSON.parse(m.expectation) : null,
    checkRegions: m.checkRegions ? JSON.parse(m.checkRegions) : null,
  }));

  return NextResponse.json({
    data: parsedMonitors,
    count: parsedMonitors.length,
  });
}

// POST /api/v1/monitors - Create monitor
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
    name,
    url,
    type = "HTTP",
    interval = 60,
    method = "GET",
    headers: customHeaders,
    body: requestBody,
    expectation,
    tags = [],
    checkRegions,
    alertThreshold = 1,
    runbookUrl,
  } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!url || typeof url !== "string" || !url.trim()) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  // Quota and feature flag assertion
  const limitCheck = await assertMonitorLimits(auth.user.userId, {
    isNew: true,
    type,
    interval,
    checkRegionsCount: Array.isArray(checkRegions) ? checkRegions.length : 1,
  });

  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: limitCheck.error || "Plan quota or feature limit exceeded" },
      { status: 403 },
    );
  }

  const newMonitor = await prisma.monitor.create({
    data: {
      userId: auth.user.userId,
      organizationId: auth.user.organizationId || null,
      name: name.trim(),
      url: url.trim(),
      type: type as any,
      interval: Number(interval),
      method: method.toUpperCase(),
      headers: customHeaders ? await encryptSecret(JSON.stringify(customHeaders)) : null,
      body: requestBody || null,
      expectation: expectation ? JSON.stringify(expectation) : null,
      tags: Array.isArray(tags) ? tags : [],
      checkRegions: checkRegions ? JSON.stringify(checkRegions) : null,
      alertThreshold: Number(alertThreshold),
      runbookUrl: runbookUrl ? String(runbookUrl).trim() : null,
      alertRules: {
        create: {
          trigger: "STATUS_CHANGE",
          targetStatus: "DOWN",
          enabled: true,
        },
      },
    },
  });

  return NextResponse.json(
    {
      data: {
        ...newMonitor,
        headers: newMonitor.headers ? JSON.parse(newMonitor.headers) : null,
        expectation: newMonitor.expectation ? JSON.parse(newMonitor.expectation) : null,
        checkRegions: newMonitor.checkRegions ? JSON.parse(newMonitor.checkRegions) : null,
      },
    },
    { status: 201 },
  );
}
