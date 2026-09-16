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
 * Read the user's saved locale preference via better-auth. Wrapped in
 * try/catch: request.ts runs for every request — including unauthenticated
 * and static-generation contexts — and must never break rendering.
 */
async function userLocaleOverride(): Promise<string | undefined> {
  try {
    const { auth } = await import("@steadystack/auth");
    const h = await headers();
    const session = await auth.api.getSession({ headers: h });
    const locale = (session?.user as unknown as { locale?: string } | undefined)?.locale;
    if (locale && routing.locales.includes(locale as any)) {
      return locale;
    }
  } catch {
    // Unauthenticated or auth unavailable — browser/default locale applies.
  }
  return undefined;
}
