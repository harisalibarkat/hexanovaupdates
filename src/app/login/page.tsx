import { LoginForm } from "@/components/admin/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Login | HexaNovaUpdates" };

const CATEGORIES = [
  { label: "Technology", color: "#3B82F6" },
  { label: "Celebrities", color: "#EC4899" },
  { label: "Viral",       color: "#F97316" },
  { label: "Finance",     color: "#10B981" },
  { label: "Health",      color: "#22C55E" },
  { label: "Travel",      color: "#06B6D4" },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* ── Left: black editorial panel ──────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-black text-white p-12 xl:p-16">
        {/* Brand */}
        <div>
          <p className="cat-label text-white/40 tracking-[0.2em] mb-6">HEXANOVAUPDATES</p>
          <h1 className="font-serif text-4xl xl:text-5xl font-bold leading-tight mb-4">
            Editorial<br />Intelligence.
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-xs">
            AI-powered news across six verticals — automatically detected, generated, and optimised.
          </p>
        </div>

        {/* Category chips */}
        <div className="space-y-2">
          <p className="cat-label text-white/30 mb-4">Active Verticals</p>
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-white/60 text-sm cat-label">{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p className="text-white/20 text-xs cat-label">
          © {new Date().getFullYear()} HexaNovaUpdates
        </p>
      </div>

      {/* ── Right: login form panel ──────────────────────────────── */}
      <div className="flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">

          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <h2 className="font-serif text-2xl font-bold mb-1">
              Hexa<span className="text-muted-foreground font-normal">Nova</span>Updates
            </h2>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-1">Sign In</h2>
            <p className="text-muted-foreground text-sm">
              Access the admin panel to manage content.
            </p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-xs text-muted-foreground/60 cat-label">
            Admin access only
          </p>
        </div>
      </div>
    </div>
  );
}
