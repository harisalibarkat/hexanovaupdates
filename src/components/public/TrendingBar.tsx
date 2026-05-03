import Link from "next/link";
import type { Post } from "@/lib/db/schema";

interface Props {
  posts: Pick<Post, "id" | "title" | "slug" | "category">[];
}

export function TrendingBar({ posts }: Props) {
  if (!posts.length) return null;

  const doubled = [...posts, ...posts];

  return (
    <div className="bg-brand text-white rounded-xl overflow-hidden flex items-stretch mb-8">
      <div className="bg-black/20 px-4 py-2.5 flex items-center gap-2 flex-shrink-0 font-bold text-xs uppercase tracking-widest whitespace-nowrap">
        <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
        Trending
      </div>
      <div className="overflow-hidden flex-1 flex items-center">
        <div className="flex gap-0 animate-ticker whitespace-nowrap">
          {doubled.map((post, i) => (
            <Link
              key={`${post.id}-${i}`}
              href={`/${post.category}/${post.slug}`}
              className="inline-flex items-center gap-3 px-6 py-2.5 text-sm font-medium hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <span className="opacity-50 text-xs">•</span>
              {post.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
