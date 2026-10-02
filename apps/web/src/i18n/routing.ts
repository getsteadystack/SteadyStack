import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";
import { LOCALES, LOCALE_CODES } from "./locales";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: LOCALE_CODES as [string, ...string[]],

  // Used when no locale matches
  defaultLocale: "en",

  // Disable automatic locale prefix for the default locale to keep URLs clean check docs if needed
  // But for now, we'll keep it standard: /en, /es, etc. or just detect.
  // We want shared routing.
});

export { LOCALES };

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
