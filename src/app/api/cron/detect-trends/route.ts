import { NextRequest, NextResponse } from "next/server";
import { detectTrendsFromSources } from "@/lib/rss/parser";
import { db } from "@/lib/db";
import { trends } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { addContentGenerationJob } from "@/lib/queue";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newTrends = await detectTrendsFromSources();

    const unprocessed = await db.query.trends.findMany({
      where: eq(trends.isProcessed, false),
      limit: 5,
    });

    for (const trend of unprocessed) {
      await addContentGenerationJob(trend.id, trend.category);
    }

    return NextResponse.json({
      success: true,
      newTrends,
      queued: unprocessed.length,
    });
  } catch (err) {
    console.error("[cron/detect-trends]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
