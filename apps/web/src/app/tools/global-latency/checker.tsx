"use client";

import { useState, useEffect } from "react";
import { WorldMap } from "@/components/tools/world-map";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead as Th,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Globe, Zap, ArrowRight, XCircle, CheckCircle } from "lucide-react";
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

// Configuration
const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787";

interface LatencyResult {
  region: string;
  city: string;
  latency: number;
  status: "UP" | "DOWN";
  coordinates: [number, number];
}

/**
 * Component for checking and displaying latency information for a given URL.
 *
 * This component manages the state for the URL input, loading status, results, and unlock status. It checks local storage for an unlock token and handles the latency check by validating the URL, making an API call to fetch latency data, and updating the results accordingly. It also provides functionality to unlock full report access via email submission.
 *
 * @returns {JSX.Element} The rendered component.
 */
export function LatencyChecker() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LatencyResult[] | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  // Check local storage for unlock token
  useEffect(() => {
    const token = localStorage.getItem("steadystack_tools_unlocked");
    if (token) setUnlocked(true);
  }, []);

  /**
   * Handles the check for global latency based on the provided URL.
   *
   * The function prevents the default form submission, validates the URL format, and initiates a fetch request to retrieve latency data.
   * If the fetch is successful, it updates the results state and may auto-open a gate if certain conditions are met.
   * Errors during the fetch process are caught and logged, while loading state is managed throughout the operation.
   *
   * @param e - The React form event triggered by the submission.
   * @returns void
   */
  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Basic URL validation
    let target = url;
    if (!target.includes(".")) {
      toast.error("Please enter a valid domain (e.g., google.com)");
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const res = await fetch(`${WORKER_URL}/api/global-latency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });

      if (!res.ok) throw new Error("Failed to fetch latency data");

      const data = (await res.json()) as LatencyResult[];
      setResults(data);

      // Auto-open gate if not unlocked
      if (!unlocked) {
        setTimeout(() => setGateOpen(true), 1500);
      }
    } catch (err) {
      toast.error("Error checking latency. Ensure the worker is running.");
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

    // Simulate API call to save lead
    // In real app: POST /api/marketing/lead { email, tool: 'latency-checker' }
    await new Promise((r) => setTimeout(r, 1000));

    localStorage.setItem("steadystack_tools_unlocked", "true");
    setUnlocked(true);
    setGateOpen(false);
    setIsEmailSubmitting(false);
    toast.success("Full report unlocked!");
  };

  // Prepare map points
  const mapPoints =
    results?.map((r) => ({
      ...r,
      status: r.status === "UP" ? "UP" : ("DOWN" as "UP" | "DOWN"),
    })) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans">
      {/* Controls */}
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
                Target Domain or URL
              </Label>
              <Input
                id="url"
                placeholder="example.com or https://api.yourservice.com"
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
                <Zap className="mr-2 h-4 w-4" />
              )}
              {loading ? "Pinging..." : "Check Latency"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Map Visualization */}
      {mapPoints.length > 0 && (
        <Card className="overflow-hidden border-[#e8e6df] bg-white rounded-2xl shadow-xs p-2">
          <WorldMap points={mapPoints} />
        </Card>
      )}

      {/* Results Table */}
      {results && (
        <Card className="border-[#e8e6df] bg-white shadow-xs rounded-2xl overflow-hidden">
          <CardHeader className="p-6 sm:p-8 border-b border-[#e8e6df] bg-[#fbfbf9]/50">
            <CardTitle className="flex items-center gap-2 text-xl font-serif font-medium text-[#23211a]">
              <Globe className="h-5 w-5 text-[#23211a]" />
              Global Latency Telemetry
            </CardTitle>
            <CardDescription className="text-[#5c5c5c] text-sm">
              Real-time response times measured across sovereign edge regions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              <Table>
                <TableHeader className="bg-[#fbfbf9]">
                  <TableRow className="border-[#e8e6df] hover:bg-transparent">
                    <Th className="font-mono text-[11px] uppercase tracking-wider text-[#868279] pl-6">
                      Region
                    </Th>
                    <Th className="font-mono text-[11px] uppercase tracking-wider text-[#868279]">
                      Location
                    </Th>
                    <Th className="font-mono text-[11px] uppercase tracking-wider text-[#868279]">
                      Status
                    </Th>
                    <Th className="font-mono text-[11px] uppercase tracking-wider text-[#868279] text-right pr-6">
                      Latency
                    </Th>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.slice(0, unlocked ? undefined : 3).map((res) => (
                    <TableRow key={res.region} className="border-[#e8e6df] hover:bg-[#fbfbf9]/60">
                      <TableCell className="font-mono font-bold text-xs pl-6 text-[#23211a]">
                        {res.region.toUpperCase()}
                      </TableCell>
                      <TableCell className="text-sm text-[#5c5c5c]">{res.city}</TableCell>
                      <TableCell>
                        {res.status === "UP" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="h-3 w-3 text-emerald-600" /> UP
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-red-50 text-red-700 border border-red-200">
                            <XCircle className="h-3 w-3 text-red-600" /> DOWN
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold text-xs pr-6">
                        <span
                          className={
                            res.latency < 200
                              ? "text-emerald-700"
                              : res.latency < 500
                                ? "text-amber-700"
                                : "text-rose-700"
                          }
                        >
                          {res.latency}ms
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Blurry Rows (Locked State) */}
                  {!unlocked &&
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow
                        key={`blur-${i}`}
                        className="opacity-30 blur-xs select-none pointer-events-none border-[#e8e6df]"
                      >
                        <TableCell className="pl-6 font-mono text-xs">EU-CENTRAL</TableCell>
                        <TableCell className="text-sm">Frankfurt, Germany</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-[#e8e6df]">
                            ???
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6 font-mono text-xs">???ms</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              {/* Unlock Overlay */}
              {!unlocked && (
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white via-white/95 to-transparent flex flex-col items-center justify-end pb-8 gap-3">
                  <div className="flex flex-col items-center gap-2 text-center p-4">
                    <div className="p-2.5 rounded-full bg-[#ffd439]/20 border border-[#ffd439]/40 mb-1">
                      <Lock className="h-5 w-5 text-[#23211a]" />
                    </div>
                    <h3 className="font-serif font-medium text-lg text-[#23211a]">
                      Unlock Full Global Telemetry
                    </h3>
                    <p className="text-[#5c5c5c] text-xs max-w-sm">
                      Inspect latency across all 10 international edge regions instantly. Free
                      forever.
                    </p>
                    <Button
                      onClick={() => setGateOpen(true)}
                      className="mt-2 h-10 px-5 bg-[#23211a] hover:bg-black text-[#ffd439] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs"
                    >
                      Unlock All 10 Regions <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unlock Dialog */}
      <Dialog open={gateOpen} onOpenChange={setGateOpen}>
        <DialogContent className="sm:max-w-md bg-white border-[#e8e6df] text-[#23211a] rounded-2xl p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-serif font-medium text-2xl text-[#23211a]">
              Evaluate Global Performance
            </DialogTitle>
            <DialogDescription className="text-[#5c5c5c] text-sm">
              Enter your work email to view the complete 10-region latency matrix and raw round-trip
              breakdown.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Label
                htmlFor="email"
                className="text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider"
              >
                Work Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="developer@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-mono text-sm h-11 bg-[#fbfbf9] border-[#e8e6df] text-[#23211a] focus-visible:ring-[#23211a] rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              onClick={handleUnlock}
              disabled={isEmailSubmitting}
              className="w-full h-11 bg-[#23211a] hover:bg-black text-[#ffd439] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs"
            >
              {isEmailSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Access Full Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
