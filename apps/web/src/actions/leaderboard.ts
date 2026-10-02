import prisma from "@steadystack/db";
import { unstable_cache } from "next/cache";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  bio: string | null;
  uptimePct: number;
  totalChecks: number;
  monitorCount: number;
  tier: string;
  statusPageSlug: string | null;
}

export const getLeaderboard = unstable_cache(
  async (limit = 50): Promise<LeaderboardEntry[]> => {
    try {
      const privacySettings = await prisma.userPrivacy.findMany({
        where: { showOnLeaderboard: true },
        select: { userId: true, leaderboardBio: true },
      });

      if (!privacySettings || privacySettings.length === 0) {
        return [];
      }

      const allowedUserIds = privacySettings.map((p) => p.userId);
      const bioMap = new Map(privacySettings.map((p) => [p.userId, p.leaderboardBio]));

      // Fetch users, monitors, summaries, live events, and public status pages
      const [users, monitors, summaries, liveEvents, pages] = await Promise.all([
        prisma.user.findMany({
          where: { id: { in: allowedUserIds } },
          select: { id: true, name: true, image: true, tier: true },
        }),
        prisma.monitor.findMany({
          where: { userId: { in: allowedUserIds } },
          select: { id: true, userId: true, status: true },
        }),
        prisma.dailyMonitorSummary.findMany({
          where: { monitor: { userId: { in: allowedUserIds } } },
          select: {
            checksUp: true,
            checksDown: true,
            monitor: { select: { userId: true } },
          },
        }),
        prisma.monitorEvent.groupBy({
          by: ["monitorId", "status"],
          where: { monitor: { userId: { in: allowedUserIds } } },
          _count: { _all: true },
        }),
        prisma.statusPage.findMany({
          where: { userId: { in: allowedUserIds }, isPrivate: false },
          select: { slug: true, userId: true },
        }),
      ]);

      const pageMap = new Map(pages.map((p) => [p.userId, p.slug]));
      const monitorUserMap = new Map(monitors.map((m) => [m.id, m.userId]));

      // Aggregate checks by user
      const userStats = new Map<
        string,
        { totalUp: number; totalDown: number; monitorIds: Set<string> }
      >();

      for (const m of monitors) {
        if (!userStats.has(m.userId)) {
          userStats.set(m.userId, {
            totalUp: 0,
            totalDown: 0,
            monitorIds: new Set(),
          });
        }
        const stat = userStats.get(m.userId)!;
        stat.monitorIds.add(m.id);
      }

      // Historical daily summaries
      for (const s of summaries) {
        const uid = s.monitor?.userId;
        if (!uid) continue;
        if (!userStats.has(uid)) {
          userStats.set(uid, { totalUp: 0, totalDown: 0, monitorIds: new Set() });
        }
        const stat = userStats.get(uid)!;
        stat.totalUp += s.checksUp;
        stat.totalDown += s.checksDown;
      }

      // Live raw monitor events
      for (const e of liveEvents) {
        const uid = monitorUserMap.get(e.monitorId);
        if (!uid) continue;
        if (!userStats.has(uid)) {
          userStats.set(uid, { totalUp: 0, totalDown: 0, monitorIds: new Set() });
        }
        const stat = userStats.get(uid)!;
        if (e.status === "UP") {
          stat.totalUp += e._count._all;
        } else {
          stat.totalDown += e._count._all;
        }
      }

      const candidates: {
        user: (typeof users)[0];
        totalChecks: number;
        uptimePct: number;
        monitorCount: number;
      }[] = [];

      for (const user of users) {
        const stat = userStats.get(user.id);
        const monitorCount = stat ? stat.monitorIds.size : 0;
        const totalUp = stat ? stat.totalUp : 0;
        const totalDown = stat ? stat.totalDown : 0;
        const totalChecks = totalUp + totalDown;

        // Calculate uptime percentage
        let uptimePct = 100;
        if (totalChecks > 0) {
          uptimePct = (totalUp / totalChecks) * 100;
        }

        candidates.push({
          user,
          totalChecks,
          uptimePct: Math.round(uptimePct * 100) / 100,
          monitorCount,
        });
      }

      // Sort by uptime percentage descending, then total checks descending
      candidates.sort((a, b) => {
        if (b.uptimePct !== a.uptimePct) return b.uptimePct - a.uptimePct;
        return b.totalChecks - a.totalChecks;
      });

      return candidates.slice(0, limit).map((c, i) => ({
        rank: i + 1,
        userId: c.user.id,
        name: c.user.name,
        image: c.user.image,
        bio: bioMap.get(c.user.id) ?? null,
        uptimePct: c.uptimePct,
        totalChecks: c.totalChecks,
        monitorCount: c.monitorCount,
        tier: c.user.tier,
        statusPageSlug: pageMap.get(c.user.id) ?? null,
      }));
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      return [];
    }
  },
  ["leaderboard-entries"],
  { revalidate: 300, tags: ["leaderboard"] },
);
