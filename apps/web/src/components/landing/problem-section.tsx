import {
  MessageSquareWarning,
  BellOff,
  FileQuestion,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export default function ProblemSection() {
  const problems = [
    {
      icon: MessageSquareWarning,
      tag: "Credibility Risk",
      title: "Clients find outages before you do",
      description:
        "Generic 5-minute pollers miss critical micro-outages and regional edge failures. Your client notices the checkout page is broken before your team even receives a notification.",
      mockup: {
        type: "slack",
        sender: "Sarah (Client VP of Growth)",
        time: "09:14 AM",
        message:
          "Hey team, customers are complaining on Twitter that checkout is throwing 500 errors. Is anyone looking into this?",
        status: "5-min Poller: Pending next run",
      },
    },
    {
      icon: BellOff,
      tag: "Alert Fatigue",
      title: "Woken up at 3 AM for false alarms",
      description:
        "Single-location monitors trigger on momentary ISP hiccups or transit blips. Your lead engineer is paged in the dead of night for an outage that never actually existed.",
      mockup: {
        type: "pager",
        sender: "Legacy Pager Alert",
        time: "03:22 AM",
        message:
          "CRITICAL: Kansas City probe timed out. (6 other global regions reporting 100% 200 OK)",
        status: "False Positive: Zero true outage",
      },
    },
    {
      icon: FileQuestion,
      tag: "Retainer Value",
      title: "Zero tangible proof at contract renewal",
      description:
        "When leadership asks 'What exactly are we paying for every month?', agencies scramble to stitch raw logs together instead of handing over an automated, executive-ready SLA report.",
      mockup: {
        type: "renewal",
        sender: "Q3 Client Review Meeting",
        time: "Contract Renewal",
        message:
          "“Our board is reviewing all recurring agency retainers. Can you share our monthly uptime and incident logs?”",
        status: "Manual PDF export: 4+ hrs required",
      },
    },
  ];

  return (
    <section
      className="py-24 md:py-32 bg-[#fbfbf9] text-[#23211a] relative overflow-hidden border-b border-[#e8e6df]"
      id="problem"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Section Header (Twin.so Serif Style) */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700 text-[11px] font-mono font-bold uppercase tracking-wider mb-5 shadow-xs">
            <ShieldAlert className="size-3.5" />
            <span>The Monitoring Dilemma</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] mb-6 leading-[1.08] text-balance">
            Clients shouldn&apos;t be the first to know when their site is down.
          </h2>

          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-balance">
            Traditional uptime pollers were designed for internal DevOps pipelines, not modern
            client retainers. They flood engineers with 3 AM false alarms while providing zero proof
            of value to clients.
          </p>
        </div>

        {/* 3 High-Impact Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-14">
          {problems.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white border border-[#e8e6df] rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-black/20 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-all duration-300"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="size-11 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-all duration-200">
                      <Icon className="size-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-[#f4f2eb] text-[#868279] border border-[#e8e6df] font-semibold">
                      {p.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-medium text-[#23211a] tracking-tight mb-3">
                    {p.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed mb-6">
                    {p.description}
                  </p>
                </div>

                {/* Scenario Preview Box */}
                <div className="rounded-xl border border-[#e8e6df] bg-[#fbfbf9] p-4 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-[#868279] pb-1.5 border-b border-[#e8e6df]">
                    <span className="font-bold text-[#23211a] truncate max-w-[170px]">
                      {p.mockup.sender}
                    </span>
                    <span className="text-[10px] shrink-0">{p.mockup.time}</span>
                  </div>
                  <p className="text-[11px] text-[#23211a]/85 leading-relaxed font-sans italic">
                    {p.mockup.message}
                  </p>
                  <div className="pt-1.5 border-t border-[#e8e6df] flex items-center gap-1.5 text-[10px] text-rose-600 font-semibold">
                    <AlertTriangle className="size-3 shrink-0" />
                    <span>{p.mockup.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Solution Teaser */}
        <div className="flex justify-center">
          <Link
            href="#solution"
            className="inline-flex items-center gap-2 rounded-full border border-[#e8e6df] bg-white px-5 py-2.5 text-xs font-mono font-semibold text-[#23211a] hover:bg-[#f4f2eb] transition-all shadow-xs group"
          >
            <span>See how SteadyStack eliminates all 3 problems with edge quorum</span>
            <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
