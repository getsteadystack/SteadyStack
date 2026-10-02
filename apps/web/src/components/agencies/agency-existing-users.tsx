import { Heart, Code2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AgencyExistingUsers() {
  const commitments = [
    {
      title: "The 50 Free Monitor Tier Remains 100% Free",
      description:
        "We are not cutting free monitor quotas or raising barriers for solo developers. Our generous free tier with 50 monitors, 1-minute checks, and multi-region quorum is here to stay.",
    },
    {
      title: "Developer Tools & APIs Stay First-Class",
      description:
        "The SteadyStack CLI, Terraform provider, Docker probe agent, tRPC API, and open webhook architecture continue to receive active updates. Power users can still automate everything via code.",
    },
    {
      title: "No Forced Migrations or Breaking Changes",
      description:
        "Your existing monitors, alerting rules, and status pages will continue running without disruption. Upgrading to agency white-labeling is purely optional whenever you take on client work.",
    },
    {
      title: "Freelancers Get Agency Superpowers",
      description:
        "Even if you manage just two freelance client websites, you can now deliver branded status pages and automated PDF uptime reports that make you look like a 20-person engineering firm.",
    },
  ];

  return (
    <section
      className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative border-b border-[#e8e6df]"
      id="for-developers"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="max-w-3xl mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Heart className="size-3.5 text-rose-600" />
            <span>Developer & Existing User Transparency</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] mb-6 leading-[1.08]">
            What this shift means for current users and solo developers.
          </h2>
          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed font-sans">
            SteadyStack was born in the developer community. While our strategic go-to-market is now
            focused on agencies, we are deeply committed to keeping our core platform rock-solid,
            open, and developer-friendly.
          </p>
        </div>

        {/* 4 Commitments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
          {commitments.map((c, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white border border-[#e8e6df] hover:border-black/20 shadow-xs transition-colors space-y-3"
            >
              <div className="flex items-center gap-2 text-[#23211a] font-serif text-base font-bold">
                <div className="size-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-[11px] font-mono font-bold">
                  ✓
                </div>
                {c.title}
              </div>
              <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed pl-8 font-sans">
                {c.description}
              </p>
            </div>
          ))}
        </div>

        {/* Developer Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8e6df] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs text-left">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-[#f4f2eb] border border-[#e8e6df] flex items-center justify-center text-[#23211a] shrink-0">
              <Code2 className="size-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#23211a] font-serif">
                Looking for technical documentation & CLI guides?
              </h4>
              <p className="text-xs text-[#5c5c5c] font-sans mt-0.5">
                Explore our full API reference, Terraform provider docs, and Docker probe deployment
                guide.
              </p>
            </div>
          </div>

          <Link
            href="/docs"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#23211a] hover:bg-[#373428] text-white text-xs font-mono font-semibold uppercase tracking-wider transition-colors shrink-0 shadow-xs"
          >
            <span>Read Technical Docs</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
