import { Worker } from "bullmq";
import { getRedis } from "@/lib/redis";
import { detectTrendsFromSources } from "@/lib/rss/parser";
import { generateAndSavePost } from "@/lib/ai/content-generator";
import { db } from "@/lib/db";
import { posts, settings } from "@/lib/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { scheduleTrendDetection, scheduleAutoPublish, addContentGenerationJob } from "@/lib/queue";
import { trends } from "@/lib/db/schema";
import { sendNewsletterForPost } from "@/lib/email/newsletter";

const connection = getRedis();

async function getSetting(key: string, fallback = "false"): Promise<string> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  return row?.value ?? fallback;
}

// ─── Trend Detection Worker ───────────────────────────────────────────────────
const trendWorker = new Worker(
  "trend-detection",
  async (job) => {
    console.log(`[trend-detection] job ${job.id} started`);

    const trendDetEnabled = await getSetting("trend_detection_enabled", "false");
    if (trendDetEnabled === "false") {
      console.log("[trend-detection] skipped — trend_detection_enabled=false");
      return { skipped: true };
    }

    let newTrends = 0;
    const rssSyncEnabled = await getSetting("rss_sync_enabled", "false");
    if (rssSyncEnabled !== "false") {
      newTrends = await detectTrendsFromSources();
      console.log(`[trend-detection] found ${newTrends} new trends`);
    }

    const aiGenEnabled = await getSetting("ai_generation_enabled", "false");
    if (aiGenEnabled === "false") {
      console.log("[trend-detection] skipping content queue — ai_generation_enabled=false");
      return { newTrends, queued: 0 };
    }

    const maxPostsPerRun = parseInt(await getSetting("max_posts_per_run", "5"), 10);
    const unprocessed = await db.query.trends.findMany({
      where: eq(trends.isProcessed, false),
      limit: maxPostsPerRun,
    });

    for (const trend of unprocessed) {
      await addContentGenerationJob(trend.id, trend.category);
    }

    return { newTrends, queued: unprocessed.length };
  },
  { connection, concurrency: 1 }
);

// ─── Content Generation Worker ────────────────────────────────────────────────
const contentWorker = new Worker(
  "content-generation",
  async (job) => {
    const { trendId } = job.data as { trendId: string; category: string };

    const aiGenEnabled = await getSetting("ai_generation_enabled", "false");
    if (aiGenEnabled === "false") {
      console.log(`[content-generation] skipped trend ${trendId} — ai_generation_enabled=false`);
      return { skipped: true };
    }

    console.log(`[content-generation] generating for trend ${trendId}`);
    const postId = await generateAndSavePost(trendId);
    console.log(`[content-generation] created post ${postId}`);
    return { postId };
  },
  { connection, concurrency: 2 }
);

// ─── Publish Worker ───────────────────────────────────────────────────────────
const publishWorker = new Worker(
  "publish",
  async (job) => {
    console.log(`[publish] job ${job.id} started`);

    const autoPublishEnabled = await getSetting("auto_publish_enabled", "false");
    if (autoPublishEnabled === "false") {
      console.log("[publish] skipped — auto_publish_enabled=false");
      return { skipped: true };
    }

    const maxPostsPerRun = parseInt(await getSetting("max_posts_per_run", "5"), 10);
    const now = new Date();

    const scheduled = await db.query.posts.findMany({
      where: and(
        eq(posts.status, "scheduled"),
        lte(posts.scheduledAt!, now)
      ),
      limit: 20,
    });

    let published = 0;
    for (const post of scheduled) {
      await db
        .update(posts)
        .set({ status: "published", publishedAt: new Date() })
        .where(eq(posts.id, post.id));
      published++;
      sendNewsletterForPost(post.id).catch(console.error);
    }

    // Auto-publish drafts (respects max_posts_per_run)
    const drafts = await db.query.posts.findMany({
      where: eq(posts.status, "draft"),
      orderBy: (p, { asc }) => [asc(p.createdAt)],
      limit: maxPostsPerRun,
    });

    for (const draft of drafts) {
      await db
        .update(posts)
        .set({ status: "published", publishedAt: new Date() })
        .where(eq(posts.id, draft.id));
      published++;
      sendNewsletterForPost(draft.id).catch(console.error);
    }

    console.log(`[publish] published ${published} posts`);
    return { published };
  },
  { connection, concurrency: 1 }
);

// ─── Error handlers ───────────────────────────────────────────────────────────
for (const worker of [trendWorker, contentWorker, publishWorker]) {
  worker.on("failed", (job, err) => {
    console.error(`[${job?.queueName}] job ${job?.id} failed:`, err.message);
  });
  worker.on("completed", (job, result) => {
    console.log(`[${job.queueName}] job ${job.id} completed:`, result);
  });
}

// ─── Schedule recurring jobs on startup ──────────────────────────────────────
(async () => {
  await scheduleTrendDetection();
  await scheduleAutoPublish();
  console.log("Workers started. Cron jobs scheduled.");
})();
