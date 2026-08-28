"use server";

import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import prisma from "@steadystack/db";
import { revalidatePath } from "next/cache";
import { assertMonitorLimits, checkAndNotifyUsageLimits } from "@/lib/billing-server";
import { getActiveWorkspace } from "@/actions/team";

export interface UptimeRobotMonitorItem {
  id: number;
  friendly_name: string;
  url: string;
  type: number; // 1 = HTTP, 2 = Keyword, 3 = Ping, 4 = Port
  sub_type?: number;
  port?: string;
  interval: number;
  status: number;
}

export interface NormalizedImportMonitor {
  name: string;
  url: string;
  type: "HTTP" | "PING" | "PORT";
  interval: number;
  port?: number;
  selected?: boolean;
}

/**
 * Fetches monitor configurations from UptimeRobot via their official API (v2 getMonitors).
 * Endpoint: POST https://api.uptimerobot.com/v2/getMonitors
 */
export async function fetchUptimeRobotMonitors(apiKey: string): Promise<{
  success: boolean;
  monitors?: NormalizedImportMonitor[];
  total?: number;
  error?: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return { success: false, error: "UptimeRobot API Key is required." };
  }

  try {
    const response = await fetch("https://api.uptimerobot.com/v2/getMonitors", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: new URLSearchParams({
        api_key: cleanKey,
        format: "json",
      }).toString(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `UptimeRobot API returned status ${response.status}. Please check your API key.`,
      };
    }

    const data: any = await response.json();

    if (data.stat !== "ok") {
      const errorMsg =
        data.error?.message ||
        data.error?.type ||
        "Invalid UptimeRobot API key or API call failed.";
      return { success: false, error: errorMsg };
    }

    const rawMonitors: UptimeRobotMonitorItem[] = data.monitors || [];

    const normalizedMonitors: NormalizedImportMonitor[] = rawMonitors.map((m) => {
      let mappedType: "HTTP" | "PING" | "PORT" = "HTTP";
      if (m.type === 3) mappedType = "PING";
      else if (m.type === 4) mappedType = "PORT";

      let parsedPort: number | undefined = undefined;
      if (m.port && !isNaN(parseInt(m.port, 10))) {
        parsedPort = parseInt(m.port, 10);
      }

      return {
        name: m.friendly_name || m.url || `Monitor ${m.id}`,
        url: m.url || "",
        type: mappedType,
        interval: 60, // Upgrade to SteadyStack standard 60-second polling!
        port: parsedPort,
        selected: true,
      };
    });

    return {
      success: true,
      monitors: normalizedMonitors,
      total: normalizedMonitors.length,
    };
  } catch (err: any) {
    console.error("Failed to fetch UptimeRobot monitors:", err);
    return {
      success: false,
      error: "Network error connecting to UptimeRobot API. Please try again.",
    };
  }
}

/**
 * Bulk imports monitors fetched from UptimeRobot into SteadyStack DB.
 */
export async function importUptimeRobotMonitors(
  monitorsToImport: NormalizedImportMonitor[],
): Promise<{
  success: boolean;
  importedCount?: number;
  error?: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  if (!monitorsToImport || monitorsToImport.length === 0) {
    return { success: false, error: "No monitors selected for import." };
  }

  try {
    const limitCheck = await assertMonitorLimits(session.user.id, {
      isNew: true,
    });
    if (!limitCheck.allowed) {
      return {
        success: false,
        error: limitCheck.error || "Monitor plan limit reached.",
      };
    }

    const active = await getActiveWorkspace();

    const recordsToInsert = monitorsToImport.map((item) => {
      let targetUrl = item.url || "https://example.com";
      if (item.type === "PING" && targetUrl) {
        targetUrl = targetUrl.startsWith("ping://")
          ? targetUrl
          : `ping://${targetUrl.replace(/^ping:\/\//, "")}`;
      } else if (item.type === "PORT" && targetUrl) {
        const portNum = item.port || 80;
        targetUrl = targetUrl.startsWith("tcp://") ? targetUrl : `tcp://${targetUrl}:${portNum}`;
      } else if (item.type === "HTTP" && targetUrl) {
        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
          targetUrl = `https://${targetUrl}`;
        }
      }

      return {
        name: item.name,
        url: targetUrl,
        type: item.type as any,
        interval: item.interval || 60,
        timeout: 10,
        status: "UP" as const,
        checkRegions: JSON.stringify(["us-east", "eu-central", "ap-tokyo"]),
        userId: session.user.id,
        organizationId: active?.id,
      };
    });

    const result = await prisma.monitor.createMany({
      data: recordsToInsert,
    });

    const createdCount = result.count;

    checkAndNotifyUsageLimits(session.user.id).catch(() => {});
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/monitors");

    return {
      success: true,
      importedCount: createdCount,
    };
  } catch (err: any) {
    console.error("Failed to import UptimeRobot monitors:", err);
    return {
      success: false,
      error: "Failed to import monitors. Please verify inputs and try again.",
    };
  }
}
