"use client";

import { useState, useTransition } from "react";

export function NewsletterBanner() {
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
    <section className="relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/80 px-8 py-14 sm:px-14">
      {/* Gradient background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-pink-600/10 blur-3xl" />
      </div>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-brand via-purple-500 to-pink-500" />

      <div className="relative max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-brand/20 border border-brand/30 flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-brand"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>

        <p className="text-brand text-xs font-black uppercase tracking-[0.18em] mb-3">Newsletter</p>
        <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 tracking-tight leading-tight">
          Never Miss a Story
        </h2>
        <p className="text-zinc-400 text-base mb-8 leading-relaxed max-w-md mx-auto">
          Join thousands of readers getting the latest trending news delivered straight to their inbox — no spam, just the good stuff.
        </p>

        {done ? (
          <div className="inline-flex items-center gap-3 bg-brand/20 border border-brand/30 rounded-2xl px-8 py-4 text-white font-semibold text-base">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            You&apos;re subscribed! Check your inbox.
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                className="flex-1 px-5 py-3.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 text-sm transition-colors disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isPending}
                className="px-7 py-3.5 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 transition-colors text-sm whitespace-nowrap disabled:opacity-60 flex items-center gap-2 justify-center shadow-lg shadow-brand/30"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Subscribing…
                  </>
                ) : (
                  "Subscribe Free"
                )}
              </button>
            </form>
            {error && (
              <p className="mt-3 text-red-400 text-sm">{error}</p>
            )}
          </>
        )}

        <p className="text-zinc-600 text-xs mt-5">
          No spam ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
