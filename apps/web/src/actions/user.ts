"use server";

import { auth } from "@steadystack/auth";
import { headers } from "next/headers";

export async function getUserPreferences() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "HH:mm",
    };
  }

  return {
    timezone: session.user.timezone || "UTC",
    dateFormat: session.user.dateFormat || "MM/DD/YYYY",
    timeFormat: session.user.timeFormat || "HH:mm",
  };
}

export async function updateUserPreferences(data: {
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const prisma = await import("@steadystack/db").then((m) => m.default);
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        timezone: data.timezone,
        dateFormat: data.dateFormat,
        timeFormat: data.timeFormat,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to update user preferences [DETAILS]:", {
      error,
      userId: session.user.id,
      data,
    });
    return { success: false, error: "Failed to update preferences" };
  }
}

export async function getLicenseTelemetry() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      tier: "INITIATE",
      isAdmin: false,
      edgeNodes: "3 Nodes (2-of-3)",
      vpcProbeCount: 0,
      maxVpcProbes: 0,
      pingInterval: "3m / 1m Fast",
      regions: "3 Primary Regions",
    };
  }

  try {
    const prisma = await import("@steadystack/db").then((m) => m.default);

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { tier: true, email: true },
    });

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const isLifetime = Boolean(subscription?.isLifetime || subscription?.appsumoTier);
    const appsumoTier =
      subscription?.appsumoTier ||
      (subscription?.tierVersion?.startsWith("appsumo_tier_")
        ? Number.parseInt(subscription.tierVersion.replace("appsumo_tier_", ""), 10)
        : null);

    const { getUserPlan } = await import("@/lib/billing-server");
    const userPlan = await getUserPlan(session.user.id);
    const userTier = (dbUser?.tier === "ADMIN" ? "ADMIN" : userPlan).toUpperCase();
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const userEmail = (dbUser?.email || session.user.email || "").trim().toLowerCase();
    const isEmailAdmin = Boolean(userEmail && adminEmails.includes(userEmail));
    const isAdmin = userTier === "ADMIN" || isEmailAdmin;

    const probeCount = await prisma.probe.count({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
      },
    });

    let edgeNodes = "3 Nodes (2-of-3)";
    let maxVpcProbes = 0;
    let pingInterval = "3m / 1m Fast";
    let regions = "3 Primary Regions";

    if (userTier === "NETRUNNER") {
      edgeNodes = "7 Nodes (4-of-7)";
      maxVpcProbes = 3;
      pingInterval = "30s Rapid";
      regions = "7 Sovereign Regions";
    } else if (userTier === "CONSTRUCT" || userTier === "ADMIN") {
      edgeNodes = "7 Nodes + VPC Mesh";
      maxVpcProbes = 10;
      pingInterval = "10s Ultra-Fast";
      regions = "7 Sovereign Regions";
    }

    return {
      tier: userTier,
      isAdmin,
      isLifetime,
      appsumoTier,
      edgeNodes,
      vpcProbeCount: probeCount,
      maxVpcProbes,
      pingInterval,
      regions,
    };
  } catch (error) {
    console.error("Failed to fetch license telemetry:", error);
    const fallbackTier = session.user.tier || "INITIATE";
    return {
      tier: fallbackTier,
      isAdmin: false,
      isLifetime: false,
      appsumoTier: null,
      edgeNodes: fallbackTier === "INITIATE" ? "3 Nodes (2-of-3)" : "7 Nodes (4-of-7)",
      vpcProbeCount: 0,
      maxVpcProbes: fallbackTier === "NETRUNNER" ? 3 : fallbackTier === "CONSTRUCT" ? 10 : 0,
      pingInterval:
        fallbackTier === "NETRUNNER"
          ? "30s Rapid"
          : fallbackTier === "CONSTRUCT"
            ? "10s Ultra-Fast"
            : "3m / 1m Fast",
      regions: fallbackTier === "INITIATE" ? "3 Primary Regions" : "7 Sovereign Regions",
    };
  }
}

/**
 * Server action to manually trigger a sync of user's subscription and license against Stripe.
 */
export async function syncStripeSubscriptionAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { syncUserSubscriptionFromStripe } = await import("@/lib/stripe");
    const result = await syncUserSubscriptionFromStripe(session.user.id);
    return result;
  } catch (error: any) {
    console.error("Failed to sync stripe subscription action:", error);
    return { success: false, error: error?.message || "Failed to sync" };
  }
}
