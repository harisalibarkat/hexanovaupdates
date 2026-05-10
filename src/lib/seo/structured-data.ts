interface StructuredDataInput {
  title: string;
  description: string;
  slug: string;
  category: string;
  publishedAt: Date;
  image?: string;
}

export function buildStructuredData(input: StructuredDataInput) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://hexanovaupdates.com";

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: input.title,
    description: input.description,
    url: `${baseUrl}/${input.category}/${input.slug}`,
    datePublished: input.publishedAt.toISOString(),
    dateModified: input.publishedAt.toISOString(),
    image: input.image ?? `${baseUrl}/og-default.jpg`,
    publisher: {
      "@type": "Organization",
      name: "HexaNovaUpdates",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/${input.category}/${input.slug}`,
    },
    articleSection: input.category,
  };
}

export function buildBreadcrumbSchema(
  category: string,
  articleTitle?: string,
  articleSlug?: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://hexanovaupdates.com";

  const items = [
    { name: "Home", url: baseUrl },
    { name: category.charAt(0).toUpperCase() + category.slice(1), url: `${baseUrl}/${category}` },
  ];

  if (articleTitle && articleSlug) {
    items.push({ name: articleTitle, url: `${baseUrl}/${category}/${articleSlug}` });
  } else if (articleTitle) {
    // No slug provided — omit the article item rather than emit an invalid "#" URL
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
