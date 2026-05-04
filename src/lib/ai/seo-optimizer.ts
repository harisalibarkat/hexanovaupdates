import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { Post } from "@/lib/db/schema";
import { getGroqClients, getGroqModel, groqChatWithFallback } from "@/lib/ai/groq-client";

// ─── Scoring ─────────────────────────────────────────────────────────────────

export interface SeoScore {
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  issues: string[];
  details: {
    title: number;
    metaTitle: number;
    metaDescription: number;
    keywords: number;
    excerpt: number;
    image: number;
    content: number;
  };
}

const CTA_WORDS = ["learn", "discover", "find out", "read", "explore", "get", "see", "how", "why", "what"];

export function computeSeoScore(post: Post): SeoScore {
  const issues: string[] = [];
  const details = { title: 0, metaTitle: 0, metaDescription: 0, keywords: 0, excerpt: 0, image: 0, content: 0 };

  // Title (15 pts)
  if (post.title) {
    details.title += 5;
    const len = post.title.length;
    if (len >= 40 && len <= 70) details.title += 10;
    else issues.push(`Title is ${len} chars (ideal: 40-70)`);
  } else {
    issues.push("Missing title");
  }

  // Meta title (20 pts)
  if (post.metaTitle) {
    details.metaTitle += 5;
    const len = post.metaTitle.length;
    if (len >= 50 && len <= 60) details.metaTitle += 10;
    else issues.push(`Meta title is ${len} chars (ideal: 50-60)`);
    if (post.metaTitle !== post.title) details.metaTitle += 5;
  } else {
    issues.push("Missing meta title");
  }

  // Meta description (20 pts)
  if (post.metaDescription) {
    details.metaDescription += 5;
    const len = post.metaDescription.length;
    if (len >= 120 && len <= 160) details.metaDescription += 10;
    else issues.push(`Meta description is ${len} chars (ideal: 120-160)`);
    const lower = post.metaDescription.toLowerCase();
    if (CTA_WORDS.some((w) => lower.includes(w))) details.metaDescription += 5;
    else issues.push("Meta description lacks a call-to-action word");
  } else {
    issues.push("Missing meta description");
  }

  // Keywords (15 pts)
  if (post.keywords && post.keywords.length > 0) {
    details.keywords += 5;
    if (post.keywords.length >= 5 && post.keywords.length <= 12) details.keywords += 10;
    else issues.push(`Has ${post.keywords.length} keywords (ideal: 5-12)`);
  } else {
    issues.push("Missing keywords");
  }

  // Excerpt (10 pts)
  if (post.excerpt) {
    details.excerpt += 5;
    const len = post.excerpt.length;
    if (len >= 100 && len <= 250) details.excerpt += 5;
    else issues.push(`Excerpt is ${len} chars (ideal: 100-250)`);
  } else {
    issues.push("Missing excerpt");
  }

  // Featured image (10 pts)
  if (post.featuredImage) details.image = 10;
  else issues.push("Missing featured image");

  // Content length (10 pts) — rough word count from HTML
  const wordCount = post.content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  if (wordCount >= 800) details.content = 10;
  else issues.push(`Content ~${wordCount} words (ideal: 800+)`);

  const score = Object.values(details).reduce((a, b) => a + b, 0);
  const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";

  return { score, grade, issues, details };
}

// ─── Groq-powered optimizer ───────────────────────────────────────────────────


interface OptimizedSeoFields {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  excerpt: string;
}

export async function optimizeSeoFields(post: Post): Promise<OptimizedSeoFields> {
  const [clients, model] = await Promise.all([getGroqClients(), getGroqModel()]);

  const contentPreview = post.content
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);

  const completion = await groqChatWithFallback(clients, {
    model,
    max_tokens: 600,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: `You are a senior SEO specialist applying 2024-2025 best practices.
Respond with valid JSON only — no markdown, no code blocks, no explanation.`,
      },
      {
        role: "user",
        content: `Optimize the SEO metadata for this article.

Category: ${post.category}
Title: ${post.title}
Current keywords: ${(post.keywords ?? []).join(", ")}
Content preview: ${contentPreview}

Apply these principles:
- E-E-A-T (experience, expertise, authority, trust)
- Match primary search intent (informational/how-to/news)
- Feature snippet–friendly meta description (answers a question or starts with a verb)
- Primary keyword near the start of meta title
- Semantic keyword cluster (related terms, not just repetitions)

Return JSON exactly:
{
  "metaTitle": "50-60 chars, primary keyword first",
  "metaDescription": "120-160 chars, CTA word, matches search intent",
  "keywords": ["kw1","kw2","kw3","kw4","kw5","kw6","kw7","kw8"],
  "excerpt": "150-200 chars, hooks reader, no clickbait"
}`,
      },
    ],
  });

  const raw = completion.choices[0].message.content ?? "{}";

  // Strip markdown fences if present
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenceMatch ? fenceMatch[1] : raw;
  const objMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!objMatch) throw new Error("No JSON in SEO optimizer response");

  return JSON.parse(objMatch[0]) as OptimizedSeoFields;
}

// ─── Apply + save ─────────────────────────────────────────────────────────────

export async function optimizeAndSavePost(postId: string): Promise<{ score: number; previousScore: number }> {
  const post = await db.query.posts.findFirst({ where: eq(posts.id, postId) });
  if (!post) throw new Error("Post not found");

  const previousScore = computeSeoScore(post).score;
  const optimized = await optimizeSeoFields(post);

  await db.update(posts).set({
    metaTitle: optimized.metaTitle,
    metaDescription: optimized.metaDescription,
    keywords: optimized.keywords,
    excerpt: optimized.excerpt,
    seoOptimizedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(posts.id, postId));

  // Compute new score from updated post
  const updatedPost = { ...post, ...optimized };
  const newScore = computeSeoScore(updatedPost as Post).score;

  return { score: newScore, previousScore };
}
