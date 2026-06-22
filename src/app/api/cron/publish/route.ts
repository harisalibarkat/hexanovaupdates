import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, settings } from "@/lib/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { sendNewsletterForPost } from "@/lib/email/newsletter";

export const maxDuration = 300;

async function getSetting(key: string, fallback = "false"): Promise<string> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  return row?.value ?? fallback;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const autoPublishEnabled = await getSetting("auto_publish_enabled", "false");
    if (autoPublishEnabled === "false") {
      return NextResponse.json({ success: true, skipped: "auto_publish_disabled" });
    }

    const maxPostsPerRun = parseInt(await getSetting("max_posts_per_run", "5"), 10);
    const now = new Date();

    const scheduled = await db.query.posts.findMany({
      where: and(eq(posts.status, "scheduled"), lte(posts.scheduledAt!, now)),
    });

    const drafts = await db.query.posts.findMany({
      where: eq(posts.status, "draft"),
      orderBy: (p, { asc }) => [asc(p.createdAt)],
      limit: maxPostsPerRun,
    });

    const toPublish = [...scheduled, ...drafts];
    let published = 0;

    for (const post of toPublish) {
      await db
        .update(posts)
        .set({ status: "published", publishedAt: new Date() })
        .where(eq(posts.id, post.id));
      published++;
      sendNewsletterForPost(post.id).catch(console.error);
    }

    return NextResponse.json({ success: true, published });
  } catch (err) {
    console.error("[cron/publish]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
