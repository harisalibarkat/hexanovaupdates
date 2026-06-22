"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PublicError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[public error]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-xl">
        <div className="relative mb-6">
          <span className="font-serif font-black text-[100px] sm:text-[140px] leading-none text-foreground/5 select-none block">
            Oops
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="cat-label text-destructive tracking-widest">Server Error</span>
          </div>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
          Something went wrong.
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed max-w-md mx-auto">
          An unexpected error occurred while loading this page. Our team has been notified.
          You can try again or head back to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-black text-white cat-label px-8 py-3 hover:bg-black/80 transition-colors dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="btn-read-more px-8 py-3 justify-center"
          >
            Back to Homepage
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-muted-foreground/50 cat-label">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
