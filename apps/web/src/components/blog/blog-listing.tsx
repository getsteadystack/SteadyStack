"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Clock, ArrowRight, Sparkles, BookOpen, Calendar, X } from "lucide-react";
import type { BlogPost } from "@/lib/blog-types";
import { formatPostDate } from "@/lib/blog-types";

interface BlogListingProps {
  posts: BlogPost[];
}

const CATEGORIES = ["All", "Engineering", "Product", "Guides", "Agency"] as const;

export function BlogListing({ posts }: BlogListingProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory = selectedCategory === "All" || post.meta.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      const inTitle = post.meta.title.toLowerCase().includes(query);
      const inDesc = post.meta.description.toLowerCase().includes(query);
      const inTags = post.meta.tags.some((tag) => tag.toLowerCase().includes(query));
      const inCategory = post.meta.category.toLowerCase().includes(query);

      return inTitle || inDesc || inTags || inCategory;
    });
  }, [posts, selectedCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: posts.length };
    for (const post of posts) {
      counts[post.meta.category] = (counts[post.meta.category] || 0) + 1;
    }
    return counts;
  }, [posts]);

  // Featured post: the first post when no filters are active
  const isFiltering = selectedCategory !== "All" || searchQuery.trim().length > 0;
  const featuredPost = !isFiltering && filteredPosts.length > 0 ? filteredPosts[0] : null;
  const gridPosts =
    !isFiltering && filteredPosts.length > 0 ? filteredPosts.slice(1) : filteredPosts;

  return (
    <div className="flex flex-col gap-10 font-sans">
      {/* Search and Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-[#e8e6df]">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3.5 py-1.5 text-xs font-mono font-semibold rounded-xl border transition-all duration-200 flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isSelected
                    ? "bg-[#23211a] text-white border-[#23211a]"
                    : "bg-white text-[#5c5c5c] border-[#e8e6df] hover:text-[#23211a] hover:bg-[#f0ede6]"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-[#fbfbf9] text-[#868279] border border-[#e8e6df]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#868279]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides & comparisons..."
            className="w-full pl-9 pr-8 py-2 text-xs font-mono bg-white border border-[#e8e6df] rounded-xl text-[#23211a] placeholder:text-[#868279] focus:outline-none focus:border-[#23211a] transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#868279] hover:text-[#23211a] p-0.5 cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* Featured Post Spotlight (shown when unfiltered) */}
      {featuredPost && (
        <div className="relative group">
          <Link
            href={`/blog/${featuredPost.slug}` as any}
            className="block p-7 sm:p-10 rounded-3xl border border-black/[0.1] bg-[#23211a] text-white hover:shadow-2xl transition-all duration-300 relative overflow-hidden group shadow-[0_24px_60px_rgba(0,0,0,0.14)]"
          >
            <div className="absolute -bottom-20 right-0 w-[500px] h-[300px] bg-[#ffd439]/15 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-widest bg-white/10 border border-white/20 text-white backdrop-blur-md">
                  <Sparkles className="size-3 text-[#ffd439]" />
                  Featured Publication
                </span>
                <span className="text-xs text-white/40">&bull;</span>
                <span className="text-xs text-[#ffd439] font-mono font-semibold">
                  {featuredPost.meta.category}
                </span>
                <span className="text-xs text-white/40">&bull;</span>
                <span className="text-xs text-white/60 font-mono">
                  {formatPostDate(featuredPost.meta.date)}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-serif font-medium tracking-tight text-white leading-tight">
                {featuredPost.meta.title}
              </h2>

              <p className="text-sm sm:text-base text-white/80 leading-relaxed font-sans max-w-3xl">
                {featuredPost.meta.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15">
                <div className="flex flex-wrap items-center gap-2">
                  {featuredPost.meta.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-white/10 text-white/70 border border-white/15"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-white/60 font-mono">
                    <Clock className="size-3.5 text-white/50" />
                    {featuredPost.meta.readTime}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#ffd439] group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                    <span>Read Article</span>
                    <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Grid of Articles */}
      {gridPosts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gridPosts.map((post) => {
            const categoryBadge =
              post.meta.category === "Agency"
                ? "text-[#23211a] border-[#ffd439]/60 bg-[#ffd439]/20"
                : post.meta.category === "Engineering"
                  ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                  : post.meta.category === "Product"
                    ? "text-[#23211a] border-[#e8e6df] bg-[#fbfbf9]"
                    : "text-amber-800 border-amber-200 bg-amber-50";

            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}` as any}
                className="group flex flex-col justify-between p-6 sm:p-7 rounded-2xl border border-[#e8e6df] bg-white hover:border-[#23211a]/30 hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden shadow-xs"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${categoryBadge}`}
                    >
                      {post.meta.category}
                    </span>
                    <span className="text-[11px] text-[#868279] font-mono flex items-center gap-1">
                      <Calendar className="size-3 text-[#868279]" />
                      {formatPostDate(post.meta.date)}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif font-medium tracking-tight text-[#23211a] leading-snug group-hover:text-[#23211a]">
                    {post.meta.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed line-clamp-3 font-sans">
                    {post.meta.description}
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-5 mt-4 border-t border-[#e8e6df]">
                  {post.meta.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.meta.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#fbfbf9] text-[#868279] border border-[#e8e6df]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#868279] font-mono">
                      <Clock className="size-3 text-[#868279]" />
                      {post.meta.readTime}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#23211a] group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                      <span>Read</span>
                      <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center rounded-3xl border border-dashed border-[#e8e6df] bg-white shadow-xs">
          <BookOpen className="size-10 text-[#868279] mb-3" />
          <h3 className="text-lg font-serif font-medium text-[#23211a] mb-1">No articles found</h3>
          <p className="text-xs text-[#5c5c5c] max-w-sm mb-4 font-sans">
            We couldn&apos;t find any posts matching &ldquo;{searchQuery}&rdquo; in{" "}
            {selectedCategory}.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="px-5 py-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#23211a] bg-[#ffd439] hover:bg-[#ffe066] rounded-xl transition-colors shadow-xs"
          >
            Reset search filters
          </button>
        </div>
      )}
    </div>
  );
}

export default BlogListing;
