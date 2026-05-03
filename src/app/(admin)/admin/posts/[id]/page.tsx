import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  return {
    title: post ? `Edit: ${post.title}` : "Post Not Found",
  };
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;

  const post = await db.query.posts.findFirst({ where: eq(posts.id, id) });

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <a
          href="/admin/posts"
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          ← Back to Posts
        </a>
      </div>
      <PostEditor post={post} />
    </div>
  );
}
