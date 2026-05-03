import Link from "next/link";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { CATEGORIES, categoryLabel } from "@/lib/utils";

async function getRecentByCategory(category: string) {
  return db.query.posts.findMany({
    where: and(eq(posts.category, category as "tech"), eq(posts.status, "published")),
    orderBy: [desc(posts.publishedAt)],
    limit: 3,
  });
}

const CAT_DOT: Record<string, string> = {
  tech:    "bg-blue-500",
  celebs:  "bg-pink-500",
  viral:   "bg-orange-500",
  finance: "bg-emerald-500",
  health:  "bg-green-500",
  travel:  "bg-cyan-500",
};

export async function Footer() {
  const year = new Date().getFullYear();
  const [techPosts, celebsPosts] = await Promise.all([
    getRecentByCategory("tech"),
    getRecentByCategory("celebs"),
  ]);

  return (
    <footer className="bg-zinc-950 text-zinc-400 mt-16 border-t border-zinc-800/80">
      {/* Top gradient accent line — mirrors the header */}
      <div className="h-[3px] w-full bg-gradient-to-r from-brand via-purple-500/70 to-pink-500/50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="footer-hex-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <path d="M20 2L36 11V29L20 38L4 29V11L20 2Z" fill="url(#footer-hex-grad)" />
                <path d="M23 8L13 22H20.5L17 32L28 18H20.5L23 8Z" fill="white" fillOpacity="0.95" />
              </svg>
              <span className="font-extrabold text-xl tracking-tight text-white">
                <span className="text-brand">Hexa</span>
                <span>Nova</span>
                <span className="text-zinc-600 font-normal">Updates</span>
              </span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              AI-powered trending news across tech, celebrities, viral stories, finance, health, and travel.
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat}
                  href={`/${cat}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all duration-200"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${CAT_DOT[cat] ?? "bg-brand"}`} />
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Link>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-white font-bold text-xs mb-5 uppercase tracking-[0.12em]">Explore</h4>
            <ul className="space-y-3">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/${cat}`}
                    className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2.5 group"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${CAT_DOT[cat] ?? "bg-brand"} opacity-60 group-hover:opacity-100 transition-opacity`}
                    />
                    {categoryLabel(cat)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recent Tech */}
          <div>
            <h4 className="text-white font-bold text-xs mb-5 uppercase tracking-[0.12em]">Recent in Tech</h4>
            <ul className="space-y-3.5">
              {techPosts.length > 0
                ? techPosts.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/tech/${p.slug}`}
                        className="text-sm text-zinc-400 hover:text-white transition-colors line-clamp-2 leading-snug block"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))
                : <li className="text-sm text-zinc-700">No posts yet</li>}
            </ul>
          </div>

          {/* Recent Celebs + Legal */}
          <div>
            <h4 className="text-white font-bold text-xs mb-5 uppercase tracking-[0.12em]">Recent in Celebs</h4>
            <ul className="space-y-3.5 mb-8">
              {celebsPosts.length > 0
                ? celebsPosts.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/celebs/${p.slug}`}
                        className="text-sm text-zinc-400 hover:text-white transition-colors line-clamp-2 leading-snug block"
                      >
                        {p.title}
                      </Link>
                    </li>
                  ))
                : <li className="text-sm text-zinc-700">No posts yet</li>}
            </ul>
            <h4 className="text-white font-bold text-xs mb-3 uppercase tracking-[0.12em]">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <span>© {year} HexaNovaUpdates. All rights reserved.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand/50 inline-block" />
            Content generated with AI assistance
          </span>
        </div>
      </div>
    </footer>
  );
}
