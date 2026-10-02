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
        <strong key={i} className="font-semibold text-[#23211a]">
          {renderInline(part.slice(2, -2))}
        </strong>
      );
    }

    // Strikethrough (~~)
    if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
      return (
        <del key={i} className="line-through text-[#868279]">
          {renderInline(part.slice(2, -2))}
        </del>
      );
    }

    // Inline code (`)
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-[#f0ede6] text-[#23211a] font-mono text-[12px] border border-[#e8e6df]"
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
            className="text-[#23211a] font-medium underline underline-offset-4 decoration-[#ffd439] decoration-2 hover:decoration-[#23211a] transition-colors"
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
          className="text-[#23211a] font-medium underline underline-offset-4 decoration-[#ffd439] decoration-2 hover:decoration-[#23211a] transition-colors"
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
        <em key={i} className="italic text-[#23211a]/90 font-serif">
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
          <ul key={`task-${key}`} className="my-4 space-y-2 list-none p-0 font-sans">
            {listItems.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm sm:text-base text-[#383630] leading-relaxed"
              >
                <span className="mt-1 shrink-0 text-[#23211a]">
                  {item.checked ? (
                    <CheckSquare className="size-4 text-emerald-600" />
                  ) : (
                    <Square className="size-4 text-[#868279]" />
                  )}
                </span>
                <span className={item.checked ? "line-through text-[#868279]" : ""}>
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
            className="my-4 space-y-2 list-decimal list-outside pl-5 text-sm sm:text-base text-[#383630] font-sans leading-relaxed marker:font-mono marker:font-semibold marker:text-[#23211a]"
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
            className="my-4 space-y-2 list-disc list-outside pl-5 text-sm sm:text-base text-[#383630] font-sans leading-relaxed marker:text-[#23211a]"
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
          className="my-6 w-full overflow-x-auto rounded-2xl border border-[#e8e6df] bg-white shadow-xs"
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e8e6df] bg-[#f0ede6]/60 font-semibold text-[#23211a]">
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
                      className={`px-4 py-3 text-[#23211a] font-mono font-semibold uppercase tracking-wider text-[11px] ${alignClass}`}
                    >
                      {renderInline(header)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e6df]">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#fbfbf9] transition-colors">
                  {row.map((cell, cIdx) => {
                    const align = tableAlignments[cIdx] || "left";
                    const alignClass =
                      align === "center"
                        ? "text-center"
                        : align === "right"
                          ? "text-right"
                          : "text-left";
                    return (
                      <td key={cIdx} className={`px-4 py-3 text-[#383630] font-sans ${alignClass}`}>
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
        let badgeColor = "text-sky-900 border-sky-200 bg-sky-50";
        let title = "Note";

        if (calloutType === "TIP") {
          badgeIcon = <Lightbulb className="size-4" />;
          badgeColor = "text-emerald-900 border-emerald-200 bg-emerald-50";
          title = "Tip";
        } else if (calloutType === "IMPORTANT") {
          badgeIcon = <CheckCircle2 className="size-4" />;
          badgeColor = "text-amber-900 border-amber-200 bg-amber-50";
          title = "Important";
        } else if (calloutType === "WARNING") {
          badgeIcon = <AlertTriangle className="size-4" />;
          badgeColor = "text-amber-900 border-amber-200 bg-amber-50";
          title = "Warning";
        } else if (calloutType === "CAUTION") {
          badgeIcon = <ShieldAlert className="size-4" />;
          badgeColor = "text-rose-900 border-rose-200 bg-rose-50";
          title = "Caution";
        }

        elements.push(
          <div
            key={`callout-${key}`}
            className={`my-6 rounded-2xl border p-4 sm:p-5 ${badgeColor} shadow-xs`}
          >
            <div className="flex items-center gap-2 font-mono font-semibold text-xs uppercase tracking-wider mb-2">
              {badgeIcon}
              <span>{title}</span>
            </div>
            <div className="text-xs sm:text-sm text-[#383630] leading-relaxed font-sans">
              {renderInline(quoteContent)}
            </div>
          </div>,
        );
      } else {
        elements.push(
          <blockquote
            key={`quote-${key}`}
            className="my-5 border-l-2 border-[#23211a] pl-4 py-1 italic text-[#5c5c5c] font-serif text-base sm:text-lg leading-relaxed bg-[#f0ede6]/30 rounded-r-lg"
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
      elements.push(<hr key={`hr-${i}`} className="border-t border-[#e8e6df] my-8" />);
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
          className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#23211a] mt-10 mb-4 group flex items-center gap-2"
        >
          <span>{renderInline(headingText)}</span>
          <a
            href={`#${slug}`}
            className="opacity-0 group-hover:opacity-100 text-[#868279] hover:text-[#23211a] transition-opacity"
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
          className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-[#23211a] mt-10 mb-3 pt-4 border-t border-[#e8e6df] group flex items-center gap-2"
        >
          <span>{renderInline(headingText)}</span>
          <a
            href={`#${slug}`}
            className="opacity-0 group-hover:opacity-100 text-[#868279] hover:text-[#23211a] transition-opacity"
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
          className="text-base sm:text-lg font-serif font-medium tracking-tight text-[#23211a] mt-6 mb-2 group flex items-center gap-2"
        >
          <span>{renderInline(headingText)}</span>
          <a
            href={`#${slug}`}
            className="opacity-0 group-hover:opacity-100 text-[#868279] hover:text-[#23211a] transition-opacity"
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
          className="text-sm sm:text-base font-serif font-medium tracking-tight text-[#23211a] mt-4 mb-2 group flex items-center gap-2"
        >
          <span>{renderInline(headingText)}</span>
          <a
            href={`#${slug}`}
            className="opacity-0 group-hover:opacity-100 text-[#868279] hover:text-[#23211a] transition-opacity"
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
      <p
        key={`p-${i}`}
        className="text-[#383630] text-sm sm:text-base leading-relaxed my-3 font-sans"
      >
        {renderInline(line)}
      </p>,
    );
  }

  flushList(lines.length);
  flushTable(lines.length);
  flushBlockquote(lines.length);

  return <div className="max-w-none text-[#23211a]">{elements}</div>;
}

export default MarkdownRenderer;
