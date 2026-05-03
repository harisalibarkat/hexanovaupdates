import { db } from "@/lib/db";
import { posts, settings } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { computeSeoScore } from "@/lib/ai/seo-optimizer";
import { SeoPanel } from "@/components/admin/SeoPanel";

export const metadata = { title: "SEO Optimizer" };

export default async function SeoPage() {
  const [allPosts, allSettings] = await Promise.all([
    db.query.posts.findMany({
      where: eq(posts.status, "published"),
      orderBy: [desc(posts.publishedAt)],
      columns: {
        id: true, title: true, slug: true, category: true,
        metaTitle: true, metaDescription: true, keywords: true,
        excerpt: true, featuredImage: true, content: true,
        readingTime: true, seoOptimizedAt: true, publishedAt: true,
      },
    }),
    db.query.settings.findMany(),
  ]);

  const settingsMap = Object.fromEntries(allSettings.map((s) => [s.key, s.value]));

  const postsWithScores = allPosts.map((p) => ({
    ...p,
    seoScore: computeSeoScore(p as Parameters<typeof computeSeoScore>[0]),
  }));

  const avgScore = postsWithScores.length
    ? Math.round(postsWithScores.reduce((s, p) => s + p.seoScore.score, 0) / postsWithScores.length)
    : 0;

  const needsWork = postsWithScores.filter((p) => p.seoScore.score < 70).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">SEO Optimizer</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze and optimize SEO metadata using 2024–2025 best practices.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Published Articles" value={postsWithScores.length} />
        <StatCard label="Avg SEO Score" value={`${avgScore}/100`} />
        <StatCard label="Need Attention" value={needsWork} highlight={needsWork > 0} />
        <StatCard
          label="Already Optimized"
          value={postsWithScores.filter((p) => p.seoOptimizedAt).length}
        />
      </div>

      <SeoPanel posts={postsWithScores} settings={settingsMap} />
    </div>
  );
}

function StatCard({
  label, value, highlight = false,
}: {
  label: string; value: string | number; highlight?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-orange-500" : ""}`}>{value}</p>
    </div>
  );
}
