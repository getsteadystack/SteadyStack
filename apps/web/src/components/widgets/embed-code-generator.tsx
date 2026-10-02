"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, Code2 } from "lucide-react";

interface EmbedCodeGeneratorProps {
  slug: string;
}

export function EmbedCodeGenerator({ slug }: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState(false);

  // Use environment variable or fallback
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "https://your-domain.com");

  const embedCode = `<!-- SteadyStack Status Widget -->
<div id="steadystack-status"></div>
<script src="${baseUrl}/api/widget/embed.js?slug=${slug}"></script>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-muted border border-border text-foreground">
            <Code2 className="size-4.5 text-foreground" />
          </div>
          <div>
            <h3 className="text-base font-serif font-medium text-foreground">Embed Code</h3>
            <p className="text-xs text-muted-foreground">
              Copy and paste this code into your website
            </p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl border font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-2xs cursor-pointer",
            copied
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              : "bg-foreground text-background border-foreground hover:bg-foreground/90 shadow-xs",
          )}
        >
          {copied ? (
            <>
              <Check className="size-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Copy Code
            </>
          )}
        </button>
      </div>

      {/* Code Block */}
      <div className="relative">
        <pre className="bg-muted/40 border border-border rounded-xl p-4 overflow-x-auto">
          <code className="text-xs font-mono text-foreground whitespace-pre-wrap break-all">
            {embedCode}
          </code>
        </pre>
      </div>

      {/* Instructions */}
      <div className="mt-4 space-y-2 text-xs text-muted-foreground font-mono">
        <p className="font-semibold text-foreground uppercase tracking-wider">Installation:</p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>Copy the code above</li>
          <li>Paste it into your website's HTML where you want the status badge to appear</li>
          <li>The widget will automatically update every 60 seconds</li>
        </ol>
      </div>

      {/* Advanced Configuration */}
      <details className="mt-4 group">
        <summary className="text-xs font-mono text-muted-foreground cursor-pointer hover:text-foreground transition-colors uppercase tracking-wider">
          Advanced Configuration →
        </summary>
        <div className="mt-3 p-4 bg-muted/30 rounded-xl border border-border space-y-3">
          <p className="text-xs text-muted-foreground">
            You can customize the target element by adding this before the script:
          </p>
          <pre className="bg-muted/40 border border-border rounded-xl p-3 text-xs font-mono text-foreground overflow-x-auto">
            {`<script>
  window.SteadyStack = {
    config: {
      target: 'my-custom-element-id'
    }
  };
</script>`}
          </pre>
        </div>
      </details>
    </div>
  );
}
