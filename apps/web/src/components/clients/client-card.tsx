"use client";

import { useState } from "react";
import {
  Mail,
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Globe,
  Activity,
  Shield,
  Radio,
  Copy,
  Settings,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  createClient,
  updateClient,
  deleteClient,
  assignMonitorToClient,
  createClientStatusPage,
  updateClientStatusPageDomain,
} from "@/actions/clients";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { MonthlyReportPanel } from "./monthly-report-panel";
import { ClientPortalPanel } from "./client-portal-panel";

// ─── Colour palette for client "brand" dots ───────────────────────────────────
const PALETTE = [
  "#10b981", // emerald (default)
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

// ─── Uptime helper ─────────────────────────────────────────────────────────────
function calcUptime(events: { status: string }[]) {
  if (!events || events.length === 0) return null;
  const up = events.filter((e) => e.status === "UP").length;
  return Math.round((up / events.length) * 100);
}

// ─── Status dot ───────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const cls =
    status === "UP"
      ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"
      : status === "DOWN"
        ? "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
        : status === "DEGRADED"
          ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]"
          : "bg-zinc-500";
  return <span className={`inline-block size-2 rounded-full shrink-0 ${cls}`} />;
}

// ─── Uptime badge ─────────────────────────────────────────────────────────────
function UptimeBadge({ uptime }: { uptime: number }) {
  const color =
    uptime >= 99
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : uptime >= 95
        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
        : "text-red-400 bg-red-500/10 border-red-500/20";
  return (
    <span
      className={cn("text-[10px] font-mono font-semibold px-1.5 py-0.5 border rounded-sm", color)}
    >
      {uptime}%
    </span>
  );
}

// ─── CreateClientForm ─────────────────────────────────────────────────────────
export function CreateClientForm({ onDone }: { onDone?: () => void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#10b981");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    const res = await createClient({
      name: name.trim(),
      color,
      website,
      contactEmail,
    });
    setLoading(false);
    if (res.success) {
      toast.success(`Client "${name}" created`);
      setName("");
      setWebsite("");
      setContactEmail("");
      onDone?.();
    } else {
      toast.error(res.error || "Failed to create client");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative bg-card border border-border rounded-2xl shadow-xs overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />

      <div className="p-6 flex flex-col gap-4">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
          Create New Client Account
        </div>

        <div className="flex gap-3 items-center">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono w-14">
            Accent
          </span>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "size-5 rounded-full border-2 transition-all cursor-pointer",
                  color === c
                    ? "border-foreground scale-110 shadow-xs"
                    : "border-transparent hover:scale-105 hover:border-foreground/30",
                )}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Client / Brand Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Studio"
              required
              className="bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-foreground focus:bg-card transition-colors text-foreground"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Website URL
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://client.com"
              className="bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-foreground focus:bg-card transition-colors text-foreground"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
              Contact / SLA Notification Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@client.com"
              className="bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-foreground focus:bg-card transition-colors text-foreground"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          {onDone && (
            <button
              type="button"
              onClick={onDone}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-[#373428] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            Save Client
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── ClientCard ────────────────────────────────────────────────────────────────
interface Monitor {
  id: string;
  name: string;
  url: string;
  status: string;
  type: string;
  events: { status: string; latency: number; timestamp: string }[];
}

interface StatusPageInfo {
  id: string;
  slug: string;
  customDomain: string | null;
  title: string;
}

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    color: string;
    website: string | null;
    contactEmail: string | null;
    notes: string | null;
    emailReportsEnabled?: boolean;
    reportRecipientEmails?: string | null;
    reportTargetSla?: number;
    lastReportSentAt?: Date | string | null;
    portalToken?: string | null;
    portalEnabled?: boolean;
    portalPinHash?: string | null;
    monitors: Monitor[];
    statusPage: StatusPageInfo | null;
  };
  allMonitors: { id: string; name: string; clientId: string | null }[];
}

export function ClientCard({ client, allMonitors }: ClientCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(client.name);
  const [editColor, setEditColor] = useState(client.color);
  const [editEmail, setEditEmail] = useState(client.contactEmail || "");
  const [editWebsite, setEditWebsite] = useState(client.website || "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [statusPage, setStatusPage] = useState<StatusPageInfo | null>(client.statusPage);

  const uptimeValues = client.monitors
    .map((m) => calcUptime(m.events))
    .filter((u): u is number => u !== null);
  const avgUptime = uptimeValues.length
    ? Math.round(uptimeValues.reduce((a, b) => a + b, 0) / uptimeValues.length)
    : null;

  const upMonitors = client.monitors.filter((m) => m.status === "UP").length;
  const downMonitors = client.monitors.filter((m) => m.status === "DOWN").length;

  const handleSave = async () => {
    setSaving(true);
    const res = await updateClient(client.id, {
      name: editName,
      color: editColor,
      contactEmail: editEmail,
      website: editWebsite,
    });
    setSaving(false);
    if (res.success) {
      toast.success("Client updated");
      setEditing(false);
    } else {
      toast.error(res.error || "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete client "${client.name}"? Monitors will be unassigned.`)) return;
    setDeleting(true);
    const res = await deleteClient(client.id);
    setDeleting(false);
    if (!res.success) toast.error(res.error || "Delete failed");
  };

  const handleAssign = async (monitorId: string, assign: boolean) => {
    setAssigning(true);
    await assignMonitorToClient(monitorId, assign ? client.id : null);
    setAssigning(false);
  };

  const unassigned = allMonitors.filter((m) => !m.clientId || m.clientId === client.id);

  return (
    <div className="relative bg-card border border-border rounded-2xl shadow-xs group/card transition-all hover:shadow-md hover:border-foreground/20 overflow-hidden">
      {/* Client colour accent bar */}
      <div
        className="absolute inset-x-0 top-0 h-1 transition-all"
        style={{ backgroundColor: editing ? editColor : client.color }}
      />

      {/* ── Header ── */}
      <div className="flex items-start gap-4 p-5">
        {/* Avatar */}
        <div
          className="mt-0.5 size-10 rounded-xl shrink-0 flex items-center justify-center text-white font-serif font-bold text-base shadow-xs"
          style={{
            backgroundColor: editing ? editColor : client.color,
          }}
        >
          {(editing ? editName : client.name).charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-1.5 flex-wrap">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditColor(c)}
                    className={cn(
                      "size-4 rounded-full border-2 transition-all cursor-pointer",
                      editColor === c
                        ? "border-foreground scale-110 shadow-xs"
                        : "border-transparent hover:scale-105",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <input
                className="bg-muted/40 border border-border rounded-xl px-3 py-1.5 text-sm font-semibold focus:outline-none focus:border-foreground focus:bg-card transition-colors text-foreground"
                value={editName}
                placeholder="Client name"
                onChange={(e) => setEditName(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="bg-muted/40 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-foreground focus:bg-card transition-colors text-foreground"
                  placeholder="Email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
                <input
                  className="bg-muted/40 border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-foreground focus:bg-card transition-colors text-foreground"
                  placeholder="Website"
                  value={editWebsite}
                  onChange={(e) => setEditWebsite(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif font-semibold text-base leading-tight text-foreground">
                  {client.name}
                </h3>
                {client.website && (
                  <a
                    href={client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                {client.monitors.length > 0 ? (
                  <div className="flex items-center gap-1.5">
                    {upMonitors > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-sm">
                        <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
                        {upMonitors} up
                      </span>
                    )}
                    {downMonitors > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-sm">
                        <span className="size-1.5 rounded-full bg-red-400 inline-block" />
                        {downMonitors} down
                      </span>
                    )}
                    {upMonitors === 0 && downMonitors === 0 && (
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {client.monitors.length} monitor
                        {client.monitors.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground/60 font-mono italic">
                    No monitors yet
                  </span>
                )}

                {avgUptime !== null && <UptimeBadge uptime={avgUptime} />}

                {client.contactEmail && (
                  <span className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Mail className="size-3" />
                    {client.contactEmail}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-2 text-emerald-400 hover:bg-emerald-500/10 transition-colors rounded cursor-pointer"
                title="Save"
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Check className="size-3.5" />
                )}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded cursor-pointer"
                title="Cancel"
              >
                <X className="size-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded cursor-pointer opacity-0 group-hover/card:opacity-100"
                title="Edit"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-muted-foreground hover:text-red-400 transition-colors rounded cursor-pointer opacity-0 group-hover/card:opacity-100"
                title="Delete client"
              >
                <Trash2 className="size-3.5" />
              </button>
            </>
          )}
          <button
            onClick={() => setExpanded((p) => !p)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded cursor-pointer"
          >
            {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      {expanded && (
        <div className="border-t border-border/30">
          {/* Monitor list */}
          {client.monitors.length === 0 ? (
            <div className="px-5 py-6 flex flex-col items-center gap-2 text-center">
              <div className="size-8 rounded-full bg-muted/30 flex items-center justify-center">
                <Activity className="size-4 text-muted-foreground/40" />
              </div>
              <p className="text-xs text-muted-foreground">No monitors assigned yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {client.monitors.map((m) => {
                const uptime = calcUptime(m.events);
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 px-5 py-3 group/row hover:bg-muted/10 transition-colors"
                  >
                    <StatusDot status={m.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-tight">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                        <Globe className="size-2.5 shrink-0" />
                        {m.url}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:block text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60 bg-muted/20 px-1.5 py-0.5 rounded-sm border border-border/30">
                        {m.type}
                      </span>
                      {uptime !== null && <UptimeBadge uptime={uptime} />}
                      <button
                        onClick={() => handleAssign(m.id, false)}
                        disabled={assigning}
                        className="opacity-0 group-hover/row:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-red-400 cursor-pointer rounded hover:bg-red-500/10"
                        title="Remove from client"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add monitor */}
          <div className="border-t border-border/20">
            <AddMonitorToClient
              clientId={client.id}
              clientMonitorIds={client.monitors.map((m) => m.id)}
              allMonitors={unassigned}
            />
          </div>

          {/* Status page panel */}
          <div className="border-t border-border/20">
            <StatusPagePanel
              clientId={client.id}
              clientColor={client.color}
              statusPage={statusPage}
              onCreated={setStatusPage}
            />
          </div>

          {/* Monthly SLA Report panel */}
          <MonthlyReportPanel
            clientId={client.id}
            clientName={client.name}
            clientColor={client.color}
            contactEmail={client.contactEmail}
            initialSettings={{
              emailReportsEnabled: client.emailReportsEnabled ?? false,
              reportRecipientEmails: client.reportRecipientEmails ?? null,
              reportTargetSla: client.reportTargetSla ?? 99.9,
              lastReportSentAt: client.lastReportSentAt ?? null,
            }}
          />

          {/* Client Read-Only SLA Portal Panel */}
          <ClientPortalPanel
            clientId={client.id}
            clientName={client.name}
            clientColor={client.color}
            initialToken={client.portalToken ?? null}
            initialPortalEnabled={client.portalEnabled ?? true}
            hasPin={!!client.portalPinHash}
          />
        </div>
      )}
    </div>
  );
}

// ─── AddMonitorToClient ───────────────────────────────────────────────────────
function AddMonitorToClient({
  clientId,
  clientMonitorIds,
  allMonitors,
}: {
  clientId: string;
  clientMonitorIds: string[];
  allMonitors: { id: string; name: string; clientId: string | null }[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const available = allMonitors.filter((m) => !clientMonitorIds.includes(m.id));

  const assign = async (monitorId: string) => {
    setLoading(true);
    await assignMonitorToClient(monitorId, clientId);
    setLoading(false);
    setOpen(false);
  };

  if (available.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        disabled={loading}
        className="flex items-center gap-2 w-full px-5 py-3 text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer group/add"
      >
        <div className="size-5 rounded-full border border-dashed border-border/60 group-hover/add:border-primary/60 flex items-center justify-center transition-colors">
          <Plus className="size-2.5" />
        </div>
        <span>Add monitor to this client</span>
        {loading && <Loader2 className="ml-auto size-3 animate-spin" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-4 top-full mt-1 z-50 w-72 bg-card border border-border/80 shadow-2xl shadow-black/40 overflow-hidden">
            <div className="px-3 py-2 border-b border-border/40 flex items-center gap-2">
              <Shield className="size-3 text-muted-foreground" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Assign monitor
              </span>
            </div>
            <div className="max-h-52 overflow-y-auto">
              {available.map((m) => (
                <button
                  key={m.id}
                  onClick={() => assign(m.id)}
                  className="w-full text-left px-3 py-2.5 text-xs hover:bg-muted/40 transition-colors flex items-center gap-2.5 cursor-pointer group/item border-b border-border/20 last:border-0"
                >
                  <div className="size-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover/item:bg-primary/20 transition-colors">
                    <Plus className="size-2.5 text-primary" />
                  </div>
                  <span className="truncate flex-1 font-medium">{m.name}</span>
                  {m.clientId && m.clientId !== clientId && (
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-sm shrink-0">
                      reassign
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── StatusPagePanel ──────────────────────────────────────────────────────────
function StatusPagePanel({
  clientId,
  clientColor,
  statusPage,
  onCreated,
}: {
  clientId: string;
  clientColor: string;
  statusPage: {
    id: string;
    slug: string;
    customDomain: string | null;
    title: string;
  } | null;
  onCreated: (page: {
    id: string;
    slug: string;
    customDomain: string | null;
    title: string;
  }) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [domain, setDomain] = useState(statusPage?.customDomain || "");
  const [savingDomain, setSavingDomain] = useState(false);

  const publicUrl = statusPage
    ? statusPage.customDomain
      ? `https://${statusPage.customDomain}`
      : `${typeof window !== "undefined" ? window.location.origin : ""}/en/status-page/${statusPage.slug}`
    : null;

  const handleCreate = async () => {
    setCreating(true);
    const res = await createClientStatusPage(clientId);
    setCreating(false);
    if (res.success) {
      onCreated(res.page);
      setDomain(res.page.customDomain || "");
      toast.success("Status page created");
    } else {
      toast.error(res.error || "Failed to create status page");
    }
  };

  const handleSaveDomain = async () => {
    setSavingDomain(true);
    const res = await updateClientStatusPageDomain(clientId, domain || null);
    setSavingDomain(false);
    if (res.success) {
      toast.success("Custom domain saved");
    } else {
      toast.error(res.error || "Failed to save domain");
    }
  };

  const copyUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    toast.success("URL copied");
  };

  return (
    <div className="px-5 py-4">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-3">
        <Radio className="size-3.5 text-muted-foreground" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Status Page
        </span>
        {statusPage && (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-mono text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            LIVE
          </span>
        )}
      </div>

      {statusPage ? (
        <div className="flex flex-col gap-3">
          {/* Public URL row */}
          <div className="flex items-center gap-2 bg-muted/20 border border-border/40 px-3 py-2">
            <Globe className="size-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground truncate flex-1 font-mono">
              {publicUrl}
            </span>
            <button
              onClick={copyUrl}
              className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Copy URL"
            >
              <Copy className="size-3" />
            </button>
            <a
              href={publicUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Open status page"
            >
              <ExternalLink className="size-3" />
            </a>
          </div>

          {/* Custom domain */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">
              Custom Domain
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="status.clientsite.com"
                className="flex-1 bg-background/60 border border-border/60 px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-primary/60 transition-colors"
              />
              <button
                onClick={handleSaveDomain}
                disabled={savingDomain || domain === (statusPage.customDomain || "")}
                className="px-3 py-1.5 text-xs font-mono bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {savingDomain ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Check className="size-3" />
                )}
                Save
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
              CNAME <code className="font-mono bg-muted/30 px-1">status.clientsite.com</code> → your
              SteadyStack domain, then enter it above.
            </p>
          </div>

          {/* Editor link */}
          <Link
            href={`/dashboard/pages/${statusPage.id}`}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group/editor"
          >
            <Settings className="size-3 group-hover/editor:rotate-45 transition-transform" />
            Advanced settings — subscribers, branding, incidents
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Share a branded public uptime page with your client. Auto-populates with their monitors.
          </p>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono border border-border/60 text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer"
            style={{ borderLeftColor: clientColor, borderLeftWidth: 2 }}
          >
            {creating ? <Loader2 className="size-3 animate-spin" /> : <Radio className="size-3" />}
            {creating ? "Creating…" : "Create Status Page"}
          </button>
        </div>
      )}
    </div>
  );
}
