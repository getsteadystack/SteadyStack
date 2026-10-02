"use client";

import { cn } from "@/lib/utils";
import { useFormatters } from "@/lib/format";

interface IncidentTimelineProps {
  events: any[];
  userTimezone?: string;
  userTimeFormat?: string;
}

export function IncidentTimeline({
  events,
  userTimezone = "UTC",
  userTimeFormat = "HH:mm",
}: IncidentTimelineProps) {
  const f = useFormatters();
  if (!events || events.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold font-mono uppercase tracking-wider text-muted-foreground">
        Audit Timeline
      </h3>
      <div className="border-l border-primary/20 pl-6 ml-2 space-y-8 relative">
        {events.map((event, index) => (
          <div key={event.id} className="relative group">
            {/* Dot */}
            <div
              className={cn(
                "absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border border-primary/50 bg-background transition-all duration-300",
                index === events.length - 1
                  ? "bg-primary/20 scale-125 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                  : "bg-muted",
              )}
            ></div>

            <div className="flex flex-col gap-1">
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-sm border uppercase font-mono tracking-wider",
                    event.type === "STATE_CHANGE"
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                      : event.type === "AUTO_RESOLVE"
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : event.type === "ALERT_SENT"
                          ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          : "bg-muted/50 text-muted-foreground border-transparent",
                  )}
                >
                  {event.type.replace("_", " ")}
                </span>
                <span className="text-xs font-mono text-muted-foreground/60">
                  {f.formatDate(event.createdAt, {
                    style: "datetime",
                    // Preserve per-user overrides; fall back to active locale.
                  })}
                </span>
              </div>
              <p className="text-sm mt-1 text-foreground/90">{event.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
