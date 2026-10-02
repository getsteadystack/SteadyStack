/**
 * Locale-aware formatting helpers.
 *
 * Single entry point for all user-facing date/time/number formatting in the
 * app. Two usage patterns:
 *
 * - Client components: `const f = useFormatters(); f.formatUptime(99.98)`
 *   — automatically bound to the active next-intl locale.
 * - Server components / anywhere else: pass `{ locale }` explicitly.
 *
 * Prefer these over raw `toLocaleString()` calls so formatting is consistent
 * across the app and a locale switch changes every display at once.
 */

import { useLocale } from "next-intl";
import { DEFAULT_LOCALE } from "@/i18n/locales";

// ============================================================================
// Dates & times
// ============================================================================

export type DateStyle = "date" | "time" | "datetime";

export function formatDate(
  value: Date | string | number,
  opts: { locale?: string; style?: DateStyle; timeStyle?: "short" | "medium" } = {},
): string {
  const locale = opts.locale ?? DEFAULT_LOCALE;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const style = opts.style ?? "datetime";
  const timeStyle = opts.timeStyle ?? "short";

  try {
    if (style === "date") {
      return date.toLocaleDateString(locale, { dateStyle: "medium" });
    }
    if (style === "time") {
      return date.toLocaleTimeString(locale, { timeStyle });
    }
    return date.toLocaleString(locale, { dateStyle: "medium", timeStyle });
  } catch {
    return date.toISOString();
  }
}

// ============================================================================
// Numbers
// ============================================================================

export function formatNumber(value: number, opts: { locale?: string } = {}): string {
  const locale = opts.locale ?? DEFAULT_LOCALE;
  try {
    return value.toLocaleString(locale);
  } catch {
    return value.toLocaleString(DEFAULT_LOCALE);
  }
}

/**
 * Uptime percentage: 3 decimal places, locale decimal separator.
 * (99.982125 → "99,982" in de, "99.982" in en — append the % sign in markup.)
 */
export function formatUptime(value: number, opts: { locale?: string } = {}): string {
  const locale = opts.locale ?? DEFAULT_LOCALE;
  try {
    return value.toLocaleString(locale, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  } catch {
    return value.toLocaleString(DEFAULT_LOCALE, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    });
  }
}

/** Raw latency in milliseconds with locale digit grouping (1234567 → "1,234,567"). */
export function formatLatency(value: number, opts: { locale?: string } = {}): string {
  return formatNumber(value, opts);
}

/** Latency with a smart unit: < 1000 ms → "450 ms"; ≥ 1000 → "1.2 s". */
export function formatLatencySmart(value: number, opts: { locale?: string } = {}): string {
  const locale = opts.locale ?? DEFAULT_LOCALE;
  if (value < 1000) {
    return `${formatNumber(Math.round(value), { locale })} ms`;
  }
  const seconds = value / 1000;
  const formatted = seconds.toLocaleString(locale, { maximumFractionDigits: 2 });
  return `${formatted} s`;
}

// ============================================================================
// Client hook
// ============================================================================

/**
 * Client-component hook bundle: the active locale plus all formatters bound
 * to it. Call unconditionally at the top of the component.
 */
export function useFormatters() {
  const locale = useLocale();
  return {
    locale,
    formatDate: (
      value: Date | string | number,
      o: Omit<Parameters<typeof formatDate>[1], "locale"> = {},
    ) => formatDate(value, { ...o, locale }),
    formatNumber: (value: number) => formatNumber(value, { locale }),
    formatUptime: (value: number) => formatUptime(value, { locale }),
    formatLatency: (value: number) => formatLatency(value, { locale }),
    formatLatencySmart: (value: number) => formatLatencySmart(value, { locale }),
  };
}
