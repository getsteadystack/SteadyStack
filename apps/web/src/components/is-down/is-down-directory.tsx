"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Sparkles, ChevronRight, Activity, Globe, Server } from "lucide-react";
import {
  type ServiceDownInfo,
  type ServiceCategory,
  CATEGORY_LABELS,
} from "@/content/is-down-services";

interface IsDownDirectoryProps {
  services: ServiceDownInfo[];
}

export function IsDownDirectory({ services }: IsDownDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "all">("all");

  const categories: Array<{ id: ServiceCategory | "all"; label: string }> = [
    { id: "all", label: `All Services (${services.length})` },
    { id: "ai-ml", label: "AI & ML" },
    { id: "cloud-infra", label: "Cloud & Infra" },
    { id: "payments-fintech", label: "Payments" },
    { id: "devtools-git", label: "DevTools" },
    { id: "databases-storage", label: "Databases" },
    { id: "auth-security", label: "Auth & Security" },
    { id: "comms-email", label: "Comms & Email" },
    { id: "productivity-collab", label: "Productivity" },
    { id: "media-streaming", label: "Media & CDN" },
    { id: "web3-crypto", label: "Web3 & APIs" },
  ];

  const featuredServices = useMemo(() => {
    return services.filter((s) => s.featured).slice(0, 8);
  }, [services]);

  const filteredServices = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return services.filter((service) => {
      const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!q) return true;
      return (
        service.name.toLowerCase().includes(q) ||
        service.slug.toLowerCase().includes(q) ||
        service.domain.toLowerCase().includes(q) ||
        CATEGORY_LABELS[service.category].toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q)
      );
    });
  }, [services, searchQuery, selectedCategory]);

  return (
    <div className="space-y-12">
      {/* Featured Top Outage Spikes Row */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-[#868279]">
          <Sparkles className="h-3.5 w-3.5 text-[#ffd439]" />
          <span>Top Monitored Services & High-Traffic Hubs</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {featuredServices.map((service) => (
            <Link
              key={service.slug}
              href={`/is-down/${service.slug}` as any}
              className="group flex flex-col items-center justify-center p-4 rounded-2xl border border-[#e8e6df] bg-white hover:border-[#23211a]/30 transition-all hover:shadow-md text-center shadow-xs"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ede6] text-sm font-bold font-mono text-[#23211a] mb-2 group-hover:bg-[#23211a] group-hover:text-[#ffd439] transition-colors">
                {service.name.charAt(0)}
              </div>
              <span className="text-xs font-serif font-medium text-[#23211a] truncate w-full">
                {service.name}
              </span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-[#868279] font-mono">Live Check</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Search Bar & Category Filter Pills */}
      <div className="space-y-6">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#868279] pointer-events-none" />
          <input
            type="search"
            placeholder="Search 400+ services (e.g. Stripe, GitHub, OpenAI, AWS, Steam, Netflix)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 text-xs font-mono rounded-2xl border border-[#e8e6df] bg-white shadow-xs focus:outline-none focus:border-[#23211a] text-[#23211a] placeholder:text-[#868279]"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-white border border-[#e8e6df] rounded-2xl shadow-xs max-w-fit">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#23211a] text-white font-semibold shadow-xs"
                    : "text-[#5c5c5c] hover:text-[#23211a] hover:bg-[#f0ede6]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#868279] border-b border-[#e8e6df] pb-3">
          <span>
            Showing{" "}
            <strong className="text-[#23211a] font-semibold">{filteredServices.length}</strong>{" "}
            services
          </span>
          <span>Automated 10s Edge Quorum Verification</span>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-[#e8e6df] bg-white p-8 space-y-3">
            <p className="text-sm font-serif text-[#23211a]">
              No services found matching &ldquo;{searchQuery}&rdquo;.
            </p>
            <p className="text-xs font-mono text-[#868279]">
              Want to monitor a custom API or private endpoint not listed here?
            </p>
            <Link
              href={"/signup" as any}
              className="inline-flex items-center justify-center h-10 px-5 bg-[#23211a] text-[#ffd439] font-mono text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-black transition-all shadow-sm"
            >
              Create Free Monitor on SteadyStack
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredServices.map((service) => (
              <Link
                key={service.slug}
                href={`/is-down/${service.slug}` as any}
                className="group relative flex flex-col justify-between p-5 rounded-2xl border border-[#e8e6df] bg-white hover:border-[#23211a]/30 transition-all hover:shadow-md shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8e6df] bg-[#fbfbf9] text-sm font-bold font-mono text-[#23211a] group-hover:bg-[#23211a] group-hover:text-[#ffd439] transition-colors">
                        {service.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-serif font-medium text-[#23211a] group-hover:text-[#23211a] line-clamp-1">
                          {service.name}
                        </h4>
                        <span className="text-[11px] text-[#868279] font-mono line-clamp-1">
                          {service.domain}
                        </span>
                      </div>
                    </div>

                    <span className="relative flex h-2 w-2 mt-1 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  </div>

                  <p className="text-xs text-[#5c5c5c] line-clamp-2 leading-relaxed mb-4 font-sans">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#e8e6df] text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-[#f0ede6] text-[#23211a] text-[10px]">
                    {CATEGORY_LABELS[service.category]}
                  </span>

                  <div className="flex items-center gap-1 font-semibold text-[#23211a] group-hover:translate-x-0.5 transition-transform">
                    <span>Check Status</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
