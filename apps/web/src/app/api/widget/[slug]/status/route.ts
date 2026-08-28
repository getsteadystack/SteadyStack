import { NextRequest, NextResponse } from "next/server";
import prisma from "@steadystack/db";
import { getOverallStatus, getStatusMessage, type BadgeTextConfig } from "@/lib/uptime-calculator";

/**
 * Validate if the origin is allowed based on the configured domains
 */
function validateOrigin(origin: string | null, allowedDomains: string | null): boolean {
  // If no origin header (same-origin request), allow
  if (!origin) return true;

  // If widget is configured as open to all
  if (allowedDomains === "*") return true;

  // If no domains configured, block cross-origin
  if (!allowedDomains) return false;

  const allowed = allowedDomains.split(",").map((d) => d.trim().toLowerCase());

  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.hostname.toLowerCase();

    return allowed.some((domain) => {
      if (domain.startsWith("*.")) {
        // Wildcard domain match (*.example.com matches sub.example.com)
        const baseDomain = domain.slice(1);
        return originHost.endsWith(baseDomain);
      }
      // Exact domain match
      return originHost === domain;
    });
  } catch {
    return false;
  }
}

/**
 * GET /api/widget/[slug]/status
 *
 * Public endpoint that returns the current status of a status page
 * for embedding in external websites.
 *
 * Respects CORS based on widgetAllowedDomains configuration.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const origin = request.headers.get("origin");

  // Find the status page
  const statusPage = await prisma.statusPage.findUnique({
    where: { slug },
    include: {
      monitors: {
        include: {
          monitor: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      },
    },
  });

  // Page not found or widget not enabled
  if (!statusPage) {
    return NextResponse.json({ error: "Status page not found" }, { status: 404 });
  }

  if (!statusPage.widgetEnabled) {
    return NextResponse.json(
      { error: "Widget is not enabled for this status page" },
      { status: 403 },
    );
  }

  // Validate origin for CORS
  const isAllowed = validateOrigin(origin, statusPage.widgetAllowedDomains);

  if (!isAllowed) {
    return NextResponse.json({ error: "Origin not allowed" }, { status: 403 });
  }

  // Build monitor status list
  const monitors = statusPage.monitors.map((spm) => ({
    name: spm.displayName || spm.monitor.name,
    status: spm.monitor.status,
    group: spm.displayGroup || null,
  }));

  // Determine overall status
  const overallStatus = getOverallStatus(monitors.map((m) => ({ status: m.status })));

  // Get status message from config or defaults
  const badgeText = statusPage.widgetBadgeText as BadgeTextConfig | null;
  const message = getStatusMessage(overallStatus, badgeText);

  // Build response
  const responseData = {
    status: overallStatus,
    message,
    monitors: monitors.map((m) => ({
      name: m.name,
      status:
        m.status === "UP" ? "operational" : m.status === "DOWN" ? "down" : m.status.toLowerCase(),
      group: m.group,
    })),
    lastUpdated: new Date().toISOString(),
    page: {
      title: statusPage.title,
      slug: statusPage.slug,
    },
  };

  // Build CORS headers
  const corsHeaders: HeadersInit = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "public, max-age=60, s-maxage=60",
  };

  // Only set Allow-Origin if there's an origin
  if (origin && isAllowed) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }

  return NextResponse.json(responseData, {
    status: 200,
    headers: corsHeaders,
  });
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const origin = request.headers.get("origin");

  // Find the status page to check allowed domains
  const statusPage = await prisma.statusPage.findUnique({
    where: { slug },
    select: {
      widgetEnabled: true,
      widgetAllowedDomains: true,
    },
  });

  if (!statusPage || !statusPage.widgetEnabled) {
    return new NextResponse(null, { status: 404 });
  }

  const isAllowed = validateOrigin(origin, statusPage.widgetAllowedDomains);

  if (!isAllowed) {
    return new NextResponse(null, { status: 403 });
  }

  const corsHeaders: HeadersInit = {
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };

  if (origin) {
    corsHeaders["Access-Control-Allow-Origin"] = origin;
  }

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
