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

  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, [...AUTOMATION_KEYS]));

  const dbSettings: Record<string, string> = {};
  for (const row of rows) {
    dbSettings[row.key] = row.value;
  }

  return NextResponse.json({
    dbSettings,
    missingKeys: AUTOMATION_KEYS.filter((k) => !(k in dbSettings)),
    timestamp: new Date().toISOString(),
  });
}
