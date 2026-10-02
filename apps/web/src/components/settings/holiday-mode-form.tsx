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
    <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-serif font-medium text-foreground flex items-center gap-2">
            <PalmTree className="size-5 text-[#ffd439]" />
            Holiday Mode
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Suspend all alerts &amp; notifications until a specific date
          </p>
        </div>
        {active && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] uppercase font-mono font-bold text-amber-700 dark:text-amber-300 tracking-wider">
            <PartyPopper className="size-3" />
            Active
          </span>
        )}
      </div>

      <div className="p-6 flex flex-col gap-5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Monitoring keeps running and incidents are still recorded — only alert delivery is paused
          (email, Slack, Discord, PagerDuty, Opsgenie, and status-page subscriber updates). Alerts
          resume automatically after the end date, or resume them early anytime.
        </p>

        {active && until && (
          <div className="flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300 font-mono bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5">
            <CalendarClock className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            Alerts suspended until {new Date(until).toLocaleString()}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Resume alerts on</label>
            <input
              type="date"
              value={draftDate}
              min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10)}
              onChange={(e) => setDraftDate(e.target.value)}
              className="bg-card border border-border text-foreground text-xs rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              disabled={saving || isPending || !draftDate}
              onClick={() => apply(draftDate)}
              className="h-10 px-4 rounded-xl bg-foreground hover:bg-foreground/90 text-background text-xs font-medium transition-all shadow-sm"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : null}
              {active ? "Update End Date" : "Suspend Alerts"}
            </Button>
            {active && (
              <Button
                type="button"
                variant="outline"
                disabled={saving || isPending}
                onClick={() => apply(null)}
                className="h-10 px-4 rounded-xl border-border text-foreground hover:bg-muted text-xs font-medium transition-all"
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
