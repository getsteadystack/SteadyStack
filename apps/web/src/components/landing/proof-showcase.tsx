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
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProofShowcase() {
  const [activeTab, setActiveTab] = useState<"report" | "status-page">("report");
  const [downloading, setDownloading] = useState(false);

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
            <span>Tangible Client Proof</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] mb-6 text-balance leading-[1.08]">
            Agencies buy what they can show their clients.
          </h2>

          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-balance font-sans">
            Here is the exact white-label status portal and monthly SLA audit PDF your agency can
            present directly to clients to prove uptime and justify monthly retainers.
          </p>

          {/* Interactive Tab Switcher */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-white border border-[#e8e6df] rounded-full mt-8 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab("report")}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-mono font-semibold transition-all duration-200 cursor-pointer",
                activeTab === "report"
                  ? "bg-[#23211a] text-white shadow-xs font-bold"
                  : "text-[#5c5c5c] hover:text-[#23211a]",
              )}
            >
              <FileText className="size-3.5" />
              <span>1. Monthly Client SLA Report (PDF)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("status-page")}
              className={cn(
                "inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-mono font-semibold transition-all duration-200 cursor-pointer",
                activeTab === "status-page"
                  ? "bg-[#23211a] text-white shadow-xs font-bold"
                  : "text-[#5c5c5c] hover:text-[#23211a]",
              )}
            >
              <Globe className="size-3.5" />
              <span>2. Custom Domain Status Portal</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Monthly Client SLA Report */}
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
                className="inline-flex items-center gap-2 rounded-xl bg-[#23211a] text-white px-4 py-2.5 text-xs font-mono font-semibold hover:bg-[#373428] transition-all self-start sm:self-auto disabled:opacity-50"
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

        {/* Tab 2: Custom Domain Status Portal */}
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
