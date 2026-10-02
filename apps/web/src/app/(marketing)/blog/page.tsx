import type { Metadata } from "next";
import { FileText, Sparkles } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import { BlogListing } from "@/components/blog/blog-listing";
import NewsletterForm from "@/components/blog/newsletter-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Engineering Blog & Architecture Insights | SteadyStack",
  description:
    "Engineering deep-dives, distributed consensus architectures, uptime benchmarking, and incident response guides from the SteadyStack team.",
  openGraph: {
    title: "Engineering Blog & Architecture Insights | SteadyStack",
    description:
      "Engineering deep-dives, distributed consensus architectures, uptime benchmarking, and incident response guides.",
    siteName: "SteadyStack",
  },
  alternates: {
    canonical: "https://steadystack.dev/blog",
  },
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbf9] text-[#23211a]">
      {/* Hero Header */}
      <section className="pt-28 pb-14 md:pt-36 md:pb-20 relative overflow-hidden border-b border-[#e8e6df]">
        <div className="max-w-5xl mx-auto px-6 md:px-12 flex flex-col items-center text-center gap-6 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#ffd439]/60 bg-[#ffd439]/20 text-[#23211a] text-[10px] font-bold font-mono uppercase tracking-widest rounded-full shadow-xs">
            <Sparkles className="size-3 text-[#23211a]" />
            Engineering &amp; Agency Publications
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#23211a] max-w-3xl leading-[1.1]">
            Engineering insights &amp; monitoring architecture
          </h1>
          <p className="text-[#5c5c5c] text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
            In-depth technical guides on multi-region edge consensus, white-label client reporting,
            SLA verification, and building monitoring infrastructure that never sounds a false
            alarm.
          </p>
        </div>
      </section>

      {/* Main Blog Explorer & Posts */}
      <section className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <BlogListing posts={posts} />
        </div>
      </section>

      {/* Newsletter / Insights Subscription */}
      <NewsletterForm />
    </div>
  );
}
