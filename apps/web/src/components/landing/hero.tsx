"use client";

import Link from "next/link";
import { ArrowRight, Activity, ShieldCheck, Zap, Server, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Hero() {
  const [inputUrl, setInputUrl] = useState("");
  const [displayUrl, setDisplayUrl] = useState("api.your-app.com/health");
  const [latencies, setLatencies] = useState({
    wnam: 18,
    enam: 24,
    weur: 42,
    apac: 88,
  });
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [activeNodes, setActiveNodes] = useState<number[]>(Array.from({ length: 30 }, (_, i) => i));

  // Simulate continuous background telemetry fluctuations
  useEffect(() => {
    if (isScanning) return;

    const interval = setInterval(() => {
      setLatencies({
        wnam: Math.floor(Math.random() * 8) + 14,
        enam: Math.floor(Math.random() * 10) + 20,
        weur: Math.floor(Math.random() * 15) + 38,
        apac: Math.floor(Math.random() * 18) + 82,
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isScanning]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl || isScanning) return;

    setIsScanning(true);
    setScanProgress(0);

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, 90);

    setActiveNodes([]);

    setTimeout(() => {
      let cleanUrl = inputUrl.trim().replace(/^https?:\/\//i, "");
      if (cleanUrl.length > 35) cleanUrl = cleanUrl.substring(0, 32) + "...";
      setDisplayUrl(cleanUrl);

      let count = 0;
      const nodeInterval = setInterval(() => {
        setActiveNodes((prev) => [...prev, count]);
        count++;
        if (count >= 30) {
          clearInterval(nodeInterval);
        }
      }, 25);

      setLatencies({
        wnam: Math.floor(Math.random() * 6) + 12,
        enam: Math.floor(Math.random() * 8) + 18,
        weur: Math.floor(Math.random() * 12) + 34,
        apac: Math.floor(Math.random() * 15) + 76,
      });
      setIsScanning(false);
    }, 1800);
  };

  return (
    <section className="relative pt-36 pb-20 overflow-hidden min-h-screen flex flex-col justify-center bg-background border-b border-border">
      {/* Sleek, soft radial backdrop glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-20 w-full text-center flex flex-col items-center">
        {/* Badge */}
        <div className="animate-[heroBadge_0.5s_ease-out] inline-flex items-center gap-2 mb-8 text-[11px] font-bold tracking-wider text-foreground bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full uppercase shadow-sm font-mono">
          <span className="relative flex size-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full size-1.5 bg-primary" />
          </span>
          <span>Free for commercial use · No credit card</span>
        </div>

        {/* H1 */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-8 text-balance text-foreground max-w-4xl">
          Know the second <br className="hidden sm:inline" />
          <span className="text-muted-foreground">your stack breaks.</span>
        </h1>

        {/* Subhead */}
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mb-8 text-balance font-sans">
          SteadyStack monitors your endpoints with multi-region edge consensus. 3 primary regions
          (2-of-3 quorum) on the free tier, and full 7-region 4-of-7 quorum on paid tiers — zero
          false positives, zero alert fatigue.
        </p>

        {/* Probe Input Form */}
        <form
          onSubmit={handleScan}
          className="relative w-full max-w-xl mb-8 bg-background/50 border border-border p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] rounded-xl flex items-center transition-all duration-300 hover:border-primary/30 focus-within:border-primary/40"
        >
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            disabled={isScanning}
            placeholder="https://api.your-app.com/health"
            aria-label="Endpoint URL to check"
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50 border-none outline-none px-3.5 text-sm min-w-0 font-mono"
          />
          <button
            type="submit"
            disabled={isScanning || !inputUrl}
            className="bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-semibold px-4.5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-40 font-mono uppercase tracking-wider cursor-pointer"
          >
            {isScanning ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                Verify Uptime
                <ArrowRight className="size-3.5" />
              </>
            )}
          </button>
        </form>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <Link
            href="/signup"
            className="flex items-center justify-center h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-lg transition-colors font-mono uppercase tracking-wider"
          >
            Start free — 50 monitors &rarr;
          </Link>
          <Link
            href="#how-it-works"
            className="flex items-center justify-center h-11 px-6 bg-transparent border border-border text-foreground hover:bg-accent text-xs font-semibold rounded-lg transition-colors font-mono uppercase tracking-wider"
          >
            See how verification works
          </Link>
        </div>

        {/* Trust Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-16 text-xs font-mono text-muted-foreground/90 border-y border-border/60 py-4 bg-muted/20 rounded-xl px-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-primary font-bold">✓</span> 1m fast checks (first 10) & 3m
            standard
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-primary font-bold">✓</span> 3-region 2-of-3 quorum on free
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-primary font-bold">✓</span> Commercial use permitted, in writing
          </div>
        </div>

        {/* Interactive Animated Dashboard Visualization */}
        <div className="w-full max-w-4xl border border-border bg-card/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden text-left relative">
          {/* Scan overlay loader bar */}
          {isScanning && (
            <div
              className="absolute top-0 left-0 h-1 bg-primary transition-all duration-100 shadow-sm"
              style={{ width: `${scanProgress}%` }}
            />
          )}

          {/* Window control header */}
          <div className="border-b border-border/80 px-4 py-3 flex items-center justify-between bg-muted/40 select-none">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-red-500/80" />
              <span className="size-2.5 rounded-full bg-yellow-500/80" />
              <span className="size-2.5 rounded-full bg-primary/80" />
            </div>
            <div className="text-[10px] font-bold text-muted-foreground tracking-widest font-mono uppercase flex items-center gap-1.5">
              <Server className="size-3 text-primary" />
              STEADYSTACK_CONSENSUS_TELEMETRY
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
              <span className="size-1.5 rounded-full bg-primary animate-ping" />
              200 OK (Quorum Verified · 2/3 Free · 4/7 Pro)
            </div>
          </div>

          {/* Content area */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Monitor Information Side */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="size-4 text-primary animate-pulse" />
                    <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                      Target Endpoint
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground bg-accent/40 px-2 py-0.5 rounded border border-border">
                    GET / 200 OK
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-foreground truncate max-w-full">
                  {displayUrl}
                </div>
              </div>

              {/* Animated Latency Wave Chart */}
              <div className="relative h-20 w-full overflow-hidden flex items-end">
                <svg
                  className="w-full h-full overflow-visible text-primary"
                  viewBox="0 0 300 60"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,45 Q 30,20 60,40 T 120,25 T 180,45 T 240,15 T 300,35 L 300,60 L 0,60 Z"
                    fill="url(#waveGradient)"
                  />
                  <motion.path
                    d="M 0,45 Q 30,20 60,40 T 120,25 T 180,45 T 240,15 T 300,35"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                </svg>
                <div className="absolute top-2 right-2 text-[9px] font-mono text-primary bg-primary/10 border border-primary/30 px-1.5 py-0.5 rounded">
                  Avg: {latencies.wnam}ms
                </div>
              </div>

              {/* 30-Day Operational Matrix */}
              <div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono font-bold mb-2">
                  <span>30-DAY OPERATIONAL MATRIX</span>
                  <span className="text-primary font-bold">100.0% UPTIME</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 30 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 h-6 rounded-sm transition-all duration-300 ${
                        activeNodes.includes(idx) ? "bg-primary shadow-xs" : "bg-muted/40"
                      }`}
                      style={{
                        opacity: activeNodes.includes(idx) ? 1 : 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Regional Latencies Side */}
            <div className="md:col-span-5 border-t md:border-t-0 md:border-l border-border/80 pt-6 md:pt-0 md:pl-6 flex flex-col justify-between font-mono">
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  <span>Sovereign Edge Probes</span>
                  <Zap className="size-3.5 text-amber-400" />
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* Region 1: US West */}
                  <div className="flex items-center justify-between p-2 rounded bg-card/40 border border-border">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="size-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-muted-foreground font-sans text-[11px]">
                        wnam (San Jose)
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary">{latencies.wnam}ms</span>
                  </div>

                  {/* Region 2: US East */}
                  <div className="flex items-center justify-between p-2 rounded bg-card/40 border border-border">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="size-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-muted-foreground font-sans text-[11px]">
                        enam (Ashburn)
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary">{latencies.enam}ms</span>
                  </div>

                  {/* Region 3: Western Europe */}
                  <div className="flex items-center justify-between p-2 rounded bg-card/40 border border-border">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="size-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-muted-foreground font-sans text-[11px]">
                        weur (London)
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary">{latencies.weur}ms</span>
                  </div>

                  {/* Region 4: Asia Pacific */}
                  <div className="flex items-center justify-between p-2 rounded bg-card/40 border border-border">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="size-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-muted-foreground font-sans text-[11px]">
                        apac-ne (Tokyo)
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary">{latencies.apac}ms</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3 text-primary" />
                  Cloudflare Edge DOs
                </span>
                <span className="text-primary font-mono font-bold">4-of-7 Quorum (Paid)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
