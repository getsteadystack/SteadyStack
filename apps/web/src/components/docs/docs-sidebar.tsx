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
        return <Book className="size-3.5 text-[#23211a]" />;
      case "Synthetic Surveillance":
        return <ShieldCheck className="size-3.5 text-[#23211a]" />;
      case "Alerting & Incidents":
        return <Webhook className="size-3.5 text-[#23211a]" />;
      case "Status Pages & Reporting":
      case "Status Pages":
        return <Layers className="size-3.5 text-[#23211a]" />;
      case "IaC & CI/CD Gates":
      case "IaC & Developer Tools":
        return <Terminal className="size-3.5 text-[#23211a]" />;
      default:
        return <ChevronRight className="size-3.5 text-[#23211a]" />;
    }
  };

  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6 py-6 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto pr-4 scrollbar-thin">
      {/* Quick Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#868279]" />
        <input
          type="text"
          placeholder="Search docs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[#e8e6df] focus:border-[#23211a] text-xs font-mono rounded-xl pl-9 pr-3 py-2 text-[#23211a] placeholder:text-[#868279] outline-none transition-all shadow-xs"
        />
      </div>

      {/* Navigation Sections */}
      <div className="flex flex-col gap-6">
        {filteredSections.map((section: NavSection) => (
          <div key={section.title} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-2 text-[11px] font-mono font-bold text-[#868279] uppercase tracking-wider">
              {getSectionIcon(section.title)}
              <span>{section.title}</span>
            </div>

            <div className="flex flex-col gap-1 border-l border-[#e8e6df] ml-3.5 pl-2">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || (item.slug === "introduction" && pathname === "/docs");

                return (
                  <Link
                    key={item.slug}
                    href={item.href as any}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                      isActive
                        ? "bg-[#23211a] text-white font-semibold shadow-xs"
                        : "text-[#5c5c5c] hover:text-[#23211a] hover:bg-[#f0ede6]"
                    }`}
                  >
                    <span className="truncate">{item.title}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#fbfbf9] text-[#868279] border border-[#e8e6df]"
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
