"use client";

import { useFormatters } from "@/lib/format";
import { Wrench, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";

interface MaintenanceWindow {
  id: string;
  description: string | null;
  startAt: string;
  endAt: string;
  monitor: {
    name: string;
  };
}

interface MaintenanceTimelineProps {
  maintenanceWindows: MaintenanceWindow[];
}

type MaintenanceStatus = "upcoming" | "active" | "completed";

function getMaintenanceStatus(startAt: string, endAt: string): MaintenanceStatus {
  const now = new Date();
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "active";
  return "completed";
}

function formatDateTime(dateString: string, locale: string) {
  const date = new Date(dateString);
  try {
    return date.toLocaleString(locale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return date.toISOString();
  }
}

function getTimeUntil(dateString: string): string {
  const now = new Date();
  const target = new Date(dateString);
  const diffMs = target.getTime() - now.getTime();

  if (diffMs < 0) return "Started";

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}

function getTimeRemaining(endString: string): string {
  const now = new Date();
  const end = new Date(endString);
  const diffMs = end.getTime() - now.getTime();

  if (diffMs < 0) return "Ended";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}

function getDuration(startAt: string, endAt: string): string {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const diffMs = end.getTime() - start.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function MaintenanceTimeline({ maintenanceWindows }: MaintenanceTimelineProps) {
  const f = useFormatters();
  const format = (d: string) => formatDateTime(d, f.locale);

  if (maintenanceWindows.length === 0) {
    return (
      <div className="rounded-sm border border-primary/20 bg-card/40 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="size-5 text-primary" />
          <h3 className="text-lg font-bold font-mono uppercase tracking-tight text-foreground">
            Maintenance Schedule
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/40">
          <Calendar className="size-10 mb-3" />
          <p className="text-xs font-mono uppercase tracking-widest">No scheduled maintenance</p>
        </div>
      </div>
    );
  }

  // Group by status
  const activeWindows = maintenanceWindows.filter(
    (w) => getMaintenanceStatus(w.startAt, w.endAt) === "active",
  );
  const upcomingWindows = maintenanceWindows.filter(
    (w) => getMaintenanceStatus(w.startAt, w.endAt) === "upcoming",
  );
  const completedWindows = maintenanceWindows.filter(
    (w) => getMaintenanceStatus(w.startAt, w.endAt) === "completed",
  );

  return (
    <div className="rounded-sm border border-primary/20 bg-card/40 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <Wrench className="size-5 text-primary" />
        <h3 className="text-lg font-bold font-mono uppercase tracking-tight text-foreground">
          Maintenance Schedule
        </h3>
      </div>

      <div className="space-y-6">
        {/* Active Maintenance */}
        {activeWindows.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="size-2 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-yellow-500 font-bold">
                In Progress
              </span>
            </div>
            <div className="space-y-3">
              {activeWindows.map((window) => (
                <div
                  key={window.id}
                  className="border border-yellow-500/20 bg-yellow-500/5 rounded-sm p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="size-4 text-yellow-500" />
                        <span className="text-sm font-medium text-foreground">
                          {window.monitor.name}
                        </span>
                      </div>
                      {window.description && (
                        <p className="text-xs text-muted-foreground mt-1 pl-6">
                          {window.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-yellow-500 font-bold">
                        {getTimeRemaining(window.endAt)}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60 font-mono mt-1">
                        Ends {format(window.endAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Maintenance */}
        {upcomingWindows.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="size-3 text-blue-500" />
              <span className="text-xs font-mono uppercase tracking-widest text-blue-500 font-bold">
                Scheduled
              </span>
            </div>
            <div className="border-l border-primary/20 pl-4 ml-1.5 space-y-4">
              {upcomingWindows.map((window) => (
                <div key={window.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-[21px] top-2 size-2 rounded-full bg-blue-500/50 border border-blue-500" />

                  <div className="bg-card/60 border border-primary/10 rounded-sm p-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-sm font-medium text-foreground">
                          {window.monitor.name}
                        </span>
                        {window.description && (
                          <p className="text-xs text-muted-foreground mt-1">{window.description}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono text-blue-500 font-bold">
                          {getTimeUntil(window.startAt)}
                        </div>
                        <div className="text-[10px] text-muted-foreground/60 font-mono">
                          {getDuration(window.startAt, window.endAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground font-mono">
                      <span>{format(window.startAt)}</span>
                      <span className="text-primary/40">→</span>
                      <span>{format(window.endAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Maintenance */}
        {completedWindows.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="size-3 text-green-500" />
              <span className="text-xs font-mono uppercase tracking-widest text-green-500/60 font-bold">
                Recently Completed
              </span>
            </div>
            <div className="space-y-2">
              {completedWindows.slice(0, 3).map((window) => (
                <div
                  key={window.id}
                  className="flex items-center justify-between gap-4 text-muted-foreground/60 py-2 border-b border-primary/5 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-3 text-green-500/50" />
                    <span className="text-xs">{window.monitor.name}</span>
                  </div>
                  <span className="text-[10px] font-mono">{format(window.endAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
