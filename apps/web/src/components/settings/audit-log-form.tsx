"use client";

import { useState, useEffect, useCallback } from "react";
import { History, Search, Shield, RefreshCw, Loader2, User, Key, Building2 } from "lucide-react";
import { getWorkspaceAuditLogs } from "@/actions/team";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface AuditLogItem {
  id: string;
  action: string;
  resource: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getActionBadge(action: string) {
  if (action.includes("invited") || action.includes("joined") || action.includes("created")) {
    return "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30";
  }
  if (action.includes("removed") || action.includes("deleted") || action.includes("canceled")) {
    return "bg-destructive/10 text-destructive border-destructive/30";
  }
  if (action.includes("updated") || action.includes("role")) {
    return "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30";
  }
  return "bg-muted text-muted-foreground border-border";
}

export function AuditLogForm() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getWorkspaceAuditLogs();
      setLogs(res);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.resource.toLowerCase().includes(q) ||
      log.user.email.toLowerCase().includes(q) ||
      (log.user.name && log.user.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <History className="size-5 text-[#ffd439]" />
            <h2 className="text-lg font-serif font-medium text-foreground">
              Workspace Audit Trail
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Immutable log of all team actions, member modifications, role changes, and security
            events.
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={cn("size-3.5 text-muted-foreground", loading && "animate-spin")} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by action, user, or resource..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 text-xs h-10 bg-card border-border rounded-xl"
          />
        </div>
      </div>

      {/* Log Feed */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-2 text-xs font-mono text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-foreground" />
            <span>Loading audit log entries...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-2 text-xs text-muted-foreground">
            <Shield className="size-8 text-muted-foreground/40 mb-1" />
            <span className="font-serif text-base font-medium text-foreground">
              No audit logs recorded yet
            </span>
            <span>
              Team actions, invitations, and role adjustments will appear here in real-time.
            </span>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors text-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="size-8 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-[10px] text-foreground shrink-0 mt-0.5">
                    {log.user.name
                      ? log.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      : "OP"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground truncate">
                        {log.user.name || log.user.email}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                          getActionBadge(log.action),
                        )}
                      >
                        {log.action}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        [{log.resource}]
                      </span>
                    </div>

                    {log.metadata && (
                      <div className="text-[11px] text-muted-foreground mt-1 font-mono truncate max-w-[500px]">
                        {JSON.stringify(log.metadata)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono shrink-0 sm:text-right">
                  {log.ipAddress && (
                    <span className="px-2 py-0.5 rounded-md bg-muted border border-border text-[11px]">
                      {log.ipAddress}
                    </span>
                  )}
                  <span title={new Date(log.createdAt).toLocaleString()}>
                    {timeAgo(log.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
