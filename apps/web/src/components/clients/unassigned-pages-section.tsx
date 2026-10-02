"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe,
  ExternalLink,
  Edit3,
  Trash2,
  UserPlus,
  Loader2,
  AlertCircle,
  Radio,
} from "lucide-react";
import { assignStatusPageToClient, deleteStatusPage } from "@/actions/clients";

interface OrphanedPage {
  id: string;
  title: string;
  slug: string;
  customDomain: string | null;
  createdAt: Date | string;
  _count: {
    monitors: number;
  };
}

interface ClientOption {
  id: string;
  name: string;
  color: string;
  statusPage?: { id: string } | null;
}

interface UnassignedPagesSectionProps {
  initialPages: OrphanedPage[];
  clients: ClientOption[];
}

export function UnassignedPagesSection({ initialPages, clients }: UnassignedPagesSectionProps) {
  const router = useRouter();
  const [pages, setPages] = useState<OrphanedPage[]>(initialPages);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedClients, setSelectedClients] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Filter clients that do not already have a linked status page
  const availableClients = clients.filter((c) => !c.statusPage);

  if (pages.length === 0) return null;

  const handleAssign = async (pageId: string) => {
    const clientId = selectedClients[pageId];
    if (!clientId) return;

    setAssigningId(pageId);
    setError(null);

    try {
      const res = await assignStatusPageToClient(pageId, clientId);
      if (!res.success) {
        setError(res.error || "Failed to assign status page");
        return;
      }
      setPages((prev) => prev.filter((p) => p.id !== pageId));
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setAssigningId(null);
    }
  };

  const handleDelete = async (pageId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete status page "${title}"?`)) {
      return;
    }

    setDeletingId(pageId);
    setError(null);

    try {
      const res = await deleteStatusPage(pageId);
      if (!res.success) {
        setError(res.error || "Failed to delete status page");
        return;
      }
      setPages((prev) => prev.filter((p) => p.id !== pageId));
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 pt-6 border-t border-border/60">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Radio className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight">Unassigned Status Pages</h2>
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {pages.length} UNASSIGNED
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              These status pages are not linked to a client account. Assign them to a client card or
              manage them here.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/30 text-destructive text-xs">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Pages list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pages.map((page) => {
          const publicUrl = page.customDomain
            ? `https://${page.customDomain}`
            : `/status-page/${page.slug}`;

          const isAssigning = assigningId === page.id;
          const isDeleting = deletingId === page.id;

          return (
            <div
              key={page.id}
              className="group relative flex flex-col justify-between p-4 border border-border bg-card/40 hover:bg-card/70 hover:border-border/80 transition-all gap-4"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="p-2 bg-muted/40 border border-border/40 text-muted-foreground group-hover:text-foreground shrink-0 mt-0.5">
                    <Globe className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium tracking-tight truncate">{page.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono text-muted-foreground truncate">
                        /{page.slug}
                      </span>
                      {page.customDomain && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-primary/10 text-primary border border-primary/20">
                          {page.customDomain}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-muted-foreground/80">
                        • {page._count.monitors}{" "}
                        {page._count.monitors === 1 ? "monitor" : "monitors"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={publicUrl as any}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border/60 transition-colors"
                    title="View public page"
                  >
                    <ExternalLink className="size-3.5" />
                  </Link>
                  <Link
                    href={`/dashboard/pages/${page.id}` as any}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border/60 transition-colors"
                    title="Edit in full editor"
                  >
                    <Edit3 className="size-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(page.id, page.title)}
                    disabled={isDeleting}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/30 transition-colors cursor-pointer"
                    title="Delete status page"
                  >
                    {isDeleting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Bottom row: Assign to client */}
              <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                <UserPlus className="size-3.5 text-muted-foreground shrink-0" />
                <select
                  aria-label="Select client"
                  value={selectedClients[page.id] || ""}
                  onChange={(e) =>
                    setSelectedClients((prev) => ({
                      ...prev,
                      [page.id]: e.target.value,
                    }))
                  }
                  className="flex-1 bg-background/80 border border-border/80 px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Assign to client...</option>
                  {availableClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleAssign(page.id)}
                  disabled={!selectedClients[page.id] || isAssigning}
                  className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-mono uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {isAssigning && <Loader2 className="size-3 animate-spin" />}
                  Assign
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
