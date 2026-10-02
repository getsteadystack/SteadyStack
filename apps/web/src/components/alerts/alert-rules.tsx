"use client";

import {
  Bell,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  Clock,
  Shield,
  Power,
  PowerOff,
} from "lucide-react";
import { useState, useTransition } from "react";
import { createAlertRule, deleteAlertRule, toggleAlertRule } from "@/actions/notifications";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AlertRule {
  id: string;
  trigger: string;
  threshold?: number | null;
  comparison?: string | null;
  targetStatus?: string | null;
  enabled: boolean;
  monitor: {
    id: string;
    name: string;
  };
  channels: Array<{
    id: string;
    name: string;
    type: string;
  }>;
}

interface Monitor {
  id: string;
  name: string;
}

interface Channel {
  id: string;
  name: string;
  type: string;
}

export function AlertRules({
  rules,
  monitors,
  channels,
}: {
  rules: AlertRule[];
  monitors: Monitor[];
  channels: Channel[];
}) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState("STATUS_CHANGE");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  async function handleDelete(id: string) {
    toast("Delete this alert rule?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => {
          startTransition(async () => {
            const res = await deleteAlertRule(id);
            if (res.success) {
              toast.success("Alert rule deleted");
            } else {
              toast.error(res.error);
            }
          });
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  }

  async function handleToggle(id: string, enabled: boolean) {
    startTransition(async () => {
      const res = await toggleAlertRule(id, enabled);
      if (res.success) {
        toast.success(enabled ? "Alert rule enabled" : "Alert rule disabled");
      } else {
        toast.error(res.error);
      }
    });
  }

  async function handleSubmit(formData: FormData) {
    if (selectedChannels.length === 0) {
      toast.error("Please select at least one notification channel");
      return;
    }

    formData.set("channelIds", JSON.stringify(selectedChannels));

    startTransition(async () => {
      const res = await createAlertRule(null, formData);
      if (res.success) {
        toast.success("Alert rule created");
        setIsOpen(false);
        setSelectedMonitor("");
        setSelectedTrigger("STATUS_CHANGE");
        setSelectedChannels([]);
      } else {
        toast.error(res.error);
      }
    });
  }

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case "STATUS_CHANGE":
        return AlertTriangle;
      case "LATENCY":
        return Clock;
      case "SSL_EXPIRY":
        return Shield;
      default:
        return Bell;
    }
  };

  const getTriggerLabel = (rule: AlertRule) => {
    if (rule.trigger === "STATUS_CHANGE") {
      return rule.targetStatus ? `Status → ${rule.targetStatus}` : "Any Status Change";
    }
    if (rule.trigger === "LATENCY") {
      const comp = rule.comparison === "GT" ? ">" : "<";
      return `Latency ${comp} ${rule.threshold}ms`;
    }
    if (rule.trigger === "SSL_EXPIRY") {
      return `SSL expires in < ${rule.threshold} days`;
    }
    return rule.trigger;
  };

  const toggleChannel = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId],
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between pb-2 border-b border-border/80">
        <div className="flex flex-col">
          <h3 className="text-xl font-serif font-medium text-foreground">Alert Rules</h3>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">
            Define automated conditions that trigger immediate notifications
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={channels.length === 0 || monitors.length === 0}
              className="bg-foreground hover:bg-foreground/90 text-background font-medium text-xs rounded-xl shadow-xs gap-2 h-9 px-4 cursor-pointer disabled:opacity-50"
            >
              <Plus className="size-4 text-[#ffd439]" /> Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] border-border bg-card text-foreground rounded-2xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-medium text-foreground">
                New Alert Rule
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Define threshold conditions for triggering notifications.
              </DialogDescription>
            </DialogHeader>

            <form action={handleSubmit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="monitorId" className="text-xs font-medium text-foreground">
                  Monitor
                </Label>
                <select
                  id="monitorId"
                  name="monitorId"
                  required
                  className="flex h-9 w-full rounded-xl border border-border bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 font-sans"
                  value={selectedMonitor}
                  onChange={(e) => setSelectedMonitor(e.target.value)}
                >
                  <option value="">Select a monitor...</option>
                  {monitors.map((monitor) => (
                    <option key={monitor.id} value={monitor.id}>
                      {monitor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="trigger" className="text-xs font-medium text-foreground">
                  Trigger Condition
                </Label>
                <select
                  id="trigger"
                  name="trigger"
                  required
                  className="flex h-9 w-full rounded-xl border border-border bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 font-sans"
                  value={selectedTrigger}
                  onChange={(e) => setSelectedTrigger(e.target.value)}
                >
                  <option value="STATUS_CHANGE">Status Change (UP / DOWN)</option>
                  <option value="LATENCY">High Response Latency</option>
                  <option value="SSL_EXPIRY">SSL Certificate Expiry</option>
                </select>
              </div>

              {selectedTrigger === "STATUS_CHANGE" && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="targetStatus" className="text-xs font-medium text-foreground">
                    Target Status (Optional)
                  </Label>
                  <select
                    id="targetStatus"
                    name="targetStatus"
                    className="flex h-9 w-full rounded-xl border border-border bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 font-sans"
                  >
                    <option value="">Any Status Change</option>
                    <option value="DOWN">DOWN</option>
                    <option value="UP">UP</option>
                  </select>
                </div>
              )}

              {selectedTrigger === "LATENCY" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="comparison" className="text-xs font-medium text-foreground">
                      Comparison
                    </Label>
                    <select
                      id="comparison"
                      name="comparison"
                      required
                      className="flex h-9 w-full rounded-xl border border-border bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 font-sans"
                    >
                      <option value="GT">Greater Than (&gt;)</option>
                      <option value="LT">Less Than (&lt;)</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="threshold" className="text-xs font-medium text-foreground">
                      Threshold (ms)
                    </Label>
                    <Input
                      id="threshold"
                      name="threshold"
                      type="number"
                      required
                      placeholder="2000"
                      className="rounded-xl border-border bg-background text-xs"
                    />
                  </div>
                </>
              )}

              {selectedTrigger === "SSL_EXPIRY" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="threshold" className="text-xs font-medium text-foreground">
                      Days Before Expiry
                    </Label>
                    <Input
                      id="threshold"
                      name="threshold"
                      type="number"
                      required
                      placeholder="7"
                      className="rounded-xl border-border bg-background text-xs"
                    />
                  </div>
                  <input type="hidden" name="comparison" value="LT" />
                </>
              )}

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">Notification Channels</Label>
                <div className="border border-border rounded-xl p-3 bg-muted/40 max-h-[180px] overflow-y-auto space-y-2">
                  {channels.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No channels available. Create one first.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {channels.map((channel) => (
                        <label
                          key={channel.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-background/80 p-2 rounded-lg transition-colors border border-transparent hover:border-border"
                        >
                          <input
                            type="checkbox"
                            checked={selectedChannels.includes(channel.id)}
                            onChange={() => toggleChannel(channel.id)}
                            className="rounded accent-foreground size-4"
                          />
                          <span className="text-xs font-sans font-medium text-foreground">
                            {channel.name}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground ml-auto uppercase">
                            {channel.type}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  disabled={isPending || selectedChannels.length === 0}
                  className="bg-foreground text-background hover:bg-foreground/90 font-medium text-xs rounded-xl shadow-xs px-5"
                >
                  {isPending ? <Loader2 className="animate-spin size-3.5 mr-2" /> : null}
                  Create Rule
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {channels.length === 0 && (
        <div className="border border-amber-500/30 bg-amber-500/10 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="size-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
              No Notification Channels
            </p>
            <p className="text-xs text-muted-foreground">
              Create at least one notification channel above to start routing alert rules.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule) => {
          const Icon = getTriggerIcon(rule.trigger);
          return (
            <div
              key={rule.id}
              className="bg-card border border-border p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs hover:border-foreground/20 transition-all"
            >
              <div className="flex items-start gap-3 flex-1 overflow-hidden">
                <div className="size-10 shrink-0 bg-muted border border-border rounded-xl flex items-center justify-center transition-colors">
                  <Icon className="size-5 text-foreground" />
                </div>
                <div className="flex flex-col gap-1 overflow-hidden flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground font-sans truncate">
                      {rule.monitor.name}
                    </span>
                    {!rule.enabled && (
                      <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Disabled
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground font-sans">
                    {getTriggerLabel(rule)}
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {rule.channels.map((channel) => (
                      <span
                        key={channel.id}
                        className="bg-muted text-foreground border border-border text-[10px] font-mono font-medium px-2 py-0.5 rounded-full uppercase tracking-wider"
                      >
                        {channel.type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => handleToggle(rule.id, !rule.enabled)}
                  disabled={isPending}
                  className="p-2 hover:bg-muted rounded-xl transition-colors border border-border cursor-pointer"
                  title={rule.enabled ? "Disable" : "Enable"}
                >
                  {rule.enabled ? (
                    <Power className="size-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <PowerOff className="size-4 text-muted-foreground" />
                  )}
                </button>
                <Button
                  disabled={isPending}
                  onClick={() => handleDelete(rule.id)}
                  variant="outline"
                  className="border-border hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium py-1.5 px-3 rounded-xl transition-all h-8 cursor-pointer"
                >
                  <Trash2 className="size-3 mr-1.5" /> Delete
                </Button>
              </div>
            </div>
          );
        })}

        {rules.length === 0 && channels.length > 0 && (
          <div className="col-span-full border border-dashed border-border bg-card rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
            <div className="p-3 bg-muted rounded-2xl border border-border text-foreground mb-1">
              <Bell className="size-6" />
            </div>
            <p className="font-serif text-base font-medium text-foreground">
              No alert rules configured
            </p>
            <p className="text-xs text-muted-foreground font-sans">
              Create an alert rule to define when notifications should dispatch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
