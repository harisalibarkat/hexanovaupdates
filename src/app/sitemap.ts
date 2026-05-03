import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CATEGORIES } from "@/lib/utils";

// Never pre-render at build time — DB is not available then.
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hexanovaupdates.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedPosts = await db.query.posts.findMany({
    where: eq(posts.status, "published"),
    columns: { slug: true, category: true, updatedAt: true, publishedAt: true },
  });

  const postUrls: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: `${BASE_URL}/${post.category}/${post.slug}`,
    lastModified: post.updatedAt ?? post.publishedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${BASE_URL}/${cat}`,
    lastModified: new Date(),
    changeFrequency: "hourly",
    priority: 0.9,
  }));

  return [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "hourly", priority: 1.0 },
    ...categoryUrls,
    ...postUrls,
  ];
}
