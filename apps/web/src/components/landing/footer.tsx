import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="py-16 md:py-20 border-t border-[#e8e6df] bg-[#fbfbf9] text-[#23211a] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-12 flex flex-col gap-16">
        {/* Main Grid Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 md:gap-8">
          {/* Col 1 - Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg overflow-hidden bg-[#181715] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icon.svg" alt="SteadyStack 2.0" className="size-7 object-contain" />
              </div>
              <span className="text-[#23211a] font-serif font-bold tracking-tight text-lg">
                SteadyStack
              </span>
              <span className="text-[10px] font-mono font-bold bg-[#ffd439]/30 text-[#23211a] px-1.5 py-0.5 rounded border border-[#ffd439]/60">
                2.0
              </span>
            </div>
            <p className="text-[#5c5c5c] text-xs font-medium max-w-xs leading-relaxed">
              Autonomous multi-region edge uptime, quorum consensus, and automated client SLA
              reports.
            </p>
            <div className="pt-1">
              <a
                href="https://www.producthunt.com/products/steadystack?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-steadystack"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SteadyStack on Product Hunt"
                className="inline-block transition-opacity hover:opacity-85"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1229492&theme=light&t=1787428498964"
                  width={200}
                  height={43}
                  alt="SteadyStack - Uptime monitoring that never pages you for nothing | Product Hunt"
                  loading="lazy"
                  className="block h-9 w-auto"
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
                href={"/agencies" as any}
                className="text-primary hover:text-primary/80 text-xs font-semibold transition-colors w-fit flex items-center gap-1.5"
              >
                For Agencies
                <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-mono font-bold">
                  New
                </span>
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
                href={"/docs/terraform" as any}
                className="text-muted-foreground hover:text-foreground text-xs font-medium transition-colors w-fit flex items-center gap-1"
              >
                Terraform / IaC
              </Link>
              <Link
                href={"/docs" as any}
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
                  400+
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
      </div>
    </footer>
  );
}
