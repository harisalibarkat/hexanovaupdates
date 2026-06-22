import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// In-memory rate limiter: 5 subscriptions per IP per hour
// Best-effort — resets per serverless instance restart, good enough for a small site
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) return false;

  entry.count++;
  return true;
}

function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: unknown; name?: unknown; website?: unknown };

    // Honeypot: bots fill hidden fields, real users don't
    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name  = typeof body.name  === "string" ? body.name.trim().slice(0, 100) : "";

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
    }

    const ip = getIP(req);
    if (ip !== "unknown" && !checkRateLimit(ip)) {
      return NextResponse.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const existing = await db.query.subscribers.findFirst({
      where: eq(subscribers.email, email),
    });

    if (existing) {
      if (existing.status === "unsubscribed") {
        await db
          .update(subscribers)
          .set({ status: "active", unsubscribedAt: null })
          .where(eq(subscribers.email, email));
      }
      return NextResponse.json({ ok: true });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await db.insert(subscribers).values({
      email,
      name: name || null,
      status: "active",
      token,
      ipAddress: ip !== "unknown" ? ip : null,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("subscribe error:", err);
    return NextResponse.json({ ok: false, error: "Something went wrong." }, { status: 500 });
  }
}
