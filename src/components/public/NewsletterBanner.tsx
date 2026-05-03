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
    <section className="relative overflow-hidden bg-zinc-950 border-y border-zinc-800/80 px-8 py-14 sm:px-14">
      {/* Subtle brand glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 right-0 w-96 h-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute -bottom-24 left-0 w-96 h-96 rounded-full bg-brand/8 blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto text-center">
        <p className="cat-label text-zinc-400 mb-4">Newsletter</p>

        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
          Never Miss a Story
        </h2>
        <span className="section-bar bg-zinc-600 mx-auto mb-6" />

        <p className="text-zinc-400 text-base mb-8 leading-relaxed max-w-md mx-auto">
          Join thousands of readers getting the latest trending news delivered straight to their inbox — no spam, just the good stuff.
        </p>

        {done ? (
          <div className="inline-flex items-center gap-3 border border-zinc-700 px-8 py-4 text-white font-semibold text-base">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-400"
            >
              <path d="M20 6 9 17l-5-5"/>
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
                className="flex-1 px-5 py-3.5 bg-zinc-900 border border-zinc-700 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 text-sm transition-colors disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isPending}
                className="px-7 py-3.5 bg-white text-zinc-900 font-bold text-[11px] uppercase tracking-[0.12em] hover:bg-zinc-100 transition-colors whitespace-nowrap disabled:opacity-60 flex items-center gap-2 justify-center"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
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
