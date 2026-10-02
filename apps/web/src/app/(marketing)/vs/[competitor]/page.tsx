import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostLayout from "@/components/blog/post-layout";
import { formatPostDate, getPostBySlug } from "@/lib/blog";
import { MarkdownRenderer, extractHeadings } from "@/lib/markdown";

export const dynamic = "force-dynamic";

const COMPETITOR_MAP: Record<string, string> = {
  uptimerobot: "vs-uptimerobot",
  "better-stack": "vs-better-stack",
  betteruptime: "vs-better-stack",
  checkly: "vs-checkly",
  "uptime-kuma": "vs-uptime-kuma",
  kuma: "vs-uptime-kuma",
};

const COMPETITOR_DESCRIPTIONS: Record<string, string> = {
  uptimerobot:
    "Compare SteadyStack vs UptimeRobot. See why 60-second multi-region edge consensus eliminates false positives and outperforms legacy 5-minute polling.",
  "better-stack":
    "Compare SteadyStack vs Better Stack. See how edge consensus monitoring, check frequency, alert latency, and transparent pricing compare head-to-head.",
  betteruptime:
    "Compare SteadyStack vs Better Stack. See how edge consensus monitoring, check frequency, alert latency, and transparent pricing compare head-to-head.",
  checkly:
    "Compare SteadyStack vs Checkly. Explore lightweight edge synthetic monitoring vs heavy browser checks, global quorum consensus, and pricing.",
  "uptime-kuma":
    "Compare SteadyStack vs Uptime Kuma. Discover the differences between single-VPS self-hosting and global edge quorum checks for zero false alarms.",
  kuma: "Compare SteadyStack vs Uptime Kuma. Discover the differences between single-VPS self-hosting and global edge quorum checks for zero false alarms.",
};

const COMPETITOR_TITLES: Record<string, string> = {
  uptimerobot: "SteadyStack vs UptimeRobot (2026 Comparison)",
  "better-stack": "SteadyStack vs Better Stack Comparison",
  betteruptime: "SteadyStack vs Better Stack Comparison",
  checkly: "SteadyStack vs Checkly Comparison",
  "uptime-kuma": "SteadyStack vs Uptime Kuma Comparison",
  kuma: "SteadyStack vs Uptime Kuma Comparison",
};

export function generateStaticParams() {
  return [
    { competitor: "uptimerobot" },
    { competitor: "better-stack" },
    { competitor: "checkly" },
    { competitor: "uptime-kuma" },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>;
}): Promise<Metadata> {
  const { competitor } = await params;
  const targetSlug = COMPETITOR_MAP[competitor] || `vs-${competitor}`;
  const post = await getPostBySlug(targetSlug);
  if (!post) return {};

  const { date, tags } = post.meta;
  const title = COMPETITOR_TITLES[competitor] || `SteadyStack vs ${competitor} Comparison`;
  const description =
    COMPETITOR_DESCRIPTIONS[competitor] ||
    `Compare SteadyStack vs ${competitor}. Discover key architecture differences, check frequencies, and edge consensus reliability.`;
  const url = `https://steadystack.dev/vs/${competitor}`;

  return {
    title,
    description,
    keywords: tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: "SteadyStack",
      publishedTime: date,
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function VsCompetitorPage({
  params,
}: {
  params: Promise<{ competitor: string }>;
}) {
  const { competitor } = await params;
  const targetSlug = COMPETITOR_MAP[competitor] || `vs-${competitor}`;
  const post = await getPostBySlug(targetSlug);

  if (!post) notFound();

  const { title, date, category, readTime, author, tags } = post.meta;
  const description =
    COMPETITOR_DESCRIPTIONS[competitor] ||
    `Compare SteadyStack vs ${competitor}. Discover key architecture differences, check frequencies, and edge consensus reliability.`;
  const tocItems = extractHeadings(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description,
    datePublished: date,
    dateModified: date,
    author: { "@type": "Person", name: author },
    creator: { "@type": "Person", name: author },
    publisher: {
      "@type": "Organization",
      name: "SteadyStack",
      url: "https://steadystack.dev",
    },
    mainEntityOfPage: `https://steadystack.dev/vs/${competitor}`,
    keywords: tags.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostLayout
        title={title}
        description={description}
        date={formatPostDate(date)}
        readTime={readTime}
        category={category}
        author={author}
        tags={tags}
        slug={`vs/${competitor}`}
        tocItems={tocItems}
      >
        <MarkdownRenderer content={post.content} />
      </PostLayout>
    </>
  );
}
