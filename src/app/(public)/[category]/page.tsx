import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { CATEGORIES, categoryLabel } from "@/lib/utils";
import { buildCategoryMetadata } from "@/lib/seo/metadata";
import { ArticleCard } from "@/components/public/ArticleCard";
import { TrendingBar } from "@/components/public/TrendingBar";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) notFound();
  const { page } = await searchParams;
  const pageNum = parseInt(page ?? "1", 10);
  return {
    ...buildCategoryMetadata(category),
    // Pagination pages beyond page 1 are not worth indexing — canonical already
    // points to /${category} (page 1) so link equity flows to the right place.
    ...(pageNum > 1 ? { robots: { index: false, follow: true } } : {}),
  };
}

export const dynamic = "force-dynamic";

/* Category theme maps — Stitch exact values */
const CAT_BANNER_BG: Record<string, string> = {
  tech:    "bg-blue-500",
  celebs:  "bg-pink-500",
  viral:   "bg-orange-500",
  finance: "bg-emerald-500",
  health:  "bg-green-500",
  travel:  "bg-cyan-500",
};
const CAT_TEXT: Record<string, string> = {
  tech:    "text-blue-500",
  celebs:  "text-pink-500",
  viral:   "text-orange-500",
  finance: "text-emerald-500",
  health:  "text-green-500",
  travel:  "text-cyan-500",
};
const CAT_DESC: Record<string, string> = {
  tech:    "The bleeding edge of silicon, software, and human ingenuity.",
  celebs:  "Stars, style, and the stories behind the spotlight.",
  viral:   "The internet's most shared, debated, and talked-about moments.",
  finance: "Markets, money, and the forces shaping global economies.",
  health:  "Science-backed insights for a longer, stronger life.",
  travel:  "Destinations, adventures, and the world through fresh eyes.",
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

  const bannerBg  = CAT_BANNER_BG[category] ?? "bg-brand";
  const textColor = CAT_TEXT[category]      ?? "text-brand";
  const catDesc   = CAT_DESC[category]      ?? `Latest trending stories in ${label.toLowerCase()}.`;

  return (
    <div>
      {/* Category hero banner — Stitch solid color with large italic name */}
      <div className={`${bannerBg} text-white overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-16 md:py-24 relative">
          <span className="cat-label text-white/70 uppercase mb-4 block tracking-widest">
            Vertical Hub
          </span>
          <h1 className="font-bold italic leading-none text-[56px] sm:text-[80px] md:text-[100px] mb-4 tracking-tight">
            {label}
          </h1>
          <p className="text-white/80 text-lg max-w-lg leading-relaxed">
            {catDesc}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {articles.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <div className={`text-6xl font-black mb-5 ${textColor} opacity-20`}>{label.slice(0, 1)}</div>
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
                className="btn-read-more"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Previous
              </a>
            )}
            <span className="text-sm text-muted-foreground px-4 py-2 bg-muted font-semibold cat-label">
              Page {page}
            </span>
            {hasMore && (
              <a
                href={`/${category}?page=${page + 1}`}
                className="btn-read-more bg-brand text-white border-brand hover:bg-brand/90 hover:text-white"
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
