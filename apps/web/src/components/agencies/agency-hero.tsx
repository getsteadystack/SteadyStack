"use client";

import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Sparkles } from "lucide-react";

export default function AgencyHero() {
  return (
    <section className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative overflow-hidden border-b border-[#e8e6df]">
      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-20 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-[11px] font-mono font-bold uppercase tracking-wider mb-6 shadow-xs">
          <Sparkles className="size-3.5 text-[#ffd439]" />
          <span>The SteadyStack Agency Shift</span>
        </div>

        {/* Title (Twin.so Serif Style) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium tracking-tight text-[#23211a] max-w-4xl leading-[1.08] mb-6 text-balance">
          Uptime monitoring built for{" "}
          <span className="italic font-normal">agencies and client retainers</span>.
        </h1>

        {/* Subhead */}
        <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed max-w-2xl mb-8 font-sans text-balance">
          We shifted our focus entirely to digital agencies, web studios, and dev shops. Deliver
          white-label status pages, automated monthly SLA reports, and zero false alarms to every
          client you manage.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
          <Link
            href="/signup"
            className="flex items-center justify-center h-12 px-7 bg-[#23211a] hover:bg-[#373428] text-white text-xs font-semibold rounded-xl transition-all shadow-md font-mono uppercase tracking-wider cursor-pointer"
          >
            Start Free Agency Account (50 Monitors) &rarr;
          </Link>
          <a
            href="#pillars"
            className="flex items-center justify-center h-12 px-6 bg-white border border-[#e8e6df] text-[#23211a] hover:bg-[#f4f2eb] text-xs font-semibold rounded-xl transition-colors font-mono uppercase tracking-wider cursor-pointer shadow-xs"
          >
            Explore What&apos;s Included <ArrowRight className="ml-2 size-3.5" />
          </a>
        </div>

        {/* Quick Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl text-xs font-mono text-[#5c5c5c] border border-[#e8e6df] p-4 bg-white rounded-2xl shadow-xs">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>100% White-label CNAME portals</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>Automated monthly SLA PDFs</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            <span>Zero 3 AM false alarms (quorum)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
