"use client";

import Link from "next/link";
import {
  Activity,
  LayoutDashboard,
  Monitor,
  Bell,
  Settings,
  TriangleAlert,
  X,
  Blocks,
  Users,
  Layers,
  FileCheck2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Drawer } from "@/components/ui/drawer";
import { useHaptic } from "@/hooks/use-haptic";

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

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Mobile sidebar drawer component
 * - Full-height drawer with navigation
 * - Warm editorial paper styling
 */
export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const { trigger } = useHaptic();

  const handleClose = () => {
    trigger("light");
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={handleClose} side="left">
      <div className="h-full flex flex-col justify-between p-4 bg-background border-r border-border relative overflow-hidden font-sans">
        <div className="flex flex-col gap-6 relative z-10 flex-1 min-h-0 overflow-y-auto">
          {/* Header with Logo and Close Button */}
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-9 rounded-xl bg-[#ffd439] text-[#23211a] font-bold shadow-xs">
                <Activity className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-base font-semibold tracking-tight text-foreground">
                  SteadyStack
                </span>
                <span className="font-mono text-[9px] text-muted-foreground tracking-wider uppercase">
                  Edge Monitoring
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="flex items-center justify-center size-9 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors active:scale-95 cursor-pointer"
              aria-label="Close navigation"
            >
              <X className="size-4 text-foreground" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href as any}
                  onClick={() => {
                    trigger("medium");
                    onClose();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs tracking-wide cursor-pointer",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted font-medium",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0",
                      isActive
                        ? "text-primary-foreground"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom CTA */}
        <div className="relative z-10 p-4 rounded-2xl border border-border bg-card flex flex-col gap-2.5 shadow-xs">
          <p className="text-xs text-foreground font-semibold tracking-wide font-serif">
            Upgrade your plan
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Unlock multi-region verification & SLA reports.
          </p>
          <Link
            href={"/dashboard/settings?tab=billing" as any}
            onClick={() => {
              trigger("success");
              onClose();
            }}
            className="w-full bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all py-2.5 flex items-center justify-center cursor-pointer shadow-xs"
          >
            Upgrade Now →
          </Link>
        </div>
      </div>
    </Drawer>
  );
}
