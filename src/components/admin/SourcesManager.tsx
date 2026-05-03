"use client";

import { useTransition } from "react";
import { createSource, toggleSource, deleteSource } from "@/actions/sources";
import { categoryLabel } from "@/lib/utils";
import type { RssSource } from "@/lib/db/schema";

interface Props {
  sources: RssSource[];
}

const COUNTRIES = [
  { code: "", label: "Global" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "FI", label: "Finland" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "IN", label: "India" },
  { code: "AU", label: "Australia" },
  { code: "CA", label: "Canada" },
  { code: "SE", label: "Sweden" },
  { code: "NO", label: "Norway" },
  { code: "DK", label: "Denmark" },
  { code: "NL", label: "Netherlands" },
  { code: "SG", label: "Singapore" },
  { code: "AE", label: "UAE" },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fi", label: "Finnish" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "sv", label: "Swedish" },
  { code: "no", label: "Norwegian" },
  { code: "da", label: "Danish" },
  { code: "nl", label: "Dutch" },
  { code: "hi", label: "Hindi" },
  { code: "ar", label: "Arabic" },
];

const CATEGORIES = ["tech", "celebs", "viral", "finance", "health", "travel"];

const INPUT = "w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30";

export function SourcesManager({ sources }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      {/* Add source form */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-semibold mb-4">Add RSS Source</h2>
        <form
          action={(fd) => startTransition(() => createSource(fd))}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Source Name</label>
            <input name="name" required placeholder="YLE News Finland" className={INPUT} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">RSS URL</label>
            <input name="url" type="url" required placeholder="https://example.com/feed" className={INPUT} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Category</label>
            <select name="category" required className={INPUT}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Target Region</label>
            <select name="country" className={INPUT}>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Language</label>
            <select name="language" className={INPUT}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-brand text-white text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? "Adding…" : "Add Source"}
            </button>
          </div>
        </form>
      </div>

      {/* Sources table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">URL</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Region</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fetches</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sources.map((source) => (
                <tr key={source.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{source.name}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px]">
                    <a href={source.url} target="_blank" rel="noreferrer" className="hover:text-brand block truncate">
                      {source.url}
                    </a>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{categoryLabel(source.category)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="flex flex-col gap-0.5">
                      <span>{source.country ? `🌍 ${source.country}` : "Global"}</span>
                      {source.language && <span className="text-xs opacity-60">{source.language}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      source.isActive ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400" : "bg-muted text-muted-foreground"
                    }`}>
                      {source.isActive ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{source.fetchCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => startTransition(() => toggleSource(source.id, !source.isActive))}
                        disabled={isPending}
                        className="text-xs text-brand hover:underline disabled:opacity-50"
                      >
                        {source.isActive ? "Pause" : "Enable"}
                      </button>
                      <button
                        onClick={() => {
                          if (!confirm("Delete this source?")) return;
                          startTransition(() => deleteSource(source.id));
                        }}
                        disabled={isPending}
                        className="text-xs text-destructive hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sources.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    No RSS sources yet. Add one above to start detecting trends.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
