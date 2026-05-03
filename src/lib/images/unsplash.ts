// Image sources in priority order:
// 1. Unsplash API (requires UNSPLASH_ACCESS_KEY)
// 2. Pexels API  (requires PEXELS_API_KEY)
// 3. Openverse   (CC-licensed, no key needed)
// 4. Lorem Picsum (absolute fallback — always works)

export async function fetchUnsplashImage(query: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const url = new URL("https://api.unsplash.com/photos/random");
    url.searchParams.set("query", query);
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("content_filter", "high");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Client-ID ${accessKey}` },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;
    const data = await res.json() as { urls?: { regular?: string } };
    return data.urls?.regular ?? null;
  } catch {
    return null;
  }
}

export async function fetchPexelsImage(query: string): Promise<string | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  try {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("per_page", "1");

    const res = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) return null;
    const data = await res.json() as { photos?: Array<{ src?: { large?: string } }> };
    return data.photos?.[0]?.src?.large ?? null;
  } catch {
    return null;
  }
}

// Openverse — Creative Commons search, no API key required
export async function fetchOpenverseImage(query: string): Promise<string | null> {
  try {
    const url = new URL("https://api.openverse.org/v1/images/");
    url.searchParams.set("q", query);
    url.searchParams.set("page_size", "5");
    url.searchParams.set("license_type", "commercial");
    url.searchParams.set("category", "photograph");
    url.searchParams.set("aspect_ratio", "wide");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "HexaNovaUpdates/1.0 (contact@hexanovaupdates.com)" },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return null;
    const data = await res.json() as { results?: Array<{ url?: string; width?: number; height?: number }> };
    // Prefer wider images
    const results = data.results ?? [];
    const sorted = results
      .filter((r) => r.url && (r.width ?? 0) >= 800)
      .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
    return sorted[0]?.url ?? results[0]?.url ?? null;
  } catch {
    return null;
  }
}

// Lorem Picsum — always returns a beautiful landscape photo (seed-based for consistency)
export function getPicsumFallback(seed: string): string {
  // Create a stable numeric seed from the string
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const id = Math.abs(hash) % 1000;
  return `https://picsum.photos/seed/${id}/1280/720`;
}

// Main entry point — tries every source, always returns something
export async function fetchArticleImage(topic: string): Promise<string> {
  const cleanQuery = topic.replace(/[^\w\s]/g, " ").trim().slice(0, 100);

  const image =
    (await fetchUnsplashImage(cleanQuery)) ??
    (await fetchPexelsImage(cleanQuery)) ??
    (await fetchOpenverseImage(cleanQuery)) ??
    getPicsumFallback(cleanQuery);

  return image;
}
