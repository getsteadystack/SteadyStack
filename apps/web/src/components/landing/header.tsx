"use client";

import Link from "next/link";
import {
  Activity,
  ChevronDown,
  Globe,
  ShieldCheck,
  ArrowRight,
  Clock,
  Network,
  Sun,
  Moon,
  Monitor,
  Flame,
  Zap,
  Layers,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

function ThemeToggleButton() {
  const [mounted, setMounted] = useState(false);
  const themeContext = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="size-8 rounded-lg border border-border bg-background/50" />;
  }

  const theme = themeContext?.theme || "dark";
  const setTheme = themeContext?.setTheme || (() => {});

  const cycleTheme = () => {
    const themes = ["dark", "light", "matrix", "cyberpunk", "blade"];
    const currentIdx = themes.indexOf(theme || "dark");
    const nextIdx = (currentIdx + 1) % themes.length;
    setTheme(themes[nextIdx]);
  };

  return (
    <button
      onClick={cycleTheme}
      className="flex items-center justify-center size-8 rounded-lg border border-border bg-background/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-all cursor-pointer"
      title={`Theme: ${theme}. Click to switch.`}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Sun className="size-4" />
      ) : theme === "dark" ? (
        <Moon className="size-4" />
      ) : (
        <Monitor className="size-4 text-primary" />
      )}
    </button>
  );
}

export default function LandingHeader() {
  const { data: session } = authClient.useSession();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const productLinks = [
    {
      name: "Core Features",
      description: "Multi-region quorum consensus & zero false-positive alerts",
      href: "/#features",
      icon: <Zap className="size-4 text-primary" />,
    },
    {
      name: "Global Edge Mesh",
      description: "Explore sovereign edge probe locations and latency",
      href: "/locations",
      icon: <Globe className="size-4 text-primary" />,
    },
    {
      name: "Interactive Demo",
      description: "Live telemetry test sandbox with simulated regional blips",
      href: "/demo",
      icon: <Activity className="size-4 text-primary" />,
    },
    {
      name: "Use Cases",
      description: "Tailored architectures for APIs, SaaS, and infrastructure",
      href: "/use-cases",
      icon: <Layers className="size-4 text-primary" />,
    },
    {
      name: "30-Day Benchmark",
      description: "Independent telemetry study on false positive elimination",
      href: "/benchmarks/false-positives",
      icon: <BarChart3 className="size-4 text-primary" />,
    },
  ];

  const toolLinks = [
    {
      name: "Is It Down? Hub",
      description: "Real-time status tracking for 400+ cloud services",
      href: "/is-down",
      icon: <Activity className="size-4 text-primary" />,
    },
    {
      name: "Global Ping Latency",
      description: "Instant multi-region HTTP & ICMP response times",
      href: "/tools/global-latency",
      icon: <Globe className="size-4 text-primary" />,
    },
    {
      name: "DNS & SSL Sentinel",
      description: "Cryptographic certificate validation and DNS audit",
      href: "/tools/dns-sentinel",
      icon: <ShieldCheck className="size-4 text-primary" />,
    },
    {
      name: "IP Subnet Analyzer",
      description: "Inspect network ranges, CIDR blocks, and reverse DNS",
      href: "/tools/ip-subnet",
      icon: <Network className="size-4 text-primary" />,
    },
    {
      name: "Cron Heartbeat Watch",
      description: "Dead-man switches for background jobs and pipelines",
      href: "/tools/cron-sentinel",
      icon: <Clock className="size-4 text-primary" />,
    },
    {
      name: "Roast My Stack",
      description: "AI-driven architecture and resilience teardown",
      href: "/tools/roast-my-stack",
      icon: <Flame className="size-4 text-primary" />,
    },
  ];

  return (
    <header className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 w-full">
      <div className="flex items-center justify-between px-5 sm:px-6 h-14 bg-background/80 backdrop-blur-xl border border-border shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl w-full max-w-4xl transition-all duration-300">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-1.5 bg-primary/10 border border-primary/20 rounded-lg group-hover:border-primary/40 group-hover:bg-primary/15 transition-all duration-300">
            <Activity className="size-4 text-primary" />
          </div>
          <span className="font-bold text-foreground text-sm tracking-tight">SteadyStack</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 font-medium text-xs">
          {/* Product Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("product")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer focus:outline-none",
                activeDropdown === "product" && "text-foreground bg-accent/50",
              )}
            >
              Product
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-200 text-muted-foreground/70",
                  activeDropdown === "product" && "rotate-180 text-foreground",
                )}
              />
            </button>

            <AnimatePresence>
              {activeDropdown === "product" && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full left-0 pt-2 w-80 z-[100]"
                >
                  <div className="bg-popover/95 backdrop-blur-xl border border-border p-2 rounded-xl shadow-2xl grid grid-cols-1 gap-1">
                    {productLinks.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href as any}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors group/item"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="p-1.5 rounded-md bg-muted/60 border border-border shrink-0 mt-0.5 group-hover/item:border-primary/30">
                          {item.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-xs group-hover/item:text-primary transition-colors">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground leading-snug">
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tools Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("tools")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer focus:outline-none",
                activeDropdown === "tools" && "text-foreground bg-accent/50",
              )}
            >
              Tools
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-200 text-muted-foreground/70",
                  activeDropdown === "tools" && "rotate-180 text-foreground",
                )}
              />
            </button>

            <AnimatePresence>
              {activeDropdown === "tools" && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full left-0 pt-2 w-80 z-[100]"
                >
                  <div className="bg-popover/95 backdrop-blur-xl border border-border p-2 rounded-xl shadow-2xl grid grid-cols-1 gap-1">
                    {toolLinks.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href as any}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors group/item"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="p-1.5 rounded-md bg-muted/60 border border-border shrink-0 mt-0.5 group-hover/item:border-primary/30">
                          {item.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-xs group-hover/item:text-primary transition-colors">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground leading-snug">
                            {item.description}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pricing Direct Link */}
          <Link
            href={"/pricing" as any}
            className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            Pricing
          </Link>

          {/* Docs Direct Link */}
          <Link
            href={"/docs" as any}
            className="px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            Docs
          </Link>
        </nav>

        {/* Action Panel */}
        <div className="flex items-center gap-2.5">
          {/* Theme switcher */}
          <ThemeToggleButton />

          {session ? (
            <Link
              href="/dashboard"
              className="flex items-center justify-center h-8.5 px-3.5 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 transition-all duration-200"
            >
              Dashboard <ArrowRight className="ml-1.5 size-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="flex items-center justify-center h-8.5 px-3.5 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:hidden items-center justify-center size-8 rounded-lg border border-border bg-background/50 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-20 left-4 right-4 bg-popover/95 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-2xl z-50 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex flex-col gap-4 text-xs">
              <div className="font-mono text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-2">
                Product
              </div>
              <div className="grid grid-cols-1 gap-1">
                {productLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href as any}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent text-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              <div className="font-mono text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-2 pt-2 border-t border-border">
                Free Tools
              </div>
              <div className="grid grid-cols-1 gap-1">
                {toolLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href as any}
                    className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent text-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-border flex flex-col gap-1">
                <Link
                  href="/#pricing"
                  className="p-2 rounded-lg hover:bg-accent text-foreground font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href={"/docs" as any}
                  className="p-2 rounded-lg hover:bg-accent text-foreground font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Documentation
                </Link>
                {!session && (
                  <Link
                    href="/login"
                    className="p-2 rounded-lg hover:bg-accent text-foreground font-semibold"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
