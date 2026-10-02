"use client";

import {
  MoreHorizontal,
  Zap,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Settings,
  Play,
  Pause,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toggleMonitor, checkMonitor, deleteMonitor } from "@/actions/monitors";
import { toast } from "@/components/ui/sonner";

/**
 * Renders a status bar with a background color based on the provided status.
 *
 * The function determines the appropriate background class for the bar based on the status value.
 * It uses specific classes for different statuses: red for 0, amber for 2, and a placeholder for 3 indicating no data.
 * The bar is styled with a fixed width and height, and the title attribute is set to "No Data" when the status is 3.
 *
 * @param {Object} param0 - The parameters object.
 * @param {number} param0.status - The status code that determines the background color of the bar.
 */
function UptimeBar({ status }: { status: number }) {
  let bgClass = "bg-primary/80";
  if (status === 0) bgClass = "bg-red-500/80";
  if (status === 2) bgClass = "bg-amber-500/80";
  if (status === 3) bgClass = "bg-zinc-800/80 dark:bg-zinc-700/50"; // Placeholder for no data (more visible)

  return (
    <div
      className={`w-1 h-3 md:h-4 ${bgClass} rounded-[1px]`}
      title={status === 3 ? "No Data" : ""}
    ></div>
  );
}

/**
 * Renders a paginated list of monitors with their statuses and details.
 *
 * The function calculates the total number of pages based on the number of monitors and the items per page. It slices the monitors array to display only the current page's monitors. Each monitor's uptime is calculated based on its event history, and the component provides navigation for pagination. The UI displays the status, monitor information, history, and response time for each monitor.
 *
 * @param {Object} param0 - The parameters object.
 * @param {any[]} param0.monitors - An array of monitor objects to be displayed.
 * @returns {JSX.Element} The rendered component displaying the list of monitors.
 */
export function MonitorList({ monitors }: { monitors: any[] }) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isChecking, setIsChecking] = useState<Record<string, boolean>>({});
  const [isToggling, setIsToggling] = useState<Record<string, boolean>>({});
  const [deleteMonitorId, setDeleteMonitorId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const monitorToDelete = deleteMonitorId ? monitors.find((m) => m.id === deleteMonitorId) : null;

  const handleCheckNow = async (e: React.MouseEvent, monitorId: string, name: string) => {
    e.stopPropagation();
    setIsChecking((prev) => ({ ...prev, [monitorId]: true }));
    const toastId = toast.loading(`Triggering check for ${name}...`);
    try {
      const res = await checkMonitor(monitorId, {
        checkRegions: ["Dashboard Manual Action"],
        reason: "User manually requested check",
      });
      if (res.success) {
        toast.success(`Check completed for ${name}`, { id: toastId });
      } else {
        toast.error(res.error || `Failed to trigger check for ${name}`, {
          id: toastId,
        });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred", { id: toastId });
    } finally {
      setIsChecking((prev) => ({ ...prev, [monitorId]: false }));
    }
  };

  const handleToggle = async (
    e: React.MouseEvent,
    monitorId: string,
    name: string,
    currentStatus: string,
  ) => {
    e.stopPropagation();
    setIsToggling((prev) => ({ ...prev, [monitorId]: true }));
    const nextEnabled = currentStatus === "PAUSED";
    const toastId = toast.loading(`${nextEnabled ? "Resuming" : "Pausing"} ${name}...`);
    try {
      const res = await toggleMonitor(monitorId, nextEnabled);
      if (res.success) {
        toast.success(`${name} ${nextEnabled ? "resumed" : "paused"} successfully`, {
          id: toastId,
        });
      } else {
        toast.error(res.error || `Failed to toggle ${name}`, { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred", { id: toastId });
    } finally {
      setIsToggling((prev) => ({ ...prev, [monitorId]: false }));
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, monitorId: string) => {
    e.stopPropagation();
    setDeleteMonitorId(monitorId);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteMonitorId) return;
    setIsDeleting(true);
    const monitor = monitors.find((m) => m.id === deleteMonitorId);
    const name = monitor?.name || "Monitor";
    const toastId = toast.loading(`Deleting ${name}...`);
    try {
      const res = await deleteMonitor(deleteMonitorId);
      if (res.success) {
        toast.success(`${name} deleted successfully`, { id: toastId });
        setDeleteMonitorId(null);
      } else {
        toast.error(res.error || `Failed to delete ${name}`, { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(monitors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentMonitors = monitors.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    for (const monitor of currentMonitors) {
      router.prefetch(`/dashboard/monitors/${monitor.id}`);
    }
  }, [currentMonitors, router]);

  const getUptime = (events: any[]) => {
    if (!events || events.length === 0) return 0;
    // Consider both UP and MAINTENANCE as "not down" for success rate,
    // or strictly UP? Usually Maintenance doesn't count against uptime.
    // Let's stick to UP count / total count for now, or total - down / total.
    const downCount = events.filter((e) => e.status === "DOWN").length;
    return Math.round(((events.length - downCount) / events.length) * 100);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <>
      <div className="border border-border bg-card rounded-2xl relative overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 text-[10px] text-muted-foreground uppercase tracking-wider font-mono font-bold">
                  Status
                </th>
                <th className="p-4 text-[10px] text-muted-foreground uppercase tracking-wider font-mono font-bold">
                  Monitor Info
                </th>
                <th className="p-4 text-[10px] text-muted-foreground uppercase tracking-wider font-mono font-bold">
                  History (Latest)
                </th>
                <th className="p-4 text-[10px] text-muted-foreground uppercase tracking-wider font-mono font-bold">
                  Response
                </th>
                <th className="p-4 text-[10px] text-muted-foreground uppercase tracking-wider font-mono font-bold text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {monitors.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-muted-foreground font-mono text-xs uppercase tracking-wider"
                  >
                    No monitors active in this view.
                  </td>
                </tr>
              ) : (
                currentMonitors.map((monitor) => {
                  const recentEvents = monitor.events ? monitor.events.slice(0, 20) : [];

                  const rawHistory = [...recentEvents].reverse().map((e: any) => {
                    if (e.status === "MAINTENANCE") return 2;
                    return e.status === "UP" ? 1 : 0;
                  });

                  const history = Array(20).fill(3);
                  const startIndex = 20 - rawHistory.length;
                  rawHistory.forEach((status, index) => {
                    if (startIndex + index < 20) {
                      history[startIndex + index] = status;
                    }
                  });

                  const latestLatency = monitor.events?.[0]?.latency;
                  const uptime = getUptime(monitor.events);

                  return (
                    <tr
                      key={monitor.id}
                      onClick={() => router.push(`/dashboard/monitors/${monitor.id}`)}
                      className="group hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <td className="p-4 w-32">
                        {monitor.status === "UP" && (
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 w-fit rounded-full text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                            <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span>UP</span>
                          </div>
                        )}
                        {monitor.status === "DOWN" && (
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-red-500/10 border border-red-500/20 w-fit rounded-full text-red-600 dark:text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                            <div className="size-1.5 bg-red-500 rounded-full animate-ping"></div>
                            <span>DOWN</span>
                          </div>
                        )}
                        {monitor.status === "PAUSED" && (
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 w-fit rounded-full text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                            <div className="size-1.5 bg-amber-500 rounded-full"></div>
                            <span>PAUSED</span>
                          </div>
                        )}
                        {monitor.status === "MAINTENANCE" && (
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 w-fit rounded-full text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                            <div className="size-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                            <span>MAINT</span>
                          </div>
                        )}
                      </td>
                      <td className={`p-4 ${monitor.status === "PAUSED" ? "opacity-75" : ""}`}>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                            {monitor.name}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5 font-mono truncate max-w-sm">
                            {monitor.type === "HEARTBEAT" ? "Heartbeat Monitor" : monitor.url}
                          </span>
                          {monitor.tags && monitor.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {monitor.tags.map((tag: string) => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-[9px] font-mono tracking-wider bg-muted border border-border text-muted-foreground rounded-md uppercase font-semibold"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className={`p-4 ${monitor.status === "PAUSED" ? "opacity-50" : ""}`}>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-0.5 h-4 items-end">
                            {history.map((h: number, i: number) => (
                              <UptimeBar key={i} status={h} />
                            ))}
                          </div>
                          <span
                            className={`text-xs font-mono font-bold ${uptime < 100 ? "text-red-500" : "text-foreground"}`}
                          >
                            {uptime}%
                          </span>
                        </div>
                      </td>
                      <td className={`p-4 ${monitor.status === "PAUSED" ? "opacity-50" : ""}`}>
                        {monitor.status !== "PAUSED" ? (
                          <div className="flex items-center gap-2 text-xs font-mono font-semibold">
                            {monitor.status === "DOWN" ? (
                              <WifiOff className="size-3.5 text-red-500" />
                            ) : (
                              <Zap className="size-3.5 text-emerald-600" />
                            )}
                            <span
                              className={
                                monitor.status === "DOWN" ? "text-red-500" : "text-foreground"
                              }
                            >
                              {latestLatency ? latestLatency + "ms" : "--"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">--</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors rounded-xl cursor-pointer outline-none"
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-2xl border border-border bg-popover p-1.5 min-w-[150px] shadow-md text-xs font-medium"
                          >
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/monitors/${monitor.id}`);
                              }}
                              className="cursor-pointer rounded-xl px-2.5 py-1.5"
                            >
                              <ExternalLink className="size-3.5 mr-2" />
                              View Telemetry
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/monitors/${monitor.id}/settings`);
                              }}
                              className="cursor-pointer rounded-xl px-2.5 py-1.5"
                            >
                              <Settings className="size-3.5 mr-2" />
                              Edit Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/60" />
                            <DropdownMenuItem
                              onClick={(e) => handleCheckNow(e, monitor.id, monitor.name)}
                              disabled={monitor.status === "PAUSED" || isChecking[monitor.id]}
                              className="cursor-pointer rounded-xl px-2.5 py-1.5"
                            >
                              {isChecking[monitor.id] ? (
                                <Loader2 className="size-3.5 mr-2 animate-spin" />
                              ) : (
                                <Play className="size-3.5 mr-2" />
                              )}
                              Trigger Check
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) =>
                                handleToggle(e, monitor.id, monitor.name, monitor.status)
                              }
                              disabled={isToggling[monitor.id]}
                              className="cursor-pointer rounded-xl px-2.5 py-1.5"
                            >
                              {isToggling[monitor.id] ? (
                                <Loader2 className="size-3.5 mr-2 animate-spin" />
                              ) : monitor.status === "PAUSED" ? (
                                <Play className="size-3.5 mr-2" />
                              ) : (
                                <Pause className="size-3.5 mr-2" />
                              )}
                              {monitor.status === "PAUSED" ? "Resume" : "Pause"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/60" />
                            <DropdownMenuItem
                              onClick={(e) => handleDeleteClick(e, monitor.id)}
                              className="cursor-pointer text-red-600 focus:bg-red-500/10 focus:text-red-600 rounded-xl px-2.5 py-1.5"
                            >
                              <Trash2 className="size-3.5 mr-2" />
                              Delete Monitor
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
          <span className="text-[11px] text-muted-foreground font-mono">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, monitors.length)} of{" "}
            {monitors.length} targets
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold disabled:opacity-30 flex items-center gap-1 transition-all rounded-xl cursor-pointer shadow-xs"
            >
              <ChevronLeft className="size-3.5" /> Prev
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold disabled:opacity-30 flex items-center gap-1 transition-all rounded-xl cursor-pointer shadow-xs"
            >
              Next <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      <Dialog
        open={deleteMonitorId !== null}
        onOpenChange={(open) => !open && setDeleteMonitorId(null)}
      >
        <DialogContent className="rounded-2xl border border-border bg-card p-6 shadow-xl max-w-md text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-serif font-semibold text-foreground flex items-center gap-2">
              <Trash2 className="size-4 text-red-600" /> Delete Monitor
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Are you sure you want to permanently delete monitor{" "}
              <strong className="text-foreground">{monitorToDelete?.name}</strong>? This action is
              irreversible and will erase all recorded uptime and latency telemetry.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-5 gap-2 sm:gap-2">
            <button
              onClick={() => setDeleteMonitorId(null)}
              className="px-4 py-2 border border-border text-foreground hover:bg-muted text-xs font-semibold transition-all rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : null}
              Delete Permanently
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
