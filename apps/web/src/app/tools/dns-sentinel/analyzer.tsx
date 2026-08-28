"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Activity,
  Lock,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  Search,
  Zap,
  Loader2,
  Globe,
  Mail,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { GlitchText } from "@/components/ui/effects/glitch-text";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787";

interface DNSResult {
  key: string;
  status: "SECURE" | "WARNING" | "CRITICAL";
  value: string;
  desc: string;
}

interface AuditData {
  domain: string;
  score: number;
  grade: string;
  results: DNSResult[];
  raw: any;
}

export function DNSAnalyzer() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [auditData, setAuditData] = useState<AuditData | null>(null);

  const resolveSteps = [
    "Establishing root handle...",
    "Querying authoritative nameservers...",
    "Resolving MX records...",
    "Scanning SPF policy...",
    "Verifying DMARC integrity...",
    "Calculating integrity score...",
  ];

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    setIsAuditing(true);
    setAuditData(null);
    setActiveStep(0);

    for (let i = 0; i < resolveSteps.length; i++) {
      setActiveStep(i);
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    }

    try {
      const res = await fetch(`${WORKER_URL}/api/dns-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      if (!res.ok) throw new Error("DNS probe failed");
      const data = (await res.json()) as AuditData;
      setAuditData(data);
      toast.success("DNS Audit Sequence Completed");
    } catch (err) {
      toast.error("Network interface error. Local worker inactive.");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-primary/20 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-mono uppercase tracking-tighter italic text-lg leading-none">
                DNS Integrity Sentinel
              </CardTitle>
              <CardDescription className="font-mono text-[10px] opacity-60 uppercase tracking-widest mt-1">
                Audit MX, SPF, & DMARC Health Score
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAudit} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="TARGET_DOMAIN (e.g. cloudflare.com)"
                className="pl-10 h-12 bg-background/50 border-primary/20 font-mono text-sm focus-visible:ring-primary/40"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="h-12 px-8 font-mono font-bold uppercase tracking-tighter"
              disabled={isAuditing || !domain}
            >
              {isAuditing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              {isAuditing ? "Scanning Records..." : "Execute DNS Audit"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {isAuditing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-16 space-y-8"
          >
            <div className="flex gap-2">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-8 bg-primary/20"
                  animate={{
                    height: activeStep >= i ? [8, 32, 8] : 8,
                    backgroundColor:
                      activeStep >= i ? ["#22c55e", "#16a34a", "#22c55e"] : "#22c55e33",
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              ))}
            </div>
            <div className="text-center space-y-2">
              <GlitchText
                text={resolveSteps[activeStep]}
                className="text-primary font-mono text-xl uppercase tracking-tighter italic"
              />
              <div className="text-[10px] font-mono text-primary/40 uppercase tracking-[0.3em] font-bold">
                Query: {domain}
              </div>
            </div>
          </motion.div>
        )}

        {auditData && !isAuditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Summary Scoreboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="md:col-span-1 bg-card border border-primary/20 flex flex-col items-center justify-center py-12 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <div className="text-[10px] font-mono text-primary/60 uppercase tracking-widest absolute top-4">
                  Integrity Level
                </div>
                <div className="text-8xl font-black font-mono text-primary italic tracking-tighter group-hover:scale-110 transition-transform">
                  {auditData.grade}
                </div>
              </Card>

              <div className="md:col-span-3 grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Deliverability",
                    val: `${auditData.score}%`,
                    icon: <Mail className="w-4 h-4 text-primary" />,
                  },
                  {
                    label: "Security Nodes",
                    val: auditData.results.filter((r) => r.status === "SECURE").length,
                    icon: <ShieldCheck className="w-4 h-4 text-primary" />,
                  },
                  {
                    label: "Total Records",
                    val: Object.keys(auditData.raw).length,
                    icon: <Activity className="w-4 h-4 text-primary" />,
                  },
                ].map((stat) => (
                  <Card
                    key={stat.label}
                    className="bg-card/40 border border-primary/10 p-6 space-y-2 group hover:bg-card/60 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {stat.icon}
                      <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-widest">
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-3xl font-mono font-black text-foreground italic">
                      {stat.val}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Resolution Table */}
            <div className="space-y-4">
              <h2 className="font-mono text-sm uppercase tracking-[0.2em] text-primary/80 flex items-center gap-2 pl-1">
                <Filter className="w-4 h-4" /> Analyzed Records
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {auditData.results.map((res, idx) => (
                  <motion.div
                    key={res.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card
                      className={cn(
                        "bg-card/60 border hover:shadow-[0_0_20px_rgba(34,197,94,0.05)] transition-all",
                        res.status === "SECURE"
                          ? "border-primary/20"
                          : res.status === "CRITICAL"
                            ? "border-red-500/30"
                            : "border-yellow-500/30",
                      )}
                    >
                      <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-3">
                            {res.status === "SECURE" ? (
                              <ShieldCheck className="w-5 h-5 text-primary" />
                            ) : (
                              <ShieldAlert className="w-5 h-5 text-red-500" />
                            )}
                            <span className="font-mono text-lg font-black italic text-foreground">
                              {res.key}
                            </span>
                            <Badge
                              className={cn(
                                "text-[9px] uppercase font-mono italic h-5 border-none",
                                res.status === "SECURE"
                                  ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                                  : res.status === "CRITICAL"
                                    ? "bg-red-500 text-white"
                                    : "bg-yellow-500 text-black",
                              )}
                            >
                              {res.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                            {res.desc}
                          </p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg border border-border max-w-sm w-full truncate font-mono text-[11px] text-muted-foreground shadow-inner">
                          {res.value}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <Card className="bg-linear-to-br from-primary/20 via-primary/5 to-transparent border-primary/20 p-8 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] opacity-20" />
              <div className="relative z-10 max-w-xl mx-auto space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black font-mono uppercase italic tracking-tighter">
                    Initialize Domain Watcher
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest leading-relaxed">
                    Continuous DNS monitoring. Get alerted the microsecond your MX/SPF/DMARC records
                    are tampered with or expire.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    className="px-8 h-12 uppercase font-mono font-bold tracking-tighter group/cta"
                    onClick={() => router.push(`/dashboard/monitors/new?url=${domain}&type=DNS`)}
                  >
                    Setup DNS Sentinel
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/cta:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    variant="outline"
                    className="px-8 h-12 uppercase font-mono font-bold tracking-tighter border-primary/20"
                    onClick={() => {
                      const report =
                        `STEADYSTACK DNS INTEGRITY REPORT\n` +
                        `DOMAIN: ${auditData.domain}\n` +
                        `INTEGRITY SCORE: ${auditData.score}% (${auditData.grade})\n` +
                        `DATE: ${new Date().toISOString()}\n\n` +
                        `DNS AUDIT RESULTS:\n` +
                        auditData.results
                          .map(
                            (r) =>
                              `[${r.status}] ${r.key}:\n - Description: ${r.desc}\n - Value: ${r.value}\n`,
                          )
                          .join("\n") +
                        `\n\nRAW RECORDSET:\n` +
                        JSON.stringify(auditData.raw, null, 2);

                      const blob = new Blob([report], { type: "text/plain" });
                      const link = document.createElement("a");
                      link.href = URL.createObjectURL(blob);
                      link.download = `dns-pulse-${auditData.domain.replace(/[^a-z0-9]/gi, "-")}.txt`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast.success("DNS record dump exported");
                    }}
                  >
                    Export Record Dump
                    <ArrowUpRight className="ml-2 w-4 h-4 opacity-40" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
