"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Clock, Zap, Mail, Sliders, X, Sparkles } from "lucide-react";
import { StatusPageMonitorRow } from "./status-page-monitor-row";
import { AnalyticsTracker } from "./analytics-tracker";
import Image from "next/image";
import { useTranslations, useFormatter } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";
import { SubscribeModal } from "./subscribe-modal";
import { StatusPageSettings } from "./status-page-settings";

export function PublicView({
  page: initialPage,
  isAdmin,
  initialIncidents = [],
}: {
  page: any;
  isAdmin?: boolean;
  initialIncidents?: any[];
}) {
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  const handleLiveChange = (updates: any) => {
    setPage((prev: any) => ({
      ...prev,
      ...updates,
      theme: updates.theme !== undefined ? updates.theme : prev.theme,
    }));
  };

  const tStatus = useTranslations("status");
  const tHeadings = useTranslations("headings");
  const tActions = useTranslations("actions");
  const tCommon = useTranslations("common");
  const format = useFormatter();

  const activeIncidents = initialIncidents.filter((inc) => !inc.resolvedAt);
  const resolvedIncidents = initialIncidents.filter((inc) => inc.resolvedAt);

  // Filter monitors based on visibility settings
  const visibleMonitors = (page.monitors || []).filter((m: any) => {
    if (!page.showPaused && m.monitor?.status === "PAUSED") return false;
    return true;
  });

  const allUp =
    visibleMonitors.length > 0 && visibleMonitors.every((m: any) => m.monitor?.status === "UP");

  // Subscribe modal state
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<"status" | "events" | "monitors">("status");

  const scrollToSection = (id: "status" | "events" | "monitors") => {
    setActiveNav(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Dynamic Theme Colors
  const theme = (page.theme as any) || {
    value: "modern",
    colors: {
      bg: "#09090b",
      text: "#fafafa",
      primary: "#10b981",
      degraded: "#f59e0b",
      error: "#ef4444",
    },
  };
  const colors = theme.colors || {
    bg: "#09090b",
    text: "#fafafa",
    primary: "#10b981",
    degraded: "#f59e0b",
    error: "#ef4444",
  };

  const customStyle = {
    "--primary-page": colors.primary || "#10b981",
    "--degraded-page": colors.degraded || "#f59e0b",
    "--error-page": colors.error || "#ef4444",
  } as React.CSSProperties;

  return (
    <div
      style={customStyle}
      className="min-h-screen bg-background text-foreground font-sans selection:bg-emerald-500/20 relative overflow-hidden transition-colors duration-300"
    >
      <AnalyticsTracker pageId={page.id} />
      {page.customCss && <style dangerouslySetInnerHTML={{ __html: page.customCss }} />}

      {/* Subtle Background Glow / Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),rgba(0,0,0,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {page.isDemo && (
          <div className="bg-primary/5 border border-primary/20 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold uppercase tracking-wider text-primary rounded-2xl shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 animate-pulse" />
              <span>Interactive Theme Demo ({theme.value})</span>
            </div>
            <a
              href="/showcase"
              className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap text-xs font-mono font-medium"
            >
              Back to Showcase
            </a>
          </div>
        )}

        {/* Top Navbar */}
        <header className="flex flex-col sm:flex-row items-center justify-between py-4 mb-8 border-b border-border/80 gap-4">
          {/* Logo & Title */}
          {page.homepageUrl ? (
            <a
              href={page.homepageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity group"
            >
              {page.logo ? (
                <div className="relative size-10 rounded-xl overflow-hidden border border-border bg-card shadow-xs">
                  <Image
                    src={page.logo}
                    alt={page.title}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="size-10 rounded-xl bg-foreground text-background flex items-center justify-center font-bold font-mono text-base shadow-xs group-hover:scale-105 transition-transform">
                  {page.title.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <span className="font-bold tracking-tight text-base text-foreground block">
                  {page.title}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground block">
                  Status Portal
                </span>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-3">
              {page.logo ? (
                <div className="relative size-10 rounded-xl overflow-hidden border border-border bg-card shadow-xs">
                  <Image
                    src={page.logo}
                    alt={page.title}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="size-10 rounded-xl bg-foreground text-background flex items-center justify-center font-bold font-mono text-base shadow-xs">
                  {page.title.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <span className="font-bold tracking-tight text-base text-foreground block">
                  {page.title}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground block">
                  Status Portal
                </span>
              </div>
            </div>
          )}

          {/* Nav Links */}
          <div className="flex items-center p-1 rounded-full bg-muted/60 border border-border">
            <button
              type="button"
              onClick={() => scrollToSection("status")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeNav === "status"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tHeadings("status")}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("monitors")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeNav === "monitors"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tHeadings("monitors")}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("events")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeNav === "events"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tHeadings("events")}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {page.contactUrl && (
              <a
                href={page.contactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all flex items-center justify-center shadow-xs"
                title="Contact Support"
              >
                <Mail className="size-4" />
              </a>
            )}

            <button
              type="button"
              onClick={() => setIsSubscribeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
            >
              <Zap className="size-3.5" />
              <span>{tActions("get_updates")}</span>
            </button>
          </div>

          {/* Subscribe Modal */}
          <SubscribeModal
            isOpen={isSubscribeModalOpen}
            onClose={() => setIsSubscribeModalOpen(false)}
            pageId={page.id}
            pageSlug={page.slug}
            pageTitle={page.title}
            monitors={page.monitors}
          />
        </header>

        {/* Global Status Banner */}
        <section
          id="status"
          className={`scroll-mt-8 relative overflow-hidden rounded-3xl border p-6 sm:p-8 md:p-10 mb-10 transition-all duration-300 shadow-sm ${
            allUp
              ? "bg-emerald-500/[0.04] border-emerald-500/20 dark:bg-emerald-950/20 dark:border-emerald-500/30"
              : "bg-rose-500/[0.04] border-rose-500/20 dark:bg-rose-950/20 dark:border-rose-500/30"
          }`}
        >
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 text-center sm:text-left">
            {/* Status Icon */}
            <div
              className={`size-16 sm:size-20 rounded-2xl flex items-center justify-center border transition-all duration-300 shrink-0 ${
                allUp
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-xs"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 shadow-xs animate-pulse"
              }`}
            >
              {allUp ? (
                <CheckCircle className="size-9 sm:size-11 stroke-[1.75]" />
              ) : (
                <AlertTriangle className="size-9 sm:size-11 stroke-[1.75]" />
              )}
            </div>

            {/* Text Stack */}
            <div className="space-y-1.5">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {allUp ? tStatus("operational") : tStatus("issue_detected")}
              </h2>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs font-mono text-muted-foreground">
                <span
                  className={`font-semibold ${
                    allUp
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {allUp ? tStatus("system_integrity_100") : tStatus("critical_failures")}
                </span>

                <span className="opacity-40">&middot;</span>

                <span>
                  {format.dateTime(new Date(), {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZoneName: "short",
                  })}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Active Incidents Container */}
        {activeIncidents.length > 0 && (
          <section className="mb-10 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-rose-500/20">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider font-mono">
                Active Outages & Incidents
              </h3>
            </div>

            <div className="space-y-3">
              {activeIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-500/[0.03] p-5 sm:p-6 transition-all"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h4 className="text-base font-bold text-foreground tracking-tight">
                        {inc.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                        Affected System: {inc.monitor?.name}
                      </p>
                    </div>
                    <span className="self-start sm:self-auto px-2.5 py-1 rounded-full border border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10 text-[10px] uppercase tracking-wider font-bold font-mono">
                      {inc.status}
                    </span>
                  </div>

                  {inc.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 pl-3 border-l-2 border-border">
                      {inc.description}
                    </p>
                  )}

                  {/* Timeline updates */}
                  {inc.events && inc.events.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-rose-500/15">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
                        Timeline Updates
                      </p>
                      <div className="relative pl-4 border-l-2 border-rose-500/20 space-y-3">
                        {inc.events.map((evt: any) => (
                          <div key={evt.id} className="relative text-xs">
                            <span className="absolute -left-[21px] top-1.5 size-2 rounded-full bg-rose-500 border-2 border-background"></span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[10px] text-foreground uppercase font-mono">
                                {evt.type.replace("_", " ")}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {new Date(evt.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                              {evt.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Page Description */}
        {page.description && (
          <div className="text-center mb-8">
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">{page.description}</p>
          </div>
        )}

        {/* Monitor List */}
        <section id="monitors" className="scroll-mt-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/80 mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              {tHeadings("system_modules")}
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              {tHeadings("real_time_status")}
            </span>
          </div>

          <div className="space-y-3">
            {visibleMonitors.map((item: any) => (
              <StatusPageMonitorRow
                key={item.id}
                item={item}
                showUptime={page.showUptime}
                showResponseTime={page.showResponseTime}
                barType={page.barType || "absolute"}
                cardType={page.cardType || "duration"}
                overrides={page.overrides || []}
              />
            ))}
          </div>

          {visibleMonitors.length === 0 && (
            <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-card">
              <p className="text-muted-foreground font-mono text-sm">{tCommon("no_monitors")}</p>
            </div>
          )}
        </section>

        {/* Incident History Timeline */}
        <section id="events" className="scroll-mt-8 mt-16 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/80">
            <Clock className="size-4 text-muted-foreground" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Incident History (Last 7 Days)
            </h3>
          </div>

          {resolvedIncidents.length === 0 ? (
            <div className="p-8 border border-dashed border-border/80 rounded-2xl bg-muted/20 text-center">
              <p className="text-xs text-muted-foreground font-mono">
                No incidents reported in the last 7 days. All systems operational.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resolvedIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 hover:border-border/80 transition-all shadow-xs"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground tracking-tight">
                        {inc.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                        Affected System: {inc.monitor?.name} &middot; Resolved on{" "}
                        {new Date(inc.resolvedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px] uppercase tracking-wider font-semibold font-mono">
                      RESOLVED
                    </span>
                  </div>

                  {inc.events && inc.events.length > 0 && (
                    <div className="pl-3 border-l-2 border-border/60 space-y-2 mt-3 pt-2">
                      {inc.events.map((evt: any) => (
                        <div key={evt.id} className="text-xs leading-relaxed text-muted-foreground">
                          <span className="font-semibold text-[10px] text-foreground uppercase mr-2 font-mono">
                            {evt.type.replace("_", " ")}
                          </span>
                          <span className="text-[10px] opacity-60 mr-2 font-mono">
                            {new Date(evt.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          &mdash; {evt.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-border/80 flex flex-col items-center gap-4 text-center">
          {page.footerLinks && Array.isArray(page.footerLinks) && page.footerLinks.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-2">
              {page.footerLinks.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors hover:underline underline-offset-4"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          <LanguageSwitcher />

          <div className="flex flex-col items-center gap-2 mt-2">
            {(!page.user || page.user.tier === "INITIATE") && (
              <a
                href="https://steadystack.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted border border-border text-xs font-mono text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                <span>Powered by</span>
                <span className="font-semibold text-foreground">SteadyStack</span>
              </a>
            )}
          </div>
        </footer>
      </div>

      {/* Floating Admin Edit Button */}
      {isAdmin && (
        <button
          onClick={() => setIsEditSidebarOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-foreground"></span>
          </span>
          <Sliders className="size-4" />
          <span>Edit Design</span>
        </button>
      )}

      {/* Real-time Config Sidebar Overlay */}
      {isAdmin && (
        <>
          {/* Backdrop Blur Overlay */}
          <div
            className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-45 transition-opacity duration-300 ${
              isEditSidebarOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setIsEditSidebarOpen(false)}
          />

          {/* Sidebar Drawer */}
          <div
            className={`fixed right-0 top-0 bottom-0 w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl bg-card border-l border-border shadow-2xl z-50 transition-transform duration-300 ease-out transform ${
              isEditSidebarOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/30">
              <div className="space-y-1">
                <h3 className="text-base font-bold tracking-tight text-foreground">
                  Configure Status Page
                </h3>
                <p className="text-xs text-muted-foreground">Real-time design & branding preview</p>
              </div>
              <button
                onClick={() => setIsEditSidebarOpen(false)}
                className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Sidebar Body */}
            <div className="p-6 sm:p-8 overflow-y-auto h-[calc(100vh-85px)] custom-scrollbar">
              <StatusPageSettings page={page} onLiveChange={handleLiveChange} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
