"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const displayLang = language ? language.toUpperCase() : "CODE";

  return (
    <div className="my-6 rounded-2xl border border-[#2e2c26] bg-[#1a1915] text-white shadow-xl overflow-hidden group">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#23211a] border-b border-[#2e2c26] text-xs font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 text-[#ffd439]" />
          <span className="font-semibold text-[11px] text-white/90">{filename || displayLang}</span>
          {filename && language && (
            <span className="text-[10px] text-white/50 uppercase px-1.5 py-0.5 rounded bg-white/10 border border-white/10">
              {language}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={copyToClipboard}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/20 cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-[#ffd439]" />
              <span className="text-[#ffd439] font-mono text-[10px]">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3.5 text-white/70" />
              <span className="font-mono text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 sm:p-5 overflow-x-auto font-mono text-[13px] leading-relaxed text-zinc-100 selection:bg-[#ffd439]/30 selection:text-[#ffd439]">
        <pre className="m-0 p-0 font-mono">{code}</pre>
      </div>
    </div>
  );
}

export default CodeBlock;
