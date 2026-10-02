import { Sparkles, TrendingUp, ShieldAlert } from "lucide-react";

export default function AgencyManifesto() {
  const problems = [
    {
      title: "Developer pingers ignore the client relationship",
      description:
        "Traditional uptime monitors were built for DevOps engineers who love raw terminals and JSON graphs. But agencies don't just fix bugs—they manage client relationships. A terminal dashboard doesn't justify a $1,500/month maintenance retainer.",
    },
    {
      title: "False alarms destroy team morale and client trust",
      description:
        "Single-poller tools trigger panics whenever a regional ISP has a routing blip. Waking up an engineer at 3 AM for a false alarm—or worse, alerting a client unnecessarily—burns trust instantly.",
    },
    {
      title: "Per-seat and per-monitor pricing penalties",
      description:
        "Legacy platforms charge high per-seat and per-monitor tiers that punish agencies for scaling. Adding 30 client stores shouldn't multiply your software bill fivefold.",
    },
  ];

  const shiftChanges = [
    {
      title: "From Internal DevOps Tools &rarr; Client Deliverables",
      description:
        "Instead of keeping uptime hidden in internal engineering channels, SteadyStack turns monitoring into branded assets: white-label status portals and monthly PDF SLA audits your clients love reading.",
    },
    {
      title: "From Single Pollers &rarr; 4-of-7 Quorum Consensus",
      description:
        "We verify every failure across 7 independent edge regions before declaring an outage. Zero midnight false alarms for your developers or your clients.",
    },
    {
      title: "From Developer Terminal Jargon &rarr; Agency Margin Growth",
      description:
        "No cyberpunk themes or confusing tier codes. Clean, client-ready interfaces and flat agency pricing that lets you package uptime into recurring $500–$2,500/mo maintenance packages.",
    },
  ];

  return (
    <section
      className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative border-b border-[#e8e6df]"
      id="manifesto"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="size-3.5 text-[#ffd439]" />
            <span>The Strategic Pivot</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] mb-6 leading-[1.08]">
            Why we shifted SteadyStack from a generic developer tool to an agency platform.
          </h2>
          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed font-sans">
            Every digital agency we spoke with shared the same painful loop: they build beautiful
            web applications, host them on high-performance infrastructure, and charge monthly
            maintenance. Yet when retainer renewal comes, clients ask:{" "}
            <em className="text-[#23211a] font-semibold not-italic">
              &ldquo;What did we actually pay you for this month?&rdquo;
            </em>
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 text-left">
          {/* Left: The Old Way */}
          <div className="bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
            <div className="flex items-center gap-2 text-rose-700 font-mono text-xs font-bold uppercase tracking-wider mb-6">
              <ShieldAlert className="size-4" />
              The Old Uptime Paradigm
            </div>
            <div className="space-y-6">
              {problems.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h4 className="text-sm font-bold text-[#23211a] flex items-center gap-2 font-serif">
                    <span className="size-1.5 rounded-full bg-rose-500" />
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#5c5c5c] leading-relaxed pl-3.5 font-sans">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: The SteadyStack Agency Way */}
          <div className="bg-white border border-[#23211a] rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-md ring-1 ring-[#23211a]">
            <div className="flex items-center gap-2 text-[#23211a] font-mono text-xs font-bold uppercase tracking-wider mb-6">
              <TrendingUp className="size-4 text-emerald-600" />
              The SteadyStack Agency Standard
            </div>
            <div className="space-y-6">
              {shiftChanges.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <h4
                    className="text-sm font-bold text-[#23211a] flex items-center gap-2 font-serif"
                    dangerouslySetInnerHTML={{ __html: item.title }}
                  />
                  <p className="text-xs text-[#5c5c5c] leading-relaxed pl-3.5 font-sans">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Agency Quote / Principle */}
        <div className="p-8 rounded-2xl bg-white border border-[#e8e6df] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs text-left">
          <div className="space-y-1">
            <div className="text-xs font-mono text-[#868279] font-bold uppercase tracking-wider">
              Core Agency Principle
            </div>
            <p className="text-base sm:text-lg font-serif font-medium text-[#23211a]">
              &ldquo;Agencies don&apos;t buy infrastructure metrics. They buy tangible assets they
              can put in front of their clients.&rdquo;
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="size-10 rounded-full bg-[#f4f2eb] border border-[#e8e6df] flex items-center justify-center font-mono font-bold text-[#23211a] text-xs">
              SS
            </div>
            <div className="text-left font-sans">
              <div className="text-xs font-bold text-[#23211a]">SteadyStack Engineering</div>
              <div className="text-[11px] text-[#868279] font-mono">Agency Platform Manifesto</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
