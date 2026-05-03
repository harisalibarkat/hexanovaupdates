"use client";

import { useTransition, useState, useRef } from "react";
import { submitComment } from "@/actions/comments";

interface CommentFormProps {
  postId: string;
}

export function CommentForm({ postId }: CommentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    formData.set("postId", postId);
    startTransition(async () => {
      const res = await submitComment(formData);
      setResult(res);
      if (res.success) {
        formRef.current?.reset();
      }
    });
  }

  return (
    <div>
      <h3 className="text-base font-semibold mb-4">Leave a Comment</h3>

      <form ref={formRef} action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1" htmlFor="cf-name">
              Name <span className="text-destructive">*</span>
            </label>
            <input
              id="cf-name"
              name="authorName"
              type="text"
              required
              minLength={2}
              placeholder="Your name"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1" htmlFor="cf-email">
              Email <span className="text-destructive">*</span>
            </label>
            <input
              id="cf-email"
              name="authorEmail"
              type="email"
              required
              placeholder="your@email.com"
              className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1" htmlFor="cf-content">
            Comment <span className="text-destructive">*</span>
          </label>
          <textarea
            id="cf-content"
            name="content"
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            placeholder="Share your thoughts…"
            className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
          />
        </div>

        {result && (
          <div
            className={`text-sm rounded-lg px-4 py-3 ${
              result.success
                ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800"
                : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
            }`}
          >
            {result.message}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-brand text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Submitting…" : "Post Comment"}
        </button>
      </form>
    </div>
  );
}
