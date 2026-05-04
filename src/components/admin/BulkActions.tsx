"use client";

import { useTransition } from "react";
import { bulkPublishDrafts, bulkDeleteFailed } from "@/actions/generate";
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
      <div className="mb-4">
        <h2 className="text-lg font-bold">Bulk Actions</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Manage multiple articles at once</p>
      </div>

      <div className="space-y-3">
        {/* Publish all drafts */}
        <button
          onClick={handlePublishAll}
          disabled={publishing || draftCount === 0}
          className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
        >
          <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-green-500 text-white">
            {publishing ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
            )}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground">
              {publishing ? "Publishing…" : "Publish All Drafts"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {draftCount} draft{draftCount !== 1 ? "s" : ""} queued
            </p>
          </div>
          <span className="ml-auto text-xs font-bold text-green-600 dark:text-green-400 shrink-0">
            {draftCount}
          </span>
        </button>

        {/* Delete failed */}
        <button
          onClick={handleDeleteFailed}
          disabled={deleting || failedCount === 0}
          className="w-full flex items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-left"
        >
          <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-red-500 text-white">
            {deleting ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            )}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground">
              {deleting ? "Deleting…" : "Delete Failed"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {failedCount} failed article{failedCount !== 1 ? "s" : ""}
            </p>
          </div>
          <span className="ml-auto text-xs font-bold text-red-600 dark:text-red-400 shrink-0">
            {failedCount}
          </span>
        </button>
      </div>
    </div>
  );
}
