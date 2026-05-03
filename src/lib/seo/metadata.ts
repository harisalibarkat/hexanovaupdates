import type { Metadata } from "next";
import { categoryLabel } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://hexanovaupdates.com";
const APP_NAME = "HexaNovaUpdates";

export function buildPostMetadata(post: {
  title: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[] | null;
  slug: string;
  category: string;
  publishedAt?: Date | null;
  featuredImage?: string | null;
}): Metadata {
  const title = post.metaTitle ?? post.title;
  const description = post.metaDescription ?? post.title;
  const url = `${BASE_URL}/${post.category}/${post.slug}`;

  return {
    title,
    description,
    keywords: post.keywords ?? [],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: APP_NAME,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.featuredImage
        ? [{ url: post.featuredImage, width: 1200, height: 630, alt: title }]
        : [{ url: `${BASE_URL}/og-default.jpg`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.featuredImage ? [post.featuredImage] : [`${BASE_URL}/og-default.jpg`],
    },
  };
}

export function buildCategoryMetadata(category: string): Metadata {
  const label = categoryLabel(category);
  const title = `${label} News & Updates | ${APP_NAME}`;
  const description = `Latest ${label} news, trending stories, and in-depth coverage on HexaNovaUpdates.`;
  const url = `${BASE_URL}/${category}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: APP_NAME,
      type: "website",
    },
  };
}

export function buildHomeMetadata(): Metadata {
  return {
    title: `${APP_NAME} — Trending News Across Tech, Celebs, Finance & More`,
    description:
      "HexaNovaUpdates delivers AI-powered trending news across technology, celebrities, viral stories, finance, health, and travel.",
    alternates: { canonical: BASE_URL },
    openGraph: {
      title: APP_NAME,
      description: "AI-powered trending news and updates.",
      url: BASE_URL,
      siteName: APP_NAME,
      type: "website",
    },
  };
}
