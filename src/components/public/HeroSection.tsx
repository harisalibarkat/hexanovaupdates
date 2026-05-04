import Link from "next/link";
import Image from "next/image";
import { formatDate, categoryLabel } from "@/lib/utils";
import type { Post } from "@/lib/db/schema";

const CAT_GRADIENT: Record<string, string> = {
  tech:    "from-blue-600/80 to-purple-600/80",
  celebs:  "from-pink-600/80 to-rose-600/80",
  viral:   "from-orange-500/80 to-amber-600/80",
  finance: "from-emerald-600/80 to-teal-600/80",
  health:  "from-green-600/80 to-lime-600/80",
  travel:  "from-cyan-600/80 to-sky-600/80",
};

interface Props {
  featuredPost: Post;
  sidePosts: Post[];
}

export function HeroSection({ featuredPost, sidePosts }: Props) {
  const gradient = CAT_GRADIENT[featuredPost.category] ?? "from-brand/80 to-brand/60";

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
      {/* Main featured */}
      <Link
        href={`/${featuredPost.category}/${featuredPost.slug}`}
        className="lg:col-span-2 relative rounded-2xl overflow-hidden group min-h-[320px] sm:min-h-[400px] flex flex-col justify-end block"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-muted">
          {featuredPost.featuredImage && (
            <Image
              src={featuredPost.featuredImage}
              alt={featuredPost.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          )}
        </div>
        <div className={`absolute inset-0 bg-gradient-to-t ${gradient} via-black/40 from-black/80`} />
        <div className="relative p-6 sm:p-8">
          <span className="inline-block bg-brand text-brand-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
            {categoryLabel(featuredPost.category)}
          </span>
          <h2 className="text-white text-2xl sm:text-3xl font-extrabold leading-tight mb-2 line-clamp-3 group-hover:underline underline-offset-2 decoration-white/40">
            {featuredPost.title}
          </h2>
          <p className="text-white/80 text-sm line-clamp-2 hidden sm:block">{featuredPost.excerpt}</p>
          {featuredPost.publishedAt && (
            <time className="block text-white/60 text-xs mt-2">{formatDate(featuredPost.publishedAt)}</time>
          )}
        </div>
      </Link>

      {/* Side posts */}
      <div className="flex flex-col gap-4">
        {sidePosts.slice(0, 3).map((post) => (
          <Link
            key={post.id}
            href={`/${post.category}/${post.slug}`}
            className="relative rounded-2xl overflow-hidden group flex-1 min-h-[100px] flex flex-col justify-end"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50">
              {post.featuredImage && (
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="33vw"
                />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="relative p-4">
              <span className="text-white/70 text-xs font-semibold uppercase tracking-wide">
                {categoryLabel(post.category)}
              </span>
              <h3 className="text-white text-sm font-bold leading-snug line-clamp-2 group-hover:underline underline-offset-1 decoration-white/40">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
