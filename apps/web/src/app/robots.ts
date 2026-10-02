import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://steadystack.dev";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/blog",
  "/comparison",
  "/privacy",
  "/terms",
  "/hall-of-fame",
  "/showcase",
  "/features/",
  "/tools/",
  "/status-page/",
  "/docs",
  "/docs/",
  "/llms.txt",
  "/llms-full.txt",
];

const PRIVATE_PATHS = [
  "/dashboard",
  "/dashboard/",
  "/settings",
  "/settings/",
  "/api/",
  "/_next/",
  "/static/",
];

/**
 * Robots for search engines AND answer engines.
 *
 * AI crawlers are explicitly allowed so assistants (ChatGPT, Perplexity,
 * Claude, Google AI Overviews, Apple Intelligence) can read and cite the
 * docs, benchmarks, and comparison pages. Marketing/answer surfaces are open;
 * app and API surfaces stay closed for everyone.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: PUBLIC_PATHS,
        disallow: PRIVATE_PATHS,
      },
      {
        // --- Answer-engine crawlers: same policy, stated explicitly so
        // their presence is intentional and auditable ---
        userAgent: [
          "GPTBot", // OpenAI training
          "OAI-SearchBot", // ChatGPT Search
          "ChatGPT-User", // ChatGPT live browsing
          "PerplexityBot", // Perplexity index
          "Perplexity-User", // Perplexity live lookup
          "ClaudeBot", // Anthropic training
          "Claude-User", // Claude live browsing
          "Claude-SearchBot", // Claude search
          "Google-Extended", // Gemini/AI Overviews grounding
          "Applebot", // Apple Intelligence/Siri
          "Applebot-Extended",
          "meta-externalagent",
          "Bytespider", // ByteDance (notorious for ignoring robots, but be explicit)
        ],
        allow: PUBLIC_PATHS,
        disallow: PRIVATE_PATHS,
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
