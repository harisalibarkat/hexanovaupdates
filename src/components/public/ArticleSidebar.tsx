import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { CATEGORIES, categoryLabel, formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/db/schema";
import { SidebarNewsletter } from "@/components/public/SidebarNewsletter";
import { AdSlot } from "@/components/ads/AdSlot";

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

function SidebarWidget({ title, accentColor = "bg-brand", children }: { title: string; accentColor?: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-border relative">
        <h3 className="font-serif font-bold text-base text-foreground">{title}</h3>
        <span className={`absolute bottom-0 left-5 w-10 h-[2px] ${accentColor}`} />
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
                    className="relative flex-shrink-0 w-16 h-16 overflow-hidden bg-muted"
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
                        <span className="text-lg font-bold text-brand/30">
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
                className="inline-block text-xs font-medium px-3 py-1.5 border border-border text-muted-foreground hover:border-brand hover:text-brand transition-all duration-200"
              >
                #{kw}
              </Link>
            ))}
          </div>
        </SidebarWidget>
      )}

      {/* Categories */}
      <SidebarWidget title="Browse Categories">
        <div className="p-5 space-y-1">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/${cat}`}
              className="flex items-center justify-between py-2 border-b border-border/40 last:border-0 text-sm text-muted-foreground hover:text-brand transition-colors group"
            >
              <span className="cat-label text-[10px] group-hover:text-brand">{categoryLabel(cat)}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-30 group-hover:opacity-100 transition-opacity">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </Link>
          ))}
        </div>
      </SidebarWidget>
    </aside>
  );
}
