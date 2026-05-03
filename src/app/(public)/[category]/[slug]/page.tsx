export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { posts, internalLinks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { CATEGORIES, formatDate } from "@/lib/utils";
import { buildPostMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/structured-data";
import { ReadingProgress } from "@/components/public/ReadingProgress";
import { ShareButtons } from "@/components/public/ShareButtons";
import { Newsletter } from "@/components/public/Newsletter";
import { ArticleCard } from "@/components/public/ArticleCard";
import { ArticleSidebar } from "@/components/public/ArticleSidebar";
import { CommentSection } from "@/components/public/CommentSection";
import { PageViewTracker } from "@/components/public/PageViewTracker";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) notFound();

  const post = await db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), eq(posts.status, "published")),
  });

  if (!post) notFound();

  return buildPostMetadata({
    title: post.title,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    keywords: post.keywords,
    slug: post.slug,
    category: post.category,
    publishedAt: post.publishedAt,
    featuredImage: post.featuredImage,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { category, slug } = await params;

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) notFound();

  const post = await db.query.posts.findFirst({
    where: and(eq(posts.slug, slug), eq(posts.status, "published")),
  });

  if (!post) notFound();

  // Increment view count (fire and forget)
  db.update(posts)
    .set({ viewCount: (post.viewCount ?? 0) + 1 })
    .where(eq(posts.id, post.id))
    .catch(() => {});

  // Fetch related posts via internal links
  const linkedPosts = await db.query.internalLinks.findMany({
    where: eq(internalLinks.sourcePostId, post.id),
    with: { targetPost: true },
    limit: 3,
  });

  const breadcrumb = buildBreadcrumbSchema(category, post.title);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://hexanovaupdates.com";
  const fullUrl = `${appUrl}/${category}/${slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(post.structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <ReadingProgress />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* ── Left column: article content (2/3) ──────────────────────── */}
          <article className="lg:col-span-2 min-w-0">
            {/* Breadcrumbs */}
            <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2 flex-wrap">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link href={`/${category}`} className="hover:text-foreground capitalize transition-colors">{category}</Link>
              <span>/</span>
              <span className="text-foreground line-clamp-1">
                {post.title.length > 50 ? post.title.slice(0, 50) + "…" : post.title}
              </span>
            </nav>

            {/* Category badge */}
            <span className="inline-block bg-brand text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
              {category}
            </span>

            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-5">{post.title}</h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
              {post.publishedAt && (
                <time dateTime={post.publishedAt.toISOString()} className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  {formatDate(post.publishedAt)}
                </time>
              )}
              {post.readingTime && (
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {post.readingTime} min read
                </span>
              )}
              {post.viewCount > 0 && (
                <span className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {post.viewCount.toLocaleString()} views
                </span>
              )}
            </div>

            {/* Featured image */}
            {post.featuredImage && (
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 bg-muted">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 66vw, 800px"
                />
              </div>
            )}

            {/* AdSense in-article */}
            <div className="my-6 flex justify-center">
              <ins
                className="adsbygoogle"
                style={{ display: "block", textAlign: "center" }}
                data-ad-layout="in-article"
                data-ad-format="fluid"
                data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID}
                data-ad-slot="1234567890"
              />
            </div>

            {/* Article content */}
            <div
              className="prose-content text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Advertisement placeholder — after content, before keywords */}
            <div className="my-8 p-4 bg-muted/30 border border-dashed border-border rounded-xl text-center text-sm text-muted-foreground">
              Advertisement
            </div>

            {/* Keywords */}
            {post.keywords && post.keywords.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {post.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="bg-muted text-muted-foreground text-xs px-3 py-1.5 rounded-full font-medium"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}

            {/* Share buttons */}
            <div className="mt-8 pt-8 border-t border-border">
              <ShareButtons title={post.title} url={fullUrl} />
            </div>

            {/* Newsletter */}
            <Newsletter />

            {/* Comments */}
            <CommentSection postId={post.id} />

            {/* Related Articles */}
            {linkedPosts.length > 0 && (
              <aside className="mt-4">
                <h2 className="text-2xl font-bold mb-5">Related Articles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {linkedPosts.map((link) => (
                    <ArticleCard key={link.targetPostId} article={link.targetPost} />
                  ))}
                </div>
              </aside>
            )}

            <PageViewTracker postId={post.id} />
          </article>

          {/* ── Right column: sidebar (1/3) ──────────────────────────────── */}
          <div className="lg:col-span-1 w-full lg:sticky lg:top-6">
            <ArticleSidebar
              currentPostId={post.id}
              category={post.category}
              keywords={post.keywords}
            />
          </div>
        </div>
      </div>
    </>
  );
}
