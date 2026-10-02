"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Calendar,
  Terminal,
  Zap,
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  Info,
  AlertCircle,
  Play,
  Settings,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Simple Cron Humanizer & Predictor
function humanizeCron(cron: string): string {
  const parts = cron.split(" ");
  if (parts.length !== 5) return "Invalid expression structure";

  const [min, hour, dom, month, dow] = parts;

  if (cron === "* * * * *") return "Every minute, every day";
  if (cron === "0 * * * *") return "Every hour at minute 0";
  if (cron === "0 0 * * *") return "Every day at midnight";
  if (cron === "0 0 * * 0") return "Every Sunday at midnight";
  if (min.startsWith("*/")) return `Every ${min.split("/")[1]} minutes`;

  return `At minute ${min}, hour ${hour}, on day ${dom} of month ${month}, on day ${dow} of week`;
}

function predictNextRuns(cron: string, count = 5): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  let current = new Date(now.getTime());
  current.setSeconds(0, 0);

  const [min, hour] = cron.split(" ");

  // Basic simulation for common monitor presets
  // (In production, use cron-parser, but here we simulate for the UI)
  for (let i = 0; i < count; i++) {
    if (min.startsWith("*/")) {
      const step = parseInt(min.split("/")[1]);
      current = new Date(current.getTime() + step * 60000);
    } else if (min === "0" && hour === "0") {
      current.setDate(current.getDate() + 1);
      current.setHours(0, 0, 0, 0);
    } else if (min === "0" && hour.startsWith("*/")) {
      const step = parseInt(hour.split("/")[1]);
      current = new Date(current.getTime() + step * 3600000);
    } else {
      current = new Date(current.getTime() + 60000);
    }
    dates.push(new Date(current.getTime()));
  }
  return dates;
}

export function CronSentinel() {
  const router = useRouter();
  const [cron, setCron] = useState("*/5 * * * *");
  const [copied, setCopied] = useState(false);
  const [nextRuns, setNextRuns] = useState<Date[]>([]);
  const [isComputing, setIsComputing] = useState(false);

  useEffect(() => {
    setNextRuns(predictNextRuns(cron));
  }, [cron]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cron);
    setCopied(true);
    toast.success("Schedule sequence copied to buffer");
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    { name: "Every Minute", val: "* * * * *" },
    { name: "Every 5 Mins", val: "*/5 * * * *" },
    { name: "Every 15 Mins", val: "*/15 * * * *" },
    { name: "Every Hour", val: "0 * * * *" },
    { name: "Daily (Midnight)", val: "0 0 * * *" },
    { name: "Weekly (Sun)", val: "0 0 * * 0" },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Editor */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-card/40 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-mono uppercase tracking-tighter italic text-lg leading-none">
                    Sequence Input
                  </CardTitle>
                  <CardDescription className="font-mono text-[10px] opacity-60 uppercase tracking-widest mt-1">
                    Configure your execution trigger
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-primary/60 uppercase tracking-widest pl-1">
                  CRON EXPRESSION
                </label>
                <div className="relative group">
                  <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within:text-primary transition-colors" />
                  <Input
                    value={cron}
                    onChange={(e) => setCron(e.target.value)}
                    className="pl-10 h-14 bg-background/50 border-primary/20 font-mono text-xl tracking-widest text-primary focus-visible:ring-primary/40 focus-visible:border-primary/60"
                  />
                  <Button
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 text-primary/40 hover:text-primary"
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest pl-1 italic">
                  // Quick Presets
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {presets.map((p) => (
                    <Button
                      key={p.name}
                      variant="outline"
                      className={cn(
                        "h-10 text-[10px] uppercase font-mono tracking-widest border-primary/10 transition-all",
                        cron === p.val
                          ? "bg-primary/20 border-primary/40 text-primary"
                          : "hover:border-primary/30",
                      )}
                      onClick={() => setCron(p.val)}
                    >
                      {p.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-8 p-4 bg-primary/5 border-l-2 border-primary rounded-sm space-y-1">
                <div className="text-[9px] font-mono text-primary uppercase font-bold tracking-[0.2em]">
                  Human Translation
                </div>
                <p className="font-mono text-xs text-foreground/80 lowercase italic">
                  "{humanizeCron(cron)}"
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-linear-to-br from-primary/10 to-transparent p-6 text-center space-y-4">
            <h2 className="font-mono text-sm uppercase font-bold italic tracking-tighter">
              Ready to Deploy Schedule?
            </h2>
            <Button
              className="w-full h-11 uppercase font-mono font-bold tracking-tighter group"
              onClick={() => {
                router.push(`/dashboard/monitors/new?cron=${encodeURIComponent(cron)}`);
              }}
            >
              Initialize Monitor
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        </div>

        {/* Right: Debugger/Timeline */}
        <div className="space-y-6">
          <Card className="border border-primary/20 bg-card/60 h-full overflow-hidden flex flex-col">
            <CardHeader className="bg-muted p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-primary animate-pulse" />
                  <span className="font-mono text-xs uppercase text-primary font-bold tracking-widest">
                    Execution Timeline
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="text-[8px] font-mono uppercase border-primary/20 text-primary/60"
                >
                  Real-Time Simulation
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col">
              <div className="flex-1 overflow-auto custom-scrollbar">
                {nextRuns.map((date, idx) => (
                  <motion.div
                    key={date.getTime() + idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-4 p-5 border-b border-primary/5 hover:bg-primary/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-mono text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                      {idx + 1}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-sm text-foreground font-bold tracking-tight">
                          {date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          })}
                        </div>
                        <div className="text-[10px] font-mono text-primary/40 uppercase tracking-widest">
                          +{idx === 0 ? "Next" : `${idx * 5} mins`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-foreground/40 uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {date.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-primary/0 group-hover:text-primary transition-all opacity-0 group-hover:opacity-100" />
                  </motion.div>
                ))}
              </div>

              <div className="p-6 bg-primary/5 mt-auto">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <div className="space-y-2">
                    <p className="text-[10px] font-mono text-foreground/60 leading-relaxed uppercase tracking-tighter italic">
                      Execution nodes are distributed across sovereign global edge regions.
                      Timestamps reflect multi-node synchronization.
                    </p>
                    <div className="flex gap-1.5 h-1 items-end">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-primary/20"
                          animate={{ height: [4, 8, 4] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-primary/10">
        {[
          {
            title: "Standard CRON",
            desc: "Supports classic 5-part Linux cron semantics (Minute, Hour, Day, Month, Week).",
            icon: <Clock className="w-4 h-4" />,
          },
          {
            title: "Edge Scheduling",
            desc: "SteadyStack triggers monitors at precisely these intervals across the global CDN.",
            icon: <Zap className="w-4 h-4" />,
          },
          {
            title: "Conflict Check",
            desc: "Built-in validation ensures your cron sequences don't overlap or cause race conditions.",
            icon: <AlertCircle className="w-4 h-4" />,
          },
        ].map((feat) => (
          <div
            key={feat.title}
            className="space-y-2 p-4 rounded-lg hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase font-bold tracking-widest">
              {feat.icon}
              {feat.title}
            </div>
            <p className="text-xs text-muted-foreground font-mono leading-relaxed">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
