"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { LOCALES } from "@/i18n/locales";
import { useLocale } from "next-intl";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  let locale = "en";
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    locale = useLocale();
  } catch {
    locale = "en";
  }

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex gap-1 text-xs font-mono uppercase border border-border rounded-full p-1 bg-muted/40">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => handleChange(l.code)}
          className={`px-2.5 py-0.5 rounded-full transition-all text-xs ${
            locale === l.code
              ? "bg-background text-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
