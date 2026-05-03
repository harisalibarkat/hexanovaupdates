"use client";

import { useState } from "react";

export function BackfillButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [count, setCount] = useState(0);

  async function run() {
    setState("loading");
    try {
      const res = await fetch("/api/admin/backfill-images", { method: "POST" });
      const data = await res.json() as { ok?: boolean; updated?: number };
      setCount(data.updated ?? 0);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={state === "loading"}
      className="text-sm px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {state === "loading" && (
        <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {state === "idle" && "Fix Missing Images"}
      {state === "loading" && "Fetching images…"}
      {state === "done" && `✓ Updated ${count} posts`}
      {state === "error" && "Error — try again"}
    </button>
  );
}
