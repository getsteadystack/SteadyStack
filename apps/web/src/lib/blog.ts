import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import type { BlogPost, PostMeta } from "./blog-types";
import { formatPostDate } from "./blog-types";

export type { BlogPost, PostMeta };
export { formatPostDate };

const POSTS_DIR = path.join(process.cwd(), "src", "content", "blog");

export const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.string(),
  category: z.enum(["Engineering", "Product", "Guides", "Agency"]),
  readTime: z.string(),
  tags: z.array(z.string()).default([]),
  author: z.string().default("SteadyStack Team"),
});

export function getAllPosts(): BlogPost[] {
  const files = fs.readdirSync(POSTS_DIR).filter((file) => file.endsWith(".mdx"));

  const posts = files.flatMap((file) => {
    const slug = file
      .replace(/\.mdx$/, "")
      .trim()
      .toLowerCase();
    const isSafeSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
    if (!isSafeSlug) return [];

    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { data } = matter(raw);
    return [{ slug, meta: postSchema.parse(data) }];
  });

  return posts.sort((a, b) => b.meta.date.localeCompare(a.meta.date));
}

export async function getPostBySlug(slug: string) {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return { slug, meta: postSchema.parse(data), content };
}
