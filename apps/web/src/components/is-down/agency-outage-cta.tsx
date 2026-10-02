import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  FileText,
  Shield,
  Users,
  CheckCircle2,
  ShieldCheck,
  Activity,
} from "lucide-react";
import type { ServiceDownInfo } from "@/content/is-down-services";

interface AgencyOutageCtaProps {
  service?: ServiceDownInfo;
}

export function AgencyOutageCta({ service }: AgencyOutageCtaProps) {
  const serviceName = service ? service.name : "critical third-party services";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-black/[0.1] bg-[#23211a] text-white p-8 sm:p-12 md:p-16 shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ffd439]/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[11px] font-mono font-semibold uppercase tracking-wider backdrop-blur-md">
            <Activity className="size-3.5 text-[#ffd439]" />
            <span>Digital Agencies & Dev Shops</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight text-white leading-tight">
            Managing client websites that depend on {serviceName}?
          </h2>

          <p className="text-sm sm:text-base text-white/80 font-sans leading-relaxed">
            Never let clients call you about third-party downtime first. SteadyStack lets you
            monitor all your client stores and web apps, publish 100% white-label status portals on
            custom domains, and deliver automatic monthly SLA compliance PDFs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-xs font-mono text-white/70">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
              <span>100% White-label (zero vendor branding)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
              <span>Automated monthly PDF SLA reports</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
              <span>Multi-region quorum eliminates false alarms</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
              <span>Package into $500–$2,500/mo client retainers</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 w-full sm:w-auto shrink-0 relative z-10">
          <Link
            href={"/signup" as any}
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-mono font-semibold text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] text-center"
          >
            <span>Start Free Agency Trial</span>
            <ArrowRight className="size-3.5" />
          </Link>

          <Link
            href={"/agencies" as any}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white font-mono font-semibold text-xs uppercase tracking-wider transition-all text-center backdrop-blur-sm"
          >
            <Users className="size-4 text-[#ffd439]" />
            <span>Explore Agency Plan</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
