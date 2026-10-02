"use client";

import { useState } from "react";
import {
  ExternalLink,
  ArrowUpRight,
  Globe,
  Sparkles,
  Shield,
  Activity,
  CheckCircle2,
  Server,
  Layers,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import type { ShowcaseEntry } from "@/actions/showcase";

const CURATED_DEMO_ENTRIES: ShowcaseEntry[] = [
  {
    name: "HyperScale Cloud API",
    slug: "hyperscale-api",
    tagline: "Global edge computing & low-latency serverless runtime",
    theme: "Midnight",
    themeColors: { primary: "#38bdf8", bg: "#0f172a", text: "#f8fafc" },
    preview: { status: "operational", uptime: "99.99%", monitors: 6 },
  },
  {
    name: "Apex Pay Gateway",
    slug: "apex-pay",
    tagline: "Real-time payment clearing & multi-currency escrow ledger",
    theme: "Clean Light",
    themeColors: { primary: "#23211a", bg: "#ffffff", text: "#23211a" },
    preview: { status: "operational", uptime: "100.0%", monitors: 5 },
  },
  {
    name: "NeonDB Distributed",
    slug: "neondb-edge",
    tagline: "Serverless Postgres clusters with sub-10ms branching",
    theme: "Cyberpunk",
    themeColors: { primary: "#22c55e", bg: "#050505", text: "#e2e8f0" },
    preview: { status: "operational", uptime: "99.98%", monitors: 6 },
  },
  {
    name: "Veloce Media CDN",
    slug: "veloce-cdn",
    tagline: "High-throughput adaptive video encoding & edge caching",
    theme: "Dracula",
    themeColors: { primary: "#ff79c6", bg: "#282a36", text: "#f8f8f2" },
    preview: { status: "operational", uptime: "99.95%", monitors: 4 },
  },
  {
    name: "Lumina Intelligence",
    slug: "lumina-ai",
    tagline: "Ultra-fast neural inference cluster with token streaming",
    theme: "Carbon Ember",
    themeColors: { primary: "#f59e0b", bg: "#18181b", text: "#fafafa" },
    preview: { status: "operational", uptime: "100.0%", monitors: 5 },
  },
  {
    name: "Monolith Core Banking",
    slug: "monolith-bank",
    tagline: "Institutional settlement engine & ISO 20022 messaging",
    theme: "Monochrome",
    themeColors: { primary: "#000000", bg: "#ffffff", text: "#000000" },
    preview: { status: "operational", uptime: "99.99%", monitors: 6 },
  },
];

function StatusBadge({ status }: { status: ShowcaseEntry["preview"]["status"] }) {
  const isOp = status === "operational";
  const isDegraded = status === "degraded";

  return (
    <span
      className={`text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
        isOp
          ? "text-emerald-700 bg-emerald-50 border-emerald-200"
          : isDegraded
            ? "text-amber-700 bg-amber-50 border-amber-200"
            : "text-rose-700 bg-rose-50 border-rose-200"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          isOp ? "bg-emerald-500" : isDegraded ? "bg-amber-500" : "bg-rose-500"
        }`}
      />
      {status === "operational" ? "Operational" : status === "degraded" ? "Degraded" : "Outage"}
    </span>
  );
}

function PreviewMockup({ entry }: { entry: ShowcaseEntry }) {
  const monitors = Array.from({
    length: Math.min(entry.preview.monitors || 3, 4),
  });
  const serviceNames = [
    "API Gateway",
    "Auth Service",
    "Postgres Cluster",
    "Cache Layer",
    "CDN Edge",
    "WebSocket",
  ];

  return (
    <div
      className="border rounded-xl overflow-hidden font-mono text-[10px] shadow-xs transition-all duration-300"
      style={{ borderColor: `${entry.themeColors.primary}35` }}
    >
      {/* Header */}
      <div
        className="px-3.5 py-2.5 flex items-center justify-between border-b"
        style={{
          borderColor: `${entry.themeColors.primary}20`,
          backgroundColor: entry.themeColors.bg,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.themeColors.primary }}
          />
          <span className="font-bold text-xs" style={{ color: entry.themeColors.text }}>
            {entry.name}
          </span>
        </div>
        <StatusBadge status={entry.preview.status} />
      </div>

      {/* Monitors List */}
      <div
        className="px-3.5 py-2.5 flex flex-col gap-2"
        style={{ backgroundColor: entry.themeColors.bg }}
      >
        {monitors.map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <span style={{ color: `${entry.themeColors.text}a0` }}>
              {serviceNames[i] || `Endpoint ${i + 1}`}
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="size-1.5 rounded-full"
                style={{
                  backgroundColor:
                    entry.preview.status === "outage" && i === 0
                      ? "#ef4444"
                      : entry.themeColors.primary,
                }}
              />
              <span style={{ color: entry.themeColors.text }} className="font-semibold text-[9px]">
                {entry.preview.uptime}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="px-3.5 py-2 border-t text-center text-[9px] font-sans truncate"
        style={{
          borderColor: `${entry.themeColors.primary}20`,
          backgroundColor: entry.themeColors.bg,
          color: `${entry.themeColors.text}80`,
        }}
      >
        {entry.tagline}
      </div>
    </div>
  );
}

export function ShowcaseGallery({ initialEntries }: { initialEntries: ShowcaseEntry[] }) {
  const [filterTheme, setFilterTheme] = useState<string>("all");

  const displayEntries =
    initialEntries && initialEntries.length > 0 ? initialEntries : CURATED_DEMO_ENTRIES;

  const themes = [
    "all",
    "Midnight",
    "Cyberpunk",
    "Clean Light",
    "Dracula",
    "Carbon Ember",
    "Monochrome",
  ];

  const filtered =
    filterTheme === "all"
      ? displayEntries
      : displayEntries.filter((e) => e.theme.toLowerCase() === filterTheme.toLowerCase());

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-xs font-mono font-semibold uppercase tracking-wider shadow-xs">
          <Sparkles className="size-3 text-[#ffd439]" />
          <span>Status Page Design Gallery</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.08] text-balance">
          Modern, client-ready status pages.
        </h1>
        <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed font-sans max-w-2xl text-balance">
          Transform incident communications from an engineering headache into a proof of
          reliability. Browse verified community status pages and customize your own in seconds.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-[#23211a] hover:bg-black text-[#ffd439] font-semibold text-xs font-mono uppercase tracking-wider rounded-xl transition-all shadow-sm"
          >
            <span>Create Status Page</span>
            <ArrowRight className="size-3.5" />
          </Link>
          <a
            href="#guidelines"
            className="inline-flex items-center justify-center h-11 px-5 bg-white hover:bg-[#f0ede6] text-[#23211a] font-medium text-xs font-mono uppercase tracking-wider rounded-xl border border-[#e8e6df] transition-all shadow-xs"
          >
            <span>Design Guidelines</span>
          </a>
        </div>
      </div>

      {/* Theme Filter */}
      <div className="flex justify-center">
        <div className="flex gap-1.5 flex-wrap p-1.5 bg-white border border-[#e8e6df] rounded-2xl shadow-xs">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setFilterTheme(t)}
              className={`text-xs font-mono px-3.5 py-1.5 rounded-xl transition-all ${
                filterTheme === t
                  ? "bg-[#23211a] text-white font-semibold shadow-xs"
                  : "text-[#5c5c5c] hover:text-[#23211a] hover:bg-[#f0ede6]"
              }`}
            >
              {t === "all" ? "All Themes" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((entry) => (
          <div
            key={entry.slug}
            className="group bg-white border border-[#e8e6df] hover:border-[#23211a]/30 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-5"
          >
            {/* Preview Mockup */}
            <div className="p-1">
              <PreviewMockup entry={entry} />
            </div>

            {/* Information */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-serif font-medium text-[#23211a]">{entry.name}</h3>
                  <p className="text-xs text-[#868279] line-clamp-1 mt-0.5">{entry.tagline}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-[#f0ede6] text-[#23211a] text-[10px] font-mono font-semibold uppercase tracking-wider shrink-0">
                  {entry.theme}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#5c5c5c] pt-2 border-t border-[#e8e6df]">
                <div className="flex items-center gap-1.5">
                  <Server className="size-3.5 text-[#868279]" />
                  <span>{entry.preview.monitors} Monitors</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="size-3.5 text-emerald-600" />
                  <span className="font-semibold text-[#23211a]">
                    {entry.preview.uptime} Uptime
                  </span>
                </div>
              </div>

              <Link
                href={`/status-page/${entry.slug}` as any}
                className="w-full mt-1 border border-[#e8e6df] bg-[#fbfbf9] hover:bg-[#23211a] text-[#23211a] hover:text-white text-xs font-mono font-semibold uppercase tracking-wider py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <span>Inspect Live Page</span>
                <ExternalLink className="size-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Your Status Page Banner */}
      <div className="border border-[#ffd439] bg-[#ffd439]/10 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#23211a] uppercase tracking-wider">
            <Shield className="size-4" />
            <span>Community Showcase</span>
          </div>
          <h3 className="text-xl font-serif font-medium text-[#23211a]">
            Want your status page featured in this gallery?
          </h3>
          <p className="text-xs sm:text-sm text-[#5c5c5c] max-w-xl leading-relaxed">
            Open your status page editor in the dashboard → Settings → toggle &ldquo;Feature in
            Community Showcase&rdquo;.
          </p>
        </div>
        <Link
          href="/dashboard/pages"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#23211a] hover:bg-black text-[#ffd439] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shrink-0 shadow-sm"
        >
          <span>Manage Status Pages</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
