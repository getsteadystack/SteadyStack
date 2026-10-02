"use client";

import {
  CheckCircle2,
  Download,
  ShieldCheck,
  Activity,
  Globe,
  Clock,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SampleReport() {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadMock = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      // Create a lightweight simulated download feedback
      alert("Sample SLA Report (PDF format) downloaded.");
    }, 800);
  };

  const regionalMetrics = [
    {
      code: "wnam",
      name: "US West (San Jose)",
      latency: 18,
      uptime: "100.0%",
      status: "Normal",
    },
    {
      code: "enam",
      name: "US East (Ashburn)",
      latency: 24,
      uptime: "99.99%",
      status: "Normal",
    },
    {
      code: "weur",
      name: "EU West (Frankfurt)",
      latency: 42,
      uptime: "99.98%",
      status: "Normal",
    },
    {
      code: "apac",
      name: "Asia-Pacific (Singapore)",
      latency: 86,
      uptime: "100.0%",
      status: "Normal",
    },
  ];

  return (
    <section
      className="py-24 bg-background relative overflow-hidden border-b border-border"
      id="sample-report"
    >
      {/* Soft background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-20">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-mono font-bold uppercase tracking-wider mb-4">
            <FileCheck className="size-3.5" />
            Client-Ready Reporting
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Reports your clients will <span className="text-primary">actually read</span>.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-sans">
            Hand over clean, unbranded uptime summaries and SLA compliance records during monthly
            retainer check-ins to prove your reliability without manual spreadsheet work.
          </p>
        </div>

        {/* Sample Report Document Container */}
        <div className="w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Document Top Bar */}
          <div className="p-4 sm:p-6 bg-muted/40 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold font-mono text-sm">
                AD
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">Apex Digital Agency</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/25 font-bold">
                    White-Label
                  </span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  Client: Acme Commerce LLC · Production Fleet SLA
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadMock}
                disabled={downloading}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold font-mono uppercase tracking-wider transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Download className="size-3.5" />
                {downloading ? "Exporting..." : "Download Sample PDF"}
              </button>
            </div>
          </div>

          {/* Report Body */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Summary Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-semibold flex items-center gap-1.5 mb-1">
                  <Activity className="size-3 text-primary" />
                  Realized Uptime
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-primary">
                  99.982%
                </div>
                <div className="text-[10px] font-mono text-emerald-500 font-bold mt-1">
                  ✓ Exceeds 99.90% SLA Target
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-semibold flex items-center gap-1.5 mb-1">
                  <Clock className="size-3 text-primary" />
                  Average Latency
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
                  38.4ms
                </div>
                <div className="text-[10px] font-mono text-muted-foreground mt-1">
                  Across 7 global regions
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-semibold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="size-3 text-emerald-500" />
                  False Positive Rate
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-500">
                  0.00%
                </div>
                <div className="text-[10px] font-mono text-emerald-500/80 mt-1">
                  4-of-7 Quorum filtered 2 blips
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <div className="text-[10px] font-mono uppercase text-muted-foreground font-semibold flex items-center gap-1.5 mb-1">
                  <Globe className="size-3 text-primary" />
                  Active Monitors
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-foreground">
                  48 / 50
                </div>
                <div className="text-[10px] font-mono text-muted-foreground mt-1">
                  Store, API, Checkout, Auth
                </div>
              </div>
            </div>

            {/* Regional Performance Grid */}
            <div className="border border-border/80 rounded-xl p-5 bg-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground font-sans">
                    Regional Edge Vantage Point Telemetry
                  </h4>
                  <p className="text-xs text-muted-foreground font-sans">
                    Independent health verification logs for billing period (September 1 – 30, 2026)
                  </p>
                </div>
                <span className="text-[10px] font-mono text-primary font-bold uppercase bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                  All Probes Healthy
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {regionalMetrics.map((r) => (
                  <div
                    key={r.code}
                    className="p-3 rounded-lg bg-muted/20 border border-border/60 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between text-muted-foreground mb-1 text-[11px]">
                      <span>{r.code}</span>
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> {r.status}
                      </span>
                    </div>
                    <div className="font-bold text-foreground text-sm font-sans mb-1">{r.name}</div>
                    <div className="flex justify-between text-[11px] pt-1 border-t border-border/40">
                      <span className="text-muted-foreground">Ping: {r.latency}ms</span>
                      <span className="text-primary font-bold">{r.uptime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Managed Incidents Table */}
            <div className="border border-border/80 rounded-xl overflow-hidden bg-card">
              <div className="px-5 py-3.5 bg-muted/30 border-b border-border flex items-center justify-between">
                <span className="text-xs font-bold text-foreground uppercase font-mono tracking-wider">
                  Incident Log & Resolution Summary (1 Recorded Event)
                </span>
                <span className="text-[10px] font-mono text-emerald-500 font-semibold">
                  Mean Time to Resolve: 4m 12s
                </span>
              </div>
              <div className="divide-y divide-border/60 text-xs font-sans">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">
                        Postgres Connection Pool Saturation (Resolved)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Minor Degradation
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Orchestrator detected 504s via 5-of-7 regions. Auto-scaling pool expanded
                      capacity; traffic resumed with zero data loss.
                    </p>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[11px]">
                    <div className="text-foreground font-semibold">Sep 18, 14:22 UTC</div>
                    <div className="text-muted-foreground text-[10px]">Duration: 4m 12s</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Callout */}
          <div className="p-4 sm:p-5 bg-muted/40 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground font-sans">
              Want to automate client reporting for your agency? Set up your first client monitor in
              2 minutes.
            </span>
            <Link
              href="/signup"
              className="h-8 px-4 inline-flex items-center text-xs font-mono font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors uppercase tracking-wider shrink-0"
            >
              Start Free (50 Monitors) &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
