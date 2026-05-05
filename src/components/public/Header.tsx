"use client";

import Link from "next/link";
import { CATEGORIES, categoryLabel } from "@/lib/utils";
import { DarkModeToggle } from "./DarkModeToggle";
import { LogoFull } from "@/components/Logo";
import { SearchBar } from "./SearchBar";
import { useState } from "react";
import { usePathname } from "next/navigation";

interface Props {
  logoUrlLight?: string;
  logoUrlDark?: string;
}

export function Header({ logoUrlLight, logoUrlDark }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const hasLight = !!logoUrlLight;
  const hasDark  = !!logoUrlDark;
  const hasEither = hasLight || hasDark;

  return (
    <header className="sticky top-0 z-50">
      {/* Logo + actions row */}
      <div className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
              {hasEither ? (
                /*
                 * CSS-based logo switching: both images are always in the DOM.
                 * dark:hidden / dark:block respond to the .dark class on <html>
                 * which the DarkModeToggle adds/removes — no JS state needed.
                 */
                <>
                  {/* Light-mode logo — visible by default, hidden when .dark */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrlLight || logoUrlDark}
                    alt="Site logo"
                    className={`h-10 w-auto object-contain${hasDark ? " dark:hidden" : ""}`}
                  />
                  {/* Dark-mode logo — hidden by default, visible when .dark */}
                  {hasDark && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoUrlDark}
                      alt="Site logo"
                      className="h-10 w-auto object-contain hidden dark:block"
                    />
                  )}
                </>
              ) : (
                <LogoFull />
              )}
            </Link>

            <div className="flex items-center gap-2">
              <SearchBar />
              <DarkModeToggle />

              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Toggle menu"
                className="lg:hidden p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                {menuOpen ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop category nav */}
      <div className="hidden lg:block bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center">
            {CATEGORIES.map((cat) => {
              const isActive = pathname?.startsWith(`/${cat}`) ?? false;
              return (
                <Link
                  key={cat}
                  href={`/${cat}`}
                  className={`cat-label px-5 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-brand text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {categoryLabel(cat)}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="lg:hidden bg-background border-b border-border animate-slide-down">
          <nav className="py-2">
            {CATEGORIES.map((cat) => {
              const isActive = pathname?.startsWith(`/${cat}`) ?? false;
              return (
                <Link
                  key={cat}
                  href={`/${cat}`}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-6 py-3 cat-label transition-colors ${
                    isActive
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
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
