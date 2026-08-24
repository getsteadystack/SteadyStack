import type { MetadataRoute } from "next";
import prisma from "@steadystack/db";
import { getAllPosts } from "@/lib/blog";
import { getAllServices } from "@/content/is-down-services";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://steadystack.dev";

  // Static routes
  const staticRoutes = [
    "",
    "/about",
    "/benchmarks",
    "/benchmarks/false-positives",
    "/blog",
    "/changelog",
    "/comparison",
    "/privacy",
    "/terms",
    "/hall-of-fame",
    "/showcase",
    "/design-partners",
    "/vs/uptime-kuma",
    "/vs/uptimerobot",
    "/vs/better-stack",
    "/vs/checkly",
    "/alternatives/freshping",
    "/features/automated-dispatch",
    "/features/latency-grid",
    "/features/sleep-mode",
    "/features/global-verification",
    "/tools/visual-diff",
    "/tools/ssl-checker",
    "/tools/roast-my-stack",
    "/tools/port-checker",
    "/tools/payload-regex",
    "/tools/ip-subnet",
    "/tools/http-headers",
    "/tools/global-latency",
    "/tools/cron-sentinel",
    "/tools/dns-sentinel",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority:
      route === ""
        ? 1.0
        : route.startsWith("/features/")
          ? 0.8
          : route.startsWith("/tools/")
            ? 0.7
            : 0.5,
  }));

  // Blog posts (statically generated from MDX)
  for (const post of getAllPosts()) {
    sitemapEntries.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.meta.date),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // Programmatic SEO: "Is [Service] Down?" status pages (400+ services)
  sitemapEntries.push({
    url: `${baseUrl}/is-down`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  });

  for (const service of getAllServices()) {
    sitemapEntries.push({
      url: `${baseUrl}/is-down/${service.slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: service.featured ? 0.9 : 0.8,
    });
  }

  try {
    // Dynamically retrieve public status pages from the database
    const publicPages = await prisma.statusPage.findMany({
      where: { isPrivate: false },
      select: { slug: true, updatedAt: true },
    });

    for (const page of publicPages) {
      sitemapEntries.push({
        url: `${baseUrl}/status-page/${page.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: "daily",
        priority: 0.6,
      });
    }
  } catch (error) {
    console.error("Failed to generate dynamic status pages in sitemap:", error);
  }

  return sitemapEntries;
}
