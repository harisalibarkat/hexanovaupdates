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

const CAT_BAR: Record<string, string> = {
  tech: "bg-blue-600",
  celebs: "bg-pink-600",
  viral: "bg-orange-500",
  finance: "bg-emerald-600",
  health: "bg-green-600",
  travel: "bg-cyan-600",
};

const CAT_BADGE: Record<string, string> = {
  tech: "bg-blue-100 text-blue-700",
  celebs: "bg-pink-100 text-pink-700",
  viral: "bg-orange-100 text-orange-700",
  finance: "bg-emerald-100 text-emerald-700",
  health: "bg-green-100 text-green-700",
  travel: "bg-cyan-100 text-cyan-700",
};

const CAT_ACCENT: Record<string, string> = {
  tech: "border-blue-500",
  celebs: "border-pink-500",
  viral: "border-orange-400",
  finance: "border-emerald-500",
  health: "border-green-500",
  travel: "border-cyan-500",
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
            We&apos;re cooking up fresh content. Check back soon for the latest trending news and updates.
          </p>
        </div>
      </div>
    );
  }

  const heroPost = allPosts[0];
  const heroSidePosts = allPosts.slice(1, 4);
  const editorPicks = allPosts.slice(4, 7);
  const latestTen = allPosts.slice(0, 10);
  const popularThisWeek = [...allPosts]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 3);

  return (
    <>
      {/* ── A. Breaking News Ticker ──────────────────────────────────────── */}
      <div className="bg-black text-white overflow-hidden">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-red-600 px-4 py-2.5 text-xs font-black uppercase tracking-widest z-10">
            Breaking
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="flex animate-ticker whitespace-nowrap">
              {[...allPosts.slice(0, 8), ...allPosts.slice(0, 8)].map((p, i) => (
                <Link
                  key={`${p.id}-${i}`}
                  href={`/${p.category}/${p.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm hover:text-brand transition-colors shrink-0"
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${CAT_BADGE[p.category] ?? "bg-white/10 text-white"}`}>
                    {categoryLabel(p.category)}
                  </span>
                  <span className="font-medium">{p.title}</span>
                  <span className="text-white/30 mx-2">·</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">

        {/* ── B. Hero + Right Sidebar ──────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6" style={{ minHeight: "480px" }}>
          {/* Hero — 3/5 */}
          <article className="lg:col-span-3 relative rounded-2xl overflow-hidden group min-h-[400px] bg-muted">
            {heroPost.featuredImage ? (
              <Image
                src={heroPost.featuredImage}
                alt={heroPost.title}
                fill
                priority
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand/30 to-brand/10" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
              <span className={`inline-block text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full mb-3 ${CAT_BADGE[heroPost.category] ?? "bg-brand/20 text-white"}`}>
                {categoryLabel(heroPost.category)}
              </span>
              <Link href={`/${heroPost.category}/${heroPost.slug}`}>
                <h2 className="text-white text-2xl sm:text-3xl font-extrabold leading-tight mb-3 hover:text-brand/90 transition-colors line-clamp-3">
                  {heroPost.title}
                </h2>
              </Link>
              <p className="text-white/75 text-sm leading-relaxed mb-5 line-clamp-2">{heroPost.excerpt}</p>
              <div className="flex items-center gap-4">
                {heroPost.publishedAt && (
                  <time className="text-white/50 text-xs">{formatDate(heroPost.publishedAt)}</time>
                )}
                <Link
                  href={`/${heroPost.category}/${heroPost.slug}`}
                  className="inline-flex items-center gap-2 bg-brand text-white text-xs font-bold uppercase tracking-wide px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity ml-auto"
                >
                  Read More
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
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
                <article key={p.id} className="flex gap-3 items-start group bg-card border border-border rounded-xl p-3 hover:border-brand/30 transition-colors">
                  <Link href={href} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted">
                    {p.featuredImage ? (
                      <Image src={p.featuredImage} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="64px" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand/10 flex items-center justify-center">
                        <span className="text-lg font-black text-brand/30">{categoryLabel(p.category).slice(0, 1)}</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${CAT_BADGE[p.category] ?? "bg-muted text-muted-foreground"}`}>
                      {categoryLabel(p.category)}
                    </span>
                    <Link href={href}>
                      <h3 className="text-sm font-bold leading-snug line-clamp-2 mt-1 group-hover:text-brand transition-colors">{p.title}</h3>
                    </Link>
                    {p.publishedAt && (
                      <time className="text-xs text-muted-foreground mt-1 block">{formatDate(p.publishedAt)}</time>
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
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">★</span>
              <h2 className="text-2xl font-extrabold">Editor&apos;s Picks</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {editorPicks.map((p, i) => {
                const href = `/${p.category}/${p.slug}`;
                return (
                  <article key={p.id} className="group bg-card border border-border rounded-2xl overflow-hidden card-hover relative">
                    <Link href={href} className="block relative aspect-video overflow-hidden bg-muted">
                      {p.featuredImage ? (
                        <Image src={p.featuredImage} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 33vw" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand/10 flex items-center justify-center">
                          <span className="text-5xl font-black text-brand/10">{categoryLabel(p.category).slice(0, 1)}</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 w-8 h-8 bg-brand text-white text-sm font-black rounded-full flex items-center justify-center shadow-lg">
                        {i + 1}
                      </div>
                    </Link>
                    <div className="p-4">
                      <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${CAT_BADGE[p.category] ?? "bg-muted text-foreground"}`}>
                        {categoryLabel(p.category)}
                      </span>
                      <Link href={href}>
                        <h3 className="font-bold text-base leading-snug mt-2 mb-2 line-clamp-2 group-hover:text-brand transition-colors">{p.title}</h3>
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
          const catPosts = allPosts.filter((p) => p.category === cat).slice(0, 3);
          if (catPosts.length === 0) return null;
          const barColor = CAT_BAR[cat] ?? "bg-brand";
          const accentBorder = CAT_ACCENT[cat] ?? "border-brand";
          const bigPost = catPosts[0];
          const miniPosts = catPosts.slice(1, 3);

          return (
            <section key={cat}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className={`w-1 h-7 rounded-full inline-block ${barColor}`} />
                  <h2 className="text-xl font-extrabold">{categoryLabel(cat)}</h2>
                </div>
                <Link
                  href={`/${cat}`}
                  className="text-sm text-brand hover:underline font-semibold flex items-center gap-1"
                >
                  View All →
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Article 1: big card */}
                {bigPost && (
                  <article className={`lg:col-span-2 group bg-card border-l-4 ${accentBorder} border border-border rounded-xl overflow-hidden card-hover`}>
                    <Link href={`/${bigPost.category}/${bigPost.slug}`} className="block relative aspect-video overflow-hidden bg-muted">
                      {bigPost.featuredImage ? (
                        <Image src={bigPost.featuredImage} alt={bigPost.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 66vw" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand/10 flex items-center justify-center">
                          <span className="text-5xl font-black text-brand/10">{categoryLabel(bigPost.category).slice(0, 1)}</span>
                        </div>
                      )}
                    </Link>
                    <div className="p-4">
                      <Link href={`/${bigPost.category}/${bigPost.slug}`}>
                        <h3 className="font-bold text-lg leading-snug mb-2 line-clamp-2 group-hover:text-brand transition-colors">{bigPost.title}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{bigPost.excerpt}</p>
                      {bigPost.publishedAt && (
                        <time className="text-xs text-muted-foreground">{formatDate(bigPost.publishedAt)}</time>
                      )}
                    </div>
                  </article>
                )}

                {/* Articles 2–3: mini stacked cards */}
                <div className="flex flex-col gap-4">
                  {miniPosts.map((p) => {
                    const href = `/${p.category}/${p.slug}`;
                    return (
                      <article key={p.id} className="flex gap-3 items-start group bg-card border border-border rounded-xl p-3 card-hover">
                        <Link href={href} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                          {p.featuredImage ? (
                            <Image src={p.featuredImage} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="80px" />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand/10 flex items-center justify-center">
                              <span className="text-lg font-black text-brand/30">{categoryLabel(p.category).slice(0, 1)}</span>
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
        <section className="py-10 border-t border-border">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold mb-2">Find Articles by Topic</h2>
            <p className="text-muted-foreground text-sm">Browse our content alphabetically</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {ALPHABET.map((letter) => (
              <Link
                key={letter}
                href={`/?letter=${letter}`}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-brand hover:text-white hover:border-brand transition-all duration-200 text-sm font-bold text-muted-foreground"
              >
                {letter}
              </Link>
            ))}
          </div>
        </section>

        {/* ── G. Latest News stream ─────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-t border-border pt-10">
          {/* Left: numbered list */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-extrabold mb-6">Latest News</h2>
            <ol className="space-y-4">
              {latestTen.map((p, i) => {
                const href = `/${p.category}/${p.slug}`;
                return (
                  <li key={p.id} className="flex items-start gap-4 group">
                    <span className="flex-shrink-0 w-8 text-right font-black text-2xl text-muted-foreground/30 leading-tight tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0 border-b border-border pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${CAT_BADGE[p.category] ?? "bg-muted text-foreground"}`}>
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

          {/* Right: Popular This Week */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-extrabold mb-6">Popular This Week</h2>
            <div className="space-y-4">
              {popularThisWeek.map((p, i) => {
                const href = `/${p.category}/${p.slug}`;
                return (
                  <article key={p.id} className="flex items-start gap-3 group">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand text-white text-xs font-black flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Link href={href}>
                        <h3 className="text-sm font-bold line-clamp-2 group-hover:text-brand transition-colors">{p.title}</h3>
                      </Link>
                      {p.viewCount > 0 && (
                        <span className="text-xs text-muted-foreground mt-0.5 block">{p.viewCount.toLocaleString()} views</span>
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
