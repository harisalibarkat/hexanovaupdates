import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { token, email, password } = await req.json() as {
      token?: string;
      email?: string;
      password?: string;
    };

    if (!token || !email || !password || password.length < 8) {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }

    const key = email.toLowerCase().trim();

    // Look up the token
    const record = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.identifier, `pwd-reset:${key}`),
        eq(verificationTokens.token, token)
      ),
    });

    if (!record) {
      return NextResponse.json({ ok: false, error: "Invalid or expired reset link." }, { status: 400 });
    }

    if (new Date() > record.expires) {
      await db
        .delete(verificationTokens)
        .where(eq(verificationTokens.identifier, `pwd-reset:${key}`));
      return NextResponse.json({ ok: false, error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.email, key),
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found." }, { status: 400 });
    }

    const { default: bcrypt } = await import("bcryptjs");
    const hashed = await bcrypt.hash(password, 12);

    await db.update(users).set({ password: hashed }).where(eq(users.id, user.id));

    // Consume the token
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.identifier, `pwd-reset:${key}`));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reset-password]", err);
    return NextResponse.json({ ok: false, error: "Something went wrong." }, { status: 500 });
  }
}
