"use client";

import { useTransition } from "react";
import { bulkPublishDrafts, bulkDeleteFailed, publishPostNow } from "@/actions/generate";
import { useRouter } from "next/navigation";

interface Props {
  draftCount: number;
  failedCount: number;
}

export function BulkActions({ draftCount, failedCount }: Props) {
  const router = useRouter();
  const [publishing, startPublish] = useTransition();
  const [deleting, startDelete] = useTransition();

  function handlePublishAll() {
    if (!confirm(`Publish all ${draftCount} draft articles?`)) return;
    startPublish(async () => {
      const { count } = await bulkPublishDrafts();
      alert(`Published ${count} articles.`);
      router.refresh();
    });
  }

  function handleDeleteFailed() {
    if (!confirm(`Permanently delete all ${failedCount} failed articles?`)) return;
    startDelete(async () => {
      const { count } = await bulkDeleteFailed();
      alert(`Deleted ${count} failed articles.`);
      router.refresh();
    });
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold">Bulk Actions</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Manage multiple articles at once</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handlePublishAll}
          disabled={publishing || draftCount === 0}
          className="flex items-center gap-3 p-4 rounded-xl border-2 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
        >
          <div className="p-2 rounded-lg bg-green-500 text-white flex-shrink-0">
            {publishing ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-green-800 dark:text-green-300">
              {publishing ? "Publishing…" : "Publish All Drafts"}
            </p>
            <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
              {draftCount} draft{draftCount !== 1 ? "s" : ""} ready
            </p>
          </div>
        </button>

        <button
          onClick={handleDeleteFailed}
          disabled={deleting || failedCount === 0}
          className="flex items-center gap-3 p-4 rounded-xl border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
        >
          <div className="p-2 rounded-lg bg-red-500 text-white flex-shrink-0">
            {deleting ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-red-800 dark:text-red-300">
              {deleting ? "Deleting…" : "Delete Failed"}
            </p>
            <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
              {failedCount} failed article{failedCount !== 1 ? "s" : ""}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
