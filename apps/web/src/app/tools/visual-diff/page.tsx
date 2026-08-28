import type { Metadata } from "next";
import { VisualDiffComparator } from "./comparator";
import LandingHeader from "@/components/landing/header";
import LandingFooter from "@/components/landing/footer";
import { ToolSchema } from "@/components/seo/tool-schema";
import { ToolContentSection } from "@/components/tools/tool-content-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visual Website Diff Tool & UI Regression Tester | SteadyStack",
  description:
    "Instantly compare two versions of a website to detect visual regressions, layout shifts, broken CSS, or unwanted content updates with pixel-perfect precision.",
  keywords: [
    "visual diff",
    "website comparison",
    "regression testing",
    "UI monitoring",
    "website diff tool",
    "visual regression",
    "DOM shift detection",
  ],
  alternates: {
    canonical: "/tools/visual-diff",
  },
};

export default function VisualDiffPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ToolSchema
        name="Visual Website Diff Tool"
        description="Instantly compare two versions of a website to detect visual regressions, design shifts, or content updates. The ultimate tool for modern UI/UX monitoring."
        url="https://steadystack.dev/tools/visual-diff"
      />
      <LandingHeader />
      <main className="container mx-auto pt-32 pb-16 px-4 md:px-6 flex-1">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-linear-to-r from-primary via-emerald-500 to-primary bg-clip-text text-transparent pb-2 uppercase italic">
              Visual Diff Sentinel
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-mono">
              [ANALYZING DESIGN INTEGRITY...]
              <br />
              Compare two URLs to detect UI mutations with pixel-perfect precision.
            </p>
          </div>

          <VisualDiffComparator />

          <ToolContentSection
            toolName="Visual Diff Tool"
            overviewTitle="How Visual Regression Testing Catches Silent UI Breaks"
            overviewDescription="Modern frontend web applications rely on complex CSS frameworks, third-party JavaScript widgets, and dynamic API states. Even if your HTTP server returns a 200 OK status code, a broken stylesheet or corrupted script bundle can render a completely blank white screen for real users."
            howItWorks={[
              {
                title: "1. DOM & Screenshot Capture",
                content:
                  "Our edge rendering engine fetches both target URLs in headless browser viewports with matching screen resolutions and device pixel ratios.",
                codeSnippet: "Viewport: 1440x900 @ 2x DPI",
              },
              {
                title: "2. Pixel-Level & Structural Diffing",
                content:
                  "A pixel-by-pixel perceptual comparison algorithm highlights layout displacement, color alterations, font fallback issues, and deleted DOM elements.",
                codeSnippet: "Delta Threshold: 0.1% pixel divergence",
              },
              {
                title: "3. Side-by-Side & Overlay Inspection",
                content:
                  "View differences using an interactive split-screen slider, onion-skin opacity overlay, or highlighted difference heatmaps to pinpoint regressions.",
                codeSnippet: "Mode: Split | Overlay | Difference Mask",
              },
            ]}
            useCasesTitle="Key Applications for Visual Regression Monitoring"
            useCases={[
              {
                title: "Staging vs Production Release QA",
                description:
                  "Verify that a new frontend deployment on staging matches the intended production layout before merging pull requests.",
                badge: "Release Gate",
              },
              {
                title: "Third-Party Script Mutation Detection",
                description:
                  "Catch when marketing tag managers, chat widgets, or cookie consent banners break your mobile navigation or hero CTA layout.",
                badge: "Vendor Drift",
              },
              {
                title: "Defacement & Unintended Content Changes",
                description:
                  "Detect if unauthorized changes, defacements, or content injection attacks alter key landing page copy or pricing tables.",
                badge: "Security",
              },
              {
                title: "A/B Test Visual Verification",
                description:
                  "Compare control and variant pages to ensure intended visual hierarchy without unexpected CSS style leaks across components.",
                badge: "Experimentation",
              },
            ]}
            faqs={[
              {
                question: "How does visual diffing differ from HTTP status monitoring?",
                answer:
                  "HTTP status checks only confirm that your web server returned a 200 OK header. Visual diffing confirms that the rendered webpage actually displays correctly without blank screens, CSS clipping, or broken layouts.",
              },
              {
                question: "Can visual regression testing handle dynamic or animated elements?",
                answer:
                  "Yes, modern visual comparison engines pause CSS animations and allow masking of dynamic sections (like rotating carousels or timestamps) to prevent false positives.",
              },
              {
                question: "Why do font discrepancies trigger visual diff alerts?",
                answer:
                  "If a web font fails to load (due to CORS or CDN issues) and the browser falls back to a system font, letter spacing and line heights shift, triggering a visual regression alert.",
              },
              {
                question: "Does SteadyStack support automated visual regression alerts?",
                answer:
                  "SteadyStack includes snapshot and payload monitoring capabilities to continuously check critical page integrity, alerting your team when critical UI components or payload matches fail.",
              },
            ]}
          />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
