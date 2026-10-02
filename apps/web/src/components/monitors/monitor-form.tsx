"use client";

import {
  Activity,
  Globe,
  Server,
  Clock,
  Save,
  X,
  Loader2,
  ChevronDown,
  Book,
  Plus,
  Trash2,
  Chrome,
  Layers,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  Heart,
  Lock,
  Radio,
  Mail,
  FolderOpen,
  Wifi,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import { createMonitor, updateMonitor } from "@/actions/monitors";
import { useActionState, useState } from "react";
import { useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { RegionSelector } from "./region-selector";
import type { UsageSummary } from "@/lib/billing";

const initialState = {
  success: false,
  error: "",
};

type ProtocolMonitorType = "GRPC" | "SMTP" | "FTP" | "ICMP" | "MAIL";

const PROTOCOL_TYPES: ProtocolMonitorType[] = ["GRPC", "SMTP", "FTP", "ICMP", "MAIL"];

const PROTOCOL_DEFAULT_PORTS: Record<ProtocolMonitorType, number> = {
  GRPC: 80,
  SMTP: 25,
  FTP: 21,
  ICMP: 0,
  MAIL: 143,
};

interface MonitorFormProps {
  monitor?: {
    id: string;
    name: string;
    url: string;
    type: "HTTP" | "PING" | "PORT" | "BROWSER" | "SEQUENCE" | "SSL" | "DNS" | "HEARTBEAT" | ProtocolMonitorType;
    interval: number;
    checkRegions?: string | null;
    alertThreshold?: number;
    runbookUrl?: string | null;
    method?: string;
    /** Never populated with secrets — the server strips it; presence of
     *  stored protocol credentials is signaled via hasProtocolCredentials. */
    headers?: string | null;
    body?: string | null;
    script?: string | null;
    expectation?: string | null;
    heartbeatToken?: string | null;
    /** Encrypted mTLS bundle — only presence is exposed to the client. */
    clientCert?: string | null;
    tags?: string[];
  };
  usageSummary?: UsageSummary;
}

export function MonitorForm({
  monitor,
  usageSummary,
  hasProtocolCredentials = false,
}: MonitorFormProps & { hasProtocolCredentials?: boolean }) {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type")?.toUpperCase() as
    | "HTTP"
    | "PING"
    | "PORT"
    | "BROWSER"
    | "SEQUENCE"
    | "SSL"
    | "DNS"
    | "HEARTBEAT"
    | ProtocolMonitorType
    | null;

  // Parse initial values
  let initialType:
    | "HTTP"
    | "PING"
    | "PORT"
    | "BROWSER"
    | "SEQUENCE"
    | "SSL"
    | "DNS"
    | "HEARTBEAT"
    | ProtocolMonitorType = monitor?.type || typeParam || "HTTP";
  let initialUrl = monitor?.url || "";
  let initialPort = "";
  let initialRegions: string[] = [];

  // Parse checkRegions
  if (monitor?.checkRegions) {
    try {
      initialRegions = JSON.parse(monitor.checkRegions);
    } catch (e) {
      console.error("Failed to parse checkRegions:", e);
    }
  }

  if (monitor) {
    if (monitor.type === "PING" && initialUrl.startsWith("ping://")) {
      initialUrl = initialUrl.replace("ping://", "");
    } else if (monitor.type === "ICMP" && initialUrl.startsWith("icmp://")) {
      initialUrl = initialUrl.replace("icmp://", "");
    } else if (monitor.type === "PORT" && initialUrl.startsWith("tcp://")) {
      const trimmed = initialUrl.replace("tcp://", "");
      const [host, port] = trimmed.split(":");
      initialUrl = host;
      initialPort = port;
    } else if (
      PROTOCOL_TYPES.includes(monitor.type as ProtocolMonitorType) &&
      /^\w+:\/\//.test(initialUrl)
    ) {
      // Show bare host (optionally host:port) for protocol monitors
      initialUrl = initialUrl.replace(/^\w+:\/\//, "").split("/")[0] || initialUrl;
    } else if (monitor.type === "HEARTBEAT" && initialUrl.startsWith("heartbeat://")) {
      initialUrl = "";
    }
  }

  const [monitorType, setMonitorType] = useState<
    "HTTP" | "PING" | "PORT" | "BROWSER" | "SEQUENCE" | "SSL" | "DNS" | "HEARTBEAT" | ProtocolMonitorType
  >(initialType);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(initialRegions);
  const [threshold, setThreshold] = useState(monitor?.alertThreshold || 1);
  const [runbookUrl, setRunbookUrl] = useState(monitor?.runbookUrl || "");

  // HTTP Customization State
  const [method, setMethod] = useState(monitor?.method || "GET");
  const [headersList, setHeadersList] = useState<{ key: string; value: string }[]>(() => {
    if (monitor?.headers) {
      try {
        const parsed = JSON.parse(monitor.headers);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse headers:", e);
      }
    }
    return [{ key: "", value: "" }];
  });
  const [requestBody, setRequestBody] = useState(monitor?.body || "");

  // Expectations State
  const [expectedString, setExpectedString] = useState(() => {
    if (monitor?.expectation) {
      try {
        const parsed = JSON.parse(monitor.expectation);
        return parsed.body_contains || "";
      } catch (e) {
        console.error("Failed to parse body_contains:", e);
      }
    }
    return "";
  });

  const [forbiddenString, setForbiddenString] = useState(() => {
    if (monitor?.expectation) {
      try {
        const parsed = JSON.parse(monitor.expectation);
        return parsed.body_excludes || "";
      } catch (e) {
        console.error("Failed to parse body_excludes:", e);
      }
    }
    return "";
  });

  const [jsonAssertions, setJsonAssertions] = useState<
    { path: string; operator: string; value: string }[]
  >(() => {
    if (monitor?.expectation) {
      try {
        const parsed = JSON.parse(monitor.expectation);
        if (Array.isArray(parsed.json_assertions)) return parsed.json_assertions;
      } catch (e) {
        console.error("Failed to parse json_assertions:", e);
      }
    }
    return [];
  });

  const [expectedIPs, setExpectedIPs] = useState<string>(() => {
    if (monitor?.expectation) {
      try {
        const parsed = JSON.parse(monitor.expectation);
        if (Array.isArray(parsed.expectedIPs)) {
          return parsed.expectedIPs.join(", ");
        }
      } catch (e) {
        console.error("Failed to parse expectedIPs:", e);
      }
    }
    return "";
  });

  // Protocol Monitor Config State (SMTP/FTP/MAIL credentials, gRPC service name)
  // Body size thresholds from the expectation JSON (HTTP monitors)
  const [maxBodySize, setMaxBodySize] = useState(() => {
    if (monitor?.expectation) {
      try {
        const parsed = JSON.parse(monitor.expectation);
        return typeof parsed.max_body_size_bytes === "number" ? String(parsed.max_body_size_bytes) : "";
      } catch {}
    }
    return "";
  });
  const [minBodySize, setMinBodySize] = useState(() => {
    if (monitor?.expectation) {
      try {
        const parsed = JSON.parse(monitor.expectation);
        return typeof parsed.min_body_size_bytes === "number" ? String(parsed.min_body_size_bytes) : "";
      } catch {}
    }
    return "";
  });
  // mTLS: the stored bundle is encrypted, so only presence is shown — the key
  // must be re-entered to change it (empty fields keep the existing cert).
  const [hasClientCert, setHasClientCert] = useState(Boolean(monitor?.clientCert));
  const [clientCertPem, setClientCertPem] = useState("");
  const [clientKeyPem, setClientKeyPem] = useState("");
  const [removeClientCert, setRemoveClientCert] = useState(false);
  // Protocol credentials (SMTP/FTP/MAIL) are never shipped to the browser —
  // the server strips the headers column and passes only a presence flag.
  // Untouched edits keep the stored credentials; posting a username (with
  // optional password) replaces them; the checkbox removes them.
  const [protocolUsername, setProtocolUsername] = useState("");
  const [protocolPassword, setProtocolPassword] = useState("");
  const [removeProtocolCredentials, setRemoveProtocolCredentials] = useState(false);
  const [grpcServiceName, setGrpcServiceName] = useState(() => {
    if (monitor?.expectation) {
      try {
        const parsed = JSON.parse(monitor.expectation);
        return parsed.serviceName || "";
      } catch {}
    }
    return "";
  });
  const isProtocolType = PROTOCOL_TYPES.includes(monitorType as ProtocolMonitorType);

  // Browser Steps State
  const [steps, setSteps] = useState<{ action: string; value: string; selector: string }[]>(() => {
    if (monitor?.script) {
      try {
        const parsed = JSON.parse(monitor.script);
        if (Array.isArray(parsed)) {
          return parsed.map((s: any) => ({
            action: s.action || "goto",
            value: s.value || "",
            selector: s.selector || "",
          }));
        }
      } catch (e) {
        console.error("Failed to parse browser steps:", e);
      }
    }
    return [{ action: "goto", value: "", selector: "" }];
  });

  const addStep = () => setSteps([...steps, { action: "goto", value: "", selector: "" }]);
  const removeStep = (index: number) => setSteps(steps.filter((_, i) => i !== index));
  const updateStep = (index: number, field: "action" | "value" | "selector", val: string) => {
    const newSteps = [...steps];
    newSteps[index][field] = val;
    setSteps(newSteps);
  };

  // Sequence Steps State
  const [sequenceSteps, setSequenceSteps] = useState<
    {
      name: string;
      method: string;
      url: string;
      headers: { key: string; value: string }[];
      body: string;
      assertions: {
        type: "status_code" | "body_contains" | "json_path";
        path: string;
        value: string;
      }[];
      extractions: { name: string; source: "body" | "header"; path: string }[];
    }[]
  >(() => {
    if (monitor?.type === "SEQUENCE" && monitor?.script) {
      try {
        const parsed = JSON.parse(monitor.script);
        if (Array.isArray(parsed)) {
          return parsed.map((s: any) => ({
            name: s.name || "",
            method: s.method || "GET",
            url: s.url || "",
            headers: Array.isArray(s.headers) ? s.headers : [],
            body: s.body || "",
            assertions: Array.isArray(s.assertions) ? s.assertions : [],
            extractions: Array.isArray(s.extractions) ? s.extractions : [],
          }));
        }
      } catch (e) {
        console.error("Failed to parse sequence steps:", e);
      }
    }
    return [
      {
        name: "Login",
        method: "POST",
        url: "/login",
        headers: [{ key: "Content-Type", value: "application/json" }],
        body: '{\n  "username": "admin",\n  "password": "password"\n}',
        assertions: [{ type: "status_code", path: "", value: "200" }],
        extractions: [{ name: "token", source: "body", path: "token" }],
      },
    ];
  });

  const addSequenceStep = () => {
    setSequenceSteps([
      ...sequenceSteps,
      {
        name: `Step ${sequenceSteps.length + 1}`,
        method: "GET",
        url: "",
        headers: [],
        body: "",
        assertions: [{ type: "status_code", path: "", value: "200" }],
        extractions: [],
      },
    ]);
  };

  const removeSequenceStep = (index: number) => {
    setSequenceSteps(sequenceSteps.filter((_, i) => i !== index));
  };

  const updateSequenceStep = (index: number, updated: any) => {
    const next = [...sequenceSteps];
    next[index] = { ...next[index], ...updated };
    setSequenceSteps(next);
  };

  const moveSequenceStep = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sequenceSteps.length - 1) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const next = [...sequenceSteps];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    setSequenceSteps(next);
  };

  const addHeader = () => setHeadersList([...headersList, { key: "", value: "" }]);
  const removeHeader = (index: number) => setHeadersList(headersList.filter((_, i) => i !== index));
  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newList = [...headersList];
    newList[index][field] = value;
    setHeadersList(newList);
  };

  const action = monitor ? updateMonitor.bind(null, monitor.id) : createMonitor;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(monitor ? "Monitor updated successfully" : "Monitor created successfully");
      router.push("/dashboard/monitors");
      router.refresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router, monitor]);

  const isQuotaExceeded =
    !monitor && Boolean(usageSummary && usageSummary.monitorsUsed >= usageSummary.monitorsLimit);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 px-1">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Activity className="size-4 text-primary" />
          {monitor ? "Edit Monitor" : "New Monitor Setup"}
        </h3>
        <p className="text-xs text-muted-foreground font-medium">
          {monitor
            ? "Update your monitor configuration and threshold settings"
            : "Configure a new endpoint for continuous global verification"}
        </p>
      </div>

      {isQuotaExceeded && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/30">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-200">Monitor Quota Limit Reached</h4>
              <p className="text-xs text-zinc-300 mt-0.5">
                You have used {usageSummary?.monitorsUsed} of {usageSummary?.monitorsLimit} monitors
                on your {usageSummary?.plan} plan. Hard limits block creating new monitors until you
                upgrade.
              </p>
            </div>
          </div>
          <Link
            href={"/dashboard/settings?tab=billing" as any}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/20 border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-500/30 transition-all shrink-0"
          >
            Upgrade Plan
          </Link>
        </div>
      )}

      <form
        action={formAction}
        className="bg-card border border-border p-6 md:p-8 rounded-xl backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.02)]"
      >
        <div className="flex flex-col gap-6">
          {/* Monitor Type */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Monitor Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <label
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  monitorType === "HTTP"
                    ? "border-primary bg-primary/5 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="HTTP"
                  className="sr-only"
                  checked={monitorType === "HTTP"}
                  onChange={() => setMonitorType("HTTP")}
                />
                <Globe className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">HTTP/HTTPS</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  monitorType === "PING"
                    ? "border-primary bg-primary/5 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="PING"
                  className="sr-only"
                  checked={monitorType === "PING"}
                  onChange={() => setMonitorType("PING")}
                />
                <Activity className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Ping</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  monitorType === "PORT"
                    ? "border-primary bg-primary/5 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="PORT"
                  className="sr-only"
                  checked={monitorType === "PORT"}
                  onChange={() => setMonitorType("PORT")}
                />
                <Server className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Port</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  monitorType === "BROWSER"
                    ? "border-primary bg-primary/5 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="BROWSER"
                  className="sr-only"
                  checked={monitorType === "BROWSER"}
                  onChange={() => setMonitorType("BROWSER")}
                />
                <Chrome className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Browser</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  monitorType === "SEQUENCE"
                    ? "border-primary bg-primary/5 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="SEQUENCE"
                  className="sr-only"
                  checked={monitorType === "SEQUENCE"}
                  onChange={() => setMonitorType("SEQUENCE")}
                />
                <Layers className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Sequence</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  monitorType === "SSL"
                    ? "border-primary bg-primary/5 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="SSL"
                  className="sr-only"
                  checked={monitorType === "SSL"}
                  onChange={() => setMonitorType("SSL")}
                />
                <ShieldCheck className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">SSL/TLS</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  monitorType === "DNS"
                    ? "border-primary bg-primary/5 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="DNS"
                  className="sr-only"
                  checked={monitorType === "DNS"}
                  onChange={() => setMonitorType("DNS")}
                />
                <Server className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">DNS</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  monitorType === "HEARTBEAT"
                    ? "border-primary bg-primary/5 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="HEARTBEAT"
                  className="sr-only"
                  checked={monitorType === "HEARTBEAT"}
                  onChange={() => setMonitorType("HEARTBEAT")}
                />
                <Heart className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Heartbeat</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  monitorType === "GRPC"
                    ? "border-primary bg-primary/5 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="GRPC"
                  className="sr-only"
                  checked={monitorType === "GRPC"}
                  onChange={() => setMonitorType("GRPC")}
                />
                <Radio className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">gRPC</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  monitorType === "SMTP"
                    ? "border-primary bg-primary/5 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="SMTP"
                  className="sr-only"
                  checked={monitorType === "SMTP"}
                  onChange={() => setMonitorType("SMTP")}
                />
                <Mail className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">SMTP</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  monitorType === "FTP"
                    ? "border-primary bg-primary/5 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="FTP"
                  className="sr-only"
                  checked={monitorType === "FTP"}
                  onChange={() => setMonitorType("FTP")}
                />
                <FolderOpen className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">FTP/SFTP</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  monitorType === "ICMP"
                    ? "border-primary bg-primary/5 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="ICMP"
                  className="sr-only"
                  checked={monitorType === "ICMP"}
                  onChange={() => setMonitorType("ICMP")}
                />
                <Wifi className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">ICMP</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer ${
                  monitorType === "MAIL"
                    ? "border-primary bg-primary/5 text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                    : "border-border bg-card text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value="MAIL"
                  className="sr-only"
                  checked={monitorType === "MAIL"}
                  onChange={() => setMonitorType("MAIL")}
                />
                <Inbox className="size-5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">IMAP/POP3</span>
              </label>
            </div>
          </div>

          {/* Friendly Name */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Friendly Name
            </label>
            <input
              name="name"
              required
              defaultValue={monitor?.name}
              className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full"
              type="text"
              placeholder={monitorType === "HTTP" ? "e.g. Production API" : "e.g. Game Server"}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Tags (Comma separated)
            </label>
            <input
              name="tags"
              defaultValue={monitor?.tags?.join(", ")}
              className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full font-mono"
              type="text"
              placeholder="e.g. production, api, web"
            />
          </div>

          {/* Target Host */}
          {monitorType !== "HEARTBEAT" ? (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {monitorType === "HTTP" ||
                monitorType === "BROWSER" ||
                monitorType === "SSL" ||
                monitorType === "DNS"
                  ? "Target URL / Domain"
                  : monitorType === "GRPC" || monitorType === "SMTP" || monitorType === "FTP" || monitorType === "MAIL"
                    ? "Server Host"
                    : "Hostname / IP"}
              </label>
              <div className="flex gap-4">
                <input
                  name="url"
                  required
                  defaultValue={initialUrl}
                  className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full"
                  type="text"
                  placeholder={
                    monitorType === "HTTP" || monitorType === "BROWSER"
                      ? "https://example.com"
                      : monitorType === "SSL" || monitorType === "DNS"
                        ? "example.com or https://example.com"
                        : monitorType === "GRPC"
                          ? "grpc.example.com:50051"
                          : monitorType === "SMTP"
                            ? "smtp.example.com:587"
                            : monitorType === "FTP"
                              ? "ftp.example.com:21"
                              : monitorType === "MAIL"
                                ? "imap.example.com:143"
                                : "192.168.1.1 or example.com"
                  }
                />
                {monitorType === "PORT" && (
                  <div className="w-32">
                    <input
                      name="port"
                      required
                      defaultValue={initialPort}
                      className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full"
                      type="number"
                      placeholder="8080"
                      min="1"
                      max="65535"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <input type="hidden" name="url" value={monitor?.url || "heartbeat://placeholder"} />

              {monitor ? (
                <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary animate-pulse"></div>
                  <label className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Heartbeat Webhook URL
                  </label>
                  <div className="flex gap-2 items-center mt-1">
                    <input
                      type="text"
                      readOnly
                      value={
                        typeof window !== "undefined"
                          ? `${window.location.origin}/api/heartbeat/${monitor.heartbeatToken}`
                          : `/api/heartbeat/${monitor.heartbeatToken}`
                      }
                      className="bg-zinc-950 border border-primary/10 text-xs font-mono rounded-lg p-3 text-foreground focus:outline-none transition-all w-full select-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url =
                          typeof window !== "undefined"
                            ? `${window.location.origin}/api/heartbeat/${monitor.heartbeatToken}`
                            : `/api/heartbeat/${monitor.heartbeatToken}`;
                        navigator.clipboard.writeText(url);
                        toast.success("Webhook URL copied to clipboard");
                      }}
                      className="min-h-[44px] px-4 rounded-lg border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary font-mono text-[10px] uppercase tracking-wider flex items-center justify-center transition-colors font-bold whitespace-nowrap"
                    >
                      Copy URL
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-2.5">
                    💡 Send a GET or POST request to this URL from your script or cron job at least
                    once every check interval.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 rounded-xl border border-dashed border-primary/20 bg-primary/5 p-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20"></div>
                  <label className="text-[10px] font-bold text-primary uppercase tracking-wider">
                    Heartbeat Webhook URL
                  </label>
                  <p className="text-xs text-primary/80 leading-relaxed font-mono">
                    Your unique heartbeat webhook URL will be generated immediately once you create
                    this monitor.
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-1.5">
                    💡 You will be able to view and copy the webhook URL from the monitor dashboard
                    or settings view.
                  </p>
                </div>
              )}
            </>
          )}

          {/* HTTP Advanced Config */}
          {monitorType === "HTTP" && (
            <div className="flex flex-col gap-5 border-l border-border pl-6 py-1">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  HTTP Method
                </label>
                <div className="relative group/select">
                  <select
                    name="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 pr-10 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full appearance-none cursor-pointer"
                  >
                    {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].map((m) => (
                      <option key={m} value={m} className="bg-popover text-foreground">
                        {m}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute top-3.5 right-3 size-3.5 text-muted-foreground/60 pointer-events-none group-focus-within/select:text-foreground transition-colors" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Custom Headers
                  </label>
                  <button
                    type="button"
                    onClick={addHeader}
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider transition-all cursor-pointer"
                  >
                    + Add Header
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {headersList.map((header, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        placeholder="Key"
                        value={header.key}
                        onChange={(e) => updateHeader(index, "key", e.target.value)}
                        className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-2.5 text-foreground focus:outline-none flex-1"
                      />
                      <input
                        placeholder="Value"
                        value={header.value}
                        onChange={(e) => updateHeader(index, "value", e.target.value)}
                        className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-2.5 text-foreground focus:outline-none flex-1"
                      />
                      {headersList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHeader(index)}
                          className="p-2 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <input
                  type="hidden"
                  name="headers"
                  value={JSON.stringify(headersList.filter((h) => h.key || h.value))}
                />
              </div>

              {["POST", "PUT", "PATCH"].includes(method) && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Request Body
                  </label>
                  <textarea
                    name="body"
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full min-h-[100px] resize-y"
                    placeholder='{"key": "value"}'
                  />
                </div>
              )}

              {/* Response Validation Expectations */}
              <div className="h-px bg-border my-4"></div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-primary animate-pulse" />
                    Response Validation (Expectations)
                  </label>
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase mt-0.5 tracking-wider">
                    Verify response payloads and match custom content expectations
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Expected String (Optional)
                    </label>
                    <input
                      type="text"
                      value={expectedString}
                      onChange={(e) => setExpectedString(e.target.value)}
                      className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full"
                      placeholder="e.g. Success, Welcome, etc."
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Forbidden String (Optional)
                    </label>
                    <input
                      type="text"
                      value={forbiddenString}
                      onChange={(e) => setForbiddenString(e.target.value)}
                      className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full"
                      placeholder="e.g. Error, Failed, etc."
                    />
                  </div>
                </div>

                {/* JSON Path Assertions List */}
                <div className="flex flex-col gap-2.5 mt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      JSON Path Assertions
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setJsonAssertions([
                          ...jsonAssertions,
                          {
                            path: "$.status",
                            operator: "==",
                            value: "healthy",
                          },
                        ]);
                      }}
                      className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="size-3" /> Add JSON Assertion
                    </button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {jsonAssertions.map((assertion, index) => (
                      <div
                        key={index}
                        className="flex gap-2 items-center animate-in fade-in duration-200"
                      >
                        <input
                          placeholder="JSON Path (e.g. $.status)"
                          value={assertion.path}
                          onChange={(e) => {
                            const newAssertions = [...jsonAssertions];
                            newAssertions[index].path = e.target.value;
                            setJsonAssertions(newAssertions);
                          }}
                          className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-2.5 text-foreground focus:outline-none flex-1"
                        />
                        <div className="relative group/select w-28">
                          <select
                            value={assertion.operator}
                            onChange={(e) => {
                              const newAssertions = [...jsonAssertions];
                              newAssertions[index].operator = e.target.value;
                              setJsonAssertions(newAssertions);
                            }}
                            className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-2.5 pr-8 text-foreground focus:outline-none w-full appearance-none cursor-pointer"
                          >
                            <option value="==">==</option>
                            <option value="!=">!=</option>
                            <option value="contains">contains</option>
                            <option value="not_contains">not_contains</option>
                          </select>
                          <ChevronDown className="absolute top-3 right-2.5 size-3.5 text-muted-foreground/60 pointer-events-none" />
                        </div>
                        <input
                          placeholder="Expected Value"
                          value={assertion.value}
                          onChange={(e) => {
                            const newAssertions = [...jsonAssertions];
                            newAssertions[index].value = e.target.value;
                            setJsonAssertions(newAssertions);
                          }}
                          className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-2.5 text-foreground focus:outline-none flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setJsonAssertions(jsonAssertions.filter((_, i) => i !== index));
                          }}
                          className="p-2 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <input
                type="hidden"
                name="expectation"
                value={JSON.stringify({
                  body_contains: expectedString || undefined,
                  body_excludes: forbiddenString || undefined,
                  json_assertions: jsonAssertions
                    .filter((a) => a.path)
                    .map((a) => ({
                      path: a.path,
                      operator: a.operator,
                      value: a.value,
                    })),
                  max_body_size_bytes: maxBodySize ? Number(maxBodySize) : undefined,
                  min_body_size_bytes: minBodySize ? Number(minBodySize) : undefined,
                })}
              />
            </div>
          )}

          {/* HTTP Response Size + mTLS Config */}
          {monitorType === "HTTP" && (
            <div className="flex flex-col gap-5 border-l border-border pl-6 py-1 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary animate-pulse" />
                  Response Size Alerts (Optional)
                </label>
                <p className="text-[9px] text-muted-foreground font-semibold uppercase mt-0.5 tracking-wider">
                  Alert when the response body crosses a size threshold in bytes
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Max Size (Bytes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxBodySize}
                    onChange={(e) => setMaxBodySize(e.target.value)}
                    placeholder="e.g. 1048576 (1 MB)"
                    className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full font-mono"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Min Size (Bytes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={minBodySize}
                    onChange={(e) => setMinBodySize(e.target.value)}
                    placeholder="e.g. 100 — flags empty/error pages"
                    className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Client Certificate (mTLS)
                </label>
                {hasClientCert && (
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-emerald-500">
                    Certificate configured — leave blank to keep, or replace below
                  </p>
                )}
                <textarea
                  value={clientCertPem}
                  onChange={(e) => setClientCertPem(e.target.value)}
                  placeholder={"-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----"}
                  rows={3}
                  className="bg-accent/30 border border-border focus:border-primary/20 text-[10px] font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full font-mono resize-none"
                />
                <textarea
                  value={clientKeyPem}
                  onChange={(e) => setClientKeyPem(e.target.value)}
                  placeholder={"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"}
                  rows={3}
                  className="bg-accent/30 border border-border focus:border-primary/20 text-[10px] font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full font-mono resize-none"
                />
                {/* Only post cert fields when the user entered a replacement,
                    so untouched edits keep the stored certificate. */}
                {clientCertPem && (
                  <input type="hidden" name="clientCertPem" value={clientCertPem} />
                )}
                {clientKeyPem && (
                  <input type="hidden" name="clientKeyPem" value={clientKeyPem} />
                )}
                {hasClientCert && (
                  <label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={removeClientCert}
                      onChange={(e) => setRemoveClientCert(e.target.checked)}
                      className="size-3 accent-red-500"
                    />
                    Remove stored certificate
                  </label>
                )}
                <input
                  type="hidden"
                  name="removeClientCert"
                  value={removeClientCert ? "1" : ""}
                />
              </div>
            </div>
          )}

          {/* DNS Advanced Config */}
          {monitorType === "DNS" && (
            <div className="flex flex-col gap-5 border-l border-border pl-6 py-1 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Expected IP Addresses (Optional)
                </label>
                <input
                  type="text"
                  value={expectedIPs}
                  onChange={(e) => setExpectedIPs(e.target.value)}
                  placeholder="e.g. 1.1.1.1, 8.8.8.8"
                  className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full"
                />
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5 animate-pulse">
                  Enter comma-separated IP addresses that this domain is expected to resolve to.
                  Leave blank to accept any resolution.
                </p>
              </div>

              <input
                type="hidden"
                name="expectation"
                value={JSON.stringify({
                  expectedIPs: expectedIPs
                    ? expectedIPs
                        .split(",")
                        .map((ip) => ip.trim())
                        .filter(Boolean)
                    : [],
                })}
              />
            </div>
          )}

          {/* Protocol Config (gRPC / SMTP / FTP / ICMP / MAIL) */}
          {isProtocolType && (
            <div className="flex flex-col gap-5 border-l border-border pl-6 py-1 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary animate-pulse" />
                  {monitorType === "GRPC" ? "gRPC Health Check" : monitorType === "SMTP" ? "SMTP Handshake" : monitorType === "FTP" ? "File Server Availability" : monitorType === "ICMP" ? "ICMP Echo" : "Mail Server Check"}
                </label>
                <p className="text-[9px] text-muted-foreground font-semibold uppercase mt-0.5 tracking-wider">
                  {monitorType === "GRPC" && "Verifies grpc.health.v1.Health/Check returns SERVING"}
                  {monitorType === "SMTP" && "EHLO handshake with optional AUTH verification"}
                  {monitorType === "FTP" && "Banner + login readiness (SFTP verifies SSH banner)"}
                  {monitorType === "ICMP" && "True ICMP echo on Node probes, TCP fallback on edge"}
                  {monitorType === "MAIL" && "IMAP/POP3 greeting + capability/LOGIN verification"}
                </p>
              </div>

              {monitorType === "GRPC" && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Service Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={grpcServiceName}
                    onChange={(e) => setGrpcServiceName(e.target.value)}
                    placeholder="e.g. my.service.v1 — blank checks server overall health"
                    className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full font-mono"
                  />
                  <input
                    type="hidden"
                    name="expectation"
                    value={JSON.stringify({ serviceName: grpcServiceName || undefined })}
                  />
                </div>
              )}

              {(monitorType === "SMTP" || monitorType === "FTP" || monitorType === "MAIL") && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Username (Optional)
                    </label>
                    <input
                      type="text"
                      value={protocolUsername}
                      onChange={(e) => setProtocolUsername(e.target.value)}
                      placeholder={monitorType === "FTP" ? "anonymous" : "user@example.com"}
                      className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={protocolPassword}
                      onChange={(e) => setProtocolPassword(e.target.value)}
                      placeholder={hasProtocolCredentials ? "Stored — leave blank to keep" : "Leave blank to skip AUTH"}
                      className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full"
                    />
                  </div>
                  {/* Secrets stay server-side: credentials are only posted when
                      the user typed a username (password optional — blank keeps
                      the stored one), so untouched edits never wipe them. */}
                  {protocolUsername && (
                    <input
                      type="hidden"
                      name="headers"
                      value={JSON.stringify({
                        username: protocolUsername,
                        password: protocolPassword || undefined,
                      })}
                    />
                  )}
                  {hasProtocolCredentials && (
                    <label className="col-span-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={removeProtocolCredentials}
                        onChange={(e) => setRemoveProtocolCredentials(e.target.checked)}
                        className="size-3 accent-red-500"
                      />
                      Remove stored credentials
                    </label>
                  )}
                  <input
                    type="hidden"
                    name="removeProtocolCredentials"
                    value={removeProtocolCredentials ? "1" : ""}
                  />
                </div>
              )}
            </div>
          )}

          {/* BROWSER Steps Builder */}
          {monitorType === "BROWSER" && (
            <div className="flex flex-col gap-5 border-l border-border pl-6 py-1 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Browser Steps Script
                  </label>
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase mt-0.5 tracking-wider">
                    Configure sequential browser commands to execute
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addStep}
                  className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="size-3" /> Add Step
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 p-4 border border-border bg-accent/10 rounded-xl relative group/step"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Step {index + 1}
                      </span>
                      {steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeStep(index)}
                          className="p-1 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Action selector */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                          Action
                        </label>
                        <div className="relative group/select">
                          <select
                            value={step.action}
                            onChange={(e) => updateStep(index, "action", e.target.value)}
                            className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-2.5 pr-8 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full appearance-none cursor-pointer"
                          >
                            <option value="goto">GOTO (Navigate)</option>
                            <option value="click">CLICK (Selector)</option>
                            <option value="fill">FILL (Input selector & value)</option>
                            <option value="wait">WAIT (Selector or ms)</option>
                            <option value="assert_text">ASSERT TEXT (Check text)</option>
                          </select>
                          <ChevronDown className="absolute top-3 right-2.5 size-3.5 text-muted-foreground/60 pointer-events-none" />
                        </div>
                      </div>

                      {/* Selector field (only if clicked, typed, or wait on selector) */}
                      {["click", "fill", "wait"].includes(step.action) && (
                        <div className="flex flex-col gap-1.5 col-span-2">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            CSS Selector
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. #login-button or input[name='username']"
                            value={step.selector}
                            onChange={(e) => updateStep(index, "selector", e.target.value)}
                            className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-2.5 text-foreground focus:outline-none w-full"
                          />
                        </div>
                      )}

                      {/* Value field (only if goto, fill, wait ms, or assert_text) */}
                      {["goto", "fill", "wait", "assert_text"].includes(step.action) && (
                        <div
                          className={`flex flex-col gap-1.5 ${
                            ["click", "fill", "wait"].includes(step.action)
                              ? "col-span-3"
                              : "col-span-2"
                          }`}
                        >
                          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                            {step.action === "goto"
                              ? "URL"
                              : step.action === "wait"
                                ? "Time (ms)"
                                : step.action === "assert_text"
                                  ? "Expected Text"
                                  : "Value"}
                          </label>
                          <input
                            type="text"
                            placeholder={
                              step.action === "goto"
                                ? "https://example.com"
                                : step.action === "wait"
                                  ? "2000"
                                  : step.action === "assert_text"
                                    ? "Welcome back!"
                                    : "e.g. text to type"
                            }
                            value={step.value}
                            onChange={(e) => updateStep(index, "value", e.target.value)}
                            className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-2.5 text-foreground focus:outline-none w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <input type="hidden" name="script" value={JSON.stringify(steps)} />
            </div>
          )}

          {/* SEQUENCE Steps Builder */}
          {monitorType === "SEQUENCE" && (
            <div className="flex flex-col gap-6 border-l border-border pl-6 py-1 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    API Request Chain Steps
                  </label>
                  <p className="text-[9px] text-muted-foreground font-semibold uppercase mt-0.5 tracking-wider">
                    Configure chained HTTP requests. Values starting with slash / append to the
                    Target URL.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSequenceStep}
                  className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="size-3" /> Add Request Step
                </button>
              </div>

              <div className="flex flex-col gap-5">
                {sequenceSteps.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex flex-col gap-4 p-5 border border-border bg-accent/5 rounded-xl relative group/step animate-in fade-in slide-in-from-left-2"
                  >
                    {/* Step Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center size-5 bg-primary/10 text-primary rounded-full text-[10px] font-extrabold">
                          {sIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={step.name}
                          onChange={(e) => updateSequenceStep(sIdx, { name: e.target.value })}
                          placeholder={`e.g. Login User`}
                          className="bg-transparent border-b border-transparent hover:border-muted-foreground/20 focus:border-primary text-xs font-bold text-foreground focus:outline-none py-0.5 px-1 min-w-[150px]"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 opacity-60 group-hover/step:opacity-100 transition-opacity">
                        <button
                          type="button"
                          disabled={sIdx === 0}
                          onClick={() => moveSequenceStep(sIdx, "up")}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          <ArrowUp className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={sIdx === sequenceSteps.length - 1}
                          onClick={() => moveSequenceStep(sIdx, "down")}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                        >
                          <ArrowDown className="size-3.5" />
                        </button>
                        {sequenceSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSequenceStep(sIdx)}
                            className="p-1 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer ml-1"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-3">
                      {/* Method selector */}
                      <div className="flex flex-col gap-1.5 col-span-2">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                          Method
                        </label>
                        <div className="relative group/select">
                          <select
                            value={step.method}
                            onChange={(e) =>
                              updateSequenceStep(sIdx, {
                                method: e.target.value,
                              })
                            }
                            className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-2.5 pr-8 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full appearance-none cursor-pointer"
                          >
                            {["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"].map((m) => (
                              <option key={m} value={m} className="bg-popover text-foreground">
                                {m}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute top-3 right-2.5 size-3.5 text-muted-foreground/60 pointer-events-none" />
                        </div>
                      </div>

                      {/* URL path / value */}
                      <div className="flex flex-col gap-1.5 col-span-4">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                          Endpoint / Path
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. /api/v1/auth/login or {{custom_url}}"
                          value={step.url}
                          onChange={(e) => updateSequenceStep(sIdx, { url: e.target.value })}
                          className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-2.5 text-foreground focus:outline-none w-full"
                        />
                      </div>
                    </div>

                    {/* Step Headers */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                          Step Headers
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newHeaders = [...(step.headers || []), { key: "", value: "" }];
                            updateSequenceStep(sIdx, { headers: newHeaders });
                          }}
                          className="text-[9px] font-bold text-primary hover:underline uppercase tracking-wider transition-all cursor-pointer"
                        >
                          + Add Step Header
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {(step.headers || []).map((h, hIdx) => (
                          <div key={hIdx} className="flex gap-2">
                            <input
                              placeholder="Key"
                              value={h.key}
                              onChange={(e) => {
                                const newHeaders = [...(step.headers || [])];
                                newHeaders[hIdx].key = e.target.value;
                                updateSequenceStep(sIdx, {
                                  headers: newHeaders,
                                });
                              }}
                              className="bg-accent/30 border border-border focus:border-primary/20 text-[11px] font-semibold rounded-lg p-2 text-foreground focus:outline-none flex-1"
                            />
                            <input
                              placeholder="Value (e.g. Bearer {{token}})"
                              value={h.value}
                              onChange={(e) => {
                                const newHeaders = [...(step.headers || [])];
                                newHeaders[hIdx].value = e.target.value;
                                updateSequenceStep(sIdx, {
                                  headers: newHeaders,
                                });
                              }}
                              className="bg-accent/30 border border-border focus:border-primary/20 text-[11px] font-semibold rounded-lg p-2 text-foreground focus:outline-none flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newHeaders = (step.headers || []).filter(
                                  (_, idx) => idx !== hIdx,
                                );
                                updateSequenceStep(sIdx, {
                                  headers: newHeaders,
                                });
                              }}
                              className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step Body */}
                    {["POST", "PUT", "PATCH", "DELETE"].includes(step.method.toUpperCase()) && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                          Request Body (JSON / text)
                        </label>
                        <textarea
                          placeholder='{"username": "admin", "password": "{{admin_password}}"}'
                          value={step.body}
                          onChange={(e) => updateSequenceStep(sIdx, { body: e.target.value })}
                          className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full min-h-[70px] resize-y animate-in fade-in duration-200"
                        />
                      </div>
                    )}

                    {/* Step Assertions */}
                    <div className="flex flex-col gap-2 border-t border-border/50 pt-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                          Response Assertions
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newAssertions = [
                              ...(step.assertions || []),
                              { type: "status_code", path: "", value: "200" },
                            ];
                            updateSequenceStep(sIdx, {
                              assertions: newAssertions,
                            });
                          }}
                          className="text-[9px] font-bold text-primary hover:underline uppercase tracking-wider transition-all cursor-pointer"
                        >
                          + Add Assertion
                        </button>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        {(step.assertions || []).map((ast, aIdx) => (
                          <div
                            key={aIdx}
                            className="grid grid-cols-12 gap-2 items-center animate-in fade-in duration-200"
                          >
                            <div className="col-span-4 relative group/select">
                              <select
                                value={ast.type}
                                onChange={(e) => {
                                  const newAssertions = [...(step.assertions || [])];
                                  newAssertions[aIdx].type = e.target.value as any;
                                  updateSequenceStep(sIdx, {
                                    assertions: newAssertions,
                                  });
                                }}
                                className="bg-accent/30 border border-border focus:border-primary/20 text-[11px] font-semibold rounded-lg p-2 pr-7 text-foreground focus:outline-none w-full appearance-none cursor-pointer"
                              >
                                <option value="status_code" className="bg-popover text-foreground">
                                  Status Code
                                </option>
                                <option
                                  value="body_contains"
                                  className="bg-popover text-foreground"
                                >
                                  Body Contains
                                </option>
                                <option value="json_path" className="bg-popover text-foreground">
                                  JSON Path
                                </option>
                              </select>
                              <ChevronDown className="absolute top-2.5 right-2 size-3 text-muted-foreground/60 pointer-events-none" />
                            </div>
                            <div
                              className={`${ast.type === "json_path" ? "col-span-3" : "hidden"}`}
                            >
                              <input
                                placeholder="JSON path (e.g. data.id)"
                                value={ast.path}
                                onChange={(e) => {
                                  const newAssertions = [...(step.assertions || [])];
                                  newAssertions[aIdx].path = e.target.value;
                                  updateSequenceStep(sIdx, {
                                    assertions: newAssertions,
                                  });
                                }}
                                className="bg-accent/30 border border-border focus:border-primary/20 text-[11px] font-semibold rounded-lg p-2 text-foreground focus:outline-none w-full"
                              />
                            </div>
                            <div
                              className={`${ast.type === "json_path" ? "col-span-4" : "col-span-7"}`}
                            >
                              <input
                                placeholder="Expected value (e.g. 200 or true)"
                                value={ast.value}
                                onChange={(e) => {
                                  const newAssertions = [...(step.assertions || [])];
                                  newAssertions[aIdx].value = e.target.value;
                                  updateSequenceStep(sIdx, {
                                    assertions: newAssertions,
                                  });
                                }}
                                className="bg-accent/30 border border-border focus:border-primary/20 text-[11px] font-semibold rounded-lg p-2 text-foreground focus:outline-none w-full"
                              />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const newAssertions = (step.assertions || []).filter(
                                    (_, idx) => idx !== aIdx,
                                  );
                                  updateSequenceStep(sIdx, {
                                    assertions: newAssertions,
                                  });
                                }}
                                className="p-1 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Step Extractions */}
                    <div className="flex flex-col gap-2 border-t border-border/50 pt-3">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                          Context Variable Extractions
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newExtractions = [
                              ...(step.extractions || []),
                              { name: "", source: "body", path: "" },
                            ];
                            updateSequenceStep(sIdx, {
                              extractions: newExtractions,
                            });
                          }}
                          className="text-[9px] font-bold text-primary hover:underline uppercase tracking-wider transition-all cursor-pointer"
                        >
                          + Add Extraction
                        </button>
                      </div>
                      <div className="flex flex-col gap-2.5">
                        {(step.extractions || []).map((ext, eIdx) => (
                          <div
                            key={eIdx}
                            className="grid grid-cols-12 gap-2 items-center animate-in fade-in duration-200"
                          >
                            <div className="col-span-3">
                              <input
                                placeholder="Var Name"
                                value={ext.name}
                                onChange={(e) => {
                                  const newExtractions = [...(step.extractions || [])];
                                  newExtractions[eIdx].name = e.target.value;
                                  updateSequenceStep(sIdx, {
                                    extractions: newExtractions,
                                  });
                                }}
                                className="bg-accent/30 border border-border focus:border-primary/20 text-[11px] font-semibold rounded-lg p-2 text-foreground focus:outline-none w-full"
                              />
                            </div>
                            <div className="col-span-3 relative group/select">
                              <select
                                value={ext.source}
                                onChange={(e) => {
                                  const newExtractions = [...(step.extractions || [])];
                                  newExtractions[eIdx].source = e.target.value as any;
                                  updateSequenceStep(sIdx, {
                                    extractions: newExtractions,
                                  });
                                }}
                                className="bg-accent/30 border border-border focus:border-primary/20 text-[11px] font-semibold rounded-lg p-2 pr-7 text-foreground focus:outline-none w-full appearance-none cursor-pointer"
                              >
                                <option value="body" className="bg-popover text-foreground">
                                  JSON Body
                                </option>
                                <option value="header" className="bg-popover text-foreground">
                                  Header
                                </option>
                              </select>
                              <ChevronDown className="absolute top-2.5 right-2 size-3 text-muted-foreground/60 pointer-events-none" />
                            </div>
                            <div className="col-span-5">
                              <input
                                placeholder={
                                  ext.source === "body"
                                    ? "dot.path.key"
                                    : "header-key (e.g. Set-Cookie)"
                                }
                                value={ext.path}
                                onChange={(e) => {
                                  const newExtractions = [...(step.extractions || [])];
                                  newExtractions[eIdx].path = e.target.value;
                                  updateSequenceStep(sIdx, {
                                    extractions: newExtractions,
                                  });
                                }}
                                className="bg-accent/30 border border-border focus:border-primary/20 text-[11px] font-semibold rounded-lg p-2 text-foreground focus:outline-none w-full"
                              />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const newExtractions = (step.extractions || []).filter(
                                    (_, idx) => idx !== eIdx,
                                  );
                                  updateSequenceStep(sIdx, {
                                    extractions: newExtractions,
                                  });
                                }}
                                className="p-1 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <input type="hidden" name="script" value={JSON.stringify(sequenceSteps)} />
            </div>
          )}

          {/* Region Selector */}
          {monitorType !== "HEARTBEAT" ? (
            <>
              <RegionSelector selectedRegions={selectedRegions} onChange={setSelectedRegions} />

              {/* Alert Threshold */}
              {selectedRegions.length > 0 && (
                <div className="flex flex-col gap-2.5 p-5 border border-border bg-accent/30 rounded-xl">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Alert Threshold
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      name="alertThreshold"
                      type="number"
                      min="1"
                      max={selectedRegions.length}
                      value={threshold}
                      onChange={(e) => setThreshold(parseInt(e.target.value) || 1)}
                      className="bg-card border border-border focus:border-primary/20 text-xs font-bold rounded-lg p-2 w-20 text-center text-foreground focus:outline-none"
                    />
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider leading-relaxed">
                      Only alert when at least{" "}
                      <span className="text-foreground font-extrabold">{threshold}</span> regions
                      are down
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <input type="hidden" name="checkRegions" value="[]" />
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Check Interval
            </label>
            <div className="relative group/select">
              <Clock className="absolute top-3.5 left-3 size-4 text-muted-foreground/60 pointer-events-none group-focus-within/select:text-foreground transition-colors" />
              <select
                name="interval"
                defaultValue={monitor?.interval}
                className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 pl-10 pr-10 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full appearance-none cursor-pointer"
              >
                <option value="30" className="bg-popover text-foreground">
                  30 Seconds
                </option>
                <option value="60" className="bg-popover text-foreground">
                  1 Minute
                </option>
                <option value="300" className="bg-popover text-foreground">
                  5 Minutes
                </option>
                <option value="600" className="bg-popover text-foreground">
                  10 Minutes
                </option>
              </select>
              <ChevronDown className="absolute top-3.5 right-3 size-3.5 text-muted-foreground/60 pointer-events-none group-focus-within/select:text-foreground transition-colors" />
            </div>
          </div>

          {/* Runbook Url */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Remediation Runbook (Optional)
              </label>
              <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
                Attach playbook or documentation link
              </p>
            </div>
            <div className="relative group/input">
              <Book className="absolute top-3.5 left-3 size-4 text-muted-foreground/60 pointer-events-none group-focus-within/input:text-foreground transition-colors" />
              <input
                name="runbookUrl"
                value={runbookUrl}
                onChange={(e) => setRunbookUrl(e.target.value)}
                className="bg-accent/30 border border-border focus:border-primary/20 text-xs font-semibold rounded-lg p-3 pl-10 text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/10 transition-all w-full"
                type="url"
                placeholder="https://docs.company.com/runbooks/api-monitoring"
              />
            </div>
          </div>

          <div className="h-px bg-border my-2"></div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/dashboard/monitors"
              className="px-4 py-2 border border-border text-muted-foreground hover:text-foreground hover:bg-accent text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <X className="size-3.5" /> Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending || isQuotaExceeded}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              {monitor ? "Save Changes" : "Create Monitor"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
