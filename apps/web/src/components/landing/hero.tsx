"use client";

import Link from "next/link";
import { Activity, ChevronRight, FileText, Globe, Play, RefreshCw, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ThreeEdgeGlobe } from "./three-edge-globe";

type RegionCheck = {
  id: string;
  name: string;
  flag: string;
  latency: number;
  status: "verified" | "checking" | "fluke_suppressed";
  httpCode: number;
};

const INITIAL_NODES: RegionCheck[] = [
  {
    id: "sjc",
    name: "San Jose (US West)",
    flag: "🇺🇸",
    latency: 14,
    status: "verified",
    httpCode: 200,
  },
  {
    id: "iad",
    name: "Ashburn (US East)",
    flag: "🇺🇸",
    latency: 19,
    status: "verified",
    httpCode: 200,
  },
  {
    id: "lhr",
    name: "London (EU West)",
    flag: "🇬🇧",
    latency: 34,
    status: "verified",
    httpCode: 200,
  },
  {
    id: "fra",
    name: "Frankfurt (EU Central)",
    flag: "🇩🇪",
    latency: 38,
    status: "verified",
    httpCode: 200,
  },
  {
    id: "nrt",
    name: "Tokyo (Asia East)",
    flag: "🇯🇵",
    latency: 82,
    status: "verified",
    httpCode: 200,
  },
  {
    id: "sin",
    name: "Singapore (Asia SE)",
    flag: "🇸🇬",
    latency: 94,
    status: "verified",
    httpCode: 200,
  },
];

const PRESETS = [
  {
    label: "Client Ecommerce Store",
    target: "checkout.clientstore.com/api/cart",
    desc: "Monitors storefront & checkout across 7 regions every 30s",
  },
  {
    label: "Client B2B SaaS App",
    target: "api.clientgrowth.io/v1/health",
    desc: "Validates JSON payloads & 99.99% SLA uptime requirements",
  },
  {
    label: "Branded Status Portal",
    target: "status.acmeproducts.com",
    desc: "White-label status page on client CNAME domain with monthly PDF",
  },
  {
    label: "Agency Cron Sentinel",
    target: "worker.clientpipeline.net/heartbeat",
    desc: "Dead-man switch for client background sync pipelines",
  },
];

export default function Hero() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [viewMode, setViewMode] = useState<"3d-globe" | "terminal">("3d-globe");
  const [nodes, setNodes] = useState<RegionCheck[]>(INITIAL_NODES);
  const [isSimulating, setIsSimulating] = useState(false);
  const [flukeMode, setFlukeMode] = useState(false);
  const [logMessages, setLogMessages] = useState<string[]>([
    "✓ Target configured: checkout.clientstore.com/api/cart",
    "✓ Discovered SSL cert: Let's Encrypt (valid for 84 days)",
    "✓ 7 global edge probes active · 0 false alarms waking agency team",
  ]);

  // Jitter effect
  useEffect(() => {
    if (isSimulating) return;
    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((n) => {
          const jitter = Math.floor(Math.random() * 5) - 2;
          const base =
            n.id === "sjc"
              ? 14
              : n.id === "iad"
                ? 19
                : n.id === "lhr"
                  ? 34
                  : n.id === "fra"
                    ? 38
                    : n.id === "nrt"
                      ? 82
                      : 94;
          return { ...n, latency: Math.max(8, base + jitter) };
        }),
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  const runTest = (presetIndex: number) => {
    setSelectedPreset(presetIndex);
    setIsSimulating(true);
    setFlukeMode(false);
    setNodes((prev) => prev.map((n) => ({ ...n, status: "checking" })));
    setLogMessages([
      `⚡ Dispatching test to 7 edge nodes for: ${PRESETS[presetIndex].target}`,
      "⏳ Awaiting quorum consensus confirmation...",
    ]);

    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          status: "verified",
          latency:
            Math.floor(Math.random() * 10) + (n.id === "sjc" ? 12 : n.id === "iad" ? 18 : 32),
          httpCode: 200,
        })),
      );
      setLogMessages([
        `✓ ${PRESETS[presetIndex].target} verified healthy`,
        "✓ Quorum 6-of-6 reached in 28ms mean round-trip",
        "✓ Consensus confirmed: 100% operational uptime",
      ]);
      setIsSimulating(false);
    }, 1100);
  };

  const simulateFluke = () => {
    setIsSimulating(true);
    setFlukeMode(true);
    setNodes((prev) =>
      prev.map((n) =>
        n.id === "lhr"
          ? { ...n, status: "fluke_suppressed", latency: 999, httpCode: 504 }
          : { ...n, status: "verified", httpCode: 200 },
      ),
    );
    setLogMessages([
      "⚠️ London probe timed out (packet drop detected on carrier transit)",
      "🔄 Instant consensus trigger: querying San Jose, Ashburn, Frankfurt & Tokyo...",
      "🛡️ Quorum consensus: 5/6 regions report 200 OK → 3 AM PagerDuty alert suppressed!",
    ]);
    setTimeout(() => {
      setIsSimulating(false);
    }, 900);
  };

  return (
    <section className="relative pt-12 pb-24 md:pt-16 md:pb-32 bg-[#fbfbf9] text-[#23211a] overflow-hidden">
      {/* Top Hero Copy Block (Twin.so exact alignment) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 flex flex-col items-center text-center">
        {/* Top Pill Tag */}
        <Link
          href="/agencies"
          className="group inline-flex items-center gap-2 rounded-full border border-[#e8e6df] bg-white py-1.5 pr-3 pl-2 text-[13px] font-medium text-[#23211a] transition-colors hover:border-black/25 shadow-xs mb-8"
        >
          <span className="inline-flex size-[18px] items-center justify-center rounded-[5px] bg-[#ffd439] text-[#23211a] font-bold text-[10px]">
            ✳
          </span>
          <span>Built for Agencies & Dev Studios · 7 Global Edge Regions</span>
          <ChevronRight className="size-3 text-[#868279] group-hover:translate-x-0.5 transition-transform" />
        </Link>

        {/* Serif Headline (Twin.so exact font styling) */}
        <h1 className="max-w-4xl font-serif text-[clamp(40px,4.5vw,58px)] leading-[1.02] font-medium tracking-[-0.03em] text-[#23211a] text-balance mb-6">
          Multi-client uptime monitoring & SLA proof built for agencies.
        </h1>

        {/* Subtitle */}
        <p className="text-[#5c5c5c] text-base sm:text-lg max-w-[38rem] text-balance leading-relaxed mb-8">
          Monitor all your client websites and APIs across 7 global regions. Eliminate 3 AM false
          alarms with multi-region quorum consensus, deliver branded white-label status portals, and
          generate monthly SLA reports that prove your retainer value.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-4">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#23211a] text-white font-medium text-sm sm:text-base px-6 py-3.5 shadow-md hover:bg-[#373428] transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Start Free Agency Trial</span>
          </Link>

          <button
            type="button"
            onClick={simulateFluke}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e8e6df] bg-white text-[#23211a] font-medium text-sm sm:text-base px-5 py-3.5 shadow-xs hover:bg-[#f4f2eb] transition-all"
          >
            <Play className="size-3.5 fill-current text-[#ffd439]" />
            <span>Simulate Transit Blip</span>
          </button>
        </div>

        {/* Microcopy */}
        <p className="text-xs text-[#868279] font-sans mb-7">
          7-day free trial · No credit card required · Unlimited white-label client portals
        </p>

        {/* ========================================================================= */}
        {/* TWIN.SO HERO STAGE: Orbit Floats + Live Product Frame                     */}
        {/* ========================================================================= */}
        <div className="relative w-full max-w-5xl mt-6 px-2 sm:px-8 py-8 lg:py-12">
          {/* Floating Pill Integration Badges & Pastel Avatars (Visible with z-30) */}
          {/* Top-Left: Slack Alerts Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hidden sm:flex absolute -top-3 left-4 lg:-left-6 z-30 items-center gap-2 rounded-xl bg-white border border-[#e8e6df] px-3.5 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:scale-105 transition-transform"
          >
            <span className="size-2.5 rounded-full bg-[#4a154b]" />
            <span className="text-xs font-semibold font-mono text-[#23211a]">Slack Alerts</span>
          </motion.div>

          {/* Top-Left Avatar: SJC Edge Node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="absolute -top-7 left-1/4 sm:left-[22%] z-30 size-14 rounded-full bg-[#f5e6bc] border-[3px] border-white shadow-[0_8px_25px_rgba(0,0,0,0.1)] flex items-center justify-center text-xs font-bold text-[#23211a] hover:scale-110 transition-transform cursor-pointer"
          >
            <span>SJC</span>
            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[#3c79d2] text-white flex items-center justify-center text-[8px] font-bold shadow-xs">
              ✓
            </span>
          </motion.div>

          {/* Top-Right Avatar: LHR Edge Node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="absolute -top-7 right-1/4 sm:right-[22%] z-30 size-14 rounded-full bg-[#d8eaf5] border-[3px] border-white shadow-[0_8px_25px_rgba(0,0,0,0.1)] flex items-center justify-center text-xs font-bold text-[#23211a] hover:scale-110 transition-transform cursor-pointer"
          >
            <span>LHR</span>
            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[#3c79d2] text-white flex items-center justify-center text-[8px] font-bold shadow-xs">
              ✓
            </span>
          </motion.div>

          {/* Top-Right: PagerDuty Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden sm:flex absolute -top-3 right-4 lg:-right-6 z-30 items-center gap-2 rounded-xl bg-white border border-[#e8e6df] px-3.5 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:scale-105 transition-transform"
          >
            <span className="size-2.5 rounded-full bg-[#06ac38]" />
            <span className="text-xs font-semibold font-mono text-[#23211a]">PagerDuty</span>
          </motion.div>

          {/* Mid-Left: Cloudflare Edge Pill */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="hidden md:flex absolute top-1/2 -translate-y-1/2 -left-6 lg:-left-12 z-30 items-center gap-2 rounded-xl bg-white border border-[#e8e6df] px-3.5 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:scale-105 transition-transform"
          >
            <span className="size-2.5 rounded-full bg-[#f6821f]" />
            <span className="text-xs font-semibold font-mono text-[#23211a]">Cloudflare Edge</span>
          </motion.div>

          {/* Mid-Right: Discord Webhooks Pill */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="hidden md:flex absolute top-1/2 -translate-y-1/2 -right-6 lg:-right-12 z-30 items-center gap-2 rounded-xl bg-white border border-[#e8e6df] px-3.5 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:scale-105 transition-transform"
          >
            <span className="size-2.5 rounded-full bg-[#5865F2]" />
            <span className="text-xs font-semibold font-mono text-[#23211a]">Discord Webhooks</span>
          </motion.div>

          {/* Bottom-Left Avatar: NRT Tokyo Node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="absolute -bottom-6 left-1/4 sm:left-[22%] z-30 size-14 rounded-full bg-[#f2d9e2] border-[3px] border-white shadow-[0_8px_25px_rgba(0,0,0,0.1)] flex items-center justify-center text-xs font-bold text-[#23211a] hover:scale-110 transition-transform cursor-pointer"
          >
            <span>NRT</span>
            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[#3c79d2] text-white flex items-center justify-center text-[8px] font-bold shadow-xs">
              ✓
            </span>
          </motion.div>

          {/* Bottom-Left: Quorum Consensus Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="hidden sm:flex absolute -bottom-3 left-4 lg:-left-4 z-30 items-center gap-2 rounded-xl bg-white border border-[#e8e6df] px-3.5 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:scale-105 transition-transform"
          >
            <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold font-mono text-[#23211a]">Quorum 6/6 OK</span>
          </motion.div>

          {/* Bottom-Right Avatar: FRA Frankfurt Node */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="absolute -bottom-6 right-1/4 sm:right-[22%] z-30 size-14 rounded-full bg-[#dcebd9] border-[3px] border-white shadow-[0_8px_25px_rgba(0,0,0,0.1)] flex items-center justify-center text-xs font-bold text-[#23211a] hover:scale-110 transition-transform cursor-pointer"
          >
            <span>FRA</span>
            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[#3c79d2] text-white flex items-center justify-center text-[8px] font-bold shadow-xs">
              ✓
            </span>
          </motion.div>

          {/* Bottom-Right: PDF SLA Reports Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="hidden sm:flex absolute -bottom-3 right-4 lg:-right-4 z-30 items-center gap-2 rounded-xl bg-white border border-[#e8e6df] px-3.5 py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:scale-105 transition-transform"
          >
            <span className="size-2.5 rounded-full bg-[#ffd439]" />
            <span className="text-xs font-semibold font-mono text-[#23211a]">
              Automated PDF SLA
            </span>
          </motion.div>

          {/* Hero Live App Frame (Twin.so Live App Window) */}
          <div className="w-full min-h-[520px] rounded-2xl border border-black/[0.08] bg-[#fbfbf9] text-left shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_20px_50px_rgba(0,0,0,0.05)] flex overflow-hidden">
            {/* Left Narrow Sidebar (Twin.so exact 64px width) */}
            <aside className="w-16 shrink-0 flex flex-col items-center border-r border-black/[0.06] bg-[#fdfdfb] py-3.5 gap-3">
              {/* App Logo */}
              <div className="size-8 rounded-xl bg-[#ffd439] text-[#23211a] flex items-center justify-center font-serif font-bold text-sm">
                S
              </div>

              {/* Action Icons */}
              <div className="flex flex-col items-center gap-1 mt-2">
                <button
                  type="button"
                  title="3D Consensus Mesh"
                  onClick={() => setViewMode("3d-globe")}
                  className={cn(
                    "size-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
                    viewMode === "3d-globe"
                      ? "bg-[#23211a] text-[#ffd439]"
                      : "text-[#868279] hover:bg-black/5 hover:text-[#23211a]",
                  )}
                >
                  <Globe className="size-4" />
                </button>
                <button
                  type="button"
                  title="Terminal View"
                  onClick={() => setViewMode("terminal")}
                  className={cn(
                    "size-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer",
                    viewMode === "terminal"
                      ? "bg-[#23211a] text-[#ffd439]"
                      : "text-[#868279] hover:bg-black/5 hover:text-[#23211a]",
                  )}
                >
                  <Activity className="size-4" />
                </button>
                <button
                  type="button"
                  title="Execute Test"
                  onClick={() => runTest(selectedPreset)}
                  className="size-8 rounded-lg text-[#868279] flex items-center justify-center hover:bg-black/5 hover:text-[#23211a] transition-colors cursor-pointer"
                >
                  <Zap className="size-4" />
                </button>
                <button
                  type="button"
                  title="SLA Reports"
                  className="size-8 rounded-lg text-[#868279] flex items-center justify-center hover:bg-black/5 hover:text-[#23211a] transition-colors"
                >
                  <FileText className="size-4" />
                </button>
              </div>

              {/* Bottom Assistant Mark */}
              <div className="mt-auto flex flex-col items-center gap-2">
                <span className="size-6 rounded-md bg-[#ffd439] text-[#23211a] flex items-center justify-center font-bold text-[10px]">
                  ✳
                </span>
              </div>
            </aside>

            {/* Right Main Live Interactive Stage */}
            <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 bg-[#fbfbf9]">
              {/* Top Prompt / Search Box */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-black/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#23211a]">
                      Active Edge Consensus Terminal
                    </span>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center p-0.5 bg-[#f0eee6] rounded-lg border border-[#e8e6df]">
                      <button
                        type="button"
                        onClick={() => setViewMode("3d-globe")}
                        className={cn(
                          "px-2.5 py-1 text-[11px] font-mono font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                          viewMode === "3d-globe"
                            ? "bg-white text-[#23211a] shadow-xs"
                            : "text-[#868279] hover:text-[#23211a]",
                        )}
                      >
                        <Globe className="size-3 text-[#ffd439]" />
                        <span>3D Mesh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("terminal")}
                        className={cn(
                          "px-2.5 py-1 text-[11px] font-mono font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                          viewMode === "terminal"
                            ? "bg-white text-[#23211a] shadow-xs"
                            : "text-[#868279] hover:text-[#23211a]",
                        )}
                      >
                        <Activity className="size-3" />
                        <span>Cards</span>
                      </button>
                    </div>

                    <span
                      className={cn(
                        "text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border",
                        flukeMode
                          ? "bg-amber-500/10 text-amber-700 border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
                      )}
                    >
                      {flukeMode
                        ? "1 Region Dropped (Fluke Filtered)"
                        : "7 Global Edge Regions in Consensus"}
                    </span>
                  </div>
                </div>

                {/* Prompt Box */}
                <div className="p-4 rounded-2xl bg-white border border-[#e8e6df] shadow-sm mb-5">
                  <div className="text-xs font-mono text-[#868279] mb-1.5">
                    Describe client endpoints to monitor:
                  </div>
                  <div className="text-base font-serif text-[#23211a] font-medium flex items-center justify-between">
                    <span className="truncate pr-2">{PRESETS[selectedPreset].target}</span>
                    <button
                      type="button"
                      onClick={() => runTest(selectedPreset)}
                      disabled={isSimulating}
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold bg-[#23211a] text-white px-3.5 py-1.5 rounded-lg hover:bg-[#373428] transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      <RefreshCw className={cn("size-3", isSimulating && "animate-spin")} />
                      <span>{isSimulating ? "Probing Nodes..." : "Execute Test"}</span>
                    </button>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="text-[11px] font-mono text-[#868279] uppercase font-semibold">
                    Ready-Made:
                  </span>
                  {PRESETS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => runTest(pIdx)}
                      className={cn(
                        "text-xs font-mono px-3 py-1.5 rounded-full border transition-all cursor-pointer",
                        selectedPreset === pIdx
                          ? "bg-[#23211a] text-white border-[#23211a] font-bold shadow-xs"
                          : "bg-white text-[#5c5c5c] border-[#e8e6df] hover:border-black/20 hover:text-[#23211a]",
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Main View Area: 3D Three.js Globe or Terminal Cards */}
                {viewMode === "3d-globe" ? (
                  <div className="relative w-full h-[280px] sm:h-[310px] rounded-2xl bg-gradient-to-b from-white to-[#fbfbf9] border border-[#e8e6df] shadow-xs mb-5 overflow-hidden flex items-center justify-center">
                    <ThreeEdgeGlobe flukeActive={flukeMode} className="w-full h-full" />

                    {/* Drag & Rotate Hint Badge */}
                    <div className="absolute bottom-3 left-3 pointer-events-none z-10 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/90 border border-[#e8e6df] shadow-xs text-[10px] font-mono text-[#868279] backdrop-blur-xs">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Drag to rotate · Hover nodes for live telemetry</span>
                    </div>

                    {/* Live Consensus Quorum Gauge */}
                    <div className="absolute top-3 right-3 pointer-events-none z-10 px-3 py-1.5 rounded-xl bg-white/95 border border-[#e8e6df] shadow-xs text-right backdrop-blur-xs">
                      <div className="text-[9px] font-mono font-bold text-[#868279] uppercase">
                        Quorum Status
                      </div>
                      <div className="text-xs font-mono font-bold text-emerald-600">
                        {flukeMode ? "6 / 7 Verified" : "7 / 7 In Consensus"}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 6 Regional Probe Cards */
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
                    {nodes.map((node) => {
                      const isDropped = node.status === "fluke_suppressed";
                      return (
                        <div
                          key={node.id}
                          className={cn(
                            "p-3 rounded-xl border flex items-center justify-between transition-all",
                            isDropped
                              ? "bg-amber-500/10 border-amber-500/30 text-amber-900"
                              : "bg-white border-[#e8e6df] text-[#23211a]",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{node.flag}</span>
                            <div>
                              <div className="text-xs font-semibold truncate max-w-[90px]">
                                {node.name.split(" ")[0]}
                              </div>
                              <div className="text-[10px] font-mono text-[#868279]">
                                {isDropped ? "504 Carrier Fluke" : `HTTP ${node.httpCode}`}
                              </div>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <div
                              className={cn(
                                "text-xs font-bold",
                                isDropped ? "text-amber-600" : "text-emerald-600",
                              )}
                            >
                              {isDropped ? "Dropped" : `${node.latency}ms`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Terminal Log Output */}
              <div className="rounded-xl bg-[#23211a] text-white p-3.5 text-xs font-mono space-y-1">
                {logMessages.map((msg, mIdx) => (
                  <div key={mIdx} className="leading-relaxed flex items-center gap-2">
                    <span className="text-[#ffd439]">›</span>
                    <span
                      className={cn(msg.includes("suppressed") && "text-emerald-400 font-bold")}
                    >
                      {msg}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
