"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

export interface CodeTab {
  label: string;
  language: string;
  code: string;
}

interface CodeTabsProps {
  tabs: CodeTab[];
  filename?: string;
}

export function CodeTabs({ tabs, filename }: CodeTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentTab = tabs[activeTab] || tabs[0];

  const handleCopy = () => {
    if (!currentTab) return;
    navigator.clipboard.writeText(currentTab.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl border border-border bg-card overflow-hidden shadow-xs">
      {/* Header bar with tabs and copy button */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {filename && (
            <span className="text-[11px] font-mono text-muted-foreground mr-3 px-1 border-r border-border/80">
              {filename}
            </span>
          )}
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(idx)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                activeTab === idx
                  ? "bg-primary/10 text-primary font-bold border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="p-1.5 rounded-md hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-all ml-2"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
        </button>
      </div>

      {/* Code content */}
      <pre className="p-4 text-xs font-mono text-foreground/90 overflow-x-auto leading-relaxed scrollbar-thin">
        <code>{currentTab?.code}</code>
      </pre>
    </div>
  );
}
