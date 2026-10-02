"use client";

import { useState, useRef } from "react";
import {
  Download,
  Upload,
  Database,
  Layers,
  Radio,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Terminal,
  FileUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ImportPreview {
  format: string;
  total: number;
  monitors: Array<{
    name: string;
    url: string;
    type: string;
    interval: number;
    action: string;
  }>;
}

export function MigrationForm() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    created?: number;
    updated?: number;
    total?: number;
    error?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async (format: string, filename: string) => {
    setDownloading(format);
    try {
      const response = await fetch(`/api/workspace/export?format=${format}`);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to export workspace data. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportResult(null);
    setImporting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Perform dry-run preview first
      const res = await fetch("/api/workspace/import?dryRun=true", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(data?.error || "Failed to inspect file");
      }

      setImportPreview(data as ImportPreview);
    } catch (err: any) {
      setImportResult({
        success: false,
        error: err.message || "Failed to read backup file",
      });
      setImportPreview(null);
    } finally {
      setImporting(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!importFile) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const res = await fetch("/api/workspace/import", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as any;
      if (!res.ok) {
        throw new Error(data?.error || "Import execution failed");
      }

      setImportResult({
        success: true,
        created: data?.created,
        updated: data?.updated,
        total: data?.total,
      });
      setImportPreview(null);
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setImportResult({
        success: false,
        error: err.message || "Failed to import monitors",
      });
    } finally {
      setImporting(false);
    }
  };

  const exportOptions = [
    {
      id: "json",
      title: "SteadyStack Backup (JSON)",
      description:
        "Complete dataset containing all monitors, alert rules, status pages, and incident templates.",
      icon: Database,
      buttonText: "Export Backup",
      filename: "steadystack-workspace-export.json",
      badge: "Full Dump",
    },
    {
      id: "uptime-kuma",
      title: "Uptime Kuma Backup JSON",
      description:
        "JSON file formatted for direct import into Uptime Kuma to migrate checks instantly.",
      icon: Radio,
      buttonText: "Export for Uptime Kuma",
      filename: "uptime-kuma-import.json",
      badge: "Standard",
    },
    {
      id: "openstatus",
      title: "OpenStatus Config Schema",
      description:
        "Exports all active monitors with default status checks formatted for OpenStatus schema templates.",
      icon: Layers,
      buttonText: "Export for OpenStatus",
      filename: "openstatus-import-config.json",
      badge: "Compatible",
    },
    {
      id: "prometheus",
      title: "Prometheus Blackbox Config (YAML)",
      description:
        "Generates blackbox.yml and prometheus.yml scrape blocks mapping all HTTP/TCP endpoints.",
      icon: FileCode,
      buttonText: "Export scrape config",
      filename: "prometheus-blackbox.yml",
      badge: "YAML Stack",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-serif font-medium text-foreground tracking-tight">
          Migration, Import & Export
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed font-mono">
          SteadyStack runs on a zero-vendor-lock-in philosophy. Seamlessly import from Uptime Kuma,
          dump your full workspace configuration, or export blackbox exporter YAML for self-hosted
          daemons.
        </p>
      </div>

      {/* 1-Step Importer Section */}
      <Card className="border-border bg-card rounded-2xl shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-wider bg-accent/60 text-foreground border-l border-b border-border rounded-bl-xl">
          1-Click Migration
        </div>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-accent border border-border text-foreground">
              <Upload className="size-4" />
            </div>
            <CardTitle className="text-base font-serif font-medium tracking-tight">
              Import from Uptime Kuma or Backup
            </CardTitle>
          </div>
          <CardDescription className="text-xs leading-relaxed text-muted-foreground">
            Drag and drop your Uptime Kuma JSON export file or SteadyStack backup to instantly
            migrate all monitors, check intervals, custom headers, and alert triggers.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".json,application/json"
            className="hidden"
          />

          {!importPreview && !importResult?.success && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-foreground/40 bg-accent/20 hover:bg-accent/40 p-8 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 group"
            >
              <div className="size-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                <FileUp className="size-5" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
                  {importing ? "Reading backup..." : "Click or drag Uptime Kuma JSON export here"}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Supports Uptime Kuma{" "}
                  <code className="text-foreground font-bold">backup.json</code>, OpenStatus JSON,
                  or SteadyStack dumps.
                </p>
              </div>
            </div>
          )}

          {/* Import Preview Table */}
          {importPreview && (
            <div className="space-y-4 border border-border bg-card p-4 rounded-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold font-mono uppercase text-foreground">
                    Detected {importPreview.total} Monitor(s) ({importPreview.format})
                  </h4>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Review parsed endpoints before syncing to your edge cluster.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setImportPreview(null);
                      setImportFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="text-xs font-mono rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleExecuteImport}
                    disabled={importing}
                    className="text-xs font-mono font-bold bg-foreground text-background hover:bg-foreground/90 rounded-xl cursor-pointer"
                  >
                    {importing ? "Importing..." : "Confirm & Import"}
                  </Button>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl border border-border text-[11px] font-mono">
                <table className="w-full text-left">
                  <thead className="bg-muted/40 text-muted-foreground border-b border-border sticky top-0">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Type</th>
                      <th className="p-2">URL / Target</th>
                      <th className="p-2">Interval</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {importPreview.monitors.slice(0, 15).map((m, idx) => (
                      <tr key={idx} className="hover:bg-accent/30">
                        <td className="p-2 font-semibold text-foreground">{m.name}</td>
                        <td className="p-2 text-foreground font-bold">{m.type}</td>
                        <td className="p-2 text-muted-foreground truncate max-w-[200px]">
                          {m.url}
                        </td>
                        <td className="p-2">{m.interval}s</td>
                        <td className="p-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              m.action === "update"
                                ? "bg-amber-500/10 text-amber-700"
                                : "bg-emerald-500/10 text-emerald-700"
                            }`}
                          >
                            {m.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {importPreview.monitors.length > 15 && (
                <p className="text-[10px] text-muted-foreground text-center font-mono">
                  + {importPreview.monitors.length - 15} more monitors ready for import
                </p>
              )}
            </div>
          )}

          {/* Success Banner */}
          {importResult?.success && (
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 flex items-start gap-3">
              <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
                  Migration Complete!
                </h4>
                <p className="text-xs leading-relaxed text-foreground/80">
                  Successfully imported {importResult.total} monitors ({importResult.created}{" "}
                  created, {importResult.updated} updated). All checks are now active on
                  SteadyStack&apos;s multi-region edge consensus engine.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {importResult?.error && (
            <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/5 text-red-700 flex items-start gap-3">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider">
                  Import Failed
                </h4>
                <p className="text-xs leading-relaxed text-foreground/80">{importResult.error}</p>
              </div>
            </div>
          )}

          {/* CLI One-Liner Tip */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Terminal className="size-3.5 text-foreground" />
              <span>
                CLI migration:{" "}
                <code className="text-foreground font-bold">pulse import kuma backup.json</code>
              </span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
              Monitoring as Code
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Exporters Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold font-mono text-foreground uppercase tracking-wider">
          Export Configurations
        </h3>
        <div className="grid md:grid-cols-2 gap-5">
          {exportOptions.map((opt) => {
            const Icon = opt.icon;
            const isCurrent = downloading === opt.id;
            return (
              <Card
                key={opt.id}
                className="relative overflow-hidden border-border bg-card hover:border-border/80 transition-all duration-300 rounded-2xl shadow-xs"
              >
                <div className="absolute top-0 right-0 px-2.5 py-1 text-[8px] font-mono font-bold uppercase tracking-wider bg-accent/60 text-foreground border-l border-b border-border rounded-bl-xl">
                  {opt.badge}
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="p-2 rounded-xl bg-accent border border-border text-foreground">
                      <Icon className="size-4" />
                    </div>
                    <CardTitle className="text-sm font-serif font-medium tracking-tight">
                      {opt.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs leading-relaxed min-h-[40px] text-muted-foreground font-mono">
                    {opt.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleExport(opt.id, opt.filename)}
                    disabled={downloading !== null}
                    variant="outline"
                    className="w-full text-xs font-mono font-bold uppercase tracking-wider py-2 h-auto hover:bg-accent border-border rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    {isCurrent ? (
                      <span className="flex items-center gap-1.5 justify-center">
                        <div className="size-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        Exporting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 justify-center">
                        <Download className="size-3.5 text-muted-foreground" />
                        {opt.buttonText}
                      </span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Migration Guarantee */}
      <Card className="border-border bg-card rounded-2xl shadow-xs">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="p-2.5 rounded-xl bg-accent border border-border text-foreground self-start mt-0.5">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-foreground">
                Migration Guarantee & Zero Lock-In
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-mono">
                All exporter formats generate structural JSON or YAML configurations. SteadyStack
                checks comply with industry monitoring schemas, letting you easily self-host a
                Blackbox exporter daemon, Uptime Kuma instance, or standard container cluster should
                you choose to change platforms.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
