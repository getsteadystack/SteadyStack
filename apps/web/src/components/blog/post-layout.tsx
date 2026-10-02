import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Tag,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { ShareButtons } from "@/components/blog/share-buttons";
import { TableOfContents, type TocItem } from "@/components/blog/table-of-contents";

export interface RelatedPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readTime: string;
}

interface PostLayoutProps {
  title: string;
  description?: string;
  date: string;
  readTime: string;
  category: string;
  author?: string;
  tags?: string[];
  slug?: string;
  tocItems?: TocItem[];
  relatedPosts?: RelatedPost[];
  children: ReactNode;
}

export default function PostLayout({
  title,
  description,
  date,
  readTime,
  category,
  author = "SteadyStack Team",
  tags = [],
  slug,
  tocItems = [],
  relatedPosts = [],
  children,
}: PostLayoutProps) {
  const currentUrl = slug
    ? slug.startsWith("http")
      ? slug
      : slug.startsWith("vs/") || slug.startsWith("alternatives/")
        ? `https://steadystack.dev/${slug}`
        : `https://steadystack.dev/blog/${slug}`
    : undefined;

  const categoryBadge =
    category === "Agency"
      ? "text-[#23211a] border-[#ffd439]/60 bg-[#ffd439]/20"
      : category === "Engineering"
        ? "text-emerald-800 border-emerald-200 bg-emerald-50"
        : category === "Product"
          ? "text-[#23211a] border-[#e8e6df] bg-white"
          : "text-amber-900 border-amber-200 bg-amber-50";

  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbf9] text-[#23211a] selection:bg-[#ffd439]/30 selection:text-[#23211a]">
      <ReadingProgress />

      {/* Hero Header */}
      <section className="pt-28 pb-14 md:pt-36 md:pb-20 relative overflow-hidden border-b border-[#e8e6df]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 flex flex-col gap-6 relative">
          <div className="flex items-center justify-between gap-4">
            <Link
              href={"/blog" as any}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#5c5c5c] hover:text-[#23211a] transition-colors group"
            >
              <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to all publications</span>
            </Link>
            <div className="hidden sm:block">
              <ShareButtons title={title} url={currentUrl} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 border text-[10px] font-bold font-mono uppercase tracking-widest rounded-full shadow-xs ${categoryBadge}`}
            >
              {category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight text-[#23211a] leading-[1.15]">
            {title}
          </h1>

          {description && (
            <p className="text-base sm:text-lg text-[#5c5c5c] leading-relaxed max-w-3xl font-sans">
              {description}
            </p>
          )}

          {/* Author & Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#e8e6df]">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-[#23211a] text-white flex items-center justify-center font-serif font-medium text-sm shadow-xs">
                {author.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#23211a]">{author}</span>
                <span className="text-[11px] text-[#868279] font-sans">
                  SteadyStack Engineering
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#868279] font-mono">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 text-[#868279]" />
                {date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-[#868279]" />
                {readTime}
              </span>
            </div>
          </div>

          <div className="sm:hidden pt-2">
            <ShareButtons title={title} url={currentUrl} />
          </div>
        </div>
      </section>

      {/* Main Content & Sticky TOC Layout */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12 items-start">
            {/* Article Body */}
            <article className="min-w-0 max-w-3xl">
              {children}

              {/* Tags Cloud */}
              {tags.length > 0 && (
                <div className="mt-12 pt-6 border-t border-[#e8e6df]">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#868279] mb-3 uppercase tracking-wider">
                    <Tag className="size-3.5 text-[#23211a]" />
                    <span>Topics</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-white text-[#5c5c5c] border border-[#e8e6df] shadow-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Bio Card */}
              <div className="my-10 p-6 rounded-2xl border border-[#e8e6df] bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="size-12 rounded-full bg-[#23211a] text-white flex items-center justify-center font-serif font-medium text-lg shrink-0 shadow-xs">
                  {author.charAt(0)}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-serif font-medium text-[#23211a] m-0">{author}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ffd439]/30 text-[#23211a] font-mono font-semibold">
                      Author
                    </span>
                  </div>
                  <p className="text-xs text-[#5c5c5c] leading-relaxed m-0 font-sans">
                    Core engineer and distributed systems researcher at SteadyStack. Building global
                    edge consensus monitoring networks, client uptime portals, and zero-false-alarm
                    architectures.
                  </p>
                </div>
              </div>

              {/* Share Bar */}
              <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-[#e8e6df] bg-white shadow-xs my-8">
                <span className="text-xs font-mono font-medium text-[#23211a]">
                  Found this article helpful?
                </span>
                <ShareButtons title={title} url={currentUrl} />
              </div>

              {/* High-Impact CTA Banner (Dark Editorial) */}
              <div className="my-12 p-8 sm:p-10 rounded-3xl border border-black/10 bg-[#23211a] text-white shadow-[0_24px_60px_rgba(0,0,0,0.14)] relative overflow-hidden">
                <div className="absolute -bottom-20 right-0 w-80 h-80 bg-[#ffd439]/15 rounded-full blur-[80px] pointer-events-none" />
                <div className="relative flex flex-col gap-4">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono text-[#ffd439] uppercase tracking-widest">
                    <Sparkles className="size-3.5 text-[#ffd439]" />
                    Quorum-Verified Monitoring for Agencies
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-medium text-white tracking-tight m-0 leading-tight">
                    Never get caught explaining false 3 AM alarms to clients
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed m-0 max-w-xl font-sans">
                    Deploy multi-region consensus verification, white-label client portals, and
                    branded monthly uptime SLA PDFs &mdash; free for up to 50 monitors.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-3">
                    <Link
                      href={"/auth/sign-up" as any}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-mono font-semibold uppercase tracking-wider text-xs rounded-xl shadow-xs transition-colors"
                    >
                      <span>Start Free Monitoring</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                    <Link
                      href={"/agencies" as any}
                      className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-mono text-xs rounded-xl border border-white/20 transition-colors"
                    >
                      <span>Explore Agency Retainers</span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            {/* Sticky Sidebar on Desktop */}
            {tocItems.length > 0 && (
              <aside className="hidden lg:block sticky top-24 space-y-6">
                <TableOfContents items={tocItems} />

                <div className="p-5 rounded-2xl border border-[#e8e6df] bg-white text-xs shadow-xs">
                  <div className="flex items-center gap-2 font-mono font-semibold text-[#23211a] text-[11px] uppercase tracking-wider mb-2">
                    <ShieldCheck className="size-3.5 text-[#23211a]" />
                    <span>SteadyStack Free Plan</span>
                  </div>
                  <p className="text-[11px] text-[#5c5c5c] leading-relaxed mb-4 font-sans">
                    50 monitors, 3 global edge regions, and multi-region consensus verification at
                    zero cost.
                  </p>
                  <Link
                    href={"/auth/sign-up" as any}
                    className="inline-flex items-center justify-center w-full py-2 text-xs font-mono font-semibold uppercase tracking-wider bg-[#23211a] hover:bg-[#23211a]/90 text-white rounded-xl transition-colors shadow-xs"
                  >
                    Try SteadyStack Free
                  </Link>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* Up Next / Related Posts Section */}
      {relatedPosts.length > 0 && (
        <section className="py-16 border-t border-[#e8e6df] bg-[#f0ede6]/40">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[#23211a] font-mono uppercase tracking-widest">
                  Read Next
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#23211a] tracking-tight m-0">
                  Related Publications &amp; Guides
                </h2>
              </div>
              <Link
                href={"/blog" as any}
                className="text-xs font-mono font-semibold text-[#23211a] hover:underline inline-flex items-center gap-1 uppercase tracking-wider"
              >
                <span>View all</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}` as any}
                  className="group flex flex-col justify-between p-6 rounded-2xl border border-[#e8e6df] bg-white hover:border-[#23211a]/30 hover:shadow-lg transition-all duration-300 shadow-xs"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-[#23211a] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#fbfbf9] border border-[#e8e6df]">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-[#868279] font-mono">{post.readTime}</span>
                    </div>
                    <h3 className="text-base font-serif font-medium text-[#23211a] group-hover:text-[#23211a] transition-colors line-clamp-2 leading-snug m-0">
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#5c5c5c] line-clamp-2 leading-relaxed m-0 font-sans">
                      {post.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-2 border-t border-[#e8e6df] flex items-center justify-between text-xs font-mono font-semibold text-[#23211a] group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                    <span>Read guide</span>
                    <ArrowRight className="size-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog Bottom Bar */}
      <section className="border-t border-[#e8e6df] bg-[#fbfbf9] py-8">
        <div className="max-w-4xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href={"/blog" as any}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#5c5c5c] hover:text-[#23211a] transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to All Articles</span>
          </Link>
          <Link
            href={"/showcase" as any}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#23211a] hover:underline"
          >
            <span>Explore Status Page Showcase</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
