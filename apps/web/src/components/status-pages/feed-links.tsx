"use client";

import { useState } from "react";
import { Rss, Copy, Check, ExternalLink } from "lucide-react";

interface FeedLinksProps {
  pageSlug: string;
  pageTitle: string;
}

export function FeedLinks({ pageSlug, pageTitle }: FeedLinksProps) {
  const [copiedFeed, setCopiedFeed] = useState<string | null>(null);

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const feeds = [
    {
      id: "rss",
      name: "RSS Feed",
      subtitle: "Incidents Only",
      url: `${baseUrl}/api/feeds/${pageSlug}/rss`,
      icon: Rss,
    },
    {
      id: "rss-all",
      name: "RSS Feed",
      subtitle: "All Events",
      url: `${baseUrl}/api/feeds/${pageSlug}/rss-all`,
      icon: Rss,
    },
    {
      id: "atom",
      name: "Atom Feed",
      subtitle: "Incidents Only",
      url: `${baseUrl}/api/feeds/${pageSlug}/atom`,
      icon: Rss,
    },
    {
      id: "atom-all",
      name: "Atom Feed",
      subtitle: "All Events",
      url: `${baseUrl}/api/feeds/${pageSlug}/atom-all`,
      icon: Rss,
    },
  ];

  const copyToClipboard = async (feedId: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedFeed(feedId);
      setTimeout(() => setCopiedFeed(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-3">
      {feeds.map((feed) => (
        <div
          key={feed.id}
          className="flex items-center justify-between p-3.5 border border-border rounded-2xl bg-card hover:bg-muted/40 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-muted border border-border flex items-center justify-center">
              <feed.icon className="size-4 text-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">{feed.name}</p>
              <p className="text-[11px] text-muted-foreground">{feed.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => copyToClipboard(feed.id, feed.url)}
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Copy URL"
            >
              {copiedFeed === feed.id ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
            <a
              href={feed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Open Feed"
            >
              <ExternalLink className="size-3.5" />
            </a>
          </div>
        </div>
      ))}

      <p className="text-[11px] text-muted-foreground text-center mt-3 font-mono">
        Add these URLs to your RSS reader app (like Feedly, Inoreader, or NewsBlur)
      </p>
    </div>
  );
}
