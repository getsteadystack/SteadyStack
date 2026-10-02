"use server";

import { revalidatePath } from "next/cache";
import { createHash, randomBytes } from "node:crypto";
import prisma from "@steadystack/db";
import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { getActiveWorkspace } from "@/actions/team";
import { z } from "zod";

const clientSchema = z.object({
  name: z.string().min(1, "Client name is required").max(100),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Invalid color hex")
    .optional()
    .default("#10b981"),
  website: z.string().url().optional().or(z.literal("")),
  contactEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().max(500).optional(),
});

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Converts a string to a URL-safe kebab slug, trimmed to 40 chars. */
function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function getClients() {
  const session = await getSession();
  if (!session?.user) return [];

  const active = await getActiveWorkspace();

  const clients = await prisma.client.findMany({
    where: active
      ? { organizationId: active.id }
      : { userId: session.user.id, organizationId: null },
    include: {
      monitors: {
        select: {
          id: true,
          name: true,
          url: true,
          status: true,
          type: true,
          events: {
            take: 90,
            orderBy: { timestamp: "desc" },
            select: { status: true, latency: true, timestamp: true },
          },
        },
      },
      statusPage: {
        select: { id: true, slug: true, customDomain: true, title: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return clients;
}

export async function createClient(data: z.infer<typeof clientSchema>) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const parsed = clientSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid input",
    };
  }

  const active = await getActiveWorkspace();

  const { getUserUsageSummary } = await import("@/lib/billing-server");
  const usage = await getUserUsageSummary(session.user.id);
  if (usage.clientsUsed >= usage.limits.maxClients) {
    return {
      success: false,
      error: `You have reached the limit of ${usage.limits.maxClients} client workspace${usage.limits.maxClients === 1 ? "" : "s"} on the ${usage.limits.maxClients <= 2 ? "Free" : "Agency"} plan. Please upgrade to Agency or Agency Pro to add more clients.`,
    };
  }

  await prisma.client.create({
    data: {
      name: parsed.data.name,
      color: parsed.data.color,
      website: parsed.data.website || null,
      contactEmail: parsed.data.contactEmail || null,
      notes: parsed.data.notes || null,
      userId: session.user.id,
      organizationId: active?.id || null,
    },
  });

  revalidatePath("/dashboard/clients");
  return { success: true };
}

export async function updateClient(id: string, data: Partial<z.infer<typeof clientSchema>>) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const existing = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { success: false, error: "Client not found" };

  await prisma.client.update({
    where: { id },
    data: {
      name: data.name ?? existing.name,
      color: data.color ?? existing.color,
      website: data.website !== undefined ? data.website || null : existing.website,
      contactEmail:
        data.contactEmail !== undefined ? data.contactEmail || null : existing.contactEmail,
      notes: data.notes !== undefined ? data.notes || null : existing.notes,
    },
  });

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/monitors");
  return { success: true };
}

export async function deleteClient(id: string) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const existing = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { success: false, error: "Client not found" };

  // Unlink monitors (SetNull is handled by DB, but explicit for clarity)
  await prisma.monitor.updateMany({
    where: { clientId: id },
    data: { clientId: null },
  });

  await prisma.client.delete({ where: { id } });

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/monitors");
  return { success: true };
}

export async function assignMonitorToClient(monitorId: string, clientId: string | null) {
  const session = await getSession();
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const monitor = await prisma.monitor.findFirst({
    where: { id: monitorId, userId: session.user.id },
  });
  if (!monitor) return { success: false, error: "Monitor not found" };

  await prisma.monitor.update({
    where: { id: monitorId },
    data: { clientId },
  });

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/monitors");
  return { success: true };
}

/**
 * Creates a branded StatusPage for a client, pre-populated with the
 * client's name, colour theme, and all currently-assigned monitors.
 */
export async function createClientStatusPage(clientId: string) {
  const session = await getSession();
  if (!session?.user) return { success: false as const, error: "Unauthorized" };

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: session.user.id },
    include: {
      monitors: { select: { id: true } },
      statusPage: { select: { id: true } },
    },
  });
  if (!client) return { success: false as const, error: "Client not found" };
  if (client.statusPage) return { success: false as const, error: "Status page already exists" };

  // Build a unique slug: kebab(name)-shortcuid
  const baseSlug = toSlug(client.name) || "client";
  const suffix = Math.random().toString(36).slice(2, 6);
  const slug = `${baseSlug}-${suffix}`;

  const page = await prisma.statusPage.create({
    data: {
      slug,
      title: client.name,
      description: `Status page for ${client.name}`,
      userId: session.user.id,
      clientId: client.id,
      theme: { colors: { primary: client.color } },
      showUptime: true,
      showResponseTime: true,
      historyDays: 90,
      seoIndex: false, // private by default
      monitors: {
        create: client.monitors.map((m, idx) => ({
          monitorId: m.id,
          sortOrder: idx,
          showLatency: true,
          showUptime: true,
          showCheckCounts: false,
        })),
      },
    },
    select: { id: true, slug: true, customDomain: true, title: true },
  });

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/pages");
  return { success: true as const, page };
}

/**
 * Updates the custom domain on a client's status page.
 */
export async function updateClientStatusPageDomain(clientId: string, customDomain: string | null) {
  const session = await getSession();
  if (!session?.user) return { success: false as const, error: "Unauthorized" };

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId: session.user.id },
    include: { statusPage: { select: { id: true } } },
  });
  if (!client?.statusPage) return { success: false as const, error: "No status page found" };

  const trimmed = customDomain?.trim() || null;

  await prisma.statusPage.update({
    where: { id: client.statusPage.id },
    data: { customDomain: trimmed },
  });

  revalidatePath("/dashboard/clients");
  return { success: true as const };
}

/**
 * Assigns or unassigns an existing status page to a client.
 */
export async function assignStatusPageToClient(statusPageId: string, clientId: string | null) {
  const session = await getSession();
  if (!session?.user) return { success: false as const, error: "Unauthorized" };

  const page = await prisma.statusPage.findFirst({
    where: { id: statusPageId, userId: session.user.id },
  });
  if (!page) return { success: false as const, error: "Status page not found" };

  if (clientId) {
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId: session.user.id },
      include: { statusPage: { select: { id: true } } },
    });
    if (!client) return { success: false as const, error: "Client not found" };
    if (client.statusPage && client.statusPage.id !== statusPageId) {
      return {
        success: false as const,
        error: "Client already has a status page",
      };
    }
  }

  await prisma.statusPage.update({
    where: { id: statusPageId },
    data: { clientId },
  });

  revalidatePath("/dashboard/clients");
  return { success: true as const };
}

/**
 * Deletes a status page.
 */
export async function deleteStatusPage(statusPageId: string) {
  const session = await getSession();
  if (!session?.user) return { success: false as const, error: "Unauthorized" };

  const page = await prisma.statusPage.findFirst({
    where: { id: statusPageId, userId: session.user.id },
  });
  if (!page) return { success: false as const, error: "Status page not found" };

  await prisma.statusPage.delete({
    where: { id: statusPageId },
  });

  revalidatePath("/dashboard/clients");
  return { success: true as const };
}

export interface BulkClientImportRow {
  name: string;
  domain: string;
  slaTier?: string;
  contactEmail?: string;
  color?: string;
  createMonitors?: boolean;
}

const CLIENT_PALETTE = [
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // indigo/purple
  "#14b8a6", // teal
  "#f97316", // orange
];

/**
 * Bulk imports clients from structured CSV / domain list.
 * Automatically creates client records and provisions default HTTP + SSL monitors.
 */
export async function bulkImportClients(rows: BulkClientImportRow[]) {
  const session = await getSession();
  if (!session?.user) return { success: false as const, error: "Unauthorized" };

  if (!rows || rows.length === 0) {
    return { success: false as const, error: "No client entries provided" };
  }

  const active = await getActiveWorkspace();

  const { getUserUsageSummary } = await import("@/lib/billing-server");
  const usage = await getUserUsageSummary(session.user.id);
  const remainingSlots = usage.limits.maxClients - usage.clientsUsed;

  if (remainingSlots <= 0) {
    return {
      success: false as const,
      error: `You have reached the limit of ${usage.limits.maxClients} client workspace${usage.limits.maxClients === 1 ? "" : "s"} on your current plan. Please upgrade to Agency or Agency Pro to import more clients.`,
    };
  }

  const validRows = rows.filter((r) => r.name?.trim() && r.domain?.trim());
  if (validRows.length === 0) {
    return {
      success: false as const,
      error: "No valid rows with both Client Name and Domain/URL",
    };
  }

  const rowsToProcess = validRows.slice(0, remainingSlots);
  let createdClients = 0;
  let createdMonitors = 0;
  const errors: string[] = [];

  for (let i = 0; i < rowsToProcess.length; i++) {
    const row = rowsToProcess[i]!;
    try {
      const rawDomain = row.domain.trim();
      const domainWithProto =
        rawDomain.startsWith("http://") || rawDomain.startsWith("https://")
          ? rawDomain
          : `https://${rawDomain}`;

      const clientColor =
        row.color && /^#[0-9a-fA-F]{6}$/.test(row.color)
          ? row.color
          : CLIENT_PALETTE[i % CLIENT_PALETTE.length];

      const client = await prisma.client.create({
        data: {
          name: row.name.trim(),
          color: clientColor,
          website: domainWithProto,
          contactEmail: row.contactEmail?.trim() || null,
          notes: row.slaTier?.trim() ? `SLA Tier: ${row.slaTier.trim()}` : null,
          userId: session.user.id,
          organizationId: active?.id || null,
        },
      });
      createdClients++;

      if (row.createMonitors !== false) {
        // Provision HTTP Availability Monitor
        await prisma.monitor.create({
          data: {
            name: `${row.name.trim()} Website`,
            type: "HTTP",
            url: domainWithProto,
            interval: 60,
            nextCheck: new Date(),
            userId: session.user.id,
            organizationId: active?.id || null,
            clientId: client.id,
            checkRegions: JSON.stringify(["us-east"]),
            method: "GET",
          },
        });
        createdMonitors++;

        // Provision SSL Certificate Monitor
        await prisma.monitor.create({
          data: {
            name: `${row.name.trim()} SSL Certificate`,
            type: "SSL",
            url: domainWithProto,
            interval: 3600,
            nextCheck: new Date(),
            userId: session.user.id,
            organizationId: active?.id || null,
            clientId: client.id,
            checkRegions: JSON.stringify(["us-east"]),
            method: "GET",
          },
        });
        createdMonitors++;
      }
    } catch (err) {
      errors.push(`Row "${row.name}": ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard/monitors");

  return {
    success: true as const,
    createdClients,
    createdMonitors,
    skippedDueToLimit: validRows.length - rowsToProcess.length,
    errors,
  };
}

/**
 * Generates or regenerates a private token for the Client Portal.
 */
export async function generateClientPortalToken(clientId: string) {
  try {
    const session = await getSession();
    if (!session?.user) return { success: false as const, error: "Unauthorized" };

    const active = await getActiveWorkspace();
    const clientScope = active?.id
      ? { organizationId: active.id }
      : { userId: session.user.id, organizationId: null };

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        OR: [clientScope, { userId: session.user.id }],
      },
    });
    if (!client) return { success: false as const, error: "Client not found" };

    const token = `cl_portal_${randomBytes(16).toString("hex")}`;

    try {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          portalToken: token,
          portalEnabled: true,
        },
      });
    } catch {
      await prisma.$executeRawUnsafe(
        'UPDATE "Client" SET "portalToken" = $1, "portalEnabled" = true, "updatedAt" = NOW() WHERE "id" = $2;',
        token,
        clientId,
      );
    }

    revalidatePath("/dashboard/clients");
    return { success: true as const, token };
  } catch (err: any) {
    console.error("Failed to generate client portal token:", err);
    return {
      success: false as const,
      error: err?.message || "Failed to generate portal link",
    };
  }
}

/**
 * Revokes the Client Portal token and disables the portal.
 */
export async function revokeClientPortalToken(clientId: string) {
  try {
    const session = await getSession();
    if (!session?.user) return { success: false as const, error: "Unauthorized" };

    const active = await getActiveWorkspace();
    const clientScope = active?.id
      ? { organizationId: active.id }
      : { userId: session.user.id, organizationId: null };

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        OR: [clientScope, { userId: session.user.id }],
      },
    });
    if (!client) return { success: false as const, error: "Client not found" };

    try {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          portalToken: null,
          portalPinHash: null,
          portalEnabled: false,
        },
      });
    } catch {
      await prisma.$executeRawUnsafe(
        'UPDATE "Client" SET "portalToken" = NULL, "portalPinHash" = NULL, "portalEnabled" = false, "updatedAt" = NOW() WHERE "id" = $1;',
        clientId,
      );
    }

    revalidatePath("/dashboard/clients");
    return { success: true as const };
  } catch (err: any) {
    console.error("Failed to revoke client portal token:", err);
    return {
      success: false as const,
      error: err?.message || "Failed to revoke portal link",
    };
  }
}

/**
 * Updates portal settings such as PIN passcode protection and enabled state.
 */
export async function updateClientPortalSettings(
  clientId: string,
  data: { portalEnabled: boolean; pin?: string | null },
) {
  try {
    const session = await getSession();
    if (!session?.user) return { success: false as const, error: "Unauthorized" };

    const active = await getActiveWorkspace();
    const clientScope = active?.id
      ? { organizationId: active.id }
      : { userId: session.user.id, organizationId: null };

    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        OR: [clientScope, { userId: session.user.id }],
      },
    });
    if (!client) return { success: false as const, error: "Client not found" };

    let portalPinHash: string | null | undefined = undefined;
    if (data.pin !== undefined) {
      portalPinHash =
        data.pin && data.pin.trim().length > 0
          ? createHash("sha256").update(data.pin.trim()).digest("hex")
          : null;
    }

    try {
      await prisma.client.update({
        where: { id: clientId },
        data: {
          portalEnabled: data.portalEnabled,
          ...(portalPinHash !== undefined ? { portalPinHash } : {}),
        },
      });
    } catch {
      if (portalPinHash !== undefined) {
        await prisma.$executeRawUnsafe(
          'UPDATE "Client" SET "portalEnabled" = $1, "portalPinHash" = $2, "updatedAt" = NOW() WHERE "id" = $3;',
          data.portalEnabled,
          portalPinHash,
          clientId,
        );
      } else {
        await prisma.$executeRawUnsafe(
          'UPDATE "Client" SET "portalEnabled" = $1, "updatedAt" = NOW() WHERE "id" = $2;',
          data.portalEnabled,
          clientId,
        );
      }
    }

    revalidatePath("/dashboard/clients");
    return { success: true as const };
  } catch (err: any) {
    console.error("Failed to update client portal settings:", err);
    return {
      success: false as const,
      error: err?.message || "Failed to update portal settings",
    };
  }
}

/**
 * Public resolver for the Client Read-Only Portal.
 * Validates token, checks PIN if required, and returns full client SLA telemetry.
 */
export async function getPortalClientData(token: string, enteredPin?: string) {
  if (!token || token.trim().length === 0) {
    return { error: "Invalid or missing portal token" };
  }

  let client: any = null;
  try {
    client = await prisma.client.findUnique({
      where: { portalToken: token },
      include: {
        user: { select: { name: true, email: true } },
        organization: { select: { name: true, logo: true } },
        statusPage: {
          select: { id: true, slug: true, customDomain: true, title: true },
        },
        monitors: {
          select: {
            id: true,
            name: true,
            url: true,
            type: true,
            status: true,
            interval: true,
            events: {
              take: 90,
              orderBy: { timestamp: "desc" },
              select: { status: true, latency: true, timestamp: true },
            },
          },
        },
      },
    });
  } catch {
    const rawClients: any = await prisma.$queryRawUnsafe(
      'SELECT id, name, color, website, notes, "userId", "organizationId", "emailReportsEnabled", "reportRecipientEmails", "reportTargetSla", "portalToken", "portalPinHash", "portalEnabled" FROM "Client" WHERE "portalToken" = $1 LIMIT 1;',
      token,
    );
    if (rawClients && rawClients.length > 0) {
      const raw = rawClients[0];
      client = await prisma.client.findUnique({
        where: { id: raw.id },
        include: {
          user: { select: { name: true, email: true } },
          organization: { select: { name: true, logo: true } },
          statusPage: {
            select: { id: true, slug: true, customDomain: true, title: true },
          },
          monitors: {
            select: {
              id: true,
              name: true,
              url: true,
              type: true,
              status: true,
              interval: true,
              events: {
                take: 90,
                orderBy: { timestamp: "desc" },
                select: { status: true, latency: true, timestamp: true },
              },
            },
          },
        },
      });
      if (client) {
        client.portalToken = raw.portalToken;
        client.portalPinHash = raw.portalPinHash;
        client.portalEnabled = raw.portalEnabled;
      }
    }
  }

  if (!client || !client.portalEnabled) {
    return {
      error: "This client portal does not exist or has been disabled by the agency.",
    };
  }

  // Check PIN protection
  if (client.portalPinHash) {
    if (!enteredPin) {
      return {
        requiresPin: true as const,
        clientName: client.name,
        color: client.color,
        agencyName: client.organization?.name || client.user.name || "Your Agency",
      };
    }

    const hashedInput = createHash("sha256").update(enteredPin.trim()).digest("hex");
    if (hashedInput !== client.portalPinHash) {
      return {
        requiresPin: true as const,
        invalidPin: true as const,
        clientName: client.name,
        color: client.color,
        agencyName: client.organization?.name || client.user.name || "Your Agency",
      };
    }
  }

  // Compute aggregated stats
  let totalChecks = 0;
  let upChecks = 0;
  let totalLatency = 0;
  let latencySamples = 0;

  const enrichedMonitors = (client.monitors || []).map((m: any) => {
    const mTotal = m.events.length;
    const mUp = m.events.filter((e: any) => e.status === "UP").length;
    const mUptime = mTotal > 0 ? Number(((mUp / mTotal) * 100).toFixed(2)) : 100;

    const latencies = m.events
      .filter((e: any) => e.latency != null)
      .map((e: any) => e.latency as number);
    const mAvgLatency =
      latencies.length > 0
        ? Math.round(latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length)
        : 0;

    totalChecks += mTotal;
    upChecks += mUp;
    if (latencies.length > 0) {
      totalLatency += latencies.reduce((a: number, b: number) => a + b, 0);
      latencySamples += latencies.length;
    }

    return {
      id: m.id,
      name: m.name,
      url: m.url,
      type: m.type,
      status: m.status,
      interval: m.interval,
      uptime: mUptime,
      avgLatency: mAvgLatency,
      recentEvents: m.events.slice(0, 30),
    };
  });

  const globalUptime = totalChecks > 0 ? Number(((upChecks / totalChecks) * 100).toFixed(2)) : 100;
  const avgLatency = latencySamples > 0 ? Math.round(totalLatency / latencySamples) : 0;
  const targetSla = client.reportTargetSla || 99.9;
  const slaMet = globalUptime >= targetSla;

  return {
    requiresPin: false as const,
    client: {
      id: client.id,
      name: client.name,
      color: client.color,
      website: client.website,
      notes: client.notes,
      targetSla,
      globalUptime,
      avgLatency,
      slaMet,
      statusPage: client.statusPage,
      agencyName:
        client.organization?.name || client.user.name || "Agency Infrastructure Management",
      agencyLogo: client.organization?.logo || null,
      monitors: enrichedMonitors,
      lastReportSentAt: client.lastReportSentAt?.toISOString() || null,
    },
  };
}
