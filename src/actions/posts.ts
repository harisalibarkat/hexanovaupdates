"use server";

import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateStatusSchema = z.object({
  postId: z.string().uuid(),
  status: z.enum(["draft", "scheduled", "published", "failed"]),
});

export async function updatePostStatus(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const parsed = updateStatusSchema.parse({
    postId: formData.get("postId"),
    status: formData.get("status"),
  });

  await db
    .update(posts)
    .set({
      status: parsed.status,
      publishedAt: parsed.status === "published" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, parsed.postId));

  revalidatePath("/admin/posts");
  revalidatePath("/");
}

export async function deletePost(postId: string) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  await db.delete(posts).where(eq(posts.id, postId));
  revalidatePath("/admin/posts");
}

export async function publishAllDrafts() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const drafts = await db.query.posts.findMany({
    where: eq(posts.status, "draft"),
  });

  for (const draft of drafts) {
    await db
      .update(posts)
      .set({ status: "published", publishedAt: new Date() })
      .where(eq(posts.id, draft.id));
  }

  revalidatePath("/admin/posts");
  return { published: drafts.length };
}
