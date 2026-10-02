"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Check,
  ChevronsUpDown,
  Plus,
  Shield,
  Sparkles,
  Users,
  Loader2,
  Lock,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  listUserWorkspaces,
  createTeamWorkspace,
  switchActiveWorkspace,
  type Role,
} from "@/actions/team";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: string;
  role: Role;
  memberCount: number;
  pendingInviteCount: number;
  isActive: boolean;
}

export function WorkspaceSwitcher() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string>("");
  const [newTeamName, setNewTeamName] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadWorkspaces = async () => {
    try {
      const list = await listUserWorkspaces();
      setWorkspaces(list);
    } catch (err) {
      console.error("Failed to load workspaces:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const activeWorkspace = workspaces.find((w) => w.isActive) || workspaces[0];

  const handleSwitchWorkspace = async (workspace: WorkspaceItem) => {
    if (workspace.isActive) return;
    try {
      // 1. Set cookie immediately on client
      document.cookie = `pg_active_org_id=${encodeURIComponent(workspace.id)}; path=/; max-age=2592000; SameSite=Lax`;

      // 2. Call server action to update database session and cookies
      await switchActiveWorkspace(workspace.id);

      // 3. Also call BetterAuth client plugin
      try {
        await authClient.organization.setActive({
          organizationId: workspace.id,
        });
      } catch {}

      // 4. Update local state
      setWorkspaces((prev) =>
        prev.map((w) => ({
          ...w,
          isActive: w.id === workspace.id,
        })),
      );

      // 5. Hard reload to guarantee fresh server state across all components
      window.location.reload();
    } catch (err) {
      console.error("Failed to switch workspace:", err);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    startTransition(async () => {
      const res = await createTeamWorkspace({ name: newTeamName });
      if (res.success && res.organization) {
        setIsCreateOpen(false);
        setNewTeamName("");

        // Set cookie immediately on client
        document.cookie = `pg_active_org_id=${encodeURIComponent(res.organization.id)}; path=/; max-age=2592000; SameSite=Lax`;

        // Switch to the newly created workspace
        await switchActiveWorkspace(res.organization.id);
        try {
          await authClient.organization.setActive({
            organizationId: res.organization.id,
          });
        } catch {}

        window.location.reload();
      } else if (res.requiresUpgrade) {
        setIsCreateOpen(false);
        setUpgradeError(res.error || "Multi-Seat workspaces require The Construct plan");
        setIsUpgradeOpen(true);
      } else {
        alert(res.error || "Failed to create workspace");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border/60 bg-accent/20 animate-pulse w-36 sm:w-44" />
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          id="workspace-switcher-trigger"
          className="flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-all duration-200 text-xs outline-none group cursor-pointer shrink-0 max-w-[150px] sm:max-w-[200px] shadow-xs"
          aria-label="Select workspace"
        >
          <div className="size-5 rounded-lg bg-[#ffd439] text-[#23211a] flex items-center justify-center shrink-0 shadow-xs font-bold">
            <Building2 className="size-3" />
          </div>
          <span className="font-semibold truncate text-left flex-1">
            {activeWorkspace?.name || "My Workspace"}
          </span>
          <span className="hidden sm:inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
            {activeWorkspace?.role || "OWNER"}
          </span>
          <ChevronsUpDown className="size-3 text-muted-foreground group-hover:text-foreground shrink-0" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-64 bg-card border border-border text-foreground rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest px-2.5 py-1.5">
              Workspaces & Teams
            </DropdownMenuLabel>
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => handleSwitchWorkspace(ws)}
                className={cn(
                  "flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors group",
                  ws.isActive
                    ? "bg-muted border border-border text-foreground font-semibold shadow-xs"
                    : "hover:bg-muted/50 text-foreground border border-transparent",
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={cn(
                      "size-6 rounded-lg flex items-center justify-center shrink-0 shadow-xs",
                      ws.isActive
                        ? "bg-[#ffd439] text-[#23211a] font-bold"
                        : "bg-card border border-border text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    <Building2 className="size-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold truncate text-foreground">{ws.name}</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="uppercase font-mono">{ws.role}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Users className="size-2.5" />
                        {ws.memberCount}
                      </span>
                    </div>
                  </div>
                </div>
                {ws.isActive && (
                  <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-border/60 my-1" />

          <DropdownMenuItem
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors"
          >
            <Plus className="size-3.5 text-[#ffd439]" />
            <span>Create New Team</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Team Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <form onSubmit={handleCreateWorkspace}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-mono text-base">
                <Users className="size-4 text-primary" />
                Create Team Workspace
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Set up a shared workspace for your engineering team to collaborate on monitors,
                incident response, and alerts.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="team-name" className="text-xs font-bold">
                  Workspace / Team Name
                </Label>
                <Input
                  id="team-name"
                  placeholder="e.g. Acme Corp SRE"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="font-mono text-xs h-9"
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs font-mono"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || !newTeamName.trim()}
                className="text-xs font-mono bg-primary text-primary-foreground gap-1.5"
              >
                {isPending && <Loader2 className="size-3.5 animate-spin" />}
                <span>Create Workspace</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upgrade Gate Dialog */}
      <Dialog open={isUpgradeOpen} onOpenChange={setIsUpgradeOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-2 border-primary/40">
          <DialogHeader>
            <div className="size-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-2">
              <Lock className="size-5" />
            </div>
            <DialogTitle className="font-mono text-lg text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Unlock Multi-Seat Team Workspaces
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              {upgradeError ||
                "Multi-seat team collaboration, role-based access control (RBAC), and team-scoped alert routing are exclusive to The Construct plan."}
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2.5 font-mono text-xs my-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Shield className="size-4 text-primary" />
              <span>Included with Agency Pro ($99/mo):</span>
            </div>
            <ul className="space-y-1.5 text-muted-foreground text-[11px] pl-6 list-disc">
              <li>
                Up to 25 team member seats with role permissions (Owner, Admin, Member, Viewer,
                Billing)
              </li>
              <li>1,500 active monitors with 10-second fast edge checks</li>
              <li>PagerDuty, Opsgenie, SMS alert escalation policies</li>
              <li>Team-wide audit logging and SSO / SAML integration</li>
            </ul>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUpgradeOpen(false)}
              className="text-xs font-mono"
            >
              Maybe Later
            </Button>
            <Button
              onClick={() => {
                setIsUpgradeOpen(false);
                router.push("/dashboard/settings?tab=billing");
              }}
              className="text-xs font-mono bg-primary text-primary-foreground font-bold"
            >
              Upgrade to The Construct
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
