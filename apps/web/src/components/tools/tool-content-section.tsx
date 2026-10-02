import React from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle, ShieldCheck, Zap, Terminal, Activity } from "lucide-react";

export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface ToolGuideSection {
  title: string;
  content: string;
  codeSnippet?: string;
}

export interface ToolUseCase {
  title: string;
  description: string;
  badge?: string;
}

export interface ToolContentSectionProps {
  toolName: string;
  overviewTitle: string;
  overviewDescription: string;
  howItWorks: ToolGuideSection[];
  useCasesTitle?: string;
  useCases: ToolUseCase[];
  faqs: ToolFaqItem[];
  ctaTitle?: string;
  ctaDescription?: string;
  ctaLink?: string;
}

export function ToolContentSection({
  toolName,
  overviewTitle,
  overviewDescription,
  howItWorks,
  useCasesTitle = "Key Use Cases & Best Practices",
  useCases,
  faqs,
  ctaTitle = "Automate Your Monitoring 24/7 with SteadyStack",
  ctaDescription = "Don't wait for manual tests. SteadyStack pings your endpoints from global edge locations every 60 seconds with quorum consensus to eliminate false alarms.",
  ctaLink = "/signup",
}: ToolContentSectionProps) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="mt-24 space-y-16 border-t border-[#e8e6df] pt-16 font-sans">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Section 1: Overview & How it Works */}
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#e8e6df] bg-white text-[#23211a] text-xs font-mono font-semibold uppercase tracking-wider shadow-xs">
            <Zap className="size-3 text-[#ffd439]" />
            <span>Technical Deep Dive</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-medium tracking-tight text-[#23211a]">
            {overviewTitle}
          </h2>
          <p className="text-[#5c5c5c] text-base sm:text-lg leading-relaxed max-w-3xl">
            {overviewDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {howItWorks.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-[#e8e6df] bg-white shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="size-8 rounded-xl bg-[#ffd439]/20 text-[#23211a] flex items-center justify-center font-mono font-bold text-xs border border-[#ffd439]/40">
                  0{idx + 1}
                </div>
                <h3 className="font-serif font-medium text-base text-[#23211a]">{step.title}</h3>
                <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed">{step.content}</p>
              </div>
              {step.codeSnippet && (
                <div className="p-3 rounded-xl bg-[#fbfbf9] border border-[#e8e6df] font-mono text-xs text-[#23211a] overflow-x-auto">
                  <code>{step.codeSnippet}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Use Cases & Pitfalls */}
      {useCases && useCases.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#23211a]">
            {useCasesTitle}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {useCases.map((useCase, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-[#e8e6df] bg-white shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif font-medium text-base text-[#23211a]">
                    {useCase.title}
                  </h3>
                  {useCase.badge && (
                    <span className="px-2 py-0.5 rounded-md bg-[#f0ede6] text-[#23211a] font-mono text-[10px] uppercase font-bold shrink-0">
                      {useCase.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: FAQs */}
      {faqs && faqs.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#868279] uppercase tracking-wider">
              <HelpCircle className="size-4" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#23211a]">
              Common Questions About {toolName}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-[#e8e6df] bg-white shadow-xs space-y-2"
              >
                <h3 className="font-serif font-medium text-base text-[#23211a]">{faq.question}</h3>
                <p className="text-xs sm:text-sm text-[#5c5c5c] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Automated Monitoring CTA */}
      <div className="rounded-3xl border border-black/[0.1] bg-[#23211a] text-white p-8 sm:p-12 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_24px_60px_rgba(0,0,0,0.14)] relative overflow-hidden">
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-[#ffd439]/20 rounded-full blur-[90px] pointer-events-none" />

        <div className="space-y-3 max-w-xl text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 text-white text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md">
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>24/7 Automated Surveillance</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-medium text-white">{ctaTitle}</h3>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">{ctaDescription}</p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full md:w-auto">
          <Link
            href={ctaLink as any}
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-[#ffd439] hover:bg-[#ffe066] text-[#23211a] font-mono font-semibold text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
          >
            <span>Start Free Checks</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
