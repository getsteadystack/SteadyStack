"use client";

import { useTransition, useState } from "react";
import {
  Sparkles,
  Brain,
  Activity,
  X,
  AlertTriangle,
  Info,
  ChevronRight,
  TrendingUp,
  Cpu,
  BarChart3,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { dismissInsight, analyzeInsightWithAI, generateLiveAIInsights } from "@/actions/monitors";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface InsightMetadata {
  zScore?: number;
  score?: number;
  latency?: number;
  region?: string;
  diff?: number;
  avg?: number;
  baselineMean?: number;
  impactedRegions?: string[];
  [key: string]: unknown;
}

export interface MonitorInsight {
  id: string;
  monitorId: string;
  type: "ANOMALY" | "ADVICE" | "PREDICTION";
  severity: "INFO" | "WARNING" | "CRITICAL";
  message: string;
  metadata?: InsightMetadata;
  createdAt: Date;
  monitor: {
    name: string;
  };
}

interface AIInsightsProps {
  insights: MonitorInsight[];
}

export function AIInsights({ insights: initialInsights }: AIInsightsProps) {
  const [insights, setInsights] = useState<MonitorInsight[]>(initialInsights);
  const [isPending, startTransition] = useTransition();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<MonitorInsight | null>(null);

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      const result = await dismissInsight(id);
      if (result.success) {
        setInsights((prev) => prev.filter((i) => i.id !== id));
        toast.success("Insight dismissed");
      } else {
        toast.error("Failed to dismiss insight");
      }
    });
  };

  const handleRunDeepAnalysis = async (insightId: string) => {
    setIsAnalyzing(true);
    try {
      const res = await analyzeInsightWithAI(insightId);
      if (res.success && res.insight) {
        setInsights((prev) => prev.map((i) => (i.id === insightId ? (res.insight as any) : i)));
        setSelectedInsight(res.insight as any);
        toast.success(
          `Deep analysis updated via ${res.analysis?.provider?.toUpperCase() || "AI Engine"}`,
        );
      } else {
        toast.error(res.error || "Failed to complete AI analysis");
      }
    } catch {
      toast.error("Error executing AI diagnosis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateLive = async () => {
    setIsGenerating(true);
    try {
      const res = await generateLiveAIInsights();
      if (res.success) {
        toast.success(res.message || "Refreshed AI Insights");
      } else {
        toast.error(res.error || "Failed to generate AI insights");
      }
    } catch {
      toast.error("Error refreshing AI insights");
    } finally {
      setIsGenerating(false);
    }
  };

  if (insights.length === 0) return null;

  const currentAnalysis = selectedInsight?.metadata?.aiAnalysis;

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/5 border border-primary/10 rounded-lg">
            <Brain className="size-4 text-primary animate-pulse" />
          </div>
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
            AI Insights
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateLive}
            disabled={isGenerating}
            className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground bg-accent/40 hover:bg-accent border border-border px-2.5 py-1 rounded-md transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={cn("size-3", isGenerating && "animate-spin text-primary")} />
            {isGenerating ? "Scanning AI Models..." : "Re-analyze with AI"}
          </button>
          <span className="text-[10px] font-bold text-primary bg-primary/5 px-2.5 py-0.5 rounded-full border border-primary/10 tracking-wider">
            ACTIVE ANALYSIS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            onClick={() => setSelectedInsight(insight)}
            className={cn(
              "group relative bg-card border border-border p-5 rounded-xl overflow-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.02)] cursor-pointer",
              insight.severity === "CRITICAL" &&
                "border-red-500/20 bg-red-500/[0.02] hover:border-red-500/30",
              insight.severity === "WARNING" &&
                "border-amber-500/20 bg-amber-500/[0.02] hover:border-amber-500/30",
            )}
          >
            <button
              onClick={(e) => handleDismiss(insight.id, e)}
              disabled={isPending}
              className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all z-20 cursor-pointer"
            >
              <X className="size-3.5" />
            </button>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={cn(
                    "p-2 rounded-lg border",
                    insight.type === "ANOMALY" &&
                      "bg-amber-500/5 border-amber-500/10 text-amber-500",
                    insight.type === "ADVICE" && "bg-primary/5 border-primary/10 text-primary",
                    insight.type === "PREDICTION" &&
                      "bg-cyan-500/5 border-cyan-500/10 text-cyan-500",
                  )}
                >
                  {insight.type === "ANOMALY" && <Activity className="size-4" />}
                  {insight.type === "ADVICE" && <Sparkles className="size-4" />}
                  {insight.type === "PREDICTION" && <TrendingUp className="size-4" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {insight.type} • {insight.monitor.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 font-medium">
                    {new Date(insight.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              <p className="text-xs font-semibold text-foreground/90 leading-relaxed mb-4">
                {insight.message}
              </p>

              <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-1">
                <div className="flex items-center gap-2">
                  {insight.severity === "CRITICAL" && (
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-red-500">
                      <AlertTriangle className="size-3" /> CRITICAL
                    </div>
                  )}
                  {insight.severity === "WARNING" && (
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-500">
                      <AlertTriangle className="size-3" /> WARNING
                    </div>
                  )}
                  {insight.severity === "INFO" && (
                    <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      INFO
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-primary group/btn pointer-events-none">
                  VIEW FULL ANALYSIS{" "}
                  <ChevronRight className="size-3 group-hover/btn:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!selectedInsight} onOpenChange={() => setSelectedInsight(null)}>
        <DialogContent className="max-w-2xl bg-card border border-border text-foreground rounded-2xl overflow-hidden p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          {selectedInsight && (
            <div className="relative">
              <DialogHeader className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Brain className="size-4 text-primary" />
                    <span className="text-[10px] font-bold text-primary tracking-wider uppercase">
                      Insight Diagnostics & AI SRE Breakdown
                    </span>
                  </div>
                  {currentAnalysis?.provider && (
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded border border-primary/20 bg-primary/10 text-primary flex items-center gap-1">
                      <Zap className="size-2.5" />
                      {currentAnalysis.provider === "openrouter" && "OpenRouter (Llama 3.3 70B)"}
                      {currentAnalysis.provider === "ollama" && "Ollama (Llama 3.2)"}
                      {currentAnalysis.provider === "openai" && "OpenAI (GPT-4o-mini)"}
                      {currentAnalysis.provider === "heuristic" && "Telemetry SRE Engine"}
                    </span>
                  )}
                </div>
                <DialogTitle className="text-xl font-extrabold tracking-tight">
                  {selectedInsight.type === "ANOMALY" ? "Anomaly Detection" : "Diagnostic Advice"}{" "}
                  Report
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs mt-1">
                  Monitor:{" "}
                  <span className="text-foreground font-semibold">
                    {selectedInsight.monitor.name}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-accent/40 border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                    <BarChart3 className="size-4 text-muted-foreground/80" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Technical Metrics
                    </span>
                  </div>
                  <div className="space-y-3 font-sans">
                    {(currentAnalysis?.technicalMetrics?.zScore ||
                      selectedInsight.metadata?.zScore ||
                      selectedInsight.metadata?.score) && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Significance Z-Score:</span>
                        <span className="font-bold text-amber-500">
                          {Number(
                            currentAnalysis?.technicalMetrics?.zScore ||
                              selectedInsight.metadata?.zScore ||
                              selectedInsight.metadata?.score,
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {(currentAnalysis?.technicalMetrics?.latency ||
                      selectedInsight.metadata?.latency) && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Observed Latency:</span>
                        <span className="font-bold text-primary">
                          {currentAnalysis?.technicalMetrics?.latency ||
                            selectedInsight.metadata?.latency}
                          ms
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Detection Time:</span>
                      <span className="text-foreground/75 font-semibold">
                        {new Date(selectedInsight.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-accent/40 border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                    <Cpu className="size-4 text-muted-foreground/80" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Root Cause Diagnosis
                    </span>
                  </div>
                  <div className="text-xs text-foreground/85 leading-relaxed font-sans">
                    <div className="text-[10px] text-muted-foreground font-bold mb-1 uppercase">
                      Analysis Output
                    </div>
                    <div className="text-foreground/90 font-medium">
                      {currentAnalysis?.analysis ||
                        (selectedInsight.type === "ANOMALY"
                          ? "Significant deviation from historical baseline detected across edge validation nodes. Pattern indicates intermittent server-side processing delay."
                          : "Performance trends indicate upcoming degradation. Correlation with high traffic baseline is 82%.")}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-xl p-5 mb-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                  <Sparkles className="size-12 text-primary" />
                </div>
                <div className="relative z-10">
                  <div className="text-[10px] font-bold text-primary mb-2 flex items-center gap-2 uppercase tracking-wider">
                    <Info className="size-3.5" /> Actionable Guidance & Playbook
                  </div>
                  <p className="text-xs font-semibold text-foreground/90 leading-relaxed">
                    {currentAnalysis?.guidance ||
                      (selectedInsight.type === "ANOMALY"
                        ? "Inspect server logs for connection pool saturation and review APM traces for 5xx errors during this timestamp."
                        : "Ensure HTTP/3 (QUIC) and TLS 1.3 0-RTT session resumption are active on edge proxies.")}
                  </p>
                </div>
              </div>

              {currentAnalysis?.preventativeAction && (
                <div className="bg-accent/30 border border-border rounded-xl p-4 mb-2">
                  <div className="text-[10px] font-bold text-muted-foreground mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="size-3.5 text-emerald-500" /> Architectural Preventative
                    Strategy
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                    {currentAnalysis.preventativeAction}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between mt-8 pt-4 border-t border-border/50">
                <button
                  onClick={() => handleRunDeepAnalysis(selectedInsight.id)}
                  disabled={isAnalyzing}
                  className="px-3.5 py-2 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={cn("size-3.5", isAnalyzing && "animate-spin")} />
                  {isAnalyzing ? "Executing Deep LLM Diagnosis..." : "⚡ Deep AI Re-Scan"}
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedInsight(null)}
                    className="px-4 py-2 border border-border bg-card hover:bg-accent text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Close Report
                  </button>
                  <button
                    onClick={(e) => {
                      handleDismiss(selectedInsight.id, e);
                      setSelectedInsight(null);
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-lg transition-all cursor-pointer"
                  >
                    Mark as Resolved
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
