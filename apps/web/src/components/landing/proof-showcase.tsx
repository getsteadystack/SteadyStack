"use client";

import { useState } from "react";
import {
  FileText,
  Globe,
  Download,
  CheckCircle2,
  Activity,
  Clock,
  ShieldCheck,
  Lock,
  ArrowRight,
  Users,
  ExternalLink,
  Plus,
  SlidersHorizontal,
  Search,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProofShowcase() {
  const [activeTab, setActiveTab] = useState<"workspace" | "report" | "status-page">("workspace");
  const [downloading, setDownloading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>("client-1");

  const handleDownload = () => {
    setDownloading(true);
    const link = document.createElement("a");
    link.href = "/api/reports/sample-sla-pdf";
    link.download = "steadystack-sample-client-sla-report.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      setDownloading(false);
    }, 1200);
  };

  const clientWorkspaces = [
    {
      id: "client-1",
      name: "Nordic Commerce Inc.",
      domain: "store.nordic.com",
      statusDomain: "status.nordic.com",
      monitorsCount: 6,
      targetSla: "99.90%",
      realizedUptime: "99.98%",
      avgLatency: "24ms",
      status: "Operational",
      badgeColor: "#10b981",
      monitors: [
        { name: "Web Storefront & Cart", type: "HTTP 200", latency: "18ms", uptime: "100.0%" },
        {
          name: "Checkout & Stripe API",
          type: "JSON Assertion",
          latency: "32ms",
          uptime: "99.98%",
        },
        { name: "Customer Auth Ingress", type: "HTTP 200", latency: "21ms", uptime: "100.0%" },
        {
          name: "PostgreSQL Replica Health",
          type: "TCP Port 5432",
          latency: "14ms",
          uptime: "100.0%",
        },
      ],
    },
    {
      id: "client-2",
      name: "Vertex Freight & Logistics",
      domain: "app.vertexlogistics.io",
      statusDomain: "status.vertexlogistics.io",
      monitorsCount: 8,
      targetSla: "99.95%",
      realizedUptime: "99.99%",
      avgLatency: "31ms",
      status: "Operational",
      badgeColor: "#06b6d4",
      monitors: [
        { name: "Fleet Telemetry API", type: "HTTP 200", latency: "28ms", uptime: "100.0%" },
        {
          name: "Dispatch WebSocket Ingress",
          type: "WS Protocol",
          latency: "36ms",
          uptime: "99.99%",
        },
        {
          name: "Nightly Route Calculation Cron",
          type: "Heartbeat",
          latency: "12ms",
          uptime: "100.0%",
        },
      ],
    },
    {
      id: "client-3",
      name: "Apex Healthcare Portal",
      domain: "telehealth.apexcare.org",
      statusDomain: "status.apexcare.org",
      monitorsCount: 5,
      targetSla: "99.90%",
      realizedUptime: "100.0%",
      avgLatency: "19ms",
      status: "Operational",
      badgeColor: "#3b82f6",
      monitors: [
        { name: "Patient Portal Frontend", type: "HTTP 200", latency: "16ms", uptime: "100.0%" },
        {
          name: "EHR Integration Gateway",
          type: "TLS / Certificate",
          latency: "22ms",
          uptime: "100.0%",
        },
      ],
    },
  ];

  const regionalMetrics = [
    {
      code: "wnam",
      name: "US West (San Jose)",
      latency: 16,
      uptime: "100.0%",
      status: "Optimal",
    },
    {
      code: "enam",
      name: "US East (Ashburn)",
      latency: 22,
      uptime: "99.99%",
      status: "Optimal",
    },
    {
      code: "weur",
      name: "EU West (London)",
      latency: 38,
      uptime: "99.98%",
      status: "Optimal",
    },
    {
      code: "apac",
      name: "Asia-Pacific (Tokyo)",
      latency: 84,
      uptime: "100.0%",
      status: "Optimal",
    },
  ];

  const statusComponents = [
    {
      name: "Web Storefront & Landing Pages",
      uptime: "99.99%",
      latency: "22ms",
      status: "Operational",
    },
    {
      name: "Checkout & Cart Engine",
      uptime: "100.0%",
      latency: "34ms",
      status: "Operational",
    },
    {
      name: "Customer Auth & Accounts API",
      uptime: "99.98%",
      latency: "28ms",
      status: "Operational",
    },
    {
      name: "Stripe & Payment Webhook Ingress",
      uptime: "100.0%",
      latency: "19ms",
      status: "Operational",
    },
  ];

  const selectedClient =
    clientWorkspaces.find((c) => c.id === selectedClientId) || clientWorkspaces[0];

  return (
    <section
      className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative overflow-hidden border-b border-[#e8e6df] scroll-mt-16"
      id="sample-report"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-5 shadow-xs">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            <span>The Daily Agency Toolkit</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] mb-6 text-balance leading-[1.08]">
            The exact product your agency uses daily.
          </h2>

          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-balance font-sans">
            Explore the multi-client workspace dashboard, the automated monthly SLA audit PDF, and
            the white-label client status portal.
          </p>

          {/* Interactive Tab Switcher */}
          <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1 bg-white border border-[#e8e6df] rounded-2xl sm:rounded-full mt-8 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("workspace")}
              className={cn(
                "inline-flex items-center gap-2 px-4.5 py-2 rounded-xl sm:rounded-full text-xs font-mono font-semibold transition-all duration-200 cursor-pointer",
                activeTab === "workspace"
                  ? "bg-[#23211a] text-white shadow-xs font-bold"
                  : "text-[#5c5c5c] hover:text-[#23211a]",
              )}
            >
              <Users className="size-3.5" />
              <span>1. Agency Client Workspaces</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("report")}
              className={cn(
                "inline-flex items-center gap-2 px-4.5 py-2 rounded-xl sm:rounded-full text-xs font-mono font-semibold transition-all duration-200 cursor-pointer",
                activeTab === "report"
                  ? "bg-[#23211a] text-white shadow-xs font-bold"
                  : "text-[#5c5c5c] hover:text-[#23211a]",
              )}
            >
              <FileText className="size-3.5" />
              <span>2. Monthly SLA Audit (PDF)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("status-page")}
              className={cn(
                "inline-flex items-center gap-2 px-4.5 py-2 rounded-xl sm:rounded-full text-xs font-mono font-semibold transition-all duration-200 cursor-pointer",
                activeTab === "status-page"
                  ? "bg-[#23211a] text-white shadow-xs font-bold"
                  : "text-[#5c5c5c] hover:text-[#23211a]",
              )}
            >
              <Globe className="size-3.5" />
              <span>3. White-Label Status Portal</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Agency Client Workspaces Dashboard */}
        {activeTab === "workspace" && (
          <div className="bg-white border border-[#e8e6df] rounded-3xl p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] text-left font-sans">
            {/* Dashboard Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#e8e6df] gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase font-bold text-[#868279] tracking-wider">
                    Agency Fleet Workspace
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-semibold border border-emerald-500/20">
                    12 Active Client Retainers
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-medium text-[#23211a] mt-1">
                  Multi-Tenant Client Fleet Overview
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#23211a] text-white px-4 py-2 text-xs font-mono font-semibold hover:bg-[#373428] transition-all"
                >
                  <Plus className="size-3.5" />
                  <span>New Client Workspace</span>
                </Link>
              </div>
            </div>

            {/* Client Tabs / Selector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Client List */}
              <div className="lg:col-span-4 space-y-2.5">
                <div className="text-[11px] font-mono font-bold text-[#868279] uppercase px-1">
                  Select Client Brand
                </div>
                {clientWorkspaces.map((c) => {
                  const isSelected = c.id === selectedClientId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClientId(c.id)}
                      className={cn(
                        "p-3.5 rounded-2xl border transition-all cursor-pointer text-left",
                        isSelected
                          ? "bg-[#fbfbf9] border-[#23211a] shadow-sm ring-1 ring-[#23211a]"
                          : "bg-white border-[#e8e6df] hover:border-black/20",
                      )}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: c.badgeColor }}
                          />
                          <span className="font-serif font-medium text-sm text-[#23211a]">
                            {c.name}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          {c.realizedUptime}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#868279]">
                        <span>{c.monitorsCount} Monitors</span>
                        <span>SLA Target: {c.targetSla}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Detail Pane for Active Client */}
              <div className="lg:col-span-8 p-5 sm:p-6 rounded-2xl bg-[#fbfbf9] border border-[#e8e6df] space-y-5">
                {/* Client Meta Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e8e6df] gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-medium text-lg text-[#23211a]">
                        {selectedClient.name}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        {selectedClient.status}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#868279] mt-0.5 flex items-center gap-2">
                      <span>CNAME: {selectedClient.statusDomain}</span>
                      <span>·</span>
                      <span>Latency: {selectedClient.avgLatency}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3 py-1.5 rounded-lg border border-[#e8e6df] bg-white text-[#23211a] hover:bg-[#f4f2eb] transition-all cursor-pointer shadow-xs self-start sm:self-auto"
                  >
                    <Download className="size-3 text-[#ffd439]" />
                    <span>Generate Monthly PDF</span>
                  </button>
                </div>

                {/* Monitored Endpoints Table */}
                <div className="space-y-2">
                  <div className="text-xs font-mono font-bold text-[#868279] uppercase">
                    Configured Endpoints & Synthetic Probes
                  </div>
                  <div className="space-y-2">
                    {selectedClient.monitors.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-[#e8e6df] flex items-center justify-between text-xs font-mono shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                          <div>
                            <div className="font-bold text-[#23211a]">{m.name}</div>
                            <div className="text-[10px] text-[#868279]">{m.type}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <span className="text-[#868279]">{m.latency}</span>
                          <span className="text-emerald-600 font-bold">{m.uptime}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Retainer Value Callout Footer */}
                <div className="p-3.5 rounded-xl bg-white border border-[#e8e6df] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#5c5c5c]">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>
                      7-Region Edge Quorum active · Filtered 0 phantom false alarms this week
                    </span>
                  </div>
                  <span className="font-bold text-[#23211a]">100% SLA Met</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Monthly Client SLA Report */}
        {activeTab === "report" && (
          <div className="bg-white border border-[#e8e6df] rounded-3xl p-6 sm:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.04)] text-left">
            {/* Mock PDF Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#e8e6df] gap-4">
              <div>
                <span className="text-xs font-mono uppercase font-bold text-[#868279] tracking-wider">
                  Executive Retainer Deliverable
                </span>
                <h3 className="text-2xl font-serif font-medium text-[#23211a] mt-1">
                  Monthly Infrastructure Reliability Audit
                </h3>
                <p className="text-xs text-[#5c5c5c] font-mono mt-0.5">
                  Client: Acme Global Commerce Inc. · Audit Period: October 2026
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 rounded-xl bg-[#23211a] text-white px-4 py-2.5 text-xs font-mono font-semibold hover:bg-[#373428] transition-all self-start sm:self-auto disabled:opacity-50 cursor-pointer shadow-md"
              >
                <Download className="size-3.5" />
                <span>{downloading ? "Exporting PDF..." : "Download Sample PDF"}</span>
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-2xl bg-[#fbfbf9] border border-[#e8e6df]">
                <div className="text-[10px] font-mono uppercase text-[#868279]">Contract SLA</div>
                <div className="text-2xl font-serif font-semibold text-[#23211a] mt-1">99.90%</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#fbfbf9] border border-[#e8e6df]">
                <div className="text-[10px] font-mono uppercase text-[#868279]">
                  Realized Uptime
                </div>
                <div className="text-2xl font-serif font-semibold text-emerald-600 mt-1">
                  99.99%
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-[#fbfbf9] border border-[#e8e6df]">
                <div className="text-[10px] font-mono uppercase text-[#868279]">
                  Average Latency
                </div>
                <div className="text-2xl font-serif font-semibold text-[#23211a] mt-1">26ms</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#fbfbf9] border border-[#e8e6df]">
                <div className="text-[10px] font-mono uppercase text-[#868279]">
                  Unplanned Outage
                </div>
                <div className="text-2xl font-serif font-semibold text-emerald-600 mt-1">
                  0 mins
                </div>
              </div>
            </div>

            {/* Regional Performance Table */}
            <div className="space-y-3">
              <div className="text-xs font-mono font-bold text-[#868279] uppercase">
                Global Edge Distribution
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {regionalMetrics.map((rm) => (
                  <div
                    key={rm.code}
                    className="p-3.5 rounded-xl bg-[#fbfbf9] border border-[#e8e6df] flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-[#23211a]">{rm.name}</div>
                      <div className="text-[10px] text-[#868279]">{rm.latency}ms average</div>
                    </div>
                    <span className="text-emerald-600 font-bold">{rm.uptime}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Custom Domain Status Portal */}
        {activeTab === "status-page" && (
          <div className="bg-white border border-[#e8e6df] rounded-3xl p-6 sm:p-10 shadow-[0_16px_40px_rgba(0,0,0,0.04)] text-left">
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#e8e6df]">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-[#23211a] text-white flex items-center justify-center font-bold font-mono text-xs">
                  AC
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#23211a]">
                    Acme Commerce Status Portal
                  </h3>
                  <div className="text-xs text-[#868279] font-mono">status.acme.com</div>
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 font-semibold border border-emerald-500/20">
                All Systems Operational
              </span>
            </div>

            <div className="space-y-3">
              {statusComponents.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#fbfbf9] border border-[#e8e6df] flex items-center justify-between text-xs font-mono"
                >
                  <span className="font-semibold text-[#23211a]">{comp.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-[#868279]">{comp.latency}</span>
                    <span className="text-emerald-600 font-bold">{comp.uptime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
