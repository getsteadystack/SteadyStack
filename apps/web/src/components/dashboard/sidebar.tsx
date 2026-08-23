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
  Globe,
  Blocks,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Award,
  FileCheck2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Monitors", href: "/dashboard/monitors", icon: Monitor },
  { name: "Templates", href: "/dashboard/templates", icon: Layers },
  { name: "Status Pages", href: "/dashboard/pages", icon: Globe },
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
  const displayTier = currentTier === "INITIATE" ? "FREE_DEV" : currentTier;

  // Tier color styling
  const tierColorClass =
    currentTier === "ADMIN"
      ? "text-amber-400 bg-amber-500/20 border-amber-500/40 shadow-sm"
      : telemetry?.isLifetime
        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-sm"
        : currentTier === "INITIATE"
          ? "text-amber-500 bg-amber-500/10 border-amber-500/20"
          : "text-primary bg-primary/10 border-primary/20";

  return (
    <aside
      className={cn(
        "hidden md:flex shrink-0 border-r border-border bg-background/40 backdrop-blur-xl flex-col justify-between p-4 h-full relative overflow-hidden font-sans transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex flex-col gap-6 relative z-10 px-1 py-2">
        {/* Logo/Brand & Toggle Button */}
        <div
          className={cn(
            "flex items-center relative transition-all duration-300",
            isCollapsed ? "justify-center flex-col gap-3" : "justify-between",
          )}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center size-10 rounded-lg bg-primary/10 border border-primary/20 text-primary overflow-hidden group shrink-0">
              <div className="absolute inset-0 bg-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
              </span>
              <Activity className="size-5" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-mono text-sm font-bold tracking-wider text-foreground">
                  STEADYSTACK
                </span>
                <span className="font-mono text-[9px] text-muted-foreground tracking-widest uppercase">
                  ZERO_FP_MESH
                </span>
              </div>
            )}
          </div>

          <button
            onClick={toggleCollapse}
            className={cn(
              "text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-muted/50 rounded-md cursor-pointer",
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
          {(telemetry?.isAdmin
            ? [
                ...navigation.slice(0, 7),
                {
                  name: "Design Partners",
                  href: "/dashboard/design-partners",
                  icon: Award,
                },
                ...navigation.slice(7),
              ]
            : navigation
          ).map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href as any}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-xs font-mono tracking-wider transition-all duration-200 border rounded-none group cursor-pointer",
                  isActive
                    ? "border-primary/40 bg-primary/10 text-primary font-bold shadow-sm"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border/60",
                  isCollapsed ? "justify-center px-0" : "",
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                {!isCollapsed && (
                  <>
                    <span className="transition-transform duration-300 group-hover:translate-x-0.5 truncate">
                      {item.name}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Telemetry License Card */}
      <div
        className={cn(
          "relative z-10 p-3 border border-border/80 bg-card/10 backdrop-blur-md flex flex-col gap-3 shadow-md rounded-none transition-all duration-300",
          isCollapsed ? "items-center text-center p-2" : "",
        )}
      >
        {!isCollapsed ? (
          <>
            <div className="flex flex-col gap-2 font-mono">
              <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                <span className="text-[9px] text-muted-foreground tracking-wider uppercase">
                  LICENSE TIER
                </span>
                <div className="flex items-center gap-1.5">
                  {telemetry?.isAdmin && (
                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      ADMIN
                    </span>
                  )}
                  {telemetry?.isLifetime && (
                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      {telemetry.appsumoTier ? `LTD T${telemetry.appsumoTier}` : "LIFETIME"}
                    </span>
                  )}
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 border ${tierColorClass}`}>
                    {displayTier}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-muted-foreground tracking-wider uppercase">EDGE NODES</span>
                <span className="text-foreground font-semibold">
                  {telemetry ? telemetry.edgeNodes : "3 Nodes (2-of-3)"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-muted-foreground tracking-wider uppercase">
                  CHECK INTERVAL
                </span>
                <span className="text-foreground font-semibold">
                  {telemetry ? telemetry.pingInterval : "3m / 1m Fast"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-muted-foreground tracking-wider uppercase">REGIONS</span>
                <span className="text-foreground font-semibold">
                  {telemetry ? telemetry.regions : "3 Primary Regions"}
                </span>
              </div>
              {telemetry?.isLifetime && (
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-muted-foreground tracking-wider uppercase">TYPE</span>
                  <span className="text-emerald-400 font-semibold font-mono">
                    LIFETIME (NO RENEWAL)
                  </span>
                </div>
              )}
              {telemetry && telemetry.maxVpcProbes > 0 && (
                <div className="flex items-center justify-between text-[9px]">
                  <span className="text-muted-foreground tracking-wider uppercase">VPC AGENTS</span>
                  <span className="text-foreground font-semibold">
                    {telemetry.vpcProbeCount} / {telemetry.maxVpcProbes} Active
                  </span>
                </div>
              )}
            </div>

            {currentTier === "INITIATE" && !telemetry?.isLifetime && (
              <div className="text-[10px] text-muted-foreground leading-relaxed border-l border-amber-500/50 pl-2 py-0.5">
                Upgrade to Pro for 7-region quorum & 30s checks.
              </div>
            )}

            {telemetry?.isLifetime ? (
              currentTier === "CONSTRUCT" || telemetry.appsumoTier === 3 ? (
                <div className="w-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider py-2 flex items-center justify-center gap-1.5 border border-emerald-500/30">
                  <span>✓ LIFETIME_ACTIVE</span>
                </div>
              ) : (
                <Link
                  href={"/dashboard/settings?tab=billing" as any}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider transition-all duration-300 py-2 flex items-center justify-center gap-1.5 cursor-pointer rounded-none border border-emerald-400 shadow-sm"
                >
                  <span>&gt; STACK_TIER</span>
                </Link>
              )
            ) : (
              currentTier !== "CONSTRUCT" && (
                <Link
                  href={"/dashboard/settings?tab=billing" as any}
                  className="w-full bg-foreground text-background text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all duration-300 py-2.5 flex items-center justify-center gap-1.5 cursor-pointer rounded-none border border-foreground/10"
                >
                  <span>&gt; UPGRADE_LICENSE</span>
                </Link>
              )
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              {telemetry?.isAdmin && (
                <span className="text-[7px] font-bold px-1 py-0.2 bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  ADM
                </span>
              )}
              <span
                className={`text-[8px] font-bold px-1 py-0.5 border ${tierColorClass}`}
                title={`License Tier: ${displayTier}${telemetry?.isAdmin ? " (Admin)" : ""}`}
              >
                {displayTier.slice(0, 4)}
              </span>
            </div>
            <Link
              href="/dashboard/settings?tab=billing"
              title="Upgrade License"
              className="p-2 bg-foreground text-background hover:bg-primary hover:text-white transition-all duration-300 rounded-none"
            >
              <Zap className="size-3.5" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
