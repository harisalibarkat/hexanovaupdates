import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";

async function getSmtpSettings() {
  const rows = await db.query.settings.findMany({
    where: inArray(settings.key, [
      "smtp_host", "smtp_port", "smtp_user", "smtp_pass",
      "smtp_from_email", "smtp_from_name",
    ]),
  });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function sendEmail({
  to, subject, html,
}: { to: string; subject: string; html: string }): Promise<boolean> {
  try {
    const s = await getSmtpSettings();
    if (!s.smtp_host || !s.smtp_user || !s.smtp_pass) return false;

    const transporter = nodemailer.createTransport({
      host: s.smtp_host,
      port: parseInt(s.smtp_port ?? "587", 10),
      secure: (s.smtp_port ?? "587") === "465",
      auth: { user: s.smtp_user, pass: s.smtp_pass },
    });

    await transporter.sendMail({
      from: `"${s.smtp_from_name ?? "HexaNovaUpdates"}" <${s.smtp_from_email ?? s.smtp_user}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("sendEmail error:", err);
    return false;
  }
}

export function buildNewsletterEmail({
  title, excerpt, featuredImage, url, unsubscribeUrl, siteName,
}: {
  title: string;
  excerpt: string;
  featuredImage?: string | null;
  url: string;
  unsubscribeUrl: string;
  siteName: string;
}): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family:Inter,system-ui,sans-serif;background:#f5f5f5;margin:0;padding:20px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08)">
    <div style="background:oklch(0.55 0.22 260);padding:24px 32px">
      <h1 style="color:#fff;margin:0;font-size:20px;font-weight:800">${siteName}</h1>
      <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px">Your weekly digest</p>
    </div>
    ${featuredImage ? `<img src="${featuredImage}" alt="${title}" style="width:100%;height:220px;object-fit:cover;display:block">` : ""}
    <div style="padding:32px">
      <h2 style="margin:0 0 12px;font-size:24px;font-weight:700;line-height:1.3;color:#111">${title}</h2>
      <p style="color:#555;line-height:1.7;margin:0 0 24px;font-size:15px">${excerpt}</p>
      <a href="${url}" style="display:inline-block;background:oklch(0.55 0.22 260);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;text-transform:uppercase;letter-spacing:0.05em">Read Full Article →</a>
    </div>
    <div style="border-top:1px solid #eee;padding:20px 32px;text-align:center">
      <p style="color:#999;font-size:12px;margin:0">You're receiving this because you subscribed to ${siteName}.<br>
      <a href="${unsubscribeUrl}" style="color:#999">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}
