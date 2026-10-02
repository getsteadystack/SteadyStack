import { CheckCircle2, Loader2, ArrowUpRight, Moon } from "lucide-react";
import { LiveStatusDemo } from "./live-status-demo";
import Link from "next/link";
// aria-label placeholder

export default function Features() {
  return (
    <section
      className="py-28 bg-background relative overflow-hidden content-visibility-auto"
      id="features"
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-20">
        {/* Header */}
        <div className="max-w-2xl mb-20">
          <div className="inline-flex items-center gap-2 mb-4 text-xs font-semibold text-primary uppercase tracking-wider">
            <span>Uptime Orchestration</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-4">
            See SteadyStack in action
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Watch how global surveillance and high-frequency checks prevent latency degradation and
            downtime incidents across your system.
          </p>
        </div>

        {/* Modernist Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Live Status Demo */}
          <Link
            href={"/features/latency-grid" as any}
            className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between group hover:border-primary/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 min-h-[440px] block"
          >
            <div className="flex-1 flex flex-col justify-center mb-6">
              <div className="p-3 bg-muted/30 border border-border/60 rounded-xl shadow-sm relative overflow-hidden group-hover:border-primary/10 transition-all duration-300">
                <LiveStatusDemo />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  Live Latency Grid
                </h3>
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Probe endpoints dynamically. Run instant checks from global centers and view JSON
                payload structures.
              </p>
            </div>
          </Link>

          {/* Card 2: Incident Resolution */}
          <Link
            href={"/features/automated-dispatch" as any}
            className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between group hover:border-primary/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 min-h-[440px] block"
          >
            {/* Visual Area */}
            <div className="h-[200px] w-full mb-6 relative flex flex-col items-center justify-center p-2">
              {/* Stacked Cards */}
              <div className="relative w-full h-[120px] flex items-center justify-center">
                {/* Left Card */}
                <div className="absolute left-[5%] top-4 w-[110px] h-[75px] bg-muted/40 border border-border/80 rounded-xl flex flex-col p-3 shadow-md transform -rotate-6 transition-all duration-300 group-hover:-translate-x-2 group-hover:rotate-0">
                  <div className="w-full h-1 bg-foreground/10 rounded-full mb-2"></div>
                  <div className="w-2/3 h-1 bg-foreground/10 rounded-full"></div>
                  <CheckCircle2 className="size-3.5 text-primary absolute bottom-2.5 right-2.5" />
                </div>

                {/* Center Card */}
                <div className="absolute z-10 w-[125px] h-[85px] bg-card border border-border rounded-xl flex flex-col p-3 shadow-lg transform -translate-y-2 transition-all duration-300 group-hover:-translate-y-3.5 group-hover:border-primary/30">
                  <div className="w-full h-1 bg-foreground/20 rounded-full mb-2"></div>
                  <div className="w-2/3 h-1 bg-foreground/20 rounded-full mb-2"></div>
                  <div className="w-1/2 h-1 bg-foreground/15 rounded-full"></div>
                  <CheckCircle2 className="size-4.5 text-primary absolute bottom-2.5 right-2.5" />
                </div>

                {/* Right Card */}
                <div className="absolute right-[5%] top-6 w-[110px] h-[75px] bg-muted/40 border border-border/80 rounded-xl flex flex-col p-3 shadow-md transform rotate-6 transition-all duration-300 group-hover:translate-x-2 group-hover:rotate-0">
                  <div className="w-full h-1 bg-foreground/10 rounded-full mb-2"></div>
                  <div className="w-[80%] h-1 bg-foreground/10 rounded-full"></div>
                  <Loader2 className="size-3.5 text-primary/70 animate-spin absolute bottom-2.5 right-2.5" />
                </div>
              </div>

              {/* Progress Bars */}
              <div className="w-full flex gap-3 mt-auto mb-2 px-4">
                <div className="flex-1 flex items-center gap-1.5 text-[9px] font-medium text-muted-foreground">
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/70 w-[87%] transition-all duration-500 group-hover:bg-primary"></div>
                  </div>
                  <span>87%</span>
                </div>
                <div className="flex-1 flex items-center gap-1.5 text-[9px] font-medium text-muted-foreground">
                  <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary/50 w-[92%] transition-all duration-500 group-hover:bg-primary"></div>
                  </div>
                  <span>92%</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  Automated Dispatch
                </h3>
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect channels effortlessly. Resolve complex outages by triggering webhook
                integrations and alerts.
              </p>
            </div>
          </Link>

          {/* Card 3: Multi-Region Support */}
          <Link
            href={"/features/global-verification" as any}
            className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between group hover:border-primary/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 min-h-[440px] block"
          >
            {/* Visual Area */}
            <div className="h-[200px] w-full mb-6 relative flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
                <circle
                  cx="150"
                  cy="100"
                  r="60"
                  fill="none"
                  stroke="currentColor"
                  className="text-border/40"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <circle
                  cx="150"
                  cy="100"
                  r="35"
                  fill="none"
                  stroke="currentColor"
                  className="text-border/40"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                {/* Lines radiating */}
                <line
                  x1="150"
                  y1="100"
                  x2="70"
                  y2="50"
                  stroke="currentColor"
                  className="text-border/60 group-hover:text-primary transition-all duration-300"
                  strokeWidth="1"
                />
                <line
                  x1="150"
                  y1="100"
                  x2="230"
                  y2="50"
                  stroke="currentColor"
                  className="text-border/60 group-hover:text-primary transition-all duration-300"
                  strokeWidth="1"
                />
                <line
                  x1="150"
                  y1="100"
                  x2="70"
                  y2="150"
                  stroke="currentColor"
                  className="text-border/60 group-hover:text-primary transition-all duration-300"
                  strokeWidth="1"
                />
                <line
                  x1="150"
                  y1="100"
                  x2="230"
                  y2="150"
                  stroke="currentColor"
                  className="text-border/60 group-hover:text-primary transition-all duration-300"
                  strokeWidth="1"
                />
              </svg>

              {/* Center Glowing Hub */}
              <div className="absolute z-10 size-10 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary/10 transition-all duration-300">
                <div className="size-2 bg-primary rounded-full"></div>
              </div>

              {/* Surrounding Nodes */}
              <div className="absolute top-[28px] left-[55px] size-7 bg-muted/60 border border-border/80 rounded-lg flex items-center justify-center text-muted-foreground group-hover:border-primary/25 transition-all text-[8px] font-bold font-mono">
                NYC
              </div>
              <div className="absolute top-[28px] right-[55px] size-7 bg-muted/60 border border-border/80 rounded-lg flex items-center justify-center text-muted-foreground group-hover:border-primary/25 transition-all text-[8px] font-bold font-mono">
                FRA
              </div>
              <div className="absolute bottom-[28px] left-[55px] size-7 bg-muted/60 border border-border/80 rounded-lg flex items-center justify-center text-muted-foreground group-hover:border-primary/25 transition-all text-[8px] font-bold font-mono">
                LND
              </div>
              <div className="absolute bottom-[28px] right-[55px] size-7 bg-muted/60 border border-border/80 rounded-lg flex items-center justify-center text-muted-foreground group-hover:border-primary/25 transition-all text-[8px] font-bold font-mono">
                TYO
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-foreground tracking-tight">
                  Global Verification
                </h3>
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Eliminate localized errors. Nodes cross-reference downtime signatures dynamically
                before triggering pages.
              </p>
            </div>
          </Link>

          {/* Card 4: Client Status Pages */}
          <Link
            href={"/showcase" as any}
            className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between group hover:border-primary/30 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 min-h-[440px] block relative overflow-hidden"
          >
            {/* Visual Area */}
            <div className="h-[200px] w-full mb-6 relative flex flex-col items-center justify-center p-2">
              <div className="w-full max-w-[200px] bg-card border border-border/80 rounded-xl p-3 shadow-md space-y-2.5 group-hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                  <span className="text-[9px] font-mono text-muted-foreground truncate">
                    status.client.com
                  </span>
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground">Operational</span>
                  <span className="text-[9px] font-mono text-primary font-bold">99.99%</span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-3 rounded-xs bg-emerald-500/80 group-hover:bg-emerald-500 transition-colors"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
                  <span>Client Status Pages</span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">
                    White-Label
                  </span>
                </h3>
                <ArrowUpRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deploy branded status portals on custom domains. Keep clients informed and display
                verifiable multi-region SLA history with zero vendor branding.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
