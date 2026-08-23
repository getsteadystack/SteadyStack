"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ChevronRight, Book, Layers, ShieldCheck, Terminal, Webhook } from "lucide-react";
import { DOCS_NAVIGATION, type NavSection } from "@/lib/docs-config";

export function DocsSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = DOCS_NAVIGATION.map((section) => {
    if (!searchQuery.trim()) return section;
    const query = searchQuery.toLowerCase();
    const matchingItems = section.items.filter(
      (item) => item.title.toLowerCase().includes(query) || item.slug.toLowerCase().includes(query),
    );
    return { ...section, items: matchingItems };
  }).filter((section) => section.items.length > 0);

  const getSectionIcon = (title: string) => {
    switch (title) {
      case "Getting Started":
        return <Book className="size-3.5 text-primary" />;
      case "Synthetic Surveillance":
        return <ShieldCheck className="size-3.5 text-primary" />;
      case "Alerting & Incidents":
        return <Webhook className="size-3.5 text-primary" />;
      case "Status Pages":
        return <Layers className="size-3.5 text-primary" />;
      case "IaC & Developer Tools":
        return <Terminal className="size-3.5 text-primary" />;
      default:
        return <ChevronRight className="size-3.5 text-primary" />;
    }
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6 py-6 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto pr-4 scrollbar-thin">
      {/* Quick Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search docs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-muted/40 border border-border focus:border-primary/50 text-xs rounded-lg pl-9 pr-3 py-2 text-foreground placeholder:text-muted-foreground/60 outline-none transition-all"
        />
      </div>

      {/* Navigation Sections */}
      <div className="flex flex-col gap-6">
        {filteredSections.map((section: NavSection) => (
          <div key={section.title} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {getSectionIcon(section.title)}
              <span>{section.title}</span>
            </div>

            <div className="flex flex-col gap-0.5 border-l border-border/60 ml-3.5 pl-2">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || (item.slug === "introduction" && pathname === "/docs");

                return (
                  <Link
                    key={item.slug}
                    href={item.href as any}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold shadow-xs border-l-2 border-primary -ml-[9px] pl-[15px]"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
