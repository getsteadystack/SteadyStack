"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  Shield,
  Key,
  Download,
  Eye,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { name: "General", icon: User, tab: "general" },
  { name: "Team & RBAC", icon: Users, tab: "team" },
  { name: "Billing", icon: CreditCard, tab: "billing" },
  // { name: "Affiliate & Referrals", icon: Users, tab: "referrals" },
  { name: "Security", icon: Shield, tab: "security" },
  { name: "API Keys", icon: Key, tab: "api-keys" },
  { name: "Audit Log", icon: History, tab: "audit-log" },
  { name: "Migration & Export", icon: Download, tab: "migration" },
  { name: "Privacy", icon: Eye, tab: "privacy" },
];

/**
 * Renders the settings sidebar with collapsible navigation links based on the current tab.
 */
export function SettingsSidebar() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab") || "general";
  const currentTab = rawTab.split("?")[0].split("&")[0];
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Restore saved collapse preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("steadystack_settings_sidebar_collapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("steadystack_settings_sidebar_collapsed", String(next));
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "w-full shrink-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "md:w-16" : "md:w-52",
      )}
    >
      <div className="flex flex-col gap-2">
        {/* Toggle Collapse Header */}
        <div
          className={cn(
            "hidden md:flex items-center pb-2 border-b border-border mb-1",
            isCollapsed ? "justify-center" : "justify-between px-2",
          )}
        >
          {!isCollapsed && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Settings Nav
            </span>
          )}
          <button
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
          {items.map((item) => {
            const isActive = currentTab === item.tab;
            return (
              <Link
                key={item.name}
                href={`/dashboard/settings?tab=${item.tab}`}
                title={isCollapsed ? item.name : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-medium shrink-0",
                  isCollapsed ? "md:justify-center md:px-2" : "",
                  isActive
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive ? "text-[#ffd439]" : "text-muted-foreground",
                  )}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
