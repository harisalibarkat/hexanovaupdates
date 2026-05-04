"use client";

import { useState, useTransition } from "react";

export function SidebarNewsletter() {
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
    <div className="bg-gradient-to-br from-brand/10 to-brand/5 border border-brand/20 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1 h-5 rounded-full bg-brand inline-block" />
        <h3 className="font-bold text-base">Newsletter</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        Get the latest stories delivered to your inbox.
      </p>
      {done ? (
        <div className="flex items-center gap-2 text-brand font-semibold text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          You&apos;re subscribed! 🎉 Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand text-sm disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 bg-brand text-brand-foreground font-bold rounded-lg hover:opacity-90 transition-opacity text-sm uppercase tracking-wide disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-brand-foreground/30 border-t-brand-foreground rounded-full animate-spin" />
                Subscribing…
              </>
            ) : "Subscribe"}
          </button>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </form>
      )}
    </div>
  );
}
