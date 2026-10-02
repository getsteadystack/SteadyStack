"use client";

import { ArrowRight, Mail } from "lucide-react";

export default function NewsletterForm() {
  return (
    <section className="border-t border-[#e8e6df] bg-[#f0ede6]/50 relative overflow-hidden py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#ffd439]/60 bg-[#ffd439]/20 text-[#23211a] text-[10px] font-bold font-mono uppercase tracking-widest rounded-full shadow-xs mb-6">
          <Mail className="size-3 text-[#23211a]" />
          Stay in the Loop
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-[#23211a] mb-4 leading-tight">
          Get monitoring insights delivered
        </h2>
        <p className="text-[#5c5c5c] text-sm leading-relaxed max-w-md mx-auto mb-8 font-sans">
          Engineering deep dives, agency retainer playbooks, and consensus uptime architecture. No
          spam &mdash; unsubscribe anytime.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="you@agency.com"
            className="flex-1 h-11 px-4 bg-white border border-[#e8e6df] rounded-xl text-xs font-mono text-[#23211a] placeholder:text-[#868279] outline-none focus:border-[#23211a] transition-all shadow-xs"
          />
          <button
            type="submit"
            className="h-11 px-6 bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-mono font-semibold uppercase tracking-wider text-xs rounded-xl transition-all duration-200 shrink-0 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Subscribe</span>
            <ArrowRight className="size-3.5" />
          </button>
        </form>
      </div>
    </section>
  );
}
