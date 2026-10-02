import React from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ArrowRight, Calendar, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-[#fbfbf9] text-[#23211a] selection:bg-[#ffd439]/30 selection:text-[#23211a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 relative">
        {/* Left Sidebar */}
        <DocsSidebar />

        {/* Center Canvas */}
        <main className="flex-1 min-w-0 py-8 lg:py-12 max-w-3xl">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#868279] mb-6">
            <Link href="/docs/introduction" className="hover:text-[#23211a] transition-colors">
              Docs
            </Link>
            <ChevronRight className="size-3 text-[#868279]" />
            <span className="text-[#5c5c5c]">{doc.meta.section}</span>
            <ChevronRight className="size-3 text-[#868279]" />
            <span className="text-[#23211a] font-semibold truncate">{doc.meta.title}</span>
          </div>

          {/* Article Header */}
          <header className="mb-10 pb-6 border-b border-[#e8e6df]">
            <div className="flex items-center gap-2 mb-3">
              {doc.meta.badge && (
                <span className="px-2.5 py-0.5 bg-[#ffd439]/20 text-[#23211a] border border-[#ffd439]/60 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs">
                  {doc.meta.badge}
                </span>
              )}
              {doc.meta.lastUpdated && (
                <span className="text-[11px] text-[#868279] font-mono flex items-center gap-1">
                  <Calendar className="size-3 text-[#868279]" />
                  Updated {doc.meta.lastUpdated}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-[#23211a] mb-3 leading-[1.15]">
              {doc.meta.title}
            </h1>

            <p className="text-base text-[#5c5c5c] leading-relaxed font-sans">
              {doc.meta.description}
            </p>
          </header>

          {/* Rendered Markdown Body */}
          <article className="text-[#23211a] text-sm leading-relaxed space-y-6">{children}</article>

          {/* Previous / Next Pagination Links */}
          <div className="mt-16 pt-8 border-t border-[#e8e6df] flex flex-col sm:flex-row items-center justify-between gap-4">
            {prevDoc ? (
              <Link
                href={prevDoc.href as any}
                className="w-full sm:w-auto p-5 rounded-2xl border border-[#e8e6df] bg-white hover:border-[#23211a]/30 hover:shadow-lg transition-all flex flex-col gap-1 text-left group shadow-xs cursor-pointer"
              >
                <span className="text-[11px] font-mono text-[#868279] flex items-center gap-1 uppercase tracking-wider">
                  <ArrowLeft className="size-3 group-hover:-translate-x-0.5 transition-transform text-[#868279]" />
                  Previous
                </span>
                <span className="text-sm font-serif font-medium text-[#23211a] group-hover:text-[#23211a] transition-colors">
                  {prevDoc.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextDoc && (
              <Link
                href={nextDoc.href as any}
                className="w-full sm:w-auto p-5 rounded-2xl border border-[#e8e6df] bg-white hover:border-[#23211a]/30 hover:shadow-lg transition-all flex flex-col gap-1 text-right group sm:ml-auto shadow-xs cursor-pointer"
              >
                <span className="text-[11px] font-mono text-[#868279] flex items-center justify-end gap-1 uppercase tracking-wider">
                  Next
                  <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform text-[#868279]" />
                </span>
                <span className="text-sm font-serif font-medium text-[#23211a] group-hover:text-[#23211a] transition-colors">
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
