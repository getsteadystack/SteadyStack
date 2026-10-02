"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldCheck,
  Loader2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Server,
  FileKey,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787";

interface SSLResult {
  domain: string;
  grade: "A+" | "A" | "B" | "C" | "F";
  status: "VALID" | "EXPIRED" | "INVALID";
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  hasHSTS: boolean;
  protocol: string;
  cipher: string;
  chain: { subject: string; issuer: string; valid: boolean }[];
  details: {
    tls13: boolean;
    tls12: boolean;
    tls11: boolean;
    tls10: boolean;
    pfs: boolean;
  };
}

export function SSLChecker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SSLResult | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("steadystack_tools_unlocked");
    if (token) setUnlocked(true);
  }, []);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Quick validation
    if (!url.includes(".")) {
      toast.error("Please enter a valid domain");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${WORKER_URL}/api/ssl-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) throw new Error("Check failed");

      const data = (await res.json()) as SSLResult;
      setResult(data);

      if (!unlocked) {
        setTimeout(() => setGateOpen(true), 2000);
      }
    } catch (err) {
      toast.error("Failed to check SSL status.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setIsEmailSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000)); // Simulate API
    localStorage.setItem("steadystack_tools_unlocked", "true");
    setUnlocked(true);
    setGateOpen(false);
    setIsEmailSubmitting(false);
    toast.success("Detailed report unlocked!");
  };

  // Grade Color Helper
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
        return "text-emerald-700 border-emerald-300 bg-emerald-50 shadow-xs";
      case "A":
        return "text-emerald-600 border-emerald-200 bg-emerald-50";
      case "B":
        return "text-amber-700 border-amber-300 bg-amber-50";
      case "C":
        return "text-orange-700 border-orange-300 bg-orange-50";
      default:
        return "text-rose-700 border-rose-300 bg-rose-50 shadow-xs";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans">
      {/* Input */}
      <Card className="border-[#e8e6df] bg-white shadow-xs rounded-2xl overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <form
            onSubmit={handleCheck}
            className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end"
          >
            <div className="grid w-full items-center gap-2">
              <Label
                htmlFor="url"
                className="text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider"
              >
                Target Domain or Hostname
              </Label>
              <Input
                id="url"
                placeholder="example.com or api.domain.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono text-sm h-12 bg-[#fbfbf9] border-[#e8e6df] text-[#23211a] focus-visible:ring-[#23211a] rounded-xl"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 px-7 min-w-[140px] bg-[#23211a] hover:bg-black text-[#ffd439] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              {loading ? "Scanning..." : "Analyze TLS"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Col: Main Grade */}
          <Card className="md:col-span-2 border-[#e8e6df] bg-white rounded-2xl shadow-xs overflow-hidden">
            <CardHeader className="p-6 sm:p-8 border-b border-[#e8e6df] bg-[#fbfbf9]/50">
              <CardTitle className="flex items-center gap-2 text-xl font-serif font-medium text-[#23211a]">
                <ShieldCheck className="h-5 w-5 text-[#23211a]" />
                Security Report for {result.domain}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8 items-center justify-center p-6 sm:p-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "w-32 h-32 md:w-36 md:h-36 rounded-2xl border-2 flex items-center justify-center text-4xl md:text-5xl font-serif font-medium",
                  getGradeColor(result.grade),
                )}
              >
                {result.grade}
              </motion.div>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#fbfbf9] border border-[#e8e6df]">
                    <div className="text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#23211a]" /> Valid Until
                    </div>
                    <div className="text-base font-serif font-medium text-[#23211a]">
                      {new Date(result.validTo).toLocaleDateString()}
                    </div>
                    <div
                      className={cn(
                        "text-xs font-mono font-medium mt-1",
                        result.daysRemaining < 30 ? "text-rose-700" : "text-emerald-700",
                      )}
                    >
                      {result.daysRemaining} days remaining
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#fbfbf9] border border-[#e8e6df]">
                    <div className="text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                      <Server className="h-3.5 w-3.5 text-[#23211a]" /> Issuer
                    </div>
                    <div className="text-base font-serif font-medium text-[#23211a] truncate">
                      {result.issuer}
                    </div>
                    <div className="text-xs font-mono font-medium text-emerald-700 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Trusted Authority
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Specs (Locked/Unlocked) */}
          <Card className="md:col-span-2 border-[#e8e6df] bg-white rounded-2xl shadow-xs relative overflow-hidden">
            <CardHeader className="p-6 sm:p-8 border-b border-[#e8e6df] bg-[#fbfbf9]/50">
              <CardTitle className="flex items-center gap-2 text-xl font-serif font-medium text-[#23211a]">
                <FileKey className="text-[#23211a] h-5 w-5" />
                Certificate Chain & Protocols
              </CardTitle>
              <CardDescription className="text-[#5c5c5c] text-sm">
                Detailed cryptographic breakdown of the handshake.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div
                className={cn(
                  "space-y-6 transition-all duration-500",
                  !unlocked && "blur-xs select-none opacity-40",
                )}
              >
                {/* Protocol Support */}
                <div>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#868279] mb-3">
                    Supported Protocols
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {Object.entries(result.details).map(([key, enabled]) => (
                      <div
                        key={key}
                        className={cn(
                          "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-mono font-medium",
                          enabled
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-[#e8e6df] bg-[#fbfbf9] text-[#868279] opacity-60",
                        )}
                      >
                        <span>{key.toUpperCase()}</span>
                        <span>{enabled ? "✓" : "✗"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificate Chain */}
                <div>
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[#868279] mb-3">
                    Trust Chain
                  </h3>
                  <div className="space-y-3 border-l-2 border-[#ffd439] pl-4 py-1">
                    {result.chain.map((cert, i) => (
                      <div key={i} className="flex flex-col gap-1 relative">
                        <div className="font-mono text-xs font-bold text-[#23211a] flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#23211a]" />
                          {cert.subject}
                        </div>
                        <div className="text-xs text-[#5c5c5c] font-sans ml-4">
                          Issued by: {cert.issuer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gate Overlay */}
              {!unlocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] p-6">
                  <div className="p-6 text-center max-w-sm flex flex-col items-center">
                    <div className="p-2.5 rounded-full bg-[#ffd439]/20 border border-[#ffd439]/40 mb-3">
                      <Lock className="h-5 w-5 text-[#23211a]" />
                    </div>
                    <h3 className="font-serif font-medium text-xl text-[#23211a] mb-2">
                      Unlock Detailed Analysis
                    </h3>
                    <p className="text-[#5c5c5c] text-xs mb-5 font-sans leading-relaxed">
                      View complete cipher suite negotiations, OCSP stapling verification, and the
                      raw trust chain.
                    </p>
                    <Button
                      onClick={() => setGateOpen(true)}
                      className="h-10 px-6 bg-[#23211a] hover:bg-black text-[#ffd439] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs"
                    >
                      Unlock Full TLS Report <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Unlock Dialog */}
      <Dialog open={gateOpen} onOpenChange={setGateOpen}>
        <DialogContent className="sm:max-w-md bg-white border-[#e8e6df] text-[#23211a] rounded-2xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-serif font-medium text-2xl text-[#23211a]">
              Access TLS Security Telemetry
            </DialogTitle>
            <DialogDescription className="text-[#5c5c5c] text-sm">
              Enter your email to reveal the complete protocol stack and intermediate certificate
              chain analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label
                htmlFor="email"
                className="text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="font-mono text-sm h-11 bg-[#fbfbf9] border-[#e8e6df] text-[#23211a] focus-visible:ring-[#23211a] rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleUnlock}
              disabled={isEmailSubmitting}
              className="w-full h-11 bg-[#23211a] hover:bg-black text-[#ffd439] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs"
            >
              {isEmailSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Access TLS Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
