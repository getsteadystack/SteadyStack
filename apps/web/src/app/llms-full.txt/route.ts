import { NextResponse } from "next/server";
import { getAllDocs } from "@/lib/docs";

export const dynamic = "force-static";
export const revalidate = 86400;

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://steadystack.dev";

/**
 * /llms-full.txt — the llmstxt.org optional extension.
 *
 * Same audience as /llms.txt (answer engines, RAG pipelines) but contains the
 * complete markdown content of every docs page, so assistants can quote exact
 * configuration steps and answers without a round-trip per page. Generated
 * from the same MDX source the docs site renders, so it can never drift from
 * what the docs actually say.
 *
 * Format per page: an H1 with the doc title, the canonical URL, the
 * frontmatter description, then the full markdown body.
 */
export function GET() {
  const docs = getAllDocs();
  const sections: string[] = [];

  sections.push("# SteadyStack Documentation");
  sections.push("");
  sections.push(
    "> Complete documentation for SteadyStack, a multi-region uptime monitoring platform with 4-of-7 quorum consensus verification. Covers monitor setup (HTTP, SSL, DNS, heartbeat, TCP), response assertions, alert routing, status pages, and integrations (Terraform, GitHub Actions, Prometheus, Slack, PagerDuty).",
  );
  sections.push("");
  sections.push(`Generated from source on ${new Date().toISOString().slice(0, 10)}.`);
  sections.push("");

  for (const doc of docs) {
    const url = `${BASE_URL}/docs/${doc.slug}`;

    sections.push(`---`);
    sections.push("");
    sections.push(`# ${doc.meta.title}`);
    sections.push("");
    sections.push(`Source: ${url}`);
    sections.push(`Section: ${doc.meta.section}`);
    if (doc.meta.lastUpdated) {
      sections.push(`Last updated: ${doc.meta.lastUpdated}`);
    }
    sections.push("");
    sections.push(doc.meta.description);
    sections.push("");
    // The MDX body already has ##/### headings — demote them under the H1
    // we injected so each doc has exactly one top-level heading.
    sections.push(doc.content.replaceAll(/^(#{2,6}) /gm, "## "));
    sections.push("");
  }

  return new NextResponse(sections.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
