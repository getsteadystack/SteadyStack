"use server";

import prisma, { IncidentEventType } from "@steadystack/db";
import { revalidatePath } from "next/cache";

import { getSafeSession } from "@/lib/safe-session";
import { getActiveWorkspace } from "@/actions/team";

async function getMonitorAccessScope(userId: string) {
  const active = await getActiveWorkspace();
  if (active?.id) {
    return {
      organizationId: active.id,
    };
  }
  return { userId, organizationId: null };
}

export async function getIncidents() {
  const session = await getSafeSession();

  if (!session?.user) return [];

  const monitorScope = await getMonitorAccessScope(session.user.id);

  try {
    const incidents = await prisma.incident.findMany({
      where: {
        monitor: monitorScope,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        monitor: {
          select: {
            name: true,
            url: true,
          },
        },
        _count: {
          select: { events: true },
        },
      },
      take: 50,
    });
    return incidents;
  } catch (error) {
    console.error("Failed to fetch incidents", error);
    return [];
  }
}

export async function getIncident(id: string) {
  const session = await getSafeSession();

  if (!session?.user) return null;

  const monitorScope = await getMonitorAccessScope(session.user.id);

  try {
    const incident = await prisma.incident.findFirst({
      where: {
        id,
        monitor: monitorScope,
      },
      include: {
        monitor: true,
        events: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
    return incident;
  } catch (error) {
    console.error("Failed to fetch incident details", error);
    return null;
  }
}

export async function updateIncidentStatus(
  id: string,
  status: "INVESTIGATING" | "IDENTIFIED" | "MONITORING" | "RESOLVED",
) {
  const session = await getSafeSession();

  if (!session?.user) return { success: false, error: "Unauthorized" };

  const monitorScope = await getMonitorAccessScope(session.user.id);

  try {
    // Verify ownership or workspace membership
    const incident = await prisma.incident.findFirst({
      where: {
        id,
        monitor: monitorScope,
      },
    });

    if (!incident) return { success: false, error: "Incident not found" };

    const eventMessage = `Status updated to ${status} by user`;

    await prisma.incident.update({
      where: { id },
      data: {
        status: status as any,
        resolvedAt: status === "RESOLVED" ? new Date() : incident.resolvedAt,
        events: {
          create: {
            type: IncidentEventType.STATE_CHANGE,
            message: eventMessage,
          },
        },
      },
    });

    revalidatePath("/dashboard/incidents");
    revalidatePath(`/dashboard/incidents/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update incident status", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function createIncident(data: {
  monitorId: string;
  title: string;
  description: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  status: "INVESTIGATING" | "IDENTIFIED" | "MONITORING" | "RESOLVED";
}) {
  const session = await getSafeSession();

  if (!session?.user) return { success: false, error: "Unauthorized" };

  const monitorScope = await getMonitorAccessScope(session.user.id);

  try {
    // Verify monitor ownership or workspace membership
    const monitor = await prisma.monitor.findFirst({
      where: {
        id: data.monitorId,
        ...monitorScope,
      },
    });

    if (!monitor) return { success: false, error: "Monitor not found" };

    const incident = await prisma.incident.create({
      data: {
        monitorId: data.monitorId,
        title: data.title,
        description: data.description,
        severity: data.severity as any,
        status: data.status as any,
        events: {
          create: {
            type: IncidentEventType.STATE_CHANGE,
            message: `Incident manually reported: ${data.title}`,
          },
        },
      },
    });

    revalidatePath("/dashboard/incidents");
    revalidatePath(`/dashboard/monitors/${data.monitorId}`);
    return { success: true, incidentId: incident.id };
  } catch (error) {
    console.error("Failed to create incident", error);
    return { success: false, error: "Failed to create incident" };
  }
}
