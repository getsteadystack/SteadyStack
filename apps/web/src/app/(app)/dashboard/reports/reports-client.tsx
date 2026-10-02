"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getComprehensiveSlaReport, type SlaReport } from "@/actions/sla-reports";
import { type PlanTier } from "@/lib/billing";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import {
  FileText,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Building2,
  Download,
  Copy,
  Check,
  Layers,
  Monitor as MonitorIcon,
  Globe,
  SlidersHorizontal,
  Loader2,
  Calendar,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ReportsClientProps {
  initialMonitors: any[];
  initialStatusPages: any[];
  initialReport: SlaReport | null;
  userPlan: PlanTier;
}

export function ReportsClient({
  initialMonitors,
  initialStatusPages,
  initialReport,
  userPlan,
}: ReportsClientProps) {
  // Filter States
  const [scope, setScope] = useState<string>("all"); // "all", "monitor:<id>", "status_page:<id>"
  const [range, setRange] = useState<string>("30d"); // "7d", "30d", "90d", "this-month", "last-month", "custom"
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [targetSla, setTargetSla] = useState<number>(99.9);

  // Agency PDF Modal States
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [agencyName, setAgencyName] = useState<string>("");
  const [clientName, setClientName] = useState<string>("");
  const [executiveNotes, setExecutiveNotes] = useState<string>("");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isCopiedApi, setIsCopiedApi] = useState<boolean>(false);

  // Parse scope
  let selectedMonitorId: string | undefined = undefined;
  let selectedStatusPageId: string | undefined = undefined;

  if (scope.startsWith("monitor:")) {
    selectedMonitorId = scope.replace("monitor:", "");
  } else if (scope.startsWith("status_page:")) {
    selectedStatusPageId = scope.replace("status_page:", "");
  }

  // Query Report Data
  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "sla-comprehensive-report",
      selectedMonitorId,
      selectedStatusPageId,
      range,
      startDate,
      endDate,
      targetSla,
    ],
    queryFn: () =>
      getComprehensiveSlaReport({
        monitorId: selectedMonitorId,
        statusPageId: selectedStatusPageId,
        range: range as any,
        startDate: range === "custom" && startDate ? startDate : undefined,
        endDate: range === "custom" && endDate ? endDate : undefined,
        targetSla,
      }),
    initialData:
      scope === "all" && range === "30d" && targetSla === 99.9 && initialReport
        ? initialReport
        : undefined,
  });

  const canExportPdf = isFeatureEnabled(userPlan, "sla_pdf_export");

  // Export handlers
  const handleDownloadCsv = () => {
    const params = new URLSearchParams({
      format: "csv",
      range,
      targetSla: targetSla.toString(),
      ...(selectedMonitorId ? { monitorId: selectedMonitorId } : {}),
      ...(selectedStatusPageId ? { statusPageId: selectedStatusPageId } : {}),
      ...(range === "custom" && startDate ? { from: startDate } : {}),
      ...(range === "custom" && endDate ? { to: endDate } : {}),
    });

    window.location.href = `/api/reports/sla?${params.toString()}`;
    toast.success("CSV export initiated");
  };

  const handleDownloadJson = () => {
    const params = new URLSearchParams({
      format: "json",
      range,
      targetSla: targetSla.toString(),
      ...(selectedMonitorId ? { monitorId: selectedMonitorId } : {}),
      ...(selectedStatusPageId ? { statusPageId: selectedStatusPageId } : {}),
      ...(range === "custom" && startDate ? { from: startDate } : {}),
      ...(range === "custom" && endDate ? { to: endDate } : {}),
    });

    window.location.href = `/api/reports/sla?${params.toString()}`;
    toast.success("JSON export initiated");
  };

  const handleCopyApiUrl = () => {
    const params = new URLSearchParams({
      format: "json",
      range,
      targetSla: targetSla.toString(),
      ...(selectedMonitorId ? { monitorId: selectedMonitorId } : {}),
      ...(selectedStatusPageId ? { statusPageId: selectedStatusPageId } : {}),
    });

    const fullUrl = `${window.location.origin}/api/reports/sla?${params.toString()}`;
    navigator.clipboard.writeText(fullUrl);
    setIsCopiedApi(true);
    toast.success("API Endpoint URL copied to clipboard");
    setTimeout(() => setIsCopiedApi(false), 2000);
  };

  const handleGeneratePdf = async () => {
    if (!canExportPdf) {
      toast.error("SLA PDF Export is an Agency & Pro feature", {
        description: "Please upgrade to Agency or Agency Pro to download branded PDF reports.",
      });
      return;
    }

    try {
      setIsDownloadingPdf(true);
      const params = new URLSearchParams({
        format: "pdf",
        range,
        targetSla: targetSla.toString(),
        ...(selectedMonitorId ? { monitorId: selectedMonitorId } : {}),
        ...(selectedStatusPageId ? { statusPageId: selectedStatusPageId } : {}),
        ...(range === "custom" && startDate ? { from: startDate } : {}),
        ...(range === "custom" && endDate ? { to: endDate } : {}),
        ...(agencyName ? { agencyName } : {}),
        ...(clientName ? { clientName } : {}),
        ...(executiveNotes ? { notes: executiveNotes } : {}),
      });

      window.location.href = `/api/reports/sla?${params.toString()}`;
      toast.success("Branded PDF generated", {
        description: "Your executive deliverable is downloading.",
      });
      setIsPdfModalOpen(false);
    } catch {
      toast.error("Failed to generate SLA PDF report");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const minUptime = report?.dailyBreakdown?.length
    ? Math.min(...report.dailyBreakdown.map((d) => d.uptimePct))
    : 95;
  const domainMin = Math.max(0, Math.floor(minUptime - 0.5));

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/80 pb-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif font-medium tracking-tight text-foreground">
              SLA Reports & Deliverables
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-mono uppercase tracking-wider bg-[#ffd439]/15 text-foreground border border-[#ffd439]/40 rounded-full font-medium">
              Deliverables
            </span>
          </div>
          <p className="text-sm text-muted-foreground font-sans">
            Generate executive compliance deliverables and verify uptime against contractual client
            SLAs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Branded PDF Dialog Trigger */}
          <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="bg-foreground text-background hover:bg-foreground/90 font-medium text-xs gap-2 rounded-xl shadow-xs cursor-pointer h-9 px-4"
              >
                <FileText className="size-4 text-[#ffd439]" />
                Branded PDF Deliverable
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px] bg-card border-border rounded-2xl shadow-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-serif text-xl font-medium text-foreground">
                  <Building2 className="size-5 text-foreground" />
                  Agency Branded SLA Deliverable
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Customize executive metadata and billing notes before generating the client PDF.
                </DialogDescription>
              </DialogHeader>

              {!canExportPdf ? (
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs font-mono">
                    <Lock className="size-4" />
                    AGENCY DELIVERABLE LOCKED (PRO FEATURE)
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Branded PDF SLA report exports are reserved for <strong>Agency</strong> and{" "}
                    <strong>Lifetime Stack</strong> plans. Upgrade your workspace to generate
                    high-resolution client billing PDFs.
                  </p>
                  <Link
                    href="/dashboard/settings?tab=billing"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-colors"
                  >
                    Upgrade to Unlock PDF Exports →
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 py-2 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="agencyName"
                        className="font-mono text-[11px] uppercase text-muted-foreground"
                      >
                        Agency / Brand Header
                      </Label>
                      <Input
                        id="agencyName"
                        placeholder="e.g. Apex Cloud Solutions"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        className="h-9 text-xs rounded-xl border-border bg-background"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label
                        htmlFor="clientName"
                        className="font-mono text-[11px] uppercase text-muted-foreground"
                      >
                        Client / Project Name
                      </Label>
                      <Input
                        id="clientName"
                        placeholder="e.g. Acme Corp Portal"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="h-9 text-xs rounded-xl border-border bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="executiveNotes"
                      className="font-mono text-[11px] uppercase text-muted-foreground"
                    >
                      Executive Billing Commentary & Notes
                    </Label>
                    <Textarea
                      id="executiveNotes"
                      rows={4}
                      placeholder={
                        report?.isSlaMet
                          ? `Contractual availability threshold (${targetSla}%) was satisfied during this billing period with ${report?.aggregate.uptimePct.toFixed(3)}% achieved uptime. Zero service credits apply.`
                          : `Availability during this period (${report?.aggregate.uptimePct.toFixed(3)}%) fell below contractual threshold of ${targetSla}%. Service credits applied per agreement.`
                      }
                      value={executiveNotes}
                      onChange={(e) => setExecutiveNotes(e.target.value)}
                      className="text-xs rounded-xl border-border bg-background resize-none"
                    />
                    <span className="text-[10px] text-muted-foreground">
                      Leave empty to use automatic SLA compliance narrative in the generated PDF.
                    </span>
                  </div>

                  <div className="p-3 bg-muted/50 border border-border rounded-xl text-[11px] font-mono space-y-1 text-muted-foreground">
                    <div className="flex justify-between text-foreground font-semibold">
                      <span>Target SLA: {targetSla}%</span>
                      <span
                        className={
                          report?.isSlaMet
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }
                      >
                        Actual: {report?.aggregate.uptimePct.toFixed(3)}% (
                        {report?.isSlaMet ? "PASS" : "FAIL"})
                      </span>
                    </div>
                    <div>
                      Window: {report?.startDate} to {report?.endDate}
                    </div>
                    <div>Scope: {report?.scopeName}</div>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPdfModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                {canExportPdf && (
                  <Button
                    onClick={handleGeneratePdf}
                    disabled={isDownloadingPdf || isLoading}
                    size="sm"
                    className="rounded-xl text-xs gap-1.5 bg-foreground text-background hover:bg-foreground/90"
                  >
                    {isDownloadingPdf ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Download className="size-3.5" />
                    )}
                    Generate Client PDF
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadCsv}
            className="rounded-xl text-xs gap-1.5 h-9 bg-card border-border hover:bg-muted/60"
          >
            <FileSpreadsheet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadJson}
            className="rounded-xl text-xs gap-1.5 h-9 bg-card border-border hover:bg-muted/60"
          >
            <FileJson className="size-3.5 text-blue-600 dark:text-blue-400" />
            JSON
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyApiUrl}
            className="rounded-xl text-xs gap-1 text-muted-foreground hover:text-foreground h-9"
            title="Copy Headless API Endpoint"
          >
            {isCopiedApi ? (
              <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="size-3.5" />
            )}
            API Link
          </Button>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <Card className="border-border bg-card shadow-xs rounded-2xl">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Scope Selector */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <SlidersHorizontal className="size-3 text-foreground" />
                Report Scope
              </Label>
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger className="h-9 font-mono text-xs rounded-xl bg-background border-border">
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent className="font-mono text-xs rounded-xl">
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <Layers className="size-3.5 text-foreground" />
                      <span>All Workspace Monitors</span>
                    </div>
                  </SelectItem>

                  {initialStatusPages.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-[10px] text-muted-foreground uppercase">
                        Status Pages (Client Portals)
                      </SelectLabel>
                      {initialStatusPages.map((sp) => (
                        <SelectItem key={sp.id} value={`status_page:${sp.id}`}>
                          <div className="flex items-center gap-2">
                            <Globe className="size-3.5 text-blue-500" />
                            <span>{sp.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}

                  {initialMonitors.length > 0 && (
                    <SelectGroup>
                      <SelectLabel className="text-[10px] text-muted-foreground uppercase">
                        Individual Monitors
                      </SelectLabel>
                      {initialMonitors.map((m) => (
                        <SelectItem key={m.id} value={`monitor:${m.id}`}>
                          <div className="flex items-center gap-2">
                            <MonitorIcon className="size-3.5 text-emerald-500" />
                            <span>{m.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Timeframe Range */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <Calendar className="size-3 text-foreground" />
                Audit Timeframe
              </Label>
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="h-9 font-mono text-xs rounded-xl bg-background border-border">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="font-mono text-xs rounded-xl">
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="this-month">This Calendar Month</SelectItem>
                  <SelectItem value="last-month">Last Calendar Month (Billing)</SelectItem>
                  <SelectItem value="custom">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Contractual SLA */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="size-3 text-foreground" />
                Target SLA Threshold
              </Label>
              <Select
                value={targetSla.toString()}
                onValueChange={(val) => setTargetSla(Number.parseFloat(val))}
              >
                <SelectTrigger className="h-9 font-mono text-xs rounded-xl bg-background border-border">
                  <SelectValue placeholder="Target SLA" />
                </SelectTrigger>
                <SelectContent className="font-mono text-xs rounded-xl">
                  <SelectItem value="99.0">99.00% (Single 9 — 7.2h downtime/mo)</SelectItem>
                  <SelectItem value="99.5">99.50% (3.6h downtime/mo)</SelectItem>
                  <SelectItem value="99.9">99.90% (Three 9s — 43.2m downtime/mo)</SelectItem>
                  <SelectItem value="99.95">99.95% (21.6m downtime/mo)</SelectItem>
                  <SelectItem value="99.99">99.99% (Four 9s — 4.3m downtime/mo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Dates Inputs or Scope Summary */}
            {range === "custom" ? (
              <div className="space-y-1.5">
                <Label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  Custom Dates (Start / End)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 text-xs font-mono rounded-xl bg-background border-border"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 text-xs font-mono rounded-xl bg-background border-border"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center font-mono text-[11px] text-muted-foreground border-l border-border pl-4">
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  ACTIVE WINDOW
                </span>
                <span className="text-foreground font-medium">
                  {report ? `${report.startDate} to ${report.endDate}` : "Calculating..."}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading / Error States */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full bg-card rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-24 bg-card rounded-2xl" />
            <Skeleton className="h-24 bg-card rounded-2xl" />
            <Skeleton className="h-24 bg-card rounded-2xl" />
            <Skeleton className="h-24 bg-card rounded-2xl" />
          </div>
          <Skeleton className="h-72 w-full bg-card rounded-2xl" />
        </div>
      ) : error || !report ? (
        <Card className="border-rose-500/30 bg-rose-500/10 rounded-2xl">
          <CardContent className="p-8 text-center text-rose-600 dark:text-rose-400 font-mono text-sm">
            Failed to generate SLA analytics report. Please verify date parameters or try again.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Executive Verdict Banner */}
          <div
            className={cn(
              "p-6 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden shadow-xs",
              report.isSlaMet
                ? "bg-emerald-500/5 border-emerald-500/30"
                : "bg-rose-500/5 border-rose-500/30",
            )}
          >
            <div className="flex flex-col gap-1.5 z-10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                DELIVERABLE AUDIT FOR
              </span>
              <h2 className="text-2xl font-serif font-medium text-foreground flex items-center gap-2">
                {report.scopeName}
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Audit Period: {report.startDate} — {report.endDate} • {report.services.length}{" "}
                Monitored Endpoints
              </p>
            </div>

            <div className="flex flex-col md:items-end gap-2 z-10">
              <div className="flex items-center gap-2">
                {report.isSlaMet ? (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-mono font-medium text-xs tracking-wider">
                    <CheckCircle2 className="size-4" />
                    SLA COMPLIANT (PASS)
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-400 font-mono font-medium text-xs tracking-wider">
                    <AlertTriangle className="size-4" />
                    SLA BREACHED (FAIL)
                  </div>
                )}
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                Target:{" "}
                <span className="font-semibold text-foreground">{targetSla.toFixed(2)}%</span> |
                Achieved:{" "}
                <span
                  className={cn(
                    "font-bold",
                    report.isSlaMet
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  {report.aggregate.uptimePct.toFixed(3)}%
                </span>
              </div>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <Card className="border-border bg-card shadow-xs rounded-2xl">
              <CardHeader className="p-4 pb-1">
                <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div
                  className={cn(
                    "text-2xl font-serif font-medium",
                    report.isSlaMet
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  {report.aggregate.uptimePct.toFixed(3)}%
                </div>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                  Target: {targetSla.toFixed(2)}%
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-xs rounded-2xl">
              <CardHeader className="p-4 pb-1">
                <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Outage Time
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-serif font-medium text-foreground">
                  {report.aggregate.totalDowntimeMinutes}m
                </div>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                  Allowed: {report.aggregate.allowedDowntimeMinutes.toFixed(1)}m
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-xs rounded-2xl">
              <CardHeader className="p-4 pb-1">
                <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Error Budget
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div
                  className={cn(
                    "text-2xl font-serif font-medium",
                    report.aggregate.remainingErrorBudgetPct >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400",
                  )}
                >
                  {report.aggregate.remainingErrorBudgetPct.toFixed(1)}%
                </div>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                  {report.aggregate.remainingErrorBudgetPct >= 0 ? "Healthy" : "Depleted"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-xs rounded-2xl">
              <CardHeader className="p-4 pb-1">
                <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Mean Recovery
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-serif font-medium text-foreground">
                  {report.aggregate.mttrMinutes > 0
                    ? `${report.aggregate.mttrMinutes.toFixed(1)}m`
                    : "0m"}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                  MTTD: {report.aggregate.mttdSeconds}s
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-xs rounded-2xl">
              <CardHeader className="p-4 pb-1">
                <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Verification Checks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-serif font-medium text-foreground">
                  {report.aggregate.totalChecks.toLocaleString()}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                  {report.aggregate.totalDown} failures
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-xs rounded-2xl">
              <CardHeader className="p-4 pb-1">
                <CardTitle className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  Avg Latency
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-serif font-medium text-foreground">
                  {report.aggregate.avgLatencyMs}ms
                </div>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                  p95: {report.aggregate.p95LatencyMs}ms
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Breakdown Chart */}
          <Card className="border-border bg-card shadow-xs rounded-2xl">
            <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-serif font-medium text-foreground">
                  Daily Availability & SLA Compliance
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground font-mono">
                  Daily measured uptime percentage vs SLA target line ({targetSla}%)
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="h-[260px] w-full">
                {report.dailyBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={report.dailyBreakdown}
                      margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="date"
                        tickFormatter={(val) => format(new Date(val), "MMM d")}
                        stroke="#8a877d"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#8a877d"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        domain={[domainMin, 100]}
                        tickFormatter={(val) => `${val}%`}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.05)" }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const dateStr = label
                              ? format(new Date(label as string | number), "MMMM d, yyyy")
                              : "";
                            return (
                              <div className="rounded-xl border border-border bg-card p-3 shadow-lg text-xs font-mono">
                                <p className="font-semibold text-foreground mb-1">{dateStr}</p>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={cn(
                                        "size-2 rounded-full",
                                        data.uptimePct >= targetSla
                                          ? "bg-emerald-500"
                                          : "bg-rose-500",
                                      )}
                                    />
                                    <span>Uptime: {Number(data.uptimePct).toFixed(3)}%</span>
                                  </div>
                                  <p className="text-muted-foreground">
                                    Downtime: {data.downDuration} min
                                  </p>
                                  <p className="text-muted-foreground">
                                    Checks: {data.checksTotal} (Down: {data.checksDown})
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine
                        y={targetSla}
                        stroke="#10b981"
                        strokeDasharray="3 3"
                        strokeWidth={1.5}
                        opacity={0.8}
                      />
                      <Bar dataKey="uptimePct" radius={[4, 4, 0, 0]}>
                        {report.dailyBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.uptimePct >= targetSla ? "#10b981" : "#f43f5e"}
                            fillOpacity={0.85}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-mono text-muted-foreground">
                    No historical summary records available for this window yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monitored Services Table */}
          {report.services.length > 0 && (
            <Card className="border-border bg-card shadow-xs rounded-2xl overflow-hidden">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-serif font-medium text-foreground">
                  Monitored Services Breakdown ({report.services.length})
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground font-mono">
                  Performance and SLA compliance breakdown per service endpoint.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-left">
                    <thead className="bg-muted/50 border-y border-border text-muted-foreground uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4 font-medium">Service</th>
                        <th className="py-3 px-4 font-medium">Type</th>
                        <th className="py-3 px-4 text-right font-medium">Checks</th>
                        <th className="py-3 px-4 text-right font-medium">Downtime</th>
                        <th className="py-3 px-4 text-right font-medium">Uptime %</th>
                        <th className="py-3 px-4 text-right font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {report.services.map((srv) => (
                        <tr key={srv.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-medium text-foreground">
                            {srv.name}
                            <span className="block text-[10px] text-muted-foreground truncate max-w-xs font-normal">
                              {srv.url}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground border border-border">
                              {srv.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-muted-foreground">
                            {srv.checks.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-foreground">
                            {srv.downtimeMinutes}m
                          </td>
                          <td
                            className={cn(
                              "py-3 px-4 text-right font-bold",
                              srv.status === "PASS"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-rose-600 dark:text-rose-400",
                            )}
                          >
                            {srv.uptimePct.toFixed(3)}%
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                                srv.status === "PASS"
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                                  : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
                              )}
                            >
                              {srv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Outage & Incident Log */}
          <Card className="border-border bg-card shadow-xs rounded-2xl overflow-hidden">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-base font-serif font-medium text-foreground">
                Outage & Incident Audit Log ({report.incidents.length})
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-mono">
                Historical record of service interruptions during the audit window.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {report.incidents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-left">
                    <thead className="bg-muted/50 border-y border-border text-muted-foreground uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4 font-medium">Timestamp (UTC)</th>
                        <th className="py-3 px-4 font-medium">Service</th>
                        <th className="py-3 px-4 font-medium">Root Cause / Description</th>
                        <th className="py-3 px-4 text-right font-medium">Duration</th>
                        <th className="py-3 px-4 text-right font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {report.incidents.map((inc) => (
                        <tr key={inc.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 text-muted-foreground">{inc.startedAt}</td>
                          <td className="py-3 px-4 font-medium text-foreground">
                            {inc.serviceName}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground max-w-sm">{inc.reason}</td>
                          <td className="py-3 px-4 text-right font-medium text-foreground">
                            {inc.durationMinutes}m
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                                inc.status === "RESOLVED"
                                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                                  : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
                              )}
                            >
                              {inc.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="size-4" />
                  Zero service disruptions recorded during this audit window. 100% continuous uptime
                  verified.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
