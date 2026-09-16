"use client";

import { useState } from "react";
import { inspectRedirects } from "@/actions/monitors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  CornerDownRight,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface RedirectInspectorModalProps {
  monitorId: string;
  monitorName: string;
  trigger?: React.ReactNode;
}

type InspectionResult = Awaited<ReturnType<typeof inspectRedirects>>;

export function RedirectInspectorModal({
  monitorId,
  monitorName,
  trigger,
}: RedirectInspectorModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InspectionResult | null>(null);

  const handleInspect = async () => {
    setIsLoading(true);
    try {
      const res = await inspectRedirects(monitorId);
      setResult(res);
      if (res.success) {
        toast.success(
          res.hops.length > 0
            ? `Traced ${res.hops.length} redirect hop${res.hops.length === 1 ? "" : "s"}`
            : "No redirects — target responds directly",
        );
      } else {
        toast.error(res.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Redirect inspection failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] md:h-8 px-3.5 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary font-mono text-[10px] uppercase tracking-wider"
          >
            <CornerDownRight className="size-3.5 mr-1.5" />
            Redirect Chain
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border p-6 sm:p-8">
        <DialogHeader className="space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-primary/10 border border-primary/20 text-primary uppercase w-fit">
            <ShieldCheck className="size-3 animate-pulse text-primary" />
            <span>Redirect Chain Inspector</span>
          </div>

          <DialogTitle className="text-xl font-bold font-mono tracking-tight flex items-center gap-2">
            <span>Follow Every Hop</span>
            <span className="text-xs font-normal text-muted-foreground font-sans">
              ({monitorName})
            </span>
          </DialogTitle>

          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Follows the full redirect chain with a fresh GET request and reports each hop&apos;s
            status code and target. Diagnostic only — monitor checks are unaffected.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            onClick={handleInspect}
            disabled={isLoading}
            className="w-full font-mono text-[10px] uppercase tracking-wider"
          >
            {isLoading ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <CornerDownRight className="size-4 mr-2" />
            )}
            {isLoading ? "Tracing..." : "Trace Redirects"}
          </Button>

          {result && !result.success && (
            <div className="flex items-start gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
              <XCircle className="size-4 text-red-500 shrink-0 mt-0.5" />
              <p className="font-semibold text-red-500">{result.error}</p>
            </div>
          )}

          {result && result.success && (
            <div className="space-y-2">
              {result.hops.length === 0 && result.finalStatus !== null && (
                <div className="flex items-start gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="font-semibold text-emerald-500">
                    No redirects — the target responds directly with {result.finalStatus}.
                  </p>
                </div>
              )}

              {result.hops.map((hop, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                      Hop {i + 1}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        hop.status >= 300 && hop.status < 400
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      HTTP {hop.status}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-foreground break-all">{hop.url}</div>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-primary break-all">
                    <ArrowRight className="size-3 shrink-0" />
                    <span className="break-all">{hop.location}</span>
                  </div>
                </div>
              ))}

              {result.hops.length > 0 && (
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    Final Destination
                  </span>
                  <div className="text-[11px] font-mono text-foreground break-all">
                    {result.finalUrl}
                  </div>
                  <div className="flex items-center gap-2">
                    {result.finalStatus !== null ? (
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          result.finalStatus < 400
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        HTTP {result.finalStatus}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-red-500">
                        {result.errorReason || "No final response"}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
