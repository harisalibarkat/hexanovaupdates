import Parser from "rss-parser";
import { createHash } from "crypto";
import { db } from "@/lib/db";
import { rssSources, trends } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { Category } from "@/lib/utils";
import { fetchOgImage } from "@/lib/og/image-fetcher";

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "HexaNovaUpdates/1.0 RSS Reader" },
});

export interface FeedItem {
  title: string;
  link: string;
  contentSnippet?: string;
  pubDate?: string;
  isoDate?: string;
}

export async function parseFeed(url: string): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items ?? []).slice(0, 20).map((item) => ({
      title: item.title ?? "",
      link: item.link ?? "",
      contentSnippet: item.contentSnippet ?? item.summary ?? "",
      pubDate: item.pubDate,
      isoDate: item.isoDate,
    }));
  } catch {
    return [];
  }
}

export function hashContent(title: string, url: string): string {
  return createHash("sha256")
    .update(`${title}::${url}`)
    .digest("hex")
    .slice(0, 64);
}

export async function detectTrendsFromSources(): Promise<number> {
  const sources = await db.query.rssSources.findMany({
    where: eq(rssSources.isActive, true),
  });

  let newTrends = 0;

  for (const source of sources) {
    const items = await parseFeed(source.url);

    for (const item of items) {
      if (!item.title || !item.link) continue;

      const hash = hashContent(item.title, item.link);

      const existing = await db.query.trends.findFirst({
        where: and(eq(trends.contentHash, hash)),
      });

      if (existing) continue;

      const imageUrl = await fetchOgImage(item.link);

      await db.insert(trends).values({
        title: item.title,
        description: item.contentSnippet?.slice(0, 500) ?? "",
        url: item.link,
        category: source.category as Category,
        sourceId: source.id,
        contentHash: hash,
        imageUrl,
        publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
      });

      newTrends++;
    }

    await db
      .update(rssSources)
      .set({
        lastFetchedAt: new Date(),
        fetchCount: source.fetchCount + 1,
      })
      .where(eq(rssSources.id, source.id));
  }

  return newTrends;
}
