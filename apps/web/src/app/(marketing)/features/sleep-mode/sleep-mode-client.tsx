"use client";

import {
  Moon,
  ArrowLeft,
  CheckCircle2,
  Shield,
  BellOff,
  Activity,
  Radio,
  Clock,
  Globe2,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { FiveVectorSimulator } from "@/components/marketing/five-vector-simulator";

const fiveVectors = [
  {
    vector: "Vector 1",
    code: "CF-EDGE-01",
    title: "Primary Cloudflare Edge Probe",
    description:
      "Direct HTTP/TCP probe executed from the closest Cloudflare edge POP. Records status code, socket latency, and header signatures.",
    benefit: "Sub-millisecond edge dispatch with zero cold-start delay.",
    icon: Radio,
  },
  {
    vector: "Vector 2",
    code: "HOLD-1000MS",
    title: "Temporal Retrial Hold",
    description:
      "When an initial check fails, the engine waits 1,000ms with jitter before re-executing. Transient socket resets and instant blips are eliminated immediately.",
    benefit: "Filters 90%+ of sub-second network blips automatically.",
    icon: Clock,
  },
  {
    vector: "Vector 3",
    code: "MESH-18-1-0",
    title: "Proxy Mesh Alpha (Cross-Network)",
    description:
      "If the local edge still reports DOWN, a secondary independent route (Frankfurt / US-West mesh) probes the origin via an external BGP transit provider.",
    benefit: "Neutralizes localized cloud POP routing drops.",
    icon: Globe2,
  },
  {
    vector: "Vector 4",
    code: "MESH-18-1-1",
    title: "Proxy Mesh Beta (Cross-Continental)",
    description:
      "A non-overlapping secondary proxy vector queries your endpoint from another continent. If proxy infrastructure itself fails, it fails safely as inconclusive.",
    benefit: "Prevents scraper/proxy blocks from triggering false alarms.",
    icon: Layers,
  },
  {
    vector: "Vector 5",
    code: "CF-TRACE-19-3-1",
    title: "High-Fidelity Anomaly Engine",
    description:
      "Final arbitration layer compares Cloudflare Trace telemetry against historical rolling latency profiles and statistical anomaly indices.",
    benefit: "Guarantees 100% consensus before sounding high-priority pagers.",
    icon: Cpu,
  },
];

const safetyLayers = [
  {
    title: "Flapping Suppression",
    description:
      "If a service bounces UP/DOWN more than 3 times in 5 minutes, alerts are quarantined into a single calm summary instead of 30 pager pings.",
    benefit: "Stops alert storms from crash-looping containers.",
    icon: BellOff,
  },
  {
    title: "Intelligent Circuit Breaker",
    description:
      "Monitors DOWN for over an hour automatically throttle check frequency to 10-minute intervals until initial recovery is detected.",
    benefit: "Protects infrastructure and API quotas during prolonged outages.",
    icon: Activity,
  },
  {
    title: "Quiet Hours Policy",
    description:
      "Set your sleep window (e.g. 11 PM – 7 AM). Non-critical warnings queue for morning coffee, while verified P0 crashes break through.",
    benefit: "True peace of mind for solo founders and small teams.",
    icon: Moon,
  },
  {
    title: "Geographic Majority Quorum",
    description:
      "Enterprise monitors require multi-region consensus across at least 3 global continents before changing global health status.",
    benefit: "Isolates regional ISP peering partitions seamlessly.",
    icon: Shield,
  },
];

const detectionComparisons = [
  {
    label: "2-second network blip",
    without: "❌ Wakes you up at 3 AM",
    with: "✓ Filtered at Vector 2 — No alert",
  },
  {
    label: "Regional ISP / BGP outage",
    without: "❌ False positive — marks global DOWN",
    with: "✓ Filtered at Vector 3 — Mesh verified",
  },
  {
    label: "Flapping container cycle",
    without: "❌ 30+ alerts in 10 minutes",
    with: "✓ Quarantined into 1 calm summary",
  },
  {
    label: "Hard production crash (real)",
    without: "✓ Detected after 5 minutes",
    with: "✓ 5/5 Consensus in 1.8s (Netrunner)",
  },
];

export function SleepModeClient() {
  const [hoveredVector, setHoveredVector] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-20">
      {/* Navigation Breadcrumb */}
      <Link
        href="/#features"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium w-fit"
      >
        <ArrowLeft className="size-3.5" />
        Back to Overview
      </Link>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="flex-1 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold font-mono uppercase tracking-widest w-fit">
            <Moon className="size-3" />
            Sleep Mode Engine
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            If we call you at <span className="text-primary">3 AM</span>,
            <br />
            <span className="underline decoration-primary/30 decoration-2 underline-offset-4">
              it&apos;s real.
            </span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg">
            Solo devs hate waking up for false alarms. SteadyStack runs every check through a{" "}
            <strong className="text-foreground font-semibold">
              5-vector verification pipeline
            </strong>{" "}
            before alerting you. Two-second blips, regional ISP hiccups, and flapping containers get
            filtered. Real outages break through.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/signup?plan=netrunner"
              className="inline-flex items-center gap-2 h-11 px-6 bg-primary text-primary-foreground font-bold text-xs rounded-lg border border-primary hover:bg-primary/90 transition-all shadow-sm"
            >
              <Sparkles className="size-3.5" />
              Get The Sleep Plan — $19/mo
            </Link>
            <Link
              href="/#pricing"
              className="inline-flex items-center h-11 px-6 text-muted-foreground hover:text-foreground font-semibold text-xs rounded-lg border border-border hover:border-primary/30 transition-all"
            >
              Compare Plans
            </Link>
          </div>
        </div>

        {/* Visual: The Sleep Promise */}
        <div className="flex-1 w-full">
          <div className="border border-border bg-card rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/[0.04] rounded-full blur-3xl" />
            <div className="flex flex-col gap-4 relative">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Moon className="size-4 text-primary" />
                  <span className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
                    The Sleep Promise
                  </span>
                </div>
                <span className="text-[10px] font-mono text-primary font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                  99.4% Noise-Free
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {detectionComparisons.map((item, idx) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border border-border/60 bg-black/30 p-3 rounded-lg flex items-center justify-between gap-4"
                  >
                    <span className="text-xs font-mono text-foreground font-medium min-w-[150px]">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-mono text-red-400/80 text-right">
                      {item.without}
                    </span>
                    <span className="text-[10px] font-mono text-primary font-bold text-right">
                      {item.with}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-border/40 pt-3 mt-1">
                <p className="text-[11px] text-muted-foreground font-mono leading-relaxed text-center">
                  SteadyStack&apos;s 5-vector verification completes in &lt;1.8s before any alert is
                  dispatched. If your phone buzzes, your origin is genuinely down.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 5-Vector Pipeline Simulator */}
      <section className="flex flex-col gap-6">
        <FiveVectorSimulator />
      </section>

      {/* The 5 Vectors Detailed Stack */}
      <section className="flex flex-col gap-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 mb-3 text-xs font-semibold text-primary uppercase tracking-wider font-mono">
            <span>Core Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            The 5-Vector Verification Stack
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Every potential failure is cross-examined across five distinct, non-correlated vectors.
            An alert is only triggered when true global consensus confirms the outage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fiveVectors.map((step, idx) => {
            const Icon = step.icon;
            const isHovered = hoveredVector === idx;
            return (
              <motion.div
                key={step.vector}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                onMouseEnter={() => setHoveredVector(idx)}
                onMouseLeave={() => setHoveredVector(null)}
                className={`border rounded-xl p-6 transition-all duration-300 flex flex-col justify-between ${
                  isHovered
                    ? "border-primary/40 bg-primary/[0.03] shadow-sm"
                    : "border-border/70 bg-card"
                } ${idx === 4 ? "md:col-span-2 lg:col-span-1" : ""}`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-2.5 rounded-lg border transition-colors ${
                        isHovered
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-muted/30 border-border/60 text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-primary/5 border border-primary/20">
                        {step.vector}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground/70">
                        {step.code}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {step.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-medium text-primary leading-tight">
                    {step.benefit}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Auxiliary Defense Layers */}
      <section className="flex flex-col gap-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-3 text-xs font-semibold text-primary uppercase tracking-wider font-mono">
            <span>Auxiliary Defenses</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            Multi-Layer Noise Defense
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Beyond vector verification, SteadyStack deploys intelligent dampers so unstable
            microservices and flapping containers don&apos;t spam your phone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {safetyLayers.map((layer, idx) => {
            const Icon = layer.icon;
            return (
              <div
                key={layer.title}
                className="border border-border/70 bg-card rounded-xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-muted/30 border border-border/60 rounded-lg text-primary">
                      <Icon className="size-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">{layer.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {layer.description}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 pt-2 border-t border-border/30">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span className="text-[11px] font-mono text-primary">{layer.benefit}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Anchor */}
      <div className="border border-primary/20 bg-primary/[0.02] p-8 md:p-12 text-center rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.02] to-transparent pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold font-mono uppercase tracking-widest mb-4">
            <Moon className="size-3" />
            The Sleep Plan
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-3">
            Upgrade to Netrunner — <span className="text-primary">$19/mo</span>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto mb-6">
            The Sleep Plan isn&apos;t a gimmick — it&apos;s our Netrunner tier with 30-second
            checks, 5-vector verification, anomaly detection, and flapping suppression. You get
            alerts accurate enough to trust with your sleep.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {[
              "5-Vector Verification",
              "30-Second Checks",
              "Multi-Region Mesh",
              "Anomaly Detection",
              "Flapping Suppression",
              "Circuit Breaker",
              "250 Monitors",
            ].map((feature) => (
              <span
                key={feature}
                className="text-[10px] font-mono text-muted-foreground border border-border/50 bg-card px-2.5 py-1 rounded"
              >
                {feature}
              </span>
            ))}
          </div>
          <Link
            href="/signup?plan=netrunner"
            className="inline-flex items-center gap-1.5 h-11 px-8 bg-primary text-primary-foreground font-bold text-sm rounded-lg border border-primary hover:bg-primary/90 transition-all shadow-sm"
          >
            Get The Sleep Plan — $19/mo
          </Link>
        </div>
      </div>
    </div>
  );
}
