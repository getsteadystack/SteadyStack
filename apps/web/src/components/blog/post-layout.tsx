import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Tag, ArrowRight, ShieldCheck, Zap } from "lucide-react";
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
  author = "Alex Gutscher",
  tags = [],
  slug,
  tocItems = [],
  relatedPosts = [],
  children,
}: PostLayoutProps) {
  const currentUrl = slug ? `https://steadystack.dev/blog/${slug}` : undefined;

  const categoryColor =
    category === "Engineering"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      : category === "Product"
        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
        : "border-sky-500/30 bg-sky-500/10 text-sky-400";

  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20 selection:text-primary">
      <ReadingProgress />

      {/* Hero Header */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 bg-background relative overflow-hidden border-b border-border/80">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 md:px-12 flex flex-col gap-6 relative">
          <div className="flex items-center justify-between gap-4">
            <Link
              href={"/blog" as any}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Blog</span>
            </Link>
            <div className="hidden sm:block">
              <ShareButtons title={title} url={currentUrl} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-[10px] font-bold font-mono uppercase tracking-widest rounded-md ${categoryColor}`}
            >
              {category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            {title}
          </h1>

          {description && (
            <p className="text-base sm:text-lg text-muted-foreground/90 leading-relaxed max-w-3xl">
              {description}
            </p>
          )}

          {/* Author & Meta Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/60">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-primary font-bold text-xs shadow-inner">
                {author.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                  {author}
                </span>
                <span className="text-[11px] text-muted-foreground">SteadyStack Engineering</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground/70 font-mono">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground/50" />
                {date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground/50" />
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
      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-12 items-start">
            {/* Article Body */}
            <article className="min-w-0 max-w-3xl">
              {children}

              {/* Tags Cloud */}
              {tags.length > 0 && (
                <div className="mt-12 pt-6 border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-mono">
                    <Tag className="size-3.5 text-primary" />
                    <span>Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-zinc-900/80 text-zinc-300 border border-border/80"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Bio Card */}
              <div className="my-12 p-6 rounded-xl border border-border/80 bg-zinc-950/50 backdrop-blur-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="size-14 rounded-full bg-zinc-900 border border-zinc-700/80 flex items-center justify-center text-primary font-bold text-lg shrink-0 shadow-lg">
                  {author.charAt(0)}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground m-0">{author}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-semibold">
                      Author
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed m-0">
                    Core engineer and distributed systems enthusiast at SteadyStack. Building global
                    edge monitoring mesh networks and 4-of-7 quorum incident alert pipelines.
                  </p>
                </div>
              </div>

              {/* Share Bar */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/20 my-8">
                <span className="text-xs font-medium text-foreground">
                  Found this article helpful?
                </span>
                <ShareButtons title={title} url={currentUrl} />
              </div>

              {/* High-Impact CTA Banner */}
              <div className="my-12 p-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-zinc-950 to-zinc-950 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative flex flex-col gap-4">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold font-mono text-primary uppercase tracking-widest">
                    <Zap className="size-3.5" />
                    Quorum-Verified Monitoring
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight m-0">
                    Stop 3 AM false alarms with SteadyStack
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed m-0 max-w-xl">
                    Get multi-region edge quorum consensus verification, zero false alarms, and
                    custom branded status pages — completely free for up to 50 monitors.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link
                      href={"/auth/sign-up" as any}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg shadow hover:bg-primary/90 transition-all"
                    >
                      <span>Start Free Monitoring</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                    <Link
                      href={"/pricing" as any}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-zinc-300 hover:text-foreground font-semibold text-xs rounded-lg border border-border transition-colors"
                    >
                      <span>View Pricing</span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            {/* Sticky Sidebar on Desktop */}
            {tocItems.length > 0 && (
              <aside className="hidden lg:block sticky top-24 space-y-6">
                <TableOfContents items={tocItems} />

                <div className="p-4 rounded-xl border border-border/80 bg-card/40 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-foreground mb-2">
                    <ShieldCheck className="size-3.5 text-primary" />
                    <span>SteadyStack Free</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
                    50 monitors (3m standard, 1m for first 10), 3 global edge regions, and 2-of-3
                    quorum consensus.
                  </p>
                  <Link
                    href={"/auth/sign-up" as any}
                    className="inline-flex items-center justify-center w-full py-1.5 text-[11px] font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30 rounded-md transition-colors"
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
        <section className="py-16 border-t border-border/80 bg-zinc-950/50">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-primary font-mono uppercase tracking-widest">
                  Read Next
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight m-0">
                  Related Engineering &amp; Product Guides
                </h2>
              </div>
              <Link
                href={"/blog" as any}
                className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}` as any}
                  className="group flex flex-col justify-between p-5 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold text-primary font-mono uppercase tracking-wider">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60 font-mono">
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug m-0">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed m-0">
                      {post.description}
                    </p>
                  </div>
                  <div className="pt-4 flex items-center text-[11px] font-semibold text-primary gap-1 group-hover:translate-x-1 transition-transform">
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
      <section className="border-t border-border/80 bg-background py-8">
        <div className="max-w-4xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link
            href={"/blog" as any}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to All Articles</span>
          </Link>
          <Link
            href={"/showcase" as any}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <span>Explore Status Page Showcase</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
