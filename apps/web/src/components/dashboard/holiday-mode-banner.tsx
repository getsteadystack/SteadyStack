"use client";

import { useState } from "react";
import Link from "next/link";
import { Palmtree, X } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { setHolidayMode } from "@/actions/user";

/** Client-safe mirror of @steadystack/core's isHolidayModeActive. */
function isHolidayActive(until: string | null | undefined): boolean {
  if (!until) return false;
  const t = new Date(until).getTime();
  return Number.isFinite(t) && t > Date.now();
}

interface HolidayModeBannerProps {
  /** Current suspension deadline (ISO string) or null when disabled. */
  holidayModeUntil: string | null;
}

/**
 * Banner reminding the user that all alerts are suspended while holiday mode
 * is active, with a one-click "resume now" action.
 */
export function HolidayModeBanner({ holidayModeUntil }: HolidayModeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);

  const active = isHolidayActive(holidayModeUntil);
  if (dismissed || !active || !holidayModeUntil) return null;

  const resumeNow = async () => {
    setBusy(true);
    try {
      const result = await setHolidayMode({ until: null });
      if (result.success) {
        toast.success("Holiday mode off — alerts resumed");
        window.location.reload();
      } else {
        toast.error(result.error || "Failed to resume alerts");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to resume alerts");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 backdrop-blur-md transition-all">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 text-amber-400/60 hover:text-amber-300 transition-colors"
      >
        <X className="size-4" />
      </button>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Palmtree className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-200">Holiday mode is on</h4>
            <p className="mt-1 text-xs text-zinc-300 font-mono">
              All alerts &amp; notifications are suspended until{" "}
              <span className="text-amber-300 font-bold">
                {new Date(holidayModeUntil).toLocaleString()}
              </span>
              . Monitoring and incident recording continue as normal.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/settings?tab=general"
            className="font-mono text-[10px] uppercase tracking-wider text-amber-400/80 hover:text-amber-300 px-3 py-2"
          >
            Settings
          </Link>
          <button
            type="button"
            disabled={busy}
            onClick={resumeNow}
            className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-amber-300 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
          >
            {busy ? "Resuming…" : "Resume Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
