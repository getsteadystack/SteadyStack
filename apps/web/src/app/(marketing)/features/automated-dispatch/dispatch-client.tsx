"use client";
// aria-label placeholder
// Centered step connector lines

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Zap,
  Shield,
  AlertTriangle,
  Send,
  CheckCircle2,
  MessageSquare,
  PhoneCall,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CHANNELS = [
  {
    id: "webhook",
    name: "Custom Webhooks",
    icon: Send,
    color: "text-emerald-500",
    bg: "bg-emerald-500/5",
    desc: "Generic JSON payload POST delivery",
  },
  {
    id: "slack",
    name: "Slack Channel",
    icon: MessageSquare,
    color: "text-cyan-500",
    bg: "bg-cyan-500/5",
    desc: "Interactive channel message posts",
  },
  {
    id: "pagerduty",
    name: "PagerDuty Trigger",
    icon: PhoneCall,
    color: "text-amber-500",
    bg: "bg-amber-500/5",
    desc: "On-call rotation page alert dispatch",
  },
  {
    id: "email",
    name: "Direct Mail",
    icon: Mail,
    color: "text-muted-foreground",
    bg: "bg-muted/10",
    desc: "Detailed HTML incident status report logs",
  },
];

export function DispatchClient() {
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchStep, setDispatchStep] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState("webhook");

  const triggerDispatch = () => {
    if (isDispatching) return;
    setIsDispatching(true);
    setDispatchStep(1);

    // Step 2: Payload assembled
    setTimeout(() => {
      setDispatchStep(2);
    }, 1200);

    // Step 3: Pushing to channels
    setTimeout(() => {
      setDispatchStep(3);
    }, 2400);

    // Step 4: Complete
    setTimeout(() => {
      setDispatchStep(4);
      setIsDispatching(false);
    }, 4000);
  };

  const getPayload = () => {
    switch (selectedChannel) {
      case "webhook":
        return `{
  "event": "incident.triggered",
  "id": "inc_982x812",
  "timestamp": "${new Date().toISOString()}",
  "monitor": {
    "name": "payment-api-gateway",
    "url": "https://api.your-app.com/pay"
  },
  "metrics": {
    "status": 503,
    "error": "Service Unavailable",
    "avg_latency": "2480ms"
  }
}`;
      case "slack":
        return `{
  "text": "🚨 *CRITICAL INCIDENT DETECTED* 🚨",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Monitor:* payment-api-gateway\\n*Status:* 503 Service Unavailable\\n*Latency:* 2.4s"
      }
    }
  ]
}`;
      case "pagerduty":
        return `{
  "payload": {
    "summary": "payment-api-gateway latency exceeds 2000ms threshold",
    "timestamp": "${new Date().toISOString()}",
    "severity": "critical",
    "source": "steadystack-global-sentinel"
  },
  "routing_key": "pd_service_key_982x1"
}`;
      default:
        return `{
  "subject": "SteadyStack Alert: payment-api-gateway DEGRADED",
  "body": "Your monitor payment-api-gateway is failing health checks from Frankfurt and London nodes..."
}`;
    }
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
          Dispatcher Active
        </span>
      </div>

      {/* Hero Header */}
      <div className="max-w-3xl space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground uppercase italic">
          Automated Dispatch
        </h1>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
          Zero delay integration pipeline. Automatically dispatch alerts, invoke custom webhooks,
          and page on-call engineering schedules the instant an outage signature is validated.
        </p>
      </div>

      {/* Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Pipeline simulation visual */}
        <div className="lg:col-span-6 border border-primary/20 bg-card/90 dark:bg-card/40 backdrop-blur-md p-6 rounded-none flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono mb-6">
              Incident Dispatch Flow Simulator
            </div>

            {/* Central simulation pipeline */}
            <div className="space-y-8 relative">
              {/* Step 1: Sentinel Alert */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className={`relative z-10 p-2.5 rounded-sm border ${dispatchStep >= 1 ? "bg-red-500/10 border-red-500 text-red-500 animate-pulse" : "bg-muted/50 border-primary/20 text-muted-foreground"}`}
                  >
                    <AlertTriangle className="size-5" />
                  </div>
                  {/* Connector line 1 */}
                  <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 w-[1px] h-[34px] bg-border/20 z-0 overflow-hidden">
                    {dispatchStep >= 1 && (
                      <motion.div
                        className="w-full bg-emerald-500"
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ duration: 1 }}
                      />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-foreground">Outage Event Triggered</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {dispatchStep >= 1 ? "[Sentinel Status: FAIL]" : "[Sentinel Status: WAIT]"}
                  </div>
                </div>
              </div>

              {/* Step 2: Assembly */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className={`relative z-10 p-2.5 rounded-sm border ${dispatchStep >= 2 ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-muted/50 border-primary/20 text-muted-foreground"}`}
                  >
                    <Zap className="size-5" />
                  </div>
                  {/* Connector line 2 */}
                  <div className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 w-[1px] h-[34px] bg-border/20 z-0 overflow-hidden">
                    {dispatchStep >= 2 && (
                      <motion.div
                        className="w-full bg-emerald-500"
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ duration: 1 }}
                      />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-foreground">
                    Payload Assembly & Signing
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {dispatchStep >= 2
                      ? "[Signature Generated: verified_sha256]"
                      : "[Waiting for event...]"}
                  </div>
                </div>
              </div>

              {/* Step 3: Broadcast */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className={`relative z-10 p-2.5 rounded-sm border ${dispatchStep >= 3 ? "bg-cyan-500/10 border-cyan-500 text-cyan-500" : "bg-muted/50 border-primary/20 text-muted-foreground"}`}
                  >
                    <Send className="size-5 animate-pulse" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-foreground">
                    Multi-Channel Broadcasting
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    {dispatchStep >= 3
                      ? `[Broadcasting to ${selectedChannel.toUpperCase()}...]`
                      : "[Waiting for payload...]"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-primary/10 flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground">
              {dispatchStep === 4
                ? "✓ DISPATCH DISSEMINATED"
                : isDispatching
                  ? "PROBING SIGNAL..."
                  : "STANDBY"}
            </span>
            <button
              onClick={triggerDispatch}
              disabled={isDispatching}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-sm transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
            >
              {isDispatching ? "Dispatching..." : "Simulate Outage Alert"}
            </button>
          </div>
        </div>

        {/* Integration configuration mock */}
        <div className="lg:col-span-6 border border-primary/20 bg-card/90 dark:bg-card/40 backdrop-blur-md p-6 rounded-none flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center justify-between border-b border-primary/10 pb-4 mb-6">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                Integration Payload Console
              </span>
              <div className="flex gap-2">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setSelectedChannel(ch.id)}
                    className={`p-1.5 border rounded-sm transition-all ${selectedChannel === ch.id ? "border-emerald-500 text-emerald-500 bg-emerald-500/5" : "border-primary/20 text-muted-foreground hover:text-foreground"}`}
                    title={ch.name}
                  >
                    <ch.icon className="size-4" />
                  </button>
                ))}
              </div>
            </div>

            {/* Code Console */}
            <div className="dark bg-zinc-950 border border-primary/20 p-4 rounded-sm font-mono text-xs text-foreground overflow-auto max-h-[220px] shadow-inner">
              <pre className="text-emerald-400">{getPayload()}</pre>
            </div>
          </div>

          <div className="pt-4 text-xs text-muted-foreground font-mono flex items-center gap-2 mt-4">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Integrates instantly with PagerDuty, Slack, Opsgenie, and Discord.
          </div>
        </div>
      </div>

      {/* Feature stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-border/20">
        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Signed Webhooks
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All POST payload calls contain a custom sha256 signature header, allowing your endpoint
            to verify the integrity and origin of the request.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Retry Backoff
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Automatic retry with exponential backoff ensures delivery even during temporary network
            interruptions on third-party webhook receivers.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-mono font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Payload Customization
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Customize JSON schemas to match your internal format requirements directly inside our
            integrations panel.
          </p>
        </div>
      </div>
    </div>
  );
}
