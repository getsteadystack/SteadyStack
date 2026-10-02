import {
  CheckCircle,
  AlertTriangle,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe,
  Activity,
  Terminal,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getVisiblePages } from "@/lib/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function IncidentHistory({ monitor }: { monitor: any }) {
  const events = monitor.events || [];
  const history = events;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(history.length / itemsPerPage);

  // Event modal state
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const paginatedHistory = history.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const exportToCSV = () => {
    const headers = ["Status", "Timestamp", "Latency"];
    const rows = history.map((event: any) => [
      event.status,
      new Date(event.timestamp).toISOString(),
      event.latency ? `${event.latency}ms` : "0",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers, ...rows].map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `monitor_events_${monitor.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-xs relative overflow-hidden group">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h3 className="text-foreground text-base font-serif font-medium tracking-tight">
            Event Log
          </h3>
          <p className="text-muted-foreground text-xs font-mono">Recent heartbeat activity</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-3.5 py-2 bg-accent/60 border border-border text-foreground rounded-xl text-xs font-semibold hover:bg-accent transition-colors font-mono cursor-pointer"
        >
          <Download className="size-3.5 text-muted-foreground" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="py-3 px-4 text-muted-foreground text-[10px] font-bold uppercase tracking-wider font-mono">
                Status
              </th>
              <th className="py-3 px-4 text-muted-foreground text-[10px] font-bold uppercase tracking-wider font-mono">
                Region
              </th>
              <th className="py-3 px-4 text-muted-foreground text-[10px] font-bold uppercase tracking-wider font-mono">
                Timestamp
              </th>
              <th className="py-3 px-4 text-muted-foreground text-[10px] font-bold uppercase tracking-wider font-mono">
                Latency
              </th>
              <th className="py-3 px-4 text-muted-foreground text-[10px] font-bold uppercase tracking-wider font-mono text-right">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {paginatedHistory.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="p-8 text-center text-muted-foreground font-mono text-xs uppercase tracking-wider"
                >
                  No events recorded. Output stream silent.
                </td>
              </tr>
            )}
            {paginatedHistory.map((event: any) => (
              <tr key={event.id} className="hover:bg-accent/30 transition-colors group font-mono">
                <td className="py-3.5 px-4">
                  {event.status === "UP" ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 text-xs font-semibold">
                      <CheckCircle className="size-3.5" />
                      Operational
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-500/10 text-red-700 text-xs font-semibold">
                      <AlertTriangle className="size-3.5" />
                      Downtime
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">
                  {event.region || "Global"}
                </td>
                <td className="py-3.5 px-4 text-xs text-foreground/80">
                  {new Date(event.timestamp).toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-xs font-semibold text-foreground">
                  {event.latency ? `${event.latency}ms` : "Timeout"}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => setSelectedEvent(event)}
                    className="text-foreground hover:bg-accent px-2.5 py-1 rounded-lg transition-all text-xs font-medium border border-border cursor-pointer"
                  >
                    Log
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
          <span className="text-xs text-muted-foreground font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border border-border text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-all rounded-lg cursor-pointer"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <div className="flex gap-1">
              {getVisiblePages(currentPage, totalPages).map((page, i) =>
                typeof page === "number" ? (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={cn(
                      "w-7 h-7 flex items-center justify-center text-xs font-mono font-medium transition-all rounded-lg border",
                      currentPage === page
                        ? "bg-foreground text-background border-foreground font-bold"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-accent",
                    )}
                  >
                    {page}
                  </button>
                ) : (
                  <span
                    key={`ellipsis-${i}`}
                    className="w-7 h-7 flex items-center justify-center text-xs font-mono text-muted-foreground"
                  >
                    ...
                  </span>
                ),
              )}
            </div>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border border-border text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-30 transition-all rounded-lg cursor-pointer"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-[600px] border-border bg-card shadow-xl rounded-2xl font-mono text-xs text-foreground">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="text-foreground text-base font-serif font-medium tracking-tight flex items-center gap-2">
              <Terminal className="size-4 text-foreground" />
              Event Log Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-mono text-xs">
              System telemetry recorded during heartbeat execution.
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="flex flex-col gap-5 py-4">
              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 border border-border bg-accent/30 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 font-bold font-mono">
                    <Clock className="size-3 text-muted-foreground" />
                    Timestamp
                  </span>
                  <span className="font-semibold text-xs text-foreground">
                    {new Date(selectedEvent.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="p-3.5 border border-border bg-accent/30 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 font-bold font-mono">
                    <Globe className="size-3 text-muted-foreground" />
                    Region
                  </span>
                  <span className="font-semibold text-xs text-foreground uppercase tracking-wider">
                    {selectedEvent.region || "Global"}
                  </span>
                </div>

                <div className="p-3.5 border border-border bg-accent/30 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 font-bold font-mono">
                    <Activity className="size-3 text-muted-foreground" />
                    Latency
                  </span>
                  <span className="font-semibold text-xs text-foreground">
                    {selectedEvent.latency ? `${selectedEvent.latency}ms` : "Timeout"}
                  </span>
                </div>

                <div className="p-3.5 border border-border bg-accent/30 rounded-xl flex flex-col gap-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 font-bold font-mono">
                    {selectedEvent.status === "UP" ? (
                      <CheckCircle className="size-3 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="size-3 text-red-600" />
                    )}
                    Status
                  </span>
                  <span
                    className={cn(
                      "font-semibold text-xs uppercase tracking-wider",
                      selectedEvent.status === "UP" ? "text-emerald-700" : "text-red-700",
                    )}
                  >
                    {selectedEvent.status === "UP" ? "Operational" : "Downtime"}
                  </span>
                </div>
              </div>

              {/* Error Reason */}
              {selectedEvent.errorReason && (
                <div className="p-3.5 border border-red-500/20 bg-red-500/5 rounded-xl flex flex-col gap-1.5">
                  <span className="text-[10px] text-red-600 uppercase tracking-wider flex items-center gap-1.5 font-bold font-mono">
                    <AlertTriangle className="size-3" />
                    Error Identified
                  </span>
                  <span className="font-medium text-red-600 text-xs break-all whitespace-pre-line font-mono">
                    {selectedEvent.errorReason}
                  </span>
                </div>
              )}

              {/* Raw JSON Payload */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-mono px-1">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="size-3.5 text-muted-foreground" />
                    Raw event payload
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(selectedEvent, null, 2));
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 hover:text-foreground transition-colors py-1 px-2 rounded-lg border border-border bg-accent/40 text-xs cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="size-3 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 rounded-xl border border-border bg-muted/40 font-mono text-xs text-foreground overflow-x-auto max-h-[220px]">
                  <code>{JSON.stringify(selectedEvent, null, 2)}</code>
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
