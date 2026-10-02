"use client";

import { useActionState, useEffect, useState } from "react";
import { updateStatusPage } from "@/actions/status-pages";
import { toast } from "@/components/ui/sonner";
import {
  Loader2,
  Palette,
  Globe,
  Shield,
  Search,
  Eye,
  FileCode,
  Mail,
  Link as LinkIcon,
  Trash2,
  Code2,
  Check,
  Sparkles,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";
import { StatusPageI18n } from "./status-page-i18n";

interface StatusPageSettingsProps {
  page: any;
  onLiveChange?: (updates: any) => void;
}

const initialState = { success: false, error: "" };
const themes = [
  {
    name: "Steady Modern",
    value: "modern",
    description: "Sleek obsidian dark with emerald status accents",
    colors: {
      bg: "#09090b",
      text: "#fafafa",
      primary: "#10b981",
      degraded: "#f59e0b",
      error: "#ef4444",
    },
  },
  {
    name: "Steady Light",
    value: "light",
    description: "Warm minimalist porcelain with deep emerald",
    colors: {
      bg: "#fbfbf9",
      text: "#18181b",
      primary: "#059669",
      degraded: "#d97706",
      error: "#dc2626",
    },
  },
  {
    name: "Sentry Dark",
    value: "cyberpunk",
    description: "Deep violet charcoal with vivid coral alerts",
    colors: {
      bg: "#0f0e13",
      text: "#edeef0",
      primary: "#e15639",
      degraded: "#f59e0b",
      error: "#f87171",
    },
  },
  {
    name: "Loops Dark",
    value: "midnight",
    description: "Pitch black slate with high-contrast electric orange",
    colors: {
      bg: "#0b0b0c",
      text: "#f4f4f5",
      primary: "#ff5a1f",
      degraded: "#eab308",
      error: "#ef4444",
    },
  },
  {
    name: "Loops Light",
    value: "dracula",
    description: "Clean crisp snow canvas with energetic orange",
    colors: {
      bg: "#f9f9fb",
      text: "#09090b",
      primary: "#ff5a1f",
      degraded: "#eab308",
      error: "#ef4444",
    },
  },
  {
    name: "Monochrome",
    value: "monochrome",
    description: "Minimalist editorial high-contrast grayscale",
    colors: {
      bg: "#ffffff",
      text: "#09090b",
      primary: "#09090b",
      degraded: "#78716c",
      error: "#ef4444",
    },
  },
];

type SettingsTab = "general" | "theme" | "branding" | "seo" | "advanced";

export function StatusPageSettings({ page, onLiveChange }: StatusPageSettingsProps) {
  const updateWithId = updateStatusPage.bind(null, page.id);
  const [state, formAction, isPending] = useActionState(updateWithId, initialState);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  // Parse existing theme
  const currentTheme = (page.theme as any)?.value || "cyberpunk";
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);

  // Parse custom colors state
  const [customColors, setCustomColors] = useState({
    bg: (page.theme as any)?.colors?.bg || "#0f0e13",
    text: (page.theme as any)?.colors?.text || "#edeef0",
    primary: (page.theme as any)?.colors?.primary || "#e15639",
    degraded: (page.theme as any)?.colors?.degraded || "#f59e0b",
    error: (page.theme as any)?.colors?.error || "#f87171",
  });

  // Parse custom footer links
  const [footerLinks, setFooterLinks] = useState<{ label: string; url: string }[]>(() => {
    try {
      return Array.isArray(page.footerLinks) ? page.footerLinks : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (state.success) toast.success("Status page settings updated!");
    if (state.error) toast.error(state.error);
  }, [state]);

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: "general", label: "General", icon: Globe },
    { id: "theme", label: "Theme & Palette", icon: Palette },
    { id: "branding", label: "Branding & Links", icon: LinkIcon },
    { id: "seo", label: "SEO & Access", icon: Shield },
    { id: "advanced", label: "Advanced & CSS", icon: Code2 },
  ];

  return (
    <form action={formAction} className="space-y-6 animate-in fade-in duration-300">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/80 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-foreground text-background shadow-xs font-bold"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GENERAL SETTINGS */}
      {activeTab === "general" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-card border border-border p-6 rounded-2xl space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Globe className="size-4 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
                <p className="text-xs text-muted-foreground">Title, URL slug, and core details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Page Title</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Required</span>
                </label>
                <input
                  name="title"
                  defaultValue={page.title}
                  onChange={(e) => onLiveChange?.({ title: e.target.value })}
                  placeholder="e.g. Acme Cloud Status"
                  className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Slug (URL Path)</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    /status-page/[slug]
                  </span>
                </label>
                <input
                  name="slug"
                  defaultValue={page.slug}
                  onChange={(e) => onLiveChange?.({ slug: e.target.value })}
                  placeholder="acme-production"
                  className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">
                Description & Header Notice
              </label>
              <textarea
                name="description"
                defaultValue={page.description || ""}
                onChange={(e) => onLiveChange?.({ description: e.target.value })}
                rows={3}
                placeholder="Real-time uptime and incident reporting for Acme services."
                className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Custom Domain</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  CNAME: cname.vercel-dns.com
                </span>
              </label>
              <input
                name="customDomain"
                defaultValue={page.customDomain || ""}
                onChange={(e) => onLiveChange?.({ customDomain: e.target.value })}
                placeholder="status.yourdomain.com"
                className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Visibility & Tracker Preferences */}
          <div className="bg-card border border-border p-6 rounded-2xl space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Eye className="size-4 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Metrics & Timeline Display
                </h3>
                <p className="text-xs text-muted-foreground">
                  Configure what visitors see on the public timeline
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Timeline History Mode
                </label>
                <select
                  name="barType"
                  defaultValue={page.barType || "absolute"}
                  onChange={(e) => onLiveChange?.({ barType: e.target.value })}
                  className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="absolute">Absolute (Real Check Timestamps)</option>
                  <option value="manual">Manual (Overridden Status Logs)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Tracker Metric Display
                </label>
                <select
                  name="cardType"
                  defaultValue={page.cardType || "duration"}
                  onChange={(e) => onLiveChange?.({ cardType: e.target.value })}
                  className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="duration">Percentage Uptime (e.g. 99.98%)</option>
                  <option value="requests">Check Counts (Total pings)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border hover:bg-muted/70 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="showUptime"
                  defaultChecked={page.showUptime ?? true}
                  onChange={(e) => onLiveChange?.({ showUptime: e.target.checked })}
                  className="accent-primary size-4 cursor-pointer"
                />
                <span className="text-xs font-medium text-foreground">Show Uptime %</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border hover:bg-muted/70 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="showResponseTime"
                  defaultChecked={page.showResponseTime ?? true}
                  onChange={(e) => onLiveChange?.({ showResponseTime: e.target.checked })}
                  className="accent-primary size-4 cursor-pointer"
                />
                <span className="text-xs font-medium text-foreground">Response Charts</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/40 border border-border hover:bg-muted/70 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="showPaused"
                  defaultChecked={page.showPaused ?? false}
                  onChange={(e) => onLiveChange?.({ showPaused: e.target.checked })}
                  className="accent-primary size-4 cursor-pointer"
                />
                <span className="text-xs font-medium text-foreground">Paused Monitors</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THEME & COLOR PALETTE */}
      {activeTab === "theme" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <input
            type="hidden"
            name="theme"
            value={JSON.stringify({
              name:
                selectedTheme === "custom"
                  ? "Custom"
                  : themes.find((t) => t.value === selectedTheme)?.name || "Custom",
              value: selectedTheme,
              colors: customColors,
            })}
          />

          <div className="bg-card border border-border p-6 rounded-2xl space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Palette className="size-4 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Theme Presets</h3>
                  <p className="text-xs text-muted-foreground">
                    Select a carefully crafted design system palette
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-muted border border-border">
                {selectedTheme.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {themes.map((theme) => {
                const isSelected = selectedTheme === theme.value;
                return (
                  <button
                    key={theme.value}
                    type="button"
                    onClick={() => {
                      setSelectedTheme(theme.value);
                      const newColors = {
                        bg: theme.colors.bg,
                        text: theme.colors.text,
                        primary: theme.colors.primary,
                        degraded: theme.colors.degraded || "#f59e0b",
                        error: theme.colors.error || "#ef4444",
                      };
                      setCustomColors(newColors);
                      onLiveChange?.({
                        theme: {
                          name: theme.name,
                          value: theme.value,
                          colors: newColors,
                        },
                      });
                    }}
                    className={`relative p-4 rounded-2xl border transition-all text-left flex flex-col justify-between gap-3 cursor-pointer group ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 bg-muted/70 shadow-sm"
                        : "border-border bg-background hover:border-foreground/30 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground">{theme.name}</span>
                      {isSelected && (
                        <div className="size-4.5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {theme.description}
                    </p>

                    <div className="flex items-center gap-2 pt-2 border-t border-border/60">
                      <div
                        className="size-4 rounded-full border border-border shadow-xs shrink-0"
                        style={{ backgroundColor: theme.colors.bg }}
                        title={`Background: ${theme.colors.bg}`}
                      />
                      <div
                        className="size-4 rounded-full shadow-xs shrink-0"
                        style={{ backgroundColor: theme.colors.primary }}
                        title={`Operational: ${theme.colors.primary}`}
                      />
                      <div
                        className="size-4 rounded-full shadow-xs shrink-0"
                        style={{ backgroundColor: theme.colors.degraded }}
                        title={`Degraded: ${theme.colors.degraded}`}
                      />
                      <div
                        className="size-4 rounded-full shadow-xs shrink-0"
                        style={{ backgroundColor: theme.colors.error }}
                        title={`Outage: ${theme.colors.error}`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Brand Colors */}
          <div className="bg-card border border-border p-6 rounded-2xl space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <SlidersHorizontal className="size-4 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Custom Brand Palette</h3>
                <p className="text-xs text-muted-foreground">
                  Fine-tune individual status colors and surface accents
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Background */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <span className="text-xs font-semibold text-foreground block">Page Background</span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColors.bg}
                    onChange={(e) => {
                      setSelectedTheme("custom");
                      const newColors = { ...customColors, bg: e.target.value };
                      setCustomColors(newColors);
                      onLiveChange?.({
                        theme: { name: "Custom", value: "custom", colors: newColors },
                      });
                    }}
                    className="size-9 rounded-xl border border-border cursor-pointer shrink-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={customColors.bg}
                    onChange={(e) => {
                      setSelectedTheme("custom");
                      const newColors = { ...customColors, bg: e.target.value };
                      setCustomColors(newColors);
                      onLiveChange?.({
                        theme: { name: "Custom", value: "custom", colors: newColors },
                      });
                    }}
                    className="flex-1 bg-background border border-border px-3 py-1.5 rounded-lg text-xs font-mono uppercase text-foreground font-semibold"
                  />
                </div>
              </div>

              {/* Text */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <span className="text-xs font-semibold text-foreground block">
                  Typography Color
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColors.text}
                    onChange={(e) => {
                      setSelectedTheme("custom");
                      const newColors = { ...customColors, text: e.target.value };
                      setCustomColors(newColors);
                      onLiveChange?.({
                        theme: { name: "Custom", value: "custom", colors: newColors },
                      });
                    }}
                    className="size-9 rounded-xl border border-border cursor-pointer shrink-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={customColors.text}
                    onChange={(e) => {
                      setSelectedTheme("custom");
                      const newColors = { ...customColors, text: e.target.value };
                      setCustomColors(newColors);
                      onLiveChange?.({
                        theme: { name: "Custom", value: "custom", colors: newColors },
                      });
                    }}
                    className="flex-1 bg-background border border-border px-3 py-1.5 rounded-lg text-xs font-mono uppercase text-foreground font-semibold"
                  />
                </div>
              </div>

              {/* Operational */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <span className="text-xs font-semibold text-foreground block">
                  Operational Accent
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColors.primary}
                    onChange={(e) => {
                      setSelectedTheme("custom");
                      const newColors = { ...customColors, primary: e.target.value };
                      setCustomColors(newColors);
                      onLiveChange?.({
                        theme: { name: "Custom", value: "custom", colors: newColors },
                      });
                    }}
                    className="size-9 rounded-xl border border-border cursor-pointer shrink-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={customColors.primary}
                    onChange={(e) => {
                      setSelectedTheme("custom");
                      const newColors = { ...customColors, primary: e.target.value };
                      setCustomColors(newColors);
                      onLiveChange?.({
                        theme: { name: "Custom", value: "custom", colors: newColors },
                      });
                    }}
                    className="flex-1 bg-background border border-border px-3 py-1.5 rounded-lg text-xs font-mono uppercase text-foreground font-semibold"
                  />
                </div>
              </div>

              {/* Degraded */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <span className="text-xs font-semibold text-foreground block">Degraded / Slow</span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColors.degraded}
                    onChange={(e) => {
                      setSelectedTheme("custom");
                      const newColors = { ...customColors, degraded: e.target.value };
                      setCustomColors(newColors);
                      onLiveChange?.({
                        theme: { name: "Custom", value: "custom", colors: newColors },
                      });
                    }}
                    className="size-9 rounded-xl border border-border cursor-pointer shrink-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={customColors.degraded}
                    onChange={(e) => {
                      setSelectedTheme("custom");
                      const newColors = { ...customColors, degraded: e.target.value };
                      setCustomColors(newColors);
                      onLiveChange?.({
                        theme: { name: "Custom", value: "custom", colors: newColors },
                      });
                    }}
                    className="flex-1 bg-background border border-border px-3 py-1.5 rounded-lg text-xs font-mono uppercase text-foreground font-semibold"
                  />
                </div>
              </div>

              {/* Outage */}
              <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-2">
                <span className="text-xs font-semibold text-foreground block">Major Outage</span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={customColors.error}
                    onChange={(e) => {
                      setSelectedTheme("custom");
                      const newColors = { ...customColors, error: e.target.value };
                      setCustomColors(newColors);
                      onLiveChange?.({
                        theme: { name: "Custom", value: "custom", colors: newColors },
                      });
                    }}
                    className="size-9 rounded-xl border border-border cursor-pointer shrink-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={customColors.error}
                    onChange={(e) => {
                      setSelectedTheme("custom");
                      const newColors = { ...customColors, error: e.target.value };
                      setCustomColors(newColors);
                      onLiveChange?.({
                        theme: { name: "Custom", value: "custom", colors: newColors },
                      });
                    }}
                    className="flex-1 bg-background border border-border px-3 py-1.5 rounded-lg text-xs font-mono uppercase text-foreground font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BRANDING & NAVIGATION LINKS */}
      {activeTab === "branding" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <input type="hidden" name="footerLinks" value={JSON.stringify(footerLinks)} />

          <div className="bg-card border border-border p-6 rounded-2xl space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Sparkles className="size-4 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Logos & Assets</h3>
                <p className="text-xs text-muted-foreground">
                  Upload or link your organization&apos;s visual assets
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Logo URL</label>
                <input
                  name="logo"
                  defaultValue={page.logo || ""}
                  onChange={(e) => onLiveChange?.({ logo: e.target.value })}
                  placeholder="https://yourdomain.com/logo.svg"
                  className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Favicon URL</label>
                <input
                  name="favicon"
                  defaultValue={page.favicon || ""}
                  onChange={(e) => onLiveChange?.({ favicon: e.target.value })}
                  placeholder="https://yourdomain.com/favicon.ico"
                  className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <LinkIcon className="size-4 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Header & Footer Links</h3>
                <p className="text-xs text-muted-foreground">
                  Add links to your homepage, help center, or status feeds
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ExternalLink className="size-3.5 text-muted-foreground" />
                  <span>Homepage / Company Website</span>
                </label>
                <input
                  name="homepageUrl"
                  defaultValue={page.homepageUrl || ""}
                  onChange={(e) => onLiveChange?.({ homepageUrl: e.target.value })}
                  placeholder="https://yourcompany.com"
                  className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="size-3.5 text-muted-foreground" />
                  <span>Contact Support URL / Email</span>
                </label>
                <input
                  name="contactUrl"
                  defaultValue={page.contactUrl || ""}
                  onChange={(e) => onLiveChange?.({ contactUrl: e.target.value })}
                  placeholder="https://support.yourcompany.com"
                  className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Custom Footer Links List */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <label className="text-xs font-semibold text-foreground block">
                Custom Footer Navigation Links
              </label>

              <div className="space-y-2.5">
                {footerLinks.map((link, idx) => (
                  <div key={idx} className="flex gap-2.5 items-center">
                    <input
                      placeholder="Label (e.g. Terms)"
                      value={link.label}
                      onChange={(e) => {
                        const updated = [...footerLinks];
                        updated[idx].label = e.target.value;
                        setFooterLinks(updated);
                        onLiveChange?.({ footerLinks: updated });
                      }}
                      className="w-1/3 bg-background border border-border px-3.5 py-2 rounded-xl text-xs font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <input
                      placeholder="URL (https://...)"
                      value={link.url}
                      onChange={(e) => {
                        const updated = [...footerLinks];
                        updated[idx].url = e.target.value;
                        setFooterLinks(updated);
                        onLiveChange?.({ footerLinks: updated });
                      }}
                      className="flex-1 bg-background border border-border px-3.5 py-2 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = footerLinks.filter((_, i) => i !== idx);
                        setFooterLinks(updated);
                        onLiveChange?.({ footerLinks: updated });
                      }}
                      className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl border border-border transition-all flex items-center justify-center cursor-pointer shrink-0"
                      title="Remove link"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    const updated = [...footerLinks, { label: "", url: "" }];
                    setFooterLinks(updated);
                    onLiveChange?.({ footerLinks: updated });
                  }}
                  className="w-full py-2.5 border border-dashed border-border hover:border-primary/50 hover:bg-muted/40 text-xs font-semibold text-foreground rounded-xl transition-all cursor-pointer"
                >
                  + Add Footer Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SEO & ACCESS CONTROL */}
      {activeTab === "seo" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-card border border-border p-6 rounded-2xl space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Search className="size-4 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">SEO & OpenGraph Tags</h3>
                <p className="text-xs text-muted-foreground">
                  Optimize your status page for search engines and social cards
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-muted/40 border border-border hover:bg-muted/70 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="seoIndex"
                  defaultChecked={page.seoIndex !== false}
                  onChange={(e) => onLiveChange?.({ seoIndex: e.target.checked })}
                  id="seoIndex"
                  className="accent-primary size-4 mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Allow Search Indexing
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-relaxed">
                    Allow Google, Bing, and search engines to index this status page.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-2xl bg-muted/40 border border-border hover:bg-muted/70 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="showInShowcase"
                  defaultChecked={page.showInShowcase === true}
                  onChange={(e) => onLiveChange?.({ showInShowcase: e.target.checked })}
                  id="showInShowcase"
                  className="accent-primary size-4 mt-0.5 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-foreground block">
                    Feature in Showcase
                  </span>
                  <span className="text-[11px] text-muted-foreground leading-relaxed">
                    Display this status page in the SteadyStack community showcase directory.
                  </span>
                </div>
              </label>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Custom Meta Title</label>
                <input
                  name="metaTitle"
                  defaultValue={page.metaTitle || ""}
                  onChange={(e) => onLiveChange?.({ metaTitle: e.target.value })}
                  placeholder="Acme Cloud Uptime & Status"
                  className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  Custom Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  defaultValue={page.metaDescription || ""}
                  onChange={(e) => onLiveChange?.({ metaDescription: e.target.value })}
                  rows={2}
                  placeholder="Check real-time uptime metrics and service health for Acme Cloud."
                  className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  OG Social Share Image URL
                </label>
                <input
                  name="ogImageUrl"
                  defaultValue={page.ogImageUrl || ""}
                  onChange={(e) => onLiveChange?.({ ogImageUrl: e.target.value })}
                  placeholder="https://example.com/social-preview.png"
                  className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          {/* Access Control */}
          <div className="bg-card border border-border p-6 rounded-2xl space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Shield className="size-4 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Security & Access Control</h3>
                <p className="text-xs text-muted-foreground">
                  Restrict status page visibility to private stakeholders
                </p>
              </div>
            </div>

            <label className="flex items-center gap-3 p-4 rounded-2xl bg-muted/40 border border-border hover:bg-muted/70 transition-colors cursor-pointer">
              <input
                type="checkbox"
                name="isPrivate"
                defaultChecked={page.isPrivate}
                onChange={(e) => onLiveChange?.({ isPrivate: e.target.checked })}
                id="isPrivate"
                className="accent-primary size-4 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-foreground block">Make Page Private</span>
                <span className="text-[11px] text-muted-foreground">
                  Require authentication or password before allowing visitors to view status.
                </span>
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Password Protection</label>
                <input
                  name="password"
                  type="password"
                  defaultValue={page.password || ""}
                  placeholder="Enter access password"
                  className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  IP Allowlist (Comma separated)
                </label>
                <input
                  name="ipWhitelist"
                  defaultValue={page.ipWhitelist || ""}
                  onChange={(e) => onLiveChange?.({ ipWhitelist: e.target.value })}
                  placeholder="192.168.1.1, 10.0.0.1"
                  className="w-full bg-background border border-border px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ADVANCED, CSS, JS & LOCALIZATION */}
      {activeTab === "advanced" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <StatusPageI18n page={page} />

          <div className="bg-card border border-border p-6 rounded-2xl space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <FileCode className="size-4 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">Custom CSS Overrides</h3>
                <p className="text-xs text-muted-foreground">
                  Inject custom stylesheet rules directly into the page header
                </p>
              </div>
            </div>

            <textarea
              name="customCss"
              defaultValue={page.customCss || ""}
              onChange={(e) => onLiveChange?.({ customCss: e.target.value })}
              rows={4}
              placeholder="/* Add custom styling rules here */
.status-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}"
              className="w-full bg-background border border-border p-3.5 rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl space-y-5 shadow-xs">
            <div className="flex items-center gap-2.5 pb-2 border-b border-border">
              <Code2 className="size-4 text-primary" />
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Custom JavaScript Scripting
                </h3>
                <p className="text-xs text-muted-foreground">
                  Injected before the closing body tag (without &lt;script&gt; tags)
                </p>
              </div>
            </div>

            <textarea
              name="customJs"
              defaultValue={page.customJs || ""}
              onChange={(e) => onLiveChange?.({ customJs: e.target.value })}
              rows={4}
              placeholder="// Custom analytics or tracking snippet
console.log('Status page custom script initialized');"
              className="w-full bg-background border border-border p-3.5 rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
          </div>
        </div>
      )}

      {/* Sticky Save Bar */}
      <div className="sticky bottom-0 z-30 pt-4 pb-2 bg-card/90 backdrop-blur-md border-t border-border flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground hidden sm:block">
          All changes can be saved or modified in real time.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
        >
          {isPending && <Loader2 className="size-3.5 animate-spin" />}
          Save Status Page Settings
        </button>
      </div>
    </form>
  );
}
