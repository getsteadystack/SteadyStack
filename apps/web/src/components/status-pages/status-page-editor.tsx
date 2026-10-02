"use client";

import { env } from "@steadystack/env/web";

import { useState, useEffect } from "react";
import {
  addMonitorToPage,
  removeMonitorFromPage,
  getStatusPageIncidents,
  getStatusPageMaintenance,
  updateHistoryDays,
  getStatusPageUptimeData,
  updateStatusPageMonitorSettings,
} from "@/actions/status-pages";
import {
  Monitor,
  Plus,
  Trash2,
  ArrowLeft,
  ExternalLink,
  History,
  Code2,
  Calendar,
  Settings2,
  Loader2,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/sonner";
import { useRouter } from "next/navigation";

import { StatusPageSettings } from "./status-page-settings";
import { TrafficChart } from "../dashboard/analytics/traffic-chart";
import { StatsCards } from "../dashboard/analytics/stats-cards";
import { IncidentHistoryTab } from "./incident-history-tab";
import { MaintenanceTimeline } from "./maintenance-timeline";
import { UptimePercentageCard } from "./uptime-percentage-card";
import { WidgetConfigurator } from "./widget-configurator";
import { OverridesTab } from "./overrides-tab";
import { ShowcaseSubmitPanel } from "./showcase-submit-panel";
import { StatusPageLoopCard } from "./status-page-loop-card";

type TabType =
  | "monitors"
  | "settings"
  | "analytics"
  | "history"
  | "widget"
  | "overrides"
  | "showcase";

export function StatusPageEditor({ page, allMonitors }: { page: any; allMonitors: any[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("monitors");
  const [isPending, setIsPending] = useState(false);

  // Monitor Settings Edit state
  const [editingMonitorId, setEditingMonitorId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editShowLatency, setEditShowLatency] = useState(true);
  const [editShowUptime, setEditShowUptime] = useState(true);
  const [editShowCheckCounts, setEditShowCheckCounts] = useState(true);

  const handleUpdateMonitorSettings = async (monitorId: string) => {
    setIsPending(true);
    const res = await updateStatusPageMonitorSettings(page.id, monitorId, {
      displayName: editDisplayName,
      showLatency: editShowLatency,
      showUptime: editShowUptime,
      showCheckCounts: editShowCheckCounts,
    });
    if (res.success) {
      toast.success("Monitor settings updated");
      setEditingMonitorId(null);
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update monitor settings");
    }
    setIsPending(false);
  };

  // History tab state
  const [historyDays, setHistoryDays] = useState(page.historyDays || 90);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [uptimeData, setUptimeData] = useState({
    current: 100,
    previous: 100,
    trend: "stable" as "up" | "down" | "stable",
    difference: 0,
  });
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load history data when tab becomes active or days change
  useEffect(() => {
    if (activeTab === "history") {
      loadHistoryData();
    }
  }, [activeTab, historyDays]);

  const loadHistoryData = async () => {
    setIsLoadingHistory(true);
    try {
      const [incidentsData, maintenanceData] = await Promise.all([
        getStatusPageIncidents(page.id, historyDays),
        getStatusPageMaintenance(page.id),
      ]);

      setIncidents(incidentsData);
      setMaintenance(maintenanceData);

      // Get uptime data via server action
      const trendData = await getStatusPageUptimeData(page.id, historyDays);
      setUptimeData(trendData);
    } catch (error) {
      console.error("Failed to load history data:", error);
      toast.error("Failed to load history data");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleHistoryDaysChange = async (days: number) => {
    setHistoryDays(days);
    const result = await updateHistoryDays(page.id, days);
    if (!result.success) {
      toast.error(result.error || "Failed to update history setting");
    }
  };

  const assignedMonitorIds = new Set(page.monitors.map((m: any) => m.monitorId));
  const availableMonitors = allMonitors.filter((m) => !assignedMonitorIds.has(m.id));

  const handleAdd = async (monitorId: string) => {
    setIsPending(true);
    const res = await addMonitorToPage(page.id, monitorId);
    if (res.success) {
      toast.success("Monitor added");
      router.refresh();
    } else {
      toast.error(res.error);
    }
    setIsPending(false);
  };

  const handleRemove = async (monitorId: string) => {
    if (!confirm("Remove from status page?")) return;
    setIsPending(true);
    const res = await removeMonitorFromPage(page.id, monitorId);
    if (res.success) {
      toast.success("Monitor removed");
      router.refresh();
    } else {
      toast.error(res.error);
    }
    setIsPending(false);
  };

  const tabs: { id: TabType; label: string; icon?: React.ReactNode }[] = [
    { id: "monitors", label: "Monitors" },
    { id: "history", label: "History", icon: <History className="size-3" /> },
    { id: "widget", label: "Widget", icon: <Code2 className="size-3" /> },
    {
      id: "overrides",
      label: "Overrides",
      icon: <Calendar className="size-3" />,
    },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
    {
      id: "showcase",
      label: "Showcase",
      icon: <Trophy className="size-3 text-yellow-500" />,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/80">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/pages"
            className="p-2.5 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors border border-border"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-medium tracking-tight text-foreground">
              {page.title}
            </h1>
            <a
              href={`/status-page/${page.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono mt-0.5"
            >
              {env.NEXT_PUBLIC_APP_URL.replace("https://", "").replace("http://", "")}
              /status-page/
              {page.slug} <ExternalLink className="size-3" />
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-muted/70 p-1 rounded-xl border border-border overflow-x-auto gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium font-mono rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "monitors" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Config (Left) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-border bg-card rounded-2xl p-6 shadow-xs">
              <h2 className="text-base font-serif font-medium text-foreground mb-4 flex items-center gap-2">
                <Monitor className="size-4.5 text-foreground" /> Active Monitors Linked
              </h2>

              <div className="space-y-2.5">
                {page.monitors.map((item: any) => {
                  const isEditing = editingMonitorId === item.monitorId;

                  return (
                    <div key={item.id} className="space-y-2">
                      <div className="flex items-center justify-between p-3.5 bg-background border border-border rounded-xl">
                        <div className="flex items-center gap-3">
                          <div
                            className={`size-2.5 rounded-full ${item.monitor.status === "UP" ? "bg-emerald-500" : "bg-rose-500"}`}
                          />
                          <span className="font-mono text-sm font-medium text-foreground">
                            {item.displayName || item.monitor.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingMonitorId(item.monitorId);
                              setEditDisplayName(item.displayName || "");
                              setEditShowLatency(item.showLatency !== false);
                              setEditShowUptime(item.showUptime !== false);
                              setEditShowCheckCounts(item.showCheckCounts !== false);
                            }}
                            disabled={isPending}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                            title="Monitor Settings"
                          >
                            <Settings2 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleRemove(item.monitorId)}
                            disabled={isPending}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
                              Display Name Override
                            </label>
                            <input
                              value={editDisplayName}
                              onChange={(e) => setEditDisplayName(e.target.value)}
                              placeholder={item.monitor.name}
                              className="w-full bg-background border border-border p-2.5 rounded-xl text-sm font-sans focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-colors"
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-background border border-border rounded-xl">
                              <input
                                type="checkbox"
                                checked={editShowLatency}
                                onChange={(e) => setEditShowLatency(e.target.checked)}
                                className="accent-foreground size-4"
                              />
                              <span className="text-[11px] font-mono text-foreground font-medium">
                                Latency
                              </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-background border border-border rounded-xl">
                              <input
                                type="checkbox"
                                checked={editShowUptime}
                                onChange={(e) => setEditShowUptime(e.target.checked)}
                                className="accent-foreground size-4"
                              />
                              <span className="text-[11px] font-mono text-foreground font-medium">
                                Uptime %
                              </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-background border border-border rounded-xl">
                              <input
                                type="checkbox"
                                checked={editShowCheckCounts}
                                onChange={(e) => setEditShowCheckCounts(e.target.checked)}
                                className="accent-foreground size-4"
                              />
                              <span className="text-[11px] font-mono text-foreground font-medium">
                                Checks
                              </span>
                            </label>
                          </div>

                          <div className="flex gap-2 justify-end pt-2">
                            <button
                              onClick={() => setEditingMonitorId(null)}
                              className="px-3.5 py-1.5 text-xs font-mono border border-border hover:bg-muted rounded-xl transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateMonitorSettings(item.monitorId)}
                              disabled={isPending}
                              className="px-3.5 py-1.5 text-xs font-mono bg-foreground text-background hover:bg-foreground/90 rounded-xl font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {isPending && <Loader2 className="size-3 animate-spin" />}
                              Save Changes
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {page.monitors.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-6">
                    No monitors linked yet. Select monitors from the right panel to add them to this
                    status page.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar (Right) */}
          <div className="space-y-6">
            <div className="border border-border rounded-2xl p-6 bg-card shadow-xs">
              <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-medium mb-3">
                Available Monitors
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {availableMonitors.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 bg-background hover:bg-muted/40 rounded-xl border border-border transition-all group"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div
                        className={`size-2 rounded-full shrink-0 ${m.status === "UP" ? "bg-emerald-500" : "bg-rose-500"}`}
                      />
                      <span className="text-xs font-mono truncate font-medium text-foreground">
                        {m.name}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAdd(m.id)}
                      disabled={isPending}
                      className="p-1.5 bg-muted hover:bg-foreground hover:text-background text-foreground border border-border rounded-lg transition-all cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                ))}
                {availableMonitors.length === 0 && (
                  <p className="text-xs text-muted-foreground italic py-2">
                    All monitors are currently assigned.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-6">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Uptime Card */}
              <div className="lg:col-span-1">
                <UptimePercentageCard
                  current={uptimeData.current}
                  previous={uptimeData.previous}
                  trend={uptimeData.trend}
                  difference={uptimeData.difference}
                  period={historyDays}
                />
              </div>

              {/* Maintenance Timeline */}
              <div className="lg:col-span-2">
                <MaintenanceTimeline maintenanceWindows={maintenance} />
              </div>

              {/* Incident History */}
              <div className="lg:col-span-3">
                <IncidentHistoryTab
                  incidents={incidents}
                  uptimeData={uptimeData}
                  historyDays={historyDays}
                  onHistoryDaysChange={handleHistoryDaysChange}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "widget" && (
        <WidgetConfigurator
          pageId={page.id}
          pageSlug={page.slug}
          initialConfig={{
            widgetEnabled: page.widgetEnabled || false,
            widgetAllowedDomains: page.widgetAllowedDomains || null,
            widgetBadgeText: page.widgetBadgeText || null,
            widgetTheme: page.widgetTheme || null,
          }}
        />
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          <StatusPageLoopCard
            pageId={page.id}
            pageSlug={page.slug}
            onNavigateToShowcase={() => setActiveTab("showcase")}
          />
          <StatsCards pageId={page.id} />
          <div className="border border-border bg-card rounded-2xl p-6 shadow-xs">
            <h3 className="text-base font-serif font-medium text-foreground mb-6">
              Traffic Overview (Last 30 Days)
            </h3>
            <TrafficChart pageId={page.id} />
          </div>
        </div>
      )}

      {activeTab === "overrides" && <OverridesTab page={page} />}

      {activeTab === "settings" && <StatusPageSettings page={page} />}

      {activeTab === "showcase" && (
        <ShowcaseSubmitPanel
          pageSlug={page.slug}
          referralCode={page.user?.referralCode?.code}
          defaultOptedIn={page.user?.privacy?.showOnLeaderboard ?? false}
          defaultBio={page.user?.privacy?.leaderboardBio ?? ""}
        />
      )}
    </div>
  );
}
