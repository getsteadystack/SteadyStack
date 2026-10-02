import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export default function CTA() {
  return (
    <section
      className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative overflow-hidden flex justify-center px-4 sm:px-6 lg:px-8 border-b border-[#e8e6df]"
      id="cta"
    >
      <div className="w-full max-w-5xl rounded-3xl border border-black/[0.1] bg-[#23211a] text-white p-8 sm:p-14 md:p-20 flex flex-col items-center text-center relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
        {/* Soft Warm Radial Glow */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ffd439]/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[11px] font-mono font-semibold uppercase tracking-wider mb-6 backdrop-blur-md">
          <Sparkles className="size-3.5 text-[#ffd439]" />
          <span>Instant Setup in 60 Seconds</span>
        </div>

        {/* Serif Headline (Twin.so Style) */}
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-white leading-[1.06] mb-6 max-w-3xl text-balance">
          Give your clients 99.99% reliability on autopilot.
        </h2>

        <p className="text-white/80 text-base sm:text-lg max-w-2xl mb-10 font-sans leading-relaxed text-balance">
          Join digital agencies and dev studios monitoring client infrastructure with multi-region
          consensus, branded white-label status portals, and automated monthly SLA reports.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full relative z-10">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-semibold text-sm rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
          >
            <span>Start Free Agency Trial</span>
            <ArrowRight className="size-4" />
          </Link>

          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm rounded-xl transition-all w-full sm:w-auto backdrop-blur-sm"
          >
            <span>Launch Live Sandbox</span>
          </Link>
        </div>

        {/* Bottom Trust Line */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-white/60">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>No credit card required</span>
          </div>
          <span>·</span>
          <span>Free for 50 monitors</span>
          <span>·</span>
          <span>Commercial use included</span>
        </div>
      </div>
    </section>
  );
}
