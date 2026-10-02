"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { Globe, Palette, Type, Save, AlertCircle, Check, Loader2, Copy, Code2 } from "lucide-react";
import { updateWidgetConfig } from "@/actions/status-pages";
import { StatusBadgePreview } from "@/components/widgets/status-badge-preview";
import { EmbedCodeGenerator } from "@/components/widgets/embed-code-generator";

interface WidgetConfig {
  widgetEnabled: boolean;
  widgetAllowedDomains: string | null;
  widgetBadgeText: {
    operational: string;
    partial: string;
    major: string;
  } | null;
  widgetTheme: {
    bgColor: string;
    textColor: string;
    borderRadius: string;
  } | null;
}

interface WidgetConfiguratorProps {
  pageId: string;
  pageSlug: string;
  initialConfig: WidgetConfig;
}

const DEFAULT_BADGE_TEXT = {
  operational: "All Systems Operational",
  partial: "Partial Outage",
  major: "Major Outage",
};

const DEFAULT_THEME = {
  bgColor: "#1a1a2e",
  textColor: "#00ff88",
  borderRadius: "8px",
};

const ALLOWED_SHIELD_STYLES = ["flat", "outline"] as const;
const ALLOWED_SHIELD_THEMES = ["dark", "light"] as const;
const ALLOWED_SHIELD_SIZES = ["sm", "lg"] as const;

const sanitizeShieldStyle = (value: string) =>
  ALLOWED_SHIELD_STYLES.includes(value as (typeof ALLOWED_SHIELD_STYLES)[number]) ? value : "flat";

const sanitizeShieldTheme = (value: string) =>
  ALLOWED_SHIELD_THEMES.includes(value as (typeof ALLOWED_SHIELD_THEMES)[number]) ? value : "dark";

const sanitizeShieldSize = (value: string) =>
  ALLOWED_SHIELD_SIZES.includes(value as (typeof ALLOWED_SHIELD_SIZES)[number]) ? value : "sm";

export function WidgetConfigurator({ pageId, pageSlug, initialConfig }: WidgetConfiguratorProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [enabled, setEnabled] = useState(initialConfig.widgetEnabled);
  const [allowedDomains, setAllowedDomains] = useState(initialConfig.widgetAllowedDomains || "");
  const [badgeText, setBadgeText] = useState({
    operational: initialConfig.widgetBadgeText?.operational || DEFAULT_BADGE_TEXT.operational,
    partial: initialConfig.widgetBadgeText?.partial || DEFAULT_BADGE_TEXT.partial,
    major: initialConfig.widgetBadgeText?.major || DEFAULT_BADGE_TEXT.major,
  });
  const [theme, setTheme] = useState({
    bgColor: initialConfig.widgetTheme?.bgColor || DEFAULT_THEME.bgColor,
    textColor: initialConfig.widgetTheme?.textColor || DEFAULT_THEME.textColor,
    borderRadius: initialConfig.widgetTheme?.borderRadius || DEFAULT_THEME.borderRadius,
  });

  // Shield badge generator states
  const [shieldStyle, setShieldStyle] = useState("flat");
  const [shieldTheme, setShieldTheme] = useState("dark");
  const [shieldSize, setShieldSize] = useState("sm");
  const [copiedShieldMd, setCopiedShieldMd] = useState(false);
  const [copiedShieldHtml, setCopiedShieldHtml] = useState(false);

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "https://your-domain.com";
  const shieldUrl = `${baseUrl}/api/badge/${pageSlug}.svg?style=${shieldStyle}&theme=${shieldTheme}&size=${shieldSize}`;
  const statusPageUrl = `${baseUrl}/status-page/${pageSlug}`;

  const shieldMarkdown = `[![Status](${shieldUrl})](${statusPageUrl})`;
  const shieldHtml = `<a href="${statusPageUrl}"><img src="${shieldUrl}" alt="System Status" /></a>`;

  const handleCopyShieldMd = async () => {
    try {
      await navigator.clipboard.writeText(shieldMarkdown);
      setCopiedShieldMd(true);
      setTimeout(() => setCopiedShieldMd(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyShieldHtml = async () => {
    try {
      await navigator.clipboard.writeText(shieldHtml);
      setCopiedShieldHtml(true);
      setTimeout(() => setCopiedShieldHtml(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await updateWidgetConfig(pageId, {
        widgetEnabled: enabled,
        widgetAllowedDomains: allowedDomains || null,
        widgetBadgeText: badgeText,
        widgetTheme: theme,
      });

      if (result.success) {
        setMessage({ type: "success", text: "Widget configuration saved!" });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to save configuration",
        });
      }

      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-muted border border-border text-foreground">
              <Globe className="size-4.5 text-foreground" />
            </div>
            <div>
              <h3 className="text-base font-serif font-medium text-foreground">Enable Widget</h3>
              <p className="text-xs text-muted-foreground">
                Allow external websites to embed your status badge
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(!enabled)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors focus:outline-none shadow-2xs",
              enabled ? "bg-foreground border-foreground" : "bg-muted border-border",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-4.5 transform rounded-full bg-background shadow-2xs ring-0 transition-transform mt-0.5 ml-0.5",
                enabled ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>
      </div>

      {enabled && (
        <>
          {/* Allowed Domains */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted border border-border text-foreground">
                <Globe className="size-4.5 text-foreground" />
              </div>
              <div>
                <h3 className="text-base font-serif font-medium text-foreground">
                  Allowed Domains
                </h3>
                <p className="text-xs text-muted-foreground">
                  Domains that can embed your widget (CORS)
                </p>
              </div>
            </div>
            <textarea
              value={allowedDomains}
              onChange={(e) => setAllowedDomains(e.target.value)}
              placeholder="example.com&#10;*.example.org&#10;subdomain.example.net"
              rows={4}
              className="w-full bg-background border border-border rounded-xl p-3 text-xs font-mono text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/40 resize-none shadow-2xs"
            />
            <div className="text-xs text-muted-foreground font-mono space-y-1">
              <p>• One domain per line, or comma-separated</p>
              <p>
                • Use <code className="text-foreground font-semibold">*</code> to allow all domains
              </p>
              <p>
                • Use <code className="text-foreground font-semibold">*.example.com</code> for
                wildcard subdomains
              </p>
              <p>• Leave empty to block all cross-origin requests</p>
            </div>
          </div>

          {/* Badge Text Customization */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted border border-border text-foreground">
                <Type className="size-4.5 text-foreground" />
              </div>
              <div>
                <h3 className="text-base font-serif font-medium text-foreground">Badge Text</h3>
                <p className="text-xs text-muted-foreground">Customize the status messages</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold mb-1 block">
                  Operational
                </label>
                <input
                  type="text"
                  value={badgeText.operational}
                  onChange={(e) => setBadgeText({ ...badgeText, operational: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-foreground/40 shadow-2xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold mb-1 block">
                  Partial Outage
                </label>
                <input
                  type="text"
                  value={badgeText.partial}
                  onChange={(e) => setBadgeText({ ...badgeText, partial: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-foreground/40 shadow-2xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-red-700 dark:text-red-400 font-semibold mb-1 block">
                  Major Outage
                </label>
                <input
                  type="text"
                  value={badgeText.major}
                  onChange={(e) => setBadgeText({ ...badgeText, major: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-foreground/40 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Theme Customization */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted border border-border text-foreground">
                <Palette className="size-4.5 text-foreground" />
              </div>
              <div>
                <h3 className="text-base font-serif font-medium text-foreground">Widget Theme</h3>
                <p className="text-xs text-muted-foreground">Customize colors and style</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium mb-2 block">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.bgColor}
                    onChange={(e) => setTheme({ ...theme, bgColor: e.target.value })}
                    className="size-9 rounded-xl border border-border cursor-pointer p-0.5 bg-background shadow-2xs"
                  />
                  <input
                    type="text"
                    value={theme.bgColor}
                    onChange={(e) => setTheme({ ...theme, bgColor: e.target.value })}
                    className="flex-1 bg-background border border-border rounded-xl p-2 text-xs font-mono text-foreground focus:outline-none focus:border-foreground/40 uppercase shadow-2xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium mb-2 block">
                  Text Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.textColor}
                    onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                    className="size-9 rounded-xl border border-border cursor-pointer p-0.5 bg-background shadow-2xs"
                  />
                  <input
                    type="text"
                    value={theme.textColor}
                    onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
                    className="flex-1 bg-background border border-border rounded-xl p-2 text-xs font-mono text-foreground focus:outline-none focus:border-foreground/40 uppercase shadow-2xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium mb-2 block">
                  Border Radius
                </label>
                <select
                  value={theme.borderRadius}
                  onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-2 text-xs font-mono text-foreground focus:outline-none focus:border-foreground/40 shadow-2xs cursor-pointer"
                >
                  <option value="0px">Square (0px)</option>
                  <option value="4px">Subtle (4px)</option>
                  <option value="8px">Rounded (8px)</option>
                  <option value="16px">More Rounded (16px)</option>
                  <option value="9999px">Pill (Full)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <StatusBadgePreview theme={theme} badgeText={badgeText} />

          {/* Embed Code */}
          <EmbedCodeGenerator slug={pageSlug} />

          {/* Embeddable Status Shields (SVG Badges) */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-muted border border-border text-foreground">
                <Code2 className="size-4.5 text-foreground" />
              </div>
              <div>
                <h3 className="text-base font-serif font-medium text-foreground">
                  Status Shield Badge (SVG)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Embed a dynamic, real-time status image in your GitHub README, documentation, or
                  dashboard.
                </p>
              </div>
            </div>

            {/* Config options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-border py-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium block">
                  Badge Style
                </label>
                <select
                  value={shieldStyle}
                  onChange={(e) => setShieldStyle(sanitizeShieldStyle(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl p-2 text-xs font-mono text-foreground focus:outline-none focus:border-foreground/40 shadow-2xs cursor-pointer"
                >
                  <option value="flat">Flat (Shields.io style)</option>
                  <option value="outline">Outline (Glow style)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium block">
                  Theme
                </label>
                <select
                  value={shieldTheme}
                  onChange={(e) => setShieldTheme(sanitizeShieldTheme(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl p-2 text-xs font-mono text-foreground focus:outline-none focus:border-foreground/40 shadow-2xs cursor-pointer"
                >
                  <option value="dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium block">
                  Badge Size
                </label>
                <select
                  value={shieldSize}
                  onChange={(e) => setShieldSize(sanitizeShieldSize(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl p-2 text-xs font-mono text-foreground focus:outline-none focus:border-foreground/40 shadow-2xs cursor-pointer"
                >
                  <option value="sm">Small (20px)</option>
                  <option value="lg">Large (32px)</option>
                </select>
              </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium block">
                Live Preview
              </span>
              <div className="bg-muted/30 border border-border rounded-xl p-4 flex items-center justify-center min-h-[60px]">
                <img
                  src={`/api/badge/${encodeURIComponent(pageSlug)}.svg?style=${encodeURIComponent(
                    sanitizeShieldStyle(shieldStyle),
                  )}&theme=${encodeURIComponent(sanitizeShieldTheme(shieldTheme))}&size=${encodeURIComponent(
                    sanitizeShieldSize(shieldSize),
                  )}&t=${Date.now()}`}
                  alt="Status Badge Preview"
                  className="max-w-full"
                />
              </div>
            </div>

            {/* Code snippets */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
                    Markdown Code (GitHub README)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyShieldMd}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted font-mono text-[11px] font-semibold uppercase text-foreground transition-all shadow-2xs cursor-pointer"
                  >
                    {copiedShieldMd ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {copiedShieldMd ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="bg-muted/40 border border-border rounded-xl p-3 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
                  {shieldMarkdown}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-medium">
                    HTML Code
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyShieldHtml}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted font-mono text-[11px] font-semibold uppercase text-foreground transition-all shadow-2xs cursor-pointer"
                  >
                    {copiedShieldHtml ? (
                      <Check className="size-3 text-emerald-600" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    {copiedShieldHtml ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="bg-muted/40 border border-border rounded-xl p-3 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
                  {shieldHtml}
                </pre>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        {message && (
          <div
            className={cn(
              "flex items-center gap-2 text-xs font-mono font-medium",
              message.type === "success"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400",
            )}
          >
            {message.type === "success" ? (
              <Check className="size-4" />
            ) : (
              <AlertCircle className="size-4" />
            )}
            {message.text}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={isPending}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 bg-foreground text-background rounded-xl font-mono font-semibold uppercase tracking-wider text-xs transition-all ml-auto shadow-xs cursor-pointer",
            isPending ? "opacity-50 cursor-not-allowed" : "hover:bg-foreground/90",
          )}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Save className="size-3.5" />
          )}
          Save Widget Settings
        </button>
      </div>
    </div>
  );
}
