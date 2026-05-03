import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageViews } from "@/lib/db/schema";
import { and, eq, gte } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      path?: string;
      postId?: string;
      referrer?: string;
      sessionId?: string;
    };

    const path = typeof body.path === "string" ? body.path.slice(0, 500) : "/";
    const postId = typeof body.postId === "string" ? body.postId : null;
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : null;
    const userAgent = req.headers.get("user-agent");

    if (sessionId) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      const existing = await db
        .select({ id: pageViews.id })
        .from(pageViews)
        .where(
          and(
            eq(pageViews.sessionId, sessionId),
            eq(pageViews.path, path),
            gte(pageViews.viewedAt, thirtyMinutesAgo)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return NextResponse.json({ ok: true });
      }
    }

    await db.insert(pageViews).values({
      path,
      postId: postId ?? undefined,
      referrer: referrer ?? undefined,
      userAgent: userAgent ?? undefined,
      sessionId: sessionId ?? undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
