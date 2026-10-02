"use client";

import React, { useEffect, useState } from "react";
import { List, ExternalLink, MessageSquareText, Github } from "lucide-react";
import type { TocItem } from "@/lib/markdown";

interface DocsTocProps {
  headings: TocItem[];
  slug: string;
}

export function DocsToc({ headings, slug }: DocsTocProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0% 0% -60% 0%" },
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden xl:flex flex-col gap-6 w-60 shrink-0 py-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto pl-4 border-l border-[#e8e6df] text-xs">
      <div className="flex items-center gap-2 text-[#868279] font-mono font-bold uppercase tracking-wider text-[11px]">
        <List className="size-3.5 text-[#23211a]" />
        <span>On this page</span>
      </div>

      <nav className="flex flex-col gap-1.5 font-sans">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <a
              key={h.id}
              href={`#${h.id}`}
              className={`transition-all ${h.level === 3 ? "pl-3 text-[11px]" : "font-medium"} ${
                isActive
                  ? "text-[#23211a] font-semibold border-l-2 border-[#23211a] -ml-4 pl-3.5"
                  : "text-[#5c5c5c] hover:text-[#23211a] hover:pl-1"
              }`}
            >
              {h.text}
            </a>
          );
        })}
      </nav>

      {/* Quick Help / Action Links */}
      <div className="pt-6 border-t border-[#e8e6df] flex flex-col gap-3 text-[#5c5c5c] font-mono text-xs">
        <a
          href="https://github.com/getsteadystack/SteadyStack"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-[#23211a] transition-colors"
        >
          <Github className="size-3.5 text-[#23211a]" />
          <span>Edit on GitHub</span>
          <ExternalLink className="size-3 opacity-60 ml-auto" />
        </a>
        <a
          href="https://x.com/snackforcode"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-[#23211a] transition-colors"
        >
          <MessageSquareText className="size-3.5 text-[#23211a]" />
          <span>Ask the Community</span>
          <ExternalLink className="size-3 opacity-60 ml-auto" />
        </a>
      </div>
    </aside>
  );
}
