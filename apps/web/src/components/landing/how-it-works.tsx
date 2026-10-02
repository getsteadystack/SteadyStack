"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Globe,
  Lock,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StepItem = {
  number: string;
  badge: string;
  title: string;
  description: string;
  details: string[];
  preview: React.ReactNode;
};

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  const steps: StepItem[] = [
    {
      number: "01",
      badge: "Instant Discovery",
      title: "Add client domains and let SteadyStack discover critical endpoints",
      description:
        "Input any client website or API URL. SteadyStack auto-discovers health routes, SSL certificates, and DNS configurations, proposing the monitors worth deploying first.",
      details: [
        "HTTP/HTTPS, TCP, DNS & WebSocket endpoints",
        "Automatic TLS/SSL certificate transparency discovery",
        "Payload & JSON response validation",
      ],
      preview: (
        <div className="p-6 rounded-2xl bg-white border border-[#e8e6df] shadow-sm space-y-4 font-sans text-left">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e6df]">
            <span className="text-xs font-mono font-bold text-[#868279] uppercase">
              Client Endpoint Discovery
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-semibold border border-emerald-500/20">
              Active Discovery
            </span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#fbfbf9] border border-[#e8e6df] flex items-center justify-between">
              <span className="text-[#868279]">Target URL</span>
              <span className="font-bold text-[#23211a]">
                https://store.clientbrand.com/api/cart
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#fbfbf9] border border-[#e8e6df] flex items-center justify-between">
              <span className="text-[#868279]">Edge Frequency</span>
              <span className="font-bold text-[#23211a]">Every 30 seconds · 7 Global Nodes</span>
            </div>
            <div className="p-3 rounded-xl bg-[#fbfbf9] border border-[#e8e6df] flex items-center justify-between">
              <span className="text-[#868279]">SSL Expiry Alert</span>
              <span className="text-emerald-600 font-bold">Enabled (30d, 14d, 7d countdown)</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "02",
      badge: "Team & Client Alerting",
      title: "Route alerts to your agency team before clients ever notice",
      description:
        "Connect directly to Slack, PagerDuty, OpsGenie, Discord, and custom Webhooks. When an alert needs custom handling, SteadyStack dispatches signed HMAC payloads straight to your infrastructure.",
      details: [
        "Native Slack, Discord & Teams webhook routing",
        "PagerDuty and OpsGenie high-priority escalation",
        "Signed HMAC-SHA256 webhooks for automated remediation",
      ],
      preview: (
        <div className="p-6 rounded-2xl bg-white border border-[#e8e6df] shadow-sm space-y-4 font-sans text-left">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e6df]">
            <span className="text-xs font-mono font-bold text-[#868279] uppercase">
              Alert Channel Routing
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600">Zero Configuration</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#fbfbf9] border border-[#e8e6df] flex items-center justify-between">
              <span>#agency-alerts</span>
              <span className="text-emerald-600 font-bold">Slack</span>
            </div>
            <div className="p-3 rounded-xl bg-[#fbfbf9] border border-[#e8e6df] flex items-center justify-between">
              <span>On-Call Rotation</span>
              <span className="text-emerald-600 font-bold">PagerDuty</span>
            </div>
            <div className="p-3 rounded-xl bg-[#fbfbf9] border border-[#e8e6df] flex items-center justify-between">
              <span>DevOps Channel</span>
              <span className="text-emerald-600 font-bold">Discord</span>
            </div>
            <div className="p-3 rounded-xl bg-[#fbfbf9] border border-[#e8e6df] flex items-center justify-between">
              <span>Client Incident Hook</span>
              <span className="text-emerald-600 font-bold">Webhook</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: "03",
      badge: "Quorum Consensus",
      title: "Never wake your engineers up for local carrier flukes",
      description:
        "When an isolated node experiences a dropped packet or routing flap, SteadyStack instantly triggers a 3-way multi-region verification. Alerts only fire when 4 of 7 regions independently reach quorum.",
      details: [
        "4-of-7 multi-region edge quorum threshold",
        "Prevents spurious 3 AM pagers from carrier drops",
        "Complete consensus audit trail attached to every notification",
      ],
      preview: (
        <div className="p-6 rounded-2xl bg-white border border-[#e8e6df] shadow-sm space-y-4 font-sans text-left">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e6df]">
            <span className="text-xs font-mono font-bold text-[#868279] uppercase">
              Quorum Engine Verdict
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 font-semibold border border-emerald-500/20">
              142 False Alarms Suppressed
            </span>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 text-xs">
            <div className="font-bold text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="size-4" />
              <span>Consensus Result: Local Carrier Fluke Filtered</span>
            </div>
            <p className="text-[#5c5c5c] text-xs leading-relaxed">
              6 of 7 nodes verified HTTP 200 OK. 1 node timeout in London isolated as an external
              BGP flap and suppressed without waking on-call engineers.
            </p>
          </div>
        </div>
      ),
    },
    {
      number: "04",
      badge: "Retainer Value",
      title: "Deliver white-label status pages & automated monthly SLA PDFs",
      description:
        "Each client gets a dedicated status portal on their custom CNAME domain with zero vendor watermarks. Automated monthly executive PDFs provide tangible proof of uptime at renewal time.",
      details: [
        "Dedicated status portals on custom CNAME domains",
        "Zero vendor watermarks · 100% agency white-labeled",
        "Automated monthly executive SLA PDF exports",
      ],
      preview: (
        <div className="p-6 rounded-2xl bg-white border border-[#e8e6df] shadow-sm space-y-4 font-sans text-left">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e6df]">
            <span className="text-xs font-mono font-bold text-[#23211a]">
              Acme Commerce Reliability Audit
            </span>
            <span className="text-xs font-mono font-bold text-emerald-600">99.99% SLA Met</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#fbfbf9] border border-[#e8e6df] flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-[#23211a]">Monthly Executive Summary</div>
              <div className="text-[11px] text-[#868279] font-mono">
                Automatically generated on 1st of month
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#23211a] bg-[#ffd439] px-2.5 py-1 rounded-lg">
              Download PDF
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] border-b border-[#e8e6df]"
      id="how-it-works"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header (Twin.so Serif Style) */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-semibold uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="size-3.5 text-[#ffd439]" />
            <span>Built for Agency Workflows</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] mb-6 leading-[1.08] text-balance">
            How agencies put multi-client monitoring on autopilot.
          </h2>

          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-balance">
            Set up client endpoints once. SteadyStack auto-discovers health routes, eliminates 3 AM
            false alarms with multi-region quorum, and delivers branded status pages and SLA PDFs to
            your clients.
          </p>
        </div>

        {/* Step-by-Step Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Interactive Step Cards */}
          <div className="lg:col-span-6 space-y-3.5">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    "cursor-pointer rounded-2xl border p-5 sm:p-6 transition-all duration-200 text-left",
                    isActive
                      ? "bg-white border-[#23211a] shadow-md scale-[1.01]"
                      : "bg-[#fdfdfb] border-[#e8e6df] hover:border-black/20 opacity-75 hover:opacity-100",
                  )}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-mono font-bold text-[#868279] uppercase">
                      Step {step.number}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-semibold",
                        isActive
                          ? "bg-[#ffd439]/30 text-[#23211a] border-[#ffd439]"
                          : "bg-[#f4f2eb] text-[#868279] border-transparent",
                      )}
                    >
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif font-medium text-[#23211a] mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed">
                    {step.description}
                  </p>

                  {isActive && (
                    <div className="mt-4 pt-3.5 border-t border-[#e8e6df] space-y-1.5">
                      {step.details.map((detail, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex items-center gap-2 text-xs text-[#23211a] font-medium"
                        >
                          <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Live Interactive Preview Stage */}
          <div className="lg:col-span-6 sticky top-24">
            <div className="rounded-3xl border border-[#e8e6df] bg-white p-6 sm:p-8 shadow-[0_16px_40px_rgba(0,0,0,0.04)] relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#e8e6df]">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-[#23211a] uppercase tracking-wider">
                    Interactive Preview
                  </span>
                </div>
                <span className="text-xs font-mono text-[#868279]">
                  Step {steps[activeStep].number} of 04
                </span>
              </div>

              <div>{steps[activeStep].preview}</div>

              {/* Bottom Quick Action */}
              <div className="mt-6 pt-4 border-t border-[#e8e6df] flex items-center justify-between text-xs">
                <span className="text-[#868279] font-mono">Quorum Engine Documentation</span>
                <Link
                  href="/docs/quorum-consensus"
                  className="inline-flex items-center gap-1 font-semibold text-[#23211a] hover:underline"
                >
                  <span>Explore 4-step protocol</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
