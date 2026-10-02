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
import { cn } from "@/lib/utils";
import type { OnboardingStatus } from "@/actions/onboarding";
import type { UsageSummary } from "@/lib/billing";

// Dynamic import with ssr: false to prevent hydration errors and optimize bundle size
const GlobeVisualization = dynamic(
  () => import("@/components/dashboard/globe-visualization").then((mod) => mod.GlobeVisualization),
  {
    ssr: false,
    loading: () => (
      <div className="border border-border bg-card rounded-2xl h-[480px] animate-pulse flex items-center justify-center font-mono text-muted-foreground text-xs uppercase tracking-wider shadow-xs">
        Initializing 3D Consensus Mesh...
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 border-b border-[#e8e6df] pb-4 pt-2">
        <div className="flex items-center gap-2.5">
          <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground">
            Monitored Infrastructure
          </h2>
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            {monitors.length} Total
          </span>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant={showGlobe ? "default" : "outline"}
            size="sm"
            onClick={handleToggleGlobe}
            className="h-8 px-3.5 text-xs font-medium rounded-xl cursor-pointer shadow-xs"
          >
            <Globe
              className={cn(
                "size-3.5 mr-1.5",
                showGlobe ? "text-[#ffd439]" : "text-muted-foreground",
              )}
            />
            3D Globe
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => handleToggleView("list")}
            className="h-8 px-3.5 text-xs font-medium rounded-xl cursor-pointer shadow-xs"
          >
            <List className="size-3.5 mr-1.5" />
            Table View
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => handleToggleView("grid")}
            className="h-8 px-3.5 text-xs font-medium rounded-xl cursor-pointer shadow-xs"
          >
            <LayoutGrid className="size-3.5 mr-1.5" />
            Grid View
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
