"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Layers,
  Sparkles,
  Download,
  ShieldCheck,
} from "lucide-react";
import { bulkImportClients, type BulkClientImportRow } from "@/actions/clients";
import { useRouter } from "next/navigation";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_CSV = `Client Name, Domain, SLA Tier, Contact Email
Acme Corporation, acme.com, 99.9%, dev@acme.com
Globex Digital, https://globex.io, 99.95%, it@globex.io
Starlight Boutique, starlight.shop, 99.9%, hello@starlight.shop
Nexus Logistics, nexuslogistics.net, 99.99%, ops@nexuslogistics.net`;

export function BulkImportModal({ isOpen, onClose }: BulkImportModalProps) {
  const router = useRouter();
  const [csvText, setCsvText] = useState("");
  const [autoProvisionMonitors, setAutoProvisionMonitors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    createdClients?: number;
    createdMonitors?: number;
    skippedDueToLimit?: number;
    error?: string;
    errors?: string[];
  } | null>(null);

  if (!isOpen) return null;

  // Simple CSV line parser
  const parsedRows: BulkClientImportRow[] = csvText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .filter((line, index) => {
      // Filter out header line if present
      if (index === 0 && line.toLowerCase().includes("client name")) return false;
      return true;
    })
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
      return {
        name: parts[0] || "",
        domain: parts[1] || "",
        slaTier: parts[2] || "",
        contactEmail: parts[3] || "",
        createMonitors: autoProvisionMonitors,
      };
    })
    .filter((r) => r.name.length > 0 || r.domain.length > 0);

  const validRows = parsedRows.filter((r) => r.name.trim() && r.domain.trim());

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "steadystack-clients-sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await bulkImportClients(
        validRows.map((r) => ({
          ...r,
          createMonitors: autoProvisionMonitors,
        })),
      );

      if (res.success) {
        setResult(res);
        router.refresh();
      } else {
        setResult({ success: false, error: res.error });
      }
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Failed to import clients",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Upload className="size-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Bulk Import Clients</h2>
              <p className="text-xs text-muted-foreground">
                Import 10 to 100+ client domains via CSV in seconds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Result state */}
          {result && (
            <div
              className={`p-4 rounded-xl border text-sm ${
                result.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}
            >
              <div className="flex items-start gap-2.5">
                {result.success ? (
                  <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="size-5 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">
                    {result.success ? "Bulk Import Completed!" : "Import Failed"}
                  </p>
                  {result.success && (
                    <p className="text-xs text-muted-foreground">
                      Successfully created{" "}
                      <span className="font-mono font-bold text-foreground">
                        {result.createdClients}
                      </span>{" "}
                      client workspace(s) and provisioned{" "}
                      <span className="font-mono font-bold text-foreground">
                        {result.createdMonitors}
                      </span>{" "}
                      monitor(s).
                      {result.skippedDueToLimit
                        ? ` (${result.skippedDueToLimit} skipped due to plan client limits)`
                        : ""}
                    </p>
                  )}
                  {result.error && <p className="text-xs">{result.error}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Instructions & Template */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/30 text-xs">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary shrink-0" />
              <span className="text-muted-foreground">
                Format:{" "}
                <code className="text-foreground font-mono">
                  Client Name, Domain/URL, SLA Tier, Email
                </code>
              </span>
            </div>
            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted font-medium text-xs transition-colors shrink-0"
            >
              <Download className="size-3 text-muted-foreground" />
              <span>Sample CSV</span>
            </button>
          </div>

          {/* Text Area & File Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider font-mono text-muted-foreground">
                Paste CSV or List of Domains
              </label>
              <label className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer">
                <Upload className="size-3" />
                <span>Upload .csv file</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`Acme Corp, acme.com, 99.9%, dev@acme.com\nGlobex Digital, globex.io, 99.95%, dev@globex.io`}
              rows={6}
              className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>

          {/* Options */}
          <div className="p-3.5 rounded-xl border border-border/60 bg-card space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoProvisionMonitors}
                onChange={(e) => setAutoProvisionMonitors(e.target.checked)}
                className="size-4 rounded border-border text-primary focus:ring-primary accent-primary"
              />
              <div className="text-xs">
                <span className="font-semibold text-foreground">
                  Automatically provision HTTP + SSL monitors
                </span>
                <p className="text-muted-foreground text-[11px]">
                  Creates a 60-second HTTP uptime check and a daily SSL certificate expiry monitor
                  for each domain.
                </p>
              </div>
            </label>
          </div>

          {/* Parsing preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold font-mono text-muted-foreground uppercase">
                  Detected Entries ({validRows.length} valid)
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto rounded-xl border border-border/80 divide-y divide-border/40 text-xs">
                {parsedRows.map((row, idx) => {
                  const isValid = row.name.trim() && row.domain.trim();
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-2.5 ${
                        isValid ? "bg-card" : "bg-destructive/5 text-destructive"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {isValid ? (
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertCircle className="size-3.5 text-destructive shrink-0" />
                        )}
                        <span className="font-semibold text-foreground truncate">
                          {row.name || "Missing Name"}
                        </span>
                        <span className="text-muted-foreground font-mono text-[11px] truncate">
                          ({row.domain || "Missing Domain"})
                        </span>
                      </div>
                      {row.slaTier && (
                        <span className="shrink-0 px-2 py-0.5 rounded bg-muted text-[10px] font-mono text-muted-foreground">
                          {row.slaTier}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/60 px-6 py-4 bg-muted/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleImport}
            disabled={validRows.length === 0 || isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider font-mono hover:bg-primary/90 transition-all shadow disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Importing Fleet...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" />
                <span>
                  Import {validRows.length} Client
                  {validRows.length === 1 ? "" : "s"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
