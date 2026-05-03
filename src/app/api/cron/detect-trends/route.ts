import { NextRequest, NextResponse } from "next/server";
import { detectTrendsFromSources } from "@/lib/rss/parser";
import { db } from "@/lib/db";
import { trends, settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { addContentGenerationJob } from "@/lib/queue";

async function getSetting(key: string, fallback = "true"): Promise<string> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  return row?.value ?? fallback;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rssSyncEnabled   = await getSetting("rss_sync_enabled",    "true");
    const aiGenEnabled     = await getSetting("ai_generation_enabled", "true");
    const trendDetEnabled  = await getSetting("trend_detection_enabled", "true");
    const maxPostsPerRun   = parseInt(await getSetting("max_posts_per_run", "5"), 10);

    if (trendDetEnabled === "false") {
      return NextResponse.json({ success: true, skipped: "trend_detection_disabled" });
    }

    let newTrends = 0;
    if (rssSyncEnabled !== "false") {
      newTrends = await detectTrendsFromSources();
    }

    let queued = 0;
    if (aiGenEnabled !== "false") {
      const unprocessed = await db.query.trends.findMany({
        where: eq(trends.isProcessed, false),
        limit: maxPostsPerRun,
      });

      for (const trend of unprocessed) {
        await addContentGenerationJob(trend.id, trend.category);
        queued++;
      }
    }

    return NextResponse.json({ success: true, newTrends, queued });
  } catch (err) {
    console.error("[cron/detect-trends]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
