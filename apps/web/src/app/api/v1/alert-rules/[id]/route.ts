import { NextRequest, NextResponse } from "next/server";
import prisma from "@steadystack/db";
import { authenticateApiKey } from "../../_lib/auth";

// GET /api/v1/alert-rules/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req, "read");
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  const { id } = await params;
  const rule = await prisma.alertRule.findFirst({
    where: {
      id,
      monitor: {
        userId: auth.user.userId,
      },
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

  if (!rule) {
    return NextResponse.json({ error: "Alert rule not found" }, { status: 404 });
  }

  return NextResponse.json({ data: rule });
}

// PATCH /api/v1/alert-rules/:id
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req, "write");
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  const { id } = await params;
  const existing = await prisma.alertRule.findFirst({
    where: {
      id,
      monitor: {
        userId: auth.user.userId,
      },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Alert rule not found" }, { status: 404 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const updateData: any = {};
  if (body.trigger !== undefined) updateData.trigger = body.trigger;
  if (body.threshold !== undefined) {
    updateData.threshold = body.threshold !== null ? Number(body.threshold) : null;
  }
  if (body.comparison !== undefined) updateData.comparison = body.comparison || null;
  if (body.targetStatus !== undefined) updateData.targetStatus = body.targetStatus || null;
  if (body.enabled !== undefined) updateData.enabled = Boolean(body.enabled);

  if (Array.isArray(body.channelIds)) {
    // Validate channels
    const channels = await prisma.notificationChannel.findMany({
      where: {
        id: { in: body.channelIds },
        userId: auth.user.userId,
      },
      select: { id: true },
    });

    if (channels.length !== body.channelIds.length) {
      return NextResponse.json(
        { error: "One or more notification channels not found or unauthorized" },
        { status: 400 },
      );
    }

    updateData.channels = {
      set: body.channelIds.map((cid: string) => ({ id: cid })),
    };
  }

  const updated = await prisma.alertRule.update({
    where: { id },
    data: updateData,
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

  return NextResponse.json({ data: updated });
}

// DELETE /api/v1/alert-rules/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req, "write");
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  const { id } = await params;
  const existing = await prisma.alertRule.findFirst({
    where: {
      id,
      monitor: {
        userId: auth.user.userId,
      },
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Alert rule not found" }, { status: 404 });
  }

  await prisma.alertRule.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
