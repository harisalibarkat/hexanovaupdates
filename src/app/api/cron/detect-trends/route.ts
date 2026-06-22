import { NextRequest, NextResponse } from "next/server";
import { detectTrendsFromSources } from "@/lib/rss/parser";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    const trendDetEnabled = await getSetting("trend_detection_enabled", "false");
    if (trendDetEnabled === "false") {
      return NextResponse.json({ success: true, skipped: "trend_detection_disabled" });
    }

    let newTrends = 0;
    const rssSyncEnabled = await getSetting("rss_sync_enabled", "false");
    if (rssSyncEnabled !== "false") {
      newTrends = await detectTrendsFromSources();
    }

    return NextResponse.json({ success: true, newTrends });
  } catch (err) {
    console.error("[cron/detect-trends]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
