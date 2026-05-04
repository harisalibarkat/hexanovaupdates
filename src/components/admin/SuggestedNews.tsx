"use client";

import { useTransition } from "react";
import { generateArticleFromTrend, syncRSSNow } from "@/actions/generate";
import { useRouter } from "next/navigation";
import type { Trend } from "@/lib/db/schema";
import { formatDateTime, categoryLabel } from "@/lib/utils";

interface Props {
  trends: Trend[];
}

export function SuggestedNews({ trends }: Props) {
  const router = useRouter();
  const [syncing, startSync] = useTransition();

  async function handleSync() {
    startSync(async () => {
      const { count } = await syncRSSNow();
      alert(`Synced ${count} new trends.`);
      router.refresh();
    });
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold">Suggested News</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Unprocessed trends from RSS feeds</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={syncing ? "animate-spin" : ""}>
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
          {syncing ? "Syncing…" : "Sync RSS Now"}
        </button>
      </div>

      {trends.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-40">
            <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>
          </svg>
          <p className="text-sm">No unprocessed trends. Sync RSS to detect new stories.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {trends.map((trend) => (
            <TrendRow key={trend.id} trend={trend} onGenerated={() => router.refresh()} />
          ))}
        </div>
      )}
    </div>
  );
}

function TrendRow({ trend, onGenerated }: { trend: Trend; onGenerated: () => void }) {
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    startTransition(async () => {
      const { postId } = await generateArticleFromTrend(trend.id);
      if (postId) {
        onGenerated();
      } else {
        alert("Generation failed or trend already processed.");
      }
    });
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-2 leading-snug">{trend.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground capitalize">{categoryLabel(trend.category)}</span>
          {trend.publishedAt && (
            <span className="text-xs text-muted-foreground">· {formatDateTime(trend.publishedAt)}</span>
          )}
          {trend.url && (
            <a
              href={trend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-brand hover:underline ml-auto"
            >
              Source ↗
            </a>
          )}
        </div>
      </div>
      <button
        onClick={handleGenerate}
        disabled={pending}
        className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand/10 text-brand hover:bg-brand hover:text-white disabled:opacity-50 transition-all"
      >
        {pending ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
        )}
        {pending ? "Generating…" : "Generate"}
      </button>
    </div>
  );
}
