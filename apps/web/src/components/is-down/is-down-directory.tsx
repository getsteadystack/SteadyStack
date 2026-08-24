"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Sparkles, ChevronRight } from "lucide-react";
import {
  type ServiceDownInfo,
  type ServiceCategory,
  CATEGORY_LABELS,
} from "@/content/is-down-services";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    { id: "devtools-git", label: "DevTools & CI/CD" },
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
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Top Monitored Services & High-Traffic Hubs</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {featuredServices.map((service) => (
            <Link
              key={service.slug}
              href={`/is-down/${service.slug}` as any}
              className="group flex flex-col items-center justify-center p-3.5 rounded-xl border border-border/80 bg-card/60 hover:bg-card hover:border-primary/50 transition-all hover:scale-[1.02] shadow-xs text-center"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-base font-bold font-mono text-foreground mb-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {service.name.charAt(0)}
              </div>
              <span className="text-xs font-bold text-foreground truncate w-full">
                {service.name}
              </span>
              <div className="flex items-center gap-1 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground font-mono">Live Check</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Search Bar & Category Filter Pills */}
      <div className="space-y-6">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search 400+ services (e.g. Stripe, GitHub, OpenAI, AWS, Steam, Netflix)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-6 text-base rounded-2xl border-border bg-card/70 shadow-lg focus-visible:ring-primary"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border/80 bg-background/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/60 pb-3">
          <span>
            Showing <strong className="text-foreground">{filteredServices.length}</strong> services
          </span>
          <span>Automated 10s Edge Verification</span>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border p-8">
            <p className="text-base text-muted-foreground">
              No services found matching "
              <span className="text-foreground font-semibold">{searchQuery}</span>
              ".
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Want to monitor a custom API or domain not listed here?
            </p>
            <Link
              href={"/signup" as any}
              className={cn(buttonVariants({ size: "sm" }), "mt-4 inline-flex")}
            >
              Create Custom Monitor on SteadyStack
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredServices.map((service) => (
              <Link
                key={service.slug}
                href={`/is-down/${service.slug}` as any}
                className="group relative flex flex-col justify-between p-5 rounded-2xl border border-border/80 bg-card/40 hover:bg-card hover:border-primary/40 transition-all hover:shadow-lg backdrop-blur-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/60 text-sm font-bold font-mono text-foreground">
                        {service.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {service.name}
                        </h4>
                        <span className="text-[11px] text-muted-foreground font-mono line-clamp-1">
                          {service.domain}
                        </span>
                      </div>
                    </div>

                    <span className="relative flex h-2 w-2 mt-1 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/40 text-[11px]">
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    {CATEGORY_LABELS[service.category]}
                  </Badge>

                  <div className="flex items-center gap-1 font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
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
