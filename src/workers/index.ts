import { Worker, type Job } from "bullmq";
import { getRedis } from "@/lib/redis";
import { detectTrendsFromSources } from "@/lib/rss/parser";
import { generateAndSavePost } from "@/lib/ai/content-generator";
import { db } from "@/lib/db";
import { posts, settings } from "@/lib/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { scheduleTrendDetection, scheduleAutoPublish, addContentGenerationJob, syncQueuesWithSettings } from "@/lib/queue";
import { trends } from "@/lib/db/schema";
import { sendNewsletterForPost } from "@/lib/email/newsletter";

const connection = getRedis();

async function getSetting(key: string, fallback = "false"): Promise<string> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  return row?.value ?? fallback;
}

// ─── Job handler functions ────────────────────────────────────────────────────
// Defined as standalone functions so they can be referenced in the IIFE
// without creating Worker objects at module load time (which would cause a
// race condition where workers start polling before queues are paused).

async function handleTrendDetection(job: Job) {
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
}

async function handleContentGeneration(job: Job) {
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
}

async function handlePublish(job: Job) {
  console.log(`[publish] job ${job.id} started`);

  const autoPublishEnabled = await getSetting("auto_publish_enabled", "false");
  if (autoPublishEnabled === "false") {
    console.log("[publish] skipped — auto_publish_enabled=false");
    return { skipped: true };
  }

  const maxPostsPerRun = parseInt(await getSetting("max_posts_per_run", "5"), 10);
  const now = new Date();

  const scheduled = await db.query.posts.findMany({
    where: and(eq(posts.status, "scheduled"), lte(posts.scheduledAt!, now)),
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
}

// ─── Startup ──────────────────────────────────────────────────────────────────
// IMPORTANT: Worker objects are created INSIDE this IIFE, AFTER queue states
// are synced with DB settings. Creating them at module level is the classic
// race condition: workers start polling before the pause takes effect, so a
// pending cron job can sneak through during the startup window.
(async () => {
  console.log(`[worker] starting ${new Date().toISOString()}`);

  // 1. Read current settings from DB before touching any queue.
  const [ai, trend, autoPublish] = await Promise.all([
    getSetting("ai_generation_enabled",   "false"),
    getSetting("trend_detection_enabled", "false"),
    getSetting("auto_publish_enabled",    "false"),
  ]);
  console.log(`[worker] DB settings — ai_generation=${ai}  trend_detection=${trend}  auto_publish=${autoPublish}`);

  // 2. Pause / resume queues based on DB settings BEFORE creating Worker objects.
  //    Workers created after this point will respect the paused state from the
  //    very first poll — no race condition window.
  await syncQueuesWithSettings({
    ai_generation_enabled:   ai,
    trend_detection_enabled: trend,
    auto_publish_enabled:    autoPublish,
  });
  console.log("[worker] Queue states synced with DB settings.");

  // 3. Schedule repeatable cron jobs (idempotent — same key is deduped in Redis).
  await scheduleTrendDetection();
  await scheduleAutoPublish();

  // 4. Create Worker objects NOW — queues are already in the correct pause state.
  const trendWorker   = new Worker("trend-detection",    handleTrendDetection,   { connection, concurrency: 1 });
  const contentWorker = new Worker("content-generation", handleContentGeneration, { connection, concurrency: 2 });
  const publishWorker = new Worker("publish",            handlePublish,           { connection, concurrency: 1 });

  for (const w of [trendWorker, contentWorker, publishWorker]) {
    w.on("failed",    (job, err) => console.error(`[${job?.queueName}] job ${job?.id} failed:`, err.message));
    w.on("completed", (job, res) => console.log(`[${job.queueName}] job ${job.id} completed:`, res));
  }

  console.log("[worker] Workers started and ready.");
})().catch((err) => {
  console.error("[worker] Fatal startup error — exiting:", err);
  process.exit(1);
});
