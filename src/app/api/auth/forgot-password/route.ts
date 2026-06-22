import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "@/lib/email/mailer";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rate limit: 3 reset requests per email per 15 minutes (in-memory)
const forgotRateLimit = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json() as { email?: string };

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ ok: false, error: "Invalid email address." }, { status: 400 });
    }

    const key = email.toLowerCase().trim();

    // Rate limit
    const now = Date.now();
    const entry = forgotRateLimit.get(key);
    if (entry && now < entry.resetAt && entry.count >= 3) {
      // Return ok anyway — don't reveal that limit was hit
      return NextResponse.json({ ok: true });
    }
    if (!entry || now > entry.resetAt) {
      forgotRateLimit.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    } else {
      entry.count++;
    }

    // Only proceed if user exists — don't reveal whether they do via response
    const user = await db.query.users.findFirst({
      where: eq(users.email, key),
    });

    if (user) {
      // Delete any existing reset token for this email
      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, `pwd-reset:${key}`),
          )
        );

      const rawToken = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(verificationTokens).values({
        identifier: `pwd-reset:${key}`,
        token: rawToken,
        expires,
      });

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://hexanovaupdates.com";
      const resetUrl = `${appUrl}/login/reset?token=${rawToken}&email=${encodeURIComponent(key)}`;

      await sendEmail({
        to: key,
        subject: "Reset your HexaNovaUpdates password",
        html: `
          <div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px;color:#1c1b1b">
            <div style="background:#000;padding:20px 32px;margin-bottom:32px">
              <p style="color:#fff;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin:0">HEXANOVAUPDATES</p>
            </div>
            <h1 style="font-size:24px;font-weight:700;margin:0 0 12px">Reset Your Password</h1>
            <p style="color:#444;line-height:1.7;margin:0 0 28px">
              We received a request to reset the password for your admin account.
              Click the button below to set a new password. This link expires in 1 hour.
            </p>
            <a href="${resetUrl}" style="display:inline-block;background:#000;color:#fff;padding:12px 28px;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase">
              Reset Password
            </a>
            <p style="color:#999;font-size:12px;margin:28px 0 0;line-height:1.6">
              If you didn't request this, ignore this email — your password won't change.<br>
              Or copy this link: <span style="word-break:break-all">${resetUrl}</span>
            </p>
          </div>
        `,
      });
    }

    // Always return ok to prevent email enumeration
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ ok: true }); // Don't leak errors
  }
}
