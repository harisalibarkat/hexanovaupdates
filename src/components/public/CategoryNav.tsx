import Link from "next/link";
import { CATEGORIES, categoryLabel } from "@/lib/utils";

const CAT_ACTIVE: Record<string, string> = {
  tech:    "bg-blue-600 text-white shadow-sm shadow-blue-500/40",
  celebs:  "bg-pink-600 text-white shadow-sm shadow-pink-500/40",
  viral:   "bg-orange-500 text-white shadow-sm shadow-orange-400/40",
  finance: "bg-emerald-600 text-white shadow-sm shadow-emerald-500/40",
  health:  "bg-green-600 text-white shadow-sm shadow-green-500/40",
  travel:  "bg-cyan-600 text-white shadow-sm shadow-cyan-500/40",
};

interface Props {
  active: string;
}

export function CategoryNav({ active }: Props) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <Link
        href="/"
        className={`whitespace-nowrap text-sm font-bold px-4 py-2 rounded-full transition-all duration-200 flex-shrink-0 ${
          active === ""
            ? "bg-foreground text-background shadow-sm"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        }`}
      >
        All
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={`/${cat}`}
          className={`whitespace-nowrap text-sm font-bold px-4 py-2 rounded-full transition-all duration-200 flex-shrink-0 ${
            cat === active
              ? (CAT_ACTIVE[cat] ?? "bg-brand text-white shadow-sm")
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          {categoryLabel(cat)}
        </Link>
      ))}
    </nav>
  );
}
