"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { LOCALES, DEFAULT_LOCALE } from "@/i18n/locales";

/**
 * Landing-page locale switcher (footer).
 *
 * Falls back to the default locale when rendered outside the intl provider.
 * Uses plain URL rewriting: strip the current locale prefix, prepend the new
 * one. Avoids typed-routes friction with dynamic locale segments.
 */
export function FooterLocaleSwitcher() {
  let activeLocale = DEFAULT_LOCALE;
  try {
    activeLocale = useLocale();
  } catch {
    // Rendered outside NextIntlClientProvider — keep default.
  }

  const router = useRouter();

  const handleChange = (next: string) => {
    if (next === activeLocale) return;

    // Strip an existing locale prefix from the current path, prepend the new one.
    const path = window.location.pathname;
    const segments = path.split("/").filter(Boolean);
    const first = segments[0]?.toLowerCase();
    const hadPrefix = LOCALES.some((l) => l.code.toLowerCase() === first);
    const rest = hadPrefix ? "/" + segments.slice(1).join("/") : path;
    const suffix = rest.replace(/\/+$/, "") || "/";
    const target = next === DEFAULT_LOCALE ? suffix : `/${next}${suffix === "/" ? "" : suffix}`;

    // Typed routes can't represent dynamic locale segments; safe cast with a
    // runtime-validated path (we constructed it from window.location).
    router.push(target as Route);
    type Route = Parameters<typeof router.push>[0];
  };

  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">Change language</span>
      <select
        value={activeLocale}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-transparent border border-border rounded-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 text-xs font-medium px-2.5 py-1.5 font-mono transition-colors focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code} className="bg-background text-foreground">
            {l.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
