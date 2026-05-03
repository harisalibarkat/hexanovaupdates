"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  approveComment,
  trashComment,
  spamComment,
  deleteComment,
} from "@/actions/comments";
import type { Comment } from "@/lib/db/schema";

interface CommentWithPost extends Comment {
  postTitle: string;
  postId: string;
}

interface CommentsTableProps {
  comments: CommentWithPost[];
}

const STATUS_BADGE: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  spam: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  trash: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

function CommentRow({ comment }: { comment: CommentWithPost }) {
  const [isPending, startTransition] = useTransition();

  const truncate = (str: string, len: number) =>
    str.length > len ? str.slice(0, len) + "…" : str;

  const truncateTitle = (str: string) => truncate(str, 40);

  return (
    <tr className={`border-b border-border transition-opacity ${isPending ? "opacity-50" : ""}`}>
      {/* Author */}
      <td className="px-4 py-3">
        <p className="text-sm font-medium">{comment.authorName}</p>
        <p className="text-xs text-muted-foreground">{comment.authorEmail}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(comment.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </td>

      {/* Post */}
      <td className="px-4 py-3">
        <Link
          href={`/admin/posts/${comment.postId}`}
          className="text-sm text-brand hover:underline"
          title={comment.postTitle}
        >
          {truncateTitle(comment.postTitle)}
        </Link>
      </td>

      {/* Excerpt */}
      <td className="px-4 py-3 max-w-xs">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {truncate(comment.content, 120)}
        </p>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
            STATUS_BADGE[comment.status] ?? STATUS_BADGE.pending
          }`}
        >
          {comment.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 flex-wrap">
          {comment.status !== "approved" && (
            <button
              onClick={() => startTransition(() => approveComment(comment.id))}
              disabled={isPending}
              className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
            >
              Approve
            </button>
          )}
          {comment.status !== "spam" && (
            <button
              onClick={() => startTransition(() => spamComment(comment.id))}
              disabled={isPending}
              className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 transition-colors disabled:opacity-50"
            >
              Spam
            </button>
          )}
          {comment.status !== "trash" && (
            <button
              onClick={() => startTransition(() => trashComment(comment.id))}
              disabled={isPending}
              className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Trash
            </button>
          )}
          <button
            onClick={() => {
              if (confirm("Permanently delete this comment?")) {
                startTransition(() => deleteComment(comment.id));
              }
            }}
            disabled={isPending}
            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export function CommentsTable({ comments }: CommentsTableProps) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-4xl mb-3">💬</p>
        <p className="text-sm">No comments found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left min-w-[720px]">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Author
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Post
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Comment
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Status
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <CommentRow key={comment.id} comment={comment} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
