"use server";

import { db } from "@/lib/db";
import { comments, settings, posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").replace(/&(?:#\d+|[a-z]+);/gi, " ").trim();
}

// ─── Public: Submit a comment ─────────────────────────────────────────────────

export async function submitComment(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const postId = formData.get("postId") as string | null;
    const authorName = stripHtml((formData.get("authorName") as string | null)?.trim() ?? "");
    const authorEmail = ((formData.get("authorEmail") as string | null)?.trim() ?? "").toLowerCase();
    const content = stripHtml((formData.get("content") as string | null)?.trim() ?? "");

    // Validate postId
    if (!postId) {
      return { success: false, message: "Missing post ID." };
    }

    // Validate authorName
    if (authorName.length < 2) {
      return { success: false, message: "Name must be at least 2 characters." };
    }

    // Validate authorEmail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authorEmail)) {
      return { success: false, message: "Please enter a valid email address." };
    }

    // Validate content
    if (content.length < 10) {
      return { success: false, message: "Comment must be at least 10 characters." };
    }
    if (content.length > 2000) {
      return { success: false, message: "Comment must not exceed 2000 characters." };
    }

    // Check global comments setting
    const commentsEnabledSetting = await db.query.settings.findFirst({
      where: eq(settings.key, "comments_enabled"),
    });
    const globalEnabled =
      commentsEnabledSetting === undefined || commentsEnabledSetting.value !== "false";

    if (!globalEnabled) {
      return { success: false, message: "Comments are currently disabled." };
    }

    // Check per-post comments setting
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
      columns: { commentsEnabled: true },
    });
    if (post && post.commentsEnabled === false) {
      return { success: false, message: "Comments are disabled for this post." };
    }

    // Get IP address
    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      null;

    await db.insert(comments).values({
      postId,
      authorName,
      authorEmail,
      content,
      status: "pending",
      ipAddress,
    });

    return {
      success: true,
      message: "Your comment has been submitted and is awaiting moderation.",
    };
  } catch (error) {
    console.error("submitComment error:", error);
    return { success: false, message: "An error occurred. Please try again." };
  }
}

// ─── Admin: Approve ───────────────────────────────────────────────────────────

export async function approveComment(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    await db.update(comments).set({ status: "approved" }).where(eq(comments.id, id));
    revalidatePath("/admin/comments");
  } catch (error) {
    console.error("approveComment error:", error);
    throw error;
  }
}

// ─── Admin: Trash ─────────────────────────────────────────────────────────────

export async function trashComment(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    await db.update(comments).set({ status: "trash" }).where(eq(comments.id, id));
    revalidatePath("/admin/comments");
  } catch (error) {
    console.error("trashComment error:", error);
    throw error;
  }
}

// ─── Admin: Spam ──────────────────────────────────────────────────────────────

export async function spamComment(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    await db.update(comments).set({ status: "spam" }).where(eq(comments.id, id));
    revalidatePath("/admin/comments");
  } catch (error) {
    console.error("spamComment error:", error);
    throw error;
  }
}

// ─── Admin: Delete ────────────────────────────────────────────────────────────

export async function deleteComment(id: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  try {
    await db.delete(comments).where(eq(comments.id, id));
    revalidatePath("/admin/comments");
  } catch (error) {
    console.error("deleteComment error:", error);
    throw error;
  }
}
