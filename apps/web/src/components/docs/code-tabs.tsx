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
    <div className="my-6 rounded-2xl border border-[#2e2c26] bg-[#1a1915] text-white overflow-hidden shadow-xl">
      {/* Header bar with tabs and copy button */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#23211a] border-b border-[#2e2c26]">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {filename && (
            <span className="text-[11px] font-mono text-white/60 mr-3 px-1 border-r border-white/15">
              {filename}
            </span>
          )}
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeTab === idx
                  ? "bg-white/15 text-[#ffd439] font-bold border border-[#ffd439]/40 shadow-xs"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all ml-2 cursor-pointer"
        >
          {copied ? <Check className="size-3.5 text-[#ffd439]" /> : <Copy className="size-3.5" />}
        </button>
      </div>

      {/* Code content */}
      <pre className="p-4 sm:p-5 text-xs font-mono text-zinc-100 overflow-x-auto leading-relaxed scrollbar-thin selection:bg-[#ffd439]/30 selection:text-[#ffd439]">
        <code>{currentTab?.code}</code>
      </pre>
    </div>
  );
}

export default CodeTabs;
