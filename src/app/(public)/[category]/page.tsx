import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { CATEGORIES, categoryLabel } from "@/lib/utils";
import { buildCategoryMetadata } from "@/lib/seo/metadata";
import { ArticleCard } from "@/components/public/ArticleCard";
import { CategoryNav } from "@/components/public/CategoryNav";
import { TrendingBar } from "@/components/public/TrendingBar";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) notFound();
  return buildCategoryMetadata(category);
}

export const dynamic = "force-dynamic";

/* Category theme maps */
const CAT_BG: Record<string, string> = {
  tech:    "from-blue-950/60 to-zinc-950",
  celebs:  "from-pink-950/60 to-zinc-950",
  viral:   "from-orange-950/60 to-zinc-950",
  finance: "from-emerald-950/60 to-zinc-950",
  health:  "from-green-950/60 to-zinc-950",
  travel:  "from-cyan-950/60 to-zinc-950",
};
const CAT_ACCENT: Record<string, string> = {
  tech:    "bg-blue-500",
  celebs:  "bg-pink-500",
  viral:   "bg-orange-400",
  finance: "bg-emerald-500",
  health:  "bg-green-500",
  travel:  "bg-cyan-500",
};
const CAT_TEXT: Record<string, string> = {
  tech:    "text-blue-400",
  celebs:  "text-pink-400",
  viral:   "text-orange-400",
  finance: "text-emerald-400",
  health:  "text-green-400",
  travel:  "text-cyan-400",
};
const CAT_EMOJI: Record<string, string> = {
  tech:    "💻",
  celebs:  "⭐",
  viral:   "🔥",
  finance: "📈",
  health:  "💪",
  travel:  "✈️",
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { page: pageStr } = await searchParams;

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) notFound();

  const page    = Math.max(1, parseInt(pageStr ?? "1", 10));
  const limit   = 12;
  const offset  = (page - 1) * limit;

  const articleList = await db.query.posts.findMany({
    where: and(
      eq(posts.category, category as "tech"),
      eq(posts.status, "published")
    ),
    orderBy: [desc(posts.publishedAt)],
    limit: limit + 1,
    offset,
  });

  const hasMore  = articleList.length > limit;
  const articles = articleList.slice(0, limit);
  const label    = categoryLabel(category);

  const [featuredArticle, ...restArticles] = articles;

  const bgGrad   = CAT_BG[category]    ?? "from-brand/20 to-zinc-950";
  const accent   = CAT_ACCENT[category] ?? "bg-brand";
  const textColor = CAT_TEXT[category]  ?? "text-brand";
  const emoji    = CAT_EMOJI[category]  ?? "📰";

  return (
    <div>
      {/* Category hero banner */}
      <div className={`bg-gradient-to-b ${bgGrad} border-b border-border/50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          {/* Category nav */}
          <CategoryNav active={category} />

          {/* Category title */}
          <div className="mt-8 flex items-end gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-1.5 h-8 rounded-full ${accent}`} />
                <span className={`text-xs font-black uppercase tracking-[0.18em] ${textColor}`}>
                  {emoji} Category
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-none">
                {label} News
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">
                Latest trending stories and updates in {label.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {articles.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <div className="text-6xl mb-5">{emoji}</div>
            <p className="text-xl font-bold mb-2">No {label} articles yet</p>
            <p className="text-sm">Check back soon — new content is generated every 30 minutes.</p>
          </div>
        ) : (
          <>
            {/* Trending bar */}
            <TrendingBar posts={articles.slice(0, 6)} />

            {/* Featured + grid */}
            {featuredArticle && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
                <div className="lg:col-span-2">
                  <ArticleCard article={featuredArticle} featured />
                </div>
                <div className="flex flex-col gap-5">
                  {restArticles.slice(0, 2).map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}

            {/* Remaining grid */}
            {restArticles.length > 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {restArticles.slice(2).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {(page > 1 || hasMore) && (
          <div className="mt-14 flex items-center justify-center gap-3">
            {page > 1 && (
              <a
                href={`/${category}?page=${page - 1}`}
                className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Previous
              </a>
            )}
            <span className="text-sm text-muted-foreground px-4 py-2 rounded-lg bg-muted font-semibold">
              Page {page}
            </span>
            {hasMore && (
              <a
                href={`/${category}?page=${page + 1}`}
                className="px-5 py-2.5 rounded-xl bg-brand text-white hover:opacity-90 transition-opacity text-sm font-semibold flex items-center gap-2 shadow-md shadow-brand/30"
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
