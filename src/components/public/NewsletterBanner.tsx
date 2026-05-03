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
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand via-brand/90 to-brand/80 px-8 py-12 sm:px-14 text-white">
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-12 -left-8 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto text-center">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-5">
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
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">
          Never Miss a Story
        </h2>
        <p className="text-white/80 text-base mb-8 leading-relaxed">
          Join thousands of readers getting the latest trending news delivered straight to their inbox — no spam, just the good stuff.
        </p>

        {done ? (
          <div className="inline-flex items-center gap-3 bg-white/15 rounded-xl px-8 py-4 text-white font-semibold text-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
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
                className="flex-1 px-5 py-3.5 rounded-xl bg-white/15 border border-white/30 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm backdrop-blur disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isPending}
                className="px-7 py-3.5 bg-white text-brand font-bold rounded-xl hover:bg-white/90 transition-colors text-sm whitespace-nowrap uppercase tracking-wide disabled:opacity-60 flex items-center gap-2 justify-center"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
                    Subscribing…
                  </>
                ) : "Subscribe"}
              </button>
            </form>
            {error && <p className="mt-3 text-white/80 text-sm">{error}</p>}
          </>
        )}

        <p className="text-white/50 text-xs mt-5">
          No spam ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
