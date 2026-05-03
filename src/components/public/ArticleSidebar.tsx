import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { CATEGORIES, categoryLabel, formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/db/schema";
import { SidebarNewsletter } from "@/components/public/SidebarNewsletter";
import { AdSlot } from "@/components/ads/AdSlot";

const CAT_PILL: Record<string, string> = {
  tech: "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900",
  celebs: "bg-pink-100 text-pink-700 hover:bg-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:hover:bg-pink-900",
  viral: "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900",
  finance: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900",
  health: "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900",
  travel: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:hover:bg-cyan-900",
};

interface Props {
  currentPostId: string;
  category: string;
  keywords?: string[] | null;
}

async function getRecentInCategory(category: string, currentPostId: string): Promise<Post[]> {
  try {
    return await db.query.posts.findMany({
      where: and(
        eq(posts.status, "published"),
        eq(posts.category, category as Post["category"]),
        ne(posts.id, currentPostId)
      ),
      orderBy: [desc(posts.publishedAt)],
      limit: 5,
    });
  } catch {
    return [];
  }
}

export async function ArticleSidebar({ currentPostId, category, keywords }: Props) {
  const recentPosts = await getRecentInCategory(category, currentPostId);

  return (
    <aside className="space-y-8">
      {/* ── 1. Recent in [Category] ────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-brand inline-block" />
          <h3 className="font-bold text-base">Recent in {categoryLabel(category)}</h3>
        </div>
        <div className="divide-y divide-border">
          {recentPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground p-5">No recent posts in this category.</p>
          ) : (
            recentPosts.map((post) => {
              const href = `/${post.category}/${post.slug}`;
              return (
                <article key={post.id} className="flex gap-3 items-start p-4 group hover:bg-muted/30 transition-colors">
                  <Link href={href} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="64px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand/10 flex items-center justify-center">
                        <span className="text-lg font-black text-brand/30">
                          {categoryLabel(post.category).slice(0, 1)}
                        </span>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={href}>
                      <h4 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                        {post.title}
                      </h4>
                    </Link>
                    {post.publishedAt && (
                      <time className="text-xs text-muted-foreground mt-1 block">
                        {formatDate(post.publishedAt)}
                      </time>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* ── 2. Sidebar ad ─────────────────────────────────────────────────── */}
      <AdSlot slot="sidebar" className="w-full min-h-[250px]" />

      {/* ── 3. Newsletter mini box ────────────────────────────────────────── */}
      <SidebarNewsletter />

      {/* ── 4. Tags cloud ──────────────────────────────────────────────────── */}
      {keywords && keywords.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-brand inline-block" />
            <h3 className="font-bold text-base">Tags</h3>
          </div>
          <div className="p-5 flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <Link
                key={kw}
                href={`/?tag=${encodeURIComponent(kw)}`}
                className="inline-block text-xs font-medium px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-brand hover:text-white transition-all duration-200"
              >
                #{kw}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── 5. Browse Categories ───────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-brand inline-block" />
          <h3 className="font-bold text-base">Browse Categories</h3>
        </div>
        <div className="p-5 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const pillCls = CAT_PILL[cat] ?? "bg-muted text-muted-foreground hover:bg-muted/80";
            return (
              <Link
                key={cat}
                href={`/${cat}`}
                className={`inline-block text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full transition-colors duration-200 ${pillCls}`}
              >
                {categoryLabel(cat)}
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
