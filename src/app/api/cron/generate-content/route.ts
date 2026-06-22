import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trends, settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateAndSavePost } from "@/lib/ai/content-generator";

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
    const aiGenEnabled = await getSetting("ai_generation_enabled", "false");
    if (aiGenEnabled === "false") {
      return NextResponse.json({ success: true, skipped: "ai_generation_disabled" });
    }

    const maxPostsPerRun = parseInt(await getSetting("max_posts_per_run", "5"), 10);

    const unprocessed = await db.query.trends.findMany({
      where: eq(trends.isProcessed, false),
      limit: maxPostsPerRun,
    });

    const results: { trendId: string; postId: string | null }[] = [];
    for (const trend of unprocessed) {
      const postId = await generateAndSavePost(trend.id);
      results.push({ trendId: trend.id, postId });
    }

    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (err) {
    console.error("[cron/generate-content]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
