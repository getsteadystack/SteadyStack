"use client";

import { env } from "@steadystack/env/web";
import { useState } from "react";
import Link from "next/link";
import { Plus, Globe, ExternalLink, Settings } from "lucide-react";
import { CreateStatusPageModal } from "./create-status-page-modal";

export function StatusPageList({ initialPages }: { initialPages: any[] }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const getPublicLink = (page: any) => {
    if (page.customDomain) return `https://${page.customDomain}`;

    // Remove protocol for cleaner URLs if needed, but here we just need a valid href
    return `${env.NEXT_PUBLIC_APP_URL}/status-page/${page.slug}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/80">
        <div>
          <h1 className="text-3xl font-serif font-medium tracking-tight text-foreground">
            Status Pages
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your branded public status portals, subscribers, and uptime widgets.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-foreground hover:bg-foreground/90 text-background font-medium text-xs px-4 py-2.5 flex items-center gap-2 transition-colors rounded-xl shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="size-4 text-[#ffd439]" />
          Create Status Page
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {initialPages.map((page) => (
          <div
            key={page.id}
            className="group relative bg-card border border-border hover:border-foreground/20 rounded-2xl p-5 flex flex-col gap-4 shadow-xs transition-all"
          >
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-muted rounded-xl border border-border text-foreground">
                  <Globe className="size-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-medium text-foreground">{page.title}</h3>
                  <p className="text-xs text-muted-foreground font-mono">/{page.slug}</p>
                </div>
              </div>
              {page.requiresAuth && (
                <div className="px-2 py-0.5 border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-mono uppercase tracking-wider rounded-full font-medium">
                  Private
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-foreground font-bold">{page._count?.monitors || 0}</span>{" "}
                monitors linked
              </div>
            </div>

            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-border relative z-10">
              <Link
                href={`/dashboard/pages/${page.id}`}
                className="flex-1 flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-medium py-2 rounded-xl border border-border transition-colors"
              >
                <Settings className="size-3.5" />
                Configure
              </Link>
              <a
                href={getPublicLink(page)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground text-xs font-medium py-2 rounded-xl transition-colors"
              >
                <ExternalLink className="size-3.5" />
                Live Page
              </a>
            </div>
          </div>
        ))}

        {initialPages.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center border border-dashed border-border bg-card rounded-2xl p-8">
            <div className="p-4 bg-muted rounded-2xl mb-4 border border-border text-foreground">
              <Globe className="size-8" />
            </div>
            <h3 className="text-xl font-serif font-medium text-foreground">No Status Pages Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
              Create a branded public status page to communicate system reliability directly to your
              users and clients.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-foreground hover:bg-foreground/90 text-background font-medium text-xs px-5 py-2.5 transition-colors rounded-xl shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Plus className="size-4 text-[#ffd439]" />
              Create Your First Page
            </button>
          </div>
        )}
      </div>

      <CreateStatusPageModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
