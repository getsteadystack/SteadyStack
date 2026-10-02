"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  ExternalLink,
  Copy,
  Check,
  Building2,
  Calendar,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  FileSpreadsheet,
  Zap,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

export function UptimeReportLeadMagnet() {
  const [agencyName, setAgencyName] = useState("Apex Digital Agency");
  const [clientName, setClientName] = useState("Acme Global Commerce");
  const [targetSla, setTargetSla] = useState(99.9);
  const [actualUptime, setActualUptime] = useState(99.98);
  const [period, setPeriod] = useState("September 2026");
  const [copiedSheet, setCopiedSheet] = useState(false);

  const googleSheetTemplateUrl =
    "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/copy";

  const handleCopySheetLink = () => {
    navigator.clipboard.writeText(googleSheetTemplateUrl);
    setCopiedSheet(true);
    toast.success("Google Sheets copy link copied to clipboard!");
    setTimeout(() => setCopiedSheet(false), 2500);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-16">
      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="size-3.5" />
          <span>Free Agency Lead Magnet & Deliverable</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
          Free Agency Client Uptime Report Template
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans">
          Download the plug-and-play monthly SLA audit template used by top digital agencies to
          justify $500–$2,500/mo retainer fees. Available in Google Sheets and interactive PDF.
        </p>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href={googleSheetTemplateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono uppercase tracking-wider transition-all shadow-md active:scale-98"
          >
            <FileSpreadsheet className="size-4" />
            <span>Make a Copy in Google Sheets</span>
            <ExternalLink className="size-3.5 opacity-70" />
          </a>

          <button
            type="button"
            onClick={handleCopySheetLink}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs font-mono transition-all cursor-pointer"
          >
            {copiedSheet ? (
              <>
                <Check className="size-4 text-emerald-500" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-4 text-muted-foreground" />
                <span>Copy Sheets Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs font-mono transition-all cursor-pointer"
          >
            <Download className="size-4" />
            <span>Save / Print PDF Deliverable</span>
          </button>
        </div>
      </div>

      {/* Live Interactive Customizer & Report Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              Customize Deliverable
            </h3>
            <p className="text-xs text-muted-foreground">
              Adjust parameters to preview the live branded report.
            </p>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-1.5">
              <label className="text-muted-foreground font-semibold">Your Agency Name</label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                placeholder="e.g. Acme Agency"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted-foreground font-semibold">Client Company Name</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                placeholder="e.g. Client Brand Corp"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-muted-foreground font-semibold">Reporting Period</label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                placeholder="e.g. October 2026"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Target SLA %</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetSla}
                  onChange={(e) => setTargetSla(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-muted-foreground font-semibold">Actual Uptime %</label>
                <input
                  type="number"
                  step="0.01"
                  value={actualUptime}
                  onChange={(e) => setActualUptime(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-3">
            <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary font-mono">
                <Zap className="size-3.5" />
                <span>Want to automate this monthly?</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                SteadyStack automatically tracks uptime across 7 edge regions and emails this exact
                PDF to your clients on the 1st of every month.
              </p>
              <Link
                href="/signup?plan=netrunner"
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline font-mono pt-1"
              >
                <span>Try SteadyStack Agency (Free for 1–2 Clients) &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Deliverable Document Preview Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white text-slate-900 border border-slate-200 rounded-2xl p-8 md:p-12 shadow-2xl relative print:m-0 print:p-0 print:border-none print:shadow-none">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-600 block mb-1">
                Executive SLA & Reliability Audit
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
                {agencyName || "Apex Digital Agency"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Client Service Deliverable &middot; {clientName || "Acme Global Commerce"}
              </p>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-slate-600 space-y-0.5">
              <div>
                Period: <span className="font-bold text-slate-900">{period}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Audit Scope: Web, Checkout & API Endpoints
              </div>
            </div>
          </div>

          {/* Key Metrics Executive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                Contractual SLA
              </span>
              <div className="text-2xl font-black font-mono text-slate-900">{targetSla}%</div>
              <span className="text-[10px] text-slate-500 font-mono">
                Allowed: ~43.2 mins downtime
              </span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">
                Actual System Uptime
              </span>
              <div className="text-2xl font-black font-mono text-emerald-700">
                {actualUptime.toFixed(2)}%
              </div>
              <span className="text-[10px] text-emerald-600 font-mono font-bold">
                {actualUptime >= targetSla ? "✓ SLA EXCEEDED" : "⚠ SLA BREACHED"}
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                Total Downtime
              </span>
              <div className="text-2xl font-black font-mono text-slate-900">
                {actualUptime >= 99.99
                  ? "0 mins"
                  : `${Math.round((100 - actualUptime) * 432)} mins`}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Avg Latency: 142ms</span>
            </div>
          </div>

          {/* Monitored Services Breakdown Table */}
          <div className="space-y-3 mb-8">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700">
              Monitored Scope & Endpoints
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-mono text-[11px] border-b border-slate-200">
                    <th className="p-2.5">Service Endpoint</th>
                    <th className="p-2.5">Protocol</th>
                    <th className="p-2.5">Check Interval</th>
                    <th className="p-2.5 text-right">Uptime %</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">
                      Primary Web Storefront & Catalog
                    </td>
                    <td className="p-2.5 font-mono text-slate-500">HTTPS (Edge)</td>
                    <td className="p-2.5 font-mono text-slate-500">30s</td>
                    <td className="p-2.5 font-mono font-bold text-right text-emerald-600">
                      99.99%
                    </td>
                    <td className="p-2.5 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                        Operational
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">
                      Checkout API & Payment Webhooks
                    </td>
                    <td className="p-2.5 font-mono text-slate-500">JSON REST</td>
                    <td className="p-2.5 font-mono text-slate-500">30s</td>
                    <td className="p-2.5 font-mono font-bold text-right text-emerald-600">
                      100.0%
                    </td>
                    <td className="p-2.5 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                        Operational
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">
                      Customer Auth & Portal Gateway
                    </td>
                    <td className="p-2.5 font-mono text-slate-500">SSL / TLS</td>
                    <td className="p-2.5 font-mono text-slate-500">60s</td>
                    <td className="p-2.5 font-mono font-bold text-right text-emerald-600">
                      99.95%
                    </td>
                    <td className="p-2.5 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                        Operational
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium text-slate-900">
                      Background Inventory Sync Worker
                    </td>
                    <td className="p-2.5 font-mono text-slate-500">Heartbeat</td>
                    <td className="p-2.5 font-mono text-slate-500">5m</td>
                    <td className="p-2.5 font-mono font-bold text-right text-emerald-600">
                      100.0%
                    </td>
                    <td className="p-2.5 text-right">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                        Operational
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Executive Maintenance Notes */}
          <div className="space-y-2 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <span className="font-bold text-slate-900 uppercase font-mono text-[10px] block">
              Agency Maintenance Notes & Security Summary:
            </span>
            <p className="text-slate-600 leading-relaxed">
              All WordPress core updates, plugin patches, database indexing, and Cloudflare WAF
              firewall rule adjustments were executed without user-facing downtime. DNS and SSL
              certificates remain valid through 2027.
            </p>
          </div>

          {/* Client Sign-off & Lead Magnet Mandatory Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left font-mono text-[11px] text-slate-400">
            <div>
              <span>Deliverable Prepared by: </span>
              <strong className="text-slate-700">{agencyName || "Apex Digital Agency"}</strong>
            </div>

            <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Automate this with SteadyStack (https://steadystack.dev)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
