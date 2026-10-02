"use client";

import { useState } from "react";
import { updateLanguageSettings } from "@/actions/i18n";
import { toast } from "@/components/ui/sonner";
import { Globe, Edit, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { LOCALES } from "@/i18n/locales";

const SUPPORTED_LOCALES = LOCALES.map(({ code, label }) => ({ code, label }));

export function StatusPageI18n({ page }: { page: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [editingLocale, setEditingLocale] = useState<string | null>(null);

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
    <div className="bg-card/20 border border-primary/10 p-6 rounded-sm space-y-4">
      <h3 className="text-sm font-bold font-mono uppercase text-muted-foreground flex items-center gap-2">
        <Globe className="size-4" /> Localization (i18n)
      </h3>

      <div className="space-y-3">
        {SUPPORTED_LOCALES.map((locale) => {
          const setting = getSetting(locale.code);
          // Default: English is enabled if no setting exists, others disabled
          const isEnabled = setting ? setting.enabled : locale.code === "en";

          return (
            <div
              key={locale.code}
              className="flex items-center justify-between p-3 bg-black/30 border border-white/5 rounded-sm"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold uppercase w-8 text-primary/80">
                  {locale.code}
                </span>
                <span className="text-sm text-muted-foreground">{locale.label}</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Edit Overrides Button */}
                {isEnabled && (
                  <div title="Customize text (Coming Soon)">
                    <button className="p-1.5 hover:bg-white/10 rounded-sm text-muted-foreground hover:text-primary transition-colors opacity-50 cursor-not-allowed">
                      <Edit className="size-3" />
                    </button>
                  </div>
                )}

                {/* Toggle */}
                {loading === locale.code ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <button
                    onClick={() => toggleLocale(locale.code, !!isEnabled)}
                    // Prevent disabling English to avoid having 0 languages
                    disabled={locale.code === "en"}
                    className={`w-10 h-5 rounded-full relative transition-colors ${
                      isEnabled ? "bg-primary" : "bg-white/10"
                    } ${locale.code === "en" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div
                      className={`absolute top-1 bottom-1 w-3 bg-black rounded-full transition-all ${
                        isEnabled ? "left-6" : "left-1"
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
