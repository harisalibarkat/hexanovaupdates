import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { email?: unknown; name?: unknown };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
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
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("subscribe error:", err);
    return NextResponse.json({ ok: false, error: "Something went wrong." }, { status: 500 });
  }
}
