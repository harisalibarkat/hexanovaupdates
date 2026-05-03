import Groq from "groq-sdk";
import { db } from "@/lib/db";
import { trends, posts, internalLinks, settings } from "@/lib/db/schema";
import { eq, and, ne, sql } from "drizzle-orm";
import { createSlug, estimateReadingTime, categoryLabel } from "@/lib/utils";
import { buildStructuredData } from "@/lib/seo/structured-data";
import { fetchArticleImage } from "@/lib/images/unsplash";

async function getGroqClient(): Promise<Groq> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, "groq_api_key") });
  const apiKey = row?.value || process.env.GROQ_API_KEY || "";
  return new Groq({ apiKey });
}

async function getGroqModel(): Promise<string> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, "groq_model") });
  return row?.value || "llama-3.3-70b-versatile";
}

function sanitizeJson(raw: string): string {
  // Extract JSON object, strip markdown code fences
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenceMatch ? fenceMatch[1] : raw;
  const objMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!objMatch) throw new Error("No JSON object found in response");
  // Remove control characters (0x00-0x1F) except \n \r \t
  return objMatch[0].replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
}

function parseGroqJson<T>(raw: string): T {
  try {
    return JSON.parse(sanitizeJson(raw)) as T;
  } catch {
    throw new Error("Failed to parse Groq response as JSON");
  }
}

interface GeneratedArticle {
  title: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  excerpt: string;
  content: string;
}

export async function generateArticle(
  trendTitle: string,
  trendDescription: string,
  category: string
): Promise<GeneratedArticle> {
  const categoryName = categoryLabel(category);
  const groq = await getGroqClient();
  const model = await getGroqModel();

  const completion = await groq.chat.completions.create({
    model,
    max_tokens: 4096,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `You are an expert SEO content writer for HexaNovaUpdates, a modern news and updates platform.
Write comprehensive, engaging articles that rank well in search engines.
Always respond with valid JSON only — no markdown, no code blocks.`,
      },
      {
        role: "user",
        content: `Write a detailed SEO-optimized article about this trending topic in the ${categoryName} category.

Topic: ${trendTitle}
Context: ${trendDescription}

Return a JSON object with exactly these fields:
{
  "title": "Compelling article title (60-70 chars)",
  "metaTitle": "SEO meta title (50-60 chars)",
  "metaDescription": "SEO meta description (150-160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "excerpt": "Article excerpt for previews (150-200 chars)",
  "content": "Full article in HTML format. Use <h2>, <h3>, <p>, <ul>, <li> tags. Minimum 800 words. Include introduction, 4-6 sections with headings, and conclusion."
}`,
      },
    ],
  });

  const raw = completion.choices[0].message.content ?? "{}";

  return parseGroqJson<GeneratedArticle>(raw);
}

export async function generateAndSavePost(trendId: string): Promise<string | null> {
  const trend = await db.query.trends.findFirst({
    where: eq(trends.id, trendId),
  });

  if (!trend || trend.isProcessed) return null;

  try {
    const article = await generateArticle(
      trend.title,
      trend.description ?? "",
      trend.category
    );

    let slug = createSlug(article.title);
    const existingSlug = await db.query.posts.findFirst({
      where: eq(posts.slug, slug),
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const structuredData = buildStructuredData({
      title: article.title,
      description: article.metaDescription,
      slug,
      category: trend.category,
      publishedAt: new Date(),
    });

    // Always get an image: OG from source → Unsplash → Pexels → Openverse → Picsum
    const imageQuery = `${trend.title} ${categoryLabel(trend.category)}`;
    const featuredImage = trend.imageUrl ?? await fetchArticleImage(imageQuery);

    const [post] = await db.insert(posts).values({
      title: article.title,
      slug,
      excerpt: article.excerpt,
      content: article.content,
      category: trend.category,
      status: "draft",
      trendId: trend.id,
      metaTitle: article.metaTitle,
      metaDescription: article.metaDescription,
      keywords: article.keywords,
      featuredImage,
      readingTime: estimateReadingTime(article.content),
      structuredData,
    }).returning();

    await db.update(trends).set({ isProcessed: true }).where(eq(trends.id, trendId));

    await addInternalLinks(post.id, trend.category);

    return post.id;
  } catch (err) {
    console.error("Content generation failed:", err);
    return null;
  }
}

async function addInternalLinks(newPostId: string, category: string) {
  const relatedPosts = await db.query.posts.findMany({
    where: and(
      eq(posts.category, category as "tech"),
      eq(posts.status, "published"),
      ne(posts.id, newPostId)
    ),
    orderBy: sql`random()`,
    limit: 3,
  });

  for (const related of relatedPosts) {
    await db.insert(internalLinks).values({
      sourcePostId: newPostId,
      targetPostId: related.id,
      anchorText: related.title.slice(0, 60),
    }).onConflictDoNothing();
  }
}
