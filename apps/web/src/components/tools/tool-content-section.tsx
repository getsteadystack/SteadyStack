import React from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle, ShieldCheck, Zap, Terminal, AlertTriangle } from "lucide-react";

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
    <div className="mt-24 space-y-16 border-t border-border/60 pt-16">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Section 1: Overview & How it Works */}
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-medium">
            <Zap className="size-3.5" />
            <span>Technical Deep Dive</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            {overviewTitle}
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-3xl">
            {overviewDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {howItWorks.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-border/80 bg-card/40 hover:bg-card/70 transition-colors flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="size-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center font-mono font-bold text-sm border border-primary/20">
                  0{idx + 1}
                </div>
                <h3 className="font-semibold text-foreground text-base">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.content}</p>
              </div>
              {step.codeSnippet && (
                <div className="p-2.5 rounded-lg bg-background/80 border border-border/60 font-mono text-xs text-primary/90 overflow-x-auto">
                  <code>{step.codeSnippet}</code>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Use Cases & Diagnostics */}
      <div className="space-y-6">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Terminal className="size-5 text-primary" />
          <span>{useCasesTitle}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useCases.map((uc, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-border/70 bg-card/20 flex flex-col justify-between space-y-2 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-foreground text-sm">{uc.title}</h3>
                {uc.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-primary/30 bg-primary/10 text-primary font-medium">
                    {uc.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{uc.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Frequently Asked Questions */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Everything you need to know about {toolName} and network reliability best practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-border/80 bg-card/30 space-y-2 hover:bg-card/50 transition-colors"
            >
              <h3 className="font-semibold text-foreground text-sm">{faq.question}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Automated Monitoring CTA */}
      <div className="p-8 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-primary/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-primary uppercase tracking-wider">
            <ShieldCheck className="size-4" />
            <span>Continuous Edge Verification</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-foreground">{ctaTitle}</h2>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl leading-relaxed">
            {ctaDescription}
          </p>
        </div>
        <Link
          href={ctaLink as any}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity whitespace-nowrap shadow-lg shadow-primary/20 shrink-0"
        >
          <span>Start Free Monitoring</span>
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
