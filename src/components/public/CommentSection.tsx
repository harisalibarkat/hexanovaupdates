// Server component — no "use client" directive

import { db } from "@/lib/db";
import { comments, settings } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { CommentForm } from "./CommentForm";

// ─── Deterministic avatar color ───────────────────────────────────────────────

function getAvatarColor(name: string): string {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// ─── CommentSection (server component) ───────────────────────────────────────

interface CommentSectionProps {
  postId: string;
}

export async function CommentSection({ postId }: CommentSectionProps) {
  // Check if comments are enabled
  let commentsEnabled = true;
  try {
    const commentsEnabledSetting = await db.query.settings.findFirst({
      where: eq(settings.key, "comments_enabled"),
    });
    if (commentsEnabledSetting?.value === "false") {
      commentsEnabled = false;
    }
  } catch {
    // default: enabled
  }

  if (!commentsEnabled) {
    return null;
  }

  // Fetch approved comments
  let approvedComments: Array<{
    id: string;
    authorName: string;
    content: string;
    createdAt: Date;
  }> = [];

  try {
    approvedComments = await db
      .select({
        id: comments.id,
        authorName: comments.authorName,
        content: comments.content,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .where(and(eq(comments.postId, postId), eq(comments.status, "approved")))
      .orderBy(asc(comments.createdAt));
  } catch {
    // silently fail — show empty list
  }

  const count = approvedComments.length;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-xl font-bold mb-6">
        {count === 0 ? "Comments" : count === 1 ? "1 Comment" : `${count} Comments`}
      </h2>

      {count > 0 && (
        <div className="space-y-6 mb-10">
          {approvedComments.map((comment) => {
            const initial = comment.authorName.charAt(0).toUpperCase();
            const colorClass = getAvatarColor(comment.authorName);

            return (
              <div key={comment.id} className="flex gap-4">
                {/* Avatar */}
                <div
                  className={`flex-none w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {initial}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.authorName}</span>
                    <time className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comment form */}
      <CommentForm postId={postId} />
    </section>
  );
}
