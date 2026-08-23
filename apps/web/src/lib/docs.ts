import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { extractHeadings, type TocItem } from "./markdown";
import { DOCS_NAVIGATION, type DocMeta, type NavLink, type NavSection } from "./docs-config";

export { DOCS_NAVIGATION };
export type { DocMeta, NavLink, NavSection };

const DOCS_DIR = path.join(process.cwd(), "src", "content", "docs");

export interface DocItem {
  slug: string;
  meta: DocMeta;
  content: string;
  headings: TocItem[];
}

const docSchema = z.object({
  title: z.string(),
  description: z.string(),
  section: z.string(),
  order: z.number().default(0),
  badge: z.string().optional(),
  lastUpdated: z.string().optional(),
});

export function getAllDocSlugs(): string[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  return fs
    .readdirSync(DOCS_DIR)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => file.replace(/\.(mdx|md)$/, ""));
}

export function getAllDocs(): DocItem[] {
  if (!fs.existsSync(DOCS_DIR)) return [];

  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));

  const docs = files.flatMap((file) => {
    const slug = file.replace(/\.(mdx|md)$/, "");
    const raw = fs.readFileSync(path.join(DOCS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    const meta = docSchema.parse(data);
    const headings = extractHeadings(content);

    return [{ slug, meta, content, headings }];
  });

  return docs.sort((a, b) => a.meta.order - b.meta.order);
}

export function getDocBySlug(slug: string): DocItem | null {
  if (!fs.existsSync(DOCS_DIR)) return null;

  let filePath = path.join(DOCS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DOCS_DIR, `${slug}.md`);
  }

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const meta = docSchema.parse(data);
  const headings = extractHeadings(content);

  return { slug, meta, content, headings };
}

export function getAdjacentDocs(currentSlug: string): {
  prev: NavLink | null;
  next: NavLink | null;
} {
  const flattenedLinks: NavLink[] = [];
  for (const section of DOCS_NAVIGATION) {
    for (const item of section.items) {
      flattenedLinks.push(item);
    }
  }

  const currentIndex = flattenedLinks.findIndex((item) => item.slug === currentSlug);
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: currentIndex > 0 ? flattenedLinks[currentIndex - 1] : null,
    next: currentIndex < flattenedLinks.length - 1 ? flattenedLinks[currentIndex + 1] : null,
  };
}
