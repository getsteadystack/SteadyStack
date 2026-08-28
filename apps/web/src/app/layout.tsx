import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import "../index.css";
import Providers from "@/components/providers";

export const dynamic = "force-dynamic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://steadystack.dev";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "SteadyStack — Know the second your stack breaks",
    template: "%s",
  },
  description:
    "Edge-native uptime monitoring with multi-region quorum verification. Eliminate false alarms and track latency globally across 50 regions. Free forever.",
  applicationName: "SteadyStack",
  keywords: [
    "website monitoring",
    "uptime tracker",
    "synthetic monitoring",
    "latency checker",
    "SSL monitor",
    "cron check",
    "dns monitor",
    "status page",
    "SaaS dashboard",
    "multi-region monitoring",
    "quorum verification",
    "uptime monitoring",
    "developer tools",
  ],
  authors: [{ name: "SteadyStack Team", url: BASE_URL }],
  creator: "SteadyStack",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "SteadyStack",
    title: "SteadyStack — Know the second your stack breaks",
    description:
      "Know the second your stack breaks. Edge-native synthetic uptime monitoring that confirms failures across global regions before alerting. Multi-region edge quorum verification, live latency tracking, and zero false positives — free for commercial use.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SteadyStack — Know the second your stack breaks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SteadyStack — Know the second your stack breaks",
    description:
      "Know the second your stack breaks. Edge-native synthetic uptime monitoring that confirms failures across global regions before alerting. Multi-region edge quorum verification, live latency tracking, and zero false positives — free for commercial use.",
    creator: "@steadystack",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "SteadyStack",
      url: BASE_URL,
      logo: `${BASE_URL}/logo.png`,
      sameAs: ["https://github.com/getsteadystack/SteadyStack", "https://twitter.com/steadystack"],
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "SteadyStack",
      headline: "Know the second your stack breaks",
      publisher: { "@id": `${BASE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}/#software`,
      name: "SteadyStack Telemetry & Monitoring",
      operatingSystem: "All",
      applicationCategory: "DeveloperApplication",
      description:
        "Know the second your stack breaks. Cloudflare edge-native monitoring platform with multi-region quorum verification, synthetic checks, and zero false alarms.",
      creator: { "@id": `${BASE_URL}/#organization` },
      publisher: { "@id": `${BASE_URL}/#organization` },
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: "0",
        highPrice: "79",
        offerCount: "3",
      },
    },
  ],
};

/**
 * Renders the root layout of the application with children components.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
