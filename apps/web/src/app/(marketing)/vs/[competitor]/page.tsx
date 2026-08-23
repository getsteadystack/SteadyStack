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

  const { title, description, date, tags } = post.meta;
  const url = `https://steadystack.dev/vs/${competitor}`;

  return {
    title: `${title} | SteadyStack Architecture`,
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

  const { title, description, date, category, readTime, author, tags } = post.meta;
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
