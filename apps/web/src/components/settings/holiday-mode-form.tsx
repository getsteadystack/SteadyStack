"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Palmtree as PalmTree, CalendarClock, PartyPopper, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { setHolidayMode } from "@/actions/user";

/** Client-safe mirror of @steadystack/core's isHolidayModeActive (core pulls in node builtins, so it can't be imported in a client bundle). */
function isHolidayActive(until: string | null | undefined): boolean {
  if (!until) return false;
  const t = new Date(until).getTime();
  return Number.isFinite(t) && t > Date.now();
}

function toLocalInputValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface HolidayModeFormProps {
  /** Current suspension deadline (ISO string) or null when disabled. */
  initialUntil: string | null;
}

/**
 * Holiday mode — suspend ALL alerts & notifications until a specific date.
 *
 * Monitoring continues and incidents are still recorded; only alert delivery
 * (email, Slack, Discord, PagerDuty, Opsgenie, status-page subscriber
 * updates) is paused until the chosen date or until turned off early.
 */
export function HolidayModeForm({ initialUntil }: HolidayModeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [until, setUntil] = useState<string | null>(initialUntil);
  const [draftDate, setDraftDate] = useState(() => {
    const existing = toLocalInputValue(initialUntil);
    if (existing) return existing;
    const suggested = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${suggested.getFullYear()}-${pad(suggested.getMonth() + 1)}-${pad(suggested.getDate())}`;
  });
  const [saving, setSaving] = useState(false);

  const active = isHolidayActive(until);

  const apply = async (nextUntil: string | null) => {
    setSaving(true);
    try {
      const result = await setHolidayMode({
        until: nextUntil ? new Date(`${nextUntil}T23:59:59`).toISOString() : null,
      });
      if (!result.success) {
        toast.error(result.error || "Failed to update holiday mode");
        return;
      }
      setUntil(nextUntil ? new Date(`${nextUntil}T23:59:59`).toISOString() : null);
      toast.success(
        nextUntil ? "Holiday mode on — alerts suspended" : "Holiday mode off — alerts resumed",
      );
      startTransition(() => router.refresh());
    } catch (error) {
      console.error(error);
      toast.error("Failed to update holiday mode");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-black/40 border border-primary/20 relative overflow-hidden backdrop-blur-sm group hover:border-primary/40 transition-all">
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-primary/30 group-hover:border-primary/60 transition-colors"></div>

      <div className="p-6 border-b border-primary/20 bg-primary/5 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground font-mono uppercase tracking-tight flex items-center gap-2">
            <PalmTree className="size-4 text-primary" />
            Holiday Mode
          </h3>
          <p className="text-xs text-primary/60 font-mono">
            Suspend all alerts &amp; notifications until a specific date
          </p>
        </div>
        {active && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] uppercase font-bold text-amber-400 tracking-wider">
            <PartyPopper className="size-3" />
            Active
          </span>
        )}
      </div>

      <div className="p-6 flex flex-col gap-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Monitoring keeps running and incidents are still recorded — only alert delivery is
          paused (email, Slack, Discord, PagerDuty, Opsgenie, and status-page subscriber updates).
          Alerts resume automatically after the end date, or resume them early anytime.
        </p>

        {active && until && (
          <div className="flex items-center gap-2 text-xs text-amber-400 font-mono bg-amber-500/5 border border-amber-500/20 rounded-md p-3">
            <CalendarClock className="size-4 shrink-0" />
            Alerts suspended until {new Date(until).toLocaleString()}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-primary/70 uppercase tracking-widest font-mono">
              Resume alerts on
            </label>
            <input
              type="date"
              value={draftDate}
              min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10)}
              onChange={(e) => setDraftDate(e.target.value)}
              className="bg-black border border-primary/20 focus:border-primary/60 text-white text-sm rounded-sm p-2.5 font-mono focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              disabled={saving || isPending || !draftDate}
              onClick={() => apply(draftDate)}
              className="min-h-[44px] font-mono text-xs uppercase tracking-wider"
            >
              {saving ? <Loader2 className="size-3 animate-spin" /> : null}
              {active ? "Update End Date" : "Suspend Alerts"}
            </Button>
            {active && (
              <Button
                type="button"
                variant="outline"
                disabled={saving || isPending}
                onClick={() => apply(null)}
                className="min-h-[44px] font-mono text-xs uppercase tracking-wider"
              >
                Resume Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
