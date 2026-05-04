import { db } from "@/lib/db";
import { posts, trends, rssSources } from "@/lib/db/schema";
import { eq, count, desc, and } from "drizzle-orm";
import { Suspense } from "react";
import { StatsCard } from "@/components/admin/StatsCard";
import { SuggestedNews } from "@/components/admin/SuggestedNews";
import { ManualGenerator } from "@/components/admin/ManualGenerator";
import { BulkActions } from "@/components/admin/BulkActions";
import { ArticleActivity } from "@/components/admin/ArticleActivity";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Dashboard" };

async function getDashboardData() {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    failedPosts,
    totalTrends,
    activeSources,
    recentPosts,
    unprocessedTrends,
  ] = await Promise.all([
    db.select({ count: count() }).from(posts),
    db.select({ count: count() }).from(posts).where(eq(posts.status, "published")),
    db.select({ count: count() }).from(posts).where(eq(posts.status, "draft")),
    db.select({ count: count() }).from(posts).where(eq(posts.status, "failed")),
    db.select({ count: count() }).from(trends),
    db.select({ count: count() }).from(rssSources).where(eq(rssSources.isActive, true)),
    db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      limit: 8,
    }),
    db.query.trends.findMany({
      where: eq(trends.isProcessed, false),
      orderBy: [desc(trends.detectedAt)],
      limit: 20,
    }),
  ]);

  return {
    totalPosts: totalPosts[0].count,
    publishedPosts: publishedPosts[0].count,
    draftPosts: draftPosts[0].count,
    failedPosts: failedPosts[0].count,
    totalTrends: totalTrends[0].count,
    activeSources: activeSources[0].count,
    recentPosts,
    unprocessedTrends,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <span className="text-xs text-muted-foreground">
          {data.activeSources} active RSS source{data.activeSources !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatsCard title="Total Posts" value={data.totalPosts} icon="file-text" />
        <StatsCard title="Published" value={data.publishedPosts} icon="check-circle" variant="success" />
        <StatsCard title="Drafts" value={data.draftPosts} icon="clock" variant="warning" />
        <StatsCard title="Trends Found" value={data.totalTrends} icon="trending-up" />
        <StatsCard title="Failed" value={data.failedPosts} icon="activity" variant={data.failedPosts > 0 ? "danger" : "default"} />
      </div>

      {/* Main grid: Suggested News + Sidebar tools */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <SuggestedNews trends={data.unprocessedTrends} />
          <Suspense fallback={<div className="bg-card rounded-xl border border-border p-6 animate-pulse h-64" />}>
            <ArticleActivity />
          </Suspense>
        </div>
        <div className="space-y-6">
          <ManualGenerator />
          <BulkActions draftCount={data.draftPosts} failedCount={data.failedPosts} />
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Recent Articles</h2>
          <Link href="/admin/posts" className="text-xs text-brand hover:underline font-medium">
            View all →
          </Link>
        </div>
        <div className="space-y-2">
          {data.recentPosts.map((post) => (
            <div key={post.id} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                  {post.category} · {formatDate(post.createdAt)}
                </p>
              </div>
              <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-semibold ${
                post.status === "published"
                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                  : post.status === "draft"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                  : post.status === "failed"
                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                  : "bg-muted text-muted-foreground"
              }`}>
                {post.status}
              </span>
            </div>
          ))}
          {data.recentPosts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No posts yet. Generate your first article above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
