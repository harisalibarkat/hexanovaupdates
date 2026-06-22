import Link from "next/link";
import { CATEGORIES, categoryLabel } from "@/lib/utils";

const CAT_COLOR: Record<string, string> = {
  tech:    "hover:text-blue-500",
  celebs:  "hover:text-pink-500",
  viral:   "hover:text-orange-500",
  finance: "hover:text-emerald-500",
  health:  "hover:text-green-500",
  travel:  "hover:text-cyan-500",
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-2xl w-full">
        {/* Giant editorial 404 */}
        <div className="relative mb-2">
          <span className="font-serif font-black text-[140px] sm:text-[200px] leading-none text-foreground/5 select-none block">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div>
              <span className="cat-label text-muted-foreground block mb-2 tracking-widest">
                Page Not Found
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
                This story doesn&apos;t exist.
              </h1>
            </div>
          </div>
        </div>

        <p className="text-muted-foreground text-base max-w-md mx-auto mb-10 leading-relaxed">
          The article or page you&apos;re looking for may have been removed, renamed, or never published.
          Try one of our editorial verticals instead.
        </p>

        {/* Category links */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/${cat}`}
              className={`cat-label border border-border px-5 py-2.5 text-foreground transition-colors ${CAT_COLOR[cat] ?? "hover:text-brand"} hover:border-current`}
            >
              {categoryLabel(cat)}
            </Link>
          ))}
        </div>

        <div className="border-t border-border pt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-black text-white cat-label px-8 py-3 hover:bg-black/80 transition-colors dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
