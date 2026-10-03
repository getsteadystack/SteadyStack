"use client";

import { useEffect, useState } from "react";
import { LTD_CONFIG } from "./ltd-config";

export interface LtdStats {
  totalCap: number;
  claimedCount: number;
  remaining: number;
  isSoldOut: boolean;
  percentage: number;
  isLoading: boolean;
}

const DEFAULT_STATS: LtdStats = {
  totalCap: LTD_CONFIG.totalCap,
  claimedCount: LTD_CONFIG.claimedCount,
  remaining: Math.max(0, LTD_CONFIG.totalCap - LTD_CONFIG.claimedCount),
  isSoldOut: LTD_CONFIG.isGloballySoldOut,
  percentage: Math.min(100, Math.round((LTD_CONFIG.claimedCount / LTD_CONFIG.totalCap) * 100)),
  isLoading: true,
};

export function useLtdStats(): LtdStats {
  const [stats, setStats] = useState<LtdStats>(DEFAULT_STATS);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        const res = await fetch("/api/ltd/stats", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          totalCap?: number;
          claimedCount?: number;
          remaining?: number;
          isSoldOut?: boolean;
          percentage?: number;
        };
        if (isMounted && data && typeof data.claimedCount === "number") {
          setStats({
            totalCap: data.totalCap ?? LTD_CONFIG.totalCap,
            claimedCount: data.claimedCount,
            remaining: data.remaining ?? Math.max(0, LTD_CONFIG.totalCap - data.claimedCount),
            isSoldOut: Boolean(data.isSoldOut),
            percentage:
              data.percentage ?? Math.round((data.claimedCount / LTD_CONFIG.totalCap) * 100),
            isLoading: false,
          });
        }
      } catch (err) {
        console.error("[useLtdStats] Error fetching live stats:", err);
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return stats;
}
