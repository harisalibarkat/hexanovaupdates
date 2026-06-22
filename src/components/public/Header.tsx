"use client";

import Link from "next/link";
import { CATEGORIES, categoryLabel } from "@/lib/utils";
import { DarkModeToggle } from "./DarkModeToggle";
import { LogoFull } from "@/components/Logo";
import { SearchBar } from "./SearchBar";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const CAT_HOVER: Record<string, string> = {
  tech:    "hover:text-blue-500",
  celebs:  "hover:text-pink-500",
  viral:   "hover:text-orange-500",
  finance: "hover:text-emerald-500",
  health:  "hover:text-green-500",
  travel:  "hover:text-cyan-500",
};

const CAT_ACTIVE: Record<string, string> = {
  tech:    "text-blue-500 border-b-2 border-blue-500",
  celebs:  "text-pink-500 border-b-2 border-pink-500",
  viral:   "text-orange-500 border-b-2 border-orange-500",
  finance: "text-emerald-500 border-b-2 border-emerald-500",
  health:  "text-green-500 border-b-2 border-green-500",
  travel:  "text-cyan-500 border-b-2 border-cyan-500",
};

interface Props {
  logoUrlLight?: string;
  logoUrlDark?: string;
}

export function Header({ logoUrlLight, logoUrlDark }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const hasEither = !!(logoUrlLight || logoUrlDark);
  const activeLogo = isDark && logoUrlDark ? logoUrlDark : (logoUrlLight || logoUrlDark);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Single main row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <div className="flex items-center justify-between h-16 gap-6">

          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              className="lg:hidden p-1.5 text-foreground hover:opacity-70 transition-opacity"
            >
              {menuOpen ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>
                </svg>
              )}
            </button>

            <Link href="/" className="hover:opacity-80 transition-opacity flex-shrink-0">
              {hasEither ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeLogo}
                  alt="Site logo"
                  className="h-9 w-auto object-contain"
                  suppressHydrationWarning
                />
              ) : (
                <LogoFull />
              )}
            </Link>
          </div>

          {/* Center: category nav (desktop only) */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {CATEGORIES.map((cat) => {
              const isActive = pathname?.startsWith(`/${cat}`) ?? false;
              return (
                <Link
                  key={cat}
                  href={`/${cat}`}
                  className={`cat-label px-4 py-5 transition-colors whitespace-nowrap ${
                    isActive
                      ? (CAT_ACTIVE[cat] ?? "text-foreground border-b-2 border-foreground")
                      : `text-muted-foreground ${CAT_HOVER[cat] ?? "hover:text-foreground"}`
                  }`}
                >
                  {categoryLabel(cat)}
                </Link>
              );
            })}
          </nav>

          {/* Right: search + dark mode */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <SearchBar />
            <DarkModeToggle />
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="lg:hidden bg-background border-b border-border animate-slide-down shadow-md">
          <nav className="py-2 max-w-7xl mx-auto px-4">
            {CATEGORIES.map((cat) => {
              const isActive = pathname?.startsWith(`/${cat}`) ?? false;
              return (
                <Link
                  key={cat}
                  href={`/${cat}`}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 cat-label transition-colors ${
                    isActive
                      ? `bg-muted ${CAT_ACTIVE[cat] ?? "text-foreground"}`
                      : `text-muted-foreground ${CAT_HOVER[cat] ?? "hover:text-foreground"} hover:bg-muted/60`
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full bg-cat-${cat} flex-shrink-0`} />
                  {categoryLabel(cat)}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
