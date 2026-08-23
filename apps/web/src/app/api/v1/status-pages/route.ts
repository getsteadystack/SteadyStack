import { NextRequest, NextResponse } from "next/server";
import prisma from "@steadystack/db";
import { authenticateApiKey } from "../_lib/auth";
import { assertStatusPageLimits } from "@/lib/billing-server";

// GET /api/v1/status-pages - List status pages
export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req, "read");
  if (auth.errorResponse || !auth.user) return auth.errorResponse!;

  const statusPages = await prisma.statusPage.findMany({
    where: { userId: auth.user.userId },
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
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    data: statusPages,
    count: statusPages.length,
  });
}

// POST /api/v1/status-pages - Create status page
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
    slug,
    title,
    description,
    customDomain,
    isPrivate = false,
    password,
    theme,
    showUptime = true,
    showResponseTime = true,
    historyDays = 90,
  } = body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  if (!slug || typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const sanitizedSlug = slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-");

  // Check uniqueness of slug
  const existingSlug = await prisma.statusPage.findUnique({
    where: { slug: sanitizedSlug },
  });
  if (existingSlug) {
    return NextResponse.json({ error: "Status page slug is already taken" }, { status: 409 });
  }

  // Quota and feature flag checks
  const limitCheck = await assertStatusPageLimits(auth.user.userId, {
    isNew: true,
    customDomain: customDomain?.trim(),
    isPasswordProtected: Boolean(password || isPrivate),
  });

  if (!limitCheck.allowed) {
    return NextResponse.json({ error: limitCheck.error || "Plan limit exceeded" }, { status: 403 });
  }

  const statusPage = await prisma.statusPage.create({
    data: {
      userId: auth.user.userId,
      slug: sanitizedSlug,
      title: title.trim(),
      description: description ? String(description).trim() : null,
      customDomain: customDomain ? String(customDomain).trim() : null,
      isPrivate: Boolean(isPrivate),
      password: password ? String(password) : null,
      theme: theme || null,
      showUptime: Boolean(showUptime),
      showResponseTime: Boolean(showResponseTime),
      historyDays: Number(historyDays) || 90,
    },
  });

  return NextResponse.json({ data: statusPage }, { status: 201 });
}
