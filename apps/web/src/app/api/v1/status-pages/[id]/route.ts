import { NextRequest, NextResponse } from "next/server";
import prisma from "@steadystack/db";
import { authenticateApiKey } from "../../_lib/auth";
import { assertStatusPageLimits } from "@/lib/billing-server";

// GET /api/v1/status-pages/:id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req, "read");
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  const { id } = await params;
  const statusPage = await prisma.statusPage.findFirst({
    where: {
      id,
      userId: auth.user.userId,
    },
    include: {
      monitors: {
        select: {
          id: true,
          monitorId: true,
          displayName: true,
          sortOrder: true,
        },
      },
    },
  });

  if (!statusPage) {
    return NextResponse.json({ error: "Status page not found" }, { status: 404 });
  }

  return NextResponse.json({ data: statusPage });
}

// PATCH /api/v1/status-pages/:id
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req, "write");
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  const { id } = await params;
  const existing = await prisma.statusPage.findFirst({
    where: {
      id,
      userId: auth.user.userId,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Status page not found" }, { status: 404 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const updateData: any = {};
  if (body.title !== undefined) updateData.title = String(body.title).trim();
  if (body.description !== undefined) {
    updateData.description = body.description ? String(body.description).trim() : null;
  }
  if (body.customDomain !== undefined) {
    updateData.customDomain = body.customDomain ? String(body.customDomain).trim() : null;
  }
  if (body.isPrivate !== undefined) updateData.isPrivate = Boolean(body.isPrivate);
  if (body.password !== undefined) {
    updateData.password = body.password ? String(body.password) : null;
  }
  if (body.theme !== undefined) updateData.theme = body.theme;
  if (body.showUptime !== undefined) updateData.showUptime = Boolean(body.showUptime);
  if (body.showResponseTime !== undefined)
    updateData.showResponseTime = Boolean(body.showResponseTime);
  if (body.historyDays !== undefined) updateData.historyDays = Number(body.historyDays) || 90;

  if (body.slug !== undefined) {
    const newSlug = String(body.slug)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-");
    if (newSlug !== existing.slug) {
      const slugTaken = await prisma.statusPage.findUnique({
        where: { slug: newSlug },
      });
      if (slugTaken) {
        return NextResponse.json({ error: "Slug is already in use" }, { status: 409 });
      }
      updateData.slug = newSlug;
    }
  }

  // Quota & feature validation if changing customDomain or privacy
  if (
    updateData.customDomain !== undefined ||
    updateData.isPrivate !== undefined ||
    updateData.password !== undefined
  ) {
    const limitCheck = await assertStatusPageLimits(auth.user.userId, {
      isNew: false,
      customDomain: updateData.customDomain ?? existing.customDomain ?? undefined,
      isPasswordProtected: Boolean(
        updateData.password || updateData.isPrivate || existing.password || existing.isPrivate,
      ),
    });

    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: limitCheck.error || "Plan limit exceeded" },
        { status: 403 },
      );
    }
  }

  const updated = await prisma.statusPage.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ data: updated });
}

// DELETE /api/v1/status-pages/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await authenticateApiKey(req, "write");
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  const { id } = await params;
  const existing = await prisma.statusPage.findFirst({
    where: {
      id,
      userId: auth.user.userId,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "Status page not found" }, { status: 404 });
  }

  await prisma.statusPage.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
