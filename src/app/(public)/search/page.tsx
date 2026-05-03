import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import type { Post } from "@/lib/db/schema";
import { ilike, or, and, eq, desc } from "drizzle-orm";
import { ArticleCard } from "@/components/public/ArticleCard";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (!query) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Search Articles</h1>
        <p className="text-muted-foreground">Enter a search term in the header to find articles.</p>
      </main>
    );
  }

  let results: Post[] = [];
  try {
    results = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.status, "published"),
          or(
            ilike(posts.title, `%${query}%`),
            ilike(posts.excerpt, `%${query}%`)
          )
        )
      )
      .orderBy(desc(posts.publishedAt))
      .limit(20);
  } catch {
    results = [];
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          Search results for: <span className="text-brand">&ldquo;{query}&rdquo;</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {results.length === 0
            ? "No articles found"
            : `${results.length} article${results.length === 1 ? "" : "s"} found`}
        </p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No articles found for &ldquo;{query}&rdquo;</p>
          <p className="text-sm">Try a different search term or browse by category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((post) => (
            <ArticleCard key={post.id} article={post} />
          ))}
        </div>
      )}
    </main>
  );
}
