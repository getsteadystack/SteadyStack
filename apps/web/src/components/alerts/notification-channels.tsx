"use client";

import { useState, useTransition, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MessageSquare, Mail, Terminal, Plus, Loader2, Trash2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import {
  createNotificationChannel,
  deleteNotificationChannel,
  sendTestNotification,
} from "@/actions/notifications";
import type { NotificationChannel } from "@steadystack/db";

function getIcon(type: string) {
  switch (type) {
    case "SLACK":
      return MessageSquare;
    case "DISCORD":
      return MessageSquare;
    case "EMAIL":
      return Mail;
    case "PAGERDUTY":
    case "OPSGENIE":
      return Bell;
    default:
      return Terminal;
  }
}

function getColor(type: string) {
  switch (type) {
    case "SLACK":
      return "text-[#E01E5A]";
    case "DISCORD":
      return "text-[#5865F2]";
    case "EMAIL":
      return "text-primary";
    case "PAGERDUTY":
      return "text-[#06AC38]";
    case "OPSGENIE":
      return "text-[#0052CC]";
    default:
      return "text-primary/50";
  }
}

function getDetail(channel: NotificationChannel) {
  const config = channel.config as Record<string, any>;

  if (channel.type === "EMAIL") {
    return config?.email || config?.value || "Email";
  }
  if (channel.type === "SLACK") {
    return (
      config?.channelName ||
      config?.channel ||
      (config?.webhookUrl ? `Webhook: ...${config.webhookUrl.slice(-16)}` : null) ||
      (config?.webhook_url ? `Webhook: ...${config.webhook_url.slice(-16)}` : null) ||
      channel.name ||
      "Slack Channel"
    );
  }
  if (channel.type === "DISCORD") {
    return (
      (config?.channelId ? `Channel ID: ${config.channelId}` : null) ||
      (config?.webhookUrl ? `Webhook: ...${config.webhookUrl.slice(-16)}` : null) ||
      (config?.webhook_url ? `Webhook: ...${config.webhook_url.slice(-16)}` : null) ||
      channel.name ||
      "Discord Channel"
    );
  }
  if (channel.type === "WEBHOOK") {
    return config?.url || "Custom Webhook";
  }
  if (channel.type === "PAGERDUTY") {
    const key = config?.routingKey as string | undefined;
    return key ? `${key.slice(0, 6)}••••${key.slice(-4)}` : "PagerDuty";
  }
  if (channel.type === "OPSGENIE") {
    const key = config?.apiKey as string | undefined;
    const region = (config?.region || "us").toUpperCase();
    return key ? `${key.slice(0, 6)}•••• (${region})` : `Opsgenie (${region})`;
  }
  return config?.value || channel.name || "Channel";
}

interface NotificationChannelsProps {
  channels: NotificationChannel[];
  slackClientId?: string;
  discordClientId?: string;
}

/**
 * Renders the Notification Channels component.
 */
export function NotificationChannels({
  channels,
  slackClientId,
  discordClientId,
}: NotificationChannelsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<
    "discord" | "slack" | "email" | "pagerduty" | "opsgenie"
  >("discord");

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "discord_connected") {
      toast.success("Discord channel connected successfully!");
      router.replace("/dashboard/alerts");
    } else if (success === "slack_connected") {
      toast.success("Slack channel connected successfully!");
      router.replace("/dashboard/alerts");
    }

    if (error) {
      if (error.startsWith("slack_")) {
        const detail = decodeURIComponent(error.replace("slack_", ""));
        if (detail === "redirect_uri_mismatch") {
          toast.error(
            `Slack Error: Redirect URI mismatch. In Slack App → OAuth & Permissions, add: ${window.location.origin}/api/integrations/slack/callback`,
            { duration: 8000 },
          );
        } else if (detail === "invalid_client_id") {
          toast.error("Slack Error: Invalid Client ID in .env / environment variables.");
        } else if (detail === "bad_client_secret") {
          toast.error("Slack Error: Invalid Client Secret in .env / environment variables.");
        } else if (detail === "missing_scope" || detail === "invalid_scope") {
          toast.error(
            "Slack Error: Missing scopes. In Slack App → Features → Incoming Webhooks, toggle Activate Incoming Webhooks to ON.",
          );
        } else {
          toast.error(
            `Slack authorization failed (${detail}). Check your Slack App configuration.`,
          );
        }
      } else if (error.startsWith("discord_")) {
        const detail = decodeURIComponent(error.replace("discord_", ""));
        if (detail === "no_webhook_permission") {
          toast.error("Discord Error: Missing webhook permissions during server authorization.");
        } else {
          toast.error(
            `Discord authorization failed (${detail}). Check your Discord App configuration.`,
          );
        }
      } else {
        toast.error(`Channel connection error: ${error}`);
      }
      router.replace("/dashboard/alerts");
    }
  }, [searchParams, router]);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      const result = await createNotificationChannel(null, formData);
      if (result.success) {
        toast.success("Channel created successfully");
        setIsOpen(false);
      } else {
        toast.error(result.error || "Failed to create channel");
      }
    });
  };

  const handleTest = async (channelId: string) => {
    startTransition(async () => {
      const result = await sendTestNotification(channelId);
      if (result.success) {
        toast.success("Test notification sent successfully");
      } else {
        toast.error(result.error || "Failed to send test notification");
      }
    });
  };

  const handleDelete = async (channelId: string) => {
    if (!confirm("Are you sure you want to delete this channel?")) {
      return;
    }
    startTransition(async () => {
      const result = await deleteNotificationChannel(channelId);
      if (result.success) {
        toast.success("Channel deleted successfully");
      } else {
        toast.error(result.error || "Failed to delete channel");
      }
    });
  };
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between pb-2 border-b border-border/80">
        <div className="flex flex-col">
          <h3 className="text-xl font-serif font-medium text-foreground">Notification Channels</h3>
          <p className="text-xs text-muted-foreground font-sans mt-0.5">
            Configure dispatch channels and alerts for outage notifications
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-foreground hover:bg-foreground/90 text-background font-medium text-xs rounded-xl shadow-xs gap-2 h-9 px-4 cursor-pointer">
              <Plus className="size-4 text-[#ffd439]" /> Add Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto border-border bg-card text-foreground rounded-2xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-medium text-foreground">
                New Notification Channel
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configure an alert destination for incident and downtime notifications.
              </DialogDescription>
            </DialogHeader>

            {/* Channel Type Selector Tabs */}
            <div className="grid grid-cols-5 gap-1 p-1 bg-muted/60 border border-border rounded-xl mb-4 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab("discord")}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                  activeTab === "discord"
                    ? "bg-[#5865F2] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                Discord
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("slack")}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                  activeTab === "slack"
                    ? "bg-[#E01E5A] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                Slack
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("email")}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                  activeTab === "email"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("pagerduty")}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                  activeTab === "pagerduty"
                    ? "bg-[#06AC38] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                PagerDuty
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("opsgenie")}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all text-center cursor-pointer ${
                  activeTab === "opsgenie"
                    ? "bg-[#0052CC] text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                Opsgenie
              </button>
            </div>

            {/* DISCORD FORM */}
            {activeTab === "discord" && (
              <div className="flex flex-col gap-4">
                {discordClientId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-[#5865F2]/50 text-[#5865F2] hover:bg-[#5865F2]/10 font-mono text-xs"
                    onClick={() => {
                      const redirect = encodeURIComponent(
                        `${window.location.origin}/api/integrations/discord/callback`,
                      );
                      window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&redirect_uri=${redirect}&response_type=code&scope=bot+webhook.incoming`;
                    }}
                  >
                    <div className="size-3 mr-2 bg-[#5865F2] rounded-full" />
                    Connect via Discord 1-Click OAuth
                  </Button>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-primary/20" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-black/90 px-2 text-primary/50 font-mono">
                      {discordClientId ? "Or Paste Webhook Directly" : "Discord Incoming Webhook"}
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const name = formData.get("name") as string;
                    const webhookUrl = formData.get("webhookUrl") as string;
                    const submitData = new FormData();
                    submitData.append("name", name);
                    submitData.append("type", "DISCORD");
                    submitData.append("config", JSON.stringify({ webhookUrl }));
                    handleSubmit(submitData);
                  }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="discordName">Channel Name</Label>
                    <Input
                      id="discordName"
                      name="name"
                      required
                      placeholder="Discord #alerts"
                      className="bg-primary/5 border-primary/20 font-mono text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="discordWebhookUrl">
                      Discord Webhook URL
                      <span className="text-[10px] text-zinc-400 ml-2 font-normal">
                        (Discord Server Settings → Integrations → Webhooks)
                      </span>
                    </Label>
                    <Input
                      id="discordWebhookUrl"
                      name="webhookUrl"
                      required
                      type="url"
                      placeholder="https://discord.com/api/webhooks/..."
                      className="bg-primary/5 border-primary/20 font-mono text-xs"
                    />
                  </div>
                  <DialogFooter className="mt-2">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full font-mono uppercase bg-[#5865F2] hover:bg-[#5865F2]/90 text-white"
                    >
                      {isPending ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
                      Save Discord Channel
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            )}

            {/* SLACK FORM */}
            {activeTab === "slack" && (
              <div className="flex flex-col gap-4">
                {slackClientId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-[#E01E5A]/50 text-[#E01E5A] hover:bg-[#E01E5A]/10 font-mono text-xs"
                    onClick={() => {
                      const redirect = encodeURIComponent(
                        `${window.location.origin}/api/integrations/slack/callback`,
                      );
                      window.location.href = `https://slack.com/oauth/v2/authorize?client_id=${slackClientId}&scope=incoming-webhook,chat:write,commands&redirect_uri=${redirect}`;
                    }}
                  >
                    <div className="size-3 mr-2 bg-[#E01E5A] rounded-full" />
                    Connect via Slack 1-Click OAuth
                  </Button>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-primary/20" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-black/90 px-2 text-primary/50 font-mono">
                      {slackClientId ? "Or Paste Webhook Directly" : "Slack Incoming Webhook"}
                    </span>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const name = formData.get("name") as string;
                    const webhookUrl = formData.get("webhookUrl") as string;
                    const submitData = new FormData();
                    submitData.append("name", name);
                    submitData.append("type", "SLACK");
                    submitData.append("config", JSON.stringify({ webhookUrl }));
                    handleSubmit(submitData);
                  }}
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="slackName">Channel Name</Label>
                    <Input
                      id="slackName"
                      name="name"
                      required
                      placeholder="Slack #incidents"
                      className="bg-primary/5 border-primary/20 font-mono text-xs"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="slackWebhookUrl">
                      Slack Webhook URL
                      <span className="text-[10px] text-zinc-400 ml-2 font-normal">
                        (api.slack.com → Incoming Webhooks)
                      </span>
                    </Label>
                    <Input
                      id="slackWebhookUrl"
                      name="webhookUrl"
                      required
                      type="url"
                      placeholder="https://hooks.slack.com/services/..."
                      className="bg-primary/5 border-primary/20 font-mono text-xs"
                    />
                  </div>
                  <DialogFooter className="mt-2">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full font-mono uppercase bg-[#E01E5A] hover:bg-[#E01E5A]/90 text-white"
                    >
                      {isPending ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
                      Save Slack Channel
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            )}

            {/* EMAIL FORM */}
            {activeTab === "email" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const email = formData.get("email") as string;
                  const submitData = new FormData();
                  submitData.append("name", formData.get("name") as string);
                  submitData.append("type", "EMAIL");
                  submitData.append("config", JSON.stringify({ email }));
                  handleSubmit(submitData);
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Channel Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Primary Email"
                    className="bg-primary/5 border-primary/20 font-mono text-xs"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    required
                    type="email"
                    placeholder="devops@example.com"
                    className="bg-primary/5 border-primary/20 font-mono text-xs"
                  />
                </div>

                <DialogFooter className="mt-2">
                  <Button type="submit" disabled={isPending} className="w-full font-mono uppercase">
                    {isPending ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
                    Save Email Channel
                  </Button>
                </DialogFooter>
              </form>
            )}

            {/* PAGERDUTY FORM */}
            {activeTab === "pagerduty" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const routingKey = formData.get("pagerdutyRoutingKey") as string;
                  const submitData = new FormData();
                  submitData.append("name", formData.get("pagerdutyName") as string);
                  submitData.append("type", "PAGERDUTY");
                  submitData.append("config", JSON.stringify({ routingKey }));
                  handleSubmit(submitData);
                }}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="pagerdutyName">Channel Name</Label>
                  <Input
                    id="pagerdutyName"
                    name="pagerdutyName"
                    required
                    placeholder="PagerDuty Production"
                    className="bg-primary/5 border-primary/20 font-mono text-xs"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="pagerdutyRoutingKey">
                    Integration Routing Key
                    <a
                      href="https://support.pagerduty.com/docs/services-and-integrations"
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 text-[#06AC38] hover:underline text-[10px] font-mono"
                    >
                      (Find in PagerDuty Services)
                    </a>
                  </Label>
                  <Input
                    id="pagerdutyRoutingKey"
                    name="pagerdutyRoutingKey"
                    required
                    placeholder="R015PXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="bg-primary/5 border-primary/20 font-mono text-xs"
                  />
                </div>
                <DialogFooter className="mt-2">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-[#06AC38] hover:bg-[#06AC38]/90 text-white font-mono uppercase"
                  >
                    {isPending ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
                    Save PagerDuty Channel
                  </Button>
                </DialogFooter>
              </form>
            )}

            {/* OPSGENIE FORM */}
            {activeTab === "opsgenie" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const apiKey = formData.get("opsgenieApiKey") as string;
                  const region = formData.get("opsgenieRegion") as string;
                  const submitData = new FormData();
                  submitData.append("name", formData.get("opsgenieName") as string);
                  submitData.append("type", "OPSGENIE");
                  submitData.append("config", JSON.stringify({ apiKey, region }));
                  handleSubmit(submitData);
                }}
                className="flex flex-col gap-3"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="opsgenieName">Channel Name</Label>
                  <Input
                    id="opsgenieName"
                    name="opsgenieName"
                    required
                    placeholder="Opsgenie Escalation"
                    className="bg-primary/5 border-primary/20 font-mono text-xs"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="opsgenieApiKey">API Integration Key</Label>
                  <Input
                    id="opsgenieApiKey"
                    name="opsgenieApiKey"
                    required
                    placeholder="eb32xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="bg-primary/5 border-primary/20 font-mono text-xs"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="opsgenieRegion">Data Region</Label>
                  <select
                    id="opsgenieRegion"
                    name="opsgenieRegion"
                    defaultValue="us"
                    className="h-9 w-full rounded-md border border-primary/20 bg-zinc-900 px-3 py-1 text-xs text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  >
                    <option value="us">United States (api.opsgenie.com)</option>
                    <option value="eu">European Union (api.eu.opsgenie.com)</option>
                  </select>
                </div>
                <DialogFooter className="mt-2">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-[#0052CC] hover:bg-[#0052CC]/90 text-white font-mono uppercase"
                  >
                    {isPending ? <Loader2 className="animate-spin size-4 mr-2" /> : null}
                    Save Opsgenie Channel
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => {
          const Icon = getIcon(channel.type);
          return (
            <div
              key={channel.id}
              className="bg-card border border-border p-5 rounded-2xl flex flex-col gap-4 shadow-xs hover:border-foreground/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="size-10 shrink-0 bg-muted border border-border rounded-xl flex items-center justify-center transition-colors">
                    <Icon className={`size-5 ${getColor(channel.type)}`} />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-foreground font-sans truncate">
                      {channel.name}
                    </span>
                    <span
                      className="text-xs text-muted-foreground font-mono truncate"
                      title={getDetail(channel)}
                    >
                      {getDetail(channel)}
                    </span>
                  </div>
                </div>
                <span className="bg-muted text-foreground border border-border text-[10px] font-mono font-medium px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {channel.type}
                </span>
              </div>

              <div className="flex gap-2 mt-auto pt-2 border-t border-border">
                <Button
                  disabled={isPending}
                  onClick={() => handleTest(channel.id)}
                  variant="outline"
                  className="flex-1 border-border hover:bg-muted text-foreground text-xs font-medium py-1.5 rounded-xl transition-all h-8 cursor-pointer"
                >
                  <Terminal className="size-3 mr-1.5 text-muted-foreground" /> Test
                </Button>
                <Button
                  disabled={isPending}
                  onClick={() => handleDelete(channel.id)}
                  variant="outline"
                  className="flex-1 border-border hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium py-1.5 rounded-xl transition-all h-8 cursor-pointer"
                >
                  <Trash2 className="size-3 mr-1.5" /> Delete
                </Button>
              </div>
            </div>
          );
        })}

        {channels.length === 0 && (
          <div className="col-span-full border border-dashed border-border bg-card rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
            <div className="p-3 bg-muted rounded-2xl border border-border text-foreground mb-1">
              <Bell className="size-6" />
            </div>
            <p className="font-serif text-base font-medium text-foreground">
              No notification channels initialized
            </p>
            <p className="text-xs text-muted-foreground font-sans">
              Add Slack, Discord, or Email to receive instant downtime alerts.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
