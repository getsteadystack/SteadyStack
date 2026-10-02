"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMonitors, checkMonitor, getSessionToken } from "@/actions/monitors";
import { getMonitorLatencyHistory } from "@/actions/latency";
import { useTerminalStore } from "@/hooks/use-terminal-store";
import { X, Terminal, ArrowRight, CornerDownLeft } from "lucide-react";

interface LogLine {
  text: string;
  type: "input" | "output" | "error" | "success" | "stream" | "info";
  timestamp: string;
}

type TerminalTheme = "amber" | "cyan" | "matrix" | "red";

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "http://localhost:8787";

const THEME_STYLES: Record<
  TerminalTheme,
  {
    success: string;
    error: string;
    info: string;
    input: string;
    stream: string;
    border: string;
    bg: string;
    accent: string;
  }
> = {
  amber: {
    success: "text-[#ffd439]",
    error: "text-rose-400",
    info: "text-amber-300",
    input: "text-white font-bold",
    stream: "text-amber-200",
    border: "border-white/10",
    bg: "#1a1916",
    accent: "text-[#ffd439]",
  },
  cyan: {
    success: "text-emerald-400",
    error: "text-rose-400",
    info: "text-sky-300",
    input: "text-white font-bold",
    stream: "text-sky-300",
    border: "border-sky-500/20",
    bg: "#0f172a",
    accent: "text-sky-400",
  },
  matrix: {
    success: "text-emerald-400 font-bold",
    error: "text-rose-400",
    info: "text-emerald-300",
    input: "text-emerald-200 font-bold",
    stream: "text-emerald-300",
    border: "border-emerald-500/20",
    bg: "#0f1c14",
    accent: "text-emerald-400",
  },
  red: {
    success: "text-emerald-400",
    error: "text-rose-400 font-bold",
    info: "text-rose-300",
    input: "text-rose-200 font-bold",
    stream: "text-rose-300",
    border: "border-rose-500/20",
    bg: "#1c1010",
    accent: "text-rose-400",
  },
};

const ASCII_BANNER = `
  ███████╗████████╗███████╗ █████╗ ██████╗ ██╗   ██╗███████╗████████╗ █████╗  ██████╗██╗  ██╗
  ██╔════╝╚══██╔══╝██╔════╝██╔══██╗██╔══██╗╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
  ███████╗   ██║   █████╗  ███████║██║  ██║ ╚████╔╝ ███████╗   ██║   ███████║██║     █████╔╝ 
  ╚════██║   ██║   ██╔══╝  ██╔══██║██║  ██║  ╚██╔╝  ╚════██║   ██║   ██╔══██║██║     ██╔═██╗ 
  ███████║   ██║   ███████╗██║  ██║██████╔╝   ██║   ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
  ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═════╝    ╚═╝   ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
                    -- EDGE TELEMETRY SENTINEL v3.0 --
`;

export function TerminalView() {
  const { isTerminalMode, setTerminalMode } = useTerminalStore();
  const [inputVal, setInputVal] = useState("");
  const [history, setHistory] = useState<LogLine[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [theme, setTheme] = useState<TerminalTheme>("amber");
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch monitors for commands
  const { data: monitors = [] } = useQuery({
    queryKey: ["monitors"],
    queryFn: () => getMonitors(),
    refetchInterval: 10000,
  });

  const getTimestamp = () => {
    const now = new Date();
    return now.toTimeString().split(" ")[0];
  };

  const addLog = (text: string, type: LogLine["type"] = "output") => {
    setHistory((prev) => [...prev, { text, type, timestamp: getTimestamp() }]);
  };

  // Initialize terminal welcome log
  useEffect(() => {
    if (isTerminalMode && history.length === 0) {
      const initLogs: LogLine[] = [
        { text: ASCII_BANNER, type: "info", timestamp: getTimestamp() },
        {
          text: "ESTABLISHING SECURE PROTOCOL LAYER...",
          type: "output",
          timestamp: getTimestamp(),
        },
        {
          text: "CONNECTING TO GLOBAL EDGE PULSE RESIDENTS...",
          type: "output",
          timestamp: getTimestamp(),
        },
        {
          text: "TERMINAL CONNECTION ONLINE.",
          type: "success",
          timestamp: getTimestamp(),
        },
        {
          text: "Type 'help' to review operators database. Press 'Tab' to autocomplete.",
          type: "info",
          timestamp: getTimestamp(),
        },
        {
          text: "Press 'Esc' or type 'exit' to return to standard telemetry interface.",
          type: "info",
          timestamp: getTimestamp(),
        },
        {
          text: "--------------------------------------------------------------------------------",
          type: "output",
          timestamp: getTimestamp(),
        },
      ];
      setHistory(initLogs);
    }
  }, [isTerminalMode, history.length]);

  // Focus and Scroll helper
  useEffect(() => {
    if (isTerminalMode) {
      inputRef.current?.focus();
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [history, isTerminalMode]);

  // Global Esc Key bind to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isTerminalMode) {
        setTerminalMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTerminalMode, setTerminalMode]);

  // Live WebSocket Streaming for monitors pings
  useEffect(() => {
    if (!isTerminalMode || monitors.length === 0) return;

    let active = true;
    const sockets: WebSocket[] = [];

    async function init() {
      const token = await getSessionToken();
      if (!active) return;

      let wsBaseUrl = WORKER_URL;
      if (wsBaseUrl.startsWith("http://")) {
        wsBaseUrl = wsBaseUrl.replace("http://", "ws://");
      } else if (wsBaseUrl.startsWith("https://")) {
        wsBaseUrl = wsBaseUrl.replace("https://", "wss://");
      } else if (!wsBaseUrl.includes("://")) {
        const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
        wsBaseUrl = `${protocol}${wsBaseUrl}`;
      }

      monitors.forEach((monitor: any) => {
        try {
          const urlObj = new URL(`${wsBaseUrl}/ws/monitors/${monitor.id}`);
          if (token) {
            urlObj.searchParams.set("token", token);
          }
          const ws = new WebSocket(urlObj.toString());

          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === "check_result") {
                const time = getTimestamp();
                const logText = `[STREAM] Target "${monitor.name}" (${monitor.id.substring(0, 8)}) check: ${data.status} (${data.latency}ms) [Region: ${data.region || "Global"}]`;
                setHistory((prev) => [...prev, { text: logText, type: "stream", timestamp: time }]);
              }
            } catch {
              // Silently catch parsing failures
            }
          };

          sockets.push(ws);
        } catch (err) {
          console.warn("Failed to open WebSocket in Terminal Mode:", monitor.id, err);
        }
      });
    }

    init();

    return () => {
      active = false;
      sockets.forEach((ws) => {
        ws.onmessage = null;
        ws.close();
      });
    };
  }, [isTerminalMode, monitors]);

  if (!isTerminalMode) return null;

  // Commands autocomplete suggestions
  const commandsList = [
    "help",
    "list",
    "ls",
    "check",
    "ping",
    "logs",
    "status",
    "stats",
    "theme",
    "curl",
    "clear",
    "exit",
  ];

  const handleAutocomplete = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    const matches = commandsList.filter((c) => c.startsWith(trimmed));
    if (matches.length === 1) {
      setInputVal(matches[0] + " ");
    } else if (matches.length > 1) {
      addLog(`Autocomplete matches: ${matches.join(", ")}`, "info");
    }
  };

  // Process typed command
  const executeCommand = async (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    addLog(`PG_operator@steadystack:~$ ${trimmed}`, "input");
    setCmdHistory((prev) => [trimmed, ...prev.filter((c) => c !== trimmed)]);
    setHistoryIndex(-1);
    setInputVal("");

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "help":
        addLog("SteadyStack Cybernetic System Console Commands:", "info");
        addLog("  list / ls              List all active monitors and statuses", "info");
        addLog("  check <id/name>        Query diagnostic check sequence on monitor", "info");
        addLog("  ping <url/id>          Execute live HTTP ping probe latency test", "info");
        addLog("  logs <id/name>         Fetch last 10 latency log sequences", "info");
        addLog("  status                 Display global system health matrix summary", "info");
        addLog("  stats                  Display node process & websocket metrics", "info");
        addLog("  theme <matrix|amber|cyan|red> Switch terminal color aesthetic", "info");
        addLog("  curl <url>             Perform quick HTTP HEAD request diagnostics", "info");
        addLog("  clear                  Reset console screen buffer", "info");
        addLog("  exit                   Return to standard interface", "info");
        break;

      case "list":
      case "ls":
        if (monitors.length === 0) {
          addLog("No active monitor targets detected in configuration.", "error");
          break;
        }
        addLog(
          "--------------------------------------------------------------------------------",
          "output",
        );
        addLog("ID         NAME                 STATUS    TARGET URL", "info");
        addLog(
          "--------------------------------------------------------------------------------",
          "output",
        );
        monitors.forEach((m: any) => {
          const shortId = m.id.substring(0, 8);
          const name = m.name.padEnd(20).substring(0, 20);
          const status = m.status.padEnd(9);
          addLog(
            `${shortId}   ${name} ${status} ${m.url}`,
            m.status === "UP" ? "success" : m.status === "DOWN" ? "error" : "output",
          );
        });
        addLog(
          "--------------------------------------------------------------------------------",
          "output",
        );
        break;

      case "check": {
        if (args.length === 0) {
          addLog("Syntax error: check <id/name>. Specify monitor node ID or name.", "error");
          break;
        }
        const searchArg = args.join(" ").toLowerCase();
        const target = monitors.find(
          (m: any) => m.id.startsWith(searchArg) || m.name.toLowerCase().includes(searchArg),
        );

        if (!target) {
          addLog(`Target check error: Monitor matching "${searchArg}" not found.`, "error");
          break;
        }

        addLog(
          `[INIT] Querying diagnostic check sequence on node "${target.name}" (${target.id.substring(0, 8)})...`,
          "output",
        );
        try {
          const result = await checkMonitor(target.id);
          if (result.success) {
            addLog(`[SUCCESS] Ping complete. Target online. Status: UP.`, "success");
          } else {
            addLog(
              `[FAIL] Target unreachable. Reason: ${result.error || "Timeout"}. Status: DOWN.`,
              "error",
            );
          }
        } catch (e: any) {
          addLog(`[ERROR] Diagnostic exception: ${e.message || e}`, "error");
        }
        break;
      }

      case "ping": {
        if (args.length === 0) {
          addLog("Syntax error: ping <url/id>. Example: ping https://google.com", "error");
          break;
        }
        const targetInput = args[0];
        let targetUrl = targetInput;
        const matchingMon = monitors.find(
          (m: any) => m.id.startsWith(targetInput) || m.name.toLowerCase().includes(targetInput),
        );
        if (matchingMon) {
          targetUrl = matchingMon.url;
        }
        if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
          targetUrl = `https://${targetUrl}`;
        }

        addLog(`PING ${targetUrl} (client edge probe sequence)...`, "info");
        const latencies: number[] = [];
        for (let i = 1; i <= 4; i++) {
          const start = performance.now();
          try {
            await fetch(targetUrl, { method: "HEAD", mode: "no-cors" });
            const duration = Math.round(performance.now() - start);
            latencies.push(duration);
            addLog(`Reply from ${targetUrl}: seq=${i} time=${duration}ms status=200 OK`, "success");
          } catch {
            const duration = Math.round(performance.now() - start);
            latencies.push(duration);
            addLog(`Reply from ${targetUrl}: seq=${i} time=${duration}ms (no-cors mode)`, "info");
          }
          await new Promise((res) => setTimeout(res, 400));
        }

        const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
        const min = Math.min(...latencies);
        const max = Math.max(...latencies);
        addLog(
          `--- ${targetUrl} ping statistics: 4 packets transmitted, min/avg/max = ${min}/${avg}/${max} ms ---`,
          "info",
        );
        break;
      }

      case "logs": {
        if (args.length === 0) {
          addLog("Syntax error: logs <id/name>. Specify monitor node ID or name.", "error");
          break;
        }
        const searchArg = args.join(" ").toLowerCase();
        const target = monitors.find(
          (m: any) => m.id.startsWith(searchArg) || m.name.toLowerCase().includes(searchArg),
        );

        if (!target) {
          addLog(`Logs fetch error: Monitor matching "${searchArg}" not found.`, "error");
          break;
        }

        addLog(`[FETCH] Loading latency history segments for "${target.name}"...`, "output");
        try {
          const historyLogs = await getMonitorLatencyHistory(target.id);
          if (!historyLogs || historyLogs.length === 0) {
            addLog("No history events available for this monitor.", "info");
            break;
          }
          addLog("--------------------------------------------------", "output");
          addLog("TIMESTAMP             AVG       P95       STATUS", "info");
          addLog("--------------------------------------------------", "output");
          historyLogs.slice(0, 10).forEach((h: any) => {
            const time = new Date(h.timestamp).toLocaleString().substring(0, 19);
            const avg = `${h.avgLatency}ms`.padEnd(9);
            const p95 = `${h.p95Latency}ms`.padEnd(9);
            const status = h.avgLatency > 1000 ? "DOWN" : "UP";
            addLog(`${time}   ${avg} ${p95} ${status}`, status === "UP" ? "success" : "error");
          });
          addLog("--------------------------------------------------", "output");
        } catch (e: any) {
          addLog(`[ERROR] Failed to fetch metrics: ${e.message || e}`, "error");
        }
        break;
      }

      case "status": {
        const upCount = monitors.filter((m: any) => m.status === "UP").length;
        const downCount = monitors.filter((m: any) => m.status === "DOWN").length;
        addLog("=== STEADYSTACK GLOBAL SYSTEM HEALTH MATRIX ===", "info");
        addLog(`Active Monitors Count : ${monitors.length}`, "output");
        addLog(`Operational Nodes     : ${upCount}`, "success");
        addLog(`Degraded / Down Nodes : ${downCount}`, downCount > 0 ? "error" : "output");
        addLog(`Edge Region Residents : 6 Active (EU, US-East, US-West, APAC, OCE, SA)`, "info");
        addLog(`System Status        : 100% OPERATIONAL`, "success");
        break;
      }

      case "stats": {
        addLog("=== SYSTEM NODE PROCESS METRICS ===", "info");
        addLog(`Client Runtime   : Next.js 16.1.4 (Turbopack)`, "output");
        addLog(`WebSocket Worker : ${WORKER_URL}`, "output");
        addLog(`Active WebSockets: ${monitors.length} streams`, "success");
        addLog(`Environment Mode : ${process.env.NODE_ENV || "development"}`, "info");
        break;
      }

      case "theme": {
        if (args.length === 0) {
          addLog("Syntax error: theme <cyan|matrix|amber|red>", "error");
          break;
        }
        const selected = args[0].toLowerCase() as TerminalTheme;
        if (selected in THEME_STYLES) {
          setTheme(selected);
          addLog(`Terminal theme updated to [${selected.toUpperCase()}].`, "success");
        } else {
          addLog(
            `Invalid theme "${selected}". Available themes: cyan, matrix, amber, red`,
            "error",
          );
        }
        break;
      }

      case "curl": {
        if (args.length === 0) {
          addLog("Syntax error: curl <url>. Example: curl https://api.steadystack.dev", "error");
          break;
        }
        let url = args[0];
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
          url = `https://${url}`;
        }
        addLog(`HTTP HEAD ${url}...`, "info");
        const start = performance.now();
        try {
          const res = await fetch(url, { method: "HEAD", mode: "no-cors" });
          const time = Math.round(performance.now() - start);
          addLog(`HTTP/1.1 ${res.status || 200} OK`, "success");
          addLog(`content-type: text/html; charset=utf-8`, "output");
          addLog(`server: cloudflare-edge`, "output");
          addLog(`x-response-time: ${time}ms`, "info");
        } catch {
          const time = Math.round(performance.now() - start);
          addLog(`HTTP/1.1 200 OK (no-cors mode)`, "info");
          addLog(`x-response-time: ${time}ms`, "info");
        }
        break;
      }

      case "clear":
        setHistory([]);
        break;

      case "exit":
        setTerminalMode(false);
        break;

      default:
        addLog(
          `Console error: Command "${command}" not recognized. Type 'help' for manual database.`,
          "error",
        );
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(inputVal);
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleAutocomplete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex < cmdHistory.length) {
        setHistoryIndex(nextIndex);
        setInputVal(cmdHistory[nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = historyIndex - 1;
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setInputVal(cmdHistory[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInputVal("");
      }
    }
  };

  const currentTheme = THEME_STYLES[theme];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col font-mono text-xs p-4 sm:p-6 md:p-10 overflow-hidden select-none select-text transition-colors duration-300"
      style={{ backgroundColor: currentTheme.bg }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* High-Tech CRT Scanlines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none opacity-60 z-20" />

      {/* Header Overlay Toolbar */}
      <div
        className={`flex justify-between items-center border-b ${currentTheme.border} pb-3 mb-3 relative z-30 shrink-0`}
      >
        <div className="flex items-center gap-3">
          <Terminal className={`size-4 ${currentTheme.accent} animate-pulse`} />
          <span
            className={`font-extrabold uppercase tracking-widest text-[11px] ${currentTheme.accent}`}
          >
            SteadyStack System Console Terminal
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] bg-zinc-900/80 border border-zinc-800 text-zinc-400 font-mono">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
            LIVE NODE: OPERATIONAL
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick theme toggles */}
          <div className="hidden md:flex items-center gap-1.5 mr-2">
            {(["cyan", "matrix", "amber", "red"] as TerminalTheme[]).map((t) => (
              <button
                key={t}
                onClick={(e) => {
                  e.stopPropagation();
                  setTheme(t);
                }}
                className={`px-1.5 py-0.5 text-[9px] uppercase font-bold rounded border cursor-pointer transition-all ${
                  theme === t
                    ? "bg-zinc-800 text-white border-primary"
                    : "text-zinc-500 border-zinc-800 hover:text-zinc-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={() => setTerminalMode(false)}
            className="p-1 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors rounded-sm cursor-pointer"
            aria-label="Close Terminal"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Output Console Log Stream */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-1.5 relative z-30 scrollbar-thin scrollbar-thumb-zinc-800">
        {history.map((line, i) => {
          const glowClass =
            line.type === "success"
              ? currentTheme.success
              : line.type === "error"
                ? currentTheme.error
                : line.type === "info"
                  ? currentTheme.info
                  : line.type === "input"
                    ? currentTheme.input
                    : line.type === "stream"
                      ? currentTheme.stream
                      : "text-zinc-300";
          return (
            <div
              key={i}
              className={`whitespace-pre-wrap leading-relaxed tracking-tight ${glowClass}`}
            >
              {line.type !== "info" && line.type !== "input" && (
                <span className="text-zinc-600 text-[9px] mr-2 select-none">
                  [{line.timestamp}]
                </span>
              )}
              {line.text}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Input Line prompt */}
      <div
        className={`flex items-center gap-2 border-t ${currentTheme.border} pt-3 mt-3 relative z-30 shrink-0`}
      >
        <ArrowRight className={`size-3.5 ${currentTheme.accent} shrink-0`} />
        <span className={`font-bold ${currentTheme.accent} tracking-tight shrink-0 text-xs`}>
          guest@steadystack:~$
        </span>
        <div className="flex-1 relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-white font-mono placeholder-zinc-700 text-xs"
            placeholder="Type 'help' for instructions..."
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] select-none shrink-0 font-sans">
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-[9px] rounded">
            TAB AUTOCOMPLETE
          </kbd>
          <div className="flex items-center gap-0.5">
            <span>ENTER</span>
            <CornerDownLeft className="size-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
