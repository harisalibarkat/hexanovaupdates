"use client";

import Link from "next/link";
import { CATEGORIES, categoryLabel } from "@/lib/utils";
import { DarkModeToggle } from "./DarkModeToggle";
import { LogoFull } from "@/components/Logo";
import { SearchBar } from "./SearchBar";
import { useState } from "react";
import { usePathname } from "next/navigation";

const CAT_ACCENT: Record<string, string> = {
  tech:    "bg-blue-500",
  celebs:  "bg-pink-500",
  viral:   "bg-orange-500",
  finance: "bg-emerald-500",
  health:  "bg-green-500",
  travel:  "bg-cyan-500",
};

const CAT_ACTIVE_TEXT: Record<string, string> = {
  tech:    "text-blue-600 dark:text-blue-400",
  celebs:  "text-pink-600 dark:text-pink-400",
  viral:   "text-orange-600 dark:text-orange-400",
  finance: "text-emerald-600 dark:text-emerald-400",
  health:  "text-green-600 dark:text-green-400",
  travel:  "text-cyan-600 dark:text-cyan-400",
};

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl">
      {/* Top gradient accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-brand via-purple-500/70 to-pink-500/50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
            <LogoFull />
          </Link>

          {/* Desktop category nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {CATEGORIES.map((cat) => {
              const isActive = pathname?.startsWith(`/${cat}`) ?? false;
              const accent = CAT_ACCENT[cat] ?? "bg-brand";
              const activeText = CAT_ACTIVE_TEXT[cat] ?? "text-brand";
              return (
                <Link
                  key={cat}
                  href={`/${cat}`}
                  className={`relative text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-150 ${
                    isActive
                      ? `${activeText}`
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {isActive && (
                    <span
                      className={`absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full ${accent}`}
                    />
                  )}
                  {categoryLabel(cat)}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <SearchBar />
            <DarkModeToggle />
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Admin
            </Link>

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {menuOpen ? (
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
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
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
                >
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="lg:hidden border-t border-border pb-4 animate-slide-down">
            <div className="grid grid-cols-2 gap-1.5 pt-3">
              {CATEGORIES.map((cat) => {
                const isActive = pathname?.startsWith(`/${cat}`) ?? false;
                const accent = CAT_ACCENT[cat] ?? "bg-brand";
                return (
                  <Link
                    key={cat}
                    href={`/${cat}`}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                      isActive
                        ? "bg-muted text-foreground"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${accent}`} />
                    {categoryLabel(cat)}
                  </Link>
                );
              })}
            </div>
            <div className="mt-2 pt-3 border-t border-border/60">
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
              >
                Admin Dashboard →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom border */}
      <div className="h-px bg-border/60" />
    </header>
  );
}
