"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useTransition } from "react";
import { getMonitor, checkMonitor } from "@/actions/monitors";
import { getMonitorLatencyHistory } from "@/actions/latency";
import { useLiveMonitor } from "@/hooks/use-live-monitor";
import { MonitorDetailHeader } from "@/components/monitors/details/header";
import { MonitorStatsGrid } from "@/components/monitors/details/stats-grid";
import { MonitorCharts } from "@/components/monitors/details/charts";
import { IncidentHistory } from "@/components/monitors/details/incident-history";
import { LatencyHeatmap } from "@/components/monitors/latency";
import dynamic from "next/dynamic";

const ResponseTimeChart = dynamic(
  () => import("@/components/charts/response-time-chart").then((mod) => mod.ResponseTimeChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] flex items-center justify-center">
        <div className="size-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    ),
  },
);
import { SlaReportView } from "@/components/monitors/details/sla-report-view";
import { ChevronLeft, Play, Loader2, Settings, Download } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { MonitorExportModal } from "@/components/monitors/details/export-modal";
import { GlobalDiagnosticsModal } from "@/components/monitors/details/global-diagnostics-modal";
import { RedirectInspectorModal } from "@/components/monitors/details/redirect-inspector-modal";
import { useHaptic } from "@/hooks/use-haptic";

/**
 * Monitors the detail view of a specific monitor and manages its state.
 *
 * This function fetches the monitor data and its latency history using the useQuery hook. It also listens for live events and updates the query cache accordingly. If the monitor data is stale, it triggers a check automatically. The component renders various tabs for overview, reports, incidents, and settings, and provides a button to manually run a check on the monitor.
 *
 * @param {Object} param0 - The parameters for the function.
 * @param {any} param0.initialMonitor - The initial monitor object containing monitor details.
 * @returns {JSX.Element | null} The rendered component or null if the monitor data is not available.
 */
export function MonitorDetailView({ initialMonitor }: { initialMonitor: any }) {
  const { data: monitor } = useQuery({
    queryKey: ["monitor", initialMonitor.id],
    queryFn: () => getMonitor(initialMonitor.id),
    initialData: initialMonitor,
    refetchInterval: 10000, // 10s auto-refresh
    refetchOnWindowFocus: true,
  });

  // Query for latency history
  const { data: latencyHistory, isLoading: isLoadingLatency } = useQuery({
    queryKey: ["monitor-latency", initialMonitor.id],
    queryFn: () => getMonitorLatencyHistory(initialMonitor.id),
  });

  const queryClient = useQueryClient();
  const { lastEvent, isConnected } = useLiveMonitor(initialMonitor.id);

  // Sync Live Events to Query Cache
  useEffect(() => {
    if (lastEvent) {
      console.log("Received Live Event:", lastEvent);
      queryClient.setQueryData(["monitor", initialMonitor.id], (oldData: any) => {
        if (!oldData) return oldData;

        const newEvent = {
          id: `live-${Date.now()}`,
          status: lastEvent.status,
          latency: lastEvent.latency,
          timestamp: new Date(lastEvent.timestamp).toISOString(),
          errorReason: null,
          region: lastEvent.region,
        };

        return {
          ...oldData,
          status: lastEvent.status,
          events: [newEvent, ...(oldData.events || [])],
        };
      });

      // Optional: Toast for major status changes
      if (monitor?.status !== lastEvent.status) {
        toast(lastEvent.status === "UP" ? "Monitor Recovered" : "Monitor Down", {
          description: `Latency: ${lastEvent.latency}ms`,
          action: { label: "Dismiss", onClick: () => {} },
        });
      }
    }
  }, [lastEvent, initialMonitor.id, queryClient, monitor?.status]);

  const [isLoading, startTransition] = useTransition();
  const { trigger } = useHaptic();

  const handleRunCheck = () => {
    trigger("light"); // Subtle click feedback
    startTransition(async () => {
      const result = await checkMonitor(initialMonitor.id);
      if (result.success) {
        trigger("success"); // Success double-tick
        toast.success("Check initiated successfully");
      } else {
        trigger("error"); // Error pulse alert
        toast.error(result.error || "Failed to initiate check");
      }
    });
  };

  if (!monitor) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/monitors"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground hover:text-foreground font-mono text-[10px] uppercase tracking-widest p-0 h-auto hover:bg-transparent",
          )}
        >
          <ChevronLeft className="size-4 mr-1 text-primary" />
          Back to Monitors
        </Link>

        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">
                Live
              </span>
            </div>
          )}

          <MonitorExportModal
            monitorId={initialMonitor.id}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] md:h-8 px-4 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary font-mono text-[10px] uppercase tracking-wider"
              >
                <Download className="size-3 mr-2" />
                Export
              </Button>
            }
          />

          <GlobalDiagnosticsModal url={initialMonitor.url} monitorName={initialMonitor.name} />

          {(monitor?.type === "HTTP" || monitor?.type === "HTTPS" || String(monitor?.url || "").startsWith("http")) && (
            <RedirectInspectorModal monitorId={initialMonitor.id} monitorName={initialMonitor.name} />
          )}

          <Button
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={handleRunCheck}
            className="min-h-[44px] md:h-8 px-4 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary font-mono text-[10px] uppercase tracking-wider"
          >
            {isLoading ? (
              <Loader2 className="size-3 mr-2 animate-spin" />
            ) : (
              <Play className="size-3 mr-2" />
            )}
            Run Check
          </Button>
        </div>
      </div>

      <MonitorDetailHeader monitor={monitor} />

      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 md:pb-0">
          <TabsList className="bg-zinc-950/50 border border-zinc-900">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">SLA & Reports</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="overview"
          className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <MonitorStatsGrid monitor={monitor} />

          <ResponseTimeChart data={latencyHistory || []} isLoading={isLoadingLatency} />

          <MonitorCharts monitor={monitor} />

          {monitor.checkRegions && (
            <div className="mt-6">
              <LatencyHeatmap monitorId={monitor.id} />
            </div>
          )}

          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Recent Activity</h3>
            </div>
            <IncidentHistory monitor={monitor} />
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <SlaReportView monitorId={monitor.id} />
        </TabsContent>

        <TabsContent
          value="incidents"
          className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <IncidentHistory monitor={monitor} />
        </TabsContent>

        <TabsContent
          value="settings"
          className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <div className="flex flex-col items-center justify-center p-12 border border-zinc-800 rounded-lg bg-zinc-950/30 border-dashed">
            <Settings className="size-12 text-zinc-700 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Monitor Settings</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-sm">
              Configure monitor frequency, alert thresholds, and notifications in the
              dedicated settings page.
            </p>
            <Link
              href={`/dashboard/monitors/${monitor.id}/settings`}
              className={buttonVariants({ variant: "outline" })}
            >
              Go to Settings
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
