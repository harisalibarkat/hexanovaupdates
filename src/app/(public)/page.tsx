export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { CATEGORIES, categoryLabel, formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import type { Post } from "@/lib/db/schema";
import { NewsletterBanner } from "@/components/public/NewsletterBanner";
import { PageViewTracker } from "@/components/public/PageViewTracker";

export const metadata: Metadata = {
  title: "HexaNovaUpdates — Trending News & Updates",
  description:
    "AI-powered trending news across tech, celebrities, viral stories, finance, health, and travel.",
};

/* ── Category styling maps ───────────────────────────────────────────────── */
const CAT_BAR: Record<string, string> = {
  tech:    "bg-blue-500",
  celebs:  "bg-pink-500",
  viral:   "bg-orange-400",
  finance: "bg-emerald-500",
  health:  "bg-green-500",
  travel:  "bg-cyan-500",
};
const CAT_BADGE: Record<string, string> = {
  tech:    "bg-blue-600/90 text-white",
  celebs:  "bg-pink-600/90 text-white",
  viral:   "bg-orange-500/90 text-white",
  finance: "bg-emerald-600/90 text-white",
  health:  "bg-green-600/90 text-white",
  travel:  "bg-cyan-600/90 text-white",
};
const CAT_TICKER: Record<string, string> = {
  tech:    "bg-blue-500/20 text-blue-300",
  celebs:  "bg-pink-500/20 text-pink-300",
  viral:   "bg-orange-500/20 text-orange-300",
  finance: "bg-emerald-500/20 text-emerald-300",
  health:  "bg-green-500/20 text-green-300",
  travel:  "bg-cyan-500/20 text-cyan-300",
};
const CAT_GLOW: Record<string, string> = {
  tech:    "from-blue-500/25 to-transparent",
  celebs:  "from-pink-500/25 to-transparent",
  viral:   "from-orange-500/25 to-transparent",
  finance: "from-emerald-500/25 to-transparent",
  health:  "from-green-500/25 to-transparent",
  travel:  "from-cyan-500/25 to-transparent",
};
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default async function HomePage() {
  let allPosts: Post[] = [];
  try {
    allPosts = await db.query.posts.findMany({
      where: eq(posts.status, "published"),
      orderBy: [desc(posts.publishedAt)],
      limit: 50,
    });
  } catch {
    allPosts = [];
  }

  if (allPosts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z" />
              <path d="M16 2v4" /><path d="M8 2v4" /><path d="M4 10h16" />
            </svg>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Coming Soon</h1>
          <p className="text-muted-foreground text-lg">
            We&apos;re cooking up fresh content. Check back soon for the latest trending news.
          </p>
        </div>
      </div>
    );
  }

  const heroPost       = allPosts[0];
  const heroSidePosts  = allPosts.slice(1, 4);
  const editorPicks    = allPosts.slice(4, 7);
  const latestTen      = allPosts.slice(0, 10);
  const popularThisWeek = [...allPosts]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 5);

  return (
    <>
      {/* ── A. LIVE Breaking Ticker ───────────────────────────────────────── */}
      <div className="bg-zinc-950 text-white overflow-hidden border-b border-zinc-800/80">
        <div className="flex items-stretch">
          {/* LIVE badge */}
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 border-r border-white/10">
            <span className="w-2 h-2 rounded-full bg-white live-dot" />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] whitespace-nowrap">Live</span>
          </div>
          {/* Scrolling headlines */}
          <div className="flex-1 overflow-hidden flex items-center fade-edges">
            <div className="flex animate-ticker whitespace-nowrap">
              {[...allPosts.slice(0, 8), ...allPosts.slice(0, 8)].map((p, i) => (
                <Link
                  key={`${p.id}-${i}`}
                  href={`/${p.category}/${p.slug}`}
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 text-sm hover:bg-white/5 transition-colors flex-shrink-0"
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${CAT_TICKER[p.category] ?? "bg-white/10 text-white/70"}`}>
                    {categoryLabel(p.category)}
                  </span>
                  <span className="text-zinc-200 font-medium">{p.title}</span>
                  <span className="text-zinc-700 mx-1">·</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-20">

        {/* ── B. Hero + Sidebar Stack ──────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6" style={{ minHeight: 520 }}>
          {/* Hero — 3/5 */}
          <article className="lg:col-span-3 relative rounded-2xl overflow-hidden group min-h-[460px] bg-zinc-900 shadow-xl">
            {heroPost.featuredImage ? (
              <Image
                src={heroPost.featuredImage}
                alt={heroPost.title}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand/40 via-purple-900/40 to-zinc-950" />
            )}
            {/* Multi-layer gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-9">
              <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 shadow-sm ${CAT_BADGE[heroPost.category] ?? "bg-brand/90 text-white"}`}>
                {categoryLabel(heroPost.category)}
              </span>
              <Link href={`/${heroPost.category}/${heroPost.slug}`}>
                <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-4 hover:text-white/90 transition-colors line-clamp-3 tracking-tight">
                  {heroPost.title}
                </h2>
              </Link>
              <p className="text-white/70 text-sm leading-relaxed mb-6 line-clamp-2 max-w-lg">
                {heroPost.excerpt}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                {heroPost.publishedAt && (
                  <time className="text-white/40 text-xs">{formatDate(heroPost.publishedAt)}</time>
                )}
                {heroPost.readingTime && (
                  <span className="text-white/40 text-xs flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {heroPost.readingTime} min
                  </span>
                )}
                <Link
                  href={`/${heroPost.category}/${heroPost.slug}`}
                  className="ml-auto inline-flex items-center gap-2 bg-white text-zinc-900 text-xs font-black uppercase tracking-wide px-5 py-2.5 rounded-lg hover:bg-white/90 transition-all shadow-lg"
                >
                  Read Now
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>
          </article>

          {/* Right sidebar stack — 2/5 */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {heroSidePosts.map((p) => {
              const href = `/${p.category}/${p.slug}`;
              return (
                <article
                  key={p.id}
                  className="flex gap-3 items-start group bg-card border border-border/70 rounded-xl p-3.5 hover:border-brand/30 hover:shadow-md transition-all duration-200 card-hover"
                >
                  <Link href={href} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                    {p.featuredImage ? (
                      <Image
                        src={p.featuredImage}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="80px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand/10 flex items-center justify-center">
                        <span className="text-xl font-black text-brand/30">{categoryLabel(p.category).slice(0, 1)}</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${CAT_BADGE[p.category] ?? "bg-muted text-muted-foreground"}`}>
                      {categoryLabel(p.category)}
                    </span>
                    <Link href={href}>
                      <h3 className="text-sm font-bold leading-snug line-clamp-2 mt-1.5 group-hover:text-brand transition-colors">{p.title}</h3>
                    </Link>
                    {p.publishedAt && (
                      <time className="text-[11px] text-muted-foreground mt-1 block">{formatDate(p.publishedAt)}</time>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── C. Editor's Picks ─────────────────────────────────────────────── */}
        {editorPicks.length > 0 && (
          <section>
            {/* Section heading */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1.5 h-10 rounded-full bg-brand flex-shrink-0" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">Editor&apos;s Picks</h2>
                <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-widest">Hand-curated stories</p>
              </div>
              <div className="flex-1 line-fade-r hidden sm:block ml-4" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {editorPicks.map((p, i) => {
                const href = `/${p.category}/${p.slug}`;
                return (
                  <article key={p.id} className="group bg-card border border-border/70 rounded-2xl overflow-hidden card-hover shadow-sm relative">
                    <Link href={href} className="block relative aspect-video overflow-hidden bg-muted">
                      {p.featuredImage ? (
                        <Image
                          src={p.featuredImage}
                          alt={p.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${CAT_GLOW[p.category] ?? "from-brand/20 to-transparent"} flex items-center justify-center bg-zinc-900`}>
                          <span className="text-5xl font-black text-white/5">{categoryLabel(p.category).slice(0, 1)}</span>
                        </div>
                      )}
                      {/* Pick number badge */}
                      <div className="absolute top-3 left-3 pick-badge">{i + 1}</div>
                      <span className={`absolute top-3 right-3 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${CAT_BADGE[p.category] ?? "bg-brand/90 text-white"}`}>
                        {categoryLabel(p.category)}
                      </span>
                    </Link>
                    <div className="p-4">
                      <Link href={href}>
                        <h3 className="font-extrabold text-[15px] leading-snug mt-1 mb-2 line-clamp-2 group-hover:text-brand transition-colors">{p.title}</h3>
                      </Link>
                      {p.publishedAt && (
                        <time className="text-xs text-muted-foreground">{formatDate(p.publishedAt)}</time>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ── D. Newsletter Banner ──────────────────────────────────────────── */}
        <NewsletterBanner />

        {/* ── E. Category Digest ────────────────────────────────────────────── */}
        {CATEGORIES.map((cat) => {
          const catPosts    = allPosts.filter((p) => p.category === cat).slice(0, 3);
          if (catPosts.length === 0) return null;
          const barColor    = CAT_BAR[cat] ?? "bg-brand";
          const bigPost     = catPosts[0];
          const miniPosts   = catPosts.slice(1, 3);

          return (
            <section key={cat}>
              {/* Section heading */}
              <div className="flex items-center gap-4 mb-7">
                <div className={`w-1.5 h-10 rounded-full ${barColor} flex-shrink-0`} />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none">{categoryLabel(cat)}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 uppercase tracking-widest">Latest stories</p>
                </div>
                <div className="flex-1 line-fade-r hidden sm:block ml-4" />
                <Link
                  href={`/${cat}`}
                  className="text-sm font-bold text-brand hover:text-brand/80 transition-colors flex items-center gap-1 flex-shrink-0"
                >
                  View All
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Large card */}
                {bigPost && (
                  <article className="lg:col-span-2 group bg-card border border-border/70 rounded-xl overflow-hidden card-hover shadow-sm">
                    <Link href={`/${bigPost.category}/${bigPost.slug}`} className="block relative aspect-video overflow-hidden bg-muted">
                      {bigPost.featuredImage ? (
                        <Image src={bigPost.featuredImage} alt={bigPost.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 66vw" />
                      ) : (
                        <div className={`absolute inset-0 bg-zinc-900 flex items-center justify-center`}>
                          <span className="text-5xl font-black text-white/5">{categoryLabel(bigPost.category).slice(0, 1)}</span>
                        </div>
                      )}
                      <span className={`absolute top-3 left-3 text-[10px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full ${CAT_BADGE[bigPost.category] ?? "bg-brand/90 text-white"}`}>
                        {categoryLabel(bigPost.category)}
                      </span>
                    </Link>
                    <div className="p-5">
                      <Link href={`/${bigPost.category}/${bigPost.slug}`}>
                        <h3 className="font-extrabold text-lg leading-snug mb-2 line-clamp-2 group-hover:text-brand transition-colors">{bigPost.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{bigPost.excerpt}</p>
                      {bigPost.publishedAt && (
                        <time className="text-xs text-muted-foreground">{formatDate(bigPost.publishedAt)}</time>
                      )}
                    </div>
                  </article>
                )}

                {/* Mini stacked cards */}
                <div className="flex flex-col gap-4">
                  {miniPosts.map((p) => {
                    const href = `/${p.category}/${p.slug}`;
                    return (
                      <article key={p.id} className="flex gap-3 items-start group bg-card border border-border/70 rounded-xl p-3 card-hover shadow-sm">
                        <Link href={href} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                          {p.featuredImage ? (
                            <Image src={p.featuredImage} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="80px" />
                          ) : (
                            <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                              <span className="text-lg font-black text-white/20">{categoryLabel(p.category).slice(0, 1)}</span>
                            </div>
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link href={href}>
                            <h3 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-brand transition-colors">{p.title}</h3>
                          </Link>
                          {p.publishedAt && (
                            <time className="text-xs text-muted-foreground mt-1 block">{formatDate(p.publishedAt)}</time>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}

        {/* ── F. A–Z Topic Finder ───────────────────────────────────────────── */}
        <section className="py-12 border-t border-border/60">
          <div className="text-center mb-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-brand mb-2">Browse</p>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Find Articles by Topic</h2>
            <p className="text-muted-foreground text-sm">Navigate our content library alphabetically</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {ALPHABET.map((letter) => (
              <Link
                key={letter}
                href={`/?letter=${letter}`}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-border/70 bg-card hover:bg-brand hover:text-white hover:border-brand hover:shadow-md hover:shadow-brand/20 transition-all duration-200 text-sm font-extrabold text-muted-foreground"
              >
                {letter}
              </Link>
            ))}
          </div>
        </section>

        {/* ── G. Latest + Popular ───────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-t border-border/60 pt-10">
          {/* Latest news numbered list */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-7">
              <div className="w-1.5 h-10 rounded-full bg-foreground/20 flex-shrink-0" />
              <h2 className="text-2xl font-black tracking-tight">Latest News</h2>
            </div>
            <ol className="space-y-0 divide-y divide-border/50">
              {latestTen.map((p, i) => {
                const href = `/${p.category}/${p.slug}`;
                return (
                  <li key={p.id} className="flex items-start gap-5 group py-4 hover:bg-muted/30 px-2 rounded-lg transition-colors">
                    <span className="flex-shrink-0 w-9 text-right font-black text-2xl text-muted-foreground/20 leading-tight tabular-nums pt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[9px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${CAT_BADGE[p.category] ?? "bg-muted text-foreground"}`}>
                          {categoryLabel(p.category)}
                        </span>
                        {p.publishedAt && (
                          <time className="text-xs text-muted-foreground">{formatDate(p.publishedAt)}</time>
                        )}
                      </div>
                      <Link href={href}>
                        <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-brand transition-colors">{p.title}</h3>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Popular this week */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-4 mb-7">
              <div className="w-1.5 h-10 rounded-full bg-orange-400 flex-shrink-0" />
              <h2 className="text-xl font-black tracking-tight">Popular This Week</h2>
            </div>
            <div className="space-y-5">
              {popularThisWeek.map((p, i) => {
                const href = `/${p.category}/${p.slug}`;
                return (
                  <article key={p.id} className="flex items-start gap-3 group">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-white text-xs font-black flex items-center justify-center shadow-sm">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link href={href}>
                        <h3 className="text-sm font-bold line-clamp-2 group-hover:text-brand transition-colors leading-snug">{p.title}</h3>
                      </Link>
                      {p.viewCount > 0 && (
                        <span className="text-xs text-muted-foreground mt-1 block flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                          {p.viewCount.toLocaleString()} views
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
              {popularThisWeek.length === 0 && (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              )}
            </div>
          </div>
        </section>

      </div>

      <PageViewTracker />
    </>
  );
}
