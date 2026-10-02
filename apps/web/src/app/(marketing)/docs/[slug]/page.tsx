import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsLayout } from "@/components/docs/docs-layout";
import { getAllDocSlugs, getDocBySlug, getAdjacentDocs } from "@/lib/docs";
import { MarkdownRenderer } from "@/lib/markdown";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://steadystack.dev";

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
  const url = `${BASE_URL}/docs/${slug}`;

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

  // Article + Breadcrumb JSON-LD — how answer engines attribute citations and
  // understand site hierarchy for docs pages.
  const url = `${BASE_URL}/docs/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: doc.meta.title,
        description: doc.meta.description,
        dateModified: doc.meta.lastUpdated,
        inLanguage: "en",
        author: { "@type": "Organization", name: "SteadyStack" },
        publisher: { "@type": "Organization", name: "SteadyStack" },
        mainEntityOfPage: url,
        isPartOf: { "@id": `${BASE_URL}/docs` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Docs", item: `${BASE_URL}/docs` },
          {
            "@type": "ListItem",
            position: 2,
            name: doc.meta.section,
            item: `${BASE_URL}/docs`,
          },
          { "@type": "ListItem", position: 3, name: doc.meta.title, item: url },
        ],
        "@id": `${url}#breadcrumb`,
      },
    ],
  };

  return (
    <DocsLayout doc={doc} prevDoc={prev} nextDoc={next}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MarkdownRenderer content={doc.content} />
    </DocsLayout>
  );
}
