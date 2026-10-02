"use client";
// aria-label placeholder

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Globe, Zap, Shield, Activity, Clock, Server, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const REGIONS = [
  {
    id: "enam",
    name: "North America East (Ashburn)",
    code: "IAD",
    base: 14,
    variance: 3,
  },
  {
    id: "wnam",
    name: "North America West (San Jose)",
    code: "SJC",
    base: 22,
    variance: 4,
  },
  {
    id: "weur",
    name: "Western Europe (London)",
    code: "LHR",
    base: 38,
    variance: 4,
  },
  {
    id: "eeur",
    name: "Eastern Europe (Warsaw)",
    code: "WAW",
    base: 45,
    variance: 5,
  },
  {
    id: "apac-ne",
    name: "Asia-Pacific Northeast (Tokyo)",
    code: "NRT",
    base: 88,
    variance: 8,
  },
  {
    id: "apac-se",
    name: "Asia-Pacific Southeast (Singapore)",
    code: "SIN",
    base: 74,
    variance: 6,
  },
  {
    id: "apac",
    name: "Asia-Pacific Central (Hong Kong)",
    code: "HKG",
    base: 95,
    variance: 8,
  },
];

export function LatencyGridClient() {
  const [targetUrl, setTargetUrl] = useState("api.your-app.com");
  const [inputUrl, setInputUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [latencies, setLatencies] = useState<Record<string, number>>({});

  // Initialize latencies
  useEffect(() => {
    const initial: Record<string, number> = {};
    REGIONS.forEach((r) => {
      initial[r.id] = r.base + Math.floor(Math.random() * r.variance);
    });
    setLatencies(initial);
  }, []);

  // Background fluctuation
  useEffect(() => {
    if (isScanning) return;
    const interval = setInterval(() => {
      setLatencies((prev) => {
        const next = { ...prev };
        REGIONS.forEach((r) => {
          if (next[r.id]) {
            const diff = Math.floor(Math.random() * 5) - 2;
            next[r.id] = Math.max(r.base - 5, prev[r.id] + diff);
          }
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl || isScanning) return;

    setIsScanning(true);
    let clean = inputUrl.trim().replace(/^https?:\/\//i, "");
    if (clean.length > 28) clean = clean.substring(0, 26) + "...";

    // Simulate scanning
    let steps = 0;
    const scanInt = setInterval(() => {
      setLatencies((prev) => {
        const next = { ...prev };
        REGIONS.forEach((r) => {
          next[r.id] = Math.floor(Math.random() * 200) + 10;
        });
        return next;
      });
      steps++;
      if (steps > 8) {
        clearInterval(scanInt);
        setTargetUrl(clean);
        const final: Record<string, number> = {};
        REGIONS.forEach((r) => {
          final[r.id] = r.base - 2 + Math.floor(Math.random() * r.variance);
        });
        setLatencies(final);
        setIsScanning(false);
      }
    }, 200);
  };

  return (
    <div className="space-y-16">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-border/20 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Back to Overview
        </Link>
        <span className="text-[10px] font-bold font-mono text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
          <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          Operational Status
        </span>
      </div>

      {/* Hero section inside page */}
      <div className="max-w-3xl space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground uppercase italic">
          Live Latency Grid
        </h1>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
          High-frequency checking from global edge centers. Measure server responsiveness, regional
          load times, and payload delivery sizes with millisecond precision.
        </p>
      </div>

      {/* Interactive Mockup Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Radar Display */}
        <div className="lg:col-span-7 border border-primary/20 bg-card/90 dark:bg-card/40 backdrop-blur-md p-6 rounded-none space-y-6">
          <div className="flex items-center justify-between border-b border-primary/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                <Globe className="size-4 text-emerald-500 animate-pulse" />
                Global Surveillance Radar
              </div>
              <h2 className="text-lg font-bold text-foreground mt-1 font-mono">{targetUrl}</h2>
            </div>
            <Badge
              variant="outline"
              className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 font-mono uppercase text-[9px] tracking-widest animate-pulse"
            >
              {isScanning ? "Probing..." : "Active"}
            </Badge>
          </div>

          {/* Grid of regional nodes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {REGIONS.map((r) => (
              <div
                key={r.id}
                className="border border-primary/15 bg-background hover:bg-muted/30 dark:bg-background/25 p-4 flex flex-col justify-between min-h-[90px] group hover:border-emerald-500/40 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase font-mono">
                    {r.code}
                  </span>
                  <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-muted-foreground/90 truncate">
                    {r.name}
                  </div>
                  <div className="text-xl font-bold font-mono text-foreground mt-1 flex items-baseline gap-1">
                    {latencies[r.id] || "--"}
                    <span className="text-[9px] text-muted-foreground font-normal">ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Trigger Form */}
          <form onSubmit={handleTest} className="flex gap-4 pt-4 border-t border-primary/10">
            <div className="flex-1">
              <label htmlFor="feature-url" className="sr-only">
                Test Target URL
              </label>
              <input
                id="feature-url"
                type="text"
                placeholder="example.com"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                disabled={isScanning}
                className="w-full bg-background border border-primary/20 h-10 px-4 text-xs font-mono text-foreground placeholder:text-muted-foreground/70 focus:border-emerald-500/50 outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={isScanning || !inputUrl}
              className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold uppercase tracking-widest px-6 h-10 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              {isScanning ? "Probing..." : "Test Endpoint"}
            </button>
          </form>
        </div>

        {/* Feature breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-mono">
              Sentinel Attributes
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Continuous Monitoring Capabilities
            </h3>
          </div>

          <div className="space-y-6 pt-4">
            {/* Attribute 1 */}
            <div className="flex gap-4 items-start">
              <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/15 rounded-sm text-emerald-600 dark:text-emerald-400">
                <Activity className="size-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">High-Frequency Checks</h4>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Validate availability up to once every 10 seconds. Minimize detection delay and
                  intercept incidents before users notice them.
                </p>
              </div>
            </div>

            {/* Attribute 2 */}
            <div className="flex gap-4 items-start">
              <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/15 rounded-sm text-emerald-600 dark:text-emerald-400">
                <Clock className="size-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Millisecond Resolution</h4>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Track response variations down to single milliseconds. Establish performance
                  baselines and identify gradual network regressions.
                </p>
              </div>
            </div>

            {/* Attribute 3 */}
            <div className="flex gap-4 items-start">
              <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/15 rounded-sm text-emerald-600 dark:text-emerald-400">
                <Server className="size-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground">Response Dissection</h4>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  Inspect response payloads, return codes, and header structures. Confirm not just
                  connectivity, but transaction integrity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border border-border/20 bg-card/25 p-8 text-center space-y-6 max-w-xl mx-auto rounded-none">
        <h2 className="text-xl font-bold text-foreground uppercase italic tracking-wide">
          Ready for Global Surveillance?
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Start monitoring your endpoints from all 10 regions instantly. Setup takes less than 2
          minutes.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            Start Free Trial
          </Link>
          <Link
            href="/tools/global-latency"
            className="inline-flex items-center h-10 px-6 bg-transparent border border-border text-foreground hover:bg-accent text-xs font-semibold uppercase tracking-widest transition-colors"
          >
            Use Free Tool
          </Link>
        </div>
      </div>
    </div>
  );
}

// Simple Badge component
function Badge({
  children,
  className,
  variant,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {children}
    </span>
  );
}
