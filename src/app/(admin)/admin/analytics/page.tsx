import { db } from "@/lib/db";
import { pageViews, posts } from "@/lib/db/schema";
import { desc, count, eq, gte, sql, isNotNull, inArray } from "drizzle-orm";
import Link from "next/link";
import { categoryLabel } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics — HexaNovaUpdates Admin" };

export const dynamic = "force-dynamic";

interface TopPost {
  postId: string;
  views: number;
  title: string;
  slug: string;
  category: string;
}

interface DayView {
  date: string;
  views: number;
}

const CAT_BADGE: Record<string, string> = {
  tech: "bg-blue-100 text-blue-700",
  celebs: "bg-pink-100 text-pink-700",
  viral: "bg-orange-100 text-orange-700",
  finance: "bg-emerald-100 text-emerald-700",
  health: "bg-green-100 text-green-700",
  travel: "bg-cyan-100 text-cyan-700",
};

export default async function AnalyticsPage() {
  let totalViews = 0;
  let todayViews = 0;
  let weekViews = 0;
  let uniquePostsViewed = 0;
  let topPosts: TopPost[] = [];
  let dailyViews: DayView[] = [];

  try {
    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [totalResult] = await db.select({ value: count() }).from(pageViews);
    totalViews = totalResult?.value ?? 0;

    const [todayResult] = await db
      .select({ value: count() })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, todayMidnight));
    todayViews = todayResult?.value ?? 0;

    const [weekResult] = await db
      .select({ value: count() })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, sevenDaysAgo));
    weekViews = weekResult?.value ?? 0;

    const uniquePostsResult = await db
      .selectDistinct({ postId: pageViews.postId })
      .from(pageViews)
      .where(isNotNull(pageViews.postId));
    uniquePostsViewed = uniquePostsResult.length;

    const topPostRows = await db
      .select({
        postId: pageViews.postId,
        views: count(),
      })
      .from(pageViews)
      .where(isNotNull(pageViews.postId))
      .groupBy(pageViews.postId)
      .orderBy(desc(count()))
      .limit(10);

    if (topPostRows.length > 0) {
      const postIds = topPostRows
        .map((r) => r.postId)
        .filter((id): id is string => id !== null);

      const postData = await db
        .select({ id: posts.id, title: posts.title, slug: posts.slug, category: posts.category })
        .from(posts)
        .where(inArray(posts.id, postIds));

      const postMap = new Map(postData.map((p) => [p.id, p]));

      topPosts = topPostRows
        .filter((r) => r.postId && postMap.has(r.postId))
        .map((r) => {
          const p = postMap.get(r.postId!)!;
          return { postId: r.postId!, views: r.views, title: p.title, slug: p.slug, category: p.category };
        });
    }

    const dailyRows = await db
      .select({
        date: sql<string>`TO_CHAR(DATE(${pageViews.viewedAt}), 'YYYY-MM-DD')`,
        views: count(),
      })
      .from(pageViews)
      .where(gte(pageViews.viewedAt, fourteenDaysAgo))
      .groupBy(sql`DATE(${pageViews.viewedAt})`)
      .orderBy(sql`DATE(${pageViews.viewedAt}) ASC`);

    dailyViews = dailyRows.map((r) => ({ date: r.date, views: r.views }));
  } catch {
    // Graceful fallback — all values already initialised to 0 / []
  }

  const maxDayViews = Math.max(1, ...dailyViews.map((d) => d.views));

  function fmtDay(dateStr: string) {
    const d = new Date(dateStr + "T12:00:00Z");
    return d.toLocaleDateString("en-US", { weekday: "short", day: "2-digit", timeZone: "UTC" });
  }

  return (
    <div className="p-8 space-y-10 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold mb-1">Analytics</h1>
        <p className="text-muted-foreground text-sm">Page view statistics across the site</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: totalViews.toLocaleString() },
          { label: "Today", value: todayViews.toLocaleString() },
          { label: "This Week", value: weekViews.toLocaleString() },
          { label: "Unique Posts Viewed", value: uniquePostsViewed.toLocaleString() },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{stat.label}</p>
            <p className="text-3xl font-extrabold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Last 14 days bar chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-bold text-lg mb-6">Last 14 Days</h2>
        {dailyViews.length === 0 ? (
          <p className="text-muted-foreground text-sm">No data yet.</p>
        ) : (
          <div className="flex items-end gap-2 h-40">
            {dailyViews.map((d) => {
              const heightPct = Math.max(4, Math.round((d.views / maxDayViews) * 100));
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <span className="text-xs text-muted-foreground font-medium">{d.views}</span>
                  <div
                    className="w-full rounded-t-sm bg-brand/80 hover:bg-brand transition-colors"
                    style={{ height: `${heightPct}%` }}
                    title={`${d.date}: ${d.views} views`}
                  />
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                    {fmtDay(d.date)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Articles */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-lg">Top Articles</h2>
        </div>
        {topPosts.length === 0 ? (
          <p className="p-6 text-muted-foreground text-sm">No data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-muted-foreground text-xs uppercase tracking-wide">
                <th className="px-6 py-3 text-left w-10">#</th>
                <th className="px-6 py-3 text-left">Title</th>
                <th className="px-6 py-3 text-left">Category</th>
                <th className="px-6 py-3 text-right">Views</th>
              </tr>
            </thead>
            <tbody>
              {topPosts.map((p, i) => (
                <tr key={p.postId} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3 text-muted-foreground font-mono font-bold">{i + 1}</td>
                  <td className="px-6 py-3">
                    <Link
                      href={`/${p.category}/${p.slug}`}
                      target="_blank"
                      className="font-medium hover:text-brand transition-colors line-clamp-1"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${CAT_BADGE[p.category] ?? "bg-muted text-foreground"}`}>
                      {categoryLabel(p.category)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-bold tabular-nums">{p.views.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
