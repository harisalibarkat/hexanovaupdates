"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SeoScore } from "@/lib/ai/seo-optimizer";

interface PostRow {
  id: string;
  title: string;
  slug: string;
  category: string;
  seoOptimizedAt: Date | null;
  seoScore: SeoScore;
}

interface Props {
  posts: PostRow[];
  settings: Record<string, string>;
}

function ScoreBadge({ score, grade }: { score: number; grade: string }) {
  const color =
    grade === "A" ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
    : grade === "B" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
    : grade === "C" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300"
    : grade === "D" ? "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300"
    : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300";

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${color}`}>
      {grade} <span className="font-normal opacity-75">{score}</span>
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? "bg-green-500" : score >= 70 ? "bg-blue-500" : score >= 55 ? "bg-yellow-500" : score >= 40 ? "bg-orange-500" : "bg-red-500";
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

export function SeoPanel({ posts, settings }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimizing, setOptimizing] = useState<string | null>(null); // postId or "all"
  const [results, setResults] = useState<Record<string, { score: number; previousScore: number; error?: string }>>({});
  const [filter, setFilter] = useState<"all" | "poor" | "optimized">("all");
  const [expandedIssues, setExpandedIssues] = useState<string | null>(null);

  const batchSize    = parseInt(settings.seo_batch_size    ?? "5", 10);
  const cooldownDays = parseInt(settings.seo_cooldown_days ?? "7", 10);
  const enabled      = settings.seo_optimization_enabled !== "false";

  async function optimize(postId: string) {
    setOptimizing(postId);
    try {
      const res = await fetch("/api/admin/seo-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      const data = await res.json();
      if (data.results?.[0]) {
        setResults((prev) => ({ ...prev, [postId]: data.results[0] }));
      }
    } catch (err) {
      setResults((prev) => ({ ...prev, [postId]: { score: 0, previousScore: 0, error: String(err) } }));
    } finally {
      setOptimizing(null);
      startTransition(() => router.refresh());
    }
  }

  async function optimizeAll() {
    setOptimizing("all");
    try {
      const res = await fetch("/api/admin/seo-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const data = await res.json();
      if (data.results) {
        const newResults: typeof results = {};
        for (const r of data.results) {
          newResults[r.postId] = r;
        }
        setResults((prev) => ({ ...prev, ...newResults }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setOptimizing(null);
      startTransition(() => router.refresh());
    }
  }

  const filtered = posts.filter((p) => {
    if (filter === "poor") return p.seoScore.score < 70;
    if (filter === "optimized") return !!p.seoOptimizedAt;
    return true;
  });

  const poorCount = posts.filter((p) => p.seoScore.score < 70).length;

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className={`w-2 h-2 rounded-full ${enabled ? "bg-green-500" : "bg-zinc-400"}`} />
          <span className="font-medium">Auto-optimization {enabled ? "on" : "off"}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">Batch: {batchSize} articles · Cooldown: {cooldownDays}d</span>
        </div>
        <div className="flex-1" />
        <Link
          href="/admin/settings"
          className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
        >
          ⚙️ Configure
        </Link>
        <button
          onClick={optimizeAll}
          disabled={!!optimizing}
          className="text-xs px-3 py-1.5 rounded-lg bg-brand text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5"
        >
          {optimizing === "all" ? (
            <><span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Optimizing…</>
          ) : (
            <>✨ Optimize All (up to {batchSize})</>
          )}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(["all", "poor", "optimized"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filter === f
                ? "bg-brand text-white border-brand"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            {f === "all" ? `All (${posts.length})` : f === "poor" ? `Needs Work (${poorCount})` : `Optimized (${posts.filter((p) => p.seoOptimizedAt).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left min-w-[680px]">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Article</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Score</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-32">Last Optimized</th>
              <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-muted-foreground text-sm">
                  No articles match this filter.
                </td>
              </tr>
            )}
            {filtered.map((post) => {
              const result = results[post.id];
              const isOptimizing = optimizing === post.id;
              return (
                <tr key={post.id} className={`border-b border-border last:border-0 ${isOptimizing ? "opacity-60" : ""}`}>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium line-clamp-1">{post.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {post.category}
                      </span>
                      {result && !result.error && (
                        <span className="text-[10px] text-green-600 dark:text-green-400">
                          ↑ {result.previousScore} → {result.score}
                        </span>
                      )}
                      {result?.error && (
                        <span className="text-[10px] text-red-500" title={result.error}>Error</span>
                      )}
                    </div>
                    {/* Issues */}
                    {post.seoScore.issues.length > 0 && (
                      <button
                        onClick={() => setExpandedIssues(expandedIssues === post.id ? null : post.id)}
                        className="text-[10px] text-muted-foreground hover:text-foreground mt-1 underline underline-offset-2"
                      >
                        {expandedIssues === post.id ? "hide issues" : `${post.seoScore.issues.length} issue${post.seoScore.issues.length > 1 ? "s" : ""}`}
                      </button>
                    )}
                    {expandedIssues === post.id && (
                      <ul className="mt-1.5 space-y-0.5">
                        {post.seoScore.issues.map((issue, i) => (
                          <li key={i} className="text-[10px] text-orange-600 dark:text-orange-400 flex items-start gap-1">
                            <span>⚠</span> {issue}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1.5">
                      <ScoreBadge score={post.seoScore.score} grade={post.seoScore.grade} />
                      <ScoreBar score={post.seoScore.score} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {post.seoOptimizedAt
                      ? new Date(post.seoOptimizedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => optimize(post.id)}
                        disabled={!!optimizing}
                        className="text-xs px-2.5 py-1.5 rounded bg-brand/10 text-brand hover:bg-brand/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        {isOptimizing ? (
                          <><span className="inline-block w-3 h-3 border-2 border-brand/30 border-t-brand rounded-full animate-spin" /> Optimizing</>
                        ) : "✨ Optimize"}
                      </button>
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="text-xs px-2.5 py-1.5 rounded border border-border hover:bg-muted transition-colors text-muted-foreground"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
