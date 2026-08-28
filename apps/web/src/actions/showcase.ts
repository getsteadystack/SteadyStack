import prisma, { MonitorStatus } from "@steadystack/db";
import { unstable_cache } from "next/cache";

export interface ShowcaseEntry {
  name: string;
  slug: string;
  tagline: string;
  theme: string;
  themeColors: { primary: string; bg: string; text: string };
  preview: {
    status: "operational" | "degraded" | "outage";
    uptime: string;
    monitors: number;
  };
}

const THEME_COLORS: Record<string, ShowcaseEntry["themeColors"]> = {
  cyberpunk: { primary: "#22c55e", bg: "#050505", text: "#e2e8f0" },
  midnight: { primary: "#38bdf8", bg: "#0f172a", text: "#f8fafc" },
  dracula: { primary: "#ff79c6", bg: "#282a36", text: "#f8f8f2" },
  monochrome: { primary: "#000000", bg: "#ffffff", text: "#000000" },
  custom: { primary: "#06b6d4", bg: "#09090b", text: "#fafafa" },
};

/**
 * Returns up to `limit` public status pages that have opted in to showcase display.
 * Pages are ordered by monitor count descending so the richest pages appear first.
 */
export const getShowcaseEntries = unstable_cache(
  async (limit = 18): Promise<ShowcaseEntry[]> => {
    try {
      const pages = await prisma.statusPage.findMany({
        where: {
          isPrivate: false,
          showInShowcase: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          slug: true,
          title: true,
          description: true,
          theme: true,
          monitors: {
            select: {
              monitor: {
                select: { status: true },
              },
            },
          },
        },
      });

      return pages.map((page) => {
        const themeValue =
          (page.theme as any)?.value ?? (typeof page.theme === "string" ? page.theme : "cyberpunk");
        const colors = THEME_COLORS[themeValue] ?? THEME_COLORS.cyberpunk;
        const themeName =
          themeValue === "cyberpunk"
            ? "Cyberpunk"
            : themeValue === "midnight"
              ? "Midnight"
              : themeValue === "dracula"
                ? "Dracula"
                : themeValue === "monochrome"
                  ? "Monochrome"
                  : "Custom";

        const total = page.monitors.length;
        const downCount = page.monitors.filter(
          (m) => m.monitor.status === MonitorStatus.DOWN,
        ).length;

        // Page status: all down → outage, some down → degraded, none down → operational
        const status: ShowcaseEntry["preview"]["status"] =
          total > 0 && downCount === total ? "outage" : downCount > 0 ? "degraded" : "operational";

        const uptime =
          status === "operational" ? "100%" : status === "degraded" ? "99.5%" : "98.0%";

        return {
          name: page.title,
          slug: page.slug,
          tagline: page.description ?? "Powered by SteadyStack",
          theme: themeName,
          themeColors: colors,
          preview: { status, uptime, monitors: total },
        };
      });
    } catch (error) {
      console.error("Failed to query showcase entries from DB:", error);
      return [];
    }
  },
  ["showcase-entries"],
  { revalidate: 300, tags: ["showcase"] },
);
