import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, and, lte } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Publish scheduled posts that are due
    const scheduled = await db.query.posts.findMany({
      where: and(eq(posts.status, "scheduled"), lte(posts.scheduledAt!, now)),
    });

    // Also auto-publish up to 5 drafts
    const drafts = await db.query.posts.findMany({
      where: eq(posts.status, "draft"),
      orderBy: (p, { asc }) => [asc(p.createdAt)],
      limit: 5,
    });

    const toPublish = [...scheduled, ...drafts];
    let published = 0;

    for (const post of toPublish) {
      await db
        .update(posts)
        .set({ status: "published", publishedAt: new Date() })
        .where(eq(posts.id, post.id));
      published++;
    }

    return NextResponse.json({ success: true, published });
  } catch (err) {
    console.error("[cron/publish]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
