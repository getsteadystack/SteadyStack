import Link from "next/link";
import { Activity, Twitter, Github } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="py-16 md:py-20 border-t border-border bg-background relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col gap-16">
        {/* Main Grid Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 md:gap-8">
          {/* Col 1 - Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-primary/5 border border-primary/10 rounded-lg">
                <Activity className="size-4 text-primary" />
              </div>
              <span className="text-foreground font-bold tracking-tight text-base">
                SteadyStack
              </span>
            </div>
            <p className="text-muted-foreground text-xs font-medium max-w-xs leading-relaxed">
              Autonomous global edge uptime, synthetic surveillance, and developer monitoring.
            </p>
            <div className="pt-1">
              <a
                href="https://steadystack.dev/status-page/steadystack"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block transition-opacity hover:opacity-85"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://steadystack.dev/api/badge/steadystack.svg?style=flat&theme=dark&size=sm"
                  alt="SteadyStack Status"
                  className="h-5 w-auto"
                />
              </a>
            </div>
          </div>

          {/* Col 2 - Product */}
          <div className="flex flex-col gap-4">
            <span className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-wider">
              Product
            </span>
            <div className="flex flex-col gap-2.5">
              <Link
                href="#features"
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Features
              </Link>
              <Link
                href={"/pricing" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Pricing
              </Link>
              <Link
                href={"/locations" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Locations & WAF
              </Link>
              <Link
                href={"/benchmarks/false-positives" as any}
                className="text-primary hover:text-primary/80 text-xs font-semibold transition-colors w-fit flex items-center gap-1.5"
              >
                False-Positive Benchmark
                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-mono font-bold">
                  30D Study
                </span>
              </Link>
              <Link
                href={"/comparison" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Comparison
              </Link>
              <Link
                href={"/showcase" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Showcase
              </Link>
              <Link
                href={"/changelog" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Changelog
              </Link>
              <Link
                href={"/hall-of-fame" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Hall of Fame
              </Link>
              <Link
                href={"/design-partners" as any}
                className="text-primary hover:text-primary/80 text-xs font-semibold transition-colors w-fit flex items-center gap-1"
              >
                Design Partners{" "}
                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-mono font-bold">
                  1Yr Free
                </span>
              </Link>
              <Link
                href={"https://pulse-41cf5b0d.mintlify.site/introduction" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Docs
              </Link>
            </div>
          </div>

          {/* Col 3 - Outage Directory & Is Down Pages */}
          <div className="flex flex-col gap-4">
            <span className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-wider">
              Outage Directory
            </span>
            <div className="flex flex-col gap-2.5">
              <Link
                href={"/is-down" as any}
                className="text-primary hover:text-primary/80 text-xs font-semibold transition-colors w-fit flex items-center gap-1.5"
              >
                Is It Down? Hub
                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-mono font-bold">
                  300+
                </span>
              </Link>
              <Link
                href={"/is-down/github" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Is GitHub Down?
              </Link>
              <Link
                href={"/is-down/stripe" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Is Stripe Down?
              </Link>
              <Link
                href={"/is-down/openai" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Is OpenAI Down?
              </Link>
              <Link
                href={"/is-down/vercel" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Is Vercel Down?
              </Link>
              <Link
                href={"/is-down/aws" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Is AWS Down?
              </Link>
              <Link
                href={"/is-down/twilio" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Is Twilio Down?
              </Link>
            </div>
          </div>

          {/* Col 4 - Company & Tools */}
          <div className="flex flex-col gap-4">
            <span className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-wider">
              Company & Tools
            </span>
            <div className="flex flex-col gap-2.5">
              <Link
                href={"/about" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                About
              </Link>
              <Link
                href={"/blog" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Blog
              </Link>
              <Link
                href={"/tools/global-latency" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Global Latency Test
              </Link>
              <Link
                href={"/tools/dns-sentinel" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                DNS Sentinel
              </Link>
              <Link
                href={"/tools/ssl-checker" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                SSL Cryptographic
              </Link>
            </div>
          </div>

          {/* Col 5 - Legal */}
          <div className="flex flex-col gap-4">
            <span className="text-muted-foreground/50 text-[10px] font-bold uppercase tracking-wider">
              Legal
            </span>
            <div className="flex flex-col gap-2.5">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Terms of Service
              </Link>
              <Link
                href={"/security" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit"
              >
                Security Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Badges & Directories */}
        <div className="flex flex-wrap justify-center items-center gap-6 pt-8 border-t border-border/50">
          <a
            href="https://www.producthunt.com/products/steadystack?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-steadystack"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SteadyStack on Product Hunt"
            className="transition-opacity hover:opacity-85"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1229492&theme=light&t=1787428498964"
              width={250}
              height={54}
              alt="SteadyStack - Uptime monitoring that never pages you for nothing | Product Hunt"
              loading="lazy"
              className="block h-11 w-auto"
            />
          </a>
          <a
            href="https://confettisaas.com/saas/steadystack-dev?ref=badge"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View SteadyStack on ConfettiSaaS"
            className="transition-opacity hover:opacity-85"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://confettisaas.com/badge-light.svg"
              width={250}
              height={54}
              alt="SteadyStack on ConfettiSaaS"
              loading="lazy"
              className="block h-11 w-auto"
            />
          </a>
          <a
            href="https://fazier.com/launches/steadystack.dev"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View SteadyStack on Fazier"
            className="transition-opacity hover:opacity-85"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=light"
              width={120}
              height={44}
              alt="Fazier badge"
              loading="lazy"
              className="block h-11 w-auto"
            />
          </a>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-border">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground text-xs font-medium">
              © {new Date().getFullYear()} SteadyStack. All rights reserved.
            </span>
            <span className="text-border hidden sm:inline">•</span>
            <a
              href="https://steadystack.dev/status-page/steadystack"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center transition-opacity hover:opacity-85"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://steadystack.dev/api/badge/steadystack.svg?style=flat&theme=dark&size=sm"
                alt="SteadyStack Status"
                className="h-4 w-auto"
              />
            </a>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Link
              href="https://x.com/snackforcode"
              className="hover:text-foreground transition-all"
            >
              <Twitter className="size-[17px]" />
            </Link>
            <Link
              href="https://github.com/getsteadystack/SteadyStack"
              className="hover:text-foreground transition-all"
            >
              <Github className="size-[17px]" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
