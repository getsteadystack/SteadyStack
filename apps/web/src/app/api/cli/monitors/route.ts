import { NextRequest, NextResponse } from "next/server";
import prisma from "@steadystack/db";
import { encryptSecret } from "@steadystack/core";
import { verifyApiKey, unauthorized } from "../_lib/auth";
import { assertMonitorLimits } from "@/lib/billing-server";

const MAX_REQUEST_BODY_SIZE = 1_048_576;

function checkBodySize(request: NextRequest) {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const size = Number.parseInt(contentLength, 10);
    if (!Number.isNaN(size) && size > MAX_REQUEST_BODY_SIZE) {
      return NextResponse.json(
        {
          error: `Request body too large. Maximum allowed size is ${MAX_REQUEST_BODY_SIZE} bytes.`,
        },
        { status: 413 },
      );
    }
  }
  return null;
}

// GET /api/cli/monitors — list all monitors
export async function GET(req: NextRequest) {
  const user = await verifyApiKey(req);
  if (!user) return unauthorized();

  const monitors = await prisma.monitor.findMany({
    where: { userId: user.userId },
    select: {
      id: true,
      name: true,
      url: true,
      type: true,
      status: true,
      interval: true,
      timeout: true,
      lastCheck: true,
      nextCheck: true,
      alertThreshold: true,
      checkRegions: true,
      method: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ monitors });
}

// POST /api/cli/monitors — create a monitor
export async function POST(req: NextRequest) {
  const sizeCheck = checkBodySize(req);
  if (sizeCheck) return sizeCheck;

  const user = await verifyApiKey(req);
  if (!user) return unauthorized();
  if (!user.scopes.includes("write")) {
    return NextResponse.json({ error: "Write scope required" }, { status: 403 });
  }

  const body = (await req.json()) as any;
  const {
    name,
    url,
    type = "HTTP",
    interval = 60,
    method = "GET",
    headers: customHeaders,
    body: requestBody,
    expectation,
    alertThreshold = 1,
    checkRegions,
    runbookUrl,
  } = body;

  if (!name?.trim()) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (!url?.trim()) return NextResponse.json({ error: "url is required" }, { status: 400 });

  const limitCheck = await assertMonitorLimits(user.userId, {
    isNew: true,
    type,
    interval,
  });
  if (!limitCheck.allowed) {
    return NextResponse.json({ error: limitCheck.error || "Plan limit exceeded" }, { status: 403 });
  }

  const monitor = await prisma.monitor.create({
    data: {
      name: name.trim(),
      url: url.trim(),
      type,
      interval,
      method,
      headers: customHeaders ? await encryptSecret(JSON.stringify(customHeaders)) : null,
      body: requestBody || null,
      expectation: expectation ? JSON.stringify(expectation) : null,
      alertThreshold,
      checkRegions: checkRegions ? JSON.stringify(checkRegions) : null,
      runbookUrl: runbookUrl || null,
      userId: user.userId,
      alertRules: {
        create: {
          trigger: "STATUS_CHANGE",
          targetStatus: "DOWN",
          enabled: true,
        },
      },
    },
    select: {
      id: true,
      name: true,
      url: true,
      type: true,
      status: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ monitor }, { status: 201 });
}
