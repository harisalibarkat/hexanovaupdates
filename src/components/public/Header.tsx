import Link from "next/link";
import { CATEGORIES, categoryLabel } from "@/lib/utils";
import { DarkModeToggle } from "./DarkModeToggle";
import { LogoFull } from "@/components/Logo";
import { SearchBar } from "./SearchBar";

const CAT_COLORS: Record<string, string> = {
  tech:    "hover:text-[oklch(0.55_0.22_260)]",
  celebs:  "hover:text-[oklch(0.60_0.22_340)]",
  viral:   "hover:text-[oklch(0.62_0.22_35)]",
  finance: "hover:text-[oklch(0.52_0.18_145)]",
  health:  "hover:text-[oklch(0.58_0.20_160)]",
  travel:  "hover:text-[oklch(0.58_0.18_210)]",
};

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <LogoFull />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/${cat}`}
                className={`text-sm font-medium px-3 py-2 rounded-lg text-muted-foreground transition-all duration-150 hover:bg-muted ${CAT_COLORS[cat] ?? ""}`}
              >
                {categoryLabel(cat)}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <SearchBar />

            <DarkModeToggle />

            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Admin
            </Link>
          </div>
        </div>

        {/* Mobile category scroll */}
        <div className="lg:hidden flex gap-1.5 pb-2.5 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/${cat}`}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap hover:bg-brand hover:text-white transition-all duration-150 flex-shrink-0"
            >
              {categoryLabel(cat)}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
