import Link from "next/link";
import Image from "next/image";
import { formatDate, categoryLabel } from "@/lib/utils";
import type { Post } from "@/lib/db/schema";

const CAT_BORDER: Record<string, string> = {
  tech:    "border-l-blue-500",
  celebs:  "border-l-pink-500",
  viral:   "border-l-orange-400",
  finance: "border-l-emerald-500",
  health:  "border-l-green-500",
  travel:  "border-l-cyan-500",
};

const CAT_OVERLAY: Record<string, string> = {
  tech:    "from-blue-900/80 via-blue-900/40 to-transparent",
  celebs:  "from-pink-900/80 via-pink-900/40 to-transparent",
  viral:   "from-orange-900/80 via-orange-900/40 to-transparent",
  finance: "from-emerald-900/80 via-emerald-900/40 to-transparent",
  health:  "from-green-900/80 via-green-900/40 to-transparent",
  travel:  "from-cyan-900/80 via-cyan-900/40 to-transparent",
};

const CAT_PLACEHOLDER: Record<string, string> = {
  tech:    "from-blue-500/20 to-blue-900/40",
  celebs:  "from-pink-500/20 to-pink-900/40",
  viral:   "from-orange-500/20 to-orange-900/40",
  finance: "from-emerald-500/20 to-emerald-900/40",
  health:  "from-green-500/20 to-green-900/40",
  travel:  "from-cyan-500/20 to-cyan-900/40",
};

const CAT_BADGE_IMG: Record<string, string> = {
  tech:    "bg-blue-600/90 text-white",
  celebs:  "bg-pink-600/90 text-white",
  viral:   "bg-orange-500/90 text-white",
  finance: "bg-emerald-600/90 text-white",
  health:  "bg-green-600/90 text-white",
  travel:  "bg-cyan-600/90 text-white",
};

interface Props {
  article: Post;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: Props) {
  const border   = CAT_BORDER[article.category]      ?? "border-l-brand";
  const overlay  = CAT_OVERLAY[article.category]     ?? "from-brand/80 via-brand/40 to-transparent";
  const phGrad   = CAT_PLACEHOLDER[article.category] ?? "from-brand/20 to-brand/40";
  const imgBadge = CAT_BADGE_IMG[article.category]   ?? "bg-brand/90 text-white";
  const href     = `/${article.category}/${article.slug}`;

  return (
    <article
      className={`group bg-card rounded-2xl border border-border/70 border-l-4 ${border} overflow-hidden card-hover shadow-sm ${
        featured ? "lg:col-span-2" : ""
      }`}
    >
      {/* Image */}
      <Link
        href={href}
        className={`block relative overflow-hidden ${
          featured ? "aspect-[16/7]" : "aspect-video"
        } bg-muted`}
      >
        {article.featuredImage ? (
          <>
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
            {/* Gradient overlay fades in on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-t ${overlay} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />
          </>
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${phGrad} flex items-center justify-center`}
          >
            <span className="text-7xl font-black opacity-10 text-white select-none">
              {categoryLabel(article.category).slice(0, 1)}
            </span>
          </div>
        )}

        {/* Category pill on image */}
        <span
          className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${imgBadge} shadow-sm`}
        >
          {categoryLabel(article.category)}
        </span>

        {/* Reading time pill on image (top-right) */}
        {article.readingTime && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-black/50 text-white/90 backdrop-blur-sm flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {article.readingTime} min
          </span>
        )}
      </Link>

      {/* Content */}
      <div className={`p-5 flex flex-col ${featured ? "lg:p-6" : ""}`}>
        {/* Date */}
        {article.publishedAt && (
          <time className="text-xs text-muted-foreground mb-2 block">
            {formatDate(article.publishedAt)}
          </time>
        )}

        {/* Title */}
        <h2
          className={`font-extrabold leading-tight mb-3 group-hover:text-brand transition-colors duration-200 ${
            featured ? "text-xl sm:text-2xl line-clamp-3" : "text-[15px] line-clamp-2"
          }`}
        >
          <Link href={href}>{article.title}</Link>
        </h2>

        {/* Excerpt (featured only) */}
        {featured && article.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2 flex-1">
            {article.excerpt}
          </p>
        )}

        {/* Read more */}
        <div className="mt-auto pt-3 border-t border-border/50">
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:gap-3 transition-all duration-200 uppercase tracking-wide"
          >
            Read more
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}
