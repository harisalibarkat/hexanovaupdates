"use client";

import { useState, useTransition } from "react";
import { updatePostStatus, deletePost } from "@/actions/posts";
import { formatDate, categoryLabel } from "@/lib/utils";
import type { Post } from "@/lib/db/schema";

interface Props {
  posts: Post[];
  page: number;
  hasMore: boolean;
}

const statusColors: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  scheduled: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

export function PostsTable({ posts, page, hasMore }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(postId: string, status: string) {
    const fd = new FormData();
    fd.set("postId", postId);
    fd.set("status", status);
    startTransition(() => updatePostStatus(fd));
  }

  function handleDelete(postId: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    startTransition(() => deletePost(postId));
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          onChange={(e) => {
            const url = new URL(window.location.href);
            if (e.target.value) url.searchParams.set("category", e.target.value);
            else url.searchParams.delete("category");
            window.location.href = url.toString();
          }}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card"
        >
          <option value="">All Categories</option>
          {["tech", "celebs", "viral", "finance", "health", "travel"].map((c) => (
            <option key={c} value={c}>{categoryLabel(c)}</option>
          ))}
        </select>

        <select
          onChange={(e) => {
            const url = new URL(window.location.href);
            if (e.target.value) url.searchParams.set("status", e.target.value);
            else url.searchParams.delete("status");
            window.location.href = url.toString();
          }}
          className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <a
                    href={`/${post.category}/${post.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium hover:text-brand line-clamp-1 max-w-xs block"
                  >
                    {post.title}
                  </a>
                  <span className="text-xs text-muted-foreground">{post.viewCount} views</span>
                </td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{post.category}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[post.status]}`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {formatDate(post.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {post.status === "draft" && (
                      <button
                        onClick={() => handleStatusChange(post.id, "published")}
                        disabled={isPending}
                        className="text-xs text-green-600 hover:underline disabled:opacity-50"
                      >
                        Publish
                      </button>
                    )}
                    {post.status === "published" && (
                      <button
                        onClick={() => handleStatusChange(post.id, "draft")}
                        disabled={isPending}
                        className="text-xs text-yellow-600 hover:underline disabled:opacity-50"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={isPending}
                      className="text-xs text-red-500 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`/admin/posts/${post.id}`}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Edit
                  </a>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No posts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(page > 1 || hasMore) && (
        <div className="mt-4 flex gap-3">
          {page > 1 && (
            <a href={`?page=${page - 1}`} className="text-sm text-brand hover:underline">
              ← Previous
            </a>
          )}
          {hasMore && (
            <a href={`?page=${page + 1}`} className="text-sm text-brand hover:underline ml-auto">
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
