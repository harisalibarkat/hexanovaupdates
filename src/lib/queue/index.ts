import { Queue } from "bullmq";
import type { Redis } from "ioredis";

// Lazy — connections are created only when a queue function is first called,
// never at module import time. This prevents build-time Redis connection attempts.
let _conn: Redis | null = null;

function getConn(): Redis {
  if (!_conn) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const IORedis = require("ioredis").default ?? require("ioredis");
    _conn = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    }) as Redis;
  }
  return _conn;
}

let _trendQueue: Queue | null = null;
let _contentQueue: Queue | null = null;
let _publishQueue: Queue | null = null;

function trendQueue(): Queue {
  if (!_trendQueue) _trendQueue = new Queue("trend-detection", { connection: getConn() });
  return _trendQueue;
}
function contentQueue(): Queue {
  if (!_contentQueue) _contentQueue = new Queue("content-generation", { connection: getConn() });
  return _contentQueue;
}
function publishQueue(): Queue {
  if (!_publishQueue) _publishQueue = new Queue("publish", { connection: getConn() });
  return _publishQueue;
}

export async function scheduleTrendDetection() {
  await trendQueue().add(
    "detect",
    {},
    { repeat: { pattern: "*/30 * * * *" }, jobId: "trend-detection-cron" }
  );
}

export async function scheduleAutoPublish() {
  await publishQueue().add(
    "publish",
    {},
    { repeat: { pattern: "0 */2 * * *" }, jobId: "auto-publish-cron" }
  );
}

export async function addContentGenerationJob(trendId: string, category: string) {
  return contentQueue().add("generate", { trendId, category }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  });
}
