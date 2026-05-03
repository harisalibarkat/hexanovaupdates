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

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category } = await params;
  const { page: pageStr } = await searchParams;

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) notFound();

  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const limit = 12;
  const offset = (page - 1) * limit;

  const articleList = await db.query.posts.findMany({
    where: and(
      eq(posts.category, category as "tech"),
      eq(posts.status, "published")
    ),
    orderBy: [desc(posts.publishedAt)],
    limit: limit + 1,
    offset,
  });

  const hasMore = articleList.length > limit;
  const articles = articleList.slice(0, limit);
  const label = categoryLabel(category);

  const [featuredArticle, ...restArticles] = articles;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CategoryNav active={category} />

      <div className="mt-8 mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">{label} News</h1>
        <p className="text-muted-foreground mt-1">
          Latest trending stories and updates in {label.toLowerCase()}
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg font-medium">No articles yet</p>
          <p className="text-sm mt-1">Check back soon — new content is generated every 30 minutes.</p>
        </div>
      ) : (
        <>
          {/* Trending bar with top 6 articles */}
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

      {(page > 1 || hasMore) && (
        <div className="mt-12 flex items-center justify-center gap-3">
          {page > 1 && (
            <a
              href={`/${category}?page=${page - 1}`}
              className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium flex items-center gap-2"
            >
              ← Previous
            </a>
          )}
          <span className="text-sm text-muted-foreground px-3">Page {page}</span>
          {hasMore && (
            <a
              href={`/${category}?page=${page + 1}`}
              className="px-5 py-2.5 rounded-xl bg-brand text-white hover:opacity-90 transition-opacity text-sm font-medium flex items-center gap-2"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
