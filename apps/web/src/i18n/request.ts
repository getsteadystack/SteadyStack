import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { routing } from "./routing";

/**
 * Resolve the effective request locale:
 *
 * 1. URL locale segment (next-intl default behavior)
 * 2. Logged-in user's saved `locale` preference (per-user override)
 * 3. Browser detection (next-intl default)
 * 4. Default locale (`en`)
 *
 * The user override wins over browser detection, but the URL segment wins
 * over the user — so /es/... still renders Spanish even for an en-prefixed
 * user. That keeps the language switcher functional for everyone.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = (await userLocaleOverride()) ?? "";
  }

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

/**
 * Read the user's saved locale preference via cookies/headers.
 * Avoid importing server auth/database packages to ensure compatibility
 * with Edge Middleware and avoid connection pool exhaustion.
 */
async function userLocaleOverride(): Promise<string | undefined> {
  try {
    const h = await headers();
    const cookieHeader = h.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|;\s*)(?:NEXT_LOCALE|locale|user_locale)=([^;]+)/);
    if (match && match[1]) {
      const locale = decodeURIComponent(match[1]);
      if (routing.locales.includes(locale as any)) {
        return locale;
      }
    }
  } catch {
    // Unauthenticated or auth unavailable — browser/default locale applies.
  }
  return undefined;
}
