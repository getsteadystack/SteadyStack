"use client";

import { useState, useEffect, useCallback, useTransition } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Loader2,
  Info,
  Crown,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  getTeamDetails,
  inviteMember,
  updateMemberRole,
  removeMember,
  cancelInvitation,
  type Role,
} from "@/actions/team";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MemberItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  joinedAt: string;
  isCurrentUser: boolean;
}

interface InvitationItem {
  id: string;
  email: string;
  role: Role;
  inviterName: string;
  expiresAt: string;
  createdAt: string;
}

interface TeamData {
  organization: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    plan: string;
  };
  currentUserRole: Role;
  members: MemberItem[];
  invitations: InvitationItem[];
  seats: {
    used: number;
    max: number;
    isMultiSeatAllowed: boolean;
  };
}

const ROLE_DESCRIPTIONS: Record<Role, { label: string; desc: string; badgeClass: string }> = {
  owner: {
    label: "Owner",
    desc: "Full root control over billing, security, workspace destruction, and all members.",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  admin: {
    label: "Admin",
    desc: "Manage team members, roles, alert channels, and all monitoring infrastructure.",
    badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  member: {
    label: "Member",
    desc: "Create, edit monitors, trigger checks, acknowledge & resolve active incidents.",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  viewer: {
    label: "Viewer",
    desc: "Read-only telemetry access to dashboards, charts, uptime history & status pages.",
    badgeClass: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  },
  billing: {
    label: "Billing",
    desc: "Access subscription invoices, payment methods, and tier upgrades.",
    badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  },
};

export function TeamForm() {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = useCallback(async () => {
    try {
      const res = await getTeamDetails();
      if (res) {
        setData(res);
      } else {
        setError("Unable to load workspace details.");
      }
    } catch {
      setError("Failed to fetch team data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.organization.id || !inviteEmail.trim()) return;

    startTransition(async () => {
      const res = await inviteMember({
        organizationId: data.organization.id,
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      if (res.success) {
        setIsInviteOpen(false);
        setInviteEmail("");
        setInviteRole("member");
        await loadData();
      } else {
        alert(res.error || "Failed to invite member");
      }
    });
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    if (!data?.organization.id) return;
    startTransition(async () => {
      const res = await updateMemberRole({
        organizationId: data.organization.id,
        memberId,
        newRole,
      });
      if (res.success) {
        await loadData();
      } else {
        alert(res.error || "Failed to update member role");
      }
    });
  };

  const handleRemoveMember = async (memberId: string, isSelf: boolean) => {
    if (!data?.organization.id) return;
    const confirmMsg = isSelf
      ? "Are you sure you want to leave this workspace?"
      : "Are you sure you want to remove this member from the workspace?";
    if (!window.confirm(confirmMsg)) return;

    startTransition(async () => {
      const res = await removeMember({
        organizationId: data.organization.id,
        memberId,
      });
      if (res.success) {
        if (isSelf) {
          window.location.reload();
        } else {
          await loadData();
        }
      } else {
        alert(res.error || "Failed to remove member");
      }
    });
  };

  const handleCancelInvite = async (invitationId: string) => {
    if (!data?.organization.id) return;
    if (!window.confirm("Cancel this pending invitation?")) return;

    startTransition(async () => {
      const res = await cancelInvitation({
        organizationId: data.organization.id,
        invitationId,
      });
      if (res.success) {
        await loadData();
      } else {
        alert(res.error || "Failed to cancel invitation");
      }
    });
  };

  const copyInviteLink = async (invitationId: string) => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://steadystack.dev";
    const link = `${origin}/invitations/${invitationId}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(invitationId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3 font-mono text-xs text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <span>Loading workspace and member directory...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive font-mono text-xs">
        {error || "Failed to load team settings."}
      </div>
    );
  }

  const isOwnerOrAdmin = data.currentUserRole === "owner" || data.currentUserRole === "admin";
  const seatPercentage = Math.round((data.seats.used / data.seats.max) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Workspace Header & Seats Overview */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-xl font-serif font-medium text-foreground tracking-tight">
              {data.organization.name}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider bg-accent/60 text-foreground border-border">
              {data.organization.plan}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Slug: <code className="text-foreground">{data.organization.slug}</code> • Your Role:{" "}
            <span className="text-foreground font-bold uppercase">{data.currentUserRole}</span>
          </span>
        </div>

        {/* Seat Allocation Meter */}
        <div className="flex flex-col gap-2 min-w-[240px] font-mono">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Users className="size-3.5" />
              Seats Allocated
            </span>
            <span className="font-bold text-foreground">
              {data.seats.used} / {data.seats.max} Seats
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-accent overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500 rounded-full",
                seatPercentage >= 90
                  ? "bg-amber-500"
                  : seatPercentage >= 100
                    ? "bg-red-500"
                    : "bg-foreground",
              )}
              style={{
                width: `${Math.min(100, Math.max(8, seatPercentage))}%`,
              }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">
            {data.seats.isMultiSeatAllowed
              ? "The Construct includes up to 25 collaborative seats."
              : "Single-seat plan. Upgrade to unlock multi-seat collaboration."}
          </span>
        </div>
      </div>

      {/* Upgrade Banner for Single-Seat Accounts */}
      {!data.seats.isMultiSeatAllowed && (
        <div className="p-5 rounded-2xl border border-border bg-accent/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="size-8 rounded-xl bg-card border border-border flex items-center justify-center text-foreground shrink-0 mt-0.5">
              <Sparkles className="size-4" />
            </div>
            <div className="flex flex-col font-mono">
              <span className="text-xs font-bold text-foreground">
                Multi-Seat Team Workspaces & RBAC
              </span>
              <span className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                Invite teammates, assign granular permissions, and manage on-call alerts
                collaboratively.
              </span>
            </div>
          </div>
          <Link
            href="/dashboard/settings?tab=billing"
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-foreground text-background font-mono font-bold text-xs hover:bg-foreground/90 transition-colors"
          >
            <span>Upgrade Workspace</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* Members Directory */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono">
            <Users className="size-4 text-foreground" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Team Members ({data.members.length})
            </h3>
          </div>
          {isOwnerOrAdmin && data.seats.isMultiSeatAllowed && (
            <Button
              onClick={() => setIsInviteOpen(true)}
              disabled={isPending || data.seats.used >= data.seats.max}
              className="font-mono text-xs bg-foreground text-background hover:bg-foreground/90 gap-1.5 h-8 rounded-xl"
            >
              <UserPlus className="size-3.5" />
              <span>Invite Teammate</span>
            </Button>
          )}
        </div>

        <div className="divide-y divide-border/60">
          {data.members.map((member) => (
            <div
              key={member.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-accent/20 transition-colors font-mono"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-full bg-accent border border-border flex items-center justify-center font-bold text-xs text-primary shrink-0">
                  {member.name
                    ? member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "OP"}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground truncate">
                      {member.name || "Operator"}
                    </span>
                    {member.isCurrentUser && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate">{member.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-between sm:justify-end">
                {/* Role Changer or Static Badge */}
                {isOwnerOrAdmin && !member.isCurrentUser && data.seats.isMultiSeatAllowed ? (
                  <select
                    value={member.role}
                    disabled={isPending}
                    onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                    className="h-7 px-2 text-xs font-mono rounded bg-accent border border-border text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                    <option value="billing">Billing</option>
                    {data.currentUserRole === "owner" && <option value="owner">Owner</option>}
                  </select>
                ) : (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider",
                      ROLE_DESCRIPTIONS[member.role]?.badgeClass || "bg-accent text-foreground",
                    )}
                  >
                    {member.role === "owner" && <Crown className="size-2.5 inline mr-1" />}
                    {ROLE_DESCRIPTIONS[member.role]?.label || member.role}
                  </span>
                )}

                {/* Remove / Leave Button */}
                {(isOwnerOrAdmin || member.isCurrentUser) && (
                  <button
                    onClick={() => handleRemoveMember(member.id, member.isCurrentUser)}
                    disabled={isPending || (member.role === "owner" && data.members.length === 1)}
                    title={member.isCurrentUser ? "Leave Workspace" : "Remove Member"}
                    className="p-1.5 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invitations Section */}
      {data.invitations.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-amber-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Pending Invitations ({data.invitations.length})
              </h3>
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {data.invitations.map((inv) => (
              <div
                key={inv.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-accent/20 transition-colors font-mono"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-foreground truncate">{inv.email}</span>
                  <span className="text-[10px] text-muted-foreground">
                    Invited by {inv.inviterName} • Role:{" "}
                    <span className="text-primary font-bold uppercase">{inv.role}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyInviteLink(inv.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-accent/60 hover:bg-accent text-[10px] font-mono text-muted-foreground hover:text-foreground border border-border transition-colors cursor-pointer"
                  >
                    {copiedId === inv.id ? (
                      <>
                        <Check className="size-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  {isOwnerOrAdmin && (
                    <button
                      onClick={() => handleCancelInvite(inv.id)}
                      disabled={isPending}
                      title="Cancel Invitation"
                      className="p-1.5 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role Matrix Info Card */}
      <div className="p-6 rounded-2xl border border-border bg-card/60 font-mono space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground uppercase tracking-wider">
          <Shield className="size-4 text-muted-foreground" />
          <span>Role Permissions Reference</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {Object.entries(ROLE_DESCRIPTIONS).map(([roleKey, meta]) => (
            <div
              key={roleKey}
              className="p-3.5 rounded-xl border border-border bg-accent/20 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-foreground">{meta.label}</span>
                <span
                  className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded-md border",
                    meta.badgeClass,
                  )}
                >
                  {roleKey.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{meta.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border rounded-2xl shadow-xl">
          <form onSubmit={handleInvite}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-serif font-medium text-lg">
                <UserPlus className="size-4 text-foreground" />
                Invite Team Member
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-mono">
                Send an email invite to join {data.organization.name}. An accept link will also be
                generated.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="invite-email" className="text-xs font-semibold">
                  Teammate Email Address
                </Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="teammate@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="font-mono text-xs h-9 rounded-xl"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invite-role" className="text-xs font-semibold">
                  Assigned Workspace Role
                </Label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="w-full h-9 px-3 text-xs font-mono rounded-xl bg-background border border-border text-foreground outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  <option value="admin">Admin — Full monitoring & member management</option>
                  <option value="member">
                    Member — Standard monitor creation & incident response
                  </option>
                  <option value="viewer">Viewer — Read-only telemetry & status access</option>
                  <option value="billing">Billing — Billing & subscription management only</option>
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInviteOpen(false)}
                className="text-xs font-mono rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !inviteEmail.trim()}
                className="text-xs font-mono bg-foreground text-background hover:bg-foreground/90 gap-1.5 rounded-xl cursor-pointer"
              >
                {isPending && <Loader2 className="size-3.5 animate-spin" />}
                <span>Send Invitation</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
