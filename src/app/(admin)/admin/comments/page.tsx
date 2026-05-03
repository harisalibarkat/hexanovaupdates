import { db } from "@/lib/db";
import { comments, posts } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { CommentsTable } from "@/components/admin/CommentsTable";
import Link from "next/link";
import type { Comment } from "@/lib/db/schema";

export const metadata = { title: "Comments" };

const FILTER_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Spam", value: "spam" },
  { label: "Trash", value: "trash" },
] as const;

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function CommentsPage({ searchParams }: Props) {
  const { status } = await searchParams;

  // Fetch comments with post title
  let allComments: Array<Comment & { postTitle: string; postId: string }> = [];

  try {
    const rows = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        authorName: comments.authorName,
        authorEmail: comments.authorEmail,
        content: comments.content,
        status: comments.status,
        ipAddress: comments.ipAddress,
        createdAt: comments.createdAt,
        postTitle: posts.title,
      })
      .from(comments)
      .innerJoin(posts, eq(comments.postId, posts.id))
      .where(
        status && status !== ""
          ? eq(comments.status, status as Comment["status"])
          : undefined
      )
      .orderBy(desc(comments.createdAt));

    allComments = rows.map((r) => ({
      ...r,
      postId: r.postId,
      postTitle: r.postTitle,
    }));
  } catch (error) {
    console.error("Failed to fetch comments:", error);
  }

  // Count by status for badge display
  const counts = allComments.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});

  const activeStatus = status ?? "";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Comments</h1>
        <span className="text-sm text-muted-foreground">
          {allComments.length} {allComments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {FILTER_TABS.map((tab) => {
          const href =
            tab.value === ""
              ? "/admin/comments"
              : `/admin/comments?status=${tab.value}`;
          const isActive = activeStatus === tab.value;
          const tabCount =
            tab.value === ""
              ? Object.values(counts).reduce((a, b) => a + b, 0)
              : (counts[tab.value] ?? 0);

          return (
            <Link
              key={tab.value}
              href={href}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                isActive
                  ? "border-brand text-brand"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tabCount > 0 && (
                <span
                  className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-brand text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tabCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <CommentsTable comments={allComments} />
    </div>
  );
}
