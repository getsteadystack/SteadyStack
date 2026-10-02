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
        return "text-green-500 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]";
      case "A":
        return "text-green-400 border-green-400";
      case "B":
        return "text-yellow-400 border-yellow-400";
      case "C":
        return "text-orange-500 border-orange-500";
      default:
        return "text-red-500 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Input */}
      <Card className="border-primary/20 bg-background/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleCheck} className="flex gap-4 items-end">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="url">Target Domain</Label>
              <Input
                id="url"
                placeholder="example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono"
              />
            </div>
            <Button type="submit" disabled={loading} className="min-w-[120px]">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              {loading ? "Scanning..." : "Analyze"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Col: Main Grade */}
          <Card className="md:col-span-2 border-border/50 bg-background/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Security Report for {result.domain}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-8 items-center justify-center p-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "w-32 h-32 md:w-40 md:h-40 rounded-full border-4 flex items-center justify-center text-4xl md:text-6xl font-black bg-background/80 backdrop-blur-md",
                  getGradeColor(result.grade),
                )}
              >
                {result.grade}
              </motion.div>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4" /> Valid Until
                    </div>
                    <div className="text-lg font-bold">
                      {new Date(result.validTo).toLocaleDateString()}
                    </div>
                    <div
                      className={cn(
                        "text-xs mt-1",
                        result.daysRemaining < 30 ? "text-red-500" : "text-green-500",
                      )}
                    >
                      {result.daysRemaining} days remaining
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                      <Server className="h-4 w-4" /> Issuer
                    </div>
                    <div className="text-lg font-bold truncate">{result.issuer}</div>
                    <div className="text-xs text-green-500 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Trusted
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Specs (Locked/Unlocked) */}
          <Card className="md:col-span-2 border-border/50 relative overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileKey className="text-primary h-5 w-5" />
                Certificate Chain & Protocols
              </CardTitle>
              <CardDescription>Detailed technical analysis of the handshake.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "space-y-6 transition-all duration-500",
                  !unlocked && "blur-md select-none opacity-50",
                )}
              >
                {/* Protocol Support */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                    Supported Protocols
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(result.details).map(([key, enabled]) => (
                      <Badge
                        key={key}
                        variant={enabled ? "outline" : "secondary"}
                        className={cn(
                          "justify-center py-2",
                          enabled
                            ? "border-green-500/50 bg-green-500/10 text-green-500"
                            : "text-muted-foreground opacity-50",
                        )}
                      >
                        {key.toUpperCase()} {enabled ? "✔" : "✘"}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Certificate Chain */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                    Trust Chain
                  </h3>
                  <div className="space-y-2 border-l-2 border-primary/20 pl-4 py-2">
                    {result.chain.map((cert, i) => (
                      <div key={i} className="flex flex-col gap-1 relative">
                        {/* Connector line */}
                        <div className="font-mono text-sm font-bold flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          {cert.subject}
                        </div>
                        <div className="text-xs text-muted-foreground ml-4">
                          Issued by: {cert.issuer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gate Overlay */}
              {!unlocked && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[2px]">
                  <div className="p-6 text-center max-w-sm">
                    <Lock className="h-10 w-10 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Unlock Detailed Analysis</h3>
                    <p className="text-muted-foreground mb-6">
                      Get specialized protocol details, cipher suites, and the full trust chain.
                    </p>
                    <Button size="lg" onClick={() => setGateOpen(true)}>
                      Unlock Report <ArrowRight className="ml-2 h-4 w-4" />
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Access Advanced Security Data</DialogTitle>
            <DialogDescription>
              Enter your email to view the full protocol stack and certificate chain analysis.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="security@company.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleUnlock}
              disabled={isEmailSubmitting}
              className="w-full"
            >
              {isEmailSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reveal Sensitive Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
