"use client";

import { useTransition, useRef } from "react";
import { generateArticleFromTopic } from "@/actions/generate";
import { useRouter } from "next/navigation";
import { CATEGORIES, categoryLabel } from "@/lib/utils";

export function ManualGenerator() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const { postId, slug } = await generateArticleFromTopic(data);
        formRef.current?.reset();
        router.push(`/admin/posts`);
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Generation failed");
      }
    });
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold">Generate Article from Topic</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Type any topic and the AI will write an SEO-optimized article</p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-1.5">
            Topic / Headline
          </label>
          <textarea
            id="topic"
            name="topic"
            required
            minLength={3}
            maxLength={300}
            rows={3}
            placeholder="e.g. 'The rise of AI in healthcare 2025' or 'Taylor Swift new album release'"
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand text-sm resize-none"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1.5">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-brand text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{categoryLabel(cat)}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {pending ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              Generating article… (30-60s)
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              Generate Article with AI
            </>
          )}
        </button>
      </form>
    </div>
  );
}
