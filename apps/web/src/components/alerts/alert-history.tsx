"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAlertHistory } from "@/actions/notifications";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Timer,
  Activity,
  MoreHorizontal,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AlertEvent {
  id: string;
  monitor: { name: string; url: string };
  status: string;
  latency: number;
  timestamp: Date;
  errorReason?: string | null;
}

interface AlertHistoryProps {
  history: AlertEvent[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export function AlertHistory({
  history: initialHistory,
  currentPage,
  totalPages: initialTotalPages,
  totalCount: initialTotalCount,
}: AlertHistoryProps) {
  const [history, setHistory] = useState<AlertEvent[]>(initialHistory);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [totalCount, setTotalCount] = useState(initialTotalCount);

  // Poll for updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await getAlertHistory(currentPage);
        if (data && data.events) {
          // Type casting might be needed if Prisma return implies specific enum
          setHistory(data.events as any[]);
          setTotalPages(data.totalPages);
          setTotalCount(data.totalCount);
        }
      } catch (error) {
        console.error("Failed to poll history", error);
      }
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [currentPage]);

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const getTypeConfig = (event: AlertEvent) => {
    if (event.status === "DOWN") {
      return {
        text: event.errorReason || "System Down",
        icon: AlertTriangle,
        color: "text-red-500",
        statusColor: "text-red-500 bg-red-500/10 border-red-500/20",
      };
    }
    if (event.status === "MAINTENANCE") {
      return {
        text: "Maintenance",
        icon: Settings,
        color: "text-blue-500",
        statusColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      };
    }
    // UP
    if (event.latency > 1000) {
      return {
        text: `High Latency (${event.latency}ms)`,
        icon: Timer,
        color: "text-yellow-500",
        statusColor: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
      };
    }
    return {
      text: "Operational",
      icon: CheckCircle,
      color: "text-green-500",
      statusColor: "text-green-500 bg-green-500/10 border-green-500/20",
    };
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between pb-2 border-b border-border/80">
        <div className="flex flex-col">
          <h3 className="text-xl font-serif font-medium text-foreground">System Event Log</h3>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">
            Recent monitor health events and dispatch records
          </p>
        </div>
      </div>

      <div className="border border-border bg-card rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
                  Target System
                </th>
                <th className="px-6 py-3.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
                  Event Type
                </th>
                <th className="px-6 py-3.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
                  Status
                </th>
                <th className="px-6 py-3.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
                  Details
                </th>
                <th className="px-6 py-3.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider font-mono">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-xs text-muted-foreground font-sans"
                  >
                    No system events recorded yet.
                  </td>
                </tr>
              ) : (
                history.map((item) => {
                  const config = getTypeConfig(item);
                  const Icon = config.icon;
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-foreground font-sans">
                          {item.monitor.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Icon className={`size-4 ${config.color}`} />
                          <span className="text-xs font-medium text-foreground font-sans">
                            {config.text}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-medium uppercase tracking-wider ${config.statusColor}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.status === "UP" ? (
                          <span className="text-xs text-muted-foreground font-mono">
                            {item.latency}ms latency
                          </span>
                        ) : (
                          <span
                            className="text-xs text-rose-600 dark:text-rose-400 font-mono truncate max-w-[200px] block"
                            title={item.errorReason || ""}
                          >
                            {item.errorReason || "No details"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="size-3.5" />
                          <span className="text-xs font-mono">{formatTimeAgo(item.timestamp)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-muted/30 px-6 py-3.5 flex items-center justify-between border-t border-border font-mono text-xs">
          <p className="text-[11px] text-muted-foreground">
            Page {currentPage} of {totalPages} ({totalCount} entries)
          </p>
          <div className="flex gap-2">
            <Link
              href={currentPage > 1 ? `?page=${currentPage - 1}` : "#"}
              className={`px-3 py-1.5 border border-border bg-card rounded-xl text-foreground text-xs font-medium transition-all flex items-center gap-1 shadow-xs ${
                currentPage <= 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-muted"
              }`}
            >
              <ChevronLeft className="size-3.5" /> Prev
            </Link>
            <Link
              href={currentPage < totalPages ? `?page=${currentPage + 1}` : "#"}
              className={`px-3 py-1.5 border border-border bg-card rounded-xl text-foreground text-xs font-medium transition-all flex items-center gap-1 shadow-xs ${
                currentPage >= totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-muted"
              }`}
            >
              Next <ChevronRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
