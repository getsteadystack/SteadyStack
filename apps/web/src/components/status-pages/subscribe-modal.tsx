"use client";

import { useState } from "react";
import { X, Mail, Rss, Check, Loader2 } from "lucide-react";
import { initiateSubscription } from "@/actions/subscriptions";
import { FeedLinks } from "./feed-links";
import { MonitorSelector } from "./monitor-selector";
import { useTranslations } from "next-intl";

interface Monitor {
  id: string;
  monitorId: string;
  displayName: string | null;
  monitor: {
    id: string;
    name: string;
  };
}

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageId: string;
  pageSlug: string;
  pageTitle: string;
  monitors: Monitor[];
}

export function SubscribeModal({
  isOpen,
  onClose,
  pageId,
  pageSlug,
  pageTitle,
  monitors,
}: SubscribeModalProps) {
  const [email, setEmail] = useState("");
  const [selectedMonitorIds, setSelectedMonitorIds] = useState<string[]>(
    monitors.map((m) => m.monitorId),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<"email" | "feeds">("email");

  const t = useTranslations("subscribe");
  const tCommon = useTranslations("common");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const response = await initiateSubscription(pageId, email, selectedMonitorIds);
    setResult(response);
    setIsLoading(false);

    if (response.success) {
      setEmail("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-foreground tracking-tight">{t("title")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Subscribe to incident and maintenance alerts
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border bg-muted/30">
          <button
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-3 px-4 text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "email"
                ? "text-foreground border-b-2 border-primary bg-background font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Mail className="size-3.5" />
            {t("email_tab")}
          </button>
          <button
            onClick={() => setActiveTab("feeds")}
            className={`flex-1 py-3 px-4 text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === "feeds"
                ? "text-foreground border-b-2 border-primary bg-background font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Rss className="size-3.5" />
            {t("feed_tab")}
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {activeTab === "email" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 font-medium"
                >
                  {t("email_label")}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("email_placeholder")}
                  required
                  className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 text-sm font-sans"
                />
              </div>

              {/* Monitor Selection */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1.5 font-medium">
                  {t("monitors_label")}
                </label>
                <MonitorSelector
                  monitors={monitors}
                  selectedIds={selectedMonitorIds}
                  onChange={setSelectedMonitorIds}
                />
              </div>

              {/* Info */}
              <p className="text-xs text-muted-foreground">{t("info_text")}</p>

              {/* Result Message */}
              {result && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    result.success
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {result.success && <Check className="inline size-3.5 mr-1.5" />}
                  {result.message}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-xl text-xs hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    {t("subscribing")}
                  </>
                ) : (
                  <>
                    <Mail className="size-3.5" />
                    {t("button")}
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">{t("feed_info")}</p>
              <FeedLinks pageSlug={pageSlug} pageTitle={pageTitle} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-border bg-muted/20">
          <p className="text-[11px] text-muted-foreground text-center font-mono">
            Direct Status Updates &middot; GDPR Compliant
          </p>
        </div>
      </div>
    </div>
  );
}
