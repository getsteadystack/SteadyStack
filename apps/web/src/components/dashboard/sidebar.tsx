"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getLicenseTelemetry } from "@/actions/user";
import {
  Activity,
  LayoutDashboard,
  Monitor,
  Bell,
  Settings,
  TriangleAlert,
  Blocks,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Award,
  FileCheck2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Monitors", href: "/dashboard/monitors", icon: Monitor },
  { name: "Templates", href: "/dashboard/templates", icon: Layers },
  { name: "SLA Reports", href: "/dashboard/reports", icon: FileCheck2 },
  { name: "Integrations", href: "/dashboard/integrations", icon: Blocks },
  { name: "Incidents", href: "/dashboard/incidents", icon: TriangleAlert },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [telemetry, setTelemetry] = useState<{
    tier: string;
    isAdmin?: boolean;
    isLifetime?: boolean;
    appsumoTier?: number | null;
    edgeNodes: string;
    vpcProbeCount: number;
    maxVpcProbes: number;
    pingInterval: string;
    regions: string;
  } | null>(null);

  // Restore collapse preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("steadystack_main_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("steadystack_main_sidebar_collapsed", String(next));
      return next;
    });
  };

  useEffect(() => {
    getLicenseTelemetry().then(setTelemetry).catch(console.error);
  }, []);

  const currentTier = telemetry?.tier || "INITIATE";
  const displayTier =
    currentTier === "INITIATE"
      ? "FREE"
      : currentTier === "NETRUNNER"
        ? "AGENCY"
        : currentTier === "CONSTRUCT"
          ? "AGENCY_PRO"
          : currentTier;

  // Tier color styling
  const tierColorClass =
    currentTier === "ADMIN"
      ? "text-amber-400 bg-amber-500/20 border-amber-500/40 shadow-sm"
      : telemetry?.isLifetime
        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-sm"
        : currentTier === "INITIATE"
          ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
          : "text-primary bg-primary/10 border-primary/20";

  const insertIdx = navigation.findIndex((n) => n.href === "/dashboard/incidents");
  const navItems = telemetry?.isAdmin
    ? [
        ...navigation.slice(0, insertIdx === -1 ? navigation.length : insertIdx + 1),
        {
          name: "Design Partners",
          href: "/dashboard/design-partners",
          icon: Award,
        },
        ...navigation.slice(insertIdx === -1 ? navigation.length : insertIdx + 1),
      ]
    : navigation;

  return (
    <aside
      className={cn(
        "hidden md:flex shrink-0 border-r border-border bg-sidebar/80 backdrop-blur-xl flex-col justify-between p-4 h-full relative overflow-hidden font-sans transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex flex-col gap-6 relative z-10 px-1 py-1 flex-1 min-h-0 overflow-y-auto">
        {/* Logo/Brand & Toggle Button */}
        <div
          className={cn(
            "flex items-center relative transition-all duration-300",
            isCollapsed ? "justify-center flex-col gap-3" : "justify-between",
          )}
        >
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center size-9 rounded-xl overflow-hidden bg-[#181715] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="SteadyStack" className="size-9 object-contain" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-serif text-base font-semibold tracking-tight text-foreground">
                    SteadyStack
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-[#ffd439]/30 text-amber-500 px-1 rounded border border-[#ffd439]/40">
                    2.0
                  </span>
                </div>
                <span className="font-mono text-[9px] text-muted-foreground tracking-wider uppercase">
                  Edge Monitoring
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={toggleCollapse}
            className={cn(
              "text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-muted rounded-lg cursor-pointer",
              isCollapsed && "mt-1",
            )}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href as any}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-xs tracking-wide transition-all duration-200 rounded-xl group cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted font-medium",
                  isCollapsed ? "justify-center px-0 py-2.5" : "",
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Telemetry License Card */}
      <div
        className={cn(
          "relative z-10 p-3.5 border border-border bg-card flex flex-col gap-3 shadow-xs rounded-2xl transition-all duration-300",
          isCollapsed ? "items-center text-center p-2 rounded-xl" : "",
        )}
      >
        {!isCollapsed ? (
          <>
            <div className="flex flex-col gap-2 font-mono">
              <div className="flex items-center justify-between border-b border-border/70 pb-2">
                <span className="text-[10px] text-muted-foreground tracking-wider uppercase font-semibold">
                  Plan Tier
                </span>
                <div className="flex items-center gap-1.5">
                  {telemetry?.isAdmin && (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20">
                      ADMIN
                    </span>
                  )}
                  {telemetry?.isLifetime && (
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#ffd439]/25 text-[#23211a] border border-[#ffd439]">
                      {telemetry.appsumoTier ? `LTD T${telemetry.appsumoTier}` : "LIFETIME"}
                    </span>
                  )}
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border">
                    {displayTier}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground uppercase">Edge Quorum</span>
                <span className="text-foreground font-semibold">
                  {telemetry ? telemetry.edgeNodes : "3 Nodes (2-of-3)"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground uppercase">Check Interval</span>
                <span className="text-foreground font-semibold">
                  {telemetry ? telemetry.pingInterval : "60s Fast"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground uppercase">Regions</span>
                <span className="text-foreground font-semibold">
                  {telemetry ? telemetry.regions : "3 Regions"}
                </span>
              </div>
              {telemetry?.isLifetime && (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground uppercase">License</span>
                  <span className="text-emerald-700 font-semibold font-mono">Active Lifetime</span>
                </div>
              )}
              {telemetry && telemetry.maxVpcProbes > 0 && (
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground uppercase">VPC Probes</span>
                  <span className="text-foreground font-semibold">
                    {telemetry.vpcProbeCount} / {telemetry.maxVpcProbes} Active
                  </span>
                </div>
              )}
            </div>

            {currentTier === "INITIATE" && !telemetry?.isLifetime && (
              <div className="text-[11px] text-muted-foreground leading-relaxed border-l-2 border-[#ffd439] pl-2.5 py-0.5">
                Upgrade to Agency for 10 clients, white-label portals & SLA reports.
              </div>
            )}

            {telemetry?.isLifetime ? (
              currentTier === "CONSTRUCT" || telemetry.appsumoTier === 3 ? (
                <div className="w-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold uppercase tracking-wider py-2 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200">
                  <span>✓ Lifetime Unlocked</span>
                </div>
              ) : (
                <Link
                  href={"/dashboard/settings?tab=billing" as any}
                  className="w-full bg-[#ffd439] hover:bg-[#f5cb2f] text-[#23211a] text-xs font-semibold tracking-wide transition-all duration-200 py-2.5 flex items-center justify-center gap-1.5 cursor-pointer rounded-xl border border-[#e5bd27] shadow-xs"
                >
                  <span>Stack Lifetime Tier →</span>
                </Link>
              )
            ) : (
              currentTier !== "CONSTRUCT" && (
                <Link
                  href={"/dashboard/settings?tab=billing" as any}
                  className="w-full bg-primary hover:bg-[#373428] text-primary-foreground text-xs font-semibold tracking-wide transition-all duration-200 py-2.5 flex items-center justify-center gap-1.5 cursor-pointer rounded-xl shadow-xs"
                >
                  <span>Upgrade Plan →</span>
                </Link>
              )
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              {telemetry?.isAdmin && (
                <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/20">
                  ADM
                </span>
              )}
              <span
                className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-foreground border border-border"
                title={`License Tier: ${displayTier}${telemetry?.isAdmin ? " (Admin)" : ""}`}
              >
                {displayTier.slice(0, 4)}
              </span>
            </div>
            <Link
              href="/dashboard/settings?tab=billing"
              title="Upgrade License"
              className="p-2.5 bg-primary text-primary-foreground hover:bg-[#373428] transition-all duration-200 rounded-xl"
            >
              <Zap className="size-3.5" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
