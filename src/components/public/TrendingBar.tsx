import Link from "next/link";
import type { Post } from "@/lib/db/schema";

interface Props {
  posts: Pick<Post, "id" | "title" | "slug" | "category">[];
}

export function TrendingBar({ posts }: Props) {
  if (!posts.length) return null;

  const doubled = [...posts, ...posts];

  return (
    <div className="rounded-xl overflow-hidden flex items-stretch mb-8 bg-zinc-950 dark:bg-zinc-900 border border-zinc-800/80 shadow-sm">
      {/* Label */}
      <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0 bg-gradient-to-r from-brand to-purple-600 border-r border-white/10">
        <span className="inline-block w-2 h-2 rounded-full bg-white live-dot" />
        <span className="font-black text-[10px] uppercase tracking-[0.15em] text-white whitespace-nowrap">
          Trending
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="overflow-hidden flex-1 flex items-center fade-edges">
        <div className="flex animate-ticker whitespace-nowrap">
          {doubled.map((post, i) => (
            <Link
              key={`${post.id}-${i}`}
              href={`/${post.category}/${post.slug}`}
              className="inline-flex items-center gap-3 px-5 py-3 text-sm font-medium text-zinc-300 hover:text-white transition-colors flex-shrink-0"
            >
              <span className="text-brand/70 text-xs leading-none">●</span>
              {post.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
