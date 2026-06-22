import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageViews } from "@/lib/db/schema";
import { and, eq, gte } from "drizzle-orm";

const PRIVATE_IP = /^(::1|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

// Allow max 60 track events per IP per minute (prevents flooding)
const trackRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkTrackLimit(ip: string): boolean {
  const now = Date.now();
  const entry = trackRateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    trackRateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 60) return false;
  entry.count++;
  return true;
}

function extractIP(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

async function resolveCountry(req: NextRequest): Promise<string | null> {
  // Vercel injects this for free — check it first (zero latency)
  const vercelCountry = req.headers.get("x-vercel-ip-country");
  if (vercelCountry && vercelCountry.length === 2) return vercelCountry.toUpperCase();

  const ip = extractIP(req);
  if (!ip || PRIVATE_IP.test(ip)) return null;

  try {
    const res = await fetch(`https://ipinfo.io/${ip}/country`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    const code = (await res.text()).trim();
    return code.length === 2 ? code.toUpperCase() : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = extractIP(req);
    if (ip && !PRIVATE_IP.test(ip) && !checkTrackLimit(ip)) {
      return NextResponse.json({ ok: true });
    }

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

    const country = await resolveCountry(req);

    await db.insert(pageViews).values({
      path,
      postId: postId ?? undefined,
      referrer: referrer ?? undefined,
      userAgent: userAgent ?? undefined,
      sessionId: sessionId ?? undefined,
      country: country ?? undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
