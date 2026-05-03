import { db } from "@/lib/db";
import { subscribers, posts, settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail, buildNewsletterEmail } from "./mailer";

export async function sendNewsletterForPost(postId: string): Promise<void> {
  const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  if (!post) return;

  const siteNameRow = await db.query.settings.findFirst({ where: eq(settings.key, "site_name") });
  const siteName = siteNameRow?.value ?? "HexaNovaUpdates";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://hexanovaupdates.com";
  const postUrl = `${appUrl}/${post.category}/${post.slug}`;

  const activeSubscribers = await db.query.subscribers.findMany({
    where: eq(subscribers.status, "active"),
  });

  for (const sub of activeSubscribers) {
    const unsubscribeUrl = `${appUrl}/api/newsletter/unsubscribe?token=${sub.token}`;
    const html = buildNewsletterEmail({
      title: post.title,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      url: postUrl,
      unsubscribeUrl,
      siteName,
    });

    await sendEmail({
      to: sub.email,
      subject: `New Article: ${post.title}`,
      html,
    });
  }
}
