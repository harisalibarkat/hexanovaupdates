import Link from "next/link";
import Image from "next/image";
import { formatDate, categoryLabel } from "@/lib/utils";
import type { Post } from "@/lib/db/schema";

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
  const phGrad = CAT_PLACEHOLDER[article.category] ?? "from-brand/20 to-brand/40";
  const href   = `/${article.category}/${article.slug}`;

  return (
    <article className={`group bg-card border border-border overflow-hidden card-hover ${featured ? "lg:col-span-2" : ""}`}>
      {/* Image */}
      <Link
        href={href}
        className={`block relative overflow-hidden ${featured ? "aspect-[16/7]" : "aspect-video"} bg-muted`}
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
            <span className="text-7xl font-black opacity-10 text-white select-none">
              {categoryLabel(article.category).slice(0, 1)}
            </span>
          </div>
        )}

        {/* Date badge on image top edge */}
        {article.publishedAt && (
          <span className="absolute top-0 left-4 date-badge">
            {formatDate(article.publishedAt)}
          </span>
        )}

        {/* Reading time pill */}
        {article.readingTime && (
          <span className="absolute bottom-3 right-3 text-[10px] font-semibold px-2 py-1 bg-black/50 text-white/90 backdrop-blur-sm flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {article.readingTime} min
          </span>
        )}
      </Link>

      {/* Content */}
      <div className={`p-5 ${featured ? "lg:p-6" : ""}`}>
        {/* Category label */}
        <div className="mb-3">
          <Link href={`/${article.category}`} className="cat-label text-brand hover:opacity-70 transition-opacity">
            {categoryLabel(article.category)}
          </Link>
        </div>

        {/* Title — Playfair Display via h2 base styles */}
        <h2
          className={`font-bold leading-tight mb-4 group-hover:text-brand transition-colors duration-200 ${
            featured ? "text-xl sm:text-2xl line-clamp-3" : "text-base sm:text-lg line-clamp-2"
          }`}
        >
          <Link href={href}>{article.title}</Link>
        </h2>

        {/* Excerpt (featured only) */}
        {featured && article.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-2">
            {article.excerpt}
          </p>
        )}

        {/* Divider */}
        <div className="border-t border-border/50 pt-4">
          <Link href={href} className="btn-read-more">
            Read More
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
