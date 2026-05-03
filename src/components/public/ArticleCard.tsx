import Link from "next/link";
import Image from "next/image";
import { formatDate, categoryLabel } from "@/lib/utils";
import type { Post } from "@/lib/db/schema";

const CAT_GRADIENT: Record<string, string> = {
  tech:    "from-blue-500/20 to-purple-500/20",
  celebs:  "from-pink-500/20 to-rose-500/20",
  viral:   "from-orange-500/20 to-amber-500/20",
  finance: "from-emerald-500/20 to-teal-500/20",
  health:  "from-green-500/20 to-lime-500/20",
  travel:  "from-cyan-500/20 to-sky-500/20",
};

const CAT_BADGE: Record<string, string> = {
  tech:    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  celebs:  "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
  viral:   "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  finance: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  health:  "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  travel:  "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
};

interface Props {
  article: Post;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: Props) {
  const gradient = CAT_GRADIENT[article.category] ?? "from-brand/10 to-brand/20";
  const badge = CAT_BADGE[article.category] ?? "bg-brand/10 text-brand";
  const href = `/${article.category}/${article.slug}`;

  return (
    <article className={`group bg-card rounded-2xl border border-border overflow-hidden card-hover ${featured ? "lg:col-span-2" : ""}`}>
      {/* Image */}
      <Link href={href} className={`block relative overflow-hidden ${featured ? "aspect-[16/7]" : "aspect-video"} bg-gradient-to-br ${gradient}`}>
        {article.featuredImage ? (
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes={featured ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-5xl font-black opacity-10">
              {categoryLabel(article.category).slice(0, 1)}
            </span>
          </div>
        )}
      </Link>

      <div className={`p-5 ${featured ? "lg:p-6" : ""}`}>
        {/* Meta */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${badge}`}>
            {categoryLabel(article.category)}
          </span>
          {article.readingTime && (
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {article.readingTime} min
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className={`font-bold leading-snug mb-2 group-hover:text-brand transition-colors ${featured ? "text-xl sm:text-2xl line-clamp-3" : "text-base line-clamp-2"}`}>
          <Link href={href}>{article.title}</Link>
        </h2>

        {/* Excerpt */}
        <p className={`text-sm text-muted-foreground leading-relaxed mb-4 ${featured ? "line-clamp-3" : "line-clamp-2"}`}>
          {article.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {article.publishedAt && (
            <time className="text-xs text-muted-foreground">
              {formatDate(article.publishedAt)}
            </time>
          )}
          <Link
            href={href}
            className="text-xs font-semibold text-brand hover:underline flex items-center gap-1 ml-auto"
          >
            Read more
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
