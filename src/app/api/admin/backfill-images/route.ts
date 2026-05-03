import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { isNull, eq } from "drizzle-orm";
import { fetchArticleImage } from "@/lib/images/unsplash";
import { categoryLabel } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const missing = await db.query.posts.findMany({
    where: isNull(posts.featuredImage),
    columns: { id: true, title: true, category: true },
    limit: 50,
  });

  let updated = 0;
  for (const post of missing) {
    const query = `${post.title} ${categoryLabel(post.category)}`;
    const imageUrl = await fetchArticleImage(query);
    await db.update(posts).set({ featuredImage: imageUrl }).where(eq(posts.id, post.id));
    updated++;
  }

  return NextResponse.json({ ok: true, updated });
}
