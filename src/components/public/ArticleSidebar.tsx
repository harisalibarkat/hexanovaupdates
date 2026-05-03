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
  tech:    "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400",
  celebs:  "bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 dark:text-pink-400",
  viral:   "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 dark:text-orange-400",
  finance: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400",
  health:  "bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400",
  travel:  "bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/20 dark:text-cyan-400",
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

function SidebarWidget({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border/70 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-border/60 flex items-center gap-2.5 bg-muted/30">
        <span className="w-1 h-5 rounded-full bg-brand inline-block flex-shrink-0" />
        <h3 className="font-bold text-sm tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export async function ArticleSidebar({ currentPostId, category, keywords }: Props) {
  const recentPosts = await getRecentInCategory(category, currentPostId);

  return (
    <aside className="space-y-6">
      {/* Recent in category */}
      <SidebarWidget title={`More in ${categoryLabel(category)}`}>
        <div className="divide-y divide-border/50">
          {recentPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground p-5">No recent posts in this category.</p>
          ) : (
            recentPosts.map((post) => {
              const href = `/${post.category}/${post.slug}`;
              return (
                <article
                  key={post.id}
                  className="flex gap-3 items-start p-4 group hover:bg-muted/30 transition-colors"
                >
                  <Link
                    href={href}
                    className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted"
                  >
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
      </SidebarWidget>

      {/* Ad slot */}
      <AdSlot slot="sidebar" className="w-full min-h-[250px]" />

      {/* Newsletter */}
      <SidebarNewsletter />

      {/* Tags */}
      {keywords && keywords.length > 0 && (
        <SidebarWidget title="Tags">
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
        </SidebarWidget>
      )}

      {/* Categories */}
      <SidebarWidget title="Browse Categories">
        <div className="p-5 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const pillCls = CAT_PILL[cat] ?? "bg-muted text-muted-foreground hover:bg-muted/80";
            return (
              <Link
                key={cat}
                href={`/${cat}`}
                className={`inline-block text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full transition-all duration-200 ${pillCls}`}
              >
                {categoryLabel(cat)}
              </Link>
            );
          })}
        </div>
      </SidebarWidget>
    </aside>
  );
}
