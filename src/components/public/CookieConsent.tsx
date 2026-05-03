"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
      // Trigger slide-up animation on next tick
      const t = setTimeout(() => setSlideIn(true), 50);
      return () => clearTimeout(t);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("cookie_consent", "accepted");
    setSlideIn(false);
    setTimeout(() => setVisible(false), 400);
  }

  function handleDecline() {
    localStorage.setItem("cookie_consent", "declined");
    setSlideIn(false);
    setTimeout(() => setVisible(false), 400);
  }

  if (!visible) return null;

  return (
    <div
      className={[
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-card border-t border-border shadow-lg",
        "transition-transform duration-500 ease-out",
        slideIn ? "translate-y-0" : "translate-y-full",
      ].join(" ")}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Cookie icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-brand"
            >
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              <path d="M8.5 8.5v.01" />
              <path d="M16 15.5v.01" />
              <path d="M12 12v.01" />
            </svg>
          </div>

          {/* Text */}
          <p className="flex-1 text-sm text-muted-foreground leading-relaxed">
            We use cookies to improve your experience. By continuing, you agree to our{" "}
            <Link
              href="/cookie-policy"
              className="text-brand underline underline-offset-2 hover:opacity-80 transition-opacity font-medium"
            >
              Cookie Policy
            </Link>
            .
          </p>

          {/* Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-5 py-2 text-sm font-bold rounded-lg bg-brand text-white hover:opacity-90 transition-opacity uppercase tracking-wide"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
