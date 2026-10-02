"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Globe,
  Activity,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Shield,
  KeyRound,
  Loader2,
  Server,
} from "lucide-react";
import { getPortalClientData } from "@/actions/clients";

interface PortalClientProps {
  token: string;
  initialData: any;
}

export function PortalClient({ token, initialData }: PortalClientProps) {
  const [data, setData] = useState(initialData);
  const [pin, setPin] = useState("");
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [pinError, setPinError] = useState(initialData.invalidPin ? "Incorrect PIN passcode" : "");

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setIsVerifyingPin(true);
    setPinError("");

    try {
      const res = await getPortalClientData(token, pin.trim());
      if (res.error) {
        setPinError(res.error);
      } else if (res.requiresPin && res.invalidPin) {
        setPinError("Incorrect PIN passcode. Please try again.");
      } else {
        setData(res);
      }
    } catch {
      setPinError("Failed to verify passcode. Please try again.");
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // 1. Error state (portal disabled or invalid)
  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
        <div className="max-w-md w-full p-8 rounded-3xl border border-border bg-card text-center space-y-4 shadow-xl">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto">
            <Lock className="size-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Portal Inaccessible</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.error}</p>
        </div>
      </div>
    );
  }

  // 2. PIN Entry Screen
  if (data.requiresPin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background text-foreground">
        <div className="max-w-md w-full p-8 rounded-3xl border border-border bg-card shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div
              className="flex size-12 items-center justify-center rounded-2xl mx-auto mb-3"
              style={{
                backgroundColor: `${data.color || "#10b981"}20`,
                color: data.color || "#10b981",
              }}
            >
              <KeyRound className="size-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {data.clientName} Live SLA Portal
            </h1>
            <p className="text-xs text-muted-foreground">
              This client dashboard is passcode-protected by{" "}
              <span className="font-semibold text-foreground">{data.agencyName}</span>.
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Enter Access PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                autoFocus
                className="w-full text-center text-lg tracking-widest px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
              {pinError && (
                <p className="text-xs text-destructive font-medium text-center">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!pin.trim() || isVerifyingPin}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider font-mono hover:bg-primary/90 transition-all shadow disabled:opacity-50 cursor-pointer"
            >
              {isVerifyingPin ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Unlocking Portal...</span>
                </>
              ) : (
                <span>Access Dashboard &rarr;</span>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-muted-foreground/80 font-mono">
            Encrypted & Verified by {data.agencyName}
          </div>
        </div>
      </div>
    );
  }

  // 3. Full Unlocked Client Portal
  const { client } = data;
  const brandColor = client.color || "#10b981";

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Brand Banner */}
      <header className="border-b border-border/60 bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="size-3.5 rounded-full ring-4 ring-opacity-20 animate-pulse"
              style={{ backgroundColor: brandColor }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  {client.agencyName}
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-xs font-mono text-emerald-500 font-semibold">
                  Live Telemetry
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                {client.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {client.statusPage && (
              <a
                href={
                  client.statusPage.customDomain
                    ? `https://${client.statusPage.customDomain}`
                    : `/status-page/${client.statusPage.slug}`
                }
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-mono transition-colors"
              >
                <Globe className="size-3.5 text-muted-foreground" />
                <span>Public Status Page</span>
                <ArrowUpRight className="size-3 text-muted-foreground" />
              </a>
            )}

            <a
              href={`/api/reports/pdf?clientId=${client.id}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-bold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <FileText className="size-3.5" />
              <span>Download PDF SLA</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* KPI Hero Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Uptime % */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-mono uppercase tracking-wider">
                30-Day Availability
              </span>
              <ShieldCheck
                className="size-4"
                style={{ color: client.slaMet ? "#10b981" : "#f59e0b" }}
              />
            </div>
            <div>
              <div className="text-3xl font-extrabold tracking-tight font-mono text-foreground">
                {client.globalUptime}%
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Target SLA:{" "}
                <span className="font-mono font-semibold text-foreground">{client.targetSla}%</span>
                {client.slaMet ? " (SLA Met 🟢)" : " (Degraded ⚠️)"}
              </p>
            </div>
          </div>

          {/* Average Latency */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-mono uppercase tracking-wider">Avg Global Latency</span>
              <Activity className="size-4 text-cyan-500" />
            </div>
            <div>
              <div className="text-3xl font-extrabold tracking-tight font-mono text-foreground">
                {client.avgLatency}ms
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                P95 Global Edge Response Time
              </p>
            </div>
          </div>

          {/* Monitored Endpoints */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-mono uppercase tracking-wider">Active Services</span>
              <Server className="size-4 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-extrabold tracking-tight font-mono text-foreground">
                {client.monitors.length}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Continuous 60s Multi-Region Checks
              </p>
            </div>
          </div>

          {/* Executive Audit */}
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground mb-3">
              <span className="text-xs font-mono uppercase tracking-wider">
                SLA Retainer Status
              </span>
              <CheckCircle2 className="size-4 text-emerald-500" />
            </div>
            <div>
              <div className="text-base font-bold text-foreground">Active & Protected</div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Managed 24/7 by {client.agencyName}
              </p>
            </div>
          </div>
        </section>

        {/* Monitored Services Breakdown */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Monitored Infrastructure Fleet
              </h2>
              <p className="text-xs text-muted-foreground">
                Real-time health, latency, and 30-day uptime history across all endpoints
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {client.monitors.map((m: any) => {
              const isUp = m.status === "ACTIVE" || m.status === "UP";
              return (
                <div
                  key={m.id}
                  className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card hover:border-border transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className={`size-2.5 rounded-full ${
                          isUp ? "bg-emerald-500" : "bg-destructive animate-pulse"
                        }`}
                      />
                      <span className="font-semibold text-sm text-foreground truncate">
                        {m.name}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-muted font-mono text-[10px] text-muted-foreground uppercase">
                        {m.type}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground truncate pl-4.5">
                      {m.url}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 pl-4.5 md:pl-0">
                    {/* Latency */}
                    <div className="text-right">
                      <div className="text-xs font-mono font-semibold text-foreground">
                        {m.avgLatency > 0 ? `${m.avgLatency}ms` : "—"}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-mono">
                        Latency
                      </div>
                    </div>

                    {/* Uptime % */}
                    <div className="text-right min-w-[60px]">
                      <div className="text-xs font-mono font-bold text-emerald-500">
                        {m.uptime}%
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase font-mono">
                        Uptime
                      </div>
                    </div>

                    {/* Mini Sparkline Bars */}
                    <div className="hidden sm:flex items-center gap-0.5 h-6">
                      {m.recentEvents.length > 0 ? (
                        m.recentEvents
                          .slice(0, 20)
                          .map((ev: any, idx: number) => (
                            <div
                              key={idx}
                              className={`w-1 rounded-sm h-full ${
                                ev.status === "UP" ? "bg-emerald-500/80" : "bg-destructive"
                              }`}
                              title={`${ev.status} • ${ev.latency ? `${ev.latency}ms` : ""}`}
                            />
                          ))
                      ) : (
                        <div className="text-[10px] font-mono text-muted-foreground">Active</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Agency Retainer Assurance Footer */}
        <footer className="pt-8 border-t border-border/60 text-center space-y-2">
          <p className="text-xs text-muted-foreground font-mono">
            Infrastructure SLA Retainer guaranteed by{" "}
            <span className="font-semibold text-foreground">{client.agencyName}</span>.
          </p>
          <p className="text-[11px] text-muted-foreground/60">
            Multi-region edge monitoring powered by 50+ sovereign global checkpoints.
          </p>
        </footer>
      </main>
    </div>
  );
}
