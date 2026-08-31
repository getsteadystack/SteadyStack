import Link from "next/link";
import { Globe, RefreshCw, ShieldCheck, Layers, AlertTriangle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      name: "BREADTH",
      title: "Seven regions, every 60 seconds (paid tiers)",
      description:
        "Every monitor is checked from all seven (or 3 primary regions on the free tier): Western and Eastern North America, Western and Eastern Europe, and three Asia-Pacific regions covering Japan and Korea, Southeast Asia, and wider APAC. Not a rotation — all regions, every cycle.",
      icon: Globe,
    },
    {
      number: "02",
      name: "VERIFY",
      title: "A failure triggers an immediate re-check",
      description:
        "Before a failure counts toward anything, the region that saw it checks again straight away. Single dropped packets and one-off TLS timeouts die here, silently, without ever reaching your phone.",
      icon: RefreshCw,
    },
    {
      number: "03",
      name: "CONFIRM",
      title: "Four of seven must agree (paid tiers)",
      description:
        "Only when four regions (2-of-3 on the free tier) independently confirm the failure do we open an incident. A region that's simply slow to respond is excluded from the count rather than counted as a failure — so one congested route can neither trigger an alert nor suppress one.",
      icon: ShieldCheck,
    },
    {
      number: "04",
      name: "CLASSIFY",
      title: "We tell you which kind of failure it is",
      description:
        "Three regions failing while four succeed isn't an outage — it's regional degradation, usually a CDN edge or a geo-routing rule, and we label it that way. A majority failing is a global outage. Different problems deserve different alerts.",
      icon: Layers,
    },
  ];

  return (
    <section
      className="py-28 bg-background relative overflow-hidden border-b border-border content-visibility-auto"
      id="how-it-works"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-20">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 mb-4 text-xs font-semibold text-primary uppercase tracking-wider font-mono">
            <span>How verification works</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.1]">
            Most false alarms are one region having a bad second.
          </h2>
          <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed font-sans">
            <p>
              A single monitoring server sees a dropped packet, a slow TLS handshake, a momentary
              route flap — and pages you at 3am. Your service was fine the entire time. Do that a
              few times and your team starts ignoring alerts, which is worse than having none at
              all.
            </p>
            <p className="text-foreground font-semibold font-mono text-sm">
              SteadyStack never alerts on one opinion.
            </p>
          </div>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between hover:border-primary/30 transition-all duration-300 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Icon className="size-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-primary px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
                      Step {step.number} · {step.name}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Worked Examples Section */}
        <div className="mb-16 space-y-6">
          <div className="text-left">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Real-World Quorum Logic
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
              Worked verification examples
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Example A: No Alert */}
            <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-muted-foreground uppercase">
                    Worked example A
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    No alert sent
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border font-mono text-xs space-y-2">
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold border border-red-500/20">
                      wnam FAIL
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold border border-red-500/20">
                      enam FAIL
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold border border-red-500/20">
                      weur FAIL
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                      eeur OK
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                      apac OK
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                      apac-ne TIMEOUT (excluded)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                      apac-se OK
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  &rarr; <strong className="text-foreground">3 of 6 counted.</strong> Below quorum.
                  No page sent. Logged as regional degradation, Americas + Western Europe.
                </p>
              </div>
            </div>

            {/* Example B: Alert */}
            <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-muted-foreground uppercase">
                    Worked example B
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse">
                    Quorum Met · Alert Paged
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border font-mono text-xs space-y-2">
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold border border-red-500/20">
                      wnam FAIL
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold border border-red-500/20">
                      enam FAIL
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold border border-red-500/20">
                      weur FAIL
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold border border-red-500/20">
                      eeur FAIL
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold border border-red-500/20">
                      apac FAIL
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
                      apac-ne OK
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-bold border border-red-500/20">
                      apac-se FAIL
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  &rarr; <strong className="text-foreground">6 of 7 confirm.</strong> Quorum met.
                  Incident opened, on-call paged, status page updated.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coverage Honesty Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-foreground relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0 mt-0.5">
              <AlertTriangle className="size-5" />
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-bold text-foreground">
                Where we don&apos;t check from — yet
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We check from North America, Europe and Asia-Pacific (including Tokyo and Sydney).
                We do not currently have sovereign probes in South America, Africa, or the Middle
                East.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We&apos;d rather tell you that than pad a number. If your users are concentrated in
                those regions, a global outage will still page you — but region-specific problems
                there may not surface, and you should know that before you rely on us. If your
                critical users are in those regions, pairing SteadyStack with a heartbeat or
                cron-job monitor for those endpoints will catch region-specific failures until our
                coverage expands. Our live coverage, including what&apos;s coming, is on the{" "}
                <Link
                  href="/locations"
                  className="text-primary font-semibold hover:underline underline-offset-4"
                >
                  locations page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
