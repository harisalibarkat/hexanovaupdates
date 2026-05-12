import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

const AUTOMATION_KEYS = [
  "ai_generation_enabled",
  "trend_detection_enabled",
  "rss_sync_enabled",
  "auto_publish_enabled",
  "max_posts_per_run",
] as const;

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Read DB settings
  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, [...AUTOMATION_KEYS]));

  const dbSettings: Record<string, string> = {};
  for (const row of rows) {
    dbSettings[row.key] = row.value;
  }

  // Try to get BullMQ queue states (requires Redis)
  let queueStates: Record<string, unknown> = { error: "Redis not checked" };
  try {
    const { Queue } = await import("bullmq");
    const { getRedis } = await import("@/lib/redis");
    const conn = getRedis();

    const queueNames = ["trend-detection", "content-generation", "publish"];
    queueStates = {};
    for (const name of queueNames) {
      const q = new Queue(name, { connection: conn });
      const [isPaused, waiting, active] = await Promise.all([
        q.isPaused(),
        q.getWaitingCount(),
        q.getActiveCount(),
      ]);
      queueStates[name] = { paused: isPaused, waiting, active };
      await q.close();
    }
  } catch (err) {
    queueStates = { error: String(err) };
  }

  return NextResponse.json({
    dbSettings,
    // Which keys are missing (will use fallback "false" in workers)
    missingKeys: AUTOMATION_KEYS.filter((k) => !(k in dbSettings)),
    queueStates,
    timestamp: new Date().toISOString(),
  });
}
