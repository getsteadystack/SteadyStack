import {
  Globe,
  FileText,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Download,
  Sparkles,
  Lock,
  Activity,
  Cpu,
} from "lucide-react";
import Link from "next/link";

export default function SolutionSection() {
  const solutions = [
    {
      id: "status-pages",
      title: "White-Label Portals Per Client",
      tagline: "Custom CNAME domain & zero vendor marks",
      description:
        "Provide each client with a dedicated status portal on their own domain (e.g. status.clientdomain.com). Customize their logo, toggle light/dark modes, and present your agency as the trusted infrastructure manager.",
      icon: Globe,
      badge: "Branded Portals",
      preview: (
        <div className="p-4 bg-[#fbfbf9] border border-[#e8e6df] rounded-xl flex flex-col gap-3 font-sans text-left">
          <div className="flex items-center justify-between pb-2 border-b border-[#e8e6df]">
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-[#23211a] text-white flex items-center justify-center text-[10px] font-bold font-mono">
                AC
              </div>
              <span className="text-xs font-bold text-[#23211a]">status.acme.com</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-semibold">
              Operational
            </span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-[#5c5c5c]">
              <span>Main Storefront & Checkout</span>
              <span className="text-emerald-600 font-mono font-semibold">99.99%</span>
            </div>
            <div className="flex items-center justify-between text-[#5c5c5c]">
              <span>Payment Webhook Ingress</span>
              <span className="text-emerald-600 font-mono font-semibold">100.0%</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-[#868279] pt-1.5 border-t border-[#e8e6df] flex items-center justify-between">
            <span>Powered by Your Agency</span>
            <span className="text-[#23211a] font-semibold">SSL Auto-Provisioned</span>
          </div>
        </div>
      ),
    },
    {
      id: "client-reports",
      title: "Automated Monthly SLA PDFs",
      tagline: "Tangible proof of uptime for retainer renewals",
      description:
        "Generate one-click or automated monthly SLA audit reports. Present clean, executive-ready proof of uptime, global latency distributions, and resolved incident logs during client check-ins.",
      icon: FileText,
      badge: "Retainer Value",
      preview: (
        <div className="p-4 bg-[#fbfbf9] border border-[#e8e6df] rounded-xl flex flex-col gap-3 font-sans text-left">
          <div className="flex items-center justify-between pb-2 border-b border-[#e8e6df]">
            <div>
              <div className="text-xs font-bold text-[#23211a]">Client Reliability Audit</div>
              <div className="text-[10px] text-[#868279] font-mono">
                October 2026 · Target: 99.90%
              </div>
            </div>
            <div className="size-6 rounded-md bg-[#ffd439]/30 border border-[#ffd439] flex items-center justify-center text-[#23211a]">
              <Download className="size-3.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div className="p-2 rounded-lg bg-white border border-[#e8e6df]">
              <div className="text-[9px] text-[#868279] uppercase font-mono font-semibold">
                Realized Uptime
              </div>
              <div className="text-sm font-bold text-emerald-600 font-mono">99.98%</div>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#e8e6df]">
              <div className="text-[9px] text-[#868279] uppercase font-mono font-semibold">
                Average Latency
              </div>
              <div className="text-sm font-bold text-[#23211a] font-mono">28ms</div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-emerald-600 flex items-center gap-1 font-medium">
            <CheckCircle2 className="size-3" /> 100% Contractual SLA Met
          </div>
        </div>
      ),
    },
    {
      id: "quorum-alerts",
      title: "Multi-Region Quorum Consensus",
      tagline: "7 global edge nodes confirm before alerting",
      description:
        "Never get woken up by an isolated ISP transit fluke or localized CDN glitch. SteadyStack validates every blip across global edge regions and requires 4-of-7 quorum consensus before firing an alert.",
      icon: ShieldCheck,
      badge: "Far Fewer False Alarms",
      preview: (
        <div className="p-4 bg-[#fbfbf9] border border-[#e8e6df] rounded-xl flex flex-col gap-3 font-sans text-left">
          <div className="flex items-center justify-between pb-2 border-b border-[#e8e6df]">
            <span className="text-xs font-bold text-[#23211a]">Quorum Confirmation Rule</span>
            <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Multi-Region Consensus
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono text-center">
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-bold">
              🇺🇸 Ashburn (200)
            </div>
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-bold">
              🇩🇪 Frankfurt (200)
            </div>
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-bold">
              🇯🇵 Tokyo (200)
            </div>
          </div>
          <div className="text-[10px] font-mono text-[#868279] pt-1 border-t border-[#e8e6df] flex items-center justify-between">
            <span>Threshold: 4/7 Nodes</span>
            <span className="text-emerald-600 font-bold">Alert Triggered: 0 (Fluke Filtered)</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section
      className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative overflow-hidden border-b border-[#e8e6df]"
      id="solution"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Section Header (Twin.so Serif Style) */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="size-3.5 text-[#ffd439]" />
            <span>Built For Agency Growth</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] mb-6 leading-[1.08] text-balance">
            Everything your team needs to deliver bulletproof client retainers.
          </h2>

          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-balance">
            Replace fragmented monitoring tools with an edge-native platform built to eliminate
            false alarms and prove ongoing infrastructure value to clients.
          </p>
        </div>

        {/* 3 Main Solutions Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {solutions.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.id}
                className="group relative bg-white border border-[#e8e6df] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-black/20 hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] transition-all duration-300 text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="size-11 rounded-xl bg-[#f4f2eb] border border-[#e8e6df] flex items-center justify-center text-[#23211a] group-hover:scale-105 transition-all duration-200">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-[#ffd439]/30 text-[#23211a] font-bold border border-[#ffd439]">
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-medium text-[#23211a] tracking-tight mb-2">
                    {s.title}
                  </h3>

                  <div className="text-xs font-mono text-[#868279] mb-3 font-medium">
                    {s.tagline}
                  </div>

                  <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed mb-6">
                    {s.description}
                  </p>
                </div>

                <div className="mt-auto">{s.preview}</div>
              </div>
            );
          })}
        </div>

        {/* Bottom Feature Pill Row */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8e6df] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono shadow-xs text-left">
          <div className="flex items-center gap-3">
            <Lock className="size-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-[#23211a]">SSL & TLS Sentinel</div>
              <div className="text-[11px] text-[#868279]">30-day early expiry alerts</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Activity className="size-4 text-[#23211a] shrink-0" />
            <div>
              <div className="font-bold text-[#23211a]">DNS Drift Tracker</div>
              <div className="text-[11px] text-[#868279]">Subdomain takeover defense</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Cpu className="size-4 text-purple-600 shrink-0" />
            <div>
              <div className="font-bold text-[#23211a]">Cron Heartbeats</div>
              <div className="text-[11px] text-[#868279]">
                Silent background worker failure detection
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-[#23211a]">50 Free Monitors</div>
              <div className="text-[11px] text-[#868279]">Forever free for developers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
