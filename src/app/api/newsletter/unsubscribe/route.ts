import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";

  if (!token) {
    return new NextResponse(invalidHtml(), { status: 400, headers: { "Content-Type": "text/html" } });
  }

  try {
    const subscriber = await db.query.subscribers.findFirst({
      where: eq(subscribers.token, token),
    });

    if (!subscriber) {
      return new NextResponse(invalidHtml(), { status: 404, headers: { "Content-Type": "text/html" } });
    }

    await db
      .update(subscribers)
      .set({ status: "unsubscribed", unsubscribedAt: new Date() })
      .where(eq(subscribers.token, token));

    return new NextResponse(successHtml(), { status: 200, headers: { "Content-Type": "text/html" } });
  } catch (err) {
    console.error("unsubscribe error:", err);
    return new NextResponse(invalidHtml(), { status: 500, headers: { "Content-Type": "text/html" } });
  }
}

function successHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unsubscribed</title></head><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5"><div style="background:#fff;border-radius:12px;padding:48px 40px;text-align:center;box-shadow:0 2px 20px rgba(0,0,0,0.08);max-width:400px"><h1 style="font-size:20px;margin:0 0 12px">You have been unsubscribed.</h1><p style="color:#666;margin:0">You will no longer receive newsletter emails.</p></div></body></html>`;
}

function invalidHtml() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Invalid Link</title></head><body style="font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5"><div style="background:#fff;border-radius:12px;padding:48px 40px;text-align:center;box-shadow:0 2px 20px rgba(0,0,0,0.08);max-width:400px"><h1 style="font-size:20px;margin:0 0 12px">Invalid unsubscribe link.</h1><p style="color:#666;margin:0">This link may have already been used or is incorrect.</p></div></body></html>`;
}
