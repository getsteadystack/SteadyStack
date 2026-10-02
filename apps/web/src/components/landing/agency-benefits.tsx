import { Globe, FileText, ShieldCheck, ArrowRight, CheckCircle2, Download } from "lucide-react";
import Link from "next/link";

export default function AgencyBenefits() {
  const benefits = [
    {
      id: "status-pages",
      title: "Branded Client Status Pages",
      tagline: "Custom CNAME domains & zero vendor branding",
      description:
        "Point status portals to your client's domain (status.client.com). Add custom logos, choose light or dark themes, and completely remove vendor branding to put your agency front and center.",
      icon: Globe,
      badge: "White-Label",
      preview: (
        <div className="p-4 bg-muted/40 border border-border/80 rounded-xl flex flex-col gap-3 font-sans">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="size-5 rounded bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary font-mono">
                AC
              </div>
              <span className="text-xs font-bold text-foreground">status.acmeclient.com</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
              All Systems Normal
            </span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between text-muted-foreground">
              <span>Storefront & API</span>
              <span className="text-emerald-500 font-mono font-bold">99.99%</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Checkout Flow</span>
              <span className="text-emerald-500 font-mono font-bold">100.0%</span>
            </div>
          </div>
          <div className="text-[9px] font-mono text-muted-foreground/60 pt-1 border-t border-border/40 text-right">
            Managed by Your Agency
          </div>
        </div>
      ),
    },
    {
      id: "client-reports",
      title: "Automated Monthly Client Reports",
      tagline: "PDF export & verifiable SLA audit certificates",
      description:
        "One-click monthly SLA reports showing uptime percentages, latency trends, and incident logs. Bring transparent, verifiable data to retainer check-ins and client renewal reviews.",
      icon: FileText,
      badge: "SLA Retention",
      preview: (
        <div className="p-4 bg-muted/40 border border-border/80 rounded-xl flex flex-col gap-3 font-sans">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <div>
              <div className="text-xs font-bold text-foreground">Monthly Reliability Report</div>
              <div className="text-[10px] text-muted-foreground font-mono">
                September 2026 · SLA: 99.90%
              </div>
            </div>
            <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-primary">
              <Download className="size-3.5" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2 rounded bg-card border border-border">
              <div className="text-[9px] text-muted-foreground uppercase font-mono">
                Realized Uptime
              </div>
              <div className="text-sm font-bold text-primary font-mono">99.98%</div>
            </div>
            <div className="p-2 rounded bg-card border border-border">
              <div className="text-[9px] text-muted-foreground uppercase font-mono">
                Avg Latency
              </div>
              <div className="text-sm font-bold text-foreground font-mono">38ms</div>
            </div>
          </div>
          <div className="text-[9px] font-mono text-emerald-500 flex items-center gap-1">
            <CheckCircle2 className="size-3" /> SLA Contract Guarantee Met
          </div>
        </div>
      ),
    },
    {
      id: "quorum-alerts",
      title: "Alerts You Can Actually Trust",
      tagline: "Multi-region quorum consensus eliminates false alarms",
      description:
        "Never get woken up at 3 AM for a transient local routing blip. SteadyStack probes endpoints concurrently from 7 global edge regions and requires quorum consensus before triggering an alert.",
      icon: ShieldCheck,
      badge: "Zero False Alarms",
      preview: (
        <div className="p-4 bg-muted/40 border border-border/80 rounded-xl flex flex-col gap-3 font-sans">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <span className="text-xs font-bold text-foreground">Edge Quorum Consensus</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold">
              4 of 7 Majority
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
              US-E ✓
            </div>
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
              US-W ✓
            </div>
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
              EU-W ✓
            </div>
            <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
              APAC ✓
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono leading-tight">
            Transient 1-node drop filtered out. 0 false alarms dispatched to Slack or PagerDuty.
          </p>
        </div>
      ),
    },
  ];

  return (
    <section
      className="py-24 bg-background relative overflow-hidden border-b border-border"
      id="benefits"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-20">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-mono font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="size-3.5" />
            Built For Client Retainers
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            Everything your agency needs to look <span className="text-primary">bulletproof</span>.
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Keep clients informed with white-label portals, prove your reliability with automated
            PDF reports, and eliminate the 3 AM noise of false alarms.
          </p>
        </div>

        {/* 3 Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {benefits.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.id}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div>
                  {/* Top Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                      {b.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-1 tracking-tight">
                    {b.title}
                  </h3>
                  <div className="text-xs font-mono text-primary font-semibold mb-3">
                    {b.tagline}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-sans">
                    {b.description}
                  </p>
                </div>

                {/* Visual Preview Box */}
                <div className="pt-2">{b.preview}</div>
              </div>
            );
          })}
        </div>

        {/* Action Link */}
        <div className="mt-12 text-center">
          <Link
            href="#sample-report"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-primary hover:underline underline-offset-4"
          >
            See an interactive sample client report below <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
