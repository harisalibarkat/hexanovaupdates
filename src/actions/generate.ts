"use server";

import { auth } from "@/lib/auth";
import { detectTrendsFromSources } from "@/lib/rss/parser";
import { generateAndSavePost } from "@/lib/ai/content-generator";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Groq from "groq-sdk";
import { createSlug, estimateReadingTime, categoryLabel } from "@/lib/utils";
import { buildStructuredData } from "@/lib/seo/structured-data";
import { fetchArticleImage } from "@/lib/images/unsplash";
import { z } from "zod";

// ─── RSS Sync ─────────────────────────────────────────────────────────────────
export async function syncRSSNow(): Promise<{ count: number }> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const count = await detectTrendsFromSources();
  revalidatePath("/admin");
  return { count };
}

// ─── Generate from existing trend ────────────────────────────────────────────
export async function generateArticleFromTrend(
  trendId: string
): Promise<{ postId: string | null }> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const postId = await generateAndSavePost(trendId);
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  return { postId };
}

// ─── Generate from custom topic ───────────────────────────────────────────────
const topicSchema = z.object({
  topic: z.string().min(3).max(300),
  category: z.enum(["tech", "celebs", "viral", "finance", "health", "travel"]),
});

export async function generateArticleFromTopic(
  formData: FormData
): Promise<{ postId: string; slug: string }> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const parsed = topicSchema.parse({
    topic: formData.get("topic"),
    category: formData.get("category"),
  });

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const catName = categoryLabel(parsed.category);

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 4096,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You are an expert SEO content writer for HexaNovaUpdates. Respond with valid JSON only.",
      },
      {
        role: "user",
        content: `Write a detailed SEO-optimized article about: "${parsed.topic}" in the ${catName} category.

Return a JSON object with exactly these fields:
{
  "title": "Compelling article title (60-70 chars)",
  "metaTitle": "SEO meta title (50-60 chars)",
  "metaDescription": "SEO meta description (150-160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "excerpt": "Article excerpt for previews (150-200 chars)",
  "content": "Full article in HTML format. Use <h2>, <h3>, <p>, <ul>, <li> tags. Minimum 800 words."
}`,
      },
    ],
  });

  const raw = completion.choices[0].message.content ?? "{}";
  let article: Record<string, unknown>;
  try {
    const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    const src = fence ? fence[1] : raw;
    const obj = src.match(/\{[\s\S]*\}/);
    const clean = obj ? obj[0].replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") : "{}";
    article = JSON.parse(clean);
  } catch {
    article = {};
  }

  if (!article.title) throw new Error("AI did not return a valid article");

  let slug = createSlug(article.title as string);
  const existing = await db.query.posts.findFirst({ where: eq(posts.slug, slug) });
  if (existing) slug = `${slug}-${Date.now()}`;

  const featuredImage = await fetchArticleImage(`${parsed.topic} ${catName}`);

  const [post] = await db
    .insert(posts)
    .values({
      title: article.title as string,
      slug,
      excerpt: (article.excerpt as string) ?? "",
      content: article.content as string,
      category: parsed.category,
      status: "draft",
      metaTitle: article.metaTitle as string,
      metaDescription: article.metaDescription as string,
      keywords: article.keywords as string[],
      featuredImage,
      readingTime: estimateReadingTime(article.content as string),
      structuredData: buildStructuredData({
        title: article.title as string,
        description: (article.metaDescription as string) ?? "",
        slug,
        category: parsed.category,
        publishedAt: new Date(),
      }),
    })
    .returning();

  revalidatePath("/admin/posts");
  return { postId: post.id, slug: post.slug };
}

// ─── Publish immediately ──────────────────────────────────────────────────────
export async function publishPostNow(postId: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db
    .update(posts)
    .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(posts.id, postId));

  revalidatePath("/admin/posts");
  revalidatePath("/");
}

// ─── Bulk: publish all drafts ─────────────────────────────────────────────────
export async function bulkPublishDrafts(): Promise<{ count: number }> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const drafts = await db.query.posts.findMany({ where: eq(posts.status, "draft") });
  for (const d of drafts) {
    await db
      .update(posts)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(posts.id, d.id));
  }

  revalidatePath("/admin/posts");
  revalidatePath("/");
  return { count: drafts.length };
}

// ─── Bulk: delete failed posts ────────────────────────────────────────────────
export async function bulkDeleteFailed(): Promise<{ count: number }> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const failed = await db.query.posts.findMany({ where: eq(posts.status, "failed") });
  for (const f of failed) {
    await db.delete(posts).where(eq(posts.id, f.id));
  }

  revalidatePath("/admin/posts");
  return { count: failed.length };
}

// ─── Update post ──────────────────────────────────────────────────────────────
const updatePostSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(500),
  excerpt: z.string(),
  content: z.string(),
  metaTitle: z.string().max(160).optional(),
  metaDescription: z.string().max(320).optional(),
  keywords: z.array(z.string()).optional(),
  featuredImage: z.string().optional(),
  status: z.enum(["draft", "scheduled", "published", "failed"]),
  scheduledAt: z.date().optional().nullable(),
});

export type UpdatePostData = z.infer<typeof updatePostSchema>;

export async function updatePost(postId: string, data: UpdatePostData): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const parsed = updatePostSchema.parse(data);

  const existing = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  if (!existing) throw new Error("Post not found");

  const readingTime = estimateReadingTime(parsed.content);
  const structuredData = buildStructuredData({
    title: parsed.title,
    description: parsed.metaDescription ?? parsed.excerpt,
    slug: parsed.slug,
    category: existing.category,
    publishedAt:
      parsed.status === "published"
        ? (existing.publishedAt ?? new Date())
        : new Date(),
    image: parsed.featuredImage,
  });

  await db
    .update(posts)
    .set({
      title: parsed.title,
      slug: parsed.slug,
      excerpt: parsed.excerpt,
      content: parsed.content,
      metaTitle: parsed.metaTitle ?? null,
      metaDescription: parsed.metaDescription ?? null,
      keywords: parsed.keywords ?? [],
      featuredImage: parsed.featuredImage ?? null,
      status: parsed.status,
      scheduledAt: parsed.scheduledAt ?? null,
      publishedAt:
        parsed.status === "published" && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
      readingTime,
      structuredData,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));

  revalidatePath("/admin/posts");
  revalidatePath(`/${existing.category}/${parsed.slug}`);
  if (existing.slug !== parsed.slug) {
    revalidatePath(`/${existing.category}/${existing.slug}`);
  }
  revalidatePath("/");
}
