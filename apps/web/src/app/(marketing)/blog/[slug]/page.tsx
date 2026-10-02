import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostLayout from "@/components/blog/post-layout";
import { formatPostDate, getAllPosts, getPostBySlug } from "@/lib/blog";
import { MarkdownRenderer, extractHeadings } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const { title, description, date, tags } = post.meta;
  const url = `https://steadystack.dev/blog/${slug}`;
  const pageTitle = title.includes("SteadyStack")
    ? title
    : title.length + 14 <= 60
      ? `${title} | SteadyStack`
      : title;

  return {
    title: pageTitle,
    description,
    keywords: tags,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: pageTitle,
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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const { title, description, date, category, readTime, author, tags } = post.meta;

  const tocItems = extractHeadings(post.content);

  const allPosts = getAllPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== slug)
    .sort((a, b) => {
      // Prioritize same category or shared tags
      const aMatchesCat = a.meta.category === category ? 2 : 0;
      const bMatchesCat = b.meta.category === category ? 2 : 0;
      const aSharedTags = a.meta.tags.filter((t) => tags.includes(t)).length;
      const bSharedTags = b.meta.tags.filter((t) => tags.includes(t)).length;
      return bMatchesCat + bSharedTags - (aMatchesCat + aSharedTags);
    })
    .slice(0, 3)
    .map((p) => ({
      slug: p.slug,
      title: p.meta.title,
      description: p.meta.description,
      date: formatPostDate(p.meta.date),
      category: p.meta.category,
      readTime: p.meta.readTime,
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: date,
    dateModified: date,
    author: { "@type": "Person", name: author, url: "https://steadystack.dev" },
    creator: { "@type": "Person", name: author, url: "https://steadystack.dev" },
    publisher: {
      "@type": "Organization",
      name: "SteadyStack",
      url: "https://steadystack.dev",
    },
    mainEntityOfPage: `https://steadystack.dev/blog/${slug}`,
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
        slug={slug}
        tocItems={tocItems}
        relatedPosts={relatedPosts}
      >
        <MarkdownRenderer content={post.content} />
      </PostLayout>
    </>
  );
}
