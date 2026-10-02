"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-8 font-sans">
      <Card className="border-[#e8e6df] bg-white shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="p-6 sm:p-8 border-b border-[#e8e6df] bg-[#fbfbf9]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#ffd439]/20 border border-[#ffd439]/40 rounded-xl">
              <Globe className="w-5 h-5 text-[#23211a]" />
            </div>
            <div>
              <CardTitle className="font-serif font-medium text-xl text-[#23211a]">
                DNS & Email Integrity Sentinel
              </CardTitle>
              <CardDescription className="font-mono text-xs text-[#868279] uppercase tracking-wider mt-0.5">
                Audit MX, SPF lookup limits, and DMARC enforcement
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <form
            onSubmit={handleAudit}
            className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end"
          >
            <div className="relative flex-1">
              <Label
                htmlFor="domain-input"
                className="text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider block mb-2"
              >
                Target Domain
              </Label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#868279]" />
                <Input
                  id="domain-input"
                  placeholder="example.com (e.g. cloudflare.com)"
                  className="pl-10 h-12 bg-[#fbfbf9] border-[#e8e6df] font-mono text-sm text-[#23211a] focus-visible:ring-[#23211a] rounded-xl"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="h-12 px-7 bg-[#23211a] hover:bg-black text-[#ffd439] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs"
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
            className="flex flex-col items-center justify-center py-16 space-y-6 bg-white border border-[#e8e6df] rounded-2xl shadow-xs"
          >
            <div className="flex gap-2">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-8 rounded-sm bg-[#ffd439]/30"
                  animate={{
                    height: activeStep >= i ? [8, 32, 8] : 8,
                    backgroundColor:
                      activeStep >= i ? ["#ffd439", "#23211a", "#ffd439"] : "#e8e6df",
                  }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              ))}
            </div>
            <div className="text-center space-y-2">
              <GlitchText
                text={resolveSteps[activeStep]}
                className="text-[#23211a] font-serif text-xl font-medium"
              />
              <div className="text-xs font-mono text-[#868279] uppercase tracking-wider font-semibold">
                Querying: {domain}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white border-[#e8e6df] rounded-2xl shadow-xs flex flex-col items-center justify-center py-8 relative overflow-hidden">
                <div className="text-[11px] font-mono text-[#868279] uppercase tracking-wider font-semibold mb-2">
                  Integrity Grade
                </div>
                <div className="text-6xl font-serif font-medium text-[#23211a]">
                  {auditData.grade}
                </div>
              </Card>

              <Card className="bg-white border-[#e8e6df] rounded-2xl shadow-xs p-6 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-[11px] uppercase font-mono text-[#868279] tracking-wider font-semibold">
                  <Mail className="w-4 h-4 text-[#23211a]" />
                  <span>Deliverability</span>
                </div>
                <div className="text-3xl font-serif font-medium text-[#23211a] mt-3">
                  {auditData.score}%
                </div>
              </Card>

              <Card className="bg-white border-[#e8e6df] rounded-2xl shadow-xs p-6 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-[11px] uppercase font-mono text-[#868279] tracking-wider font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#23211a]" />
                  <span>Secure Records</span>
                </div>
                <div className="text-3xl font-serif font-medium text-[#23211a] mt-3">
                  {auditData.results.filter((r) => r.status === "SECURE").length} /{" "}
                  {auditData.results.length}
                </div>
              </Card>

              <Card className="bg-white border-[#e8e6df] rounded-2xl shadow-xs p-6 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-[11px] uppercase font-mono text-[#868279] tracking-wider font-semibold">
                  <Activity className="w-4 h-4 text-[#23211a]" />
                  <span>Total Records</span>
                </div>
                <div className="text-3xl font-serif font-medium text-[#23211a] mt-3">
                  {Object.keys(auditData.raw).length}
                </div>
              </Card>
            </div>

            {/* Resolution List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pl-1">
                <h2 className="font-mono text-xs uppercase tracking-wider text-[#868279] font-semibold flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#23211a]" /> Analyzed Recordsets
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {auditData.results.map((res, idx) => (
                  <motion.div
                    key={res.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card
                      className={cn(
                        "bg-white border rounded-2xl shadow-xs p-5 transition-all",
                        res.status === "SECURE"
                          ? "border-[#e8e6df]"
                          : res.status === "CRITICAL"
                            ? "border-rose-300"
                            : "border-amber-300",
                      )}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2.5">
                            {res.status === "SECURE" ? (
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ShieldAlert className="w-4 h-4 text-rose-600" />
                            )}
                            <span className="font-mono text-sm font-bold text-[#23211a]">
                              {res.key}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border",
                                res.status === "SECURE"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : res.status === "CRITICAL"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200",
                              )}
                            >
                              {res.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-[#5c5c5c] font-sans leading-relaxed">
                            {res.desc}
                          </p>
                        </div>
                        <div className="bg-[#fbfbf9] p-3 rounded-xl border border-[#e8e6df] max-w-sm w-full truncate font-mono text-xs text-[#23211a]">
                          {res.value}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Final CTA Container */}
            <Card className="rounded-3xl border border-black/[0.1] bg-[#23211a] text-white p-8 sm:p-12 text-center relative overflow-hidden shadow-md">
              <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#ffd439]/15 rounded-full blur-[80px] pointer-events-none" />
              <div className="relative z-10 max-w-xl mx-auto space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white">
                    Initialize Continuous DNS Monitoring
                  </h2>
                  <p className="text-xs text-white/70 font-sans leading-relaxed">
                    Prevent unexpected email delivery failures. SteadyStack monitors your MX, SPF,
                    and DMARC records 24/7 and alerts you the second a record is tampered with or
                    drops.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
                  <Button
                    className="h-11 px-7 bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm"
                    onClick={() =>
                      router.push(`/dashboard/monitors/new?url=${domain}&type=DNS` as any)
                    }
                  >
                    Setup DNS Monitor
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11 px-6 bg-white/10 hover:bg-white/15 border-white/20 text-white font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all"
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
                    <ArrowUpRight className="ml-2 w-4 h-4 opacity-70" />
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
