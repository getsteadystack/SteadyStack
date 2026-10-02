import {
  Globe,
  FileText,
  Users,
  ShieldCheck,
  DollarSign,
  Layers,
  CheckCircle2,
} from "lucide-react";

export default function AgencyPillars() {
  const pillars = [
    {
      number: "01",
      title: "Multi-Client Workspaces",
      badge: "Organization Isolation",
      tagline: "Manage dozens of client brands from a single pane of glass.",
      description:
        "Isolate client monitors, incident histories, and status configurations into dedicated client workspaces. Invite client stakeholders with read-only view access without revealing other clients or backend webhook secrets.",
      icon: Users,
      highlights: [
        "Granular per-client role access control (RBAC)",
        "Zero cross-client data leakage",
        "Instant client switcher in dashboard header",
      ],
    },
    {
      number: "02",
      title: "100% White-Label Status Pages",
      badge: "Custom CNAME & SSL",
      tagline: "Your client's branding, custom domain, and zero SteadyStack logos.",
      description:
        "Every client gets a dedicated status portal hosted at status.clientbrand.com with automatic SSL provisioning, custom logo, favicons, custom theme colors, and component group toggles.",
      icon: Globe,
      highlights: [
        "Automated Edge SSL via Cloudflare CNAME",
        "Component breakdown: Web, APIs, Checkout, DB",
        "Custom email & SMS subscriber notifications",
      ],
    },
    {
      number: "03",
      title: "Automated Monthly SLA Audit Reports",
      badge: "Automated PDF Delivery",
      tagline: "Send branded proof of uptime directly to client inboxes on the 1st of every month.",
      description:
        "SteadyStack compiles 30-day uptime percentages, regional latency charts across 7 global regions, and incident resolution notes into a polished PDF report branded with your agency's logo.",
      icon: FileText,
      highlights: [
        "Monthly automated delivery to client stakeholders",
        "Quantified SLA compliance (e.g. 99.98% vs 99.90%)",
        "Executive summaries that justify maintenance retainers",
      ],
    },
    {
      number: "04",
      title: "4-of-7 Quorum Verification",
      badge: "Zero False Alarms",
      tagline: "Alerts only fire when an outage is mathematically confirmed.",
      description:
        "Single pollers wake engineers up over local ISP routing hiccups. SteadyStack cross-checks every failure across 7 global regions. An incident is only declared when 4 or more sovereign regions agree.",
      icon: ShieldCheck,
      highlights: [
        "7 global regions: US West, US East, EU West, APAC & more",
        "Out-of-band sentinel verification eliminates edge outages",
        "Zero embarrassing false alarm emails to clients",
      ],
    },
    {
      number: "05",
      title: "Flat Agency Pricing & Margin Expansion",
      badge: "No Per-Seat Trap",
      tagline: "Predictable software costs so your agency retains maximum margin.",
      description:
        "We don't charge punitive per-seat fees. On Agency ($39/mo) and Agency Pro ($99/mo), manage client workspaces, white-label portals, and automated PDF reports while packaging uptime into $500–$2,500/mo client retainers.",
      icon: DollarSign,
      highlights: [
        "Free tier includes 1–2 clients & 50 monitors",
        "Bundle into $500–$2,500/mo maintenance retainers",
        "No hidden add-on costs or sudden overage bills",
      ],
    },
  ];

  return (
    <section
      className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative border-b border-[#e8e6df]"
      id="pillars"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Layers className="size-3.5 text-[#23211a]" />
            <span>The 5 Pillars</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] mb-6 leading-[1.08]">
            What the agency platform entails.
          </h2>
          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed font-sans">
            Here are the core technical and operational pillars engineered specifically to help
            digital agencies protect client uptime, eliminate false alarms, and retain high-margin
            contracts.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="space-y-6">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.number}
                className="bg-white border border-[#e8e6df] hover:border-black/20 rounded-2xl p-6 sm:p-8 transition-all duration-300 group hover:shadow-[0_16px_36px_rgba(0,0,0,0.06)] relative overflow-hidden text-left"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left Column */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#23211a] px-2.5 py-1 rounded-md bg-[#f4f2eb] border border-[#e8e6df]">
                        {p.number}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-wider text-[#868279] font-semibold">
                        {p.badge}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-serif font-medium text-[#23211a] tracking-tight flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#f4f2eb] border border-[#e8e6df] text-[#23211a] group-hover:scale-105 transition-transform">
                        <Icon className="size-5" />
                      </div>
                      {p.title}
                    </h3>

                    <p className="text-xs font-mono font-semibold text-[#868279]">{p.tagline}</p>

                    <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed font-sans max-w-2xl">
                      {p.description}
                    </p>
                  </div>

                  {/* Right Column / Checklist */}
                  <div className="lg:w-72 shrink-0 bg-[#fbfbf9] border border-[#e8e6df] rounded-xl p-4 font-mono text-xs space-y-2.5">
                    <div className="text-[10px] uppercase text-[#868279] font-bold tracking-wider mb-2">
                      Key Capabilities
                    </div>
                    {p.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-[#23211a] text-[11px]">
                        <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
