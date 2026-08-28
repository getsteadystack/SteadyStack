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
  FileSearch,
  ShieldIcon,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { GlitchText } from "@/components/ui/effects/glitch-text";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderResult {
  header: string;
  status: "SECURE" | "WARNING" | "CRITICAL" | "INFO";
  value: string | null;
  description: string;
  recommendation?: string;
}

interface AuditData {
  url: string;
  score: number;
  grade: string;
  results: HeaderResult[];
  rawHeaders: Record<string, string>;
}

// Configuration
const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787";

export function HeaderAnalyzer() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [auditData, setAuditData] = useState<AuditData | null>(null);

  const scanSteps = [
    "Establishing encrypted tunnel...",
    "Injecting headers into security buffer...",
    "Scanning Strict-Transport-Security...",
    "Parsing Content-Security-Policy...",
    "Analyzing X-Frame-Options...",
    "Checking for information disclosure...",
    "Finalizing security score...",
  ];

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsScanning(true);
    setAuditData(null);
    setScanStep(0);

    // Simulate terminal steps
    for (let i = 0; i < scanSteps.length; i++) {
      setScanStep(i);
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
    }

    try {
      const response = await fetch(`${WORKER_URL}/api/security-headers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error("Audit failed");
      const data = (await response.json()) as AuditData;
      setAuditData(data);
      toast.success("Security audit completed successfully");
    } catch (err) {
      toast.error("Cloud connection failed. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-primary/20 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="font-mono uppercase tracking-tighter italic">
              Header Extraction Protocol
            </CardTitle>
          </div>
          <CardDescription className="font-mono text-xs opacity-60 uppercase">
            Analyze HTTP response headers for security misconfigurations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAudit} className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="TARGET_URL (e.g. google.com)"
                className="pl-10 h-12 bg-background/50 border-primary/20 font-mono text-sm focus-visible:ring-primary/40 focus-visible:border-primary/60"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="h-12 px-8 font-mono font-bold uppercase tracking-tighter"
              disabled={isScanning || !url}
            >
              {isScanning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              {isScanning ? "Scanning..." : "Audit Headers"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col items-center justify-center py-12 space-y-6"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-t-2 border-r-2 border-primary animate-spin" />
              <ShieldIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="text-center">
              <GlitchText text={scanSteps[scanStep]} className="text-primary font-mono text-lg" />
              <div className="mt-4 w-64 h-1 bg-primary/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(scanStep + 1) * (100 / scanSteps.length)}%`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {auditData && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Summary Grade */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="col-span-1 border-primary/20 bg-card/60 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center py-10">
                <div className="absolute top-4 left-4">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono uppercase tracking-widest text-primary/60 border-primary/20"
                  >
                    Security Grade
                  </Badge>
                </div>
                <div className="text-8xl font-black font-mono tracking-tighter text-primary italic drop-shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                  {auditData.grade}
                </div>
                <div className="mt-4 flex flex-col items-center">
                  <div className="w-32 h-1 bg-primary/20 rounded-full mb-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${auditData.score}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-primary/60 uppercase">
                    Integrity Score: {auditData.score}%
                  </span>
                </div>
              </Card>

              <Card className="col-span-2 border-primary/20 bg-card/40 backdrop-blur-sm p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-mono text-sm uppercase tracking-widest text-primary/80">
                    Audit Executive Summary
                  </h2>
                  <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[10px] italic">
                    {auditData.url}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Critical Gaps",
                      value: auditData.results.filter((r) => r.status === "CRITICAL").length,
                      color: "text-red-500",
                    },
                    {
                      label: "Foundational Checks",
                      value: auditData.results.filter((r) => r.status === "SECURE").length,
                      color: "text-primary",
                    },
                    {
                      label: "Minor Risks",
                      value: auditData.results.filter((r) => r.status === "WARNING").length,
                      color: "text-yellow-500",
                    },
                    {
                      label: "Data Points",
                      value: Object.keys(auditData.rawHeaders).length,
                      color: "text-blue-500",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="p-4 bg-primary/5 border border-primary/10 rounded-sm"
                    >
                      <div className={cn("text-2xl font-mono font-bold", stat.color)}>
                        {stat.value}
                      </div>
                      <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              <h2 className="font-mono text-xl uppercase tracking-tighter italic text-foreground flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-primary" />
                Detailed Security Scan
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {auditData.results.map((res, idx) => (
                  <motion.div
                    key={res.header}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card
                      className={cn(
                        "bg-card/40 border transition-colors",
                        res.status === "SECURE"
                          ? "border-primary/20"
                          : res.status === "CRITICAL"
                            ? "border-red-900/50 hover:border-red-500/50"
                            : "border-yellow-900/50 hover:border-yellow-500/50",
                      )}
                    >
                      <div className="p-5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {res.status === "SECURE" ? (
                                <ShieldCheck className="w-4 h-4 text-primary" />
                              ) : (
                                <ShieldAlert className="w-4 h-4 text-red-500" />
                              )}
                              <span className="font-mono font-bold text-foreground">
                                {res.header}
                              </span>
                              <Badge
                                className={cn(
                                  "text-[9px] uppercase font-mono px-1.5 py-0",
                                  res.status === "SECURE"
                                    ? "bg-primary/20 text-primary border-primary/40"
                                    : res.status === "CRITICAL"
                                      ? "bg-red-500/20 text-red-500 border-red-500/40"
                                      : "bg-yellow-500/20 text-yellow-500 border-yellow-500/40",
                                )}
                              >
                                {res.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground font-mono">
                              {res.description}
                            </p>
                          </div>
                          <div className="min-w-[200px] text-right">
                            {res.value ? (
                              <div className="text-[10px] font-mono text-muted-foreground bg-muted p-2 rounded truncate max-w-xs ml-auto border border-border/50">
                                {res.value}
                              </div>
                            ) : (
                              <div className="text-[10px] font-mono text-red-600 dark:text-red-400 font-semibold uppercase">
                                Value Not Detected
                              </div>
                            )}
                          </div>
                        </div>
                        {res.recommendation && (
                          <div className="mt-4 p-3 bg-red-500/10 border-l-2 border-red-500 rounded-sm">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                              <div className="space-y-1">
                                <p className="text-[10px] font-mono font-bold text-red-500 uppercase">
                                  Remediation Step:
                                </p>
                                <p className="text-[11px] font-mono text-red-700 dark:text-red-200">
                                  {res.recommendation}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Raw Headers Section */}
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer font-mono text-xs text-muted-foreground uppercase hover:text-primary transition-colors py-2">
                <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                Dump Raw Headers
              </summary>
              <div className="mt-4 p-6 bg-muted rounded-lg border border-border font-mono text-xs overflow-x-auto text-foreground/85 leading-relaxed">
                <div className="mb-4 text-muted-foreground/50 italic">
                  // Detected HTTP/1.1 or HTTP/2 response headers
                </div>
                {Object.entries(auditData.rawHeaders).map(([k, v]) => (
                  <div key={k} className="flex gap-4 mb-1">
                    <span className="text-primary font-bold min-w-[150px]">{k}:</span>
                    <span className="text-muted-foreground break-all">{v}</span>
                  </div>
                ))}
              </div>
            </details>

            {/* CTA Panel */}
            <Card className="border-primary/20 bg-linear-to-br from-primary/10 to-transparent p-8 text-center space-y-6">
              <div className="max-w-xl mx-auto space-y-2">
                <h2 className="text-xl font-bold font-mono uppercase italic tracking-tighter">
                  Automate Design Integrity
                </h2>
                <p className="text-sm text-muted-foreground font-mono">
                  Continuous security auditing for your production stack. Get alerted the
                  microsecond a header is misconfigured or a CSP is breached.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="px-10 h-12 uppercase font-mono font-bold tracking-tighter group"
                  onClick={() => {
                    router.push(`/dashboard/monitors/new?url=${encodeURIComponent(url)}&type=HTTP`);
                  }}
                >
                  Full Infrastructure Scan
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="outline"
                  className="px-10 h-12 uppercase font-mono font-bold tracking-tighter"
                  onClick={() => {
                    const report =
                      `STEADYSTACK SECURITY AUDIT REPORT\n` +
                      `TARGET: ${auditData.url}\n` +
                      `GRADE: ${auditData.grade} (${auditData.score}%)\n` +
                      `DATE: ${new Date().toISOString()}\n\n` +
                      `DETAILED RESULTS:\n` +
                      auditData.results
                        .map(
                          (r) =>
                            `[${r.status}] ${r.header}\n - ${r.description}\n - Value: ${r.value || "N/A"}\n${r.recommendation ? ` - Recommended: ${r.recommendation}\n` : ""}`,
                        )
                        .join("\n") +
                      `\n\nRAW HEADERS:\n` +
                      Object.entries(auditData.rawHeaders)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join("\n");

                    const blob = new Blob([report], { type: "text/plain" });
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(blob);
                    link.download = `security-audit-${auditData.url.replace(/[^a-z0-9]/gi, "-")}.txt`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success("Security report downloaded");
                  }}
                >
                  Download Text Evidence
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
