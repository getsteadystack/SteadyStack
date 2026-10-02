"use client";

import {
  Search,
  LogOut,
  User,
  Settings,
  Menu,
  Terminal,
  ChevronRight,
  Command,
  Users,
} from "lucide-react";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
import { useHaptic } from "@/hooks/use-haptic";
import { useTerminalStore } from "@/hooks/use-terminal-store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  onMenuClick?: () => void;
  userTier?: string;
}

export function DashboardHeader({ onMenuClick, userTier }: DashboardHeaderProps = {}) {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { trigger } = useHaptic();
  const { isTerminalMode, toggleTerminalMode } = useTerminalStore();
  const [avatarError, setAvatarError] = useState(false);

  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    if (paths.length === 0) {
      return [{ label: "Dashboard", url: "/dashboard", isLast: true }];
    }

    const mapSegment = (segment: string) => {
      if (segment === "dashboard") return "Dashboard";
      if (segment === "monitors") return "Monitors";
      if (segment === "pages") return "Status Pages";
      if (segment === "incidents") return "Incidents";
      if (segment === "alerts") return "Alert Channels";
      if (segment === "settings") return "Settings";
      if (segment === "new") return "New";
      if (segment === "edit") return "Edit";

      if (segment.length > 15) return `${segment.slice(0, 8)}...`;
      return segment.charAt(0).toUpperCase() + segment.slice(1).replaceAll("-", " ");
    };

    return paths.map((segment, index) => {
      const url = `/${paths.slice(0, index + 1).join("/")}`;
      const isLast = index === paths.length - 1;
      const label = mapSegment(segment);

      return { label, url, isLast };
    });
  };

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "OP";

  const resolvedTier =
    userTier ||
    (session?.user as any)?.tier ||
    (session?.user as any)?.plan ||
    (session?.user as any)?.subscription?.plan ||
    (session?.user as any)?.role ||
    (session?.user?.name?.toLowerCase().includes("admin") ? "ADMIN" : "INITIATE");

  const rawTier = String(resolvedTier).toUpperCase();
  const displayTier =
    rawTier === "INITIATE"
      ? "FREE"
      : rawTier === "NETRUNNER"
        ? "AGENCY"
        : rawTier === "CONSTRUCT"
          ? "AGENCY PRO"
          : rawTier;

  return (
    <header className="sticky top-0 z-30 flex h-16 min-h-[64px] items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 md:px-8 overflow-hidden transition-all shadow-xs">
      <div className="flex items-center gap-3 md:gap-4 relative z-20 min-w-0 flex-1 md:flex-none">
        {/* Hamburger Menu - Mobile Only */}
        {onMenuClick && (
          <button
            onClick={() => {
              trigger("light");
              onMenuClick();
            }}
            className="md:hidden flex items-center justify-center size-9 rounded-xl border border-border bg-card hover:bg-muted transition-all shrink-0 active:scale-95 cursor-pointer shadow-xs"
            aria-label="Open navigation menu"
          >
            <Menu className="size-4 text-foreground" />
          </button>
        )}

        {/* Workspace Switcher */}
        <WorkspaceSwitcher />

        <div className="hidden sm:block h-5 w-[1px] bg-border/60 shrink-0" />

        {/* Breadcrumbs Navigation */}
        <div className="hidden sm:flex items-center gap-3 min-w-0">
          <nav className="flex items-center gap-1.5 text-xs select-none min-w-0">
            {getBreadcrumbs().map((crumb, index) => (
              <div key={crumb.url} className="flex items-center gap-1.5 min-w-0">
                {index > 0 && <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />}
                {crumb.isLast ? (
                  <span className="text-foreground font-serif font-semibold tracking-tight text-sm truncate max-w-[120px] sm:max-w-[180px] md:max-w-[240px]">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.url as any}
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium text-xs shrink-0"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-2.5 md:gap-3.5 relative z-20 shrink-0">
        {/* Global Command Palette Search */}
        <button
          onClick={() => {
            const event = new KeyboardEvent("keydown", {
              key: "k",
              metaKey: true,
              ctrlKey: true,
            });
            document.dispatchEvent(event);
          }}
          className="relative flex items-center justify-center size-9 md:h-9 md:w-56 lg:w-64 md:justify-start gap-2 bg-card hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl border border-border hover:border-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all duration-200 cursor-pointer active:scale-95 shrink-0 px-0 md:px-3 group shadow-xs"
          aria-label="Search"
          id="global-search-trigger"
        >
          <Search className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          <span className="hidden md:inline flex-1 text-left text-xs font-medium font-sans">
            Search metrics, nodes...
          </span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold bg-muted border border-border text-foreground rounded-md font-mono">
            <Command className="size-2.5" />
            <span>K</span>
          </kbd>
        </button>

        {/* Terminal Toggle Button */}
        <button
          onClick={() => {
            trigger("medium");
            toggleTerminalMode();
          }}
          className={`flex items-center justify-center size-9 rounded-xl border transition-all duration-200 cursor-pointer active:scale-95 shrink-0 shadow-xs ${
            isTerminalMode
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          title="Toggle Terminal-Only Mode"
          aria-label="Toggle Terminal-Only Mode"
          id="terminal-mode-toggle"
        >
          <Terminal className="size-3.5" />
        </button>

        {/* Theme Toggle */}
        <div className="hidden sm:block text-muted-foreground hover:text-foreground">
          <ModeToggle />
        </div>

        {/* User Dropdown Menu */}
        <div className="flex items-center gap-3 border-l border-border/80 pl-3 md:pl-4 h-8 shrink-0 ml-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              id="user-menu-trigger"
              className="flex items-center gap-2.5 outline-none group cursor-pointer"
            >
              {/* Desktop User Info */}
              <div className="text-right hidden lg:block">
                <p className="text-xs text-foreground font-semibold leading-tight group-hover:text-primary transition-colors">
                  {session?.user?.name || "Operator"}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {session?.user?.email || "admin@steadystack.dev"}
                </p>
              </div>

              {/* Avatar with Status Dot */}
              <div className="relative size-8.5 rounded-full border border-border bg-muted text-foreground group-hover:scale-105 active:scale-95 transition-all shrink-0 flex items-center justify-center shadow-xs overflow-hidden">
                {session?.user?.image && !avatarError ? (
                  <Image
                    className="object-cover transition-opacity duration-300"
                    alt="User profile"
                    src={session.user.image}
                    fill
                    sizes="34px"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <span className="text-[11px] font-bold font-mono tracking-wider">{initials}</span>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-card border border-border text-foreground rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] animate-in fade-in-50 zoom-in-95 duration-100"
            >
              <DropdownMenuGroup>
                <div className="px-2.5 py-2 border-b border-border/60 mb-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                      Account Tier
                    </span>
                    <span
                      className={cn(
                        "text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-wider uppercase",
                        displayTier === "ADMIN" &&
                          "border-amber-500/30 bg-amber-500/10 text-amber-400",
                        displayTier === "CONSTRUCT" &&
                          "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
                        displayTier !== "ADMIN" &&
                          displayTier !== "CONSTRUCT" &&
                          "border-primary/30 bg-primary/10 text-primary",
                      )}
                    >
                      {displayTier}
                    </span>
                  </div>
                  <p className="text-xs font-bold truncate text-foreground">
                    {session?.user?.name || "Operator"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate font-mono">
                    {session?.user?.email || "admin@steadystack.dev"}
                  </p>
                </div>

                <DropdownMenuItem
                  className="text-xs font-semibold focus:bg-accent focus:text-foreground cursor-pointer rounded-lg px-2.5 py-2 transition-colors gap-2"
                  onClick={() => router.push("/dashboard/settings?tab=general")}
                >
                  <User className="size-3.5 text-muted-foreground" />
                  <span>Profile & Security</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs font-semibold focus:bg-accent focus:text-foreground cursor-pointer rounded-lg px-2.5 py-2 transition-colors gap-2"
                  onClick={() => router.push("/dashboard/settings?tab=team")}
                >
                  <Users className="size-3.5 text-muted-foreground" />
                  <span>Team & RBAC</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs font-semibold focus:bg-accent focus:text-foreground cursor-pointer rounded-lg px-2.5 py-2 transition-colors gap-2"
                  onClick={() => router.push("/dashboard/settings")}
                >
                  <Settings className="size-3.5 text-muted-foreground" />
                  <span>Settings & Billing</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-border/60 my-1" />
              <DropdownMenuItem
                className="text-xs font-semibold text-red-500 focus:bg-red-500/10 focus:text-red-500 cursor-pointer rounded-lg px-2.5 py-2 transition-colors gap-2"
                onClick={async () => {
                  await authClient.signOut();
                  window.location.href = "/login";
                }}
              >
                <LogOut className="size-3.5" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
