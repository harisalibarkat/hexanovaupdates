"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  function submit() {
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setValue("");
  }

  return (
    <>
      <button
        aria-label="Search"
        onClick={() => setOpen((o) => !o)}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors hidden sm:flex"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg px-4 py-3 flex gap-2 z-40">
          <input
            autoFocus
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") setOpen(false);
            }}
            placeholder="Search articles…"
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <button
            onClick={submit}
            className="text-sm px-4 py-2 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
          >
            Search
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-sm px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}
