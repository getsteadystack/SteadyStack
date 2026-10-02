export interface PostMeta {
  title: string;
  description: string;
  date: string;
  category: "Engineering" | "Product" | "Guides" | "Agency";
  readTime: string;
  tags: string[];
  author: string;
}

export interface BlogPost {
  slug: string;
  meta: PostMeta;
}

export function formatPostDate(isoDate: string): string {
  try {
    return new Date(isoDate + "T00:00:00Z").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return isoDate;
  }
}
