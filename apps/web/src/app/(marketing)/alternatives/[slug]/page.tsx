import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostLayout from "@/components/blog/post-layout";
import { formatPostDate, getPostBySlug } from "@/lib/blog";
import { MarkdownRenderer, extractHeadings } from "@/lib/markdown";

export const dynamic = "force-dynamic";

const ALTERNATIVES_MAP: Record<string, string> = {
  freshping: "freshping-alternative",
};

const ALTERNATIVE_DESCRIPTIONS: Record<string, string> = {
  freshping:
    "Looking for a Freshping alternative? Migrate to SteadyStack for 50 free monitors, 1-minute checks, multi-region quorum, and zero hidden fees.",
};

const ALTERNATIVE_TITLES: Record<string, string> = {
  freshping: "Top Free Freshping Alternatives in 2026",
};

export function generateStaticParams() {
  return [{ slug: "freshping" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const targetSlug = ALTERNATIVES_MAP[slug] || `${slug}-alternative`;
  const post = await getPostBySlug(targetSlug);
  if (!post) return {};

  const { date, tags } = post.meta;
  const title = ALTERNATIVE_TITLES[slug] || `Top ${slug} Alternatives | SteadyStack`;
  const description =
    ALTERNATIVE_DESCRIPTIONS[slug] ||
    `Compare top alternatives to ${slug} and learn how to migrate your monitors to SteadyStack with zero downtime.`;
  const url = `https://steadystack.dev/alternatives/${slug}`;

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

export default async function AlternativeSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const targetSlug = ALTERNATIVES_MAP[slug] || `${slug}-alternative`;
  const post = await getPostBySlug(targetSlug);

  if (!post) notFound();

  const { title, date, category, readTime, author, tags } = post.meta;
  const description =
    ALTERNATIVE_DESCRIPTIONS[slug] ||
    `Compare top alternatives to ${slug} and learn how to migrate your monitors to SteadyStack with zero downtime.`;
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
    mainEntityOfPage: `https://steadystack.dev/alternatives/${slug}`,
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
        slug={`alternatives/${slug}`}
        tocItems={tocItems}
      >
        <MarkdownRenderer content={post.content} />
      </PostLayout>
    </>
  );
}
