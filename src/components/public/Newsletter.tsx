"use client";

import { useState, useTransition } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const res = await fetch("/api/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: "" }),
        });
        const data = await res.json() as { ok: boolean; error?: string };
        if (data.ok) {
          setDone(true);
        } else {
          setError(data.error ?? "Something went wrong. Please try again.");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <aside className="bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 rounded-2xl p-6 sm:p-8 my-12">
      <div className="max-w-lg">
        <h3 className="text-xl font-bold mb-1">Stay in the loop</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Get the latest trending stories delivered to your inbox — no spam, just news.
        </p>
        {done ? (
          <p className="text-brand font-semibold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
            You&apos;re subscribed! 🎉 Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand text-sm disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2.5 bg-brand text-brand-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity text-sm whitespace-nowrap disabled:opacity-60 flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-brand-foreground/30 border-t-brand-foreground rounded-full animate-spin" />
                  Subscribing…
                </>
              ) : "Subscribe"}
            </button>
          </form>
        )}
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>
    </aside>
  );
}
