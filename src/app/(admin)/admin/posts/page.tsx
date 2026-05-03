import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { desc, eq, and, ilike } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { PostsTable } from "@/components/admin/PostsTable";
import { BackfillButton } from "@/components/admin/BackfillButton";

export const metadata = { title: "Posts Manager" };

interface Props {
  searchParams: Promise<{ category?: string; status?: string; page?: string; search?: string }>;
}

export default async function PostsPage({ searchParams }: Props) {
  const { category, status, page: pageStr, search } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  const conditions: SQL[] = [];
  if (category) conditions.push(eq(posts.category, category as "tech"));
  if (status) conditions.push(eq(posts.status, status as "draft"));
  if (search?.trim()) conditions.push(ilike(posts.title, `%${search.trim()}%`));

  const allPosts = await db.query.posts.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(posts.createdAt)],
    limit: limit + 1,
    offset,
  });

  const hasMore = allPosts.length > limit;
  const pagePosts = allPosts.slice(0, limit);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Posts Manager</h1>
        <BackfillButton />
      </div>

      {/* Search */}
      <form method="GET" className="mb-4 flex gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        {status && <input type="hidden" name="status" value={status} />}
        <input
          type="search"
          name="search"
          defaultValue={search ?? ""}
          placeholder="Search posts by title…"
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
        <button
          type="submit"
          className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          Search
        </button>
        {search && (
          <a
            href="/admin/posts"
            className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
          >
            Clear
          </a>
        )}
      </form>

      <PostsTable posts={pagePosts} page={page} hasMore={hasMore} />
    </div>
  );
}
