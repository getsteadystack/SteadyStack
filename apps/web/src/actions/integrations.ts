"use server";

import prisma from "@steadystack/db";
import { auth } from "@steadystack/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { env } from "@steadystack/env/server";
import { getActiveWorkspace } from "@/actions/team";

export interface IntegrationProject {
  name: string;
  url: string;
  type: "HTTP" | "PING";
}

export interface ExternalResource {
  id: string;
  name: string;
  url: string;
  type: "HTTP" | "PING";
}

/**
 * Bulk imports third-party projects/domains and registers them as active SteadyStack HTTP/PING monitors.
 */
export async function importThirdPartyMonitors(projects: IntegrationProject[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;
  const active = await getActiveWorkspace();

  try {
    // 1. Fetch user tier
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true },
    });
    const userTier = user?.tier || "INITIATE";

    // 2. Count existing monitors
    const existingCount = await prisma.monitor.count({
      where: { userId },
    });

    const maxMonitors = userTier === "INITIATE" ? 50 : userTier === "NETRUNNER" ? 200 : 9999;
    const defaultInterval = 60;
    const defaultRegions = JSON.stringify(["us-east"]);

    if (existingCount + projects.length > maxMonitors) {
      return {
        success: false,
        error: `Importing these monitors would exceed your plan limit of ${maxMonitors} monitors (current: ${existingCount}).`,
      };
    }

    // 3. Fetch user channels once
    const userChannels = await prisma.notificationChannel.findMany({
      where: { userId },
      take: 5,
    });

    // 4. Bulk create monitors using a transaction to avoid N+1 network roundtrips
    const monitorPromises = projects.map((project) => {
      let finalUrl = project.url;
      if (!finalUrl.includes("://")) {
        finalUrl = project.type === "PING" ? `ping://${finalUrl}` : `https://${finalUrl}`;
      }

      return prisma.monitor.create({
        data: {
          name: project.name,
          url: finalUrl,
          type: project.type,
          interval: defaultInterval,
          timeout: 10,
          userId,
          organizationId: active?.id,
          checkRegions: defaultRegions,
          alertThreshold: 1,
          dynamicThresholding: false,
          method: "GET",
        },
      });
    });

    const createdMonitors = await prisma.$transaction(monitorPromises);

    // 5. Bulk create alert rules using a transaction
    if (userChannels.length > 0) {
      try {
        const alertRulePromises = createdMonitors.map((monitor) =>
          prisma.alertRule.create({
            data: {
              monitorId: monitor.id,
              trigger: "STATUS_CHANGE",
              targetStatus: "DOWN",
              enabled: true,
              channels: {
                connect: userChannels.map((ch) => ({ id: ch.id })),
              },
            },
          })
        );
        await prisma.$transaction(alertRulePromises);
      } catch (err) {
        console.error("Failed to auto-create alert rules during import:", err);
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/monitors");

    return { success: true, count: createdMonitors.length };
  } catch (error: any) {
    console.error("Failed to import monitors:", error);
    return {
      success: false,
      error: error.message || "Failed to import monitors",
    };
  }
}

/**
 * Fetches project deployments from Vercel.
 */
export async function fetchVercelProjects(
  token?: string,
): Promise<{ success: boolean; data?: ExternalResource[]; error?: string }> {
  // If a direct token is provided, use it immediately
  if (token && token.toLowerCase().trim() !== "db") {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // 1. Fetch personal projects
      const personalProjectsPromise = fetch("https://api.vercel.com/v9/projects?limit=100", {
        headers,
      })
        .then(async (res) => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Personal projects error (${res.status}): ${text}`);
          }
          return res.json() as Promise<{ projects: any[] }>;
        })
        .catch((err) => {
          console.error("Error fetching Vercel personal projects:", err);
          return { projects: [] };
        });

      // 2. Fetch teams list
      const teamsPromise = fetch("https://api.vercel.com/v2/teams", { headers })
        .then(async (res) => {
          if (!res.ok) {
            return { teams: [] };
          }
          return res.json() as Promise<{ teams: any[] }>;
        })
        .catch((err) => {
          console.error("Error fetching Vercel teams:", err);
          return { teams: [] };
        });

      const [personalResult, teamsResult] = await Promise.all([
        personalProjectsPromise,
        teamsPromise,
      ]);

      const allProjects: Array<{
        project: any;
        scope: { type: "personal" | "team"; slug: string; name: string };
      }> = [];

      if (personalResult.projects) {
        for (const p of personalResult.projects) {
          allProjects.push({
            project: p,
            scope: { type: "personal", slug: "personal", name: "Personal" },
          });
        }
      }

      // 3. Concurrently fetch team projects
      const teams = teamsResult.teams || [];
      if (teams.length > 0) {
        const teamProjectsPromises = teams.map((team) =>
          fetch(`https://api.vercel.com/v9/projects?teamId=${team.id}&limit=100`, { headers })
            .then(async (res) => {
              if (!res.ok) {
                const text = await res.text();
                console.warn(
                  `Failed to fetch projects for team ${team.slug} (${res.status}): ${text}`,
                );
                return [];
              }
              const data = (await res.json()) as any;
              return (data.projects || []).map((p: any) => ({
                project: p,
                scope: {
                  type: "team" as const,
                  slug: team.slug,
                  name: team.name,
                },
              }));
            })
            .catch((err) => {
              console.error(`Error fetching projects for team ${team.slug}:`, err);
              return [];
            }),
        );

        const teamResults = await Promise.all(teamProjectsPromises);
        for (const teamProjects of teamResults) {
          allProjects.push(...teamProjects);
        }
      }

      // 4. Map and de-duplicate
      const data: ExternalResource[] = [];
      const seenUrls = new Set<string>();

      for (const { project, scope } of allProjects) {
        const aliases = project.targets?.production?.alias || [];
        const prefix = scope.type === "team" ? `[${scope.slug}] ` : "[personal] ";

        if (aliases.length === 0) {
          const latestAlias =
            project.latestDeployments?.[0]?.alias?.[0] || `${project.name}.vercel.app`;
          const key = `${latestAlias}`.toLowerCase();
          if (!seenUrls.has(key)) {
            seenUrls.add(key);
            data.push({
              id: `${project.id}-default`,
              name: `${prefix}${project.name}`,
              url: latestAlias,
              type: "HTTP" as const,
            });
          }
        } else {
          aliases.forEach((alias: string, index: number) => {
            const key = `${alias}`.toLowerCase();
            if (!seenUrls.has(key)) {
              seenUrls.add(key);
              data.push({
                id: `${project.id}-${index}`,
                name:
                  aliases.length > 1
                    ? `${prefix}${project.name} (${alias})`
                    : `${prefix}${project.name}`,
                url: alias,
                type: "HTTP" as const,
              });
            }
          });
        }
      }

      return { success: true, data };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Failed to fetch from Vercel",
      };
    }
  }

  // Fetch using the persistent integrations stored in DB
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const integrations = await prisma.userIntegration.findMany({
      where: { userId: session.user.id, provider: "vercel" },
    });

    if (integrations.length === 0) {
      return { success: true, data: [] };
    }

    const allProjects: Array<{
      project: any;
      scope: { type: "personal" | "team"; slug: string; name: string };
    }> = [];

    const fetchPromises = integrations.map(async (integration) => {
      const authHeaders = {
        Authorization: `Bearer ${integration.accessToken}`,
      };

      const isPersonal = integration.teamId === "personal";
      const url = isPersonal
        ? "https://api.vercel.com/v9/projects?limit=100"
        : `https://api.vercel.com/v9/projects?teamId=${integration.teamId}&limit=100`;

      try {
        const res = await fetch(url, { headers: authHeaders });
        if (!res.ok) {
          const text = await res.text();
          console.error(
            `Failed to fetch projects for Vercel integration ${integration.id} (${res.status}): ${text}`,
          );
          return [];
        }
        const data = (await res.json()) as any;
        const scopeSlug = isPersonal ? "personal" : integration.teamSlug || "team";
        const scopeName = isPersonal ? "Personal" : integration.teamName || "Team";

        if (data.projects) {
          return data.projects.map((p: any) => ({
            project: p,
            scope: {
              type: isPersonal ? "personal" : "team",
              slug: scopeSlug,
              name: scopeName,
            },
          }));
        }
        return [];
      } catch (err) {
        console.error(`Error fetching projects for integration ${integration.id}:`, err);
        return [];
      }
    });

    const results = await Promise.all(fetchPromises);
    for (const projects of results) {
      allProjects.push(...projects);
    }

    const data: ExternalResource[] = [];
    const seenUrls = new Set<string>();

    for (const { project, scope } of allProjects) {
      const aliases = project.targets?.production?.alias || [];
      const prefix = scope.type === "team" ? `[${scope.slug}] ` : "[personal] ";

      if (aliases.length === 0) {
        const latestAlias =
          project.latestDeployments?.[0]?.alias?.[0] || `${project.name}.vercel.app`;
        const key = `${latestAlias}`.toLowerCase();
        if (!seenUrls.has(key)) {
          seenUrls.add(key);
          data.push({
            id: `${project.id}-default`,
            name: `${prefix}${project.name}`,
            url: latestAlias,
            type: "HTTP" as const,
          });
        }
      } else {
        aliases.forEach((alias: string, index: number) => {
          const key = `${alias}`.toLowerCase();
          if (!seenUrls.has(key)) {
            seenUrls.add(key);
            data.push({
              id: `${project.id}-${index}`,
              name:
                aliases.length > 1
                  ? `${prefix}${project.name} (${alias})`
                  : `${prefix}${project.name}`,
              url: alias,
              type: "HTTP" as const,
            });
          }
        });
      }
    }

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to fetch from Vercel",
    };
  }
}

/**
 * Fetches sites deployed on Netlify.
 */
export async function fetchNetlifySites(
  token?: string,
): Promise<{ success: boolean; data?: ExternalResource[]; error?: string }> {
  const tokenToUse = token || "db";

  // Handle mock credentials
  if (tokenToUse.toLowerCase().trim() === "mock" || tokenToUse.toLowerCase().trim() === "demo") {
    return {
      success: true,
      data: [
        {
          id: "n1",
          name: "sveltekit-portfolio",
          url: "portfolio.netlify.app",
          type: "HTTP",
        },
        {
          id: "n2",
          name: "static-docs-site",
          url: "docs.maker.io",
          type: "HTTP",
        },
        {
          id: "n3",
          name: "landing-page-v2",
          url: "promo.netlify.app",
          type: "HTTP",
        },
      ],
    };
  }

  let finalToken = tokenToUse;

  // Read from database
  if (tokenToUse === "db") {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const integration = await prisma.userIntegration.findFirst({
      where: { userId: session.user.id, provider: "netlify" },
    });

    if (!integration) {
      return { success: true, data: [] }; // No integration configured yet
    }

    finalToken = integration.accessToken;
  }

  try {
    const res = await fetch("https://api.netlify.com/api/v1/sites", {
      headers: {
        Authorization: `Bearer ${finalToken}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        error: `Netlify API returned status ${res.status}: ${errorText}`,
      };
    }

    const sites = (await res.json()) as any[];
    const data = sites.map((s: any) => {
      const domain = s.custom_domain || s.ssl_url || s.url || `${s.name}.netlify.app`;
      // Clean up protocol for display url
      const cleanUrl = domain.replace(/^https?:\/\//, "");
      return {
        id: s.id,
        name: s.name,
        url: cleanUrl,
        type: "HTTP" as const,
      };
    });

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to fetch from Netlify",
    };
  }
}

/**
 * Verifies a Netlify API token and saves the integration persistently in the database.
 */
export async function connectNetlifyWithToken(token: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  if (!token) {
    return { success: false, error: "Token is required" };
  }

  try {
    // 1. Verify Netlify account details
    const userRes = await fetch("https://api.netlify.com/api/v1/user", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return {
        success: false,
        error: "Invalid Netlify API token. Please check your token and try again.",
      };
    }

    const userData = (await userRes.json()) as any;
    const name = userData.full_name || userData.email || "Netlify Account";
    const slug = userData.email ? userData.email.split("@")[0] : "netlify";

    // 2. Save Netlify integration
    await prisma.userIntegration.upsert({
      where: {
        userId_provider_teamId: {
          userId: session.user.id,
          provider: "netlify",
          teamId: "personal",
        },
      },
      update: {
        accessToken: token,
        teamName: name,
        teamSlug: slug,
      },
      create: {
        userId: session.user.id,
        provider: "netlify",
        accessToken: token,
        teamId: "personal",
        teamName: name,
        teamSlug: slug,
      },
    });

    revalidatePath("/dashboard/integrations");

    return {
      success: true,
      name,
    };
  } catch (err: any) {
    console.error("Netlify token integration error:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred.",
    };
  }
}

/**
 * Fetches repositories from GitHub.
 */
export async function fetchGitHubRepos(
  token?: string,
): Promise<{ success: boolean; data?: ExternalResource[]; error?: string }> {
  const tokenToUse = token || "db";

  if (tokenToUse.toLowerCase().trim() === "mock" || tokenToUse.toLowerCase().trim() === "demo") {
    return {
      success: true,
      data: [
        {
          id: "g1",
          name: "steadystack-agent-kit",
          url: "github.com/getsteadystack/SteadyStack",
          type: "PING",
        },
        {
          id: "g2",
          name: "react-cyberpunk-ui",
          url: "github.com/alexgutscher26/react-cyberpunk-ui",
          type: "PING",
        },
        {
          id: "g3",
          name: "pain-point-miner",
          url: "github.com/alexgutscher26/pain-point-miner",
          type: "PING",
        },
      ],
    };
  }

  let finalToken = tokenToUse;

  // Read from database
  if (tokenToUse === "db") {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const integration = await prisma.userIntegration.findFirst({
      where: { userId: session.user.id, provider: "github" },
    });

    if (!integration) {
      return { success: true, data: [] }; // No integration configured yet
    }

    finalToken = integration.accessToken;
  }

  try {
    const res = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: {
        Authorization: `Bearer ${finalToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "SteadyStack",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return {
        success: false,
        error: `GitHub API returned status ${res.status}: ${errorText}`,
      };
    }

    const repos = (await res.json()) as any[];
    const data = repos.map((r: any) => {
      // Use homepage URL if set, otherwise fallback to repo url format
      const domain = r.homepage || r.html_url || `github.com/${r.full_name}`;
      const cleanUrl = domain.replace(/^https?:\/\//, "");
      return {
        id: String(r.id),
        name: r.name,
        url: cleanUrl,
        type: r.homepage ? ("HTTP" as const) : ("PING" as const),
      };
    });

    return { success: true, data };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to fetch from GitHub",
    };
  }
}

/**
 * Verifies a GitHub API token and saves the integration persistently in the database.
 */
export async function connectGitHubWithToken(token: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  if (!token) {
    return { success: false, error: "Token is required" };
  }

  try {
    // 1. Verify GitHub account details
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "SteadyStack",
      },
    });

    if (!userRes.ok) {
      return {
        success: false,
        error: "Invalid GitHub API token. Please check your token and try again.",
      };
    }

    const userData = (await userRes.json()) as any;
    const name = userData.name || userData.login || "GitHub Account";
    const slug = userData.login || "github";

    // 2. Save GitHub integration
    await prisma.userIntegration.upsert({
      where: {
        userId_provider_teamId: {
          userId: session.user.id,
          provider: "github",
          teamId: "personal",
        },
      },
      update: {
        accessToken: token,
        teamName: name,
        teamSlug: slug,
      },
      create: {
        userId: session.user.id,
        provider: "github",
        accessToken: token,
        teamId: "personal",
        teamName: name,
        teamSlug: slug,
      },
    });

    revalidatePath("/dashboard/integrations");

    return {
      success: true,
      name,
    };
  } catch (err: any) {
    console.error("GitHub token integration error:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred.",
    };
  }
}

/**
 * Retrieves all stored third-party integrations for the user.
 */
export async function getConnectedIntegrations() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const integrations = await prisma.userIntegration.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        provider: true,
        teamId: true,
        teamName: true,
        teamSlug: true,
        createdAt: true,
      },
    });

    return { success: true, data: integrations };
  } catch (err: any) {
    console.error("Failed to fetch connected integrations:", err);
    return {
      success: false,
      error: err.message || "Failed to retrieve integrations",
    };
  }
}

/**
 * Disconnects/deletes a persistent integration.
 */
import { getSafeSession } from "@/lib/safe-session";

export async function disconnectIntegration(integrationId: string) {
  const session = await getSafeSession();

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Verify ownership
    const integration = await prisma.userIntegration.findFirst({
      where: { id: integrationId, userId: session.user.id },
    });

    if (!integration) {
      return {
        success: false,
        error: "Integration not found or access denied",
      };
    }

    await prisma.userIntegration.delete({
      where: { id: integrationId },
    });

    revalidatePath("/dashboard/integrations");

    return { success: true };
  } catch (err: any) {
    console.error("Failed to disconnect integration:", err);
    return {
      success: false,
      error: err.message || "Failed to disconnect integration",
    };
  }
}

/**
 * Generates the Vercel OAuth authorization URL for the logged-in user.
 */
export async function getVercelOAuthUrl() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const clientId = env.VERCEL_CLIENT_ID;
  const redirectUri = env.VERCEL_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return {
      success: false,
      error:
        "Vercel OAuth integration credentials are not configured on the server. Please check VERCEL_CLIENT_ID and VERCEL_REDIRECT_URI environment variables.",
    };
  }

  // We pass the userId as state to authenticate on redirect callback and mitigate CSRF
  const state = session.user.id;
  const url = `https://vercel.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&state=${state}&response_type=code`;

  return { success: true, url };
}

/**
 * Verifies a Vercel API token and saves integrations for the user's personal scope
 * and all accessible teams persistently in the database.
 */
export async function connectVercelWithToken(token: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  if (!token) {
    return { success: false, error: "Token is required" };
  }

  try {
    // 1. Verify personal account details
    const userRes = await fetch("https://api.vercel.com/v2/user", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) {
      return {
        success: false,
        error: "Invalid Vercel API token. Please check your token and try again.",
      };
    }

    const userData = (await userRes.json()) as any;
    const userObj = userData.user || userData;
    const personalName = userObj.name || userObj.username || "Personal Account";
    const personalSlug = userObj.username || "personal";

    // 2. Save personal integration
    await prisma.userIntegration.upsert({
      where: {
        userId_provider_teamId: {
          userId: session.user.id,
          provider: "vercel",
          teamId: "personal",
        },
      },
      update: {
        accessToken: token,
        teamName: personalName,
        teamSlug: personalSlug,
      },
      create: {
        userId: session.user.id,
        provider: "vercel",
        accessToken: token,
        teamId: "personal",
        teamName: personalName,
        teamSlug: personalSlug,
      },
    });

    let teamsCount = 0;

    // 3. Fetch and save team integrations
    try {
      const teamsRes = await fetch("https://api.vercel.com/v2/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (teamsRes.ok) {
        const teamsData = (await teamsRes.json()) as any;
        const teamsList = teamsData.teams || [];

        const upsertPromises = teamsList
          .filter((team: any) => team.id)
          .map((team: any) =>
            prisma.userIntegration.upsert({
              where: {
                userId_provider_teamId: {
                  userId: session.user.id,
                  provider: "vercel",
                  teamId: team.id,
                },
              },
              update: {
                accessToken: token,
                teamName: team.name || team.slug,
                teamSlug: team.slug,
              },
              create: {
                userId: session.user.id,
                provider: "vercel",
                accessToken: token,
                teamId: team.id,
                teamName: team.name || team.slug,
                teamSlug: team.slug,
              },
            }),
          );

        await Promise.all(upsertPromises);
        teamsCount += upsertPromises.length;
      }
    } catch (err) {
      console.error("Failed to fetch teams during Vercel token verification:", err);
    }

    revalidatePath("/dashboard/integrations");

    return {
      success: true,
      teamsCount,
      personalName,
    };
  } catch (err: any) {
    console.error("Vercel token integration error:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred.",
    };
  }
}
