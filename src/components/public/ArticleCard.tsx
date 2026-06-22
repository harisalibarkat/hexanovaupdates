import Link from "next/link";
import Image from "next/image";
import { formatDate, categoryLabel } from "@/lib/utils";
import type { Post } from "@/lib/db/schema";

const CAT_COLOR_TEXT: Record<string, string> = {
  tech:    "text-blue-500",
  celebs:  "text-pink-500",
  viral:   "text-orange-500",
  finance: "text-emerald-500",
  health:  "text-green-500",
  travel:  "text-cyan-500",
};

const CAT_COLOR_BG: Record<string, string> = {
  tech:    "bg-blue-500",
  celebs:  "bg-pink-500",
  viral:   "bg-orange-500",
  finance: "bg-emerald-500",
  health:  "bg-green-500",
  travel:  "bg-cyan-500",
};

const CAT_PLACEHOLDER: Record<string, string> = {
  tech:    "from-blue-500/20 to-blue-900/40",
  celebs:  "from-pink-500/20 to-pink-900/40",
  viral:   "from-orange-500/20 to-orange-900/40",
  finance: "from-emerald-500/20 to-emerald-900/40",
  health:  "from-green-500/20 to-green-900/40",
  travel:  "from-cyan-500/20 to-cyan-900/40",
};

interface Props {
  article: Post;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: Props) {
  const phGrad   = CAT_PLACEHOLDER[article.category] ?? "from-zinc-500/20 to-zinc-900/40";
  const catText  = CAT_COLOR_TEXT[article.category]  ?? "text-foreground";
  const catDot   = CAT_COLOR_BG[article.category]    ?? "bg-foreground";
  const href     = `/${article.category}/${article.slug}`;

  return (
    <article className={`group flex flex-col overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${featured ? "lg:col-span-2" : ""}`}>
      {/* Image */}
      <Link
        href={href}
        className={`block relative overflow-hidden bg-muted ${featured ? "aspect-[16/7]" : "aspect-[4/3]"}`}
      >
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            sizes={
              featured
                ? "(max-width: 768px) 100vw, 66vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${phGrad} flex items-center justify-center`}>
            <span className="text-6xl font-black opacity-10 text-white select-none">
              {categoryLabel(article.category).slice(0, 1)}
            </span>
          </div>
        )}

        {/* Reading time pill */}
        {article.readingTime && (
          <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-1 bg-black/60 text-white/90 backdrop-blur-sm">
            {article.readingTime} min read
          </span>
        )}
      </Link>

      {/* Content */}
      <div className={`p-5 flex flex-col flex-1 ${featured ? "lg:p-6" : ""}`}>
        {/* Category */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`w-2 h-2 flex-shrink-0 ${catDot}`} />
          <Link
            href={`/${article.category}`}
            className={`cat-label ${catText} hover:opacity-70 transition-opacity`}
          >
            {categoryLabel(article.category)}
          </Link>
        </div>

        {/* Title */}
        <h2
          className={`font-bold leading-tight mb-3 group-hover:underline underline-offset-2 transition-colors duration-200 ${
            featured ? "text-xl sm:text-2xl line-clamp-3" : "text-base sm:text-lg line-clamp-2"
          }`}
        >
          <Link href={href}>{article.title}</Link>
        </h2>

        {/* Excerpt (featured or if available) */}
        {article.excerpt && (
          <p className={`text-sm text-muted-foreground leading-relaxed mb-4 ${featured ? "line-clamp-2" : "line-clamp-2 hidden sm:block"}`}>
            {article.excerpt}
          </p>
        )}

        {/* Date */}
        {article.publishedAt && (
          <time className="text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
            {formatDate(article.publishedAt)}
          </time>
        )}
      </div>
    </article>
  );
}
