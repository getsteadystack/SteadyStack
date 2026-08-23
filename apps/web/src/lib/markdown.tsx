import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  ShieldAlert,
  CheckSquare,
  Square,
  Hash,
} from "lucide-react";
import { CodeBlock } from "@/components/blog/code-block";
import type { TocItem } from "@/components/blog/table-of-contents";
export type { TocItem };

// Helper to generate URL-safe slugs for headings
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Extracts headings for Table of Contents
export function extractHeadings(content: string): TocItem[] {
  const lines = content.split("\n");
  const headings: TocItem[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      const text = trimmed.slice(3).replace(/\*\*/g, "").replace(/`/g, "").trim();
      headings.push({ id: slugify(text), text, level: 2 });
    } else if (trimmed.startsWith("### ")) {
      const text = trimmed.slice(4).replace(/\*\*/g, "").replace(/`/g, "").trim();
      headings.push({ id: slugify(text), text, level: 3 });
    } else if (trimmed.startsWith("#### ")) {
      const text = trimmed.slice(5).replace(/\*\*/g, "").replace(/`/g, "").trim();
      headings.push({ id: slugify(text), text, level: 4 });
    }
  }

  return headings;
}

export function renderInline(text: string): React.ReactNode {
  // Regex to split on markdown inline tokens
  // 1: bold (**text** or __text__)
  // 2: strikethrough (~~text~~)
  // 3: inline code (`text`)
  // 4: links ([text](url))
  // 5: italic (*text* or _text_)
  const tokenRegex = /(\*\*.*?\*\*|__.*?__|~~.*?~~|`.*?`|\[.*?\]\(.*?\)|\*[^*]+?\*|_[^_]+?_)/g;

  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;

    // Bold (** or __)
    if (
      (part.startsWith("**") && part.endsWith("**") && part.length >= 4) ||
      (part.startsWith("__") && part.endsWith("__") && part.length >= 4)
    ) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {renderInline(part.slice(2, -2))}
        </strong>
      );
    }

    // Strikethrough (~~)
    if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
      return (
        <del key={i} className="line-through text-muted-foreground/70">
          {renderInline(part.slice(2, -2))}
        </del>
      );
    }

    // Inline code (`)
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-muted/80 text-emerald-400 font-mono text-[12px] border border-border/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Link [text](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const linkText = linkMatch[1];
      const linkUrl = linkMatch[2];
      const isInternal = linkUrl.startsWith("/") || linkUrl.startsWith("#");

      if (isInternal) {
        return (
          <Link
            key={i}
            href={linkUrl as any}
            className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors"
          >
            {renderInline(linkText)}
          </Link>
        );
      }

      return (
        <a
          key={i}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-colors"
        >
          {renderInline(linkText)}
        </a>
      );
    }

    // Italic (* or _)
    if (
      (part.startsWith("*") && part.endsWith("*") && part.length >= 2) ||
      (part.startsWith("_") && part.endsWith("_") && part.length >= 2)
    ) {
      return (
        <em key={i} className="italic text-foreground/90">
          {renderInline(part.slice(1, -1))}
        </em>
      );
    }

    return part;
  });
}

export function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = "";

  let listType: "ul" | "ol" | "task" | null = null;
  let listItems: Array<{ text: string; checked?: boolean }> = [];

  let inTable = false;
  let tableHeaders: string[] = [];
  let tableAlignments: Array<"left" | "center" | "right"> = [];
  let tableRows: string[][] = [];

  let inBlockquote = false;
  let blockquoteBuffer: string[] = [];
  let calloutType: "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION" | null = null;

  const flushList = (key: number) => {
    if (listType && listItems.length > 0) {
      if (listType === "task") {
        elements.push(
          <ul key={`task-${key}`} className="my-4 space-y-2 list-none p-0">
            {listItems.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed"
              >
                <span className="mt-0.5 shrink-0 text-primary">
                  {item.checked ? (
                    <CheckSquare className="size-4 text-emerald-400" />
                  ) : (
                    <Square className="size-4 text-muted-foreground/60" />
                  )}
                </span>
                <span className={item.checked ? "line-through text-muted-foreground/60" : ""}>
                  {renderInline(item.text)}
                </span>
              </li>
            ))}
          </ul>,
        );
      } else if (listType === "ol") {
        elements.push(
          <ol
            key={`ol-${key}`}
            className="my-4 space-y-2 list-decimal list-outside pl-5 text-sm text-muted-foreground leading-relaxed"
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="pl-1">
                {renderInline(item.text)}
              </li>
            ))}
          </ol>,
        );
      } else {
        elements.push(
          <ul
            key={`ul-${key}`}
            className="my-4 space-y-2 list-disc list-outside pl-5 text-sm text-muted-foreground leading-relaxed marker:text-primary/70"
          >
            {listItems.map((item, idx) => (
              <li key={idx} className="pl-1">
                {renderInline(item.text)}
              </li>
            ))}
          </ul>,
        );
      }
      listType = null;
      listItems = [];
    }
  };

  const flushTable = (key: number) => {
    if (inTable && tableHeaders.length > 0) {
      elements.push(
        <div
          key={`table-${key}`}
          className="my-6 w-full overflow-x-auto rounded-xl border border-border/80 bg-zinc-950/40 shadow-sm"
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-zinc-900/60 font-semibold text-foreground">
                {tableHeaders.map((header, idx) => {
                  const align = tableAlignments[idx] || "left";
                  const alignClass =
                    align === "center"
                      ? "text-center"
                      : align === "right"
                        ? "text-right"
                        : "text-left";
                  return (
                    <th
                      key={idx}
                      className={`px-4 py-3 text-zinc-200 font-semibold uppercase tracking-wider text-[11px] ${alignClass}`}
                    >
                      {renderInline(header)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-muted/10 transition-colors">
                  {row.map((cell, cIdx) => {
                    const align = tableAlignments[cIdx] || "left";
                    const alignClass =
                      align === "center"
                        ? "text-center"
                        : align === "right"
                          ? "text-right"
                          : "text-left";
                    return (
                      <td key={cIdx} className={`px-4 py-3 text-muted-foreground ${alignClass}`}>
                        {renderInline(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      inTable = false;
      tableHeaders = [];
      tableAlignments = [];
      tableRows = [];
    }
  };

  const flushBlockquote = (key: number) => {
    if (inBlockquote && blockquoteBuffer.length > 0) {
      const quoteContent = blockquoteBuffer.join("\n");

      if (calloutType) {
        let badgeIcon = <Info className="size-4" />;
        let badgeColor = "text-sky-400 border-sky-500/30 bg-sky-500/10";
        let title = "Note";

        if (calloutType === "TIP") {
          badgeIcon = <Lightbulb className="size-4" />;
          badgeColor = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
          title = "Tip";
        } else if (calloutType === "IMPORTANT") {
          badgeIcon = <CheckCircle2 className="size-4" />;
          badgeColor = "text-amber-400 border-amber-500/30 bg-amber-500/10";
          title = "Important";
        } else if (calloutType === "WARNING") {
          badgeIcon = <AlertTriangle className="size-4" />;
          badgeColor = "text-amber-400 border-amber-500/30 bg-amber-500/10";
          title = "Warning";
        } else if (calloutType === "CAUTION") {
          badgeIcon = <ShieldAlert className="size-4" />;
          badgeColor = "text-rose-400 border-rose-500/30 bg-rose-500/10";
          title = "Caution";
        }

        elements.push(
          <div
            key={`callout-${key}`}
            className={`my-6 rounded-xl border p-4 sm:p-5 ${badgeColor} backdrop-blur-sm shadow-sm`}
          >
            <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider mb-2">
              {badgeIcon}
              <span>{title}</span>
            </div>
            <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
              {renderInline(quoteContent)}
            </div>
          </div>,
        );
      } else {
        elements.push(
          <blockquote
            key={`quote-${key}`}
            className="my-5 border-l-2 border-primary/50 pl-4 py-1 italic text-muted-foreground/90 text-sm leading-relaxed"
          >
            {renderInline(quoteContent)}
          </blockquote>,
        );
      }

      inBlockquote = false;
      blockquoteBuffer = [];
      calloutType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Code blocks
    if (line.startsWith("```")) {
      flushList(i);
      flushTable(i);
      flushBlockquote(i);

      if (inCodeBlock) {
        elements.push(
          <CodeBlock key={`code-${i}`} code={codeBuffer.join("\n")} language={codeLang} />,
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLang = "";
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // 2. Tables
    const isTableRow = line.trim().startsWith("|") && line.trim().endsWith("|");
    if (isTableRow) {
      flushList(i);
      flushBlockquote(i);

      const cells = line
        .trim()
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
        continue;
      } else if (tableAlignments.length === 0) {
        // This is the alignment delimiter line (e.g. | :--- | :---: | ---: |)
        tableAlignments = cells.map((cell) => {
          const starts = cell.startsWith(":");
          const ends = cell.endsWith(":");
          if (starts && ends) return "center";
          if (ends) return "right";
          return "left";
        });
        continue;
      } else {
        tableRows.push(cells);
        continue;
      }
    } else {
      flushTable(i);
    }

    // 3. Blockquotes & Callouts
    if (line.startsWith("> ") || line.trim() === ">") {
      flushList(i);
      const quoteLine = line.replace(/^>\s?/, "");

      if (!inBlockquote) {
        inBlockquote = true;
        // Check for GitHub style alert header
        const alertMatch = quoteLine.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
        if (alertMatch) {
          calloutType = alertMatch[1].toUpperCase() as any;
          continue; // Skip the [!TYPE] line
        }
      }

      blockquoteBuffer.push(quoteLine);
      continue;
    } else {
      flushBlockquote(i);
    }

    // 4. Horizontal Rules
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      flushList(i);
      elements.push(<hr key={`hr-${i}`} className="border-t border-border/80 my-8" />);
      continue;
    }

    // 5. Headings
    if (line.startsWith("# ")) {
      flushList(i);
      const headingText = line.slice(2).trim();
      const slug = slugify(headingText);
      elements.push(
        <h1
          key={`h1-${i}`}
          id={slug}
          className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-10 mb-4 group flex items-center gap-2"
        >
          <span>{renderInline(headingText)}</span>
          <a
            href={`#${slug}`}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-primary transition-opacity"
            aria-label={`Link to ${headingText}`}
          >
            <Hash className="size-4" />
          </a>
        </h1>,
      );
      continue;
    }

    if (line.startsWith("## ")) {
      flushList(i);
      const headingText = line.slice(3).trim();
      const slug = slugify(headingText);
      elements.push(
        <h2
          key={`h2-${i}`}
          id={slug}
          className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-10 mb-3 pt-4 border-t border-border/40 group flex items-center gap-2"
        >
          <span>{renderInline(headingText)}</span>
          <a
            href={`#${slug}`}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-primary transition-opacity"
            aria-label={`Link to ${headingText}`}
          >
            <Hash className="size-4" />
          </a>
        </h2>,
      );
      continue;
    }

    if (line.startsWith("### ")) {
      flushList(i);
      const headingText = line.slice(4).trim();
      const slug = slugify(headingText);
      elements.push(
        <h3
          key={`h3-${i}`}
          id={slug}
          className="text-base sm:text-lg font-semibold tracking-tight text-foreground mt-6 mb-2 group flex items-center gap-2"
        >
          <span>{renderInline(headingText)}</span>
          <a
            href={`#${slug}`}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-primary transition-opacity"
            aria-label={`Link to ${headingText}`}
          >
            <Hash className="size-3.5" />
          </a>
        </h3>,
      );
      continue;
    }

    if (line.startsWith("#### ")) {
      flushList(i);
      const headingText = line.slice(5).trim();
      const slug = slugify(headingText);
      elements.push(
        <h4
          key={`h4-${i}`}
          id={slug}
          className="text-sm sm:text-base font-semibold tracking-tight text-foreground mt-4 mb-2 group flex items-center gap-2"
        >
          <span>{renderInline(headingText)}</span>
          <a
            href={`#${slug}`}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground/50 hover:text-primary transition-opacity"
            aria-label={`Link to ${headingText}`}
          >
            <Hash className="size-3" />
          </a>
        </h4>,
      );
      continue;
    }

    // 6. Lists (Task, Ordered, Unordered)
    const taskMatch = line.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (taskMatch) {
      if (listType !== "task") {
        flushList(i);
        listType = "task";
      }
      listItems.push({
        checked: taskMatch[1].toLowerCase() === "x",
        text: taskMatch[2],
      });
      continue;
    }

    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (listType !== "ol") {
        flushList(i);
        listType = "ol";
      }
      listItems.push({ text: olMatch[2] });
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (listType !== "ul") {
        flushList(i);
        listType = "ul";
      }
      listItems.push({ text: line.slice(2) });
      continue;
    }

    // Not a list item
    flushList(i);

    // Empty lines
    if (!line.trim()) {
      continue;
    }

    // Regular paragraphs
    elements.push(
      <p key={`p-${i}`} className="text-muted-foreground text-sm sm:text-base leading-relaxed my-3">
        {renderInline(line)}
      </p>,
    );
  }

  flushList(lines.length);
  flushTable(lines.length);
  flushBlockquote(lines.length);

  return (
    <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-foreground">
      {elements}
    </div>
  );
}

export default MarkdownRenderer;
