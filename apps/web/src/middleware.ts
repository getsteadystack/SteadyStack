import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  const pathname = url.pathname;

  // 🛡️ Dashboard Authentication & Logic (exclude from i18n for now)
  // NOTE: We intentionally avoid DB calls in middleware (auth.api.getSession) to prevent
  // connection pool exhaustion under load. Cookie presence is sufficient for routing;
  // actual session validation happens in each page/API route server-side.
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/login")) {
    const cookieHeader = request.headers.get("cookie") || "";
    const hasSessionCookie =
      cookieHeader.includes("better-auth.session_token") || cookieHeader.includes("session_token");

    if (pathname.startsWith("/dashboard") && !hasSessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  // 🌍 Status Page & Custom Domain Logic with i18n
  const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  const appHost = appUrl.host;
  const isStatusPageDomain = hostname.startsWith("status.");
  const isLocalhost =
    hostname.startsWith("localhost") ||
    hostname.startsWith("127.0.0.1") ||
    hostname.startsWith("0.0.0.0") ||
    hostname.startsWith("[::1]");

  const isCustomDomain =
    !isLocalhost &&
    hostname !== `app.${appHost}` &&
    hostname !== appHost &&
    !hostname.includes("vercel.app");

  if (isStatusPageDomain || isCustomDomain) {
    // 1. Let next-intl handle locale detection and redirects
    // Suppress type error due to Next.js version resolution mismatch in monorepo
    const intlResponse = intlMiddleware(request as any);

    // If next-intl triggered a redirect, follow it.
    if (intlResponse.headers.get("Location")) {
      return intlResponse;
    }

    // 2. Parse Locale manually to construct rewrite target
    const pathParts = pathname.split("/").filter(Boolean);
    const hasLocale = pathParts.length > 0 && routing.locales.includes(pathParts[0] as any);
    const locale = hasLocale ? pathParts[0] : routing.defaultLocale;

    // Path without locale (ensure we treat root / correctly)
    const pathWithoutLocale = hasLocale ? "/" + pathParts.slice(1).join("/") : pathname;

    // 3. Construct Rewrite Target
    let rewriteTarget = "";

    if (isStatusPageDomain) {
      rewriteTarget = `/${locale}/status-page${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;

      // Avoid infinite loop if already rewritten (check via header or path structure?)
      // next-intl middleware might have already set x-middleware-rewrite.
      // But we are overriding with our own rewrite.

      url.pathname = rewriteTarget;
      return NextResponse.rewrite(url);
    } else if (isCustomDomain) {
      rewriteTarget = `/${locale}/status-page/domain/${hostname}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;

      url.pathname = rewriteTarget;
      return NextResponse.rewrite(url);
    }
  }

  // 4. Handle standard /status-page routes for localhost and main domain (path-based access)
  const isStatusPagePath =
    pathname.startsWith("/status-page") ||
    routing.locales.some((loc) => pathname.startsWith(`/${loc}/status-page`));

  if (isStatusPagePath) {
    return intlMiddleware(request as any);
  }

  return NextResponse.next();
}
