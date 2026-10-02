"use client";

import { useCallback, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { DashboardStats, type DashboardStatsData } from "@/components/dashboard/stats";
import { MonitorsTable } from "@/components/dashboard/monitors-table";
import { MonitorsGrid } from "@/components/dashboard/monitors-grid";
import { AIInsights, type MonitorInsight } from "@/components/dashboard/ai-insights";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { UsageLimitBanner } from "@/components/dashboard/usage-limit-banner";
import { HolidayModeBanner } from "@/components/dashboard/holiday-mode-banner";
import { useMonitors, useDashboardStats } from "@/hooks/use-monitors";
import { LayoutGrid, List, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OnboardingStatus } from "@/actions/onboarding";
import type { UsageSummary } from "@/lib/billing";

// Dynamic import with ssr: false to prevent hydration errors and optimize bundle size
const GlobeVisualization = dynamic(
  () => import("@/components/dashboard/globe-visualization").then((mod) => mod.GlobeVisualization),
  {
    ssr: false,
    loading: () => (
      <div className="border border-primary/20 bg-zinc-950/40 backdrop-blur-md rounded-xl h-[480px] animate-pulse flex items-center justify-center font-mono text-zinc-500 text-[10px] uppercase tracking-wider">
        Initializing 3D Vector Space Matrix...
      </div>
    ),
  },
);

export default function Dashboard({
  monitors: initialMonitors,
  stats: initialStats,
  insights: initialInsights,
  onboardingStatus,
  usageSummary,
  userEmail,
  holidayModeUntil,
  isDemo = false,
}: {
  monitors: any[];
  stats: DashboardStatsData;
  insights: MonitorInsight[];
  onboardingStatus: OnboardingStatus;
  usageSummary?: UsageSummary;
  userEmail?: string;
  holidayModeUntil?: string | null;
  isDemo?: boolean;
}) {
  const { data: monitors } = useMonitors(initialMonitors, isDemo);
  const { data: stats } = useDashboardStats(initialStats, isDemo);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [showGlobe, setShowGlobe] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("steadystack_dashboard_view_mode");
    if (saved === "list" || saved === "grid") {
      setViewMode(saved);
    }
    const savedGlobe = localStorage.getItem("steadystack_dashboard_show_globe");
    if (savedGlobe === "true") {
      setShowGlobe(true);
    }
  }, []);

  const handleToggleView = useCallback((mode: "list" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("steadystack_dashboard_view_mode", mode);
  }, []);

  const handleToggleGlobe = useCallback(() => {
    setShowGlobe((prev) => {
      const next = !prev;
      localStorage.setItem("steadystack_dashboard_show_globe", String(next));
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {!isDemo && <UsageLimitBanner summary={usageSummary} />}
      {!isDemo && <HolidayModeBanner holidayModeUntil={holidayModeUntil ?? null} />}
      {!isDemo && <OnboardingChecklist status={onboardingStatus} userEmail={userEmail} />}
      {/* <AIInsights insights={initialInsights} /> */}
      <DashboardStats stats={stats} />

      {/* View Mode Selector bar */}
      <div className="flex justify-between items-center px-1 border-b border-zinc-900 pb-3">
        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
          Nodes Dashboard Management
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleGlobe}
            className={`h-8 px-3 font-mono text-[10px] uppercase tracking-wider ${
              showGlobe
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                : "border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Globe className="size-3 mr-1.5 animate-pulse" />
            Globe Matrix
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleView("list")}
            className={`h-8 px-3 font-mono text-[10px] uppercase tracking-wider ${
              viewMode === "list"
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                : "border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <List className="size-3 mr-1.5" />
            Table
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleView("grid")}
            className={`h-8 px-3 font-mono text-[10px] uppercase tracking-wider ${
              viewMode === "grid"
                ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                : "border-zinc-800 bg-zinc-950/20 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <LayoutGrid className="size-3 mr-1.5" />
            Grid Matrix
          </Button>
        </div>
      </div>

      {showGlobe && (
        <div className="animate-fade-in">
          <GlobeVisualization monitors={monitors} />
        </div>
      )}

      <div>
        {viewMode === "list" ? (
          <MonitorsTable monitors={monitors} />
        ) : (
          <MonitorsGrid monitors={monitors} />
        )}
      </div>
    </div>
  );
}
