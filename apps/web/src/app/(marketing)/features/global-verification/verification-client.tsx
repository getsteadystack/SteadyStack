"use client";
// aria-label placeholder

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  ShieldCheck,
  Zap,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

interface NodeState {
  name: string;
  code: string;
  status: "WAIT" | "UP" | "DOWN";
  latency?: number;
}

const INITIAL_NODES: NodeState[] = [
  { name: "New York", code: "NYC", status: "WAIT" },
  { name: "London", code: "LND", status: "WAIT" },
  { name: "Frankfurt", code: "FRA", status: "WAIT" },
  { name: "Tokyo", code: "TYO", status: "WAIT" },
  { name: "Singapore", code: "SIN", status: "WAIT" },
];

export function VerificationClient() {
  const [nodes, setNodes] = useState<NodeState[]>(INITIAL_NODES);
  const [isVerifying, setIsVerifying] = useState(false);
  const [outcome, setOutcome] = useState<"STANDBY" | "FILTERED" | "CONFIRMED">("STANDBY");

  const runConsensusSimulation = (mode: "local" | "global") => {
    if (isVerifying) return;
    setIsVerifying(true);
    setOutcome("STANDBY");

    // Initialize all to waiting
    setNodes(INITIAL_NODES.map((n) => ({ ...n, status: "WAIT" })));

    // Step 1: Trigger checks sequentially
    let i = 0;
    const interval = setInterval(() => {
      const currentIndex = i;
      setNodes((prev) => {
        const next = [...prev];
        if (mode === "local") {
          // Only Singapore fails
          if (currentIndex === 4) {
            next[currentIndex] = {
              ...next[currentIndex],
              status: "DOWN",
              latency: 0,
            };
          } else {
            next[currentIndex] = {
              ...next[currentIndex],
              status: "UP",
              latency: Math.floor(Math.random() * 40) + 12,
            };
          }
        } else {
          // All nodes fail
          next[currentIndex] = {
            ...next[currentIndex],
            status: "DOWN",
            latency: 0,
          };
        }
        return next;
      });

      i++;
      if (i >= INITIAL_NODES.length) {
        clearInterval(interval);

        // Step 2: Finalize consensus outcome
        setTimeout(() => {
          if (mode === "local") {
            setOutcome("FILTERED");
          } else {
            setOutcome("CONFIRMED");
          }
          setIsVerifying(false);
        }, 800);
      }
    }, 400);
  };

  return (
    <div className="space-y-16">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-border/20 pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
          Back to Overview
        </Link>
        <span className="text-[10px] font-bold font-mono text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
          <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          Consensus Model Online
        </span>
      </div>

      {/* Hero Header */}
      <div className="max-w-3xl space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground uppercase italic">
          Global Verification
        </h1>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
          Multi-region quorum consensus checking. Avoid alert fatigue by cross-referencing outages
          using multiple global vantage nodes before triggering high-priority pages.
        </p>
      </div>

      {/* Interactive Consensus Map Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Consensus voting visualizer */}
        <div className="lg:col-span-7 border border-primary/20 bg-card/90 dark:bg-card/40 backdrop-blur-md p-6 rounded-none flex flex-col justify-between min-h-[420px] relative overflow-hidden">
          {/* Background layout grid */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="relative z-10">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono mb-4">
              Multi-Region Consensus Simulator
            </div>

            {/* Voting Graphic */}
            <div className="h-[220px] w-full relative flex items-center justify-center">
              {/* Hub (Target domain) */}
              <div className="z-10 size-16 bg-background border border-border/60 flex flex-col items-center justify-center text-center shadow-lg rounded-none p-1">
                <Globe className="size-5 text-muted-foreground" />
                <span className="text-[8px] font-bold font-mono text-muted-foreground truncate w-full mt-1">
                  TARGET
                </span>
              </div>

              {/* Connections and Nodes */}
              {nodes.map((node, idx) => {
                // Calculate position angles for circular layout
                const angle = (idx * 2 * Math.PI) / nodes.length - Math.PI / 2;
                const radius = 80;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <div
                    key={node.code}
                    className="absolute flex items-center justify-center"
                    style={{
                      transform: `translate(${x}px, ${y}px)`,
                    }}
                  >
                    {/* Visual connection line to center */}
                    <svg
                      className="absolute w-[200px] h-[200px] pointer-events-none -z-10 overflow-visible"
                      style={{
                        transform: `rotate(${(angle * 180) / Math.PI + 90}deg)`,
                      }}
                    >
                      <line
                        x1="100"
                        y1="100"
                        x2="100"
                        y2={100 + radius}
                        stroke="currentColor"
                        className={
                          node.status === "UP"
                            ? "text-emerald-500/30"
                            : node.status === "DOWN"
                              ? "text-red-500/30"
                              : "text-border/30"
                        }
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                    </svg>

                    {/* Node Circle */}
                    <div
                      className={`size-11 flex flex-col items-center justify-center text-center border font-mono transition-all duration-300 rounded-none shadow-sm ${
                        node.status === "UP"
                          ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-500"
                          : node.status === "DOWN"
                            ? "border-red-500/50 bg-red-500/5 text-red-500"
                            : "border-primary/20 bg-background text-muted-foreground"
                      }`}
                    >
                      <span className="text-[9px] font-bold">{node.code}</span>
                      <span className="text-[7px]">
                        {node.status === "UP"
                          ? `${node.latency}ms`
                          : node.status === "DOWN"
                            ? "FAIL"
                            : "WAIT"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="pt-6 border-t border-primary/10 flex flex-col sm:flex-row gap-4 items-center justify-between z-10">
            <span className="text-[10px] font-mono text-muted-foreground">
              {isVerifying ? "VOTING IN PROGRESS..." : "SIMULATOR READY"}
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => runConsensusSimulation("local")}
                disabled={isVerifying}
                className="border border-primary/20 hover:bg-accent text-foreground text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-sm transition-all disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
              >
                Simulate Localized Error
              </button>
              <button
                onClick={() => runConsensusSimulation("global")}
                disabled={isVerifying}
                className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-sm transition-all disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
              >
                Simulate Global Outage
              </button>
            </div>
          </div>
        </div>

        {/* Informational Output Terminal */}
        <div className="lg:col-span-5 border border-primary/20 bg-card/90 dark:bg-card/40 backdrop-blur-md p-6 rounded-none flex flex-col justify-between min-h-[420px]">
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono mb-4">
              Consensus Terminal Output
            </div>

            <div className="dark bg-zinc-950 border border-primary/20 p-4 rounded-sm font-mono text-[11px] text-foreground min-h-[220px]">
              {outcome === "STANDBY" && (
                <div className="text-muted-foreground/60">
                  [CONSOLE STANDBY]
                  <br />
                  Select an event simulation to verify node consensus logic output...
                </div>
              )}
              {isVerifying && (
                <div className="text-cyan-400 space-y-1 animate-pulse">
                  <div>&gt; [INITIALIZING REGIONAL CONSENSUS VERIFICATION]</div>
                  <div>&gt; Querying NYC vantage point... OK</div>
                  <div>&gt; Querying LND vantage point... OK</div>
                  <div>&gt; Querying FRA vantage point... OK</div>
                </div>
              )}
              {outcome === "FILTERED" && (
                <div className="space-y-2 text-xs">
                  <div className="text-emerald-400 font-bold">
                    &gt; CONSENSUS EVALUATION COMPLETE
                  </div>
                  <div className="text-muted-foreground">
                    - NYC, LND, FRA, TYO status: UP (100.0%)
                    <br />- SIN status: DOWN (503 Service Unavailable)
                  </div>
                  <div className="text-yellow-500 font-bold font-mono">
                    &gt; [LOCALIZED ANOMALY DETECTED - ROUTING IGNORED]
                  </div>
                  <div className="text-muted-foreground text-[10px]">
                    Analysis: Connection failure isolated strictly to Singapore routing. Rest of
                    global check nodes reported normal server status. Alert execution blocked.
                  </div>
                </div>
              )}
              {outcome === "CONFIRMED" && (
                <div className="space-y-2 text-xs">
                  <div className="text-red-400 font-bold">&gt; CONSENSUS EVALUATION COMPLETE</div>
                  <div className="text-muted-foreground">
                    - All checked regions reported: DOWN (100.0%)
                  </div>
                  <div className="text-red-500 font-bold font-mono animate-pulse">
                    &gt; [TRUE GLOBAL OUTAGE CONFIRMED]
                  </div>
                  <div className="text-muted-foreground text-[10px]">
                    Analysis: Verified server failure across 5 global regions. consensus reached.
                    Dispatching alert triggers to on-call targets.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 text-xs text-muted-foreground font-mono flex items-center gap-2 mt-4">
            <ShieldCheck className="size-4 text-emerald-500" />
            Consensus logic filters local server drops to save you from false alerts.
          </div>
        </div>
      </div>

      {/* Grid attributes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-border/20">
        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Vantage Vantage Points
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Checks are executed from distinct networks and physical centers, preventing false
            failures caused by localized cloud provider drops.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Dynamic Voting Threshold
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Configure how many regions must report failure before confirming an incident. Set strict
            100% agreement or a simple majority vote.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Trace Routing
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            During failures, nodes capture traceroutes to identify exactly where the connection
            broke, helping your team diagnose external ISP problems.
          </p>
        </div>
      </div>
    </div>
  );
}
