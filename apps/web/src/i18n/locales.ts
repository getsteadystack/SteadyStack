/**
 * Single source of truth for supported locales.
 *
 * Every locale list in the app (routing, language switcher, status page
 * settings UI, hreflang alternates) should derive from this map instead of
 * hardcoding arrays — adding a locale here adds it everywhere.
 */

export type TextDirection = "ltr" | "rtl";

export interface LocaleInfo {
  /** BCP 47 code — also the URL prefix (/es, /pt-BR, ...) and messages filename. */
  code: string;
  /** Label for admin/settings UIs. */
  label: string;
  /** Native endonym shown to users in switchers. */
  nativeLabel: string;
  /** Text direction — drives <html dir> for RTL locales. */
  dir: TextDirection;
}

export const LOCALES: LocaleInfo[] = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "es", label: "Spanish", nativeLabel: "Español", dir: "ltr" },
  { code: "fr", label: "French", nativeLabel: "Français", dir: "ltr" },
  { code: "de", label: "German", nativeLabel: "Deutsch", dir: "ltr" },
  { code: "pt-BR", label: "Portuguese (Brazil)", nativeLabel: "Português (Brasil)", dir: "ltr" },
  { code: "ja", label: "Japanese", nativeLabel: "日本語", dir: "ltr" },
  { code: "ko", label: "Korean", nativeLabel: "한국어", dir: "ltr" },
  { code: "zh-CN", label: "Chinese (Simplified)", nativeLabel: "简体中文", dir: "ltr" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
];

export const DEFAULT_LOCALE = "en";

/** RTL locales — used to decide <html dir="rtl"> and logical-property fixes. */
export const RTL_LOCALES: readonly string[] = LOCALES.filter((l) => l.dir === "rtl").map((l) => l.code);

export function isRtlLocale(locale: string): boolean {
  return RTL_LOCALES.includes(locale);
}

export function getLocaleInfo(code: string): LocaleInfo | undefined {
  return LOCALES.find((l) => l.code === code);
}

/** Locale codes only, e.g. for next-intl routing. */
export const LOCALE_CODES: string[] = LOCALES.map((l) => l.code);
