import { NextRequest, NextResponse } from "next/server";
import prisma from "@steadystack/db";
import { authenticateApiKey } from "../../_lib/auth";
import { assertMonitorLimits } from "@/lib/billing-server";

// GET /api/v1/monitors/:id - Get monitor
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req, "read");
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  const { id } = await params;
  const monitor = await prisma.monitor.findFirst({
    where: {
      id,
      userId: auth.user.userId,
    },
    include: {
      alertRules: {
        include: {
          channels: true,
        },
      },
    },
  });

  if (!monitor) {
    return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...monitor,
      headers: monitor.headers ? JSON.parse(monitor.headers) : null,
      expectation: monitor.expectation ? JSON.parse(monitor.expectation) : null,
      checkRegions: monitor.checkRegions ? JSON.parse(monitor.checkRegions) : null,
    },
  });
}

// PATCH /api/v1/monitors/:id - Update monitor
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req, "write");
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  const { id } = await params;
  const existing = await prisma.monitor.findFirst({
    where: {
      id,
      userId: auth.user.userId,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const updateData: any = {};
  if (body.name !== undefined) updateData.name = String(body.name).trim();
  if (body.url !== undefined) updateData.url = String(body.url).trim();
  if (body.type !== undefined) updateData.type = body.type;
  if (body.interval !== undefined) updateData.interval = Number(body.interval);
  if (body.method !== undefined) updateData.method = String(body.method).toUpperCase();
  if (body.headers !== undefined)
    updateData.headers = body.headers ? JSON.stringify(body.headers) : null;
  if (body.body !== undefined) updateData.body = body.body || null;
  if (body.expectation !== undefined)
    updateData.expectation = body.expectation ? JSON.stringify(body.expectation) : null;
  if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) ? body.tags : [];
  if (body.checkRegions !== undefined)
    updateData.checkRegions = body.checkRegions ? JSON.stringify(body.checkRegions) : null;
  if (body.alertThreshold !== undefined) updateData.alertThreshold = Number(body.alertThreshold);
  if (body.runbookUrl !== undefined)
    updateData.runbookUrl = body.runbookUrl ? String(body.runbookUrl).trim() : null;

  if (body.interval !== undefined || body.type !== undefined || body.checkRegions !== undefined) {
    const limitCheck = await assertMonitorLimits(auth.user.userId, {
      isNew: false,
      type: updateData.type || existing.type,
      interval: updateData.interval || existing.interval,
      checkRegionsCount: body.checkRegions ? body.checkRegions.length : undefined,
    });
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.error || "Plan quota limit exceeded" },
        { status: 403 },
      );
    }
  }

  const updated = await prisma.monitor.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    data: {
      ...updated,
      headers: updated.headers ? JSON.parse(updated.headers) : null,
      expectation: updated.expectation ? JSON.parse(updated.expectation) : null,
      checkRegions: updated.checkRegions ? JSON.parse(updated.checkRegions) : null,
    },
  });
}

// DELETE /api/v1/monitors/:id - Delete monitor
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req, "write");
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  const { id } = await params;
  const existing = await prisma.monitor.findFirst({
    where: {
      id,
      userId: auth.user.userId,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
  }

  await prisma.monitor.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
