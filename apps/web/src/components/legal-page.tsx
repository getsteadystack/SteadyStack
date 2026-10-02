import { Scale, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Section {
  title: string;
  content: string;
}

interface LegalPageProps {
  title: string;
  badge: string;
  description: string;
  lastUpdated: string;
  sections: Section[];
  otherPage: {
    href: string;
    label: string;
    description: string;
  };
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function LegalPage({
  title,
  badge,
  description,
  lastUpdated,
  sections,
  otherPage,
}: LegalPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#fbfbf9] text-[#23211a] font-sans">
      {/* Hero Section */}
      <section className="pt-28 pb-20 md:pt-36 md:pb-24 relative overflow-hidden border-b border-[#e8e6df]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center text-center gap-6 relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-xs font-mono font-semibold uppercase tracking-wider shadow-xs">
            <Scale className="size-3.5 text-[#ffd439]" />
            <span>{badge}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium tracking-tight text-[#23211a] max-w-4xl leading-[1.08] text-balance">
            {title}
          </h1>
          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed max-w-2xl font-sans text-balance">
            {description}
          </p>
          <p className="text-[#868279] text-xs font-mono font-semibold">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Main Content with Sticky TOC */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 md:px-12 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Table of contents sidebar */}
          <nav className="hidden lg:block w-64 shrink-0" aria-label="Table of contents">
            <div className="sticky top-32 p-6 rounded-2xl bg-white border border-[#e8e6df] shadow-xs space-y-3">
              <p className="text-[11px] font-mono font-semibold text-[#868279] uppercase tracking-wider">
                Contents
              </p>
              <div className="space-y-1.5">
                {sections.map((section) => (
                  <a
                    key={section.title}
                    href={`#${slugify(section.title)}`}
                    className="block text-xs font-sans text-[#5c5c5c] hover:text-[#23211a] hover:font-medium transition-colors py-1 leading-snug"
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </div>
          </nav>

          {/* Document Section Blocks */}
          <div className="flex-1 min-w-0 space-y-6">
            {sections.map((section, i) => (
              <section
                key={section.title}
                id={slugify(section.title)}
                className="p-6 sm:p-8 rounded-2xl bg-white border border-[#e8e6df] shadow-xs scroll-mt-32 transition-all hover:border-[#23211a]/20"
              >
                <div className="flex items-start gap-4">
                  <span className="inline-flex mt-0.5 size-8 shrink-0 items-center justify-center rounded-xl border border-[#e8e6df] bg-[#fbfbf9] text-xs font-mono font-bold text-[#23211a]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="space-y-2 flex-1">
                    <h2 className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[#23211a]">
                      {section.title}
                    </h2>
                    <p className="text-sm sm:text-base text-[#5c5c5c] leading-relaxed font-sans">
                      {section.content}
                    </p>
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA container */}
      <section className="py-20 md:py-28 bg-[#fbfbf9] border-t border-[#e8e6df] flex justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl rounded-3xl border border-black/[0.1] bg-[#23211a] text-white p-8 sm:p-14 md:p-16 text-center relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.14)]">
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ffd439]/20 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[11px] font-mono font-semibold uppercase tracking-wider backdrop-blur-md">
              <FileText className="size-3.5 text-[#ffd439]" />
              <span>{otherPage.label}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight text-white leading-tight">
              {otherPage.description}
            </h2>

            <div className="pt-2">
              <Link
                href={otherPage.href as any}
                className="inline-flex items-center justify-center gap-2 h-12 px-7 bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-mono font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Read {otherPage.label}</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
