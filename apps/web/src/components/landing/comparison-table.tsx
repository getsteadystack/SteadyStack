import Link from "next/link";
import { Check, X, ShieldCheck, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ComparisonTable() {
  const summaryRows = [
    {
      feature: "Outage Verification",
      description: "How failures are validated before waking up your on-call engineers",
      steadystack: "Multi-region quorum (2-of-3 free, 4-of-7 paid)",
      steadystackHighlight: "Zero false alarms",
      legacy: "Single-region check (pages on transit blips)",
      steadystackCheck: true,
      legacyCheck: false,
    },
    {
      feature: "Free Check Frequency",
      description: "Interval between synthetic health checks on the free tier",
      steadystack: "1 min to 3 min checks",
      steadystackHighlight: "400% faster detection",
      legacy: "5 min standard checks (misses short outages)",
      steadystackCheck: true,
      legacyCheck: false,
    },
    {
      feature: "Free Plan Capacity",
      description: "Number of monitored endpoints with full commercial use rights",
      steadystack: "50 endpoints · Commercial ToS guaranteed",
      steadystackHighlight: "50 monitors included",
      legacy: "10–50 monitors with upsell paywalls",
      steadystackCheck: true,
      legacyCheck: false,
    },
    {
      feature: "Public Status Pages",
      description: "Public status portal with live per-region telemetry & incident history",
      steadystack: "Hosted page free · Custom domain on Pro",
      steadystackHighlight: "Hosted page free",
      legacy: "Paid add-on ($7–$25+/mo)",
      steadystackCheck: true,
      legacyCheck: false,
    },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden border-b border-border">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-[11px] font-mono font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="size-3.5" />
            At A Glance
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            How SteadyStack <span className="text-primary">Compares</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-sans">
            Built from the ground up to eliminate false alarms and give engineering teams faster,
            more reliable edge monitoring without paying for basic features.
          </p>
        </div>

        {/* Summary Table Container */}
        <div className="border border-border bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[620px]">
              {/* Header */}
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="p-5 text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground w-2/5">
                    Feature
                  </th>
                  <th className="p-5 w-3/10 bg-primary/5 border-x border-primary/20 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                        Recommended
                      </span>
                      <span className="text-base font-extrabold text-foreground font-mono">
                        SteadyStack
                      </span>
                    </div>
                  </th>
                  <th className="p-5 w-3/10 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        Industry Standard
                      </span>
                      <span className="text-sm font-bold text-foreground font-mono">
                        Traditional Monitors
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-border/40 font-sans text-xs">
                {summaryRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                    {/* Feature Info */}
                    <td className="p-5">
                      <div className="font-semibold text-foreground text-sm font-sans">
                        {row.feature}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-normal mt-0.5">
                        {row.description}
                      </div>
                    </td>

                    {/* SteadyStack Column */}
                    <td className="p-5 text-center bg-primary/5 border-x border-primary/15 group-hover:bg-primary/10 transition-colors">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-primary">
                          <Check className="size-4 stroke-[2.5]" />
                          <span>{row.steadystackHighlight}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{row.steadystack}</span>
                      </div>
                    </td>

                    {/* Legacy Column */}
                    <td className="p-5 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                          <X className="size-3.5 text-muted-foreground/60" />
                          <span>{row.legacy}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Callout */}
          <div className="p-4 sm:p-5 bg-muted/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-muted-foreground font-mono">
              ⚡ Need deep technical specs, probe network breakdown, or full 20+ feature parity
              matrix?
            </span>
            <Link
              href="/comparison"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-8 px-4 text-xs font-mono font-bold border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 uppercase tracking-wider shrink-0",
              )}
            >
              View Full Comparison Matrix <ArrowRight className="size-3.5 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
