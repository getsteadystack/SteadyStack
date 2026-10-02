"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0% -60% 0%",
        threshold: 0.1,
      },
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => {
      observer.disconnect();
    };
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <nav className="p-5 rounded-2xl border border-[#e8e6df] bg-white text-xs shadow-xs">
      <div className="flex items-center gap-2 mb-3.5 font-mono font-semibold text-[#23211a] uppercase tracking-wider text-[11px]">
        <List className="size-3.5 text-[#23211a]" />
        <span>Table of Contents</span>
      </div>
      <ul className="space-y-1 list-none m-0 p-0 font-sans">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li
              key={item.id}
              className={item.level === 3 ? "pl-3" : item.level === 4 ? "pl-5" : ""}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const target = document.getElementById(item.id);
                  if (target) {
                    target.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                    history.pushState(null, "", `#${item.id}`);
                    setActiveId(item.id);
                  }
                }}
                className={`block py-1 transition-all leading-snug line-clamp-2 ${
                  isActive
                    ? "text-[#23211a] font-semibold border-l-2 border-[#23211a] -ml-5 pl-[18px] bg-[#f0ede6]/50"
                    : "text-[#5c5c5c] hover:text-[#23211a] hover:pl-1"
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default TableOfContents;
