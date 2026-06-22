"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[global error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            HEXANOVAUPDATES
          </p>
          <h1 className="text-3xl font-bold mb-4">Critical Error</h1>
          <p className="text-gray-500 mb-8">
            The application encountered a fatal error. Please refresh the page.
          </p>
          <button
            onClick={reset}
            className="bg-black text-white text-xs font-bold uppercase tracking-widest px-8 py-3 hover:bg-gray-900 transition-colors"
          >
            Reload
          </button>
          {error.digest && (
            <p className="mt-6 text-xs text-gray-300">ID: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
