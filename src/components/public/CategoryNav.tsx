import Link from "next/link";
import { CATEGORIES, categoryLabel } from "@/lib/utils";

const CAT_ACTIVE: Record<string, string> = {
  tech:    "bg-blue-600 text-white",
  celebs:  "bg-pink-600 text-white",
  viral:   "bg-orange-500 text-white",
  finance: "bg-emerald-600 text-white",
  health:  "bg-green-600 text-white",
  travel:  "bg-cyan-600 text-white",
  "":      "bg-primary text-primary-foreground",
};

interface Props {
  active: string;
}

export function CategoryNav({ active }: Props) {
  return (
    <nav className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <Link
        href="/"
        className={`whitespace-nowrap text-sm font-semibold px-4 py-1.5 rounded-full transition-all flex-shrink-0 ${
          active === ""
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/70"
        }`}
      >
        All
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat}
          href={`/${cat}`}
          className={`whitespace-nowrap text-sm font-semibold px-4 py-1.5 rounded-full transition-all flex-shrink-0 ${
            cat === active
              ? (CAT_ACTIVE[cat] ?? "bg-brand text-white")
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
        >
          {categoryLabel(cat)}
        </Link>
      ))}
    </nav>
  );
}
