import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, settings } from "@/lib/db/schema";
import { eq, isNull, or, lt } from "drizzle-orm";
import { optimizeAndSavePost } from "@/lib/ai/seo-optimizer";

async function getSetting(key: string, fallback: string): Promise<string> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  return row?.value ?? fallback;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const enabled      = await getSetting("seo_optimization_enabled", "false");
    if (enabled === "false") {
      return NextResponse.json({ success: true, skipped: "seo_optimization_disabled" });
    }

    const batchSize    = parseInt(await getSetting("seo_batch_size",    "3"),  10);
    const cooldownDays = parseInt(await getSetting("seo_cooldown_days", "7"),  10);
    const cutoff       = new Date(Date.now() - cooldownDays * 86_400_000);

    const eligible = await db.query.posts.findMany({
      where: (p, { and, eq }) => and(
        eq(p.status, "published"),
        or(isNull(p.seoOptimizedAt), lt(p.seoOptimizedAt!, cutoff))
      ),
      orderBy: (p, { asc }) => [asc(p.seoOptimizedAt)],
      limit: batchSize,
      columns: { id: true },
    });

    const results = [];
    for (const { id } of eligible) {
      try {
        const r = await optimizeAndSavePost(id);
        results.push({ postId: id, ...r });
      } catch (err) {
        results.push({ postId: id, error: String(err) });
      }
    }

    return NextResponse.json({ success: true, optimized: results.length, results });
  } catch (err) {
    console.error("[cron/seo-optimize]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
