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

// generateMetadata must be async to read searchParams (required for noindex on ?letter= pages)
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ letter?: string }>;
}): Promise<Metadata> {
  const { letter } = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://hexanovaupdates.com";
  return {
    title: "HexaNovaUpdates — Trending News & Updates",
    description:
      "AI-powered trending news across tech, celebrities, viral stories, finance, health, and travel.",
    // Always canonical to / — prevents /?letter=X from being treated as a separate page
    alternates: { canonical: baseUrl },
    // Noindex letter-filter pages — they are UI filters, not unique indexable content
    ...(letter ? { robots: { index: false, follow: true } } : {}),
  };
}

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
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ letter?: string }>;
}) {
  const { letter } = await searchParams;
  const activeLetter = letter?.toUpperCase().slice(0, 1) ?? "";

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

  const letterPosts = activeLetter
    ? allPosts.filter((p) => p.title.toUpperCase().startsWith(activeLetter))
    : [];

  if (allPosts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 bg-muted flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"/>
              <path d="M16 2v4"/><path d="M8 2v4"/><path d="M4 10h16"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Coming Soon</h1>
          <p className="text-muted-foreground text-lg">
            We&apos;re cooking up fresh content. Check back soon for the latest trending news.
          </p>
        </div>
      </div>
    );
  }

  const heroPost        = allPosts[0];
  const heroSidePosts   = allPosts.slice(1, 4);
  const editorPicks     = allPosts.slice(4, 7);
  const latestTen       = allPosts.slice(0, 10);
  const popularThisWeek = [...allPosts]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 5);

  return (
    <>
      {/* ── A. LIVE Breaking News Ticker ─────────────────────────────────── */}
      <div className="bg-zinc-950 text-white overflow-hidden border-b border-zinc-800/80">
        <div className="flex items-stretch">
          <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-red-600 border-r border-white/10">
            <span className="w-2 h-2 rounded-full bg-white live-dot" />
            <span className="text-[10px] font-black uppercase tracking-[0.18em] whitespace-nowrap">Live</span>
          </div>
          <div className="flex-1 overflow-hidden flex items-center fade-edges">
            <div className="flex animate-ticker whitespace-nowrap">
              {[...allPosts.slice(0, 8), ...allPosts.slice(0, 8)].map((p, i) => (
                <Link
                  key={`${p.id}-${i}`}
                  href={`/${p.category}/${p.slug}`}
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 text-sm hover:bg-white/5 transition-colors flex-shrink-0"
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm ${CAT_TICKER[p.category] ?? "bg-white/10 text-white/70"}`}>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">

        {/* ── B. Hero + Sidebar Stack ────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6" style={{ minHeight: 520 }}>
          {/* Hero — 3/5 */}
          <article className="lg:col-span-3 relative overflow-hidden group min-h-[460px] bg-zinc-900 shadow-lg">
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
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-950" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-9">
              <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1.5 mb-4 shadow-sm ${CAT_BADGE[heroPost.category] ?? "bg-brand/90 text-white"}`}>
                {categoryLabel(heroPost.category)}
              </span>
              <Link href={`/${heroPost.category}/${heroPost.slug}`}>
                <h2 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4 hover:text-white/90 transition-colors line-clamp-3">
                  {heroPost.title}
                </h2>
              </Link>
              <p className="text-white/70 text-sm leading-relaxed mb-6 line-clamp-2 max-w-lg">
                {heroPost.excerpt}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                {heroPost.publishedAt && (
                  <time className="text-white/50 text-xs">{formatDate(heroPost.publishedAt)}</time>
                )}
                {heroPost.readingTime && (
                  <span className="text-white/50 text-xs flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {heroPost.readingTime} min
                  </span>
                )}
                <Link
                  href={`/${heroPost.category}/${heroPost.slug}`}
                  className="ml-auto btn-read-more bg-white text-zinc-900 border-white hover:bg-white/90 hover:text-zinc-900"
                >
                  Read Now
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                  className="flex gap-3 items-start group bg-card border border-border p-3.5 hover:border-brand/30 hover:shadow-md transition-all duration-200 card-hover"
                >
                  <Link href={href} className="relative flex-shrink-0 w-20 h-20 overflow-hidden bg-muted">
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
                        <span className="text-xl font-bold text-brand/30">{categoryLabel(p.category).slice(0, 1)}</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <span className="cat-label text-brand text-[9px]">{categoryLabel(p.category)}</span>
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

        {/* ── C. Editor's Picks ─────────────────────────────────────────── */}
        {editorPicks.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-8 pb-4 border-b border-border">
              <div>
                <h2 className="section-title text-2xl sm:text-3xl">Editor&apos;s Picks</h2>
                <span className="section-bar" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest hidden sm:block">Hand-curated stories</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {editorPicks.map((p, i) => {
                const href = `/${p.category}/${p.slug}`;
                return (
                  <article key={p.id} className="group bg-card border border-border overflow-hidden card-hover relative">
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
                        <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                          <span className="text-5xl font-bold text-zinc-200 dark:text-white/5">{categoryLabel(p.category).slice(0, 1)}</span>
                        </div>
                      )}
                      {/* Pick number */}
                      <div className="absolute top-3 left-3 w-8 h-8 bg-white text-zinc-900 flex items-center justify-center text-sm font-black shadow-md">
                        {i + 1}
                      </div>
                      <span className={`absolute top-3 right-3 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 ${CAT_BADGE[p.category] ?? "bg-brand/90 text-white"}`}>
                        {categoryLabel(p.category)}
                      </span>
                    </Link>
                    <div className="p-4">
                      <Link href={href}>
                        <h3 className="font-bold text-base leading-snug mt-1 mb-2 line-clamp-2 group-hover:text-brand transition-colors">{p.title}</h3>
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

        {/* ── D. Newsletter Banner ──────────────────────────────────────── */}
        <NewsletterBanner />

        {/* ── E. Category Digest ────────────────────────────────────────── */}
        {CATEGORIES.map((cat) => {
          const catPosts = allPosts.filter((p) => p.category === cat).slice(0, 3);
          if (catPosts.length === 0) return null;
          const bigPost   = catPosts[0];
          const miniPosts = catPosts.slice(1, 3);

          return (
            <section key={cat}>
              <div className="flex items-end justify-between mb-7 pb-4 border-b border-border">
                <div>
                  <h2 className="section-title text-2xl sm:text-3xl">{categoryLabel(cat)}</h2>
                  <span className="section-bar" />
                </div>
                <Link
                  href={`/${cat}`}
                  className="btn-read-more text-[10px] py-2 px-4 flex-shrink-0"
                >
                  View All →
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Large card */}
                {bigPost && (
                  <article className="lg:col-span-2 group bg-card border border-border overflow-hidden card-hover">
                    <Link href={`/${bigPost.category}/${bigPost.slug}`} className="block relative aspect-video overflow-hidden bg-muted">
                      {bigPost.featuredImage ? (
                        <Image src={bigPost.featuredImage} alt={bigPost.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 66vw" />
                      ) : (
                        <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                          <span className="text-5xl font-bold text-zinc-200 dark:text-white/5">{categoryLabel(bigPost.category).slice(0, 1)}</span>
                        </div>
                      )}
                      <span className={`absolute top-0 left-4 date-badge`}>
                        {bigPost.publishedAt ? formatDate(bigPost.publishedAt) : ""}
                      </span>
                    </Link>
                    <div className="p-5">
                      <span className="cat-label text-brand text-[10px] mb-2 block">{categoryLabel(bigPost.category)}</span>
                      <Link href={`/${bigPost.category}/${bigPost.slug}`}>
                        <h3 className="font-bold text-lg leading-snug mb-2 line-clamp-2 group-hover:text-brand transition-colors">{bigPost.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{bigPost.excerpt}</p>
                      <Link href={`/${bigPost.category}/${bigPost.slug}`} className="btn-read-more">
                        Read More
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </Link>
                    </div>
                  </article>
                )}

                {/* Mini stacked cards */}
                <div className="flex flex-col gap-4">
                  {miniPosts.map((p) => {
                    const href = `/${p.category}/${p.slug}`;
                    return (
                      <article key={p.id} className="flex gap-3 items-start group bg-card border border-border p-3 card-hover">
                        <Link href={href} className="relative flex-shrink-0 w-20 h-20 overflow-hidden bg-muted">
                          {p.featuredImage ? (
                            <Image src={p.featuredImage} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="80px" />
                          ) : (
                            <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                              <span className="text-lg font-bold text-zinc-300 dark:text-white/20">{categoryLabel(p.category).slice(0, 1)}</span>
                            </div>
                          )}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <span className="cat-label text-brand text-[9px] mb-1 block">{categoryLabel(p.category)}</span>
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

        {/* ── F. A–Z Topic Finder ───────────────────────────────────────── */}
        <section className="py-10 border-t border-border">
          <div className="text-center mb-8">
            <p className="cat-label text-brand mb-2">Browse</p>
            <h2 className="section-title text-2xl sm:text-3xl mx-auto inline-block">Find Articles by Topic</h2>
            <span className="section-bar mx-auto" />
            <p className="text-muted-foreground text-sm mt-4">
              {activeLetter
                ? `Showing articles starting with "${activeLetter}"`
                : "Navigate our content library alphabetically"}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {ALPHABET.map((l) => (
              <Link
                key={l}
                href={activeLetter === l ? "/" : `/?letter=${l}`}
                className={`w-10 h-10 flex items-center justify-center border transition-all duration-200 text-sm font-bold ${
                  activeLetter === l
                    ? "bg-brand text-white border-brand"
                    : "border-border bg-card hover:bg-brand hover:text-white hover:border-brand text-muted-foreground"
                }`}
              >
                {l}
              </Link>
            ))}
          </div>

          {/* Letter results */}
          {activeLetter && (
            <div>
              {letterPosts.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm py-8">
                  No articles found starting with &ldquo;{activeLetter}&rdquo;.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {letterPosts.map((p) => {
                    const href = `/${p.category}/${p.slug}`;
                    return (
                      <article key={p.id} className="flex items-start gap-3 group border border-border bg-card p-4">
                        <div className="flex-1 min-w-0">
                          <span className="cat-label text-brand text-[9px] mb-1 block">{categoryLabel(p.category)}</span>
                          <Link href={href}>
                            <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-brand transition-colors">{p.title}</h3>
                          </Link>
                          {p.publishedAt && (
                            <time className="text-xs text-muted-foreground mt-1 block">{formatDate(p.publishedAt)}</time>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── G. Latest + Popular ───────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-t border-border pt-10">
          {/* Latest news numbered list */}
          <div className="lg:col-span-2">
            <div className="mb-7 pb-4 border-b border-border">
              <h2 className="section-title text-2xl">Latest News</h2>
              <span className="section-bar" />
            </div>
            <ol className="space-y-0 divide-y divide-border/50">
              {latestTen.map((p, i) => {
                const href = `/${p.category}/${p.slug}`;
                return (
                  <li key={p.id} className="flex items-start gap-5 group py-4 hover:bg-muted/30 px-2 transition-colors">
                    <span className="flex-shrink-0 w-9 text-right font-black text-2xl text-muted-foreground/20 leading-tight tabular-nums pt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="cat-label text-brand text-[9px]">{categoryLabel(p.category)}</span>
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
            <div className="mb-7 pb-4 border-b border-border">
              <h2 className="section-title text-xl">Popular This Week</h2>
              <span className="section-bar" />
            </div>
            <div className="space-y-5">
              {popularThisWeek.map((p, i) => {
                const href = `/${p.category}/${p.slug}`;
                return (
                  <article key={p.id} className="flex items-start gap-3 group">
                    <span className="flex-shrink-0 w-8 h-8 bg-brand text-white text-xs font-black flex items-center justify-center shadow-sm flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link href={href}>
                        <h3 className="text-sm font-bold line-clamp-2 group-hover:text-brand transition-colors leading-snug">{p.title}</h3>
                      </Link>
                      {p.viewCount > 0 && (
                        <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
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
