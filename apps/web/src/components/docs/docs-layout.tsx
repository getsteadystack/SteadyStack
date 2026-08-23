import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { DocsSidebar } from "./docs-sidebar";
import { DocsToc } from "./docs-toc";
import type { NavLink } from "@/lib/docs-config";
import type { DocItem } from "@/lib/docs";

interface DocsLayoutProps {
  doc: DocItem;
  prevDoc?: NavLink | null;
  nextDoc?: NavLink | null;
  children: React.ReactNode;
}

export function DocsLayout({ doc, prevDoc, nextDoc, children }: DocsLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 relative">
        {/* Left Sidebar */}
        <DocsSidebar />

        {/* Center Canvas */}
        <main className="flex-1 min-w-0 py-8 lg:py-12 max-w-3xl">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
            <Link href="/docs" className="hover:text-foreground transition-colors">
              Docs
            </Link>
            <ChevronRight className="size-3 opacity-60" />
            <span className="text-muted-foreground">{doc.meta.section}</span>
            <ChevronRight className="size-3 opacity-60" />
            <span className="text-foreground font-medium truncate">{doc.meta.title}</span>
          </div>

          {/* Article Header */}
          <header className="mb-10 pb-6 border-b border-border/60">
            <div className="flex items-center gap-2 mb-3">
              {doc.meta.badge && (
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                  {doc.meta.badge}
                </span>
              )}
              {doc.meta.lastUpdated && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3" />
                  Updated {doc.meta.lastUpdated}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
              {doc.meta.title}
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed">
              {doc.meta.description}
            </p>
          </header>

          {/* Rendered Markdown Body */}
          <article className="prose prose-invert max-w-none text-foreground text-sm leading-relaxed space-y-6">
            {children}
          </article>

          {/* Previous / Next Pagination Links */}
          <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            {prevDoc ? (
              <Link
                href={prevDoc.href as any}
                className="w-full sm:w-auto p-4 rounded-xl border border-border/80 bg-card/40 hover:bg-muted/40 transition-all flex flex-col gap-1 text-left group"
              >
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ArrowLeft className="size-3 group-hover:-translate-x-0.5 transition-transform" />
                  Previous
                </span>
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {prevDoc.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextDoc && (
              <Link
                href={nextDoc.href as any}
                className="w-full sm:w-auto p-4 rounded-xl border border-border/80 bg-card/40 hover:bg-muted/40 transition-all flex flex-col gap-1 text-right group sm:ml-auto"
              >
                <span className="text-[11px] text-muted-foreground flex items-center justify-end gap-1">
                  Next
                  <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {nextDoc.title}
                </span>
              </Link>
            )}
          </div>
        </main>

        {/* Right Table of Contents */}
        <DocsToc headings={doc.headings} slug={doc.slug} />
      </div>
    </div>
  );
}
