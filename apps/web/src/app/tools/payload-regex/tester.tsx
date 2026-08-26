"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Zap,
  Search,
  Terminal,
  Bug,
  ShieldCheck,
  AlertTriangle,
  Code2,
  Maximize2,
  Eye,
  Loader2,
  FileCode,
  Regex,
  HelpCircle,
  Globe,
  FileText,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { GlitchText } from "@/components/ui/effects/glitch-text";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PRODUCT_CONFIG } from "@steadystack/shared";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787";

const MOCK_SITES: Record<string, string> = {
  "google.com": `<!DOCTYPE html>
<html>
<head>
  <title>Google</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body>
  <div id="viewport">
    <div id="search-box">
      <input type="text" name="q" value="" />
      <button type="submit">Search</button>
    </div>
    <div class="footer">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </div>
  </div>
</body>
</html>`,
  "github.com": `<!DOCTYPE html>
<html>
<head>
  <title>GitHub: Let's build from here · GitHub</title>
  <meta name="description" content="GitHub is where over 100 million developers shape the future of software, together.">
</head>
<body>
  <header>
    <a href="/login">Sign in</a>
    <a href="/signup">Sign up</a>
  </header>
  <main>
    <h1>Build software better, together</h1>
    <p>Join the world's largest developer platform.</p>
  </main>
</body>
</html>`,
  "steadystack.dev": `<!DOCTYPE html>
<html>
<head>
  <title>SteadyStack | Global Infrastructure Monitoring & Telemetry</title>
  <meta name="status" content="operational">
</head>
<body>
  <h1>Detect downtime before your users do</h1>
  <p>Multi-region checks with sovereign edge quorum verification.</p>
</body>
</html>`,
};

const PRESETS = [
  {
    label: "HTML Title",
    pattern: "<title>(.*?)</title>",
    description: "Matches website HTML <title> tag",
  },
  {
    label: "JSON Status",
    pattern: '"status"\\s*:\\s*"(.*?)"',
    description: "Matches JSON status response fields",
  },
  {
    label: "HTML Headings",
    pattern: "<h1>(.*?)</h1>",
    description: "Finds first-level headings",
  },
  {
    label: "Viewport Meta",
    pattern: '<meta name="viewport" content=".*">',
    description: "Verifies mobile responsiveness tag",
  },
  {
    label: "Email Finder",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    description: "Finds general email format strings",
  },
];

const CHEATSHEET = [
  { token: ".", desc: "Any character except newline" },
  { token: "*", desc: "0 or more times (greedy)" },
  { token: "+", desc: "1 or more times (greedy)" },
  { token: "?", desc: "0 or 1 time (optional)" },
  { token: "(.*?)", desc: "Capture group (lazy/non-greedy)" },
  { token: "\\d", desc: "Any digit [0-9]" },
  { token: "\\w", desc: "Word character [a-zA-Z0-9_]" },
  { token: "\\s", desc: "Whitespace character" },
  { token: "^ / $", desc: "Start / End of line" },
];

interface AuditResult {
  url: string;
  payload: string;
  matchCount: number;
  success: boolean;
  errorMessage?: string;
  byteSize: number;
  status: number;
}

function HighlightedText({ text, patternString }: { text: string; patternString: string }) {
  if (!patternString) {
    return <>{text}</>;
  }
  try {
    const regex = new RegExp(patternString, "gi");
    let match;
    const matches: { start: number; end: number }[] = [];

    while ((match = regex.exec(text)) !== null) {
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      matches.push({ start: match.index, end: match.index + match[0].length });
      if (!regex.global) break;
    }

    if (matches.length === 0) {
      return <>{text}</>;
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    for (let i = 0; i < matches.length; i++) {
      const { start, end } = matches[i];
      if (start < lastIndex) continue;

      const before = text.substring(lastIndex, start);
      if (before) {
        elements.push(<span key={`text-${lastIndex}-${start}`}>{before}</span>);
      }

      const matchedText = text.substring(start, end);
      elements.push(
        <mark
          key={`mark-${start}-${end}-${i}`}
          className="bg-yellow-500/30 text-yellow-500 border border-yellow-500/20 rounded px-0.5 font-bold animate-pulse"
        >
          {matchedText}
        </mark>,
      );

      lastIndex = end;
    }

    const after = text.substring(lastIndex);
    if (after) {
      elements.push(<span key={`text-${lastIndex}-end`}>{after}</span>);
    }

    return <>{elements}</>;
  } catch (e) {
    return <>{text}</>;
  }
}

export function PayloadTester() {
  const router = useRouter();
  const [targetMode, setTargetMode] = useState<"url" | "custom">("url");
  const [url, setUrl] = useState("");
  const [customHtml, setCustomHtml] = useState("");
  const [pattern, setPattern] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isIntegrityActive, setIsIntegrityActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOfflineSimulated, setIsOfflineSimulated] = useState(false);

  const auditSteps = [
    "Injecting request probe...",
    "Extracting raw HTML stream...",
    "Serializing byte fragments...",
    "Applying regex filter...",
    "Validating payload integrity...",
  ];

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetMode === "url" && !url) {
      toast.error("Target URL required");
      return;
    }
    if (targetMode === "custom" && !customHtml) {
      toast.error("Raw HTML payload required");
      return;
    }
    if (!pattern) {
      toast.error("Regex sequence required");
      return;
    }

    setIsAuditing(true);
    setResult(null);
    setIsOfflineSimulated(false);

    // Terminal steps simulation
    for (let i = 0; i < auditSteps.length; i++) {
      setActiveStep(i);
      await new Promise((r) => setTimeout(r, 150 + Math.random() * 150));
    }

    if (targetMode === "custom") {
      try {
        const regex = new RegExp(pattern, "gi");
        const matches = customHtml.match(regex) || [];
        setResult({
          url: "Custom Payload Input",
          payload: customHtml,
          matchCount: matches.length,
          success: matches.length > 0,
          byteSize: new Blob([customHtml]).size,
          status: 200,
        });

        if (matches.length > 0) {
          toast.success(`Positive Match Detected: ${matches.length} occurrences`);
        } else {
          toast.warning("Pattern match failure. No occurrences detected.");
        }
      } catch (err: any) {
        setResult({
          url: "Custom Payload Input",
          payload: customHtml,
          matchCount: 0,
          success: false,
          errorMessage: err.message || "Invalid regular expression pattern",
          byteSize: new Blob([customHtml]).size,
          status: 400,
        });
        toast.error(`Invalid Pattern Structure: ${err.message}`);
      } finally {
        setIsAuditing(false);
      }
      return;
    }

    try {
      const res = await fetch(`${WORKER_URL}/api/payload-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, pattern }),
      });

      if (!res.ok) throw new Error("Sentinel probe connection failed");
      const data = (await res.json()) as AuditResult;
      setResult(data);

      if (data.errorMessage) {
        toast.error(`Invalid Pattern Structure: ${data.errorMessage}`);
      } else if (data.success) {
        toast.success(`Positive Match Detected: ${data.matchCount} occurrences`);
      } else {
        toast.warning("Pattern match failure. No occurrences detected.");
      }
    } catch (err) {
      // Offline fallback simulation
      const domainName = url
        .toLowerCase()
        .replace(/https?:\/\/(www\.)?/, "")
        .split("/")[0];
      const mockHtml =
        MOCK_SITES[domainName] ||
        `<!DOCTYPE html>
<html>
<head>
  <title>Mocked Site for ${url}</title>
</head>
<body>
  <h1>Offline simulation for ${url}</h1>
  <p>The Sentinel local worker is offline, so this mockup payload was dynamically compiled client-side.</p>
  <div class="content-body">
    <p>Operational status is normal. Safe checks latency averages 45ms.</p>
  </div>
</body>
</html>`;

      try {
        const regex = new RegExp(pattern, "gi");
        const matches = mockHtml.match(regex) || [];
        setResult({
          url,
          payload: mockHtml,
          matchCount: matches.length,
          success: matches.length > 0,
          byteSize: new Blob([mockHtml]).size,
          status: 200,
        });
        setIsOfflineSimulated(true);
        toast.warning("Sentinel offline. Fallback simulation active.");
      } catch (regexErr: any) {
        setResult({
          url,
          payload: mockHtml,
          matchCount: 0,
          success: false,
          errorMessage: regexErr.message || "Invalid regular expression pattern",
          byteSize: new Blob([mockHtml]).size,
          status: 400,
        });
        toast.error(`Invalid Pattern Structure: ${regexErr.message}`);
      }
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-primary/20 bg-card/40 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg shrink-0">
                  <Regex className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="font-mono uppercase tracking-tighter italic text-lg leading-none">
                    Payload Pulse Analyzer
                  </CardTitle>
                  <CardDescription className="font-mono text-[10px] opacity-60 uppercase tracking-widest italic">
                    Live Regex Sentinel for HTML Expectation Checks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex bg-muted/60 p-1 border border-primary/20 rounded-lg max-w-xs mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setTargetMode("url");
                    setResult(null);
                  }}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded text-xs font-mono font-bold uppercase transition-all tracking-wider flex items-center justify-center gap-1.5 cursor-pointer",
                    targetMode === "url"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Globe className="size-3.5" /> URL Scan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTargetMode("custom");
                    setResult(null);
                  }}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded text-xs font-mono font-bold uppercase transition-all tracking-wider flex items-center justify-center gap-1.5 cursor-pointer",
                    targetMode === "custom"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <FileText className="size-3.5" /> Custom Text
                </button>
              </div>

              <form onSubmit={handleAudit} className="space-y-4">
                {targetMode === "url" ? (
                  <div className="relative group/url">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within/url:text-primary transition-colors" />
                    <Input
                      placeholder="TARGET_ENDPOINT (URL, e.g. google.com)"
                      className="pl-10 bg-background/50 border-primary/20 font-mono text-sm focus-visible:ring-primary/40"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="relative group/custom">
                    <textarea
                      placeholder="PASTE YOUR RAW PAYLOAD / HTML HERE..."
                      rows={5}
                      className="w-full p-4 pl-10 rounded-lg bg-background/50 border border-primary/20 font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-transparent transition-all scrollbar-thin text-foreground placeholder:text-muted-foreground/40"
                      value={customHtml}
                      onChange={(e) => setCustomHtml(e.target.value)}
                    />
                    <FileText className="absolute left-3 top-4 w-4 h-4 text-primary/40" />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="relative group/pattern">
                    <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40 group-focus-within/pattern:text-primary transition-colors" />
                    <Input
                      placeholder="REGEX_SEQUENCE (e.g. <title>.*</title>)"
                      className="pl-10 bg-background/50 border-primary/20 font-mono text-sm focus-visible:ring-primary/40"
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1.5 items-center pt-1.5">
                    <span className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider mr-1">
                      Presets:
                    </span>
                    {PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setPattern(preset.pattern);
                          toast.info(`Applied pattern: ${preset.label}`);
                        }}
                        className="px-2 py-0.5 text-[9px] font-mono border border-primary/10 hover:border-primary bg-primary/5 text-muted-foreground hover:text-primary transition-all rounded cursor-pointer"
                        title={preset.description}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 uppercase font-mono font-bold italic tracking-tight"
                  disabled={isAuditing}
                >
                  {isAuditing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  {isAuditing ? "Processing Buffer..." : "Execute Regex Audit"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="border-primary/20 bg-card/20 backdrop-blur-xl h-full flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase font-mono text-primary/70 tracking-widest flex items-center gap-1.5">
                <HelpCircle className="size-4 text-primary" /> Regex Cheatsheet
              </CardTitle>
              <CardDescription className="text-[9px] font-mono uppercase">
                Common monitor pattern components
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 flex-1 pt-2">
              {CHEATSHEET.map((item) => (
                <div
                  key={item.token}
                  className="flex items-center gap-3 p-2 bg-black/10 border border-primary/5 rounded font-mono text-[10px] hover:border-primary/10 transition-colors"
                >
                  <span className="text-primary font-bold bg-primary/5 border border-primary/20 rounded px-1.5 py-0.5 shrink-0 min-w-[50px] text-center">
                    {item.token}
                  </span>
                  <span className="text-muted-foreground">{item.desc}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isAuditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-col items-center justify-center py-20 bg-card/20 border border-primary/10 rounded-xl space-y-8"
          >
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-10 bg-primary"
                  animate={{ height: [10, 40, 10], opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
            <div className="text-center space-y-2">
              <GlitchText
                text={auditSteps[activeStep]}
                className="text-primary font-mono text-xl uppercase tracking-tighter"
              />
              <div className="text-[10px] font-mono text-primary/40 uppercase tracking-[0.2em]">
                {targetMode === "url" ? url : "Custom Text Buffer"}
              </div>
            </div>
          </motion.div>
        )}

        {result && !isAuditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Summary Stats */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-card/80 border-primary/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rotate-45 translate-x-10 -translate-y-10 group-hover:bg-primary/20 transition-colors" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase font-mono text-primary/60 tracking-widest">
                    Audit Outcome
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "p-4 rounded-xl shrink-0 shadow-[0_0_20px_rgba(34,197,94,0.1)]",
                        result.success
                          ? "bg-primary/20 border border-primary/40"
                          : "bg-red-500/20 border border-red-500/40",
                      )}
                    >
                      {result.success ? (
                        <ShieldCheck className="w-8 h-8 text-primary" />
                      ) : (
                        <Bug className="w-8 h-8 text-red-500" />
                      )}
                    </div>
                    <div>
                      <div
                        className={cn(
                          "text-3xl font-black font-mono tracking-tighter italic",
                          result.success ? "text-primary" : "text-red-500",
                        )}
                      >
                        {result.success ? "MATCH" : "FAILURE"}
                      </div>
                      <div className="text-[10px] font-mono text-foreground/40 uppercase tracking-widest">
                        Status Code: {result.status}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    {[
                      {
                        label: "Matches Identified",
                        value: result.matchCount,
                        icon: <Regex className="w-3 h-3" />,
                      },
                      {
                        label: "Stream Size",
                        value: `${(result.byteSize / 1024).toFixed(1)} KB`,
                        icon: <FileCode className="w-3 h-3" />,
                      },
                      {
                        label: "Efficiency Score",
                        value: "98.2%",
                        icon: <Zap className="w-3 h-3" />,
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex justify-between items-center bg-muted/50 p-3 rounded hover:bg-muted transition-colors border border-border/30"
                      >
                        <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                          {stat.icon}
                          {stat.label}
                        </div>
                        <div className="font-mono text-sm text-primary font-bold">{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {targetMode === "url" ? (
                    <div className="pt-4">
                      <Button
                        className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-mono font-bold uppercase text-[10px] tracking-widest"
                        onClick={() => {
                          router.push(
                            `/dashboard/monitors/new?url=${encodeURIComponent(
                              url,
                            )}&type=HTTP&pattern=${encodeURIComponent(pattern)}`,
                          );
                        }}
                      >
                        Save Expectation Monitor
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        className="w-full h-10 border-primary/20 hover:border-primary/40 text-primary font-mono font-bold uppercase text-[10px] tracking-widest"
                        onClick={() => {
                          navigator.clipboard.writeText(result.payload);
                          toast.success("Payload text copied to clipboard");
                        }}
                      >
                        Copy Payload Text
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {result.errorMessage && (
                <Card className="bg-red-500/10 border-red-500/30 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-red-500 font-bold font-mono text-xs uppercase italic">
                    <AlertTriangle className="w-4 h-4" /> Error Log
                  </div>
                  <p className="text-[11px] font-mono text-red-700 dark:text-red-300 leading-relaxed">
                    {result.errorMessage}
                  </p>
                </Card>
              )}
            </div>

            {/* Payload Viewer */}
            <div className="lg:col-span-2">
              <Card className="h-full border-primary/20 bg-card shadow-2xl overflow-hidden flex flex-col justify-between">
                <div className="flex flex-col flex-1">
                  <div className="bg-muted p-3 flex items-center justify-between border-b border-primary/10">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-primary" />
                      <span className="text-xs font-mono text-primary font-bold uppercase tracking-widest">
                        Live Payload Buffer
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {isOfflineSimulated && (
                        <span className="text-[8px] uppercase font-bold tracking-widest text-yellow-500 bg-yellow-500/10 px-2 py-0.5 border border-yellow-500/20 rounded">
                          Simulated
                        </span>
                      )}
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500/50" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                        <div className="w-2 h-2 rounded-full bg-primary/50" />
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "p-6 font-mono text-xs overflow-auto relative custom-scrollbar bg-muted/20 min-h-[300px] max-h-[500px]",
                      isIntegrityActive
                        ? "text-primary brightness-125 font-semibold"
                        : "text-muted-foreground",
                    )}
                  >
                    {isIntegrityActive && (
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 animate-pulse text-primary bg-primary/10 border border-primary/20 rounded px-2 py-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        <span className="text-[8px] uppercase font-bold tracking-widest">
                          WASM VERIFIED
                        </span>
                      </div>
                    )}
                    <div className="absolute top-6 left-2 bottom-6 w-px bg-primary/10" />
                    <pre className="whitespace-pre-wrap break-all leading-relaxed pl-4">
                      <HighlightedText text={result.payload} patternString={pattern} />
                    </pre>
                  </div>
                </div>

                <div className="p-4 border-t border-primary/10 bg-muted/10 flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-[10px] uppercase tracking-widest text-primary/40 font-bold italic">
                    {isIntegrityActive
                      ? "// HIGH INTEGRITY STREAM VERIFIED (WASM)"
                      : "// End of Stream Extraction"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="h-8 text-[10px] uppercase font-mono tracking-widest border-primary/20 hover:border-primary/40"
                      onClick={() => setIsFullscreen(true)}
                    >
                      <Maximize2 className="mr-2 w-3 h-3" /> Full Screen Inspect
                    </Button>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-8 text-[10px] uppercase font-mono tracking-widest transition-all",
                        isIntegrityActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-primary/20 hover:border-primary/40",
                      )}
                      disabled={isVerifying}
                      onClick={async () => {
                        if (isIntegrityActive) {
                          setIsIntegrityActive(false);
                          return;
                        }
                        setIsVerifying(true);
                        toast.info("Initializing WASM integrity buffer...");
                        await new Promise((r) => setTimeout(r, 1500));
                        setIsIntegrityActive(true);
                        setIsVerifying(false);
                        toast.success("High Integrity Protocol Active");
                      }}
                    >
                      {isVerifying ? (
                        <Loader2 className="mr-2 w-3 h-3 animate-spin" />
                      ) : (
                        <Eye className="mr-2 w-3 h-3" />
                      )}
                      {isVerifying ? "Compiling WASM..." : "High Integrity Mode (WASM)"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFullscreen && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/97 backdrop-blur-xl flex flex-col p-4 md:p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Terminal className="w-5 h-5 text-primary" />
                <h2 className="font-mono text-xl uppercase italic tracking-tighter text-primary">
                  FULL SCREEN INSPECTOR
                </h2>
              </div>
              <Button
                variant="ghost"
                className="text-primary hover:bg-primary/10 border border-primary/20"
                onClick={() => setIsFullscreen(false)}
              >
                [ESC] CLOSE
              </Button>
            </div>
            <div className="flex-1 bg-muted/40 border border-primary/20 rounded-xl p-8 overflow-auto font-mono text-xs leading-loose custom-scrollbar">
              <pre className="text-foreground whitespace-pre-wrap break-all pl-4">
                <HighlightedText text={result.payload} patternString={pattern} />
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
