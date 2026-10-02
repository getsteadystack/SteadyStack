"use client";

import { useState } from "react";
import { updateLanguageSettings } from "@/actions/i18n";
import { toast } from "@/components/ui/sonner";
import { Globe, Edit, Loader2, Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { LOCALES } from "@/i18n/locales";

const SUPPORTED_LOCALES = LOCALES.map(({ code, label }) => ({ code, label }));

export function StatusPageI18n({ page }: { page: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const getSetting = (code: string) => page.i18nSettings?.find((s: any) => s.locale === code);

  const toggleLocale = async (code: string, currentEnabled: boolean) => {
    setLoading(code);
    try {
      const setting = getSetting(code);
      await updateLanguageSettings(page.id, code, {
        enabled: !currentEnabled,
        overrides: setting?.overrides || {},
      });
      toast.success(`Language ${code.toUpperCase()} ${!currentEnabled ? "enabled" : "disabled"}`);
      router.refresh();
    } catch (e) {
      toast.error("Failed to update language");
    }
    setLoading(null);
  };

  return (
    <div className="bg-card border border-border p-6 rounded-2xl space-y-5 shadow-xs">
      <div className="flex items-center gap-2.5 pb-2 border-b border-border">
        <Languages className="size-4 text-primary" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Multi-Language Localization (i18n)
          </h3>
          <p className="text-xs text-muted-foreground">
            Enable international languages for public status page visitors
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUPPORTED_LOCALES.map((locale) => {
          const setting = getSetting(locale.code);
          // Default: English is enabled if no setting exists, others disabled
          const isEnabled = setting ? setting.enabled : locale.code === "en";

          return (
            <div
              key={locale.code}
              className="flex items-center justify-between p-3.5 bg-muted/40 border border-border rounded-xl hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold uppercase w-7 text-foreground">
                  {locale.code}
                </span>
                <span className="text-xs font-medium text-foreground">{locale.label}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {/* Toggle */}
                {loading === locale.code ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleLocale(locale.code, !!isEnabled)}
                    disabled={locale.code === "en"}
                    className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
                      isEnabled ? "bg-primary" : "bg-muted-foreground/30"
                    } ${locale.code === "en" ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <div
                      className={`absolute top-0.5 bottom-0.5 w-4 h-4 bg-background rounded-full transition-all shadow-xs ${
                        isEnabled ? "left-4.5" : "left-0.5"
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
