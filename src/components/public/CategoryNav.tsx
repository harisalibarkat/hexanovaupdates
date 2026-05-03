import Link from "next/link";
import { CATEGORIES, categoryLabel } from "@/lib/utils";

const CAT_ACTIVE: Record<string, string> = {
  tech:    "border-blue-500 text-blue-600 dark:text-blue-400",
  celebs:  "border-pink-500 text-pink-600 dark:text-pink-400",
  viral:   "border-orange-500 text-orange-600 dark:text-orange-400",
  finance: "border-emerald-500 text-emerald-600 dark:text-emerald-400",
  health:  "border-green-500 text-green-600 dark:text-green-400",
  travel:  "border-cyan-500 text-cyan-600 dark:text-cyan-400",
};

interface Props {
  active: string;
}

export function CategoryNav({ active }: Props) {
  return (
    <nav className="flex gap-0 overflow-x-auto scrollbar-hide border-b border-border/40">
      <Link
        href="/"
        className={`whitespace-nowrap cat-label px-4 py-2.5 border-b-2 transition-colors flex-shrink-0 ${
          active === ""
            ? "border-foreground text-foreground"
            : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
        }`}
      >
        All
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={`/${cat}`}
          className={`whitespace-nowrap cat-label px-4 py-2.5 border-b-2 transition-colors flex-shrink-0 ${
            cat === active
              ? (CAT_ACTIVE[cat] ?? "border-brand text-foreground")
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          }`}
        >
          {categoryLabel(cat)}
        </Link>
      ))}
    </nav>
  );
}
