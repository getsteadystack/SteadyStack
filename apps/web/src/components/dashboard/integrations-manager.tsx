"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Github,
  Cloud,
  Check,
  Loader2,
  ExternalLink,
  ArrowRight,
  Blocks,
  Link as LinkIcon,
  AlertTriangle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import {
  fetchVercelProjects,
  fetchNetlifySites,
  fetchGitHubRepos,
  importThirdPartyMonitors,
  getConnectedIntegrations,
  disconnectIntegration,
  getVercelOAuthUrl,
  connectVercelWithToken,
  connectNetlifyWithToken,
  connectGitHubWithToken,
  type ExternalResource,
} from "@/actions/integrations";

type Provider = "vercel" | "netlify" | "github";

export function IntegrationsManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [token, setToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState<ExternalResource[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [hasSavedToken, setHasSavedToken] = useState(false);
  const [connectedIntegrations, setConnectedIntegrations] = useState<any[]>([]);

  const loadIntegrations = async () => {
    try {
      const res = await getConnectedIntegrations();
      if (res.success && res.data) {
        setConnectedIntegrations(res.data);
      }
    } catch (err) {
      console.error("Failed to load integrations", err);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const details = searchParams.get("details");

    if (success === "vercel_connected") {
      toast.success("Successfully connected Vercel scope!");
      router.replace("/dashboard/integrations");
      loadIntegrations();
    } else if (error) {
      toast.error(`Integration failed: ${error} ${details ? `(${details})` : ""}`);
      router.replace("/dashboard/integrations");
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeProvider) {
      const savedToken = localStorage.getItem(`steadystack_token_${activeProvider}`);
      if (savedToken) {
        setToken(savedToken);
        setHasSavedToken(true);
      } else {
        const hasDbConfig = connectedIntegrations.some((ci) => ci.provider === activeProvider);
        const isDbProvider =
          activeProvider === "vercel" ||
          activeProvider === "netlify" ||
          activeProvider === "github";
        if (isDbProvider && hasDbConfig) {
          setToken("db");
          setHasSavedToken(false);
        } else {
          setToken("");
          setHasSavedToken(false);
        }
      }
    }
  }, [activeProvider, connectedIntegrations]);

  const handleClearToken = () => {
    if (activeProvider) {
      localStorage.removeItem(`steadystack_token_${activeProvider}`);
      setToken("");
      setHasSavedToken(false);
      toast.success("Saved credentials cleared successfully");
    }
  };

  const handleVercelDisconnect = async (id: string) => {
    setLoading(true);
    try {
      const res = await disconnectIntegration(id);
      if (res.success) {
        toast.success("Disconnected Vercel scope successfully");
        await loadIntegrations();
      } else {
        toast.error(res.error || "Failed to disconnect integration");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to disconnect integration");
    } finally {
      setLoading(false);
    }
  };

  const handleVercelConnectWithToken = async () => {
    if (!token || token === "db") {
      toast.error("Please enter a valid Vercel API token");
      return;
    }
    setLoading(true);
    try {
      const res = await connectVercelWithToken(token);
      if (res.success && res.personalName) {
        toast.success(
          `Successfully connected personal scope "${res.personalName}"${
            res.teamsCount && res.teamsCount > 0 ? ` and ${res.teamsCount} team scopes!` : "!"
          }`,
        );
        setToken("db");
        await loadIntegrations();
      } else {
        toast.error(res.error || "Failed to verify or connect Vercel token");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to connect token");
    } finally {
      setLoading(false);
    }
  };

  const handleNetlifyConnectWithToken = async () => {
    if (!token || token === "db") {
      toast.error("Please enter a valid Netlify API token");
      return;
    }
    setLoading(true);
    try {
      const res = await connectNetlifyWithToken(token);
      if (res.success && res.name) {
        toast.success(`Successfully connected Netlify account "${res.name}"!`);
        setToken("db");
        await loadIntegrations();
      } else {
        toast.error(res.error || "Failed to verify or connect Netlify token");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to connect token");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubConnectWithToken = async () => {
    if (!token || token === "db") {
      toast.error("Please enter a valid GitHub API token");
      return;
    }
    setLoading(true);
    try {
      const res = await connectGitHubWithToken(token);
      if (res.success && res.name) {
        toast.success(`Successfully connected GitHub account "${res.name}"!`);
        setToken("db");
        await loadIntegrations();
      } else {
        toast.error(res.error || "Failed to verify or connect GitHub token");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to connect token");
    } finally {
      setLoading(false);
    }
  };

  const handleVercelConnectOAuth = async () => {
    setLoading(true);
    try {
      const res = await getVercelOAuthUrl();
      if (res.success && res.url) {
        window.location.href = res.url;
      } else {
        toast.error(res.error || "Failed to initiate Vercel OAuth");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred initiating Vercel OAuth");
    } finally {
      setLoading(false);
    }
  };

  const providerMeta = {
    vercel: {
      title: "Vercel Integration",
      description: "Auto-sync Vercel deployments and project domains.",
      icon: Cloud,
      color: "from-[#000000] to-[#333333] border-white/10",
      accent: "text-white bg-white/5 border-white/20",
      tokenPlaceholder: "Enter Vercel Access Token (API token)",
      docsLink: "https://vercel.com/docs/rest-api",
    },
    netlify: {
      title: "Netlify Integration",
      description: "Sync your deployed static sites and custom URLs.",
      icon: LinkIcon,
      color: "from-[#00AD9F]/10 to-[#00F5D4]/5 border-[#00AD9F]/20",
      accent: "text-[#00F5D4] bg-[#00AD9F]/10 border-[#00AD9F]/30",
      tokenPlaceholder: "Enter Netlify Personal Access Token",
      docsLink: "https://docs.netlify.com/api/get-started/",
    },
    github: {
      title: "GitHub Pages & Repos",
      description: "Import repository endpoints and GitHub Pages websites.",
      icon: Github,
      color: "from-[#24292e]/20 to-[#4078c0]/10 border-[#4078c0]/20",
      accent: "text-[#4078c0] bg-[#4078c0]/10 border-[#4078c0]/30",
      tokenPlaceholder: "Enter GitHub Personal Access Token (PAT)",
      docsLink: "https://github.com/settings/tokens",
    },
  };

  const handleConnectClick = (provider: Provider) => {
    setActiveProvider(provider);
    setToken("");
    setResources([]);
    setSelectedIds(new Set());
  };

  const handleFetchResources = async () => {
    setLoading(true);
    if (!token) {
      toast.error("Please enter a valid API access token");
      setLoading(false);
      return;
    }

    try {
      let result;
      if (activeProvider === "vercel") {
        result = await fetchVercelProjects(token);
      } else if (activeProvider === "netlify") {
        result = await fetchNetlifySites(token);
      } else {
        result = await fetchGitHubRepos(token);
      }

      if (result.success && result.data) {
        setResources(result.data);
        // Default select all projects
        setSelectedIds(new Set(result.data.map((r) => r.id)));
        toast.success(`Successfully loaded ${result.data.length} projects!`);

        // Save the valid token in localStorage
        if (token && token !== "db" && activeProvider) {
          localStorage.setItem(`steadystack_token_${activeProvider}`, token);
          setHasSavedToken(true);
        }
      } else {
        toast.error(result.error || "Failed to load projects");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to retrieve deployments");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) {
      toast.error("Please select at least one deployment to import");
      return;
    }

    setImporting(true);
    const targets = resources
      .filter((r) => selectedIds.has(r.id))
      .map((r) => ({
        name: r.name,
        url: r.url,
        type: r.type,
      }));

    try {
      const result = await importThirdPartyMonitors(targets);
      if (result.success) {
        toast.success(`Successfully imported ${result.count} monitors!`);
        setActiveProvider(null);
        router.push("/dashboard/monitors");
      } else {
        toast.error(result.error || "Failed to complete import");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during import");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-1.5 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#ffd439]" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Ecosystem & Cloud Connectors
          </span>
        </div>
        <h2 className="text-2xl font-serif font-medium tracking-tight text-foreground">
          Zero-Code Integrations
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
          Import websites, repositories, and cloud deployments automatically. SteadyStack connects
          directly to your providers with continuous synchronisation.
        </p>
      </div>

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Vercel Card */}
        <Card className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-foreground/20 transition-all flex flex-col justify-between">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                <svg className="size-4 fill-foreground" viewBox="0 0 116 100">
                  <path d="M57.5 0L115 100H0L57.5 0Z" />
                </svg>
              </div>
              {connectedIntegrations.some((ci) => ci.provider === "vercel") ? (
                <Badge
                  variant="outline"
                  className="text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono font-medium rounded-full"
                >
                  Active ({connectedIntegrations.filter((ci) => ci.provider === "vercel").length})
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-muted-foreground border-border bg-muted text-[10px] font-mono font-medium rounded-full"
                >
                  1-Click setup
                </Badge>
              )}
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Vercel Integration
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                Auto-sync and import Vercel projects and production domains straight into your
                active monitors list.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={() => handleConnectClick("vercel")}
              className={`w-full text-xs font-medium rounded-xl border flex items-center justify-center gap-2 h-9 transition-all ${
                connectedIntegrations.some((ci) => ci.provider === "vercel")
                  ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-foreground text-background hover:bg-foreground/90 border-transparent shadow-sm"
              }`}
            >
              {connectedIntegrations.some((ci) => ci.provider === "vercel") ? (
                <>
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  Connected Scopes
                </>
              ) : (
                <>
                  Connect Vercel
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Netlify Card */}
        <Card className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-foreground/20 transition-all flex flex-col justify-between">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <Cloud className="size-4 text-teal-600 dark:text-teal-400" />
              </div>
              {connectedIntegrations.some((ci) => ci.provider === "netlify") ? (
                <Badge
                  variant="outline"
                  className="text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono font-medium rounded-full"
                >
                  Active
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-muted-foreground border-border bg-muted text-[10px] font-mono font-medium rounded-full"
                >
                  1-Click setup
                </Badge>
              )}
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Netlify Integration
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                Auto-discover Netlify static deployment sites, custom proxy configs, and subdomains
                automatically.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={() => handleConnectClick("netlify")}
              className={`w-full text-xs font-medium rounded-xl border flex items-center justify-center gap-2 h-9 transition-all ${
                connectedIntegrations.some((ci) => ci.provider === "netlify")
                  ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-foreground text-background hover:bg-foreground/90 border-transparent shadow-sm"
              }`}
            >
              {connectedIntegrations.some((ci) => ci.provider === "netlify") ? (
                <>
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  Connected Account
                </>
              ) : (
                <>
                  Connect Netlify
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* GitHub Card */}
        <Card className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-foreground/20 transition-all flex flex-col justify-between">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                <Github className="size-4 text-foreground" />
              </div>
              {connectedIntegrations.some((ci) => ci.provider === "github") ? (
                <Badge
                  variant="outline"
                  className="text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono font-medium rounded-full"
                >
                  Active
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-muted-foreground border-border bg-muted text-[10px] font-mono font-medium rounded-full"
                >
                  1-Click setup
                </Badge>
              )}
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                GitHub Pages & Repos
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                Link codebases directly and deploy HTTP or SSL health checks for docs and landing
                projects.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={() => handleConnectClick("github")}
              className={`w-full text-xs font-medium rounded-xl border flex items-center justify-center gap-2 h-9 transition-all ${
                connectedIntegrations.some((ci) => ci.provider === "github")
                  ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-foreground text-background hover:bg-foreground/90 border-transparent shadow-sm"
              }`}
            >
              {connectedIntegrations.some((ci) => ci.provider === "github") ? (
                <>
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  Connected Repos
                </>
              ) : (
                <>
                  Connect GitHub
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Notification & Alerting Integrations */}
      <div className="flex flex-col gap-1 pt-6">
        <h3 className="text-lg font-serif font-medium text-foreground">
          Alert & Notification Integrations
        </h3>
        <p className="text-xs text-muted-foreground">
          Connect Discord, Slack, PagerDuty, and Opsgenie to receive instant downtime alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Discord Card */}
        <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center">
                <div className="size-3.5 rounded-full bg-[#5865F2]" />
              </div>
              <Badge
                variant="outline"
                className="text-[#5865F2] border-[#5865F2]/30 bg-[#5865F2]/10 text-[10px] font-mono rounded-full"
              >
                Alert Channel
              </Badge>
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Discord Webhooks
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                Route incident alerts, latency degradation warnings, and recovery pings straight to
                your channels.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={() => router.push("/dashboard/alerts")}
              variant="outline"
              className="w-full text-xs font-medium rounded-xl border border-border flex items-center justify-center gap-2 h-9 hover:bg-muted/80"
            >
              Configure in Alerts
              <ArrowRight className="size-3.5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>

        {/* Slack Card */}
        <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-[#E01E5A]/10 border border-[#E01E5A]/20 flex items-center justify-center">
                <div className="size-3.5 rounded-full bg-[#E01E5A]" />
              </div>
              <Badge
                variant="outline"
                className="text-[#E01E5A] border-[#E01E5A]/30 bg-[#E01E5A]/10 text-[10px] font-mono rounded-full"
              >
                Alert Channel
              </Badge>
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Slack Incoming Webhooks
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                Broadcast outages and performance SLA violations directly into team Slack channels.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={() => router.push("/dashboard/alerts")}
              variant="outline"
              className="w-full text-xs font-medium rounded-xl border border-border flex items-center justify-center gap-2 h-9 hover:bg-muted/80"
            >
              Configure in Alerts
              <ArrowRight className="size-3.5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>

        {/* PagerDuty & Opsgenie */}
        <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-center justify-between">
              <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <div className="size-3.5 rounded-full bg-emerald-600" />
              </div>
              <Badge
                variant="outline"
                className="text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-mono rounded-full"
              >
                On-Call Paging
              </Badge>
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                PagerDuty & Opsgenie
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
                Trigger high-priority on-call phone paging and escalation policies during quorum
                downtime.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              onClick={() => router.push("/dashboard/alerts")}
              variant="outline"
              className="w-full text-xs font-medium rounded-xl border border-border flex items-center justify-center gap-2 h-9 hover:bg-muted/80"
            >
              Configure in Alerts
              <ArrowRight className="size-3.5 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Integration Setup Dialog */}
      <Dialog open={activeProvider !== null} onOpenChange={() => setActiveProvider(null)}>
        <DialogContent className="sm:max-w-[520px] border-border bg-card text-foreground rounded-2xl shadow-xl p-6">
          {activeProvider && (
            <>
              <DialogHeader className="space-y-1.5 text-left">
                <DialogTitle className="text-lg font-serif font-medium flex items-center gap-2 text-foreground">
                  {activeProvider === "vercel" && <Cloud className="size-5 text-foreground" />}
                  {activeProvider === "netlify" && (
                    <LinkIcon className="size-5 text-teal-600 dark:text-teal-400" />
                  )}
                  {activeProvider === "github" && <Github className="size-5 text-foreground" />}
                  {providerMeta[activeProvider].title}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {providerMeta[activeProvider].description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {resources.length === 0 ? (
                  /* Credential Entry Mode */
                  <div className="space-y-4">
                    {/* Vercel Specific Live Token Integration Flow */}
                    {activeProvider === "vercel" && (
                      <div className="space-y-4">
                        {connectedIntegrations.some((ci) => ci.provider === "vercel") && (
                          /* Connected Scopes */
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground">
                              Connected Vercel Scopes
                            </label>
                            <div className="divide-y divide-border border border-border rounded-xl bg-muted/30 max-h-[160px] overflow-y-auto">
                              {connectedIntegrations
                                .filter((ci) => ci.provider === "vercel")
                                .map((ci) => (
                                  <div
                                    key={ci.id}
                                    className="flex justify-between items-center p-3 text-xs"
                                  >
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-medium text-foreground">
                                        {ci.teamName}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Badge
                                          variant="outline"
                                          className="text-[9px] px-1.5 py-0 border-border text-muted-foreground bg-muted"
                                        >
                                          {ci.teamSlug}
                                        </Badge>
                                      </span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleVercelDisconnect(ci.id)}
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7 px-2.5 rounded-lg border border-destructive/20"
                                    >
                                      Disconnect
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Direct Token Input for Connecting */}
                        <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
                          <label className="text-xs font-semibold text-foreground">
                            {connectedIntegrations.some((ci) => ci.provider === "vercel")
                              ? "Connect Another Account / Token"
                              : "Vercel Personal Access Token"}
                          </label>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Create a token in your Vercel Account Settings and paste it below.
                            SteadyStack will persistently link your personal account and all
                            accessible teams to your database account.
                          </p>
                          <div className="flex gap-2">
                            <Input
                              type="password"
                              placeholder="Enter Vercel Access Token (sec_...)"
                              value={token === "db" ? "" : token}
                              onChange={(e) => setToken(e.target.value)}
                              className="bg-card border-border text-foreground text-xs rounded-xl focus-visible:ring-foreground/20"
                            />
                            <Button
                              onClick={handleVercelConnectWithToken}
                              disabled={loading || !token || token === "db"}
                              className="bg-foreground hover:bg-foreground/90 text-background text-xs font-medium px-4 rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="size-3.5 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                "Connect"
                              )}
                            </Button>
                          </div>
                          <div className="pt-1">
                            <a
                              href="https://vercel.com/account/tokens"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-foreground underline flex items-center gap-1.5"
                            >
                              Where do I get my access token?
                              <ExternalLink className="size-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Netlify Specific Live Token Integration Flow */}
                    {activeProvider === "netlify" && (
                      <div className="space-y-4">
                        {connectedIntegrations.some((ci) => ci.provider === "netlify") && (
                          /* Connected Scopes */
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground">
                              Connected Netlify Account
                            </label>
                            <div className="divide-y divide-border border border-border rounded-xl bg-muted/30 max-h-[160px] overflow-y-auto">
                              {connectedIntegrations
                                .filter((ci) => ci.provider === "netlify")
                                .map((ci) => (
                                  <div
                                    key={ci.id}
                                    className="flex justify-between items-center p-3 text-xs"
                                  >
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-medium text-foreground">
                                        {ci.teamName}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Badge
                                          variant="outline"
                                          className="text-[9px] px-1.5 py-0 border-border text-muted-foreground bg-muted"
                                        >
                                          {ci.teamSlug}
                                        </Badge>
                                      </span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleVercelDisconnect(ci.id)}
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7 px-2.5 rounded-lg border border-destructive/20"
                                    >
                                      Disconnect
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Direct Token Input for Connecting */}
                        <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
                          <label className="text-xs font-semibold text-foreground">
                            {connectedIntegrations.some((ci) => ci.provider === "netlify")
                              ? "Connect Another Account / Token"
                              : "Netlify Personal Access Token"}
                          </label>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Create a Personal Access Token in your Netlify User Settings and paste
                            it below. SteadyStack will persistently link your site index to your
                            account.
                          </p>
                          <div className="flex gap-2">
                            <Input
                              type="password"
                              placeholder="Enter Netlify Personal Access Token"
                              value={token === "db" ? "" : token}
                              onChange={(e) => setToken(e.target.value)}
                              className="bg-card border-border text-foreground text-xs rounded-xl focus-visible:ring-foreground/20"
                            />
                            <Button
                              onClick={handleNetlifyConnectWithToken}
                              disabled={loading || !token || token === "db"}
                              className="bg-foreground hover:bg-foreground/90 text-background text-xs font-medium px-4 rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="size-3.5 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                "Connect"
                              )}
                            </Button>
                          </div>
                          <div className="pt-1">
                            <a
                              href="https://app.netlify.com/user/settings/applications#personal-access-tokens"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-foreground underline flex items-center gap-1.5"
                            >
                              Where do I get my access token?
                              <ExternalLink className="size-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* GitHub Specific Live Token Integration Flow */}
                    {activeProvider === "github" && (
                      <div className="space-y-4">
                        {connectedIntegrations.some((ci) => ci.provider === "github") && (
                          /* Connected Scopes */
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground">
                              Connected GitHub Account
                            </label>
                            <div className="divide-y divide-border border border-border rounded-xl bg-muted/30 max-h-[160px] overflow-y-auto">
                              {connectedIntegrations
                                .filter((ci) => ci.provider === "github")
                                .map((ci) => (
                                  <div
                                    key={ci.id}
                                    className="flex justify-between items-center p-3 text-xs"
                                  >
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-medium text-foreground">
                                        {ci.teamName}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Badge
                                          variant="outline"
                                          className="text-[9px] px-1.5 py-0 border-border text-muted-foreground bg-muted"
                                        >
                                          {ci.teamSlug}
                                        </Badge>
                                      </span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleVercelDisconnect(ci.id)}
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7 px-2.5 rounded-lg border border-destructive/20"
                                    >
                                      Disconnect
                                    </Button>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Direct Token Input for Connecting */}
                        <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/20">
                          <label className="text-xs font-semibold text-foreground">
                            {connectedIntegrations.some((ci) => ci.provider === "github")
                              ? "Connect Another Account / Token"
                              : "GitHub Personal Access Token"}
                          </label>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Create a Personal Access Token (PAT) with `repo` scope in your GitHub
                            Developer Settings and paste it below. SteadyStack will persistently
                            link your repository targets to your account.
                          </p>
                          <div className="flex gap-2">
                            <Input
                              type="password"
                              placeholder="Enter GitHub PAT (ghp_...)"
                              value={token === "db" ? "" : token}
                              onChange={(e) => setToken(e.target.value)}
                              className="bg-card border-border text-foreground text-xs rounded-xl focus-visible:ring-foreground/20"
                            />
                            <Button
                              onClick={handleGitHubConnectWithToken}
                              disabled={loading || !token || token === "db"}
                              className="bg-foreground hover:bg-foreground/90 text-background text-xs font-medium px-4 rounded-xl flex items-center gap-1.5 shrink-0 shadow-sm"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="size-3.5 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                "Connect"
                              )}
                            </Button>
                          </div>
                          <div className="pt-1">
                            <a
                              href="https://github.com/settings/tokens/new?scopes=repo"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-muted-foreground hover:text-foreground underline flex items-center gap-1.5"
                            >
                              Where do I get my access token?
                              <ExternalLink className="size-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {connectedIntegrations.some((ci) => ci.provider === activeProvider) && (
                      <Button
                        onClick={handleFetchResources}
                        disabled={loading}
                        className="w-full bg-foreground hover:bg-foreground/90 text-background text-xs font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            Authenticating...
                          </>
                        ) : (
                          "Fetch Projects & Deployments"
                        )}
                      </Button>
                    )}
                  </div>
                ) : (
                  /* Resource Selection Checklist Mode */
                  <div className="space-y-4">
                    <div className="border border-border rounded-xl max-h-[220px] overflow-y-auto divide-y divide-border bg-muted/20">
                      {resources.map((res) => {
                        const isSelected = selectedIds.has(res.id);
                        return (
                          <div
                            key={res.id}
                            onClick={() => toggleSelect(res.id)}
                            className="flex items-center justify-between p-3 hover:bg-muted/40 cursor-pointer transition-colors"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-medium text-foreground">
                                {res.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <LinkIcon className="size-3 shrink-0" />
                                {res.url}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className="text-[10px] bg-muted border-border text-foreground hover:bg-muted">
                                {res.type}
                              </Badge>
                              <div
                                className={`size-5 rounded-md border flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "bg-foreground border-foreground text-background"
                                    : "border-border bg-card"
                                }`}
                              >
                                {isSelected && <Check className="size-3.5" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-3 border border-border rounded-xl">
                      <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                      <span>Monitors will check in every 60 seconds (Initiate Tier limit).</span>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => setResources([])}
                        variant="outline"
                        className="flex-1 text-xs py-2 rounded-xl border-border text-foreground"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleImport}
                        disabled={importing || selectedIds.size === 0}
                        className="flex-[2] bg-foreground hover:bg-foreground/90 text-background text-xs font-medium py-2 rounded-xl shadow-sm"
                      >
                        {importing ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin mr-1.5" />
                            Importing...
                          </>
                        ) : (
                          `Import Selected (${selectedIds.size})`
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
