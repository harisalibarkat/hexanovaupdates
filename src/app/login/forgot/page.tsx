"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { HexaLogo } from "@/components/Logo";
import type { Metadata } from "next";

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (res.ok) {
          setState("sent");
        } else {
          setState("error");
        }
      } catch {
        setState("error");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand/5 via-background to-muted/20 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <HexaLogo size={52} />
          </div>
          <h1 className="text-2xl font-extrabold">
            <span className="text-brand">Hexa</span>Nova<span className="text-muted-foreground font-normal">Updates</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Reset your admin password</p>
        </div>

        {state === "sent" ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="font-bold text-base">Check your email</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If an account exists for <strong>{email}</strong>, we sent a password reset link. Check your spam folder if you don&apos;t see it.
            </p>
            <Link href="/login" className="text-xs font-semibold text-brand hover:underline block">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-4">
            {state === "error" && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                Something went wrong. Please try again.
              </div>
            )}

            <div>
              <label className="text-sm font-medium block mb-1.5">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? "Sending…" : "Send Reset Link"}
            </button>

            <Link href="/login" className="block text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Back to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
