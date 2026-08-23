import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsLayout } from "@/components/docs/docs-layout";
import { getAllDocSlugs, getDocBySlug, getAdjacentDocs } from "@/lib/docs";
import { MarkdownRenderer } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) return {};

  const { title, description } = doc.meta;
  const url = `https://steadystack.dev/docs/${slug}`;

  return {
    title: `${title} | SteadyStack Docs`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${title} — SteadyStack Documentation`,
      description,
      siteName: "SteadyStack",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | SteadyStack Docs`,
      description,
    },
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const { prev, next } = getAdjacentDocs(slug);

  return (
    <DocsLayout doc={doc} prevDoc={prev} nextDoc={next}>
      <MarkdownRenderer content={doc.content} />
    </DocsLayout>
  );
}
