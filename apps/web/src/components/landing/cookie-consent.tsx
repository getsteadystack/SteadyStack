"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const CONSENT_KEY = "steadystack-cookie-consent";

type ConsentValue = "accepted" | "rejected";

/**
 * GDPR cookie consent banner.
 *
 * Read the room first: SteadyStack currently runs exactly one third-party
 * data collection — Vercel Analytics (privacy-first, no cookies, aggregated).
 * Because no tracking cookies are set, the banner's job is honest
 * transparency, not a dark pattern: one "Accept" that stores the choice for a
 * year, one explicit "Decline" that is honored as a real refusal (and is
 * persisted so the banner doesn't nag), plus a link to the privacy policy.
 *
 * If real analytics cookies (PostHog, GA, …) are ever added, gate their
 * initialization on `localStorage[CONSENT_KEY] === "accepted"` — the "if
 * tracking scripts" marker in the effect below shows where.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Never show the banner to bots/crawlers — they never consent anyway and
    // it pollutes screenshots and SEO snapshots.
    if (navigator.userAgent.startsWith("(http")) return;

    const stored = localStorage.getItem(CONSENT_KEY) as ConsentValue | null;
    if (!stored) {
      // Small delay so the banner doesn't flash over first paint / hydration.
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
    if (stored === "accepted") {
      // Consent exists — this is where conditional analytics init would go.
    }
  }, []);

  const choose = (value: ConsentValue) => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 p-4 rounded-xl border border-border bg-background/95 backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <Cookie className="size-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-foreground">Cookies & analytics</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            We use essential cookies to keep you signed in and privacy-first,
            aggregated analytics to understand which pages help. No ad
            tracking. Details in our{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end">
        <button
          onClick={() => choose("rejected")}
          className="px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all cursor-pointer"
        >
          Decline
        </button>
        <button
          onClick={() => choose("accepted")}
          className="px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-wider rounded-lg bg-primary text-black hover:bg-primary/90 transition-all cursor-pointer"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
